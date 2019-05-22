import { Component } from '@angular/core';
import { ContactForm } from '../models/contact-form.model';
import { MatSnackBar } from '@angular/material';
import { DayPreference } from '../models/day-preference.model';
import { ZingleService } from '../services/zingle.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  public model: ContactForm = this.getNewModel();

  private durationInSeconds = 3;

  constructor(
    private zingleService: ZingleService,
    private snackBar: MatSnackBar
  ) {}

  onSubmit() {
    // Submit Contact Form To Zingle Service To Create A New Contact
    this.zingleService.createContact(this.model);

    // Reset The Form To Clear Input Fields
    this.model = this.getNewModel();

    // Open Thank You Snack Bar
    this.snackBar.open('Thank You!', null, {
      duration: this.durationInSeconds * 1000
    });
  }

  selectDay(option: DayPreference, period: string) {
    const index = this.model.schedule.findIndex((scheduleDay: DayPreference) => scheduleDay.day === option.day);
    if (index !== -1 ) {
      if (period !== '') {
        this.model.schedule[index].period = period;
        this.model.schedule[index].selected = true;
      } else {
        this.model.schedule[index].period = '';
        this.model.schedule[index].selected = false;
      }
    }
  }

  getNewModel(): ContactForm {
    return new ContactForm('', '', null, null, [
      new DayPreference('Su', false, ''),
      new DayPreference('Mo', false, ''),
      new DayPreference('Tu', false, ''),
      new DayPreference('We', false, ''),
      new DayPreference('Th', false, ''),
      new DayPreference('Fr', false, ''),
      new DayPreference('Sa', false, '')
    ]);
  }
}
