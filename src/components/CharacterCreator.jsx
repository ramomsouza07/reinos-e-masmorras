import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  Dices, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  Heart, 
  Zap, 
  Crosshair,
  Award
} from 'lucide-react';
import { RACES, CLASSES, ABILITIES, ITEMS, getAbilityMod, formatMod } from '../data/dndData';
import { roll4d6DropLowest } from '../utils/dice';
import { sounds } from '../utils/soundEffects';

const AVATARS = ['🧙‍♂️', '🧝‍♀️', '🧝‍♂️', '🧔‍♂️', '🦹', '👸', '🤴', '🧚', '🧛', '🧙‍♀️', '🏹', '⚔️', '🛡️', '⚡', '🐉', '🐺', '🦊', '🦅'];
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const ALIGNMENTS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Neutro Puro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export default function CharacterCreator({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);

  // Character State
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState(RACES[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [alignment, setAlignment] = useState(ALIGNMENTS[0]);
  const [backstory, setBackstory] = useState('');

  // Ability generation mode: 'standard' | 'roll' | 'pointbuy'
  const [statMode, setStatMode] = useState('standard');
  const [baseStats, setBaseStats] = useState({
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8
  });

  // 4d6 drop lowest rolls pool
  const [rolledScores, setRolledScores] = useState([]);

  // Calculate final ability scores with racial bonuses
  const finalStats = { ...baseStats };
  if (selectedRace.bonus) {
    Object.entries(selectedRace.bonus).forEach(([stat, val]) => {
      finalStats[stat] = (finalStats[stat] || 10) + val;
    });
  }

  // Calculate starting HP & AC
  const conMod = getAbilityMod(finalStats.con);
  const dexMod = getAbilityMod(finalStats.dex);
  const startingHp = selectedClass.hitDie + conMod;

  // Roll 4d6 for all stats
  const handleRollAllStats = () => {
    sounds.playDiceRoll();
    const newStats = {};
    const rollsLog = [];
    ABILITIES.forEach(ab => {
      const result = roll4d6DropLowest();
      newStats[ab.id] = result.total;
      rollsLog.push({ ab: ab.abbr, ...result });
    });
    setBaseStats(newStats);
    setRolledScores(rollsLog);
  };

  const handleFinish = () => {
    if (!name.trim()) return;

    // Build initial starter inventory
    const inventory = [];
    let initialAc = 10 + dexMod;

    if (selectedClass.starterGear) {
      selectedClass.starterGear.forEach(itemId => {
        const item = ITEMS[itemId];
        if (item) {
          inventory.push(item);
          // Calculate AC if armor or shield
          if (item.type === 'armor') {
            initialAc = item.ac + (item.addDex ? (item.maxDex ? Math.min(dexMod, item.maxDex) : dexMod) : 0);
          }
        }
      });
      // Check for shield in starter gear
      if (selectedClass.starterGear.includes('escudo')) {
        initialAc += 2;
      }
    }

    const newCharacter = {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      race: selectedRace.name,
      raceId: selectedRace.id,
      className: selectedClass.name,
      classId: selectedClass.id,
      level: 1,
      xp: 0,
      avatar,
      color,
      alignment,
      backstory,
      hitDie: selectedClass.hitDie,
      hp: startingHp,
      maxHp: startingHp,
      tempHp: 0,
      ac: initialAc,
      speed: selectedRace.speed || 9,
      proficiencyBonus: 2,
      savingThrows: selectedClass.savingThrows || [],
      stats: finalStats,
      gold: selectedClass.startingGold || 100,
      silver: 0,
      copper: 0,
      inventory,
      spellSlots: selectedClass.spellcaster ? { 1: { total: 2, current: 2 } } : null,
      deathSaves: { successes: 0, failures: 0 }
    };

    sounds.playCriticalSuccess();
    onComplete(newCharacter);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-dnd-panel border border-dnd-border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Wizard Header */}
        <div className="bg-dnd-darker border-b border-dnd-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-dnd-gold/20 border border-dnd-gold flex items-center justify-center text-dnd-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-dnd-gold">Criação de Personagem (D&D 5e)</h2>
              <p className="text-xs text-gray-400">Etapa {step} de 4: {
                step === 1 ? 'Raça do Aventureiro' :
                step === 2 ? 'Classe Heroica' :
                step === 3 ? 'Atributos e Poderes' :
                'Identidade e Personalização'
              }</p>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === s ? 'bg-dnd-gold scale-125' : s < step ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: RACE */}
          {step === 1 && (
            <div>
              <h3 className="font-cinzel font-bold text-base text-gray-200 mb-4">Escolha a sua Raça</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {RACES.map(race => {
                  const isSelected = selectedRace.id === race.id;
                  return (
                    <div
                      key={race.id}
                      onClick={() => setSelectedRace(race)}
                      className={`cursor-pointer border rounded-xl p-4 transition text-left ${
                        isSelected 
                          ? 'border-dnd-gold bg-dnd-gold/10 shadow-lg' 
                          : 'border-dnd-border bg-dnd-darker/60 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-cinzel font-bold text-gray-100">{race.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-dnd-gold" />}
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{race.description}</p>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/40 p-1.5 rounded border border-emerald-900/60 mb-2">
                        Bônus: {Object.entries(race.bonus || {}).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')}
                      </div>
                      <div className="text-[11px] text-gray-300 space-y-0.5">
                        {race.traits.slice(0, 2).map((tr, i) => (
                          <div key={i} className="truncate">• {tr}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CLASS */}
          {step === 2 && (
            <div>
              <h3 className="font-cinzel font-bold text-base text-gray-200 mb-4">Escolha a sua Classe</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CLASSES.map(cls => {
                  const isSelected = selectedClass.id === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedClass(cls)}
                      className={`cursor-pointer border rounded-xl p-4 transition text-left ${
                        isSelected 
                          ? 'border-dnd-gold bg-dnd-gold/10 shadow-lg' 
                          : 'border-dnd-border bg-dnd-darker/60 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-cinzel font-bold text-gray-100">{cls.name}</span>
                          <span className="text-[10px] bg-dnd-darker px-1.5 py-0.5 rounded font-mono text-amber-300 border border-dnd-border">
                            d{cls.hitDie}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-dnd-gold" />}
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{cls.description}</p>
                      <div className="text-[11px] font-mono text-blue-400 font-bold bg-blue-950/40 p-1.5 rounded border border-blue-900/60 mb-2">
                        Salvaguardas: {cls.savingThrows.map(s => s.toUpperCase()).join(' & ')}
                      </div>
                      <div className="text-[11px] text-gray-300 space-y-0.5">
                        {cls.features.map((feat, i) => (
                          <div key={i} className="truncate">• {feat}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: ABILITY SCORES */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-cinzel font-bold text-base text-gray-200">Definição dos Atributos</h3>
                  <p className="text-xs text-gray-400">Atributos definem as capacidades heroicas do seu personagem no sistema D&D.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRollAllStats}
                    className="flex items-center space-x-1.5 bg-dnd-gold hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                  >
                    <Dices className="w-4 h-4" />
                    <span>Rolar 4d6 (Soltar Menor)</span>
                  </button>
                </div>
              </div>

              {/* Ability Scores Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                {ABILITIES.map(ab => {
                  const baseVal = baseStats[ab.id];
                  const bonus = selectedRace.bonus?.[ab.id] || 0;
                  const finalVal = baseVal + bonus;
                  const mod = getAbilityMod(finalVal);

                  return (
                    <div key={ab.id} className="bg-dnd-darker border border-dnd-border rounded-xl p-3 text-center flex flex-col items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{ab.abbr}</span>
                      <span className="text-[10px] text-gray-500">{ab.name}</span>

                      {/* Modifier Large */}
                      <div className="my-2 text-2xl font-cinzel font-black text-dnd-gold">
                        {formatMod(mod)}
                      </div>

                      {/* Total Score */}
                      <div className="text-sm font-mono font-bold text-gray-200 bg-dnd-panel px-3 py-1 rounded-full border border-dnd-border">
                        {finalVal} {bonus > 0 && <span className="text-emerald-400 text-xs">+{bonus}</span>}
                      </div>

                      {/* Base adjust */}
                      <div className="flex items-center space-x-1 mt-2">
                        <button
                          onClick={() => setBaseStats(prev => ({ ...prev, [ab.id]: Math.max(3, prev[ab.id] - 1) }))}
                          className="w-6 h-6 rounded bg-dnd-panel hover:bg-dnd-hover text-gray-300 text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => setBaseStats(prev => ({ ...prev, [ab.id]: Math.min(18, prev[ab.id] + 1) }))}
                          className="w-6 h-6 rounded bg-dnd-panel hover:bg-dnd-hover text-gray-300 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary calculations */}
              <div className="bg-dnd-panel border border-dnd-border rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400">Pontos de Vida (PV)</div>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                    {startingHp} <span className="text-xs text-gray-500">(d{selectedClass.hitDie} + {conMod})</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Classe de Armadura (CA)</div>
                  <div className="text-xl font-mono font-bold text-blue-400 mt-1">
                    {10 + dexMod} <span className="text-xs text-gray-500">(Base + DES)</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Deslocamento</div>
                  <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                    {selectedRace.speed}m <span className="text-xs text-gray-500">({selectedRace.speed / 1.5}q)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: IDENTITY & FINALIZE */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Nome do Personagem *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Bruenor Martelo-de-Guerra, Valeros, Lyra..."
                  className="w-full bg-dnd-darker border border-dnd-border rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-dnd-gold"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Avatar / Ícone do Token
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition ${
                        avatar === av ? 'border-dnd-gold bg-dnd-gold/20 scale-110 shadow' : 'border-dnd-border bg-dnd-darker hover:border-gray-500'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Color */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Cor da Borda no Mapa
                </label>
                <div className="flex items-center space-x-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        color === c ? 'border-white scale-125 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Alinhamento Moral
                </label>
                <select
                  value={alignment}
                  onChange={e => setAlignment(e.target.value)}
                  className="w-full bg-dnd-darker border border-dnd-border rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-dnd-gold"
                >
                  {ALIGNMENTS.map(al => (
                    <option key={al} value={al}>{al}</option>
                  ))}
                </select>
              </div>

              {/* Backstory */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  História / Origem (Opcional)
                </label>
                <textarea
                  value={backstory}
                  onChange={e => setBackstory(e.target.value)}
                  rows={3}
                  placeholder="De onde você vem? Qual seu objetivo nessa aventura?"
                  className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-3 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-dnd-gold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-dnd-darker border-t border-dnd-border px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-gray-400 hover:text-white px-3 py-2 rounded transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-300 px-3 py-2 transition"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center space-x-1.5 bg-dnd-gold hover:bg-amber-400 text-black text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-md"
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!name.trim()}
              className={`flex items-center space-x-1.5 text-xs font-bold px-6 py-2.5 rounded-lg transition shadow-md ${
                name.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Concluir e Entrar no Jogo!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
