import { Injectable, signal } from '@angular/core';
import { Kunde } from '../angebotserstellung.types';

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
      const res  = await fetch('/api/kunden');
      const data = await res.json();
      if (!res.ok) return;
      this.kunden.set(
        data.map((k: any) => ({ ...k, id: String(k.id ?? k.ID ?? ''), name: k.name ?? k.Name ?? '' }))
      );
    } catch (e) { console.warn('kunden load failed', e); }
  }

  private async loadVorlagen(): Promise<void> {
    try {
      const res  = await fetch('/api/vorlagen');
      const data = await res.json();
      if (!res.ok) return;
      this.vorlageneinleitung.set([...data.einleitung]);
      this.vorlagenschluss.set([...data.schluss]);
    } catch (e) { console.warn('vorlagen load failed', e); }
  }

  private async loadObjekte(): Promise<void> {
    try {
      const res = await fetch('/api/objekte');
      if (!res.ok) return;
      const data       = await res.json();
      this.allObjekte  = [...data.objekte];
      this.objekte.set([...this.allObjekte]);
    } catch (e) { console.warn('objekte load failed', e); }
  }

  private async loadProjekte(): Promise<void> {
    try {
      const res = await fetch('/api/projekte');
      if (!res.ok) return;
      this.allProjekte = await res.json();
      this.projekte.set([...this.allProjekte]);
    } catch (e) { console.warn('projekte load failed', e); }
  }

  private async loadAnsprechpartner(): Promise<void> {
    try {
      const res = await fetch('/api/ansprechpartner');
      if (!res.ok) return;
      this.allAnsprechpartner = await res.json();
      this.ansprechpartner.set([...this.allAnsprechpartner]);
    } catch (e) { console.warn('ansprechpartner load failed', e); }
  }
}