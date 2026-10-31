import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  User, 
  Plus, 
  Sparkles, 
  BookOpen, 
  Check,
  ChevronRight,
  Trash2,
  Bot
} from 'lucide-react';
import CharacterCreator from './CharacterCreator';
import { ITEMS, calculateCharacterDerivedStats } from '../data/dndData';
import { sounds } from '../utils/soundEffects';

const LOCAL_CHARS_KEY = 'dnd_saved_characters_v2';

// Pre-made D&D 5e Heroes so players can play immediately or create their own!
const PRESET_HEROES = [
  {
    id: 'preset_bruenor',
    name: 'Bruenor Martelo-de-Ferro',
    race: 'Anão',
    raceId: 'dwarf',
    className: 'Guerreiro',
    classId: 'fighter',
    level: 1,
    xp: 0,
    unspentStatPoints: 0,
    avatar: '🧔‍♂️',
    color: '#3B82F6',
    alignment: 'Leal e Bom',
    hitDie: 10,
    hp: 13,
    maxHp: 13,
    ac: 18,
    speed: 7.5,
    proficiencyBonus: 2,
    savingThrows: ['str', 'con'],
    stats: { str: 17, dex: 12, con: 16, int: 10, wis: 13, cha: 8 },
    gold: 120,
    inventory: [ITEMS.machado_batalha, ITEMS.escudo, ITEMS.cota_de_malha, ITEMS.azagaia, ITEMS.pocao_cura, ITEMS.pocao_cura]
  },
  {
    id: 'preset_lyra',
    name: 'Lyra Estrela-da-Manhã',
    race: 'Elfo',
    raceId: 'elf',
    className: 'Mago',
    classId: 'wizard',
    level: 1,
    xp: 0,
    unspentStatPoints: 0,
    avatar: '🧝‍♀️',
    color: '#8B5CF6',
    alignment: 'Neutro e Bom',
    hitDie: 6,
    hp: 8,
    maxHp: 8,
    ac: 13,
    speed: 9,
    proficiencyBonus: 2,
    savingThrows: ['int', 'wis'],
    stats: { str: 8, dex: 16, con: 14, int: 16, wis: 12, cha: 10 },
    gold: 110,
    inventory: [ITEMS.bordao, ITEMS.adaga, ITEMS.foco_arcano, ITEMS.pocao_cura, ITEMS.pocao_cura],
    spellSlots: { 1: { total: 2, current: 2 } }
  },
  {
    id: 'preset_vax',
    name: 'Kaelen Passos-Sombrios',
    race: 'Halfling',
    raceId: 'halfling',
    className: 'Ladino',
    classId: 'rogue',
    level: 1,
    xp: 0,
    unspentStatPoints: 0,
    avatar: '🏹',
    color: '#10B981',
    alignment: 'Caótico e Bom',
    hitDie: 8,
    hp: 10,
    maxHp: 10,
    ac: 15,
    speed: 7.5,
    proficiencyBonus: 2,
    savingThrows: ['dex', 'int'],
    stats: { str: 10, dex: 17, con: 14, int: 13, wis: 12, cha: 11 },
    gold: 130,
    inventory: [ITEMS.rapieira, ITEMS.arco_curto, ITEMS.adaga, ITEMS.armadura_couro_batido, ITEMS.pocao_cura]
  },
  {
    id: 'preset_kyra',
    name: 'Solaria Luz-Dourada',
    race: 'Humano',
    raceId: 'human',
    className: 'Clérigo',
    classId: 'cleric',
    level: 1,
    xp: 0,
    unspentStatPoints: 0,
    avatar: '🛡️',
    color: '#F59E0B',
    alignment: 'Leal e Bom',
    hitDie: 8,
    hp: 11,
    maxHp: 11,
    ac: 18,
    speed: 9,
    proficiencyBonus: 2,
    savingThrows: ['wis', 'cha'],
    stats: { str: 14, dex: 11, con: 15, int: 11, wis: 16, cha: 13 },
    gold: 130,
    inventory: [ITEMS.maca, ITEMS.escudo, ITEMS.cota_de_malha, ITEMS.simbolo_sagrado, ITEMS.pocao_cura, ITEMS.pocao_cura],
    spellSlots: { 1: { total: 2, current: 2 } }
  }
];

export default function Lobby({ onJoin }) {
  const [role, setRole] = useState('player'); // 'player' | 'dm'
  const [roomId, setRoomId] = useState('MASMORRA-1');
  const [dmPass, setDmPass] = useState('mestre123');

  const [savedCharacters, setSavedCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isCreatingChar, setIsCreatingChar] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_CHARS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setSavedCharacters(parsed);
          setSelectedCharacter(parsed[0]);
          return;
        }
      }
      // Initialize with pre-made heroes if no characters saved yet!
      const initial = PRESET_HEROES.map(h => ({
        ...h,
        id: `${h.id}_${Math.random().toString(36).substring(2, 6)}`
      }));
      setSavedCharacters(initial);
      setSelectedCharacter(initial[0]);
      localStorage.setItem(LOCAL_CHARS_KEY, JSON.stringify(initial));
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

  const handleEnterGame = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    sounds.init();
    sounds.playDiceRoll();

    const charToUse = selectedCharacter || PRESET_HEROES[0];

    onJoin({
      roomId: roomId.trim().toUpperCase(),
      playerName: charToUse.name,
      role,
      dmPass,
      character: role === 'player' ? charToUse : null
    });
  };

  return (
    <div className="min-h-screen bg-dnd-darker text-gray-200 flex flex-col justify-center items-center p-4 relative overflow-y-auto select-none">
      <div className="w-full max-w-xl bg-dnd-panel border border-dnd-border rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fadeIn">
        
        {/* Title & Brand */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-dnd-darker border-2 border-dnd-gold shadow-lg text-dnd-gold mb-2">
            <Shield className="w-7 h-7 drop-shadow" />
          </div>
          <h1 className="font-cinzel font-black text-2xl sm:text-3xl text-dnd-gold tracking-wider">
            REINOS & MASMORRAS
          </h1>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5">
            <Bot className="w-3.5 h-3.5" />
            <span>Com Mestre Automático (IA) & Modo Cooperativo Online</span>
          </div>
        </div>

        <form onSubmit={handleEnterGame} className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Como deseja jogar?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  role === 'player'
                    ? 'bg-dnd-gold text-black border-amber-400 shadow-md'
                    : 'bg-dnd-darker border-dnd-border text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Herói Jogador (Co-op / Auto-DM)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('dm')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  role === 'dm'
                    ? 'bg-red-800 text-white border-red-600 shadow-md'
                    : 'bg-dnd-darker border-dnd-border text-gray-400 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Mestre Humano (Narrador)</span>
              </button>
            </div>
          </div>

          {/* Room Code */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Código da Sala (Compartilhe com seus amigos)
            </label>
            <input
              type="text"
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
              placeholder="Ex: MASMORRA-1"
              required
              className="w-full bg-dnd-darker border border-dnd-border rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-400 uppercase focus:outline-none focus:border-dnd-gold"
            />
          </div>

          {/* Character Selection */}
          {role === 'player' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Escolha seu Herói ou Crie um Novo
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingChar(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg transition flex items-center space-x-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Personagem Customizado</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {savedCharacters.map(char => {
                  const isSelected = selectedCharacter?.id === char.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => setSelectedCharacter(char)}
                      className={`cursor-pointer border rounded-xl p-2.5 flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-dnd-gold/15 border-dnd-gold shadow'
                          : 'bg-dnd-darker border-dnd-border hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{char.avatar || '⚔️'}</span>
                        <div>
                          <div className="font-cinzel font-bold text-sm text-gray-100">{char.name}</div>
                          <div className="text-xs text-gray-400">
                            {char.race} • {char.className} Nv.{char.level || 1} • ❤️ {char.hp} PV • 🛡️ CA {char.ac}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isSelected && <Check className="w-4 h-4 text-dnd-gold" />}
                        {savedCharacters.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteChar(char.id, e)}
                            className="p-1 text-gray-500 hover:text-red-400 rounded"
                            title="Remover Ficha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
      </div>

      {isCreatingChar && (
        <CharacterCreator
          onComplete={handleSaveNewCharacter}
          onCancel={() => setIsCreatingChar(false)}
        />
      )}
    </div>
  );
}
