// Campanha Principal: A Lenda das Quatro Relíquias de Eldoria
// Estrutura fixa de progressão: Floresta -> Pântano -> Cavernas -> Masmorra Proibida

export const STORY_CAMPAIGN = {
  title: 'A Lenda das Quatro Relíquias de Eldoria',
  synopsis: 'Uma corrupção ancestral tomou conta de Eldoria após a quebra do Selo Primordial. Quatro entidades corrompidas tomaram posse dos fragmentos da Relíquia dos Reis. Somente um grupo de bravos aventureiros pode cruzar as terras esquecidas, libertar os povos locais e expurgar a escuridão.',
  
  lands: [
    {
      id: 'land_forest',
      number: 1,
      name: 'A Floresta das Raízes Antigas',
      theme: 'forest',
      description: 'Um vasto bosque antes pacífico, agora infestado por aracnídeos gigantes e slimes venenosos. A entrada da caverna no desfiladeiro sudeste foi selada pela Rainha das Aranhas.',
      cols: 46,
      rows: 32,
      gridSize: 52,
      startPosition: { x: 23, y: 16 },
      portalPosition: { x: 42, y: 23 },
      portalName: 'Caverna de Passagem para o Pântano',
      bossId: 'arachna_queen',
      bossName: 'Arachna, a Tecedora Sombria',
      relicReward: {
        id: 'relic_forest',
        name: 'Lágrima de Esmeralda',
        icon: '🌿',
        desc: 'Relíquia sagrada da floresta que restaura a vitalidade e abre a passagem para o Pântano.'
      },
      questLog: [
        'Suba a trilha nordeste até o Acampamento e fale com o Ancião Eldrin [E].',
        'Compre equipamentos com a Ferreira Kaelen na bancada do acampamento [E].',
        'Explore a ponte do rio a sudoeste e os bosques para encontrar Baús e Ervas.',
        'Derrote Arachna em frente à Caverna Sudeste para abrir o Portal!'
      ],
      npcs: [
        {
          id: 'npc_eldrin',
          name: 'Ancião Eldrin',
          role: 'Guardião dos Bosques',
          x: 33,
          y: 6,
          avatar: '🧙‍♂️',
          appearance: {
            skinTone: '#d49870',
            hairStyle: 'long',
            hairColor: '#e5e7eb',
            outfitType: 'robe',
            outfitColor: '#15803d',
            outfitSecondaryColor: '#ca8a04',
            headwear: 'circlet',
            weapon: 'staff'
          },
          dialogue: {
            greeting: 'Saudações, bravos aventureiros! Que bom que chegaram ao nosso acampamento. Uma praga sombria corrompeu nossas matas e fechou a caverna ao sudeste.',
            options: [
              {
                text: 'O que está acontecendo nesta floresta?',
                response: 'Arachna, uma criatura abissal que despertou das profundezas, teceu uma teia mágica inquebrável sobre a Caverna Sudeste. Seus filhotes e slimes venenosos atacam qualquer viajante.'
              },
              {
                text: 'Onde podemos encontrar tesouros e suprimentos?',
                response: 'Há um baú oculto sob as árvores a oeste da encruzilhada, outro perto da nossa carroça e um tesouro guardado na entrada da caverna ao sul! Falem também com a Ferreira Kaelen aqui ao lado.'
              },
              {
                text: 'Pode abençoar e curar nosso grupo?',
                action: 'full_heal',
                response: 'Pela luz ancestral das Raízes Antigas, que suas feridas se fechem e seu vigor seja renovado!'
              }
            ]
          }
        },
        {
          id: 'npc_kaelen',
          name: 'Ferreira Kaelen',
          role: 'Armeira do Acampamento',
          x: 30,
          y: 7,
          avatar: '🧔‍♂️',
          hasShop: true,
          shopItems: ['espada_curta_afiada', 'arco_cacador', 'armadura_couro_batido', 'pocao_cura_pequena', 'escudo_madeira'],
          appearance: {
            skinTone: '#8d5524',
            hairStyle: 'short',
            hairColor: '#451a03',
            outfitType: 'leather',
            outfitColor: '#78350f',
            outfitSecondaryColor: '#d97706',
            headwear: 'none',
            weapon: 'hammer'
          },
          dialogue: {
            greeting: 'Precisa de aço afiado ou couro resistente? Minha bancada no acampamento tem tudo o que salvamos das caravanas.',
            options: [
              {
                text: 'Gostaria de ver seus itens à venda.',
                action: 'open_shop',
                response: 'Aqui está! Armas confiáveis e poções para manter aranhas e slimes longe da sua garganta!'
              },
              {
                text: 'Algum conselho contra as feras da mata?',
                response: 'Aranhas odeiam armas de corte rápido e ataques à distância. Usem o terreno das estradas a seu favor!'
              }
            ]
          }
        }
      ],
      chests: [
        { id: 'f_chest_1', x: 16, y: 16, gold: 50, itemId: 'pocao_cura_pequena', trapped: false, opened: false },
        { id: 'f_chest_2', x: 6, y: 28, gold: 65, itemId: 'adaga_silenciosa', trapped: false, opened: false },
        { id: 'f_chest_3', x: 40, y: 7, gold: 80, itemId: 'arco_cacador', trapped: false, opened: false },
        { id: 'f_chest_4', x: 41, y: 22, gold: 120, itemId: 'armadura_couro_batido', trapped: true, opened: false }
      ],
      gatherables: [
        { id: 'herb_1', x: 14, y: 9, type: 'herb', name: 'Erva Medicinal', icon: '🌿', gathered: false },
        { id: 'herb_2', x: 11, y: 22, type: 'herb', name: 'Cogumelo Luminescente', icon: '🍄', gathered: false },
        { id: 'herb_3', x: 26, y: 12, type: 'herb', name: 'Erva Medicinal', icon: '🌿', gathered: false },
        { id: 'herb_4', x: 35, y: 18, type: 'herb', name: 'Flor da Vida', icon: '🌸', gathered: false }
      ],
      enemies: [
        { monsterId: 'forest_slime', x: 14, y: 6, name: 'Slime da Floresta' },
        { monsterId: 'forest_slime', x: 7, y: 12, name: 'Slime Verdejante' },
        { monsterId: 'forest_spider', x: 5, y: 11, name: 'Aranha Espreitadora' },
        { monsterId: 'forest_spider', x: 22, y: 6, name: 'Aranha Tece-Bosque' },
        { monsterId: 'forest_spider', x: 15, y: 19, name: 'Aranha Caçadora' },
        { monsterId: 'goblin_scout', x: 36, y: 15, name: 'Goblin Batedor' },
        { monsterId: 'forest_spider', x: 36, y: 21, name: 'Aranha Venenosa' }
      ],
      boss: {
        monsterId: 'arachna_queen',
        x: 40,
        y: 26,
        name: 'Arachna, a Tecedora Sombria',
        title: 'Guardiã Corrompida das Raízes',
        hp: 55,
        maxHp: 55,
        ac: 14,
        size: 2,
        speed: 9,
        xp: 350,
        goldDrop: 160,
        avatar: '🕷️',
        color: '#9333ea',
        actions: [
          { name: 'Picada Peçonhenta', bonus: 5, damage: '2d6+3', range: 1.5, type: 'perfurante' },
          { name: 'Jato de Teia Paralisante', bonus: 4, damage: '1d8+2', range: 6, type: 'acido' }
        ]
      }
    },

    {
      id: 'land_swamp',
      number: 2,
      name: 'O Pântano da Bruxa dos Espelhos',
      theme: 'swamp',
      description: 'Uma região alagada de águas fétidas, pontes de madeira rangentes e árvores mortas cobertas de musgo. A Bruxa Baba Morwenna habita a cabana sobre palafitas ao nordeste, enquanto Gargatroll assola a ilha sudeste.',
      cols: 48,
      rows: 34,
      gridSize: 52,
      startPosition: { x: 18, y: 19 },
      portalPosition: { x: 42, y: 29 },
      portalName: 'Fenda Rochosa das Minas de Cristal',
      bossId: 'bog_abomination',
      bossName: 'Gargatroll, a Abominação do Lodo',
      relicReward: {
        id: 'relic_swamp',
        name: 'Olho de Âmbar do Pântano',
        icon: '👁️',
        desc: 'Relíquia mística que dissipa as névoas venenosas e desobstrui a descida para as Cavernas Profundas.'
      },
      questLog: [
        'Converse com o Patrulheiro Gareth na ilha central do pântano [E].',
        'Atravesse a ponte de madeira nordeste até a Cabana de Baba Morwenna [E].',
        'Adquira antídotos e equipamentos reforçados para enfrentar o brejo.',
        'Atravesse a ponte sudeste e derrote Gargatroll para abrir o Portal das Minas!'
      ],
      npcs: [
        {
          id: 'npc_morwenna',
          name: 'Baba Morwenna',
          role: 'Bruxa das Poções Antigas',
          x: 35,
          y: 9,
          avatar: '🧙‍♀️',
          hasShop: true,
          shopItems: ['elixir_antidoto', 'pocao_cura_maior', 'espada_longa_aco', 'manto_pantano', 'anel_protecao'],
          appearance: {
            skinTone: '#a3c9a8',
            hairStyle: 'spiky',
            hairColor: '#374151',
            outfitType: 'robe',
            outfitColor: '#164e63',
            outfitSecondaryColor: '#059669',
            headwear: 'wizard_hat',
            weapon: 'staff'
          },
          dialogue: {
            greeting: 'Hehehe... viajantes vivos cruzando a ponte da minha cabana? Poucos sobrevivem às toxinas deste pântano sem os meus elixires.',
            options: [
              {
                text: 'Precisamos de seus antídotos e equipamentos.',
                action: 'open_shop',
                response: 'Ouro de fora sempre é bem-vindo. Levem meus frascos antes que o veneno lhes derreta as botas!'
              },
              {
                text: 'Pode restaurar nossa saúde com sua magia?',
                action: 'full_heal',
                response: 'Bebam do caldeirão de ervas negras! Suas feridas estão curadas!'
              },
              {
                text: 'Como derrotamos Gargatroll no sudeste?',
                response: 'Gargatroll bloqueia a passagem na ilha ao sul da segunda ponte. Ataquem juntos sem deixá-lo descansar no lodo!'
              }
            ]
          }
        },
        {
          id: 'npc_gareth',
          name: 'Patrulheiro Gareth',
          role: 'Batedor Imperial Ferido',
          x: 20,
          y: 17,
          avatar: '🧝‍♀️',
          appearance: {
            skinTone: '#f5c6a5',
            hairStyle: 'ponytail',
            hairColor: '#ca8a04',
            outfitType: 'ranger_cloak',
            outfitColor: '#14532d',
            outfitSecondaryColor: '#854d0e',
            headwear: 'leather_hood',
            weapon: 'bow'
          },
          dialogue: {
            greeting: 'Cuidado com os sapos gigantes e slimes tóxicos! Há duas pontes de madeira a leste: a do norte leva à cabana da Bruxa, e a do sul leva ao covil do monstro.',
            options: [
              {
                text: 'Viu algum tesouro escondido no brejo?',
                response: 'Sim! Há um baú no caminho noroeste perto das ossadas, outro ao sul na trilha enlameada e um baú valioso na ilha sudeste!'
              },
              {
                text: 'Obrigado pelo aviso, patrulheiro.',
                response: 'Que os deuses protejam suas lâminas!'
              }
            ]
          }
        }
      ],
      chests: [
        { id: 's_chest_1', x: 5, y: 5, gold: 75, itemId: 'pocao_cura_maior', trapped: false, opened: false },
        { id: 's_chest_2', x: 8, y: 22, gold: 95, itemId: 'elixir_antidoto', trapped: true, opened: false },
        { id: 's_chest_3', x: 38, y: 10, gold: 130, itemId: 'espada_longa_aco', trapped: false, opened: false },
        { id: 's_chest_4', x: 40, y: 30, gold: 180, itemId: 'anel_protecao', trapped: true, opened: false }
      ],
      gatherables: [
        { id: 'swamp_res_1', x: 14, y: 15, type: 'herb', name: 'Lótus Noturna', icon: '🪷', gathered: false },
        { id: 'swamp_res_2', x: 24, y: 16, type: 'herb', name: 'Raiz de Pântano', icon: '🪵', gathered: false },
        { id: 'swamp_res_3', x: 34, y: 26, type: 'herb', name: 'Musgo Luminoso', icon: '✨', gathered: false }
      ],
      enemies: [
        { monsterId: 'bog_slime', x: 9, y: 8, name: 'Slime Tóxico' },
        { monsterId: 'giant_swamp_frog', x: 9, y: 10, name: 'Sapo Carnívoro Gigante' },
        { monsterId: 'bog_slime', x: 14, y: 14, name: 'Slime do Lodo' },
        { monsterId: 'swamp_troll', x: 16, y: 14, name: 'Troll do Brejo' },
        { monsterId: 'bog_slime', x: 14, y: 23, name: 'Slime Putrefato' },
        { monsterId: 'giant_swamp_frog', x: 25, y: 21, name: 'Sapo Venenoso' },
        { monsterId: 'giant_swamp_frog', x: 37, y: 27, name: 'Sapo Campeão' }
      ],
      boss: {
        monsterId: 'bog_abomination',
        x: 38,
        y: 28,
        name: 'Gargatroll, a Abominação do Lodo',
        title: 'Tirano das Águas Estagnadas',
        hp: 95,
        maxHp: 95,
        ac: 15,
        size: 2,
        speed: 9,
        xp: 650,
        goldDrop: 280,
        avatar: '🐸',
        color: '#15803d',
        actions: [
          { name: 'Clava de Tronco Podre', bonus: 6, damage: '2d8+4', range: 1.5, type: 'contundente' },
          { name: 'Vômito Corrosivo de Lodo', bonus: 5, damage: '2d6+3', range: 7.5, type: 'acido' }
        ]
      }
    },

    {
      id: 'land_cave',
      number: 3,
      name: 'As Cavernas e Minas de Cristal',
      theme: 'cave',
      description: 'Labirintos subterrâneos iluminados por cristais de safira e ametista, escadas de corda e trilhos de vagonetas ao redor de um lago subterrâneo. Nas câmaras profundas dorme o Colosso de Cristal.',
      cols: 50,
      rows: 36,
      gridSize: 52,
      startPosition: { x: 28, y: 13 },
      portalPosition: { x: 9, y: 31 },
      portalName: 'Portões Ancestrais da Masmorra Proibida',
      bossId: 'crystal_colossus',
      bossName: 'O Colosso de Cristal Ancestral',
      relicReward: {
        id: 'relic_cave',
        name: 'Coração de Safira Cintilante',
        icon: '💎',
        desc: 'Relíquia resplandecente que canaliza as energias da terra e dissolve os selos da Masmorra Proibida.'
      },
      questLog: [
        'Visite o Acampamento dos Mineiros no salão nordeste [E].',
        'Negocie armas e armaduras de cristal com o Mestre Thorin [E].',
        'Explore os trilhos de mineração e as câmaras de cristal a oeste.',
        'Derrote o Colosso de Cristal na câmara sudoeste para abrir os portões da Masmorra!'
      ],
      npcs: [
        {
          id: 'npc_thorin',
          name: 'Mestre Thorin Barba-de-Ferro',
          role: 'Líder dos Mineiros Subterrâneos',
          x: 35,
          y: 11,
          avatar: '🧔‍♂️',
          hasShop: true,
          shopItems: ['machado_cristal', 'armadura_placas', 'martelo_runico', 'amuleto_saude', 'pocao_cura_superior'],
          appearance: {
            skinTone: '#d49870',
            hairStyle: 'spiky',
            hairColor: '#b45309',
            outfitType: 'plate',
            outfitColor: '#475569',
            outfitSecondaryColor: '#f59e0b',
            headwear: 'iron_helmet',
            weapon: 'axe'
          },
          dialogue: {
            greeting: 'Pela barba dos meus ancestrais! Aventureiros nas minas! Cuidado: as galerias a oeste estão tomadas por aranhas cristalinas e pelo Colosso!',
            options: [
              {
                text: 'Tem equipamentos pesados para nos vender?',
                action: 'open_shop',
                response: 'Forjados com minério puro das jazidas profundas! Essas armas atravessam carapaças de pedra e cristal!'
              },
              {
                text: 'Onde estão os baús dos mineiros?',
                response: 'Deixamos um baú dourado na alcova ao norte do acampamento, outro ao final dos trilhos no sudeste e dois nas câmaras de cristal a oeste!'
              }
            ]
          }
        },
        {
          id: 'npc_varis',
          name: 'Erudito Varis',
          role: 'Mago Espeleólogo',
          x: 31,
          y: 12,
          avatar: '🧙‍♂️',
          appearance: {
            skinTone: '#f5c6a5',
            hairStyle: 'long',
            hairColor: '#9333ea',
            outfitType: 'robe',
            outfitColor: '#581c87',
            outfitSecondaryColor: '#c084fc',
            headwear: 'circlet',
            weapon: 'staff'
          },
          dialogue: {
            greeting: 'Estes cristais azuis e púrpura ressoam com magia antiga. Posso canalizar o brilho deles para curar suas feridas.',
            options: [
              {
                text: 'Por favor, restaure nossas forças.',
                action: 'full_heal',
                response: 'Que a ressonância cristalina restaure seus pontos de vida por completo!'
              },
              {
                text: 'Onde fica a entrada para a Masmorra Proibida?',
                response: 'Na câmara de ametista ao sudoeste, guardada pelo Colosso de Cristal!'
              }
            ]
          }
        }
      ],
      chests: [
        { id: 'c_chest_1', x: 43, y: 5, gold: 150, itemId: 'pocao_cura_superior', trapped: false, opened: false },
        { id: 'c_chest_2', x: 6, y: 15, gold: 200, itemId: 'machado_cristal', trapped: true, opened: false },
        { id: 'c_chest_3', x: 46, y: 26, gold: 240, itemId: 'amuleto_saude', trapped: false, opened: false },
        { id: 'c_chest_4', x: 16, y: 31, gold: 300, itemId: 'armadura_placas', trapped: true, opened: false }
      ],
      gatherables: [
        { id: 'cave_res_1', x: 16, y: 5, type: 'crystal', name: 'Cristal de Safira', icon: '💎', gathered: false },
        { id: 'cave_res_2', x: 37, y: 22, type: 'crystal', name: 'Cristal Luminoso', icon: '🔮', gathered: false },
        { id: 'cave_res_3', x: 5, y: 26, type: 'crystal', name: 'Geoda de Ametista', icon: '✨', gathered: false }
      ],
      enemies: [
        { monsterId: 'crystal_spider', x: 5, y: 6, name: 'Aranha das Sombras' },
        { monsterId: 'crystal_spider', x: 7, y: 28, name: 'Aranha de Ametista' },
        { monsterId: 'mine_goblin', x: 22, y: 16, name: 'Goblin Salteador de Minas' },
        { monsterId: 'rock_troglodyte', x: 18, y: 22, name: 'Troglodita Pedregoso' },
        { monsterId: 'rock_troglodyte', x: 44, y: 14, name: 'Troglodita Berserker' },
        { monsterId: 'mine_goblin', x: 44, y: 22, name: 'Goblin dos Trilhos' }
      ],
      boss: {
        monsterId: 'crystal_colossus',
        x: 12,
        y: 28,
        name: 'O Colosso de Cristal Ancestral',
        title: 'Guardião Indestrutível da Terra Profunda',
        hp: 150,
        maxHp: 150,
        ac: 16,
        size: 2,
        speed: 7.5,
        xp: 1200,
        goldDrop: 450,
        avatar: '💎',
        color: '#06b6d4',
        actions: [
          { name: 'Punho Sísmico Esmagador', bonus: 7, damage: '2d10+5', range: 1.5, type: 'contundente' },
          { name: 'Disparo de Estilhaços Prismáticos', bonus: 6, damage: '2d8+4', range: 9, type: 'perfurante' }
        ]
      }
    },

    {
      id: 'land_dungeon',
      number: 4,
      name: 'A Masmorra Proibida & Cripta Infernal',
      theme: 'dungeon',
      description: 'O epicentro de todo o mal! Salões sombrios de pedra, celas de prisão, sarcófagos reais e corredores com estacas. Na câmara rúnica ao sudeste aguarda Malakor, o Tirano das Trevas.',
      cols: 52,
      rows: 38,
      gridSize: 52,
      startPosition: { x: 11, y: 12 },
      portalPosition: { x: 36, y: 34 },
      portalName: 'Altar da Luz Eterna (Vitória Final)',
      bossId: 'malakor_tyrant',
      bossName: 'Malakor, o Lorde Tirano das Trevas',
      relicReward: {
        id: 'relic_dungeon',
        name: 'Coroa Unificada dos Quatro Reinos',
        icon: '👑',
        desc: 'A sagrada relíquia reunida que bane definitivamente a escuridão e restaura a paz eterna em Eldoria!'
      },
      questLog: [
        'Prepare-se no Refúgio Barricado dos Cruzados no salão noroeste [E].',
        'Receba a Bênção Sagrada da Sacerdotisa Solaria junto à fogueira [E].',
        'Atravesse os corredores dos esqueletos e as criptas reais.',
        'Derrote Malakor na Câmara Rúnica Sudeste e ative o Altar da Luz Eterna!'
      ],
      npcs: [
        {
          id: 'npc_valerius',
          name: 'Comandante Valerius',
          role: 'Lorde Paladino da Resistência',
          x: 9,
          y: 9,
          avatar: '🛡️',
          hasShop: true,
          shopItems: ['lamina_solar', 'espada_flamejante', 'armadura_placas_completa', 'cajado_arquimago', 'elixir_divino'],
          appearance: {
            skinTone: '#d49870',
            hairStyle: 'short',
            hairColor: '#e5e7eb',
            outfitType: 'plate',
            outfitColor: '#1e3a8a',
            outfitSecondaryColor: '#fbbf24',
            headwear: 'horned_helm',
            weapon: 'shield_sword'
          },
          dialogue: {
            greeting: 'Glória aos céus! Heróis conseguiram atravessar a floresta, o pântano e as minas até o nosso refúgio barricado! Este é o último bastião antes de Malakor.',
            options: [
              {
                text: 'Precisamos do arsenal lendário para a batalha final.',
                action: 'open_shop',
                response: 'Estas são as armas sagradas guardadas para o confronto supremo. Que suas lâminas brilhem contra as trevas!'
              },
              {
                text: 'Onde está Malakor?',
                response: 'Sigam pelo corredor leste e desçam até a Câmara Rúnica no sudeste. Cuidado com os esqueletos blindados e os demônios de fogo!'
              }
            ]
          }
        },
        {
          id: 'npc_solaria',
          name: 'Sacerdotisa Solaria',
          role: 'Arauta da Luz Sagrada',
          x: 15,
          y: 11,
          avatar: '👸',
          appearance: {
            skinTone: '#f5c6a5',
            hairStyle: 'long',
            hairColor: '#fbbf24',
            outfitType: 'robe',
            outfitColor: '#ffffff',
            outfitSecondaryColor: '#eab308',
            headwear: 'circlet',
            weapon: 'staff'
          },
          dialogue: {
            greeting: 'Sintam a cálida proteção desta fogueira consagrada. Vocês carregam a esperança de toda Eldoria.',
            options: [
              {
                text: 'Pode curar nossas feridas antes do confronto?',
                action: 'full_heal',
                response: 'Que a energia celestial flua por seus corpos! Seus Pontos de Vida foram plenamente restabelecidos!'
              },
              {
                text: 'O que acontece quando derrotarmos Malakor?',
                response: 'Os quatro fragmentos das Relíquias se fundirão na Coroa da Luz. Toquem o Altar Rúnico ao derrotá-lo para selar a Vitória Suprema!'
              }
            ]
          }
        }
      ],
      chests: [
        { id: 'd_chest_1', x: 42, y: 3, gold: 250, itemId: 'pocao_cura_superior', trapped: false, opened: false },
        { id: 'd_chest_2', x: 39, y: 16, gold: 320, itemId: 'cajado_arquimago', trapped: true, opened: false },
        { id: 'd_chest_3', x: 48, y: 16, gold: 380, itemId: 'espada_flamejante', trapped: true, opened: false },
        { id: 'd_chest_4', x: 39, y: 25, gold: 450, itemId: 'lamina_solar', trapped: true, opened: false },
        { id: 'd_chest_5', x: 44, y: 34, gold: 600, itemId: 'elixir_divino', trapped: false, opened: false }
      ],
      gatherables: [
        { id: 'dungeon_res_1', x: 25, y: 6, type: 'relic', name: 'Essência Sagrada', icon: '✨', gathered: false },
        { id: 'dungeon_res_2', x: 8, y: 28, type: 'relic', name: 'Cinzas Abissais', icon: '🔥', gathered: false },
        { id: 'dungeon_res_3', x: 28, y: 16, type: 'relic', name: 'Lágrima dos Santos', icon: '💧', gathered: false }
      ],
      enemies: [
        { monsterId: 'skeleton_knight', x: 20, y: 16, name: 'Cavaleiro Esqueleto de Elite' },
        { monsterId: 'skeleton_knight', x: 37, y: 16, name: 'Esqueleto Guardião' },
        { monsterId: 'fire_imp', x: 25, y: 26, name: 'Diabrete das Catacumbas' },
        { monsterId: 'skeleton_knight', x: 28, y: 28, name: 'Sentinela Ossuda' },
        { monsterId: 'abyssal_demon', x: 4, y: 25, name: 'Fera Demoníaca da Cripta' },
        { monsterId: 'abyssal_demon', x: 42, y: 14, name: 'Demônio Chifrudo Abissal' },
        { monsterId: 'abyssal_demon', x: 48, y: 30, name: 'Guarda Real do Abismo' }
      ],
      boss: {
        monsterId: 'malakor_tyrant',
        x: 35,
        y: 31,
        name: 'Malakor, o Lorde Tirano das Trevas',
        title: 'Suserano do Fim dos Tempos',
        hp: 220,
        maxHp: 220,
        ac: 17,
        size: 2,
        speed: 9,
        xp: 2500,
        goldDrop: 1000,
        avatar: '👿',
        color: '#dc2626',
        actions: [
          { name: 'Ceifadora de Almas Vorpal', bonus: 8, damage: '3d8+5', range: 1.5, type: 'necrotico' },
          { name: 'Chuva de Cometas Abissais', bonus: 7, damage: '3d6+4', range: 12, type: 'fogo' }
        ]
      }
    }
  ]
};
