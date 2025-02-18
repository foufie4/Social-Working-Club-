const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

require('dotenv').config();
const API_URL = process.env.API_URL || "http://localhost:5000";

let mainWindow;

let server = exec('node server.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`SERVER ERROR: ${error}`);
        return;
    }
    console.log(`SERVER: ${stdout}`);
});

server.stdout.on('data', (data) => {
    console.log(`SERVER: ${data}`);
});
    // Créer la fenêtre Electron
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false // Désactive la restriction de sécurité
        }
    });

    setTimeout(() => {
        mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    }, 3000); // Attends 3 secondes pour éviter que le serveur ne soit pas prêt    

    mainWindow.webContents.executeJavaScript(`window.API_URL = "${API_URL}";`);

    // Charger l'interface utilisateur
    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
        server.kill(); // Arrêter le serveur quand l'app est fermée
    });

app.on('ready', () => {
    console.log("l'application desktop tourne !");
});

app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");