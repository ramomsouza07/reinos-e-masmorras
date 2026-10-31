import React, { useState } from 'react';
import { 
  Skull, 
  Search, 
  Plus, 
  Shield, 
  Heart, 
  Zap, 
  Sword, 
  Flame, 
  Eye, 
  X,
  Sparkles
} from 'lucide-react';
import { MONSTERS, getAbilityMod, formatMod } from '../data/dndData';
import { sounds } from '../utils/soundEffects';

export default function BestiaryDrawer({ socket, room }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonster, setSelectedMonster] = useState(MONSTERS[0]);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom monster state
  const [customName, setCustomName] = useState('');
  const [customHp, setCustomHp] = useState(25);
  const [customAc, setCustomAc] = useState(13);
  const [customAvatar, setCustomAvatar] = useState('👹');
  const [customAtkName, setCustomAtkName] = useState('Golpe Brutal');
  const [customAtkBonus, setCustomAtkBonus] = useState(4);
  const [customAtkDmg, setCustomAtkDmg] = useState('1d8+2');

  const filtered = MONSTERS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cr.includes(searchTerm)
  );

  const handleSpawnOnMap = (monster) => {
    sounds.playAttack();
    // Spawn near center of map
    const spawnX = Math.floor((room.map?.cols || 20) / 2) + Math.floor(Math.random() * 3 - 1);
    const spawnY = Math.floor((room.map?.rows || 16) / 2) + Math.floor(Math.random() * 3 - 1);

    socket.emit('token:add', {
      name: monster.name,
      type: 'enemy',
      hp: monster.hp,
      maxHp: monster.maxHp,
      ac: monster.ac,
      speed: monster.speed,
      avatar: monster.avatar,
      color: monster.color || '#EF4444',
      size: monster.size === 'Grande' ? 2 : 1,
      x: spawnX,
      y: spawnY,
      actions: monster.actions,
      stats: monster.stats
    });

    socket.emit('chat:send', {
      sender: 'Mestre da Mesa',
      senderType: 'dm',
      type: 'narration',
      content: `⚠️ Um terrível **${monster.name}** surgiu no campo de batalha!`
    });
  };

  const handleCreateCustom = () => {
    if (!customName.trim()) return;
    const customMonster = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      cr: '1',
      xp: 200,
      hp: Number(customHp),
      maxHp: Number(customHp),
      ac: Number(customAc),
      speed: 9,
      size: 'Médio',
      color: '#EF4444',
      avatar: customAvatar,
      stats: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
      actions: [
        { name: customAtkName, bonus: Number(customAtkBonus), damage: customAtkDmg, type: 'cortante' }
      ],
      features: ['Inimigo Personalizado criado pelo Mestre']
    };

    handleSpawnOnMap(customMonster);
    setShowCustomModal(false);
    setCustomName('');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-dnd-darker text-gray-200 p-4 overflow-y-auto select-none">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* Top Header */}
        <div className="bg-dnd-panel border border-red-950/80 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-700 flex items-center justify-center text-red-400">
              <Skull className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-xl text-red-400">Bestiário de Monstros (D&D 5e)</h2>
              <p className="text-xs text-gray-400">Invoque criaturas lendárias e chefes para desafiar seus jogadores no mapa tático.</p>
            </div>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center space-x-1.5 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Monstro Customizado</span>
          </button>
        </div>

        {/* Content Columns: List on left, Stat Block on right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Monsters List */}
          <div className="md:col-span-5 bg-dnd-panel border border-dnd-border rounded-2xl p-3 flex flex-col h-[650px] shadow-lg">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou ND (ex: goblin, 1/4)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-dnd-darker border border-dnd-border rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filtered.map(m => {
                const isSelected = selectedMonster?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMonster(m)}
                    className={`cursor-pointer border rounded-xl p-3 transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-950/40 border-red-600 shadow'
                        : 'bg-dnd-darker/60 border-dnd-border hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{m.avatar}</span>
                      <div>
                        <h4 className="font-bold text-xs text-gray-100">{m.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">
                          PV {m.hp} • CA {m.ac}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-dnd-panel border border-dnd-border px-2 py-0.5 rounded text-amber-400">
                      ND {m.cr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monster Stat Block Preview */}
          <div className="md:col-span-7 bg-dnd-panel border border-dnd-border rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            {selectedMonster ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-dnd-border pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{selectedMonster.avatar}</span>
                    <div>
                      <h3 className="font-cinzel font-black text-xl text-red-400">{selectedMonster.name}</h3>
                      <p className="text-xs text-gray-400">
                        {selectedMonster.size} monstro, Nível de Desafio {selectedMonster.cr} ({selectedMonster.xp} XP)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpawnOnMap(selectedMonster)}
                    className="flex items-center space-x-1.5 bg-red-700 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg animate-pulse"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Colocar no Mapa!</span>
                  </button>
                </div>

                {/* Vitals: HP, AC, Speed */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-dnd-darker border border-dnd-border rounded-xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Pontos de Vida</span>
                    <div className="text-lg font-cinzel font-bold text-emerald-400 mt-0.5">
                      {selectedMonster.hp}
                    </div>
                  </div>
                  <div className="bg-dnd-darker border border-dnd-border rounded-xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Classe de Armadura</span>
                    <div className="text-lg font-cinzel font-bold text-blue-400 mt-0.5">
                      {selectedMonster.ac}
                    </div>
                  </div>
                  <div className="bg-dnd-darker border border-dnd-border rounded-xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Deslocamento</span>
                    <div className="text-lg font-cinzel font-bold text-amber-400 mt-0.5">
                      {selectedMonster.speed}m
                    </div>
                  </div>
                </div>

                {/* Abilities */}
                <div className="grid grid-cols-6 gap-2 text-center">
                  {Object.entries(selectedMonster.stats || {}).map(([stat, val]) => (
                    <div key={stat} className="bg-dnd-darker border border-dnd-border rounded-lg p-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{stat}</span>
                      <div className="text-xs font-bold text-gray-100">{val}</div>
                      <div className="text-[10px] font-mono text-dnd-gold">{formatMod(getAbilityMod(val))}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sword className="w-4 h-4" /> Ações do Monstro
                  </h4>
                  <div className="space-y-2">
                    {selectedMonster.actions?.map((act, i) => (
                      <div key={i} className="bg-dnd-darker border border-dnd-border rounded-xl p-3 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-100 text-sm">{act.name}</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {act.bonus > 0 ? `+${act.bonus} no ataque` : ''} • {act.damage} {act.type}
                          </span>
                        </div>
                        <p className="text-gray-400">{act.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                {selectedMonster.features && selectedMonster.features.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Traços Especiais</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      {selectedMonster.features.map((f, i) => (
                        <div key={i} className="bg-dnd-darker/50 p-2 rounded border border-dnd-border/40">• {f}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">Selecione um monstro da lista</div>
            )}
          </div>
        </div>

        {/* Custom Monster Modal */}
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-dnd-panel border border-red-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-dnd-border pb-3">
                <h3 className="font-cinzel font-bold text-lg text-red-400">Criar Monstro Customizado</h3>
                <button onClick={() => setShowCustomModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Nome da Criatura *</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="Ex: Chefe Troll, Lich Ancestral..."
                    className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-2 text-gray-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Pontos de Vida</label>
                    <input
                      type="number"
                      value={customHp}
                      onChange={e => setCustomHp(e.target.value)}
                      className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-2 text-gray-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Classe Armadura</label>
                    <input
                      type="number"
                      value={customAc}
                      onChange={e => setCustomAc(e.target.value)}
                      className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-2 text-gray-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Ícone Emoji</label>
                    <input
                      type="text"
                      value={customAvatar}
                      onChange={e => setCustomAvatar(e.target.value)}
                      className="w-full bg-dnd-darker border border-dnd-border rounded-lg p-2 text-center text-lg"
                    />
                  </div>
                </div>

                <div className="border-t border-dnd-border pt-2">
                  <label className="block text-gray-300 font-bold mb-1">Ataque Principal</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={customAtkName}
                      onChange={e => setCustomAtkName(e.target.value)}
                      placeholder="Nome do Ataque"
                      className="col-span-2 bg-dnd-darker border border-dnd-border rounded-lg p-2 text-gray-100"
                    />
                    <input
                      type="text"
                      value={customAtkDmg}
                      onChange={e => setCustomAtkDmg(e.target.value)}
                      placeholder="Dano (ex: 2d6+3)"
                      className="bg-dnd-darker border border-dnd-border rounded-lg p-2 text-gray-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-dnd-border">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCustom}
                  disabled={!customName.trim()}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
                >
                  Criar e Invocar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
