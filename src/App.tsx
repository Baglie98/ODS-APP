import React, { useState, useEffect } from 'react';
import { MasterODS } from './types/ods';
import { sampleEvents } from './data/sampleEvents';
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

export default function App() {
  const [events, setEvents] = useState<MasterODS[]>(() => {
    const saved = localStorage.getItem('ods_catering_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved events', e);
      }
    }
    return sampleEvents;
  });

  const [currentEventId, setCurrentEventId] = useState<string>(events[0]?.id || 'ods-2026-084');
  const [activeTab, setActiveTab] = useState<ActiveTab>('capo_servizio');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ods_catering_events', JSON.stringify(events));
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
    setEvents((prev) => [...importedEvents, ...prev]);
    setCurrentEventId(importedEvents[0].id);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Vuoi ripristinare i modelli ODS di esempio originali (Buffet 200 pax e Placé Servito)?')) {
      setEvents(sampleEvents);
      setCurrentEventId(sampleEvents[0].id);
      localStorage.setItem('ods_catering_events', JSON.stringify(sampleEvents));
    }
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
        onResetSampleData={handleResetSampleData}
      />

      {/* Real-time "Fonte Unica" Consistency & Integrity Audit Bar */}
      {currentEvent && <ConsistencyAuditBar ods={currentEvent} />}

      {/* Main Viewport Content */}
      <main className="flex-1 w-full pb-24 lg:pb-12 pt-2">
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
