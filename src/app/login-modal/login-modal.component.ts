import { Component, Inject, ɵConsole } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {SESSION_STORAGE, WebStorageService} from 'angular-webstorage-service';

export interface DialogData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {

  constructor(
    public dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  login(data: DialogData) {
    this.storage.set('TOKEN', btoa(`${data.username}:${data.password}`));
  }

}
