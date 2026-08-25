import { Injectable, inject } from '@angular/core';
import { StateService } from './state';

@Injectable({ providedIn: 'root' })
export class AngebotService {
  private readonly state = inject(StateService);

  async save(): Promise<void> {
    console.log(this.state.value.angebot);
    const res = await fetch('https://localhost:7036/api/angebot/save', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.value.angebot),
      
    });

    if (!res.ok) {
      throw new Error(`Speichern fehlgeschlagen: ${res.status}`);
    }

    
      
  }

  async createPDF(): Promise<void> {
    const res = await fetch('/api/offer/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.value.angebot),
    });

    if (!res.ok) {
      throw new Error(`PDF-Erstellung fehlgeschlagen: ${res.status}`);
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Angebot_${this.state.value.angebot.title || 'export'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
}