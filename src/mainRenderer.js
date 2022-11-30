let gameMsgBox = document.getElementById("gameMsgBox");
let gameMsg = document.getElementById("gameMsg");
let gameBtnStr = document.getElementById("launchGameString");
let gameBtn = document.getElementById("play-game");
let btnPlay = document.getElementById("btn-play");
let updateEtaStr = document.querySelector(".main-page-textetat")
let ringLoadingBox = document.querySelector(".ring-loading-box")
let pauseDl = document.getElementById("pauseDl");
let resumeDl = document.getElementById("resumeDl");

//progressGauge initial state
ringLoadingBox.style.display = "none";
updateEtaStr.style.display = "none";
document.getElementById("progressbar").style.width = 100 + "%";
elementSetDisplay("no-update","block");
_TEXT_TRANSLATE(gameBtnStr, 'UI_TEXT_MAIN_LAUNCH_GAME');

//gameMsgBox initial state
gameMsgBox.style.display = "none";
gameMsgBox.style.opacity = "0";
gameMsgBox.style.transform = "scale(0)";



//lang stuff
if(document.getElementsByClassName('langSelected')){
    for(let el of document.getElementsByClassName('langSelected')) {
        el.addEventListener('click', selectLanguage);
    }
}


if(params.get('users')){
    let user = JSON.parse(params.get('users'));
    document.getElementById("user").innerHTML = capitalize(user.username);
    document.getElementById("userBalance").innerHTML = user.balance;
}

function selectLanguage(event) {
    ipcRenderer.send('langSelected', this.dataset.elinulang);
}

function preLaunchGame() {
    ipcRenderer.send("launchGame");
    gameMsgBox.style.display = "flex";
    
    //gameMsgText and gameMsgBox
    let gameMsgText = document.querySelector(".gameMsgText");
    gameMsgText.classList.add("green");
    disableBtnPlay();
    _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_GAME_LAUNCHING');
    anime({
        targets: gameMsgBox,
        opacity:1,
        duration: 350,
        scale: 1,
        easing: "easeOutQuad",
        complete: function(anim) {
            //consoleOverlay.style.display = "none";
        }
    });
    
    //gameBtnLaunch
    _TEXT_TRANSLATE(gameBtnStr, 'UI_TEXT_MAIN_GAME_LAUNCHING');
    gameMsgText.classList.add("green");
    consoleWrite("Game Launching...");
}

ipcRenderer.on("gameCannotLaunch", (event, message, code) => {
    console.log(`gameCannotLaunch: ${message}|${code}`)
    showLaunchBtn();
});

function doLogout(){
    ipcRenderer.send("logout");
}
//client Game Event message
ipcRenderer.on("gameEventMessage", (event, message, code) => {
    if (code === 1001) {
        _TEXT_TRANSLATE(gameBtnStr, 'UI_TEXT_MAIN_GAME_RUNNING');
        _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_GAME_RUNNING');
        consoleWrite("Game started");
    }
    if (code === 1002) {
        consoleWrite("Loading ServerList...");
    }
    if (code === 1003) {
        consoleWrite("Connecting to Server...");
    }
    if (code === 1004) {
        consoleWrite("Entry into the Character Selection...");
    }
    if (code === 1006) {
        consoleWrite("Back to Serverlist...");
    }
    if (code === 1011) {
        consoleWrite("Entering in game...");
    }
    if (code === 1012) {
        consoleWrite("Leaving the game...");
    }
    consoleWrite(code);
});


function disableBtnPlay() {
    //gameBtnStr.innerHTML = "Game Launching...";
    btnPlay.classList.add("disableBtnPlay");
    gameBtnStr.classList.add("disableBtnPayText");
    gameBtn.classList.add("disableClick");
}
function enableBtnPlay() {
    //gameBtnStr.innerHTML = "LAUNCH GAME";
    gameBtn.classList.remove("disableClick");
    btnPlay.classList.remove("disableBtnPlay");
    gameBtnStr.classList.remove("disableBtnPayText");
}

//client GameEnd message
ipcRenderer.on("gameEndMessage", (event, message, code) => {

    if (message === "endPopup") {
        
        let terminationCode = code & 0xffff;
        if (terminationCode === 7) return;
        if (terminationCode === 0) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_GAME_CLIENT_CLOSED');
            //"UI_TEXT_MAIN_GAME_CLIENT_CLOSED" : "Game Client Closed"
            consoleWrite("You have left the game, see you soon!");
            showLaunchBtn();
        }
        if (terminationCode === 65535) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_PLAYER_CLOSED_THE_GAME');
            //"UI_TEXT_MAIN_PLAYER_CLOSED_THE_GAME" : "Game Client Crashed! You closed the game"
            consoleWrite("You have voluntarily closed the game!");
            showLaunchBtn();
        }
        if (terminationCode === 6) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_DATACENTER_PROBLEM');
            //"UI_TEXT_MAIN_DATACENTER_PROBLEM" : "Game Client Crashed! DataCenterFile Problem"
            consoleWrite("Oupss, there is a Abnormal Problem with your DataCenterFile!");
            showLaunchBtn();
        }
        if (terminationCode === 10) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_LANGUAGE_SETTINGS_PROBLEM');
            //"UI_TEXT_MAIN_LANGUAGE_SETTINGS_PROBLEM" : "Game Client Crashed! Language Settings Problem"
            consoleWrite("There is a Problem with your Language Settings!");
            showLaunchBtn();
        }
        if (terminationCode === 131347) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_GAME_SETTINGS_PROBLEM');
            //"UI_TEXT_MAIN_GAME_SETTINGS_PROBLEM" : "GameString Settings Problem"
            consoleWrite("There is a Problem with your GameString Settings!");
            showLaunchBtn();
        }
        if (terminationCode === 196881) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_SLS_URL_PROBLEM');
            //"UI_TEXT_MAIN_SLS_URL_PROBLEM" : "ServerList Problem ?!? SlsUrl Problem"
            consoleWrite("There is a Problem with your Serverlist Settings!");
            showLaunchBtn();
        }
        if (terminationCode === 26476817) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_SLS_FILE_NOT_FOUND');
            //"UI_TEXT_MAIN_SLS_FILE_NOT_FOUND" : "ServerList Problem! File not found!"
            consoleWrite("ServerList Problem! File not found!");
            showLaunchBtn();
        }
        if (terminationCode === 3277521153) {
            _TEXT_TRANSLATE(gameMsg, 'UI_TEXT_MAIN_INVALID_LOGIN_REQUEST');
            //"UI_TEXT_MAIN_INVALID_LOGIN_REQUEST" : "Server Problem! Invalid login Request!"
            consoleWrite("Invalid login Request! Restart your launcher, logout from launcher and login again!");
            showLaunchBtn();
        }
        
        consoleWrite(`Game Client Closed with code: ${terminationCode}`);
    }
});


function showLaunchBtn() {
    enableBtnPlay();
    _TEXT_TRANSLATE(gameBtnStr, 'UI_TEXT_MAIN_LAUNCH_GAME');
    setTimeout(function () {
        anime({
            targets: gameMsgBox,
            opacity:0,
            duration: 350,
            scale: 0,
            easing: "easeOutQuad",
            complete: function(anim) {
                gameMsgBox.style.display = "none";
            }
        });
    }, 5000);
}

//reCheck userData
ipcRenderer.send("userCheck");

//getUserData
ipcRenderer.on("users", (event, user) => {
    document.getElementById("user").innerHTML = capitalize(user.username);
    //userBalance
    document.getElementById("userBalance").innerHTML = user.balance;
    
});

//check if user want to stay connected
ipcRenderer.on("stayCo", (event, userStayConnected) => {
    console.log(userStayConnected)
});

ipcRenderer.on("updateDownloadProgress", (event, dlPercentage, currentDl, downloadSpeed, timeRemaining, totalDownloaded, friendlyFileName ) => {
    let elinuCurrentDl = document.getElementById("currentDl");
    let elinuDownloadSpeed = document.getElementById("downloadSpeed");
    let elinuTimeRemaining = document.getElementById("timeRemaining");
    let elinuTotalDownloaded = document.getElementById("totalDownloaded");
    let elinuFriendlyFileName = document.getElementById("fileName");
    
    document.getElementById("progressbar").style.width = dlPercentage+ "%";
    document.getElementById("ringProgressText").innerHTML= dlPercentage+ "%";
    
    elinuCurrentDl.innerHTML = currentDl + "/";
    elinuDownloadSpeed.innerHTML = downloadSpeed;
    elinuTimeRemaining.innerHTML = timeRemaining;
    elinuTotalDownloaded.innerHTML = totalDownloaded;
    _TEXT_TRANSLATE(elinuFriendlyFileName, 'UI_TEXT_MAIN_UPDATE_STR');
});
ipcRenderer.on("downloadCompleted", (event) => {
    _TEXT_TRANSLATE(document.getElementById("no-update"), 'UI_TEXT_MAIN_EXTRACT_ON_PROGRESS');
    pauseDl.style.display = "none";
});

ipcRenderer.on("extractingStart", (event, currentFiles, fileCount) =>{
    ringLoadingBox.style.display = "none";
    updateEtaStr.style.display = "none";

    let percent = Math.min(Math.floor(currentFiles / fileCount * 100), 100);

    document.getElementById("progressbar").style.width = percent+ "%"; 
    
    elementSetDisplay("no-update","block");
    
    let extractTranslateStrings =  window.langStrings[window.language]["UI_TEXT_MAIN_EXTRACT_PROGRESS_STRINGS"]
        .replace('${currentFiles}', currentFiles)
        .replace('${fileCount}', fileCount);
    
    elementSetInnerHtml("no-update", extractTranslateStrings);
    
});
ipcRenderer.on("extractingDone", (event) =>{
    setTimeout(function () {
        enableBtnPlay();
        _TEXT_TRANSLATE(gameBtnStr, 'UI_TEXT_MAIN_LAUNCH_GAME');
        ifNoUpdateDisplayThis();
        enableLangSwitchOnUpdate();
        
        //notify app.js that updates done
        ipcRenderer.send("updateExtractingDone");
    }, 3000);
});

ipcRenderer.on("noUpdate", (event) => {
    //onLoad hide dl stats
    ifNoUpdateDisplayThis();
});

ipcRenderer.on("serverStatus", (event, status) => {
    let serverStatsText = document.querySelector(".serverStatsText");
    
    if (status.online === true){
        serverStatsText.classList.remove("red");
        serverStatsText.classList.add("green");
        serverStatsText.innerHTML = "Server is Online";

    }else{
        serverStatsText.classList.remove("green");
        serverStatsText.classList.add("red");
        serverStatsText.innerHTML = "Server is Offline";

    }
});


ipcRenderer.on("processingUpdate", (event) => {
    downloadUpdates();
});

function downloadUpdates() {
    pauseDl.style.display = "block";
    disableLangSwitchOnUpdate();
    elementSetDisplay("no-update","none");
    disableBtnPlay();
    _TEXT_TRANSLATE(gameBtnStr, 'UI_TEXT_MAIN_DOWNLOAD_PROGRESS');
    updateEtaStr.style.display = "flex";
    ringLoadingBox.style.display = "block";
    ipcRenderer.send("downloadUpdate");
}
function pauseDownload() {
    pauseDl.style.display = "none";
    resumeDl.style.display = "block";
    ipcRenderer.send("pauseDownload");
    
}
function resumeDownload() {
    pauseDl.style.display = "block";
    resumeDl.style.display = "none";
    ipcRenderer.send("resumeDownload");
}

function disableLangSwitchOnUpdate(){
    document.getElementById("switchLang").style.pointerEvents = "none";
}
function enableLangSwitchOnUpdate(){
    document.getElementById("switchLang").style.pointerEvents = "visible";
}
function ifNoUpdateDisplayThis() {
    ringLoadingBox.style.display = "none";
    updateEtaStr.style.display = "none";
    document.getElementById("progressbar").style.width = 100 + "%";
    elementSetDisplay("no-update","block");
    _TEXT_TRANSLATE(document.getElementById("no-update"), 'UI_TEXT_MAIN_USER_CAN_LAUNCH_GAME');
}

function ifUpdateDisplayThis(){
    updateEtaStr.style.display = "flex";
    ringLoadingBox.style.display = "block";
    elementSetDisplay("no-update","none");
    disableBtnPlay();
}