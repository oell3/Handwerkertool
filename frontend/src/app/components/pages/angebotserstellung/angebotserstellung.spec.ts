import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AngebotserstellungComponent } from './angebotserstellung';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Angebotserstellung', () => {
  let component: AngebotserstellungComponent;
  let fixture: ComponentFixture<AngebotserstellungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      
      imports: [ HttpClientTestingModule],
      declarations: [AngebotserstellungComponent],
 providers: [
    provideHttpClientTesting(),
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          paramMap: new Map()
        }
      }
    }
  ]
    }).compileComponents();

    fixture = TestBed.createComponent(AngebotserstellungComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
