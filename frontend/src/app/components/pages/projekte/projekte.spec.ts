import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjekteComponent } from './projekte';

describe('ProjekteComponent', () => {
  let component: ProjekteComponent;
  let fixture: ComponentFixture<ProjekteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjekteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjekteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
