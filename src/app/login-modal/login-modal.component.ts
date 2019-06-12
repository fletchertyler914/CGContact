import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { filter, tap, take, map, catchError, takeUntil, first } from 'rxjs/operators';
import { ZingleService } from '../services/zingle.service';
import { LoginResponse, Auth } from '../models/login-response.model';
import { Subject, Observable, throwError, of } from 'rxjs';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material';
import { auth } from 'firebase/app';
import { AuthService } from '../services/auth.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

export class ModalData {
  loginModal: LoginModal;
  loginType: string;

  constructor(loginmodal: LoginModal, logintype: string) {
    this.loginModal = loginmodal;
    this.loginType = logintype;
  }
}

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
    @Inject(MAT_DIALOG_DATA) public loginData: ModalData,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private dialogRef: MatDialogRef<LoginModalComponent>,
    private zingleService: ZingleService,
    private firebaseService: FirebaseService,
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private db: AngularFirestore
  ) {}

  onNoClick(): void {
    this.dialogRef.close(this.returnData);
  }

  login(user: LoginModal) {
    this.firebaseService.login(user)
    .then(result => {
      
      console.log(result);
    })
    .catch((err: Error) => {
      this.snackBar.open(err.message, 'dismiss', {
        duration: 8000
      });
    });
    // this.zingleService
    //   .login(btoa(`${data.userName}:${data.password}`))
    //   .pipe(
    //     filter((response: LoginResponse) => !!response),
    //     take(1)
    //   )
    //   .subscribe(
    //     (response: LoginResponse) => {
    //       this.dialogRef.close(response.auth);
    //       this.zingleService.loggedIn$.next(true);
    //       this.storage.set('TOKEN', btoa(`${data.userName}:${data.password}`));
    //       this.storage.set('USER', response.auth);
    //     },
    //     ((errorResponse: LoginResponse) => {
    //       this.zingleService.loggedIn$.next(false);
    //       this.loginError = errorResponse;
    //     })
    //   );
  }

  signUp(user: LoginModal) {
    this.zingleService
    .signup(btoa(`${user.userName}:${user.password}`))
    .pipe(
      filter((response: LoginResponse) => !!response),
      take(1)
    )
    .subscribe(
      (response: LoginResponse) => {
        console.log('Zingle Login Response: ', response);
        this.firebaseService.signUp(user)
        .then(result => {
          this.afAuth.user.pipe(
            filter((fbUser: firebase.User) => !!fbUser),
            tap((fbUser: firebase.User) => this.firebaseService.updateUserData({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              token: btoa(`${user.userName}:${user.password}`)
            })),
            first()
          ).subscribe();

          this.snackBar.open('Successfully Connected To Zingle!', 'dismiss', {
            duration: 3000
          });
          this.dialogRef.close(response.auth);
          this.zingleService.loggedIn$.next(true);
        })
        .catch((err: Error) => {
          this.snackBar.open(err.message, 'dismiss', {
            duration: 8000
          });
          console.log('Err:', err);
        });
      },
      ((errorResponse: LoginResponse) => {
        this.snackBar.open('Login Failed!', 'dismiss', {
          duration: 3000
        });
        this.zingleService.loggedIn$.next(false);
        this.loginError = errorResponse;
      })
    );
  }
}
