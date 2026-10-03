import React from 'react';
import { ActiveTab } from './Header';
import { 
  FileSpreadsheet, 
  UserCheck, 
  Users, 
  Truck, 
  Zap 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; isLive?: boolean }[] = [
    { id: 'in_servizio', label: 'In Servizio', icon: <Zap className="w-5 h-5" />, isLive: true },
    { id: 'capo_servizio', label: 'Capo Serv.', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'brigata', label: 'Brigata', icon: <Users className="w-5 h-5" /> },
    { id: 'carico', label: 'Carico', icon: <Truck className="w-5 h-5" /> },
    { id: 'modello_completo', label: 'Master ODS', icon: <FileSpreadsheet className="w-5 h-5" /> },
  ];

  return (
    <nav 
      aria-label="Navigazione mobile ODS"
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 lg:hidden no-print pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-all relative ${
                isActive
                  ? tab.isLive
                    ? 'text-amber-400 font-bold'
                    : 'text-emerald-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] leading-tight tracking-tight mt-0.5 truncate max-w-[64px]">
                {tab.label}
              </span>
              {isActive && (
                <span 
                  className={`absolute top-1 w-1.5 h-1.5 rounded-full ${
                    tab.isLive ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} 
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
