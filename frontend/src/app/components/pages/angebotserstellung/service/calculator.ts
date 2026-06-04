import { Injectable } from '@angular/core';
import { AppState, AngebotGroup, AngebotRow } from './state';

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  calculateRow(row: AngebotRow) {
    const menge = Number(row.menge || 0);
    const ek = Number(row.ek || 0);
    const aufschlag = Number(row.aufschlag || 0);
    const rabatt = Number(row.rabatt || 0);

    let ep = ek + ek * (aufschlag / 100);
    ep -= ep * (rabatt / 100);
    const gp = ep * menge;

    return {
      ep: Number(ep.toFixed(2)),
      gp: Number(gp.toFixed(2)),
    };
  }

  recalculate(state: AppState) {
    state.angebot.groups = state.angebot.groups.map((group) => ({
      ...group,
      rows: group.rows.map((row) => {
        const { ep, gp } = this.calculateRow(row);
        return {
          ...row,
          ep,
          gp,
        };
      }),
    }));
  }

  getGroupTotal(group: AngebotGroup) {
    return group.rows.reduce((sum, row) => {
      if (row.parentMischId || row.parentGruppeId) {
        return sum;
      }
      return sum + (row.gp || 0);
    }, 0);
  }

  getTotal(state: AppState) {
    return state.angebot.groups.reduce((groupSum, group) => {
      return groupSum + this.getGroupTotal(group);
    }, 0);
  }
}
