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
    <div className="bg-[#0b0f19] border-b border-slate-800/80 text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status & Summary without static pill bubbles */}
          <div className="flex items-center gap-4">
            {audit.hasIssues ? (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors font-semibold cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Controllo ODS: {audit.warnings.length} avvisi da verificare</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fonte Unica Verificata</span>
              </div>
            )}

            {/* Clean Typographic Metrics */}
            <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Brigata: <strong className="text-slate-200">{audit.stats.addettiTotali}</strong> ({audit.stats.addettiConfermati} C · <span className={audit.stats.addettiDaConfermare > 0 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>{audit.stats.addettiDaConfermare} DC</span>)</span>
              </span>

              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span>Ratio: <strong className="text-slate-200">{audit.stats.rapportoPaxAddetto}</strong> pax/addetto</span>
                <span className="text-[10px] text-slate-500 font-sans">(std: {audit.stats.benchmarkConsigliato})</span>
              </span>

              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Ore: <strong className="text-slate-200">{audit.stats.oreTotaliBrigata}h</strong></span>
              </span>
            </div>
          </div>

          {/* Toggle details button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white px-2 py-1 rounded transition-colors ml-auto text-xs cursor-pointer hover:bg-slate-800/50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium hidden sm:inline">Pannello Integrità & Regole</span>
            <span className="font-medium sm:hidden">Regole</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        {/* Expanded Panel */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Warnings list */}
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Controlli di coerenza (Fonte Unica & Assegnazioni)
              </h4>
              {audit.warnings.length === 0 ? (
                <p className="text-slate-400 italic text-xs">Nessun conflitto rilevato. Tutte le postazioni hanno responsabili e la brigata è coerente.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {audit.warnings.map((warn, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-200 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Infos & Operational Principles */}
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2 text-xs">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Note Operative & Principi ODS
              </h4>
              <ul className="space-y-2 text-slate-300 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Fonte Unica:</strong> Le persone si definiscono solo nella Sez. 4, i materiali solo nella Sez. 7. Le altre sezioni rimandano con codici P# e C#.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Stato su tutto:</strong> Ogni voce o persona è C (confermato) o DC (da confermare). Risolvere tutti i DC prima dell'emissione.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>ODS Derivati:</strong> Capo Servizio, Brigata, Carico e In Servizio si aggiornano automaticamente da questa fonte.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
