import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermineComponent } from './termine';

describe('TermineComponent', () => {
  let component: TermineComponent;
  let fixture: ComponentFixture<TermineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TermineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
