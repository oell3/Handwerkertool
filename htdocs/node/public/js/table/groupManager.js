export class GroupManager {

    constructor(state, app) {
        this.state = state;
        this.app = app;
    }

    addGroup() {

        // 👉 Gruppe erzeugen
        const group = this.state.createGroup();

        // 👉 Kontext zurücksetzen (WICHTIG!)
        this.state.currentMischId = null;
        this.state.currentGruppeId = null;

        // 👉 optional: später hier Default-Werte setzen
        // z.B. group.discount = 0;
this.app.requestRender();
      
    }

    removeGroup(groupId) {

        this.state.angebot.groups =
        this.state.angebot.groups.filter(g => g.id !== groupId);

           // Context reset
        if (this.state.currentGruppeId === groupId) {
            this.state.currentGruppeId = null;
            this.state.currentMischId = null;
        }


        this.app.requestRender();
    }
}
