import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory rooms cache
let rooms = {};

// Load saved rooms if available
try {
  if (fs.existsSync(ROOMS_FILE)) {
    const raw = fs.readFileSync(ROOMS_FILE, 'utf-8');
    rooms = JSON.parse(raw);
    console.log(`[Storage] Carregadas ${Object.keys(rooms).length} salas salvas do disco.`);
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

// Throttle saves every 5 seconds
let saveTimeout = null;
function scheduleSave() {
  if (!saveTimeout) {
    saveTimeout = setTimeout(() => {
      saveRoomsToDisk();
      saveTimeout = null;
    }, 3000);
  }
}

app.use(cors());
app.use(express.json());

// Serve static build in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// API Health Check & Info
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), roomsCount: Object.keys(rooms).length });
});

// Rooms list API
app.get('/api/rooms', (req, res) => {
  const publicRooms = Object.values(rooms).map(r => ({
    id: r.id,
    name: r.name,
    playerCount: Object.keys(r.players || {}).length,
    activeMap: r.map?.id || 'dungeon_crypt',
    createdAt: r.createdAt
  }));
  res.json(publicRooms);
});

// Helper to create default room
function createInitialRoom(roomId, roomName, dmPass) {
  return {
    id: roomId,
    name: roomName || `Aventura ${roomId}`,
    dmPass: dmPass || 'mestre123',
    createdAt: new Date().toISOString(),
    map: {
      id: 'dungeon_crypt',
      theme: 'dungeon',
      cols: 24,
      rows: 18,
      gridSize: 50,
      customImage: null
    },
    fog: [], // Array of revealed tile strings "x,y"
    tokens: [],
    combat: {
      active: false,
      round: 1,
      currentTurnIndex: 0,
      turnOrder: []
    },
    chatHistory: [
      {
        id: 'msg_init',
        sender: 'Sistema',
        senderType: 'system',
        content: `Mesa "${roomName || roomId}" criada! Bem-vindos ao Reinos & Masmorras (D&D 5e).`,
        timestamp: Date.now()
      }
    ],
    players: {}
  };
}

// Socket.io handlers
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentPlayerId = null;

  socket.on('room:join', ({ roomId, playerName, role, dmPass, character }) => {
    if (!roomId) return;
    const cleanRoomId = roomId.trim().toUpperCase();
    currentRoomId = cleanRoomId;

    if (!rooms[cleanRoomId]) {
      rooms[cleanRoomId] = createInitialRoom(cleanRoomId, `Sala ${cleanRoomId}`, dmPass);
    }

    const room = rooms[cleanRoomId];
    const isDM = role === 'dm' && (!room.dmPass || room.dmPass === dmPass || dmPass === 'mestre123');

    const playerId = socket.id;
    currentPlayerId = playerId;

    room.players[playerId] = {
      socketId: socket.id,
      name: playerName || (isDM ? 'Mestre da Mesa' : 'Aventureiro'),
      role: isDM ? 'dm' : 'player',
      character: character || null,
      online: true,
      lastActive: Date.now()
    };

    socket.join(cleanRoomId);

    // If character exists, check if token exists or create one
    if (character && !isDM) {
      const existingToken = room.tokens.find(t => t.characterId === character.id);
      if (!existingToken) {
        room.tokens.push({
          id: `token_${character.id}`,
          characterId: character.id,
          name: character.name,
          type: 'player',
          x: 2 + (room.tokens.filter(t => t.type === 'player').length % 5),
          y: 2,
          size: 1,
          hp: character.hp || 10,
          maxHp: character.maxHp || 10,
          ac: character.ac || 10,
          avatar: character.avatar || '🛡️',
          color: character.color || '#3B82F6',
          conditions: []
        });
      } else {
        // sync hp/ac
        existingToken.hp = character.hp;
        existingToken.maxHp = character.maxHp;
        existingToken.ac = character.ac;
      }
    }

    // Send complete room state to the user
    socket.emit('room:state', {
      ...room,
      isDM,
      myPlayerId: playerId
    });

    // Notify room of new participant
    io.to(cleanRoomId).emit('room:player_joined', {
      player: room.players[playerId],
      players: room.players,
      tokens: room.tokens
    });

    scheduleSave();
  });

  // Character updates (sheet edit, equip, rest, etc.)
  socket.on('character:update', ({ character }) => {
    if (!currentRoomId || !rooms[currentRoomId] || !character) return;
    const room = rooms[currentRoomId];
    if (room.players[socket.id]) {
      room.players[socket.id].character = character;
      // Also update linked token if on map
      const token = room.tokens.find(t => t.characterId === character.id);
      if (token) {
        token.name = character.name;
        token.hp = character.hp;
        token.maxHp = character.maxHp;
        token.ac = character.ac;
        token.avatar = character.avatar;
        token.color = character.color;
      }
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

  // Add Token (Monster spawn or NPC)
  socket.on('token:add', (tokenData) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const newToken = {
      id: tokenData.id || `token_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: tokenData.name || 'Inimigo',
      type: tokenData.type || 'enemy',
      x: tokenData.x ?? 5,
      y: tokenData.y ?? 5,
      size: tokenData.size || 1,
      hp: tokenData.hp || 10,
      maxHp: tokenData.maxHp || 10,
      ac: tokenData.ac || 10,
      speed: tokenData.speed || 9,
      avatar: tokenData.avatar || '💀',
      color: tokenData.color || '#EF4444',
      conditions: [],
      actions: tokenData.actions || [],
      stats: tokenData.stats || {}
    };
    room.tokens.push(newToken);
    io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
    scheduleSave();
  });

  // Update Token (HP, conditions, etc.)
  socket.on('token:update', (updatedToken) => {
    if (!currentRoomId || !rooms[currentRoomId] || !updatedToken) return;
    const room = rooms[currentRoomId];
    const index = room.tokens.findIndex(t => t.id === updatedToken.id);
    if (index !== -1) {
      room.tokens[index] = { ...room.tokens[index], ...updatedToken };
      // If token belongs to a player, also sync character HP
      if (room.tokens[index].characterId) {
        Object.values(room.players).forEach(p => {
          if (p.character && p.character.id === room.tokens[index].characterId) {
            p.character.hp = updatedToken.hp;
          }
        });
      }
      io.to(currentRoomId).emit('room:tokens_updated', room.tokens);
      scheduleSave();
    }
  });

  // Delete Token
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

  // Map Change
  socket.on('map:change', (mapData) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.map = { ...room.map, ...mapData };
    // Clear fog on map change
    room.fog = [];
    io.to(currentRoomId).emit('room:map_updated', room.map);
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  // Fog of War updates
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

  socket.on('fog:reveal_all', ({ cols, rows }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const allTiles = [];
    for (let c = 0; c < (cols || 30); c++) {
      for (let r = 0; r < (rows || 30); r++) {
        allTiles.push(`${c},${r}`);
      }
    }
    room.fog = allTiles;
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  socket.on('fog:reset_all', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.fog = [];
    io.to(currentRoomId).emit('room:fog_updated', room.fog);
    scheduleSave();
  });

  // Combat / Initiative Tracker
  socket.on('combat:start', ({ turnOrder }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.combat = {
      active: true,
      round: 1,
      currentTurnIndex: 0,
      turnOrder: turnOrder || room.tokens.map(t => t.id)
    };
    io.to(currentRoomId).emit('combat:updated', room.combat);

    // Announce in chat
    const msg = {
      id: `msg_${Date.now()}`,
      sender: 'Sistema de Combate',
      senderType: 'system',
      content: '⚔️ O COMBATE COMEÇOU! Iniciativas roladas e ordem de turnos definida.',
      timestamp: Date.now()
    };
    room.chatHistory.push(msg);
    io.to(currentRoomId).emit('chat:message', msg);
    scheduleSave();
  });

  socket.on('combat:next', () => {
    if (!currentRoomId || !rooms[currentRoomId] || !rooms[currentRoomId].combat.active) return;
    const room = rooms[currentRoomId];
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

    io.to(currentRoomId).emit('combat:updated', room.combat);

    if (currentToken) {
      const msg = {
        id: `msg_${Date.now()}`,
        sender: 'Combate',
        senderType: 'system',
        content: `👉 Rodada ${nextRound}: Turno de **${currentToken.name}**!`,
        timestamp: Date.now()
      };
      room.chatHistory.push(msg);
      io.to(currentRoomId).emit('chat:message', msg);
    }
    scheduleSave();
  });

  socket.on('combat:end', () => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    room.combat = {
      active: false,
      round: 1,
      currentTurnIndex: 0,
      turnOrder: []
    };
    io.to(currentRoomId).emit('combat:updated', room.combat);

    const msg = {
      id: `msg_${Date.now()}`,
      sender: 'Sistema de Combate',
      senderType: 'system',
      content: '✨ O combate foi encerrado.',
      timestamp: Date.now()
    };
    room.chatHistory.push(msg);
    io.to(currentRoomId).emit('chat:message', msg);
    scheduleSave();
  });

  // Dice roll & Chat
  socket.on('chat:send', (messageData) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: messageData.sender || 'Aventureiro',
      senderType: messageData.senderType || 'player',
      content: messageData.content || '',
      type: messageData.type || 'chat',
      rollData: messageData.rollData || null,
      timestamp: Date.now()
    };
    room.chatHistory.push(newMsg);
    if (room.chatHistory.length > 200) room.chatHistory.shift();

    io.to(currentRoomId).emit('chat:message', newMsg);
    scheduleSave();
  });

  // Economy: Buy item
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

        socket.emit('character:sync', char);
        io.to(currentRoomId).emit('room:players_updated', room.players);

        const msg = {
          id: `msg_${Date.now()}`,
          sender: 'Mercador',
          senderType: 'system',
          content: `💰 **${char.name}** comprou **${item.name}** por ${cost} PO.`,
          timestamp: Date.now()
        };
        room.chatHistory.push(msg);
        io.to(currentRoomId).emit('chat:message', msg);
        scheduleSave();
      }
    }
  });

  // Economy: Sell item
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

        socket.emit('character:sync', char);
        io.to(currentRoomId).emit('room:players_updated', room.players);

        const msg = {
          id: `msg_${Date.now()}`,
          sender: 'Mercador',
          senderType: 'system',
          content: `🪙 **${char.name}** vendeu **${soldItem.name}** e recebeu ${sellPrice} PO.`,
          timestamp: Date.now()
        };
        room.chatHistory.push(msg);
        io.to(currentRoomId).emit('chat:message', msg);
        scheduleSave();
      }
    }
  });

  // DM Gold / Loot Grant
  socket.on('economy:grant_loot', ({ targetCharacterId, gold, itemName }) => {
    if (!currentRoomId || !rooms[currentRoomId]) return;
    const room = rooms[currentRoomId];
    Object.values(room.players).forEach(p => {
      if (p.character && (!targetCharacterId || p.character.id === targetCharacterId)) {
        if (gold) p.character.gold = (p.character.gold || 0) + gold;
        if (itemName) {
          if (!p.character.inventory) p.character.inventory = [];
          p.character.inventory.push({ id: `loot_${Date.now()}`, name: itemName, type: 'gear', cost: 10 });
        }
      }
    });

    io.to(currentRoomId).emit('room:players_updated', room.players);
    const msg = {
      id: `msg_${Date.now()}`,
      sender: 'Mestre da Mesa',
      senderType: 'dm',
      content: `🎁 Recompensa concedida: ${gold ? `+${gold} PO ` : ''}${itemName ? `Item: ${itemName}` : ''}!`,
      timestamp: Date.now()
    };
    room.chatHistory.push(msg);
    io.to(currentRoomId).emit('chat:message', msg);
    scheduleSave();
  });

  // Map Ping
  socket.on('map:ping', ({ x, y, color }) => {
    if (!currentRoomId) return;
    io.to(currentRoomId).emit('map:ping_received', { x, y, color, senderId: socket.id });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentRoomId && rooms[currentRoomId] && rooms[currentRoomId].players[socket.id]) {
      rooms[currentRoomId].players[socket.id].online = false;
      io.to(currentRoomId).emit('room:players_updated', rooms[currentRoomId].players);
      scheduleSave();
    }
  });
});

// Any unmatched route returns client index.html in production
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🏰 REINOS & MASMORRAS - D&D 5E ONLINE`);
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log(`⚔️ Conecte com seus amigos na mesma rede Wi-Fi`);
  console.log(`===============================================`);
});
