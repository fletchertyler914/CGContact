import { Injectable, Inject, OnDestroy } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { tap, takeUntil, take, switchMap, filter, map } from 'rxjs/operators';
import { ZingleService } from './zingle.service';

@Injectable({
  providedIn: 'root'
})

export class LoginModal {
  userName: string;
  password: string;

  constructor(username: string, pass: string) {
    this.userName = username;
    this.password = pass;
   }
}

export class AuthService implements OnDestroy {
  private loginDialog: MatDialogRef<LoginModalComponent>;
  private loginPoll: any;
  private token: string;
  private destroy$: Subject<boolean> = new Subject();
  public loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(this.checkIfLoggedIn());

  constructor(
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    public dialog: MatDialog,
    private zingleService: ZingleService) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  startLoginPoll() {
    this.loginPoll = setInterval(() => {
      this.loggedIn$.next(this.checkIfLoggedIn());
      console.log('Logged In: ', this.loggedIn$);
    }, 10000);
  }

  login() {
    this.loginDialog = this.dialog.open(LoginModalComponent, {
      width: '300px',
      data: new LoginModal('', '')
    });

    this.loginDialog.afterClosed().pipe(
      filter((data: LoginModal) => !!data),
      tap((data: LoginModal) => btoa(`${data.userName}:${data.password}`)),
      switchMap(() => this.zingleService.login(this.token)),
      takeUntil(this.destroy$)
    ).subscribe((loginResponse: any) => {
      if (loginResponse.status === 200) {
       // token is correct, set in storage
       this.storage.set('token', this.token);
      } else {
        // token is not correct
        // this.token = null
        // Display Error Message And Clear Token
        this.logOut();
      }
    });
  }

  logOut() {
    this.storage.remove('TOKEN');
  }

  checkIfLoggedIn(): boolean {
    return !!this.storage.get('TOKEN');
  }
}
