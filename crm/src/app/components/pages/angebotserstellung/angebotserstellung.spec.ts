import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Angebotserstellung } from './angebotserstellung';

describe('Angebotserstellung', () => {
  let component: Angebotserstellung;
  let fixture: ComponentFixture<Angebotserstellung>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Angebotserstellung],
    }).compileComponents();

    fixture = TestBed.createComponent(Angebotserstellung);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
