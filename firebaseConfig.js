const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://syochat.firebaseio.com"
    });
}

const db = admin.firestore();

module.exports = { admin, db };