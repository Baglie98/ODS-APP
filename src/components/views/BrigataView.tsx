import React, { useState } from 'react';
import { MasterODS } from '../../types/ods';
import { getFoglioPersonaleBrigata } from '../../utils/odsDerivations';
import { Phone, User, Copy, Check, ShieldCheck, Printer } from 'lucide-react';

interface BrigataViewProps {
  ods: MasterODS;
}

export const BrigataView: React.FC<BrigataViewProps> = ({ ods }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(ods.brigata[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const foglio = getFoglioPersonaleBrigata(ods, selectedMemberId);

  const copyForWhatsApp = () => {
    if (!foglio) return;
    const text = `📋 *ORDINE DI SERVIZIO PERSONALE*\n` +
      `*Addetto:* ${foglio.member.cognomeNome} (${foglio.member.ruolo})\n` +
      `*Evento:* ${foglio.scheda.eventoNomeTipo}\n` +
      `*Data:* ${foglio.scheda.data}\n` +
      `*Luogo:* ${foglio.scheda.luogoIndirizzo}\n` +
      `*Ritrovo / Ingresso staff:* ${foglio.scheda.ingressoStaff} in loco\n` +
      `*Inizio / Fine evento:* ${foglio.scheda.inizioEvento} - ${foglio.scheda.fineEvento}\n` +
      `*Turno:* ${foglio.member.turno}\n` +
      `*Divisa richiesta:* ${foglio.divisa}\n\n` +
      `📌 *IL TUO SERVIZIO:*\n` +
      foglio.assignmentRows.map((r) => `• ${r.faseNome} (${r.orario}): ${r.postazioneNome} - ${r.cosaFaccio}`).join('\n') +
      `\n\n📞 *CONTATTI UTILI:*\n` +
      `• Capo Servizio (${foglio.capoServizio.nome}): ${foglio.capoServizio.telefono}\n\n` +
      `⚠️ *REGOLE:* Divisa completa, telefono silenzioso fuori vista, allergie da girare SEMPRE a cucina/responsabile, fine servizio solo su via libera.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!foglio) {
    return <div className="p-8 text-center text-slate-400">Nessun membro della brigata selezionato.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-4 sm:my-6 px-3 sm:px-4">
      {/* Member Selector Bar (Hidden in print) */}
      <div className="bg-[#0f172a] border border-slate-800 p-3 sm:p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-3 shadow-lg no-print">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <User className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Membro brigata:</span>
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
            onClick={copyForWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-750 transition-colors cursor-pointer"
            title="Copia testo formattato da inviare su WhatsApp o Telegram"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiato!' : 'Copia per WhatsApp / SMS'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Stampa foglio</span>
          </button>
        </div>
      </div>

      {/* Official A4 Personal ODS Sheet */}
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
                Dati copiati dal Modello Completo · Conservare e portare con sé durante il servizio
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
                <span className="text-slate-500 block">Stato:</span>
                <span className="font-bold text-slate-900">{foglio.member.stato === 'C' ? 'Confermato (C)' : 'Da Confermare (DC)'}</span>
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

            <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Referente Location</span>
              <strong className="text-slate-900 block text-sm">{foglio.referenteLocation.nome}</strong>
              <a href={`tel:${foglio.referenteLocation.telefono}`} className="text-emerald-700 font-mono font-bold flex items-center mt-1 hover:underline">
                <Phone className="w-3 h-3 mr-1" /> {foglio.referenteLocation.telefono || 'Vedi Capo Servizio'}
              </a>
            </div>
          </div>
        </section>

        {/* Regole Base di Servizio (Le 7 Regole d'oro del Catering) */}
        <section className="border border-slate-300 rounded p-4 bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
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
    </div>
  );
};
