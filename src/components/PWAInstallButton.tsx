import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { Smartphone, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'mobile' | 'prominent';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'header' 
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running inside standalone PWA mode
  if (isInstalled) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">WebApp iOS</span>
      </span>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
          variant === 'header'
            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40'
            : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
        } ${className}`}
        title="Installa ODS Catering Master sulla Home del tuo iPhone o smartphone come WebApp"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
        <span className={variant === 'header' ? 'hidden 2xl:inline' : ''}>Installa WebApp</span>
      </button>

      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onInstallChromium={install}
        isInstallableChromium={isInstallable}
      />
    </>
  );
};
