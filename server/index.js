import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  MONSTERS, 
  MAP_PRESETS, 
  ADVENTURES, 
  ITEMS, 
  CLASSES,
  RACES,
  STORY_CAMPAIGN,
  getAbilityMod, 
  formatMod,
  LEVEL_XP_TABLE,
  calculateCharacterDerivedStats
} from '../src/data/dndData.js';
import { rollD20, parseDiceFormula, rollDie } from '../src/utils/dice.js';
import { isTileBlocked } from '../src/utils/pathfinding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const ROOMS_FILE = process.env.ROOMS_FILE || path.join(DATA_DIR, 'rooms.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let rooms = {};
const aiTurnTimeouts = {};

// Helper to verify if caller socket is DM in the current room
function isSocketDM(room, socketId) {
  return room && room.players && room.players[socketId]?.role === 'dm';
}

// Helper to build monster token from monster template
function createMonsterToken(monsterId, x, y, customName) {
  const template = MONSTERS.find(m => m.id === monsterId) || MONSTERS[0];
  return {
    id: `enemy_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    monsterId: template.id,
    name: customName || template.name,
    type: 'enemy',
    x: x ?? 14,
    y: y ?? 7,
    size: template.size === 'Grande' ? 2 : 1,
    hp: template.hp,
    maxHp: template.maxHp,
    ac: template.ac,
    speed: template.speed || 9,
    xp: template.xp || 50,
    goldDrop: template.goldDrop || 15,
    avatar: template.avatar || '👹',
    color: template.color || '#EF4444',
    conditions: [],
    actions: template.actions || [],
    stats: template.stats || { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 }
  };
}

// Helper to build NPC token from template
function createNPCToken(npc) {
  return {
    id: npc.id || `npc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: npc.name,
    role: npc.role,
    type: 'npc',
    x: npc.x,
    y: npc.y,
    size: 1,
    hp: 100,
    maxHp: 100,
    ac: 15,
    speed: 9,
    avatar: npc.avatar || '🧙‍♂️',
    color: '#ca8a04',
    appearance: npc.appearance,
    dialogue: npc.dialogue,
    hasShop: npc.hasShop || false,
    shopItems: npc.shopItems || []
  };
}

// Helper to load a Land from STORY_CAMPAIGN into room
function loadLandIntoRoom(room, landId = 'land_forest') {
  const land = STORY_CAMPAIGN.lands.find(l => l.id === landId) || STORY_CAMPAIGN.lands[0];
  const mapPreset = MAP_PRESETS.find(m => m.id === land.id) || MAP_PRESETS[0];

  room.currentLandId = land.id;
  room.currentAdventureId = land.id;
  room.bossDefeated = false;
  room.portalPosition = land.portalPosition;
  room.portalName = land.portalName;
  room.map = {
    ...mapPreset,
    gridSize: land.gridSize || 52,
    cols: land.cols || 46,
    rows: land.rows || 32
  };

  // Preserve existing players and reposition them to land.startPosition
  const playerTokens = (room.tokens || []).filter(t => t.type === 'player');
  playerTokens.forEach((pt, idx) => {
    pt.x = land.startPosition.x + (idx % 3);
    pt.y = land.startPosition.y + Math.floor(idx / 3);
  });

  // Spawn Land NPCs
  const npcTokens = (land.npcs || []).map(npc => createNPCToken(npc));

  // Spawn Land Normal Enemies
  const enemyTokens = (land.enemies || []).map(e => createMonsterToken(e.monsterId, e.x, e.y, e.name));

  // Spawn Land Boss
  if (land.boss) {
    const bossTemplate = MONSTERS.find(m => m.id === land.boss.monsterId) || MONSTERS[0];
    const bossToken = {
      id: `boss_${land.boss.monsterId}_${Date.now()}`,
      monsterId: land.boss.monsterId,
      name: land.boss.name,
      title: land.boss.title,
      type: 'enemy',
      isBoss: true,
      x: land.boss.x,
      y: land.boss.y,
      size: land.boss.size || 2,
      hp: land.boss.hp || bossTemplate.hp,
      maxHp: land.boss.maxHp || bossTemplate.maxHp,
      ac: land.boss.ac || bossTemplate.ac,
      speed: land.boss.speed || 9,
      xp: land.boss.xp || 500,
      goldDrop: land.boss.goldDrop || 200,
      avatar: land.boss.avatar || '👑',
      color: land.boss.color || '#9333ea',
      actions: land.boss.actions || bossTemplate.actions,
      stats: bossTemplate.stats || { str: 16, dex: 14, con: 16, int: 10, wis: 10, cha: 10 }
    };
    enemyTokens.push(bossToken);
  }

  room.tokens = [...playerTokens, ...npcTokens, ...enemyTokens];
  room.chests = JSON.parse(JSON.stringify(land.chests || []));
  room.gatherables = JSON.parse(JSON.stringify(land.gatherables || []));
  room.corpses = [];
  room.combat = { active: false, round: 1, currentTurnIndex: 0, turnOrder: [] };
  if (!room.collectedRelics) room.collectedRelics = [];

  addRoomMessage(room.id, {
    sender: '📜 A Lenda de Eldoria',
    senderType: 'dm',
    type: 'narration',
    content: `🗺️ **BEM-VINDOS A ${land.name.toUpperCase()}!**\n${land.description}\n\n⚔️ **Objetivo**: Falem com os NPCs no acampamento, explorem as redondezas e derrotem **${land.bossName}** para abrir a passagem!`
  });
}

// Helper to create a default character if a player joins without one
function createDefaultHero(playerName) {
  const cls = CLASSES[0]; // Guerreiro
  const race = RACES[0]; // Humano
  const stats = { str: 16, dex: 14, con: 15, int: 10, wis: 13, cha: 11 };
  const inventory = cls.starterGear.map(id => ITEMS[id]).filter(Boolean);
  const char = {
    id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: playerName || 'Aventureiro Valente',
    race: race.name,
    raceId: race.id,
    className: cls.name,
    classId: cls.id,
    level: 1,
    xp: 0,
    unspentStatPoints: 0,
    avatar: '⚔️',
    color: '#3B82F6',
    alignment: 'Neutro e Bom',
    hitDie: cls.hitDie,
    hp: 12,
    maxHp: 12,
    tempHp: 0,
    ac: 18,
    speed: 9,
    proficiencyBonus: 2,
    savingThrows: cls.savingThrows,
    stats,
    gold: 120,
    inventory,
    spellSlots: { 1: { total: 2, current: 2 } },
    deathSaves: { successes: 0, failures: 0 }
  };
  const derived = calculateCharacterDerivedStats(char);
  char.ac = derived.ac;
  return char;
}

// Create initial room populated with Land 1 (Floresta)
function createInitialRoom(roomId, roomName, dmPass) {
  const room = {
    id: roomId,
    name: roomName || `Aventura ${roomId}`,
    dmPass: dmPass || 'mestre123',
    createdAt: new Date().toISOString(),
    autoDM: true,
    fogEnabled: false,
    collectedRelics: [],
    tokens: [],
    chatHistory: [
      {
        id: 'msg_init_1',
        sender: '📜 A Lenda de Eldoria',
        senderType: 'dm',
        type: 'narration',
        content: `⚔️ **BEM-VINDOS A ELDORIA!** Quatro grandes Lands guardam as Quatro Relíquias Ancestrais. Explorem cada região, conversem com os NPCs [E], coletem itens e derrotem os Chefes para abrir caminho!`,
        timestamp: Date.now()
      },
      {
        id: 'msg_init_2',
        sender: 'Sistema',
        senderType: 'system',
        content: `💡 Dica: Mova seu herói pelo mapa, clique em um inimigo para atacar ou clique em "Iniciar Combate" para o Mestre Automático controlar os monstros!`,
        timestamp: Date.now()
      }
    ],
    players: {}
  };
  loadLandIntoRoom(room, 'land_forest');
  return room;
}

// Load saved rooms and upgrade any legacy ones to STORY_CAMPAIGN Lands
try {
  if (fs.existsSync(ROOMS_FILE)) {
    const raw = fs.readFileSync(ROOMS_FILE, 'utf-8');
    rooms = JSON.parse(raw);
    Object.values(rooms).forEach(r => {
      if (r.autoDM === undefined) r.autoDM = true;
      if (r.fogEnabled === undefined) r.fogEnabled = false;
      const validLand = STORY_CAMPAIGN.lands.find(l => l.id === r.currentLandId);
      if (!validLand) {
        loadLandIntoRoom(r, 'land_forest');
      } else {
        const preset = MAP_PRESETS.find(m => m.id === validLand.id) || MAP_PRESETS[0];
        r.map = {
          ...preset,
          gridSize: validLand.gridSize || 52,
          cols: validLand.cols || 46,
          rows: validLand.rows || 32
        };
        r.portalPosition = validLand.portalPosition;
        r.portalName = validLand.portalName;
        if (!r.gatherables) r.gatherables = JSON.parse(JSON.stringify(validLand.gatherables || []));
      }
    });
    console.log(`[Storage] Carregadas e atualizadas ${Object.keys(rooms).length} salas.`);
  }
} catch (e) {
  console.error('[Storage] Erro ao carregar rooms.json:', e);
  rooms = {};
}

function saveRoomsToDisk() {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Storage] Falha ao salvar rooms.json:', e);
  }
}

let saveTimeout = null;
function scheduleSave() {
  if (!saveTimeout) {
    saveTimeout = setTimeout(() => {
      saveRoomsToDisk();
      saveTimeout = null;
    }, 3000);
    if (saveTimeout.unref) saveTimeout.unref();
  }
}

// Grid distance helper (in squares; 1 sq = 1.5m)
function getGridDistance(t1, t2) {
  const dx = Math.abs((t1.x || 0) - (t2.x || 0));
  const dy = Math.abs((t1.y || 0) - (t2.y || 0));
  return Math.max(dx, dy);
}

// Broadcast chat message helper
function addRoomMessage(roomId, msgData) {
  const room = rooms[roomId];
  if (!room) return;
  const msg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sender: msgData?.sender || 'Sistema',
    senderType: msgData?.senderType || 'system',
    type: msgData?.type || 'chat',
    content: msgData?.content || '',
    rollData: msgData?.rollData || null,
    timestamp: Date.now()
  };
  room.chatHistory.push(msg);
  if (room.chatHistory.length > 200) room.chatHistory.shift();
  io.to(roomId).emit('chat:message', msg);
}

// Handle enemy defeat, XP/Gold rewards, and victory check
function handleEnemyDefeated(roomId, defeatedToken, attackerName) {
  const room = rooms[roomId];
  if (!room) return;

  const xpReward = defeatedToken.xp || 50;
  const goldReward = defeatedToken.goldDrop || 15;

  // Remove defeated enemy token
  room.tokens = room.tokens.filter(t => t.id !== defeatedToken.id);
  if (room.combat?.active) {
    const removedIdx = room.combat.turnOrder.indexOf(defeatedToken.id);
    room.combat.turnOrder = room.combat.turnOrder.filter(id => id !== defeatedToken.id);
    if (removedIdx !== -1 && removedIdx < room.combat.currentTurnIndex) {
      room.combat.currentTurnIndex = Math.max(0, room.combat.currentTurnIndex - 1);
    }
    if (room.combat.currentTurnIndex >= room.combat.turnOrder.length) {
      room.combat.currentTurnIndex = 0;
    }
  }

  // Distribute XP and Gold to all players with characters
  const levelUpNames = [];
  Object.values(room.players).forEach(p => {
    if (p.character) {
      p.character.xp = (p.character.xp || 0) + xpReward;
      p.character.gold = (p.character.gold || 0) + goldReward;

      // Check Level Up
      const currentLvl = p.character.level || 1;
      const nextLvlXp = LEVEL_XP_TABLE[currentLvl + 1];
      if (nextLvlXp && p.character.xp >= nextLvlXp) {
        p.character.level = currentLvl + 1;
        p.character.unspentStatPoints = (p.character.unspentStatPoints || 0) + 2;
        const conMod = getAbilityMod(p.character.stats?.con || 10);
        const hpGain = Math.max(4, Math.floor((p.character.hitDie || 8) / 2) + 1 + conMod);
        p.character.maxHp = (p.character.maxHp || 10) + hpGain;
        p.character.hp = p.character.maxHp; // Full heal on level up!
        const derived = calculateCharacterDerivedStats(p.character);
        p.character.proficiencyBonus = derived.profBonus;
        p.character.ac = derived.ac;

        // Update player token on map
        const pTok = room.tokens.find(t => t.characterId === p.character.id);
        if (pTok) {
          pTok.maxHp = p.character.maxHp;
          pTok.hp = p.character.hp;
          pTok.ac = p.character.ac;
        }
        levelUpNames.push(`${p.character.name} (Nível ${p.character.level}!)`);
      }
    }
  });

  addRoomMessage(roomId, {
    sender: '🤖 Mestre Automático',
    senderType: 'dm',
    type: 'narration',
    content: `💀 **${defeatedToken.name}** foi derrotado por **${attackerName}**! Todos os heróis recebem **+${xpReward} XP** e **+${goldReward} PO**!`
  });

  if (levelUpNames.length > 0) {
    addRoomMessage(roomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: `🎉 **SUBIU DE NÍVEL!** ${levelUpNames.join(', ')}! Vida restaurada e **+2 Pontos de Atributo** disponíveis na Ficha!`
    });
  }

  // Tibia Corpse & Loot Drop on Tile
  if (!room.corpses) room.corpses = [];
  const bonusLootGold = Math.floor(Math.random() * 15) + 8;
  const dropPool = ['pocao_cura', 'pocao_cura_maior', 'adaga', 'espada_curta', 'escudo', 'antidoto'];
  const droppedItems = [];
  if (Math.random() < 0.65) {
    const rId = dropPool[Math.floor(Math.random() * dropPool.length)];
    if (ITEMS[rId]) droppedItems.push({ ...ITEMS[rId], id: `loot_${Date.now()}_${Math.floor(Math.random() * 1000)}` });
  }
  const newCorpse = {
    id: `corpse_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: `Corpo de ${defeatedToken.name}`,
    monsterName: defeatedToken.name,
    avatar: defeatedToken.avatar || '💀',
    x: defeatedToken.x,
    y: defeatedToken.y,
    gold: bonusLootGold,
    items: droppedItems,
    opened: false,
    createdAt: Date.now()
  };
  room.corpses.push(newCorpse);
  io.to(roomId).emit('room:corpses_updated', room.corpses);

  // Handle Land Boss Defeat & Portal Unlock
  if (defeatedToken.isBoss) {
    room.bossDefeated = true;
    const currentLand = STORY_CAMPAIGN.lands.find(l => l.id === room.currentLandId) || STORY_CAMPAIGN.lands[0];
    const relic = currentLand.relicReward;
    if (relic && !room.collectedRelics.includes(relic.id)) {
      room.collectedRelics.push(relic.id);
    }

    // Distribute relic to player inventories
    Object.values(room.players).forEach(p => {
      if (p.character && relic) {
        if (!p.character.inventory) p.character.inventory = [];
        p.character.inventory.push({
          id: relic.id,
          name: relic.name,
          type: 'magic',
          desc: relic.desc,
          cost: 1000
        });
      }
    });

    io.to(roomId).emit('room:boss_defeated', {
      landId: room.currentLandId,
      bossName: defeatedToken.name,
      relic,
      portalPosition: room.portalPosition,
      portalName: room.portalName
    });

    addRoomMessage(roomId, {
      sender: '🏆 Mestre da Campanha',
      senderType: 'dm',
      type: 'narration',
      content: `🎉 **O CHEFÃO DA TERRA FOI DESTRUÍDO!**\n**${defeatedToken.name}** tombou perante a bravura do grupo!\nVocês conquistaram a relíquia lendária: **${relic ? relic.name : 'Relíquia Antiga'}** (${relic ? relic.icon : '✨'})!\n\n🌀 **A BARREIRA MÁGICA FOI DISSIPADA!** O portal para a próxima Land (${room.portalName || 'Portal Ancestral'}) no sudeste do mapa foi ativado! Reúnam o grupo e pressionem [E] no portal para avançar!`
    });
  }

  // Check if all enemies are defeated
  const remainingEnemies = room.tokens.filter(t => t.type === 'enemy');
  if (remainingEnemies.length === 0) {
    room.combat = { active: false, round: 1, currentTurnIndex: 0, turnOrder: [] };
    io.to(roomId).emit('combat:updated', room.combat);

    // Spawn a victory treasure chest if none unopened
    const hasUnopened = (room.chests || []).some(c => !c.opened);
    if (!hasUnopened) {
      room.chests.push({
        id: `chest_vic_${Date.now()}`,
        x: defeatedToken.x,
        y: defeatedToken.y,
        gold: 100,
        itemId: 'pocao_cura_maior',
        opened: false
      });
      io.to(roomId).emit('room:chests_updated', room.chests);
    }

    addRoomMessage(roomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: `🏆 **VITÓRIA DO GRUPO!** Todos os inimigos da área foram derrotados! Abram os Baús de Tesouro no mapa ou escolham o próximo Ato em "Missões / Mestre Automático"!`
    });
  }

  io.to(roomId).emit('room:tokens_updated', room.tokens);
  io.to(roomId).emit('room:players_updated', room.players);
}

// Advance Combat Turn & Trigger Automated DM if next is Enemy
function advanceCombatTurn(roomId) {
  const room = rooms[roomId];
  if (!room || !room.combat?.active) return;

  if (aiTurnTimeouts[roomId]) {
    clearTimeout(aiTurnTimeouts[roomId]);
    delete aiTurnTimeouts[roomId];
  }

  // Clean turnOrder of any missing tokens
  room.combat.turnOrder = room.combat.turnOrder.filter(id => room.tokens.some(t => t.id === id));
  if (room.combat.turnOrder.length === 0) {
    room.combat.active = false;
    io.to(roomId).emit('combat:updated', room.combat);
    return;
  }

  let nextIndex = room.combat.currentTurnIndex + 1;
  let nextRound = room.combat.round;

  if (nextIndex >= room.combat.turnOrder.length) {
    nextIndex = 0;
    nextRound += 1;
  }

  room.combat.currentTurnIndex = nextIndex;
  room.combat.round = nextRound;

  const currentTokenId = room.combat.turnOrder[nextIndex];
  const currentToken = room.tokens.find(t => t.id === currentTokenId);

  io.to(roomId).emit('combat:updated', room.combat);

  if (currentToken) {
    addRoomMessage(roomId, {
      sender: 'Combate',
      senderType: 'system',
      content: `⚔️ Rodada ${nextRound} — Turno de **${currentToken.name}** (${currentToken.type === 'enemy' ? 'Inimigo' : 'Herói'})!`
    });

    // Trigger AI turn if enemy & autoDM enabled
    if (currentToken.type === 'enemy' && room.autoDM) {
      scheduleAutoDMTurn(roomId, currentToken.id);
    }
  }
  scheduleSave();
}

// Automated DM AI Turn Logic
function scheduleAutoDMTurn(roomId, enemyTokenId) {
  if (aiTurnTimeouts[roomId]) clearTimeout(aiTurnTimeouts[roomId]);

  aiTurnTimeouts[roomId] = setTimeout(() => {
    const room = rooms[roomId];
    if (!room || !room.combat?.active || !room.autoDM) return;

    const enemy = room.tokens.find(t => t.id === enemyTokenId && t.type === 'enemy');
    if (!enemy || enemy.hp <= 0) {
      advanceCombatTurn(roomId);
      return;
    }

    // Find living player tokens
    const playerTokens = room.tokens.filter(t => t.type === 'player' && (t.hp || 0) > 0);
    if (playerTokens.length === 0) {
      addRoomMessage(roomId, {
        sender: '🤖 Mestre Automático',
        senderType: 'dm',
        type: 'narration',
        content: `💀 Todos os heróis caíram! Usem Descanso Longo ou Poções na Ficha para se reerguerem!`
      });
      room.combat.active = false;
      io.to(roomId).emit('combat:updated', room.combat);
      return;
    }

    // Pick closest living player
    playerTokens.sort((a, b) => getGridDistance(enemy, a) - getGridDistance(enemy, b));
    const target = playerTokens[0];
    let dist = getGridDistance(enemy, target);

    // Move toward target if not adjacent
    const maxMoveSquares = Math.max(3, Math.floor((enemy.speed || 9) / 1.5));
    if (dist > 1) {
      const steps = Math.min(dist - 1, maxMoveSquares);
      let newX = enemy.x;
      let newY = enemy.y;

      for (let s = 0; s < steps; s++) {
        const dx = Math.sign(target.x - newX);
        const dy = Math.sign(target.y - newY);
        const candidateX = newX + dx;
        const candidateY = newY + dy;

        // Avoid stepping directly on another token
        const occupied = room.tokens.some(t => t.id !== enemy.id && t.x === candidateX && t.y === candidateY);
        if (!occupied) {
          newX = candidateX;
          newY = candidateY;
        } else if (!room.tokens.some(t => t.id !== enemy.id && t.x === newX + dx && t.y === newY)) {
          newX += dx;
        } else if (!room.tokens.some(t => t.id !== enemy.id && t.x === newX && t.y === newY + dy)) {
          newY += dy;
        }
      }

      if (newX !== enemy.x || newY !== enemy.y) {
        enemy.x = Math.max(1, Math.min((room.map?.cols || 22) - 2, newX));
        enemy.y = Math.max(1, Math.min((room.map?.rows || 15) - 2, newY));
        io.to(roomId).emit('room:token_moved', { tokenId: enemy.id, x: enemy.x, y: enemy.y });
      }
    }

    // Recompute distance after moving
    dist = getGridDistance(enemy, target);
    const distMeters = dist * 1.5;

    // Choose best attack action in range
    const actions = enemy.actions && enemy.actions.length > 0
      ? enemy.actions
      : [{ name: 'Ataque Selvagem', bonus: 4, damage: '1d6+2', range: 1.5, type: 'cortante' }];

    let chosenAction = actions.find(a => (a.range || 1.5) >= distMeters);
    if (!chosenAction && dist <= 2) {
      chosenAction = actions[0];
    }

    if (chosenAction) {
      const atkRoll = rollD20(chosenAction.bonus || 4);
      const targetAc = target.ac || 12;
      const isHit = atkRoll.isNat20 || (!atkRoll.isNat1 && atkRoll.total >= targetAc);

      if (isHit) {
        const parsedDmg = parseDiceFormula(chosenAction.damage || '1d6+2');
        let dmg = parsedDmg ? parsedDmg.total : 5;
        if (atkRoll.isNat20) {
          const critExtra = parseDiceFormula(chosenAction.damage || '1d6');
          dmg += (critExtra?.rolls.reduce((a, b) => a + b, 0) || 4);
        }
        dmg = Math.max(1, dmg);

        target.hp = Math.max(0, (target.hp || 10) - dmg);

        // Sync with player character sheet
        Object.values(room.players).forEach(p => {
          if (p.character && p.character.id === target.characterId) {
            p.character.hp = target.hp;
          }
        });

        io.to(roomId).emit('combat:visual_effect', {
          fromX: enemy.x,
          fromY: enemy.y,
          toX: target.x,
          toY: target.y,
          text: `${atkRoll.isNat20 ? '💥 CRÍTICO! ' : ''}-${dmg} PV`,
          color: '#EF4444',
          effectType: (chosenAction.range || 1.5) > 3 ? 'arrow' : 'slash',
          isCrit: atkRoll.isNat20
        });

        addRoomMessage(roomId, {
          sender: `🤖 Mestre (${enemy.name})`,
          senderType: 'dm',
          type: 'roll',
          content: `${enemy.avatar} **${enemy.name}** ataca **${target.name}** com **${chosenAction.name}**! Rolou **${atkRoll.total}** vs CA ${targetAc} — **ACERTOU** causando **${dmg} de dano ${chosenAction.type || ''}**! (PV de ${target.name}: ${target.hp}/${target.maxHp})`,
          rollData: {
            title: `${enemy.name}: ${chosenAction.name}`,
            total: atkRoll.total,
            rolls: [atkRoll.selectedRoll],
            isNat20: atkRoll.isNat20,
            isNat1: atkRoll.isNat1
          }
        });

        io.to(roomId).emit('room:tokens_updated', room.tokens);
        io.to(roomId).emit('room:players_updated', room.players);
      } else {
        io.to(roomId).emit('combat:visual_effect', {
          fromX: enemy.x,
          fromY: enemy.y,
          toX: target.x,
          toY: target.y,
          text: `🛡️ DEFENDEU! (${atkRoll.total} vs CA ${targetAc})`,
          color: '#60A5FA',
          effectType: 'miss'
        });

        addRoomMessage(roomId, {
          sender: `🤖 Mestre (${enemy.name})`,
          senderType: 'dm',
          type: 'roll',
          content: `${enemy.avatar} **${enemy.name}** tenta atingir **${target.name}** com **${chosenAction.name}**, mas rolou **${atkRoll.total}** contra CA ${targetAc} — **${target.name} bloqueou/esquivou!**`,
          rollData: {
            title: `${enemy.name}: ${chosenAction.name} (Errou)`,
            total: atkRoll.total,
            rolls: [atkRoll.selectedRoll],
            isNat1: atkRoll.isNat1
          }
        });
      }
    } else {
      addRoomMessage(roomId, {
        sender: `🤖 Mestre (${enemy.name})`,
        senderType: 'dm',
        type: 'chat',
        content: `${enemy.avatar} **${enemy.name}** usa *Disparada* e avança pelo mapa em direção a **${target.name}**!`
      });
    }

    // Advance to next turn after fast delay (450ms) for snappy dynamic combat
    aiTurnTimeouts[roomId] = setTimeout(() => {
      advanceCombatTurn(roomId);
    }, 450);
  }, 450);
}

// ============================================================================
// REAL-TIME MMORPG AGGRO & CHASE ENGINE (Distância <= 2 inicia perseguição!)
// ============================================================================
function processRoomMMORPGAggro(roomId, onlyAcquireAggro = false) {
  const room = rooms[roomId];
  if (!room || !room.tokens || room.autoDM === false) return;

  const hasOnlinePlayers = Object.values(room.players || {}).some(p => p.online);
  if (!hasOnlinePlayers) return;

  const playerTokens = room.tokens.filter(t => t.type === 'player' && (t.hp ?? 10) > 0);
  if (playerTokens.length === 0) return;

  const now = Date.now();
  const cols = room.map?.cols || 46;
  const rows = room.map?.rows || 32;
  const obstacles = room.map?.obstacles || [];

  const enemies = room.tokens.filter(t => t.type === 'enemy' && (t.hp ?? 10) > 0);
  enemies.forEach(enemy => {
    // 1. Encontra o jogador vivo mais próximo
    let closestPlayer = null;
    let minDist = Infinity;
    playerTokens.forEach(pt => {
      const d = getGridDistance(enemy, pt);
      if (d < minDist) {
        minDist = d;
        closestPlayer = pt;
      }
    });

    // 2. Se um jogador passar a <= 2 de distância, o inimigo adquire aggro e passa a persegui-lo!
    if (!enemy.aggroTargetId && closestPlayer && minDist <= 2) {
      enemy.aggroTargetId = closestPlayer.id;
      io.to(roomId).emit('combat:visual_effect', {
        fromX: enemy.x,
        fromY: enemy.y,
        toX: enemy.x,
        toY: enemy.y,
        text: `❗ ${enemy.name}!`,
        color: '#EF4444',
        effectType: 'alert'
      });
      io.to(roomId).emit('room:tokens_updated', room.tokens);
    }

    if (onlyAcquireAggro || !enemy.aggroTargetId) return;

    // 3. Valida alvo atual e distância de desistência (leash > 9 quadrados)
    let target = playerTokens.find(p => p.id === enemy.aggroTargetId);
    if (!target || getGridDistance(enemy, target) > 9) {
      if (closestPlayer && minDist <= 2) {
        enemy.aggroTargetId = closestPlayer.id;
        target = closestPlayer;
      } else {
        enemy.aggroTargetId = null;
        io.to(roomId).emit('room:tokens_updated', room.tokens);
        return;
      }
    } else if (closestPlayer && minDist <= 1 && closestPlayer.id !== target.id) {
      // Troca para jogador colado se houver
      enemy.aggroTargetId = closestPlayer.id;
      target = closestPlayer;
    }

    const dist = getGridDistance(enemy, target);

    // 4. Perseguição em Tempo Real: se dist > 1, anda 1 quadrado na direção do jogador
    if (dist > 1) {
      const candidates = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = enemy.x + dx;
          const ny = enemy.y + dy;
          if (isTileBlocked(nx, ny, obstacles, cols, rows)) continue;
          const occupied = room.tokens.some(t => t.id !== enemy.id && (t.hp ?? 10) > 0 && t.x === nx && t.y === ny);
          if (occupied) continue;
          const remDist = Math.hypot(target.x - nx, target.y - ny);
          candidates.push({ nx, ny, remDist });
        }
      }
      candidates.sort((a, b) => a.remDist - b.remDist);
      if (candidates.length > 0 && candidates[0].remDist < Math.hypot(target.x - enemy.x, target.y - enemy.y) + 0.2) {
        enemy.x = candidates[0].nx;
        enemy.y = candidates[0].ny;
        io.to(roomId).emit('room:token_moved', {
          tokenId: enemy.id,
          x: enemy.x,
          y: enemy.y,
          aggroTargetId: enemy.aggroTargetId
        });
      }
    }

    // 5. Ataque em Tempo Real: se estiver adjacente (dist <= 1.5), golpeia o jogador a cada 1.5s
    const newDist = getGridDistance(enemy, target);
    if (newDist <= 1.5 && now - (enemy.lastAttackAt || 0) >= 1500) {
      enemy.lastAttackAt = now;
      const action = (enemy.actions && enemy.actions[0]) || { name: 'Ataque', bonus: 4, damage: '1d6+2' };
      const atkRoll = rollD20(action.bonus || 4);
      const targetAc = target.ac || 14;
      const isHit = atkRoll.isNat20 || (!atkRoll.isNat1 && atkRoll.total >= targetAc);

      if (isHit) {
        const parsedDmg = parseDiceFormula(action.damage || '1d6+2');
        let dmg = parsedDmg ? parsedDmg.total : 4;
        if (atkRoll.isNat20) dmg += 4;
        dmg = Math.max(1, dmg);

        target.hp = Math.max(0, (target.hp || 10) - dmg);
        Object.values(room.players).forEach(p => {
          if (p.character && p.character.id === target.characterId) {
            p.character.hp = target.hp;
          }
        });

        io.to(roomId).emit('combat:visual_effect', {
          fromX: enemy.x,
          fromY: enemy.y,
          toX: target.x,
          toY: target.y,
          text: `${atkRoll.isNat20 ? '💥 CRÍTICO! ' : ''}-${dmg} PV`,
          color: '#EF4444',
          effectType: 'slash',
          isCrit: atkRoll.isNat20
        });

        // Se o jogador chegar a 0 PV, renasce no Acampamento Seguro da Land (estilo MMORPG)
        if (target.hp <= 0) {
          const currentLand = STORY_CAMPAIGN.lands.find(l => l.id === room.currentLandId) || STORY_CAMPAIGN.lands[0];
          const spawn = currentLand.startPosition || { x: 23, y: 16 };
          target.x = spawn.x;
          target.y = spawn.y;
          target.hp = target.maxHp || 12;
          enemy.aggroTargetId = null;

          Object.values(room.players).forEach(p => {
            if (p.character && p.character.id === target.characterId) {
              p.character.hp = target.hp;
              io.to(p.socketId).emit('character:sync', p.character);
            }
          });

          addRoomMessage(roomId, {
            sender: '✨ Santuário de Eldoria',
            senderType: 'system',
            content: `💀 **${target.name}** tombou diante de **${enemy.name}** e foi resgatado de volta ao Acampamento Seguro com vida restaurada!`
          });
        }

        io.to(roomId).emit('room:tokens_updated', room.tokens);
        io.to(roomId).emit('room:players_updated', room.players);
      } else {
        io.to(roomId).emit('combat:visual_effect', {
          fromX: enemy.x,
          fromY: enemy.y,
          toX: target.x,
          toY: target.y,
          text: `🛡️ Esquivou!`,
          color: '#94A3B8',
          effectType: 'miss'
        });
      }
    }
  });
}

const mmorpgLoopInterval = setInterval(() => {
  Object.keys(rooms).forEach(roomId => {
    processRoomMMORPGAggro(roomId, false);
  });
}, 650);
if (mmorpgLoopInterval.unref) mmorpgLoopInterval.unref();

app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    roomsCount: Object.keys(rooms).length
  });
});

app.get('/api/rooms', (req, res) => {
  const publicRooms = Object.values(rooms).map(r => ({
    id: r.id,
    name: r.name,
    playerCount: Object.values(r.players || {}).filter(p => p.online).length,
    enemyCount: (r.tokens || []).filter(t => t.type === 'enemy').length,
    autoDM: r.autoDM,
    activeMap: r.map?.name || 'Cripta Ancestral'
  }));
  res.json(publicRooms);
});

io.on('connection', (socket) => {
  let currentRoomId = null;

  socket.on('room:join', (data = {}) => {
    try {
      const { roomId, playerName, role, dmPass, character } = data || {};
      if (!roomId) {
        socket.emit('room:error', { message: 'Código da sala não fornecido.' });
        return;
      }
      const cleanRoomId = typeof roomId === 'string' ? roomId.trim().toUpperCase() : String(roomId).trim().toUpperCase();
      if (!cleanRoomId) {
        socket.emit('room:error', { message: 'Código da sala inválido.' });
        return;
      }
      currentRoomId = cleanRoomId;

      if (!rooms[cleanRoomId]) {
        rooms[cleanRoomId] = createInitialRoom(cleanRoomId, `Sala ${cleanRoomId}`, dmPass);
      }

      const room = rooms[cleanRoomId];
      if (!room.players) room.players = {};
      if (!room.tokens) room.tokens = [];
      if (!room.corpses) room.corpses = [];

      const isDM = role === 'dm' && (!room.dmPass || room.dmPass === dmPass);

      // Ensure every player has a valid character!
      let activeChar = character;
      if (!isDM && !activeChar) {
        activeChar = createDefaultHero(playerName);
      }

      // Normalize inventory if present
      if (activeChar && Array.isArray(activeChar.inventory)) {
        activeChar.inventory = activeChar.inventory
          .map(i => typeof i === 'string' ? (ITEMS[i] || null) : i)
          .filter(Boolean);
      }

      // Clean up old disconnected sockets with same characterId to avoid duplicates
      if (activeChar) {
        Object.keys(room.players).forEach(sid => {
          if (sid !== socket.id && room.players[sid]?.character?.id === activeChar.id && !room.players[sid].online) {
            delete room.players[sid];
          }
        });
      }

      room.players[socket.id] = {
        socketId: socket.id,
        name: activeChar?.name || playerName || (isDM ? 'Mestre da Mesa' : 'Aventureiro'),
        role: isDM ? 'dm' : 'player',
        character: activeChar || null,
        online: true,
        lastActive: Date.now()
      };

      socket.join(cleanRoomId);

      // Always place or sync player's token on the map!
      if (activeChar) {
        const derived = calculateCharacterDerivedStats(activeChar);
        activeChar.ac = derived.ac;
        activeChar.proficiencyBonus = derived.profBonus;

        const currentLand = STORY_CAMPAIGN.lands.find(l => l.id === room.currentLandId) || STORY_CAMPAIGN.lands[0];
        const baseSpawn = currentLand.startPosition || { x: 23, y: 16 };

        let existingToken = room.tokens.find(t => t.characterId === activeChar.id);
        if (!existingToken) {
          const playerTokensCount = room.tokens.filter(t => t.type === 'player').length;
          const pos = {
            x: baseSpawn.x + (playerTokensCount % 3),
            y: baseSpawn.y + Math.floor(playerTokensCount / 3)
          };

          existingToken = {
            id: `token_${activeChar.id}`,
            characterId: activeChar.id,
            name: activeChar.name,
            type: 'player',
            x: pos.x,
            y: pos.y,
            size: 1,
            hp: activeChar.hp || 12,
            maxHp: activeChar.maxHp || 12,
            ac: activeChar.ac || 15,
            speed: activeChar.speed || 9,
            avatar: activeChar.avatar || '⚔️',
            color: activeChar.color || '#3B82F6',
            appearance: activeChar.appearance || null,
            stats: activeChar.stats || { str: 14, dex: 12, con: 14, int: 10, wis: 12, cha: 10 },
            conditions: []
          };
          room.tokens.push(existingToken);
        } else {
          existingToken.name = activeChar.name;
          existingToken.hp = activeChar.hp;
          existingToken.maxHp = activeChar.maxHp;
          existingToken.ac = activeChar.ac;
          existingToken.avatar = activeChar.avatar;
          existingToken.color = activeChar.color;
          existingToken.appearance = activeChar.appearance || existingToken.appearance;
          existingToken.stats = activeChar.stats;
        }
      }

      console.log(`[Sala] ${room.players[socket.id].name} entrou em ${cleanRoomId} (${isDM ? 'Mestre' : 'Jogador'})`);

      socket.emit('room:state', {
        ...room,
        isDM,
        myPlayerId: socket.id
      });

      if (activeChar) {
        socket.emit('character:sync', activeChar);
      }

      io.to(cleanRoomId).emit('room:player_joined', {
        player: room.players[socket.id],
        players: room.players,
        tokens: room.tokens
      });

      scheduleSave();
    } catch (err) {
      console.error('[Socket] Erro inesperado em room:join:', err);
      socket.emit('room:error', { message: 'Erro ao entrar na sala: ' + (err.message || String(err)) });
    }
  });

  // Toggle Auto-DM
  socket.on('autodm:toggle', ({ enabled } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.autoDM = enabled !== undefined ? enabled : !room.autoDM;
    io.to(currentRoomId).emit('room:autodm_updated', room.autoDM);

    addRoomMessage(currentRoomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'system',
      content: room.autoDM
        ? '🤖 **Mestre Automático ATIVADO!** Os inimigos agirão e atacarão automaticamente nos turnos deles!'
        : '⏸️ **Mestre Automático PAUSADO.** Controle manual de inimigos habilitado.'
    });

    if (room.autoDM && room.combat?.active) {
      const activeTokId = room.combat.turnOrder[room.combat.currentTurnIndex];
      const activeTok = room.tokens.find(t => t.id === activeTokId);
      if (activeTok && activeTok.type === 'enemy') {
        scheduleAutoDMTurn(currentRoomId, activeTok.id);
      }
    }
    scheduleSave();
  });

  // Load Adventure Act / Campaign Land
  socket.on('adventure:load', ({ adventureId } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];

    const targetLand = STORY_CAMPAIGN.lands.find(l => l.id === adventureId) || STORY_CAMPAIGN.lands[0];
    loadLandIntoRoom(room, targetLand.id);

    io.to(currentRoomId).emit('room:land_advanced', {
      landId: targetLand.id,
      landName: targetLand.name,
      portalPosition: room.portalPosition,
      portalName: room.portalName,
      relics: room.collectedRelics || []
    });
    io.to(currentRoomId).emit('room:map_updated', room.map);
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    io.to(currentRoomId).emit('room:chests_updated', room.chests);
    io.to(currentRoomId).emit('room:gatherables_updated', room.gatherables);
    io.to(currentRoomId).emit('room:corpses_updated', room.corpses);
    io.to(currentRoomId).emit('combat:updated', room.combat);

    scheduleSave();
  });

  // Generate Random Encounter on current map
  socket.on('adventure:random_encounter', ({ difficulty = 'medium' } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];

    const playerTokens = room.tokens.filter(t => t.type === 'player');

    let pool = ['goblin', 'kobold', 'skeleton', 'zombie'];
    let count = 3;
    if (difficulty === 'medium') {
      pool = ['orc', 'bandit', 'dire_wolf', 'skeleton', 'goblin'];
      count = 4;
    } else if (difficulty === 'hard') {
      pool = ['ogre', 'giant_spider', 'necromancer', 'orc', 'dire_wolf'];
      count = 4;
    } else if (difficulty === 'boss') {
      pool = ['young_red_dragon', 'beholder'];
      count = 1;
    }

    const spawnedEnemies = [];
    for (let i = 0; i < count; i++) {
      const mId = pool[Math.floor(Math.random() * pool.length)];
      const ex = 12 + Math.floor(Math.random() * 6);
      const ey = 3 + Math.floor(Math.random() * 9);
      spawnedEnemies.push(createMonsterToken(mId, ex, ey));
    }

    if (difficulty === 'boss') {
      spawnedEnemies.push(createMonsterToken('kobold', 12, 5, 'Guardião do Chefe'));
      spawnedEnemies.push(createMonsterToken('kobold', 12, 9, 'Acólito do Chefe'));
    }

    room.tokens = [...playerTokens, ...spawnedEnemies];
    room.chests = [
      {
        id: `chest_rand_${Date.now()}`,
        x: 18,
        y: 7,
        gold: difficulty === 'boss' ? 400 : difficulty === 'hard' ? 150 : 65,
        itemId: difficulty === 'boss' ? 'espada_flamejante' : 'pocao_cura_maior',
        opened: false
      }
    ];
    room.combat = { active: false, round: 1, currentTurnIndex: 0, turnOrder: [] };

    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    io.to(currentRoomId).emit('room:chests_updated', room.chests);
    io.to(currentRoomId).emit('combat:updated', room.combat);

    const namesList = spawnedEnemies.map(e => e.name).join(', ');
    addRoomMessage(currentRoomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: `⚔️ **NOVO ENCONTRO GERADO!** Criaturas hostis apareceram no mapa: **${namesList}**! Preparem suas armas!`
    });

    scheduleSave();
  });

  // Open Treasure Chest on Map (With Trap Check & AoE Detonation)
  socket.on('chest:open', ({ chestId } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const chest = (room.chests || []).find(c => c.id === chestId && !c.opened);
    if (!chest) return;

    chest.opened = true;
    const goldAmount = chest.gold || 50;
    const lootItem = ITEMS[chest.itemId] || ITEMS.pocao_cura;

    const openerPlayer = room.players[socket.id];
    const openerName = openerPlayer?.character?.name || openerPlayer?.name || 'Um herói';
    const openerToken = room.tokens.find(t => t.characterId === openerPlayer?.character?.id) ||
                        room.tokens.find(t => t.type === 'player');

    // 25% chance of magical trap detonation!
    const isTrapped = chest.trapped !== undefined ? chest.trapped : (Math.random() < 0.25);
    if (isTrapped) {
      const trapDmg = rollDie(6) + rollDie(6); // 2d6 explosive damage
      if (openerToken) {
        openerToken.hp = Math.max(0, (openerToken.hp || 10) - trapDmg);
        if (openerPlayer?.character) {
          openerPlayer.character.hp = openerToken.hp;
          socket.emit('character:sync', openerPlayer.character);
        }
      }

      // Damage any party tokens adjacent to chest
      room.tokens.forEach(t => {
        if (t.id !== openerToken?.id && Math.max(Math.abs(t.x - chest.x), Math.abs(t.y - chest.y)) <= 1) {
          t.hp = Math.max(0, (t.hp || 10) - trapDmg);
          const pObj = Object.values(room.players).find(p => p.character?.id === t.characterId);
          if (pObj) {
            pObj.character.hp = t.hp;
            io.to(pObj.socketId).emit('character:sync', pObj.character);
          }
        }
      });

      io.to(currentRoomId).emit('combat:visual_effect', {
        fromX: chest.x,
        fromY: chest.y,
        toX: chest.x,
        toY: chest.y,
        text: `💥 ARMADILHA EXPLOSIVA! -${trapDmg} DANO`,
        color: '#EF4444',
        effectType: 'explosion',
        isCrit: true
      });

      addRoomMessage(currentRoomId, {
        sender: '🤖 Mestre Automático',
        senderType: 'dm',
        type: 'narration',
        content: `💥 **ARMADILHA DETONADA!** O baú estava protegido por runas explosivas que detonaram causando **${trapDmg} de dano**!`
      });
    }

    // Give gold to all party members and item to opener
    Object.values(room.players).forEach(p => {
      if (p.character) {
        p.character.gold = (p.character.gold || 0) + goldAmount;
        if (p.socketId === socket.id && lootItem) {
          if (!p.character.inventory) p.character.inventory = [];
          p.character.inventory.push(lootItem);
          socket.emit('character:sync', p.character);
        }
      }
    });

    io.to(currentRoomId).emit('room:chests_updated', room.chests);
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    io.to(currentRoomId).emit('room:players_updated', room.players);
    io.to(currentRoomId).emit('combat:visual_effect', {
      fromX: chest.x,
      fromY: chest.y,
      toX: chest.x,
      toY: chest.y,
      text: `🎁 +${goldAmount} PO & ${lootItem.name}!`,
      color: '#F59E0B',
      effectType: 'heal'
    });

    addRoomMessage(currentRoomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: `🎁 **${openerName}** abriu um **Baú de Tesouro**! O grupo encontrou **+${goldAmount} Peças de Ouro (PO)** e **${lootItem.name}**!`
    });

    scheduleSave();
  });

  // Pray at Mystic Runic Altar / Shrine (Grants 30s Blessing)
  socket.on('shrine:pray', ({ shrineId } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const player = room.players[socket.id];
    if (!player?.character) return;

    const actorToken = room.tokens.find(t => t.characterId === player.character.id) ||
                       room.tokens.find(t => t.type === 'player');
    if (!actorToken) return;

    if (!actorToken.conditions) actorToken.conditions = [];
    if (!actorToken.conditions.includes('Bênção')) {
      actorToken.conditions.push('Bênção');
    }

    const healAmt = 12;
    player.character.hp = Math.min(player.character.maxHp, (player.character.hp || 0) + healAmt);
    actorToken.hp = player.character.hp;

    io.to(currentRoomId).emit('combat:visual_effect', {
      fromX: actorToken.x,
      fromY: actorToken.y,
      toX: actorToken.x,
      toY: actorToken.y,
      text: `✨ BÊNÇÃO ANCESTRAL! (+${healAmt} PV & +2 DANO)`,
      color: '#C084FC',
      effectType: 'heal'
    });

    addRoomMessage(currentRoomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: `✨ **${player.character.name}** orou no **Altar Ancestral**! Uma coluna de luz mística desceu dos céus, restaurando **+${healAmt} PV** e concedendo a **Bênção Ancestral**!`
    });

    socket.emit('character:sync', player.character);
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    scheduleSave();
  });

  // Execute Direct Combat Action (Attack / Spell / Heal on Target Token)
  socket.on('combat:execute_action', (data = {}) => {
    const { actorTokenId, targetTokenId, actionType, item, advantageType = 'normal' } = data || {};
    if (!currentRoomId || !rooms[currentRoomId] || !item) return;
    const room = rooms[currentRoomId];

    const actorToken = room.tokens.find(t => t.id === actorTokenId);
    const targetToken = room.tokens.find(t => t.id === targetTokenId) || actorToken;
    if (!actorToken || !targetToken) return;

    // Se o jogador atacar um inimigo, o inimigo adquire aggro e passa a persegui-lo em tempo real
    if (targetToken.type === 'enemy' && actorToken.type === 'player' && !targetToken.aggroTargetId) {
      targetToken.aggroTargetId = actorToken.id;
    }

    const playerObj = room.players[socket.id];
    const char = playerObj?.character;
    const stats = char?.stats || actorToken.stats || { str: 14, dex: 12, con: 14, int: 12, wis: 12, cha: 12 };
    const profBonus = char?.proficiencyBonus || 2;

    // 1. WEAPON ATTACK
    if (actionType === 'weapon') {
      const distSquares = getGridDistance(actorToken, targetToken);
      const distMeters = distSquares * 1.5;
      const maxRange = item.range || (item.properties?.some(p => p.includes('Munição') || p.includes('Arremesso')) ? 18 : 1.5);

      if (distMeters > maxRange + 1.5) {
        socket.emit('combat:action_error', {
          message: `Alvo fora de alcance! ${targetToken.name} está a ${distMeters}m, mas o alcance de ${item.name} é ${maxRange}m. Mova seu token para mais perto!`
        });
        return;
      }

      const isFinesse = item.properties?.includes('Finesse');
      const isRanged = maxRange > 3;
      const useDex = isRanged || (isFinesse && (stats.dex || 10) > (stats.str || 10));
      const statMod = getAbilityMod(useDex ? stats.dex : stats.str);
      const atkBonus = statMod + profBonus;

      const atkRoll = rollD20(atkBonus, advantageType);
      const targetAc = targetToken.ac || 12;
      const isHit = atkRoll.isNat20 || (!atkRoll.isNat1 && atkRoll.total >= targetAc);

      if (isHit) {
        const parsedDmg = parseDiceFormula(item.damage || '1d8');
        let totalDmg = (parsedDmg ? parsedDmg.total : 4) + statMod;
        if (atkRoll.isNat20) {
          const extraCrit = parseDiceFormula(item.damage || '1d8');
          totalDmg += (extraCrit?.rolls.reduce((a, b) => a + b, 0) || 4);
        }
        if (char?.classId === 'rogue') {
          totalDmg += rollDie(6);
        }
        totalDmg = Math.max(1, totalDmg);

        targetToken.hp = Math.max(0, (targetToken.hp || 10) - totalDmg);

        io.to(currentRoomId).emit('combat:visual_effect', {
          fromX: actorToken.x,
          fromY: actorToken.y,
          toX: targetToken.x,
          toY: targetToken.y,
          text: `${atkRoll.isNat20 ? '💥 CRÍTICO! ' : ''}-${totalDmg} ${item.damageType || ''}`,
          color: atkRoll.isNat20 ? '#F59E0B' : '#EF4444',
          effectType: isRanged ? 'arrow' : 'slash',
          isCrit: atkRoll.isNat20
        });

        addRoomMessage(currentRoomId, {
          sender: actorToken.name,
          senderType: 'player',
          type: 'roll',
          content: `⚔️ **${actorToken.name}** atacou **${targetToken.name}** com **${item.name}**! Rolou **${atkRoll.total}** (${atkRoll.selectedRoll}${formatMod(atkBonus)}) vs CA ${targetAc} — **ACERTOU** causando **${totalDmg} de dano ${item.damageType || ''}**!`,
          rollData: {
            title: `Ataque: ${item.name} → ${targetToken.name}`,
            total: atkRoll.total,
            rolls: [atkRoll.selectedRoll],
            isNat20: atkRoll.isNat20,
            isNat1: atkRoll.isNat1
          }
        });

        if (targetToken.hp <= 0 && targetToken.type === 'enemy') {
          handleEnemyDefeated(currentRoomId, targetToken, actorToken.name);
        } else {
          io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
        }
      } else {
        io.to(currentRoomId).emit('combat:visual_effect', {
          fromX: actorToken.x,
          fromY: actorToken.y,
          toX: targetToken.x,
          toY: targetToken.y,
          text: `🛡️ ERROU (${atkRoll.total} vs CA ${targetAc})`,
          color: '#9CA3AF',
          effectType: 'miss'
        });

        addRoomMessage(currentRoomId, {
          sender: actorToken.name,
          senderType: 'player',
          type: 'roll',
          content: `🛡️ **${actorToken.name}** atacou **${targetToken.name}** com **${item.name}**, mas rolou **${atkRoll.total}** contra CA ${targetAc} e **errou o golpe**!`,
          rollData: {
            title: `Ataque: ${item.name} (Errou)`,
            total: atkRoll.total,
            rolls: [atkRoll.selectedRoll],
            isNat1: atkRoll.isNat1
          }
        });
      }
    }

    // 2. SPELL CASTING
    else if (actionType === 'spell') {
      const distSquares = getGridDistance(actorToken, targetToken);
      const distMeters = distSquares * 1.5;
      const maxRange = item.range !== undefined ? item.range : 18;

      if (actorToken.id !== targetToken.id && distMeters > maxRange + 1.5) {
        socket.emit('combat:action_error', {
          message: `Alvo fora de alcance! ${targetToken.name} está a ${distMeters}m, mas o alcance de ${item.name} é ${maxRange}m. Mova seu token para mais perto!`
        });
        return;
      }

      if (item.heal) {
        const parsedHeal = parseDiceFormula(item.heal);
        const healAmt = Math.max(2, (parsedHeal?.total || 5) + getAbilityMod(stats.wis || stats.int || 12));
        targetToken.hp = Math.min(targetToken.maxHp || 20, (targetToken.hp || 0) + healAmt);

        Object.values(room.players).forEach(p => {
          if (p.character && p.character.id === targetToken.characterId) {
            p.character.hp = targetToken.hp;
          }
        });

        io.to(currentRoomId).emit('combat:visual_effect', {
          fromX: actorToken.x,
          fromY: actorToken.y,
          toX: targetToken.x,
          toY: targetToken.y,
          text: `✨ +${healAmt} PV (${item.name})`,
          color: '#10B981',
          effectType: 'heal'
        });

        addRoomMessage(currentRoomId, {
          sender: actorToken.name,
          senderType: 'player',
          type: 'roll',
          content: `✨ **${actorToken.name}** conjurou **${item.name}** em **${targetToken.name}**, restaurando **+${healAmt} PV**!`,
          rollData: { title: `Magia: ${item.name}`, total: healAmt }
        });

        io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
        io.to(currentRoomId).emit('room:players_updated', room.players);
      } else if (item.damage) {
        const spellMod = Math.max(getAbilityMod(stats.int), getAbilityMod(stats.wis), getAbilityMod(stats.cha));
        const atkBonus = spellMod + profBonus;
        const atkRoll = rollD20(atkBonus, advantageType);
        const targetAc = targetToken.ac || 12;
        const isHit = item.autoHit || atkRoll.isNat20 || (!atkRoll.isNat1 && atkRoll.total >= targetAc);

        if (isHit) {
          const parsedDmg = parseDiceFormula(item.damage);
          let dmg = parsedDmg ? parsedDmg.total : 6;
          if (!item.autoHit && atkRoll.isNat20) dmg *= 2;

          targetToken.hp = Math.max(0, (targetToken.hp || 10) - dmg);

          io.to(currentRoomId).emit('combat:visual_effect', {
            fromX: actorToken.x,
            fromY: actorToken.y,
            toX: targetToken.x,
            toY: targetToken.y,
            text: `🔥 -${dmg} ${item.damageType || 'mágico'}`,
            color: '#A855F7',
            effectType: 'fire',
            isCrit: atkRoll.isNat20
          });

          addRoomMessage(currentRoomId, {
            sender: actorToken.name,
            senderType: 'player',
            type: 'roll',
            content: `🔮 **${actorToken.name}** lançou **${item.name}** contra **${targetToken.name}**! ${item.autoHit ? 'Acerto infalível!' : `Rolou **${atkRoll.total}** vs CA ${targetAc}!`} Causou **${dmg} de dano ${item.damageType || 'mágico'}**!`,
            rollData: {
              title: `Magia: ${item.name} → ${targetToken.name}`,
              total: dmg,
              isNat20: atkRoll.isNat20
            }
          });

          if (targetToken.hp <= 0 && targetToken.type === 'enemy') {
            handleEnemyDefeated(currentRoomId, targetToken, actorToken.name);
          } else {
            io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
          }
        } else {
          io.to(currentRoomId).emit('combat:visual_effect', {
            fromX: actorToken.x,
            fromY: actorToken.y,
            toX: targetToken.x,
            toY: targetToken.y,
            text: `💨 RESISTIU (${atkRoll.total} vs CA ${targetAc})`,
            color: '#9CA3AF',
            effectType: 'miss'
          });

          addRoomMessage(currentRoomId, {
            sender: actorToken.name,
            senderType: 'player',
            type: 'roll',
            content: `💨 **${actorToken.name}** lançou **${item.name}** em **${targetToken.name}**, mas rolou **${atkRoll.total}** vs CA ${targetAc} e o alvo resistiu!`,
            rollData: { title: `${item.name} (Falhou)`, total: atkRoll.total }
          });
        }
      }
    }

    scheduleSave();
  });

  // Character sheet updates
  socket.on('character:update', ({ character } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !character) return;
    const room = rooms[currentRoomId];
    const derived = calculateCharacterDerivedStats(character);
    character.ac = derived.ac;
    character.proficiencyBonus = derived.profBonus;

    if (room.players[socket.id]) {
      room.players[socket.id].character = character;
      const token = room.tokens.find(t => t.characterId === character.id);
      if (token) {
        token.name = character.name;
        token.hp = character.hp;
        token.maxHp = character.maxHp;
        token.ac = character.ac;
        token.avatar = character.avatar;
        token.color = character.color;
        token.stats = character.stats;
      }
      socket.emit('character:sync', character);
      io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
      io.to(currentRoomId).emit('room:players_updated', room.players);
      scheduleSave();
    }
  });

  // Token Movement
  socket.on('token:move', ({ tokenId, x, y } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !tokenId) return;
    const room = rooms[currentRoomId];
    const token = room.tokens.find(t => t.id === tokenId);
    if (token) {
      token.x = x;
      token.y = y;
      io.to(currentRoomId).emit('room:token_moved', { tokenId, x, y });
      if (token.type === 'player') {
        processRoomMMORPGAggro(currentRoomId, true);
      }
      scheduleSave();
    }
  });

  // Add Token (Monster or NPC)
  socket.on('token:add', (tokenData = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const newToken = {
      id: tokenData.id || `token_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: tokenData.name || 'Inimigo',
      type: tokenData.type || 'enemy',
      x: tokenData.x ?? 12,
      y: tokenData.y ?? 7,
      size: tokenData.size || 1,
      hp: tokenData.hp || 12,
      maxHp: tokenData.maxHp || 12,
      ac: tokenData.ac || 13,
      speed: tokenData.speed || 9,
      xp: tokenData.xp || 50,
      goldDrop: tokenData.goldDrop || 15,
      avatar: tokenData.avatar || '💀',
      color: tokenData.color || '#EF4444',
      conditions: [],
      actions: tokenData.actions || [{ name: 'Ataque', bonus: 4, damage: '1d6+2', range: 1.5, type: 'cortante' }],
      stats: tokenData.stats || { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 }
    };
    room.tokens.push(newToken);
    if (room.combat?.active) {
      room.combat.turnOrder.push(newToken.id);
      io.to(currentRoomId).emit('combat:updated', room.combat);
    }
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    scheduleSave();
  });

  // Update Token
  socket.on('token:update', (updatedToken = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !updatedToken?.id) return;
    const room = rooms[currentRoomId];
    const index = room.tokens.findIndex(t => t.id === updatedToken.id);
    if (index !== -1) {
      room.tokens[index] = { ...room.tokens[index], ...updatedToken };
      if (room.tokens[index].characterId) {
        Object.values(room.players).forEach(p => {
          if (p.character && p.character.id === room.tokens[index].characterId) {
            p.character.hp = room.tokens[index].hp;
          }
        });
      }
      if (room.tokens[index].type === 'enemy' && room.tokens[index].hp <= 0) {
        handleEnemyDefeated(currentRoomId, room.tokens[index], 'Grupo de Heróis');
        return;
      }
      io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
      io.to(currentRoomId).emit('room:players_updated', room.players);
      scheduleSave();
    }
  });

  socket.on('token:delete', ({ tokenId } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !tokenId) return;
    const room = rooms[currentRoomId];
    if (!isSocketDM(room, socket.id)) return;

    room.tokens = room.tokens.filter(t => t.id !== tokenId);
    if (room.combat?.active) {
      room.combat.turnOrder = room.combat.turnOrder.filter(id => id !== tokenId);
    }
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    io.to(currentRoomId).emit('combat:updated', room.combat);
    scheduleSave();
  });

  socket.on('map:change', (mapData = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (!isSocketDM(room, socket.id)) return;

    room.map = { ...room.map, ...mapData };
    room.fog = [];
    io.to(currentRoomId).emit('room:map_updated', room.map);
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  socket.on('fog:toggle_enabled', ({ enabled } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (!isSocketDM(room, socket.id)) return;

    room.fogEnabled = enabled !== undefined ? enabled : !room.fogEnabled;
    io.to(currentRoomId).emit('room:fog_enabled_updated', room.fogEnabled);
    scheduleSave();
  });

  socket.on('fog:reveal', ({ tiles } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !Array.isArray(tiles)) return;
    const room = rooms[currentRoomId];
    if (!isSocketDM(room, socket.id)) return;

    const currentSet = new Set(room.fog || []);
    tiles.forEach(t => currentSet.add(t));
    room.fog = Array.from(currentSet);
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  socket.on('fog:hide', ({ tiles } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !Array.isArray(tiles)) return;
    const room = rooms[currentRoomId];
    if (!isSocketDM(room, socket.id)) return;

    const currentSet = new Set(room.fog || []);
    tiles.forEach(t => currentSet.delete(t));
    room.fog = Array.from(currentSet);
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  // Combat Start
  socket.on('combat:start', ({ turnOrder } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];

    let order = turnOrder;
    if (!order || order.length === 0) {
      const scored = room.tokens.map(t => ({
        id: t.id,
        init: rollD20(getAbilityMod(t.stats?.dex || 12)).total
      }));
      scored.sort((a, b) => b.init - a.init);
      order = scored.map(s => s.id);
    }

    room.combat = {
      active: true,
      round: 1,
      currentTurnIndex: 0,
      turnOrder: order
    };
    io.to(currentRoomId).emit('combat:updated', room.combat);

    const firstToken = room.tokens.find(t => t.id === order[0]);
    addRoomMessage(currentRoomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: `⚔️ **COMBATE INICIADO!** Iniciativas roladas! Rodada 1 começa com **${firstToken?.name || 'o primeiro combatente'}**!`
    });

    if (firstToken && firstToken.type === 'enemy' && room.autoDM) {
      scheduleAutoDMTurn(currentRoomId, firstToken.id);
    }
    scheduleSave();
  });

  socket.on('combat:next', () => {
    if (!currentRoomId) return;
    advanceCombatTurn(currentRoomId);
  });

  socket.on('combat:end', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (aiTurnTimeouts[currentRoomId]) {
      clearTimeout(aiTurnTimeouts[currentRoomId]);
      delete aiTurnTimeouts[currentRoomId];
    }
    room.combat = { active: false, round: 1, currentTurnIndex: 0, turnOrder: [] };
    io.to(currentRoomId).emit('combat:updated', room.combat);
    addRoomMessage(currentRoomId, {
      sender: 'Sistema de Combate',
      senderType: 'system',
      content: '✨ O combate foi encerrado.'
    });
    scheduleSave();
  });

  // MMORPG Real-Time Aggro System (substitui o antigo combate por turnos)
  socket.on('combat:aggro_detected', ({ monsterId, actorTokenId } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const monster = room.tokens.find(t => t.id === monsterId && t.type === 'enemy');
    const hero = room.tokens.find(t => t.id === actorTokenId && t.type === 'player');
    if (monster && hero && getGridDistance(monster, hero) <= 2) {
      monster.aggroTargetId = hero.id;
    }
    processRoomMMORPGAggro(currentRoomId, true);
  });

  // Check Flee Condition: All living players > 18m from all living enemies
  socket.on('combat:check_flee', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (!room.combat?.active) return;

    const livingEnemies = room.tokens.filter(t => t.type === 'enemy' && (t.hp || 0) > 0);
    const livingPlayers = room.tokens.filter(t => t.type === 'player' && (t.hp || 0) > 0);

    if (livingEnemies.length === 0) {
      room.combat.active = false;
      io.to(currentRoomId).emit('combat:updated', room.combat);
      return;
    }

    if (livingPlayers.length === 0) return;

    let allFled = true;
    for (const player of livingPlayers) {
      for (const enemy of livingEnemies) {
        const dist = Math.max(Math.abs(player.x - enemy.x), Math.abs(player.y - enemy.y));
        if (dist < 12) { // 12 squares = 18m
          allFled = false;
          break;
        }
      }
      if (!allFled) break;
    }

    if (allFled) {
      if (aiTurnTimeouts[currentRoomId]) {
        clearTimeout(aiTurnTimeouts[currentRoomId]);
        delete aiTurnTimeouts[currentRoomId];
      }
      room.combat = { active: false, round: 1, currentTurnIndex: 0, turnOrder: [] };
      io.to(currentRoomId).emit('combat:updated', room.combat);

      addRoomMessage(currentRoomId, {
        sender: '🤖 Mestre Automático',
        senderType: 'dm',
        type: 'narration',
        content: `🏃💨 **FUGA COM SUCESSO!** O grupo recuou mais de 18 metros dos monstros e escapou! Retornando à exploração livre em tempo real.`
      });
      scheduleSave();
    }
  });

  socket.on('chat:send', (messageData = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    addRoomMessage(currentRoomId, messageData);
    scheduleSave();
  });

  socket.on('economy:buy', ({ itemId, item, cost } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const player = room.players[socket.id];
    if (player && player.character) {
      const char = player.character;
      const catalogItem = ITEMS[itemId] || item;
      if (!catalogItem) return;

      const validCost = catalogItem.cost || 0;
      if (validCost <= 0) return;
      if (cost !== undefined && cost !== validCost) return;

      if ((char.gold ?? 0) >= validCost) {
        char.gold -= validCost;
        if (!char.inventory) char.inventory = [];
        char.inventory.push(catalogItem);

        const derived = calculateCharacterDerivedStats(char);
        char.ac = derived.ac;
        if (catalogItem.hpBonus) {
          char.maxHp = (char.maxHp || 10) + catalogItem.hpBonus;
          char.hp = (char.hp || 10) + catalogItem.hpBonus;
        }

        const pTok = room.tokens.find(t => t.characterId === char.id);
        if (pTok) {
          pTok.ac = char.ac;
          pTok.maxHp = char.maxHp;
          pTok.hp = char.hp;
        }

        socket.emit('character:sync', char);
        io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
        io.to(currentRoomId).emit('room:players_updated', room.players);

        addRoomMessage(currentRoomId, {
          sender: 'Mercador',
          senderType: 'system',
          content: `💰 **${char.name}** comprou **${catalogItem.name}** por ${validCost} PO.`
        });
        scheduleSave();
      } else {
        socket.emit('combat:action_error', { message: 'Ouro insuficiente para comprar este item!' });
      }
    }
  });

  socket.on('economy:sell', ({ itemIndex, sellPrice } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const player = room.players[socket.id];
    if (player && player.character && Array.isArray(player.character.inventory)) {
      const char = player.character;
      if (typeof itemIndex !== 'number' || itemIndex < 0 || itemIndex >= char.inventory.length) return;
      const soldItem = char.inventory[itemIndex];
      if (soldItem) {
        char.inventory.splice(itemIndex, 1);
        const validPrice = typeof sellPrice === 'number' && sellPrice > 0 ? sellPrice : Math.max(1, Math.floor((soldItem.cost || 10) / 2));
        char.gold = (char.gold || 0) + validPrice;

        if (soldItem.hpBonus) {
          char.maxHp = Math.max(1, (char.maxHp || 10) - soldItem.hpBonus);
          char.hp = Math.min(char.hp, char.maxHp);
        }

        const derived = calculateCharacterDerivedStats(char);
        char.ac = derived.ac;

        const pTok = room.tokens.find(t => t.characterId === char.id);
        if (pTok) {
          pTok.ac = char.ac;
          pTok.maxHp = char.maxHp;
          pTok.hp = char.hp;
        }

        socket.emit('character:sync', char);
        io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
        io.to(currentRoomId).emit('room:players_updated', room.players);

        addRoomMessage(currentRoomId, {
          sender: 'Mercador',
          senderType: 'system',
          content: `🪙 **${char.name}** vendeu **${soldItem.name}** e recebeu ${validPrice} PO.`
        });
        scheduleSave();
      }
    }
  });

  socket.on('economy:grant_loot', ({ targetCharacterId, gold, itemName } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (!isSocketDM(room, socket.id)) return;

    Object.values(room.players).forEach(p => {
      if (p.character && (!targetCharacterId || p.character.id === targetCharacterId)) {
        if (gold) p.character.gold = (p.character.gold || 0) + gold;
        if (itemName) {
          if (!p.character.inventory) p.character.inventory = [];
          p.character.inventory.push({ id: `loot_${Date.now()}`, name: itemName, type: 'gear', cost: 20 });
        }
      }
    });

    io.to(currentRoomId).emit('room:players_updated', room.players);
    addRoomMessage(currentRoomId, {
      sender: 'Mestre da Mesa',
      senderType: 'dm',
      content: `🎁 Recompensa concedida: ${gold ? `+${gold} PO ` : ''}${itemName ? `Item: ${itemName}` : ''}!`
    });
    scheduleSave();
  });

  socket.on('map:ping', ({ x, y, color } = {}) => {
    if (!currentRoomId) return;
    io.to(currentRoomId).emit('map:ping_received', { x, y, color, senderId: socket.id });
  });

  // Tibia Style: Loot Corpse on the Ground
  socket.on('corpse:loot', ({ corpseId } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !corpseId) return;
    const room = rooms[currentRoomId];
    if (!room.corpses) room.corpses = [];

    const corpse = room.corpses.find(c => c.id === corpseId);
    if (!corpse || corpse.opened) return;

    const player = room.players[socket.id];
    const char = player?.character;
    if (!char) return;

    const goldLoot = corpse.gold || 0;
    const itemsLoot = corpse.items || [];

    char.gold = (char.gold || 0) + goldLoot;
    if (!char.inventory) char.inventory = [];
    itemsLoot.forEach(item => {
      char.inventory.push(item);
    });

    corpse.opened = true;
    corpse.gold = 0;
    corpse.items = [];

    socket.emit('character:sync', char);
    io.to(currentRoomId).emit('room:corpses_updated', room.corpses);
    io.to(currentRoomId).emit('room:players_updated', room.players);

    io.to(currentRoomId).emit('combat:visual_effect', {
      fromX: corpse.x,
      fromY: corpse.y,
      toX: corpse.x,
      toY: corpse.y,
      text: `💰 +${goldLoot} PO ${itemsLoot.length > 0 ? `& ${itemsLoot.map(i => i.name).join(', ')}` : ''}!`,
      color: '#F59E0B',
      effectType: 'heal'
    });

    addRoomMessage(currentRoomId, {
      sender: 'Loot',
      senderType: 'system',
      type: 'narration',
      content: `🎒 **${char.name}** saqueou o **${corpse.name}**: +${goldLoot} PO${itemsLoot.length > 0 ? `, itens: ${itemsLoot.map(i => i.name).join(', ')}` : ''}!`
    });
    scheduleSave();
  });

  // Tibia Style: Exori AoE Strike around hero
  socket.on('tibia:exori', ({ actorTokenId } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const actor = room.tokens.find(t => t.id === actorTokenId);
    if (!actor) return;

    const player = room.players[socket.id];
    const char = player?.character;
    const strMod = getAbilityMod(char?.stats?.str || 14);

    const adjacentEnemies = room.tokens.filter(t => 
      t.type === 'enemy' && 
      (t.hp || 0) > 0 &&
      Math.max(Math.abs(t.x - actor.x), Math.abs(t.y - actor.y)) <= 1
    );

    if (adjacentEnemies.length === 0) {
      socket.emit('combat:action_error', { message: 'Nenhum inimigo ao seu redor para atingir com Exori!' });
      return;
    }

    io.to(currentRoomId).emit('combat:visual_effect', {
      fromX: actor.x,
      fromY: actor.y,
      toX: actor.x,
      toY: actor.y,
      text: '⚔️ EXORI!',
      color: '#F59E0B',
      effectType: 'slash'
    });

    adjacentEnemies.forEach(enemy => {
      const dmg = rollDie(8) + strMod + 2;
      enemy.hp = Math.max(0, (enemy.hp || 10) - dmg);

      io.to(currentRoomId).emit('combat:visual_effect', {
        fromX: actor.x,
        fromY: actor.y,
        toX: enemy.x,
        toY: enemy.y,
        text: `💥 -${dmg} FÍSICO`,
        color: '#EF4444',
        effectType: 'slash'
      });

      if (enemy.hp <= 0) {
        handleEnemyDefeated(currentRoomId, enemy, actor.name);
      }
    });

    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    addRoomMessage(currentRoomId, {
      sender: actor.name,
      senderType: 'player',
      type: 'chat',
      content: `⚔️ **${actor.name}** bradou ***EXORI!*** girando a espada e atingindo **${adjacentEnemies.length}** inimigos ao redor!`
    });
    scheduleSave();
  });

  // Tibia Style: Respawn Monsters in Map
  socket.on('room:respawn_monsters', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const livingEnemies = room.tokens.filter(t => t.type === 'enemy' && (t.hp || 0) > 0);
    if (livingEnemies.length >= 8) return;

    const monsterKeys = Object.keys(MONSTERS);
    const count = 3;
    for (let i = 0; i < count; i++) {
      const mKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
      const rx = 10 + Math.floor(Math.random() * 8);
      const ry = 4 + Math.floor(Math.random() * 8);
      const monTok = createMonsterToken(mKey, rx, ry);
      room.tokens.push(monTok);
    }

    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    addRoomMessage(currentRoomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: `🐺 **RESPAWN!** Novos monstros surgiram nas profundezas da masmorra!`
    });
    scheduleSave();
  });

  // Advance to Next Land through Portal
  socket.on('land:advance', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    if (!room.bossDefeated) {
      socket.emit('combat:action_error', { message: 'O Portal está selado! O Boss desta Land precisa ser derrotado primeiro.' });
      return;
    }

    const currentIndex = STORY_CAMPAIGN.lands.findIndex(l => l.id === room.currentLandId);
    if (currentIndex >= 0 && currentIndex < STORY_CAMPAIGN.lands.length - 1) {
      const nextLand = STORY_CAMPAIGN.lands[currentIndex + 1];
      loadLandIntoRoom(room, nextLand.id);

      io.to(currentRoomId).emit('room:land_advanced', {
        landId: nextLand.id,
        landName: nextLand.name,
        portalPosition: room.portalPosition,
        portalName: room.portalName,
        relics: room.collectedRelics || [],
        land: nextLand,
        room
      });
      io.to(currentRoomId).emit('room:map_updated', room.map);
      io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
      io.to(currentRoomId).emit('room:chests_updated', room.chests);
      io.to(currentRoomId).emit('room:gatherables_updated', room.gatherables);
      io.to(currentRoomId).emit('room:players_updated', room.players);
      io.to(currentRoomId).emit('combat:updated', room.combat);
      scheduleSave();
    } else {
      // Land 4 Concluída: Vitória Final da Campanha!
      addRoomMessage(currentRoomId, {
        sender: '👑 O Destino de Eldoria',
        senderType: 'dm',
        type: 'narration',
        content: `🌟 **VITÓRIA ABSOLUTA DA CAMPANHA!**\nAs Quatro Relíquias de Eldoria foram reunidas! A Coroa da Luz foi restaurada e a escuridão foi expurgada de todo o continente! Parabéns a todos os bravos heróis que lutaram até o fim!`
      });
      io.to(currentRoomId).emit('campaign:victory');
    }
  });

  // Collect Resource from Map (Herb, Mushroom, Crystal)
  socket.on('gatherable:collect', ({ id } = {}) => {
    if (!currentRoomId || !rooms[currentRoomId] || !id) return;
    const room = rooms[currentRoomId];
    if (!room.gatherables) return;

    const res = room.gatherables.find(g => g.id === id && !g.gathered);
    if (!res) return;

    res.gathered = true;
    const player = room.players[socket.id];
    const char = player?.character;
    if (char) {
      const goldAmt = Math.floor(Math.random() * 15) + 10;
      char.gold = (char.gold || 0) + goldAmt;
      char.hp = Math.min(char.maxHp, (char.hp || 10) + 6);
      if (!char.inventory) char.inventory = [];
      char.inventory.push({
        id: `res_${Date.now()}`,
        name: res.name,
        type: 'consumable',
        desc: `Recurso natural de Eldoria: ${res.name}`,
        heal: '1d6+2',
        cost: 20
      });
      socket.emit('character:sync', char);
      io.to(currentRoomId).emit('room:players_updated', room.players);
    }

    io.to(currentRoomId).emit('room:gatherables_updated', room.gatherables);
    io.to(currentRoomId).emit('combat:visual_effect', {
      fromX: res.x,
      fromY: res.y,
      toX: res.x,
      toY: res.y,
      text: `🌿 +${res.name}! (+6 PV & +10 PO)`,
      color: '#10B981',
      effectType: 'heal'
    });

    addRoomMessage(currentRoomId, {
      sender: 'Exploração',
      senderType: 'system',
      content: `🌿 **${char ? char.name : 'Um herói'}** coletou **${res.name}** (+6 PV e +10 PO)!`
    });
    scheduleSave();
  });

  socket.on('disconnect', () => {
    if (currentRoomId && rooms[currentRoomId] && rooms[currentRoomId].players[socket.id]) {
      rooms[currentRoomId].players[socket.id].online = false;
      io.to(currentRoomId).emit('room:players_updated', rooms[currentRoomId].players);
      scheduleSave();
    }
  });
});

if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export { app, server, io, rooms, createInitialRoom, loadLandIntoRoom, processRoomMMORPGAggro };

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🏰 REINOS & MASMORRAS - D&D 5E ONLINE (V2.0)`);
    console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🤖 Mestre Automático e Combate Tático Ativos!`);
    console.log(`🗡️ Modo Tibia Ativo: WASD, Auto-Ataque, Hotkeys 1-5 e Cadáveres!`);
    console.log(`===============================================`);
  });
}
