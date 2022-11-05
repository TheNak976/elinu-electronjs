const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const fs = require("fs");
const elinu_launcher = require('./launcher');
const authServices = require('./services/authServices');
const Store = require('electron-store');
const notifier = require('node-notifier');
const langStrings = require('../langStrings.json');
const {DownloadWorker, utils} = require("rapid-downloader");
const formatBytes = require('pretty-byte');
const { basename } = require("path");
const currentDirectory = basename(process.cwd());

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
    app.quit();
}
process.env.ELECTRON_IS_DEV = 0;

let MessageListener;
let gameStr;
let winLogin;
let splash;
let eConsole;
let mainW;
let credentials;
const localStore = new Store();
let getUserData;
let easyDownloader;
let url = "https://proof.ovh.net/files/100Mb.dat";
const friendlyFileName = path.posix.basename(url);
let isPause = false;
let isResume = false;
let fileSize;
let worker;
//load config json
global.launcherConfig = (function () {
    if (fs.existsSync(path.join(process.cwd(), 'teraElinu.json'))) {
        try {
            return require(path.join(process.cwd(), 'teraElinu.json'));
        } catch (e) {
            let defaultCfg = {
                lang: "uk"
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
            devTools: true,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    //set elinu icon app and Overlay
    splash.setIcon(path.join(__dirname, 'TeraElinuIcon.ico'));
    splash.setOverlayIcon(path.join(__dirname, 'TeraElinuLogo.png'), 'Tera Elinu logo')

    splash.loadURL(`file://${__dirname}/splash.html?lang=${global.launcherConfig.lang}`);
    splash.center();

    

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
            devTools: true,
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
            devTools: true,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    //set elinu icon app and Overlay
    mainW.setIcon(path.join(__dirname, 'TeraElinuIcon.ico'));
    mainW.setOverlayIcon(path.join(__dirname, 'TeraElinuLogo.png'), 'Tera Elinu logo')

    // and load the index.html of the app.
    //mainW.loadFile(path.join(__dirname, 'main.html'));
    mainW.loadURL(`file://${__dirname}/main.html?lang=${global.launcherConfig.lang}`);
    //hide on load
    mainW.hide();
    // Open the DevTools.
    splash.webContents.openDevTools();
    mainW.on('closed', () => {
        console.log('User closed the Main window');
        ipcMain.removeAllListeners();
        app.quit();
    });

    //first if dom ready
    //then check if userData. Then check if stayConnected is set
    //if stayConnected then Load mainWindow with userData, connect the user
    //Else do the basics things(load the login page)
    splash.webContents.once("dom-ready", () => {
        let getUserStayConnected = JSON.parse(localStore.get('ifStayConnected'));
        if (getUserData.AuthKey){
            if (getUserStayConnected.stayConnected === true){
                setTimeout(function () {
                    splash.close();
                    mainW.center();
                    mainW.webContents.send('users', JSON.parse(localStore.get('users')));
                    mainW.show();
                }, 2000);
                console.log("stayConnected exist");
            }else{
                setTimeout(function () {
                    splash.close();
                    winLogin.center();
                    winLogin.show();
                }, 2000);
            }
            console.log("userdata exist");
        }
        console.log("dom-ready");
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
        }
    });
    elinu_launcher.onLoadElinuLauncher();
};

ipcMain.on("downloadUpdate", (event) => {
    !fs.existsSync(path.join(process.cwd() + "/files/")) && fs.mkdirSync(path.join(process.cwd() + "/files/"), {recursive: true})

    // Multi connections
    worker = new DownloadWorker(url, path.join(process.cwd() + `/files/${friendlyFileName}`), {
        maxConnections: 10,
        forceMultipleConnections : true,
    });
    worker.on('ready', () => {
        
        worker.on('start', () => console.log('started'))
        
        worker.on('progress', (progress) => {
            let timeRemaining = (progress.bytesPerSecond <= 0 ? "infinite" : secondsToTime((progress.totalBytes - progress.downloadedBytes) / progress.bytesPerSecond));
            let currentDl = formatBytes(progress.downloadedBytes) === "NaN undefined" ? 0 : formatBytes(progress.downloadedBytes);
            let downloadSpeed = utils.dynamicSpeedUnitDisplay(progress.bytesPerSecond, 2);
            let dlPercentage = (Math.trunc(progress.completedPercent * 100) / 100).toFixed(2);
            let totalDownloaded = formatBytes(progress.totalBytes);
            
            mainW.webContents.send("updateDownloadProgress", dlPercentage, currentDl, downloadSpeed, timeRemaining, totalDownloaded, friendlyFileName);

        });
        
        worker.on('finishing', () => console.log('Download is finishing'));
        
        worker.on('end', () => console.log('Download is done'));
        
        worker.start();
    });
    

});
ipcMain.on("pauseDownload",  (event) => {
    worker.pause();
});
//__________________

ipcMain.on("resumeDownload",  (event) => {
    worker.resume();
});

function secondsToTime(s) {
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    let str = "";

    if(hrs > 0)
        str += hrs + "h, ";

    if(mins > 0)
        str += mins + "m, ";

    return str + Math.floor(secs) + 's';
}
//winLogin.webContents.send('checkRememberMe', successMsg);

ipcMain.on('loginRequest', async (event, username, password, stayConnectedValue) => {
    try {
        //call api
        credentials = {
            userID: username,
            password: password,
        };
        let stayConnectedResponse = {
            stayConnected: stayConnectedValue
        }
        let msg = ""
        try {
            let response = await authServices.login(credentials); //from http request in authServices.js
            if (response) {
                msg = response.ReturnCode;
                if (response.msg === "success") {
                    //we store all our user data here in localstorage session
                    localStore.set('users', JSON.stringify(response));
                    localStore.set('ifStayConnected', JSON.stringify(stayConnectedResponse));
                    console.log(stayConnectedResponse);
                    //localStore.set('userStayConnected', stayConnectedResponse);
                    //send our user data to MainWindow render
                    mainW.webContents.send('users', JSON.parse(localStore.get('users')));
                    mainW.webContents.send('stayCo', JSON.parse(localStore.get('ifStayConnected')));
                    
                    let successMsg = "Successfully connected..."
                    winLogin.webContents.send('loginSuccess', successMsg);
                    
                    //redirect if success
                    setTimeout(function () {
                        winLogin.hide();
                        mainW.center();
                        mainW.show();
                    }, 1000);

                } else {
                    if(msg === 2){
                        event.reply('authError', "Enter Name and Password");
                    }
                    if(msg === 50000){
                        event.reply('authError', "Your credentials is incorrect. Please try again");
                    }                    
                }
            }
        } catch (error) {
            console.error("err " + error);
        }


    } catch (err) {
        event.reply('loginResponse', err);
    }
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

ipcMain.on('launchGame', async (event) => {
    try {

        // parse json
        const userData = JSON.parse(localStore.get('users'));

        // access elements
        let gameString =
            "{" +
            "\"last_connected_server_id\":" + userData.last_connected_server + "," +//required
            "\"chars_per_server\":\"" + userData.CharacterCount + "\"," +//required
            //"\"account_bits\":\"0x00000000\"," +
            "\"ticket\":\"" + userData.AuthKey + "\"," +//required
            //"\"result-message\":\"OK\"," +
            "\"result-code\":200," + //required
            //"\"user_permission\":0," +
            "\"game_account_name\":\"TERA\"," + //required
            //"\"access_level\":" + acclvl + "," +
            "\"master_account_name\":\"" + userData.UserNo + "\"" +//required
            "}";

        //launch game
        elinu_launcher.launchGameSync(gameString, launcherConfig.lang, (err) => {
            if (err) throw err;
            event.reply('exitGame');
        });


    } catch (err) {
        //event.reply('launchGameRes', err);
    }
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


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
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