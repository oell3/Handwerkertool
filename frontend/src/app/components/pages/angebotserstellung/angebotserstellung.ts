import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { signal } from '@angular/core';
import { AngebotService } from './service/angebot.service';
import { CalculatorService } from './service/calculator';
import { StateService } from './service/state';
interface Kunde {
  id: string;
  ID?: string | number;
  typ?: string;
  name?: string;
  Name?: string;
  adresse?: string;
  plz?: string;
  stadt?: string;
  mail?: string;
  telefon?: string;
  fax?: string;
  steuernummer?: string;
  iban?: string;
  steueridentifikationsnummer?: string;
  lat?: string;
  lon?: string;
  mandant_id?: string;
}

@Component({
  selector: 'app-angebotserstellung',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './angebotserstellung.html',
  styleUrls: ['./angebotserstellung.scss'],
})


export class AngebotserstellungComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(StateService);
  private readonly calculator = inject(CalculatorService);
  private readonly angebotService = inject(AngebotService);
  kunden = signal<Kunde[]>([]);
  ansprechpartner = signal<any[]>([]);
  objekte = signal<any[]>([]);
  projekte = signal<any[]>([]);
  vorlagenschluss = signal<any[]>([]);
  vorlageneinleitung = signal<any[]>([]);
  private allObjekte: Array<any> = [];
  private allProjekte: Array<any> = [];
  private allAnsprechpartner: Array<any> = [];

  private draggedRowData: { groupId: number; rowId: number; typ: string } | null = null;
  private draggedGroupId: number | null = null;

  private einleitungQuill: any = null;
  private schlussQuill: any = null;

  form!: FormGroup;
  typeOptions = [
    { value: 'material', label: 'Material' },
    { value: 'lohn', label: 'Lohn' },
    { value: 'sonstiges', label: 'Sonstiges' },
    { value: 'misch', label: 'Mischposition' },
    { value: 'gruppe', label: 'Gruppe' },
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
    this.form
      .get('vorlageEinleitungId')
      ?.valueChanges.subscribe((id) => this.applyVorlageEinleitung(id));
    this.form.get('vorlageSchlussId')?.valueChanges.subscribe((id) => this.applyVorlageSchluss(id));
  }

  private applyVorlageEinleitung(vorlageId: any) {
    const vorlage = this.vorlageneinleitung().find((v: any) => v.id === vorlageId || v.ID === vorlageId);
    const value = vorlage?.text || vorlage?.content || '';
    this.form.patchValue({ einleitung: value }, { emitEvent: false });
    if (this.einleitungQuill) {
      this.einleitungQuill.root.innerHTML = value;
    }
  }

  private applyVorlageSchluss(vorlageId: any) {
    const vorlage = this.vorlagenschluss().find((v: any) => v.id === vorlageId || v.ID === vorlageId);
    const value = vorlage?.text || vorlage?.content || '';
    this.form.patchValue({ schluss: value }, { emitEvent: false });
    if (this.schlussQuill) {
      this.schlussQuill.root.innerHTML = value;
    }
  }

  private async loadInitialData() {
    await Promise.all([
      this.loadKunden(),
      this.loadVorlagen(),
      this.loadObjekte(),
      this.loadProjekte(),
      this.loadAnsprechpartner(),
    ]);
  }

  private async loadKunden() {

    try {
      const res = await fetch('/api/kunden');
      const data = await res.json();
      if (res.ok) {
        const normalized = data.map((K: any) => ({
          ...K,
          id: String(K.id ?? K.ID ?? ''),
          name: K.name ?? K.Name ?? '',
        }));
        this.kunden.set(normalized);
      }
    } catch (e) {
      console.warn('kunden load failed', e);
    }
    console.log('Kunden:', this.kunden());
  }

  private async loadVorlagen() {
    try {
      const res = await fetch('/api/vorlagen');
      const data = await res.json();
      if (res.ok){
        this.vorlageneinleitung.set([...data.einleitung])
        this.vorlagenschluss.set([...data.schluss]);
    
      } 
    } catch (e) {
      console.warn('vorlagen load failed', e);
    }
    console.log('vorlagen:', this.vorlageneinleitung(), this.vorlagenschluss());
  }

  private async loadObjekte() {
    try {
      const res = await fetch('/api/objekte');
      if (res.ok) {
        const data = await res.json();

        this.allObjekte = [...data.objekte];
        this.objekte.set([...this.allObjekte]);
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
        this.projekte.set([...this.allProjekte]);
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
        this.ansprechpartner.set([...this.allAnsprechpartner]);
      }
    } catch (e) {
      console.warn('ansprechpartner load failed', e);
    }
  }

  private onKundeChange(kundenId: any) {
    this.form.patchValue(
      { objektId: null, projektId: null, ansprechpartnerId: null },
      { emitEvent: false },
    );
    if (kundenId) {
      const normalized = String(kundenId);
      this.objekte.set(
        this.allObjekte.filter(
          (o) => String(o.kunden_id) === normalized,
        ),
      );
      this.projekte.set(
        this.allProjekte.filter(
          (p) => String( p.kunden_id) === normalized,
        ),
      );
      this.ansprechpartner.set(
        this.allAnsprechpartner.filter(
          (a) => String( a.kunden_id) === normalized,
        ),
      );
    } else {
      this.objekte.set([...this.allObjekte]);
      this.projekte.set([...this.allProjekte]);
      this.ansprechpartner.set([...this.allAnsprechpartner]);
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
 const groups = this.state.value.angebot.groups.map((group) =>
   this.fb.group({
     id: [group.id],
     name: [group.name || `Leistungsgruppe ${group.id}`, Validators.required],
     collapsed: [group.collapsed ?? false],
     rows: this.fb.array(
       group.rows.map((row) =>
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
           collapsed: [row.collapsed ?? false],
           remark: [row.remark || ''],
           rowNumber: [group.rows.indexOf(row) + 1] // Hinzufügen der Zeilennummer
         })
       )
     ),
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
      groups: this.fb.array(groups),
    });
  }

  private createGroup() {
    const id = this.state.nextGroupId();
    return this.fb.group({
      id: [id],
      name: [`Leistungsgruppe ${id}`, Validators.required],
      collapsed: [false],
      rows: this.fb.array([this.createRow()]),
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
      collapsed: [false],
      remark: [''],
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

  toggleGroup(index: number) {
    console.log("gruppe zu oder aufmachen", index);
    const group = this.groups.at(index);
    group.get('collapsed')?.setValue(!group.get('collapsed')?.value);
    this.syncState();
  }

  toggleRowCollapse(groupId: number, rowId: number) {
    const groupIndex = this.findGroupIndexById(groupId);
    const rowIndex = this.findRowIndexById(groupIndex, rowId);
    if (groupIndex < 0 || rowIndex < 0) {
      return;
    }
    const row = this.getRows(groupIndex).at(rowIndex);
    row.get('collapsed')?.setValue(!row.get('collapsed')?.value);
    this.syncState();
  }

  removeRowFromGroupById(groupId: number, rowId: number) {
    const groupIndex = this.findGroupIndexById(groupId);
    const rowIndex = this.findRowIndexById(groupIndex, rowId);
    if (groupIndex < 0 || rowIndex < 0) {
      return;
    }
    this.removeRow(groupIndex, rowIndex);
  }

  onRowDragEnd() {
    this.draggedRowData = null;
  }

  isMixChild(row: any) {
    return row?.parentMischId != null;
  }

  isGroupChild(row: any) {
    return row?.parentGruppeId != null;
  }

  isChildRow(row: any) {
    return this.isMixChild(row) || this.isGroupChild(row);
  }

  private findGroupIndexById(groupId: number) {
    return this.groups.controls.findIndex((g) => g.value.id === groupId);
  }

  private findRowIndexById(groupIndex: number, rowId: number) {
    return this.getRows(groupIndex).controls.findIndex((r) => r.value.id === rowId);
  }

  getChildRowControls(group: AbstractControl, parentRow: AbstractControl): FormGroup[] {
    const rows = group.get('rows') as FormArray;
    return rows.controls.filter(
      (child) =>
        child.value.parentMischId === parentRow.value.id || child.value.parentGruppeId === parentRow.value.id,
    ) as FormGroup[];
  }

  private collectLinkedRowIds(rows: FormArray, rootRow: any) {
    const ids = new Set<number>([rootRow.id]);
    let added = true;

    while (added) {
      added = false;
      rows.controls.forEach((ctrl) => {
        const row = ctrl.value;
        if (
          !ids.has(row.id) &&
          ((row.parentMischId != null && ids.has(row.parentMischId)) ||
            (row.parentGruppeId != null && ids.has(row.parentGruppeId)))
        ) {
          ids.add(row.id);
          added = true;
        }
      });
    }

    return ids;
  }

  private extractRowBlock(rows: FormArray, rootRow: AbstractControl) {
    const ids = this.collectLinkedRowIds(rows, rootRow.value);
    return rows.controls.filter((ctrl) => ids.has(ctrl.value.id));
  }

  private removeControls(rows: FormArray, ids: Set<number>) {
    const indices = rows.controls
      .map((ctrl, index) => (ids.has(ctrl.value.id) ? index : -1))
      .filter((index) => index >= 0)
      .sort((a, b) => b - a);

    for (const index of indices) {
      rows.removeAt(index);
    }
  }

  private moveControls(rows: FormArray, controls: AbstractControl[], insertIndex: number) {
    controls.forEach((control, offset) => rows.insert(insertIndex + offset, control));
  }

  getRows(groupIndex: number): FormArray {
    return this.groups.at(groupIndex).get('rows') as FormArray;
  }

  getRowsFromGroup(group: AbstractControl): FormArray {
    return group.get('rows') as FormArray;
  }

  addRow(groupIndex: number) {
    this.getRows(groupIndex).push(this.createRow());
    this.syncState();
  }

  addRowFromGroup(group: AbstractControl) {
    this.getRowsFromGroup(group).push(this.createRow());
    this.syncState();
  }

  removeRow(groupIndex: number, rowIndex: number) {
    const rows = this.getRows(groupIndex);
    const row = rows.at(rowIndex).value;

    if (row.typ === 'misch' || row.typ === 'gruppe') {
      const ids = this.collectLinkedRowIds(rows, row);
      this.removeControls(rows, ids);
    } else {
      rows.removeAt(rowIndex);
    }

    this.syncState();
  }

  removeRowFromGroup(group: AbstractControl, rowIndex: number) {
    const rows = this.getRowsFromGroup(group);
    const row = rows.at(rowIndex).value;

    if (row.typ === 'misch' || row.typ === 'gruppe') {
      const ids = this.collectLinkedRowIds(rows, row);
      this.removeControls(rows, ids);
    } else {
      rows.removeAt(rowIndex);
    }

    this.syncState();
  }

  getGroupTotal(groupIndex: number) {
    return this.getRows(groupIndex).controls.reduce((sum, control) => {
      const row = control.value;
      if (row.parentMischId != null) {
        return sum;
      }
      const { gp } = this.calculateRow(control, this.groups.at(groupIndex));
      return sum + gp;
    }, 0);
  }

  getGroupTotalFromGroup(group: AbstractControl) {
    const rows = this.getRowsFromGroup(group);
    return rows.controls.reduce((sum, control) => {
      const row = control.value;
      if (row.parentMischId != null) {
        return sum;
      }
      const { gp } = this.calculateRow(control, group);
      return sum + gp;
    }, 0);
  }

  calculateRow(control: AbstractControl, group?: AbstractControl): { ep: number; gp: number } {
    const row = control.value;

    if (row.typ === 'gruppe') {
      return {
        ep: 0,
        gp: 0,
      };
    }

    if (row.typ === 'misch' && group) {
      const childRows = this.getChildRowControls(group, control);
      const totals = childRows.reduce(
        (acc: { menge: number; gp: number }, child: AbstractControl) => {
          const childCalc = this.calculateRow(child, group);
          return {
            menge: acc.menge + Number(child.value.menge || 0),
            gp: acc.gp + childCalc.gp,
          };
        },
        { menge: 0, gp: 0 },
      );

      const ep = totals.menge ? totals.gp / totals.menge : 0;
      return {
        ep: Number(ep.toFixed(2)),
        gp: Number(totals.gp.toFixed(2)),
      };
    }

    const menge = Number(row.menge || 0);
    const ek = Number(row.ek || 0);
    const aufschlag = Number(row.aufschlag || 0);
    const rabatt = Number(row.rabatt || 0);

    let ep = ek + ek * (aufschlag / 100);
    ep -= ep * (rabatt / 100);

    return {
      ep: Number(ep.toFixed(2)),
      gp: Number((ep * menge).toFixed(2)),
    };
  }

  onGroupDragStart(event: DragEvent, groupId: number) {
    this.draggedGroupId = groupId;
    event.dataTransfer?.setData('text/plain', 'group');
    event.dataTransfer?.setData('group-id', String(groupId));
    event.dataTransfer!.effectAllowed = 'move';
  }

  onGroupDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onGroupDrop(event: DragEvent, targetGroupId: number) {
    event.preventDefault();
    if (this.draggedGroupId == null || this.draggedGroupId === targetGroupId) {
      return;
    }

    const sourceIndex = this.findGroupIndexById(this.draggedGroupId);
    const targetIndex = this.findGroupIndexById(targetGroupId);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const control = this.groups.at(sourceIndex);
    this.groups.removeAt(sourceIndex);
    const insertIndex = sourceIndex < targetIndex ? targetIndex : targetIndex;
    this.groups.insert(insertIndex, control);
    this.syncState();
    this.draggedGroupId = null;
  }

  onRowDragStart(event: DragEvent, groupId: number, rowId: number) {
    this.draggedRowData = { groupId, rowId, typ: this.getRows(this.findGroupIndexById(groupId)).at(this.findRowIndexById(this.findGroupIndexById(groupId), rowId)).value.typ };
    event.dataTransfer?.setData('text/plain', 'row');
    event.dataTransfer?.setData('row-id', String(rowId));
    event.dataTransfer?.setData('group-id', String(groupId));
    event.dataTransfer!.effectAllowed = 'move';
  }

  onRowDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  private insertDragControls(rows: FormArray, controls: AbstractControl[], targetIndex: number) {
    const insertIndex = targetIndex < 0 ? rows.length : targetIndex;
    this.moveControls(rows, controls, Math.min(insertIndex, rows.length));
  }

  onRowDropToGroup(event: DragEvent, targetGroupId: number) {
    event.preventDefault();
    if (!this.draggedRowData) {
      return;
    }

    const sourceGroupIndex = this.findGroupIndexById(this.draggedRowData.groupId);
    const targetGroupIndex = this.findGroupIndexById(targetGroupId);
    if (sourceGroupIndex < 0 || targetGroupIndex < 0) {
      return;
    }

    const sourceRows = this.getRows(sourceGroupIndex);
    const sourceRowIndex = this.findRowIndexById(sourceGroupIndex, this.draggedRowData.rowId);
    if (sourceRowIndex < 0) {
      return;
    }

    const sourceRow = sourceRows.at(sourceRowIndex);
    const targetRows = this.getRows(targetGroupIndex);

    if (this.draggedRowData.typ === 'misch' || this.draggedRowData.typ === 'gruppe') {
      const block = this.extractRowBlock(sourceRows, sourceRow);
      this.removeControls(sourceRows, new Set(block.map((ctrl) => ctrl.value.id)));
      this.insertDragControls(targetRows, block, targetRows.length);
    } else {
      sourceRow.get('parentMischId')?.setValue(null);
      sourceRow.get('parentGruppeId')?.setValue(null);
      sourceRows.removeAt(sourceRowIndex);
      targetRows.insert(targetRows.length, sourceRow);
    }

    this.syncState();
    this.draggedRowData = null;
  }

  onRowDrop(event: DragEvent, targetGroupId: number, targetRowId: number) {
    event.preventDefault();
    if (!this.draggedRowData) {
      return;
    }

    const sourceGroupIndex = this.findGroupIndexById(this.draggedRowData.groupId);
    const targetGroupIndex = this.findGroupIndexById(targetGroupId);
    if (sourceGroupIndex < 0 || targetGroupIndex < 0) {
      return;
    }

    const sourceRows = this.getRows(sourceGroupIndex);
    const targetRows = this.getRows(targetGroupIndex);
    const sourceRowIndex = this.findRowIndexById(sourceGroupIndex, this.draggedRowData.rowId);
    const targetRowIndex = this.findRowIndexById(targetGroupIndex, targetRowId);
    if (sourceRowIndex < 0 || targetRowIndex < 0) {
      return;
    }

    const sourceRow = sourceRows.at(sourceRowIndex);
    const targetRow = targetRows.at(targetRowIndex);
    const targetRowValue = targetRow.value;

    if (this.draggedRowData.typ === 'misch' || this.draggedRowData.typ === 'gruppe') {
      const block = this.extractRowBlock(sourceRows, sourceRow);
      this.removeControls(sourceRows, new Set(block.map((ctrl) => ctrl.value.id)));
      const insertIndex = sourceGroupIndex === targetGroupIndex && sourceRowIndex < targetRowIndex ? targetRowIndex - block.length + 1 : targetRowIndex;
      this.insertDragControls(targetRows, block, insertIndex);
    } else if (targetRowValue.typ === 'misch' || targetRowValue.typ === 'gruppe') {
      sourceRow.get('parentMischId')?.setValue(targetRowValue.typ === 'misch' ? targetRowValue.id : null);
      sourceRow.get('parentGruppeId')?.setValue(targetRowValue.typ === 'gruppe' ? targetRowValue.id : null);
      if (sourceGroupIndex === targetGroupIndex) {
        sourceRows.removeAt(sourceRowIndex);
      } else {
        this.getRows(sourceGroupIndex).removeAt(sourceRowIndex);
      }
      const insertIndex = targetRowIndex + this.getChildRowControls(this.groups.at(targetGroupIndex), targetRow).length + 1;
      this.insertDragControls(targetRows, [sourceRow], insertIndex);
    } else {
      sourceRow.get('parentMischId')?.setValue(null);
      sourceRow.get('parentGruppeId')?.setValue(null);
      if (sourceGroupIndex === targetGroupIndex) {
        const existing = this.extractRowBlock(sourceRows, sourceRow);
        this.removeControls(sourceRows, new Set(existing.map((ctrl) => ctrl.value.id)));
        const insertIndex = sourceRowIndex < targetRowIndex ? targetRowIndex - existing.length + 1 : targetRowIndex;
        this.insertDragControls(targetRows, [sourceRow], insertIndex);
      } else {
        this.getRows(sourceGroupIndex).removeAt(sourceRowIndex);
        this.insertDragControls(targetRows, [sourceRow], targetRowIndex);
      }
    }

    this.syncState();
    this.draggedRowData = null;
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
      rows.forEach((r) => {
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
        haschange: true,
      },
    });
  }
}
