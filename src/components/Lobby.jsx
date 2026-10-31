import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  User, 
  Plus, 
  Sparkles, 
  Dices, 
  Play, 
  BookOpen, 
  Check,
  ChevronRight,
  Trash2
} from 'lucide-react';
import CharacterCreator from './CharacterCreator';
import { sounds } from '../utils/soundEffects';

const LOCAL_CHARS_KEY = 'dnd_saved_characters_v1';

export default function Lobby({ onJoin }) {
  const [role, setRole] = useState('player'); // 'player' | 'dm'
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('MASMORRA-1');
  const [dmPass, setDmPass] = useState('mestre123');

  // Saved characters from localStorage
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isCreatingChar, setIsCreatingChar] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_CHARS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedCharacters(parsed);
        if (parsed.length > 0) {
          setSelectedCharacter(parsed[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveNewCharacter = (newChar) => {
    const updated = [newChar, ...savedCharacters];
    setSavedCharacters(updated);
    setSelectedCharacter(newChar);
    try {
      localStorage.setItem(LOCAL_CHARS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setIsCreatingChar(false);
  };

  const handleDeleteChar = (charId, e) => {
    e.stopPropagation();
    const updated = savedCharacters.filter(c => c.id !== charId);
    setSavedCharacters(updated);
    if (selectedCharacter?.id === charId) {
      setSelectedCharacter(updated[0] || null);
    }
    try {
      localStorage.setItem(LOCAL_CHARS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateRandomRoom = () => {
    const prefixes = ['DRAGAO', 'TAVERNA', 'MASMORRA', 'FLORESTA', 'CRIPTA', 'REINO'];
    const num = Math.floor(100 + Math.random() * 900);
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    setRoomId(`${pre}-${num}`);
  };

  const handleEnterGame = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    sounds.init();
    sounds.playDiceRoll();

    onJoin({
      roomId: roomId.trim().toUpperCase(),
      playerName: playerName.trim() || (role === 'dm' ? 'Mestre da Mesa' : selectedCharacter?.name || 'Aventureiro'),
      role,
      dmPass,
      character: role === 'player' ? selectedCharacter : null
    });
  };

  return (
    <div className="min-h-screen bg-dnd-darker text-gray-200 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dnd-gold/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl bg-dnd-panel border border-dnd-border rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fadeIn">
        
        {/* Title & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dnd-darker border-2 border-dnd-gold shadow-lg text-dnd-gold mb-3">
            <Shield className="w-8 h-8 drop-shadow" />
          </div>
          <h1 className="font-cinzel font-black text-2xl sm:text-3xl text-dnd-gold tracking-wider">
            REINOS & MASMORRAS
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-serif italic">
            Mesa Virtual D&D 5ª Edição Oficial em Português
          </p>
        </div>

        <form onSubmit={handleEnterGame} className="space-y-5">
          {/* Role Selector: Jogador vs Mestre */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Seu Papel na Aventura
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  role === 'player'
                    ? 'bg-dnd-gold text-black border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-dnd-darker border-dnd-border text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Jogador (Aventureiro)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('dm')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  role === 'dm'
                    ? 'bg-red-800 text-white border-red-600 shadow-md scale-[1.02]'
                    : 'bg-dnd-darker border-dnd-border text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Mestre (Narrador / DM)</span>
              </button>
            </div>
          </div>

          {/* Room Code & Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Código da Sala (Multiplayer)
              </label>
              <button
                type="button"
                onClick={handleGenerateRandomRoom}
                className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Gerar Nova Sala</span>
              </button>
            </div>
            <input
              type="text"
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
              placeholder="Ex: TAVERNA-101, MASMORRA-5"
              required
              className="w-full bg-dnd-darker border border-dnd-border rounded-xl px-4 py-3 text-sm font-mono font-bold text-amber-400 placeholder-gray-600 uppercase focus:outline-none focus:border-dnd-gold tracking-wider"
            />
          </div>

          {/* DM Password if DM */}
          {role === 'dm' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Senha do Mestre (Opcional)
              </label>
              <input
                type="password"
                value={dmPass}
                onChange={e => setDmPass(e.target.value)}
                placeholder="mestre123"
                className="w-full bg-dnd-darker border border-dnd-border rounded-xl px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          )}

          {/* Player: Character Selection */}
          {role === 'player' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Selecione seu Personagem
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingChar(true)}
                  className="bg-emerald-700/80 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition flex items-center space-x-1 shadow"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Criar Nova Ficha</span>
                </button>
              </div>

              {savedCharacters.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedCharacters.map(char => {
                    const isSelected = selectedCharacter?.id === char.id;
                    return (
                      <div
                        key={char.id}
                        onClick={() => setSelectedCharacter(char)}
                        className={`cursor-pointer border rounded-xl p-3 flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-dnd-gold/15 border-dnd-gold shadow'
                            : 'bg-dnd-darker border-dnd-border hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{char.avatar || '🛡️'}</span>
                          <div>
                            <div className="font-cinzel font-bold text-sm text-gray-100">{char.name}</div>
                            <div className="text-xs text-gray-400">
                              {char.race} • {char.className} Nv.{char.level || 1} • PV {char.hp}/{char.maxHp}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isSelected && <Check className="w-4 h-4 text-dnd-gold" />}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteChar(char.id, e)}
                            className="p-1 text-gray-500 hover:text-red-400 rounded"
                            title="Excluir Ficha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => setIsCreatingChar(true)}
                  className="cursor-pointer border border-dashed border-dnd-border hover:border-dnd-gold rounded-xl p-6 text-center bg-dnd-darker/60 transition group"
                >
                  <Sparkles className="w-8 h-8 mx-auto text-dnd-gold mb-1.5 group-hover:scale-110 transition" />
                  <div className="font-cinzel font-bold text-sm text-gray-200">Você ainda não tem um personagem!</div>
                  <p className="text-xs text-gray-400 mt-1">
                    Clique aqui para abrir o Criador Passo-a-Passo com Raças, Classes, Atributos e Equipamentos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Enter Button */}
          <button
            type="submit"
            className="w-full bg-dnd-gold hover:bg-amber-400 text-black font-cinzel font-black text-base py-3.5 rounded-xl transition shadow-xl flex items-center justify-center space-x-2 group hover:scale-[1.01]"
          >
            <span>ENTRAR NA AVENTURA</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-dnd-border/40 text-center text-[11px] text-gray-500 flex items-center justify-center space-x-2">
          <BookOpen className="w-3.5 h-3.5 text-dnd-gold" />
          <span>Baseado no Livro do Jogador Oficial D&D 5ª Edição</span>
        </div>
      </div>

      {/* Character Creator Modal */}
      {isCreatingChar && (
        <CharacterCreator
          onComplete={handleSaveNewCharacter}
          onCancel={() => setIsCreatingChar(false)}
        />
      )}
    </div>
  );
}
