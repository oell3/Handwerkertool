import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wartungsuebersicht } from './wartungsuebersicht';

describe('Wartungsuebersicht', () => {
  let component: Wartungsuebersicht;
  let fixture: ComponentFixture<Wartungsuebersicht>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wartungsuebersicht],
    }).compileComponents();

    fixture = TestBed.createComponent(Wartungsuebersicht);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
