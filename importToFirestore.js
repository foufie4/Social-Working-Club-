const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./firebaseServiceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Initialisation de Firestore
const db = admin.firestore();
const postsCollection = db.collection('posts');

// Charger les données depuis le fichier JSON
const postsFilePath = path.join(__dirname, 'posts.json');
const postsData = JSON.parse(fs.readFileSync(postsFilePath, 'utf8'));

async function importPosts() {
    try {
        for (const post of postsData) {
            await postsCollection.add(post);
            console.log(`Post importé : ${post.title || 'Sans titre'}`);
        }
        console.log('Importation des posts terminée !');
    } catch (error) {
        console.error('Erreur lors de l\'importation des posts :', error);
    }
}

importPosts();