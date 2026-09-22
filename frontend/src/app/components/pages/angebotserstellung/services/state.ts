import { Injectable, signal } from '@angular/core';

export interface AngebotRow {
  sortierung: number;
  typ: string;
  bezeichnung: string;
  menge: number;
  ek: number;
  aufschlag: number;
  rabatt: number;
  einheit: string;
  mischId: number | null;
  gruppeId: number | null;
  parentMischId: number | null;
  parentGruppeId: number | null;
  collapsed: boolean;
  remark: string;
}

export interface AngebotGroup {
  Gruppen_nr: number;  
  sortierung: number;
  name: string;
  collapsed: boolean;
  rows: AngebotRow[];
}

export interface AngebotData {
  title: string;
  angebotsdatum: string;
  einleitung: string;
  schluss: string;
  kundenId: string | null;
  objektId: string | null;
  projektId: string | null;
  ansprechpartnerId: string | null;
  vorlageEinleitungId: string | null;
  vorlageSchlussId: string | null;
  groups: AngebotGroup[];
  anrede: string | null;
  betrag: number | 0.00;
  haschange: boolean;
}

export interface AppState {
  angebot: AngebotData;
}

const INITIAL: AppState = {
  angebot: {
    title: '',
    angebotsdatum: '',
    einleitung: '',
    schluss: '',
    kundenId: null,
    objektId: null,
    projektId: null,
    anrede: "",
    betrag: 0.00,
    ansprechpartnerId: null,
    vorlageEinleitungId: null,
    vorlageSchlussId: null,
    groups: [],
    haschange: false,
  },
};

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly _state = signal<AppState>(INITIAL);
  readonly state = this._state.asReadonly();

  private _groupCounter = 0;
  private _rowCounter   = 0;

  get value(): AppState {
    return this._state();
  }
// test

  update(partial: Partial<AppState>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }

  nextGroupId(): number { return ++this._groupCounter; }
  nextRowId():   number { return ++this._rowCounter; }
//
  reset(): void {
    this._state.set(INITIAL);
    this._groupCounter = 0;
    this._rowCounter   = 0;
  }

  //test
}