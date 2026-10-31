import React, { useState } from 'react';
import { 
  Map, 
  FileText, 
  Coins, 
  Swords, 
  Skull, 
  Dices, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Share2, 
  Check, 
  Users, 
  LogOut,
  Shield
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Navbar({ 
  room, 
  isDM, 
  player, 
  activeTab, 
  setActiveTab, 
  onLeave, 
  unreadChatCount 
}) {
  const [muted, setMuted] = useState(sounds.muted);
  const [copied, setCopied] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onlinePlayers = Object.values(room.players || {}).filter(p => p.online);

  return (
    <header className="h-14 bg-dnd-panel border-b border-dnd-border px-4 flex items-center justify-between select-none z-30 relative shadow-md">
      {/* Brand & Room info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-dnd-gold font-cinzel font-bold text-lg tracking-wider">
          <Shield className="w-6 h-6 text-dnd-gold drop-shadow" />
          <span className="hidden sm:inline">REINOS & MASMORRAS</span>
        </div>

        {/* Room badge */}
        <div className="flex items-center space-x-1.5 bg-dnd-darker border border-dnd-border px-2.5 py-1 rounded text-xs">
          <span className="text-gray-400">Sala:</span>
          <span className="font-mono font-bold text-amber-400">{room.id}</span>
          <button 
            onClick={copyRoomCode} 
            title="Copiar Código da Sala" 
            className="text-gray-400 hover:text-white transition ml-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isDM && (
          <span className="bg-red-950 border border-red-700/60 text-red-300 text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
            Mestre (DM)
          </span>
        )}
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
            activeTab === 'map'
              ? 'bg-dnd-gold text-gray-900 font-semibold shadow'
              : 'text-gray-300 hover:bg-dnd-hover hover:text-white'
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="hidden md:inline">Mapa Tático</span>
        </button>

        {player?.character && (
          <button
            onClick={() => setActiveTab('sheet')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
              activeTab === 'sheet'
                ? 'bg-dnd-gold text-gray-900 font-semibold shadow'
                : 'text-gray-300 hover:bg-dnd-hover hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Ficha ({player.character.name.split(' ')[0]})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
            activeTab === 'shop'
              ? 'bg-dnd-gold text-gray-900 font-semibold shadow'
              : 'text-gray-300 hover:bg-dnd-hover hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Mercado</span>
        </button>

        <button
          onClick={() => setActiveTab('combat')}
          className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
            activeTab === 'combat'
              ? 'bg-dnd-gold text-gray-900 font-semibold shadow'
              : 'text-gray-300 hover:bg-dnd-hover hover:text-white'
          } ${room.combat?.active ? 'border border-red-500/80 animate-pulse text-red-300' : ''}`}
        >
          <Swords className="w-4 h-4" />
          <span className="hidden md:inline">Combate</span>
          {room.combat?.active && (
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1"></span>
          )}
        </button>

        {isDM && (
          <button
            onClick={() => setActiveTab('bestiary')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
              activeTab === 'bestiary'
                ? 'bg-red-800 text-white font-semibold shadow'
                : 'text-red-400 hover:bg-dnd-hover hover:text-red-300'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span className="hidden md:inline">Bestiário</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('dice')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
            activeTab === 'dice'
              ? 'bg-dnd-gold text-gray-900 font-semibold shadow'
              : 'text-gray-300 hover:bg-dnd-hover hover:text-white'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span className="hidden md:inline">Dados</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition ${
            activeTab === 'chat'
              ? 'bg-dnd-gold text-gray-900 font-semibold shadow'
              : 'text-gray-300 hover:bg-dnd-hover hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden md:inline">Chat</span>
          {unreadChatCount > 0 && activeTab !== 'chat' && (
            <span className="bg-amber-500 text-black text-xs font-bold px-1.5 rounded-full">
              {unreadChatCount}
            </span>
          )}
        </button>
      </nav>

      {/* Right controls */}
      <div className="flex items-center space-x-2">
        {/* Players count button */}
        <button
          onClick={() => setShowPlayersModal(!showPlayersModal)}
          className="flex items-center space-x-1.5 bg-dnd-darker border border-dnd-border hover:border-gray-500 px-2.5 py-1 rounded text-xs transition"
          title="Ver Jogadores Online"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-emerald-400">{onlinePlayers.length}</span>
        </button>

        {/* Audio mute */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded hover:bg-dnd-hover text-gray-400 hover:text-white transition"
          title={muted ? 'Desmutar Sons' : 'Mutar Sons'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-gray-300" />}
        </button>

        {/* Leave session */}
        <button
          onClick={onLeave}
          className="p-1.5 rounded hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition"
          title="Sair da Mesa"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Online Players dropdown modal */}
      {showPlayersModal && (
        <div className="absolute right-4 top-14 w-64 bg-dnd-panel border border-dnd-border rounded-lg shadow-xl p-3 z-50 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-dnd-border text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Aventureiros Conectados</span>
            <span className="text-emerald-400">{onlinePlayers.length} online</span>
          </div>
          <div className="divide-y divide-dnd-border/40 mt-2 max-h-60 overflow-y-auto">
            {onlinePlayers.map(p => (
              <div key={p.socketId} className="py-2 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-dnd-darker border border-dnd-border flex items-center justify-center text-sm shadow">
                    {p.character?.avatar || (p.role === 'dm' ? '👑' : '🛡️')}
                  </div>
                  <div>
                    <div className="font-medium text-gray-200">
                      {p.character ? p.character.name : p.name}
                    </div>
                    {p.character && (
                      <div className="text-xs text-gray-400">
                        {p.character.race} • {p.character.className} Nv.{p.character.level || 1}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {p.role === 'dm' ? (
                    <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded font-bold uppercase">
                      DM
                    </span>
                  ) : p.character ? (
                    <span className="text-xs text-emerald-400 font-mono">
                      PV {p.character.hp}/{p.character.maxHp}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">Sem Ficha</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
