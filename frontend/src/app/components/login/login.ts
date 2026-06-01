import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { AuthService } from '../../service/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
    email = '';
  password = '';

  login() {
    console.log('Test');

    this.authService.login(
        this.email,
        this.password
    ).subscribe({

        next: () => {

            this.router.navigate(['/dashboard']);

        },

        error: (err) => {

            console.log(err);

        }

    });

}
}
