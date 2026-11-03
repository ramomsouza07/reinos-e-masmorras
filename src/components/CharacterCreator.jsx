import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sliders,
  Wand2
} from 'lucide-react';
import { 
  RACES, 
  CLASSES, 
  ABILITIES, 
  ITEMS, 
  POINT_BUY_COSTS,
  getAbilityMod, 
  formatMod,
  calculateCharacterDerivedStats
} from '../data/dndData';
import { roll4d6DropLowest } from '../utils/dice';
import Character2DPreview, {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFIT_TYPES,
  OUTFIT_COLORS,
  HEADWEAR_TYPES,
  WEAPON_TYPES
} from './Character2DSprite';
import { sounds } from '../utils/soundEffects';

const AVATARS = ['⚔️', '🧙‍♂️', '🧝‍♀️', '🧔‍♂️', '🏹', '🛡️', '🦹', '👸', '🤴', '🧚', '🧛', '🧙‍♀️', '⚡', '🐉', '🐺', '🦊'];
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#EF4444'];
const ALIGNMENTS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Neutro Puro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'
];

export default function CharacterCreator({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState(RACES[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [alignment, setAlignment] = useState(ALIGNMENTS[0]);
  const [backstory, setBackstory] = useState('');

  // 2D Character Appearance Customizer State
  const [appearance, setAppearance] = useState({
    skinTone: SKIN_TONES[1].color,
    hairStyle: 'short',
    hairColor: HAIR_COLORS[1].color,
    outfitType: 'adventurer',
    outfitColor: OUTFIT_COLORS[0].color,
    outfitSecondaryColor: OUTFIT_COLORS[0].secondary,
    headwear: 'none',
    weapon: 'sword',
    hasShield: true
  });

  // Attribute System Mode: 'pointbuy' | 'standard' | 'roll'
  const [statMode, setStatMode] = useState('pointbuy');
  const [baseStats, setBaseStats] = useState({
    str: 15,
    dex: 13,
    con: 14,
    int: 8,
    wis: 12,
    cha: 10
  });
  const [rollDetails, setRollDetails] = useState({});

  // Calculate Point Buy spent (max 27 points)
  const pointsSpent = Object.values(baseStats).reduce((acc, val) => {
    const clamped = Math.max(8, Math.min(15, val));
    return acc + (POINT_BUY_COSTS[clamped] ?? 0);
  }, 0);
  const pointsRemaining = 27 - pointsSpent;

  // Apply Class Recommended Stats
  const applyRecommendedStats = (cls = selectedClass) => {
    if (cls.recommendedStats) {
      setBaseStats({ ...cls.recommendedStats });
    }
  };

  // Final stats including racial bonuses
  const finalStats = { ...baseStats };
  if (selectedRace.bonus) {
    Object.entries(selectedRace.bonus).forEach(([stat, val]) => {
      finalStats[stat] = (finalStats[stat] || 10) + val;
    });
  }

  const conMod = getAbilityMod(finalStats.con);
  const startingHp = Math.max(6, selectedClass.hitDie + conMod);

  // Build preview character for derived stats
  const previewInventory = (selectedClass.starterGear || []).map(id => ITEMS[id]).filter(Boolean);
  const derived = calculateCharacterDerivedStats({
    classId: selectedClass.id,
    level: 1,
    stats: finalStats,
    inventory: previewInventory
  });

  // Point Buy adjuster
  const handlePointBuyChange = (statId, delta) => {
    const current = baseStats[statId];
    const next = current + delta;

    if (statMode === 'pointbuy') {
      if (next < 8 || next > 15) return;
      const costDiff = POINT_BUY_COSTS[next] - POINT_BUY_COSTS[current];
      if (costDiff > pointsRemaining) return;
    } else {
      if (next < 3 || next > 18) return;
    }

    setBaseStats(prev => ({ ...prev, [statId]: next }));
  };

  // Roll 4d6 drop lowest for all 6 stats
  const handleRollAllStats = () => {
    sounds.playDiceRoll();
    const newStats = {};
    const details = {};
    ABILITIES.forEach(ab => {
      const res = roll4d6DropLowest();
      newStats[ab.id] = res.total;
      details[ab.id] = res;
    });
    setStatMode('roll');
    setBaseStats(newStats);
    setRollDetails(details);
  };

  const handleFinish = () => {
    const finalName = name.trim() || `${selectedClass.name} ${selectedRace.name}`;

    const newCharacter = {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: finalName,
      race: selectedRace.name,
      raceId: selectedRace.id,
      className: selectedClass.name,
      classId: selectedClass.id,
      level: 1,
      xp: 0,
      unspentStatPoints: 0,
      appearance,
      avatar,
      color,
      alignment,
      backstory,
      hitDie: selectedClass.hitDie,
      hp: startingHp,
      maxHp: startingHp,
      tempHp: 0,
      ac: derived.ac,
      speed: selectedRace.speed || 9,
      proficiencyBonus: 2,
      savingThrows: selectedClass.savingThrows || [],
      stats: finalStats,
      gold: selectedClass.startingGold || 120,
      inventory: previewInventory,
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
              <h2 className="font-cinzel font-bold text-lg text-dnd-gold">Criação de Herói (D&D 5e)</h2>
              <p className="text-xs text-gray-400">Etapa {step} de 4: {
                step === 1 ? 'Escolha de Raça e Bônus Raciais' :
                step === 2 ? 'Escolha de Classe e Equipamento Inicial' :
                step === 3 ? 'Sistema de Atributos (Compra de Pontos / Rolagem 4d6)' :
                'Estilização 2D de Roupas & Identidade'
              }</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map(s => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  step === s ? 'bg-dnd-gold text-black scale-110' : s < step ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: RACE */}
          {step === 1 && (
            <div>
              <h3 className="font-cinzel font-bold text-base text-gray-200 mb-3">1. Escolha a Raça do seu Personagem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {RACES.map(race => {
                  const isSelected = selectedRace.id === race.id;
                  return (
                    <div
                      key={race.id}
                      onClick={() => setSelectedRace(race)}
                      className={`cursor-pointer border rounded-xl p-4 transition text-left ${
                        isSelected 
                          ? 'border-dnd-gold bg-dnd-gold/15 shadow-lg' 
                          : 'border-dnd-border bg-dnd-darker/60 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-cinzel font-bold text-gray-100">{race.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-dnd-gold" />}
                      </div>
                      <p className="text-xs text-gray-400 mb-2.5">{race.description}</p>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/50 p-1.5 rounded border border-emerald-800/60 mb-2">
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
              <h3 className="font-cinzel font-bold text-base text-gray-200 mb-3">2. Escolha sua Classe Heroica</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CLASSES.map(cls => {
                  const isSelected = selectedClass.id === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls);
                        if (statMode === 'pointbuy' && cls.recommendedStats) {
                          setBaseStats({ ...cls.recommendedStats });
                        }
                      }}
                      className={`cursor-pointer border rounded-xl p-4 transition text-left ${
                        isSelected 
                          ? 'border-dnd-gold bg-dnd-gold/15 shadow-lg' 
                          : 'border-dnd-border bg-dnd-darker/60 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-cinzel font-bold text-gray-100">{cls.name}</span>
                          <span className="text-[10px] bg-dnd-darker px-1.5 py-0.5 rounded font-mono text-amber-300 border border-dnd-border">
                            Vida d{cls.hitDie}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-dnd-gold" />}
                      </div>
                      <p className="text-xs text-gray-400 mb-2.5">{cls.description}</p>
                      <div className="text-[11px] font-mono text-blue-400 font-bold bg-blue-950/40 p-1.5 rounded border border-blue-900/60 mb-2">
                        Atributo Principal: {cls.primary.toUpperCase()}
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

          {/* STEP 3: COMPREHENSIVE ATTRIBUTE SYSTEM */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Top Mode Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-dnd-darker border border-dnd-border rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatMode('pointbuy');
                      applyRecommendedStats();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      statMode === 'pointbuy' ? 'bg-dnd-gold text-black shadow' : 'bg-dnd-panel text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Compra de 27 Pontos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRollAllStats}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      statMode === 'roll' ? 'bg-dnd-gold text-black shadow' : 'bg-dnd-panel text-gray-400 hover:text-white'
                    }`}
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Rolar 4d6 (Dados)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyRecommendedStats()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800 transition flex items-center space-x-1"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Ideal para {selectedClass.name}</span>
                  </button>
                </div>

                {statMode === 'pointbuy' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Pontos Restantes:</span>
                    <span className={`font-mono font-black text-base px-2.5 py-0.5 rounded-lg border ${
                      pointsRemaining > 0
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                        : 'bg-dnd-panel text-amber-400 border-dnd-border'
                    }`}>
                      {pointsRemaining} / 27
                    </span>
                  </div>
                )}
              </div>

              {/* 6 Attribute Cards with Detailed Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ABILITIES.map(ab => {
                  const baseVal = baseStats[ab.id] || 10;
                  const racialBonus = selectedRace.bonus?.[ab.id] || 0;
                  const finalVal = baseVal + racialBonus;
                  const mod = getAbilityMod(finalVal);
                  const isPrimary = selectedClass.primary === ab.id;
                  const rDetail = rollDetails[ab.id];

                  return (
                    <div
                      key={ab.id}
                      className={`bg-dnd-darker border rounded-xl p-3.5 flex flex-col justify-between transition ${
                        isPrimary ? 'border-dnd-gold shadow-md' : 'border-dnd-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-lg">{ab.icon}</span>
                            <span className="font-cinzel font-bold text-sm text-gray-100">{ab.name} ({ab.abbr})</span>
                          </div>
                          {isPrimary && (
                            <span className="text-[9px] bg-dnd-gold text-black font-black px-1.5 py-0.5 rounded uppercase">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mb-3">{ab.desc}</p>
                      </div>

                      {/* Score & Modifier Display */}
                      <div className="flex items-center justify-between bg-dnd-panel border border-dnd-border rounded-xl p-2.5 my-1">
                        <div>
                          <div className="text-[10px] text-gray-400">
                            Base {baseVal} {racialBonus > 0 && <span className="text-emerald-400 font-bold">+ {racialBonus} ({selectedRace.name})</span>}
                          </div>
                          <div className="text-xl font-mono font-black text-white">
                            Total: {finalVal}
                          </div>
                          {statMode === 'roll' && rDetail && (
                            <div className="text-[10px] font-mono text-amber-400">
                              4d6: [{rDetail.rolls.join(', ')}] (soltou {rDetail.dropped})
                            </div>
                          )}
                        </div>

                        {/* Big Modifier Badge */}
                        <div className="text-center bg-dnd-darker border border-dnd-gold/60 px-3 py-1.5 rounded-xl">
                          <div className="text-[9px] uppercase text-gray-400 font-bold">Modificador</div>
                          <div className="text-xl font-cinzel font-black text-dnd-gold">
                            {formatMod(mod)}
                          </div>
                        </div>
                      </div>

                      {/* +/- Controls */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dnd-border/50">
                        <span className="text-[10px] text-gray-400">
                          {statMode === 'pointbuy' ? `Custo: ${POINT_BUY_COSTS[Math.max(8, Math.min(15, baseVal))] || 0} pts` : 'Ajustar Valor:'}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handlePointBuyChange(ab.id, -1)}
                            className="w-7 h-7 rounded-lg bg-dnd-panel hover:bg-red-950 border border-dnd-border text-gray-200 font-bold text-sm"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center">{baseVal}</span>
                          <button
                            type="button"
                            onClick={() => handlePointBuyChange(ab.id, 1)}
                            className="w-7 h-7 rounded-lg bg-dnd-panel hover:bg-emerald-950 border border-dnd-border text-gray-200 font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Derived Combat Statistics Preview */}
              <div className="bg-dnd-panel border border-dnd-gold/40 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Pontos de Vida</div>
                  <div className="text-lg font-cinzel font-black text-emerald-400">{startingHp} PV</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Armadura (CA)</div>
                  <div className="text-lg font-cinzel font-black text-blue-400">{derived.ac}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Ataque Corpo-a-Corpo</div>
                  <div className="text-lg font-cinzel font-black text-amber-400">{formatMod(derived.meleeAtkBonus)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Ataque à Distância</div>
                  <div className="text-lg font-cinzel font-black text-amber-400">{formatMod(derived.rangedAtkBonus)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Carga Máxima</div>
                  <div className="text-lg font-cinzel font-black text-purple-400">{derived.carryCapacity} kg</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: 2D CHARACTER & CUSTOMIZATION */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Top Banner: Character Preview & Identity */}
              <div className="bg-dnd-darker border border-dnd-gold/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
                <div className="flex flex-col items-center justify-center p-3 bg-dnd-panel border border-dnd-border rounded-2xl shadow-inner min-w-[130px]">
                  <Character2DPreview appearance={appearance} size={100} />
                  <span className="text-[10px] font-bold text-dnd-gold uppercase tracking-wider mt-1">
                    Visual 2D do Herói
                  </span>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Nome do Seu Herói
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={`Ex: ${selectedClass.name} ${selectedRace.name}`}
                      className="w-full bg-dnd-panel border border-dnd-border rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-dnd-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                        Alinhamento Moral
                      </label>
                      <select
                        value={alignment}
                        onChange={e => setAlignment(e.target.value)}
                        className="w-full bg-dnd-panel border border-dnd-border rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-dnd-gold"
                      >
                        {ALIGNMENTS.map(al => (
                          <option key={al} value={al}>{al}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                        Cor da Borda no Mapa
                      </label>
                      <div className="flex items-center space-x-2 pt-1">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition ${
                              color === c ? 'border-white scale-125 shadow-lg' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalização 2D de Roupas & Estilo */}
              <div className="bg-dnd-darker border border-dnd-border rounded-2xl p-4 space-y-4">
                <div className="flex items-center space-x-2 border-b border-dnd-border/60 pb-2">
                  <span className="text-sm font-cinzel font-bold text-dnd-gold">
                    🎨 Estilização 2D de Roupas & Aparência
                  </span>
                </div>

                {/* 1. Tom de Pele */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    1. Tom de Pele
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setAppearance(prev => ({ ...prev, skinTone: st.color }))}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
                          appearance.skinTone === st.color
                            ? 'bg-dnd-gold/20 border-dnd-gold text-white font-bold'
                            : 'bg-dnd-panel border-dnd-border text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: st.color }} />
                        <span>{st.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Cabelo & Penteado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      2. Estilo de Cabelo
                    </label>
                    <select
                      value={appearance.hairStyle}
                      onChange={e => setAppearance(prev => ({ ...prev, hairStyle: e.target.value }))}
                      className="w-full bg-dnd-panel border border-dnd-border rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-dnd-gold"
                    >
                      {HAIR_STYLES.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Cor do Cabelo
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {HAIR_COLORS.map(hc => (
                        <button
                          key={hc.id}
                          type="button"
                          onClick={() => setAppearance(prev => ({ ...prev, hairColor: hc.color }))}
                          title={hc.name}
                          className={`w-6 h-6 rounded-full border-2 transition ${
                            appearance.hairColor === hc.color ? 'border-white scale-125 shadow-md' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: hc.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Traje / Roupas / Armadura */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    3. Tipo de Roupa / Armadura
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {OUTFIT_TYPES.map(outfit => (
                      <button
                        key={outfit.id}
                        type="button"
                        onClick={() => setAppearance(prev => ({ ...prev, outfitType: outfit.id }))}
                        className={`text-left p-2.5 rounded-xl border transition ${
                          appearance.outfitType === outfit.id
                            ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold font-bold shadow'
                            : 'bg-dnd-panel border-dnd-border text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-xs truncate">{outfit.name}</div>
                        <div className="text-[10px] text-gray-400 line-clamp-1">{outfit.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 mt-2">
                      Cor da Roupa
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OUTFIT_COLORS.map(oc => (
                        <button
                          key={oc.id}
                          type="button"
                          onClick={() => setAppearance(prev => ({
                            ...prev,
                            outfitColor: oc.color,
                            outfitSecondaryColor: oc.secondary
                          }))}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs transition ${
                            appearance.outfitColor === oc.color
                              ? 'bg-white/10 border-white text-white font-bold'
                              : 'bg-dnd-panel border-dnd-border text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: oc.color }} />
                          <span className="text-[11px]">{oc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Chapéu / Elmo & Armas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-dnd-border/60">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      4. Chapéu / Elmo
                    </label>
                    <select
                      value={appearance.headwear}
                      onChange={e => setAppearance(prev => ({ ...prev, headwear: e.target.value }))}
                      className="w-full bg-dnd-panel border border-dnd-border rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-dnd-gold"
                    >
                      {HEADWEAR_TYPES.map(hw => (
                        <option key={hw.id} value={hw.id}>{hw.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      5. Arma Principal
                    </label>
                    <select
                      value={appearance.weapon}
                      onChange={e => setAppearance(prev => ({ ...prev, weapon: e.target.value }))}
                      className="w-full bg-dnd-panel border border-dnd-border rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-dnd-gold"
                    >
                      {WEAPON_TYPES.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      6. Escudo
                    </label>
                    <button
                      type="button"
                      onClick={() => setAppearance(prev => ({ ...prev, hasShield: !prev.hasShield }))}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        appearance.hasShield
                          ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                          : 'bg-dnd-panel border-dnd-border text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span>🛡️ {appearance.hasShield ? 'Escudo Equipado' : 'Sem Escudo'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
              <span>Próximo Passo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Concluir Herói!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
