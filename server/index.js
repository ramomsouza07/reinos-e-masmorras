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
  getAbilityMod, 
  formatMod,
  LEVEL_XP_TABLE,
  calculateCharacterDerivedStats
} from '../src/data/dndData.js';
import { rollD20, parseDiceFormula, rollDie } from '../src/utils/dice.js';

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
const DATA_DIR = path.join(__dirname, '../data');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let rooms = {};
const aiTurnTimeouts = {};

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

// Create initial room populated with Adventure Act 1 so there are immediately enemies & chests!
function createInitialRoom(roomId, roomName, dmPass) {
  const initialAdventure = ADVENTURES[0];
  const mapPreset = MAP_PRESETS.find(m => m.id === initialAdventure.mapId) || MAP_PRESETS[0];

  const initialEnemies = initialAdventure.enemies.map(e => 
    createMonsterToken(e.monsterId, e.x, e.y, e.name)
  );

  return {
    id: roomId,
    name: roomName || `Aventura ${roomId}`,
    dmPass: dmPass || 'mestre123',
    createdAt: new Date().toISOString(),
    autoDM: true, // Mestre Automático ativado por padrão!
    fogEnabled: false, // Sem escuridão bloqueando visão por padrão!
    currentAdventureId: initialAdventure.id,
    map: {
      ...mapPreset,
      gridSize: 52
    },
    fog: [],
    tokens: initialEnemies,
    chests: JSON.parse(JSON.stringify(initialAdventure.chests || [])),
    combat: {
      active: false,
      round: 1,
      currentTurnIndex: 0,
      turnOrder: []
    },
    chatHistory: [
      {
        id: 'msg_init_1',
        sender: '🤖 Mestre Automático',
        senderType: 'dm',
        type: 'narration',
        content: initialAdventure.narration,
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
}

// Load saved rooms and upgrade any empty ones
try {
  if (fs.existsSync(ROOMS_FILE)) {
    const raw = fs.readFileSync(ROOMS_FILE, 'utf-8');
    rooms = JSON.parse(raw);
    Object.values(rooms).forEach(r => {
      if (r.autoDM === undefined) r.autoDM = true;
      if (r.fogEnabled === undefined) r.fogEnabled = false;
      if (!r.chests) r.chests = JSON.parse(JSON.stringify(ADVENTURES[0].chests));
      // Ensure map has obstacles & floorColor from preset
      const preset = MAP_PRESETS.find(m => m.id === r.map?.id) || MAP_PRESETS[0];
      r.map = { ...preset, ...r.map, obstacles: preset.obstacles, torches: preset.torches, floorColor: preset.floorColor };
      // If room has 0 enemies, spawn initial adventure enemies so player has enemies to fight
      const hasEnemies = (r.tokens || []).some(t => t.type === 'enemy');
      if (!hasEnemies) {
        const defaultEnemies = ADVENTURES[0].enemies.map(e => createMonsterToken(e.monsterId, e.x, e.y, e.name));
        r.tokens = [...(r.tokens || []), ...defaultEnemies];
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
    sender: msgData.sender || 'Sistema',
    senderType: msgData.senderType || 'system',
    type: msgData.type || 'chat',
    content: msgData.content || '',
    rollData: msgData.rollData || null,
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

    // Advance to next turn after 1.1s
    aiTurnTimeouts[roomId] = setTimeout(() => {
      advanceCombatTurn(roomId);
    }, 1100);
  }, 1100);
}

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), roomsCount: Object.keys(rooms).length });
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

  socket.on('room:join', ({ roomId, playerName, role, dmPass, character }) => {
    if (!roomId) return;
    const cleanRoomId = roomId.trim().toUpperCase();
    currentRoomId = cleanRoomId;

    if (!rooms[cleanRoomId]) {
      rooms[cleanRoomId] = createInitialRoom(cleanRoomId, `Sala ${cleanRoomId}`, dmPass);
    }

    const room = rooms[cleanRoomId];
    const isDM = role === 'dm' && (!room.dmPass || room.dmPass === dmPass || dmPass === 'mestre123');

    // Ensure every player has a valid character!
    let activeChar = character;
    if (!isDM && !activeChar) {
      activeChar = createDefaultHero(playerName);
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

      let existingToken = room.tokens.find(t => t.characterId === activeChar.id);
      if (!existingToken) {
        const playerTokensCount = room.tokens.filter(t => t.type === 'player').length;
        const spawnPositions = [
          { x: 3, y: 7 }, { x: 3, y: 5 }, { x: 3, y: 9 },
          { x: 2, y: 6 }, { x: 2, y: 8 }, { x: 4, y: 7 }
        ];
        const pos = spawnPositions[playerTokensCount % spawnPositions.length];

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
        existingToken.stats = activeChar.stats;
      }
    }

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
  });

  // Toggle Auto-DM
  socket.on('autodm:toggle', ({ enabled }) => {
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

    // If currently on an enemy turn in combat and autoDM was just enabled, trigger it!
    if (room.autoDM && room.combat?.active) {
      const activeTokId = room.combat.turnOrder[room.combat.currentTurnIndex];
      const activeTok = room.tokens.find(t => t.id === activeTokId);
      if (activeTok && activeTok.type === 'enemy') {
        scheduleAutoDMTurn(currentRoomId, activeTok.id);
      }
    }
    scheduleSave();
  });

  // Load Adventure Act / Campaign Mission
  socket.on('adventure:load', ({ adventureId }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const adv = ADVENTURES.find(a => a.id === adventureId) || ADVENTURES[0];
    const mapPreset = MAP_PRESETS.find(m => m.id === adv.mapId) || MAP_PRESETS[0];

    // Keep player tokens and reset their positions to left side entrance
    const playerTokens = room.tokens.filter(t => t.type === 'player');
    const spawnCoords = [
      { x: 3, y: 7 }, { x: 3, y: 5 }, { x: 3, y: 9 },
      { x: 2, y: 6 }, { x: 2, y: 8 }, { x: 4, y: 7 }
    ];
    playerTokens.forEach((pt, idx) => {
      const c = spawnCoords[idx % spawnCoords.length];
      pt.x = c.x;
      pt.y = c.y;
    });

    const newEnemies = adv.enemies.map(e => createMonsterToken(e.monsterId, e.x, e.y, e.name));

    room.currentAdventureId = adv.id;
    room.map = { ...mapPreset, gridSize: 52 };
    room.tokens = [...playerTokens, ...newEnemies];
    room.chests = JSON.parse(JSON.stringify(adv.chests || []));
    room.combat = { active: false, round: 1, currentTurnIndex: 0, turnOrder: [] };
    room.fogEnabled = false;
    room.fog = [];

    io.to(currentRoomId).emit('room:map_updated', room.map);
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    io.to(currentRoomId).emit('room:chests_updated', room.chests);
    io.to(currentRoomId).emit('combat:updated', room.combat);

    addRoomMessage(currentRoomId, {
      sender: '🤖 Mestre Automático',
      senderType: 'dm',
      type: 'narration',
      content: adv.narration
    });

    scheduleSave();
  });

  // Generate Random Encounter on current map
  socket.on('adventure:random_encounter', ({ difficulty = 'medium' }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];

    // Remove existing enemies
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

  // Open Treasure Chest on Map
  socket.on('chest:open', ({ chestId }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const chest = (room.chests || []).find(c => c.id === chestId && !c.opened);
    if (!chest) return;

    chest.opened = true;
    const goldAmount = chest.gold || 50;
    const lootItem = ITEMS[chest.itemId] || ITEMS.pocao_cura;

    const openerPlayer = room.players[socket.id];
    const openerName = openerPlayer?.character?.name || openerPlayer?.name || 'Um herói';

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

  // Execute Direct Combat Action (Attack / Spell / Heal on Target Token)
  socket.on('combat:execute_action', ({ actorTokenId, targetTokenId, actionType, item, advantageType = 'normal' }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];

    const actorToken = room.tokens.find(t => t.id === actorTokenId);
    const targetToken = room.tokens.find(t => t.id === targetTokenId) || actorToken;
    if (!actorToken || !targetToken) return;

    const playerObj = room.players[socket.id];
    const char = playerObj?.character;
    const stats = char?.stats || actorToken.stats || { str: 14, dex: 12, con: 14, int: 12, wis: 12, cha: 12 };
    const profBonus = char?.proficiencyBonus || 2;

    // 1. WEAPON ATTACK
    if (actionType === 'weapon' && item) {
      const distSquares = getGridDistance(actorToken, targetToken);
      const distMeters = distSquares * 1.5;
      const maxRange = item.range || (item.properties?.some(p => p.includes('Munição') || p.includes('Arremesso')) ? 18 : 1.5);

      // Allow slight diagonal tolerance (1 square = 1.5m)
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
        // Rogue Sneak Attack bonus!
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
    else if (actionType === 'spell' && item) {
      if (item.heal) {
        const parsedHeal = parseDiceFormula(item.heal);
        const healAmt = Math.max(2, (parsedHeal?.total || 5) + getAbilityMod(stats.wis || stats.int || 12));
        targetToken.hp = Math.min(targetToken.maxHp || 20, (targetToken.hp || 0) + healAmt);

        // Sync if target is player
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

  // Character sheet updates (including spending Attribute Points!)
  socket.on('character:update', ({ character }) => {
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
  socket.on('token:move', ({ tokenId, x, y }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const token = room.tokens.find(t => t.id === tokenId);
    if (token) {
      token.x = x;
      token.y = y;
      io.to(currentRoomId).emit('room:token_moved', { tokenId, x, y });
      scheduleSave();
    }
  });

  // Add Token (Monster or NPC)
  socket.on('token:add', (tokenData) => {
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
  socket.on('token:update', (updatedToken) => {
    if (!currentRoomId || !rooms[currentRoomId] || !updatedToken) return;
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

  socket.on('token:delete', ({ tokenId }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.tokens = room.tokens.filter(t => t.id !== tokenId);
    if (room.combat?.active) {
      room.combat.turnOrder = room.combat.turnOrder.filter(id => id !== tokenId);
    }
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    io.to(currentRoomId).emit('combat:updated', room.combat);
    scheduleSave();
  });

  socket.on('map:change', (mapData) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.map = { ...room.map, ...mapData };
    room.fog = [];
    io.to(currentRoomId).emit('room:map_updated', room.map);
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  socket.on('fog:toggle_enabled', ({ enabled }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.fogEnabled = enabled !== undefined ? enabled : !room.fogEnabled;
    io.to(currentRoomId).emit('room:fog_enabled_updated', room.fogEnabled);
    scheduleSave();
  });

  socket.on('fog:reveal', ({ tiles }) => {
    if (!currentRoomId || !rooms[currentRoomId] || !Array.isArray(tiles)) return;
    const room = rooms[currentRoomId];
    const currentSet = new Set(room.fog || []);
    tiles.forEach(t => currentSet.add(t));
    room.fog = Array.from(currentSet);
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  socket.on('fog:hide', ({ tiles }) => {
    if (!currentRoomId || !rooms[currentRoomId] || !Array.isArray(tiles)) return;
    const room = rooms[currentRoomId];
    const currentSet = new Set(room.fog || []);
    tiles.forEach(t => currentSet.delete(t));
    room.fog = Array.from(currentSet);
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  // Combat Start
  socket.on('combat:start', ({ turnOrder }) => {
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

  socket.on('chat:send', (messageData) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    addRoomMessage(currentRoomId, messageData);
    scheduleSave();
  });

  socket.on('economy:buy', ({ itemId, item, cost }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const player = room.players[socket.id];
    if (player && player.character) {
      const char = player.character;
      if ((char.gold ?? 0) >= cost) {
        char.gold -= cost;
        if (!char.inventory) char.inventory = [];
        char.inventory.push(item);

        const derived = calculateCharacterDerivedStats(char);
        char.ac = derived.ac;
        if (item.hpBonus) {
          char.maxHp += item.hpBonus;
          char.hp += item.hpBonus;
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
          content: `💰 **${char.name}** comprou **${item.name}** por ${cost} PO.`
        });
        scheduleSave();
      }
    }
  });

  socket.on('economy:sell', ({ itemIndex, sellPrice }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const player = room.players[socket.id];
    if (player && player.character && player.character.inventory) {
      const char = player.character;
      const soldItem = char.inventory[itemIndex];
      if (soldItem) {
        char.inventory.splice(itemIndex, 1);
        char.gold = (char.gold || 0) + sellPrice;
        const derived = calculateCharacterDerivedStats(char);
        char.ac = derived.ac;

        const pTok = room.tokens.find(t => t.characterId === char.id);
        if (pTok) pTok.ac = char.ac;

        socket.emit('character:sync', char);
        io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
        io.to(currentRoomId).emit('room:players_updated', room.players);

        addRoomMessage(currentRoomId, {
          sender: 'Mercador',
          senderType: 'system',
          content: `🪙 **${char.name}** vendeu **${soldItem.name}** e recebeu ${sellPrice} PO.`
        });
        scheduleSave();
      }
    }
  });

  socket.on('economy:grant_loot', ({ targetCharacterId, gold, itemName }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
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

  socket.on('map:ping', ({ x, y, color }) => {
    if (!currentRoomId) return;
    io.to(currentRoomId).emit('map:ping_received', { x, y, color, senderId: socket.id });
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🏰 REINOS & MASMORRAS - D&D 5E ONLINE (V2.0)`);
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🤖 Mestre Automático e Combate Tático Ativos!`);
  console.log(`===============================================`);
});
