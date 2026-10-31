// Base de Dados Oficial D&D 5ª Edição em Português (Expandida)

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
  { id: 'scorching_ray', name: 'Raio Ardente', level: 2, school: 'Evocação', range: 18, damage: '4d6', damageType: 'fogo', desc: 'Dispara rajadas explosivas de fogo solar.' }
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
  }
];

export const MAP_PRESETS = [
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

// Missões e Encontros para o Mestre Automático
export const ADVENTURES = [
  {
    id: 'crypt_patrol',
    name: 'Ato 1: A Cripta dos Ossos Inquietos',
    difficulty: 'Fácil (Nível 1)',
    mapId: 'dungeon_crypt',
    narration: '📜 MESTRE AUTOMÁTICO: As portas de ferro da cripta se abrem com um rangido. Tochas bruxuleiam nas paredes úmidas enquanto Goblins saqueadores e Esqueletos erguem suas armas contra vocês!',
    enemies: [
      { monsterId: 'goblin', x: 12, y: 5, name: 'Goblin Batedor' },
      { monsterId: 'goblin', x: 12, y: 9, name: 'Goblin Arqueiro' },
      { monsterId: 'skeleton', x: 16, y: 7, name: 'Esqueleto Guardião' }
    ],
    chests: [
      { id: 'chest_1', x: 17, y: 7, gold: 45, itemId: 'pocao_cura', opened: false }
    ]
  },
  {
    id: 'forest_ambush',
    name: 'Ato 2: Emboscada na Floresta Sussurrante',
    difficulty: 'Médio (Nível 1-2)',
    mapId: 'goblin_ambush',
    narration: '📜 MESTRE AUTOMÁTICO: Galhos se partem na mata fechada! Uma matilha liderada por Orcs e Lobos Atrozes cerca a estrada para saquear os viajantes!',
    enemies: [
      { monsterId: 'goblin', x: 11, y: 4, name: 'Goblin Emboscador' },
      { monsterId: 'orc', x: 14, y: 7, name: 'Orc Chefe de Guerra' },
      { monsterId: 'dire_wolf', x: 13, y: 10, name: 'Lobo Atroz Faminto' }
    ],
    chests: [
      { id: 'chest_2', x: 9, y: 5, gold: 70, itemId: 'espada_longa', opened: false },
      { id: 'chest_3', x: 18, y: 4, gold: 50, itemId: 'pocao_cura_maior', opened: false }
    ]
  },
  {
    id: 'tavern_brawl',
    name: 'Ato 3: Invasão na Taverna do Javali',
    difficulty: 'Médio (Nível 2)',
    mapId: 'tavern_boar',
    narration: '📜 MESTRE AUTOMÁTICO: A porta da taverna é arrombada! Mercenários armados e um Ogro Brutamontes entram exigindo todo o ouro da casa!',
    enemies: [
      { monsterId: 'bandit', x: 12, y: 4, name: 'Bandido Besteiro' },
      { monsterId: 'bandit', x: 12, y: 10, name: 'Bandido Espadachim' },
      { monsterId: 'ogre', x: 15, y: 7, name: 'Ogro Quebra-Ossos' }
    ],
    chests: [
      { id: 'chest_4', x: 16, y: 3, gold: 110, itemId: 'anel_protecao', opened: false }
    ]
  },
  {
    id: 'necromancer_sanctum',
    name: 'Ato 4: O Ritual do Necromante',
    difficulty: 'Difícil (Nível 2-3)',
    mapId: 'dungeon_crypt',
    narration: '📜 MESTRE AUTOMÁTICO: Energia necrótica roxa pulsa do altar! O Necromante Sombrio comanda seus mortos-vivos para proteger a relíquia ancestral!',
    enemies: [
      { monsterId: 'zombie', x: 11, y: 5, name: 'Zumbi Putrefato' },
      { monsterId: 'skeleton', x: 11, y: 9, name: 'Esqueleto Arqueiro' },
      { monsterId: 'giant_spider', x: 14, y: 4, name: 'Aranha das Catacumbas' },
      { monsterId: 'necromancer', x: 17, y: 7, name: 'Malakor, o Necromante' }
    ],
    chests: [
      { id: 'chest_5', x: 19, y: 7, gold: 200, itemId: 'espada_flamejante', opened: false }
    ]
  },
  {
    id: 'dragon_boss',
    name: 'Ato Final: A Fúria do Dragão Vermelho',
    difficulty: 'Chefão Lendário (Nível 3+)',
    mapId: 'dragon_lair',
    narration: '📜 MESTRE AUTOMÁTICO: O chão treme e os rios de lava borbulham! Ignis, o Dragão Vermelho, abre suas asas colossais sobre a montanha de ouro e ruge!',
    enemies: [
      { monsterId: 'kobold', x: 12, y: 5, name: 'Kobold Servo do Dragão' },
      { monsterId: 'kobold', x: 12, y: 10, name: 'Kobold Fanático' },
      { monsterId: 'young_red_dragon', x: 16, y: 7, name: 'Ignis, o Dragão Vermelho' }
    ],
    chests: [
      { id: 'chest_6', x: 20, y: 6, gold: 500, itemId: 'armadura_placas', opened: false },
      { id: 'chest_7', x: 20, y: 9, gold: 300, itemId: 'amuleto_saude', opened: false }
    ]
  }
];

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
  const inv = char.inventory || [];
  const armor = inv.find(i => i.type === 'armor');
  if (armor) {
    if (armor.addDex) {
      const dexBonus = armor.maxDex !== undefined ? Math.min(dexMod, armor.maxDex) : dexMod;
      ac = armor.ac + dexBonus;
    } else {
      ac = armor.ac;
    }
  } else if (char.classId === 'barbarian') {
    ac = 10 + dexMod + conMod;
  }

  // Shield & Magic AC bonuses
  inv.forEach(item => {
    if (item.acBonus) ac += item.acBonus;
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
