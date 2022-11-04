//initial properties
const consoleOverlay = document.getElementById('elinu-console-console-modal-overlay');
const openConsole = document.getElementById('open-console');
const consoleFrameBox = document.getElementById('consoleFrameBox');

//consoleOverlay
consoleOverlay.style.display = "none";
consoleOverlay.style.opacity = "0";
consoleOverlay.style.transform = "scale(0.9)";

//consoleFrameBox
consoleFrameBox.style.display = "none";
consoleFrameBox.style.opacity = "0";
consoleFrameBox.style.transform = "translateY(900px)";

//onclick in Overlay, close it
consoleOverlay.addEventListener('click', (event) => {
    anime({
        targets: event.target,
        opacity:0,
        duration: 450,
        scale: 0.9,
        easing: "easeOutQuad",
        complete: function(anim) {
            consoleOverlay.style.display = "none";
        }
    });
    anime({
        targets: consoleFrameBox,
        opacity:0,
        translateY: 900,
        duration: 300,
        easing: "easeOutQuad",
        complete: function(anim) {
            consoleFrameBox.style.display = "none";
        }
    });
});

//onclick console btn, Open the modal
openConsole.addEventListener('click', (event) => {
    consoleOverlay.style.display = "flex";
    consoleFrameBox.style.display = "block";
    anime({
        targets: consoleOverlay,
        opacity:1,
        scale: 1,
        duration: 450,
        easing: "easeOutQuad",
        begin: function(anim) {

        },
        complete: function(anim) {
            //consoleFrameBox.style.display = "none";
        }
    });

    anime({
        targets: consoleFrameBox,
        opacity:1,
        translateY: 0,
        duration: 300,
        easing: "easeOutQuad",
        complete: function(anim) {
        }
    });

});

//==================
//news item animation
const buttonEl = document.querySelectorAll(".news-link");

function animateButton(el, scale, duration) {
    anime.remove(el);
    anime({
        targets: el,
        scale: scale,
        duration: duration,
    });
}

function enterButton(el) {
    animateButton(el, 1.1, 100);
}

function leaveButton(el) {
    animateButton(el, 1.0, 100);
}
for (let i = 0; i < buttonEl.length; i++) {
    buttonEl[i].addEventListener(
        "mouseenter",
        function (e) {
            enterButton(e.target);
        },
        false
    );

    buttonEl[i].addEventListener(
        "mouseleave",
        function (e) {
            leaveButton(e.target);
        },
        false
    );
}

//btn play animation
const btn = document.getElementById("btn-play");
btn.addEventListener("mouseenter", function (e) {
    const animate = anime({
        targets: e.target,
        scale: 1.1,
        duration: 100,
        easing: "easeInOutSine",
    });
});
btn.addEventListener("mouseleave", function (e) {
    const animate = anime({
        targets: e.target,
        scale: 1.0,
        duration: 100,
        easing: "easeInOutSine",
    });
});