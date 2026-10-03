import { useState, useEffect } from 'react';
import { MasterODS } from './types/ods';
import { sampleEvents } from './data/sampleEvents';
import { createBlankODS } from './utils/odsFactory';
import { Header, ActiveTab } from './components/Header';
import { ConsistencyAuditBar } from './components/ConsistencyAuditBar';
import { ModelloCompletoView } from './components/views/ModelloCompletoView';
import { CapoServizioView } from './components/views/CapoServizioView';
import { BrigataView } from './components/views/BrigataView';
import { CaricoFacchinaggioView } from './components/views/CaricoFacchinaggioView';
import { InServizioView } from './components/views/InServizioView';
import { NewEventModal } from './components/modals/NewEventModal';
import { RevisionModal } from './components/modals/RevisionModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';

const STORAGE_KEY = 'ods_catering_events';

export default function App() {
  const [events, setEvents] = useState<MasterODS[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved events', e);
    }
    // First launch: start from one blank ODS ready to be filled in
    return [createBlankODS()];
  });

  const [currentEventId, setCurrentEventId] = useState<string>(events[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('capo_servizio');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving events', e);
      window.alert('Impossibile salvare i dati sul dispositivo (memoria piena o navigazione privata). Esporta un backup JSON.');
    }
  }, [events]);

  const currentEvent = events.find((e) => e.id === currentEventId) || events[0];

  const handleUpdateCurrentODS = (updated: MasterODS) => {
    setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
  };

  const handleCreateNewEvent = (newEvent: MasterODS) => {
    setEvents((prev) => [newEvent, ...prev]);
    setCurrentEventId(newEvent.id);
    setActiveTab('modello_completo');
  };

  const handleDuplicateCurrentEvent = () => {
    if (!currentEvent) return;
    const duplicated: MasterODS = JSON.parse(JSON.stringify(currentEvent));
    duplicated.id = 'ods-' + Date.now();
    duplicated.scheda.odsNumero = `${currentEvent.scheda.odsNumero}-COPIA`;
    duplicated.scheda.eventoNomeTipo = `${currentEvent.scheda.eventoNomeTipo} (Copia)`;
    duplicated.scheda.revisioneCorrente = 'Rev. 0';
    duplicated.scheda.dataRevisione = new Date().toLocaleDateString('it-IT');
    duplicated.revisioni = [
      {
        rev: 'Rev. 0',
        data: duplicated.scheda.dataRevisione,
        cosaCambiato: `Duplicato da ODS n° ${currentEvent.scheda.odsNumero}`,
        autore: duplicated.scheda.redattoDa,
      },
    ];
    setEvents((prev) => [duplicated, ...prev]);
    setCurrentEventId(duplicated.id);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Archivio_ODS_Catering_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (importedEvents: MasterODS[]) => {
    if (!importedEvents || importedEvents.length === 0) return;
    // Imported ODS replace existing ones with the same id, so re-importing a backup never duplicates entries
    const importedIds = new Set(importedEvents.map((ev) => ev.id));
    setEvents((prev) => [...importedEvents, ...prev.filter((ev) => !importedIds.has(ev.id))]);
    setCurrentEventId(importedEvents[0].id);
  };

  const handleDeleteCurrentEvent = () => {
    if (!currentEvent) return;
    if (events.length <= 1) {
      window.alert("Non puoi eliminare l'unico ODS presente: creane prima uno nuovo.");
      return;
    }
    if (!window.confirm(`Eliminare definitivamente ODS n° ${currentEvent.scheda.odsNumero} · ${currentEvent.scheda.eventoNomeTipo}?`)) return;
    const remaining = events.filter((ev) => ev.id !== currentEvent.id);
    setEvents(remaining);
    setCurrentEventId(remaining[0].id);
  };

  // Adds the sample ODS to the archive without touching the user's own ODS
  const handleLoadSampleData = () => {
    const sampleIds = new Set(sampleEvents.map((ev) => ev.id));
    setEvents((prev) => [...sampleEvents, ...prev.filter((ev) => !sampleIds.has(ev.id))]);
    setCurrentEventId(sampleEvents[0].id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      <OfflineIndicator />
      {/* 3-Zone Top Navigation Contract */}
      <Header
        events={events}
        currentEventId={currentEventId}
        onSelectEvent={setCurrentEventId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewEvent={() => setIsNewEventModalOpen(true)}
        onOpenRevisionModal={() => setIsRevisionModalOpen(true)}
        onPrintCurrentView={handlePrint}
        onDuplicateCurrentEvent={handleDuplicateCurrentEvent}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onLoadSampleData={handleLoadSampleData}
        onDeleteCurrentEvent={handleDeleteCurrentEvent}
      />

      {/* Real-time "Fonte Unica" Consistency & Integrity Audit Bar */}
      {currentEvent && <ConsistencyAuditBar ods={currentEvent} />}

      {/* Main Viewport Content */}
      <main className="flex-1 w-full pb-24 xl:pb-12 pt-2">
        {currentEvent ? (
          <>
            {activeTab === 'modello_completo' && (
              <ModelloCompletoView ods={currentEvent} onUpdateODS={handleUpdateCurrentODS} />
            )}
            {activeTab === 'capo_servizio' && (
              <CapoServizioView ods={currentEvent} onUpdateODS={handleUpdateCurrentODS} />
            )}
            {activeTab === 'brigata' && (
              <BrigataView ods={currentEvent} onUpdateODS={handleUpdateCurrentODS} />
            )}
            {activeTab === 'carico' && (
              <CaricoFacchinaggioView ods={currentEvent} onUpdateODS={handleUpdateCurrentODS} />
            )}
            {activeTab === 'in_servizio' && (
              <InServizioView ods={currentEvent} onUpdateODS={handleUpdateCurrentODS} />
            )}
          </>
        ) : (
          <div className="text-center py-24 text-slate-500 font-medium text-sm">
            Nessun evento selezionato. Crea un nuovo Ordine di Servizio per iniziare.
          </div>
        )}
      </main>

      {/* Fixed Bottom Thumb Bar for Smartphones */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreateEvent={handleCreateNewEvent}
      />

      {currentEvent && (
        <RevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          ods={currentEvent}
          onUpdateODS={handleUpdateCurrentODS}
        />
      )}
    </div>
  );
}
