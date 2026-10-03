import React, { useState } from 'react';
import { MasterODS } from '../types/ods';
import { auditODSConsistency } from '../utils/odsDerivations';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Users, 
  Clock, 
  Scale
} from 'lucide-react';

interface ConsistencyAuditBarProps {
  ods: MasterODS;
}

export const ConsistencyAuditBar: React.FC<ConsistencyAuditBarProps> = ({ ods }) => {
  const [expanded, setExpanded] = useState(false);
  const audit = auditODSConsistency(ods);

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Badge & Summary */}
          <div className="flex items-center gap-3">
            {audit.hasIssues ? (
              <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-md font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Verifica ODS: {audit.warnings.length} avvisi da risolvere</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Fonte Unica Verificata: Nessun conflitto</span>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="hidden sm:flex items-center gap-4 text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-neutral-500" />
                <span>Brigata: <strong className="text-white font-semibold">{audit.stats.addettiTotali}</strong> ({audit.stats.addettiConfermati} C · {audit.stats.addettiDaConfermare} DC)</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Scale className="w-3 h-3 text-neutral-500" />
                <span>Rapporto Pax/Addetto: <strong className="text-white font-semibold">{audit.stats.rapportoPaxAddetto}</strong> (Benchmark: {audit.stats.benchmarkConsigliato})</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>Ore totali: <strong className="text-white font-semibold">{audit.stats.oreTotaliBrigata}h</strong></span>
              </span>
            </div>
          </div>

          {/* Toggle details button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-neutral-300 hover:text-white px-2 py-1 rounded hover:bg-neutral-800 transition-colors ml-auto"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Regole di compilazione & Allarmi</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded Panel */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Warnings list */}
            <div>
              <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Controlli di coerenza (Fonte Unica & Assegnazioni)
              </h4>
              {audit.warnings.length === 0 ? (
                <p className="text-neutral-400 italic">Nessun conflitto rilevato. Tutte le postazioni hanno responsabili e la brigata è coerente.</p>
              ) : (
                <ul className="space-y-1.5">
                  {audit.warnings.map((warn, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-amber-300/90 bg-amber-950/30 p-1.5 rounded border border-amber-900/40">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Infos & Operational Principles */}
            <div>
              <h4 className="font-semibold text-neutral-200 mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Note Operative & Principi ODS
              </h4>
              <ul className="space-y-1 text-neutral-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Fonte Unica:</strong> Le persone si definiscono solo nella Sez. 4, i materiali solo nella Sez. 7. Le altre sezioni rimandano con codici P# e C#.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Stato su tutto:</strong> Ogni voce o persona è C (confermato) o DC (da confermare). Risolvere tutti i DC prima dell'emissione.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>ODS Derivati:</strong> Capo Servizio, Brigata, Carico e In Servizio si aggiornano automaticamente da questa fonte.</span>
                </li>
                {audit.infos.map((info, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-neutral-400">
                    <span className="text-neutral-500 font-bold">•</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
