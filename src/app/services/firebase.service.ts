import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginResponse, User } from '../models/login-response.model';
import { Observable } from 'rxjs';
import { LoginModal } from '../login-modal/login-modal.component';
import { ContactForm } from '../models/contact-form.model';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User as FBUser } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  users: Observable<LoginResponse[]>;
  public currentUser$: Observable<firebase.User> = this.afAuth.user;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) {}

  login(user: LoginModal) {
    return this.afAuth.auth
      .setPersistence('local')
      .then(() => {
        return this.afAuth.auth.signInWithEmailAndPassword(
          user.userName,
          user.password
        );
      });
  }

  signUp(user: LoginModal) {
    return this.afAuth.auth
      .setPersistence('local')
      .then(() => {
        return this.afAuth.auth.createUserWithEmailAndPassword(
          user.userName,
          user.password
        );
      });
  }

  getUserData(fBUser: FBUser) {
    const userRef: AngularFirestoreDocument<User> = this.db.doc(
      `users/${fBUser.uid}`
    );

    return userRef.valueChanges();
  }

  uploadContact(contact: ContactForm) {
    const data = JSON.parse(JSON.stringify(contact));

    // If User Not Logged In, Create Contact In Geneeral Contact Collection
    if (!!this.afAuth.auth.currentUser) {
      return this.db
        .collection('users')
        .doc(this.afAuth.auth.currentUser.uid)
        .collection('contacts')
        .add(data);
    } else {
      return this.db.collection('contacts').add(data);
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
}
