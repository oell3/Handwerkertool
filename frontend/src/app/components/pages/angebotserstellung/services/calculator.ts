import { Injectable } from '@angular/core';

export interface CalcResult {
  ep: number;
  gp: number;
}

@Injectable({ providedIn: 'root' })
export class CalculatorService {

  calcRow(row: any): CalcResult {
    const menge    = Number(row.menge    || 0);
    const ek       = Number(row.ek       || 0);
    const aufschlag = Number(row.aufschlag || 0);
    const rabatt   = Number(row.rabatt   || 0);

    let ep = ek + ek * (aufschlag / 100);
    ep    -= ep * (rabatt / 100);

    return {
      ep: round(ep),
      gp: round(ep * menge),
    };
  }

  calcChildRow(child: any, mischMenge: number): CalcResult {
    const { ep } = this.calcRow(child);
    return {
      ep,
      gp: round(ep * Number(child.menge || 0) * mischMenge),
    };
  }

  calcMischRow(mischRow: any, children: any[]): CalcResult {
    const mischMenge = Number(mischRow.menge || 0);
    const totalGp    = children.reduce(
      (sum, child) => sum + this.calcChildRow(child, mischMenge).gp,
      0
    );
    return {
      ep: round(mischMenge ? totalGp / mischMenge : 0),
      gp: round(totalGp),
    };
  }

  calcKosten(groups: any[]): { material: number; lohn: number; sonstiges: number } {
    let material = 0, lohn = 0, sonstiges = 0;

    for (const group of groups) {
      const rows: any[] = group.rows ?? [];

      for (const row of rows) {
        if (row.typ === 'misch') {
          const mischMenge = Number(row.menge || 0);
          rows
            .filter((c) => c.parentMischId === row.id)
            .forEach((child) => {
              const kosten = mischMenge * Number(child.menge || 0) * Number(child.ek || 0);
              if (child.typ === 'material')       material  += kosten;
              else if (child.typ === 'lohn')      lohn      += kosten;
              else if (child.typ === 'sonstiges') sonstiges += kosten;
            });
        } else if (
          row.typ !== 'gruppe' &&
          row.parentMischId  == null &&
          row.parentGruppeId == null
        ) {
          const kosten = Number(row.menge || 0) * Number(row.ek || 0);
          if (row.typ === 'material')       material  += kosten;
          else if (row.typ === 'lohn')      lohn      += kosten;
          else if (row.typ === 'sonstiges') sonstiges += kosten;
        }
      }
    }

    return { material, lohn, sonstiges };
  }
}

function round(n: number): number {
  return Number(n.toFixed(2));
}