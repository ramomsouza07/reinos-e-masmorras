import React, { useState } from 'react';
import { 
  Dices, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Plus, 
  Minus, 
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { rollDie, parseDiceFormula, rollD20 } from '../utils/dice';
import { sounds } from '../utils/soundEffects';

const DICE_TYPES = [
  { sides: 4, label: 'd4', shape: '▲' },
  { sides: 6, label: 'd6', shape: '■' },
  { sides: 8, label: 'd8', shape: '◆' },
  { sides: 10, label: 'd10', shape: '⬟' },
  { sides: 12, label: 'd12', shape: '⬢' },
  { sides: 20, label: 'd20', shape: '⬡' },
  { sides: 100, label: 'd100', shape: '%' }
];

export default function DiceTray({ socket, player, isDM }) {
  const [modifier, setModifier] = useState(0);
  const [diceCount, setDiceCount] = useState(1);
  const [advantageType, setAdvantageType] = useState('normal'); // 'normal' | 'advantage' | 'disadvantage'
  const [customFormula, setCustomFormula] = useState('');
  
  const [lastRoll, setLastRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState([]);

  const charName = player?.character?.name || (isDM ? 'Mestre da Mesa' : 'Aventureiro');

  const executeRoll = (sides) => {
    sounds.playDiceRoll();
    setIsRolling(true);

    setTimeout(() => {
      setIsRolling(false);
      let rollResult = null;

      if (sides === 20 && diceCount === 1) {
        // D20 with advantage support
        const res = rollD20(modifier, advantageType);
        rollResult = {
          title: `1d20${modifier >= 0 ? `+${modifier}` : modifier}`,
          rolls: res.advantageType !== 'normal' ? [res.roll1, res.roll2] : [res.selectedRoll],
          total: res.total,
          isNat20: res.isNat20,
          isNat1: res.isNat1,
          selected: res.selectedRoll,
          mod: modifier,
          advantageType
        };

        if (res.isNat20) {
          sounds.playCriticalSuccess();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } else if (res.isNat1) {
          sounds.playCriticalFail();
        }
      } else {
        // Standard multi-dice roll
        const rolls = [];
        let sum = 0;
        for (let i = 0; i < diceCount; i++) {
          const r = rollDie(sides);
          rolls.push(r);
          sum += r;
        }
        const total = sum + modifier;
        rollResult = {
          title: `${diceCount}d${sides}${modifier >= 0 ? `+${modifier}` : modifier}`,
          rolls,
          total,
          mod: modifier
        };
      }

      setLastRoll(rollResult);
      setHistory(prev => [rollResult, ...prev.slice(0, 15)]);

      // Emit to server chat
      socket.emit('chat:send', {
        sender: charName,
        senderType: isDM ? 'dm' : 'player',
        type: 'roll',
        content: `rolou **${rollResult.title}**: **${rollResult.total}** (${rollResult.rolls.join(' + ')}${
          rollResult.mod !== 0 ? ` ${rollResult.mod >= 0 ? '+' : ''}${rollResult.mod}` : ''
        })`,
        rollData: rollResult
      });
    }, 400);
  };

  const handleCustomRoll = (e) => {
    e.preventDefault();
    if (!customFormula.trim()) return;

    sounds.playDiceRoll();
    const parsed = parseDiceFormula(customFormula);
    if (!parsed) {
      alert('Fórmula inválida! Use o formato: 2d6+3, 1d20-1, d8, etc.');
      return;
    }

    const rollResult = {
      title: parsed.raw,
      rolls: parsed.rolls,
      total: parsed.total,
      mod: parsed.mod
    };

    setLastRoll(rollResult);
    setHistory(prev => [rollResult, ...prev.slice(0, 15)]);

    socket.emit('chat:send', {
      sender: charName,
      senderType: isDM ? 'dm' : 'player',
      type: 'roll',
      content: `rolou **${parsed.raw}**: **${rollResult.total}** (${rollResult.rolls.join(' + ')}${
        parsed.mod !== 0 ? ` ${parsed.mod >= 0 ? '+' : ''}${parsed.mod}` : ''
      })`,
      rollData: rollResult
    });

    setCustomFormula('');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-dnd-darker text-gray-200 p-4 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-dnd-darker border border-dnd-gold flex items-center justify-center text-dnd-gold shadow">
              <Dices className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-xl text-dnd-gold">Bandeja de Dados (D&D 5e)</h2>
              <p className="text-xs text-gray-400">Role dados poliédricos oficiais com vantagem, desvantagem e modificadores sincronizados.</p>
            </div>
          </div>
        </div>

        {/* Big Roll Spotlight Display */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
          {lastRoll ? (
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                {lastRoll.title}
              </span>

              {/* Big Animated Result */}
              <div className={`text-6xl font-cinzel font-black my-2 transition-transform duration-300 ${
                isRolling ? 'scale-75 opacity-50' : 'scale-100'
              } ${lastRoll.isNat20 ? 'text-amber-400 gold-glow' : lastRoll.isNat1 ? 'text-red-500 red-glow' : 'text-gray-100'}`}>
                {lastRoll.total}
              </div>

              {/* Nat 20 or Nat 1 Banner */}
              {lastRoll.isNat20 && (
                <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-400 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>20 NATURAL! ACERTO CRÍTICO!</span>
                </div>
              )}
              {lastRoll.isNat1 && (
                <div className="inline-flex items-center space-x-1.5 bg-red-950 border border-red-600 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse">
                  <ShieldAlert className="w-4 h-4" />
                  <span>1 NATURAL! FALHA CRÍTICA!</span>
                </div>
              )}

              {/* Roll Breakdown */}
              <div className="text-xs font-mono text-gray-400 mt-2">
                Dados: [{lastRoll.rolls.join(', ')}] {lastRoll.mod !== 0 && `(Modificador: ${lastRoll.mod >= 0 ? `+${lastRoll.mod}` : lastRoll.mod})`}
              </div>
            </div>
          ) : (
            <div className="py-8 text-gray-500">
              <Dices className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">Clique em qualquer dado abaixo para rolar!</p>
            </div>
          )}
        </div>

        {/* Dice Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {DICE_TYPES.map(d => (
            <button
              key={d.label}
              onClick={() => executeRoll(d.sides)}
              disabled={isRolling}
              className="bg-dnd-panel border border-dnd-border hover:border-dnd-gold rounded-2xl p-4 flex flex-col items-center justify-center transition group shadow hover:scale-105 active:scale-95"
            >
              <span className="text-2xl text-dnd-gold group-hover:scale-125 transition-transform mb-1">
                {d.shape}
              </span>
              <span className="font-cinzel font-black text-lg text-gray-100 group-hover:text-dnd-gold">
                {d.label}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">Rolar</span>
            </button>
          ))}
        </div>

        {/* Controls: Dice Count, Modifier, Advantage */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quantity of Dice */}
          <div className="flex items-center justify-between bg-dnd-darker border border-dnd-border rounded-xl p-3">
            <span className="text-xs font-bold text-gray-400">Quantidade:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDiceCount(c => Math.max(1, c - 1))}
                className="w-7 h-7 rounded bg-dnd-panel hover:bg-dnd-hover text-gray-200 text-xs font-bold flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-sm text-dnd-gold w-6 text-center">{diceCount}</span>
              <button
                onClick={() => setDiceCount(c => Math.min(10, c + 1))}
                className="w-7 h-7 rounded bg-dnd-panel hover:bg-dnd-hover text-gray-200 text-xs font-bold flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Modifier */}
          <div className="flex items-center justify-between bg-dnd-darker border border-dnd-border rounded-xl p-3">
            <span className="text-xs font-bold text-gray-400">Modificador:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setModifier(m => m - 1)}
                className="w-7 h-7 rounded bg-dnd-panel hover:bg-dnd-hover text-gray-200 text-xs font-bold flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-sm text-amber-400 w-8 text-center">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <button
                onClick={() => setModifier(m => m + 1)}
                className="w-7 h-7 rounded bg-dnd-panel hover:bg-dnd-hover text-gray-200 text-xs font-bold flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setModifier(0)}
                className="text-[10px] text-gray-500 hover:text-gray-300 ml-1"
                title="Resetar Modificador"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Advantage / Disadvantage */}
          <div className="flex items-center justify-between bg-dnd-darker border border-dnd-border rounded-xl p-3">
            <span className="text-xs font-bold text-gray-400">D20:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setAdvantageType('normal')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  advantageType === 'normal' ? 'bg-dnd-gold text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setAdvantageType('advantage')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  advantageType === 'advantage' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Vantagem
              </button>
              <button
                onClick={() => setAdvantageType('disadvantage')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  advantageType === 'disadvantage' ? 'bg-red-700 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Desvantagem
              </button>
            </div>
          </div>
        </div>

        {/* Custom Formula Input */}
        <form onSubmit={handleCustomRoll} className="bg-dnd-panel border border-dnd-border rounded-2xl p-3 shadow-lg flex items-center space-x-2">
          <input
            type="text"
            value={customFormula}
            onChange={e => setCustomFormula(e.target.value)}
            placeholder="Digite uma fórmula personalizada (ex: 2d8+5, 4d6, 1d12+3)..."
            className="flex-1 bg-dnd-darker border border-dnd-border rounded-xl px-4 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-dnd-gold"
          />
          <button
            type="submit"
            className="bg-dnd-gold hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Rolar Fórmula</span>
          </button>
        </form>

        {/* Roll History */}
        {history.length > 0 && (
          <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Histórico Recente</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {history.map((h, i) => (
                <div key={i} className="bg-dnd-darker border border-dnd-border rounded-xl p-2 text-center text-xs">
                  <div className="text-[10px] text-gray-400 font-mono">{h.title}</div>
                  <div className={`text-base font-cinzel font-bold mt-0.5 ${
                    h.isNat20 ? 'text-amber-400' : h.isNat1 ? 'text-red-400' : 'text-gray-100'
                  }`}>
                    {h.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
