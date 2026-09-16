import { Injectable, inject } from '@angular/core';
import { StateService } from './state';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AngebotService {
  private readonly state = inject(StateService);
  private readonly apiUrl = environment.apiUrl;

  async save(angebot = this.state.value.angebot): Promise<void> {
    console.log(angebot);
    const res = await fetch(`${this.apiUrl}/angebot/save`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(angebot),
      
    });

    if (!res.ok) {
      throw new Error(`Speichern fehlgeschlagen: ${res.status}`);
    }

    
      
  }

  async createPDF(): Promise<void> {
    const res = await fetch(`${this.apiUrl}/offer/create`, {
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