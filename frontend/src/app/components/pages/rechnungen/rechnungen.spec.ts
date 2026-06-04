import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechnungenComponent } from './rechnungen';

describe('RechnungenComponent', () => {
  let component: RechnungenComponent;
  let fixture: ComponentFixture<RechnungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechnungenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RechnungenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
