import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

import { LoginResponse } from '../models/login-response.model';
import { Observable } from 'rxjs';
import { LoginModal } from '../login-modal/login-modal.component';
import * as firebase from 'firebase';
import { ContactForm } from '../models/contact-form.model';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  users: Observable<LoginResponse[]>;
  fireAuth = firebase.auth();
  public currentUser$: Observable<firebase.User> = this.afAuth.user;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) {
    this.users = db.collection('users').valueChanges();
  }

  createUser(user: LoginResponse) {
    const data = JSON.parse(JSON.stringify(user));
    return this.db.collection('users').add(data);
  }

  login(user: LoginModal) {
    return this.afAuth.auth.signInWithEmailAndPassword(user.userName, user.password);
  }

  signUp(user: LoginModal) {
    return this.afAuth.auth.createUserWithEmailAndPassword(user.userName, user.password);
  }

  uploadContact(contact: ContactForm) {
    const data = JSON.parse(JSON.stringify(contact));
    return this.db.collection('contacts').add(data);
  }

  logout() {
    return this.afAuth.auth.signOut();
  }
}
