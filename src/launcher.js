const ffi = require('ffi-napi');
const SLS_URL = "https://tera-elinu.eu/server/serverlist";
const {app, BrowserWindow, ipcMain, dialog, globalShortcut} = require('electron');
const Store = require('electron-store');


const localStore = new Store();
let teraLauncher;

const loadElinuLib = () => {
    try {
        teraLauncher = ffi.Library('./ElinuLauncher.dll', {
            'LaunchGame': [
                'void', ['string', 'string']
            ],
            'RegisterMessageListener': [
                'void', ['pointer']
            ],
            'SendMessageToClient': [
                'void', ['string', 'string']
            ]
        });
    } catch (e) {
        console.log("ElinuLauncher.dll not found!")
        const options = {
            type: 'error',
            message: "ElinuLauncher.dll not found!",
            buttons: ['OK'],
            title: 'Warning',
        };
        dialog.showMessageBox(BrowserWindow.getAllWindows()[0], options).then((res) => {
            //when button "OK" clicked
            if(res.response === 0){
                app.quit();
            }
        });
    }
}
// Some APIs can only be used after this event occurs.
app.on('ready', loadElinuLib);

function registerMessageListener(listener) {
    let cb = ffi.Callback('void', ['string', 'int'], listener);
    try {
        teraLauncher.RegisterMessageListener(cb);
    } catch (e) {

    }
    return cb;
}

function launchGameSync(gamestr, lang) {
    try {
        teraLauncher.LaunchGame(SLS_URL + "." + lang, gamestr);
    } catch (e) {

    }

}

function sendMessageToClient(msg, content) {
    try {
        teraLauncher.SendMessageToClient(msg, content);
    } catch (e) {

    }
    
}


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
        launchGameSync(gameString, global.launcherConfig.lang, (err) => {
            if (err) throw err;
            event.reply('exitGame');
        });


    } catch (err) {
        //event.reply('launchGameRes', err);
    }
});


function onLoadElinuLauncher() {
    console.log("launcher js loaded...")
}

module.exports = {onLoadElinuLauncher, registerMessageListener, sendMessageToClient};