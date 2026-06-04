import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjektverwaltungComponent } from './objektverwalung';

describe('Objektverwalung', () => {
  let component: ObjektverwaltungComponent;
  let fixture: ComponentFixture<ObjektverwaltungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjektverwaltungComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ObjektverwaltungComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
