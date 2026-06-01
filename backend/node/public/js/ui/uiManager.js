export class UIManager {
    constructor(state) {
        this.state = state;
        this.instances = [];
    }

    init() {
        this.destroy();
        this.initKundenSelect();
        this.initAnsprechpartnerSelect();
        this.loadAnsprechpartnerFirst();
        this.initObjektSelect();
        this.loadObjektFirst();
        this.initeinleitungQuill();
        this.initschlussQuill();
        this.initVorlageeinleitungSelect();
        this.initVorlageschlussSelect();
        this.initProjektSelect();
        this.loadProjektFirst();
        this.createListeners();
        // Quill initialization moved to DOMContentLoaded in main.js
    }

    changeAnrede(selectedItem) {
        const el = document.getElementById('Anrede')
        if(selectedItem){
            if(selectedItem.anrede === "Herr") {
                el.value = "Sehr geehrter Herr " + selectedItem.name + ",";
            } else if(selectedItem.anrede === "Frau")   {
                el.value = "Sehr geehrte Frau " + selectedItem.name + ",";
            }
            this.state.angebot.anrede = el.value;
        } else {
            el.value = "Sehr geehrte Damen und Herren,";
        }
    }

    createListeners(){

        document.getElementById('angebotsdatum').addEventListener('change', (e)=>{
            this.state.angebot.datum = e.target.value;    
            });

         document.getElementById('kundeSelect')
    ?.addEventListener("change", (e) =>{

        console.log("Selected Kunden ID:", e.target.value);
        const kundenId = e.target.value;

        const el = document.getElementById('kundenanschrift')

        // Get TomSelect instance and populate kundenanschrift label
        if (this.KundenSelect && kundenId) {
            const selectedItem = this.KundenSelect.options[kundenId];
            if (selectedItem && selectedItem.adresse) {
           
                el.innerHTML = `${selectedItem.name} <br>
                 ${selectedItem.adresse} <br>
                 ${selectedItem.plz} ${selectedItem.stadt}`;
            }
            this.state.angebot.kundenId = kundenId;
             this.changeAnrede(null);
        } else {
            el.textContent = '';
        }

       

        this.loadAnsprechpartner(kundenId);
        this.loadObjekt(kundenId);
    });

     document.getElementById('ansprechpartnerSelect')
    ?.addEventListener("change", (e) =>{

         const el = document.getElementById('ansprechpartner')

        if (this.AnsprechpartnerSelect) {
            const selectedItem = this.AnsprechpartnerSelect.options[e.target.value];
            if (selectedItem && selectedItem.name) {
                console.log(selectedItem);
                el.innerHTML = `${selectedItem.vorname} ${selectedItem.name} <br>
                 Telefon: ${selectedItem.telefon} <br>
                 Mobil: ${selectedItem.mobil} <br>
                 Email: ${selectedItem.mail} <br>
                 ${selectedItem.haupt ? '<strong>Hauptansprechpartner</strong>' : ''}`;
            
                this.state.angebot.ansprechpartnerId = selectedItem.id;
                this.changeAnrede(selectedItem);

                // Auto-select kunde when ansprechpartner is chosen
                if (selectedItem.kundenId) {
                    this.KundenSelect.setValue(selectedItem.kundenId, false);
                }
            } else {
                el.textContent = '';
            }
        } else {
            el.textContent = '';
        }

        
});
     document.getElementById('objektSelect')
    ?.addEventListener("change", (e) =>{
        const el = document.getElementById('objektanschrift')

        if (this.ObjektSelect) {
            const selectedItem = this.ObjektSelect.options[e.target.value];
            if (selectedItem) {
                console.log(selectedItem);
                 el.innerHTML = `${selectedItem.adresse} <br>
                 ${selectedItem.plz} ${selectedItem.stadt}`;
                this.state.angebot.objektId = selectedItem.id;
            } else {
                el.textContent = '';
            }
        } else {
            el.textContent = '';
        }

    });

     document.getElementById('projektSelect')
    ?.addEventListener("change", (e) =>{
        const selectedItem = this.ProjektSelect.options[e.target.value];
        if (selectedItem) {
            console.log(selectedItem);
            this.state.angebot.projektId = selectedItem.id;

            // Auto-select kunde and objekt when project is chosen
            if (selectedItem.kundenId) {
                this.KundenSelect.setValue(selectedItem.kundenId, false);
            }
            if (selectedItem.objektId) {
                this.ObjektSelect.setValue(selectedItem.objektId, false);
            }
        } else {
            this.state.angebot.projektId = null;
        }

        // Load related data based on selected project
        if (selectedItem && selectedItem.kundenId) {
            this.loadAnsprechpartner(selectedItem.kundenId);
            this.loadObjekt(selectedItem.kundenId);
        }
        
     });    


    document.getElementById('einleitung').getElementsByClassName('ql-editor')[0]
    ?.addEventListener("change", (e) =>{
        console.log(e.target.innerHTML);
    });

    }
    async loadAnsprechpartner(kundenId) {

    if (!this.AnsprechpartnerSelect) return;

    try {
        const res = await fetch(`http://127.0.0.1:8080/api/kunde/${kundenId}/ansprechpartner`);
        const json = await res.json();

console.log(json);
        const ts = this.AnsprechpartnerSelect;

        // 🔴 Wichtig: alten Zustand löschen
        ts.clear();          // ausgewählten Wert entfernen
        ts.clearOptions();   // alte Optionen entfernen

        // ✅ neue Optionen setzen
        ts.addOptions(json.items);

        // 🔄 UI refresh
        ts.refreshOptions(false);

      

    } catch (err) {
        console.error("Fehler beim Laden der Ansprechpartner:", err);
    }
}

async loadObjekt(kundenId) {

    if (!this.ObjektSelect) return;

    try {
        const res = await fetch(`http://127.0.0.1:8080/api/objekte/${kundenId}/kunde`);
        const json = await res.json();

        const ts = this.ObjektSelect;

        // 🔴 Wichtig: alten Zustand löschen
        ts.clear();          // ausgewählten Wert entfernen
        ts.clearOptions();   // alte Optionen entfernen

        // ✅ neue Optionen setzen
        ts.addOptions(json.items);

        // 🔄 UI refresh
        ts.refreshOptions(false);

    } catch (err) {
        console.error("Fehler beim Laden der Objekte:", err);
    }
}


async loadObjektFirst() {

    if (!this.ObjektSelect) return;

    try {
        const res = await fetch(`http://127.0.0.1:8080/api/objekte/`);
        const json = await res.json();

        const ts = this.ObjektSelect;

        // 🔴 Wichtig: alten Zustand löschen
        ts.clear();          // ausgewählten Wert entfernen
        ts.clearOptions();   // alte Optionen entfernen

        // ✅ neue Optionen setzen
        ts.addOptions(json.items);

        // 🔄 UI refresh
        ts.refreshOptions(false);

    } catch (err) {
        console.error("Fehler beim Laden der Ansprechpartner:", err);
    }
}


async loadAnsprechpartnerFirst() {

    if (!this.AnsprechpartnerSelect) return;
    try {
        const res = await fetch(`http://127.0.0.1:8080/api/ansprechpartner/`);
        const json = await res.json();

        

        const ts = this.AnsprechpartnerSelect;

        // 🔴 Wichtig: alten Zustand löschen
        ts.clear();          // ausgewählten Wert entfernen
        ts.clearOptions();   // alte Optionen entfernen

        // ✅ neue Optionen setzen
        ts.addOptions(json.items);

        // 🔄 UI refresh
        ts.refreshOptions(false);

   

    } catch (err) {
        console.error("Fehler beim Laden der Ansprechpartner:", err);
    }
}

    initKundenSelect() {

        const el = document.querySelector("#kundeSelect");
        if (!el) return;

        const ts = new TomSelect(el, {
              preload: true,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name, adresse, plz, stadt',
            // fetch remote data
            load: function (query, callback) {
               
                var url = 'http://127.0.0.1:8080/api/kunde/';

                fetch(url)
                    .then(response => response.json())
                    .then(json => {
                       
                        callback(json.items);
                    }).catch(() => {
                        callback();
                    });

            },
            // custom rendering functions for options and items
            render: {
                option: function (item, escape) {
                    return `<div class="py-2 d-flex">
							<div>
								<div class="mb-1">
									<span >
										${escape(item.name)}
									</span>
                                    <span class="mb-1">
                                        ${escape(item.adresse)}
                                    </span>
                                    <span class="mb-1">
                                        ${escape(item.plz)} ${escape(item.stadt)}
                                    </span>

							</div>
						</div>`;
                },
                item: function (item, escape) {
                    return `<div class="py-2 d-flex">
	
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.name)}
									</span>
									
							</div>
						</div>`;
                },

                onchange: function(value) {
                    console.log("Selected value:", value);
                }

            },
        });


        this.KundenSelect = ts;
    }

     initProjektSelect() {

        const el = document.querySelector("#projektSelect");
        if (!el) return;

        const ts = new TomSelect(el, {
              preload: true,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name, status',
            // fetch remote data
            // custom rendering functions for options and items
            render: {
                option: function (item, escape) {
                    return `<div class="py-2 d-flex">
							<div>
								<div class="mb-1">
									<span >
										${escape(item.name)}
									</span>
                                    <span class="mb-1">
                                        ${escape(item.status)}
                                    </span>

							</div>
						</div>`;
                },
                item: function (item, escape) {
                    return `<div class="py-2 d-flex">
	
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.name)}
									</span>
							</div>
						</div>`;
                },

            },
        });


        this.ProjektSelect = ts;
    }

    async loadProjektFirst() {

    if (!this.ProjektSelect) return;

    try {
        const res = await fetch(`http://127.0.0.1:8080/api/projekte/`);
        const json = await res.json();

        const ts = this.ProjektSelect;

        // 🔴 Wichtig: alten Zustand löschen
        ts.clear();          // ausgewählten Wert entfernen
        ts.clearOptions();   // alte Optionen entfernen

        // ✅ neue Optionen setzen
        ts.addOptions(json.items);

        // 🔄 UI refresh
        ts.refreshOptions(false);

    } catch (err) {
        console.error("Fehler beim Laden der Ansprechpartner:", err);
    }
}

async loadProjekkunde(kundenId = null, objektId = null) {
if (!this.ProjektSelect) return;

    let url = `http://127.0.0.1:8080/api/projekte/`;
    
    if (kundenId && !objektId) {
        url = `http://127.0.0.1:8080/api/projekte/${kundenId}`;
    }
    if (kundenId && objektId) {
        url = `http://127.0.0.1:8080/api/projekte/${kundenId}/${objektId}`;
    }
    

    try {
        const res = await fetch(url);
        const json = await res.json();

        const ts = this.ProjektSelect;

        // 🔴 Wichtig: alten Zustand löschen
        ts.clear();          // ausgewählten Wert entfernen
        ts.clearOptions();   // alte Optionen entfernen

        // ✅ neue Optionen setzen
        ts.addOptions(json.items);

        // 🔄 UI refresh
        ts.refreshOptions(false);

    } catch (err) {
        console.error("Fehler beim Laden der Ansprechpartner:", err);
    }
}

initVorlageeinleitungSelect() {

        const el = document.querySelector("#vorlageeinleitung");
        if (!el) return;

        const ts = new TomSelect(el, {
              preload: true,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            // fetch remote data
            load: function (query, callback) {
               
                var url = 'http://127.0.0.1:8080/api/vorlage/einleitung/';

                fetch(url)
                    .then(response => response.json())
                    .then(json => {
                       
                        callback(json.items);
                    }).catch(() => {
                        callback();
                    });

            },
            // custom rendering functions for options and items
            render: {
                option: function (item, escape) {
                    return `<div class="py-2 d-flex">
							<div>
								<div class="mb-1">
									<span >
										${escape(item.name)}
									</span>

							</div>
						</div>`;
                },
                item: function (item, escape) {
                    return `<div class="py-2 d-flex">
	
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.name)}
									</span>
									
							</div>
						</div>`;
                },

            },
        });


        this.VorlageeinleitungSelect = ts;
    }

    initVorlageschlussSelect() {

        const el = document.querySelector("#vorlageschluss");
        if (!el) return;

        const ts = new TomSelect(el, {
              preload: true,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            // fetch remote data
            load: function (query, callback) {
               
                var url = 'http://127.0.0.1:8080/api/vorlage/schluss/';

                fetch(url)
                    .then(response => response.json())
                    .then(json => {
                       
                        callback(json.items);
                    }).catch(() => {
                        callback();
                    });

            },
            // custom rendering functions for options and items
            render: {
                option: function (item, escape) {
                    return `<div class="py-2 d-flex">
							<div>
								<div class="mb-1">
									<span >
										${escape(item.name)}
									</span>
							</div>
						</div>`;
                },
                item: function (item, escape) {
                    return `<div class="py-2 d-flex">
	
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.name)}
									</span>
									
							</div>
						</div>`;
                },

            },
        });


        this.VorlageschlussSelect = ts;
    }

    initAnsprechpartnerSelect() {

        const el = document.querySelector("#ansprechpartnerSelect");
        if (!el) return;

        const ts = new TomSelect(el, {
              preload: true,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name, vorname, telefon, mail, mobil',
            render: {
                option: function (item, escape) {
                    return `<div class="py-2 d-flex">
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.name)}
									</span>
							</div>
						</div>`;
                },
                item: function (item, escape) {
                    return `<div class="py-2 d-flex">
	
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.name)}
									</span>
									
							</div>
						</div>`;
                },

            },
        });
        this.AnsprechpartnerSelect = ts;
    }

    initObjektSelect() {

        const el = document.querySelector("#objektSelect");
        if (!el) return;

        const ts = new TomSelect(el, {
            preload: true,
            valueField: 'id',
            labelField: 'adresse',
            searchField: 'adresse, plz, stadt',
            // fetch remote data
            load: function (query, callback) {

                var url = 'http://127.0.0.1:8080/api/objekte/';

                fetch(url)
                    .then(response => response.json())
                    .then(json => {
                       
                        callback(json.items);
                    }).catch(() => {
                        callback();
                    });

            },
            // custom rendering functions for options and items
            render: {
                option: function (item, escape) {
                    return `<div class="py-2 d-flex">
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.adresse)}
									</span>
                                    <span class="mb-1">
                                        ${escape(item.plz)} ${escape(item.stadt)}
                                    </span>
							</div>
						</div>`;
                },
                item: function (item, escape) {
                    return `<div class="py-2 d-flex">
	
							<div>
								<div class="mb-1">
									<span class="h4">
										${escape(item.adresse)} 
									</span>
                                    <span class="mb-1">
                                        ${escape(item.plz)} ${escape(item.stadt)}
                                    </span>
									
							</div>
						</div>`;
                },

            },
        });
        this.ObjektSelect = ts;
    }


    initeinleitungQuill() {
        const el = document.querySelector("#einleitung");
        if (!el) {
            console.warn("Einleitung element not found");
            return;
        }

      
        const einleitung = new Quill('#einleitung', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }]
                ]
            }
        });
        einleitung.container.id = 'einleitung'; // Ensure the container has the correct ID
        this.instances.push(einleitung);
        this.einleitungQuill = einleitung; // Store reference

        einleitung.on('text-change', () => {
            this.state.angebot.einleitung = einleitung.root.innerHTML;
        });
    }

    initschlussQuill() {
        const el = document.querySelector("#schluss");
        if (!el) {
            console.warn("Schluss element not found");
            return;
        }

        const schluss = new Quill(el, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }]
                ]
            }
        });
        schluss.container.id = 'schluss'; // Ensure the container has the correct ID
       
        this.instances.push(schluss);
        this.schlussQuill = schluss; // Store reference

        schluss.on('text-change', () => {
            this.state.angebot.schluss = schluss.root.innerHTML;
        });
    }


    destroy() {
        this.instances.forEach(i => i.destroy());
        this.instances = [];
    }
}