'use client';

import React from 'react';
import Image from 'next/image';
import {
  Product,
  calculatePixPrice,
  calculateInstallment,
  formatBRL,
} from '@/data/products';
import { CartItem } from './CartDrawer';
import {
  X,
  ShieldCheck,
  Check,
  Copy,
  Clock,
  CreditCard,
  QrCode,
  ArrowRight,
  Package,
  Truck,
  Download,
  AlertCircle,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedCoupon: string | null;
  onClearCart: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  appliedCoupon,
  onClearCart,
}: CheckoutModalProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = React.useState<'pix' | 'credit_card'>('pix');
  const [copiedPix, setCopiedPix] = React.useState(false);
  const [pixTimeRemaining, setPixTimeRemaining] = React.useState(900); // 15 mins
  const [orderNumber, setOrderNumber] = React.useState('');

  // Form states
  const [formData, setFormData] = React.useState({
    fullName: 'Carlos Eduardo Silveira',
    cpf: '349.812.908-11',
    email: 'carlos.silveira@gmail.com',
    phone: '(11) 98452-3321',
    cep: '01310-100',
    street: 'Avenida Paulista',
    number: '1578',
    complement: 'Apto 124',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  });

  // Credit card form states
  const [cardData, setCardData] = React.useState({
    cardNumber: '4532 •••• •••• 8821',
    cardName: 'CARLOS E SILVEIRA',
    cardExpiry: '09/29',
    cardCvv: '832',
    installments: 12,
  });

  // Pix countdown timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && paymentMethod === 'pix' && pixTimeRemaining > 0) {
      timer = setInterval(() => {
        setPixTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, paymentMethod, pixTimeRemaining]);

  if (!isOpen) return null;

  // Calculate totals
  const subtotalBase = items.reduce((sum, item) => {
    const capObj = item.product.capacities?.find((c) => c.size === item.capacity);
    const unitPrice = item.product.basePrice + (capObj?.priceDelta || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  const pixSubtotal = items.reduce((sum, item) => {
    const capObj = item.product.capacities?.find((c) => c.size === item.capacity);
    const unitPrice = item.product.basePrice + (capObj?.priceDelta || 0);
    const unitPix = calculatePixPrice(unitPrice, item.product.pixDiscountPercent);
    return sum + unitPix * item.quantity;
  }, 0);

  let couponDiscount = 0;
  if (appliedCoupon === 'NEXT10') {
    couponDiscount = pixSubtotal * 0.10;
  } else if (appliedCoupon === 'FLAGSHIP') {
    couponDiscount = Math.min(200, pixSubtotal);
  }

  const finalPixTotal = Math.max(0, pixSubtotal - couponDiscount);
  const cardTotal = Math.max(0, subtotalBase - (appliedCoupon === 'FLAGSHIP' ? 200 : 0));
  const cardInstallmentValue = calculateInstallment(cardTotal, cardData.installments);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pixCopyPasteCode = `00020126580014br.gov.bcb.pix0136nextmobile-flagship-pix-${Math.floor(
    finalPixTotal * 100
  )}520400005303986540${finalPixTotal.toFixed(2)}5802BR5925NEXTMOBILE COMERCIO S/A6009SAO PAULO62070503***6304E8A9`;

  const handleCopyPix = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(pixCopyPasteCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleCompleteOrder = () => {
    const generatedOrder = `NX-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderNumber(generatedOrder);
    setStep(3);
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-none sm:rounded-2xl border border-slate-200 shadow-2xl min-h-screen sm:min-h-0 max-h-none sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Header with Steps */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Checkout Seguro 256-Bit SSL
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {step === 1 && '1. Endereço & Dados de Entrega'}
              {step === 2 && '2. Escolha a Forma de Pagamento'}
              {step === 3 && 'Pedido Concluído com Sucesso!'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* STEP 1: Address & Customer Form */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CPF (Para Nota Fiscal)
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    E-mail para Rastreio
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefone Celular / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UF</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method summary */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950">
                      Entrega Expresso Segurada NextMobile
                    </div>
                    <div className="text-emerald-700">
                      Previsão de 1 a 2 dias úteis com seguro total contra roubo/extravio
                    </div>
                  </div>
                </div>
                <div className="font-bold text-emerald-800 text-sm">GRÁTIS</div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Payment selector tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'border-[#10B981] bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-sm">Pix Instantâneo</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      15% OFF
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-emerald-900 tabular-nums">
                    {formatBRL(finalPixTotal)}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Aprovação imediata em segundos
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">Cartão de Crédito</span>
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-slate-900 tabular-nums">
                    {formatBRL(cardTotal)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Até 12x sem juros de {formatBRL(calculateInstallment(cardTotal, 12))}
                  </div>
                </button>
              </div>

              {/* PIX Flow */}
              {paymentMethod === 'pix' && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6 text-center">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Tempo restante para pagar: {formatTimer(pixTimeRemaining)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 pt-2">
                      Escaneie o QR Code abaixo no app do seu banco
                    </h3>
                    <p className="text-xs text-slate-500">
                      O pagamento é compensado na hora e seu pedido é separado imediatamente.
                    </p>
                  </div>

                  {/* Clean SVG QR Code Representation */}
                  <div className="inline-block p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <svg
                      className="w-48 h-48 mx-auto"
                      viewBox="0 0 200 200"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Outer border & alignment squares */}
                      <rect x="10" y="10" width="50" height="50" rx="4" fill="#0F172A" />
                      <rect x="18" y="18" width="34" height="34" rx="2" fill="white" />
                      <rect x="25" y="25" width="20" height="20" rx="2" fill="#0F172A" />

                      <rect x="140" y="10" width="50" height="50" rx="4" fill="#0F172A" />
                      <rect x="148" y="18" width="34" height="34" rx="2" fill="white" />
                      <rect x="155" y="25" width="20" height="20" rx="2" fill="#0F172A" />

                      <rect x="10" y="140" width="50" height="50" rx="4" fill="#0F172A" />
                      <rect x="18" y="148" width="34" height="34" rx="2" fill="white" />
                      <rect x="25" y="155" width="20" height="20" rx="2" fill="#0F172A" />

                      {/* Random authentic QR matrix dots */}
                      <rect x="70" y="15" width="10" height="10" fill="#0F172A" />
                      <rect x="90" y="15" width="10" height="10" fill="#0F172A" />
                      <rect x="110" y="15" width="10" height="10" fill="#0F172A" />
                      <rect x="70" y="35" width="20" height="10" fill="#0F172A" />
                      <rect x="100" y="35" width="10" height="20" fill="#0F172A" />
                      <rect x="120" y="35" width="10" height="10" fill="#0F172A" />

                      <rect x="15" y="70" width="10" height="20" fill="#0F172A" />
                      <rect x="35" y="70" width="20" height="10" fill="#0F172A" />
                      <rect x="15" y="100" width="20" height="10" fill="#0F172A" />
                      <rect x="45" y="95" width="10" height="15" fill="#0F172A" />

                      <rect x="70" y="70" width="15" height="15" fill="#2563EB" />
                      <rect x="95" y="70" width="20" height="10" fill="#0F172A" />
                      <rect x="125" y="70" width="15" height="15" fill="#0F172A" />
                      <rect x="70" y="95" width="25" height="10" fill="#0F172A" />
                      <rect x="105" y="90" width="10" height="20" fill="#2563EB" />
                      <rect x="125" y="95" width="20" height="15" fill="#0F172A" />

                      <rect x="150" y="70" width="20" height="10" fill="#0F172A" />
                      <rect x="180" y="75" width="10" height="25" fill="#0F172A" />
                      <rect x="150" y="95" width="15" height="15" fill="#0F172A" />

                      <rect x="70" y="125" width="15" height="20" fill="#0F172A" />
                      <rect x="95" y="125" width="20" height="10" fill="#0F172A" />
                      <rect x="125" y="125" width="10" height="20" fill="#0F172A" />
                      <rect x="70" y="155" width="25" height="15" fill="#0F172A" />
                      <rect x="105" y="150" width="10" height="20" fill="#2563EB" />
                      <rect x="125" y="155" width="20" height="15" fill="#0F172A" />
                      <rect x="155" y="145" width="30" height="15" fill="#0F172A" />
                      <rect x="165" y="170" width="20" height="15" fill="#0F172A" />
                    </svg>
                  </div>

                  {/* Pix Copia e Cola */}
                  <div className="space-y-2 max-w-md mx-auto">
                    <div className="text-xs text-slate-600 font-semibold text-left">
                      Ou utilize o código Pix Copia e Cola:
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixCopyPasteCode}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11px] text-slate-600 truncate focus:outline-none"
                      />
                      <button
                        onClick={handleCopyPix}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action to simulate confirmation */}
                  <div className="pt-2">
                    <button
                      onClick={handleCompleteOrder}
                      className="w-full max-w-md mx-auto h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmar Pagamento Pix Realizado</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Credit Card Flow */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardNumber: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nome Impresso no Cartão
                      </label>
                      <input
                        type="text"
                        value={cardData.cardName}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardName: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        value={cardData.cardExpiry}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardExpiry: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Código CVV
                      </label>
                      <input
                        type="text"
                        value={cardData.cardCvv}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardCvv: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Número de Parcelas
                      </label>
                      <select
                        value={cardData.installments}
                        onChange={(e) =>
                          setCardData({ ...cardData, installments: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 6, 8, 10, 12].map((p) => (
                          <option key={p} value={p}>
                            {p}x de {formatBRL(calculateInstallment(cardTotal, p))} sem juros
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteOrder}
                    className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Concluir Pedido no Cartão ({formatBRL(cardTotal)})</span>
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  ← Voltar para endereço
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Order Completed & Receipt */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Pagamento Confirmado Instantaneamente
                </span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] mt-1">
                  Pedido {orderNumber} Aprovado!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enviamos o comprovante oficial e a Nota Fiscal para{' '}
                  <strong className="text-slate-700">{formData.email}</strong>.
                </p>
              </div>

              {/* Order Status Timeline */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3">
                <div className="text-xs font-bold text-slate-900">
                  Status da Entrega Expressa:
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto text-xs">
                      ✓
                    </div>
                    <div className="font-semibold text-emerald-700">Aprovado</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto text-xs">
                      2
                    </div>
                    <div className="font-semibold text-blue-700">Separação</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center mx-auto text-xs">
                      3
                    </div>
                    <div className="text-slate-400">Em Trânsito</div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center mx-auto text-xs">
                      4
                    </div>
                    <div className="text-slate-400">Entregue</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Código de Rastreamento Correios:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {orderNumber}BR
                  </span>
                </div>
              </div>

              {/* Delivery destination summary */}
              <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left">
                <strong>Destinatário:</strong> {formData.fullName} <br />
                <strong>Endereço:</strong> {formData.street}, {formData.number} - {formData.complement}, {formData.neighborhood}, {formData.city}/{formData.state} - CEP {formData.cep}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="h-11 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Voltar à Página Principal
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
