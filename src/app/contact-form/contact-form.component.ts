import { Component, OnInit  } from '@angular/core';
import { ContactForm } from '../models/contact-form.model';
import { MatSnackBar } from '@angular/material';
import { DayPreference } from '../models/day-preference.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';
import { filter, tap, distinctUntilChanged, switchMap, take, takeUntil, first, map, skip } from 'rxjs/operators';
import { User as FBUser } from 'firebase';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/login-response.model';
import { Services } from '../models/services.model';

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
  loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public referral: string;

  constructor(
    private snackBar: MatSnackBar,
    public breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private firestore: FirebaseService
  ) {}

  ngOnInit(): void {
    this.authService.getServices();

    this.periodOptions = ['Morning', 'Mid Day', 'Evening'];
    this.model = this.getNewModel();

    this.firestore.currentUser$
    .pipe(
      tap((user: FBUser) => !!user ? this.loggedIn$.next(true) : this.loggedIn$.next(false)),
      filter((user: FBUser) => !!user),
      switchMap((user: FBUser) => this.firestore.getUserData()),
      // tap((user: User) => console.log('Logged In, Update Model.', user)),
      tap((user: User) => this.model.referral = user.referral)
    ).subscribe();

    this.loggedIn$.pipe(
      skip(1),
      filter(loggedIn => !loggedIn),
      // tap(value => console.log('Not Logged In, Reset Model.', value)),
      tap(() => this.model = this.getNewModel())
    ).subscribe();
  }

  onSubmit() {
    const zinglePayload = this.authService.contactFormToJson(this.model);
    this.authService.createContact(zinglePayload);
    
    // Submit Contact Form To Firebase To Create A New Contact
    // this.firestore.uploadContact(this.model)
    // .then(response => {
    //   // Reset The Form To Clear Input Fields
    //   this.model = this.getNewModel();

    //   // Open Thank You Snack Bar
    //   this.snackBar.open('Contact Saved!', 'dismiss', {
    //     duration: this.durationInSeconds * 1000
    //   });
    // })
    // .catch((err: Error) => {
    //   // Open Thank You Snack Bar
    //   this.snackBar.open(err.message, 'dismiss', {
    //     duration: 8000
    //   });
    // });
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
