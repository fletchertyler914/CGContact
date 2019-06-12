import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

import { LoginResponse, User } from '../models/login-response.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { LoginModal } from '../login-modal/login-modal.component';
import * as firebase from 'firebase';
import { ContactForm } from '../models/contact-form.model';
import { AuthService } from './auth.service';
import { filter, map, tap, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  users: Observable<LoginResponse[]>;
  fireAuth = firebase.auth();
  public currentUser$: Observable<firebase.User> = this.afAuth.user;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) { }

  createZingleUser(user: LoginResponse) {
    const data = JSON.parse(JSON.stringify(user));
    return this.db.collection('users').add(data);
  }

  login(user: LoginModal) {
    return this.afAuth.auth
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        return this.afAuth.auth.signInWithEmailAndPassword(
          user.userName,
          user.password
        );
      });
  }

  signUp(user: LoginModal) {
    return this.afAuth.auth
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        return this.afAuth.auth.createUserWithEmailAndPassword(
          user.userName,
          user.password
        );
      });
  }

  uploadContact(contact: ContactForm) {
    if (!!this.fireAuth.currentUser) {
      const data = JSON.parse(JSON.stringify(contact));
      return this.db.collection('users').doc(this.fireAuth.currentUser.uid).collection('contacts').add(data);
    } else {
      return Promise.reject(new Error('You Are Not Logged In!'))
    }
  }

  logout() {
    return this.afAuth.auth.signOut();
  }

    // Sets user data to firestore after succesful login
    updateUserData(user: User) {
      const userRef: AngularFirestoreDocument<User> = this.db.doc(
        `users/${user.uid}`
      );

      const data: User = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
        token: user.token
      };

      return userRef.set(data, {merge: true});
    }
}
