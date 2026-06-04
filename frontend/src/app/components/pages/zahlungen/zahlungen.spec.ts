import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZahlungenComponent } from './zahlungen';

describe('ZahlungenComponent', () => {
  let component: ZahlungenComponent;
  let fixture: ComponentFixture<ZahlungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZahlungenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZahlungenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
