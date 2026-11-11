export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface ProductCapacity {
  size: string;
  priceDelta: number; // added to base price
}

export interface ProductSpecs {
  processor: string;
  camera: string;
  screen: string;
  battery: string;
  connectivity: string;
  weight: string;
  os: string;
  extra?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: 'Apple' | 'Samsung' | 'Google' | 'NextMobile';
  category: 'smartphones' | 'foldables' | 'accessories';
  tagline: string;
  basePrice: number; // regular installment price (12x)
  pixDiscountPercent: number; // e.g. 15%
  rating: number;
  reviewCount: number;
  inStock: boolean;
  freeShipping: boolean;
  image: string;
  galleryImages: string[];
  colors: ProductColor[];
  capacities?: ProductCapacity[];
  specs: ProductSpecs;
  highlights: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'samsung-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra 5G',
    brand: 'Samsung',
    category: 'smartphones',
    tagline: 'O ápice da engenharia com Snapdragon 8 Elite e Galaxy AI ProVisual.',
    basePrice: 9999.00,
    pixDiscountPercent: 15,
    rating: 4.9,
    reviewCount: 342,
    inStock: true,
    freeShipping: true,
    image: '/images/phone_galaxy_s25_ultra_1794357022891.jpg',
    galleryImages: [
      '/images/phone_galaxy_s25_ultra_1794357022891.jpg',
      '/images/hero_flagship_phones_1794357021828.jpg',
    ],
    colors: [
      { id: 'titanium-black', name: 'Titânio Preto', hex: '#26282b' },
      { id: 'titanium-gray', name: 'Titânio Cinza', hex: '#7a7d84' },
      { id: 'titanium-silver', name: 'Titânio Prata', hex: '#d1d5db' },
      { id: 'titanium-blue', name: 'Titânio Azul', hex: '#3b5575' },
    ],
    capacities: [
      { size: '256GB', priceDelta: 0 },
      { size: '512GB', priceDelta: 900 },
      { size: '1TB', priceDelta: 2100 },
    ],
    specs: {
      processor: 'Snapdragon 8 Elite for Galaxy (3nm)',
      camera: '200 MP Ultra Quad + 50 MP Periscópio 5x Óptico + 50 MP Ultra-Wide',
      screen: '6.8" Dynamic AMOLED 2X, QHD+ 120Hz, Gorilla Armor antirreflexo, 2600 nits',
      battery: '5.000 mAh com Carregamento 45W Ultra Rápido',
      connectivity: '5G SA/NSA, Wi-Fi 7, S Pen embutida, Bluetooth 5.4, UWB',
      weight: '219 g',
      os: 'One UI 7 (Android 15) com 7 anos de atualizações de SO',
      extra: 'Estrutura em Titânio aeroespacial e proteção IP68',
    },
    highlights: [
      'Estrutura em Titânio de Grau Aeroespacial',
      'Galaxy AI integrada nativamente',
      'Caneta S Pen de alta precisão embutida',
      'Tela com vidro Gorilla Armor sem reflexos',
    ],
  },
  {
    id: 'apple-iphone-16-pro-max',
    name: 'Apple iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'smartphones',
    tagline: 'Construído em titânio com o poder inigualável do chip A18 Pro.',
    basePrice: 10499.00,
    pixDiscountPercent: 15,
    rating: 4.9,
    reviewCount: 489,
    inStock: true,
    freeShipping: true,
    image: '/images/phone_iphone16_pro_1794357022297.jpg',
    galleryImages: [
      '/images/phone_iphone16_pro_1794357022297.jpg',
      '/images/hero_flagship_phones_1794357021828.jpg',
    ],
    colors: [
      { id: 'natural-titanium', name: 'Titânio Natural', hex: '#c5bfb4' },
      { id: 'black-titanium', name: 'Titânio Preto', hex: '#3b3b3e' },
      { id: 'white-titanium', name: 'Titânio Branco', hex: '#f2f2ed' },
      { id: 'desert-titanium', name: 'Titânio Deserto', hex: '#cbba9f' },
    ],
    capacities: [
      { size: '256GB', priceDelta: 0 },
      { size: '512GB', priceDelta: 1100 },
      { size: '1TB', priceDelta: 2400 },
    ],
    specs: {
      processor: 'Apple A18 Pro (3nm de 2ª geração) com Neural Engine 16-core',
      camera: '48 MP Fusion + 48 MP Ultra-Wide + 12 MP Telefoto 5x periscópica',
      screen: '6.9" Super Retina XDR OLED, ProMotion 120Hz, 2000 nits de pico',
      battery: 'Até 33h de reprodução de vídeo, MagSafe 25W Qi2',
      connectivity: '5G, Wi-Fi 7, USB-C 3.0 (10 Gbps), Thread, UWB',
      weight: '227 g',
      os: 'iOS 18 com Apple Intelligence',
      extra: 'Novo botão físico de Controle da Câmera (Camera Control)',
    },
    highlights: [
      'Acabamento em Titânio Natural Escovado',
      'Novo Controle da Câmera por toque háptico',
      'Gravação em 4K Dolby Vision a 120 fps',
      'Maior tela de iPhone de todos os tempos: 6.9 polegadas',
    ],
  },
  {
    id: 'google-pixel-9-pro-xl',
    name: 'Google Pixel 9 Pro XL',
    brand: 'Google',
    category: 'smartphones',
    tagline: 'O ápice da fotografia computacional e inteligência Gemini Nano.',
    basePrice: 8499.00,
    pixDiscountPercent: 15,
    rating: 4.8,
    reviewCount: 178,
    inStock: true,
    freeShipping: true,
    image: '/images/phone_pixel_9_pro_1794357023289.jpg',
    galleryImages: [
      '/images/phone_pixel_9_pro_1794357023289.jpg',
      '/images/hero_flagship_phones_1794357021828.jpg',
    ],
    colors: [
      { id: 'porcelain', name: 'Porcelain (Branco)', hex: '#e8e5dc' },
      { id: 'obsidian', name: 'Obsidian (Preto)', hex: '#222325' },
      { id: 'hazel', name: 'Hazel (Verde Musgo)', hex: '#878c80' },
      { id: 'rose-quartz', name: 'Rose Quartz', hex: '#e5cac6' },
    ],
    capacities: [
      { size: '128GB', priceDelta: 0 },
      { size: '256GB', priceDelta: 600 },
      { size: '512GB', priceDelta: 1400 },
    ],
    specs: {
      processor: 'Google Tensor G4 com coprocessador de segurança Titan M2',
      camera: '50 MP Octa PD + 48 MP Ultra-Wide Macro + 48 MP Telefoto 5x Super Zoom 30x',
      screen: '6.8" Super Actua OLED (LTPO 1-120Hz), 3000 nits pico',
      battery: '5.060 mAh com Carregamento 37W + Carregamento Reverso sem fio',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, UWB, SOS via Satélite',
      weight: '221 g',
      os: 'Android 15 puro com 7 anos de Pixel Feature Drops',
      extra: 'Assistente Gemini Advanced incluído por 1 ano',
    },
    highlights: [
      'Processamento de IA Gemini Nano on-device',
      'Fotografia com HDR+, Magic Editor e Vídeo Noturno',
      'Tela Super Actua mais brilhante do mercado',
      'Sensor de temperatura corporal embutido',
    ],
  },
  {
    id: 'samsung-galaxy-z-fold6-ultra',
    name: 'Samsung Galaxy Z Fold6 Ultra',
    brand: 'Samsung',
    category: 'foldables',
    tagline: 'Produtividade sem limites em tela dobrável de 7.6" com chassi ultrafino.',
    basePrice: 12999.00,
    pixDiscountPercent: 15,
    rating: 4.9,
    reviewCount: 95,
    inStock: true,
    freeShipping: true,
    image: '/images/phone_foldable_ultra_1794357023716.jpg',
    galleryImages: [
      '/images/phone_foldable_ultra_1794357023716.jpg',
      '/images/hero_flagship_phones_1794357021828.jpg',
    ],
    colors: [
      { id: 'silver-shadow', name: 'Prata Shadow', hex: '#d8dade' },
      { id: 'navy-shadow', name: 'Azul Navy', hex: '#212d3d' },
      { id: 'black-craft', name: 'Preto Craft', hex: '#1c1e21' },
    ],
    capacities: [
      { size: '256GB', priceDelta: 0 },
      { size: '512GB', priceDelta: 1000 },
      { size: '1TB', priceDelta: 2200 },
    ],
    specs: {
      processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
      camera: '50 MP Dual Pixel OIS + 12 MP Ultra-Wide + 10 MP Telefoto 3x',
      screen: 'Interna 7.6" Dynamic AMOLED 2X dobrável + Externa 6.3" 120Hz',
      battery: '4.400 mAh com Carregamento Rápido 25W e Wireless PowerShare',
      connectivity: '5G, Wi-Fi 7, S Pen Fold Edition, Bluetooth 5.3',
      weight: '239 g',
      os: 'One UI 6.1.1 otimizada para multitarefa de 3 janelas',
      extra: 'Dobradiça de trilho duplo Armor Aluminum com IP48',
    },
    highlights: [
      'Design dobrável mais fino e leve já produzido',
      'Tela aberta equivalente a um tablet pessoal',
      'Tradução ao vivo em tela dupla (Dual Screen Interpreter)',
      'Suporte a caneta stylus S Pen Fold',
    ],
  },
  {
    id: 'nextmobile-titanium-watch-ultra',
    name: 'NextMobile Titanium Watch Ultra',
    brand: 'NextMobile',
    category: 'accessories',
    tagline: 'Smartwatch em titânio aeroespacial com GPS duplo L1+L5 e 80h de bateria.',
    basePrice: 3899.00,
    pixDiscountPercent: 15,
    rating: 4.9,
    reviewCount: 112,
    inStock: true,
    freeShipping: true,
    image: '/images/acc_watch_ultra_1794357054177.jpg',
    galleryImages: ['/images/acc_watch_ultra_1794357054177.jpg'],
    colors: [
      { id: 'titanium-natural', name: 'Titânio Natural', hex: '#a6a7ab' },
      { id: 'titanium-stealth', name: 'Titânio Escuro', hex: '#2e3034' },
    ],
    capacities: [
      { size: '49mm GPS + Cellular', priceDelta: 0 },
    ],
    specs: {
      processor: 'Dual-Core S9 Ultra Sip com motor de IA dedicado',
      camera: 'Sensor bio-óptico duplo para ECG, oxímetro e temperatura',
      screen: '1.96" Sapphire Crystal Retina AMOLED, 3000 nits pico',
      battery: 'Até 80 horas em modo normal / 100 horas em economia',
      connectivity: '4G LTE eSIM independente, Wi-Fi 6, Bluetooth 5.3, NFC',
      weight: '61 g',
      os: 'NextOS 2 com monitoramento esportivo avançado',
      extra: 'Resistência à água 100m (EN13319 para mergulho)',
    },
    highlights: [
      'Caixa maciça em Titânio de 49mm',
      'Cristal de Safira ultrarresistente a riscos',
      'Sirene de emergência de 86 decibéis',
      'Conexão 4G LTE sem depender do celular',
    ],
  },
  {
    id: 'nextmobile-sonic-pro-buds',
    name: 'NextMobile Sonic Pro ANC Earbuds',
    brand: 'NextMobile',
    category: 'accessories',
    tagline: 'Áudio espacial de estúdio 32-bit e cancelamento ativo de ruído de 48dB.',
    basePrice: 1499.00,
    pixDiscountPercent: 15,
    rating: 4.8,
    reviewCount: 204,
    inStock: true,
    freeShipping: true,
    image: '/images/acc_earbuds_pro_1794357054202.jpg',
    galleryImages: ['/images/acc_earbuds_pro_1794357054202.jpg'],
    colors: [
      { id: 'matte-titanium', name: 'Titânio Fosco', hex: '#63656b' },
      { id: 'pure-white', name: 'Branco Cerâmica', hex: '#f0f0f3' },
    ],
    capacities: [
      { size: 'Estojo Qi Wireless', priceDelta: 0 },
    ],
    specs: {
      processor: 'Processador de Sinal Digital (DSP) Hi-Res 32-bit',
      camera: '3 microfones beamforming por fone + sensor de condução óssea',
      screen: 'Drivers de Titânio Duplo de 11mm com áudio espacial 360°',
      battery: '9h de reprodução contínua (36h totais com estojo de recarga)',
      connectivity: 'Bluetooth 5.4, Codecs LDAC, LC3, AAC, Multipoint duplo',
      weight: '5.2 g por fone',
      os: 'Compatível com iOS, Android e Windows com pareamento rápido',
      extra: 'Cancelamento Ativo de Ruído (ANC) adaptativo de 48dB',
    },
    highlights: [
      'Drivers de titânio puro para agudos cristalinos e graves profundos',
      'Cancelamento de Ruído Adaptativo inteligente',
      'Estojo com carregamento por indução Qi e USB-C',
      'Classificação IP57 contra água e suor',
    ],
  },
];

export function calculatePixPrice(basePrice: number, discountPercent: number): number {
  return Number((basePrice * (1 - discountPercent / 100)).toFixed(2));
}

export function calculateInstallment(basePrice: number, installments = 12): number {
  return Number((basePrice / installments).toFixed(2));
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
