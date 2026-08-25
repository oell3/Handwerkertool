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

export interface DraggedRowData {
  groupId: number;
  rowId: number;
  typ: string;
}