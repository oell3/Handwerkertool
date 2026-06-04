# Testing Guide für Frontend

Dieses Projekt nutzt **vitest** für Unit-Tests mit Angular.

## Installation

Tests-Dependencies sind bereits installiert:
- `vitest` - Test Runner
- `@vitest/ui` - UI für Test-Ergebnisse
- `@vitest/coverage-v8` - Code Coverage Reporting

## Test-Befehle

### Tests ausführen
```bash
npm test
```

### Tests im Watch-Modus (automatischer Reload)
```bash
npm test -- --watch
```

### Tests mit UI
```bash
npm test:ui
```

### Code-Coverage generieren
```bash
npm test:coverage
```

## Test-Struktur

Alle Test-Dateien folgen diesem Pattern:
- `src/**/*.spec.ts` - Unit-Tests
- `src/**/testing/**` - Test-Utilities und Mocks

## Beispiel: Unit-Test schreiben

```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should do something', () => {
    const result = service.myMethod();
    expect(result).toEqual('expected value');
  });
});
```

## Beispiel: Komponenten-Test

```typescript
import { TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

## Best Practices

1. **OnPush Change Detection**: Alle Komponenten sollten OnPush nutzen
2. **TestBed.configureTestingModule**: Immer Module korrekt konfigurieren
3. **async/await**: Für asynchrone Operationen
4. **fixture.whenStable()**: Auf Promise-Auflösung warten

## Troubleshooting

Wenn Tests fehlschlagen:
1. `npm install` - Dependencies neu installieren
2. `npm test -- --reporter=verbose` - Verbose Output
3. ESLint-Fehler überprüfen: `npm run lint`

