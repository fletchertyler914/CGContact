import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactForm } from '../models/contact-form.model';
import { DayPreference } from '../models/day-preference.model';

@Injectable({
  providedIn: 'root'
})
export class ZingleService {
  constructor(private http: HttpClient) {}

  createContact(payload: ContactForm) {
    console.log(payload);

    console.log(this.getSelectedDayTags(payload.schedule));

    // ToDo: Wire Up Zingle API
  }

  getSelectedDayTags(daysSelected: DayPreference[]): string[] {
    const tags: string[] = [];

    daysSelected.forEach((day: DayPreference) => {
      tags.push(day.dayLong.concat('_', this.getPeriod(day)));
    });

    return tags;
  }

  getPeriod(day: DayPreference): string {
    if (day.period === '') {
      return 'No-Preference';
    } else if (day.period === 'AM') {
      return 'AM';
    } else if (day.period === 'PM') {
      return 'PM';
    }
  }
}
