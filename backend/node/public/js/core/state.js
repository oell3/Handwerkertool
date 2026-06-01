export class State {
    constructor() {
        this.angebot = {
            haschange: false,
            groups: [],
            rows: [],
            kundenId: null,
            kunde: null,
            anrede: null,
            einleitung: null,
            schluss: null,
            objekt: null,
            projekt: null,
            anschreiben: null,
            title: null,
            datum: null
        };

        this.currentMischId = null;
        this.currentGruppeId = null;

        this.groupCounter = 0;
        this.rowCounter = 0;
        this.mischCounter = 0;
        this.gruppeCounter = 0;
    }

    createGroup() {
        const id = ++this.groupCounter;

        const group = {
            id,
            name: `Leistungsgruppe ${id}`,
            collapsed: false,
            rows: []
        };

        this.angebot.groups.push(group);
        return group;
    }

    getLastGroup() {
        return this.angebot.groups.at(-1);
    }

    getCurrentGroup(){
        return this.groupCounter;
    }
}
