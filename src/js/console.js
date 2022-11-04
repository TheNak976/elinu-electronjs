const term = new Terminal({
    cursorBlink: "bar",
    rows:26,
    cols: 59,
    theme: {
        background: '#212121'
    }
});


term.open(document.getElementById('terminal'));

term.writeln(_TEXT_TRANSLATE_LABEL("UI_TEXT_MAIN_WELCOME_CONSOLE"));

function consoleWrite(str) {
    term.prompt = () => {
        term.write(`\r\n\u001b[32m[ElinuLauncher]-> \u001b[37m` + str);
    };
    term.prompt();
}