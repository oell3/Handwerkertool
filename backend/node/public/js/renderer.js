import { ART_OPTIONS } from "./config/artOption.js";

export class Renderer {

    constructor(state, calculator, rowManager, ui, dragDrop, GroupManager, app) {
        this.state = state;
        this.calculator = calculator;
        this.rowManager = rowManager;
        this.ui = ui;
        this.dragDrop = dragDrop;
        this.groupManager = GroupManager;
        this.app = app;
    }

    render() {
        const tbody = document.getElementById("body");
        tbody.innerHTML = "";

        this.calculator.recalculate(this.state);
        this.prepareView();

        this.state.angebot.groups.forEach(group => {
            tbody.appendChild(this.renderGroup(group));

            if (group.collapsed) {
                return;
            }

            tbody.appendChild(this.renderHead());

            const collapsedMischIds = new Set();
            const collapsedGruppeIds = new Set();

            group.rows.forEach(row => {
                if (!this.isRowVisible(row, collapsedMischIds, collapsedGruppeIds)) {
                    return;
                }

                tbody.appendChild(this.renderRow(row));
                tbody.appendChild(this.renderRemark(row));

                if (row.type === "misch" && row.collapsed && row.mischId) {
                    collapsedMischIds.add(row.mischId);
                }

                if (row.type === "gruppe" && row.collapsed && row.gruppeId) {
                    collapsedGruppeIds.add(row.gruppeId);
                }
            });
        });

        this.renderTotal();

        this.dragDrop?.enable(tbody);
        this.bootstrap();
    }

    prepareView() {
        this.buildLayout();
        this.renderMischBtn();
        this.renderGrupBtn();
    }

    isRowVisible(row, collapsedMischIds, collapsedGruppeIds) {
        if (row.parentMischId && collapsedMischIds.has(row.parentMischId)) {
            return false;
        }

        if (row.parentGruppeId && collapsedGruppeIds.has(row.parentGruppeId)) {
            return false;
        }

        return true;
    }

    buildLayout() {
        let groupIndex = 0;

        this.state.angebot.groups.forEach(group => {
            groupIndex++;

            let positionIndex = 0;
            let mischIndex = 0;
            let currentMisch = null;

            group.rows.forEach(row => {
                if (row.type === "misch") {
                    positionIndex++;
                    mischIndex = 0;
                    currentMisch = row.mischId;
                    row.nr = `${groupIndex}.${positionIndex}`;
                }
                else if (currentMisch !== null && row.parentMischId === currentMisch) {
                    mischIndex++;
                    row.nr = `${groupIndex}.${positionIndex}.${mischIndex}`;
                }
                else if (row.type === "gruppe") {
                    row.nr = "";
                }
                else {
                    currentMisch = null;
                    positionIndex++;
                    row.nr = `${groupIndex}.${positionIndex}`;
                }
            });
        });
    }

    bootstrap() {
        this.ui.init();
        this.dragDrop?.enable(document.getElementById("body"));
    }

    renderGroup(group) {
        const total = this.calculateGroupTotal(group.id);
        const tr = document.createElement("tr");
        tr.classList.add("group-header");
        tr.classList.toggle("minimized", !!group.collapsed);

        tr.innerHTML = `
            <td colspan="8">
                <button type="button" class="toggle" aria-label="Gruppe umschalten">${group.collapsed ? "▶" : "▼"}</button>
                <strong>Leistungsgruppe ${group.id}</strong>
                <input id="leistungsgruppe-name"/>
            </td>
            <td><span id="netto-gruppe">${total.toFixed(2)} EUR</span></td>
            <td><button class="remove">X</button></td>
        `;

        tr.dataset.groupId = group.id;

        tr.querySelector("#leistungsgruppe-name").value = group.name || "";
        tr.querySelector("#leistungsgruppe-name").addEventListener("change", e => {
            group.name = e.target.value;
            this.app.requestRender();
        });

        tr.querySelector(".toggle").addEventListener("click", event => {
            event.stopPropagation();
            group.collapsed = !group.collapsed;
            this.app.requestRender();
        });

        tr.querySelector(".remove").addEventListener("click", () => {
            this.groupManager.removeGroup(group.id);
        });

        return tr;
    }

    calculateGroupTotal(groupId) {
        const group = this.state.angebot.groups.find(g => g.id === groupId);
        if (!group) return 0;

        return group.rows.reduce((sum, r) => {
            if (r.parentMischId || r.parentGruppeId) {
                return sum;
            }

            return sum + (r.gp || 0);
        }, 0);
    }

    renderHead() {
        const tr = document.createElement("tr");
        tr.classList.add("header");

        tr.innerHTML = `
          <th></th>
            <th>Nr.</th>
            <th>Typ</th>
            <th>Menge</th>
            <th>Bezeichnung</th>
            <th>EK</th>
            <th>Aufschlag</th>
            <th>Rabatt</th>
            <th>Einzelpreis</th>
            <th>Gesamtpreis</th>
            <th></th>
        `;

        return tr;
    }

    renderRow(row) {
        const tr = document.createElement("tr");
        tr.classList.add("draggable");
        tr.draggable = true;

        tr.dataset.id = row.id;
        tr.dataset.groupId = row.groupId;

        tr.innerHTML = `
        <td>
            <div class="row-tools">
                ${this.renderRowToggle(row)}
                <span class="drag-handle">☰</span>
            </div>
        </td>
            <td>${row.nr}</td>

            <td>
                <select class="art input">
                     ${this.renderArtOptions(row.type)}
                </select>
            </td>

            <td><input class="m" value="${row.menge}"></td>
            <td><input class="bezeichnung" value="${row.bezeichnung}"></td>

            <td><input class="ek" value="${row.ek}"></td>

            <td><input class="aufschlag" value="${row.aufschlag}"></td>
            <td><input class="rabatt" value="${row.rabatt}"></td>

            <td><div class="ep">${row.ep.toFixed(2)}</div></td>

            <td><div class="gp">${row.gp.toFixed(2)}</div></td>

            <td><button class="remove">X</button></td>
        `;

        this.createEventlistener(tr, row);
        this.getClassHierarchy(row, tr);

        return tr;
    }
    
    getClassHierarchy(row, tr) {
        tr.classList.remove("mischposition");
        tr.classList.remove("drop-misch");
        tr.classList.remove("misch-child");
        tr.classList.remove("gruppe");
        tr.classList.remove("drop-gruppe");
        tr.classList.remove("gruppe-child");

        if (row.type === "misch") {
            tr.classList.add("mischposition");
            tr.classList.add("drop-misch");
            tr.dataset.mischId = row.mischId;
            row.parentMischId = null;
        }

        if (row.type === "gruppe") {
            tr.classList.add("gruppe");
            this.disableinput(tr);
            tr.classList.add("drop-gruppe");
            tr.dataset.gruppeId = row.gruppeId;
            row.parentGruppeId = null;
        }

        if (row.parentMischId && row.type !== "misch") {
            tr.classList.add("misch-child");
            tr.dataset.parentMischId = row.parentMischId;
        }

        if (row.parentGruppeId && row.type !== "gruppe") {
            tr.classList.add("gruppe-child");
            tr.dataset.parentGruppeId = row.parentGruppeId;
        }
    }

    disableinput(tr) {
        tr.querySelector(".m").disabled = true;
        tr.querySelector(".ek").disabled = true;
        tr.querySelector(".aufschlag").disabled = true;
        tr.querySelector(".rabatt").disabled = true;
    }

    createEventlistener(tr, row) {
        const m = tr.querySelector(".m");
        const ek = tr.querySelector(".ek");
        const aufschlag = tr.querySelector(".aufschlag");
        const rabatt = tr.querySelector(".rabatt");
        const bezeichnung = tr.querySelector(".bezeichnung");
        const handle = tr.querySelector(".drag-handle");
        const toggle = tr.querySelector(".toggle");
        const artSelect = tr.querySelector(".art");

        toggle?.addEventListener("click", event => {
            event.stopPropagation();
            row.collapsed = !row.collapsed;
            this.app.requestRender();
        });

        artSelect.addEventListener("change", e => {
            this.rowManager.updateRowType(row, e.target.value);
            this.app.requestRender();
        });

        m.addEventListener("change", e => {
            row.menge = Number(e.target.value);
            this.app.requestRender();
        });

        bezeichnung.addEventListener("change", e => {
            row.bezeichnung = e.target.value;
            this.app.requestRender();
        });

        ek.addEventListener("change", e => {
            row.ek = Number(e.target.value) || 0;
            this.app.requestRender();
        });

        aufschlag.addEventListener("change", e => {
            row.aufschlag = Number(e.target.value) || 0;
            this.app.requestRender();
        });

        rabatt.addEventListener("change", e => {
            row.rabatt = Number(e.target.value) || 0;
            this.app.requestRender();
        });

        handle.addEventListener("mousedown", () => {
            tr.draggable = true;
        });

        handle.addEventListener("mouseup", () => {
            tr.draggable = false;
        });

        tr.querySelector(".remove").addEventListener("click", () => {
            this.rowManager.removeRow(row.id);
            this.app.requestRender();
        });

    }
    


    renderRemark(row) {
        const tr = document.createElement("tr");
        tr.classList.add("remark-row");
        tr.dataset.parentId = row.id;

        tr.innerHTML = `
              <td colspan=8>
               <div style="display:flex; gap:10px; width:100%;">
                
                <input 
                    class="remark-input input" 
                    style="flex:1;" 
                    value="${row.remark || ""}"
                    placeholder="Bemerkung"
                >

                <select class="remark-type input">
                    <option value="normal" ${row.positionsart === "normal" ? "selected" : ""}>Normalposition</option>
                    <option value="alternativ" ${row.positionsart === "alternativ" ? "selected" : ""}>Alternativposition</option>
                    <option value="eventual" ${row.positionsart === "eventual" ? "selected" : ""}>Eventualposition</option>
                </select>

            </div>
            </td>
        `;

        const remark = tr.querySelector(".remark-input");
        remark.addEventListener("input", e => {
            row.remark = e.target.value;
        });

        const remarkType = tr.querySelector(".remark-type");
        remarkType.addEventListener("change", e => {
            row.positionsart = e.target.value;
        });

        return tr;
    }

    renderTotal() {
        const total = this.calculator.getTotal(this.state);
        const kosten = this.calculator.getKostenByType(this.state);

        const margin = this.calculator.getmargin(total, kosten.gesamt);
        const margininProcent = this.calculator.getmargininProcent(total, margin);

        document.getElementById("ns").textContent =
            total.toFixed(2) + " EUR";

        document.getElementById("kosten").textContent =
            kosten.gesamt.toFixed(2) + " EUR";

        document.getElementById("mk").textContent =
            kosten.material.toFixed(2) + " EUR";

        document.getElementById("lk").textContent =
            kosten.lohn.toFixed(2) + " EUR";

        document.getElementById("sk").textContent =
            kosten.sonstiges.toFixed(2) + " EUR";

        document.getElementById("gm").textContent =
            margin.toFixed(2) + " EUR";

        document.getElementById("mp").textContent =
            margininProcent.toFixed(2) + " %";
    }

    renderMischBtn() {
        const btn = document.getElementById("clsMischBtn");

        if (!btn) return;

        btn.style.display =
            this.state.currentMischId ? "block" : "none";
    }

    renderGrupBtn() {
        const btn = document.getElementById("clsGruppeBtn");

        if (!btn) return;

        btn.style.display =
            this.state.currentGruppeId ? "block" : "none";
    }

    renderArtOptions(selectedType) {
        return ART_OPTIONS.map(opt => `
        <option 
            value="${opt.value}" 
            ${selectedType === opt.value ? "selected" : ""}
            ${opt.isSpecial ? 'data-special="true"' : ""}
        >
            ${opt.label}
        </option>
    `).join("");
    }

    renderRowToggle(row) {
        if (row.type !== "misch" && row.type !== "gruppe") {
            return '<span class="toggle-spacer"></span>';
        }

        return `<button type="button" class="toggle" aria-label="Bereich umschalten">${row.collapsed ? "▶" : "▼"}</button>`;
    }
}
