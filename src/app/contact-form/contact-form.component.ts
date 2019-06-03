import { Component, OnInit, Inject } from '@angular/core';
import { ContactForm } from '../models/contact-form.model';
import { MatSnackBar } from '@angular/material';
import { DayPreference } from '../models/day-preference.model';
import { ZingleService } from '../services/zingle.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AuthService } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';
import { LoginResponse } from '../models/login-response.model';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  public model: ContactForm;
  private durationInSeconds = 3;
  public showShortDays = true;
  public periodOptions: string[];
  private serviceId = null;


  constructor(
    private zingleService: ZingleService,
    private snackBar: MatSnackBar,
    public breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private firestore: FirebaseService
  ) {}

  ngOnInit(): void {
    this.periodOptions = ['Morning', 'Mid Day', 'Evening'];
    this.model = this.getNewModel();

     // Init Zingle Services
    // this.zingleService.getServicesIdByName('The Motivated U').subscribe(serviceId => this.serviceId = serviceId);

    // Firebase
    this.firestore.users.subscribe((users: LoginResponse[]) => console.log(users));
  }

  onSubmit() {
    // Submit Contact Form To Zingle Service To Create A New Contact
    // this.zingleService.createContact(this.serviceId, this.model);
    this.firestore.uploadContact(this.model);


    // Reset The Form To Clear Input Fields
    this.model = this.getNewModel();

    // Open Thank You Snack Bar
    this.snackBar.open('Thank You!', null, {
      duration: this.durationInSeconds * 1000
    });
  }

  selectDay(option: DayPreference, period: string) {
    const index = this.model.schedule.findIndex(
      (scheduleDay: DayPreference) => scheduleDay.dayLong === option.dayLong
    );
    if (index !== -1) {
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
    return new ContactForm(
      '',
      '',
      null,
      null,
      this.getScheduleDays(this.getBlockedDays())
    );
  }

  getScheduleDays(blockedDays: string[]): DayPreference[] {
    const daysOfWeekMap = [
      { long: 'Sunday', short: 'Su' },
      { long: 'Monday', short: 'Mo' },
      { long: 'Tuesday', short: 'Tu' },
      { long: 'Wednesday', short: 'We' },
      { long: 'Thursday', short: 'Th' },
      { long: 'Friday', short: 'Fr' },
      { long: 'Saturday', short: 'Sa' }
    ];

    const scheduledDays: DayPreference[] = [];

    daysOfWeekMap.forEach(day => {
      scheduledDays.push(new DayPreference(day.long, day.short, false, ''));
    });

    return scheduledDays.filter(
      (day: DayPreference) => !blockedDays.includes(day.dayLong)
    );
  }

  isPeriodBlocked(day: DayPreference, period: string): boolean {
    switch (day.dayLong) {
      case 'Sunday':
        return true;
      case 'Monday':
        if (period === 'Morning') {
          return false;
        }
        if (period === 'Mid Day') {
          return false;
        }
        if (period === 'Evening') {
          return false;
        }
        return true;
      case 'Tuesday':
        if (period === 'Morning') {
          return false;
        }
        if (period === 'Mid Day') {
          return false;
        }
        if (period === 'Evening') {
          return false;
        }
        break;
      case 'Wednesday':
        if (period === 'Morning') {
          return false;
        }
        if (period === 'Mid Day') {
          return false;
        }
        if (period === 'Evening') {
          return false;
        }
        break;
      case 'Thursday':
        if (period === 'Morning') {
          return false;
        }
        if (period === 'Mid Day') {
          return false;
        }
        if (period === 'Evening') {
          return false;
        }
        break;
      case 'Friday':
        if (period === 'Morning') {
          return false;
        }
        if (period === 'Mid Day') {
          return false;
        }
        if (period === 'Evening') {
          return true;
        }
        break;
      case 'Saturday':
        return true;
    }
  }

  getBlockedDays(): string[] {
    const blockedDays = ['Saturday', 'Sunday'];
    return blockedDays;
  }

  updateDaysString() {
    this.model.schedule.forEach((day: DayPreference) => {});
  }
}
