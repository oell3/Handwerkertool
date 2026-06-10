import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayoutComponent } from './main-layout';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should contain router outlet', () => {
      const fixture = TestBed.createComponent(MainLayoutComponent);
  fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.container')).not.toBeNull();
  expect(compiled.querySelector('.container-left')).not.toBeNull();
  expect(compiled.querySelector('.container-right')).not.toBeNull();
  });
});
