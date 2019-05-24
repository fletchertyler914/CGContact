import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

import { LoginResponse } from '../models/login-response.model';
import { Observable } from 'rxjs';
import { LoginModal } from '../login-modal/login-modal.component';
import * as firebase from 'firebase';


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
    return this.db.collection('users').add(user);
  }

  login(user: LoginModal) {
    return this.afAuth.auth.signInWithEmailAndPassword(user.userName, user.password);
  }

  signUp(user: LoginModal) {
    return this.afAuth.auth.createUserWithEmailAndPassword(user.userName, user.password);
  }

  logout() {
    return this.afAuth.auth.signOut();
  }
}
