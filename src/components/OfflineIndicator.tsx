import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xl border border-amber-300 animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modalità Offline Attiva · Dati salvati in locale</span>
    </div>
  );
};
