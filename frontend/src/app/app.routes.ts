import { Routes } from '@angular/router';
import { DashboardComponent } from './components/pages/dashboard/dashboard';
import { KundeComponent } from './components/pages/kunde/kunde';
import { ObjektverwaltungComponent } from './components/pages/objektverwalung/objektverwalung';
import { ProjekteComponent } from './components/pages/projekte/projekte';
import { TermineComponent } from './components/pages/termine/termine';
import { AngeboteComponent } from './components/pages/angebote/angebote';
import { RechnungenComponent } from './components/pages/rechnungen/rechnungen';
import { AusgabenComponent } from './components/pages/ausgaben/ausgaben';
import { ZahlungenComponent } from './components/pages/zahlungen/zahlungen';
import { KatalogComponent } from './components/pages/katalog/katalog';
import { WartungsuebersichtComponent } from './components/pages/wartungsuebersicht/wartungsuebersicht';
import { EinstellungenComponent } from './components/pages/einstellungen/einstellungen';
import { AngebotserstellungComponent } from './components/pages/angebotserstellung/angebotserstellung';
import { CreateUserComponent } from './components/pages/create-user/create-user';
import { LoginComponent } from './components/login/login';
import { MainLayoutComponent } from './components/pages/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    title: 'Login',
  },

  // Geschützter Bereich
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard',
      },
      {
        path: 'kunde',
        component: KundeComponent,
        title: 'Kunde',
      },
      {
        path: 'objektverwaltung',
        component: ObjektverwaltungComponent,
        title: 'Objektverwaltung',
      },
      {
        path: 'projekte',
        component: ProjekteComponent,
        title: 'Projekte',
      },
      {
        path: 'termine',
        component: TermineComponent,
        title: 'Termine',
      },
      {
        path: 'angebote',
        component: AngeboteComponent,
        title: 'Angebote',
      },
      {
        path: 'rechnungen',
        component: RechnungenComponent,
        title: 'Rechnungen',
      },
      {
        path: 'ausgaben',
        component: AusgabenComponent,
        title: 'Ausgaben',
      },
      {
        path: 'zahlungen',
        component: ZahlungenComponent,
        title: 'Zahlungen',
      },
      {
        path: 'katalog',
        component: KatalogComponent,
        title: 'Katalog',
      },
      {
        path: 'wartungsuebersicht',
        component: WartungsuebersichtComponent,
        title: 'Wartungsübersicht',
      },
      {
        path: 'einstellungen',
        component: EinstellungenComponent,
        title: 'Einstellungen',
      },
      {
        path: 'angebotserstellung',
        component: AngebotserstellungComponent,
        title: 'Angebotserstellung',
      },
      {
        path: 'createuser',
        component: CreateUserComponent,
        title: 'Create User',
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
