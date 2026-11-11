'use client';

import React from 'react';
import { PRODUCTS, Product, formatBRL } from '@/data/products';
import { Navbar } from '@/components/Navbar';
import { HeroSpotlight } from '@/components/HeroSpotlight';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer, CartItem } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { DeviceComparatorModal } from '@/components/DeviceComparatorModal';
import { NextTradeModal } from '@/components/NextTradeModal';
import { Footer } from '@/components/Footer';
import { Filter, SlidersHorizontal, ArrowUpDown, ShoppingBag, Check } from 'lucide-react';

export default function HomePage() {
  // Navigation & Filter States
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [selectedBrand, setSelectedBrand] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'popular' | 'price_asc' | 'price_desc' | 'discount'>('popular');

  // Modals & Drawers States
  const [cartOpen, setCartOpen] = React.useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState<boolean>(false);
  const [compareOpen, setCompareOpen] = React.useState<boolean>(false);
  const [tradeInOpen, setTradeInOpen] = React.useState<boolean>(false);

  // Selected Product for PDP
  const [pdpProduct, setPdpProduct] = React.useState<Product | null>(null);
  const [pdpInitialCapacity, setPdpInitialCapacity] = React.useState<string | undefined>(undefined);
  const [pdpInitialColor, setPdpInitialColor] = React.useState<string | undefined>(undefined);

  // Cart & Compare Data
  const [cartItems, setCartItems] = React.useState<CartItem[]>([
    {
      id: 'samsung-galaxy-s25-ultra-256GB-titanium-black',
      product: PRODUCTS[0],
      capacity: '256GB',
      color: 'titanium-black',
      quantity: 1,
    },
  ]);
  const [compareList, setCompareList] = React.useState<Product[]>([PRODUCTS[0], PRODUCTS[1]]);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, capacity: string, color: string) => {
    const finalCapacity = capacity || product.capacities?.[0]?.size || '';
    const finalColor = color || product.colors[0]?.id || '';
    const itemId = `${product.id}-${finalCapacity}-${finalColor}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          capacity: finalCapacity,
          color: finalColor,
          quantity: 1,
        },
      ];
    });

    showToast(`"${product.name}" adicionado à sacola!`);
  };

  const handleInstantBuy = (product: Product, capacity: string, color: string) => {
    handleAddToCart(product, capacity, color);
    setPdpProduct(null);
    setCheckoutOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Compare Handlers
  const handleToggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removido do comparador`);
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        showToast('Máximo de 3 aparelhos para comparação.');
        return prev;
      }
      showToast(`Adicionado ao comparador (${prev.length + 1}/3)`);
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  // Coupon Handlers
  const handleApplyCoupon = (code: string) => {
    if (code === 'NEXT10' || code === 'FLAGSHIP') {
      setAppliedCoupon(code);
      showToast(`Cupom ${code} aplicado com sucesso!`);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Cupom removido.');
  };

  const handleApplyTradeInDiscount = (amount: number) => {
    setAppliedCoupon('FLAGSHIP');
    showToast(`Voucher de ${formatBRL(amount)} aplicado via NextTrade!`);
  };

  // Open PDP
  const handleOpenDetails = (product: Product, capacity?: string, color?: string) => {
    setPdpProduct(product);
    setPdpInitialCapacity(capacity);
    setPdpInitialColor(color);
  };

  // Filter & Search Logic
  const filteredProducts = PRODUCTS.filter((product) => {
    // Category filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'smartphones' && product.category !== 'smartphones') return false;
      if (activeCategory === 'foldables' && product.category !== 'foldables') return false;
      if (activeCategory === 'accessories' && product.category !== 'accessories') return false;
    }

    // Brand filter
    if (selectedBrand !== 'all' && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchTagline = product.tagline.toLowerCase().includes(q);
      const matchSpecs = product.specs.processor.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchTagline && !matchSpecs) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price_desc') return b.basePrice - a.basePrice;
    if (sortBy === 'discount') return b.pixDiscountPercent - a.pixDiscountPercent;
    return b.reviewCount - a.reviewCount; // popular
  });

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#0F172A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setCartOpen(true)}
        compareList={compareList}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenTradeIn={() => setTradeInOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Hero Campaign Spotlight */}
      <HeroSpotlight
        featuredProduct={PRODUCTS[0]} // Samsung Galaxy S25 Ultra
        onSelectFeatured={(p) => handleOpenDetails(p)}
        onExploreCatalog={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTradeIn={() => setTradeInOpen(true)}
      />

      {/* Catalog & Filter Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Section Headline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Vitrine Oficial
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Modelos em Destaque
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'dispositivo disponível' : 'dispositivos disponíveis'}{' '}
              com envio imediato e 15% OFF no Pix.
            </p>
          </div>

          {/* Interactive Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Ordenar por:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
              >
                <option value="popular">Mais Populares</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="discount">Maior Desconto Pix</option>
              </select>
            </div>
          </div>
        </div>

        {/* Brand Segmented Controls & Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          {/* Brand Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'Todas as Marcas' },
              { id: 'Apple', label: 'Apple' },
              { id: 'Samsung', label: 'Samsung' },
              { id: 'Google', label: 'Google Pixel' },
              { id: 'NextMobile', label: 'Acessórios NextMobile' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBrand(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedBrand === b.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Active Search indicator */}
          {searchQuery && (
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <span>Resultados para: <strong>&ldquo;{searchQuery}&rdquo;</strong></span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:underline font-semibold text-xs ml-1 cursor-pointer"
              >
                Limpar
              </button>
            </div>
          )}
        </div>

        {/* Product Grid: 3 columns desktop, 2 columns tablet, 1 column mobile */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-slate-800">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Não encontramos nenhum smartphone correspondente ao filtro aplicado. Tente buscar por outros termos ou marcas.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Restaurar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={handleOpenDetails}
                onAddToCart={handleAddToCart}
                isCompared={compareList.some((p) => p.id === product.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        )}

      </main>

      {/* Floating Cart Reminder Bar on Mobile (when cart has items) */}
      {cartItems.length > 0 && !cartOpen && !checkoutOpen && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-30 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full h-12 bg-[#0F172A] hover:bg-slate-800 text-white rounded-2xl shadow-xl px-4 flex items-center justify-between border border-slate-700"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center">
                {cartTotalCount}
              </div>
              <span className="text-xs font-semibold">Ver Sacola</span>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              15% OFF no Pix ativo →
            </span>
          </button>
        </div>
      )}

      {/* PDP Modal */}
      <ProductDetailModal
        product={pdpProduct}
        initialCapacity={pdpInitialCapacity}
        initialColor={pdpInitialColor}
        isOpen={Boolean(pdpProduct)}
        onClose={() => setPdpProduct(null)}
        onAddToCart={handleAddToCart}
        onInstantBuy={handleInstantBuy}
        onToggleCompare={handleToggleCompare}
        isCompared={Boolean(pdpProduct && compareList.some((p) => p.id === pdpProduct.id))}
      />

      {/* Cart Slide-over Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        appliedCoupon={appliedCoupon}
        onClearCart={() => setCartItems([])}
      />

      {/* Device Comparator Modal */}
      <DeviceComparatorModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onSelectProduct={handleOpenDetails}
      />

      {/* NextTrade Modal */}
      <NextTradeModal
        isOpen={tradeInOpen}
        onClose={() => setTradeInOpen(false)}
        onApplyTradeInDiscount={handleApplyTradeInDiscount}
      />

      {/* Quiet Footer */}
      <Footer />

    </div>
  );
}
