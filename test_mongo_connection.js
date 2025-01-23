const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://shamalow423:Un4M4ng0423@backendmongo.w7oxnjk.mongodb.net/?retryWrites=true&w=majority&appName=backendmongo";

(async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB successfully!");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in the database:", collections.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
})();