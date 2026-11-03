/**
 * Paletas e estilos padrão para personalização 2D
 */
export const SKIN_TONES = [
  { id: 'fair', name: 'Clara', color: '#fcd5b5', shade: '#e2ab88' },
  { id: 'peach', name: 'Morena Clara', color: '#f5c6a5', shade: '#d49870' },
  { id: 'tan', name: 'Bronzeada', color: '#d49870', shade: '#b07248' },
  { id: 'warm_brown', name: 'Morena Escura', color: '#a66a38', shade: '#7a4820' },
  { id: 'dark', name: 'Negra', color: '#5c3826', shade: '#3b2216' },
  { id: 'elf_pale', name: 'Élfica Pálida', color: '#fce7f3', shade: '#f472b6' },
  { id: 'orc_green', name: 'Meio-Orc Verde', color: '#86efac', shade: '#22c55e' }
];

export const HAIR_STYLES = [
  { id: 'short', name: 'Curto Espetado' },
  { id: 'long', name: 'Longo Solto' },
  { id: 'ponytail', name: 'Rabo de Cavalo' },
  { id: 'spiky', name: 'Moicano / Rebelde' },
  { id: 'curly', name: 'Ondulado / Cacheado' },
  { id: 'bald', name: 'Careca' }
];

export const HAIR_COLORS = [
  { id: 'black', name: 'Preto', color: '#1c1917', highlight: '#44403c' },
  { id: 'dark_brown', name: 'Castanho Escuro', color: '#451a03', highlight: '#78350f' },
  { id: 'blonde', name: 'Loiro Dourado', color: '#eab308', highlight: '#fef08a' },
  { id: 'red', name: 'Ruivo Ardente', color: '#b91c1c', highlight: '#f87171' },
  { id: 'silver', name: 'Prateado / Branco', color: '#e2e8f0', highlight: '#ffffff' },
  { id: 'arcane_blue', name: 'Azul Arcano', color: '#2563eb', highlight: '#93c5fd' },
  { id: 'violet', name: 'Púrpura Místico', color: '#7c3aed', highlight: '#c084fc' }
];

export const OUTFIT_TYPES = [
  { id: 'adventurer', name: 'Túnica de Aventureiro', desc: 'Tecido leve e confortável com cinto de couro' },
  { id: 'leather', name: 'Armadura de Couro Batido', desc: 'Proteção flexível para batedores e ladinos' },
  { id: 'chainmail', name: 'Cota de Malha de Aço', desc: 'Anéis de aço entrelaçados para guerreiros e clérigos' },
  { id: 'plate', name: 'Armadura de Placas Pesada', desc: 'Aço forjado para paladinos e cavaleiros' },
  { id: 'robe', name: 'Robe Mágico do Conjurador', desc: 'Manto bordado com fios arcanos' },
  { id: 'ranger', name: 'Traje de Patrulheiro com Capa', desc: 'Camuflagem verdejante das matas' }
];

export const OUTFIT_COLORS = [
  { id: 'blue', name: 'Azul Cobalto', color: '#2563eb', secondary: '#1e3a8a' },
  { id: 'crimson', name: 'Rubro Carmesim', color: '#dc2626', secondary: '#7f1d1d' },
  { id: 'emerald', name: 'Verde Esmeralda', color: '#16a34a', secondary: '#14532d' },
  { id: 'amber', name: 'Âmbar Dourado', color: '#d97706', secondary: '#78350f' },
  { id: 'purple', name: 'Roxo Nobre', color: '#7c3aed', secondary: '#4c1d95' },
  { id: 'charcoal', name: 'Preto Sombra', color: '#334155', secondary: '#0f172a' },
  { id: 'white', name: 'Branco Sagrado', color: '#f8fafc', secondary: '#cbd5e1' }
];

export const HEADWEAR_TYPES = [
  { id: 'none', name: 'Nenhum' },
  { id: 'iron_helmet', name: 'Elmo de Ferro' },
  { id: 'wizard_hat', name: 'Chapéu Pontudo de Mago' },
  { id: 'hood', name: 'Capuz de Assassino' },
  { id: 'circlet', name: 'Diadema Rúnico' },
  { id: 'horned_helm', name: 'Elmo com Chifres de Bárbaro' }
];

export const WEAPON_TYPES = [
  { id: 'sword', name: 'Espada de Aço' },
  { id: 'axe', name: 'Machado de Batalha' },
  { id: 'staff', name: 'Bordão Mágico' },
  { id: 'bow', name: 'Arco do Caçador' },
  { id: 'dagger', name: 'Adaga Ágil' },
  { id: 'hammer', name: 'Martelo de Guerra' }
];

export const DEFAULT_APPEARANCE = {
  skinTone: '#f5c6a5',
  hairStyle: 'short',
  hairColor: '#451a03',
  outfitType: 'adventurer',
  outfitColor: '#2563eb',
  outfitSecondaryColor: '#1e3a8a',
  headwear: 'none',
  weapon: 'sword',
  hasShield: true
};
