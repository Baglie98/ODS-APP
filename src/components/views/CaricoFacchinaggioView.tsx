import React from 'react';
import { MasterODS } from '../../types/ods';
import { getCaricoDistribuzionePostazioni } from '../../utils/odsDerivations';
import { Truck, CheckSquare, Square, Package, AlertTriangle, FileText, Phone } from 'lucide-react';

interface CaricoFacchinaggioViewProps {
  ods: MasterODS;
  onUpdateODS: (updated: MasterODS) => void;
}

export const CaricoFacchinaggioView: React.FC<CaricoFacchinaggioViewProps> = ({ ods, onUpdateODS }) => {
  const referenteLocation = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('location') || c.ruolo.toLowerCase().includes('loco'));
  const responsabileCarico = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('carico') || c.ruolo.toLowerCase().includes('logistica'));

  const toggleChecklistContenitore = (codice: string, stage: 'checkCaricoBase' | 'checkScaricoLocation' | 'checkCaricoRitorno' | 'checkScaricoBase') => {
    const updated = ods.contenitori.map((c) =>
      c.codice === codice ? { ...c, [stage]: !c[stage] } : c
    );
    onUpdateODS({ ...ods, contenitori: updated });
  };

  const toggleFornitoreCheck = (id: string, field: 'verificatoInArrivo' | 'restituito') => {
    const updated = ods.fornitoriNoleggi.map((f) =>
      f.id === id ? { ...f, [field]: !f[field] } : f
    );
    onUpdateODS({ ...ods, fornitoriNoleggi: updated });
  };

  const updateVerbale = (field: string, val: string) => {
    onUpdateODS({
      ...ods,
      verbaleCarico: {
        ...ods.verbaleCarico,
        [field]: val,
      },
    });
  };

  const distribuzioni = getCaricoDistribuzionePostazioni(ods);

  return (
    <div className="ods-paper rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-2xl max-w-5xl mx-auto my-4 sm:my-6 print:p-0 print:border-none print:shadow-none font-sans">
      {/* Official Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
              ORDINE DI SERVIZIO DERIVATO · LOGISTICA & MOVIMENTAZIONE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight font-display flex items-center gap-2.5">
              <Truck className="w-7 h-7 text-slate-900 no-print" />
              Carico e Facchinaggio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cosa carichi, dove va, a che ora · Dati sincronizzati dal Modello Completo (Sez. 7 e 8)
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-300">
            <div><strong>ODS n°:</strong> {ods.scheda.odsNumero}</div>
            <div>{ods.scheda.revisioneCorrente} · {ods.scheda.dataRevisione}</div>
            <div className="text-slate-950 font-bold mt-1">OPERATIVO LOGISTICA</div>
          </div>
        </div>
      </div>

      {/* 1. Evento, Orari e Accessi */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-2 rounded-lg">
          01. Evento, Orari e Accessi di Carico / Scarico
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs border border-slate-300 rounded-lg p-3.5 bg-slate-50/50">
          <div className="space-y-1.5">
            <div><strong className="text-slate-600">Evento · Data:</strong> <span className="font-semibold text-slate-900">{ods.scheda.eventoNomeTipo} · {ods.scheda.data}</span></div>
            <div><strong className="text-slate-600">Luogo (indirizzo):</strong> {ods.scheda.luogoIndirizzo}</div>
            <div><strong className="text-slate-600">Punto di carico / scarico in location:</strong> <span className="text-slate-900 font-medium">{ods.locationAccessi.caricoScaricoPuntoFascia}</span></div>
            <div><strong className="text-slate-600">Parcheggio, ZTL e permessi:</strong> {ods.locationAccessi.parcheggioMezzo} · {ods.locationAccessi.ztlPermessiAccesso}</div>
            <div><strong className="text-slate-600">Percorso interno:</strong> {ods.locationAccessi.percorsoInterno}</div>
          </div>

          <div className="space-y-1.5 border-t md:border-t-0 md:border-l md:border-slate-300 md:pl-3 pt-2 md:pt-0">
            <div><strong className="text-slate-600">Mezzo e targa · autista:</strong> <span className="font-mono text-slate-950 font-bold">{ods.moduloM4.mezzoTargaAutista || 'Iveco Daily Frigo'}</span></div>
            <div><strong className="text-slate-600">Squadra carico alla base:</strong> {ods.moduloM4.squadraCaricoBase || 'Roberto Neri, Tommaso Barone'}</div>
            <div><strong className="text-slate-600">Squadra scarico in location:</strong> {ods.moduloM4.squadraScaricoLocation || 'Roberto Neri, Matteo Valli, Davide Ricci'}</div>
            <div className="pt-1.5 flex items-center justify-between border-t border-slate-200">
              <span className="text-slate-700 font-medium">Referente in loco ({referenteLocation?.nome}):</span>
              <a href={`tel:${referenteLocation?.telefono}`} className="font-mono font-bold text-slate-950 flex items-center hover:underline">
                <Phone className="w-3 h-3 mr-1 text-slate-500" /> {referenteLocation?.telefono || '-'}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Responsabile carico ({responsabileCarico?.nome}):</span>
              <a href={`tel:${responsabileCarico?.telefono}`} className="font-mono font-bold text-slate-950 flex items-center hover:underline">
                <Phone className="w-3 h-3 mr-1 text-slate-500" /> {responsabileCarico?.telefono || '-'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Movimenti Logistica */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-2 rounded-lg flex items-center justify-between">
          <span>02. Movimenti e Viaggi Logistici</span>
          <span className="text-[11px] font-normal opacity-80 font-mono">
            Regola aurea: Si carica in ordine inverso rispetto allo scarico
          </span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300">Movimento</th>
                <th className="p-2 border-r border-slate-300 w-36">Data e ora</th>
                <th className="p-2 border-r border-slate-300 w-36">Chi</th>
                <th className="p-2 border-r border-slate-300 w-24">Giri</th>
                <th className="p-2">Note operative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ods.logistica.map((mov) => (
                <tr key={mov.id}>
                  <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">{mov.tipoMovimento}</td>
                  <td className="p-2 border-r border-slate-300 font-mono text-slate-800 font-bold">{mov.dataOra}</td>
                  <td className="p-2 border-r border-slate-300 text-slate-700">{mov.chi}</td>
                  <td className="p-2 border-r border-slate-300 font-mono text-slate-600">{mov.giri || '1 giro'}</td>
                  <td className="p-2 text-slate-700">{mov.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Contenitori Checklist (4 Fasi interattive!) */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-2 rounded-lg flex items-center justify-between">
          <span>03. Contenitori & Controllo Avanzamento a 4 Stadi</span>
          <span className="text-[11px] font-normal opacity-80 font-mono">
            Spunta operativa al carico e allo scarico
          </span>
        </h2>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-12 text-center">Cod</th>
                <th className="p-2 border-r border-slate-300 w-36">Contenitore</th>
                <th className="p-2 border-r border-slate-300">Contenuto sintetico</th>
                <th className="p-2 border-r border-slate-300 w-28">Destinaz.</th>
                <th className="p-2 border-r border-slate-300 text-center w-16 bg-blue-50/70 text-blue-950 font-bold">1. Carico Base</th>
                <th className="p-2 border-r border-slate-300 text-center w-16 bg-emerald-50/70 text-emerald-950 font-bold">2. Scarico Loc.</th>
                <th className="p-2 border-r border-slate-300 text-center w-16 bg-amber-50/70 text-amber-950 font-bold">3. Carico Ritorno</th>
                <th className="p-2 text-center w-16 bg-purple-50/70 text-purple-950 font-bold">4. Scarico Base</th>
              </tr>
            </thead>
            <tbody>
              {ods.contenitori.map((c) => (
                <tr key={c.codice} className="border-t border-slate-300 hover:bg-slate-50/60">
                  <td className="p-2 border-r border-slate-300 font-mono font-bold text-center text-slate-900">{c.codice}</td>
                  <td className="p-2 border-r border-slate-300 font-medium text-slate-800">
                    <div>{c.tipo}</div>
                    <div className="text-[11px] font-mono text-slate-500">{c.pesoIngombro}</div>
                  </td>
                  <td className="p-2 border-r border-slate-300 text-slate-900 font-medium">{c.contenutoSintetico}</td>
                  <td className="p-2 border-r border-slate-300 font-semibold text-emerald-900">{c.destinazione}</td>

                  {/* 4 Checkbox stages */}
                  <td className="p-2 border-r border-slate-300 text-center bg-blue-50/30">
                    <button
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkCaricoBase')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkCaricoBase ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>

                  <td className="p-2 border-r border-slate-300 text-center bg-emerald-50/30">
                    <button
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkScaricoLocation')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkScaricoLocation ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>

                  <td className="p-2 border-r border-slate-300 text-center bg-amber-50/30">
                    <button
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkCaricoRitorno')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkCaricoRitorno ? (
                        <CheckSquare className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>

                  <td className="p-2 text-center bg-purple-50/30">
                    <button
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkScaricoBase')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkScaricoBase ? (
                        <CheckSquare className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Touch Cards View (One-handed Thumb friendly) */}
        <div className="md:hidden space-y-3">
          {ods.contenitori.map((c) => (
            <div key={c.codice} className="bg-white p-3 rounded-lg border border-slate-300 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                      {c.codice}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{c.tipo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.pesoIngombro}</div>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {c.destinazione}
                </span>
              </div>

              <div className="text-xs text-slate-800 font-medium">
                {c.contenutoSintetico}
              </div>

              {/* 4 Large Touch Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => toggleChecklistContenitore(c.codice, 'checkCaricoBase')}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold min-h-[44px] border cursor-pointer ${
                    c.checkCaricoBase
                      ? 'bg-blue-100 border-blue-400 text-blue-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>1. Carico Base</span>
                  {c.checkCaricoBase ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistContenitore(c.codice, 'checkScaricoLocation')}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold min-h-[44px] border cursor-pointer ${
                    c.checkScaricoLocation
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>2. Scarico Loc.</span>
                  {c.checkScaricoLocation ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistContenitore(c.codice, 'checkCaricoRitorno')}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold min-h-[44px] border cursor-pointer ${
                    c.checkCaricoRitorno
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>3. Carico Rit.</span>
                  {c.checkCaricoRitorno ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistContenitore(c.codice, 'checkScaricoBase')}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold min-h-[44px] border cursor-pointer ${
                    c.checkScaricoBase
                      ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>4. Scarico Base</span>
                  {c.checkScaricoBase ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Distribuzione per Postazione & 5. Fornitori e Noleggi */}
      {/* 4. Distribuzione per Postazione & 5. Fornitori e Noleggi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Distribuzione per Postazione */}
        <section className="border border-slate-300 rounded-lg p-4 bg-slate-50/30">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-1.5 mb-3 rounded">
            04. Distribuzione per Postazione
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <th className="p-1.5 border-r border-slate-300">Postazione</th>
                  <th className="p-1.5 border-r border-slate-300">Contenitori da portare</th>
                  <th className="p-1.5 border-r border-slate-300">Fuori contenitore</th>
                  <th className="p-1.5 text-center w-12">Posiz.</th>
                </tr>
              </thead>
              <tbody>
                {distribuzioni.map((d) => (
                  <tr key={d.postazioneCod} className="border-t border-slate-300">
                    <td className="p-1.5 border-r border-slate-300 font-bold text-slate-900">
                      {d.postazioneCod} · {d.postazioneNome}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-slate-900 font-semibold">{d.contenitori}</td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-700">{d.fuoriContenitore}</td>
                    <td className="p-1.5 text-center">
                      <input type="checkbox" className="rounded text-slate-900 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fornitori e Noleggi */}
        <section className="border border-slate-300 rounded-lg p-4 bg-slate-50/30">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-1.5 mb-3 rounded">
            05. Fornitori e Noleggi (Arrivi e Resi)
          </h2>
          {ods.fornitoriNoleggi.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 text-center">Nessun fornitore di noleggio esterno registrato per questo evento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-1.5 border-r border-slate-300">Fornitore & Cosa</th>
                    <th className="p-1.5 border-r border-slate-300">Consegna / Ritiro</th>
                    <th className="p-1.5 border-r border-slate-300 text-center w-16">In arrivo</th>
                    <th className="p-1.5 text-center w-16">Restituito</th>
                  </tr>
                </thead>
                <tbody>
                  {ods.fornitoriNoleggi.map((f) => (
                    <tr key={f.id} className="border-t border-slate-300">
                      <td className="p-1.5 border-r border-slate-300">
                        <div className="font-bold text-slate-900">{f.fornitore}</div>
                        <div className="text-[11px] text-slate-600">{f.cosa}</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-300 font-mono text-[11px] text-slate-700">{f.consegnaRitiro}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center">
                        <button
                          onClick={() => toggleFornitoreCheck(f.id, 'verificatoInArrivo')}
                          className="cursor-pointer"
                        >
                          {f.verificatoInArrivo ? (
                            <CheckSquare className="w-4 h-4 text-slate-900 inline" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 inline" />
                          )}
                        </button>
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          onClick={() => toggleFornitoreCheck(f.id, 'restituito')}
                          className="cursor-pointer"
                        >
                          {f.restituito ? (
                            <CheckSquare className="w-4 h-4 text-slate-900 inline" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 inline" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* 6. Verbale di Carico e Firme */}
      <section className="border-t-2 border-slate-900 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-3 rounded-lg flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>06. Verbale di Carico, Ricezione e Rientro</span>
        </h2>
        <div className="mb-3">
          <label className="text-xs font-semibold text-slate-700 block mb-1">Mancanze e danni segnalati:</label>
          <textarea
            rows={2}
            value={ods.verbaleCarico.mancanzeDanniSegnalati}
            onChange={(e) => updateVerbale('mancanzeDanniSegnalati', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
            placeholder="Nessuna mancanza segnalata..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span className="text-[11px] text-slate-500 font-semibold block">Carico alla base: firma, data e ora</span>
            <input
              type="text"
              value={ods.verbaleCarico.caricoBaseFirmaDataOra}
              onChange={(e) => updateVerbale('caricoBaseFirmaDataOra', e.target.value)}
              className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono font-medium"
              placeholder="es. R. Neri - 15/10 ore 14:25"
            />
          </div>

          <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span className="text-[11px] text-slate-500 font-semibold block">Ricezione in location: firma, data e ora</span>
            <input
              type="text"
              value={ods.verbaleCarico.ricezioneLocationFirmaDataOra}
              onChange={(e) => updateVerbale('ricezioneLocationFirmaDataOra', e.target.value)}
              className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono font-medium"
              placeholder="es. M. Valli - 15/10 ore 16:00"
            />
          </div>

          <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span className="text-[11px] text-slate-500 font-semibold block">Rientro alla base: firma, data e ora</span>
            <input
              type="text"
              value={ods.verbaleCarico.rientroBaseFirmaDataOra}
              onChange={(e) => updateVerbale('rientroBaseFirmaDataOra', e.target.value)}
              className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono font-medium"
              placeholder="es. R. Neri - 16/10 ore 01:55"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
