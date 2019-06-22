import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginResponse, User } from '../models/login-response.model';
import { Observable } from 'rxjs';
import { LoginModal } from '../login-modal/login-modal.component';
import { ContactForm } from '../models/contact-form.model';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { User as FBUser } from 'firebase';
import { filter, map, switchMap, tap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  users: Observable<LoginResponse[]>;
  public currentUser$: Observable<firebase.User> = this.afAuth.user;
  public URL = environment.apiURL;
  private usertoken$ = this.afAuth.user.pipe(
    filter((user: FBUser) => !!user),
    switchMap((user: FBUser) => this.getUserData()),
    map((user: User) => user.token)
  );

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private http: HttpClient
  ) {}

  login(user: LoginModal) {
    return this.afAuth.auth.setPersistence('local').then(() => {
      return this.afAuth.auth.signInWithEmailAndPassword(
        user.userName,
        user.password
      );
    });
  }

  signUp(user: LoginModal) {
    return this.afAuth.auth.setPersistence('local').then(() => {
      return this.afAuth.auth.createUserWithEmailAndPassword(
        user.userName,
        user.password
      );
    });
  }

  getUserData() {
    return this.db
      .collection('users')
      .doc(this.afAuth.auth.currentUser.uid)
      .valueChanges();
  }

  uploadContact(contact: ContactForm) {
    const data = JSON.parse(JSON.stringify(contact));

    // If User Not Logged In, Create Contact In General Contact Collection
    if (!!this.afAuth.auth.currentUser) {

      return this.db
        .collection('users')
        .doc(this.afAuth.auth.currentUser.uid)
        .collection('contacts')
        .add(data);
    } else {
      // Add Contacts To Generic Contacts Collection
      return this.db.collection('contacts').add(data);

      // Return No Auth Error
      // return Promise.reject(new Error('You Are Not Logged In!'))
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
      referral: user.referral,
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
      token: user.token
    };

    return userRef.set(data, { merge: true });
  }

  getHttpHeaders(token: string): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`
      })
    };
  }
}
