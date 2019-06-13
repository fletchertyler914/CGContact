import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginResponse } from '../models/login-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public URL = environment.apiURL;
  public currentUser$ = this.firestore.currentUser$;

  constructor(
    private firestore: FirebaseService,
    private http: HttpClient
  ) { }

  logout() {
    this.firestore.logout();
  }

  signup(token: string) {
    return this.http.get<LoginResponse>(`${this.URL}/signup`, this.getHttpHeaders(token));
  }

  getHttpHeaders(token: string): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`
      })
    };
  }
}
