import React from 'react';
import { X, Share2, PlusSquare, Smartphone, CheckCircle, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallChromium?: () => void;
  isInstallableChromium?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstallChromium,
  isInstallableChromium,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0f172a] border border-slate-700/80 text-slate-100 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header with App Icon */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#070a11] border border-amber-500/40 p-1.5 flex items-center justify-center shadow-inner shrink-0">
              <img src="/icon.svg" alt="ODS Catering" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Installa WebApp su iPhone</h2>
              <p className="text-xs text-amber-300 font-medium">Uso a 360° a schermo intero senza barre</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Chiudi guida"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Vantaggi come WebApp nativa su iOS:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Avvio immediato da Home</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Funziona anche offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Schermo intero (no URL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Dati salvati sul telefono</span>
            </div>
          </div>
        </div>

        {/* Step-by-step for iPhone */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              1
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>Tocca il tasto</span>
                <span className="inline-flex items-center gap-1 bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
                  <Share2 className="w-3.5 h-3.5" /> Condividi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Nella barra inferiore o superiore del browser Safari sul tuo iPhone.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              2
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>Scorri e tocca</span>
                <span className="inline-flex items-center gap-1 bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700 font-bold">
                  <PlusSquare className="w-3.5 h-3.5" /> Aggiungi alla schermata Home
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Troverai la voce nel menu di condivisione di iOS ("Add to Home Screen").
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              3
            </div>
            <div>
              <div className="font-bold text-slate-100">
                Tocca <strong>"Aggiungi"</strong> in alto a destra
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                L'icona ODS Catering Master comparirà sulla Home dell'iPhone, pronta da avviare e compilare come una vera app.
              </p>
            </div>
          </div>
        </div>

        {/* Chromium / Android Direct Install Option */}
        {isInstallableChromium && onInstallChromium && (
          <div className="pt-2">
            <button
              onClick={() => {
                onInstallChromium();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              <span>Installa Subito sul Dispositivo</span>
            </button>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Ho capito, chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
