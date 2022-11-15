const {app, BrowserWindow, ipcMain, dialog, globalShortcut} = require('electron');
const path = require('path');
const fs = require("fs");
const elinu_launcher = require('./launcher');
const Store = require('electron-store');
const notifier = require('node-notifier');
const langStrings = require('../langStrings.json');
const downloader = require('./downloader');
const login = require('./login');
const { basename } = require("path");
const currentDirectory = basename(process.cwd());
const axios = require('axios');
const { tcpPingPort } = require("tcp-ping-port")

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
    app.quit();
}
process.env.ELECTRON_IS_DEV = 0;

let MessageListener;
let winLogin;
let splash;
let mainW;

const localStore = new Store();
let getUserData;






//load config json
global.launcherConfig = (function () {
    if (fs.existsSync(path.join(process.cwd(), 'teraElinu.json'))) {
        try {
            return require(path.join(process.cwd(), 'teraElinu.json'));
        } catch (e) {
            let defaultCfg = {
                lang: "uk",
                gamePath: "C:\\Client\\TL.exe"
            };
            fs.writeFileSync(path.join(process.cwd(), 'teraElinu.json'), JSON.stringify(defaultCfg, null, 4));
            return defaultCfg;
        }
    } else {
        fs.writeFileSync(path.join(process.cwd(), 'error.txt'), "teraElinu.json not found!");
        
        notifier.notify({
            title: 'Tera Elinu',
            message: 'teraElinu.json not found!',
            icon: path.join(__dirname, 'TeraElinuIcon.png'),
            appID: 'Tera-Elinu',
        });
    }

})();


const createWindow = () => {
    
    //Check userData Onload
    try {
        if(JSON.parse(localStore.get('users'))){
            getUserData = JSON.parse(localStore.get('users'));
        }
    }catch (e){
    }
    
    
    // Load the splash screen on first
    splash = new BrowserWindow({
        width: 550,
        height: 360,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    //set elinu icon app and Overlay
    splash.setIcon(path.join(__dirname, 'TeraElinuIcon.ico'));
    splash.setOverlayIcon(path.join(__dirname, 'TeraElinuLogo.png'), 'Tera Elinu logo')

    splash.loadURL(`file://${__dirname}/splash.html?lang=${global.launcherConfig.lang}`);
    splash.center();

    //first if dom ready
    //then check if userData. Then check if stayConnected is set
    //if stayConnected then Load mainWindow with userData, connect the user
    //Else do the basics things(load the login page)
    splash.webContents.once("dom-ready", () => {
        let getUserStayConnected = JSON.parse(localStore.get('ifStayConnected'));

        if (getUserData.AuthKey){//if get user data
            if (getUserStayConnected.stayConnected === true){//if user want to stay connected
                setTimeout(function () {//directly show the main window
                    splash.close();
                    mainW.center();
                    mainW.webContents.send('users', JSON.parse(localStore.get('users')));
                    mainW.show();
                }, 2000);
                console.log("stayConnected exist");
            }else{//else show login window
                setTimeout(function () {
                    splash.close();
                    winLogin.center();
                    winLogin.show();
                }, 2000);
            }
            console.log("userdata exist");
        }
        console.log("Splash dom-ready");
    });

    // Create the browser window of login
    winLogin = new BrowserWindow({
        width: 1200,
        height: 758,
        transparent: true,
        frame: false,
        show: false,
        resizable: false,
        maximizable: false,
        icon: path.join(__dirname, 'TeraElinuIcon.png'),
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    //set elinu icon app and Overlay
    winLogin.setIcon(path.join(__dirname, 'TeraElinuIcon.ico'));
    winLogin.setOverlayIcon(path.join(__dirname, 'TeraElinuLogo.png'), 'Tera Elinu logo')

    // and load the index.html of the app.
    //winLogin.loadFile(path.join(__dirname, 'index.html'));
    winLogin.loadURL(`file://${__dirname}/index.html?lang=${global.launcherConfig.lang}`);
    winLogin.hide();
    winLogin.on('closed', () => {
        console.log('User closed the Login window');
        ipcMain.removeAllListeners();
        app.quit();
    });
    
    
    // Create the browser window of main window
    mainW = new BrowserWindow({
        width: 1200,
        height: 758,
        transparent: true,
        frame: false,
        show: false,
        resizable: false,
        maximizable: false,
        icon: path.join(__dirname, 'TeraElinuIcon.png'),
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });


    mainW.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.key.toLowerCase() === 'r') {
            event.preventDefault()
        }
    })
    
    //set elinu icon app and Overlay
    mainW.setIcon(path.join(__dirname, 'TeraElinuIcon.ico'));
    mainW.setOverlayIcon(path.join(__dirname, 'TeraElinuLogo.png'), 'Tera Elinu logo')

    // and load the index.html of the app.
    //mainW.loadFile(path.join(__dirname, 'main.html'));
    mainW.loadURL(`file://${__dirname}/main.html?lang=${global.launcherConfig.lang}`);
    //hide on load
    mainW.hide();
    mainW.on('closed', () => {
        console.log('User closed the Main window');
        ipcMain.removeAllListeners();
        app.quit();
    });

    //first if dom ready
    mainW.webContents.once("dom-ready", () => {

        globalShortcut.unregisterAll();
        
        
        tcpPingPort("94.23.17.161", 7801).then(online => {
            mainW.webContents.send("serverStatus", online)
        })
        
        //we check for updates
        checkForUpdates();
        console.log("mainW dom-ready");
    });
    
    MessageListener = elinu_launcher.registerMessageListener((message, code) => {
        switch (message) {
            case "ticket":{
                elinu_launcher.sendMessageToClient('ticket', `{"ticket": "${getUserData.AuthKey}", "result-code": 200}`);
                break;
            }
            case "last_svr":{
                elinu_launcher.sendMessageToClient("last_svr", getUserData.last_connected_server);
                break;
            }
            case "char_cnt":{
                elinu_launcher.sendMessageToClient("char_cnt", getUserData.CharacterCount);
                break;
            }
            case "gameEvent":{
                console.log(`gameEvent Received message: ${message}(${code})`);
                mainW.webContents.send('gameEventMessage', message, code);
                break;
            }
            case "endPopup": {
                mainW.webContents.send('gameEndMessage', message, code);
                console.log(`endPopup Received message: ${message}(${code})`);
                if (code === "0") {
                    console.log(`[ElinuLauncher]-> Game Client Closed With: ${message}(${code})`);
                }
                break;
            }
            case "gameCannotLaunch": {
                mainW.webContents.send('gameCannotLaunch', message, code);
                console.log(`endPopup Received message: ${message}(${code})`);
                if (code === "0") {
                    console.log(`[ElinuLauncher]-> Game Client Closed With: ${message}(${code})`);
                }
                break;
            }
        }
    });
    elinu_launcher.onLoadElinuLauncher();
};

ipcMain.on("downloadUpdate", (event) => {
    !fs.existsSync(path.join(process.cwd() + "/files/")) && fs.mkdirSync(path.join(process.cwd() + "/files/"), {recursive: true})

    console.log("downloading update")
    // Multi connections
    downloader.downloadProcess(mainW)
    
});

async function checkForUpdates() {
    try {
        let response = await axios.get("https://teraelinu.surge.sh/" + 'version.json');
        let remoteVersion = response.data;

        let localVersion = fs.readFileSync('./version.txt', 'utf-8');

        if(localVersion === remoteVersion.version) {

            console.log("no update")
            mainW.webContents.send("noUpdate")
            
            if("maj client"){
                //si maj, on fait les maj
                //mainW.webContents.send("clientUpdateAvailable")
            }
            
        }else {
            console.log("update available")
            let updateRemoteVersion = fs.createWriteStream('./version.txt', 'utf-8');
            updateRemoteVersion.write(remoteVersion.version);
        }
        
    } catch (e) {
        console.error(e);
    }
}

ipcMain.on('loginRequest', async (event, username, password, stayConnectedValue) => {
    await login.doLogin(mainW, winLogin, event, username, password, stayConnectedValue);
});

ipcMain.on('userCheck', async (event) => {
    mainW.webContents.send('users', JSON.parse(localStore.get('users')));
});

ipcMain.on('logout', async (event) => {
    let stayConnectedSend = {
        stayConnected: false
    }
    localStore.set('ifStayConnected', JSON.stringify(stayConnectedSend));
    setTimeout(function () {
        mainW.hide();
        winLogin.center();
        winLogin.show();
    }, 1000);
});

ipcMain.on('langSelected', (event, lang) => {
    launcherConfig.lang = lang;
    fs.writeFileSync(path.join(process.cwd(), 'teraElinu.json'), JSON.stringify(launcherConfig, null, 4));
    mainW.loadURL(`file://${__dirname}/main.html?lang=${global.launcherConfig.lang}`);
    winLogin.loadURL(`file://${__dirname}/index.html?lang=${global.launcherConfig.lang}`);
});

ipcMain.on('window-minimize', (event) => {
    BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('window-close', (event) => {
    ipcMain.removeAllListeners();
    BrowserWindow.getFocusedWindow().close();
    app.quit();
});


app.on('browser-window-focus', function () {
    globalShortcut.unregisterAll();
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    globalShortcut.unregisterAll();
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


if (process.platform === 'win32') {
    app.setAppUserModelId(app.name);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
process.on('exit', () => {
    // Make an extra reference to the callback pointer to avoid GC
    MessageListener;

});

//TODO Finir la traduction du launcher et continuer le codage du luancher