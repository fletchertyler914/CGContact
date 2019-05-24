import { Injectable, OnDestroy, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContactForm } from '../models/contact-form.model';
import { DayPreference } from '../models/day-preference.model';
import { Services, Result } from '../models/services.model';
import { CreateContact } from '../models/create-contact.model';

import { map, filter, withLatestFrom, take, takeUntil, tap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, BehaviorSubject, throwError, of } from 'rxjs';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { LoginResponse } from '../models/login-response.model';

//   const services = Convert.toServices(json);
//   const createContact = Convert.toCreateContact(json);

@Injectable({
  providedIn: 'root'
})
export class ZingleService implements OnDestroy {
  public URL = 'https://api.zingle.me/v1';
  public loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(!!this.storage.get('TOKEN'));
  private destroy$: Subject<boolean>;

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService, private http: HttpClient) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  login(token: string) {
    return this.http.get<LoginResponse>(this.URL, this.getHttpHeaders(token));
  }

  logout() {
    this.loggedIn$.next(false);
    this.storage.remove('TOKEN');
    this.storage.remove('USER');
  }

  createContact(serviceId: string, payload: ContactForm) {
    const url = `${this.URL}/services/${serviceId}/contacts`;
    
    this.http
      .post<CreateContact>(
        url,
        this.contactFormToJson(payload),
        this.getHttpHeaders(this.storage.get('TOKEN'))
      )
      .subscribe((result: CreateContact) => {
        console.log(result);
        if (result.status && result.status.status_code === 200) {
          const contactResult = result.result;
          console.log(contactResult);
        }
      });
  }

  getSelectedDayTags(daysSelected: DayPreference[]): string[] {
    const tags: string[] = [];

    daysSelected.forEach((day: DayPreference) => {
      if (day.selected) {
        tags.push(day.dayLong.concat('_', this.getPeriod(day)));
      }
    });

    return tags;
  }

  getPeriod(day: DayPreference): string {
    if (day.period === 'Morning') {
      return 'Morning';
    } else if (day.period === 'Mid Day') {
      return 'MidDay';
    } else if (day.period === 'Evening') {
      return 'Evening';
    }
  }

  getServicesIdByName(name: string): Observable<string> {
    const httpHeader = this.getHttpHeaders(this.storage.get('TOKEN'));

    return this.http
      .get<Services>(`${this.URL}/services`, httpHeader)
      .pipe(
        map((services: Services) => services.result),
        map((services: Result[]) =>
          services.find(service => service.business_name === name)
        ),
        map((services: Result) => services.id)
      );
  }

  getHttpHeaders(token: string): { headers: HttpHeaders } {
    return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Basic ${token}`
        })
      };
  }

  contactFormToJson(payload: ContactForm) {
    return JSON.stringify({
      channels: [
        {
          channel_type_id: '0a293ea3-4721-433e-a031-610ebcf43255',
          value: `+1${payload.phoneNumber}`
        }
      ],
      custom_field_values: [
        {
          value: Date.now(),
          custom_field_id: 'de4dc434-2e32-4121-a06d-8fbedf10f6cb'
        },
        {
          value: payload.firstName,
          custom_field_id: 'e01a3856-89b1-4db4-bf56-38d79454c921'
        },
        {
          value: payload.lastName,
          custom_field_id: '0df80524-3b27-4fb0-8eeb-c81bd448d294'
        }
      ]
    });
  }
}
