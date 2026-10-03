import React from 'react';
import { MasterODS } from '../../types/ods';
import { Phone, CheckSquare, Square, AlertCircle, ShieldAlert, Clock, Sparkles } from 'lucide-react';

interface CapoServizioViewProps {
  ods: MasterODS;
  onUpdateODS: (updated: MasterODS) => void;
}

export const CapoServizioView: React.FC<CapoServizioViewProps> = ({ ods, onUpdateODS }) => {
  const committente = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('committente'));
  const referenteLocation = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('location') || c.ruolo.toLowerCase().includes('loco'));
  const responsabileCarico = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('carico') || c.ruolo.toLowerCase().includes('logistica'));
  const capoServizio = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('capo servizio'));

  const toggleControllo = (id: string) => {
    const updated = ods.controlliCapoServizio.map((chk) =>
      chk.id === id ? { ...chk, completato: !chk.completato } : chk
    );
    onUpdateODS({ ...ods, controlliCapoServizio: updated });
  };

  const updateOraRealeFase = (codice: string, oraReale: string) => {
    const updated = ods.timelineFasi.map((f) => (f.codice === codice ? { ...f, oraReale } : f));
    onUpdateODS({ ...ods, timelineFasi: updated });
  };

  const updateVerificaMateriale = (postazioneCod: string, field: 'materialeCompleto' | 'ok', val: boolean) => {
    const updated = ods.verificheMateriale.map((vm) =>
      vm.postazioneCod === postazioneCod ? { ...vm, [field]: val } : vm
    );
    onUpdateODS({ ...ods, verificheMateriale: updated });
  };

  const updateMancanzeText = (postazioneCod: string, mancanze: string) => {
    const updated = ods.verificheMateriale.map((vm) =>
      vm.postazioneCod === postazioneCod ? { ...vm, mancanze } : vm
    );
    onUpdateODS({ ...ods, verificheMateriale: updated });
  };

  const updateChiusuraRapida = (field: string, val: string | number) => {
    onUpdateODS({
      ...ods,
      chiusura: {
        ...ods.chiusura,
        [field]: val,
      },
    });
  };

  const controlliGiornoPrima = ods.controlliCapoServizio.filter((c) => c.tipo === 'giorno_prima');
  const controlliAllArrivo = ods.controlliCapoServizio.filter((c) => c.tipo === 'all_arrivo');
  const controlliBriefing = ods.controlliCapoServizio.filter((c) => c.tipo === 'briefing');

  return (
    <div className="bg-white text-slate-900 shadow-sm border border-slate-200 rounded-lg p-6 sm:p-8 max-w-5xl mx-auto my-6 print:p-0 print:border-none print:shadow-none">
      {/* Official Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">
              ORDINE DI SERVIZIO DERIVATO · COSA SAPERE, CONTROLLARE E DECIDERE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Capo Servizio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Dati sincronizzati dalla Fonte Unica (Modello Completo) · Solo l'ultima revisione è valida
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-700 bg-slate-100 p-2.5 rounded border border-slate-300">
            <div><strong>ODS n°:</strong> {ods.scheda.odsNumero}</div>
            <div><strong>{ods.scheda.revisioneCorrente}</strong> del {ods.scheda.dataRevisione}</div>
            <div className="text-emerald-700 font-semibold mt-1">STATO OPERATIVO</div>
          </div>
        </div>
      </div>

      {/* 1. Evento e Contatti */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 mb-3 flex items-center justify-between">
          <span>1. Evento e Contatti Chiave</span>
          <span className="text-xs font-normal opacity-80">Rapporto pax/addetto: {( (ods.scheda.ospitiAdulti + ods.scheda.ospitiBambiniSpeciali) / (ods.brigata.length || 1) ).toFixed(1)}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 rounded p-3 bg-slate-50/50 space-y-2">
            <div><span className="font-semibold text-slate-600">Evento:</span> <strong className="text-slate-900">{ods.scheda.eventoNomeTipo}</strong></div>
            <div><span className="font-semibold text-slate-600">Data:</span> <span className="font-mono">{ods.scheda.data}</span></div>
            <div><span className="font-semibold text-slate-600">Luogo:</span> {ods.scheda.luogoIndirizzo}</div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 font-mono">
              <div><span className="text-slate-500">Inizio:</span> <strong>{ods.scheda.inizioEvento}</strong></div>
              <div><span className="text-slate-500">Fine prevista:</span> <strong>{ods.scheda.fineEvento}</strong></div>
              <div><span className="text-slate-500">Ingresso Staff:</span> <strong>{ods.scheda.ingressoStaff}</strong></div>
              <div><span className="text-slate-500">Pax totali:</span> <strong>{ods.scheda.ospitiAdulti + ods.scheda.ospitiBambiniSpeciali}</strong></div>
            </div>
            <div><span className="font-semibold text-slate-600">Formato:</span> <span className="uppercase font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{ods.scheda.formato.replace(/_/g, ' ')}</span></div>
          </div>

          <div className="border border-slate-200 rounded p-3 bg-slate-50/50 space-y-2">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">Numeri di Telefono Rapidi (Click to Call)</h3>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Committente ({committente?.nome || 'N/D'}):</span>
              <a href={`tel:${committente?.telefono}`} className="font-mono text-emerald-700 font-bold hover:underline flex items-center">
                <Phone className="w-3 h-3 mr-1" /> {committente?.telefono || '-'}
              </a>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Referente Loco ({referenteLocation?.nome || 'N/D'}):</span>
              <a href={`tel:${referenteLocation?.telefono}`} className="font-mono text-emerald-700 font-bold hover:underline flex items-center">
                <Phone className="w-3 h-3 mr-1" /> {referenteLocation?.telefono || '-'}
              </a>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Resp. Carico ({responsabileCarico?.nome || 'N/D'}):</span>
              <a href={`tel:${responsabileCarico?.telefono}`} className="font-mono text-emerald-700 font-bold hover:underline flex items-center">
                <Phone className="w-3 h-3 mr-1" /> {responsabileCarico?.telefono || '-'}
              </a>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-700 font-medium">Capo Servizio ({capoServizio?.nome || ods.scheda.redattoDa}):</span>
              <a href={`tel:${capoServizio?.telefono}`} className="font-mono text-emerald-700 font-bold hover:underline flex items-center">
                <Phone className="w-3 h-3 mr-1" /> {capoServizio?.telefono || '-'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Fasi e Orari con Colonna Ora Reale */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 mb-2 flex items-center justify-between">
          <span>2. Fasi e Orari (Compilazione Ora Reale Live)</span>
          <span className="text-xs font-normal opacity-80">F1 - F9</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-12 text-center">Fase</th>
                <th className="p-2 border-r border-slate-300 w-28">Inizio / Fine</th>
                <th className="p-2 border-r border-slate-300">Cosa succede</th>
                <th className="p-2 border-r border-slate-300 w-36">Guida (responsabile)</th>
                <th className="p-2 w-28 bg-emerald-50 text-emerald-950 font-bold">Ora reale</th>
              </tr>
            </thead>
            <tbody>
              {ods.timelineFasi.map((f, idx) => (
                <tr key={f.codice} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="p-2 border-t border-r border-slate-300 font-mono font-bold text-center text-slate-800">{f.codice}</td>
                  <td className="p-2 border-t border-r border-slate-300 font-mono">{f.inizio} - {f.fine}</td>
                  <td className="p-2 border-t border-r border-slate-300 font-medium text-slate-900">{f.cosaSuccede}</td>
                  <td className="p-2 border-t border-r border-slate-300 text-slate-700">{f.guidaResponsabile}</td>
                  <td className="p-1 border-t border-slate-300 bg-emerald-50/50">
                    <input
                      type="text"
                      placeholder="es. 16:10"
                      value={f.oraReale || ''}
                      onChange={(e) => updateOraRealeFase(f.codice, e.target.value)}
                      className="w-full px-2 py-1 border border-emerald-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Brigata e Postazioni per Fase */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 mb-2 flex items-center justify-between">
          <span>3. Brigata e Postazioni</span>
          <span className="text-xs font-normal opacity-80">Assegnazioni per fase</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-12 text-center">Cod</th>
                <th className="p-2 border-r border-slate-300 w-44">Postazione</th>
                <th className="p-2 border-r border-slate-300 w-40">Responsabile</th>
                <th className="p-2 border-r border-slate-300">Fase A · Allestimento</th>
                <th className="p-2 border-r border-slate-300">Fase B · Servizio</th>
                <th className="p-2">Fase C · Sbarazzo</th>
              </tr>
            </thead>
            <tbody>
              {ods.postazioni.filter((p) => p.attiva).map((p, idx) => {
                const resp = ods.brigata.find((b) => b.id === p.responsabileId)?.cognomeNome || '-';
                const namesA = p.faseA.addettiIds.map((id) => ods.brigata.find((b) => b.id === id)?.cognomeNome || id).join(', ');
                const namesB = p.faseB.addettiIds.map((id) => ods.brigata.find((b) => b.id === id)?.cognomeNome || id).join(', ');
                const namesC = p.faseC.addettiIds.map((id) => ods.brigata.find((b) => b.id === id)?.cognomeNome || id).join(', ');

                return (
                  <tr key={p.codice} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="p-2 border-t border-r border-slate-300 font-mono font-bold text-center text-slate-800">{p.codice}</td>
                    <td className="p-2 border-t border-r border-slate-300 font-semibold text-slate-900">{p.nome}</td>
                    <td className="p-2 border-t border-r border-slate-300 text-emerald-900 font-medium">{resp}</td>
                    <td className="p-2 border-t border-r border-slate-300 text-slate-700">
                      <div className="font-mono text-slate-500">{p.faseA.orario}</div>
                      <div>{namesA || '-'}</div>
                    </td>
                    <td className="p-2 border-t border-r border-slate-300 text-slate-700">
                      <div className="font-mono text-slate-500">{p.faseB.orario}</div>
                      <div>{namesB || '-'}</div>
                    </td>
                    <td className="p-2 border-t border-slate-300 text-slate-700">
                      <div className="font-mono text-slate-500">{p.faseC.orario}</div>
                      <div>{namesC || '-'}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Controlli Prima dell'Evento & 5. Verifica Materiale Postazione */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Controlli Checklists */}
        <section className="border border-slate-300 rounded p-4 bg-slate-50/30">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2.5 py-1 mb-3 rounded">
            4. Controlli Prima dell'Evento
          </h2>

          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
              Il giorno prima
            </h3>
            <div className="space-y-2 text-xs">
              {controlliGiornoPrima.map((chk) => (
                <button
                  key={chk.id}
                  onClick={() => toggleControllo(chk.id)}
                  className="flex items-center gap-3 text-left w-full hover:bg-slate-100 p-2.5 rounded-lg transition-colors min-h-[44px] border border-slate-200/60 bg-white shadow-2xs cursor-pointer"
                >
                  {chk.completato ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <span className={chk.completato ? 'line-through text-slate-400 font-normal' : 'text-slate-900 font-medium'}>
                    {chk.testo}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
              All'arrivo in location
            </h3>
            <div className="space-y-2 text-xs">
              {controlliAllArrivo.map((chk) => (
                <button
                  key={chk.id}
                  onClick={() => toggleControllo(chk.id)}
                  className="flex items-center gap-3 text-left w-full hover:bg-slate-100 p-2.5 rounded-lg transition-colors min-h-[44px] border border-slate-200/60 bg-white shadow-2xs cursor-pointer"
                >
                  {chk.completato ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <span className={chk.completato ? 'line-through text-slate-400 font-normal' : 'text-slate-900 font-medium'}>
                    {chk.testo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Verifica Materiale per Postazione */}
        <section className="border border-slate-300 rounded p-4 bg-slate-50/30">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2.5 py-1 mb-3 rounded">
            5. Verifica Materiale per Postazione
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <th className="p-1.5 border-r border-slate-300">Postazione</th>
                  <th className="p-1.5 border-r border-slate-300 text-center w-16">Completo</th>
                  <th className="p-1.5 border-r border-slate-300">Mancanze / Note</th>
                  <th className="p-1.5 text-center w-12">Ok</th>
                </tr>
              </thead>
              <tbody>
                {ods.verificheMateriale.map((vm) => (
                  <tr key={vm.postazioneCod} className="border-t border-slate-300">
                    <td className="p-1.5 border-r border-slate-300">
                      <div className="font-bold text-slate-900">{vm.postazioneCod}</div>
                      <div className="text-[11px] text-slate-500">{vm.responsabileNome}</div>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-center">
                      <input
                        type="checkbox"
                        checked={vm.materialeCompleto}
                        onChange={(e) => updateVerificaMateriale(vm.postazioneCod, 'materialeCompleto', e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-300">
                      <input
                        type="text"
                        value={vm.mancanze}
                        placeholder="Nessuna"
                        onChange={(e) => updateMancanzeText(vm.postazioneCod, e.target.value)}
                        className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={vm.ok}
                        onChange={(e) => updateVerificaMateriale(vm.postazioneCod, 'ok', e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 6. Briefing Finale (Checklist 7 punti) */}
      <section className="mb-6 border border-slate-300 rounded p-4 bg-slate-50/50">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-2.5 py-1 mb-3 rounded flex items-center justify-between">
          <span>6. Briefing Finale con la Brigata</span>
          <span className="text-[11px] font-normal opacity-80">Prima dell'apertura porte</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {controlliBriefing.map((chk) => (
            <button
              key={chk.id}
              onClick={() => toggleControllo(chk.id)}
              className="flex items-center gap-3 text-left hover:bg-slate-100 p-2.5 rounded-lg transition-colors min-h-[44px] border border-slate-200/60 bg-white shadow-2xs cursor-pointer"
            >
              {chk.completato ? (
                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <span className={chk.completato ? 'line-through text-slate-400 font-normal' : 'text-slate-900 font-semibold'}>
                {chk.testo}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 7. Imprevisti Matrice Decisionale */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 mb-2">
          7. Gestione Imprevisti (Protocollo Immediato)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-44">Situazione</th>
                <th className="p-2 border-r border-slate-300">Prima azione (da concordare nel briefing)</th>
                <th className="p-2 w-48">Chi avvisare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">Assenza di un addetto</td>
                <td className="p-2 border-r border-slate-300 text-slate-700">Riassegnare runner e accorpare buvette se necessario. Contattare eventuale riserva di turno.</td>
                <td className="p-2 text-slate-700">Capo servizio immediato</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">Materiale mancante o rotto</td>
                <td className="p-2 border-r border-slate-300 text-slate-700">Verifica scorte di riserva nel cassone C6 o lavaggio rapido stoviglie in back.</td>
                <td className="p-2 text-slate-700">Responsabile carico Roberto Neri</td>
              </tr>
              <tr className="bg-rose-50/60 text-rose-950">
                <td className="p-2 border-r border-slate-300 font-bold text-rose-900 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  Ospite con allergia o reazione
                </td>
                <td className="p-2 border-r border-slate-300 font-semibold">
                  Se grave: chiamata immediata 112 NUE; fornire kit cortisone se prescritto. Non somministrare cibi non certificati.
                </td>
                <td className="p-2 font-bold text-rose-700">112 Emergenza sanitaria + Referente location</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">Malore o infortunio staff/ospiti</td>
                <td className="p-2 border-r border-slate-300 text-slate-700">Intervento addetto primo soccorso (cassetta in cucina). Se necessario 112.</td>
                <td className="p-2 text-slate-700">Capo servizio + 112</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">Ritardo sull'orario d'inizio</td>
                <td className="p-2 border-r border-slate-300 text-slate-700">Tenere cibi al caldo nei bagnomaria; rallentare passata finger food; prolungare welcome drink.</td>
                <td className="p-2 text-slate-700">Cucina e Chef Spada</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">Richiesta committente fuori programma</td>
                <td className="p-2 border-r border-slate-300 text-slate-700">Valutare fattibilità con la cucina prima di dare conferma verbale. Annotare su ODS.</td>
                <td className="p-2 text-slate-700">Capo servizio con committente</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Chiusura Rapida */}
      <section className="border-t-2 border-slate-900 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 mb-3 flex items-center justify-between">
          <span>8. Chiusura Rapida Post-Servizio</span>
          <span className="text-xs font-normal opacity-80">Da trascrivere nella Sezione 10 entro 12h</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3 font-mono">
          <div>
            <label className="text-slate-600 block text-[11px] font-sans">Pax reali adulti:</label>
            <input
              type="number"
              value={ods.chiusura.paxRealiAdulti || ''}
              onChange={(e) => updateChiusuraRapida('paxRealiAdulti', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-slate-300 rounded font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="text-slate-600 block text-[11px] font-sans">Pax reali bambini:</label>
            <input
              type="number"
              value={ods.chiusura.paxRealiBambini || ''}
              onChange={(e) => updateChiusuraRapida('paxRealiBambini', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 border border-slate-300 rounded font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="text-slate-600 block text-[11px] font-sans">Inizio effettivo:</label>
            <input
              type="text"
              placeholder="es. 19:40"
              value={ods.chiusura.inizioReale || ''}
              onChange={(e) => updateChiusuraRapida('inizioReale', e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded text-slate-900"
            />
          </div>
          <div>
            <label className="text-slate-600 block text-[11px] font-sans">Fine effettiva:</label>
            <input
              type="text"
              placeholder="es. 23:55"
              value={ods.chiusura.fineReale || ''}
              onChange={(e) => updateChiusuraRapida('fineReale', e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Assenze e sostituzioni:</label>
            <textarea
              rows={2}
              value={ods.chiusura.assenzeSostituzioni}
              onChange={(e) => updateChiusuraRapida('assenzeSostituzioni', e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded text-slate-800"
              placeholder="Nessuna assenza..."
            />
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Rotture e mancanze veloci:</label>
            <textarea
              rows={2}
              value={ods.chiusura.rottureDanni.map((r) => `${r.qta}x ${r.voce}`).join(', ') || 'Nessuna rottura'}
              readOnly
              className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-slate-50"
            />
          </div>
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Cosa cambiare la prossima volta:</label>
            <textarea
              rows={2}
              value={ods.chiusura.cosaCambiareProssimaVolta}
              onChange={(e) => updateChiusuraRapida('cosaCambiareProssimaVolta', e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded text-slate-800"
              placeholder="Appunti operativi..."
            />
          </div>
        </div>
      </section>
    </div>
  );
};
