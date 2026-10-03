import React, { useRef, useState } from 'react';
import { MasterODS } from '../types/ods';
import { 
  FileSpreadsheet, 
  UserCheck, 
  Users, 
  Truck, 
  Zap, 
  Printer, 
  Plus, 
  Calendar,
  History,
  Copy,
  Download,
  Upload,
  MoreVertical,
  X
} from 'lucide-react';

export type ActiveTab = 'modello_completo' | 'capo_servizio' | 'brigata' | 'carico' | 'in_servizio';

interface HeaderProps {
  events: MasterODS[];
  currentEventId: string;
  onSelectEvent: (id: string) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewEvent: () => void;
  onOpenRevisionModal: () => void;
  onPrintCurrentView: () => void;
  onDuplicateCurrentEvent?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: (importedEvents: MasterODS[]) => void;
}

export const Header: React.FC<HeaderProps> = ({
  events,
  currentEventId,
  onSelectEvent,
  activeTab,
  onTabChange,
  onOpenNewEvent,
  onOpenRevisionModal,
  onPrintCurrentView,
  onDuplicateCurrentEvent,
  onExportJSON,
  onImportJSON,
}) => {
  const currentEvent = events.find((e) => e.id === currentEventId) || events[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportJSON) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportJSON(parsed);
        } else if (parsed && parsed.scheda) {
          onImportJSON([parsed]);
        }
      } catch (err) {
        console.error('File ODS non valido', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setMobileMenuOpen(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'in_servizio', label: 'In Servizio (Live)', icon: <Zap className="w-4 h-4 mr-1.5 text-amber-400" /> },
    { id: 'capo_servizio', label: 'Capo Servizio', icon: <UserCheck className="w-4 h-4 mr-1.5" /> },
    { id: 'brigata', label: 'Brigata (Fogli singoli)', icon: <Users className="w-4 h-4 mr-1.5" /> },
    { id: 'carico', label: 'Carico & Facchinaggio', icon: <Truck className="w-4 h-4 mr-1.5" /> },
    { id: 'modello_completo', label: 'Modello Completo', icon: <FileSpreadsheet className="w-4 h-4 mr-1.5" /> },
  ];

  return (
    <header className="border-b border-neutral-800 bg-neutral-950 text-neutral-100 sticky top-0 z-30 no-print">
      {/* Primary Top Bar adhering to the Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm">
            C
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-white block leading-none">
              ODS Catering Master
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono hidden xs:inline">
              Fonte Unica · Gestione 360°
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-emerald-400 shadow-sm border border-neutral-700/50 font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions and Event Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Event Picker */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={currentEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer max-w-[110px] sm:max-w-[170px] truncate"
              aria-label="Seleziona evento ODS"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-neutral-900 text-neutral-100">
                  {ev.scheda.odsNumero} · {ev.scheda.eventoNomeTipo}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop quick duplicate & export */}
          {onDuplicateCurrentEvent && (
            <button
              onClick={onDuplicateCurrentEvent}
              className="hidden md:flex items-center p-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800 cursor-pointer min-h-[36px]"
              title="Duplica questo ODS"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {onExportJSON && (
            <button
              onClick={onExportJSON}
              className="hidden md:flex items-center p-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800 cursor-pointer min-h-[36px]"
              title="Esporta archivio ODS (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* New Event Button */}
          <button
            onClick={onOpenNewEvent}
            className="flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-700 whitespace-nowrap cursor-pointer min-h-[36px]"
            title="Crea nuovo Ordine di Servizio"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span className="hidden xs:inline">Nuovo</span> ODS
          </button>

          {/* Print Button (Desktop) */}
          <button
            onClick={onPrintCurrentView}
            className="hidden sm:flex items-center px-3 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer min-h-[36px]"
            title="Stampa la scheda corrente in formato cartaceo o PDF"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Stampa</span>
          </button>

          {/* Mobile More Options Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center p-2 text-neutral-300 hover:text-white bg-neutral-900 rounded-lg border border-neutral-800 min-h-[44px] min-w-[40px] cursor-pointer"
            aria-label="Altre opzioni evento"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Context Strip */}
      <div className="bg-neutral-900/60 border-t border-neutral-800/80 px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2 text-[11px] sm:text-xs text-neutral-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded text-[11px]">
              ODS n° {currentEvent.scheda.odsNumero}
            </span>
            <span className="text-neutral-500">·</span>
            <button
              onClick={onOpenRevisionModal}
              className="inline-flex items-center font-mono text-neutral-200 hover:text-white hover:underline cursor-pointer"
            >
              <History className="w-3 h-3 mr-1 text-neutral-400" />
              <span>{currentEvent.scheda.revisioneCorrente}</span>
            </button>
            <span className="text-neutral-500">·</span>
            <span className="font-medium text-white truncate max-w-[150px] sm:max-w-xs">
              {currentEvent.scheda.eventoNomeTipo}
            </span>
          </div>

          <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
            <span>Pax: <strong className="text-neutral-100">{currentEvent.scheda.ospitiAdulti + currentEvent.scheda.ospitiBambiniSpeciali}</strong></span>
            <span>·</span>
            <span>Inizio: <strong className="text-neutral-100">{currentEvent.scheda.inizioEvento}</strong></span>
          </div>
        </div>
      </div>

      {/* Mobile Actions Drawer / Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-neutral-900 border-t sm:border border-neutral-800 text-neutral-100 rounded-t-2xl sm:rounded-xl max-w-sm w-full p-4 pb-8 sm:pb-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-sm text-white">Menu Gestione Evento</h3>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-neutral-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  onPrintCurrentView();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg text-left font-medium min-h-[44px]"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Stampa / Salva in PDF</div>
                  <div className="text-[11px] text-neutral-400">Esporta la scheda ODS visualizzata</div>
                </div>
              </button>

              {onDuplicateCurrentEvent && (
                <button
                  onClick={() => {
                    onDuplicateCurrentEvent();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg text-left font-medium min-h-[44px]"
                >
                  <Copy className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold text-white">Duplica ODS Corrente</div>
                    <div className="text-[11px] text-neutral-400">Crea una copia per un nuovo servizio</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenRevisionModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg text-left font-medium min-h-[44px]"
              >
                <History className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Registro Revisioni ({currentEvent.scheda.revisioneCorrente})</div>
                  <div className="text-[11px] text-neutral-400">Visualizza storico o emetti nuova revisione</div>
                </div>
              </button>

              {onExportJSON && (
                <button
                  onClick={() => {
                    onExportJSON();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg text-left font-medium min-h-[44px]"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">Backup Archivio (JSON)</div>
                    <div className="text-[11px] text-neutral-400">Scarica tutti gli ordini salvati</div>
                  </div>
                </button>
              )}

              {onImportJSON && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg text-left font-medium min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-bold text-white">Importa Archivio da File JSON</div>
                      <div className="text-[11px] text-neutral-400">Carica file precedentemente salvato</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

