import React from 'react';
import { 
  Swords, 
  RotateCcw, 
  ChevronRight, 
  Heart, 
  Shield, 
  Zap, 
  Skull, 
  Play, 
  Check, 
  Award,
  AlertCircle
} from 'lucide-react';
import { getAbilityMod, formatMod } from '../data/dndData';
import { rollD20 } from '../utils/dice';
import { sounds } from '../utils/soundEffects';

export default function CombatTracker({ 
  room, 
  socket, 
  isDM, 
  player 
}) {
  const combat = room.combat || { active: false, round: 1, currentTurnIndex: 0, turnOrder: [] };
  const tokens = room.tokens || [];

  // Start Combat & Roll Initiative for all tokens
  const handleStartCombat = () => {
    sounds.playDiceRoll();
    const scoredTokens = tokens.map(tok => {
      const dex = tok.stats?.dex || 10;
      const dexMod = getAbilityMod(dex);
      const roll = rollD20(dexMod);
      return {
        tokenId: tok.id,
        initiative: roll.total,
        name: tok.name
      };
    });

    // Sort descending by initiative
    scoredTokens.sort((a, b) => b.initiative - a.initiative);
    const turnOrder = scoredTokens.map(s => s.tokenId);

    socket.emit('combat:start', { turnOrder });
  };

  const handleNextTurn = () => {
    sounds.playDiceRoll();
    socket.emit('combat:next');
  };

  const handleEndCombat = () => {
    socket.emit('combat:end');
  };

  // Quick Monster Attack from Combat Tracker (DM tool)
  const handleMonsterQuickAttack = (monsterToken, action) => {
    sounds.playAttack();
    const roll = rollD20(action.bonus || 4);

    if (roll.isNat20) sounds.playCriticalSuccess();
    else if (roll.isNat1) sounds.playCriticalFail();

    socket.emit('chat:send', {
      sender: monsterToken.name,
      senderType: 'enemy',
      type: 'roll',
      content: `desfere **${action.name}**! Jogada de Ataque: **${roll.total}** vs CA (Dano potencial: ${action.damage} ${action.type || ''})`,
      rollData: {
        title: `${monsterToken.name}: ${action.name}`,
        ...roll
      }
    });
  };

  const currentTokenId = combat.turnOrder[combat.currentTurnIndex];

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-dnd-darker text-gray-200 p-4 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Header Banner */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow ${
              combat.active ? 'bg-red-950 border border-red-600 text-red-400 animate-pulse' : 'bg-dnd-darker border border-dnd-border text-gray-400'
            }`}>
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-cinzel font-black text-xl text-dnd-gold">Rastreador de Iniciativa & Combate</h2>
                {combat.active && (
                  <span className="bg-red-950 text-red-400 border border-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase animate-pulse">
                    Rodada {combat.round}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {combat.active ? 'O combate está ativo! Siga a ordem dos turnos.' : 'Prepare os combatentes no mapa e role iniciativa.'}
              </p>
            </div>
          </div>

          {/* Combat Control Buttons (DM or All) */}
          <div className="flex items-center space-x-2">
            {!combat.active ? (
              <button
                onClick={handleStartCombat}
                disabled={tokens.length === 0}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                  tokens.length > 0
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Iniciar Combate & Rolar Iniciativas!</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleNextTurn}
                  className="flex items-center space-x-2 bg-dnd-gold hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg animate-bounce"
                >
                  <span>Próximo Turno</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                {isDM && (
                  <button
                    onClick={handleEndCombat}
                    className="px-3 py-2.5 rounded-xl bg-dnd-darker hover:bg-red-950/60 border border-dnd-border hover:border-red-700 text-gray-400 hover:text-red-400 text-xs font-bold transition"
                  >
                    Encerrar
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Turn Order List */}
        {combat.active && combat.turnOrder.length > 0 ? (
          <div className="space-y-2.5">
            {combat.turnOrder.map((tokId, index) => {
              const token = tokens.find(t => t.id === tokId);
              if (!token) return null;
              const isCurrentTurn = index === combat.currentTurnIndex;

              return (
                <div
                  key={token.id}
                  className={`border rounded-2xl p-4 transition-all duration-300 flex flex-wrap items-center justify-between gap-4 ${
                    isCurrentTurn
                      ? 'bg-amber-950/40 border-dnd-gold shadow-2xl scale-[1.01]'
                      : 'bg-dnd-panel border-dnd-border opacity-85'
                  }`}
                >
                  {/* Left: Avatar, Turn tag, Name, Class/Type */}
                  <div className="flex items-center space-x-3.5">
                    {/* Turn indicator */}
                    <div className="flex items-center justify-center w-7">
                      {isCurrentTurn ? (
                        <ChevronRight className="w-6 h-6 text-dnd-gold animate-pulse" />
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-500">#{index + 1}</span>
                      )}
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-dnd-darker border border-dnd-border flex items-center justify-center text-2xl shadow">
                      {token.avatar || (token.type === 'enemy' ? '💀' : '🛡️')}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-cinzel font-bold text-base text-gray-100">{token.name}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          token.type === 'enemy' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {token.type === 'enemy' ? 'Inimigo' : 'Aventureiro'}
                        </span>
                        {isCurrentTurn && (
                          <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            TURNO ATUAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center space-x-3">
                        <span className="text-blue-400 font-mono font-bold">CA {token.ac || 10}</span>
                        <span>•</span>
                        <span>Deslocamento: {token.speed || 9}m</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: HP & Actions */}
                  <div className="flex items-center space-x-4">
                    {/* HP Bar */}
                    <div className="w-36 text-right">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" /> PV:
                        </span>
                        <span className="font-mono font-bold text-gray-200">
                          {token.hp} / {token.maxHp}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-dnd-darker rounded-full overflow-hidden border border-dnd-border">
                        <div
                          className={`h-full transition-all duration-300 ${
                            (token.hp / token.maxHp) > 0.5 ? 'bg-emerald-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, (token.hp / token.maxHp) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Monster Actions for DM */}
                    {isDM && token.actions && token.actions.length > 0 && (
                      <div className="flex items-center space-x-1.5">
                        {token.actions.slice(0, 2).map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleMonsterQuickAttack(token, act)}
                            className="bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs px-2.5 py-1.5 rounded-lg font-bold transition flex items-center space-x-1"
                            title={`Ataque com ${act.name}: +${act.bonus} (Dano: ${act.damage})`}
                          >
                            <Swords className="w-3 h-3" />
                            <span>{act.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-12 text-center text-gray-400 space-y-3 shadow-lg">
            <Swords className="w-12 h-12 mx-auto text-gray-600" />
            <h3 className="font-cinzel font-bold text-lg text-gray-300">Nenhum Combate Ativo</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Coloque seus heróis e monstros no Mapa Tático e clique em "Iniciar Combate" para calcular automaticamente as iniciativas e gerenciar os turnos rodada a rodada!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
