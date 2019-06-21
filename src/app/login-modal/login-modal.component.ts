import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { filter, take } from 'rxjs/operators';
import { LoginResponse, Auth } from '../models/login-response.model';
import { FirebaseService } from '../services/firebase.service';
import { MatSnackBar } from '@angular/material';
import { auth } from 'firebase/app';
import { AuthService } from '../services/auth.service';

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
  public loginError: string = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public loginData: ModalData,
    private dialogRef: MatDialogRef<LoginModalComponent>,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  onNoClick(): void {
    this.dialogRef.close(this.returnData);
  }

  login(user: LoginModal) {
    this.firebaseService.login(user)
    .then((fbUser: auth.UserCredential) => {
      this.authService.getServices();
      this.dialogRef.close(fbUser);
      this.snackBar.open(`Welcome Back, ${ fbUser.user.email }!`, 'dismiss', {
        duration: 3000
      });
    })
    .catch((err: Error) => {
      this.snackBar.open(err.message, 'dismiss', {
        duration: 8000
      });
    });
  }

  signUp(user: LoginModal) {
    this.authService
    .signup(btoa(`${user.userName}:${user.password}`))
    .pipe(
      filter((response: LoginResponse) => !!response),
      take(1)
    )
    .subscribe(
      (response: LoginResponse) => {
        this.firebaseService.signUp(user)
        .then((result: auth.UserCredential) => {
          this.firebaseService.updateUserData({
            referral: '',
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            token: btoa(`${user.userName}:${user.password}`)
          });

          this.authService.getServices();

          this.snackBar.open('Successfully Connected To Zingle!', 'dismiss', {
            duration: 3000
          });
          this.dialogRef.close(response.auth);
        })
        .catch((err: Error) => {
          this.loginError = err.message;
          this.snackBar.open(err.message, 'dismiss', {
            duration: 8000
          });
        });
      },
      ((errorResponse: LoginResponse) => {
        this.snackBar.open('Login Failed!', 'dismiss', {
          duration: 3000
        });
        this.loginError = 'Invalid Zingle Username or Password.';
      })
    );
  }
}
