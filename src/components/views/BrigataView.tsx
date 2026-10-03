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
    <div className="max-w-4xl mx-auto my-6">
      {/* Member Selector Bar (Hidden in print) */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-neutral-300 font-medium">Seleziona membro della brigata:</span>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-white text-xs rounded px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded text-xs font-semibold hover:bg-emerald-900/80 transition-colors cursor-pointer"
            title="Copia testo formattato da inviare su WhatsApp o Telegram"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiato!' : 'Copia per WhatsApp / SMS'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 text-neutral-200 border border-neutral-700 rounded text-xs font-semibold hover:bg-neutral-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Stampa questo foglio</span>
          </button>
        </div>
      </div>

      {/* Official A4 Personal ODS Sheet */}
      <div className="bg-white text-slate-900 shadow-sm border border-slate-200 rounded-lg p-6 sm:p-8 print:p-0 print:border-none print:shadow-none">
        <div className="border-b-2 border-slate-900 pb-3 mb-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                ORDINE DI SERVIZIO · FOGLIO PERSONALE (UNO PER OGNI PERSONA)
              </span>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Brigata
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dati copiati dal Modello Completo · Conservare e portare con sé durante il servizio
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-700 bg-slate-100 p-2 rounded border border-slate-300">
              <div><strong>ODS n°:</strong> {ods.scheda.odsNumero}</div>
              <div>{ods.scheda.revisioneCorrente} · {ods.scheda.dataRevisione}</div>
            </div>
          </div>
        </div>

        {/* Member & Event Identity Matrix */}
        <div className="border border-slate-300 rounded overflow-hidden text-xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-slate-50 border-b border-slate-300">
            <div className="p-2.5 border-r border-slate-300">
              <span className="text-slate-500 font-medium block">Nome e cognome:</span>
              <span className="text-base font-bold text-slate-950">{foglio.member.cognomeNome}</span>
              {foglio.member.classeGruppo && <span className="text-slate-500 ml-2">({foglio.member.classeGruppo})</span>}
            </div>
            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium block">Ruolo assegnato:</span>
                <span className="text-sm font-bold uppercase text-emerald-800 font-mono">
                  {foglio.member.ruolo.replace('_', ' ')} {foglio.member.ruoloDettaglio ? `· ${foglio.member.ruoloDettaglio}` : ''}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-500 block">Stato:</span>
                <span className="font-bold text-slate-800">{foglio.member.stato === 'C' ? 'Confermato (C)' : 'Da Confermare (DC)'}</span>
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
              <div><strong className="text-slate-600">Turno orario individuale:</strong> <span className="font-mono font-bold text-slate-950 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{foglio.member.turno}</span> ({foglio.member.oreTotali} ore tot.)</div>
              <div><strong className="text-slate-600">Divisa richiesta:</strong> <span className="text-slate-800">{foglio.divisa}</span></div>
            </div>
          </div>
        </div>

        {/* Il Mio Servizio Table */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 mb-2 flex items-center justify-between">
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
                          <div className="font-mono text-[11px] text-emerald-800">{row.responsabileTel}</div>
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
          <h2 className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 mb-2">
            Chi Chiamare in Caso di Bisogno
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Capo Servizio</span>
              <strong className="text-slate-900 block text-sm">{foglio.capoServizio.nome}</strong>
              <a href={`tel:${foglio.capoServizio.telefono}`} className="text-emerald-700 font-mono font-bold flex items-center mt-1 hover:underline">
                <Phone className="w-3 h-3 mr-1" /> {foglio.capoServizio.telefono || 'Nessun recapito'}
              </a>
            </div>

            <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Resp. della tua postazione</span>
              <strong className="text-slate-900 block text-sm">
                {foglio.assignmentRows[0]?.responsabileNome || 'Capo Servizio'}
              </strong>
              {foglio.assignmentRows[0]?.responsabileTel ? (
                <a href={`tel:${foglio.assignmentRows[0]?.responsabileTel}`} className="text-emerald-700 font-mono font-bold flex items-center mt-1 hover:underline">
                  <Phone className="w-3 h-3 mr-1" /> {foglio.assignmentRows[0].responsabileTel}
                </a>
              ) : (
                <span className="text-slate-500 font-mono mt-1 block">Riferimento diretto in sala</span>
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
