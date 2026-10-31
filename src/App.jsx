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
  const [inGame, setInGame] = useState(false);
  const [room, setRoom] = useState(null);
  const [isDM, setIsDM] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const socketUrl = window.location.port === '5173' ? 'http://localhost:3001' : window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Conectado:', newSocket.id);
    });

    newSocket.on('room:state', (roomState) => {
      setRoom(roomState);
      setIsDM(roomState.isDM);
      setMyPlayerId(roomState.myPlayerId);
      setInGame(true);
    });

    newSocket.on('room:player_joined', ({ players, tokens }) => {
      setRoom(prev => prev ? { ...prev, players, tokens } : prev);
    });

    newSocket.on('room:tokens_updated', (tokens) => {
      setRoom(prev => prev ? { ...prev, tokens } : prev);
    });

    newSocket.on('room:token_moved', ({ tokenId, x, y }) => {
      setRoom(prev => {
        if (!prev) return prev;
        const updatedTokens = prev.tokens.map(t => t.id === tokenId ? { ...t, x, y } : t);
        return { ...prev, tokens: updatedTokens };
      });
    });

    newSocket.on('room:players_updated', (players) => {
      setRoom(prev => prev ? { ...prev, players } : prev);
    });

    newSocket.on('room:chests_updated', (chests) => {
      setRoom(prev => prev ? { ...prev, chests } : prev);
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
    if (!socket) return;
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
    return <Lobby onJoin={handleJoin} />;
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
