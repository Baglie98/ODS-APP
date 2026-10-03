import React, { useState } from 'react';
import { 
  MasterODS, 
  MembroBrigata, 
  PiattoMenu, 
  AllergeneDieta, 
  VoceMateriale, 
  ContenitoreMaster,
  FormatoEvento
} from '../../types/ods';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Calendar, 
  Clock, 
  Phone, 
  Users, 
  UtensilsCrossed, 
  Package, 
  Truck, 
  Shield, 
  CheckCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface ModelloCompletoViewProps {
  ods: MasterODS;
  onUpdateODS: (updated: MasterODS) => void;
}

export const ModelloCompletoView: React.FC<ModelloCompletoViewProps> = ({ ods, onUpdateODS }) => {
  const [activeSection, setActiveSection] = useState<string>('scheda');
  const [brigataSearch, setBrigataSearch] = useState<string>('');
  const [materialeCategoriaFilter, setMaterialeCategoriaFilter] = useState<string>('Tutti');
  const [materialeSearch, setMaterialeSearch] = useState<string>('');

  // Toggle optional module
  const toggleModulo = (modKey: keyof MasterODS['moduliAttivi']) => {
    onUpdateODS({
      ...ods,
      moduliAttivi: {
        ...ods.moduliAttivi,
        [modKey]: !ods.moduliAttivi[modKey],
      },
    });
  };

  // Generic update helper
  const updateSchedaField = (field: string, val: any) => {
    onUpdateODS({
      ...ods,
      scheda: {
        ...ods.scheda,
        [field]: val,
      },
    });
  };

  // Brigata helpers
  const addBrigataMember = () => {
    const newMember: MembroBrigata = {
      id: 'b_' + Date.now(),
      n: ods.brigata.length + 1,
      cognomeNome: 'Nuovo Addetto',
      ruolo: 'addetto',
      turno: '16:00 - 00:30',
      oreTotali: 8.5,
      stato: 'DC',
      cellulare: '+39 ',
    };
    onUpdateODS({
      ...ods,
      brigata: [...ods.brigata, newMember],
    });
  };

  const removeBrigataMember = (id: string) => {
    onUpdateODS({
      ...ods,
      brigata: ods.brigata.filter((b) => b.id !== id),
    });
  };

  const updateBrigataMember = (id: string, field: keyof MembroBrigata, val: any) => {
    onUpdateODS({
      ...ods,
      brigata: ods.brigata.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    });
  };

  // Materiali helpers
  const addMateriale = () => {
    const newMat: VoceMateriale = {
      id: 'mat_' + Date.now(),
      n: ods.materiali.length + 1,
      categoria: 'Vetro e stoviglie',
      voce: 'Nuovo articolo',
      qta: 10,
      unitaBaseFormato: 'pz',
      tipo: 'M',
      destinazione: 'P2',
      contenitore: 'C1',
      stato: 'P',
    };
    onUpdateODS({
      ...ods,
      materiali: [...ods.materiali, newMat],
    });
  };

  const removeMateriale = (id: string) => {
    onUpdateODS({
      ...ods,
      materiali: ods.materiali.filter((m) => m.id !== id),
    });
  };

  const updateMateriale = (id: string, field: keyof VoceMateriale, val: any) => {
    onUpdateODS({
      ...ods,
      materiali: ods.materiali.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    });
  };

  // Allergeni helpers
  const addAllergene = () => {
    const newAl: AllergeneDieta = {
      id: 'al_' + Date.now(),
      ospiteGruppo: 'Nuovo ospite',
      allergeneDieta: 'Celiachia / Senza Glutine',
      gestione: 'Piatto sigillato dedicato',
      respInSala: ods.brigata[0]?.cognomeNome || 'Capo Servizio',
    };
    onUpdateODS({
      ...ods,
      allergeni: [...ods.allergeni, newAl],
    });
  };

  const removeAllergene = (id: string) => {
    onUpdateODS({
      ...ods,
      allergeni: ods.allergeni.filter((a) => a.id !== id),
    });
  };

  const updateAllergene = (id: string, field: keyof AllergeneDieta, val: any) => {
    onUpdateODS({
      ...ods,
      allergeni: ods.allergeni.map((a) => (a.id === id ? { ...a, [field]: val } : a)),
    });
  };

  // Fabbisogno calcolato helper
  const updateFabbisognoDose = (id: string, dose: number) => {
    onUpdateODS({
      ...ods,
      fabbisogno: ods.fabbisogno.map((f) => (f.id === id ? { ...f, dosePerOspite: dose } : f)),
    });
  };

  const totalePax = (ods.scheda.ospitiAdulti || 0) + (ods.scheda.ospitiBambiniSpeciali || 0);
  const addettiTotali = ods.brigata.length;
  const ratio = addettiTotali > 0 ? (totalePax / addettiTotali).toFixed(1) : '0';

  const navSections = [
    { id: 'scheda', label: '1. Scheda Evento', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: '2. Orari e Fasi', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'contatti', label: '3. Contatti & Accessi', icon: <Phone className="w-3.5 h-3.5" /> },
    { id: 'brigata', label: '4. Brigata', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'postazioni', label: '5. Postazioni P#', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'food_beverage', label: '6. Food & Beverage', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { id: 'materiali', label: '7. Materiali & Contenitori', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'logistica', label: '8. Logistica & Mezzi', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'sicurezza', label: '9. Sicurezza & Emergenze', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'moduli', label: 'Moduli Opzionali (M1-M6)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'chiusura', label: '10. Chiusura & Storico', icon: <FileCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto my-4 sm:my-6 px-3 sm:px-6">
      {/* Internal Navigation Tabs (Sticky Executive Segmented Bar) */}
      <div className="flex overflow-x-auto gap-1 bg-[#0f172a] p-1.5 rounded-xl border border-slate-800 mb-6 scrollbar-none no-print sticky top-16 z-20 shadow-lg backdrop-blur-md">
        {navSections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeSection === sec.id
                ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {sec.icon}
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Official Master ODS Document Sheet */}
      <div className="ods-paper rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-2xl space-y-6">
        {/* Document Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 border-b-2 border-slate-900 pb-5">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
              ORDINE DI SERVIZIO MASTER · FONTE UNICA GENERATRICE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight font-display">
              Modello Completo (1–10 + Moduli)
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Catering ed eventi · Adattabile a ogni formato · Da questo modello derivano automaticamente i 4 ODS di lettura per Capo Servizio, Brigata, Carico e In Servizio.
            </p>
          </div>

          <div className="font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 p-3 rounded-lg text-right space-y-1">
            <div><strong>ODS n°:</strong> <span className="text-slate-950 font-bold">{ods.scheda.odsNumero}</span></div>
            <div><strong>{ods.scheda.revisioneCorrente}</strong> del {ods.scheda.dataRevisione}</div>
            <div className="text-[11px] text-slate-500">Redatto da: {ods.scheda.redattoDa}</div>
          </div>
        </div>

        {/* Moduli Attivi Toggle Bar */}
        <div className="pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2.5">
            Moduli attivi per questo evento (M1 – M6):
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { key: 'm1Guardaroba', label: 'M1 Guardaroba e accoglienza' },
              { key: 'm2Bambini', label: 'M2 Punto bambini / speciali' },
              { key: 'm3ProgrammaChef', label: 'M3 Programma con chef / lezione' },
              { key: 'm4TrasportoFurgone', label: 'M4 Trasporto esterno e furgone' },
              { key: 'm5CucinaRimpiazzi', label: 'M5 Cucina e rimpiazzi' },
              { key: 'm6DoppioTurno', label: 'M6 Doppio turno' },
            ].map(({ key, label }) => {
              const active = ods.moduliAttivi[key as keyof MasterODS['moduliAttivi']];
              return (
                <button
                  key={key}
                  onClick={() => toggleModulo(key as keyof MasterODS['moduliAttivi'])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer border ${
                    active
                      ? 'bg-slate-900 text-amber-300 border-slate-900 font-semibold shadow-sm'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200/80 pt-6">
        {/* 1. Scheda Evento */}
        {activeSection === 'scheda' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-950">1. Scheda Evento</h2>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-300">
                Rapporto Pax/Addetto: <strong>{ratio}</strong> (Benchmark: {ods.scheda.formato === 'buffet' ? '6.9' : ods.scheda.formato === 'servito_al_tavolo' ? '9.0' : '11.3'})
              </span>
            </div>

            {/* Calcolo Automatico Fabbisogno & Parametri Live */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Calcolatore Automatico Dinamico Fabbisogno
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Aggiornato in tempo reale sui pax</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Coperti Totali:</span>
                  <strong className="text-slate-900 text-sm">{totalePax} pax</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Stima Vino (0.4 bot/pax):</span>
                  <strong className="text-amber-700 text-sm">~{Math.round(totalePax * 0.4)} bottiglie</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Stima Acqua (0.75 L/pax):</span>
                  <strong className="text-blue-700 text-sm">~{Math.round(totalePax * 0.75)} L</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-sans">Stima Calici (2.2/pax):</span>
                  <strong className="text-purple-700 text-sm">~{Math.round(totalePax * 2.2)} calici</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">ODS n°:</label>
                <input
                  type="text"
                  value={ods.scheda.odsNumero}
                  onChange={(e) => updateSchedaField('odsNumero', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Data Evento:</label>
                <input
                  type="text"
                  value={ods.scheda.data}
                  onChange={(e) => updateSchedaField('data', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Committente:</label>
                <input
                  type="text"
                  value={ods.scheda.committente}
                  onChange={(e) => updateSchedaField('committente', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-600 font-semibold block mb-1">Evento (nome e tipo):</label>
                <input
                  type="text"
                  value={ods.scheda.eventoNomeTipo}
                  onChange={(e) => updateSchedaField('eventoNomeTipo', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Formato Evento:</label>
                <select
                  value={ods.scheda.formato}
                  onChange={(e) => updateSchedaField('formato', e.target.value as FormatoEvento)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold cursor-pointer bg-white"
                >
                  <option value="buffet">Buffet</option>
                  <option value="servito_al_tavolo">Servito al tavolo (Placé)</option>
                  <option value="in_piedi">Cocktail in piedi</option>
                  <option value="seduto">Seduto informale</option>
                  <option value="lezione">Lezione / Masterclass con chef</option>
                  <option value="altro">Altro formato</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-slate-600 font-semibold block mb-1">Luogo (indirizzo completo):</label>
                <input
                  type="text"
                  value={ods.scheda.luogoIndirizzo}
                  onChange={(e) => updateSchedaField('luogoIndirizzo', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Inizio Evento:</label>
                <input
                  type="text"
                  value={ods.scheda.inizioEvento}
                  onChange={(e) => updateSchedaField('inizioEvento', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Fine Evento:</label>
                <input
                  type="text"
                  value={ods.scheda.fineEvento}
                  onChange={(e) => updateSchedaField('fineEvento', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Ingresso Staff:</label>
                <input
                  type="text"
                  value={ods.scheda.ingressoStaff}
                  onChange={(e) => updateSchedaField('ingressoStaff', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Partenza dalla Base:</label>
                <input
                  type="text"
                  value={ods.scheda.partenzaBase}
                  onChange={(e) => updateSchedaField('partenzaBase', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Ospiti Adulti (pax):</label>
                <input
                  type="number"
                  value={ods.scheda.ospitiAdulti}
                  onChange={(e) => updateSchedaField('ospitiAdulti', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Bambini / Ospiti speciali:</label>
                <input
                  type="number"
                  value={ods.scheda.ospitiBambiniSpeciali}
                  onChange={(e) => updateSchedaField('ospitiBambiniSpeciali', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Totale Pax (calcolato):</label>
                <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded font-bold font-mono text-emerald-800">
                  {totalePax} pax
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Addetti in Brigata (dalla Sez. 4):</label>
                <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded font-bold font-mono text-slate-900">
                  {addettiTotali} addetti
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Redatto da:</label>
                <input
                  type="text"
                  value={ods.scheda.redattoDa}
                  onChange={(e) => updateSchedaField('redattoDa', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Timeline a Fasi */}
        {activeSection === 'timeline' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 border-b border-slate-200 pb-2">
              2. Orari e Timeline a Fasi (F1 – F9)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-16 text-center">Fase</th>
                    <th className="p-2 border-r border-slate-300 w-24">Inizio</th>
                    <th className="p-2 border-r border-slate-300 w-24">Fine</th>
                    <th className="p-2 border-r border-slate-300">Cosa succede</th>
                    <th className="p-2 w-48">Guida (responsabile)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.timelineFasi.map((f, idx) => (
                    <tr key={f.codice}>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold text-center text-slate-900">{f.codice}</td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={f.inizio}
                          onChange={(e) => {
                            const updated = ods.timelineFasi.map((x) => (x.codice === f.codice ? { ...x, inizio: e.target.value } : x));
                            onUpdateODS({ ...ods, timelineFasi: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-mono"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={f.fine}
                          onChange={(e) => {
                            const updated = ods.timelineFasi.map((x) => (x.codice === f.codice ? { ...x, fine: e.target.value } : x));
                            onUpdateODS({ ...ods, timelineFasi: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-mono"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={f.cosaSuccede}
                          onChange={(e) => {
                            const updated = ods.timelineFasi.map((x) => (x.codice === f.codice ? { ...x, cosaSuccede: e.target.value } : x));
                            onUpdateODS({ ...ods, timelineFasi: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={f.guidaResponsabile}
                          onChange={(e) => {
                            const updated = ods.timelineFasi.map((x) => (x.codice === f.codice ? { ...x, guidaResponsabile: e.target.value } : x));
                            onUpdateODS({ ...ods, timelineFasi: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Contatti & Accessi */}
        {activeSection === 'contatti' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-950">3. Contatti, Location e Accessi Tecnici</h2>
                <p className="text-xs text-slate-500">Tutti i recapiti e le specifiche tecniche della location di servizio.</p>
              </div>
              <button
                onClick={() => {
                  const newC = {
                    id: 'c_' + Date.now(),
                    ruolo: 'Nuovo referente',
                    nome: 'Nome e Cognome',
                    telefono: '+39 ',
                    note: '',
                  };
                  onUpdateODS({ ...ods, contatti: [...ods.contatti, newC] });
                }}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Contatto</span>
              </button>
            </div>

            {/* Contatti Ruolo Table */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">Rubrica Contatti Chiave Evento</h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-44">Ruolo</th>
                    <th className="p-2 border-r border-slate-300 w-44">Nome</th>
                    <th className="p-2 border-r border-slate-300 w-36">Telefono</th>
                    <th className="p-2 border-r border-slate-300">Note</th>
                    <th className="p-2 w-10 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.contatti.map((c) => (
                    <tr key={c.id}>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={c.ruolo}
                          onChange={(e) => {
                            const updated = ods.contatti.map((x) => (x.id === c.id ? { ...x, ruolo: e.target.value } : x));
                            onUpdateODS({ ...ods, contatti: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-semibold text-slate-900"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={c.nome}
                          onChange={(e) => {
                            const updated = ods.contatti.map((x) => (x.id === c.id ? { ...x, nome: e.target.value } : x));
                            onUpdateODS({ ...ods, contatti: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded text-slate-800"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={c.telefono}
                          onChange={(e) => {
                            const updated = ods.contatti.map((x) => (x.id === c.id ? { ...x, telefono: e.target.value } : x));
                            onUpdateODS({ ...ods, contatti: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-mono text-emerald-800 font-bold"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={c.note}
                          onChange={(e) => {
                            const updated = ods.contatti.map((x) => (x.id === c.id ? { ...x, note: e.target.value } : x));
                            onUpdateODS({ ...ods, contatti: updated });
                          }}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded text-slate-700"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          onClick={() => onUpdateODS({ ...ods, contatti: ods.contatti.filter((x) => x.id !== c.id) })}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Accessi Tecnici Location - Modificabili */}
            <div className="border border-slate-300 rounded p-4 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase text-slate-700 mb-3">Scheda Tecnica Accessi & Forniture Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Ingresso staff e punto di ritrovo:</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.ingressoStaffPuntoRitrovo}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, ingressoStaffPuntoRitrovo: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Carico / scarico: punto e fascia oraria:</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.caricoScaricoPuntoFascia}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, caricoScaricoPuntoFascia: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Parcheggio mezzo furgone:</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.parcheggioMezzo}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, parcheggioMezzo: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">ZTL e permessi di accesso:</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.ztlPermessiAccesso}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, ztlPermessiAccesso: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Percorso interno (piani, scale, ascensore):</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.percorsoInterno}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, percorsoInterno: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Corrente (prese, potenza disponibile):</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.correntePresePotenza}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, correntePresePotenza: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Spazi: back, guardaroba, deposito:</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.spaziBackGuardarobaDeposito}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, spaziBackGuardarobaDeposito: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Cucina disponibile & attrezzature:</label>
                  <input
                    type="text"
                    value={ods.locationAccessi.cucinaAttrezzature}
                    onChange={(e) => onUpdateODS({ ...ods, locationAccessi: { ...ods.locationAccessi, cucinaAttrezzature: e.target.value } })}
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Brigata (Anagrafica Unica) */}
        {activeSection === 'brigata' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">4. Brigata (Anagrafica Unica)</h2>
                <p className="text-xs text-slate-500">Ogni persona compare una volta sola qui. Le altre sezioni rimandano con i codici.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cerca per nome..."
                  value={brigataSearch}
                  onChange={(e) => setBrigataSearch(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs w-44 focus:ring-1 focus:ring-emerald-500 bg-white"
                />
                <button
                  onClick={addBrigataMember}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aggiungi Addetto</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-2xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-10 text-center">N</th>
                    <th className="p-2 border-r border-slate-300">Cognome e Nome (completo)</th>
                    <th className="p-2 border-r border-slate-300 w-36">Ruolo</th>
                    <th className="p-2 border-r border-slate-300 w-36">Turno</th>
                    <th className="p-2 border-r border-slate-300 w-16 text-center">Ore</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-center">Stato</th>
                    <th className="p-2 border-r border-slate-300 w-36">Cellulare</th>
                    <th className="p-2 w-10 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.brigata
                    .filter((m) =>
                      !brigataSearch ||
                      m.cognomeNome.toLowerCase().includes(brigataSearch.toLowerCase()) ||
                      (m.ruoloDettaglio && m.ruoloDettaglio.toLowerCase().includes(brigataSearch.toLowerCase()))
                    )
                    .map((m, idx) => (
                    <tr key={m.id} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-50/80'}>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold text-center text-slate-600">{m.n}</td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={m.cognomeNome}
                          onChange={(e) => updateBrigataMember(m.id, 'cognomeNome', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-semibold text-slate-900 focus:bg-white"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <select
                          value={m.ruolo}
                          onChange={(e) => updateBrigataMember(m.id, 'ruolo', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs bg-white cursor-pointer font-medium"
                        >
                          <option value="capo_servizio">Capo Servizio</option>
                          <option value="responsabile">Responsabile</option>
                          <option value="addetto">Addetto</option>
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={m.turno}
                          onChange={(e) => updateBrigataMember(m.id, 'turno', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300 text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={m.oreTotali}
                          onChange={(e) => updateBrigataMember(m.id, 'oreTotali', parseFloat(e.target.value) || 0)}
                          className="w-14 px-1 py-1 border border-slate-200 rounded font-mono text-center font-bold"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300 text-center">
                        <select
                          value={m.stato}
                          onChange={(e) => updateBrigataMember(m.id, 'stato', e.target.value)}
                          className={`px-2 py-1 border rounded font-mono font-bold text-xs cursor-pointer ${
                            m.stato === 'C' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="C">C (Conf.)</option>
                          <option value="DC">DC (Da Conf.)</option>
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={m.cellulare}
                          onChange={(e) => updateBrigataMember(m.id, 'cellulare', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          onClick={() => removeBrigataMember(m.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Elimina addetto"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Postazioni e Assegnazioni */}
        {activeSection === 'postazioni' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 border-b border-slate-200 pb-2">
              5. Postazioni e Assegnazioni per Fase (P1 – P10)
            </h2>
            <div className="space-y-4">
              {ods.postazioni.filter((p) => p.attiva).map((p) => {
                const resp = ods.brigata.find((b) => b.id === p.responsabileId);

                return (
                  <div key={p.codice} className="border border-slate-300 rounded-lg p-4 bg-slate-50/50">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
                          {p.codice}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{p.nome}</h3>
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        <span className="text-slate-600 font-semibold">Responsabile:</span>
                        <select
                          value={p.responsabileId}
                          onChange={(e) => {
                            const updated = ods.postazioni.map((x) => (x.codice === p.codice ? { ...x, responsabileId: e.target.value } : x));
                            onUpdateODS({ ...ods, postazioni: updated });
                          }}
                          className="px-2 py-1 border border-slate-300 rounded font-semibold text-slate-900 bg-white"
                        >
                          <option value="">-- Seleziona --</option>
                          {ods.brigata.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.cognomeNome} ({b.ruolo})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="border border-slate-200 bg-white rounded p-2.5">
                        <span className="font-bold text-slate-700 block mb-1">Fase A · Allestimento</span>
                        <input
                          type="text"
                          value={p.faseA.orario}
                          onChange={(e) => {
                            const updated = ods.postazioni.map((x) => (x.codice === p.codice ? { ...x, faseA: { ...x.faseA, orario: e.target.value } } : x));
                            onUpdateODS({ ...ods, postazioni: updated });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-[11px] mb-2"
                        />
                        <div className="text-[11px] text-slate-600">
                          Addetti assegnati: {p.faseA.addettiIds.map((id) => ods.brigata.find((b) => b.id === id)?.cognomeNome || id).join(', ') || 'Nessuno'}
                        </div>
                      </div>

                      <div className="border border-slate-200 bg-white rounded p-2.5">
                        <span className="font-bold text-slate-700 block mb-1">Fase B · Servizio</span>
                        <input
                          type="text"
                          value={p.faseB.orario}
                          onChange={(e) => {
                            const updated = ods.postazioni.map((x) => (x.codice === p.codice ? { ...x, faseB: { ...x.faseB, orario: e.target.value } } : x));
                            onUpdateODS({ ...ods, postazioni: updated });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-[11px] mb-2"
                        />
                        <div className="text-[11px] text-slate-600">
                          Addetti assegnati: {p.faseB.addettiIds.map((id) => ods.brigata.find((b) => b.id === id)?.cognomeNome || id).join(', ') || 'Nessuno'}
                        </div>
                      </div>

                      <div className="border border-slate-200 bg-white rounded p-2.5">
                        <span className="font-bold text-slate-700 block mb-1">Fase C · Sbarazzo</span>
                        <input
                          type="text"
                          value={p.faseC.orario}
                          onChange={(e) => {
                            const updated = ods.postazioni.map((x) => (x.codice === p.codice ? { ...x, faseC: { ...x.faseC, orario: e.target.value } } : x));
                            onUpdateODS({ ...ods, postazioni: updated });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-[11px] mb-2"
                        />
                        <div className="text-[11px] text-slate-600">
                          Addetti assegnati: {p.faseC.addettiIds.map((id) => ods.brigata.find((b) => b.id === id)?.cognomeNome || id).join(', ') || 'Nessuno'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Food & Beverage */}
        {activeSection === 'food_beverage' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 border-b border-slate-200 pb-2">
              6. Food & Beverage (Menu, Allergeni e Fabbisogno per Ospite)
            </h2>

            {/* 6.1 Menu */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">6.1 Menu Portate per Momento</h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-44">Momento</th>
                    <th className="p-2 border-r border-slate-300">Proposta / Piatti</th>
                    <th className="p-2 border-r border-slate-300 w-20 text-center">Porzioni</th>
                    <th className="p-2 w-64">Note operative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.menu.map((m) => (
                    <tr key={m.id}>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{m.momento}</td>
                      <td className="p-2 border-r border-slate-300 font-medium text-slate-800">{m.propostaPiatti}</td>
                      <td className="p-2 border-r border-slate-300 font-mono text-center font-bold text-slate-900">{m.porzioni}</td>
                      <td className="p-2 text-slate-600">{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6.2 Allergeni e Diete Speciali */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold uppercase text-rose-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-rose-600" />
                  6.2 Allergeni e Diete Speciali (HACCP)
                </h3>
                <button
                  onClick={addAllergene}
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-rose-700 text-white rounded hover:bg-rose-600 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Aggiungi Allergene</span>
                </button>
              </div>

              <table className="w-full text-xs text-left border-collapse border border-rose-300">
                <thead>
                  <tr className="bg-rose-50 text-rose-950 font-semibold border-b border-rose-300">
                    <th className="p-2 border-r border-rose-200 w-48">Ospite / Gruppo</th>
                    <th className="p-2 border-r border-rose-200 w-48">Allergene o Dieta</th>
                    <th className="p-2 border-r border-rose-200">Gestione (chi prepara, come si riconosce)</th>
                    <th className="p-2 border-r border-rose-200 w-36">Resp. in Sala</th>
                    <th className="p-2 w-10 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-200">
                  {ods.allergeni.map((al) => (
                    <tr key={al.id}>
                      <td className="p-1 border-r border-rose-200">
                        <input
                          type="text"
                          value={al.ospiteGruppo}
                          onChange={(e) => updateAllergene(al.id, 'ospiteGruppo', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-semibold text-slate-900"
                        />
                      </td>
                      <td className="p-1 border-r border-rose-200">
                        <input
                          type="text"
                          value={al.allergeneDieta}
                          onChange={(e) => updateAllergene(al.id, 'allergeneDieta', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-bold text-rose-800"
                        />
                      </td>
                      <td className="p-1 border-r border-rose-200">
                        <input
                          type="text"
                          value={al.gestione}
                          onChange={(e) => updateAllergene(al.id, 'gestione', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded text-slate-800"
                        />
                      </td>
                      <td className="p-1 border-r border-rose-200">
                        <input
                          type="text"
                          value={al.respInSala}
                          onChange={(e) => updateAllergene(al.id, 'respInSala', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-medium text-slate-900"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          onClick={() => removeAllergene(al.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6.3 Fabbisogno per Ospite con Calcolo Automatico */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">
                6.3 Calcolatore Fabbisogno per Ospite (Fonte Dosi Storiche)
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">Voce</th>
                    <th className="p-2 border-r border-slate-300 w-28 text-center">Dose / ospite</th>
                    <th className="p-2 border-r border-slate-300 w-20 text-center">Ospiti</th>
                    <th className="p-2 border-r border-slate-300 w-28 text-center font-bold text-emerald-900 bg-emerald-50">Fabbisogno</th>
                    <th className="p-2 border-r border-slate-300 w-44">Formato acquisto</th>
                    <th className="p-2">Note storiche</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.fabbisogno.map((fab) => {
                    const fabbisognoTotale = (fab.dosePerOspite * totalePax).toFixed(1);
                    return (
                      <tr key={fab.id}>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{fab.voce}</td>
                        <td className="p-1 border-r border-slate-300 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.05"
                              value={fab.dosePerOspite}
                              onChange={(e) => updateFabbisognoDose(fab.id, parseFloat(e.target.value) || 0)}
                              className="w-16 px-1 py-1 border border-slate-300 rounded font-mono text-center text-xs"
                            />
                            <span className="font-mono text-slate-500">{fab.unitaDose}</span>
                          </div>
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono text-center">{totalePax}</td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-center bg-emerald-50 text-emerald-950">
                          {fabbisognoTotale} {fab.unitaDose}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono text-slate-700">{fab.formatoAcquisto}</td>
                        <td className="p-2 text-slate-500">{fab.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Materiali & Contenitori */}
        {activeSection === 'materiali' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-950">7. Materiali & Contenitori Master</h2>
                <p className="text-xs text-slate-500">Fonte unica dei materiali. Tipi: M (magazzino base), O (ordine), N (noleggio), A (acquisto).</p>
              </div>
              <button
                onClick={addMateriale}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Materiale</span>
              </button>
            </div>

            {/* 7.1 Tabella Master */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-10 text-center">N</th>
                    <th className="p-2 border-r border-slate-300 w-32">Categoria</th>
                    <th className="p-2 border-r border-slate-300">Voce</th>
                    <th className="p-2 border-r border-slate-300 w-16 text-center">Qtà</th>
                    <th className="p-2 border-r border-slate-300 w-36">Unità base / Formato</th>
                    <th className="p-2 border-r border-slate-300 w-16 text-center">Tipo</th>
                    <th className="p-2 border-r border-slate-300 w-20 text-center">Destinaz.</th>
                    <th className="p-2 border-r border-slate-300 w-20 text-center">Contenit.</th>
                    <th className="p-2 border-r border-slate-300 w-16 text-center">Stato</th>
                    <th className="p-2 w-10 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.materiali.map((mat, idx) => (
                    <tr key={mat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2 border-r border-slate-300 font-mono text-center text-slate-500">{idx + 1}</td>
                      <td className="p-1 border-r border-slate-300">
                        <select
                          value={mat.categoria}
                          onChange={(e) => updateMateriale(mat.id, 'categoria', e.target.value)}
                          className="w-full px-1 py-1 border border-slate-200 rounded text-xs bg-white"
                        >
                          <option value="Bevande">Bevande</option>
                          <option value="Food e monouso">Food e monouso</option>
                          <option value="Vetro e stoviglie">Vetro e stoviglie</option>
                          <option value="Vassoi, cestini e supporti">Vassoi e supporti</option>
                          <option value="Attrezzatura">Attrezzatura</option>
                          <option value="Tavoli, tovaglie e arredi">Tavoli e arredi</option>
                          <option value="Pulizia">Pulizia</option>
                          <option value="Varie">Varie</option>
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={mat.voce}
                          onChange={(e) => updateMateriale(mat.id, 'voce', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-semibold text-slate-900"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300 text-center">
                        <input
                          type="number"
                          value={mat.qta}
                          onChange={(e) => updateMateriale(mat.id, 'qta', parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-1 border border-slate-200 rounded font-mono text-center font-bold"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300">
                        <input
                          type="text"
                          value={mat.unitaBaseFormato}
                          onChange={(e) => updateMateriale(mat.id, 'unitaBaseFormato', e.target.value)}
                          className="w-full px-1.5 py-1 border border-slate-200 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300 text-center font-mono">
                        <select
                          value={mat.tipo}
                          onChange={(e) => updateMateriale(mat.id, 'tipo', e.target.value)}
                          className="px-1 py-1 border border-slate-200 rounded bg-white font-bold"
                        >
                          <option value="M">M</option>
                          <option value="O">O</option>
                          <option value="N">N</option>
                          <option value="A">A</option>
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-300 text-center font-mono">
                        <input
                          type="text"
                          value={mat.destinazione}
                          onChange={(e) => updateMateriale(mat.id, 'destinazione', e.target.value)}
                          className="w-16 px-1 py-1 border border-slate-200 rounded text-center font-bold text-emerald-800"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300 text-center font-mono">
                        <input
                          type="text"
                          value={mat.contenitore}
                          onChange={(e) => updateMateriale(mat.id, 'contenitore', e.target.value)}
                          className="w-16 px-1 py-1 border border-slate-200 rounded text-center font-bold text-slate-800"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-300 text-center font-mono">
                        <select
                          value={mat.stato}
                          onChange={(e) => updateMateriale(mat.id, 'stato', e.target.value)}
                          className="px-1 py-1 border border-slate-200 rounded bg-white font-bold"
                        >
                          <option value="O">O</option>
                          <option value="P">P</option>
                          <option value="C">C</option>
                          <option value="R">R</option>
                        </select>
                      </td>
                      <td className="p-1 text-center">
                        <button
                          onClick={() => removeMateriale(mat.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 7.2 Contenitori Master */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">7.2 Tabella Contenitori C1 – C8 e FC</h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-12 text-center">Cod</th>
                    <th className="p-2 border-r border-slate-300 w-44">Tipo</th>
                    <th className="p-2 border-r border-slate-300">Contenuto sintetico</th>
                    <th className="p-2 border-r border-slate-300 w-36">Destinazione</th>
                    <th className="p-2 w-36">Peso / Ingombro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.contenitori.map((c) => (
                    <tr key={c.codice}>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold text-center text-slate-900">{c.codice}</td>
                      <td className="p-2 border-r border-slate-300 font-medium text-slate-800">{c.tipo}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-900">{c.contenutoSintetico}</td>
                      <td className="p-2 border-r border-slate-300 font-semibold text-emerald-800">{c.destinazione}</td>
                      <td className="p-2 font-mono text-slate-600">{c.pesoIngombro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Logistica */}
        {activeSection === 'logistica' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 border-b border-slate-200 pb-2">
              8. Logistica e Giri Mezzi
            </h2>
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Movimento</th>
                  <th className="p-2 border-r border-slate-300 w-40">Data e ora</th>
                  <th className="p-2 border-r border-slate-300 w-40">Chi</th>
                  <th className="p-2 border-r border-slate-300 w-36">Mezzo</th>
                  <th className="p-2 border-r border-slate-300 w-44">Tratta Da &rarr; A</th>
                  <th className="p-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ods.logistica.map((l) => (
                  <tr key={l.id}>
                    <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{l.tipoMovimento}</td>
                    <td className="p-2 border-r border-slate-300 font-mono font-semibold">{l.dataOra}</td>
                    <td className="p-2 border-r border-slate-300 text-slate-700">{l.chi}</td>
                    <td className="p-2 border-r border-slate-300 font-mono text-slate-700">{l.mezzo}</td>
                    <td className="p-2 border-r border-slate-300 text-slate-800">{l.daA}</td>
                    <td className="p-2 text-slate-600">{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 9. Sicurezza */}
        {activeSection === 'sicurezza' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 border-b border-slate-200 pb-2">
              9. Sicurezza, Emergenze ed Allegati
            </h2>
            {ods.sicurezza.map((sec, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 border border-slate-300 p-3 rounded bg-slate-50/50">
                  <div><strong className="text-slate-700">Vie di fuga e uscite di emergenza:</strong> <p>{sec.vieDiFugaUscite}</p></div>
                  <div><strong className="text-slate-700">Cassetta di primo soccorso:</strong> <p>{sec.cassettaPrimoSoccorso}</p></div>
                  <div><strong className="text-slate-700">Estintori:</strong> <p>{sec.estintori}</p></div>
                  <div><strong className="text-slate-700">Referente sicurezza location:</strong> <p>{sec.referenteSicurezzaLocation}</p></div>
                </div>

                <div className="space-y-2 border border-slate-300 p-3 rounded bg-slate-50/50">
                  <div><strong className="text-slate-700">Persona della brigata incaricata primo intervento:</strong> <p>{sec.personaPrimoIntervento}</p></div>
                  <div><strong className="text-slate-700">Malore o infortunio: procedura:</strong> <p className="text-rose-800 font-bold">{sec.maloreInfortunioProcedura}</p></div>
                  <div><strong className="text-slate-700">Vetro rotto e sversamenti:</strong> <p>{sec.vetroRottoSversamenti}</p></div>
                  <div><strong className="text-slate-700">Brigata minorenne / supervisione:</strong> <p>{sec.brigataMinorenneAdulto}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Moduli Opzionali (M1 - M6) */}
        {activeSection === 'moduli' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-950 border-b border-slate-200 pb-2">
              Parte B — Moduli Opzionali Attivi
            </h2>

            {/* M1 */}
            {ods.moduliAttivi.m1Guardaroba && (
              <div className="border border-slate-300 rounded p-4 bg-slate-50/50">
                <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center justify-between">
                  <span>M1 · Guardaroba e Accoglienza</span>
                  <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">ATTIVO</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div><strong className="text-slate-600">Ospiti attesi:</strong> {ods.moduloM1.ospitiAttesi}</div>
                  <div><strong className="text-slate-600">Sistema:</strong> {ods.moduloM1.sistema}</div>
                  <div><strong className="text-slate-600">Capacità:</strong> {ods.moduloM1.capacita}</div>
                  <div><strong className="text-slate-600">Responsabile P7:</strong> {ods.moduloM1.responsabileP7}</div>
                  <div><strong className="text-slate-600">Orari apertura/chiusura:</strong> {ods.moduloM1.aperturaChiusura}</div>
                  <div><strong className="text-slate-600">Accoglienza:</strong> {ods.moduloM1.accoglienzaDettagli}</div>
                </div>
              </div>
            )}

            {/* M4 */}
            {ods.moduliAttivi.m4TrasportoFurgone && (
              <div className="border border-slate-300 rounded p-4 bg-slate-50/50">
                <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center justify-between">
                  <span>M4 · Trasporto Esterno e Furgone</span>
                  <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">ATTIVO</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><strong className="text-slate-600">Mezzo e targa · autista:</strong> {ods.moduloM4.mezzoTargaAutista}</div>
                  <div><strong className="text-slate-600">Giri andata orari:</strong> {ods.moduloM4.giriAndataOrari}</div>
                  <div><strong className="text-slate-600">Giri ritorno orari:</strong> {ods.moduloM4.giriRitornoOrari}</div>
                  <div><strong className="text-slate-600">Percorso e permessi:</strong> {ods.moduloM4.percorsoZtlPermessi}</div>
                </div>
              </div>
            )}

            {/* M5 */}
            {ods.moduliAttivi.m5CucinaRimpiazzi && (
              <div className="border border-slate-300 rounded p-4 bg-slate-50/50">
                <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center justify-between">
                  <span>M5 · Cucina e Rimpiazzi Portate</span>
                  <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">ATTIVO</span>
                </h3>
                <div className="mb-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><strong className="text-slate-600">Responsabile cucina:</strong> {ods.moduloM5.responsabileCucina}</div>
                  <div><strong className="text-slate-600">Porzionatura:</strong> {ods.moduloM5.porzionaturaChiEDove}</div>
                </div>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-semibold border-b border-slate-300">
                      <th className="p-1.5 border-r border-slate-300">Portata</th>
                      <th className="p-1.5 border-r border-slate-300">Giri previsti</th>
                      <th className="p-1.5 border-r border-slate-300">Cosa si porta al rimpiazzo</th>
                      <th className="p-1.5">Chi effettua</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ods.moduloM5.portate.map((p) => (
                      <tr key={p.id} className="border-t border-slate-300">
                        <td className="p-1.5 border-r border-slate-300 font-bold">{p.portata}</td>
                        <td className="p-1.5 border-r border-slate-300 font-mono">{p.giri}</td>
                        <td className="p-1.5 border-r border-slate-300">{p.cosaSiPorta}</td>
                        <td className="p-1.5 font-medium">{p.chi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 10. Chiusura e Storico */}
        {activeSection === 'chiusura' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-950">10. Chiusura Evento e Storico Consumi</h2>
                <p className="text-xs text-slate-500">Compilata dal capo servizio subito dopo il servizio. È la fonte delle future dosi per ospite.</p>
              </div>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-300 font-bold">
                COMPILAZIONE FINALE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-300 font-mono">
              <div>
                <span className="text-slate-500 font-sans block">Pax effettivi adulti:</span>
                <strong className="text-slate-900 text-sm">{ods.chiusura.paxRealiAdulti}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans block">Pax effettivi bambini:</span>
                <strong className="text-slate-900 text-sm">{ods.chiusura.paxRealiBambini}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans block">Inizio effettivo:</span>
                <strong className="text-slate-900 text-sm">{ods.chiusura.inizioReale}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans block">Fine effettiva:</span>
                <strong className="text-slate-900 text-sm">{ods.chiusura.fineReale}</strong>
              </div>
            </div>

            {/* Consumi Reali con Ricalcolo Dose Storica */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">
                Consumi Effettivi & Ricalcolo Nuova Dose per Ospite
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">Voce</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-center">Previsto</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-center">Consumato</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-center">Rimasto / Reso</th>
                    <th className="p-2 border-r border-slate-300 w-36 text-center font-bold text-emerald-900 bg-emerald-50">Nuova dose / pax</th>
                    <th className="p-2">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ods.chiusura.consumi.map((c) => {
                    const nuovaDose = ods.chiusura.paxRealiAdulti > 0 ? (c.consumato / ods.chiusura.paxRealiAdulti).toFixed(2) : '-';
                    return (
                      <tr key={c.id}>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{c.voce}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-center">{c.previsto}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-center font-bold text-slate-950">{c.consumato}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-center text-slate-600">{c.rimastoReso}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-center bg-emerald-50 text-emerald-950 font-bold">
                          {nuovaDose} / pax
                        </td>
                        <td className="p-2 text-slate-600">{c.nota}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Verbale di Valutazione */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded p-3 bg-slate-50">
                <span className="font-bold text-slate-700 block mb-1">Cosa ha funzionato:</span>
                <p className="text-slate-800">{ods.chiusura.cosaHaFunzionato}</p>
              </div>
              <div className="border border-slate-300 rounded p-3 bg-slate-50">
                <span className="font-bold text-slate-700 block mb-1">Cosa cambiare la prossima volta:</span>
                <p className="text-slate-800">{ods.chiusura.cosaCambiareProssimaVolta}</p>
              </div>
              <div className="md:col-span-2 border border-slate-300 rounded p-3 bg-slate-50">
                <span className="font-bold text-slate-700 block mb-1">Riscontro del Committente:</span>
                <p className="text-slate-800 italic">"{ods.chiusura.riscontroCommittente}"</p>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center font-mono text-[11px] text-slate-600">
                  <span>Firma: <strong>{ods.chiusura.capoServizioFirma}</strong></span>
                  <span>Data chiusura: {ods.chiusura.dataChiusura}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
