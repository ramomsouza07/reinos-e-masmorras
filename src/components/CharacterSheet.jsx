import React, { useState } from 'react';
import { 
  Heart, 
  Shield, 
  Zap, 
  Award, 
  Dices, 
  Sparkles, 
  Sword, 
  Plus, 
  Minus, 
  Moon, 
  Sun, 
  Package, 
  Crosshair,
  Flame,
  CheckCircle2,
  XCircle,
  Coins
} from 'lucide-react';
import { ABILITIES, SKILLS, getAbilityMod, formatMod, SPELLS } from '../data/dndData';
import { rollD20, parseDiceFormula } from '../utils/dice';
import { sounds } from '../utils/soundEffects';

export default function CharacterSheet({ character, onUpdate, socket, room }) {
  const [activeTab, setActiveTab] = useState('combat'); // 'combat' | 'skills' | 'spells' | 'inventory'
  const [advantageType, setAdvantageType] = useState('normal'); // 'normal' | 'advantage' | 'disadvantage'

  if (!character) return null;

  const profBonus = character.proficiencyBonus || 2;
  const stats = character.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  // HP adjustments
  const adjustHp = (delta) => {
    const newHp = Math.max(0, Math.min(character.maxHp, (character.hp || 0) + delta));
    const updated = { ...character, hp: newHp };
    if (delta > 0) sounds.playHeal();
    else sounds.playAttack();
    onUpdate(updated);
  };

  // Roll ability check or saving throw
  const handleRollCheck = (name, mod, isSave = false) => {
    sounds.playDiceRoll();
    const result = rollD20(mod, advantageType);
    
    if (result.isNat20) sounds.playCriticalSuccess();
    else if (result.isNat1) sounds.playCriticalFail();

    // Broadcast roll to chat
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
    const isRanged = weapon.properties?.some(p => p.includes('Munição') || p.includes('Arremesso'));
    const useDex = isRanged || (isFinesse && stats.dex > stats.str);
    const mod = getAbilityMod(useDex ? stats.dex : stats.str) + profBonus;

    const result = rollD20(mod, advantageType);
    if (result.isNat20) sounds.playCriticalSuccess();
    else if (result.isNat1) sounds.playCriticalFail();

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'roll',
      content: `ataca com **${weapon.name}**! Jogada de Ataque: **${result.total}** vs CA`,
      rollData: {
        title: `Ataque: ${weapon.name}`,
        ...result
      }
    });
  };

  // Roll weapon damage
  const handleWeaponDamage = (weapon) => {
    sounds.playAttack();
    const isFinesse = weapon.properties?.includes('Finesse');
    const isRanged = weapon.properties?.some(p => p.includes('Munição') || p.includes('Arremesso'));
    const useDex = isRanged || (isFinesse && stats.dex > stats.str);
    const statMod = getAbilityMod(useDex ? stats.dex : stats.str);

    const dmgFormula = weapon.damage || '1d6';
    const parsed = parseDiceFormula(dmgFormula);
    const totalDmg = Math.max(1, (parsed?.total || 1) + statMod);

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'roll',
      content: `acertou o golpe! Dano de **${weapon.name}**: **${totalDmg}** de dano ${weapon.damageType || ''} (${parsed?.rolls.join('+')} ${formatMod(statMod)})`,
      rollData: {
        title: `Dano: ${weapon.name}`,
        total: totalDmg,
        rolls: parsed?.rolls,
        mod: statMod
      }
    });
  };

  // Cast Spell
  const handleCastSpell = (spell) => {
    sounds.playSpell();
    let dmgTotal = null;
    let healTotal = null;

    if (spell.damage) {
      const parsed = parseDiceFormula(spell.damage);
      dmgTotal = parsed?.total;
    } else if (spell.heal) {
      const parsed = parseDiceFormula('1d8');
      const mod = getAbilityMod(stats.wis || stats.int || 10);
      healTotal = (parsed?.total || 1) + mod;
    }

    // Deduct spell slot if 1st level or higher
    if (spell.level > 0 && character.spellSlots?.[spell.level]) {
      const current = character.spellSlots[spell.level].current;
      if (current > 0) {
        const updated = {
          ...character,
          spellSlots: {
            ...character.spellSlots,
            [spell.level]: { ...character.spellSlots[spell.level], current: current - 1 }
          }
        };
        onUpdate(updated);
      }
    }

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'roll',
      content: `lança **${spell.name}** (${spell.level === 0 ? 'Truque' : `Círculo ${spell.level}`})! ${
        dmgTotal ? `Dano: **${dmgTotal}** ${spell.damageType}` : ''
      }${healTotal ? `Cura: **+${healTotal} PV**` : ''}`,
      rollData: {
        title: `Magia: ${spell.name}`,
        total: dmgTotal || healTotal,
        desc: spell.desc
      }
    });
  };

  // Use potion
  const handleUsePotion = (itemIndex) => {
    const item = character.inventory?.[itemIndex];
    if (!item) return;

    sounds.playHeal();
    let healAmount = 7;
    if (item.id === 'pocao_cura') healAmount = Math.floor(Math.random() * 8) + 4; // 2d4+2
    else if (item.id === 'pocao_cura_maior') healAmount = Math.floor(Math.random() * 16) + 8; // 4d4+4

    const newHp = Math.min(character.maxHp, character.hp + healAmount);
    const newInventory = [...character.inventory];
    newInventory.splice(itemIndex, 1);

    onUpdate({
      ...character,
      hp: newHp,
      inventory: newInventory
    });

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'chat',
      content: `bebeu **${item.name}** e recuperou **+${healAmount} PV**! (PV atual: ${newHp}/${character.maxHp})`
    });
  };

  // Short rest
  const handleShortRest = () => {
    sounds.playHeal();
    const conMod = getAbilityMod(stats.con);
    const dieRoll = Math.floor(Math.random() * character.hitDie) + 1;
    const heal = Math.max(1, dieRoll + conMod);
    const newHp = Math.min(character.maxHp, character.hp + heal);

    onUpdate({ ...character, hp: newHp });

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'chat',
      content: `completou um **Descanso Curto** (1h), gastou um Dado de Vida (d${character.hitDie} + ${conMod}) e recuperou **+${heal} PV**!`
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
    if (updated.spellSlots) {
      Object.keys(updated.spellSlots).forEach(lvl => {
        updated.spellSlots[lvl].current = updated.spellSlots[lvl].total;
      });
    }

    onUpdate(updated);

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'chat',
      content: `completou um **Descanso Longo** (8h)! Recuperou todos os seus **${character.maxHp} Pontos de Vida** e todos os espaços de magia.`
    });
  };

  // Death Save roll
  const handleDeathSave = () => {
    sounds.playDiceRoll();
    const roll = Math.floor(Math.random() * 20) + 1;
    const current = character.deathSaves || { successes: 0, failures: 0 };
    let newS = current.successes;
    let newF = current.failures;

    if (roll === 20) {
      sounds.playCriticalSuccess();
      onUpdate({ ...character, hp: 1, deathSaves: { successes: 0, failures: 0 } });
      socket.emit('chat:send', {
        sender: character.name,
        senderType: 'player',
        type: 'roll',
        content: `ROLOU 20 NATURAL NA SALVAGUARDA CONTRA A MORTE! Volta à vida com 1 PV! 🎉`
      });
      return;
    } else if (roll === 1) {
      sounds.playCriticalFail();
      newF += 2;
    } else if (roll >= 10) {
      newS += 1;
    } else {
      newF += 1;
    }

    onUpdate({ ...character, deathSaves: { successes: newS, failures: newF } });

    socket.emit('chat:send', {
      sender: character.name,
      senderType: 'player',
      type: 'roll',
      content: `rolou Salvaguarda contra a Morte: **${roll}** (${roll >= 10 ? 'SUCESSO' : 'FALHA'})! [Sucessos: ${newS}/3 | Falhas: ${newF}/3]`
    });
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-dnd-darker text-gray-200 p-4 select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* CHARACTER HEADER */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-dnd-darker border-2 border-dnd-gold flex items-center justify-center text-3xl shadow-inner">
              {character.avatar || '🛡️'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-cinzel font-black text-xl text-dnd-gold">{character.name}</h2>
                <span className="text-xs bg-dnd-darker px-2 py-0.5 rounded font-mono text-gray-300 border border-dnd-border">
                  Nv. {character.level || 1}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {character.race} • {character.className} • {character.alignment}
              </p>
            </div>
          </div>

          {/* Rest Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShortRest}
              className="flex items-center space-x-1.5 bg-dnd-darker hover:bg-dnd-hover border border-dnd-border px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 transition"
              title="Descanso Curto (1 hora): Cura gastando Dado de Vida"
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span>Descanso Curto</span>
            </button>
            <button
              onClick={handleLongRest}
              className="flex items-center space-x-1.5 bg-dnd-gold/20 hover:bg-dnd-gold/30 border border-dnd-gold text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              title="Descanso Longo (8 horas): Recupera todo PV e Magias"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Descanso Longo</span>
            </button>
          </div>
        </div>

        {/* VITALS ROW (HP, AC, Speed, Initiative, Proficiency) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* HP Card */}
          <div className="col-span-2 bg-dnd-panel border border-dnd-border rounded-xl p-3 shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Pontos de Vida
              </span>
              <span className="text-xs font-mono text-gray-400">Max: {character.maxHp}</span>
            </div>

            <div className="my-2 flex items-baseline space-x-2">
              <span className="text-3xl font-cinzel font-black text-emerald-400">{character.hp}</span>
              <span className="text-sm font-mono text-gray-500">/ {character.maxHp}</span>
            </div>

            {/* HP progress bar */}
            <div className="w-full h-2 bg-dnd-darker rounded-full overflow-hidden mb-2 border border-dnd-border">
              <div
                className={`h-full transition-all duration-300 ${
                  (character.hp / character.maxHp) > 0.5 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100))}%` }}
              />
            </div>

            {/* Quick adjust buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => adjustHp(-5)}
                className="flex-1 py-1 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold rounded"
              >
                -5
              </button>
              <button
                onClick={() => adjustHp(-1)}
                className="flex-1 py-1 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold rounded"
              >
                -1
              </button>
              <button
                onClick={() => adjustHp(1)}
                className="flex-1 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold rounded"
              >
                +1
              </button>
              <button
                onClick={() => adjustHp(5)}
                className="flex-1 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold rounded"
              >
                +5
              </button>
            </div>
          </div>

          {/* AC */}
          <div className="bg-dnd-panel border border-dnd-border rounded-xl p-3 text-center flex flex-col justify-center items-center shadow">
            <Shield className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Armadura (CA)</span>
            <span className="text-2xl font-cinzel font-black text-blue-400 mt-1">{character.ac}</span>
          </div>

          {/* Initiative */}
          <div 
            onClick={() => handleRollCheck('Iniciativa', getAbilityMod(stats.dex))}
            className="cursor-pointer bg-dnd-panel border border-dnd-border hover:border-dnd-gold rounded-xl p-3 text-center flex flex-col justify-center items-center shadow transition group"
            title="Clique para rolar Iniciativa"
          >
            <Zap className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Iniciativa</span>
            <span className="text-2xl font-cinzel font-black text-amber-400 mt-1">
              {formatMod(getAbilityMod(stats.dex))}
            </span>
          </div>

          {/* Speed & Prof */}
          <div className="bg-dnd-panel border border-dnd-border rounded-xl p-3 text-center flex flex-col justify-center items-center shadow">
            <Award className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Proficiência</span>
            <span className="text-2xl font-cinzel font-black text-purple-400 mt-1">+{profBonus}</span>
          </div>
        </div>

        {/* DEATH SAVES (Shows if HP <= 0) */}
        {character.hp <= 0 && (
          <div className="bg-red-950/80 border-2 border-red-600 rounded-xl p-4 shadow-xl animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💀</span>
                <div>
                  <h4 className="font-cinzel font-bold text-red-200 text-sm">TESTES CONTRA A MORTE</h4>
                  <p className="text-xs text-red-300">Seu herói caiu! Role d20 (10+ sucesso, 3 sucessos estabiliza, 3 falhas morre)</p>
                </div>
              </div>
              <button
                onClick={handleDeathSave}
                className="bg-red-700 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow transition"
              >
                Rolar Salvaguarda (d20)
              </button>
            </div>

            <div className="flex items-center justify-around text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-emerald-400">Sucessos:</span>
                {[1, 2, 3].map(i => (
                  <span key={i} className={`text-base ${i <= (character.deathSaves?.successes || 0) ? 'text-emerald-400' : 'text-gray-600'}`}>
                    ●
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-400">Falhas:</span>
                {[1, 2, 3].map(i => (
                  <span key={i} className={`text-base ${i <= (character.deathSaves?.failures || 0) ? 'text-red-500' : 'text-gray-600'}`}>
                    ●
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6 ABILITY SCORES (CLICK TO ROLL) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {ABILITIES.map(ab => {
            const val = stats[ab.id] || 10;
            const mod = getAbilityMod(val);

            return (
              <div
                key={ab.id}
                onClick={() => handleRollCheck(ab.name, mod, false)}
                className="cursor-pointer bg-dnd-panel border border-dnd-border hover:border-dnd-gold rounded-xl p-2.5 text-center transition group shadow"
                title={`Clique para rolar Teste de ${ab.name}`}
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ab.abbr}</div>
                <div className="text-xl font-cinzel font-black text-dnd-gold group-hover:scale-110 transition my-0.5">
                  {formatMod(mod)}
                </div>
                <div className="text-xs font-mono font-semibold text-gray-300 bg-dnd-darker py-0.5 rounded border border-dnd-border">
                  {val}
                </div>
              </div>
            );
          })}
        </div>

        {/* ADVANTAGE SELECTOR */}
        <div className="flex items-center justify-center space-x-2 bg-dnd-panel/60 border border-dnd-border rounded-xl p-1.5">
          <span className="text-xs font-bold text-gray-400 mr-2">Modo do D20:</span>
          <button
            onClick={() => setAdvantageType('normal')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              advantageType === 'normal' ? 'bg-dnd-gold text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setAdvantageType('advantage')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              advantageType === 'advantage' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Vantagem
          </button>
          <button
            onClick={() => setAdvantageType('disadvantage')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              advantageType === 'disadvantage' ? 'bg-red-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Desvantagem
          </button>
        </div>

        {/* TABS (COMBATE / PERÍCIAS / MAGIAS / INVENTÁRIO) */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl overflow-hidden shadow-xl">
          <div className="flex border-b border-dnd-border bg-dnd-darker/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('combat')}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                activeTab === 'combat' ? 'border-dnd-gold text-dnd-gold bg-dnd-panel font-bold' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Ataques & Ações
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                activeTab === 'skills' ? 'border-dnd-gold text-dnd-gold bg-dnd-panel font-bold' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Perícias & Salvaguardas
            </button>
            <button
              onClick={() => setActiveTab('spells')}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                activeTab === 'spells' ? 'border-dnd-gold text-dnd-gold bg-dnd-panel font-bold' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Grimório & Magias
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                activeTab === 'inventory' ? 'border-dnd-gold text-dnd-gold bg-dnd-panel font-bold' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Mochila & Ouro ({character.gold || 0} PO)
            </button>
          </div>

          <div className="p-4">
            {/* COMBAT TAB */}
            {activeTab === 'combat' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Armas Equipadas</h4>
                {(character.inventory || []).filter(i => i.type === 'weapon').map((w, idx) => {
                  const isFinesse = w.properties?.includes('Finesse');
                  const isRanged = w.properties?.some(p => p.includes('Munição') || p.includes('Arremesso'));
                  const useDex = isRanged || (isFinesse && stats.dex > stats.str);
                  const atkMod = getAbilityMod(useDex ? stats.dex : stats.str) + profBonus;
                  const dmgMod = getAbilityMod(useDex ? stats.dex : stats.str);

                  return (
                    <div key={idx} className="bg-dnd-darker border border-dnd-border rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-gray-100 flex items-center gap-1.5">
                          <Sword className="w-4 h-4 text-dnd-gold" />
                          <span>{w.name}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Dano: {w.damage} {formatMod(dmgMod)} {w.damageType} • {w.properties?.join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleWeaponAttack(w)}
                          className="bg-dnd-gold hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                        >
                          Atacar ({formatMod(atkMod)})
                        </button>
                        <button
                          onClick={() => handleWeaponDamage(w)}
                          className="bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                        >
                          Dano
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Class Features */}
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">Habilidades de Classe</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-dnd-darker border border-dnd-border rounded-lg p-2.5">
                    <span className="font-bold text-dnd-gold">Dado de Vida:</span> 1d{character.hitDie} por nível
                  </div>
                  <div className="bg-dnd-darker border border-dnd-border rounded-lg p-2.5">
                    <span className="font-bold text-dnd-gold">Deslocamento:</span> {character.speed}m ({character.speed / 1.5} quadrados)
                  </div>
                </div>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                {/* Saving Throws */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Salvaguardas</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ABILITIES.map(ab => {
                      const isProf = character.savingThrows?.includes(ab.id);
                      const mod = getAbilityMod(stats[ab.id]) + (isProf ? profBonus : 0);
                      return (
                        <div
                          key={ab.id}
                          onClick={() => handleRollCheck(ab.name, mod, true)}
                          className={`cursor-pointer border rounded-lg p-2 text-xs flex items-center justify-between transition ${
                            isProf ? 'bg-amber-950/30 border-dnd-gold' : 'bg-dnd-darker border-dnd-border hover:border-gray-500'
                          }`}
                        >
                          <span className="font-medium text-gray-200">{ab.name}</span>
                          <span className="font-mono font-bold text-dnd-gold">{formatMod(mod)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Perícias D&D 5e</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {SKILLS.map(sk => {
                      const mod = getAbilityMod(stats[sk.ability]);
                      return (
                        <div
                          key={sk.id}
                          onClick={() => handleRollCheck(sk.name, mod, false)}
                          className="cursor-pointer bg-dnd-darker border border-dnd-border hover:border-dnd-gold rounded-lg px-3 py-2 text-xs flex items-center justify-between transition"
                        >
                          <span className="text-gray-300">
                            {sk.name} <span className="text-[10px] text-gray-500 font-mono">({sk.ability.toUpperCase()})</span>
                          </span>
                          <span className="font-mono font-bold text-dnd-gold">{formatMod(mod)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SPELLS TAB */}
            {activeTab === 'spells' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-dnd-border">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Espaços de Magia</h4>
                  {character.spellSlots && (
                    <div className="text-xs font-mono text-dnd-gold">
                      1º Círculo: {character.spellSlots[1]?.current} / {character.spellSlots[1]?.total}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SPELLS.map(sp => (
                    <div key={sp.id} className="bg-dnd-darker border border-dnd-border rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-200">{sp.name}</span>
                          <span className="text-[10px] bg-dnd-panel px-1.5 py-0.5 rounded font-mono text-purple-400 border border-dnd-border">
                            {sp.level === 0 ? 'Truque' : `Nv. ${sp.level}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{sp.desc}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-dnd-border/60">
                        <span className="text-[11px] font-mono text-amber-400">
                          {sp.damage ? `Dano: ${sp.damage}` : sp.heal ? `Cura: ${sp.heal}` : sp.school}
                        </span>
                        <button
                          onClick={() => handleCastSpell(sp)}
                          className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 px-3 py-1 rounded text-xs font-bold transition"
                        >
                          Conjurar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-dnd-border">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Itens na Mochila</h4>
                  <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
                    <Coins className="w-4 h-4" />
                    <span>{character.gold || 0} Peças de Ouro (PO)</span>
                  </div>
                </div>

                <div className="divide-y divide-dnd-border/40">
                  {(character.inventory || []).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-200 text-sm">{item.name}</span>
                        <div className="text-gray-400 mt-0.5">
                          {item.desc || (item.damage ? `Dano: ${item.damage}` : item.ac ? `CA: ${item.ac}` : '')}
                        </div>
                      </div>

                      {item.type === 'consumable' && (
                        <button
                          onClick={() => handleUsePotion(idx)}
                          className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          Beber Poção
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
