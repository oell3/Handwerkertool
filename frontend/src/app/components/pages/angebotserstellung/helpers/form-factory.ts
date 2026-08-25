import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { StateService } from '../services/state';

export function createRowGroup(
  fb: FormBuilder,
  state: StateService,
  cdr: ChangeDetectorRef,
  remarkVisible: Set<number>,
  overrides: Partial<any> = {}
): FormGroup {
  const group = fb.group({
    id:            [overrides['id']          ?? state.nextRowId()],
    typ:           [overrides['typ']          ?? 'material', Validators.required],
    bezeichnung:   [overrides['bezeichnung']  ?? ''],
    menge:         [overrides['menge']        ?? 1, Validators.min(0)],
    ek:            [overrides['ek']           ?? 0, Validators.min(0)],
    aufschlag:     [overrides['aufschlag']    ?? 0, Validators.min(0)],
    rabatt:        [overrides['rabatt']       ?? 0, Validators.min(0)],
    einheit:       [overrides['einheit']      ?? 'Stk'],
    mischId:       [overrides['mischId']      ?? null],
    gruppeId:      [overrides['gruppeId']     ?? null],
    parentMischId: [overrides['parentMischId']  ?? null],
    parentGruppeId:[overrides['parentGruppeId'] ?? null],
    collapsed:     [overrides['collapsed']    ?? false],
    remark:        [overrides['remark']       ?? ''],
  });

  const id = group.get('id')!.value as number;
  const MISCH_DISABLE  = ['ek'];
  const GRUPPE_DISABLE = ['ek', 'aufschlag', 'rabatt', 'menge'];

  group.get('typ')!.valueChanges.subscribe((typ) => {
    if (typ === 'misch') {
      MISCH_DISABLE.forEach(f => group.get(f)?.disable({ emitEvent: false }));
      GRUPPE_DISABLE.filter(f => !MISCH_DISABLE.includes(f))
        .forEach(f => group.get(f)?.enable({ emitEvent: false }));
    } else if (typ === 'gruppe') {
      GRUPPE_DISABLE.forEach(f => group.get(f)?.disable({ emitEvent: false }));
      group.get('remark')?.setValue('', { emitEvent: false });
      remarkVisible.delete(id);
    } else {
      GRUPPE_DISABLE.forEach(f => group.get(f)?.enable({ emitEvent: false }));
    }
    cdr.markForCheck();
  });

  return group;
}

export function createGroupGroup(
  fb: FormBuilder,
  state: StateService,
  cdr: ChangeDetectorRef,
  remarkVisible: Set<number>,
  overrides: Partial<any> = {}
): FormGroup {
  const id = overrides['id'] ?? state.nextGroupId();
  return fb.group({
    Gruppen_nr:        [id],
    Sortierung:        [overrides['sortierung'] ?? 0],
    name:      [overrides['name'] ?? `Leistungsgruppe ${id}`, Validators.required],
    collapsed: [overrides['collapsed'] ?? false],
    rows: fb.array([createRowGroup(fb, state, cdr, remarkVisible)]),
  });
}