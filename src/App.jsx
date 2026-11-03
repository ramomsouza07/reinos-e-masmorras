import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import Navbar from './components/Navbar';
import BattleMap from './components/BattleMap';
import CharacterSheet from './components/CharacterSheet';
import ShopDrawer from './components/ShopDrawer';
import CombatTracker from './components/CombatTracker';
import BestiaryDrawer from './components/BestiaryDrawer';
import DiceTray from './components/DiceTray';
import ChatDrawer from './components/ChatDrawer';
import { sounds } from './utils/soundEffects';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [room, setRoom] = useState(null);
  const [isDM, setIsDM] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    // Connect to backend server on port 3001 if on dev server or custom port
    const isDev = window.location.port !== '3001' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const socketUrl = isDev ? 'http://localhost:3001' : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 30,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Conectado ao servidor:', newSocket.id);
      setIsConnected(true);
      setSocketError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Desconectado do servidor');
      setIsConnected(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
    });

    newSocket.on('room:error', ({ message } = {}) => {
      setSocketError(message || 'Erro ao entrar na sala');
    });

    newSocket.on('room:state', (roomState) => {
      setRoom(roomState);
      setIsDM(roomState.isDM);
      setMyPlayerId(roomState.myPlayerId);
      setInGame(true);
      setSocketError(null);
    });

    newSocket.on('room:player_joined', ({ players, tokens }) => {
      setRoom(prev => prev ? { ...prev, players, tokens } : prev);
    });

    newSocket.on('room:tokens_updated', (tokens) => {
      setRoom(prev => prev ? { ...prev, tokens } : prev);
    });

    newSocket.on('room:token_moved', ({ tokenId, x, y, aggroTargetId }) => {
      setRoom(prev => {
        if (!prev) return prev;
        const updatedTokens = prev.tokens.map(t =>
          t.id === tokenId ? { ...t, x, y, ...(aggroTargetId !== undefined ? { aggroTargetId } : {}) } : t
        );
        return { ...prev, tokens: updatedTokens };
      });
    });

    newSocket.on('room:players_updated', (players) => {
      setRoom(prev => prev ? { ...prev, players } : prev);
    });

    newSocket.on('room:chests_updated', (chests) => {
      setRoom(prev => prev ? { ...prev, chests } : prev);
    });

    newSocket.on('room:gatherables_updated', (gatherables) => {
      setRoom(prev => prev ? { ...prev, gatherables } : prev);
    });

    newSocket.on('room:boss_defeated', ({ relic } = {}) => {
      setRoom(prev => {
        if (!prev) return prev;
        const relics = [...(prev.collectedRelics || [])];
        if (relic?.id && !relics.includes(relic.id)) relics.push(relic.id);
        return { ...prev, bossDefeated: true, collectedRelics: relics };
      });
    });

    newSocket.on('room:land_advanced', ({ landId, portalPosition, portalName, relics } = {}) => {
      setRoom(prev => prev ? {
        ...prev,
        currentLandId: landId,
        currentAdventureId: landId,
        bossDefeated: false,
        portalPosition: portalPosition || prev.portalPosition,
        portalName: portalName || prev.portalName,
        collectedRelics: relics || prev.collectedRelics
      } : prev);
    });

    newSocket.on('room:corpses_updated', (corpses) => {
      setRoom(prev => prev ? { ...prev, corpses } : prev);
    });

    newSocket.on('room:autodm_updated', (autoDM) => {
      setRoom(prev => prev ? { ...prev, autoDM } : prev);
    });

    newSocket.on('room:map_updated', (map) => {
      setRoom(prev => prev ? { ...prev, map } : prev);
    });

    newSocket.on('room:fog_updated', (fog) => {
      setRoom(prev => prev ? { ...prev, fog } : prev);
    });

    newSocket.on('room:fog_enabled_updated', (fogEnabled) => {
      setRoom(prev => prev ? { ...prev, fogEnabled } : prev);
    });

    newSocket.on('combat:updated', (combat) => {
      setRoom(prev => prev ? { ...prev, combat } : prev);
    });

    newSocket.on('chat:message', (msg) => {
      setRoom(prev => {
        if (!prev) return prev;
        const history = [...(prev.chatHistory || []), msg];
        return { ...prev, chatHistory: history };
      });

      setActiveTab(currentTab => {
        if (currentTab !== 'chat') {
          setUnreadChatCount(count => count + 1);
        }
        return currentTab;
      });
    });

    newSocket.on('character:sync', (syncedChar) => {
      setRoom(prev => {
        if (!prev || !newSocket.id) return prev;
        const players = { ...(prev.players || {}) };
        if (players[newSocket.id]) {
          players[newSocket.id] = { ...players[newSocket.id], character: syncedChar };
        }
        return { ...prev, players };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoin = ({ roomId, playerName, role, dmPass, character }) => {
    if (!socket || !socket.connected) {
      setSocketError('O servidor de jogo não está rodando na porta 3001. Execute "node server/index.js" no terminal.');
      return;
    }
    sounds.init();
    socket.emit('room:join', { roomId, playerName, role, dmPass, character });
  };

  const handleLeave = () => {
    setInGame(false);
    setRoom(null);
    setActiveTab('map');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      setUnreadChatCount(0);
    }
  };

  const myPlayer = room?.players?.[myPlayerId] || null;

  if (!inGame || !room) {
    return (
      <Lobby
        onJoin={handleJoin}
        isConnected={isConnected}
        socketError={socketError}
      />
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-dnd-dark text-gray-200 flex flex-col">
      <Navbar
        room={room}
        isDM={isDM}
        player={myPlayer}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLeave={handleLeave}
        unreadChatCount={unreadChatCount}
      />

      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'map' && (
          <BattleMap
            room={room}
            socket={socket}
            isDM={isDM}
            player={myPlayer}
            onOpenSheet={() => handleTabChange('sheet')}
          />
        )}

        {activeTab === 'sheet' && myPlayer?.character && (
          <CharacterSheet
            character={myPlayer.character}
            onUpdate={(updatedChar) => {
              socket.emit('character:update', { character: updatedChar });
            }}
            socket={socket}
            room={room}
          />
        )}

        {activeTab === 'shop' && (
          <ShopDrawer
            player={myPlayer}
            isDM={isDM}
            socket={socket}
            room={room}
          />
        )}

        {activeTab === 'combat' && (
          <CombatTracker
            room={room}
            socket={socket}
            isDM={isDM}
            player={myPlayer}
          />
        )}

        {activeTab === 'bestiary' && (
          <BestiaryDrawer
            socket={socket}
            room={room}
          />
        )}

        {activeTab === 'dice' && (
          <DiceTray
            socket={socket}
            player={myPlayer}
            isDM={isDM}
          />
        )}

        {activeTab === 'chat' && (
          <ChatDrawer
            room={room}
            socket={socket}
            player={myPlayer}
            isDM={isDM}
          />
        )}
      </main>
    </div>
  );
}
