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
  X,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

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
  onLoadSampleData?: () => void;
  onDeleteCurrentEvent?: () => void;
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
  onLoadSampleData,
  onDeleteCurrentEvent,
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
        const list: MasterODS[] = Array.isArray(parsed) ? parsed : [parsed];
        const valid = list.filter((ev) => ev && ev.scheda && ev.id);
        if (valid.length === 0) {
          window.alert('Il file selezionato non contiene Ordini di Servizio validi.');
          return;
        }
        onImportJSON(valid);
      } catch (err) {
        console.error('File ODS non valido', err);
        window.alert('File non leggibile: assicurati di caricare un backup JSON esportato da ODS Catering.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setMobileMenuOpen(false);
  };

  const navItems: { id: ActiveTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'in_servizio', label: 'In Servizio (Live)', shortLabel: 'Live', icon: <Zap className="w-4 h-4 mr-1.5 text-amber-400" /> },
    { id: 'capo_servizio', label: 'Capo Servizio', shortLabel: 'Capo Serv.', icon: <UserCheck className="w-4 h-4 mr-1.5" /> },
    { id: 'brigata', label: 'Brigata (Fogli singoli)', shortLabel: 'Brigata', icon: <Users className="w-4 h-4 mr-1.5" /> },
    { id: 'carico', label: 'Carico & Facchinaggio', shortLabel: 'Carico', icon: <Truck className="w-4 h-4 mr-1.5" /> },
    { id: 'modello_completo', label: 'Modello Completo', shortLabel: 'Modello', icon: <FileSpreadsheet className="w-4 h-4 mr-1.5" /> },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#090e17] text-slate-100 sticky top-0 z-30 no-print">
      {/* Primary Top Bar adhering to the Top Bar Contract */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Zone 1: Single Text Element Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shadow-inner">
            <span className="font-display tracking-widest text-xs">ODS</span>
          </div>
          <span className="hidden sm:inline text-lg font-bold tracking-tight text-white font-display">
            Catering <span className="text-amber-400 font-medium">Master</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop 5 tabs) */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                {item.icon}
                <span className="hidden 2xl:inline">{item.label}</span>
                <span className="2xl:hidden">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions and Event Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Event Picker */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={currentEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="bg-transparent text-slate-100 font-medium text-xs focus:outline-none cursor-pointer max-w-[90px] sm:max-w-[170px] truncate"
              aria-label="Seleziona evento ODS"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-slate-900 text-slate-100">
                  {ev.scheda.odsNumero} · {ev.scheda.eventoNomeTipo}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop quick duplicate & export */}
          {onDuplicateCurrentEvent && (
            <button
              onClick={onDuplicateCurrentEvent}
              className="hidden md:flex items-center p-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer min-h-[36px]"
              title="Duplica questo ODS"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {onExportJSON && (
            <button
              onClick={onExportJSON}
              className="hidden md:flex items-center p-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer min-h-[36px]"
              title="Esporta archivio ODS (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Install as iPhone / PWA WebApp Button */}
          <PWAInstallButton className="hidden md:flex" />

          {/* New Event Button */}
          <button
            onClick={onOpenNewEvent}
            className="flex items-center px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 whitespace-nowrap cursor-pointer min-h-[36px]"
            title="Crea nuovo Ordine di Servizio"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-amber-400" />
            <span className="hidden xs:inline">Nuovo</span> ODS
          </button>

          {/* Print Button (Desktop) */}
          <button
            onClick={onPrintCurrentView}
            className="hidden sm:flex items-center px-2.5 2xl:px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer min-h-[36px]"
            title="Stampa la scheda corrente in formato cartaceo o PDF"
          >
            <Printer className="w-3.5 h-3.5 2xl:mr-1.5" />
            <span className="hidden 2xl:inline">Stampa ODS</span>
          </button>

          {/* Mobile More Options Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center p-2 text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800 min-h-[44px] min-w-[40px] cursor-pointer"
            aria-label="Altre opzioni evento"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Context Strip (Zero-Pill clean typography) */}
      <div className="bg-[#0b0f19] border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 text-[11px] sm:text-xs text-slate-400">
        <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-mono text-amber-300 font-semibold tracking-tight">
              ODS n° {currentEvent.scheda.odsNumero}
            </span>
            <span className="text-slate-600">·</span>
            <button
              onClick={onOpenRevisionModal}
              className="inline-flex items-center font-mono text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <History className="w-3 h-3 mr-1 text-slate-500" />
              <span>{currentEvent.scheda.revisioneCorrente}</span>
            </button>
            <span className="text-slate-600">·</span>
            <span className="font-medium text-slate-200 truncate max-w-[180px] sm:max-w-sm">
              {currentEvent.scheda.eventoNomeTipo}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-mono">
              {currentEvent.scheda.data}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-400 font-mono text-[11px]">
            <span>Pax: <strong className="text-slate-200">{currentEvent.scheda.ospitiAdulti + currentEvent.scheda.ospitiBambiniSpeciali}</strong></span>
            <span className="text-slate-600">·</span>
            <span>Servizio: <strong className="text-slate-200">{currentEvent.scheda.inizioEvento} - {currentEvent.scheda.fineEvento}</strong></span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="hidden sm:inline">Staff: <strong className="text-slate-200">{currentEvent.scheda.ingressoStaff}</strong></span>
          </div>
        </div>
      </div>

      {/* Mobile Actions Drawer / Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0f172a] border-t sm:border border-slate-800 text-slate-100 rounded-t-2xl sm:rounded-xl max-w-sm w-full p-4 pb-8 sm:pb-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-sm text-white font-display">Opzioni Ordine di Servizio</h3>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="pb-1">
                <PWAInstallButton variant="prominent" className="w-full justify-center py-2.5" />
              </div>

              <button
                onClick={() => {
                  onPrintCurrentView();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-left font-medium min-h-[44px] border border-slate-800/80 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Stampa / Salva in PDF</div>
                  <div className="text-[11px] text-slate-400">Esporta la scheda ODS visualizzata in A4</div>
                </div>
              </button>

              {onDuplicateCurrentEvent && (
                <button
                  onClick={() => {
                    onDuplicateCurrentEvent();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-left font-medium min-h-[44px] border border-slate-800/80 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-slate-300 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Duplica ODS Corrente</div>
                    <div className="text-[11px] text-slate-400">Crea una copia modificabile per un nuovo evento</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenRevisionModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-left font-medium min-h-[44px] border border-slate-800/80 cursor-pointer"
              >
                <History className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Registro Revisioni ({currentEvent.scheda.revisioneCorrente})</div>
                  <div className="text-[11px] text-slate-400">Visualizza storico modifiche o emetti nuova revisione</div>
                </div>
              </button>

              {onExportJSON && (
                <button
                  onClick={() => {
                    onExportJSON();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-left font-medium min-h-[44px] border border-slate-800/80 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Backup Archivio (JSON)</div>
                    <div className="text-[11px] text-slate-400">Scarica tutti gli ordini memorizzati</div>
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
                    className="w-full flex items-center gap-3 p-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-left font-medium min-h-[44px] border border-slate-800/80 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-300 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Importa Archivio da File JSON</div>
                      <div className="text-[11px] text-slate-400">Carica file precedentemente salvato</div>
                    </div>
                  </button>
                </div>
              )}

              {onLoadSampleData && (
                <button
                  onClick={() => {
                    onLoadSampleData();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-left font-medium min-h-[44px] border border-slate-800/80 cursor-pointer text-amber-300"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-semibold">Carica ODS di Esempio</div>
                    <div className="text-[11px] text-slate-400">Aggiunge Buffet 200 pax e Placé Servito, senza toccare i tuoi ODS</div>
                  </div>
                </button>
              )}

              {onDeleteCurrentEvent && (
                <button
                  onClick={() => {
                    onDeleteCurrentEvent();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-900/90 hover:bg-red-950/60 rounded-lg text-left font-medium min-h-[44px] border border-slate-800/80 cursor-pointer text-red-400"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-semibold">Elimina ODS Corrente</div>
                    <div className="text-[11px] text-slate-400">Rimuove definitivamente ODS n° {currentEvent.scheda.odsNumero}</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

