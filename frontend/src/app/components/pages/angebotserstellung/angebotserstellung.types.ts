export interface Kunde {
  id: string;
  ID?: string | number;
  typ?: string;
  name?: string;
  Name?: string;
  adresse?: string;
  plz?: string;
  stadt?: string;
  mail?: string;
  telefon?: string;
  fax?: string;
  steuernummer?: string;
  iban?: string;
  steueridentifikationsnummer?: string;
  lat?: string;
  lon?: string;
  mandant_id?: string;
}

export interface Projekte{
  id: Number,
  ID?: String|Number
}

export interface Ansprechpartner{
  id: String,
  ID?: String|Number
}

export interface DraggedRowData {
  groupId: number;
  rowId: number;
  typ: string;
}