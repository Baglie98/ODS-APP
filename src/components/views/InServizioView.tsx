import React, { useState, useEffect } from 'react';
import { MasterODS, ImprevistoLive } from '../../types/ods';
import { 
  AlertTriangle, 
  Phone, 
  Plus, 
  CheckSquare, 
  Square, 
  ShieldAlert, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Check, 
  PlayCircle
} from 'lucide-react';

interface InServizioViewProps {
  ods: MasterODS;
  onUpdateODS: (updated: MasterODS) => void;
}

export const InServizioView: React.FC<InServizioViewProps> = ({ ods, onUpdateODS }) => {
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [nuovoImprevisto, setNuovoImprevisto] = useState<{
    ora: string;
    situazione: string;
    primaAzione: string;
    chiAvvisareOGestisce: string;
    esito: string;
  }>({
    ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    situazione: '',
    primaAzione: '',
    chiAvvisareOGestisce: '',
    esito: '',
  });

  const [mostraFormImprevisto, setMostraFormImprevisto] = useState(false);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const addImprevisto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuovoImprevisto.situazione) return;
    const newItem: ImprevistoLive = {
      id: 'imp_' + Date.now(),
      ora: nuovoImprevisto.ora,
      situazione: nuovoImprevisto.situazione,
      primaAzione: nuovoImprevisto.primaAzione,
      chiAvvisareOGestisce: nuovoImprevisto.chiAvvisareOGestisce,
      esito: nuovoImprevisto.esito || 'In corso',
    };
    onUpdateODS({
      ...ods,
      imprevistiLive: [newItem, ...ods.imprevistiLive],
    });
    setNuovoImprevisto({
      ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      situazione: '',
      primaAzione: '',
      chiAvvisareOGestisce: '',
      esito: '',
    });
    setMostraFormImprevisto(false);
    showToast('Imprevisto registrato nel registro live!');
  };

  const fillQuickIncident = (situazione: string, primaAzione: string, chi: string) => {
    setNuovoImprevisto({
      ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      situazione,
      primaAzione,
      chiAvvisareOGestisce: chi,
      esito: 'Gestione avviata tempestivamente',
    });
    setMostraFormImprevisto(true);
  };

  const updateOraReale = (codice: string, oraReale: string) => {
    const updated = ods.timelineFasi.map((f) => (f.codice === codice ? { ...f, oraReale } : f));
    onUpdateODS({ ...ods, timelineFasi: updated });
  };

  const registraOraAttuale = (codice: string) => {
    const nowHHMM = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const updated = ods.timelineFasi.map((f) => 
      f.codice === codice ? { ...f, oraReale: nowHHMM, completata: true } : f
    );
    onUpdateODS({ ...ods, timelineFasi: updated });
    showToast(`${codice} registrato alle ${nowHHMM}`);
  };

  const toggleFaseCompletata = (codice: string) => {
    const nowHHMM = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const updated = ods.timelineFasi.map((f) => {
      if (f.codice === codice) {
        const nextState = !f.completata;
        return {
          ...f,
          completata: nextState,
          oraReale: nextState ? (f.oraReale || nowHHMM) : f.oraReale,
        };
      }
      return f;
    });
    onUpdateODS({ ...ods, timelineFasi: updated });
  };

  const toggleAllergeneConsegnato = (id: string) => {
    const updated = ods.allergeni.map((al) =>
      al.id === id ? { ...al, consegnato: !al.consegnato } : al
    );
    onUpdateODS({ ...ods, allergeni: updated });
    const alItem = ods.allergeni.find((a) => a.id === id);
    if (alItem) {
      const state = !alItem.consegnato ? 'CONSEGNATO al tavolo' : 'In attesa';
      showToast(`${alItem.ospiteGruppo} (${alItem.allergeneDieta}): ${state}`);
    }
  };

  // Contacts
  const capoServizio = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('capo servizio'));
  const committente = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('committente'));
  const referenteLocation = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('location') || c.ruolo.toLowerCase().includes('loco'));
  const chefCucina = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('chef') || c.ruolo.toLowerCase().includes('cucina'));
  const responsabileCarico = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('carico') || c.ruolo.toLowerCase().includes('logistica'));

  // Metrics
  const totalAllergeni = ods.allergeni.length;
  const allergeniConsegnati = ods.allergeni.filter((a) => a.consegnato).length;
  const activeFasi = ods.timelineFasi.filter((f) => ['F3', 'F4', 'F5', 'F6', 'F7', 'F8'].includes(f.codice) || f.codice.startsWith('F')).slice(0, 8);
  const fasiCompletate = activeFasi.filter((f) => f.completata || f.oraReale).length;

  return (
    <div className="ods-paper rounded-xl p-5 sm:p-8 max-w-5xl mx-auto my-4 sm:my-6 print:p-0 print:border-none print:shadow-none font-sans">
      {/* Toast notification feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-amber-400 text-amber-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Official Compact Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block mb-0.5">
              ORDINE DI SERVIZIO DERIVATO · CONSOLE OPERATIVA IN TEMPO REALE
            </span>
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight flex items-center gap-2 font-display">
              <Zap className="w-6 h-6 text-amber-500 no-print" />
              ODS In Servizio (Live Cockpit)
            </h1>
          </div>

          {/* Live System Clock Widget */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 text-amber-300 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner font-mono text-center no-print">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold">Ora Live</div>
              <div className="text-lg font-black tracking-widest">{currentTime}</div>
            </div>

            <div className="text-right font-mono text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
              <div>ODS n° {ods.scheda.odsNumero} · {ods.scheda.revisioneCorrente}</div>
              <div className="font-semibold text-slate-950">{ods.scheda.data}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Service Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5 font-mono">
        <div>
          <span className="font-sans text-slate-500 block text-[11px]">Evento:</span>
          <strong className="text-slate-950 font-sans block truncate">{ods.scheda.eventoNomeTipo}</strong>
        </div>
        <div>
          <span className="font-sans text-slate-500 block text-[11px]">Orario Servizio:</span>
          <strong className="text-slate-950 block">{ods.scheda.inizioEvento} - {ods.scheda.fineEvento}</strong>
        </div>
        <div>
          <span className="font-sans text-slate-500 block text-[11px]">Avanzamento Fasi:</span>
          <strong className="text-emerald-700 block">{fasiCompletate} / {activeFasi.length} svolte</strong>
        </div>
        <div>
          <span className="font-sans text-slate-500 block text-[11px]">Controllo Diete:</span>
          <strong className={allergeniConsegnati === totalAllergeni && totalAllergeni > 0 ? 'text-emerald-700 block' : 'text-amber-700 block'}>
            {allergeniConsegnati} / {totalAllergeni} servite
          </strong>
        </div>
      </div>

      {/* ================= ALLERGIE E DIETE — INTERATTIVO LIVE ================= */}
      <section className="mb-6 bg-rose-50/90 border-2 border-rose-600 rounded-xl overflow-hidden shadow-md">
        <div className="bg-rose-700 text-white px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-200 shrink-0" />
            ALLERGIE E DIETE SPECIALI — CONTROLLO E SPUNTA CONSEGNA AL TAVOLO
          </span>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="bg-rose-900/60 px-2 py-0.5 rounded border border-rose-400">
              {allergeniConsegnati}/{totalAllergeni} CONSEGNATI
            </span>
          </div>
        </div>

        <div className="p-3">
          {ods.allergeni.length === 0 ? (
            <p className="text-xs text-rose-800 p-2 italic text-center">Nessuna allergia o dieta speciale segnalata dal committente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-rose-300 text-rose-950 font-bold">
                    <th className="p-2 w-12 text-center">Spunta</th>
                    <th className="p-2">Ospite o Gruppo</th>
                    <th className="p-2">Allergene / Dieta</th>
                    <th className="p-2">Gestione & Piatto Sicuro</th>
                    <th className="p-2 w-32">Chi gestisce</th>
                    <th className="p-2 w-36 text-center">Azione Consegna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-200/80">
                  {ods.allergeni.map((al) => {
                    const isDone = !!al.consegnato;

                    return (
                      <tr key={al.id} className={isDone ? 'bg-emerald-50/70 text-emerald-950' : 'text-rose-950'}>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => toggleAllergeneConsegnato(al.id)}
                            className="cursor-pointer inline-flex items-center justify-center p-1"
                            title={isDone ? 'Segna da completare' : 'Segna come consegnato'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-rose-400 hover:text-rose-600" />
                            )}
                          </button>
                        </td>
                        <td className={`p-2 font-bold ${isDone ? 'line-through text-slate-500' : ''}`}>
                          {al.ospiteGruppo}
                        </td>
                        <td className="p-2">
                          <span className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                            isDone 
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                              : 'bg-rose-100 text-rose-950 border-rose-300'
                          }`}>
                            {al.allergeneDieta}
                          </span>
                        </td>
                        <td className="p-2 font-medium">{al.gestione}</td>
                        <td className="p-2 font-bold">{al.respInSala}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => toggleAllergeneConsegnato(al.id)}
                            className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              isDone
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                            }`}
                          >
                            {isDone ? 'Consegnato ✓' : 'Segna Consegnato'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ================= FASI TIMELINE CON REGISTRAZIONE 1-CLICK ================= */}
      <section className="mb-6 border border-slate-300 rounded-xl p-4 bg-slate-50/50 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Fasi Cronoprogramma & Registrazione Ora Reale Live</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Un tocco su "Adesso" registra istantaneamente l'ora reale e segna la fase come completata.
            </p>
          </div>

          <div className="font-mono text-xs text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
            Fasi svolte: <strong className="text-slate-900">{fasiCompletate}/{activeFasi.length}</strong>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-200 bg-white rounded-lg">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="p-2 border-r border-slate-200 w-12 text-center">Fase</th>
                <th className="p-2 border-r border-slate-200 w-28">Orario Previsto</th>
                <th className="p-2 border-r border-slate-200 w-36 bg-amber-50/70 text-amber-950 font-bold">Ora Reale</th>
                <th className="p-2 border-r border-slate-200">Cosa succede</th>
                <th className="p-2 w-32 text-center">Azione Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeFasi.map((f) => {
                const isDone = !!f.completata || !!f.oraReale;

                return (
                  <tr key={f.codice} className={isDone ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-center text-slate-900">
                      {f.codice}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">
                      {f.inizio} - {f.fine}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 font-mono">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="--:--"
                          value={f.oraReale || ''}
                          onChange={(e) => updateOraReale(f.codice, e.target.value)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded font-mono text-xs font-bold text-center bg-white"
                        />
                        <button
                          onClick={() => registraOraAttuale(f.codice)}
                          className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold rounded cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                          title="Inserisci ora esatta attuale"
                        >
                          Adesso
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-semibold text-slate-900">{f.nome}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">{f.cosaSuccede}</div>
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => toggleFaseCompletata(f.codice)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs w-full flex items-center justify-center gap-1.5 ${
                          isDone
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Completata</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Segna Fatta</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View with Large Touch Controls */}
        <div className="sm:hidden space-y-2.5">
          {activeFasi.map((f) => {
            const isDone = !!f.completata || !!f.oraReale;

            return (
              <div key={f.codice} className={`p-3 rounded-xl border transition-all ${
                isDone ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {f.codice}
                      </span>
                      <strong className="text-xs text-slate-900">{f.nome}</strong>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-1">
                      Previsto: {f.inizio} - {f.fine}
                    </div>
                  </div>

                  {f.oraReale && (
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      Reale: {f.oraReale}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => registraOraAttuale(f.codice)}
                    className="py-2 px-3 bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Ora Adesso</span>
                  </button>

                  <button
                    onClick={() => toggleFaseCompletata(f.codice)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer min-h-[44px] ${
                      isDone ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Completata' : 'Segna Fatta'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= NUMERI UTILI VELOCI CLICK TO CALL ================= */}
      <section className="mb-6 border border-slate-300 rounded-xl p-4 bg-slate-50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center justify-between">
          <span>Contatti Chiave Diretti (Un Tocco per Chiamare)</span>
          <span className="text-[11px] font-normal text-slate-500 font-mono">Pronto intervento in location</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Capo Servizio</span>
            <div className="font-bold text-slate-950 text-xs truncate">{capoServizio?.nome || ods.scheda.redattoDa}</div>
            <a href={`tel:${capoServizio?.telefono}`} className="text-slate-900 font-mono font-bold text-xs flex items-center mt-1.5 hover:underline">
              <Phone className="w-3 h-3 mr-1 text-slate-500" /> {capoServizio?.telefono || '-'}
            </a>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Referente Loco</span>
            <div className="font-bold text-slate-950 text-xs truncate">{referenteLocation?.nome || 'N/D'}</div>
            <a href={`tel:${referenteLocation?.telefono}`} className="text-slate-900 font-mono font-bold text-xs flex items-center mt-1.5 hover:underline">
              <Phone className="w-3 h-3 mr-1 text-slate-500" /> {referenteLocation?.telefono || '-'}
            </a>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Committente</span>
            <div className="font-bold text-slate-950 text-xs truncate">{committente?.nome || 'Cliente'}</div>
            <a href={`tel:${committente?.telefono}`} className="text-slate-900 font-mono font-bold text-xs flex items-center mt-1.5 hover:underline">
              <Phone className="w-3 h-3 mr-1 text-slate-500" /> {committente?.telefono || '-'}
            </a>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Cucina / Chef</span>
            <div className="font-bold text-slate-950 text-xs truncate">{chefCucina?.nome || 'Chef'}</div>
            <a href={`tel:${chefCucina?.telefono}`} className="text-slate-900 font-mono font-bold text-xs flex items-center mt-1.5 hover:underline">
              <Phone className="w-3 h-3 mr-1 text-slate-500" /> {chefCucina?.telefono || '-'}
            </a>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Carico / Logistica</span>
            <div className="font-bold text-slate-950 text-xs truncate">{responsabileCarico?.nome || 'Logistica'}</div>
            <a href={`tel:${responsabileCarico?.telefono}`} className="text-slate-900 font-mono font-bold text-xs flex items-center mt-1.5 hover:underline">
              <Phone className="w-3 h-3 mr-1 text-slate-500" /> {responsabileCarico?.telefono || '-'}
            </a>
          </div>

          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-300 shadow-2xs">
            <span className="text-[10px] text-rose-700 uppercase block font-bold">Emergenza Sanitaria</span>
            <div className="font-bold text-rose-950 text-xs">NUE Emergenza</div>
            <a href="tel:112" className="text-rose-900 font-mono font-black text-sm flex items-center hover:underline mt-1">
              <Phone className="w-3.5 h-3.5 mr-1" /> 112
            </a>
          </div>
        </div>
      </section>

      {/* ================= REGISTRO IMPREVISTI LIVE CON CHIP RAPIDI ================= */}
      <section className="mb-6 border border-slate-300 rounded-xl p-4 bg-slate-50/50 shadow-xs">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Registro Live Imprevisti & Deviazioni</span>
            </h2>
          </div>
          <button
            onClick={() => setMostraFormImprevisto(!mostraFormImprevisto)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors no-print cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{mostraFormImprevisto ? 'Chiudi Form' : 'Registra Imprevisto'}</span>
          </button>
        </div>

        {/* Quick Pre-set Incident Chips */}
        <div className="mb-3.5">
          <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Compilazione rapida imprevisto tipico:</span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => fillQuickIncident('Rottura bicchieri / cristalli vicino buffet', 'Transennato visivamente, spazzato e asciugato', 'Runner P6 + Capo Servizio')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg cursor-pointer text-[11px] font-medium transition-colors"
            >
              + Rottura cristalli
            </button>
            <button
              onClick={() => fillQuickIncident('Ritardo uscita piatti caldi dalla cucina', 'Mantenuto bagnomaria e allungato servizio bevande', 'Chef di cucina')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg cursor-pointer text-[11px] font-medium transition-colors"
            >
              + Ritardo portate
            </button>
            <button
              onClick={() => fillQuickIncident('Richiesta committente variazione orario taglio torta', 'Concordato anticipo di 20 min con pasticceria e sala', 'Capo Servizio con committente')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg cursor-pointer text-[11px] font-medium transition-colors"
            >
              + Variazione committente
            </button>
            <button
              onClick={() => fillQuickIncident('Rimpiazzo ghiaccio e bibite buvette terminati', 'Prelevate scorte di riserva dal cassone C6', 'Responsabile Bar')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg cursor-pointer text-[11px] font-medium transition-colors"
            >
              + Rimpiazzo ghiaccio/bevande
            </button>
          </div>
        </div>

        {mostraFormImprevisto && (
          <form onSubmit={addImprevisto} className="mb-4 p-4 bg-white border border-slate-300 rounded-xl text-xs space-y-3 no-print shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">Ora registrazione:</label>
                <input
                  type="text"
                  value={nuovoImprevisto.ora}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, ora: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-[11px] text-slate-600 font-bold block mb-1">Cosa è successo:</label>
                <input
                  type="text"
                  placeholder="Descrivi l'evento imprevisto..."
                  value={nuovoImprevisto.situazione}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, situazione: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">Chi gestisce / chi avvisare:</label>
                <input
                  type="text"
                  placeholder="es. Capo Servizio + Chef"
                  value={nuovoImprevisto.chiAvvisareOGestisce}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, chiAvvisareOGestisce: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">Prima azione intrapresa ed esito:</label>
                <input
                  type="text"
                  placeholder="es. Problema risolto / in attesa"
                  value={nuovoImprevisto.esito}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, esito: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMostraFormImprevisto(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
              >
                Salva nel Registro
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="p-2 border-r border-slate-200 w-16 text-center">Ora</th>
                <th className="p-2 border-r border-slate-200">Cosa è successo</th>
                <th className="p-2 border-r border-slate-200 w-44">Chi ha gestito</th>
                <th className="p-2 w-44">Esito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ods.imprevistiLive.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                    Nessun imprevisto registrato finora. Servizio regolare.
                  </td>
                </tr>
              ) : (
                ods.imprevistiLive.map((imp) => (
                  <tr key={imp.id} className="hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-center text-slate-900">{imp.ora}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">{imp.situazione}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">{imp.chiAvvisareOGestisce}</td>
                    <td className="p-2 font-medium text-emerald-900">{imp.esito}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= CHIUSURA RAPIDA INTERATTIVA ================= */}
      <section className="border-t-2 border-slate-900 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-3 rounded-lg flex items-center justify-between">
          <span>Chiusura Rapida & Checklist Fine Servizio</span>
          <span className="text-[11px] font-normal opacity-80">Prima dello scioglimento della brigata</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-2 text-slate-800">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700">Pax effettivi:</span>
              <span className="font-mono bg-white px-2.5 py-0.5 rounded border border-slate-300">
                Adulti: <strong>{ods.chiusura.paxRealiAdulti || ods.scheda.ospitiAdulti}</strong> · Bambini: <strong>{ods.chiusura.paxRealiBambini || ods.scheda.ospitiBambiniSpeciali}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sbarazzo e pulizia completati, rifiuti differenziati raccolti</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Materiale contato per contenitore C1..C8 e postazione P1..P10</span>
            </div>
          </div>

          <div className="space-y-2 text-slate-800">
            <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rotture e mancanze annotate con quantità sul modello completo</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Via libera del Capo Servizio alla brigata prima dello scioglimento</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Carico di ritorno ultimato con firma di consegna sul mezzo</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
