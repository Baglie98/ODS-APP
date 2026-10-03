import React, { useState } from 'react';
import { MasterODS, ImprevistoLive } from '../../types/ods';
import { AlertTriangle, Phone, Plus, CheckSquare, Square, ShieldAlert, Zap, Clock } from 'lucide-react';

interface InServizioViewProps {
  ods: MasterODS;
  onUpdateODS: (updated: MasterODS) => void;
}

export const InServizioView: React.FC<InServizioViewProps> = ({ ods, onUpdateODS }) => {
  const [nuovoImprevisto, setNuovoImprevisto] = useState<{
    ora: string;
    situazione: string;
    primaAzione: string;
    chiAvvisareOGestisce: string;
    esito: string;
  }>({
    ora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    situazione: '',
    primaAzione: '',
    chiAvvisareOGestisce: '',
    esito: '',
  });

  const [mostraFormImprevisto, setMostraFormImprevisto] = useState(false);

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
      imprevistiLive: [...ods.imprevistiLive, newItem],
    });
    setNuovoImprevisto({
      ora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      situazione: '',
      primaAzione: '',
      chiAvvisareOGestisce: '',
      esito: '',
    });
    setMostraFormImprevisto(false);
  };

  const updateOraReale = (codice: string, oraReale: string) => {
    const updated = ods.timelineFasi.map((f) => (f.codice === codice ? { ...f, oraReale } : f));
    onUpdateODS({ ...ods, timelineFasi: updated });
  };

  const capoServizio = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('capo servizio'));
  const committente = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('committente'));
  const referenteLocation = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('location') || c.ruolo.toLowerCase().includes('loco'));
  const chefCucina = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('chef') || c.ruolo.toLowerCase().includes('cucina'));
  const responsabileCarico = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('carico') || c.ruolo.toLowerCase().includes('logistica'));

  return (
    <div className="bg-white text-slate-900 shadow-sm border border-slate-200 rounded-lg p-5 sm:p-7 max-w-4xl mx-auto my-6 print:p-0 print:border-none print:shadow-none font-sans">
      {/* Official Compact Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block">
              ORDINE DI SERVIZIO DERIVATO · FOGLIO RAPIDO DA PORTARE CON SÉ
            </span>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500 no-print" />
              ODS In Servizio
            </h1>
          </div>
          <div className="text-right font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded border border-slate-300">
            <div>ODS n° {ods.scheda.odsNumero} · {ods.scheda.revisioneCorrente}</div>
            <div className="font-semibold">{ods.scheda.data}</div>
          </div>
        </div>
      </div>

      {/* Event Details Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-100 p-2.5 rounded border border-slate-300 mb-4 font-mono">
        <div><span className="font-sans text-slate-500">Evento:</span> <strong className="text-slate-900 font-sans block truncate">{ods.scheda.eventoNomeTipo}</strong></div>
        <div><span className="font-sans text-slate-500">Luogo:</span> <span className="text-slate-800 font-sans block truncate">{ods.scheda.luogoIndirizzo}</span></div>
        <div><span className="font-sans text-slate-500">Orario servizio:</span> <strong className="text-slate-900 block">{ods.scheda.inizioEvento} - {ods.scheda.fineEvento}</strong></div>
        <div><span className="font-sans text-slate-500">Pax previsti:</span> <strong className="text-slate-900 block">{ods.scheda.ospitiAdulti + ods.scheda.ospitiBambiniSpeciali}</strong></div>
      </div>

      {/* ALLERGIE E DIETE — BANNER ROSSO CRITICO */}
      <section className="mb-5 bg-rose-50 border-2 border-rose-600 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-rose-700 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-200" />
            ALLERGIE E DIETE SPECIALI — LEGGERE PRIMA DI APRIRE IL SERVIZIO
          </span>
          <span className="text-[11px] font-normal lowercase tracking-normal text-rose-100">
            in caso di dubbio NON rispondere mai a memoria: chiama il capo servizio o la cucina
          </span>
        </div>

        <div className="overflow-x-auto p-2">
          {ods.allergeni.length === 0 ? (
            <p className="text-xs text-rose-800 p-2 italic text-center">Nessuna allergia o dieta speciale segnalata dal committente.</p>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-rose-300 text-rose-950 font-bold">
                  <th className="p-1.5">Ospite o gruppo</th>
                  <th className="p-1.5">Allergene / Dieta</th>
                  <th className="p-1.5">Gestione e Piatto Sicuro</th>
                  <th className="p-1.5 w-32">Chi gestisce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-200">
                {ods.allergeni.map((al) => (
                  <tr key={al.id} className="text-rose-950">
                    <td className="p-1.5 font-bold">{al.ospiteGruppo}</td>
                    <td className="p-1.5">
                      <span className="bg-rose-200 text-rose-900 font-bold px-1.5 py-0.5 rounded text-[11px]">
                        {al.allergeneDieta}
                      </span>
                    </td>
                    <td className="p-1.5 font-medium">{al.gestione}</td>
                    <td className="p-1.5 font-bold text-rose-900">{al.respInSala}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* FASI & CHI È DOVE (Responsive cards on mobile, table on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Fasi Timeline */}
        <section className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1.5 mb-2 rounded flex items-center justify-between">
            <span>Fasi Timeline</span>
            <span className="text-[10px] font-normal opacity-80">Inserisci ora reale live</span>
          </h2>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                  <th className="p-1.5 border-r border-slate-200 w-12 text-center">Fase</th>
                  <th className="p-1.5 border-r border-slate-200 w-24">Prevista</th>
                  <th className="p-1.5 border-r border-slate-200 w-24 bg-emerald-50 text-emerald-900">Reale</th>
                  <th className="p-1.5">Note / Cosa succede</th>
                </tr>
              </thead>
              <tbody>
                {ods.timelineFasi
                  .filter((f) => ['F3', 'F4', 'F5', 'F6', 'F7', 'F8'].includes(f.codice) || f.codice.startsWith('F'))
                  .slice(2, 8)
                  .map((f) => (
                    <tr key={f.codice} className="border-t border-slate-200">
                      <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-center text-slate-900">{f.codice}</td>
                      <td className="p-1.5 border-r border-slate-200 font-mono text-slate-600">{f.inizio} - {f.fine}</td>
                      <td className="p-1 border-r border-slate-200 bg-emerald-50/40">
                        <input
                          type="text"
                          placeholder="--:--"
                          value={f.oraReale || ''}
                          onChange={(e) => updateOraReale(f.codice, e.target.value)}
                          className="w-full px-1 py-1 border border-emerald-300 rounded font-mono text-xs text-center"
                        />
                      </td>
                      <td className="p-1.5 text-slate-800 truncate max-w-[140px]" title={f.cosaSuccede}>{f.nome}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Touch Cards View */}
          <div className="sm:hidden space-y-2">
            {ods.timelineFasi
              .filter((f) => ['F3', 'F4', 'F5', 'F6', 'F7', 'F8'].includes(f.codice) || f.codice.startsWith('F'))
              .slice(2, 8)
              .map((f) => (
                <div key={f.codice} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">
                        {f.codice}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 truncate">{f.nome}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Previsto: {f.inizio} - {f.fine}
                    </div>
                  </div>
                  <div className="w-24 shrink-0">
                    <label className="text-[10px] text-slate-500 font-semibold block text-center">Ora reale:</label>
                    <input
                      type="text"
                      placeholder="--:--"
                      value={f.oraReale || ''}
                      onChange={(e) => updateOraReale(f.codice, e.target.value)}
                      className="w-full px-2 py-1.5 border border-emerald-400 bg-emerald-50/40 rounded font-mono text-xs font-bold text-center focus:ring-1 focus:ring-emerald-500 min-h-[36px]"
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Chi è Dove */}
        <section className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1.5 mb-2 rounded">
            Chi è Dove (Postazioni & Addetti)
          </h2>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                  <th className="p-1.5 border-r border-slate-200 w-10 text-center">Cod</th>
                  <th className="p-1.5 border-r border-slate-200">Postazione</th>
                  <th className="p-1.5 border-r border-slate-200">Responsabile</th>
                  <th className="p-1.5 text-center w-14">Addetti</th>
                </tr>
              </thead>
              <tbody>
                {ods.postazioni.filter((p) => p.attiva).map((p) => {
                  const resp = ods.brigata.find((b) => b.id === p.responsabileId);
                  const count = Array.from(new Set([...p.faseA.addettiIds, ...p.faseB.addettiIds, ...p.faseC.addettiIds])).length;

                  return (
                    <tr key={p.codice} className="border-t border-slate-200">
                      <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-center text-slate-900">{p.codice}</td>
                      <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-900">{p.nome}</td>
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-medium text-slate-900">{resp?.cognomeNome || '-'}</div>
                        {resp?.cellulare && (
                          <a href={`tel:${resp.cellulare}`} className="text-emerald-700 font-mono text-[10px] block hover:underline">
                            {resp.cellulare}
                          </a>
                        )}
                      </td>
                      <td className="p-1.5 text-center font-mono font-bold text-slate-700">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Touch Cards View */}
          <div className="sm:hidden space-y-2">
            {ods.postazioni.filter((p) => p.attiva).map((p) => {
              const resp = ods.brigata.find((b) => b.id === p.responsabileId);
              const count = Array.from(new Set([...p.faseA.addettiIds, ...p.faseB.addettiIds, ...p.faseC.addettiIds])).length;

              return (
                <div key={p.codice} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-1.5 py-0.5 rounded">
                        {p.codice}
                      </span>
                      <span className="font-bold text-xs text-slate-950 truncate">{p.nome}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Resp: <strong className="text-slate-900">{resp?.cognomeNome || 'Da assegnare'}</strong> · {count} addetti
                    </div>
                  </div>

                  {resp?.cellulare ? (
                    <a
                      href={`tel:${resp.cellulare}`}
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 min-h-[44px]"
                      title="Chiama responsabile"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Chiama</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Numeri Utili Veloci (Griglia Click to Call) */}
      <section className="mb-5 border border-slate-300 rounded p-3 bg-slate-50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
          Numeri Utili Rapidi (Chiamata Diretta)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Capo Servizio</span>
            <div className="font-bold text-slate-900">{capoServizio?.nome || ods.scheda.redattoDa}</div>
            <a href={`tel:${capoServizio?.telefono}`} className="text-emerald-700 font-mono font-bold text-xs flex items-center hover:underline">
              <Phone className="w-3 h-3 mr-1" /> {capoServizio?.telefono || '-'}
            </a>
          </div>

          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Referente in Loco</span>
            <div className="font-bold text-slate-900">{referenteLocation?.nome || 'N/D'}</div>
            <a href={`tel:${referenteLocation?.telefono}`} className="text-emerald-700 font-mono font-bold text-xs flex items-center hover:underline">
              <Phone className="w-3 h-3 mr-1" /> {referenteLocation?.telefono || '-'}
            </a>
          </div>

          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Committente</span>
            <div className="font-bold text-slate-900 truncate">{committente?.nome || 'Cliente'}</div>
            <a href={`tel:${committente?.telefono}`} className="text-emerald-700 font-mono font-bold text-xs flex items-center hover:underline">
              <Phone className="w-3 h-3 mr-1" /> {committente?.telefono || '-'}
            </a>
          </div>

          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Cucina / Chef</span>
            <div className="font-bold text-slate-900">{chefCucina?.nome || 'Chef Spada'}</div>
            <a href={`tel:${chefCucina?.telefono}`} className="text-emerald-700 font-mono font-bold text-xs flex items-center hover:underline">
              <Phone className="w-3 h-3 mr-1" /> {chefCucina?.telefono || '-'}
            </a>
          </div>

          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Carico / Furgone</span>
            <div className="font-bold text-slate-900">{responsabileCarico?.nome || 'R. Neri'}</div>
            <a href={`tel:${responsabileCarico?.telefono}`} className="text-emerald-700 font-mono font-bold text-xs flex items-center hover:underline">
              <Phone className="w-3 h-3 mr-1" /> {responsabileCarico?.telefono || '-'}
            </a>
          </div>

          <div className="p-2 bg-rose-50 rounded border border-rose-300">
            <span className="text-[10px] text-rose-700 uppercase block font-bold">Emergenza Sanitaria</span>
            <div className="font-bold text-rose-950">NUE Emergenze</div>
            <a href="tel:112" className="text-rose-800 font-mono font-black text-sm flex items-center hover:underline">
              <Phone className="w-3.5 h-3.5 mr-1" /> 112 (Subito)
            </a>
          </div>
        </div>
      </section>

      {/* Registro Imprevisti Live */}
      <section className="mb-5 border border-slate-300 rounded p-3 bg-slate-50/50">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded">
            Registro Live Imprevisti in Servizio
          </h2>
          <button
            onClick={() => setMostraFormImprevisto(!mostraFormImprevisto)}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors no-print cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registra Imprevisto</span>
          </button>
        </div>

        {mostraFormImprevisto && (
          <form onSubmit={addImprevisto} className="mb-3 p-3 bg-white border border-slate-300 rounded text-xs space-y-2 no-print">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 font-bold block">Ora:</label>
                <input
                  type="text"
                  value={nuovoImprevisto.ora}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, ora: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-[11px] text-slate-500 font-bold block">Cosa è successo:</label>
                <input
                  type="text"
                  placeholder="es. Bottiglia rotta vicino buvette / calo tensione..."
                  value={nuovoImprevisto.situazione}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, situazione: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 font-bold block">Chi gestisce / avvisato:</label>
                <input
                  type="text"
                  placeholder="es. Matteo Valli + addetto P6"
                  value={nuovoImprevisto.chiAvvisareOGestisce}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, chiAvvisareOGestisce: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold block">Esito / Prima azione:</label>
                <input
                  type="text"
                  placeholder="es. Pavimento asciugato, nessun ferito"
                  value={nuovoImprevisto.esito}
                  onChange={(e) => setNuovoImprevisto({ ...nuovoImprevisto, esito: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMostraFormImprevisto(false)}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded"
              >
                Salva Imprevisto
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <th className="p-1.5 border-r border-slate-200 w-16 text-center">Ora</th>
                <th className="p-1.5 border-r border-slate-200">Cosa è successo</th>
                <th className="p-1.5 border-r border-slate-200 w-44">Chi gestisce</th>
                <th className="p-1.5 w-44">Esito</th>
              </tr>
            </thead>
            <tbody>
              {ods.imprevistiLive.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-400 italic">
                    Nessun imprevisto registrato finora. Servizio regolare.
                  </td>
                </tr>
              ) : (
                ods.imprevistiLive.map((imp) => (
                  <tr key={imp.id} className="border-t border-slate-200">
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-center text-slate-900">{imp.ora}</td>
                    <td className="p-1.5 border-r border-slate-200 font-medium text-slate-900">{imp.situazione}</td>
                    <td className="p-1.5 border-r border-slate-200 text-slate-700">{imp.chiAvvisareOGestisce}</td>
                    <td className="p-1.5 text-emerald-900 font-medium">{imp.esito}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chiusura Rapida */}
      <section className="border-t-2 border-slate-900 pt-3">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1 mb-2 rounded">
          Chiusura Rapida & Checklist Fine Servizio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="space-y-1.5 text-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Pax effettivi:</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                Adulti: <strong>{ods.chiusura.paxRealiAdulti || ods.scheda.ospitiAdulti}</strong> · Bambini: <strong>{ods.chiusura.paxRealiBambini || ods.scheda.ospitiBambiniSpeciali}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Sbarazzo e pulizia completati, rifiuti differenziati raccolti</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Materiale contato per contenitore C1..C8 e postazione P1..P10</span>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Rotture e mancanze annotate con quantità sul modello completo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Via libera del Capo Servizio alla brigata prima dello scioglimento</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Carico di ritorno ultimato con firma di consegna sul mezzo</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
