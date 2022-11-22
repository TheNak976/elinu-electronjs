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
elementSetInnerHtml("no-update","You can launch the game");

//gameMsgBox initial state
gameMsgBox.style.display = "none";
gameMsgBox.style.opacity = "0";
gameMsgBox.style.transform = "scale(0)";

let onUpdate =  0;

//lang stuff
if(document.getElementsByClassName('langSelected')){
    for(let el of document.getElementsByClassName('langSelected')) {
        el.addEventListener('click', selectLanguage);
    }
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
    gameMsg.innerHTML = "Game Launching...";
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
    gameBtnStr.innerHTML = "Game Launching...";
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
        gameMsg.innerHTML = "Game running...";
        gameBtnStr.innerHTML = "Game running...";
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
            gameMsg.innerHTML = "Game Client Closed";
            consoleWrite("You have left the game, see you soon!");
            showLaunchBtn();
        }
        if (terminationCode === 65535) {
            gameMsg.innerHTML = "Game Client Crashed! Look at your console";
            consoleWrite("You have voluntarily closed the game!");
            showLaunchBtn();
        }
        if (terminationCode === 6) {
            gameMsg.innerHTML = "Game Client Crashed! Look at your console";
            consoleWrite("Oupss, there is a Abnormal Problem with your DataCenterFile!");
            showLaunchBtn();
        }
        if (terminationCode === 10) {
            gameMsg.innerHTML = "Game Client Crashed! Look at your console";
            consoleWrite("There is a Problem with your Language Settings!");
            showLaunchBtn();
        }
        if (terminationCode === 131347) {
            gameMsg.innerHTML = "Game Client Crashed! Look at your console";
            consoleWrite("There is a Problem with your GameString Settings!");
            showLaunchBtn();
        }
        if (terminationCode === 196881) {
            gameMsg.innerHTML = "ServerList Problem ?!? SlsUrl Problem";
            consoleWrite("There is a Problem with your Serverlist Settings!");
            showLaunchBtn();
        }
        if (terminationCode === 26476817) {
            gameMsg.innerHTML = "ServerList Problem! File not found!";
            consoleWrite("ServerList Problem! File not found!");
            showLaunchBtn();
        }
        if (terminationCode === 3277521153) {
            gameMsg.innerHTML = "Server Problem! Invalid login Request!";
            consoleWrite("Invalid login Request! Restart your launcher, logout from launcher and login again!");
            showLaunchBtn();
        }
        
        consoleWrite(`Game Client Closed with code: ${terminationCode}`);
    }
});


function showLaunchBtn() {
    enableBtnPlay();
    gameBtnStr.innerHTML = "LAUNCH GAME";
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
    console.log(user)
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
    elinuFriendlyFileName.innerHTML = "Updates:";
});
ipcRenderer.on("downloadCompleted", (event) => {
    elementSetInnerHtml("no-update",`Extracting file on progress...`);
    pauseDl.style.display = "none";
});

ipcRenderer.on("extractingStart", (event, currentFiles, fileCount) =>{
    ringLoadingBox.style.display = "none";
    updateEtaStr.style.display = "none";

    let percent = Math.min(Math.floor(currentFiles / fileCount * 100), 100);

    document.getElementById("progressbar").style.width = percent+ "%"; 
    
    elementSetDisplay("no-update","block");
    
    elementSetInnerHtml("no-update",`Extracting file ${currentFiles} of ${fileCount}...`);
    
});
ipcRenderer.on("extractingDone", (event) =>{
    setTimeout(function () {
        enableBtnPlay();
        gameBtnStr.innerHTML = "LAUNCH GAME";
        ifNoUpdateDisplayThis();
        enableLangSwitchOnUpdate();
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


function downloadUpdates() {
    pauseDl.style.display = "block";
    disableLangSwitchOnUpdate();
    elementSetDisplay("no-update","none");
    disableBtnPlay();
    gameBtnStr.innerHTML = "Download in progress...";
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
    elementSetInnerHtml("no-update","You can launch the game");
}

function ifUpdateDisplayThis(){
    updateEtaStr.style.display = "flex";
    ringLoadingBox.style.display = "block";
    elementSetDisplay("no-update","none");
    disableBtnPlay();
}