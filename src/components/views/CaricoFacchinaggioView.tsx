import React, { useState } from 'react';
import { MasterODS, ContenitoreMaster } from '../../types/ods';
import { getCaricoDistribuzionePostazioni } from '../../utils/odsDerivations';
import { 
  Truck, 
  CheckSquare, 
  Square, 
  Package, 
  Phone, 
  Check, 
  Plus, 
} from 'lucide-react';

interface CaricoFacchinaggioViewProps {
  ods: MasterODS;
  onUpdateODS: (updated: MasterODS) => void;
}

export const CaricoFacchinaggioView: React.FC<CaricoFacchinaggioViewProps> = ({ ods, onUpdateODS }) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [nuovoContenitore, setNuovoContenitore] = useState({
    codice: `C${ods.contenitori.length + 1}`,
    tipo: 'Cassone Plastica',
    contenutoSintetico: '',
    destinazione: 'P1 Welcome Drink',
    pesoIngombro: '1 cassa 60x40 (~15 kg)',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const referenteLocation = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('location') || c.ruolo.toLowerCase().includes('loco'));
  const responsabileCarico = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('carico') || c.ruolo.toLowerCase().includes('logistica'));

  const toggleChecklistContenitore = (codice: string, stage: 'checkCaricoBase' | 'checkScaricoLocation' | 'checkCaricoRitorno' | 'checkScaricoBase') => {
    const updated = ods.contenitori.map((c) =>
      c.codice === codice ? { ...c, [stage]: !c[stage] } : c
    );
    onUpdateODS({ ...ods, contenitori: updated });
  };

  const spuntaTuttoStadio = (stage: 'checkCaricoBase' | 'checkScaricoLocation' | 'checkCaricoRitorno' | 'checkScaricoBase', stato: boolean) => {
    const updated = ods.contenitori.map((c) => ({
      ...c,
      [stage]: stato,
    }));
    onUpdateODS({ ...ods, contenitori: updated });
    const label = 
      stage === 'checkCaricoBase' ? '1. Carico Base' :
      stage === 'checkScaricoLocation' ? '2. Scarico Location' :
      stage === 'checkCaricoRitorno' ? '3. Carico Ritorno' : '4. Scarico Base';
    showToast(`Tutti i contenitori impostati per ${label}!`);
  };

  const handleAddContenitore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuovoContenitore.contenutoSintetico) return;

    const newItem: ContenitoreMaster = {
      codice: nuovoContenitore.codice,
      tipo: nuovoContenitore.tipo,
      contenutoSintetico: nuovoContenitore.contenutoSintetico,
      destinazione: nuovoContenitore.destinazione,
      pesoIngombro: nuovoContenitore.pesoIngombro,
      checkCaricoBase: false,
      checkScaricoLocation: false,
      checkCaricoRitorno: false,
      checkScaricoBase: false,
    };

    onUpdateODS({
      ...ods,
      contenitori: [...ods.contenitori, newItem],
    });

    setNuovoContenitore({
      codice: `C${ods.contenitori.length + 2}`,
      tipo: 'Cassone Plastica',
      contenutoSintetico: '',
      destinazione: 'P1 Welcome Drink',
      pesoIngombro: '1 cassa 60x40 (~15 kg)',
    });
    setShowAddModal(false);
    showToast(`Contenitore ${newItem.codice} aggiunto al piano carico!`);
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

  // Counts for the 4 stages
  const totalC = ods.contenitori.length;
  const countCaricoBase = ods.contenitori.filter((c) => c.checkCaricoBase).length;
  const countScaricoLoc = ods.contenitori.filter((c) => c.checkScaricoLocation).length;
  const countCaricoRit = ods.contenitori.filter((c) => c.checkCaricoRitorno).length;
  const countScaricoBase = ods.contenitori.filter((c) => c.checkScaricoBase).length;


  return (
    <div className="ods-paper rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-2xl max-w-5xl mx-auto my-4 sm:my-6 print:p-0 print:border-none print:shadow-none font-sans">
      {/* Toast notification feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-amber-400 text-amber-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Official Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
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
            <div className="text-slate-950 font-bold mt-1">OPERATIVO LOGISTICA ATTIVO</div>
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

      {/* ================= 3. CONTENITORI & CONTROLLO AVANZAMENTO A 4 STADI ================= */}
      <section className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider">
              03. Contenitori & Controllo Avanzamento a 4 Stadi
            </h2>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Cassa/Cassone</span>
            </button>
          </div>
        </div>

        {/* 4 Stages Progress Meters Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs font-mono no-print">
          <div className="bg-blue-50/80 border border-blue-200 p-2.5 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-center text-blue-950 font-bold mb-1">
              <span>1. Carico Base</span>
              <span>{countCaricoBase}/{totalC}</span>
            </div>
            <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div style={{ width: `${(countCaricoBase / (totalC || 1)) * 100}%` }} className="bg-blue-600 h-full" />
            </div>
            <button
              onClick={() => spuntaTuttoStadio('checkCaricoBase', countCaricoBase < totalC)}
              className="text-[10px] text-blue-800 hover:text-blue-950 font-bold underline text-left cursor-pointer"
            >
              {countCaricoBase === totalC ? 'Deseleziona tutti' : 'Spunta tutti (100%)'}
            </button>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-center text-emerald-950 font-bold mb-1">
              <span>2. Scarico Loc.</span>
              <span>{countScaricoLoc}/{totalC}</span>
            </div>
            <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div style={{ width: `${(countScaricoLoc / (totalC || 1)) * 100}%` }} className="bg-emerald-600 h-full" />
            </div>
            <button
              onClick={() => spuntaTuttoStadio('checkScaricoLocation', countScaricoLoc < totalC)}
              className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold underline text-left cursor-pointer"
            >
              {countScaricoLoc === totalC ? 'Deseleziona tutti' : 'Spunta tutti (100%)'}
            </button>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-center text-amber-950 font-bold mb-1">
              <span>3. Carico Ritorno</span>
              <span>{countCaricoRit}/{totalC}</span>
            </div>
            <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div style={{ width: `${(countCaricoRit / (totalC || 1)) * 100}%` }} className="bg-amber-600 h-full" />
            </div>
            <button
              onClick={() => spuntaTuttoStadio('checkCaricoRitorno', countCaricoRit < totalC)}
              className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline text-left cursor-pointer"
            >
              {countCaricoRit === totalC ? 'Deseleziona tutti' : 'Spunta tutti (100%)'}
            </button>
          </div>

          <div className="bg-purple-50/80 border border-purple-200 p-2.5 rounded-lg flex flex-col justify-between">
            <div className="flex justify-between items-center text-purple-950 font-bold mb-1">
              <span>4. Scarico Base</span>
              <span>{countScaricoBase}/{totalC}</span>
            </div>
            <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div style={{ width: `${(countScaricoBase / (totalC || 1)) * 100}%` }} className="bg-purple-600 h-full" />
            </div>
            <button
              onClick={() => spuntaTuttoStadio('checkScaricoBase', countScaricoBase < totalC)}
              className="text-[10px] text-purple-800 hover:text-purple-950 font-bold underline text-left cursor-pointer"
            >
              {countScaricoBase === totalC ? 'Deseleziona tutti' : 'Spunta tutti (100%)'}
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-12 text-center">Cod</th>
                <th className="p-2 border-r border-slate-300 w-36">Contenitore</th>
                <th className="p-2 border-r border-slate-300">Contenuto sintetico</th>
                <th className="p-2 border-r border-slate-300 w-28">Destinaz.</th>
                <th className="p-2 border-r border-slate-300 text-center w-20 bg-blue-50/70 text-blue-950 font-bold">1. Carico Base</th>
                <th className="p-2 border-r border-slate-300 text-center w-20 bg-emerald-50/70 text-emerald-950 font-bold">2. Scarico Loc.</th>
                <th className="p-2 border-r border-slate-300 text-center w-20 bg-amber-50/70 text-amber-950 font-bold">3. Carico Ritorno</th>
                <th className="p-2 text-center w-20 bg-purple-50/70 text-purple-950 font-bold">4. Scarico Base</th>
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

                  {/* 4 Interactive Checkbox stages */}
                  <td className="p-2 border-r border-slate-300 text-center bg-blue-50/30">
                    <button
                      type="button"
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkCaricoBase')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkCaricoBase ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-blue-500" />
                      )}
                    </button>
                  </td>

                  <td className="p-2 border-r border-slate-300 text-center bg-emerald-50/30">
                    <button
                      type="button"
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkScaricoLocation')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkScaricoLocation ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-emerald-500" />
                      )}
                    </button>
                  </td>

                  <td className="p-2 border-r border-slate-300 text-center bg-amber-50/30">
                    <button
                      type="button"
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkCaricoRitorno')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkCaricoRitorno ? (
                        <CheckSquare className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-amber-500" />
                      )}
                    </button>
                  </td>

                  <td className="p-2 text-center bg-purple-50/30">
                    <button
                      type="button"
                      onClick={() => toggleChecklistContenitore(c.codice, 'checkScaricoBase')}
                      className="cursor-pointer inline-flex items-center justify-center p-1"
                    >
                      {c.checkScaricoBase ? (
                        <CheckSquare className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-purple-500" />
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
            <div key={c.codice} className="bg-white p-3 rounded-xl border border-slate-300 shadow-xs space-y-2">
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
                  {c.checkCaricoBase ? <CheckSquare className="w-4 h-4 text-blue-700" /> : <Square className="w-4 h-4 text-slate-400" />}
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
                  <span>2. Scarico Loc</span>
                  {c.checkScaricoLocation ? <CheckSquare className="w-4 h-4 text-emerald-700" /> : <Square className="w-4 h-4 text-slate-400" />}
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
                  {c.checkCaricoRitorno ? <CheckSquare className="w-4 h-4 text-amber-700" /> : <Square className="w-4 h-4 text-slate-400" />}
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
                  {c.checkScaricoBase ? <CheckSquare className="w-4 h-4 text-purple-700" /> : <Square className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Container Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3 font-display">Aggiungi Nuovo Contenitore / Cassa</h3>
            <form onSubmit={handleAddContenitore} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Codice:</label>
                  <input
                    type="text"
                    value={nuovoContenitore.codice}
                    onChange={(e) => setNuovoContenitore({ ...nuovoContenitore, codice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tipo:</label>
                  <input
                    type="text"
                    value={nuovoContenitore.tipo}
                    onChange={(e) => setNuovoContenitore({ ...nuovoContenitore, tipo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Contenuto Sintetico:</label>
                <input
                  type="text"
                  placeholder="es. 48 Calici vino, 2 brocche, tovaglioli..."
                  value={nuovoContenitore.contenutoSintetico}
                  onChange={(e) => setNuovoContenitore({ ...nuovoContenitore, contenutoSintetico: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Destinazione:</label>
                  <input
                    type="text"
                    value={nuovoContenitore.destinazione}
                    onChange={(e) => setNuovoContenitore({ ...nuovoContenitore, destinazione: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Ingombro / Peso:</label>
                  <input
                    type="text"
                    value={nuovoContenitore.pesoIngombro}
                    onChange={(e) => setNuovoContenitore({ ...nuovoContenitore, pesoIngombro: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg hover:bg-amber-300 cursor-pointer shadow-sm"
                >
                  Salva nel Piano Carico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Distribuzione per Postazione & 5. Fornitori e Noleggi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Distribuzione per Postazione */}
        <section className="border border-slate-300 rounded-lg p-4 bg-slate-50/30">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-1.5 mb-3 rounded">
            04. Distribuzione Materiali per Postazione (P1 – P10)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <th className="p-1.5 border-r border-slate-300 w-12 text-center">Cod</th>
                  <th className="p-1.5 border-r border-slate-300">Postazione</th>
                  <th className="p-1.5 border-r border-slate-300">Cosa portare lì</th>
                  <th className="p-1.5">Contenitori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {distribuzioni.map((d) => (
                  <tr key={d.postazioneCod}>
                    <td className="p-1.5 border-r border-slate-300 font-mono font-bold text-center text-slate-900">{d.postazioneCod}</td>
                    <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-900">{d.postazioneNome}</td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-700">{d.fuoriContenitore}</td>
                    <td className="p-1.5 font-mono text-emerald-900 font-bold">{d.contenitori}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fornitori e Noleggi */}
        <section className="border border-slate-300 rounded-lg p-4 bg-slate-50/30">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-1.5 mb-3 rounded flex items-center justify-between">
            <span>05. Fornitori e Noleggi (Arrivi e Resi)</span>
            <span className="text-[11px] font-normal opacity-80">Spunta al carico/scarico</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <th className="p-1.5 border-r border-slate-300">Cosa / Fornitore</th>
                  <th className="p-1.5 border-r border-slate-300 w-24">Orario</th>
                  <th className="p-1.5 border-r border-slate-300 text-center w-14">Arrivo</th>
                  <th className="p-1.5 text-center w-14">Reso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ods.fornitoriNoleggi.map((f) => (
                  <tr key={f.id}>
                    <td className="p-1.5 border-r border-slate-300">
                      <div className="font-semibold text-slate-900">{f.fornitore}</div>
                      <div className="text-[11px] text-slate-600">{f.cosaFornisce}</div>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-slate-700">{f.dataOraArrivo}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFornitoreCheck(f.id, 'verificatoInArrivo')}
                        className="cursor-pointer"
                      >
                        {f.verificatoInArrivo ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFornitoreCheck(f.id, 'restituito')}
                        className="cursor-pointer"
                      >
                        {f.restituito ? (
                          <CheckSquare className="w-4 h-4 text-purple-600 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 mx-auto" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 6. Verbale di Carico e Riconsegna */}
      <section className="border-t-2 border-slate-900 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-3 rounded-lg">
          06. Verbale di Carico e Riconsegna
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 border border-slate-300 rounded p-3 bg-slate-50">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Andata (Base → Location)</h3>
            <div>
              <label className="text-slate-600 block text-[11px]">Ora completamento carico alla base:</label>
              <input
                type="text"
                value={ods.verbaleCarico.oraCaricoBase || ''}
                placeholder="es. 15:30"
                onChange={(e) => updateVerbale('oraCaricoBase', e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block text-[11px]">Firma resp. carico alla base:</label>
              <input
                type="text"
                value={ods.verbaleCarico.firmaRespCaricoBase || ''}
                onChange={(e) => updateVerbale('firmaRespCaricoBase', e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block text-[11px]">Ora scarico completato in location:</label>
              <input
                type="text"
                value={ods.verbaleCarico.oraScaricoLocation || ''}
                placeholder="es. 16:45"
                onChange={(e) => updateVerbale('oraScaricoLocation', e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded font-mono bg-white"
              />
            </div>
          </div>

          <div className="space-y-2 border border-slate-300 rounded p-3 bg-slate-50">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Ritorno (Location → Base)</h3>
            <div>
              <label className="text-slate-600 block text-[11px]">Ora carico ritorno completato:</label>
              <input
                type="text"
                value={ods.verbaleCarico.oraCaricoRitorno || ''}
                placeholder="es. 02:45"
                onChange={(e) => updateVerbale('oraCaricoRitorno', e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded font-mono bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block text-[11px]">Mancanze o rotture al carico di rientro:</label>
              <input
                type="text"
                placeholder="Nessuna mancanza"
                value={ods.verbaleCarico.mancanzeRottureCarico || ''}
                onChange={(e) => updateVerbale('mancanzeRottureCarico', e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block text-[11px]">Firma consegna mezzo alla base:</label>
              <input
                type="text"
                value={ods.verbaleCarico.firmaConsegnaRitorno || ''}
                onChange={(e) => updateVerbale('firmaConsegnaRitorno', e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
