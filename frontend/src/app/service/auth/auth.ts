import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private http = inject(HttpClient);

  checkAuth() {
    return this.http.get('https://localhost:7036/api/auth/status', {
      withCredentials: true
    });
  }

  setLoggedIn(value: boolean) {
    this.loggedIn = value;
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  login(email: string, password: string) {
    return this.http.post(
      'https://localhost:7036/api/user/login',
      {
        email,
        password,
      },
      {
        withCredentials: true,
      },
    );
  }

  refresh() {
    return this.http.post(
      'https://localhost:7036/api/user/refresh',
      {},
      {
        withCredentials: true,
      },
    );
  }

  logout() {
    this.loggedIn = false;
    return this.http.post(
      'https://localhost:7036/api/user/logout',
      {},
      {
        withCredentials: true,
      },
    );
  }
}
