const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const API_URL = "http://localhost:5000/api";

let mainWindow;

app.on('ready', () => {
    // Lancer le serveur Node.js
    const server = exec('npx kill-port 5000 && node server.js', { cwd: path.join(__dirname, 'Social-Working-Club-') });

    server.stdout.on('data', data => {
        console.log(`SERVER: ${data}`);
    });

    server.stderr.on('data', data => {
        console.error(`SERVER ERROR: ${data}`);
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

    mainWindow.webContents.executeJavaScript(`window.API_URL = "${API_URL}";`);

    // Charger l'interface utilisateur
    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
        server.kill(); // Arrêter le serveur quand l'app est fermée
    });
});

app.on('ready', () => {
    console.log("l'application desktop tourne !");
});

app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");