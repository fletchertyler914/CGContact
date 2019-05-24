import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { filter, tap, take, map } from 'rxjs/operators';
import { ZingleService } from '../services/zingle.service';
import { LoginResponse, Auth } from '../models/login-response.model';
import { Subject } from 'rxjs';
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
  public returnData: Auth;
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
        filter((user: Auth) => !!user),
        map((user: Auth) => {
          this.dialogRef.close(user);
        }),
        take(1)
      ).subscribe();
  }
}
