import { State } from "./core/state.js";
import { RowManager } from "./table/rowManager.js";
import { Calculator } from "./calc/calculator.js";
import { Renderer } from "./renderer.js";
import { UIManager } from "./ui/uiManager.js";
import { AngebotService } from "./angebot/angebotService.js";
import { GroupManager } from "./table/groupManager.js";
import { DragDropManager } from "./table/DragDropManager.js";
import { App } from "./app.js";


const state = new State();
const calculator = new Calculator();
const ui = new UIManager(state);

// ---------------------------------
// 1. Renderer OHNE Manager
// ---------------------------------
const renderer = new Renderer(state, calculator, null, ui, null);

// ---------------------------------
// 2. App (braucht Renderer)
// ---------------------------------
const app = new App(state, renderer);
renderer.app = app;

// ---------------------------------
// 3. Manager (brauchen App)
// ---------------------------------
const rowManager = new RowManager(state, app);
const groupManager = new GroupManager(state, app);

// ---------------------------------
// 4. Renderer bekommt Manager
// ---------------------------------
renderer.rowManager = rowManager;
renderer.groupManager = groupManager;

// ---------------------------------
// 5. DragDrop (braucht Renderer + App)
// ---------------------------------
const dragDrop = new DragDropManager(state, app, rowManager);
renderer.dragDrop = dragDrop;

// ---------------------------------
// 6. Services
// ---------------------------------
const angebotService = new AngebotService(state, calculator);

document.getElementById("addRowBtn")
    .addEventListener("click", () => rowManager.addRow());

    document.getElementById("addGroupBtn")
    .addEventListener("click", () => groupManager.addGroup());

document.getElementById("saveOffer")
    ?.addEventListener("click", async () => {
        try {
            await angebotService.save();
        } catch (error) {
            console.error(error);
            alert("Angebot konnte nicht gespeichert werden.");
        }
    });

document.getElementById("createOffer")
    ?.addEventListener("click", async () => {
        try {
            await angebotService.createPDF();
            //console.log(state.angebot);
        } catch (error) {
            console.error(error);
            alert("PDF konnte nicht erstellt werden.");
        }
    });

    document.getElementById("clsMischBtn")
    .addEventListener("click", () => {
        rowManager.clsMisch(); 
        app.requestRender();
    });
    document.getElementById("clsGruppeBtn")
    .addEventListener("click", () =>{
        rowManager.clsGruppe()
     app.requestRender();}
    );

     document.getElementById("titleSelect")
    .addEventListener("click", (e) =>{
        state.angebot.title = e.target.value;
        
        test(e.target.value);
     }
    );

    function test(title=null){

        if(title){
            console.log("Title:", title);
        }else{
            console.log(title);
        }
    }

   
    document.getElementById('saveVorlageEinleitung')
    ?.addEventListener("click", () => {
        const vorlagename = document.getElementById('vorlagenameeinleitung').value;
        const einleitung = ui.einleitungQuill ? ui.einleitungQuill.root.innerHTML : '';

        if (!vorlagename || !einleitung) {
            alert("Bitte geben Sie einen Namen und einen Text für die Vorlage ein.");
            return;
        }

       fetch('/api/vorlage/save', {
            method: 'PUT',
            headers: {  'Content-Type': 'application/json' },
            body: JSON.stringify({ name: vorlagename, content: einleitung, type: 'einleitung' })
        }).then(response => {
            if (response.ok) {
                alert("Vorlage erfolgreich gespeichert!");
                document.getElementById('vorlagenameeinleitung').value = '';
                // Optionally refresh the vorlage select
                if (ui.VorlageeinleitungSelect) {
                    ui.VorlageeinleitungSelect.clearOptions();
                    ui.VorlageeinleitungSelect.load('');
                }
            } else {
                alert("Fehler beim Speichern der Vorlage.");
            }
        }).catch(error => {
            console.error('Error saving template:', error);
            alert("Fehler beim Speichern der Vorlage.");
        });
    });

    
    document.getElementById('saveVorlageSchluss')
    ?.addEventListener("click", () => {
        const vorlagename = document.getElementById('vorlagenameschluss').value;
        const schluss = ui.schlussQuill ? ui.schlussQuill.root.innerHTML : '';

        if (!vorlagename || !schluss) {
            alert("Bitte geben Sie einen Namen und einen Text für die Vorlage ein.");
            return;
        }

       fetch('/api/vorlage/save', {
            method: 'PUT',
            headers: {  'Content-Type': 'application/json' },
            body: JSON.stringify({ name: vorlagename, content: schluss, type: 'schluss' })
        }).then(response => {
            if (response.ok) {
                alert("Vorlage erfolgreich gespeichert!");
                document.getElementById('vorlagenameschluss').value = '';
                // Optionally refresh the vorlage select
                if (ui.VorlageschlussSelect) {
                    ui.VorlageschlussSelect.clearOptions();
                    ui.VorlageschlussSelect.load('');
                }
            } else {
                alert("Fehler beim Speichern der Vorlage.");
            }
        }).catch(error => {
            console.error('Error saving template:', error);
            alert("Fehler beim Speichern der Vorlage.");
        });
    });


    document.getElementById('vorlageeinleitung')
    ?.addEventListener("change", (e) => {
        const selectedId = e.target.value;
        if (ui.VorlageeinleitungSelect && selectedId) {
            const selectedItem = ui.VorlageeinleitungSelect.options[selectedId];
            if (selectedItem && selectedItem.content && ui.einleitungQuill) {
                ui.einleitungQuill.root.innerHTML = selectedItem.content;
            }
        }
    });

    document.getElementById('vorlageschluss')
    ?.addEventListener("change", (e) => {
        const selectedId = e.target.value;
        if (ui.VorlageschlussSelect && selectedId) {
            const selectedItem = ui.VorlageschlussSelect.options[selectedId];
            if (selectedItem && selectedItem.content && ui.schlussQuill) {
                ui.schlussQuill.root.innerHTML = selectedItem.content;
            }
        }
    });

    renderer.bootstrap();

  groupManager.addGroup();

app.requestRender();
