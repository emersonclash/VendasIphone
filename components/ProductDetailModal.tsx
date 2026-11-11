'use client';

import React from 'react';
import Image from 'next/image';
import {
  Product,
  calculatePixPrice,
  calculateInstallment,
  formatBRL,
} from '@/data/products';
import {
  X,
  Truck,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Cpu,
  Camera,
  Smartphone,
  Battery,
  Wifi,
  Scale,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  initialCapacity?: string;
  initialColor?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, capacity: string, color: string) => void;
  onInstantBuy: (product: Product, capacity: string, color: string) => void;
  onToggleCompare: (product: Product) => void;
  isCompared: boolean;
}

export function ProductDetailModal({
  product,
  initialCapacity,
  initialColor,
  isOpen,
  onClose,
  onAddToCart,
  onInstantBuy,
  onToggleCompare,
  isCompared,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  return (
    <ProductDetailModalInner
      key={`${product.id}-${initialCapacity || ''}-${initialColor || ''}`}
      product={product}
      initialCapacity={initialCapacity}
      initialColor={initialColor}
      onClose={onClose}
      onAddToCart={onAddToCart}
      onInstantBuy={onInstantBuy}
      onToggleCompare={onToggleCompare}
      isCompared={isCompared}
    />
  );
}

interface InnerProps {
  product: Product;
  initialCapacity?: string;
  initialColor?: string;
  onClose: () => void;
  onAddToCart: (product: Product, capacity: string, color: string) => void;
  onInstantBuy: (product: Product, capacity: string, color: string) => void;
  onToggleCompare: (product: Product) => void;
  isCompared: boolean;
}

function ProductDetailModalInner({
  product,
  initialCapacity,
  initialColor,
  onClose,
  onAddToCart,
  onInstantBuy,
  onToggleCompare,
  isCompared,
}: InnerProps) {
  const [selectedCapacity, setSelectedCapacity] = React.useState<string>(
    initialCapacity || product.capacities?.[0]?.size || ''
  );
  const [selectedColor, setSelectedColor] = React.useState<string>(
    initialColor || product.colors[0]?.id || ''
  );
  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0);
  const [showInstallmentsTable, setShowInstallmentsTable] = React.useState<boolean>(false);

  // CEP calculator state
  const [cepInput, setCepInput] = React.useState('');
  const [cepResult, setCepResult] = React.useState<{ days: number; price: string } | null>(null);

  // Price calculations
  const capacityObj = product.capacities?.find((c) => c.size === selectedCapacity);
  const currentBasePrice = product.basePrice + (capacityObj?.priceDelta || 0);
  const pixPrice = calculatePixPrice(currentBasePrice, product.pixDiscountPercent);
  const savings = currentBasePrice - pixPrice;
  const installmentValue = calculateInstallment(currentBasePrice, 12);

  const activeColorObj =
    product.colors.find((c) => c.id === selectedColor) || product.colors[0];

  const handleCalculateCep = (e: React.FormEvent) => {
    e.preventDefault();
    if (cepInput.trim().length >= 8) {
      setCepResult({
        days: 2,
        price: 'Grátis (Expresso Segurado)',
      });
    }
  };

  const handleApplyPresetCep = (preset: string) => {
    setCepInput(preset);
    setCepResult({
      days: 1,
      price: 'Grátis (Sedex Prioritário NextMobile)',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      {/* Container / Modal Card */}
      <div className="relative w-full max-w-5xl bg-white rounded-none sm:rounded-2xl border border-slate-200 shadow-2xl min-h-screen sm:min-h-0 max-h-none sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>Flagship Original Homologado</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(product)}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                isCompared
                  ? 'bg-blue-100 text-[#004ac6]'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Comparar ficha técnica"
            >
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isCompared ? 'Comparando' : 'Comparar'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-32 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery Column (Sticky left on desktop) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative w-full aspect-square bg-[#F8FAFC] rounded-2xl border border-slate-200 flex items-center justify-center p-8 overflow-hidden">
                <Image
                  src={product.galleryImages[activeImageIndex] || product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-4"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute top-4 left-4 bg-emerald-500/10 border border-emerald-500/20 text-[#047857] text-xs font-bold px-3 py-1 rounded-full">
                  {product.pixDiscountPercent}% OFF NO PIX
                </div>
              </div>

              {/* Thumbnails */}
              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="flex items-center gap-3">
                  {product.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl border bg-slate-50 overflow-hidden cursor-pointer transition-all ${
                        activeImageIndex === idx
                          ? 'border-2 border-[#2563EB] ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} foto ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Security & Warranty Trust Block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Garantia Nacional e Procedência Oficial</span>
                </div>
                <p>
                  Aparelho novo, lacrado de fábrica com nota fiscal eletrônica nominal e 12 meses de garantia oficial direta com o fabricante.
                </p>
              </div>
            </div>

            {/* Purchase Details Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Product Headline */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                  {product.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-normal">
                  {product.tagline}
                </p>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <div className="flex items-center text-amber-500">
                    {'★'.repeat(5)}
                  </div>
                  <span className="font-semibold text-slate-800">{product.rating}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.reviewCount} avaliações de compradores verificados</span>
                </div>
              </div>

              {/* Price Block strictly following spec */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/40 to-slate-50 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight tabular-nums">
                    {formatBRL(pixPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {product.pixDiscountPercent}% de Desconto no Pix
                  </span>
                </div>

                <div className="text-sm font-semibold text-emerald-700">
                  Economize {formatBRL(savings)} pagando à vista via Pix
                </div>

                <div className="text-sm text-slate-600 pt-1 flex items-center justify-between">
                  <span>
                    ou 12x de <strong className="text-slate-900 font-semibold">{formatBRL(installmentValue)}</strong> sem juros
                  </span>
                  <button
                    onClick={() => setShowInstallmentsTable(!showInstallmentsTable)}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    {showInstallmentsTable ? 'Ocultar parcelas' : 'Ver parcelamento'}
                  </button>
                </div>

                {/* Expanded installments schedule table */}
                {showInstallmentsTable && (
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[1, 2, 3, 6, 10, 12].map((parc) => (
                      <div
                        key={parc}
                        className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700"
                      >
                        <span className="font-bold">{parc}x</span> de{' '}
                        <span className="font-semibold text-slate-900">
                          {formatBRL(calculateInstallment(currentBasePrice, parc))}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-medium">sem juros</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Cor selecionada:</span>
                    <span className="font-bold text-slate-900">{activeColorObj?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => {
                      const isActive = color.id === selectedColor;
                      return (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color.id)}
                          className={`relative w-8 h-8 rounded-full transition-transform p-0.5 cursor-pointer ${
                            isActive
                              ? 'ring-2 ring-offset-2 ring-[#2563EB] scale-105'
                              : 'hover:scale-110 opacity-80 hover:opacity-100'
                          }`}
                          title={color.name}
                        >
                          <span
                            className="block w-full h-full rounded-full border border-slate-300 shadow-inner"
                            style={{ backgroundColor: color.hex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Capacity Selector */}
              {product.capacities && product.capacities.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-600 font-medium">
                    Capacidade de Armazenamento:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {product.capacities.map((cap) => {
                      const isActive = cap.size === selectedCapacity;
                      return (
                        <button
                          key={cap.size}
                          onClick={() => setSelectedCapacity(cap.size)}
                          className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1D4ED8] shadow-xs'
                              : 'bg-white border border-[#E2E8F0] text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div>{cap.size}</div>
                          {cap.priceDelta > 0 ? (
                            <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                              +{formatBRL(cap.priceDelta)}
                            </div>
                          ) : (
                            <div className="text-[10px] font-normal text-emerald-600 mt-0.5">
                              Padrão
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CEP / Shipping Calculator */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Truck className="w-4 h-4 text-slate-600" />
                  <span>Calcular Frete e Prazo de Entrega:</span>
                </div>

                <form onSubmit={handleCalculateCep} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="Ex: 01310-100"
                    value={cepInput}
                    onChange={(e) => setCepInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Calcular
                  </button>
                </form>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Capitais:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetCep('01310-100')}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    São Paulo
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetCep('20040-002')}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Rio de Janeiro
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetCep('70040-010')}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Brasília
                  </button>
                </div>

                {cepResult && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                    <span>
                      Chega em até <strong>{cepResult.days} dias úteis</strong>
                    </span>
                    <strong className="text-emerald-900">{cepResult.price}</strong>
                  </div>
                )}
              </div>

              {/* Desktop Conversion Buttons */}
              <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => onAddToCart(product, selectedCapacity, selectedColor)}
                  className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar à Sacola</span>
                </button>

                <button
                  onClick={() => onInstantBuy(product, selectedCapacity, selectedColor)}
                  className="h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Comprar Agora no Pix</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Quick Specifications Table */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span>Ficha Técnica Oficial</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70">
                <div className="sm:col-span-4 font-semibold text-slate-600 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-500" />
                  <span>Processador & Desempenho</span>
                </div>
                <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                  {product.specs.processor}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-white">
                <div className="sm:col-span-4 font-semibold text-slate-600 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Sistema de Câmeras</span>
                </div>
                <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                  {product.specs.camera}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70">
                <div className="sm:col-span-4 font-semibold text-slate-600 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span>Tela & Display</span>
                </div>
                <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                  {product.specs.screen}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-white">
                <div className="sm:col-span-4 font-semibold text-slate-600 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-slate-500" />
                  <span>Bateria & Autonomia</span>
                </div>
                <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                  {product.specs.battery}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70">
                <div className="sm:col-span-4 font-semibold text-slate-600 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-slate-500" />
                  <span>Conectividade & Sensores</span>
                </div>
                <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                  {product.specs.connectivity}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-white">
                <div className="sm:col-span-4 font-semibold text-slate-600 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-500" />
                  <span>Peso & Ergonomia</span>
                </div>
                <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                  {product.specs.weight}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70">
                <div className="sm:col-span-4 font-semibold text-slate-600">
                  <span>Sistema & Atualizações</span>
                </div>
                <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                  {product.specs.os}
                </div>
              </div>

              {product.specs.extra && (
                <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-white">
                  <div className="sm:col-span-4 font-semibold text-slate-600">
                    <span>Recursos Especiais</span>
                  </div>
                  <div className="sm:col-span-8 font-medium text-slate-900 mt-1 sm:mt-0">
                    {product.specs.extra}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Floating Bottom Action Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg safe-bottom">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-700">
                {product.pixDiscountPercent}% OFF Pix
              </div>
              <div className="text-base font-extrabold text-[#0F172A] tabular-nums leading-tight">
                {formatBRL(pixPrice)}
              </div>
              <div className="text-[10px] text-slate-500">
                12x de {formatBRL(installmentValue)}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                onClick={() => onAddToCart(product, selectedCapacity, selectedColor)}
                className="h-11 px-3 rounded-xl bg-slate-100 active:scale-[0.98] text-slate-800 text-xs font-bold"
                aria-label="Adicionar à sacola"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>

              <button
                onClick={() => onInstantBuy(product, selectedCapacity, selectedColor)}
                className="h-11 px-4 rounded-xl bg-[#2563EB] active:scale-[0.98] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 flex-1"
              >
                <span>Comprar Pix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
