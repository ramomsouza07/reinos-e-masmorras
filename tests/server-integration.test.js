import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { io as ioClient } from 'socket.io-client';

// Configure test environment
process.env.NODE_ENV = 'test';
const testRoomsFile = path.join(os.tmpdir(), `test_rooms_${Date.now()}_${Math.random().toString(36).substring(2)}.json`);
process.env.ROOMS_FILE = testRoomsFile;

const { server, io, rooms, processRoomMMORPGAggro } = await import('../server/index.js');
const { ITEMS } = await import('../src/data/dndData.js');

let serverPort = null;
let serverUrl = null;
const activeClients = [];

function waitForEvent(socket, eventName, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout aguardando evento "${eventName}"`));
    }, timeoutMs);
    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function createClientSocket() {
  const s = ioClient(serverUrl, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
  });
  activeClients.push(s);
  return s;
}

test.before(async () => {
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      serverUrl = `http://127.0.0.1:${serverPort}`;
      resolve();
    });
  });
});

test.after(async () => {
  activeClients.forEach(c => {
    try { c.disconnect(); } catch (e) {}
  });
  await new Promise((resolve) => {
    io.close(() => {
      server.close(() => resolve());
    });
  });
  if (fs.existsSync(testRoomsFile)) {
    try { fs.unlinkSync(testRoomsFile); } catch (e) {}
  }
});

// ============================================================================
// SUITE 1: HTTP API ENDPOINTS
// ============================================================================
test('HTTP-01: GET /api/health retorna status ok e métricas de uptime', async () => {
  const res = await fetch(`${serverUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.ok(data.time);
  assert.ok(typeof data.uptime === 'number');
  assert.ok(typeof data.roomsCount === 'number');
});

test('HTTP-02: GET /api/rooms lista salas ativas com dados higienizados', async () => {
  const res = await fetch(`${serverUrl}/api/rooms`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(Array.isArray(data), true);
});

// ============================================================================
// SUITE 2: ROOM MANAGEMENT & CAMPAIGN INITIALIZATION
// ============================================================================
test('ROOM-01: room:join inicializa a sala com Land 1 (Floresta), mapa 2D próprio e Boss Arachna', async () => {
  const client = createClientSocket();
  const testRoomId = `test_room_${Date.now()}`;

  const statePromise = waitForEvent(client, 'room:state');
  client.emit('room:join', {
    roomId: testRoomId,
    role: 'player',
    playerName: 'Guerreiro Teste'
  });

  const roomData = await statePromise;
  assert.equal(roomData.id, testRoomId.toUpperCase());
  assert.equal(roomData.currentLandId, 'land_forest');
  assert.equal(roomData.map.theme, 'forest');
  assert.equal(roomData.map.bgImage, undefined);
  assert.equal(roomData.map.cols, 46);
  assert.equal(roomData.map.rows, 32);
  assert.equal(roomData.bossDefeated, false);
  assert.ok(roomData.portalPosition);
  assert.ok(roomData.tokens.length > 0);

  // Verifica presença de NPCs
  const npcs = roomData.tokens.filter(t => t.type === 'npc');
  assert.ok(npcs.length >= 2, 'Floresta deve possuir ao menos 2 NPCs');

  // Verifica presença do Boss Queen Arachna
  const boss = roomData.tokens.find(t => t.isBoss);
  assert.ok(boss, 'Deve existir um Boss na sala');
  assert.equal(boss.monsterId, 'arachna_queen');

  // Verifica presença do jogador
  const playerToken = roomData.tokens.find(t => t.type === 'player');
  assert.ok(playerToken, 'Deve existir um token de jogador criado');

  client.disconnect();
});

test('ROOM-02: Entrada malformada em room:join não causa crash no servidor', async () => {
  const client = createClientSocket();
  
  client.emit('room:join', null);
  client.emit('room:join', {});
  client.emit('room:join', { roomId: '' });

  await new Promise(r => setTimeout(r, 100));
  const healthRes = await fetch(`${serverUrl}/api/health`);
  assert.equal(healthRes.status, 200);

  client.disconnect();
});

// ============================================================================
// SUITE 3: TOKEN MOVEMENT & GATHERABLES EXPLORATION
// ============================================================================
test('EXPLORE-01: token:move propaga evento room:token_moved com novas coordenadas', async () => {
  const client = createClientSocket();
  const testRoomId = `test_move_${Date.now()}`;

  const roomData = await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Explorador' });
  });

  const playerToken = roomData.tokens.find(t => t.type === 'player');
  assert.ok(playerToken);

  const movePromise = waitForEvent(client, 'room:token_moved');
  client.emit('token:move', { tokenId: playerToken.id, x: 24, y: 16 });

  const moveData = await movePromise;
  assert.equal(moveData.tokenId, playerToken.id);
  assert.equal(moveData.x, 24);
  assert.equal(moveData.y, 16);

  client.disconnect();
});

test('EXPLORE-02: gatherable:collect coleta recurso e adiciona ao inventário do herói', async () => {
  const client = createClientSocket();
  const testRoomId = `test_gather_${Date.now()}`;

  const roomData = await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Herbalista' });
  });

  const gatherable = (roomData.gatherables || [])[0];
  assert.ok(gatherable, 'Deve haver ao menos 1 recurso coletável na Floresta');

  const gatherablesPromise = waitForEvent(client, 'room:gatherables_updated');
  client.emit('gatherable:collect', { id: gatherable.id });

  const updatedGatherables = await gatherablesPromise;
  const collectedItem = updatedGatherables.find(g => g.id === gatherable.id);
  assert.equal(collectedItem.gathered, true);

  // Verifica que o item entrou no inventário do personagem no servidor
  const cleanId = testRoomId.toUpperCase();
  const liveChar = rooms[cleanId].players[client.id].character;
  assert.ok(liveChar.inventory.some(it => it.name === gatherable.name));

  client.disconnect();
});

// ============================================================================
// SUITE 4: CHESTS & TRAP RESOLUTION
// ============================================================================
test('EXPLORE-03: chest:open abre baú e distribui recompensa', async () => {
  const client = createClientSocket();
  const testRoomId = `test_chest_${Date.now()}`;

  const roomData = await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Ladrão' });
  });

  const chest = (roomData.chests || [])[0];
  assert.ok(chest, 'Deve existir ao menos 1 baú');

  const chestPromise = waitForEvent(client, 'room:chests_updated');
  client.emit('chest:open', { chestId: chest.id });

  const updatedChests = await chestPromise;
  const openedChest = updatedChests.find(c => c.id === chest.id);
  assert.ok(openedChest);
  assert.equal(openedChest.opened, true);

  client.disconnect();
});

// ============================================================================
// SUITE 5: ECONOMY SYSTEM (NPC BUY & SELL)
// ============================================================================
test('ECON-01: economy:buy permite compra se o jogador tiver ouro suficiente', async () => {
  const client = createClientSocket();
  const testRoomId = `test_econ_buy_${Date.now()}`;

  await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Mercador' });
  });

  const potionItem = ITEMS.pocao_cura;
  assert.ok(potionItem);

  const buyPromise = waitForEvent(client, 'character:sync');
  client.emit('economy:buy', { itemId: potionItem.id, item: potionItem, cost: potionItem.cost });

  const updatedChar = await buyPromise;
  assert.ok(updatedChar.gold >= 0);
  assert.ok(updatedChar.inventory.some(it => it.id === potionItem.id));

  client.disconnect();
});

test('ECON-02: economy:buy rejeita compra caso o ouro seja insuficiente', async () => {
  const client = createClientSocket();
  const testRoomId = `test_econ_poor_${Date.now()}`;

  await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Pobre' });
  });

  const cleanId = testRoomId.toUpperCase();
  rooms[cleanId].players[client.id].character.gold = 5;

  const errPromise = waitForEvent(client, 'combat:action_error');
  client.emit('economy:buy', { itemId: 'pocao_cura', cost: ITEMS.pocao_cura.cost });

  const errMsg = await errPromise;
  assert.ok(errMsg.message.includes('Ouro insuficiente'));

  client.disconnect();
});

test('ECON-03: economy:sell remove item do inventário e adiciona ouro', async () => {
  const client = createClientSocket();
  const testRoomId = `test_econ_sell_${Date.now()}`;

  await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Vendedor' });
  });

  const cleanId = testRoomId.toUpperCase();
  const liveChar = rooms[cleanId].players[client.id].character;
  const initialGold = liveChar.gold;
  const initialCount = liveChar.inventory.length;

  const sellPromise = waitForEvent(client, 'character:sync');
  client.emit('economy:sell', { itemIndex: 0, sellPrice: 25 });

  const updatedChar = await sellPromise;
  assert.equal(updatedChar.gold, initialGold + 25);
  assert.equal(updatedChar.inventory.length, initialCount - 1);

  client.disconnect();
});

// ============================================================================
// SUITE 6: COMBAT, BOSS DEFEAT & PORTAL ACTIVATION
// ============================================================================
test('COMBAT-01: combat:execute_action reduz vida do alvo e emite efeito visual', async () => {
  const client = createClientSocket();
  const testRoomId = `test_combat_${Date.now()}`;

  const roomData = await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Lutador' });
  });

  const cleanId = testRoomId.toUpperCase();
  const liveRoom = rooms[cleanId];
  const playerTok = liveRoom.tokens.find(t => t.type === 'player');
  const enemy = liveRoom.tokens.find(t => t.type === 'enemy' && !t.isBoss);
  assert.ok(enemy);

  // Posiciona herói adjacente ao inimigo e garante acerto (CA 1)
  enemy.x = playerTok.x + 1;
  enemy.y = playerTok.y;
  enemy.ac = 1;
  const initialHp = enemy.hp;

  const updatePromise = waitForEvent(client, 'room:tokens_updated');
  client.emit('combat:execute_action', {
    actorTokenId: playerTok.id,
    targetTokenId: enemy.id,
    actionType: 'weapon',
    advantageType: 'advantage',
    item: { name: 'Espada Longa', damage: '2d8+5', range: 1.5, damageType: 'cortante' }
  });

  await updatePromise;
  assert.ok(enemy.hp < initialHp);

  client.disconnect();
});

test('COMBAT-02: Derrotar o Boss ativa room:boss_defeated, concede Relíquia e destrava o Portal', async () => {
  const client = createClientSocket();
  const testRoomId = `test_boss_defeat_${Date.now()}`;

  await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'MataChefes' });
  });

  const cleanId = testRoomId.toUpperCase();
  const liveRoom = rooms[cleanId];
  const playerTok = liveRoom.tokens.find(t => t.type === 'player');
  const boss = liveRoom.tokens.find(t => t.isBoss);
  assert.ok(boss);

  // Posiciona jogador ao lado do Boss e reduz HP/CA para golpe letal determinístico
  playerTok.x = boss.x - 1;
  playerTok.y = boss.y;
  boss.ac = 1;
  boss.hp = 5;

  const bossDefeatedPromise = waitForEvent(client, 'room:boss_defeated');

  client.emit('combat:execute_action', {
    actorTokenId: playerTok.id,
    targetTokenId: boss.id,
    actionType: 'weapon',
    advantageType: 'advantage',
    item: { name: 'Lâmina Lendária', damage: '10d10+50', range: 1.5, damageType: 'radiante' }
  });

  const defeatEvent = await bossDefeatedPromise;
  assert.ok(defeatEvent);
  assert.equal(defeatEvent.bossName, boss.name);
  assert.ok(defeatEvent.relic);

  assert.equal(liveRoom.bossDefeated, true);
  assert.ok(liveRoom.collectedRelics.includes(defeatEvent.relic.id));

  client.disconnect();
});

// ============================================================================
// SUITE 7: LAND PROGRESSION (A LENDA DAS QUATRO RELÍQUIAS)
// ============================================================================
test('LAND-01: land:advance é bloqueado se o Boss ainda estiver vivo', async () => {
  const client = createClientSocket();
  const testRoomId = `test_land_block_${Date.now()}`;

  const roomData = await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Apagador' });
  });

  assert.equal(roomData.bossDefeated, false);

  const errorPromise = waitForEvent(client, 'combat:action_error');
  client.emit('land:advance');

  const err = await errorPromise;
  assert.ok(err.message.includes('Portal está selado') || err.message.includes('Boss'));
  assert.equal(rooms[testRoomId.toUpperCase()].currentLandId, 'land_forest');

  client.disconnect();
});

test('LAND-02: land:advance avança com sucesso pela sequência completa de 4 Lands até a Vitória', async () => {
  const client = createClientSocket();
  const testRoomId = `test_full_campaign_${Date.now()}`;

  await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Campeão' });
  });

  const cleanId = testRoomId.toUpperCase();
  const liveRoom = rooms[cleanId];
  assert.equal(liveRoom.currentLandId, 'land_forest');

  // Passo 1: Derrota Boss da Floresta e avança para o Pântano
  liveRoom.bossDefeated = true;
  liveRoom.collectedRelics.push('relic_forest');

  const adv1Promise = waitForEvent(client, 'room:land_advanced');
  client.emit('land:advance');
  const land2 = await adv1Promise;
  assert.equal(land2.landId, 'land_swamp');
  assert.equal(liveRoom.currentLandId, 'land_swamp');
  assert.equal(liveRoom.map.theme, 'swamp');
  assert.equal(liveRoom.bossDefeated, false);
  const boss2 = liveRoom.tokens.find(t => t.isBoss);
  assert.equal(boss2.monsterId, 'bog_abomination');

  // Passo 2: Derrota Boss do Pântano e avança para Cavernas
  liveRoom.bossDefeated = true;
  liveRoom.collectedRelics.push('relic_swamp');

  const adv2Promise = waitForEvent(client, 'room:land_advanced');
  client.emit('land:advance');
  const land3 = await adv2Promise;
  assert.equal(land3.landId, 'land_cave');
  assert.equal(liveRoom.currentLandId, 'land_cave');
  assert.equal(liveRoom.map.theme, 'cave');
  const boss3 = liveRoom.tokens.find(t => t.isBoss);
  assert.equal(boss3.monsterId, 'crystal_colossus');

  // Passo 3: Derrota Boss da Caverna e avança para Masmorra Final
  liveRoom.bossDefeated = true;
  liveRoom.collectedRelics.push('relic_cave');

  const adv3Promise = waitForEvent(client, 'room:land_advanced');
  client.emit('land:advance');
  const land4 = await adv3Promise;
  assert.equal(land4.landId, 'land_dungeon');
  assert.equal(liveRoom.currentLandId, 'land_dungeon');
  assert.equal(liveRoom.map.theme, 'dungeon');
  const boss4 = liveRoom.tokens.find(t => t.isBoss);
  assert.equal(boss4.monsterId, 'malakor_tyrant');

  // Passo 4: Derrota Malakor o Tirano e alcança a Vitória Suprema
  liveRoom.bossDefeated = true;
  liveRoom.collectedRelics.push('relic_dungeon');

  const victoryPromise = waitForEvent(client, 'campaign:victory');
  client.emit('land:advance');
  await victoryPromise;
  assert.ok(true, 'Evento campaign:victory emitido com sucesso');

  client.disconnect();
});

// ============================================================================
// SUITE 8: REALTIME TIBIA MECHANICS
// ============================================================================
test('TIBIA-01: tibia:exori causa dano em área aos monstros adjacentes', async () => {
  const client = createClientSocket();
  const testRoomId = `test_tibia_exori_${Date.now()}`;

  const roomData = await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'Cavaleiro' });
  });

  const playerToken = roomData.tokens.find(t => t.type === 'player');
  const cleanId = testRoomId.toUpperCase();
  const liveRoom = rooms[cleanId];
  const enemy = liveRoom.tokens.find(t => t.type === 'enemy' && !t.isBoss);
  assert.ok(enemy);
  enemy.x = playerToken.x + 1;
  enemy.y = playerToken.y;
  const hpBefore = enemy.hp;

  const effectPromise = waitForEvent(client, 'combat:visual_effect');
  client.emit('tibia:exori', { actorTokenId: playerToken.id });

  await effectPromise;
  assert.ok(enemy.hp < hpBefore, 'Vida do monstro deve ter sido reduzida pelo Exori');

  client.disconnect();
});

test('MMORPG-01: Passar a até 2 quadrados de um inimigo ativa aggro em tempo real e faz o inimigo perseguir o jogador', async () => {
  const client = createClientSocket();
  const testRoomId = `test_mmorpg_aggro_${Date.now()}`;

  const roomData = await new Promise(resolve => {
    client.once('room:state', resolve);
    client.emit('room:join', { roomId: testRoomId, role: 'player', playerName: 'AventureiroMMO' });
  });

  const cleanId = testRoomId.toUpperCase();
  const liveRoom = rooms[cleanId];
  const playerToken = liveRoom.tokens.find(t => t.type === 'player');
  const enemy = liveRoom.tokens.find(t => t.type === 'enemy' && !t.isBoss);
  assert.ok(playerToken);
  assert.ok(enemy);

  // Coloca o inimigo em uma área livre da estrada (x: 20, y: 16) e o jogador a 4 quadrados (x: 24, y: 16)
  enemy.x = 20;
  enemy.y = 16;
  enemy.aggroTargetId = null;

  // 1. Movimento a 3 quadrados de distância (x: 23, y: 16) NÃO deve ativar aggro (limite é <= 2)
  const moveFarPromise = waitForEvent(client, 'room:token_moved');
  client.emit('token:move', { tokenId: playerToken.id, x: 23, y: 16 });
  await moveFarPromise;
  assert.equal(enemy.aggroTargetId, null, 'Inimigo a 3 quadrados não deve adquirir aggro');

  // 2. Movimento a 2 quadrados de distância (x: 22, y: 16) DEVE ativar aggro imediatamente!
  const moveNearPromise = waitForEvent(client, 'room:token_moved');
  client.emit('token:move', { tokenId: playerToken.id, x: 22, y: 16 });
  await moveNearPromise;
  assert.equal(enemy.aggroTargetId, playerToken.id, 'Inimigo a 2 quadrados deve adquirir aggro no jogador');

  // 3. No tick em tempo real do servidor, o inimigo deve andar 1 quadrado na direção do jogador (de x: 20 para x: 21)
  const chaseMovePromise = waitForEvent(client, 'room:token_moved');
  processRoomMMORPGAggro(cleanId, false);
  const enemyMoveEvent = await chaseMovePromise;
  assert.equal(enemyMoveEvent.tokenId, enemy.id);
  assert.equal(enemy.x, 21, 'Inimigo deve ter perseguido o jogador para x=21');
  assert.equal(enemy.y, 16);

  client.disconnect();
});
