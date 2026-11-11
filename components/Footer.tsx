'use client';

import React from 'react';
import { ShieldCheck, Truck, Lock, RefreshCw, Mail, Phone, HelpCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-16 text-slate-600 text-xs">
      {/* Top 3-Pillar Security & Trust Banner */}
      <div className="border-b border-slate-100 bg-[#F8FAFC] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/60 text-[#004ac6] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Autenticidade Certificada</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Aparelhos nacionais lacrados, homologados pela Anatel e com 1 ano de garantia direta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Transação 100% Protegida</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Criptografia ponta a ponta com liquidação instantânea Pix via Banco Central.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Logística Blindada Expressa</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Envio com seguro total contra sinistro ou extravio até a porta da sua residência.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-bold flex items-center justify-center text-sm">
                N
              </div>
              <span className="font-bold text-[#0F172A] text-base">NextMobile</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              O destino definitivo dos consumidores exigentes para aquisição de smartphones flagship e tecnologia vestível premium.
            </p>
            <div className="text-[11px] text-slate-400">
              CNPJ: 42.109.842/0001-90 <br />
              Av. das Nações Unidas, 14.401 - Brooklin, São Paulo - SP
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Ecossistemas
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Linha Apple iPhone Pro</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Samsung Galaxy Ultra</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Google Pixel Pro</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Linha Dobráveis Fold & Flip</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Acessórios em Titânio</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Atendimento Concierge
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>0800 940 2200 (Seg a Sex 9h-20h)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>concierge@nextmobile.com.br</span>
              </li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Rastreamento de Encomendas</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Política de Devolução (7 Dias CDC)</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Termos e Condições Gerais</a></li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Métodos de Liquidação
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>• <strong>Pix Banco Central:</strong> 15% de desconto à vista</div>
              <div>• <strong>Cartões de Crédito:</strong> Até 12x sem juros (Visa, Master, Elo, Amex)</div>
              <div>• <strong>NextTrade:</strong> Crédito instantâneo no seu usado</div>
            </div>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ambiente Certificado SSL EV 256 bits</span>
            </div>
          </div>

        </div>

        {/* Quiet Sub-footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} NextMobile Comércio de Eletrônicos S/A. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacidade</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-600 transition-colors">Segurança</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-600 transition-colors">Conformidade LGPD</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
