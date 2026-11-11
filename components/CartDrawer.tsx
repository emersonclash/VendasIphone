'use client';

import React from 'react';
import Image from 'next/image';
import {
  Product,
  calculatePixPrice,
  calculateInstallment,
  formatBRL,
} from '@/data/products';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';

export interface CartItem {
  id: string; // unique item cart id: `${productId}-${capacity}-${color}`
  product: Product;
  capacity: string;
  color: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CartDrawerProps) {
  const [couponCodeInput, setCouponCodeInput] = React.useState('');
  const [couponError, setCouponError] = React.useState('');

  if (!isOpen) return null;

  // Calculate totals
  const subtotalBase = items.reduce((sum, item) => {
    const capObj = item.product.capacities?.find((c) => c.size === item.capacity);
    const unitPrice = item.product.basePrice + (capObj?.priceDelta || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  // Pix total
  const pixSubtotal = items.reduce((sum, item) => {
    const capObj = item.product.capacities?.find((c) => c.size === item.capacity);
    const unitPrice = item.product.basePrice + (capObj?.priceDelta || 0);
    const unitPix = calculatePixPrice(unitPrice, item.product.pixDiscountPercent);
    return sum + unitPix * item.quantity;
  }, 0);

  // Coupon discount
  let couponDiscount = 0;
  if (appliedCoupon === 'NEXT10') {
    couponDiscount = pixSubtotal * 0.10;
  } else if (appliedCoupon === 'FLAGSHIP') {
    couponDiscount = Math.min(200, pixSubtotal);
  }

  const finalPixTotal = Math.max(0, pixSubtotal - couponDiscount);
  const totalSavings = subtotalBase - finalPixTotal;
  const installmentValue = calculateInstallment(subtotalBase, 12);

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const clean = couponCodeInput.trim().toUpperCase();
    if (!clean) return;

    const success = onApplyCoupon(clean);
    if (!success) {
      setCouponError('Cupom inválido. Tente NEXT10 ou FLAGSHIP.');
    } else {
      setCouponCodeInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Sua Sacola ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Alert Banner */}
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
          <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Frete Grátis Expresso</strong> liberado para este pedido!
          </span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Sua sacola está vazia</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Adicione smartphones e acessórios flagship para aproveitar 15% OFF no Pix.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                Explorar Modelos
              </button>
            </div>
          ) : (
            items.map((item) => {
              const capObj = item.product.capacities?.find((c) => c.size === item.capacity);
              const unitBase = item.product.basePrice + (capObj?.priceDelta || 0);
              const unitPix = calculatePixPrice(unitBase, item.product.pixDiscountPercent);
              const colorObj = item.product.colors.find((c) => c.id === item.color);

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex gap-3 relative"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      {item.capacity && <span>{item.capacity}</span>}
                      {item.capacity && colorObj && <span>·</span>}
                      {colorObj && (
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                            style={{ backgroundColor: colorObj.hex }}
                          />
                          <span>{colorObj.name}</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatBRL(unitPix * item.quantity)}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-1 rounded">
                        Pix
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 bg-white rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg cursor-pointer"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg cursor-pointer"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 text-xs transition-colors p-1"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            
            {/* Coupon Section */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCouponSubmit} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cupom (ex: NEXT10)"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600">{couponError}</p>
                )}
              </form>
            ) : (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Cupom {appliedCoupon} aplicado!
                </span>
                <button
                  onClick={onRemoveCoupon}
                  className="text-red-600 hover:underline font-semibold cursor-pointer text-[11px]"
                >
                  Remover
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal a prazo:</span>
                <span className="tabular-nums">{formatBRL(subtotalBase)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Desconto Pix (15%):</span>
                <span className="tabular-nums">-{formatBRL(subtotalBase - pixSubtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto cupom:</span>
                  <span className="tabular-nums">-{formatBRL(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Frete Expresso Segurado:</span>
                <span className="text-emerald-700 font-bold">Grátis</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Total no Pix:</div>
                  <div className="text-[11px] text-emerald-700">
                    Você economiza {formatBRL(totalSavings)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-[#0F172A] tabular-nums">
                    {formatBRL(finalPixTotal)}
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    ou 12x de {formatBRL(installmentValue)} s/ juros
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout CTA Button */}
            <button
              onClick={onProceedToCheckout}
              className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar para Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
