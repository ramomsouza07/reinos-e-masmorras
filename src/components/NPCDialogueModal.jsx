import React, { useState } from 'react';
import { MessageSquare, ShoppingBag, HeartHandshake, X, ChevronRight, Sparkles } from 'lucide-react';
import Character2DPreview from './Character2DSprite';

export default function NPCDialogueModal({ npc, onClose, onOpenShop, onFullHeal }) {
  const [currentText, setCurrentText] = useState(npc?.dialogue?.greeting || 'Olá, viajante!');
  const [history, setHistory] = useState([]);

  if (!npc) return null;

  const handleSelectOption = (opt) => {
    if (opt.action === 'open_shop') {
      onClose();
      if (onOpenShop) onOpenShop(npc);
      return;
    }
    if (opt.action === 'full_heal') {
      if (onFullHeal) onFullHeal();
      setCurrentText(opt.response);
      return;
    }

    setHistory(prev => [...prev, { q: opt.text, a: opt.response }]);
    setCurrentText(opt.response);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-dnd-panel border-2 border-dnd-gold rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header com Nome e Papel do NPC */}
        <div className="bg-dnd-darker border-b border-dnd-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-dnd-panel border border-dnd-gold/60 flex items-center justify-center overflow-hidden shadow-inner">
              {npc.appearance ? (
                <Character2DPreview appearance={npc.appearance} size={52} />
              ) : (
                <span className="text-3xl">{npc.avatar || '🧙‍♂️'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-cinzel font-bold text-xl text-dnd-gold">{npc.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  NPC
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">{npc.role || 'Habitante Local'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Diálogo */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Histórico anterior se houver */}
          {history.map((h, idx) => (
            <div key={idx} className="space-y-2 opacity-75">
              <div className="text-right">
                <span className="inline-block bg-dnd-darker border border-dnd-border text-xs text-blue-300 px-3 py-1.5 rounded-xl rounded-tr-none">
                  "{h.q}"
                </span>
              </div>
              <div className="text-left">
                <div className="bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 px-3.5 py-2 rounded-xl rounded-tl-none">
                  {h.a}
                </div>
              </div>
            </div>
          ))}

          {/* Fala Atual do NPC */}
          <div className="bg-dnd-darker/90 border border-dnd-gold/30 rounded-2xl p-4 shadow-lg flex items-start space-x-3">
            <MessageSquare className="w-5 h-5 text-dnd-gold flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-100 leading-relaxed font-serif italic">
              "{currentText}"
            </p>
          </div>
        </div>

        {/* Opções de Interação e Diálogo */}
        <div className="bg-dnd-darker border-t border-dnd-border p-4 space-y-2">
          <div className="text-[11px] uppercase font-bold text-gray-400 tracking-wider px-2">
            Escolha sua resposta:
          </div>

          <div className="grid grid-cols-1 gap-2">
            {(npc.dialogue?.options || []).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left bg-dnd-panel hover:bg-dnd-gold/15 border border-dnd-border hover:border-dnd-gold text-sm text-gray-200 hover:text-dnd-gold px-4 py-2.5 rounded-xl transition flex items-center justify-between group"
              >
                <span className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-dnd-gold opacity-60 group-hover:opacity-100 transition" />
                  <span>{opt.text}</span>
                </span>
                {opt.action === 'open_shop' && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <ShoppingBag className="w-3 h-3" />
                    <span>Loja</span>
                  </span>
                )}
                {opt.action === 'full_heal' && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <HeartHandshake className="w-3 h-3" />
                    <span>Cura</span>
                  </span>
                )}
              </button>
            ))}

            {npc.hasShop && !(npc.dialogue?.options || []).some(o => o.action === 'open_shop') && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenShop) onOpenShop(npc);
                }}
                className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-sm px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 font-bold"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ver Itens & Suprimentos à Venda</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-dnd-panel/60 hover:bg-dnd-panel border border-dnd-border/60 text-xs text-gray-400 hover:text-white px-4 py-2 rounded-xl transition text-center"
            >
              Encerrar conversa e continuar explorando
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
