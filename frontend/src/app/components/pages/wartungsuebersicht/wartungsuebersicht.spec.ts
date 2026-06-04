import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WartungsuebersichtComponent } from './wartungsuebersicht';

describe('WartungsuebersichtComponent', () => {
  let component: WartungsuebersichtComponent;
  let fixture: ComponentFixture<WartungsuebersichtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WartungsuebersichtComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WartungsuebersichtComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
