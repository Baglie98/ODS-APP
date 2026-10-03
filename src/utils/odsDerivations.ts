import { MasterODS, MembroBrigata, Postazione } from '../types/ods';

export interface AuditResult {
  hasIssues: boolean;
  warnings: string[];
  infos: string[];
  stats: {
    totalePax: number;
    addettiTotali: number;
    addettiConfermati: number;
    addettiDaConfermare: number;
    oreTotaliBrigata: number;
    rapportoPaxAddetto: number;
    benchmarkConsigliato: string;
    materialiTotali: number;
    contenitoriTotali: number;
  };
}

/**
 * Validates the "Fonte Unica" consistency principles across the ODS
 */
export function auditODSConsistency(ods: MasterODS): AuditResult {
  const warnings: string[] = [];
  const infos: string[] = [];

  const totalePax = (ods.scheda.ospitiAdulti || 0) + (ods.scheda.ospitiBambiniSpeciali || 0);
  const addettiTotali = ods.brigata.length;
  const addettiConfermati = ods.brigata.filter((b) => b.stato === 'C').length;
  const addettiDaConfermare = ods.brigata.filter((b) => b.stato === 'DC').length;
  const oreTotaliBrigata = ods.brigata.reduce((acc, b) => acc + (b.oreTotali || 0), 0);
  const rapportoPaxAddetto = addettiTotali > 0 ? parseFloat((totalePax / addettiTotali).toFixed(1)) : 0;

  // Recommended benchmark based on event format
  let benchmarkConsigliato = '~9.0';
  if (ods.scheda.formato === 'buffet') benchmarkConsigliato = '6.9 - 8.5 (Buffet / Cocktail)';
  else if (ods.scheda.formato === 'servito_al_tavolo') benchmarkConsigliato = '8.0 - 10.0 (Placé servito)';
  else if (ods.scheda.formato === 'in_piedi') benchmarkConsigliato = '10.0 - 12.0 (Cocktail in piedi)';
  else if (ods.scheda.formato === 'lezione') benchmarkConsigliato = '5.0 - 7.0 (Masterclass / Lezione)';

  // Rule 1: No unconfirmed staff in finalized event
  if (addettiDaConfermare > 0) {
    warnings.push(`Ci sono ${addettiDaConfermare} persone in brigata con stato "DC" (da confermare). Risolvere prima dell'emissione definitiva.`);
  }

  // Rule 2: Check if any person is assigned to more than 1 station during the same phase
  const activePostazioni = ods.postazioni.filter((p) => p.attiva);
  ['faseA', 'faseB', 'faseC'].forEach((faseKey) => {
    const phaseLabel = faseKey === 'faseA' ? 'Fase A' : faseKey === 'faseB' ? 'Fase B' : 'Fase C';
    const seenMap: { [personId: string]: string[] } = {};

    activePostazioni.forEach((p) => {
      const faseData = p[faseKey as 'faseA' | 'faseB' | 'faseC'];
      faseData.addettiIds.forEach((pId) => {
        if (!seenMap[pId]) seenMap[pId] = [];
        seenMap[pId].push(p.codice);
      });
    });

    Object.entries(seenMap).forEach(([pId, stations]) => {
      if (stations.length > 1) {
        const persona = ods.brigata.find((b) => b.id === pId)?.cognomeNome || pId;
        warnings.push(`Sovrapposizione oraria in ${phaseLabel}: ${persona} è assegnato/a contemporaneamente a ${stations.join(' e ')}.`);
      }
    });
  });

  // Rule 3: Check if every person in brigata is assigned to at least one station
  ods.brigata.forEach((b) => {
    let assigned = false;
    activePostazioni.forEach((p) => {
      if (
        p.responsabileId === b.id ||
        p.faseA.addettiIds.includes(b.id) ||
        p.faseB.addettiIds.includes(b.id) ||
        p.faseC.addettiIds.includes(b.id)
      ) {
        assigned = true;
      }
    });
    if (!assigned) {
      infos.push(`${b.cognomeNome} è in anagrafica ma non risulta ancora assegnato/a a nessuna postazione.`);
    }
  });

  // Rule 4: Check if each active postazione has a responsabile
  activePostazioni.forEach((p) => {
    if (!p.responsabileId) {
      warnings.push(`La postazione ${p.codice} (${p.nome}) non ha un responsabile assegnato.`);
    }
  });

  // Rule 5: Check allergen awareness
  if (ods.allergeni.length > 0) {
    infos.push(`Attenzione: Registrati ${ods.allergeni.length} regimi alimentari speciali / allergeni critici. Ricordare il briefing dedicato.`);
  }

  return {
    hasIssues: warnings.length > 0,
    warnings,
    infos,
    stats: {
      totalePax,
      addettiTotali,
      addettiConfermati,
      addettiDaConfermare,
      oreTotaliBrigata,
      rapportoPaxAddetto,
      benchmarkConsigliato,
      materialiTotali: ods.materiali.length,
      contenitoriTotali: ods.contenitori.length,
    },
  };
}

/**
 * Extracts personal ODS for a single staff member
 */
export function getFoglioPersonaleBrigata(ods: MasterODS, memberId: string) {
  const member = ods.brigata.find((b) => b.id === memberId);
  if (!member) return null;

  // Find all postazioni where this member is active
  const assignmentRows: {
    faseNome: string;
    faseCodice: string;
    orario: string;
    postazioneNome: string;
    postazioneCod: string;
    responsabileNome: string;
    responsabileTel: string;
    cosaFaccio: string;
  }[] = [];

  ods.postazioni
    .filter((p) => p.attiva)
    .forEach((p) => {
      const resp = ods.brigata.find((b) => b.id === p.responsabileId);
      const isResp = p.responsabileId === member.id;

      // Check Fase A
      if (isResp || p.faseA.addettiIds.includes(member.id)) {
        assignmentRows.push({
          faseNome: 'Fase A · Allestimento',
          faseCodice: 'F3',
          orario: p.faseA.orario,
          postazioneNome: p.nome,
          postazioneCod: p.codice,
          responsabileNome: resp?.cognomeNome || 'Da assegnare',
          responsabileTel: resp?.cellulare || '',
          cosaFaccio: isResp ? `Responsabile postazione: coordinamento e allestimento ${p.nome}` : `Supporto allestimento ${p.nome}`,
        });
      }

      // Check Fase B
      if (isResp || p.faseB.addettiIds.includes(member.id)) {
        assignmentRows.push({
          faseNome: 'Fase B · Servizio attivo',
          faseCodice: 'F6',
          orario: p.faseB.orario,
          postazioneNome: p.nome,
          postazioneCod: p.codice,
          responsabileNome: resp?.cognomeNome || 'Da assegnare',
          responsabileTel: resp?.cellulare || '',
          cosaFaccio: isResp ? `Responsabile postazione: gestione flusso ospiti e rimpiazzi` : `Servizio attivo in ${p.nome}`,
        });
      }

      // Check Fase C
      if (isResp || p.faseC.addettiIds.includes(member.id)) {
        assignmentRows.push({
          faseNome: 'Fase C · Sbarazzo & Chiusura',
          faseCodice: 'F7',
          orario: p.faseC.orario,
          postazioneNome: p.nome,
          postazioneCod: p.codice,
          responsabileNome: resp?.cognomeNome || 'Da assegnare',
          responsabileTel: resp?.cellulare || '',
          cosaFaccio: isResp ? `Responsabile chiusura: verifica materiale e conteggi` : `Sbarazzo e inscatolamento ${p.nome}`,
        });
      }
    });

  const capoServizio = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('capo servizio')) || {
    nome: ods.brigata.find((b) => b.ruolo === 'capo_servizio')?.cognomeNome || 'Capo Servizio',
    telefono: ods.brigata.find((b) => b.ruolo === 'capo_servizio')?.cellulare || '',
  };

  const referenteLocation = ods.contatti.find((c) => c.ruolo.toLowerCase().includes('location') || c.ruolo.toLowerCase().includes('loco')) || {
    nome: 'Direzione Location',
    telefono: '',
  };

  return {
    member,
    scheda: ods.scheda,
    assignmentRows,
    capoServizio,
    referenteLocation,
    divisa: member.ruolo === 'capo_servizio' ? ods.divise.capoServizioResponsabili : ods.divise.staff,
  };
}

/**
 * Extracts distribution for Carico e Facchinaggio: maps postazioni to containers
 */
export function getCaricoDistribuzionePostazioni(ods: MasterODS) {
  return ods.postazioni
    .filter((p) => p.attiva)
    .map((p) => {
      // Find materials destined to this postazione
      const matInPostazione = ods.materiali.filter(
        (m) => m.destinazione.toLowerCase().includes(p.codice.toLowerCase()) || m.destinazione.toLowerCase().includes(p.nome.toLowerCase())
      );

      // Find containers
      const containers = Array.from(new Set(matInPostazione.map((m) => m.contenitore).filter((c) => c && c !== 'FC')));
      const fuoriContenitore = matInPostazione
        .filter((m) => m.contenitore === 'FC' || m.categoria === 'Tavoli, tovaglie e arredi' || m.categoria === 'Attrezzatura')
        .map((m) => m.voce);

      return {
        postazioneCod: p.codice,
        postazioneNome: p.nome,
        contenitori: containers.join(', ') || 'Nessuno',
        fuoriContenitore: fuoriContenitore.join(', ') || 'Nessuno',
        responsabile: ods.brigata.find((b) => b.id === p.responsabileId)?.cognomeNome || '-',
      };
    });
}
