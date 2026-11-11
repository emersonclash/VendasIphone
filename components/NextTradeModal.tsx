'use client';

import React from 'react';
import { X, RefreshCw, CheckCircle, ArrowRight, Smartphone, Sparkles } from 'lucide-react';
import { formatBRL } from '@/data/products';

interface NextTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTradeInDiscount: (amount: number) => void;
}

const TRADE_IN_DEVICES = [
  { id: 'ip15pm', brand: 'Apple', model: 'iPhone 15 Pro Max 256GB', maxValue: 4900 },
  { id: 'ip15p', brand: 'Apple', model: 'iPhone 15 Pro 128GB', maxValue: 4100 },
  { id: 'ip14pm', brand: 'Apple', model: 'iPhone 14 Pro Max 128GB', maxValue: 3500 },
  { id: 'ip13pm', brand: 'Apple', model: 'iPhone 13 Pro Max 128GB', maxValue: 2700 },
  { id: 's24u', brand: 'Samsung', model: 'Galaxy S24 Ultra 256GB', maxValue: 4200 },
  { id: 's23u', brand: 'Samsung', model: 'Galaxy S23 Ultra 256GB', maxValue: 2800 },
  { id: 'zfold5', brand: 'Samsung', model: 'Galaxy Z Fold5 512GB', maxValue: 3900 },
  { id: 'px8p', brand: 'Google', model: 'Pixel 8 Pro 128GB', maxValue: 2500 },
];

export function NextTradeModal({
  isOpen,
  onClose,
  onApplyTradeInDiscount,
}: NextTradeModalProps) {
  const [selectedDeviceId, setSelectedDeviceId] = React.useState(TRADE_IN_DEVICES[0].id);
  const [condition, setCondition] = React.useState<'excelente' | 'bom' | 'marcas'>('excelente');
  const [applied, setApplied] = React.useState(false);

  if (!isOpen) return null;

  const currentDevice = TRADE_IN_DEVICES.find((d) => d.id === selectedDeviceId)!;
  const multiplier = condition === 'excelente' ? 1.0 : condition === 'bom' ? 0.85 : 0.70;
  const estimatedValue = Math.round(currentDevice.maxValue * multiplier);

  const handleApply = () => {
    onApplyTradeInDiscount(estimatedValue);
    setApplied(true);
    setTimeout(() => {
      onClose();
      setApplied(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                NextTrade · Simulador de Troca
              </h3>
              <p className="text-xs text-slate-500">
                Entregue seu aparelho usado e ganhe desconto imediato no novo flagship.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Device Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Selecione seu modelo atual:
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TRADE_IN_DEVICES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.brand} {d.model}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Condição estética do aparelho:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setCondition('excelente')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  condition === 'excelente'
                    ? 'border-[#2563EB] bg-blue-50 text-blue-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>Excelente</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Sem riscos</div>
              </button>

              <button
                onClick={() => setCondition('bom')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  condition === 'bom'
                    ? 'border-[#2563EB] bg-blue-50 text-blue-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>Bom</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Leves marcas</div>
              </button>

              <button
                onClick={() => setCondition('marcas')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  condition === 'marcas'
                    ? 'border-[#2563EB] bg-blue-50 text-blue-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>Sinais de Uso</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Tela intacta</div>
              </button>
            </div>
          </div>

          {/* Value Result Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 text-center space-y-1">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              Avaliação Instantânea Garantida
            </div>
            <div className="text-3xl font-extrabold text-emerald-950 tabular-nums">
              {formatBRL(estimatedValue)}
            </div>
            <div className="text-[11px] text-slate-600">
              Valor abatido diretamente na sua compra à vista ou financiada.
            </div>
          </div>

          {/* Action */}
          <div className="space-y-2">
            <button
              onClick={handleApply}
              disabled={applied}
              className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {applied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Voucher de {formatBRL(estimatedValue)} Aplicado!</span>
                </>
              ) : (
                <>
                  <span>Aplicar Desconto de {formatBRL(estimatedValue)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400">
              *A coleta do aparelho usado é realizada gratuitamente em seu endereço após o recebimento do novo aparelho.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
