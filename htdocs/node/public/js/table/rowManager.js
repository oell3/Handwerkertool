import { createRowModel } from "./rowModel.js";

export class RowManager {

    constructor(state, app) {
    this.state = state;
    this.app = app;
}
    
addRow() {
    let group = this.state.getLastGroup();
    if (!group) group = this.state.createGroup();

    const row = createRowModel(this.state, group.id);
    
    // Hierarchie setzen
    if (this.state.currentMischId) {
        row.parentMischId = this.state.currentMischId;
    }

    if (this.state.currentGruppeId) {
      //  row.parentGruppeId = this.state.currentGruppeId;
    }

    this.applyHierarchy(row);

    // 👉 NUR HIER speichern
    group.rows.push(row);

    this.app.requestRender();
}


  
       applyHierarchy(row) {

    // RESET nur wenn sinnvoll
    if (!this.state.currentMischId) {
        row.parentMischId = null;
    }

    if (!this.state.currentGruppeId) {
        row.parentGruppeId = null;
    }

    // NEU setzen
    if (this.state.currentMischId) {
        row.parentMischId = this.state.currentMischId;
    }

    if (this.state.currentGruppeId) {
        row.parentGruppeId = this.state.currentGruppeId;
    }

    }

    clsMisch(){
        this.state.currentMischId = null;
         
    }

    clsGruppe(){
        this.state.currentGruppeId = null;
        this.clsMisch();

         
    }

    handleTypeChange(row, value) {

  

    // =========================
    // RESET (nur Misch/Gruppe!)
    // =========================
    row.collapsed = false;
    row.mischId = null;
    row.parentMischId = null;
    row.gruppeId = null;
    row.parentGruppeId = null;

    // =========================
    // MISCHPOSITION START
    // =========================
    if (value === "misch") {

        if (this.state.currentMischId) {
            alert("Mischposition bereits offen!");
            return;
        }

        this.state.mischCounter++;

        row.type = "misch";
        row.mischId = this.state.mischCounter;

        this.state.currentMischId = row.mischId;

        
      
        return;
    }

    // =========================
    // GRUPPE START
    // =========================
    if (value === "Gruppe") {

        if (this.state.currentGruppeId) {
            alert("Gruppe bereits offen!");
            return;
        }

        this.state.gruppeCounter++;

        row.type = "gruppe";
        row.gruppeId = this.state.gruppeCounter;

        this.state.currentGruppeId = row.gruppeId;

        return;
    }

    // =========================
    // NORMALER TYPE
    // =========================
    row.type = value;

    

    // 👉 HIER passiert das Wichtige
    this.applyHierarchy(row);
    this.app.requestRender();
}

    assignHierarchy(dragged, target) {

        // =========================
        // IN MISCHPOSITION DROP
        // =========================
        if (target.type === "misch") {

            dragged.parentMischId = target.mischId || target.id;
            dragged.parentGruppeId = null;

            return;
        }

        // =========================
        // IN GRUPPE DROP
        // =========================
        if (target.type === "gruppe") {

            dragged.parentGruppeId = target.gruppeId || target.id;
            dragged.parentMischId = null;

            return;
        }

        // =========================
        // NORMALER DROP (OUTSIDE)
        // =========================
        dragged.parentMischId = null;
        dragged.parentGruppeId = null;
    }


updateRowType(row, value) {

    this.handleTypeChange(row, value);
    this.applyHierarchy(row);

}

    updateHierarchy(dragged, target) {

        // RESET
        dragged.parentMischId = null;
        dragged.parentGruppeId = null;

        // =========================
        // IN MISCHPOSITION
        // =========================
        if (target.type === "misch") {
            dragged.parentMischId = target.mischId;
            return;
        }

        // =========================
        // IN GRUPPE
        // =========================
        if (target.type === "gruppe") {
            dragged.parentGruppeId = target.gruppeId;
            return;
        }

        // =========================
        // WENN TARGET EIN CHILD IST
        // =========================
        if (target.parentMischId) {
            dragged.parentMischId = target.parentMischId;
            return;
        }

        if (target.parentGruppeId) {
            dragged.parentGruppeId = target.parentGruppeId;
            return;
        }

        // =========================
        // NORMAL (RAUSGEZOGEN)
        // =========================
        dragged.parentMischId = null;
        dragged.parentGruppeId = null;
    }


    removeRow(rowId) {
        this.state.angebot.groups.forEach(group => {
            const row = group.rows.find(r => r.id === rowId);
            if (!row) return;

            const idsToRemove = new Set([row.id]);
            const mischIdsToRemove = new Set(row.mischId ? [row.mischId] : []);
            const gruppeIdsToRemove = new Set(row.gruppeId ? [row.gruppeId] : []);

            let changed = true;

            while (changed) {
                changed = false;

                group.rows.forEach(candidate => {
                    const isChildOfRemovedMisch =
                        candidate.parentMischId && mischIdsToRemove.has(candidate.parentMischId);
                    const isChildOfRemovedGruppe =
                        candidate.parentGruppeId && gruppeIdsToRemove.has(candidate.parentGruppeId);

                    if (!isChildOfRemovedMisch && !isChildOfRemovedGruppe) return;
                    if (idsToRemove.has(candidate.id)) return;

                    idsToRemove.add(candidate.id);

                    if (candidate.mischId) {
                        mischIdsToRemove.add(candidate.mischId);
                    }

                    if (candidate.gruppeId) {
                        gruppeIdsToRemove.add(candidate.gruppeId);
                    }

                    changed = true;
                });
            }

            group.rows = group.rows.filter(r => !idsToRemove.has(r.id));
        });
this.app.requestRender();
        
    }

}
