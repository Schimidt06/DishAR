export interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  serves: string;
  size: string;
  image: string;
  model3dUrl?: string;
  iosModelUrl?: string;
  dimensions?: {
    widthMeters: number;
    heightMeters: number;
    depthMeters: number;
  };
  arEnabled?: boolean;
  category: 'Burgers' | 'Porções' | 'Combos';
  badge?: string;
}

export const RESTAURANT_INFO = {
  name: 'Garage Burger & Co.',
  subtitle: 'Hamburgueria artesanal com experiência em Realidade Aumentada',
  address: 'Rua Gastronômica, 1024 — Salão Principal',
  table: 'Mesa 07',
  whatsapp: '5511999999999', // Atualizável pelo cliente
};

export const DISHES: Dish[] = [
  {
    id: 'garage-double',
    name: 'Garage Double',
    description:
      'Dois smash burgers artesanais de 90g grelhados no ponto perfeito, fatias generosas de cheddar inglês derretido, bacon crocante defumado e cebola caramelizada no brioche artesanal selado na manteiga.',
    price: 'R$ 39,90',
    serves: 'Serve 1 pessoa',
    size: '11 × 9 × 11 cm',
    image: '/burger.png',
    model3dUrl: '/models/hamburger/hamburger-test.glb',
    iosModelUrl: '/models/burger.usdz',
    dimensions: {
      widthMeters: 0.11,
      heightMeters: 0.09,
      depthMeters: 0.11,
    },
    arEnabled: true,
    category: 'Burgers',
    badge: 'Mais pedido',
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    description:
      'Batatas rústicas supercrocantes cobertas com nosso creme de queijo cheddar artesanal, crocantes de bacon dourado e cebolinha fresca. Porção generosa feita para dividir.',
    price: 'R$ 46,90',
    serves: 'Serve 2–3 pessoas',
    size: 'Porção de 28 cm',
    image: '/fries.png',
    category: 'Porções',
    badge: 'Para compartilhar',
  },
  {
    id: 'track-combo',
    name: 'Track Combo Completo',
    description:
      'Cheeseburger smash com bacon crocante, fritas individuais douradas e refrigerante lata ou suco natural gelado. O clássico perfeito para matar a fome.',
    price: 'R$ 49,90',
    serves: 'Serve 1 pessoa',
    size: 'Bandeja de 32 cm',
    image: '/combo.png',
    category: 'Combos',
    badge: 'Combo campeão',
  },
];

export function getDishById(id: string): Dish | undefined {
  return DISHES.find((dish) => dish.id === id);
}
