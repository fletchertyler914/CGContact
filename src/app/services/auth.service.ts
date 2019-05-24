import { Injectable, Inject } from '@angular/core';
import { ZingleService } from './zingle.service';
import { LoginModalComponent, LoginModal } from '../login-modal/login-modal.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Auth } from '../models/login-response.model';
import { filter, tap, take } from 'rxjs/operators';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public user: Auth = this.storage.get('USER') || null;
  public loggedIn$ = this.zingleService.loggedIn$;
  private dialogRef: MatDialogRef<LoginModalComponent>;

  constructor(
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private zingleService: ZingleService,
    private dialog: MatDialog
  ) { }

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

  logout() {
    this.zingleService.logout();
  }
}
