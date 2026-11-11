'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Zap, Truck, CreditCard, Sparkles } from 'lucide-react';
import { Product } from '@/data/products';

interface HeroSpotlightProps {
  onSelectFeatured: (product: Product) => void;
  featuredProduct: Product;
  onExploreCatalog: () => void;
  onOpenTradeIn: () => void;
}

export function HeroSpotlight({
  onSelectFeatured,
  featuredProduct,
  onExploreCatalog,
  onOpenTradeIn,
}: HeroSpotlightProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC] border-b border-[#E2E8F0] pt-6 sm:pt-10 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Editorial Presentation */}
          <div className="lg:col-span-7 space-y-5">
            {/* Context kicker without pill enclosing */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-600">
              <span>NextMobile Flagship Experience</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-600 font-bold">Edição 2025/2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-[1.15] text-balance">
              O Próximo Salto Tecnológico{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004ac6] to-[#2563eb]">
                Começa Aqui.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Curadoria rigorosa dos smartphones e dispositivos conectados de última geração. 
              Desfrute de precisão minimalista, titânio aeroespacial e economias reais de até{' '}
              <strong className="text-emerald-700 font-semibold">15% à vista no Pix</strong>{' '}
              ou parcelamento em <strong className="text-slate-800 font-semibold">12x sem juros</strong> com seguro de transporte integral.
            </p>

            {/* Conversion CTA Group */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectFeatured(featuredProduct)}
                className="h-12 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 group cursor-pointer"
              >
                <span>Ver Lançamento em Destaque</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenTradeIn}
                className="h-12 px-5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>NextTrade (Troque seu usado)</span>
              </button>
            </div>

            {/* Editorial Quick Specs Strip */}
            <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-3">
              <span>Titânio Grau 5</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span>Chips 3nm N2</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span>Telas LTPO 120Hz 3000 nits</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span>IA Generativa On-Device</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <Image
                src="/images/hero_flagship_phones_1794357021828.jpg"
                alt="Smartphones Flagship Titanium em estúdio"
                fill
                priority
                className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />

              {/* Discreet overlay badge for featured device */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-3 shadow-md flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Destaque da Temporada
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {featuredProduct.name}
                  </div>
                </div>
                <button
                  onClick={() => onSelectFeatured(featuredProduct)}
                  className="px-3 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Conferir
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Full-width 4-Column Proof & Trust Strip below Hero */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">15% OFF no Pix</div>
              <div className="text-[11px] text-slate-500">Desconto aplicado instantaneamente</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">12x Sem Juros</div>
              <div className="text-[11px] text-slate-500">Em até 2 cartões de crédito</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">12 Meses Garantia</div>
              <div className="text-[11px] text-slate-500">Aparelhos 100% originais homologados</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Entrega Segurada</div>
              <div className="text-[11px] text-slate-500">Frete grátis expresso com rastreio</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
