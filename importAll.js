const fs = require("fs");
const db = require("./firebaseConfig");

//lecture fichier JSON exporté depuis mongoDB
const collections = ["users", "posts"];

async function importCollection(collectionName) {
    try {
        const filePath = `${collectionName}.json`;
        if (!fs.existsSync(filePath)) {
            console.log(`le fichier ${filePath} n'existe pas, skipping...`);
            return;
        }

        const documents = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        for (let doc of documents) {
            const docId = doc._id?.$oid || doc._id; //gérer objectid mongodb
            const data = { ...doc };

            //retirer les champs inutiles de mongodb
            delete data._id;

            //convertir les dates mongodb en format firebase
            Object.keys(data).forEach((key) => {
                if (data[key]?.$date) {
                    data[key] = new Date(data[key].$date);
                }
            });

            await db.collection(collectionName).doc(docId).set(data);
            console.log(`document ajouté à ${collectionName} : ${docId}`);
        }
        console.log(`importation de ${collectionName} terminée !`);
    } catch (error) {
        console.error(`erreur lors de l'importation de ${collectionName} :`, error);
    }
}

async function importAllCollections() {
    for (const collection of collections) {
        await importCollection(collection);
    }
    console.log("Toutes les collections ont été importées !");
}

importAllCollections();