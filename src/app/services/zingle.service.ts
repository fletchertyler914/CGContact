import { Injectable, OnDestroy, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContactForm } from '../models/contact-form.model';
import { DayPreference } from '../models/day-preference.model';
import { Services, Result } from '../models/services.model';
import { CreateContact } from '../models/create-contact.model';

import { map, filter, withLatestFrom, take } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, BehaviorSubject } from 'rxjs';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';

//   const services = Convert.toServices(json);
//   const createContact = Convert.toCreateContact(json);

@Injectable({
  providedIn: 'root'
})
export class ZingleService implements OnDestroy {
  public username = 'themotivatedu@gmail.com';
  public password = 'Cgcpt2019';
  public URL = 'https://api.zingle.me/v1';

  private destroy$: Subject<boolean>;
  private token: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private http: HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  login(token: string) {
    //  TODO: Implement Login API To confirm credentials.
    return Observable.create();
  }

  createContact(serviceId: string, payload: ContactForm) {
    const url = `${this.URL}/services/${serviceId}/contacts`;

    console.log(JSON.parse(this.contactFormToJson(payload)));
    console.log(this.contactFormToJson(payload));

    this.http
      .post<CreateContact>(
        url,
        this.contactFormToJson(payload),
        this.getHttpHeaders()
      )
      .subscribe((result: CreateContact) => {
        console.log(result);
        if (result.status && result.status.status_code === 200) {
          const contactResult = result.result;
          console.log(contactResult);
        }
      });
    // ToDo: Wire Up Zingle API
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
    return this.http
      .get<Services>(`${this.URL}/services`, this.getHttpHeaders())
      .pipe(
        map((services: Services) => services.result),
        map((services: Result[]) =>
          services.find(service => service.business_name === name)
        ),
        map((services: Result) => services.id)
      );
  }

  getHttpHeaders(): { headers: HttpHeaders } {
    let headers = null;
    console.log(this.storage.get('TOKEN'));

    if (!!this.storage.get('TOKEN')) {
      headers = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.storage.get('TOKEN')}`
        })
      };

      console.log('headers', headers);
    }

    return headers;
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
