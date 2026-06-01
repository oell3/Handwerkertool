import { Routes } from '@angular/router';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { Kunde } from './components/pages/kunde/kunde';
import { Objektverwalung } from './components/pages/objektverwalung/objektverwalung';
import { Projekte } from './components/pages/projekte/projekte';
import { Termine } from './components/pages/termine/termine';
import { Angebote } from './components/pages/angebote/angebote';
import { Rechnungen } from './components/pages/rechnungen/rechnungen';
import { Ausgaben } from './components/pages/ausgaben/ausgaben';
import { Zahlungen } from './components/pages/zahlungen/zahlungen';
import { Katalog } from './components/pages/katalog/katalog';
import { Wartungsuebersicht } from './components/pages/wartungsuebersicht/wartungsuebersicht';
import { Einstellungen } from './components/pages/einstellungen/einstellungen';
import { Angebotserstellung } from './components/pages/angebotserstellung/angebotserstellung';
import { CreateUser } from './components/pages/create-user/create-user';
import { Login } from './components/login/login';
import { MainLayout } from './components/pages/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: "",
        component: Login,
        title: "Login"
    },

    // Geschützter Bereich
  {
    path: '',
    component: MainLayout,
    canActivate:[authGuard],
    canActivateChild:[authGuard],
    children: [
     {
        path: "dashboard",
        component: Dashboard,
        title: "Dashboard"
    },
    {
        path: "kunde",
        component: Kunde,
        title: "Kunde"
    },
     {
        path: "objektverwaltung",
        component: Objektverwalung,
        title: "Objektverwaltung"
    },
     {
        path: "projekte",
        component: Projekte,
        title: "Projekte"
    },
     {
        path: "termine",
        component: Termine,
        title: "Termine"
    },
     {
        path: "angebote",
        component: Angebote,
        title: "Angebote"
    },
     {
        path: "rechnungen",
        component: Rechnungen,
        title: "Rechnungen"
    },
     {
        path: "ausgaben",
        component: Ausgaben,
        title: "Ausgaben"
    },
     {
        path: "zahlungen",
        component: Zahlungen,
        title: "Zahlungen"
    },
     {
        path: "Katalog",
        component: Katalog,
        title: "Katalog"
    },
     {
        path: "wartungsuebersicht",
        component: Wartungsuebersicht,
        title: "Wartungsübersicht"
    },
     {
        path: "einstellungen",
        component: Einstellungen,
        title: "Einstellungen"
    },
     {
        path: "angebotserstellung",
        component: Angebotserstellung,
        title: "Angebotserstellung"
    },
    {
        path: "createuser",
        component: CreateUser,
        title: "Create User"
    }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];
