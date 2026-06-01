import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AngebotService } from './service/angebot.service';
import { CalculatorService } from './service/calculator';
import { StateService } from './service/state';

@Component({
  selector: 'app-angebotserstellung',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './angebotserstellung.html',
  styleUrls: ['./angebotserstellung.scss']
})
export class Angebotserstellung implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(StateService);
  private readonly calculator = inject(CalculatorService);
  private readonly angebotService = inject(AngebotService);
  kunden: Array<any> = [];
  ansprechpartner: Array<any> = [];
  objekte: Array<any> = [];
  projekte: Array<any> = [];
  vorlagen: Array<any> = [];
  private allObjekte: Array<any> = [];
  private allProjekte: Array<any> = [];
  private allAnsprechpartner: Array<any> = [];

  private einleitungQuill: any = null;
  private schlussQuill: any = null;

  form!: FormGroup;
  typeOptions = [
    { value: 'material', label: 'Material' },
    { value: 'lohn', label: 'Lohn' },
    { value: 'sonstiges', label: 'Sonstiges' },
    { value: 'misch', label: 'Mischposition' },
    { value: 'gruppe', label: 'Gruppe' }
  ];

  ngOnInit(): void {
    this.buildForm();

    this.form.valueChanges.subscribe(() => {
      this.syncState();
      this.computeKosten();
    });

    if (this.groups.length === 0) {
      this.addGroup();
    }

    this.setupVorlagenListeners();
    this.loadInitialData();

    // react to customer selection to filter dependent lists
    this.form.get('kundenId')?.valueChanges.subscribe((kid) => {
      this.onKundeChange(kid);
    });
  }

  ngAfterViewInit(): void {
    this.initQuillEditors();
  }

  private setupVorlagenListeners() {
    this.form.get('vorlageEinleitungId')?.valueChanges.subscribe(id => this.applyVorlageEinleitung(id));
    this.form.get('vorlageSchlussId')?.valueChanges.subscribe(id => this.applyVorlageSchluss(id));
  }

  private applyVorlageEinleitung(vorlageId: any) {
    const vorlage = this.vorlagen.find(v => v.id === vorlageId || v.ID === vorlageId);
    const value = vorlage?.text || vorlage?.content || '';
    this.form.patchValue({ einleitung: value }, { emitEvent: false });
    if (this.einleitungQuill) {
      this.einleitungQuill.root.innerHTML = value;
    }
  }

  private applyVorlageSchluss(vorlageId: any) {
    const vorlage = this.vorlagen.find(v => v.id === vorlageId || v.ID === vorlageId);
    const value = vorlage?.text || vorlage?.content || '';
    this.form.patchValue({ schluss: value }, { emitEvent: false });
    if (this.schlussQuill) {
      this.schlussQuill.root.innerHTML = value;
    }
  }

  private async loadInitialData() {
    await Promise.all([this.loadKunden(), this.loadVorlagen(), this.loadObjekte(), this.loadProjekte(), this.loadAnsprechpartner()]);
  }

  private async loadKunden() {
    try {
      const res = await fetch('/api/kunden');
      if (res.ok) this.kunden = await res.json();
    } catch (e) {
      console.warn('kunden load failed', e);
    }
  }

  private async loadVorlagen() {
    try {
      const res = await fetch('/api/vorlagen');
      if (res.ok) this.vorlagen = await res.json();
    } catch (e) {
      console.warn('vorlagen load failed', e);
    }
  }

  private async loadObjekte() {
    try {
      const res = await fetch('/api/objekte');
      if (res.ok) {
        this.allObjekte = await res.json();
        this.objekte = [...this.allObjekte];
      }
    } catch (e) {
      console.warn('objekte load failed', e);
    }
  }

  private async loadProjekte() {
    try {
      const res = await fetch('/api/projekte');
      if (res.ok) {
        this.allProjekte = await res.json();
        this.projekte = [...this.allProjekte];
      }
    } catch (e) {
      console.warn('projekte load failed', e);
    }
  }

  private async loadAnsprechpartner() {
    try {
      const res = await fetch('/api/ansprechpartner');
      if (res.ok) {
        this.allAnsprechpartner = await res.json();
        this.ansprechpartner = [...this.allAnsprechpartner];
      }
    } catch (e) {
      console.warn('ansprechpartner load failed', e);
    }
  }

  private onKundeChange(kundenId: any) {
    this.form.patchValue({ objektId: null, projektId: null, ansprechpartnerId: null }, { emitEvent: false });
    if (kundenId) {
      const normalized = String(kundenId);
      this.objekte = this.allObjekte.filter(o => String(o.kundenId || o.Kunden_ID || o.KundenId || o.KundenId) === normalized);
      this.projekte = this.allProjekte.filter(p => String(p.kundenId || p.Kunden_ID || p.KundenId) === normalized);
      this.ansprechpartner = this.allAnsprechpartner.filter(a => String(a.kundenId || a.Kunden_ID || a.KundenId) === normalized);
    } else {
      this.objekte = [...this.allObjekte];
      this.projekte = [...this.allProjekte];
      this.ansprechpartner = [...this.allAnsprechpartner];
    }
  }

  private initQuillEditors() {
    const ein = document.getElementById('einleitungEditor');
    const sch = document.getElementById('schlussEditor');

    const init = (QuillCtor: any) => {
      if (ein) {
        this.einleitungQuill = new QuillCtor(ein, { theme: 'snow' });
        this.einleitungQuill.on('text-change', () => {
          const html = ein.querySelector('.ql-editor')?.innerHTML || '';
          this.form.patchValue({ einleitung: html }, { emitEvent: false });
        });
        const initialEin = this.form.value.einleitung || '';
        this.einleitungQuill.root.innerHTML = initialEin;
      }

      if (sch) {
        this.schlussQuill = new QuillCtor(sch, { theme: 'snow' });
        this.schlussQuill.on('text-change', () => {
          const html = sch.querySelector('.ql-editor')?.innerHTML || '';
          this.form.patchValue({ schluss: html }, { emitEvent: false });
        });
        const initialSch = this.form.value.schluss || '';
        this.schlussQuill.root.innerHTML = initialSch;
      }
    };

    if (typeof (window as any).Quill !== 'undefined') {
      init((window as any).Quill);
      return;
    }

    // try dynamic import from node_modules
    import('quill')
      .then((m) => init((m as any).default || m))
      .catch((err) => {
        // quill not available; editors remain as plain divs
        console.warn('Quill not available', err);
      });
  }

  get groups(): FormArray {
    return this.form.get('groups') as FormArray;
  }

  private buildForm() {
    const groups = this.state.value.angebot.groups.map(group =>
      this.fb.group({
        id: [group.id],
        name: [group.name || `Leistungsgruppe ${group.id}`, Validators.required],
        collapsed: [group.collapsed ?? false],
        rows: this.fb.array(
          group.rows.map(row =>
            this.fb.group({
              id: [row.id],
              typ: [row.typ || 'material', Validators.required],
              bezeichnung: [row.bezeichnung || ''],
              menge: [row.menge ?? 1, Validators.min(0)],
              ek: [row.ek ?? 0, Validators.min(0)],
              aufschlag: [row.aufschlag ?? 0, Validators.min(0)],
              rabatt: [row.rabatt ?? 0, Validators.min(0)],
              einheit: [row.einheit || 'Stk'],
              mischId: [row.mischId ?? null],
              gruppeId: [row.gruppeId ?? null],
              parentMischId: [row.parentMischId ?? null],
              parentGruppeId: [row.parentGruppeId ?? null],
              remark: [row.remark || '']
            })
          )
        )
      })
    );

    this.form = this.fb.group({
      title: [this.state.value.angebot.title || ''],
      einleitung: [this.state.value.angebot.einleitung || ''],
      schluss: [this.state.value.angebot.schluss || ''],
      kundenId: [this.state.value.angebot.kundenId || null],
      objektId: [(this.state.value.angebot as any).objektId || null],
      projektId: [(this.state.value.angebot as any).projektId || null],
      ansprechpartnerId: [(this.state.value.angebot as any).ansprechpartnerId || null],
      vorlageEinleitungId: [(this.state.value.angebot as any).vorlageEinleitungId || null],
      vorlageSchlussId: [(this.state.value.angebot as any).vorlageSchlussId || null],
      groups: this.fb.array(groups)
    });
  }

  private createGroup() {
    const id = this.state.nextGroupId();
    return this.fb.group({
      id: [id],
      name: [`Leistungsgruppe ${id}`, Validators.required],
      collapsed: [false],
      rows: this.fb.array([this.createRow()])
    });
  }

  private createRow() {
    return this.fb.group({
      id: [this.state.nextRowId()],
      typ: ['material', Validators.required],
      bezeichnung: [''],
      menge: [1, Validators.min(0)],
      ek: [0, Validators.min(0)],
      aufschlag: [0, Validators.min(0)],
      rabatt: [0, Validators.min(0)],
      einheit: ['Stk'],
      mischId: [null],
      gruppeId: [null],
      parentMischId: [null],
      parentGruppeId: [null],
      remark: ['']
    });
  }

  addGroup() {
    this.groups.push(this.createGroup());
    this.syncState();
  }

  removeGroup(index: number) {
    this.groups.removeAt(index);
    this.syncState();
  }

  getRows(groupIndex: number): FormArray {
    return this.groups.at(groupIndex).get('rows') as FormArray;
  }

  addRow(groupIndex: number) {
    this.getRows(groupIndex).push(this.createRow());
    this.syncState();
  }

  removeRow(groupIndex: number, rowIndex: number) {
    this.getRows(groupIndex).removeAt(rowIndex);
    this.syncState();
  }

  calculateRow(control: AbstractControl) {
    const row = control.value;
    const menge = Number(row.menge || 0);
    const ek = Number(row.ek || 0);
    const aufschlag = Number(row.aufschlag || 0);
    const rabatt = Number(row.rabatt || 0);

    let ep = ek + ek * (aufschlag / 100);
    ep -= ep * (rabatt / 100);

    return {
      ep: Number(ep.toFixed(2)),
      gp: Number((ep * menge).toFixed(2))
    };
  }

  getGroupTotal(groupIndex: number) {
    return this.getRows(groupIndex).controls.reduce((sum, control) => {
      const { gp } = this.calculateRow(control);
      return sum + gp;
    }, 0);
  }

  getGrandTotal() {
    return this.groups.controls.reduce((sum, _, index) => {
      return sum + this.getGroupTotal(index);
    }, 0);
  }

  materialKosten = 0;
  lohnKosten = 0;
  sonstigeKosten = 0;

  computeKosten() {
    let material = 0;
    let lohn = 0;
    let sonstiges = 0;

    this.groups.controls.forEach((groupCtrl) => {
      const rows = (groupCtrl.get('rows') as FormArray).controls;
      rows.forEach(r => {
        const val = r.value;
        const menge = Number(val.menge || 0);
        const ek = Number(val.ek || 0);
        const kosten = menge * ek;
        if (val.typ === 'material') material += kosten;
        else if (val.typ === 'lohn') lohn += kosten;
        else if (val.typ === 'sonstiges') sonstiges += kosten;
      });
    });

    this.materialKosten = material;
    this.lohnKosten = lohn;
    this.sonstigeKosten = sonstiges;
  }

  async saveOffer() {
    try {
      await this.angebotService.save();
      alert('Angebot wurde gespeichert.');
    } catch (error) {
      console.error(error);
      alert('Angebot konnte nicht gespeichert werden.');
    }
  }

  async createPdf() {
    try {
      await this.angebotService.createPDF();
    } catch (error) {
      console.error(error);
      alert('PDF konnte nicht erstellt werden.');
    }
  }

  goBack() {
    window.history.back();
  }

  private syncState() {
    this.state.update({
      angebot: {
        ...this.state.value.angebot,
        ...this.form.value,
        haschange: true
      }
    });
  }
}
