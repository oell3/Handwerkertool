import { Injectable, signal } from '@angular/core';
import { Kunde, Projekte, Ansprechpartner } from '../angebotserstellung.types';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DataLoaderService {
  kunden        = signal<Kunde[]>([]);
  ansprechpartner = signal<any[]>([]);
  objekte       = signal<any[]>([]);
  projekte      = signal<any[]>([]);
  vorlagenschluss    = signal<any[]>([]);
  vorlageneinleitung = signal<any[]>([]);

  private allObjekte: any[]          = [];
  private allProjekte: any[]         = [];
  private allAnsprechpartner: any[]  = [];

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {};
 
  async loadAll(): Promise<void> {
    await Promise.all([
      this.loadKunden(),
      this.loadVorlagen(),
      this.loadObjekte(),
      this.loadProjekte(),
      this.loadAnsprechpartner(),
    ]);
  }

  filterByKunde(kundenId: string | null): void {
    if (!kundenId) {
      this.objekte.set([...this.allObjekte]);
      this.projekte.set([...this.allProjekte]);
      this.ansprechpartner.set([...this.allAnsprechpartner]);
      return;
    }

    const id = String(kundenId);
    this.objekte.set(this.allObjekte.filter(o => String(o.kunden_id) === id));
    this.projekte.set(this.allProjekte.filter(p => String(p.kunden_id) === id));
    this.ansprechpartner.set(this.allAnsprechpartner.filter(a => String(a.kunden_id) === id));
  }

  private async loadKunden(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<Kunde[]>(`${this.apiUrl}/kunden`)
      );
      this.kunden.set(
        data
          .filter((k) => k?.id != null || k?.ID != null)
          .map((k: Kunde) => ({
            ...k,
            id: String(k.id ?? k.ID ?? ''),
            name: k.name ?? k.Name ?? '',
          }))
      );
    } catch (e) { console.error('kunden load failed', e); }
  }

  private async loadVorlagen(): Promise<void> {
  try {
    const [schluss, einleitung] = await Promise.all([
      firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/vorlagen/schluss`)),
      firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/vorlagen/einleitung`)),
    ]);
    this.vorlagenschluss.set(schluss);
    this.vorlageneinleitung.set(einleitung);
  } catch (e) {
    console.error('Vorlagen load failed', e);
  }
}

  private async loadObjekte(): Promise<void> {
  try {
    const data = await firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/objekte`)
    );
    this.allObjekte = data;   // ← wichtig für filterByKunde()
    this.objekte.set(data);
  } catch (e) {
    console.error('Objekte load failed', e);
  }
}

  private async loadProjekte(): Promise<void> {
    try {
      const data = await firstValueFrom(
      this.http.get<Projekte[]>(`${this.apiUrl}/kunden/angebot`)
    );
    this.projekte.set(
    data.map((k: Projekte) => ({
              ...k,
              id: String(k.id ?? k.ID ?? '')
                            })))
    } catch (e) { console.error('Projekte load failed', e); }
  }

  private async loadAnsprechpartner(): Promise<void> {
    try {
    const data = await firstValueFrom(
      this.http.get<Ansprechpartner[]>(`${this.apiUrl}/ansprechpartner`)
    );
    this.ansprechpartner.set(
      data.map((k: Ansprechpartner) => ({
        ...k,
        id: String(k.id ?? k.ID ?? ''),
      }))
    );
  } catch (e) {
    console.error('Ansprechpartner load failed', e);
  }
}
//testss
}