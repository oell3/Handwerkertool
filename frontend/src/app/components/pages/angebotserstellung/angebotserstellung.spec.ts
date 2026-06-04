import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngebotserstellungComponent } from './angebotserstellung';

describe('Angebotserstellung', () => {
  let component: AngebotserstellungComponent;
  let fixture: ComponentFixture<AngebotserstellungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngebotserstellungComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AngebotserstellungComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
