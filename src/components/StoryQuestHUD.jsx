import React, { useState } from 'react';
import { Compass, Sparkles, BookOpen, ChevronDown, ChevronUp, CheckCircle, Circle, Trophy } from 'lucide-react';
import { STORY_CAMPAIGN } from '../data/storyCampaign';

export default function StoryQuestHUD({ 
  currentLandId = 'land_forest',
  bossDefeated = false,
  collectedRelics = [],
  onOpenStoryModal 
}) {
  const [collapsed, setCollapsed] = useState(false);

  const land = STORY_CAMPAIGN.lands.find(l => l.id === currentLandId) || STORY_CAMPAIGN.lands[0];

  return (
    <div className="absolute top-16 left-4 z-30 max-w-sm pointer-events-auto transition-all duration-300">
      <div className="bg-dnd-panel/95 backdrop-blur-md border border-dnd-gold/60 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header do HUD */}
        <div 
          onClick={() => setCollapsed(!collapsed)}
          className="bg-dnd-darker/90 px-4 py-2.5 flex items-center justify-between cursor-pointer border-b border-dnd-border hover:bg-dnd-darker transition"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-dnd-gold/20 border border-dnd-gold flex items-center justify-center text-dnd-gold">
              <Compass className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-dnd-gold tracking-widest">
                Campanha Principal
              </div>
              <h4 className="font-cinzel font-bold text-xs text-gray-100 truncate max-w-[200px]">
                {land.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-gray-400">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {/* Conteúdo Expandido */}
        {!collapsed && (
          <div className="p-3.5 space-y-3">
            {/* Status do Portal / Passagem */}
            <div className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2.5 ${
              bossDefeated 
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 animate-pulse' 
                : 'bg-dnd-darker/70 border-dnd-border/80 text-gray-300'
            }`}>
              <div className="text-xl">
                {bossDefeated ? '🌀' : '🔒'}
              </div>
              <div className="leading-snug">
                {bossDefeated ? (
                  <div>
                    <span className="font-bold text-emerald-400">PORTAL ABERTO!</span>
                    <p className="text-[11px] text-emerald-200/90">
                      Caminhem até o {land.portalName} no sudeste para avançar!
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-amber-300">Chefe da Land:</span> {land.bossName}
                    <p className="text-[11px] text-gray-400">Derrote o Boss para abrir a passagem!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Objetivos da Missão */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Missões da Terra
              </div>
              <ul className="space-y-1">
                {(land.questLog || []).map((q, idx) => {
                  const isDone = (idx === land.questLog.length - 1) ? bossDefeated : false;
                  return (
                    <li key={idx} className="flex items-start space-x-2 text-[11px] text-gray-200">
                      {isDone ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-dnd-gold/60 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={isDone ? 'line-through text-gray-400' : ''}>{q}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Relíquias dos Quatro Reinos */}
            <div className="pt-2 border-t border-dnd-border/60">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 flex items-center justify-between">
                <span>Relíquias de Eldoria</span>
                <span className="text-dnd-gold">{collectedRelics.length} / 4</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {STORY_CAMPAIGN.lands.map((l, i) => {
                  const hasIt = collectedRelics.includes(l.relicReward?.id) || (currentLandId === l.id && bossDefeated);
                  return (
                    <div 
                      key={l.id}
                      className={`p-1.5 rounded-lg border text-xs flex flex-col items-center justify-center transition ${
                        hasIt 
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-500/30' 
                          : 'bg-dnd-darker/60 border-dnd-border/60 text-gray-600 opacity-60'
                      }`}
                      title={l.relicReward?.name}
                    >
                      <span className="text-base">{l.relicReward?.icon}</span>
                      <span className="text-[9px] font-bold mt-0.5 truncate w-full">Land {i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botão Ver Diário Completo */}
            {onOpenStoryModal && (
              <button
                onClick={onOpenStoryModal}
                className="w-full bg-dnd-darker hover:bg-dnd-gold/20 border border-dnd-border hover:border-dnd-gold text-xs text-dnd-gold py-1.5 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 font-bold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ver Lore & Resumo da História</span>
              </button>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
