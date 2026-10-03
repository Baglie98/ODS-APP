import React, { useState } from 'react';
import { MasterODS, FormatoEvento } from '../../types/ods';
import { sampleEvents } from '../../data/sampleEvents';
import { createBlankODS } from '../../utils/odsFactory';
import { X, Sparkles, Plus, FileEdit } from 'lucide-react';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: MasterODS) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onCreateEvent }) => {
  const [nomeEvento, setNomeEvento] = useState('');
  const [committente, setCommittente] = useState('');
  const [dataEvento, setDataEvento] = useState(new Date().toLocaleDateString('it-IT'));
  const [luogo, setLuogo] = useState('');
  const [formato, setFormato] = useState<FormatoEvento>('buffet');
  const [paxAdulti, setPaxAdulti] = useState(100);
  const [templateSource, setTemplateSource] = useState<'vuoto' | 'buffet' | 'placee'>('vuoto');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newEvent: MasterODS;

    if (templateSource === 'vuoto') {
      newEvent = createBlankODS(undefined, nomeEvento, formato);
    } else if (templateSource === 'placee') {
      newEvent = JSON.parse(JSON.stringify(sampleEvents[1]));
      newEvent.id = 'ods-' + Date.now();
      newEvent.scheda.odsNumero = '2026-' + Math.floor(100 + Math.random() * 900);
      newEvent.scheda.revisioneCorrente = 'Rev. 0';
      newEvent.scheda.dataRevisione = new Date().toLocaleDateString('it-IT');
    } else {
      newEvent = JSON.parse(JSON.stringify(sampleEvents[0]));
      newEvent.id = 'ods-' + Date.now();
      newEvent.scheda.odsNumero = '2026-' + Math.floor(100 + Math.random() * 900);
      newEvent.scheda.revisioneCorrente = 'Rev. 0';
      newEvent.scheda.dataRevisione = new Date().toLocaleDateString('it-IT');
    }

    if (nomeEvento) newEvent.scheda.eventoNomeTipo = nomeEvento;
    if (committente) newEvent.scheda.committente = committente;
    if (dataEvento) newEvent.scheda.data = dataEvento;
    if (luogo) newEvent.scheda.luogoIndirizzo = luogo;
    newEvent.scheda.formato = formato;
    newEvent.scheda.ospitiAdulti = paxAdulti;

    onCreateEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              +
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Crea Nuovo Ordine di Servizio (ODS)</h2>
              <p className="text-[11px] text-neutral-400">Compilazione Fonte Unica a 360°</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Seleziona Modello di Partenza:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateSource('vuoto')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  templateSource === 'vuoto'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="text-xs flex items-center gap-1">
                  <FileEdit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ODS Vuoto</span>
                </div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">Pronto da compilare da zero per evento reale</div>
              </button>

              <button
                type="button"
                onClick={() => setTemplateSource('buffet')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  templateSource === 'buffet'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="text-xs">Buffet Completo</div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">Precompilato 200 pax con isole e M1/M4/M5</div>
              </button>

              <button
                type="button"
                onClick={() => setTemplateSource('placee')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  templateSource === 'placee'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="text-xs">Placé Servito</div>
                <div className="text-[10px] opacity-75 font-normal mt-0.5">Cena alta cucina 36 pax con maitre e cloche</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Nome & Tipologia Evento:</label>
            <input
              type="text"
              placeholder="es. Ricevimento Nuziale / Cena Aziendale / Cocktail Party..."
              value={nomeEvento}
              onChange={(e) => setNomeEvento(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-medium focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Committente:</label>
              <input
                type="text"
                placeholder="es. Studio Rossi / Dott.ssa Bianchi"
                value={committente}
                onChange={(e) => setCommittente(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Data Evento:</label>
              <input
                type="text"
                placeholder="GG/MM/AAAA"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-neutral-100 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Luogo / Indirizzo:</label>
            <input
              type="text"
              placeholder="es. Villa dei Cedri, Via Appia Antica 248, Roma"
              value={luogo}
              onChange={(e) => setLuogo(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Formato Servizio:</label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value as FormatoEvento)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 font-medium cursor-pointer"
              >
                <option value="buffet">Buffet / Cocktail Dinner</option>
                <option value="servito_al_tavolo">Servito al tavolo (Placé)</option>
                <option value="in_piedi">Cocktail in piedi</option>
                <option value="seduto">Seduto informale</option>
                <option value="lezione">Masterclass / Lezione chef</option>
                <option value="altro">Altro formato</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Pax Stimati (Adulti):</label>
              <input
                type="number"
                value={paxAdulti}
                onChange={(e) => setPaxAdulti(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono font-bold text-neutral-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Crea e Inizia a Compilare</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

