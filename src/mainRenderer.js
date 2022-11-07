let gameMsgBox = document.getElementById("gameMsgBox");
let gameMsg = document.getElementById("gameMsg");
let gameBtnStr = document.getElementById("launchGameString");
let gameBtn = document.getElementById("play-game");
let btnPlay = document.getElementById("btn-play");
let updateEtaStr = document.querySelector(".main-page-textetat")
let ringLoadingBox = document.querySelector(".ring-loading-box")



//gameMsgBox
gameMsgBox.style.display = "none";
gameMsgBox.style.opacity = "0";
gameMsgBox.style.transform = "scale(0)";

function preLaunchGame() {
    //ipcRenderer.send("launchGame");
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
            gameBtnStr.innerHTML = "LAUNCH GAME";
            enableBtnPlay();
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
            consoleWrite("Game Client Closed");
        }
        if (terminationCode === 6) {
            gameMsg.innerHTML = "Game Client Crashed! Look at your console";
            consoleWrite("Oupss, there is a Abnormal Problem with your DataCenterFile!");
        }
        if (terminationCode === 10) {
            gameMsg.innerHTML = "Game Client Crashed! Look at your console";
            consoleWrite("There is a Problem with your Language Settings!");
        }
        if (terminationCode === 131347) {
            gameMsg.innerHTML = "Game Client Crashed! Look at your console";
            consoleWrite("There is a Problem with your GameString Settings!");
        }
        if (terminationCode === 196881) {
            gameMsg.innerHTML = "ServerList Problem ?!? SlsUrl Problem";
            consoleWrite("There is a Problem with your Serverlist Settings!");
        }
        if (terminationCode === 26476817) {
            gameMsg.innerHTML = "ServerList Problem! File not found!";
            consoleWrite("ServerList Problem! File not found!");
        }
        consoleWrite(terminationCode);
        
    }
});


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
    
    document.getElementById("jaugeprogress").style.width = dlPercentage+ "%";
    document.getElementById("ringProgressText").innerHTML= dlPercentage+ "%";
    
    elinuCurrentDl.innerHTML = currentDl;
    elinuDownloadSpeed.innerHTML = downloadSpeed;
    elinuTimeRemaining.innerHTML = timeRemaining;
    elinuTotalDownloaded.innerHTML = totalDownloaded;
    elinuFriendlyFileName.innerHTML = friendlyFileName;
});
ipcRenderer.on("downloadCompleted", (event) => {
    enableBtnPlay();
    gameBtnStr.innerHTML = "LAUNCH GAME";
    ifNoUpdateDisplayThis();
});

ipcRenderer.on("noUpdate", (event) => {
    //onLoad hide dl stats
    ifNoUpdateDisplayThis();
});

ipcRenderer.on("serverStatus", (event, status) => {
    let serverStatsText = document.querySelector(".serverStatsText")
    
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
    elementSetDisplay("no-update","none");
    disableBtnPlay();
    gameBtnStr.innerHTML = "Updates in progress...";
    updateEtaStr.style.display = "flex";
    ringLoadingBox.style.display = "block";
    ipcRenderer.send("downloadUpdate");
}
function pauseDownload() {
ipcRenderer.send("pauseDownload");
    
}
function resumeDownload() {
ipcRenderer.send("resumeDownload");
}
function ifNoUpdateDisplayThis() {
    ringLoadingBox.style.display = "none";
    updateEtaStr.style.display = "none";
    elementSetDisplay("no-update","block");
    elementSetInnerHtml("no-update","You can launch the game");
}