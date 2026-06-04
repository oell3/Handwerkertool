import { Injectable, inject } from '@angular/core';
import { CalculatorService } from './calculator';
import { StateService } from './state';

@Injectable({
  providedIn: 'root',
})
export class AngebotService {
  private angebotId: number | null = null;
  private readonly calculator = inject(CalculatorService);
  private readonly state = inject(StateService);

  buildPayload() {
    const state = this.state.value;
    this.calculator.recalculate(state);

    const angebot = {
      haschange: state.angebot.haschange,
      kundenId: state.angebot.kundenId,
      kunde: state.angebot.kunde,
      anrede: state.angebot.anrede,
      title: state.angebot.title || 'Indikatives Angebot',
      einleitung: state.angebot.einleitung,
      anschreiben: state.angebot.anschreiben,
      schluss: state.angebot.schluss,
      objekt: state.angebot.objektId,
      projekt: state.angebot.projektId,
      Betrag: this.calculator.getTotal(state),
      Datum: state.angebot.datum || new Date().toLocaleDateString('de-DE'),
      Status: 'Entwurf',
    };

    const gruppen = state.angebot.groups.map((group, index) => ({
      id: group.id,
      tempId: `group-${group.id}`,
      nr: index + 1,
      bezeichnung: group.name || `Leistungsgruppe ${index + 1}`,
      sortierung: index + 1,
    }));

    const groupTempIds = new Map<number, string>(
      state.angebot.groups.map((group) => [group.id, `group-${group.id}`]),
    );

    const positionen = state.angebot.groups.flatMap((group) =>
      group.rows.map((row, index) => ({
        id: row.id,
        group_id: groupTempIds.get(group.id),
        misch_id: row.mischId,
        parent_misch_id: row.parentMischId,
        gruppe_id: row.gruppeId,
        parent_gruppe_id: row.parentGruppeId,
        typ: row.typ,
        nr: row.nr || '',
        bezeichnung: row.bezeichnung || '',
        menge: Number(row.menge || 0),
        einheit: row.einheit || 'Stk',
        ek: Number(row.ek || 0),
        aufschlag: Number(row.aufschlag || 0),
        rabatt: Number(row.rabatt || 0),
        ep: Number(row.ep || 0),
        gp: Number(row.gp || 0),
        sortierung: index + 1,
        bemerkung: row.remark || '',
      })),
    );

    return { angebot, gruppen, positionen };
  }

  async save() {
    const payload = this.buildPayload();
    const url = this.angebotId ? `/angebote/${this.angebotId}` : '/angebote';
    const method = this.angebotId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ angebotId: this.angebotId, ...payload }),
    });

    if (!res.ok) {
      throw new Error('Angebot konnte nicht gespeichert werden.');
    }

    const result = await res.json();
    this.angebotId = result.angebotId;
    return result;
  }

  async createPDF() {
    if (!this.angebotId) {
      await this.save();
    }

    const res = await fetch(`/angebote/${this.angebotId}/create`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('PDF konnte nicht erstellt werden.');
    }

    const result = await res.json();

    if (result.pdfPath) {
      const pdfUrl = result.pdfPath.replace(/^\.\//, '/');
      const popup = window.open(pdfUrl, '_blank');

      if (popup) {
        const cleanupUrl = `/angebote/${result.revisionId}/pdf`;

        const intervalId = window.setInterval(async () => {
          if (popup.closed) {
            window.clearInterval(intervalId);
            try {
              await fetch(cleanupUrl, { method: 'DELETE' });
            } catch {
              console.warn('PDF cleanup request failed');
            }
          }
        }, 500);
      }
    }

    return result;
  }
}
