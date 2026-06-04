import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KatalogComponent } from './katalog';

describe('KatalogComponent', () => {
  let component: KatalogComponent;
  let fixture: ComponentFixture<KatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KatalogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KatalogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
