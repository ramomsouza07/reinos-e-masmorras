import React, { useState } from 'react';
import { 
  Coins, 
  ShoppingBag, 
  Shield, 
  Sword, 
  Sparkles, 
  Heart, 
  Package, 
  ArrowRightLeft,
  Gift,
  Check
} from 'lucide-react';
import { ITEMS } from '../data/dndData';
import { sounds } from '../utils/soundEffects';

export default function ShopDrawer({ 
  player, 
  isDM, 
  socket, 
  room 
}) {
  const [category, setCategory] = useState('all'); // 'all' | 'weapon' | 'armor' | 'consumable' | 'gear' | 'magic'
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'sell' | 'dm_loot'

  // DM Loot state
  const [lootGold, setLootGold] = useState(50);
  const [lootItemName, setLootItemName] = useState('Gema Preciosa de Rubi');
  const [lootTarget, setLootTarget] = useState('all');

  const char = player?.character;
  const playerGold = char?.gold || 0;

  const itemsList = Object.values(ITEMS);
  const filteredItems = itemsList.filter(item => {
    if (category === 'all') return true;
    if (category === 'armor') return item.type === 'armor' || item.type === 'shield';
    return item.type === category;
  });

  const handleBuy = (item) => {
    if (playerGold < item.cost) {
      alert('Você não tem Peças de Ouro (PO) suficientes para comprar este item!');
      return;
    }

    sounds.playCoins();
    socket.emit('economy:buy', {
      itemId: item.id,
      item,
      cost: item.cost
    });
  };

  const handleSell = (itemIndex, item) => {
    const sellPrice = Math.max(1, Math.floor(item.cost / 2));
    sounds.playCoins();
    socket.emit('economy:sell', {
      itemIndex,
      sellPrice
    });
  };

  const handleGrantLoot = () => {
    sounds.playCoins();
    socket.emit('economy:grant_loot', {
      targetCharacterId: lootTarget === 'all' ? null : lootTarget,
      gold: Number(lootGold),
      itemName: lootItemName.trim()
    });
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-dnd-darker text-gray-200 p-4 overflow-y-auto select-none">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* Header & Wallet Banner */}
        <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-600/60 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-xl text-dnd-gold">Mercado & Economia (D&D 5e)</h2>
              <p className="text-xs text-gray-400">Compre armas, armaduras, poções de cura e equipamentos para sua jornada.</p>
            </div>
          </div>

          {/* Player Balance */}
          {char && (
            <div className="flex items-center space-x-3 bg-dnd-darker border border-amber-500/40 px-4 py-2.5 rounded-xl shadow-inner">
              <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Sua Carteira</span>
                <div className="text-lg font-cinzel font-black text-amber-400">
                  {char.gold || 0} <span className="text-xs font-sans text-gray-400">PO (Ouro)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Tabs: Comprar, Vender, Recompensas do Mestre */}
        <div className="flex items-center space-x-2 border-b border-dnd-border pb-3">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'buy' ? 'bg-dnd-gold text-black shadow' : 'text-gray-400 hover:text-white bg-dnd-panel'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar do Mercador</span>
          </button>

          {char && (
            <button
              onClick={() => setActiveTab('sell')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'sell' ? 'bg-dnd-gold text-black shadow' : 'text-gray-400 hover:text-white bg-dnd-panel'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Vender Itens da Mochila</span>
            </button>
          )}

          {isDM && (
            <button
              onClick={() => setActiveTab('dm_loot')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'dm_loot' ? 'bg-red-800 text-white shadow' : 'text-red-400 hover:text-red-300 bg-dnd-panel'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Painel de Recompensas (DM)</span>
            </button>
          )}
        </div>

        {/* TAB 1: COMPRAR */}
        {activeTab === 'buy' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todos os Itens' },
                { id: 'weapon', label: 'Armas', icon: Sword },
                { id: 'armor', label: 'Armaduras & Escudos', icon: Shield },
                { id: 'consumable', label: 'Poções & Consumíveis', icon: Heart },
                { id: 'gear', label: 'Equipamentos de Aventura', icon: Package },
                { id: 'magic', label: 'Itens Mágicos', icon: Sparkles }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                    category === cat.id
                      ? 'bg-dnd-gold text-black font-bold shadow'
                      : 'bg-dnd-panel text-gray-400 hover:text-white border border-dnd-border'
                  }`}
                >
                  {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredItems.map(item => {
                const canAfford = playerGold >= item.cost;
                return (
                  <div
                    key={item.id}
                    className="bg-dnd-panel border border-dnd-border hover:border-gray-500 rounded-2xl p-4 flex flex-col justify-between shadow transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-sm text-gray-100">{item.name}</h4>
                        <span className="font-cinzel font-black text-amber-400 text-sm">
                          {item.cost} PO
                        </span>
                      </div>

                      <div className="text-xs text-gray-400 mb-2">
                        {item.damage && (
                          <span className="text-emerald-400 font-mono">Dano: {item.damage} {item.damageType} • </span>
                        )}
                        {item.ac && (
                          <span className="text-blue-400 font-mono">CA: {item.ac} • </span>
                        )}
                        {item.acBonus && (
                          <span className="text-blue-400 font-mono">+{item.acBonus} CA • </span>
                        )}
                        <span>Peso: {item.weight} kg</span>
                      </div>

                      {item.desc && (
                        <p className="text-xs text-gray-400 line-clamp-2">{item.desc}</p>
                      )}
                      {item.properties && item.properties.length > 0 && (
                        <div className="text-[10px] text-gray-500 mt-1 font-mono">
                          Propriedades: {item.properties.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-dnd-border/60 flex items-center justify-between">
                      <span className={`text-[10px] font-bold ${item.magic ? 'text-purple-400' : 'text-gray-500'}`}>
                        {item.magic ? '✨ Item Mágico' : 'Item Comum'}
                      </span>
                      {char ? (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Comprar ({item.cost} PO)</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Crie ficha para comprar</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: VENDER */}
        {activeTab === 'sell' && char && (
          <div className="bg-dnd-panel border border-dnd-border rounded-2xl p-4 shadow-xl">
            <h3 className="font-cinzel font-bold text-base text-gray-200 mb-2">Vender Itens da Sua Mochila</h3>
            <p className="text-xs text-gray-400 mb-4">
              Os mercadores pagam 50% do valor padrão do livro por equipamentos e espólios.
            </p>

            <div className="divide-y divide-dnd-border/50">
              {(char.inventory || []).length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">Sua mochila está vazia.</div>
              ) : (
                char.inventory.map((item, idx) => {
                  const sellValue = Math.max(1, Math.floor((item.cost || 10) / 2));
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-sm text-gray-100">{item.name}</div>
                        <div className="text-gray-400 mt-0.5">{item.desc || item.damage || 'Item de aventura'}</div>
                      </div>

                      <button
                        onClick={() => handleSell(idx, item)}
                        className="bg-amber-950/60 hover:bg-amber-900 border border-amber-600/60 text-amber-300 font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Vender por {sellValue} PO</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DM LOOT GRANT */}
        {activeTab === 'dm_loot' && isDM && (
          <div className="bg-dnd-panel border border-red-900/60 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="font-cinzel font-bold text-lg text-red-400">Recompensas e Tesouro do Mestre</h3>
              <p className="text-xs text-gray-400">Conceda moedas de ouro ou itens mágicos aos jogadores após superarem um encontro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Destinatário do Tesouro</label>
                <select
                  value={lootTarget}
                  onChange={e => setLootTarget(e.target.value)}
                  className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-red-500"
                >
                  <option value="all">⭐ Todos os Jogadores do Grupo</option>
                  {Object.values(room.players || {}).filter(p => p.character).map(p => (
                    <option key={p.character.id} value={p.character.id}>
                      {p.character.name} ({p.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Ouro a Conceder (PO)</label>
                <input
                  type="number"
                  value={lootGold}
                  onChange={e => setLootGold(e.target.value)}
                  className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-2.5 text-gray-200 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Nome do Item / Espólio (Opcional)</label>
                <input
                  type="text"
                  value={lootItemName}
                  onChange={e => setLootItemName(e.target.value)}
                  placeholder="Ex: Diamante de 100 PO, Chave da Masmorra..."
                  className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGrantLoot}
                className="bg-red-700 hover:bg-red-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-2"
              >
                <Gift className="w-4 h-4" />
                <span>Distribuir Tesouro ao Grupo!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
