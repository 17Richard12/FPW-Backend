// src/config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json'); // Sesuaikan path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const dbFirestore = admin.firestore();
console.log('Firebase Admin SDK terinisialisasi.');

module.exports = { dbFirestore };