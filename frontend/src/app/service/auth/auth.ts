import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/$/, '');

  checkAuth() {
    return this.http.get(`${this.apiUrl}/auth/status`, {
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
      `${this.apiUrl}/user/login`,
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
      `${this.apiUrl}/user/refresh`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  logout() {
    this.loggedIn = false;

    return this.http.post(
      `${this.apiUrl}/user/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}