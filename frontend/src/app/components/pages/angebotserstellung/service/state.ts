import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AngebotRow {
  id: number;
  typ: string;
  bezeichnung: string;
  menge: number;
  ek: number;
  aufschlag: number;
  rabatt: number;
  einheit: string;
  ep: number;
  gp: number;
  nr?: string;
  mischId?: number | null;
  gruppeId?: number | null;
  parentMischId?: number | null;
  parentGruppeId?: number | null;
  remark?: string | null;
}

export interface AngebotGroup {
  id: number;
  name: string;
  collapsed?: boolean;
  rows: AngebotRow[];
}

export interface AngebotData {
  haschange: boolean;
  kundenId: number | null;
  kunde: any;
  anrede: string | null;
  einleitung: string | null;
  schluss: string | null;
  objektId: any;
  projektId: any;
  ansprechpartnerId?: any;
  vorlageEinleitungId?: any;
  vorlageSchlussId?: any;
  anschreiben: string | null;
  title: string | null;
  datum: string | null;
  groups: AngebotGroup[];
}

export interface AppState {
  angebot: AngebotData;
  currentMischId: number | null;
  currentGruppeId: number | null;
  groupCounter: number;
  rowCounter: number;
}

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private state = new BehaviorSubject<AppState>({
    angebot: {
      haschange: false,
      kundenId: null,
      kunde: null,
      anrede: null,
      einleitung: null,
      schluss: null,
      objektId: null,
      projektId: null,
      ansprechpartnerId: null,
      vorlageEinleitungId: null,
      vorlageSchlussId: null,
      anschreiben: null,
      title: null,
      datum: null,
      groups: [],
    },

    currentMischId: null,
    currentGruppeId: null,

    groupCounter: 0,
    rowCounter: 0,
  });

  readonly state$ = this.state.asObservable();

  get value(): AppState {
    return this.state.value;
  }

  update(partial: Partial<AppState>) {
    this.state.next({
      ...this.state.value,
      ...partial,
    });
  }

  nextGroupId(): number {
    const id = this.state.value.groupCounter + 1;

    this.update({
      groupCounter: id,
    });

    return id;
  }

  nextRowId(): number {
    const id = this.state.value.rowCounter + 1;

    this.update({
      rowCounter: id,
    });

    return id;
  }
}
