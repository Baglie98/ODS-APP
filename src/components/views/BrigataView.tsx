import React, { useState } from 'react';
import { MasterODS, MembroBrigata } from '../../types/ods';
import { getFoglioPersonaleBrigata } from '../../utils/odsDerivations';
import { 
  Phone, 
  User, 
  Copy, 
  Check, 
  ShieldCheck, 
  Printer, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  HelpCircle, 
  MessageSquare,
  Search,
  CheckCheck
} from 'lucide-react';

interface BrigataViewProps {
  ods: MasterODS;
  onUpdateODS?: (updated: MasterODS) => void;
}

export const BrigataView: React.FC<BrigataViewProps> = ({ ods, onUpdateODS }) => {
  const [activeSubTab, setActiveSubTab] = useState<'appello' | 'singolo'>('appello');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(ods.brigata[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRuolo, setFilterRuolo] = useState<'tutti' | 'responsabili' | 'sala' | 'cucina' | 'bar'>('tutti');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const foglio = getFoglioPersonaleBrigata(ods, selectedMemberId);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const updatePresenza = (memberId: string, statoPresenza: 'presente' | 'in_ritardo' | 'assente' | 'non_ancora_arrivato') => {
    if (!onUpdateODS) return;
    const updatedBrigata = ods.brigata.map((m) =>
      m.id === memberId ? { ...m, presenza: statoPresenza } : m
    );
    onUpdateODS({ ...ods, brigata: updatedBrigata });
    const memberName = ods.brigata.find((m) => m.id === memberId)?.cognomeNome || 'Addetto';
    const label = statoPresenza === 'presente' ? 'Presente' : statoPresenza === 'in_ritardo' ? 'In Ritardo' : statoPresenza === 'assente' ? 'Assente' : 'In attesa';
    showToast(`${memberName}: ${label}`);
  };

  const segnaTuttiPresenti = () => {
    if (!onUpdateODS) return;
    const updatedBrigata = ods.brigata.map((m) => ({
      ...m,
      presenza: 'presente' as const,
    }));
    onUpdateODS({ ...ods, brigata: updatedBrigata });
    showToast('Tutta la brigata segnata come Presente!');
  };

  const copyForWhatsApp = (membroCustom?: MembroBrigata) => {
    const targetFoglio = membroCustom 
      ? getFoglioPersonaleBrigata(ods, membroCustom.id) 
      : foglio;
    if (!targetFoglio) return;

    const text = `📋 *ORDINE DI SERVIZIO PERSONALE*\n` +
      `*Addetto:* ${targetFoglio.member.cognomeNome} (${targetFoglio.member.ruolo})\n` +
      `*Evento:* ${targetFoglio.scheda.eventoNomeTipo}\n` +
      `*Data:* ${targetFoglio.scheda.data}\n` +
      `*Luogo:* ${targetFoglio.scheda.luogoIndirizzo}\n` +
      `*Ritrovo / Ingresso staff:* ${targetFoglio.scheda.ingressoStaff} in loco\n` +
      `*Inizio / Fine evento:* ${targetFoglio.scheda.inizioEvento} - ${targetFoglio.scheda.fineEvento}\n` +
      `*Turno:* ${targetFoglio.member.turno}\n` +
      `*Divisa richiesta:* ${targetFoglio.divisa}\n\n` +
      `📌 *IL TUO SERVIZIO:*\n` +
      targetFoglio.assignmentRows.map((r) => `• ${r.faseNome} (${r.orario}): ${r.postazioneNome} - ${r.cosaFaccio}`).join('\n') +
      `\n\n📞 *CONTATTI UTILI:*\n` +
      `• Capo Servizio (${targetFoglio.capoServizio.nome}): ${targetFoglio.capoServizio.telefono}\n\n` +
      `⚠️ *REGOLE:* Divisa completa, telefono silenzioso fuori vista, allergie da girare SEMPRE a cucina/responsabile, fine servizio solo su via libera.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(`Testo WhatsApp copiato per ${targetFoglio.member.cognomeNome}`);
    setTimeout(() => setCopied(false), 2500);
  };

  // Stats calculation
  const totali = ods.brigata.length;
  const presenti = ods.brigata.filter((m) => m.presenza === 'presente').length;
  const inRitardo = ods.brigata.filter((m) => m.presenza === 'in_ritardo').length;
  const assenti = ods.brigata.filter((m) => m.presenza === 'assente').length;
  const inAttesa = totali - presenti - inRitardo - assenti;
  const percPresenza = totali > 0 ? Math.round((presenti / totali) * 100) : 0;

  // Filtered members for attendance view
  const filteredBrigata = ods.brigata.filter((m) => {
    const matchesSearch = 
      m.cognomeNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.ruoloDettaglio && m.ruoloDettaglio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.turno.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterRuolo === 'responsabili') {
      return m.ruolo === 'capo_servizio' || m.ruolo === 'responsabile';
    }
    if (filterRuolo === 'sala') {
      return m.ruolo === 'addetto' && (!m.ruoloDettaglio || !m.ruoloDettaglio.toLowerCase().includes('bar') && !m.ruoloDettaglio.toLowerCase().includes('cucina'));
    }
    if (filterRuolo === 'bar') {
      return (m.ruoloDettaglio && m.ruoloDettaglio.toLowerCase().includes('bar')) || m.ruoloDettaglio?.toLowerCase().includes('sommelier');
    }
    if (filterRuolo === 'cucina') {
      return (m.ruoloDettaglio && m.ruoloDettaglio.toLowerCase().includes('cucina')) || (m.ruoloDettaglio && m.ruoloDettaglio.toLowerCase().includes('chef'));
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto my-4 sm:my-6 px-3 sm:px-4">
      {/* Toast notification feedback */}
      {feedbackMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-amber-400 text-amber-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs: Appello Live vs Foglio Singolo (No-Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-slate-800 p-2 sm:p-3 rounded-xl mb-5 shadow-lg no-print">
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('appello')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'appello'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>Appello & Presenze Live</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 bg-slate-900/20 rounded">
              {presenti}/{totali}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('singolo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'singolo'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Foglio Singolo Addetto</span>
          </button>
        </div>

        {activeSubTab === 'appello' && (
          <div className="flex items-center gap-2">
            <button
              onClick={segnaTuttiPresenti}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Segna automaticamente tutti i membri come Presenti"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Segna Tutti Presenti</span>
            </button>
          </div>
        )}

        {activeSubTab === 'singolo' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyForWhatsApp()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-750 transition-colors cursor-pointer"
              title="Copia testo formattato da inviare su WhatsApp o Telegram"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiato!' : 'Copia per WhatsApp'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Stampa foglio</span>
            </button>
          </div>
        )}
      </div>

      {/* ==================== SUB-TAB 1: APPELLO E PRESENZE LIVE ==================== */}
      {activeSubTab === 'appello' && (
        <div className="space-y-4 no-print">
          {/* Interactive Progress & Stats Ribbon */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Registro Appello & Stato Presenze in Location
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tocca lo stato di ciascun addetto all'ingresso staff. Dati sincronizzati in tempo reale.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                  <strong>{presenti}</strong> Presenti
                </span>
                <span className="text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg">
                  <strong>{inRitardo}</strong> In ritardo
                </span>
                <span className="text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2.5 py-1 rounded-lg">
                  <strong>{assenti}</strong> Assenti
                </span>
                <span className="text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <strong>{inAttesa}</strong> Da verificare
                </span>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 flex">
              <div
                style={{ width: `${totali > 0 ? (presenti / totali) * 100 : 0}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`${presenti} Presenti`}
              />
              <div
                style={{ width: `${totali > 0 ? (inRitardo / totali) * 100 : 0}%` }}
                className="bg-amber-400 transition-all duration-300"
                title={`${inRitardo} In ritardo`}
              />
              <div
                style={{ width: `${totali > 0 ? (assenti / totali) * 100 : 0}%` }}
                className="bg-rose-500 transition-all duration-300"
                title={`${assenti} Assenti`}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mt-1.5">
              <span>Avanzamento appello staff: <strong>{percPresenza}% presente</strong></span>
              <span>Ritrovo: <strong>{ods.scheda.ingressoStaff}</strong></span>
            </div>
          </div>

          {/* Search and Role Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-slate-800 p-3 rounded-xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cerca per nome, ruolo, turno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {(['tutti', 'responsabili', 'sala', 'bar', 'cucina'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRuolo(r)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors capitalize whitespace-nowrap cursor-pointer ${
                    filterRuolo === r
                      ? 'bg-slate-800 text-amber-300 border border-slate-700 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r === 'tutti' ? 'Tutti i ruoli' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Staff List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBrigata.map((m) => {
              const currentStatus = m.presenza || (m.stato === 'C' ? 'non_ancora_arrivato' : 'non_ancora_arrivato');

              return (
                <div
                  key={m.id}
                  className={`bg-[#0f172a] border rounded-xl p-3.5 transition-all shadow-sm ${
                    currentStatus === 'presente'
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : currentStatus === 'in_ritardo'
                      ? 'border-amber-500/50 bg-amber-950/10'
                      : currentStatus === 'assente'
                      ? 'border-rose-500/50 bg-rose-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          #{m.n}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 truncate">
                          {m.cognomeNome}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-bold uppercase text-amber-300 font-mono">
                          {m.ruolo.replace('_', ' ')}
                        </span>
                        {m.ruoloDettaglio && (
                          <>
                            <span>·</span>
                            <span className="text-slate-300">{m.ruoloDettaglio}</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {m.turno} ({m.oreTotali}h)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {m.cellulare && (
                        <a
                          href={`tel:${m.cellulare}`}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title={`Chiama ${m.cognomeNome} (${m.cellulare})`}
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                        </a>
                      )}
                      <button
                        onClick={() => copyForWhatsApp(m)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Copia foglio WhatsApp per questo addetto"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMemberId(m.id);
                          setActiveSubTab('singolo');
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-semibold cursor-pointer"
                        title="Visualizza e stampa scheda completa"
                      >
                        Scheda
                      </button>
                    </div>
                  </div>

                  {/* 4 Interactive Presence Status Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => updatePresenza(m.id, 'presente')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                        currentStatus === 'presente'
                          ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] truncate">Presente</span>
                    </button>

                    <button
                      onClick={() => updatePresenza(m.id, 'in_ritardo')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                        currentStatus === 'in_ritardo'
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 border border-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] truncate">Ritardo</span>
                    </button>

                    <button
                      onClick={() => updatePresenza(m.id, 'assente')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                        currentStatus === 'assente'
                          ? 'bg-rose-500 text-white ring-2 ring-rose-400 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-800'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] truncate">Assente</span>
                    </button>

                    <button
                      onClick={() => updatePresenza(m.id, 'non_ancora_arrivato')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                        currentStatus === 'non_ancora_arrivato'
                          ? 'bg-slate-700 text-slate-100 ring-1 ring-slate-400'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] truncate">In attesa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: FOGLIO SINGOLO PERSONALE ==================== */}
      {activeSubTab === 'singolo' && (
        <div>
          {/* Member Selector Bar (Hidden in print) */}
          <div className="bg-[#0f172a] border border-slate-800 p-3 sm:p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-3 shadow-lg no-print">
            <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
              <User className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Seleziona Addetto:</span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer flex-1 max-w-sm truncate"
              >
                {ods.brigata.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.n}. {m.cognomeNome} — {m.ruolo.toUpperCase()} ({m.ruoloDettaglio || m.turno})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updatePresenza(selectedMemberId, 'presente')}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Segna Presente Ora
              </button>
            </div>
          </div>

          {!foglio ? (
            <div className="p-8 text-center text-slate-400">Nessun membro della brigata selezionato.</div>
          ) : (
            /* Official A4 Personal ODS Sheet */
            <div className="ods-paper rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-2xl print:p-0 print:border-none print:shadow-none font-sans">
              <div className="border-b-2 border-slate-900 pb-3 mb-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                      ORDINE DI SERVIZIO · FOGLIO PERSONALE (UNO PER OGNI PERSONA)
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight font-display">
                      Foglio Brigata
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dati sincronizzati dal Modello Completo · Conservare e portare con sé durante il servizio
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                    <div><strong>ODS n°:</strong> {ods.scheda.odsNumero}</div>
                    <div>{ods.scheda.revisioneCorrente} · {ods.scheda.dataRevisione}</div>
                  </div>
                </div>
              </div>

              {/* Member & Event Identity Matrix */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 bg-slate-50 border-b border-slate-300">
                  <div className="p-3 border-r border-slate-300">
                    <span className="text-slate-500 font-medium block">Nome e cognome:</span>
                    <span className="text-base font-bold text-slate-950">{foglio.member.cognomeNome}</span>
                    {foglio.member.classeGruppo && <span className="text-slate-500 ml-2">({foglio.member.classeGruppo})</span>}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 font-medium block">Ruolo assegnato:</span>
                      <span className="text-sm font-bold uppercase text-slate-950 font-mono">
                        {foglio.member.ruolo.replace('_', ' ')} {foglio.member.ruoloDettaglio ? `· ${foglio.member.ruoloDettaglio}` : ''}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-500 block">Stato Presenza:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        foglio.member.presenza === 'presente'
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : foglio.member.presenza === 'in_ritardo'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : foglio.member.presenza === 'assente'
                          ? 'bg-rose-100 text-rose-950 border border-rose-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}>
                        {foglio.member.presenza?.toUpperCase() || (foglio.member.stato === 'C' ? 'CONFERMATO' : 'DA CONFERMARE')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="p-2.5 space-y-1.5">
                    <div><strong className="text-slate-600">Evento:</strong> {foglio.scheda.eventoNomeTipo}</div>
                    <div><strong className="text-slate-600">Data:</strong> <span className="font-mono">{foglio.scheda.data}</span></div>
                    <div><strong className="text-slate-600">Ritrovo ora e punto:</strong> <span className="font-mono font-bold text-slate-900">{foglio.scheda.ingressoStaff}</span> ({ods.locationAccessi.ingressoStaffPuntoRitrovo})</div>
                    <div><strong className="text-slate-600">Partenza dalla base:</strong> <span className="font-mono">{foglio.scheda.partenzaBase}</span></div>
                    <div><strong className="text-slate-600">Mezzo / chi accompagna:</strong> {ods.moduloM4.attivo ? ods.moduloM4.mezzoTargaAutista : 'Mezzo proprio / ritrovo diretto in loco'}</div>
                  </div>

                  <div className="p-2.5 space-y-1.5">
                    <div><strong className="text-slate-600">Luogo (indirizzo):</strong> {foglio.scheda.luogoIndirizzo}</div>
                    <div className="flex gap-4 font-mono">
                      <div><strong className="text-slate-600 font-sans">Inizio evento:</strong> {foglio.scheda.inizioEvento}</div>
                      <div><strong className="text-slate-600 font-sans">Fine prevista:</strong> {foglio.scheda.fineEvento}</div>
                    </div>
                    <div><strong className="text-slate-600">Turno orario individuale:</strong> <span className="font-mono font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">{foglio.member.turno}</span> ({foglio.member.oreTotali} ore tot.)</div>
                    <div><strong className="text-slate-600">Divisa richiesta:</strong> <span className="text-slate-800">{foglio.divisa}</span></div>
                  </div>
                </div>
              </div>

              {/* Il Mio Servizio Table */}
              <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-2 rounded-lg flex items-center justify-between">
                  <span>Il Mio Servizio (Le Tue Assegnazioni per Fase)</span>
                  <span className="text-[11px] font-normal opacity-80">Cambi solo su indicazione del responsabile</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300 w-32">Fase</th>
                        <th className="p-2 border-r border-slate-300 w-36">Orario</th>
                        <th className="p-2 border-r border-slate-300 w-44">Dove sono (postazione)</th>
                        <th className="p-2 border-r border-slate-300 w-36">Responsabile</th>
                        <th className="p-2">Cosa faccio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {foglio.assignmentRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                            Nessuna postazione specifica assegnata a questo nominativo nel piano generale.
                          </td>
                        </tr>
                      ) : (
                        foglio.assignmentRows.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">{row.faseNome}</td>
                            <td className="p-2 border-r border-slate-300 font-mono text-slate-800 font-bold">{row.orario}</td>
                            <td className="p-2 border-r border-slate-300 font-bold text-slate-950">
                              {row.postazioneCod} · {row.postazioneNome}
                            </td>
                            <td className="p-2 border-r border-slate-300 text-slate-700">
                              <div>{row.responsabileNome}</div>
                              {row.responsabileTel && (
                                <div className="font-mono text-[11px] text-slate-900 font-medium">{row.responsabileTel}</div>
                              )}
                            </td>
                            <td className="p-2 text-slate-800 font-medium">{row.cosaFaccio}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  Se cambi postazione tra una fase e l'altra, l'orario del cambio è scritto sopra. Resti dove sei assegnato salvo diverso ordine del Capo Servizio.
                </p>
              </section>

              {/* Chi Chiamare Matrix */}
              <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-2 mb-2 rounded-lg">
                  Chi Chiamare in Caso di Bisogno
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Capo Servizio</span>
                    <strong className="text-slate-900 block text-sm">{foglio.capoServizio.nome}</strong>
                    <a href={`tel:${foglio.capoServizio.telefono}`} className="text-slate-950 font-mono font-bold flex items-center mt-1.5 hover:underline">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" /> {foglio.capoServizio.telefono || 'Nessun recapito'}
                    </a>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Resp. della tua postazione</span>
                    <strong className="text-slate-900 block text-sm">
                      {foglio.assignmentRows[0]?.responsabileNome || 'Capo Servizio'}
                    </strong>
                    {foglio.assignmentRows[0]?.responsabileTel ? (
                      <a href={`tel:${foglio.assignmentRows[0]?.responsabileTel}`} className="text-slate-950 font-mono font-bold flex items-center mt-1.5 hover:underline">
                        <Phone className="w-3 h-3 mr-1 text-slate-500" /> {foglio.assignmentRows[0].responsabileTel}
                      </a>
                    ) : (
                      <span className="text-slate-500 font-mono mt-1.5 block">Riferimento diretto in sala</span>
                    )}
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Referente Location</span>
                    <strong className="text-slate-900 block text-sm">{foglio.referenteLocation.nome}</strong>
                    <a href={`tel:${foglio.referenteLocation.telefono}`} className="text-slate-950 font-mono font-bold flex items-center mt-1.5 hover:underline">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" /> {foglio.referenteLocation.telefono || 'Vedi Capo Servizio'}
                    </a>
                  </div>
                </div>
              </section>

              {/* Regole Base di Servizio (Le 7 Regole d'oro del Catering) */}
              <section className="border border-slate-300 rounded p-4 bg-slate-50/50">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  Regole Base di Servizio (Tassative)
                </h2>
                <ul className="text-xs text-slate-800 space-y-1.5">
                  <li><strong>1. Ingresso:</strong> Ti presenti puntuale all'ora di ingresso staff, già in divisa impeccabile e completa.</li>
                  <li><strong>2. Igiene & Decoro:</strong> Mani pulite, capelli raccolti; telefono in silenzioso e tassativamente fuori vista durante tutto il servizio.</li>
                  <li><strong>3. Postazione:</strong> Resti dove sei assegnato e ti sposti solo su esplicita indicazione del responsabile.</li>
                  <li><strong>4. Allergie e diete speciali:</strong> NON rispondi mai a memoria! Se un ospite chiede ingredienti o piatti speciali, chiami subito il responsabile o la cucina.</li>
                  <li><strong>5. Vetro rotto o sversamenti:</strong> Lo segnali subito al responsabile, transenni visivamente e non lasci nulla a terra.</li>
                  <li><strong>6. Imprevisti personali:</strong> Se per qualunque motivo non puoi presentarti, avvisi il Capo Servizio appena lo sai al numero sopra.</li>
                  <li><strong>7. Fine servizio:</strong> Nessuno lascia la location prima del via libera ufficiale del Capo Servizio dopo lo sbarazzo completato.</li>
                </ul>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
