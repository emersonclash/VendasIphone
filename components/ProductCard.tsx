'use client';

import React from 'react';
import Image from 'next/image';
import {
  Product,
  calculatePixPrice,
  calculateInstallment,
  formatBRL,
} from '@/data/products';
import { ShoppingBag, ArrowUpRight, Scale, Check, Shield } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product, initialCapacity?: string, initialColor?: string) => void;
  onAddToCart: (product: Product, capacity: string, color: string) => void;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
}

export function ProductCard({
  product,
  onOpenDetails,
  onAddToCart,
  isCompared,
  onToggleCompare,
}: ProductCardProps) {
  // Local active color & capacity states
  const [selectedColor, setSelectedColor] = React.useState<string>(
    product.colors[0]?.id || ''
  );
  const [selectedCapacity, setSelectedCapacity] = React.useState<string>(
    product.capacities?.[0]?.size || ''
  );

  // Price calculations based on capacity delta
  const capacityObj = product.capacities?.find((c) => c.size === selectedCapacity);
  const currentBasePrice = product.basePrice + (capacityObj?.priceDelta || 0);
  const pixPrice = calculatePixPrice(currentBasePrice, product.pixDiscountPercent);
  const savings = currentBasePrice - pixPrice;
  const installmentValue = calculateInstallment(currentBasePrice, 12);

  const activeColorObj = product.colors.find((c) => c.id === selectedColor) || product.colors[0];

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#E2E8F0] hover:border-blue-300 transition-all duration-300 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.04),0_2px_6px_-1px_rgba(15,23,42,0.02)] hover:shadow-[0_12px_24px_-4px_rgba(15,23,42,0.08)] overflow-hidden">
      
      {/* Top Bar inside Card: Brand kicker + Compare affordance */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          {product.brand} · {product.specs.os.split(' ')[0]}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(product);
          }}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
            isCompared
              ? 'bg-blue-100 text-[#004ac6]'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Comparar ficha técnica deste modelo"
        >
          <Scale className="w-3 h-3" />
          <span>{isCompared ? 'Comparando' : 'Comparar'}</span>
        </button>
      </div>

      {/* Image Area: Neutral solid clean backdrop, 1:1 ratio, centered isolation */}
      <div
        onClick={() => onOpenDetails(product, selectedCapacity, selectedColor)}
        className="relative w-full aspect-square bg-[#F8FAFC] flex items-center justify-center p-6 cursor-pointer overflow-hidden"
      >
        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Floating Pix Discount Pill Tag */}
        <div className="absolute top-3 left-3 bg-emerald-500/10 border border-emerald-500/20 text-[#047857] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
          {product.pixDiscountPercent}% OFF NO PIX
        </div>
      </div>

      {/* Information Block & Interactive Selectors */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Title & Tagline */}
        <div>
          <h3
            onClick={() => onOpenDetails(product, selectedCapacity, selectedColor)}
            className="font-bold text-base text-[#0F172A] leading-snug line-clamp-2 cursor-pointer hover:text-[#2563EB] transition-colors"
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {product.tagline}
          </p>
        </div>

        {/* Color Swatches Selector: 28px diameter with active ring */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Cor:</span>
              <span className="font-medium text-slate-800">{activeColorObj?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {product.colors.map((color) => {
                const isActive = color.id === selectedColor;
                return (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`relative w-7 h-7 rounded-full transition-transform p-0.5 cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-offset-2 ring-[#2563EB] scale-105'
                        : 'hover:scale-110'
                    }`}
                    title={color.name}
                    aria-label={`Selecionar cor ${color.name}`}
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

        {/* Capacity Selector Chips (128GB, 256GB, 512GB, 1TB) */}
        {product.capacities && product.capacities.length > 1 && (
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-500">Armazenamento:</div>
            <div className="flex flex-wrap items-center gap-1.5">
              {product.capacities.map((cap) => {
                const isActive = cap.size === selectedCapacity;
                return (
                  <button
                    key={cap.size}
                    onClick={() => setSelectedCapacity(cap.size)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1D4ED8]'
                        : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {cap.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Hierarchy Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight tabular-nums">
              {formatBRL(pixPrice)}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              no Pix
            </span>
          </div>

          <div className="text-[12px] text-emerald-700 font-medium mt-0.5">
            Economize {formatBRL(savings)} à vista
          </div>

          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            ou 12x de <span className="font-semibold text-slate-700">{formatBRL(installmentValue)}</span> sem juros
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(product, selectedCapacity, selectedColor)}
            className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>

          <button
            onClick={() => onOpenDetails(product, selectedCapacity, selectedColor)}
            className="h-11 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1 active:scale-[0.98] shadow-xs cursor-pointer"
          >
            <span>Ver Detalhes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
