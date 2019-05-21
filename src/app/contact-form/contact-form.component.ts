import { Component, OnInit, ViewChild } from '@angular/core';
import { ContactForm } from '../models/contact-form';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  model = new ContactForm('', '', null, null);
  durationInSeconds = 3;

  @ViewChild('contactForm') contactFormRef;

  constructor(private snackBar: MatSnackBar) { }

  onSubmit() {
    console.log('Form: ', this.model);
    this.contactFormRef.reset();

    this.snackBar.open('Thank You!', null, {
      duration: this.durationInSeconds * 1000
    });
  }
}
