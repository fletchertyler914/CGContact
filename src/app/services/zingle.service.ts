import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactForm } from '../models/contact-form.model';

@Injectable({
  providedIn: 'root'
})
export class ZingleService {

  constructor(private http: HttpClient) { }

  createContact(payload: ContactForm) {
    console.log(payload);
    // ToDo: Wire Up Zingle API
  }

}
