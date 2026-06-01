import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterModule],
  templateUrl: './nav.html',
  styleUrls: ['./nav.scss'],
})
export class Nav {
  protected readonly title = signal('Termine');
}
