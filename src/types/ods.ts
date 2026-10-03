export type StatusConferma = 'C' | 'DC'; // C = confermato, DC = da confermare

export type FormatoEvento = 'in_piedi' | 'buffet' | 'servito_al_tavolo' | 'seduto' | 'lezione' | 'altro';

export type TipoMateriale = 'M' | 'O' | 'N' | 'A'; // M = magazzino base, O = ordine fornitore, N = noleggio restituzione, A = acquisto consumo

export type StatoMateriale = 'O' | 'P' | 'C' | 'R'; // O = ordinato, P = preparato, C = caricato, R = reso o rientrato

export type RuoloBrigata = 'capo_servizio' | 'responsabile' | 'addetto';

export interface Revisione {
  rev: string;
  data: string;
  cosaCambiato: string;
  autore: string;
}

export interface SchedaEvento {
  odsNumero: string;
  revisioneCorrente: string;
  dataRevisione: string;
  eventoNomeTipo: string;
  data: string;
  committente: string;
  luogoIndirizzo: string;
  inizioEvento: string;
  fineEvento: string;
  ingressoStaff: string;
  partenzaBase: string;
  ospitiAdulti: number;
  ospitiBambiniSpeciali: number;
  formato: FormatoEvento;
  formatoAltroDescrizione?: string;
  redattoDa: string;
  approvatoDa: string;
}

export interface FaseTimeline {
  codice: string; // F1, F2, ... F9, F6b, etc.
  nome: string;
  inizio: string;
  fine: string;
  cosaSuccede: string;
  guidaResponsabile: string;
  oraReale?: string;
  note?: string;
}

export interface ContattoRuolo {
  id: string;
  ruolo: string;
  nome: string;
  telefono: string;
  note: string;
}

export interface DettagliLocationAccessi {
  ingressoStaffPuntoRitrovo: string;
  caricoScaricoPuntoFascia: string;
  parcheggioMezzo: string;
  ztlPermessiAccesso: string;
  percorsoInterno: string;
  cucinaDisponibile: boolean;
  cucinaAttrezzature: string;
  acquaScarichi: string;
  correntePresePotenza: string;
  spaziBackGuardarobaDeposito: string;
  serviziIgieniciSpogliatoio: string;
  raccoltaRifiuti: string;
  sopralluogoFatto: boolean;
  sopralluogoData?: string;
  sopralluogoDaChi?: string;
  layoutPostazioniAllegato: boolean;
  layoutNote?: string;
}

export interface DiviseLivello {
  staff: string;
  capoServizioResponsabili: string;
  cucina: string;
  altro: string;
}

export interface MembroBrigata {
  id: string;
  n: number;
  cognomeNome: string;
  classeGruppo?: string;
  ruolo: RuoloBrigata;
  ruoloDettaglio?: string; // es. Barman, Caposala, Runner, Guardarobiere
  turno: string;
  oreTotali: number;
  stato: StatusConferma;
  cellulare: string;
}

export interface PostazioneFaseAssegnazione {
  orario: string;
  addettiIds: string[]; // rimanda a MembroBrigata.id
}

export interface Postazione {
  codice: string; // P1..P10 o P#
  nome: string;
  responsabileId: string; // rimanda a MembroBrigata.id
  faseA: PostazioneFaseAssegnazione;
  faseB: PostazioneFaseAssegnazione;
  faseC: PostazioneFaseAssegnazione;
  attiva: boolean;
}

export interface PiattoMenu {
  id: string;
  momento: string; // Aperitivo / benvenuto, Antipasto / finger food, Primo, Secondo, Dolce, Caffè e fine pasto, Vini
  propostaPiatti: string;
  porzioni: number;
  note: string;
}

export interface AllergeneDieta {
  id: string;
  ospiteGruppo: string;
  allergeneDieta: string;
  gestione: string; // chi prepara, come si riconosce il piatto
  respInSala: string;
}

export interface FabbisognoVoce {
  id: string;
  voce: string; // Vino e prosecco, Alcolici da cocktail, Soft drink, Acqua, Ghiaccio, Monouso, Pane e food extra
  dosePerOspite: number; // in litri o pezzi
  unitaDose: string; // L, pz, kg
  formatoAcquisto: string; // es. 'Bottiglia 0.75 L', 'Cassa da 6', 'Sacco 10 kg'
  note?: string;
}

export interface VoceMateriale {
  id: string;
  n: number;
  categoria: 'Bevande' | 'Food e monouso' | 'Vetro e stoviglie' | 'Vassoi, cestini e supporti' | 'Attrezzatura' | 'Tavoli, tovaglie e arredi' | 'Pulizia' | 'Varie';
  voce: string;
  qta: number;
  unitaBaseFormato: string;
  alternativaAccettata?: string;
  tipo: TipoMateriale;
  destinazione: string; // es. P1, P2, Cucina
  contenitore: string; // es. C1, C2, FC
  stato: StatoMateriale;
  fornitoreNoleggio?: string;
  dataOraRestituzione?: string;
}

export interface ContenitoreMaster {
  codice: string; // C1..C8, FC
  tipo: string; // cassone / cassa / polibox / roll
  contenutoSintetico: string;
  destinazione: string;
  pesoIngombro: string;
  checkCaricoBase?: boolean;
  checkScaricoLocation?: boolean;
  checkCaricoRitorno?: boolean;
  checkScaricoBase?: boolean;
}

export interface MovimentoLogistica {
  id: string;
  tipoMovimento: string; // Carico alla base, Partenza, Consegna in location, Ritiro merce fornitori, Ritorno materiale, Scarico base, Resi fornitori
  dataOra: string;
  chi: string;
  mezzo: string;
  daA: string;
  giri?: string;
  note: string;
}

export interface SicurezzaEmergenze {
  vieDiFugaUscite: string;
  cassettaPrimoSoccorso: string;
  estintori: string;
  referenteSicurezzaLocation: string;
  personaPrimoIntervento: string;
  maloreInfortunioProcedura: string;
  vetroRottoSversamenti: string;
  brigataMinorenneAdulto: string;
  allegatoPlanimetria: boolean;
  allegatoSchedaAllergeni: boolean;
  allegatoMenuDefinitivo: boolean;
  allegatoPermessiZTL: boolean;
  allegatoListaOspiti: boolean;
}

// Moduli Opzionali (M1 - M6)
export interface ModuloM1Guardaroba {
  attivo: boolean;
  ospitiAttesi: number;
  sistema: string; // numeri, ticket, cartellini
  capacita: string;
  responsabileP7: string;
  aperturaChiusura: string;
  oggettiSmarriti: string;
  listaOspitiAccrediti: boolean;
  accoglienzaDettagli: string;
}

export interface ModuloM2PuntoBambini {
  attivo: boolean;
  bambiniAttesiFasce: string;
  menuBevandeDedicati: string;
  responsabileP8: string;
  adultiRiferimentoCommittente: string;
  attivitaMateriali: string;
  zonaSicurezza: string;
  orariApertura: string;
}

export interface TappaProgrammaChef {
  id: string;
  ora: string;
  attivita: string;
  luogo: string;
  chiGuida: string;
  staffEMateriale: string;
}

export interface ModuloM3ProgrammaChef {
  attivo: boolean;
  tappe: TappaProgrammaChef[];
}

export interface ModuloM4TrasportoFurgone {
  attivo: boolean;
  mezzoTargaAutista: string;
  squadraCaricoBase: string;
  squadraScaricoLocation: string;
  giriAndataOrari: string;
  giriRitornoOrari: string;
  percorsoZtlPermessi: string;
  accessoMagazzinoBase: string;
  caricoCompletatoEntro: string;
  firmaCapoCarico: string;
  firmaRicezione: string;
}

export interface PortataRimpiazzo {
  id: string;
  portata: string;
  giri: string; // es. '3 giri solo forchetta + 1 giro mezzo cucchiaio'
  cosaSiPorta: string;
  chi: string;
}

export interface ModuloM5CucinaRimpiazzi {
  attivo: boolean;
  responsabileCucina: string;
  porzionaturaChiEDove: string;
  passaggioCucinaSala: string;
  materialeDestinatoCucinaNote: string;
  viniAbbinamenti: string;
  portate: PortataRimpiazzo[];
}

export interface TurnoDoppio {
  id: string;
  turno: string;
  orario: string;
  brigataNomi: string;
  responsabile: string;
  cambioConsegne: string;
}

export interface ModuloM6DoppioTurno {
  attivo: boolean;
  turni: TurnoDoppio[];
  oreTotaliVerificate: boolean;
  pausaPrevista: boolean;
  passaggioConsegneScritto: boolean;
}

export interface ConsumoChiusura {
  id: string;
  voce: string;
  previsto: number;
  consumato: number;
  rimastoReso: number;
  unita: string;
  nota: string;
}

export interface RotturaDanno {
  id: string;
  voce: string;
  qta: number;
  causa: string;
  chiACarico: string;
}

export interface ChiusuraEvento {
  paxRealiAdulti: number;
  paxRealiBambini: number;
  inizioReale: string;
  fineReale: string;
  assenzeSostituzioni: string;
  problemiOrario: string;
  consumi: ConsumoChiusura[];
  rottureDanni: RotturaDanno[];
  noleggiRestituiti: boolean;
  resiFornitoriFatti: boolean;
  materialeBaseRientratoContato: boolean;
  mancanzeSegnalateMagazzino: boolean;
  cosaHaFunzionato: string;
  cosaCambiareProssimaVolta: string;
  riscontroCommittente: string;
  capoServizioFirma: string;
  dataChiusura: string;
}

// ODS Capo Servizio Controlli & Imprevisti
export interface ControlloCapoServizio {
  id: string;
  testo: string;
  tipo: 'giorno_prima' | 'all_arrivo' | 'briefing';
  completato: boolean;
}

export interface VerificaMaterialePostazione {
  postazioneCod: string;
  postazioneNome: string;
  responsabileNome: string;
  materialeCompleto: boolean;
  mancanze: string;
  ok: boolean;
}

export interface ImprevistoLive {
  id: string;
  ora: string;
  situazione: string;
  primaAzione: string;
  chiAvvisareOGestisce: string;
  esito?: string;
}

export interface FornitoreNoleggioCheck {
  id: string;
  fornitore: string;
  cosa: string;
  consegnaRitiro: string;
  verificatoInArrivo: boolean;
  restituito: boolean;
}

export interface VerbaleCarico {
  mancanzeDanniSegnalati: string;
  caricoBaseFirmaDataOra: string;
  ricezioneLocationFirmaDataOra: string;
  rientroBaseFirmaDataOra: string;
}

// Full Master ODS Structure
export interface MasterODS {
  id: string;
  scheda: SchedaEvento;
  revisioni: Revisione[];
  moduliAttivi: {
    m1Guardaroba: boolean;
    m2Bambini: boolean;
    m3ProgrammaChef: boolean;
    m4TrasportoFurgone: boolean;
    m5CucinaRimpiazzi: boolean;
    m6DoppioTurno: boolean;
  };
  timelineFasi: FaseTimeline[];
  contatti: ContattoRuolo[];
  locationAccessi: DettagliLocationAccessi;
  divise: DiviseLivello;
  brigata: MembroBrigata[];
  postazioni: Postazione[];
  menu: PiattoMenu[];
  allergeni: AllergeneDieta[];
  fabbisogno: FabbisognoVoce[];
  materiali: VoceMateriale[];
  contenitori: ContenitoreMaster[];
  logistica: MovimentoLogistica[];
  sicurezza: SicurezzaEmergenze[];
  moduloM1: ModuloM1Guardaroba;
  moduloM2: ModuloM2PuntoBambini;
  moduloM3: ModuloM3ProgrammaChef;
  moduloM4: ModuloM4TrasportoFurgone;
  moduloM5: ModuloM5CucinaRimpiazzi;
  moduloM6: ModuloM6DoppioTurno;
  chiusura: ChiusuraEvento;
  // Specific Capo Servizio & Live State
  controlliCapoServizio: ControlloCapoServizio[];
  verificheMateriale: VerificaMaterialePostazione[];
  imprevistiLive: ImprevistoLive[];
  fornitoriNoleggi: FornitoreNoleggioCheck[];
  verbaleCarico: VerbaleCarico;
}
