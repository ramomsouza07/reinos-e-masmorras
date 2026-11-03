// Base de Dados Oficial D&D 5ª Edição em Português (Expandida)
import { STORY_CAMPAIGN } from './storyCampaign.js';
export { STORY_CAMPAIGN };

export const ABILITIES = [
  { 
    id: 'str', 
    name: 'Força', 
    abbr: 'FOR', 
    icon: '💪',
    desc: 'Poder físico bruto, combate corpo-a-corpo e capacidade de carga.',
    effects: ['Ataque e Dano de armas corpo-a-corpo', 'Perícia Atletismo', 'Capacidade de carga (FOR × 7,5 kg)']
  },
  { 
    id: 'dex', 
    name: 'Destreza', 
    abbr: 'DES', 
    icon: '🏹',
    desc: 'Agilidade, reflexos, equilíbrio, mira à distância e esquiva.',
    effects: ['Classe de Armadura (CA)', 'Bônus de Iniciativa no Combate', 'Ataque/Dano de Arcos e Armas Finesse', 'Acrobacia, Furtividade e Prestidigitação']
  },
  { 
    id: 'con', 
    name: 'Constituição', 
    abbr: 'CON', 
    icon: '❤️',
    desc: 'Saúde, vigor físico e resistência a venenos e ferimentos.',
    effects: ['Pontos de Vida (PV) máximos em cada nível', 'Resistência contra venenos e doenças', 'Manter concentração em magias']
  },
  { 
    id: 'int', 
    name: 'Inteligência', 
    abbr: 'INT', 
    icon: '📘',
    desc: 'Raciocínio lógico, memória, conhecimento histórico e poder arcano.',
    effects: ['Poder de conjuração de Magos', 'Arcanismo, História, Investigação, Natureza e Religião']
  },
  { 
    id: 'wis', 
    name: 'Sabedoria', 
    abbr: 'SAB', 
    icon: '👁️',
    desc: 'Percepção ao redor, intuição, sintonia divina e força de vontade.',
    effects: ['Poder de conjuração de Clérigos, Druidas e Patrulheiros', 'Percepção Passiva (10 + mod SAB)', 'Percepção, Intuição, Medicina e Sobrevivência']
  },
  { 
    id: 'cha', 
    name: 'Carisma', 
    abbr: 'CAR', 
    icon: '👑',
    desc: 'Força de personalidade, liderança, lábia e poder mágico inato.',
    effects: ['Poder de conjuração de Bardos, Paladinos e Bruxos', 'Persuasão, Enganação, Intimidação e Atuação']
  },
];

// Custo oficial de Point Buy (Compra de 27 Pontos D&D 5e)
export const POINT_BUY_COSTS = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

export const LEVEL_XP_TABLE = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 900,
  6: 1500,
  7: 2300,
  8: 3400,
  9: 4800,
  10: 6400
};

export const SKILLS = [
  { id: 'athletics', name: 'Atletismo', ability: 'str' },
  { id: 'acrobatics', name: 'Acrobacia', ability: 'dex' },
  { id: 'sleight_of_hand', name: 'Prestidigitação', ability: 'dex' },
  { id: 'stealth', name: 'Furtividade', ability: 'dex' },
  { id: 'arcana', name: 'Arcanismo', ability: 'int' },
  { id: 'history', name: 'História', ability: 'int' },
  { id: 'investigation', name: 'Investigação', ability: 'int' },
  { id: 'nature', name: 'Natureza', ability: 'int' },
  { id: 'religion', name: 'Religião', ability: 'int' },
  { id: 'animal_handling', name: 'Adestrar Animais', ability: 'wis' },
  { id: 'insight', name: 'Intuição', ability: 'wis' },
  { id: 'medicine', name: 'Medicina', ability: 'wis' },
  { id: 'perception', name: 'Percepção', ability: 'wis' },
  { id: 'survival', name: 'Sobrevivência', ability: 'wis' },
  { id: 'deception', name: 'Enganação', ability: 'cha' },
  { id: 'intimidation', name: 'Intimidação', ability: 'cha' },
  { id: 'performance', name: 'Atuação', ability: 'cha' },
  { id: 'persuasion', name: 'Persuasão', ability: 'cha' },
];

export const RACES = [
  {
    id: 'human',
    name: 'Humano',
    bonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Versáteis, ambiciosos e adaptáveis. Humanos recebem +1 em todos os 6 atributos.',
    traits: ['Versatilidade: +1 em todos os atributos', 'Idioma extra e adaptabilidade']
  },
  {
    id: 'elf',
    name: 'Elfo',
    bonus: { dex: 2, int: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Seres mágicos de graça sobrenatural, mestres do arco e da magia.',
    traits: ['Visão no Escuro (18m)', 'Sentidos Aguçados (Percepção)', 'Ancestral Feérico', 'Transe (4h)']
  },
  {
    id: 'dwarf',
    name: 'Anão',
    bonus: { con: 2, str: 2 },
    speed: 7.5,
    size: 'Médio',
    description: 'Guerreiros e ferreiros indestrutíveis das fortalezas subterrâneas.',
    traits: ['Visão no Escuro (18m)', 'Resiliência Anã (Resistência a veneno)', 'Treinamento em Combate Anão']
  },
  {
    id: 'halfling',
    name: 'Halfling',
    bonus: { dex: 2, cha: 1 },
    speed: 7.5,
    size: 'Pequeno',
    description: 'Pequenos, furtivos e incrivelmente sortudos.',
    traits: ['Sortudo (Rerola 1 natural no d20)', 'Bravura', 'Agilidade Halfling']
  },
  {
    id: 'dragonborn',
    name: 'Draconato',
    bonus: { str: 2, cha: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Guerreiros dracônicos capazes de exalar sopro elemental.',
    traits: ['Ancestralidade Dracônica', 'Arma de Sopro (2d6 elemental)', 'Resistência a Fogo']
  },
  {
    id: 'gnome',
    name: 'Gnomo',
    bonus: { int: 2, con: 1 },
    speed: 7.5,
    size: 'Pequeno',
    description: 'Inventores brilhantes com mente afiada e resistência arcana.',
    traits: ['Visão no Escuro (18m)', 'Esperteza Gnômica (Vantagem contra magias)']
  },
  {
    id: 'half_elf',
    name: 'Meio-Elfo',
    bonus: { cha: 2, dex: 1, con: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Combinam a diplomacia humana com a elegância élfica.',
    traits: ['Visão no Escuro (18m)', 'Ancestral Feérico', 'Versatilidade em Perícias']
  },
  {
    id: 'half_orc',
    name: 'Meio-Orc',
    bonus: { str: 2, con: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Combatentes implacáveis que permanecem de pé mesmo diante da morte.',
    traits: ['Visão no Escuro (18m)', 'Resistência Implacável (Volta com 1 PV)', 'Ataques Selvagens (Crítico extra)']
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    bonus: { cha: 2, int: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Herdeiros de linhagem infernal, imunes ao medo das chamas.',
    traits: ['Visão no Escuro (18m)', 'Resistência Infernal (Fogo)', 'Legado Infernal']
  }
];

export const CLASSES = [
  {
    id: 'fighter',
    name: 'Guerreiro',
    hitDie: 10,
    savingThrows: ['str', 'con'],
    primary: 'str',
    recommendedStats: { str: 15, con: 14, dex: 13, wis: 12, cha: 10, int: 8 },
    description: 'Mestres de armas e armaduras pesadas, dominando a linha de frente.',
    features: ['Retomar o Fôlego (Cura 1d10+Nível)', 'Estilo de Luta (+2 Ataque/Dano)', 'Surto de Ação'],
    startingGold: 120,
    starterGear: ['espada_longa', 'escudo', 'cota_de_malha', 'arco_curto', 'pocao_cura', 'pocao_cura']
  },
  {
    id: 'wizard',
    name: 'Mago',
    hitDie: 6,
    savingThrows: ['int', 'wis'],
    primary: 'int',
    spellcaster: true,
    recommendedStats: { int: 15, dex: 14, con: 13, wis: 12, cha: 10, str: 8 },
    description: 'Sábios arcanos que conjuram bolas de fogo, mísseis mágicos e barreiras.',
    features: ['Grimório Arcano', 'Recuperação Arcana', 'Conjuração Ritual'],
    startingGold: 110,
    starterGear: ['bordao', 'adaga', 'foco_arcano', 'pocao_cura', 'pocao_cura'],
    spells: ['fire_bolt', 'magic_missile', 'shield', 'thunderwave', 'scorching_ray']
  },
  {
    id: 'rogue',
    name: 'Ladino',
    hitDie: 8,
    savingThrows: ['dex', 'int'],
    primary: 'dex',
    recommendedStats: { dex: 15, con: 14, int: 13, cha: 12, wis: 10, str: 8 },
    description: 'Assassinos e batedores ágeis que causam dano massivo com Ataque Furtivo.',
    features: ['Ataque Furtivo (+1d6 de dano extra)', 'Ação Ardilosa', 'Esquiva Sobrenatural'],
    startingGold: 120,
    starterGear: ['rapieira', 'adaga', 'arco_curto', 'armadura_couro_batido', 'kit_ladrao', 'pocao_cura']
  },
  {
    id: 'cleric',
    name: 'Clérigo',
    hitDie: 8,
    savingThrows: ['wis', 'cha'],
    primary: 'wis',
    spellcaster: true,
    recommendedStats: { wis: 15, con: 14, str: 13, cha: 12, dex: 10, int: 8 },
    description: 'Campeões divinos que curam aliados feridos e queimam inimigos com luz sagrada.',
    features: ['Domínio Divino da Vida', 'Canalizar Divindade', 'Destruir Mortos-Vivos'],
    startingGold: 130,
    starterGear: ['maca', 'escudo', 'cota_de_malha', 'simbolo_sagrado', 'pocao_cura', 'pocao_cura'],
    spells: ['sacred_flame', 'cure_wounds', 'bless', 'inflict_wounds']
  },
  {
    id: 'barbarian',
    name: 'Bárbaro',
    hitDie: 12,
    savingThrows: ['str', 'con'],
    primary: 'str',
    recommendedStats: { str: 15, con: 14, dex: 13, wis: 12, cha: 10, int: 8 },
    description: 'Brutos indomáveis com imensa reserva de vida e fúria devastadora.',
    features: ['Fúria (+2 dano e resistência física)', 'Defesa sem Armadura (10+DES+CON)', 'Ataque Descuidado'],
    startingGold: 90,
    starterGear: ['machado_grande', 'machado_batalha', 'azagaia', 'pocao_cura', 'pocao_cura']
  },
  {
    id: 'bard',
    name: 'Bardo',
    hitDie: 8,
    savingThrows: ['dex', 'cha'],
    primary: 'cha',
    spellcaster: true,
    recommendedStats: { cha: 15, dex: 14, con: 13, wis: 12, int: 10, str: 8 },
    description: 'Artistas místicos que inspiram heróis, curam feridas e confundem inimigos.',
    features: ['Inspiração de Bardo (+1d6)', 'Canção de Descanso', 'Magia Musical'],
    startingGold: 120,
    starterGear: ['rapieira', 'flauta', 'armadura_couro', 'adaga', 'pocao_cura'],
    spells: ['vicious_mockery', 'cure_wounds', 'thunderwave', 'bless']
  },
  {
    id: 'paladin',
    name: 'Paladino',
    hitDie: 10,
    savingThrows: ['wis', 'cha'],
    primary: 'str',
    spellcaster: true,
    recommendedStats: { str: 15, cha: 14, con: 13, wis: 12, dex: 10, int: 8 },
    description: 'Cavaleiros sagrados blindados que desferem Destruição Divina e curam pelas mãos.',
    features: ['Cura pelas Mãos', 'Destruição Divina (+2d8 radiante)', 'Aura de Proteção'],
    startingGold: 140,
    starterGear: ['espada_longa', 'escudo', 'cota_de_malha', 'simbolo_sagrado', 'pocao_cura'],
    spells: ['cure_wounds', 'bless', 'sacred_flame']
  },
  {
    id: 'ranger',
    name: 'Patrulheiro',
    hitDie: 10,
    savingThrows: ['str', 'dex'],
    primary: 'dex',
    spellcaster: true,
    recommendedStats: { dex: 15, wis: 14, con: 13, str: 12, int: 10, cha: 8 },
    description: 'Arqueiros letais e caçadores de monstros das terras selvagens.',
    features: ['Inimigo Favorito (+2 dano)', 'Estilo de Arquearia', 'Marca do Caçador'],
    startingGold: 120,
    starterGear: ['arco_longo', 'espada_curta', 'armadura_couro_batido', 'pocao_cura', 'pocao_cura'],
    spells: ['cure_wounds', 'fire_bolt']
  },
  {
    id: 'warlock',
    name: 'Bruxo',
    hitDie: 8,
    savingThrows: ['wis', 'cha'],
    primary: 'cha',
    spellcaster: true,
    recommendedStats: { cha: 15, con: 14, dex: 13, wis: 12, int: 10, str: 8 },
    description: 'Portadores de pactos ocultos que disparam Rajadas Místicas destruidoras.',
    features: ['Rajada Mística Agonizante', 'Magia de Pacto', 'Bênção do Obscuro'],
    startingGold: 100,
    starterGear: ['adaga', 'foco_arcano', 'armadura_couro', 'pocao_cura'],
    spells: ['eldritch_blast', 'inflict_wounds', 'scorching_ray', 'misty_step']
  }
];

export const ITEMS = {
  // Armas Corpo-a-Corpo e Distância (range em quadrados de 1.5m: 1 = corpo-a-corpo, 12 = 18m, etc.)
  espada_curta: { id: 'espada_curta', name: 'Espada Curta', type: 'weapon', cost: 10, currency: 'PO', damage: '1d6', damageType: 'perfurante', range: 1.5, properties: ['Finesse', 'Leve'], weight: 1 },
  espada_longa: { id: 'espada_longa', name: 'Espada Longa', type: 'weapon', cost: 15, currency: 'PO', damage: '1d8', damageType: 'cortante', range: 1.5, properties: ['Versátil (1d10)'], weight: 1.5 },
  machado_grande: { id: 'machado_grande', name: 'Machado Grande', type: 'weapon', cost: 30, currency: 'PO', damage: '1d12', damageType: 'cortante', range: 1.5, properties: ['Pesada', 'Duas Mãos'], weight: 3 },
  machado_batalha: { id: 'machado_batalha', name: 'Machado de Batalha', type: 'weapon', cost: 10, currency: 'PO', damage: '1d8', damageType: 'cortante', range: 1.5, properties: ['Versátil (1d10)'], weight: 2 },
  adaga: { id: 'adaga', name: 'Adaga', type: 'weapon', cost: 2, currency: 'PO', damage: '1d4', damageType: 'perfurante', range: 6, properties: ['Finesse', 'Leve', 'Arremesso (6m)'], weight: 0.5 },
  maca: { id: 'maca', name: 'Maça de Guerra', type: 'weapon', cost: 5, currency: 'PO', damage: '1d6', damageType: 'concussão', range: 1.5, properties: [], weight: 2 },
  bordao: { id: 'bordao', name: 'Bordão Arcano', type: 'weapon', cost: 2, currency: 'PO', damage: '1d6', damageType: 'concussão', range: 1.5, properties: ['Versátil (1d8)'], weight: 2 },
  rapieira: { id: 'rapieira', name: 'Rapieira Nobre', type: 'weapon', cost: 25, currency: 'PO', damage: '1d8', damageType: 'perfurante', range: 1.5, properties: ['Finesse'], weight: 1 },
  arco_curto: { id: 'arco_curto', name: 'Arco Curto', type: 'weapon', cost: 25, currency: 'PO', damage: '1d6', damageType: 'perfurante', range: 18, properties: ['Munição (24m)', 'Duas Mãos'], weight: 1 },
  arco_longo: { id: 'arco_longo', name: 'Arco Longo Élfico', type: 'weapon', cost: 50, currency: 'PO', damage: '1d8', damageType: 'perfurante', range: 24, properties: ['Munição (45m)', 'Duas Mãos'], weight: 1 },
  azagaia: { id: 'azagaia', name: 'Azagaia de Aço', type: 'weapon', cost: 1, currency: 'PO', damage: '1d6', damageType: 'perfurante', range: 9, properties: ['Arremesso (9m)'], weight: 1 },
  espada_flamejante: { id: 'espada_flamejante', name: 'Espada Lâmina de Fogo (+1)', type: 'weapon', cost: 250, currency: 'PO', damage: '2d6+1', damageType: 'fogo', range: 1.5, properties: ['Mágico', 'Luz 6m'], weight: 1.5, magic: true },

  // Armaduras e Escudos
  armadura_couro: { id: 'armadura_couro', name: 'Armadura de Couro', type: 'armor', cost: 10, currency: 'PO', ac: 11, addDex: true, weight: 5, category: 'Leve' },
  armadura_couro_batido: { id: 'armadura_couro_batido', name: 'Couro Batido Reforçado', type: 'armor', cost: 45, currency: 'PO', ac: 12, addDex: true, weight: 6, category: 'Leve' },
  gibao_peles: { id: 'gibao_peles', name: 'Gibão de Peles', type: 'armor', cost: 15, currency: 'PO', ac: 12, addDex: true, maxDex: 2, weight: 6, category: 'Média' },
  cota_de_malha: { id: 'cota_de_malha', name: 'Cota de Malha de Aço', type: 'armor', cost: 75, currency: 'PO', ac: 16, addDex: false, weight: 20, category: 'Pesada' },
  armadura_placas: { id: 'armadura_placas', name: 'Armadura de Placas Real', type: 'armor', cost: 400, currency: 'PO', ac: 18, addDex: false, weight: 25, category: 'Pesada' },
  escudo: { id: 'escudo', name: 'Escudo de Aço (+2 CA)', type: 'shield', cost: 15, currency: 'PO', acBonus: 2, weight: 3 },

  // Poções e Consumíveis
  pocao_cura: { id: 'pocao_cura', name: 'Poção de Cura (2d4+2)', type: 'consumable', cost: 25, currency: 'PO', heal: '2d4+2', desc: 'Restaura 2d4 + 2 Pontos de Vida imediatamente.', weight: 0.2 },
  pocao_cura_maior: { id: 'pocao_cura_maior', name: 'Poção de Cura Maior (4d4+4)', type: 'consumable', cost: 80, currency: 'PO', heal: '4d4+4', desc: 'Restaura 4d4 + 4 Pontos de Vida imediatamente.', weight: 0.2 },
  pocao_forca: { id: 'pocao_forca', name: 'Elixir de Força do Gigante', type: 'consumable', cost: 100, currency: 'PO', heal: '1d8+4', desc: 'Restaura vigor e concede bônus heroico.', weight: 0.2 },
  antidoto: { id: 'antidoto', name: 'Antídoto Purificador', type: 'consumable', cost: 20, currency: 'PO', heal: '1d4+2', desc: 'Remove venenos e restaura 1d4+2 PV.', weight: 0.1 },

  // Equipamentos
  tocha: { id: 'tocha', name: 'Tocha (x5)', type: 'gear', cost: 2, currency: 'PO', desc: 'Ilumina 6 metros ao redor.', weight: 1 },
  corda_canhamo: { id: 'corda_canhamo', name: 'Corda de Cânhamo (15m)', type: 'gear', cost: 2, currency: 'PO', desc: 'Corda resistente para exploração.', weight: 2 },
  kit_ladrao: { id: 'kit_ladrao', name: 'Ferramentas de Ladrão', type: 'gear', cost: 25, currency: 'PO', desc: 'Permite abrir fechaduras e desarmar armadilhas.', weight: 1 },
  simbolo_sagrado: { id: 'simbolo_sagrado', name: 'Símbolo Sagrado', type: 'gear', cost: 5, currency: 'PO', desc: 'Canalizador de poder divino.', weight: 0.5 },
  foco_arcano: { id: 'foco_arcano', name: 'Orbe Arcano', type: 'gear', cost: 20, currency: 'PO', desc: 'Canalizador de feitiços arcanos.', weight: 0.5 },
  flauta: { id: 'flauta', name: 'Alaúde / Flauta Élfica', type: 'gear', cost: 12, currency: 'PO', desc: 'Instrumento musical mágico.', weight: 0.5 },

  // Armas e Equipamentos por Tier / Land
  espada_curta_afiada: { id: 'espada_curta_afiada', name: 'Espada Curta Afiada (+1)', type: 'weapon', cost: 25, currency: 'PO', damage: '1d6+1', damageType: 'perfurante', range: 1.5, properties: ['Finesse', 'Leve'], weight: 1 },
  arco_cacador: { id: 'arco_cacador', name: 'Arco do Caçador Florestal', type: 'weapon', cost: 40, currency: 'PO', damage: '1d6+1', damageType: 'perfurante', range: 20, properties: ['Munição', 'Duas Mãos'], weight: 1 },
  adaga_silenciosa: { id: 'adaga_silenciosa', name: 'Adaga Silenciosa da Sombra', type: 'weapon', cost: 30, currency: 'PO', damage: '1d4+2', damageType: 'perfurante', range: 6, properties: ['Finesse', 'Leve', 'Crítico Expandido'], weight: 0.5 },
  escudo_madeira: { id: 'escudo_madeira', name: 'Escudo de Carvalho Reforçado (+2 CA)', type: 'shield', cost: 10, currency: 'PO', acBonus: 2, weight: 2 },
  pocao_cura_pequena: { id: 'pocao_cura_pequena', name: 'Poção de Ervas Medicinais (1d6+2)', type: 'consumable', cost: 15, currency: 'PO', heal: '1d6+2', desc: 'Extrato de ervas da floresta que restaura 1d6+2 PV.', weight: 0.2 },
  
  // Tier 2 (Pântano)
  espada_longa_aco: { id: 'espada_longa_aco', name: 'Espada Longa de Aço Temperado (+2)', type: 'weapon', cost: 70, currency: 'PO', damage: '1d8+2', damageType: 'cortante', range: 1.5, properties: ['Versátil (1d10+2)'], weight: 1.5 },
  cota_malha_reforcada: { id: 'cota_malha_reforcada', name: 'Cota de Malha Revestida', type: 'armor', cost: 120, currency: 'PO', ac: 17, addDex: false, weight: 22, category: 'Pesada' },
  manto_pantano: { id: 'manto_pantano', name: 'Manto das Névoas (+1 CA, +5 PV)', type: 'magic', cost: 90, currency: 'PO', acBonus: 1, hpBonus: 5, desc: 'Protege contra toxinas e eleva a vitalidade.', weight: 0.5, magic: true },
  elixir_antidoto: { id: 'elixir_antidoto', name: 'Elixir Antídoto de Baba Morwenna', type: 'consumable', cost: 35, currency: 'PO', heal: '2d4+4', desc: 'Neutraliza qualquer veneno e restaura 2d4+4 PV.', weight: 0.2 },

  // Tier 3 (Cavernas de Cristal)
  machado_cristal: { id: 'machado_cristal', name: 'Machado Vorpal de Cristal (+3)', type: 'weapon', cost: 180, currency: 'PO', damage: '1d10+3', damageType: 'cortante', range: 1.5, properties: ['Versátil', 'Corte de Cristal'], weight: 2.5, magic: true },
  martelo_runico: { id: 'martelo_runico', name: 'Martelo Rúnico de Thorin (+3)', type: 'weapon', cost: 220, currency: 'PO', damage: '2d6+3', damageType: 'concussão', range: 1.5, properties: ['Pesada', 'Atordoamento Sísmico'], weight: 3.5, magic: true },
  pocao_cura_superior: { id: 'pocao_cura_superior', name: 'Poção de Cura Superior (6d4+6)', type: 'consumable', cost: 150, currency: 'PO', heal: '6d4+6', desc: 'Restaura rapidamente 6d4+6 Pontos de Vida.', weight: 0.2 },

  // Tier 4 (Masmorra Proibida)
  lamina_solar: { id: 'lamina_solar', name: 'Lâmina Solar Sagrada (+4)', type: 'weapon', cost: 450, currency: 'PO', damage: '2d8+4', damageType: 'radiante', range: 1.5, properties: ['Finesse', 'Dano Radiante Sagrado'], weight: 1.5, magic: true },
  armadura_placas_completa: { id: 'armadura_placas_completa', name: 'Armadura Completa dos Reis (+15 PV, CA 20)', type: 'armor', cost: 650, currency: 'PO', ac: 20, hpBonus: 15, addDex: false, weight: 28, category: 'Pesada', magic: true },
  cajado_arquimago: { id: 'cajado_arquimago', name: 'Cajado Celestial do Arquimago', type: 'weapon', cost: 500, currency: 'PO', damage: '2d8+3', damageType: 'fogo', range: 18, properties: ['Foco Supremo', 'Disparo de Chamas Arcanas'], weight: 2, magic: true },
  elixir_divino: { id: 'elixir_divino', name: 'Elixir Divino da Ressurreição (8d4+10)', type: 'consumable', cost: 250, currency: 'PO', heal: '8d4+10', desc: 'Restaura totalmente as forças vitais e regenera 8d4+10 PV.', weight: 0.3 },

  // Itens Mágicos
  anel_protecao: { id: 'anel_protecao', name: 'Anel de Proteção (+1 CA)', type: 'magic', cost: 200, currency: 'PO', acBonus: 1, desc: 'Aumenta sua Classe de Armadura (CA) em +1.', weight: 0.1, magic: true },
  amuleto_saude: { id: 'amuleto_saude', name: 'Amuleto de Vitalidade (+10 PV)', type: 'magic', cost: 250, currency: 'PO', hpBonus: 10, desc: 'Concede +10 de Vida Máxima ao portador.', weight: 0.2, magic: true }
};

export const SPELLS = [
  { id: 'fire_bolt', name: 'Raio de Fogo', level: 0, school: 'Evocação', range: 18, damage: '1d10', damageType: 'fogo', desc: 'Dispara uma lança de fogo contra o inimigo (Alcance 18m).' },
  { id: 'eldritch_blast', name: 'Rajada Mística', level: 0, school: 'Evocação', range: 18, damage: '1d10+2', damageType: 'energia', desc: 'Feixe crepitante de energia mística pura (Alcance 18m).' },
  { id: 'sacred_flame', name: 'Chama Sagrada', level: 0, school: 'Evocação', range: 15, damage: '1d8+2', damageType: 'radiante', desc: 'Luz solar desce dos céus queimando o inimigo (Alcance 15m).' },
  { id: 'vicious_mockery', name: 'Zombaria Viciosa', level: 0, school: 'Encantamento', range: 15, damage: '1d6+1', damageType: 'psíquico', desc: 'Palavras encantadas que ferem a mente do alvo.' },
  { id: 'magic_missile', name: 'Mísseis Mágicos', level: 1, school: 'Evocação', range: 18, damage: '3d4+3', autoHit: true, damageType: 'energia', desc: 'Três dardos luminosos que ACERTAM AUTOMATICAMENTE o alvo!' },
  { id: 'cure_wounds', name: 'Curar Ferimentos', level: 1, school: 'Evocação', range: 9, heal: '1d8+4', desc: 'Energia positiva que restaura 1d8+4 PV seus ou de um aliado.' },
  { id: 'shield', name: 'Escudo Arcano', level: 1, school: 'Abjuração', range: 0, buffAc: 2, heal: '1d4+2', desc: 'Cria uma barreira mágica protetora ao seu redor.' },
  { id: 'thunderwave', name: 'Onda Trovejante', level: 1, school: 'Evocação', range: 6, damage: '2d8', damageType: 'trovão', desc: 'Explosão sônica devastadora em curto alcance.' },
  { id: 'inflict_wounds', name: 'Infligir Ferimentos', level: 1, school: 'Necromancia', range: 3, damage: '3d10', damageType: 'necrótico', desc: 'Toque sombrio que drena a vida do alvo.' },
  { id: 'bless', name: 'Palavra Curativa Divina', level: 1, school: 'Evocação', range: 15, heal: '2d4+3', desc: 'Prece divina que restaura 2d4+3 PV à distância.' },
  { id: 'scorching_ray', name: 'Raio Ardente', level: 2, school: 'Evocação', range: 18, damage: '4d6', damageType: 'fogo', desc: 'Dispara rajadas explosivas de fogo solar.' },
  { id: 'misty_step', name: 'Passo Nebuloso', level: 2, school: 'Conjuração', range: 9, teleport: true, desc: 'Envolto em névoa prateada, você se teletransporta instantaneamente até 9 metros para um espaço desocupado.' }
];

export const MONSTERS = [
  {
    id: 'goblin',
    name: 'Goblin Saqueador',
    cr: '1/4',
    xp: 50,
    goldDrop: 12,
    hp: 10,
    maxHp: 10,
    ac: 13,
    speed: 9,
    size: 'Pequeno',
    color: '#34D399',
    avatar: '👺',
    stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    actions: [
      { name: 'Cimitarra Enferrujada', bonus: 4, damage: '1d6+2', range: 1.5, type: 'cortante', desc: 'Ataque corpo-a-corpo (+4)' },
      { name: 'Arco Curto Goblin', bonus: 4, damage: '1d6+2', range: 12, type: 'perfurante', desc: 'Disparo à distância (+4, 12m)' }
    ],
    features: ['Fuga Ágil: Move-se rapidamente pelas sombras']
  },
  {
    id: 'kobold',
    name: 'Kobold Lanceiro',
    cr: '1/8',
    xp: 35,
    goldDrop: 8,
    hp: 8,
    maxHp: 8,
    ac: 12,
    speed: 9,
    size: 'Pequeno',
    color: '#F59E0B',
    avatar: '🦎',
    stats: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
    actions: [
      { name: 'Lança Afiada', bonus: 4, damage: '1d6+2', range: 1.5, type: 'perfurante', desc: 'Estocada rápida (+4)' },
      { name: 'Pedrada de Funda', bonus: 4, damage: '1d4+2', range: 10, type: 'concussão', desc: 'Arremesso à distância (+4)' }
    ],
    features: ['Tática de Bando']
  },
  {
    id: 'skeleton',
    name: 'Esqueleto Guerreiro',
    cr: '1/4',
    xp: 60,
    goldDrop: 15,
    hp: 14,
    maxHp: 14,
    ac: 13,
    speed: 9,
    size: 'Médio',
    color: '#E5E7EB',
    avatar: '💀',
    stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    actions: [
      { name: 'Espada Antiga', bonus: 4, damage: '1d6+2', range: 1.5, type: 'cortante', desc: 'Golpe de lâmina (+4)' },
      { name: 'Arco de Ossos', bonus: 4, damage: '1d6+2', range: 14, type: 'perfurante', desc: 'Flecha sombria (+4)' }
    ],
    features: ['Morto-Vivo Implacável']
  },
  {
    id: 'zombie',
    name: 'Zumbi das Catacumbas',
    cr: '1/4',
    xp: 60,
    goldDrop: 10,
    hp: 22,
    maxHp: 22,
    ac: 9,
    speed: 6,
    size: 'Médio',
    color: '#10B981',
    avatar: '🧟',
    stats: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
    actions: [
      { name: 'Pancada Putrefata', bonus: 3, damage: '1d6+2', range: 1.5, type: 'concussão', desc: 'Ataque corpo-a-corpo pesado (+3)' }
    ],
    features: ['Fortitude dos Mortos-Vivos']
  },
  {
    id: 'bandit',
    name: 'Bandido Mercenário',
    cr: '1/2',
    xp: 75,
    goldDrop: 25,
    hp: 16,
    maxHp: 16,
    ac: 13,
    speed: 9,
    size: 'Médio',
    color: '#F97316',
    avatar: '🗡️',
    stats: { str: 12, dex: 14, con: 12, int: 10, wis: 10, cha: 10 },
    actions: [
      { name: 'Sabre Mercenário', bonus: 4, damage: '1d6+2', range: 1.5, type: 'cortante', desc: 'Corte rápido (+4)' },
      { name: 'Besta Leve', bonus: 4, damage: '1d8+2', range: 14, type: 'perfurante', desc: 'Virote de besta (+4)' }
    ],
    features: ['Saqueador de Estradas']
  },
  {
    id: 'orc',
    name: 'Orc Berserker',
    cr: '1/2',
    xp: 100,
    goldDrop: 30,
    hp: 20,
    maxHp: 20,
    ac: 13,
    speed: 9,
    size: 'Médio',
    color: '#84CC16',
    avatar: '👹',
    stats: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    actions: [
      { name: 'Machado Grande Brutal', bonus: 5, damage: '1d12+3', range: 1.5, type: 'cortante', desc: 'Golpe devastador (+5)' },
      { name: 'Azagaia de Guerra', bonus: 5, damage: '1d6+3', range: 9, type: 'perfurante', desc: 'Lança arremessada (+5)' }
    ],
    features: ['Agressivo: Avança ferozmente contra os heróis']
  },
  {
    id: 'dire_wolf',
    name: 'Lobo Atroz Alfa',
    cr: '1',
    xp: 150,
    goldDrop: 20,
    hp: 32,
    maxHp: 32,
    ac: 14,
    speed: 12,
    size: 'Grande',
    color: '#9CA3AF',
    avatar: '🐺',
    stats: { str: 17, dex: 15, con: 15, int: 3, wis: 12, cha: 7 },
    actions: [
      { name: 'Mordida Dilacerante', bonus: 5, damage: '2d6+3', range: 1.5, type: 'perfurante', desc: 'Mordida feroz que pode derrubar (+5)' }
    ],
    features: ['Tática de Matilha']
  },
  {
    id: 'giant_spider',
    name: 'Aranha Gigante Venenosa',
    cr: '1',
    xp: 180,
    goldDrop: 35,
    hp: 28,
    maxHp: 28,
    ac: 14,
    speed: 9,
    size: 'Grande',
    color: '#A855F7',
    avatar: '🕷️',
    stats: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
    actions: [
      { name: 'Presas Peçonhentas', bonus: 5, damage: '1d8+4', range: 1.5, type: 'veneno', desc: 'Mordida venenosa (+5)' },
      { name: 'Cuspir Ácido/Teia', bonus: 5, damage: '1d6+2', range: 10, type: 'ácido', desc: 'Jato corrosivo à distância (+5)' }
    ],
    features: ['Predadora das Cavernas']
  },
  {
    id: 'ogre',
    name: 'Ogro Esmagador',
    cr: '2',
    xp: 350,
    goldDrop: 65,
    hp: 55,
    maxHp: 55,
    ac: 12,
    speed: 9,
    size: 'Grande',
    color: '#D97706',
    avatar: '🧌',
    stats: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
    actions: [
      { name: 'Clava Gigante', bonus: 6, damage: '2d8+4', range: 2, type: 'concussão', desc: 'Impacto esmagador (+6)' },
      { name: 'Arremessar Rocha', bonus: 6, damage: '2d6+4', range: 12, type: 'concussão', desc: 'Pedregulho pesado (+6)' }
    ],
    features: ['Força Colossal']
  },
  {
    id: 'necromancer',
    name: 'Necromante Sombrio',
    cr: '3',
    xp: 500,
    goldDrop: 100,
    hp: 45,
    maxHp: 45,
    ac: 14,
    speed: 9,
    size: 'Médio',
    color: '#7C3AED',
    avatar: '🧙‍♂️',
    stats: { str: 9, dex: 14, con: 14, int: 17, wis: 12, cha: 14 },
    actions: [
      { name: 'Raio da Morte Necrótico', bonus: 6, damage: '2d8+3', range: 15, type: 'necrótico', desc: 'Magia sombria à distância (+6)' },
      { name: 'Cajado das Almas', bonus: 4, damage: '1d8+2', range: 1.5, type: 'necrótico', desc: 'Golpe arcano (+4)' }
    ],
    features: ['Senhor dos Mortos-Vivos']
  },
  {
    id: 'young_red_dragon',
    name: 'Dragão Vermelho Ancião',
    cr: '10',
    xp: 1500,
    goldDrop: 500,
    hp: 140,
    maxHp: 140,
    ac: 17,
    speed: 12,
    size: 'Grande',
    color: '#EF4444',
    avatar: '🐉',
    stats: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
    actions: [
      { name: 'Mordida e Garras Dracônicas', bonus: 8, damage: '2d10+5', range: 2.5, type: 'perfurante', desc: 'Ataque feroz de mandíbula (+8)' },
      { name: 'Sopro de Chamas Infernais', bonus: 7, damage: '3d8+5', range: 12, type: 'fogo', desc: 'Torrente de fogo dracônico (+7)' }
    ],
    features: ['Voo Rasante', 'Escamas Impenetráveis']
  },
  {
    id: 'beholder',
    name: 'Observador (Beholder)',
    cr: '13',
    xp: 2000,
    goldDrop: 600,
    hp: 150,
    maxHp: 150,
    ac: 17,
    speed: 6,
    size: 'Grande',
    color: '#EC4899',
    avatar: '👁️',
    stats: { str: 10, dex: 14, con: 18, int: 17, wis: 15, cha: 17 },
    actions: [
      { name: 'Raio Ocular de Desintegração', bonus: 8, damage: '3d8+4', range: 15, type: 'energia', desc: 'Feixe ocular mortal (+8)' },
      { name: 'Mordida Aberrante', bonus: 5, damage: '2d6+2', range: 1.5, type: 'perfurante', desc: 'Mordida central (+5)' }
    ],
    features: ['Olho Antimagia', 'Levitação']
  },

  // === INIMIGOS E BOSSES POR LAND (A Lenda das Quatro Relíquias) ===
  // Land 1: Floresta
  {
    id: 'forest_slime',
    name: 'Slime da Floresta',
    cr: '1/4',
    xp: 50,
    goldDrop: 12,
    hp: 14,
    maxHp: 14,
    ac: 11,
    speed: 7.5,
    size: 'Médio',
    color: '#22c55e',
    avatar: '🟢',
    stats: { str: 10, dex: 12, con: 13, int: 1, wis: 8, cha: 3 },
    actions: [{ name: 'Gosma Ácida', bonus: 3, damage: '1d6+1', range: 1.5, type: 'ácido', desc: 'Ataque pegajoso' }]
  },
  {
    id: 'forest_spider',
    name: 'Aranha do Bosque',
    cr: '1/2',
    xp: 80,
    goldDrop: 18,
    hp: 18,
    maxHp: 18,
    ac: 13,
    speed: 9,
    size: 'Médio',
    color: '#8b5cf6',
    avatar: '🕷️',
    stats: { str: 12, dex: 15, con: 12, int: 2, wis: 10, cha: 4 },
    actions: [{ name: 'Mordida Venenosa', bonus: 4, damage: '1d6+2', range: 1.5, type: 'veneno', desc: 'Injeta toxina' }]
  },
  {
    id: 'goblin_scout',
    name: 'Goblin Batedor',
    cr: '1/2',
    xp: 75,
    goldDrop: 15,
    hp: 16,
    maxHp: 16,
    ac: 13,
    speed: 9,
    size: 'Pequeno',
    color: '#65a30d',
    avatar: '👺',
    stats: { str: 10, dex: 14, con: 12, int: 10, wis: 8, cha: 8 },
    actions: [
      { name: 'Adaga Serrilhada', bonus: 4, damage: '1d6+2', range: 1.5, type: 'perfurante', desc: 'Golpe rápido' },
      { name: 'Arco Curto', bonus: 4, damage: '1d6+2', range: 15, type: 'perfurante', desc: 'Disparo de flecha' }
    ]
  },
  {
    id: 'arachna_queen',
    name: 'Arachna, a Tecedora Sombria',
    cr: '2',
    xp: 350,
    goldDrop: 160,
    hp: 55,
    maxHp: 55,
    ac: 14,
    speed: 9,
    size: 'Grande',
    color: '#9333ea',
    avatar: '🕷️',
    isBoss: true,
    stats: { str: 15, dex: 16, con: 14, int: 6, wis: 12, cha: 8 },
    actions: [
      { name: 'Picada Peçonhenta', bonus: 5, damage: '2d6+3', range: 1.5, type: 'veneno', desc: 'Picada massiva com peçonha (+5)' },
      { name: 'Jato de Teia Paralisante', bonus: 4, damage: '1d8+2', range: 8, type: 'ácido', desc: 'Prende e corrói à distância (+4)' }
    ]
  },

  // Land 2: Pântano
  {
    id: 'bog_slime',
    name: 'Slime Tóxico do Pântano',
    cr: '1',
    xp: 120,
    goldDrop: 25,
    hp: 26,
    maxHp: 26,
    ac: 12,
    speed: 7.5,
    size: 'Médio',
    color: '#10b981',
    avatar: '🟩',
    stats: { str: 12, dex: 10, con: 16, int: 2, wis: 8, cha: 2 },
    actions: [{ name: 'Lodo Fétido', bonus: 4, damage: '1d8+2', range: 1.5, type: 'ácido', desc: 'Queima com ácido corrosivo' }]
  },
  {
    id: 'giant_swamp_frog',
    name: 'Sapo Carnívoro Gigante',
    cr: '1',
    xp: 150,
    goldDrop: 30,
    hp: 34,
    maxHp: 34,
    ac: 13,
    speed: 9,
    size: 'Grande',
    color: '#15803d',
    avatar: '🐸',
    stats: { str: 15, dex: 13, con: 14, int: 2, wis: 10, cha: 3 },
    actions: [
      { name: 'Língua Chicoteante', bonus: 5, damage: '1d8+3', range: 4.5, type: 'contundente', desc: 'Puxa e atinge com impacto' },
      { name: 'Mordida Devoradora', bonus: 5, damage: '2d6+3', range: 1.5, type: 'perfurante', desc: 'Abocanha o alvo (+5)' }
    ]
  },
  {
    id: 'swamp_troll',
    name: 'Troll Menor do Brejo',
    cr: '2',
    xp: 250,
    goldDrop: 50,
    hp: 45,
    maxHp: 45,
    ac: 13,
    speed: 9,
    size: 'Grande',
    color: '#065f46',
    avatar: '🧌',
    stats: { str: 17, dex: 10, con: 16, int: 5, wis: 9, cha: 5 },
    actions: [
      { name: 'Garras de Lodo', bonus: 5, damage: '2d6+3', range: 1.5, type: 'cortante', desc: 'Arranhão dilacerante' }
    ]
  },
  {
    id: 'bog_abomination',
    name: 'Gargatroll, a Abominação do Lodo',
    cr: '4',
    xp: 650,
    goldDrop: 280,
    hp: 95,
    maxHp: 95,
    ac: 15,
    speed: 9,
    size: 'Grande',
    color: '#047857',
    avatar: '🧌',
    isBoss: true,
    stats: { str: 19, dex: 10, con: 18, int: 6, wis: 11, cha: 7 },
    actions: [
      { name: 'Clava de Tronco Podre', bonus: 6, damage: '2d8+4', range: 2, type: 'contundente', desc: 'Golpe sísmico de tronco (+6)' },
      { name: 'Vômito Corrosivo de Lodo', bonus: 5, damage: '2d6+3', range: 9, type: 'ácido', desc: 'Cuspe em área que corrói armaduras (+5)' }
    ]
  },

  // Land 3: Cavernas
  {
    id: 'crystal_spider',
    name: 'Aranha de Cristal Perfurante',
    cr: '2',
    xp: 220,
    goldDrop: 55,
    hp: 42,
    maxHp: 42,
    ac: 15,
    speed: 9,
    size: 'Médio',
    color: '#06b6d4',
    avatar: '🕷️',
    stats: { str: 14, dex: 17, con: 14, int: 3, wis: 12, cha: 4 },
    actions: [
      { name: 'Ferrão de Safira', bonus: 6, damage: '2d6+3', range: 1.5, type: 'perfurante', desc: 'Perfura carapaças (+6)' },
      { name: 'Disparo de Agulhas Cristalinas', bonus: 5, damage: '1d10+2', range: 12, type: 'perfurante', desc: 'Estilhaços à distância' }
    ]
  },
  {
    id: 'mine_goblin',
    name: 'Goblin Minerador Salteador',
    cr: '1',
    xp: 140,
    goldDrop: 40,
    hp: 30,
    maxHp: 30,
    ac: 14,
    speed: 9,
    size: 'Pequeno',
    color: '#eab308',
    avatar: '👺',
    stats: { str: 12, dex: 15, con: 13, int: 10, wis: 8, cha: 7 },
    actions: [
      { name: 'Picareta Pesada', bonus: 5, damage: '1d8+2', range: 1.5, type: 'perfurante', desc: 'Golpe perfurador de rocha' },
      { name: 'Dinamite das Minas', bonus: 4, damage: '2d6', range: 9, type: 'fogo', desc: 'Explosão de pólvora' }
    ]
  },
  {
    id: 'rock_troglodyte',
    name: 'Troglodita Pedregoso',
    cr: '2',
    xp: 260,
    goldDrop: 60,
    hp: 52,
    maxHp: 52,
    ac: 15,
    speed: 9,
    size: 'Médio',
    color: '#78716c',
    avatar: '🗿',
    stats: { str: 18, dex: 10, con: 17, int: 6, wis: 10, cha: 6 },
    actions: [
      { name: 'Maça de Obsidiana', bonus: 6, damage: '2d8+4', range: 1.5, type: 'contundente', desc: 'Pancada pesada de pedra' }
    ]
  },
  {
    id: 'crystal_colossus',
    name: 'O Colosso de Cristal Ancestral',
    cr: '6',
    xp: 1200,
    goldDrop: 450,
    hp: 150,
    maxHp: 150,
    ac: 16,
    speed: 7.5,
    size: 'Grande',
    color: '#0ea5e9',
    avatar: '💎',
    isBoss: true,
    stats: { str: 21, dex: 8, con: 20, int: 4, wis: 11, cha: 6 },
    actions: [
      { name: 'Punho Sísmico Esmagador', bonus: 7, damage: '2d10+5', range: 2, type: 'contundente', desc: 'Golpe colossal de pedra (+7)' },
      { name: 'Disparo de Estilhaços Prismáticos', bonus: 6, damage: '2d8+4', range: 12, type: 'perfurante', desc: 'Chuva de fragmentos afiados (+6)' }
    ]
  },

  // Land 4: Masmorra Proibida
  {
    id: 'skeleton_knight',
    name: 'Cavaleiro Esqueleto Blindado',
    cr: '2',
    xp: 300,
    goldDrop: 70,
    hp: 48,
    maxHp: 48,
    ac: 16,
    speed: 9,
    size: 'Médio',
    color: '#94a3b8',
    avatar: '💀',
    stats: { str: 16, dex: 12, con: 15, int: 8, wis: 10, cha: 7 },
    actions: [
      { name: 'Espada Longa Maldita', bonus: 6, damage: '1d10+3', range: 1.5, type: 'cortante', desc: 'Aço enferrujado mortal' },
      { name: 'Investida com Escudo', bonus: 5, damage: '1d6+3', range: 1.5, type: 'contundente', desc: 'Derruba o inimigo' }
    ]
  },
  {
    id: 'fire_imp',
    name: 'Diabrete Vulcânico',
    cr: '2',
    xp: 280,
    goldDrop: 65,
    hp: 38,
    maxHp: 38,
    ac: 14,
    speed: 10.5,
    size: 'Pequeno',
    color: '#f97316',
    avatar: '👿',
    stats: { str: 8, dex: 17, con: 13, int: 11, wis: 10, cha: 12 },
    actions: [
      { name: 'Lança-Chamas Menor', bonus: 5, damage: '2d6+3', range: 12, type: 'fogo', desc: 'Disparo ígneo' },
      { name: 'Garras Incandescentes', bonus: 5, damage: '1d6+3', range: 1.5, type: 'fogo', desc: 'Arranhão queimante' }
    ]
  },
  {
    id: 'abyssal_demon',
    name: 'Demônio Chifrudo Abissal',
    cr: '4',
    xp: 750,
    goldDrop: 140,
    hp: 85,
    maxHp: 85,
    ac: 15,
    speed: 9,
    size: 'Grande',
    color: '#dc2626',
    avatar: '👹',
    stats: { str: 19, dex: 13, con: 18, int: 11, wis: 12, cha: 13 },
    actions: [
      { name: 'Machado Abissal', bonus: 7, damage: '2d8+4', range: 2, type: 'cortante', desc: 'Golpe devastador (+7)' },
      { name: 'Fogo do Inferno', bonus: 6, damage: '2d8+3', range: 9, type: 'fogo', desc: 'Chamas do tártaro (+6)' }
    ]
  },
  {
    id: 'malakor_tyrant',
    name: 'Malakor, o Lorde Tirano das Trevas',
    cr: '10',
    xp: 2500,
    goldDrop: 1000,
    hp: 220,
    maxHp: 220,
    ac: 17,
    speed: 9,
    size: 'Grande',
    color: '#b91c1c',
    avatar: '👿',
    isBoss: true,
    stats: { str: 18, dex: 14, con: 20, int: 20, wis: 16, cha: 18 },
    actions: [
      { name: 'Ceifadora de Almas Vorpal', bonus: 8, damage: '3d8+5', range: 2, type: 'necrótico', desc: 'Espada do vazio que drena a vida (+8)' },
      { name: 'Chuva de Cometas Abissais', bonus: 7, damage: '3d6+4', range: 15, type: 'fogo', desc: 'Chuva de fogo e sombras no campo (+7)' }
    ]
  }
];

export const MAP_PRESETS = [
  // === AS QUATRO LANDS EXTENSAS (MAPAS PRÓPRIOS MMORPG) ===
  {
    id: 'land_forest',
    name: 'Land 1: A Floresta das Raízes Antigas',
    theme: 'forest',
    cols: 46,
    rows: 32,
    gridSize: 52,
    bgColor: '#0c1a10',
    floorColor: '#142918',
    gridColor: 'rgba(160, 255, 160, 0.06)',
    torches: [
      { x: 34, y: 8 }, // Fogueira do acampamento (Nordeste)
      { x: 10, y: 25 }, // Ponte do rio (Sudoeste)
      { x: 42, y: 23 }  // Entrada da Caverna do Boss (Sudeste)
    ],
    obstacles: [
      // Acampamento Seguro de Sobreviventes (Nordeste)
      { x: 30, y: 3, w: 3, h: 2, type: 'tent', label: 'Tenda dos Exploradores' },
      { x: 34, y: 2, w: 3, h: 2, type: 'tent', label: 'Tenda do Ancião' },
      { x: 37, y: 4, w: 3, h: 2, type: 'tent', label: 'Tenda de Suprimentos' },
      { x: 37, y: 9, w: 3, h: 2, type: 'tent', label: 'Tenda da Guarda' },
      { x: 28, y: 6, w: 2, h: 2, type: 'table', label: 'Bancada da Ferreira Kaelen' },
      { x: 34, y: 8, w: 1, h: 1, type: 'campfire', label: 'Fogueira do Acampamento' },

      // Rio Sussurrante no Sudoeste com Ponte de Madeira transitável em (8..12, 23..26)
      { x: 0, y: 19, w: 8, h: 5, type: 'water', label: 'Rio Sussurrante' },
      { x: 12, y: 27, w: 7, h: 5, type: 'water', label: 'Rio Sussurrante' },

      // Bosques Densos e Pinheiros da Região
      { x: 1, y: 1, w: 7, h: 5, type: 'tree', label: 'Bosque Noroeste' },
      { x: 9, y: 11, w: 6, h: 5, type: 'tree', label: 'Bosque Central' },
      { x: 17, y: 1, w: 6, h: 4, type: 'tree', label: 'Bosque Norte' },
      { x: 26, y: 15, w: 5, h: 5, type: 'tree', label: 'Pinheiros Antigos' },
      { x: 20, y: 23, w: 6, h: 5, type: 'tree', label: 'Mata Sul' },
      { x: 41, y: 2, w: 4, h: 11, type: 'tree', label: 'Mata Leste' },

      // Paredão Rochoso da Caverna Sudeste (Covil de Arachna)
      { x: 34, y: 23, w: 4, h: 5, type: 'wall', label: 'Paredão Rochoso' },
      { x: 44, y: 20, w: 2, h: 6, type: 'wall', label: 'Escarpa da Caverna' }
    ]
  },

  {
    id: 'land_swamp',
    name: 'Land 2: O Pântano da Bruxa dos Espelhos',
    theme: 'swamp',
    cols: 48,
    rows: 34,
    gridSize: 52,
    bgColor: '#0f1712',
    floorColor: '#17241c',
    gridColor: 'rgba(52, 211, 153, 0.06)',
    torches: [
      { x: 7, y: 4 }, { x: 24, y: 11 }, { x: 35, y: 22 }, { x: 36, y: 8 }
    ],
    obstacles: [
      // Cabana de Baba Morwenna nas Palafitas (Nordeste)
      { x: 35, y: 2, w: 7, h: 6, type: 'wall', label: 'Cabana de Baba Morwenna' },
      { x: 33, y: 8, w: 2, h: 1, type: 'fence', label: 'Cerca do Pântano' },

      // Lagoas e Canais de Lodo (Pontes livres em x:26..31, y:11..13 e x:26..31, y:23..25)
      { x: 16, y: 0, w: 14, h: 9, type: 'water', label: 'Lagoa Norte de Lodo' },
      { x: 0, y: 13, w: 8, h: 6, type: 'water', label: 'Brejo Oeste' },
      { x: 31, y: 15, w: 12, h: 7, type: 'water', label: 'Canal Pantanoso Leste' },
      { x: 16, y: 26, w: 12, h: 8, type: 'water', label: 'Lagoa Sul das Rãs' },

      // Salgueiros Mortos Gigantes com Musgo e Acampamento do Patrulheiro
      { x: 13, y: 2, w: 3, h: 6, type: 'tree', label: 'Salgueiro Podre' },
      { x: 9, y: 13, w: 3, h: 5, type: 'tree', label: 'Árvore Oca do Pântano' },
      { x: 20, y: 8, w: 3, h: 4, type: 'tree', label: 'Tronco Retorcido' },
      { x: 43, y: 14, w: 4, h: 6, type: 'tree', label: 'Manguezal Sombrio' },
      { x: 2, y: 27, w: 5, h: 5, type: 'tree', label: 'Bosque Enlameado Sudoeste' },
      { x: 21, y: 15, w: 2, h: 2, type: 'tent', label: 'Abrigo do Patrulheiro' },
      { x: 19, y: 16, w: 1, h: 1, type: 'campfire', label: 'Fogueira da Ilha Central' },
      { x: 42, y: 9, w: 2, h: 2, type: 'table', label: 'Caldeirão de Alquimia da Bruxa' },
      { x: 44, y: 24, w: 3, h: 3, type: 'wall', label: 'Monólito de Pedra do Brejo' }
    ]
  },

  {
    id: 'land_cave',
    name: 'Land 3: As Minas e Cavernas de Cristal',
    theme: 'cave',
    cols: 50,
    rows: 36,
    gridSize: 52,
    bgColor: '#120f18',
    floorColor: '#1c1726',
    gridColor: 'rgba(168, 85, 247, 0.06)',
    torches: [
      { x: 12, y: 10 }, { x: 25, y: 11 }, { x: 32, y: 4 }, { x: 46, y: 5 },
      { x: 13, y: 25 }, { x: 20, y: 27 }, { x: 46, y: 23 }
    ],
    obstacles: [
      // Acampamento dos Mineiros (Nordeste)
      { x: 30, y: 7, w: 3, h: 2, type: 'tent', label: 'Tenda dos Mineiros' },
      { x: 35, y: 8, w: 3, h: 2, type: 'tent', label: 'Tenda de Thorin' },
      { x: 33, y: 10, w: 1, h: 1, type: 'campfire', label: 'Caldeirão dos Mineiros' },

      // Lago Subterrâneo (Sudeste)
      { x: 26, y: 25, w: 15, h: 8, type: 'water', label: 'Lago Subterrâneo' },

      // Formações de Cristais de Safira & Ametista e Paredões de Rocha
      { x: 17, y: 4, w: 8, h: 4, type: 'wall', label: 'Abismo Rochoso' },
      { x: 12, y: 16, w: 6, h: 5, type: 'wall', label: 'Paredão de Basalto' },
      { x: 3, y: 11, w: 2, h: 2, type: 'pillar', label: 'Cristal de Safira' },
      { x: 4, y: 22, w: 2, h: 2, type: 'pillar', label: 'Drusa de Ametista' },
      { x: 30, y: 18, w: 6, h: 4, type: 'pillar', label: 'Geoda Cristalina' },
      { x: 38, y: 6, w: 2, h: 2, type: 'table', label: 'Bigorna de Cristal de Thorin' },
      { x: 9, y: 3, w: 2, h: 2, type: 'pillar', label: 'Pilar de Quartzo Azul' },
      { x: 20, y: 28, w: 2, h: 2, type: 'pillar', label: 'Cristal Prismático Sul' },
      { x: 46, y: 11, w: 2, h: 2, type: 'pillar', label: 'Jazida de Safira Leste' }
    ]
  },

  {
    id: 'land_dungeon',
    name: 'Land 4: A Masmorra Proibida & Cripta Infernal',
    theme: 'dungeon',
    cols: 52,
    rows: 38,
    gridSize: 52,
    bgColor: '#16131c',
    floorColor: '#201b2a',
    gridColor: 'rgba(239, 68, 68, 0.06)',
    torches: [
      { x: 11, y: 11 }, { x: 21, y: 14 }, { x: 30, y: 14 },
      { x: 6, y: 21 }, { x: 14, y: 21 }, { x: 37, y: 22 }, { x: 44, y: 31 }
    ],
    obstacles: [
      // Refúgio dos Cruzados Barricados (Noroeste)
      { x: 6, y: 5, w: 3, h: 3, type: 'tent', label: 'Tenda Roxa dos Cruzados' },
      { x: 12, y: 5, w: 3, h: 3, type: 'tent', label: 'Tenda Verde de Solaria' },
      { x: 11, y: 11, w: 1, h: 1, type: 'campfire', label: 'Fogueira Consagrada' },
      { x: 5, y: 16, w: 11, h: 1, type: 'fence', label: 'Paliçada de Madeira' },
      { x: 6, y: 10, w: 2, h: 2, type: 'table', label: 'Mesa Tática de Valerius' },

      // Sarcófagos da Cripta Norte
      { x: 21, y: 2, w: 3, h: 4, type: 'pillar', label: 'Sarcófago Real' },
      { x: 28, y: 2, w: 3, h: 4, type: 'pillar', label: 'Sarcófago Imperial' },
      { x: 34, y: 2, w: 3, h: 4, type: 'pillar', label: 'Sarcófago dos Antigos' },

      // Grades da Prisão Sudoeste
      { x: 12, y: 22, w: 8, h: 2, type: 'wall', label: 'Grades da Prisão' },
      { x: 2, y: 22, w: 5, h: 2, type: 'wall', label: 'Celas de Tortura' },

      // Paredes Divisórias dos Corredores
      { x: 20, y: 10, w: 12, h: 2, type: 'wall', label: 'Muralha Interna' },
      { x: 26, y: 19, w: 6, h: 2, type: 'wall', label: 'Muralha Central' },

      // Altar Rúnico do Trono de Malakor (Sudeste)
      { x: 35, y: 33, w: 3, h: 2, type: 'altar', label: 'Altar Rúnico de Malakor' }
    ]
  },

  // Mapas Clássicos Anteriores (Compatibilidade)
  {
    id: 'dungeon_crypt',
    name: 'Cripta do Rei Esqueleto',
    theme: 'dungeon',
    cols: 22,
    rows: 15,
    bgColor: '#151821',
    floorColor: '#1e2230',
    gridColor: 'rgba(255, 255, 255, 0.09)',
    torches: [
      { x: 4, y: 1 }, { x: 11, y: 1 }, { x: 18, y: 1 },
      { x: 4, y: 13 }, { x: 11, y: 13 }, { x: 18, y: 13 }
    ],
    obstacles: [
      { x: 0, y: 0, w: 22, h: 1, type: 'wall', label: 'Muralha de Pedra' },
      { x: 0, y: 14, w: 22, h: 1, type: 'wall' },
      { x: 0, y: 0, w: 1, h: 15, type: 'wall' },
      { x: 21, y: 0, w: 1, h: 15, type: 'wall' },
      { x: 6, y: 3, w: 2, h: 2, type: 'pillar', label: 'Pilar Rúnico' },
      { x: 6, y: 10, w: 2, h: 2, type: 'pillar', label: 'Pilar Rúnico' },
      { x: 14, y: 3, w: 2, h: 2, type: 'pillar', label: 'Sarcófago' },
      { x: 14, y: 10, w: 2, h: 2, type: 'pillar', label: 'Sarcófago' },
      { x: 18, y: 6, w: 2, h: 3, type: 'altar', label: 'Altar Ancestral' }
    ]
  },
  {
    id: 'goblin_ambush',
    name: 'Estrada da Floresta Sussurrante',
    theme: 'forest',
    cols: 22,
    rows: 15,
    bgColor: '#112214',
    floorColor: '#19301d',
    gridColor: 'rgba(160, 255, 160, 0.08)',
    torches: [
      { x: 15, y: 4 }, { x: 16, y: 11 }
    ],
    obstacles: [
      { x: 3, y: 2, w: 3, h: 3, type: 'tree', label: 'Carvalho Antigo' },
      { x: 10, y: 1, w: 3, h: 3, type: 'tree', label: 'Pinheiro' },
      { x: 4, y: 11, w: 3, h: 3, type: 'tree', label: 'Árvore Densa' },
      { x: 11, y: 11, w: 3, h: 3, type: 'tree', label: 'Bosque' },
      { x: 8, y: 6, w: 2, h: 2, type: 'boulder', label: 'Carroça Quebrada' },
      { x: 17, y: 2, w: 3, h: 2, type: 'boulder', label: 'Acampamento Goblin' }
    ]
  },
  {
    id: 'tavern_boar',
    name: 'Taverna do Javali Saltitante',
    theme: 'tavern',
    cols: 20,
    rows: 14,
    bgColor: '#24160e',
    floorColor: '#331f14',
    gridColor: 'rgba(255, 200, 120, 0.09)',
    torches: [
      { x: 2, y: 1 }, { x: 10, y: 1 }, { x: 17, y: 1 }, { x: 10, y: 12 }
    ],
    obstacles: [
      { x: 0, y: 0, w: 20, h: 1, type: 'wall' },
      { x: 0, y: 13, w: 20, h: 1, type: 'wall' },
      { x: 0, y: 0, w: 1, h: 14, type: 'wall' },
      { x: 19, y: 0, w: 1, h: 14, type: 'wall' },
      { x: 4, y: 2, w: 12, h: 1, type: 'table', label: 'Balcão de Bebidas' },
      { x: 5, y: 5, w: 2, h: 2, type: 'table', label: 'Mesa' },
      { x: 10, y: 5, w: 2, h: 2, type: 'table', label: 'Mesa' },
      { x: 14, y: 5, w: 2, h: 2, type: 'table', label: 'Mesa' },
      { x: 6, y: 9, w: 2, h: 2, type: 'table', label: 'Mesa de Jogos' },
      { x: 13, y: 9, w: 2, h: 2, type: 'table', label: 'Lareira Acesa' }
    ]
  },
  {
    id: 'dragon_lair',
    name: 'Covil Vulcânico do Dragão',
    theme: 'cave',
    cols: 24,
    rows: 16,
    bgColor: '#1f0d0d',
    floorColor: '#2b1414',
    gridColor: 'rgba(255, 100, 80, 0.09)',
    torches: [
      { x: 5, y: 3 }, { x: 5, y: 12 }, { x: 16, y: 3 }, { x: 16, y: 12 }
    ],
    obstacles: [
      { x: 9, y: 2, w: 4, h: 3, type: 'lava', label: 'Poço de Magma' },
      { x: 9, y: 11, w: 4, h: 3, type: 'lava', label: 'Rio de Lava' },
      { x: 5, y: 6, w: 2, h: 3, type: 'pillar', label: 'Obsidiana' },
      { x: 19, y: 6, w: 3, h: 4, type: 'altar', label: 'Tesouro do Dragão' }
    ]
  }
];

// Missões e Lands da Campanha Principal (A Lenda das Quatro Relíquias de Eldoria)
export const ADVENTURES = STORY_CAMPAIGN.lands.map(land => ({
  id: land.id,
  name: `Land ${land.number}: ${land.name}`,
  difficulty: `Tier ${land.number} • Boss: ${land.bossName}`,
  mapId: land.id,
  narration: `📜 A LENDA DE ELDORIA: ${land.description}`,
  enemies: land.enemies,
  chests: land.chests
}));

export const CONDITIONS = [
  { id: 'blinded', name: 'Cego', icon: '👁️‍🗨️', desc: 'Desvantagem em ataques.' },
  { id: 'charmed', name: 'Encantado', icon: '💖', desc: 'Enfeitiçado magicamente.' },
  { id: 'frightened', name: 'Amedrontado', icon: '😱', desc: 'Com medo da fonte.' },
  { id: 'poisoned', name: 'Envenenado', icon: '🤢', desc: 'Desvantagem em ataques e testes.' },
  { id: 'prone', name: 'Caído', icon: '🛌', desc: 'Derrubado no chão.' },
  { id: 'stunned', name: 'Atordoado', icon: '💫', desc: 'Incapaz de agir no turno.' },
  { id: 'invisible', name: 'Invisível', icon: '👻', desc: 'Oculto por magia.' },
  { id: 'blessed', name: 'Abençoado', icon: '✨', desc: '+1d4 em ataques e salvaguardas.' }
];

// Helpers de Cálculo D&D 5e
export function getAbilityMod(score) {
  return Math.floor((Number(score || 10) - 10) / 2);
}

export function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculateCharacterDerivedStats(char) {
  if (!char) {
    return {
      profBonus: 2,
      ac: 10,
      initiative: 0,
      passivePerception: 10,
      carryCapacity: 75,
      meleeAtkBonus: 2,
      rangedAtkBonus: 2,
      spellSaveDC: 10,
      spellAtkBonus: 2
    };
  }
  const stats = char.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const level = char.level || 1;
  const profBonus = Math.floor((level - 1) / 4) + 2;

  const strMod = getAbilityMod(stats.str);
  const dexMod = getAbilityMod(stats.dex);
  const conMod = getAbilityMod(stats.con);
  const intMod = getAbilityMod(stats.int);
  const wisMod = getAbilityMod(stats.wis);
  const chaMod = getAbilityMod(stats.cha);

  // Calculate AC from inventory
  let ac = 10 + dexMod;
  const rawInv = Array.isArray(char.inventory) ? char.inventory : [];
  const inv = rawInv.map(i => typeof i === 'string' ? ITEMS[i] : i).filter(Boolean);
  const armor = inv.find(i => i && i.type === 'armor');
  if (armor) {
    if (armor.addDex) {
      const dexBonus = armor.maxDex !== undefined ? Math.min(dexMod, armor.maxDex) : dexMod;
      ac = (armor.ac || 10) + dexBonus;
    } else {
      ac = armor.ac || 10;
    }
  } else if (char.classId === 'barbarian') {
    ac = 10 + dexMod + conMod;
  }

  // Shield & Magic AC bonuses
  inv.forEach(item => {
    if (item && item.acBonus) ac += item.acBonus;
  });

  // Spellcasting ability mod
  let spellMod = intMod;
  if (['cleric', 'ranger', 'druid'].includes(char.classId)) spellMod = wisMod;
  if (['bard', 'paladin', 'warlock', 'sorcerer'].includes(char.classId)) spellMod = chaMod;

  return {
    profBonus,
    ac,
    initiative: dexMod,
    passivePerception: 10 + wisMod + profBonus,
    carryCapacity: (stats.str || 10) * 7.5,
    meleeAtkBonus: strMod + profBonus,
    rangedAtkBonus: dexMod + profBonus,
    spellSaveDC: 8 + profBonus + spellMod,
    spellAtkBonus: profBonus + spellMod
  };
}
