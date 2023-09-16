// firebaseConfig.ts

import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.join(__dirname, 'school-app-62650-firebase-adminsdk-d2vuw-226f2decbc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  storageBucket: 'gs://school-app-62650.appspot.com',
  // storageBucket: 'gs://grapple-a4d53.appspot.com/',
});

export { admin };
