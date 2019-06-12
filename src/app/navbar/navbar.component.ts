import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LoginModalComponent, ModalData, LoginModal } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  dialogRef: MatDialogRef<LoginModalComponent>;
  
  constructor(public authService: AuthService, private dialog: MatDialog) {}

  loginModal() {
    this.dialogRef = this.dialog.open(LoginModalComponent, {
      width: '300px',
      data: new ModalData(new LoginModal('', ''), 'login')
    });
  }

  signUpModal() {
    this.dialogRef = this.dialog.open(LoginModalComponent, {
      width: '300px',
      data: new ModalData(new LoginModal('', ''), 'signup')
    });
  }
}
