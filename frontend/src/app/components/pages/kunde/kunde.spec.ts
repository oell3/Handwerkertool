import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KundeComponent } from './kunde';

describe('KundeComponent', () => {
  let component: KundeComponent;
  let fixture: ComponentFixture<KundeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KundeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KundeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
