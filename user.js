const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; // C'est le facteur de coût pour le hashage

const userSchema = new mongoose.Schema({
    fullname: String, 
    email: String,
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }, // Ajouté pour la vérification de l'email
    verificationToken: { type: String }, // Ajouté pour stocker le token de vérification
    profileImage: String,
    bio: String
});

// Avant d'enregistrer l'utilisateur, hashons le mot de passe
userSchema.pre('save', function(next) {
    // Ne hasher le mot de passe que si celui-ci a été modifié (ou est nouveau)
    if (!this.isModified('password')) return next();

    // Génération du sel et du hash
    bcrypt.hash(this.password, saltRounds, (err, hash) => {
        if (err) return next(err);
        // Remplacement du mot de passe clair par le hash
        this.password = hash;
        next();
    });
});

module.exports = mongoose.model('User', userSchema);