import React, { useState } from 'react';
import { MasterODS, Revisione } from '../../types/ods';
import { X, History, Plus, AlertCircle } from 'lucide-react';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ods: MasterODS;
  onUpdateODS: (updated: MasterODS) => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({ isOpen, onClose, ods, onUpdateODS }) => {
  const [cosaCambiato, setCosaCambiato] = useState('');
  const [autore, setAutore] = useState(ods.scheda.redattoDa || 'Direttore Catering');

  if (!isOpen) return null;

  const currentRevNum = parseInt(ods.scheda.revisioneCorrente.replace(/\D/g, '')) || 0;
  const nextRev = `Rev. ${currentRevNum + 1}`;
  const today = new Date().toLocaleDateString('it-IT');

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cosaCambiato) return;

    const newRevItem: Revisione = {
      rev: nextRev,
      data: today,
      cosaCambiato,
      autore,
    };

    onUpdateODS({
      ...ods,
      scheda: {
        ...ods.scheda,
        revisioneCorrente: nextRev,
        dataRevisione: today,
      },
      revisioni: [newRevItem, ...ods.revisioni],
    });

    setCosaCambiato('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-display">Registro Revisioni ODS</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info box: Regola delle revisioni */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 mb-4 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Regola ODS:</strong> Ogni modifica dopo l'emissione incrementa la revisione. Vale solo l'ultima.
            Gli ODS derivati (Capo Servizio, Brigata, Carico, In Servizio) si ricopiano sempre dall'ultima revisione.
          </div>
        </div>

        {/* Existing revisions table */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Storico Emissioni ODS</h3>
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <th className="p-2 w-20">Rev.</th>
                  <th className="p-2 w-24">Data</th>
                  <th className="p-2">Cosa è cambiato</th>
                  <th className="p-2 w-28">Autore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {ods.revisioni.map((rev, i) => (
                  <tr key={i} className={i === 0 ? 'bg-amber-500/10 text-amber-200' : 'text-slate-300'}>
                    <td className="p-2 font-bold">{rev.rev}</td>
                    <td className="p-2">{rev.data}</td>
                    <td className="p-2 font-sans">{rev.cosaCambiato}</td>
                    <td className="p-2 font-sans">{rev.autore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form to bump revision */}
        <form onSubmit={handleCreateRevision} className="space-y-3 border-t border-slate-800 pt-4 text-xs">
          <h3 className="text-xs font-bold uppercase text-amber-300">Registra Nuova Revisione ({nextRev})</h3>
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Cosa è cambiato:</label>
            <input
              type="text"
              placeholder="es. Modificato menu per allergia lattosio, aggiornato orario carico..."
              value={cosaCambiato}
              onChange={(e) => setCosaCambiato(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Autore modifica:</label>
            <input
              type="text"
              value={autore}
              onChange={(e) => setAutore(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              Chiudi
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emetti {nextRev}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
