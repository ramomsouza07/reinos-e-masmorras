// Base de Dados Oficial D&D 5ª Edição em Português

export const ABILITIES = [
  { id: 'str', name: 'Força', abbr: 'FOR', desc: 'Poder físico, atletismo e força de ataque corpo a corpo' },
  { id: 'dex', name: 'Destreza', abbr: 'DES', desc: 'Agilidade, reflexos, iniciativa, esquiva e ataque à distância' },
  { id: 'con', name: 'Constituição', abbr: 'CON', desc: 'Saúde, vigor e determinação para resistir a danos' },
  { id: 'int', name: 'Inteligência', abbr: 'INT', desc: 'Acuidade mental, memória e poder de raciocínio mágico' },
  { id: 'wis', name: 'Sabedoria', abbr: 'SAB', desc: 'Percepção, intuição, força de vontade e sintonia divina' },
  { id: 'cha', name: 'Carisma', abbr: 'CAR', desc: 'Presença, eloquência, liderança e feitiçaria inata' },
];

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
    description: 'Versáteis, ambiciosos e adaptáveis. Humanos prosperam em qualquer ambiente.',
    traits: ['Versatilidade: +1 em todos os atributos', 'Um idioma adicional à sua escolha']
  },
  {
    id: 'elf',
    name: 'Elfo',
    bonus: { dex: 2, int: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Seres mágicos de graça sobrenatural, vivendo em harmonia com a natureza.',
    traits: ['Visão no Escuro (18m)', 'Sentidos Aguçados (Proficiência em Percepção)', 'Ancestral Feérico (Vantagem contra encantamentos)', 'Transe (descansa em 4h)']
  },
  {
    id: 'dwarf',
    name: 'Anão',
    bonus: { con: 2, str: 2 },
    speed: 7.5,
    size: 'Médio',
    description: 'Guerreiros e artesãos resistentes das profundezas das montanhas.',
    traits: ['Visão no Escuro (18m)', 'Resiliência dos Anões (Vantagem contra venenos)', 'Treinamento Anão em Combate (Machados e Martelos)', 'Conhecimento de Pedras']
  },
  {
    id: 'halfling',
    name: 'Halfling',
    bonus: { dex: 2, cha: 1 },
    speed: 7.5,
    size: 'Pequeno',
    description: 'Pequenos, ágeis e joviais, sobrevivendo onde outros falham graças à sorte pura.',
    traits: ['Sortudo (Pode rolar novamente um 1 natural em d20)', 'Bravura (Vantagem contra amedrontamento)', 'Agilidade Halfling (Pode mover através de criaturas maiores)']
  },
  {
    id: 'dragonborn',
    name: 'Draconato',
    bonus: { str: 2, cha: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Descendentes orgulhosos de nobres dragões com sopro elemental destrutivo.',
    traits: ['Ancestralidade Dracônica', 'Arma de Sopro (2d6 de dano elemental)', 'Resistência a Dano elemental']
  },
  {
    id: 'gnome',
    name: 'Gnomo',
    bonus: { int: 2, con: 1 },
    speed: 7.5,
    size: 'Pequeno',
    description: 'Inventores entusiasmados, curiosos e dotados de grande intelecto arcano.',
    traits: ['Visão no Escuro (18m)', 'Esperteza Gnômica (Vantagem em salvaguardas de INT, SAB e CAR contra magia)']
  },
  {
    id: 'half_elf',
    name: 'Meio-Elfo',
    bonus: { cha: 2, dex: 1, con: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Caminham entre dois mundos com o charme élfico e a tenacidade humana.',
    traits: ['Visão no Escuro (18m)', 'Ancestral Feérico', 'Versatilidade em Perícias (Duas perícias adicionais)']
  },
  {
    id: 'half_orc',
    name: 'Meio-Orc',
    bonus: { str: 2, con: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Dotados de força descomunal, cicatrizes de batalha e fúria indomável.',
    traits: ['Visão no Escuro (18m)', 'Ameaçador (Proficiência em Intimidação)', 'Resistência Implacável (Cair a 0 PV faz voltar a 1 PV uma vez por descanso longo)', 'Ataques Selvagens (Dano crítico aumentado)']
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    bonus: { cha: 2, int: 1 },
    speed: 9,
    size: 'Médio',
    description: 'Marcados por herança infernal com chifres, cauda e domínio sobre chamas.',
    traits: ['Visão no Escuro (18m)', 'Resistência Infernal (Resistência a fogo)', 'Legado Infernal (Truque Taumaturgia, Repreensão Infernal)']
  }
];

export const CLASSES = [
  {
    id: 'fighter',
    name: 'Guerreiro',
    hitDie: 10,
    savingThrows: ['str', 'con'],
    primary: 'str',
    description: 'Mestres de armas e armaduras, táticos implacáveis na linha de frente.',
    features: ['Retomar o Fôlego (Cura 1d10 + Nível com ação bônus)', 'Estilo de Luta (+2 Dano, Defesa ou Arquearia)', 'Surto de Ação (Ação extra no turno)'],
    startingGold: 120,
    starterGear: ['espada_longa', 'escudo', 'cota_de_malha', 'arco_curto', 'pocao_cura']
  },
  {
    id: 'wizard',
    name: 'Mago',
    hitDie: 6,
    savingThrows: ['int', 'wis'],
    primary: 'int',
    spellcaster: true,
    description: 'Estudiosos arcanos capazes de manipular a realidade através de fórmulas místicas.',
    features: ['Grimório de Magias', 'Recuperação Arcana', 'Ritual de Conjuração'],
    startingGold: 100,
    starterGear: ['bordao', 'adaga', 'pocao_cura'],
    spells: ['fire_bolt', 'magic_missile', 'shield', 'mage_armor']
  },
  {
    id: 'rogue',
    name: 'Ladino',
    hitDie: 8,
    savingThrows: ['dex', 'int'],
    primary: 'dex',
    description: 'Especialistas em furtividade, desarmar armadilhas e desferir ataques mortais.',
    features: ['Ataque Furtivo (+1d6 de dano com vantagem)', 'Gíria de Ladrão', 'Especialização em Perícias', 'Ação Ardilosa (Disparar, Desengajar ou Esconder como Bônus)'],
    startingGold: 110,
    starterGear: ['espada_curta', 'adaga', 'arco_curto', 'armadura_couro', 'kit_ladrao']
  },
  {
    id: 'cleric',
    name: 'Clérigo',
    hitDie: 8,
    savingThrows: ['wis', 'cha'],
    primary: 'wis',
    spellcaster: true,
    description: 'Intermediários entre deuses e mortais, curandeiros e guerreiros divinos.',
    features: ['Domínio Divino (Vida / Guerra / Luz)', 'Canalizar Divindade', 'Expulsar Mortos-Vivos'],
    startingGold: 130,
    starterGear: ['maca', 'escudo', 'cota_de_malha', 'simbolo_sagrado', 'pocao_cura'],
    spells: ['sacred_flame', 'cure_wounds', 'bless', 'inflict_wounds']
  },
  {
    id: 'barbarian',
    name: 'Bárbaro',
    hitDie: 12,
    savingThrows: ['str', 'con'],
    primary: 'str',
    description: 'Combatentes ferozes que canalizam fúria primitiva em proezas devastadoras.',
    features: ['Fúria (+2 de dano, resistência a dano cortante/perfurante/concussão)', 'Defesa sem Armadura (CA = 10 + DES + CON)'],
    startingGold: 80,
    starterGear: ['machado_grande', 'azagaia', 'pocao_cura']
  },
  {
    id: 'bard',
    name: 'Bardo',
    hitDie: 8,
    savingThrows: ['dex', 'cha'],
    primary: 'cha',
    spellcaster: true,
    description: 'Mestres de canções, oratória e magia inspiradora que motivam aliados.',
    features: ['Inspiração de Bardo (Concede d6 de bônus aos aliados)', 'Pau pra Toda Obra (+metade da proficiência em tudo)'],
    startingGold: 120,
    starterGear: ['flauta', 'rapieira', 'armadura_couro', 'adaga'],
    spells: ['vicious_mockery', 'cure_wounds', 'thunderwave', 'charm_person']
  },
  {
    id: 'paladin',
    name: 'Paladino',
    hitDie: 10,
    savingThrows: ['wis', 'cha'],
    primary: 'str',
    spellcaster: true,
    description: 'Cavaleiros sagrados jurados à justiça divina e proteção dos inocentes.',
    features: ['Sentido Divino', 'Cura pelas Mãos (Reserva de PV sagrados)', 'Destruição Divina (+2d8 de dano radiante no ataque)'],
    startingGold: 140,
    starterGear: ['espada_longa', 'escudo', 'cota_de_malha', 'simbolo_sagrado']
  },
  {
    id: 'ranger',
    name: 'Patrulheiro',
    hitDie: 10,
    savingThrows: ['str', 'dex'],
    primary: 'dex',
    spellcaster: true,
    description: 'Caçadores mestres da sobrevivência e rastreadores das fronteiras selvagens.',
    features: ['Inimigo Favorito', 'Explorador Natural', 'Consciência Primitiva'],
    startingGold: 120,
    starterGear: ['arco_longo', 'espada_curta', 'armadura_couro_batido']
  },
  {
    id: 'warlock',
    name: 'Bruxo',
    hitDie: 8,
    savingThrows: ['wis', 'cha'],
    primary: 'cha',
    spellcaster: true,
    description: 'Conjuradores ligados a entidades ancestrais ou demoníacas por pactos eternos.',
    features: ['Patrono Transcendental', 'Magia de Pacto (Espaços recarregam em Descanso Curto)', 'Invocações Místicas'],
    startingGold: 100,
    starterGear: ['adaga', 'foco_arcano', 'armadura_couro'],
    spells: ['eldritch_blast', 'witch_bolt', 'armor_of_agathys']
  }
];

export const ITEMS = {
  // Armas
  espada_curta: { id: 'espada_curta', name: 'Espada Curta', type: 'weapon', cost: 10, currency: 'PO', damage: '1d6', damageType: 'perfurante', properties: ['Finesse', 'Leve'], weight: 1 },
  espada_longa: { id: 'espada_longa', name: 'Espada Longa', type: 'weapon', cost: 15, currency: 'PO', damage: '1d8', damageType: 'cortante', properties: ['Versátil (1d10)'], weight: 1.5 },
  machado_grande: { id: 'machado_grande', name: 'Machado Grande', type: 'weapon', cost: 30, currency: 'PO', damage: '1d12', damageType: 'cortante', properties: ['Pesada', 'Duas Mãos'], weight: 3 },
  machado_batalha: { id: 'machado_batalha', name: 'Machado de Batalha', type: 'weapon', cost: 10, currency: 'PO', damage: '1d8', damageType: 'cortante', properties: ['Versátil (1d10)'], weight: 2 },
  adaga: { id: 'adaga', name: 'Adaga', type: 'weapon', cost: 2, currency: 'PO', damage: '1d4', damageType: 'perfurante', properties: ['Finesse', 'Leve', 'Arremesso (6/18m)'], weight: 0.5 },
  maca: { id: 'maca', name: 'Maça', type: 'weapon', cost: 5, currency: 'PO', damage: '1d6', damageType: 'concussão', properties: [], weight: 2 },
  bordao: { id: 'bordao', name: 'Bordão de Madeira', type: 'weapon', cost: 1, currency: 'PO', damage: '1d6', damageType: 'concussão', properties: ['Versátil (1d8)'], weight: 2 },
  rapieira: { id: 'rapieira', name: 'Rapieira Nobre', type: 'weapon', cost: 25, currency: 'PO', damage: '1d8', damageType: 'perfurante', properties: ['Finesse'], weight: 1 },
  arco_curto: { id: 'arco_curto', name: 'Arco Curto', type: 'weapon', cost: 25, currency: 'PO', damage: '1d6', damageType: 'perfurante', properties: ['Munição (24/96m)', 'Duas Mãos'], weight: 1 },
  arco_longo: { id: 'arco_longo', name: 'Arco Longo', type: 'weapon', cost: 50, currency: 'PO', damage: '1d8', damageType: 'perfurante', properties: ['Munição (45/180m)', 'Pesada', 'Duas Mãos'], weight: 1 },
  azagaia: { id: 'azagaia', name: 'Azagaia de Aço', type: 'weapon', cost: 1, currency: 'PO', damage: '1d6', damageType: 'perfurante', properties: ['Arremesso (9/36m)'], weight: 1 },
  espada_flamejante: { id: 'espada_flamejante', name: 'Espada Lâmina de Fogo (+1)', type: 'weapon', cost: 350, currency: 'PO', damage: '1d8+1', damageType: 'fogo', properties: ['Mágico', 'Luz 6m', 'Versátil (1d10+1)'], weight: 1.5, magic: true },

  // Armaduras e Escudos
  armadura_couro: { id: 'armadura_couro', name: 'Armadura de Couro', type: 'armor', cost: 10, currency: 'PO', ac: 11, addDex: true, weight: 5, category: 'Leve' },
  armadura_couro_batido: { id: 'armadura_couro_batido', name: 'Armadura de Couro Batido', type: 'armor', cost: 45, currency: 'PO', ac: 12, addDex: true, weight: 6, category: 'Leve' },
  gibao_peles: { id: 'gibao_peles', name: 'Gibão de Peles', type: 'armor', cost: 10, currency: 'PO', ac: 12, addDex: true, maxDex: 2, weight: 6, category: 'Média' },
  cota_de_malha: { id: 'cota_de_malha', name: 'Cota de Malha', type: 'armor', cost: 75, currency: 'PO', ac: 16, addDex: false, stealthDisadv: true, weight: 25, category: 'Pesada' },
  armadura_placas: { id: 'armadura_placas', name: 'Armadura de Placas Completa', type: 'armor', cost: 1500, currency: 'PO', ac: 18, addDex: false, stealthDisadv: true, weight: 30, category: 'Pesada' },
  escudo: { id: 'escudo', name: 'Escudo de Aço (+2 CA)', type: 'shield', cost: 10, currency: 'PO', acBonus: 2, weight: 3 },

  // Poções e Consumíveis
  pocao_cura: { id: 'pocao_cura', name: 'Poção de Cura Comum', type: 'consumable', cost: 50, currency: 'PO', heal: '2d4+2', desc: 'Restaura 2d4 + 2 Pontos de Vida ao beber.', weight: 0.2 },
  pocao_cura_maior: { id: 'pocao_cura_maior', name: 'Poção de Cura Maior', type: 'consumable', cost: 150, currency: 'PO', heal: '4d4+4', desc: 'Restaura 4d4 + 4 Pontos de Vida.', weight: 0.2 },
  pocao_invisibilidade: { id: 'pocao_invisibilidade', name: 'Poção de Invisibilidade', type: 'consumable', cost: 200, currency: 'PO', desc: 'Concede condição Invisível por 1 hora.', weight: 0.2 },
  antidoto: { id: 'antidoto', name: 'Antídoto Universal', type: 'consumable', cost: 25, currency: 'PO', desc: 'Cura venenos e remove a condição Envenenado.', weight: 0.1 },

  // Equipamentos de Aventura
  tocha: { id: 'tocha', name: 'Tocha (x5)', type: 'gear', cost: 1, currency: 'PO', desc: 'Ilumina um raio de 6 metros por 1 hora.', weight: 1 },
  corda_canhamo: { id: 'corda_canhamo', name: 'Corda de Cânhamo (15 metros)', type: 'gear', cost: 1, currency: 'PO', desc: 'Resistente corda para escaladas e amarras.', weight: 5 },
  kit_ladrao: { id: 'kit_ladrao', name: 'Kit de Ferramentas de Ladrão', type: 'gear', cost: 25, currency: 'PO', desc: 'Gazuas e ganchos para abrir fechaduras.', weight: 1 },
  kit_primeiros_socorros: { id: 'kit_primeiros_socorros', name: 'Kit de Primeiros Socorros', type: 'gear', cost: 5, currency: 'PO', desc: '10 usos para estabilizar companheiros caídos a 0 PV.', weight: 1.5 },
  racao_viagem: { id: 'racao_viagem', name: 'Rações de Viagem (7 dias)', type: 'gear', cost: 3, currency: 'PO', desc: 'Alimento seco e nutritivo para expedições.', weight: 3.5 },
  simbolo_sagrado: { id: 'simbolo_sagrado', name: 'Símbolo Sagrado de Prata', type: 'gear', cost: 5, currency: 'PO', desc: 'Foco de conjuração para clérigos e paladinos.', weight: 0.5 },
  foco_arcano: { id: 'foco_arcano', name: 'Orbe Arcano Cristalino', type: 'gear', cost: 20, currency: 'PO', desc: 'Foco de conjuração para magos e bruxos.', weight: 0.5 },
  flauta: { id: 'flauta', name: 'Flauta Élfica Encantada', type: 'gear', cost: 12, currency: 'PO', desc: 'Instrumento musical e foco de conjuração para bardo.', weight: 0.5 },

  // Itens Mágicos Especiais
  anel_protecao: { id: 'anel_protecao', name: 'Anel de Proteção Mística', type: 'magic', cost: 400, currency: 'PO', acBonus: 1, desc: '+1 em Classe de Armadura e em todas as Salvaguardas.', weight: 0.1, magic: true },
  botas_velocidade: { id: 'botas_velocidade', name: 'Botas dos Ventos Velozes', type: 'magic', cost: 500, currency: 'PO', desc: 'Dobra seu deslocamento por 1 minuto durante o combate.', weight: 0.5, magic: true }
};

export const SPELLS = [
  { id: 'fire_bolt', name: 'Raio de Fogo', level: 0, school: 'Evocação', range: '36m', castTime: '1 Ação', damage: '1d10', damageType: 'fogo', desc: 'Dispara um raio de fogo ardente contra o alvo. D20+mod para acertar.' },
  { id: 'eldritch_blast', name: 'Rajada Mística', level: 0, school: 'Evocação', range: '36m', castTime: '1 Ação', damage: '1d10', damageType: 'energia', desc: 'Um raio de energia pura crepitante atinge o inimigo.' },
  { id: 'sacred_flame', name: 'Chama Sagrada', level: 0, school: 'Evocação', range: '18m', castTime: '1 Ação', damage: '1d8', damageType: 'radiante', desc: 'Fogo celestial desce sobre o alvo. Salvaguarda de DES para negar dano.' },
  { id: 'vicious_mockery', name: 'Zombaria Viciosa', level: 0, school: 'Encantamento', range: '18m', castTime: '1 Ação', damage: '1d4', damageType: 'psíquico', desc: 'Insultos encantados causam dano e dão desvantagem no próximo ataque do alvo.' },
  { id: 'magic_missile', name: 'Mísseis Mágicos', level: 1, school: 'Evocação', range: '36m', castTime: '1 Ação', damage: '3d4+3', damageType: 'energia', desc: 'Três dardos mágicos infalíveis acertam sem necessidade de jogada de ataque!' },
  { id: 'cure_wounds', name: 'Curar Ferimentos', level: 1, school: 'Evocação', range: 'Toque', castTime: '1 Ação', heal: '1d8+mod', desc: 'Toque uma criatura viva para restaurar 1d8 + modificador de magia em PV.' },
  { id: 'shield', name: 'Escudo Arcano', level: 1, school: 'Abjuração', range: 'Pessoal', castTime: '1 Reação', desc: '+5 temporário na CA até o início do seu próximo turno. Bloqueia Mísseis Mágicos.' },
  { id: 'thunderwave', name: 'Onda Trovejante', level: 1, school: 'Evocação', range: 'Cubo 4.5m', castTime: '1 Ação', damage: '2d8', damageType: 'trovão', desc: 'Uma explosão sonora empurra os inimigos 3 metros para trás.' },
  { id: 'inflict_wounds', name: 'Infligir Ferimentos', level: 1, school: 'Necromancia', range: 'Toque', castTime: '1 Ação', damage: '3d10', damageType: 'necrótico', desc: 'Ataque corpo a corpo mágico devastador repleto de energia fúnebre.' },
  { id: 'bless', name: 'Bênção Divina', level: 1, school: 'Encantamento', range: '9m', castTime: '1 Ação', desc: 'Abençoa até 3 aliados com +1d4 em todas as jogadas de ataque e testes de resistência!' },
  { id: 'scorching_ray', name: 'Raio Ardente', level: 2, school: 'Evocação', range: '36m', castTime: '1 Ação', damage: '6d6', damageType: 'fogo', desc: 'Três raios de fogo ardentes arremessados (2d6 cada).' },
  { id: 'misty_step', name: 'Passo Nebuloso', level: 2, school: 'Conjuração', range: '9m', castTime: '1 Bônus', desc: 'Teleporta-se instantaneamente para um espaço desocupado visível.' }
];

export const MONSTERS = [
  {
    id: 'goblin',
    name: 'Goblin',
    cr: '1/4',
    xp: 50,
    hp: 7,
    maxHp: 7,
    ac: 15,
    speed: 9,
    size: 'Pequeno',
    color: '#34D399',
    avatar: '👺',
    stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    actions: [
      { name: 'Cimitarra Afiada', bonus: 4, damage: '1d6+2', type: 'cortante', desc: 'Corpo a corpo: +4 para acertar' },
      { name: 'Arco Curto Velho', bonus: 4, damage: '1d6+2', type: 'perfurante', desc: 'Distância (24/96m): +4 para acertar' }
    ],
    features: ['Fuga Ágil: Pode Desengajar ou Esconder-se com Ação Bônus']
  },
  {
    id: 'kobold',
    name: 'Kobold Rasteiro',
    cr: '1/8',
    xp: 25,
    hp: 5,
    maxHp: 5,
    ac: 12,
    speed: 9,
    size: 'Pequeno',
    color: '#F59E0B',
    avatar: '🦎',
    stats: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
    actions: [
      { name: 'Adaga Enferrujada', bonus: 4, damage: '1d4+2', type: 'perfurante', desc: 'Corpo a corpo: +4 para acertar' },
      { name: 'Funda de Couro', bonus: 4, damage: '1d4+2', type: 'concussão', desc: 'Distância (9/36m): +4 para acertar' }
    ],
    features: ['Tática de Bando: Vantagem no ataque quando aliado está a 1,5m do alvo']
  },
  {
    id: 'skeleton',
    name: 'Esqueleto Guerreiro',
    cr: '1/4',
    xp: 50,
    hp: 13,
    maxHp: 13,
    ac: 13,
    speed: 9,
    size: 'Médio',
    color: '#E5E7EB',
    avatar: '💀',
    stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    actions: [
      { name: 'Espada Curta', bonus: 4, damage: '1d6+2', type: 'perfurante', desc: 'Corpo a corpo: +4 para acertar' },
      { name: 'Arco Curto', bonus: 4, damage: '1d6+2', type: 'perfurante', desc: 'Distância: +4 para acertar' }
    ],
    features: ['Vulnerável a dano de concussão', 'Imune a Veneno e Condição Exausto']
  },
  {
    id: 'zombie',
    name: 'Zumbi Pútrido',
    cr: '1/4',
    xp: 50,
    hp: 22,
    maxHp: 22,
    ac: 8,
    speed: 6,
    size: 'Médio',
    color: '#10B981',
    avatar: '🧟',
    stats: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
    actions: [
      { name: 'Pancada Devastadora', bonus: 3, damage: '1d6+1', type: 'concussão', desc: 'Corpo a corpo: +3 para acertar' }
    ],
    features: ['Fortitude dos Mortos-Vivos: Salvaguarda de CON para voltar com 1 PV ao invés de morrer']
  },
  {
    id: 'orc',
    name: 'Guerreiro Orc',
    cr: '1/2',
    xp: 100,
    hp: 15,
    maxHp: 15,
    ac: 13,
    speed: 9,
    size: 'Médio',
    color: '#84CC16',
    avatar: '👹',
    stats: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    actions: [
      { name: 'Machado Grande Pesado', bonus: 5, damage: '1d12+3', type: 'cortante', desc: 'Corpo a corpo: +5 para acertar' },
      { name: 'Azagaia de Guerra', bonus: 5, damage: '1d6+3', type: 'perfurante', desc: 'Arremesso: +5 para acertar' }
    ],
    features: ['Agressivo: Como ação bônus, pode mover-se seu deslocamento total em direção a um inimigo']
  },
  {
    id: 'dire_wolf',
    name: 'Lobo Terrível',
    cr: '1',
    xp: 200,
    hp: 37,
    maxHp: 37,
    ac: 14,
    speed: 15,
    size: 'Grande',
    color: '#6B7280',
    avatar: '🐺',
    stats: { str: 17, dex: 15, con: 15, int: 3, wis: 12, cha: 7 },
    actions: [
      { name: 'Mordida Voraz', bonus: 5, damage: '2d6+3', type: 'perfurante', desc: 'Corpo a corpo: +5. Se acertar, o alvo deve passar em salvaguarda de FOR CD 13 ou é Derrubado!' }
    ],
    features: ['Faro e Audição Aguçados', 'Tática de Bando']
  },
  {
    id: 'giant_spider',
    name: 'Aranha Gigante das Cavernas',
    cr: '1',
    xp: 200,
    hp: 26,
    maxHp: 26,
    ac: 14,
    speed: 9,
    size: 'Grande',
    color: '#374151',
    avatar: '🕷️',
    stats: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
    actions: [
      { name: 'Mordida Venenosa', bonus: 5, damage: '1d8+3', type: 'perfurante', desc: '+5 para acertar. Causa 1d8+3 e +2d8 de veneno (salvaguarda CON CD 11 para metade).' },
      { name: 'Disparar Teia', bonus: 5, damage: '0', type: 'especial', desc: 'Alcance 18m. Criatura fica Imobilizada na teia (CD 12 FOR para escapar).' }
    ],
    features: ['Escalar Teias', 'Sentido de Teia']
  },
  {
    id: 'ogre',
    name: 'Ogro das Montanhas',
    cr: '2',
    xp: 450,
    hp: 59,
    maxHp: 59,
    ac: 11,
    speed: 12,
    size: 'Grande',
    color: '#D97706',
    avatar: '🧌',
    stats: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
    actions: [
      { name: 'Clava Gigante Esmagadora', bonus: 6, damage: '2d8+4', type: 'concussão', desc: 'Corpo a corpo: +6 para acertar. Dano devastador!' },
      { name: 'Pedregulho Arremessado', bonus: 6, damage: '2d6+4', type: 'concussão', desc: 'Distância (9/36m): +6 para acertar.' }
    ],
    features: ['Força Bruta Monstruosa']
  },
  {
    id: 'young_red_dragon',
    name: 'Dragão Vermelho Jovem',
    cr: '10',
    xp: 5900,
    hp: 178,
    maxHp: 178,
    ac: 18,
    speed: 12,
    size: 'Grande',
    color: '#EF4444',
    avatar: '🐉',
    stats: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
    actions: [
      { name: 'Ataque Múltiplo (Mordida + 2 Garras)', bonus: 10, damage: '2d10+6', type: 'perfurante', desc: 'Desfere 1 mordida (2d10+6 perfurante + 1d6 fogo) e 2 garras (2d6+6 cortante cada).' },
      { name: 'Sopro de Chamas Dracônico', bonus: 0, damage: '16d6', type: 'fogo', desc: 'Cone de fogo de 9 metros! CD 17 Destreza (8d6 se passar).' }
    ],
    features: ['Vôo 24m', 'Imunidade a Dano de Fogo', 'Presença Aterradora']
  },
  {
    id: 'beholder',
    name: 'Observador (Beholder)',
    cr: '13',
    xp: 10000,
    hp: 180,
    maxHp: 180,
    ac: 18,
    speed: 6,
    size: 'Grande',
    color: '#8B5CF6',
    avatar: '👁️',
    stats: { str: 10, dex: 14, con: 18, int: 17, wis: 15, cha: 17 },
    actions: [
      { name: 'Mordida', bonus: 5, damage: '4d6', type: 'perfurante', desc: 'Corpo a corpo: +5 para acertar' },
      { name: 'Raios Oculares Mortais (3 Alvos)', bonus: 0, damage: '8d8', type: 'energia', desc: 'Dispara 3 raios aleatórios: Desintegração, Raio da Morte (10d10), Raio de Paralisia ou Sono!' }
    ],
    features: ['Cone Antimagia (Olho central anula toda magia à frente)', 'Levitação Contínua']
  }
];

export const MAP_PRESETS = [
  {
    id: 'dungeon_crypt',
    name: 'Cripta Ancestral das Sombras',
    theme: 'dungeon',
    cols: 24,
    rows: 18,
    bgColor: '#16181f',
    gridColor: 'rgba(255, 255, 255, 0.08)',
    obstacles: [
      { x: 3, y: 2, w: 4, h: 2, type: 'wall', label: 'Túmulo de Pedra' },
      { x: 17, y: 2, w: 4, h: 2, type: 'wall', label: 'Sarcófago Antigo' },
      { x: 10, y: 8, w: 4, h: 2, type: 'water', label: 'Fonte Tóxica' },
      { x: 0, y: 0, w: 24, h: 1, type: 'wall' },
      { x: 0, y: 17, w: 24, h: 1, type: 'wall' },
      { x: 0, y: 0, w: 1, h: 18, type: 'wall' },
      { x: 23, y: 0, w: 1, h: 18, type: 'wall' },
    ]
  },
  {
    id: 'tavern_boar',
    name: 'Taverna do Javali Saltitante',
    theme: 'tavern',
    cols: 20,
    rows: 16,
    bgColor: '#2c1b12',
    gridColor: 'rgba(230, 180, 100, 0.1)',
    obstacles: [
      { x: 3, y: 2, w: 14, h: 1, type: 'bar', label: 'Balcão do Taverneiro' },
      { x: 4, y: 6, w: 2, h: 2, type: 'table', label: 'Mesa de Carvalho' },
      { x: 9, y: 6, w: 2, h: 2, type: 'table', label: 'Mesa de Carvalho' },
      { x: 14, y: 6, w: 2, h: 2, type: 'table', label: 'Mesa de Carvalho' },
      { x: 4, y: 11, w: 2, h: 2, type: 'table', label: 'Mesa Redonda' },
      { x: 14, y: 11, w: 2, h: 2, type: 'table', label: 'Mesa Redonda' },
      { x: 9, y: 13, w: 2, h: 2, type: 'hearth', label: 'Lareira Quente' }
    ]
  },
  {
    id: 'forest_clearing',
    name: 'Clareira na Floresta Sussurrante',
    theme: 'forest',
    cols: 26,
    rows: 20,
    bgColor: '#132316',
    gridColor: 'rgba(100, 255, 120, 0.08)',
    obstacles: [
      { x: 4, y: 4, w: 3, h: 3, type: 'tree', label: 'Carvalho Milenar' },
      { x: 18, y: 5, w: 3, h: 3, type: 'tree', label: 'Árvore Anciã' },
      { x: 12, y: 10, w: 3, h: 2, type: 'boulder', label: 'Rochedo Musgoso' },
      { x: 6, y: 14, w: 2, h: 2, type: 'shrub', label: 'Arbustos Espinhosos' }
    ]
  },
  {
    id: 'cave_lair',
    name: 'Covil da Caverna Carmesim',
    theme: 'cave',
    cols: 25,
    rows: 18,
    bgColor: '#1b1419',
    gridColor: 'rgba(255, 100, 100, 0.08)',
    obstacles: [
      { x: 2, y: 2, w: 4, h: 4, type: 'stalagmite', label: 'Pilar de Cristal' },
      { x: 19, y: 3, w: 4, h: 3, type: 'stalagmite', label: 'Cristais Pontiagudos' },
      { x: 10, y: 7, w: 5, h: 4, type: 'lava', label: 'Poço de Lava Fervente' },
      { x: 2, y: 13, w: 5, h: 3, type: 'bones', label: 'Pilha de Ossos de Aventureiros' }
    ]
  }
];

export const CONDITIONS = [
  { id: 'blinded', name: 'Cego', icon: '👁️‍🗨️', desc: 'Falha automática em testes visuais. Ataques contra têm vantagem, seus ataques têm desvantagem.' },
  { id: 'charmed', name: 'Encantado', icon: '💖', desc: 'Não pode atacar quem o encantou. Encantador tem vantagem em testes sociais.' },
  { id: 'frightened', name: 'Amedrontado', icon: '😱', desc: 'Desvantagem em testes e ataques enquanto vê a fonte do medo. Não pode se aproximar.' },
  { id: 'poisoned', name: 'Envenenado', icon: '🤢', desc: 'Desvantagem em jogadas de ataque e testes de atributo.' },
  { id: 'prone', name: 'Caído', icon: '🛌', desc: 'Desvantagem em seus ataques. Ataques corpo a corpo a 1,5m têm vantagem contra você.' },
  { id: 'stunned', name: 'Atordoado', icon: '💫', desc: 'Incapacitado, não pode se mover, falha automática em FOR e DES. Ataques têm vantagem.' },
  { id: 'invisible', name: 'Invisível', icon: '👻', desc: 'Impossível de ver sem sentidos especiais. Seus ataques têm vantagem, ataques contra você têm desvantagem.' },
  { id: 'unconscious', name: 'Inconsciente', icon: '💤', desc: 'Incapacitado, cai no chão. Falha automática em testes de FOR e DES. Ataques a 1,5m que acertam são acertos críticos automáticos!' }
];

// Helper calculations
export function getAbilityMod(score) {
  return Math.floor((Number(score || 10) - 10) / 2);
}

export function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
