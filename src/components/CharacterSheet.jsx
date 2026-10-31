import React, { useState } from 'react';
import { 
  Heart, 
  Shield, 
  Zap, 
  Award, 
  Sparkles, 
  Sword, 
  Plus, 
  Minus, 
  Moon, 
  Sun, 
  Coins,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { 
  ABILITIES, 
  SKILLS, 
  SPELLS, 
  LEVEL_XP_TABLE,
  getAbilityMod, 
  formatMod,
  calculateCharacterDerivedStats
} from '../data/dndData';
import { rollD20, parseDiceFormula } from '../utils/dice';
import { sounds } from '../utils/soundEffects';

export default function CharacterSheet({ character, onUpdate, socket, room }) {
  const [activeTab, setActiveTab] = useState('attributes'); // 'attributes' | 'combat' | 'skills' | 'spells' | 'inventory'
  const [advantageType, setAdvantageType] = useState('normal');
  const [editStatsMode, setEditStatsMode] = useState(false);

  if (!character) return null;

  const stats = character.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const derived = calculateCharacterDerivedStats(character);
  const profBonus = derived.profBonus;
  const currentLvl = character.level || 1;
  const nextLvlXp = LEVEL_XP_TABLE[currentLvl + 1] || (currentLvl * 1000);
  const unspentPoints = character.unspentStatPoints || 0;

  // HP adjustments
  const adjustHp = (delta) => {
    const newHp = Math.max(0, Math.min(character.maxHp, (character.hp || 0) + delta));
    const updated = { ...character, hp: newHp };
    if (delta > 0) sounds.playHeal();
    else sounds.playAttack();
    onUpdate(updated);
  };

  // Spend unspent attribute point or edit attribute
  const handleModifyAttribute = (statId, delta) => {
    const currentVal = stats[statId] || 10;
    if (delta > 0 && unspentPoints > 0 && !editStatsMode) {
      if (currentVal >= 20) return;
      const newStats = { ...stats, [statId]: currentVal + 1 };
      let newMaxHp = character.maxHp;
      let newHp = character.hp;
      if (statId === 'con' && (currentVal + 1) % 2 === 0) {
        newMaxHp += currentLvl;
        newHp += currentLvl;
      }
      sounds.playCriticalSuccess();
      onUpdate({
        ...character,
        stats: newStats,
        maxHp: newMaxHp,
        hp: newHp,
        unspentStatPoints: unspentPoints - 1
      });
    } else if (editStatsMode) {
      const nextVal = Math.max(3, Math.min(20, currentVal + delta));
      const newStats = { ...stats, [statId]: nextVal };
      onUpdate({ ...character, stats: newStats });
    }
  };

  // Manual Level Up button
  const handleManualLevelUp = () => {
    sounds.playCriticalSuccess();
    const newLvl = currentLvl + 1;
    const conMod = getAbilityMod(stats.con);
    const hpGain = Math.max(4, Math.floor((character.hitDie || 8) / 2) + 1 + conMod);
    const updated = {
      ...character,
      level: newLvl,
      maxHp: (character.maxHp || 10) + hpGain,
      hp: (character.maxHp || 10) + hpGain,
      unspentStatPoints: (character.unspentStatPoints || 0) + 2
    };
    onUpdate(updated);

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'narration',
      content: `🎉 **${character.name}** avançou para o **Nível ${newLvl}**! Ganhou +${hpGain} PV máximos e +2 Pontos de Atributo!`
    });
  };

  // Roll ability check or saving throw
  const handleRollCheck = (name, mod, isSave = false) => {
    sounds.playDiceRoll();
    const result = rollD20(mod, advantageType);
    if (result.isNat20) sounds.playCriticalSuccess();
    else if (result.isNat1) sounds.playCriticalFail();

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'roll',
      content: `rolou **${isSave ? 'Salvaguarda de ' : 'Teste de '}${name}**: **${result.total}** (${result.selectedRoll} ${formatMod(mod)})`,
      rollData: {
        title: `${isSave ? 'Salvaguarda' : 'Teste'}: ${name}`,
        ...result
      }
    });
  };

  // Roll weapon attack
  const handleWeaponAttack = (weapon) => {
    sounds.playAttack();
    const isFinesse = weapon.properties?.includes('Finesse');
    const isRanged = (weapon.range || 1.5) > 3;
    const useDex = isRanged || (isFinesse && stats.dex > stats.str);
    const mod = getAbilityMod(useDex ? stats.dex : stats.str) + profBonus;

    const result = rollD20(mod, advantageType);
    const parsedDmg = parseDiceFormula(weapon.damage || '1d8');
    const dmgMod = getAbilityMod(useDex ? stats.dex : stats.str);
    const totalDmg = Math.max(1, (parsedDmg?.total || 4) + dmgMod);

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'roll',
      content: `⚔️ ataca com **${weapon.name}**! Ataque: **${result.total}** vs CA | Dano: **${totalDmg}** ${weapon.damageType || ''}`,
      rollData: {
        title: `${weapon.name} (Ataque: ${result.total} | Dano: ${totalDmg})`,
        ...result
      }
    });
  };

  // Short rest
  const handleShortRest = () => {
    sounds.playHeal();
    const conMod = getAbilityMod(stats.con);
    const dieRoll = Math.floor(Math.random() * (character.hitDie || 8)) + 1;
    const heal = Math.max(2, dieRoll + conMod);
    const newHp = Math.min(character.maxHp, character.hp + heal);

    onUpdate({ ...character, hp: newHp });
    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'chat',
      content: `🌙 completou um **Descanso Curto** e recuperou **+${heal} PV**! (${newHp}/${character.maxHp} PV)`
    });
  };

  // Long rest
  const handleLongRest = () => {
    sounds.playHeal();
    const updated = {
      ...character,
      hp: character.maxHp,
      tempHp: 0,
      deathSaves: { successes: 0, failures: 0 }
    };
    onUpdate(updated);
    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'chat',
      content: `☀️ completou um **Descanso Longo** (8h) e restaurou todos os **${character.maxHp} PV** e energias!`
    });
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-dnd-darker text-gray-200 p-4 select-none">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* CHARACTER HEADER */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-16 h-16 rounded-2xl bg-dnd-darker border-2 border-dnd-gold flex items-center justify-center text-3xl shadow-inner">
              {character.avatar || '⚔️'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-cinzel font-black text-xl text-dnd-gold">{character.name}</h2>
                <span className="text-xs bg-dnd-gold text-black font-bold px-2 py-0.5 rounded">
                  Nível {currentLvl}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {character.race} • {character.className} • {character.alignment}
              </p>
              {/* XP Bar */}
              <div className="flex items-center space-x-2 mt-1.5">
                <div className="w-36 h-2 bg-dnd-darker rounded-full overflow-hidden border border-dnd-border">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${Math.min(100, ((character.xp || 0) / nextLvlXp) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-amber-400">
                  {character.xp || 0} / {nextLvlXp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualLevelUp}
              className="flex items-center space-x-1 bg-purple-900/80 hover:bg-purple-800 border border-purple-500 text-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
              title="Avançar nível do personagem (+PV e +2 Pontos de Atributo)"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Evoluir Nível</span>
            </button>
            <button
              onClick={handleShortRest}
              className="flex items-center space-x-1.5 bg-dnd-darker hover:bg-dnd-hover border border-dnd-border px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 transition"
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span>Descanso Curto</span>
            </button>
            <button
              onClick={handleLongRest}
              className="flex items-center space-x-1.5 bg-dnd-gold/20 hover:bg-dnd-gold/30 border border-dnd-gold text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Descanso Longo</span>
            </button>
          </div>
        </div>

        {/* UNSPENT ATTRIBUTE POINTS BANNER */}
        {unspentPoints > 0 && (
          <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-3.5 flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-cinzel font-bold text-sm text-emerald-300">
                  Você tem +{unspentPoints} Ponto(s) de Atributo para distribuir!
                </h4>
                <p className="text-xs text-emerald-200">
                  Clique no botão "+1" em qualquer atributo abaixo para fortalecer seu herói permanentemente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VITALS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          {/* HP Card */}
          <div className="col-span-2 bg-dnd-panel border border-dnd-border rounded-xl p-3 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Vida (PV)
              </span>
              <span className="text-lg font-cinzel font-black text-emerald-400">
                {character.hp} / {character.maxHp}
              </span>
            </div>
            <div className="w-full h-2 bg-dnd-darker rounded-full overflow-hidden my-2 border border-dnd-border">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100))}%` }}
              />
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => adjustHp(-5)} className="flex-1 py-1 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold rounded">-5</button>
              <button onClick={() => adjustHp(-1)} className="flex-1 py-1 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold rounded">-1</button>
              <button onClick={() => adjustHp(1)} className="flex-1 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded">+1</button>
              <button onClick={() => adjustHp(5)} className="flex-1 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded">+5</button>
            </div>
          </div>

          <div className="bg-dnd-panel border border-dnd-border rounded-xl p-3 text-center flex flex-col justify-center items-center shadow">
            <Shield className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Classe Armadura</span>
            <span className="text-2xl font-cinzel font-black text-blue-400">{derived.ac}</span>
          </div>

          <div
            onClick={() => handleRollCheck('Iniciativa', derived.initiative)}
            className="cursor-pointer bg-dnd-panel border border-dnd-border hover:border-dnd-gold rounded-xl p-3 text-center flex flex-col justify-center items-center shadow"
          >
            <Zap className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Iniciativa</span>
            <span className="text-2xl font-cinzel font-black text-amber-400">{formatMod(derived.initiative)}</span>
          </div>

          <div className="bg-dnd-panel border border-dnd-border rounded-xl p-3 text-center flex flex-col justify-center items-center shadow">
            <Award className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Proficiência</span>
            <span className="text-2xl font-cinzel font-black text-purple-400">+{profBonus}</span>
          </div>

          <div className="bg-dnd-panel border border-dnd-border rounded-xl p-3 text-center flex flex-col justify-center items-center shadow">
            <Coins className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Ouro (PO)</span>
            <span className="text-2xl font-cinzel font-black text-amber-400">{character.gold || 0}</span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl overflow-hidden shadow-xl">
          <div className="flex border-b border-dnd-border bg-dnd-darker/60 text-xs font-semibold">
            {[
              { id: 'attributes', label: '📊 Sistema de Atributos' },
              { id: 'combat', label: '⚔️ Armas & Combate' },
              { id: 'skills', label: '🎯 Perícias & Salvaguardas' },
              { id: 'spells', label: '🔮 Magias' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-3 text-center border-b-2 transition ${
                  activeTab === t.id ? 'border-dnd-gold text-dnd-gold bg-dnd-panel font-bold' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* TAB 1: DETAILED ATTRIBUTE SYSTEM */}
            {activeTab === 'attributes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-cinzel font-bold text-base text-dnd-gold">Atributos Primários & Impacto em Jogo</h3>
                    <p className="text-xs text-gray-400">Clique em qualquer atributo para rolar um Teste de Habilidade (1d20 + Modificador).</p>
                  </div>
                  <button
                    onClick={() => setEditStatsMode(!editStatsMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center space-x-1.5 transition ${
                      editStatsMode
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-dnd-darker text-gray-300 border-dnd-border hover:border-gray-500'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{editStatsMode ? 'Concluir Edição Livre' : 'Editar Atributos Manualmente'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {ABILITIES.map(ab => {
                    const val = stats[ab.id] || 10;
                    const mod = getAbilityMod(val);
                    const hasSaveProf = character.savingThrows?.includes(ab.id);

                    return (
                      <div
                        key={ab.id}
                        className="bg-dnd-darker border border-dnd-border hover:border-dnd-gold/70 rounded-2xl p-4 flex flex-col justify-between shadow transition"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{ab.icon}</span>
                              <div>
                                <h4 className="font-cinzel font-bold text-sm text-gray-100">{ab.name} ({ab.abbr})</h4>
                                {hasSaveProf && (
                                  <span className="text-[10px] text-emerald-400 font-semibold">★ Proficiente em Salvaguarda</span>
                                )}
                              </div>
                            </div>

                            {/* Big Clickable Modifier */}
                            <button
                              onClick={() => handleRollCheck(ab.name, mod, false)}
                              className="bg-dnd-panel hover:bg-dnd-gold hover:text-black border border-dnd-gold/60 px-3 py-1.5 rounded-xl text-center transition group"
                              title={`Rolar Teste de ${ab.name}`}
                            >
                              <div className="text-[9px] uppercase opacity-75 font-bold">Rolar d20</div>
                              <div className="text-xl font-cinzel font-black text-dnd-gold group-hover:text-black">
                                {formatMod(mod)}
                              </div>
                            </button>
                          </div>

                          {/* Effects list */}
                          <ul className="text-[11px] text-gray-400 space-y-1 my-2.5 pl-1">
                            {ab.effects.map((ef, i) => (
                              <li key={i}>• {ef}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Bottom Value & Upgrade Bar */}
                        <div className="pt-2.5 border-t border-dnd-border/60 flex items-center justify-between">
                          <div className="text-xs font-mono">
                            Valor Total: <span className="font-bold text-white text-sm">{val}</span> / 20
                          </div>

                          {(unspentPoints > 0 && !editStatsMode) && (
                            <button
                              onClick={() => handleModifyAttribute(ab.id, 1)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow flex items-center space-x-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Aumentar (+1)</span>
                            </button>
                          )}

                          {editStatsMode && (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleModifyAttribute(ab.id, -1)}
                                className="w-7 h-7 rounded bg-dnd-panel hover:bg-red-950 border border-dnd-border text-white font-bold"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleModifyAttribute(ab.id, 1)}
                                className="w-7 h-7 rounded bg-dnd-panel hover:bg-emerald-950 border border-dnd-border text-white font-bold"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Derived Statistics Summary Box */}
                <div className="bg-dnd-darker border border-dnd-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Bônus Ataque Corpo-a-Corpo:</span>
                    <span className="font-mono font-bold text-sm text-amber-400">{formatMod(derived.meleeAtkBonus)} (FOR + Prof)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Bônus Ataque à Distância:</span>
                    <span className="font-mono font-bold text-sm text-amber-400">{formatMod(derived.rangedAtkBonus)} (DES + Prof)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">CD de Resistência à Magia:</span>
                    <span className="font-mono font-bold text-sm text-purple-400">CD {derived.spellSaveDC}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Percepção Passiva / Carga:</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">{derived.passivePerception} / {derived.carryCapacity} kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMBAT & WEAPONS */}
            {activeTab === 'combat' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Armas Equipadas</h4>
                {(character.inventory || []).filter(i => i.type === 'weapon').map((w, idx) => (
                  <div key={idx} className="bg-dnd-darker border border-dnd-border rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-gray-100 flex items-center gap-1.5">
                        <Sword className="w-4 h-4 text-dnd-gold" />
                        <span>{w.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Dano: {w.damage} {w.damageType} • Alcance: {w.range || 1.5}m • {w.properties?.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleWeaponAttack(w)}
                      className="bg-dnd-gold hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition shadow"
                    >
                      Rolar Ataque & Dano
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SKILLS & SAVES */}
            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SKILLS.map(sk => {
                  const mod = getAbilityMod(stats[sk.ability]);
                  return (
                    <div
                      key={sk.id}
                      onClick={() => handleRollCheck(sk.name, mod, false)}
                      className="cursor-pointer bg-dnd-darker border border-dnd-border hover:border-dnd-gold rounded-lg px-3 py-2 text-xs flex items-center justify-between transition"
                    >
                      <span className="text-gray-200">
                        {sk.name} <span className="text-[10px] text-gray-500 font-mono">({sk.ability.toUpperCase()})</span>
                      </span>
                      <span className="font-mono font-bold text-dnd-gold">{formatMod(mod)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 4: SPELLS */}
            {activeTab === 'spells' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPELLS.map(sp => (
                  <div key={sp.id} className="bg-dnd-darker border border-dnd-border rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-200">{sp.name}</span>
                        <span className="text-[10px] bg-dnd-panel px-1.5 py-0.5 rounded font-mono text-purple-400">
                          {sp.level === 0 ? 'Truque' : `Círculo ${sp.level}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{sp.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-dnd-border/50 flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-mono">
                        {sp.damage ? `Dano: ${sp.damage}` : `Cura: ${sp.heal}`}
                      </span>
                      <span className="text-gray-400">Alcance: {sp.range}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
