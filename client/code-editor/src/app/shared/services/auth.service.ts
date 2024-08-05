import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private jwtHelper = new JwtHelperService();
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
        })
      );
  }

  register(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  isLoggedIn() {
    const token = this.tokenSubject.value;
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }
}
