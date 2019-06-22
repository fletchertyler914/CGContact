import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginResponse, User } from '../models/login-response.model';
import { environment } from '../../environments/environment';
import { ServicesResponse, Services } from '../models/services.model';
import { filter, switchMap, map, tap, take } from 'rxjs/operators';
import { User as FBUser } from 'firebase';
import { ContactForm } from 'functions/models/contact-form.model';
import { ZinglePayload } from '../models/zingle-payload.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public URL = environment.apiURL;
  public currentUser$ = this.firestore.currentUser$;
  public services: Services[] = [];

  private usertoken$ = this.currentUser$.pipe(
    filter((user: FBUser) => !!user),
    switchMap((user: FBUser) => this.firestore.getUserData()),
    map((user: User) => user.token)
  );

  constructor(private firestore: FirebaseService, private http: HttpClient) {}

  logout() {
    this.firestore.logout();
  }

  signup(token: string) {
    return this.http.get<LoginResponse>(
      `${this.URL}/signup`,
      this.getHttpHeaders(token)
    );
  }

  getServices() {
    this.usertoken$
      .pipe(
        switchMap(token =>
          this.http.get<ServicesResponse>(
            `${this.URL}/services`,
            this.getHttpHeaders(token)
          )
        ),
        tap(
          (servicesResponse: ServicesResponse) =>
            (this.services = servicesResponse.result)
        ),
        take(1)
      )
      .subscribe();
  }

  getHttpHeaders(token: string): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`
      })
    };
  }

  createContact(zinglePayload: string) {
    this.usertoken$
      .pipe(
        switchMap(token =>
          this.http.post<ServicesResponse>(
            `${this.URL}/contacts`,
            {
              serviceId: this.services[0].id,
              payload: zinglePayload
            },
            this.getHttpHeaders(token)
          )
        ),
        take(1)
      )
      .subscribe(value => console.log(value));
  }

  contactFormToJson(payload: ContactForm): string {
    return JSON.stringify({
      channels: [
        {
          channel_type_id: this.services[0].channel_types.find(
            channel => channel.code === 'phone_number'
          ).id,
          value: `+1${payload.phoneNumber}`
        }
      ],
      custom_field_values: [
        {
          custom_field_id: this.services[0].contact_custom_fields.find(
            field => field.code === 'first_name'
          ).id,
          value: payload.firstName
        },
        {
          custom_field_id: this.services[0].contact_custom_fields.find(
            field => field.code === 'last_name'
          ).id,
          value: payload.lastName,
        }
      ]
    });
  }
}
