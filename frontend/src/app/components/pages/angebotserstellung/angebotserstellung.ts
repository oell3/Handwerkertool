import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  OnInit, AfterViewInit, inject,
} from '@angular/core';
import {
  AbstractControl, FormArray, FormBuilder,
  FormGroup, ReactiveFormsModule,
} from '@angular/forms';

import { AngebotService }    from './services/angebot.service';
import { CalculatorService } from './services/calculator';
import { StateService }      from './services/state';
import { DataLoaderService } from './services/data-loader.service';
import { DraggedRowData }    from './angebotserstellung.types';
import { createRowGroup, createGroupGroup } from './helpers/form-factory';

@Component({
  selector: 'app-angebotserstellung',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './angebotserstellung.html',
  styleUrls: ['./angebotserstellung.scss'],
})
export class AngebotserstellungComponent implements OnInit, AfterViewInit {
  private readonly fb             = inject(FormBuilder);
  private readonly state          = inject(StateService);
  private readonly calculator     = inject(CalculatorService);
  private readonly angebotService = inject(AngebotService);
  private readonly cdr            = inject(ChangeDetectorRef);
  readonly loader                 = inject(DataLoaderService);

  // Signals direkt vom Service exponieren
  get kunden()             { return this.loader.kunden; }
  get ansprechpartner()    { return this.loader.ansprechpartner; }
  get objekte()            { return this.loader.objekte; }
  get projekte()           { return this.loader.projekte; }
  get vorlageneinleitung() { return this.loader.vorlageneinleitung; }
  get vorlagenschluss()    { return this.loader.vorlagenschluss; }

  form!: FormGroup;
  remarkVisible = new Set<number>();

  // Drag-State
  private draggedRowData: DraggedRowData | null = null;
  private draggedGroupId: number | null = null;
  dragOverGroupId: number | null = null;
  dragOverRowId:   number | null = null;

  // Kosten-Summen
  materialKosten  = 0;
  lohnKosten      = 0;
  sonstigeKosten  = 0;

  private einleitungQuill: any = null;
  private schlussQuill: any    = null;

  typeOptions = [
    { value: 'material',   label: 'Material' },
    { value: 'lohn',       label: 'Lohn' },
    { value: 'sonstiges',  label: 'Sonstiges' },
    { value: 'misch',      label: 'Mischposition' },
    { value: 'gruppe',     label: 'Gruppe' },
  ];

  // ─── Lifecycle ───────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();

    this.form.valueChanges.subscribe(() => {
      this.syncState();
      this.computeKosten();
    });

    if (this.groups.length === 0) this.addGroup();

    this.setupVorlagenListeners();
    this.loader.loadAll();

    this.form.get('kundenId')?.valueChanges.subscribe((id) => {
      this.form.patchValue(
        { objektId: null, projektId: null, ansprechpartnerId: null },
        { emitEvent: false }
      );
      this.loader.filterByKunde(id);
    });
  }

  ngAfterViewInit(): void {
    this.initQuillEditors();
  }

  // ─── Form ────────────────────────────────────────────────────

  get groups(): FormArray {
    return this.form.get('groups') as FormArray;
  }

  getRows(groupIndex: number): FormArray {
    return this.groups.at(groupIndex).get('rows') as FormArray;
  }

  getRowsFromGroup(group: AbstractControl): FormArray {
    return group.get('rows') as FormArray;
  }

  private buildForm(): void {
    const groups = this.state.value.angebot.groups.map((group) =>
      this.fb.group({
        sortierung:        [group.sortierung],
        name:      [group.name || `Leistungsgruppe ${group.sortierung}`],
        collapsed: [group.collapsed ?? false],
        rows: this.fb.array(
          group.rows.map((row) =>
            createRowGroup(this.fb, this.state, this.cdr, this.remarkVisible, row)
          )
        ),
      })
    );
    //test
    this.form = this.fb.group({
      title:               [this.state.value.angebot.title || ''],
      einleitung:          [this.state.value.angebot.einleitung || ''],
      schluss:             [this.state.value.angebot.schluss || ''],
      kundenId:            [(this.state.value.angebot as any).kundenId || null],
      objektId:            [(this.state.value.angebot as any).objektId || null],
      projektId:           [(this.state.value.angebot as any).projektId || null],
      anrede:              [(this.state.value.angebot as any).anrede || ''],
      ansprechpartnerId:   [(this.state.value.angebot as any).ansprechpartnerId || null],
      vorlageEinleitungId: [(this.state.value.angebot as any).vorlageEinleitungId || null],
      vorlageSchlussId:    [(this.state.value.angebot as any).vorlageSchlussId || null],
      groups: this.fb.array(groups),
    });
  }

  private createRow(overrides: Partial<any> = {}): FormGroup {
    return createRowGroup(this.fb, this.state, this.cdr, this.remarkVisible, overrides);
  }

  private createGroup(): FormGroup {
    return createGroupGroup(this.fb, this.state, this.cdr, this.remarkVisible);
  }

  // ─── Group-Operationen ───────────────────────────────────────

  addGroup(): void                   { this.groups.push(this.createGroup()); this.syncState(); }
  removeGroup(i: number): void        { this.groups.removeAt(i); this.syncState(); }
  toggleGroup(i: number): void        {
    const g = this.groups.at(i);
    const collapsed = g.get('collapsed');
collapsed?.setValue(!collapsed.value);
    this.syncState();
  }

  // ─── Row-Operationen ─────────────────────────────────────────

  addRow(groupIndex: number): void                       { this.getRows(groupIndex).push(this.createRow()); this.syncState(); }
  addRowFromGroup(group: AbstractControl): void           { this.getRowsFromGroup(group).push(this.createRow()); this.syncState(); }
  toggleRemark(rowId: number): void                      {
    this.remarkVisible.has(rowId) ? this.remarkVisible.delete(rowId) : this.remarkVisible.add(rowId);
    this.cdr.markForCheck();
  }
  isRemarkVisible(rowId: number):  boolean           { return this.remarkVisible.has(rowId); }
  isMixChild(row: any):            boolean           { return row?.parentMischId != null; }
  isGroupChild(row: any):          boolean           { return row?.parentGruppeId != null; }
  isChildRow(row: any):            boolean           { return this.isMixChild(row) || this.isGroupChild(row); }
  isDragOver(gId: number, rId: number): boolean      { return this.dragOverGroupId === gId && this.dragOverRowId === rId; }

  toggleRowCollapse(groupId: number, rowId: number): void {
    const gi = this.findGroupIndexById(groupId);
    const ri = this.findRowIndexById(gi, rowId);
    if (gi < 0 || ri < 0) return;
    const row = this.getRows(gi).at(ri);
    row.get('collapsed')?.setValue(!row.get('collapsed')?.value);
    this.syncState();
  }

  removeRow(groupIndex: number, rowIndex: number): void {
    const rows = this.getRows(groupIndex);
    const row  = rows.at(rowIndex).value;
    if (row.typ === 'misch' || row.typ === 'gruppe') {
      this.removeControls(rows, this.collectLinkedRowIds(rows, row));
    } else {
      rows.removeAt(rowIndex);
    }
    this.syncState();
  }

  removeRowFromGroupById(groupId: number, rowId: number): void {
    const gi = this.findGroupIndexById(groupId);
    const ri = this.findRowIndexById(gi, rowId);
    if (gi < 0 || ri < 0) return;
    this.removeRow(gi, ri);
  }

  removeRowFromGroup(group: AbstractControl, rowIndex: number): void {
    const rows = this.getRowsFromGroup(group);
    const row  = rows.at(rowIndex).value;
    if (row.typ === 'misch' || row.typ === 'gruppe') {
      this.removeControls(rows, this.collectLinkedRowIds(rows, row));
    } else {
      rows.removeAt(rowIndex);
    }
    this.syncState();
  }

  getChildRowControls(group: AbstractControl, parentRow: AbstractControl): FormGroup[] {
    return (group.get('rows') as FormArray).controls.filter(
      (c) => c.value.parentMischId === parentRow.value.id || c.value.parentGruppeId === parentRow.value.id,
    ) as FormGroup[];
  }

  // ─── Berechnungen ────────────────────────────────────────────

  calculateRow(control: AbstractControl, group?: AbstractControl): { ep: number; gp: number } {
    const row = control.value;
    if (row.typ === 'misch' && group) {
      const totalGp = this.getChildRowControls(group, control)
        .reduce((sum, child) => sum + this.calculateChildRow(child, control).gp, 0);
      const mischMenge = Number(row.menge || 0);
      return { ep: Number((mischMenge ? totalGp / mischMenge : 0).toFixed(2)), gp: Number(totalGp.toFixed(2)) };
    }
    const menge = Number(row.menge || 0);
    const ek    = Number(row.ek    || 0);
    let ep = ek + ek * (Number(row.aufschlag || 0) / 100);
    ep    -= ep * (Number(row.rabatt    || 0) / 100);
    return { ep: Number(ep.toFixed(2)), gp: Number((ep * menge).toFixed(2)) };
  }

  calculateChildRow(childCtrl: AbstractControl, parentCtrl: AbstractControl): { ep: number; gp: number } {
    const child      = childCtrl.value;
    const mischMenge = Number(parentCtrl.value.menge || 0);
    const menge      = Number(child.menge     || 0);
    const ek         = Number(child.ek        || 0);
    let ep = ek + ek * (Number(child.aufschlag || 0) / 100);
    ep    -= ep * (Number(child.rabatt         || 0) / 100);
    return { ep: Number(ep.toFixed(2)), gp: Number((ep * menge * mischMenge).toFixed(2)) };
  }

  getGroupTotal(groupIndex: number): number {
    return this.getRows(groupIndex).controls.reduce((sum, ctrl) => {
      if (ctrl.value.parentMischId != null) return sum;
      return sum + this.calculateRow(ctrl, this.groups.at(groupIndex)).gp;
    }, 0);
  }

  getGroupTotalFromGroup(group: AbstractControl): number {
    return this.getRowsFromGroup(group).controls.reduce((sum, ctrl) => {
      if (ctrl.value.parentMischId != null) return sum;
      return sum + this.calculateRow(ctrl, group).gp;
    }, 0);
  }

  getGrandTotal(): number {
    return this.groups.controls.reduce((sum, _, i) => sum + this.getGroupTotal(i), 0);
  }

  getRowDisplayNumber(group: AbstractControl, rowId: number): number {
    let counter = 0;
    for (const ctrl of this.getRowsFromGroup(group).controls) {
      if (ctrl.value.typ === 'gruppe') continue;
      counter++;
      if (ctrl.value.id === rowId) return counter;
    }
    return counter;
  }

  computeKosten(): void {
    let material = 0, lohn = 0, sonstiges = 0;

    this.groups.controls.forEach((groupCtrl) => {
      (groupCtrl.get('rows') as FormArray).controls.forEach((r) => {
        const val = r.value;
        if (val.typ === 'misch') {
          const mischMenge = Number(val.menge || 0);
          (groupCtrl.get('rows') as FormArray).controls
            .filter(c => c.value.parentMischId === val.id)
            .forEach((child) => {
              const kosten = mischMenge * Number(child.value.menge || 0) * Number(child.value.ek || 0);
              if (child.value.typ === 'material')  material  += kosten;
              else if (child.value.typ === 'lohn') lohn      += kosten;
              else                                 sonstiges += kosten;
            });
        } else if (val.parentMischId == null && val.parentGruppeId == null && val.typ !== 'gruppe') {
          const kosten = Number(val.menge || 0) * Number(val.ek || 0);
          if (val.typ === 'material')  material  += kosten;
          else if (val.typ === 'lohn') lohn      += kosten;
          else if (val.typ === 'sonstiges') sonstiges += kosten;
        }
      });
    });

    this.materialKosten  = material;
    this.lohnKosten      = lohn;
    this.sonstigeKosten  = sonstiges;
  }

  // ─── Drag & Drop ─────────────────────────────────────────────

  onGroupDragStart(event: DragEvent, groupId: number): void {
    this.draggedGroupId = groupId;
    event.dataTransfer?.setData('text/plain', 'group');
    event.dataTransfer!.effectAllowed = 'move';
  }

  onGroupDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onGroupDrop(event: DragEvent, targetGroupId: number): void {
    event.preventDefault();
    if (this.draggedGroupId == null || this.draggedGroupId === targetGroupId) return;
    const si = this.findGroupIndexById(this.draggedGroupId);
    const ti = this.findGroupIndexById(targetGroupId);
    if (si < 0 || ti < 0) return;
    const ctrl = this.groups.at(si);
    this.groups.removeAt(si);
    this.groups.insert(si < ti ? ti : ti, ctrl);
    this.syncState();
    this.draggedGroupId = null;
  }

  onRowDragStart(event: DragEvent, groupId: number, rowId: number): void {
  const gi = this.findGroupIndexById(groupId);
  const ri = this.findRowIndexById(gi, rowId);
  this.draggedRowData = { groupId, rowId, typ: this.getRows(gi).at(ri).value.typ };
  event.dataTransfer?.setData('text/plain', 'row');
  event.dataTransfer!.effectAllowed = 'move';
}

  onRowDragOver(event: DragEvent, groupId?: number, rowId?: number): void {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  if (this.dragOverGroupId !== (groupId ?? null) || this.dragOverRowId !== (rowId ?? null)) {
    this.dragOverGroupId = groupId ?? null;
    this.dragOverRowId   = rowId   ?? null;
    this.cdr.markForCheck();
  }
}

  onRowDragLeave(event: DragEvent): void {
  const related = event.relatedTarget as HTMLElement;
  if (!related || !related.closest('tr')) {
    this.dragOverGroupId = null;
    this.dragOverRowId   = null;
  }
  this.cdr.markForCheck();
}


  onRowDragEnd(): void {
    this.draggedRowData  = null;
    this.dragOverGroupId = null;
    this.dragOverRowId   = null;
    this.cdr.markForCheck();
  }

  onRowDropToGroup(event: DragEvent, targetGroupId: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.draggedRowData) return;

    const sgi = this.findGroupIndexById(this.draggedRowData.groupId);
    const tgi = this.findGroupIndexById(targetGroupId);
    if (sgi < 0 || tgi < 0) return;

    const sourceRows  = this.getRows(sgi);
    const sri         = this.findRowIndexById(sgi, this.draggedRowData.rowId);
    if (sri < 0) return;

    const sourceRow  = sourceRows.at(sri);
    const targetRows = this.getRows(tgi);
    const NO_EMIT    = { emitEvent: false };

    if (this.draggedRowData.typ === 'misch' || this.draggedRowData.typ === 'gruppe') {
      const block = this.extractRowBlock(sourceRows, sourceRow);
      this.removeControls(sourceRows, new Set(block.map(c => c.value.id)), NO_EMIT);
      this.moveControls(targetRows, block, targetRows.length, NO_EMIT);
    } else {
      sourceRow.get('parentMischId')?.setValue(null, NO_EMIT);
      sourceRow.get('parentGruppeId')?.setValue(null, NO_EMIT);
      sourceRows.removeAt(sri, NO_EMIT);
      targetRows.insert(targetRows.length, sourceRow, NO_EMIT);
    }

    this.syncState();
    this.computeKosten();
    this.cdr.markForCheck();
    this.draggedRowData = null;
  }


onRowDrop(event: DragEvent, targetGroupId: number, targetRowId: number): void {
  event.preventDefault();
  event.stopPropagation();
  if (!this.draggedRowData) return;

  const sgi = this.findGroupIndexById(this.draggedRowData.groupId);
  const tgi = this.findGroupIndexById(targetGroupId);
  if (sgi < 0 || tgi < 0) return;

  const sourceRows = this.getRows(sgi);
  const targetRows = this.getRows(tgi);
  const sri        = this.findRowIndexById(sgi, this.draggedRowData.rowId);
  let tri        = this.findRowIndexById(tgi, targetRowId);
  if (sri < 0 || tri < 0) return;

  const NO_EMIT   = { emitEvent: false };
  const sourceRow = sourceRows.at(sri);

  // Entferne die gezogene Zeile aus der Quellgruppe
  if (sourceRow.value.typ === 'misch' || sourceRow.value.typ === 'gruppe') {
    const block = this.extractRowBlock(sourceRows, sourceRow);
    const blockIds = new Set<number>(block.map(c => c.value.id));
    this.removeControls(sourceRows, blockIds, NO_EMIT);
    let insertIndex = tri;
    if (sgi === tgi && sri < tri) insertIndex -= block.length;
    this.moveControls(targetRows, block, Math.max(0, insertIndex), NO_EMIT);
  } else {
    // Entferne die Zeile aus der Quellgruppe
    sourceRows.removeAt(sri, NO_EMIT);
    if (sgi === tgi && sri < tri) tri--;

    // Bestimme den Einfügeindex
    const targetVal = targetRows.at(tri).value;
    let insertIndex: number;

    if (targetVal.typ === 'misch' || targetVal.typ === 'gruppe') {
      const childIds = this.collectLinkedRowIds(targetRows, targetVal);
      let lastChildIdx = tri;
      targetRows.controls.forEach((ctrl, idx) => {
        if (idx > tri && childIds.has(ctrl.value.id)) lastChildIdx = idx;
      });
      insertIndex = lastChildIdx + 1;
    } else {
      insertIndex = tri;
    }

    // Füge die Zeile an der Zielposition ein
    if (targetVal.typ === 'misch') {
      sourceRow.get('parentMischId')?.setValue(targetVal.id, NO_EMIT);
      sourceRow.get('parentGruppeId')?.setValue(null, NO_EMIT);
    } else if (targetVal.typ === 'gruppe') {
      sourceRow.get('parentMischId')?.setValue(null, NO_EMIT);
      sourceRow.get('parentGruppeId')?.setValue(targetVal.id, NO_EMIT);
    } else {
      const tMisch = targetVal.parentMischId ?? null;
      const tGruppe = targetVal.parentGruppeId ?? null;
     sourceRow.get('parentMischId')?.setValue(tMisch, NO_EMIT);
      sourceRow.get('parentGruppeId')?.setValue(tGruppe, NO_EMIT);
    }

    targetRows.insert(Math.max(0, insertIndex), sourceRow, NO_EMIT);
  }

  this.syncState();
  this.computeKosten();
  this.cdr.markForCheck();
  this.draggedRowData = null;
}

  // ─── Aktionen ────────────────────────────────────────────────

  async saveOffer(): Promise<void> {
    try {
      this.syncState();
      await this.angebotService.save(this.state.value.angebot);
      alert('Angebot wurde gespeichert.');
    } catch (e) {
      console.error(e);
      alert('Angebot konnte nicht gespeichert werden.');
    }
  }

  async createPdf(): Promise<void> {
    try {
      this.syncState();
      await this.angebotService.createPDF();
    } catch (e) {
      console.error(e);
      alert('PDF konnte nicht erstellt werden.');
    }
  }

  goBack(): void { window.history.back(); }

  // ─── Private Hilfsmethoden ───────────────────────────────────

  private findGroupIndexById(id: number): number {
    return this.groups.controls.findIndex(g => g.value.id === id);
  }

  private findRowIndexById(gi: number, rowId: number): number {
    return this.getRows(gi).controls.findIndex(r => r.value.id === rowId);
  }

  private collectLinkedRowIds(rows: FormArray, rootRow: any): Set<number> {
    const ids = new Set<number>([rootRow.id]);
    let added = true;
    while (added) {
      added = false;
      rows.controls.forEach((ctrl) => {
        const r = ctrl.value;
        if (!ids.has(r.id) &&
          ((r.parentMischId  != null && ids.has(r.parentMischId))  ||
           (r.parentGruppeId != null && ids.has(r.parentGruppeId)))) {
          ids.add(r.id);
          added = true;
        }
      });
    }
    return ids;
  }

  private extractRowBlock(rows: FormArray, rootRow: AbstractControl): AbstractControl[] {
    const ids = this.collectLinkedRowIds(rows, rootRow.value);
    return rows.controls.filter(c => ids.has(c.value.id));
  }

  private removeControls(rows: FormArray, ids: Set<number>, options = { emitEvent: true }): void {
    rows.controls
      .map((c, i) => ids.has(c.value.id) ? i : -1)
      .filter(i => i >= 0)
      .sort((a, b) => b - a)
      .forEach(i => rows.removeAt(i, options));
  }

  private moveControls(rows: FormArray, controls: AbstractControl[], insertIndex: number, options = { emitEvent: true }): void {
    controls.forEach((ctrl, offset) => rows.insert(insertIndex + offset, ctrl, options));
  }

  private syncState(): void {
    this.state.update({
      angebot: { ...this.state.value.angebot, ...this.form.getRawValue(), haschange: true },
    });
  }

  private setupVorlagenListeners(): void {
    this.form.get('vorlageEinleitungId')?.valueChanges.subscribe((id) => {
      const v = this.loader.vorlageneinleitung().find((x: any) => x.id === id || x.ID === id);
      const val = v?.text || v?.content || '';
      this.form.patchValue({ einleitung: val }, { emitEvent: false });
      if (this.einleitungQuill) this.einleitungQuill.root.innerHTML = val;
    });

    this.form.get('vorlageSchlussId')?.valueChanges.subscribe((id) => {
      const v = this.loader.vorlagenschluss().find((x: any) => x.id === id || x.ID === id);
      const val = v?.text || v?.content || '';
      this.form.patchValue({ schluss: val }, { emitEvent: false });
      if (this.schlussQuill) this.schlussQuill.root.innerHTML = val;
    });
  }

  private initQuillEditors(): void {
    const ein = document.getElementById('einleitungEditor');
    const sch = document.getElementById('schlussEditor');

    const init = (QuillCtor: any) => {
      if (ein) {
        this.einleitungQuill = new QuillCtor(ein, { theme: 'snow' });
        this.einleitungQuill.on('text-change', () => {
          this.form.patchValue({ einleitung: ein.querySelector('.ql-editor')?.innerHTML || '' }, { emitEvent: false });
        });
        this.einleitungQuill.root.innerHTML = this.form.value.einleitung || '';
      }
      if (sch) {
        this.schlussQuill = new QuillCtor(sch, { theme: 'snow' });
        this.schlussQuill.on('text-change', () => {
          this.form.patchValue({ schluss: sch.querySelector('.ql-editor')?.innerHTML || '' }, { emitEvent: false });
        });
        this.schlussQuill.root.innerHTML = this.form.value.schluss || '';
      }
    };

    if (typeof (window as any).Quill !== 'undefined') {
      init((window as any).Quill);
      return;
    }

    import('quill')
      .then((m) => init((m as any).default || m))
      .catch((e) => console.warn('Quill not available', e));
  }
}