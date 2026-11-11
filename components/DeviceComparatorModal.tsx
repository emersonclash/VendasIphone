'use client';

import React from 'react';
import Image from 'next/image';
import {
  Product,
  calculatePixPrice,
  calculateInstallment,
  formatBRL,
} from '@/data/products';
import { X, Scale, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

interface DeviceComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export function DeviceComparatorModal({
  isOpen,
  onClose,
  compareList,
  onRemoveFromCompare,
  onSelectProduct,
}: DeviceComparatorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-none sm:rounded-2xl border border-slate-200 shadow-2xl min-h-screen sm:min-h-0 max-h-none sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Comparador de Flagships ({compareList.length}/3)
              </h2>
              <p className="text-xs text-slate-500">
                Compare especificações de ponta a ponta para tomar a melhor decisão.
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {compareList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Scale className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                Nenhum aparelho selecionado para comparar
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Clique no botão &ldquo;Comparar&rdquo; no card de qualquer smartphone do catálogo para visualizar lado a lado.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                Voltar à Vitrine
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-3 text-left font-bold text-slate-400 uppercase tracking-wider w-36 sm:w-48 bg-slate-50">
                      Dispositivo
                    </th>
                    {compareList.map((product) => {
                      const pix = calculatePixPrice(product.basePrice, product.pixDiscountPercent);
                      return (
                        <th
                          key={product.id}
                          className="p-4 text-center border-l border-slate-200 bg-white min-w-[200px]"
                        >
                          <div className="relative w-24 h-24 mx-auto mb-2 bg-[#F8FAFC] rounded-xl border border-slate-200 p-2">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              onClick={() => onRemoveFromCompare(product.id)}
                              className="absolute top-1 right-1 p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md border border-slate-200 shadow-xs cursor-pointer"
                              title="Remover do comparador"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                          
                          <div className="mt-1 text-base font-extrabold text-[#0F172A] tabular-nums">
                            {formatBRL(pix)}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            no Pix (15% OFF)
                          </div>

                          <button
                            onClick={() => {
                              onSelectProduct(product);
                              onClose();
                            }}
                            className="mt-3 w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Ver Detalhes
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-700">Processador</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-800">
                        {p.specs.processor}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Câmeras</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-800">
                        {p.specs.camera}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-700">Display</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-800">
                        {p.specs.screen}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Bateria & Recarga</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-800">
                        {p.specs.battery}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-700">Conectividade</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-800">
                        {p.specs.connectivity}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Peso Oficial</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-800">
                        {p.specs.weight}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-700">Sistema Operacional</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-800">
                        {p.specs.os}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
