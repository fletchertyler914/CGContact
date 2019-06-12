import { DayPreference } from './day-preference.model';

export class ContactForm {
  constructor(
    public firstName: string,
    public lastName: string,
    public phoneNumber?: number,
    public email?: string,
    public schedule?: DayPreference[]
  ) {}
}
