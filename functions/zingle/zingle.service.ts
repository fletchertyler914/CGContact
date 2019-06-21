import { ContactForm } from "../models/contact-form.model";
import { DayPreference } from "../models/day-preference.model";
import { Observable } from "rxjs/internal/Observable";
import { of } from "rxjs";
import * as request from "request";

export class ZingleService {
  public URL = "https://api.zingle.me/v1";
  public loggedIn$: Observable<boolean> = of(false);

  login(token: string, callback: any) {
    const options = {
      url: this.URL,
      headers: {
        'Authorization': `Basic ${token}`
      }
    };
    request(options, callback);
  }

  logout() {
    // TODO: Implement Log Out
  }

  createContact(serviceId: string, payload: ContactForm) {
    const url = `${this.URL}/services/${serviceId}/contacts`;
    
    const options = {
      url: `${this.URL}/services/${serviceId}/contacts`,
      headers: {
        'Authorization': `Basic ${token}`
      }
    };
    request(options, callback);
    // this.http
    //   .post<CreateContact>(
    //     url,
    //     this.contactFormToJson(payload),
    //     this.getHttpHeaders(this.storage.get('TOKEN'))
    //   )
    //   .subscribe((result: CreateContact) => {
    //     console.log(result);
    //     if (result.status && result.status.status_code === 200) {
    //       const contactResult = result.result;
    //       console.log(contactResult);
    //     }
    //   });
  }

  getSelectedDayTags(daysSelected: DayPreference[]): string[] {
    const tags: string[] = [];

    daysSelected.forEach((day: DayPreference) => {
      if (day.selected) {
        tags.push(day.dayLong.concat("_", this.getPeriod(day)));
      }
    });

    return tags;
  }

  getServices(token: string, callback: any) {
    const options = {
      url: `${this.URL}/services`,
      headers: {
        'Authorization': `Basic ${token}`
      }
    };
    request(options, callback);
  }

  getPeriod(day: DayPreference): any {
    if (day.period === "Morning") {
      return "Morning";
    } else if (day.period === "Mid Day") {
      return "MidDay";
    } else if (day.period === "Evening") {
      return "Evening";
    }
  }

  // getServicesIdByName(name: string): Observable<string> {
  //   return this.http.get<Services>(`${this.URL}/services`, httpHeader).pipe(
  //     map((services: Services) => services.result),
  //     map((services: Result[]) =>
  //       services.find(service => service.business_name === name)
  //     ),
  //     map((services: Result) => services.id)
  //   );
  // }

  getHttpHeaders(token: string): { auth: { basic: string } } {
    return {
      auth: {
        basic: `${token}`
      }
    };
  }

  contactFormToJson(payload: ContactForm) {
    return JSON.stringify({
      channels: [
        {
          channel_type_id: "0a293ea3-4721-433e-a031-610ebcf43255",
          value: `+1${payload.phoneNumber}`
        }
      ],
      custom_field_values: [
        {
          value: Date.now(),
          custom_field_id: "de4dc434-2e32-4121-a06d-8fbedf10f6cb"
        },
        {
          value: payload.firstName,
          custom_field_id: "e01a3856-89b1-4db4-bf56-38d79454c921"
        },
        {
          value: payload.lastName,
          custom_field_id: "0df80524-3b27-4fb0-8eeb-c81bd448d294"
        }
      ]
    });
  }
}
