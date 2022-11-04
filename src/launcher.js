const ffi = require('ffi-napi');
const SLS_URL = "https://tera-elinu.eu/server/serverlist";
const {app, dialog, BrowserWindow} = require('electron');

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

function onLoadElinuLauncher() {
    console.log("launcher js loaded...")
}

module.exports = {onLoadElinuLauncher, launchGameSync, registerMessageListener, sendMessageToClient};