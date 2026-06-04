import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private http = inject(HttpClient);

  checkAuth() {
    return this.http.get('http://localhost:8080/auth/status', {
      withCredentials: true,
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
      'http://localhost:8080/login',
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
      'http://localhost:8080/refresh',
      {},
      {
        withCredentials: true,
      },
    );
  }

  logout() {
    this.loggedIn = false;
    return this.http.post(
      'http://localhost:8080/logout',
      {},
      {
        withCredentials: true,
      },
    );
  }
}
