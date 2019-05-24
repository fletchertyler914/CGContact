import { Injectable } from '@angular/core';
import { ZingleService } from './zingle.service';
import { LoginModalComponent, LoginModal } from '../login-modal/login-modal.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Auth } from '../models/login-response.model';
import { filter, tap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public user: Auth;
  public loggedIn$ = this.zingleService.loggedIn$;
  private dialogRef: MatDialogRef<LoginModalComponent>;

  constructor(private zingleService: ZingleService, private dialog: MatDialog) { }

  login() {
    this.dialogRef = this.dialog.open(LoginModalComponent, {
      width: '300px',
      data: new LoginModal('', '')
    });

    this.dialogRef.afterClosed()
    .pipe(
      filter((user: Auth) => !!user),
      tap((user: Auth) => this.user = user),
      take(1)
    ).subscribe();
  }

  logOut() {
    this.zingleService.logout();
  }
}
