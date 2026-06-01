export class AngebotService {

    constructor(state, calculator) {
        this.state = state;
        this.calculator = calculator;
        this.angebotId = null;
    }

    buildPayload() {
        this.calculator.recalculate(this.state);

        const angebot = {
            haschange: this.state.angebot.haschange,
            kundenId: this.state.angebot.kundenId,
            kunde: this.state.angebot.kunde,
            anrede: this.state.angebot.anrede,
            title: this.state.angebot.title || "Indikatives Angebot",
            einleitung: this.state.angebot.einleitung,
            anschreiben: this.state.angebot.anschreiben,
            schluss: this.state.angebot.schluss,
            objekt: this.state.angebot.objektId,
            projekt: this.state.angebot.projektId,
            Betrag: this.calculator.getTotal(this.state),
            Datum: this.state.angebot.datum || new Date().toLocaleDateString('de-DE'),
            Status: "Entwurf",
   };

        const gruppen = this.state.angebot.groups.map((group, index) => ({
            id: group.dbId || null,
            tempId: `group-${group.id}`,
            nr: index + 1,
            bezeichnung: group.name || `Leistungsgruppe ${index + 1}`,
            sortierung: index + 1
        }));

        const groupTempIds = new Map(
            this.state.angebot.groups.map(group => [group.id, `group-${group.id}`])
        );

        const positionen = [];

        this.state.angebot.groups.forEach(group => {
            group.rows.forEach((row, index) => {
                positionen.push({
                    id: row.dbId || null,
                    group_id: groupTempIds.get(group.id),
                    misch_id: row.mischId,
                    parent_misch_id: row.parentMischId,
                    gruppe_id: row.gruppeId,
                    parent_gruppe_id: row.parentGruppeId,
                    typ: row.type,
                    nr: row.nr || "",
                    bezeichnung: row.bezeichnung || "",
                    menge: Number(row.menge || 0),
                    einheit: row.einheit || "Stk",
                    ek: Number(row.ek || 0),
                    aufschlag: Number(row.aufschlag || 0),
                    rabatt: Number(row.rabatt || 0),
                    ep: Number(row.ep || 0),
                    gp: Number(row.gp || 0),
                    sortierung: index + 1,
                    bemerkung: row.remark || "",
                    positionsart: row.positionsart || "normal"
                });
            });
        });

        return { angebot, gruppen, positionen };
    }

    async save() {
        const payload = this.buildPayload();
        const url = this.angebotId ? `/angebote/${this.angebotId}` : "/angebote";
        const method = this.angebotId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                angebotId: this.angebotId,
                ...payload
            })
        });

        if (!res.ok) {
            throw new Error("Angebot konnte nicht gespeichert werden.");
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
            method: "POST"
        });

        if (!res.ok) {
            throw new Error("PDF konnte nicht erstellt werden.");
        }

        const result = await res.json();
        if (result.pdfPath) {
            const pdfUrl = result.pdfPath.replace(/^\.\//, "/");
            const popup = window.open(pdfUrl, "_blank");

            if (popup) {
                const cleanupUrl = `/angebote/${result.revisionId}/pdf`;
                const intervalId = window.setInterval(async () => {
                    if (popup.closed) {
                        window.clearInterval(intervalId);

                        try {
                            await fetch(cleanupUrl, { method: 'DELETE' });
                        } catch (err) {
                            console.warn('PDF cleanup request failed:', err);
                        }
                    }
                }, 500);
            }
        }

        return result;
    }
}
