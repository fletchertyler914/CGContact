import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatToolbarModule,
  MatSelectModule,
  MatCardModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatMenuModule,
  MatIconModule
} from '@angular/material';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule
  ],
  exports: [
    MatButtonModule,
    MatToolbarModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule
  ]
})
export class MaterialModule { }
