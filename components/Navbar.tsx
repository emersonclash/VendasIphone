'use client';

import React from 'react';
import { ShoppingBag, Search, Sparkles, Scale, RefreshCw, Menu, X } from 'lucide-react';
import { Product } from '@/data/products';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  compareList: Product[];
  onOpenCompare: () => void;
  onOpenTradeIn: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function Navbar({
  cartCount,
  onOpenCart,
  compareList,
  onOpenCompare,
  onOpenTradeIn,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showSearchInput, setShowSearchInput] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
      {/* Top micro-bar */}
      <div className="bg-[#0F172A] text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline text-slate-300">
            NextMobile Flagship Store Oficial
          </span>
          <div className="flex items-center justify-center gap-4 mx-auto sm:mx-0">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              15% OFF à vista no Pix
            </span>
            <span className="text-slate-400 hidden md:inline">·</span>
            <span className="text-slate-300 hidden md:inline">Frete Grátis Expresso Capitais</span>
            <span className="text-slate-400 hidden md:inline">·</span>
            <span className="text-slate-300 hidden md:inline">12x Sem Juros</span>
          </div>
          <button
            onClick={onOpenTradeIn}
            className="hidden lg:flex items-center gap-1 text-blue-300 hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" />
            <span>Simular Troca Fone (NextTrade)</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) — Zone 2 (Nav Links) — Zone 3 (Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0F172A] leading-tight">
                Next<span className="text-[#2563EB]">Mobile</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Flagship Store
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectCategory('all')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0F172A] ${
              activeCategory === 'all'
                ? 'text-[#2563EB] font-semibold border-b-2 border-[#2563EB] pb-0.5'
                : ''
            }`}
          >
            Todos os Modelos
          </button>
          <button
            onClick={() => onSelectCategory('smartphones')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0F172A] ${
              activeCategory === 'smartphones'
                ? 'text-[#2563EB] font-semibold border-b-2 border-[#2563EB] pb-0.5'
                : ''
            }`}
          >
            Smartphones
          </button>
          <button
            onClick={() => onSelectCategory('foldables')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0F172A] ${
              activeCategory === 'foldables'
                ? 'text-[#2563EB] font-semibold border-b-2 border-[#2563EB] pb-0.5'
                : ''
            }`}
          >
            Dobráveis Ultra
          </button>
          <button
            onClick={() => onSelectCategory('accessories')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0F172A] ${
              activeCategory === 'accessories'
                ? 'text-[#2563EB] font-semibold border-b-2 border-[#2563EB] pb-0.5'
                : ''
            }`}
          >
            Acessórios Titânio
          </button>
          <button
            onClick={onOpenTradeIn}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>NextTrade</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Search, Compare & Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-300 w-44 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-1.5" />
                <input
                  type="text"
                  placeholder="Buscar modelo..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    onSearchChange('');
                  }}
                  className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Pesquisar smartphone"
                aria-label="Pesquisar smartphone"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Comparador trigger button */}
          <button
            onClick={onOpenCompare}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            title="Comparador de Modelos"
            aria-label="Comparar aparelhos"
          >
            <Scale className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#004ac6] text-white text-[10px] font-bold flex items-center justify-center">
                {compareList.length}
              </span>
            )}
            <span className="hidden xl:inline text-xs font-medium text-slate-700">
              Comparar ({compareList.length})
            </span>
          </button>

          {/* Shopping Cart button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white px-3.5 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-sm"
            aria-label="Abrir sacola de compras"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Sacola</span>
            <span className="w-5 h-5 rounded-full bg-white text-[#2563EB] text-xs font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile expandable menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Categorias
          </div>
          <button
            onClick={() => {
              onSelectCategory('all');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
              activeCategory === 'all' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            Todos os Modelos Flagship
          </button>
          <button
            onClick={() => {
              onSelectCategory('smartphones');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
              activeCategory === 'smartphones' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            Smartphones
          </button>
          <button
            onClick={() => {
              onSelectCategory('foldables');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
              activeCategory === 'foldables' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            Dobráveis Ultra
          </button>
          <button
            onClick={() => {
              onSelectCategory('accessories');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
              activeCategory === 'accessories' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
            }`}
          >
            Acessórios Titânio
          </button>
          <button
            onClick={() => {
              onOpenTradeIn();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-blue-600 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>NextTrade (Avaliar Meu Aparelho)</span>
          </button>
        </div>
      )}
    </header>
  );
}
