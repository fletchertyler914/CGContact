// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiURL: 'http://localhost:5000/cg-contact/us-central1/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const firebaseConfig = {
  apiKey: 'AIzaSyA15lsnheI7LwqIEt-g6qnW28kAiaEuPz8',
  authDomain: 'cg-contact.firebaseapp.com',
  databaseURL: 'https://cg-contact.firebaseio.com',
  projectId: 'cg-contact',
  storageBucket: 'cg-contact.appspot.com',
  messagingSenderId: '284098285486',
  appId: '1:284098285486:web:d435336f9ab99ee9'
};
