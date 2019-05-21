import { Component, OnInit } from '@angular/core';
import { ContactForm } from '../models/contact-form';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  model = new ContactForm('', '', null, null);
  submitted = false;

  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    this.submitted = true;
    console.log('Form: ', this.model);
  }

}
