const nodemailer = require('nodemailer'); //pour l'envoi d'e-mails

//config de nodemailer pour l'envoi d'e-mails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
  });
//vérif de la config de l'expéditeur d'e-mail
transporter.verify(function(error, success) {
    if (error) {
        console.error("Email transporter configuration is incorrect:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
  });

module.exports = transporter;