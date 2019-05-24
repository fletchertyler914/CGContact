import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { filter, tap, take, map, catchError } from 'rxjs/operators';
import { ZingleService } from '../services/zingle.service';
import { LoginResponse, Auth } from '../models/login-response.model';
import { Subject, Observable, throwError, of } from 'rxjs';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';

export class LoginModal {
  userName: string;
  password: string;

  constructor(username: string, pass: string) {
    this.userName = username;
    this.password = pass;
  }
}

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  public returnData: Auth = null;
  public loginError: LoginResponse = null;
  public token: string;
  private destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public loginData: LoginModal,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private dialogRef: MatDialogRef<LoginModalComponent>,
    private zingleService: ZingleService
  ) {}

  onNoClick(): void {
    this.dialogRef.close(this.returnData);
  }

  login(data: any) {
    this.zingleService
      .login(btoa(`${data.userName}:${data.password}`))
      .pipe(
        filter((response: LoginResponse) => !!response),
        take(1)
      )
      .subscribe(
        (response: LoginResponse) => {
          this.dialogRef.close(response.auth);
          this.zingleService.loggedIn$.next(true);
          this.storage.set('TOKEN', btoa(`${data.userName}:${data.password}`));
          this.storage.set('USER', response.auth);
        },
        ((errorResponse: LoginResponse) => {
          this.zingleService.loggedIn$.next(false);
          this.loginError = errorResponse;
        })
      );
  }
}
