import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from 'xterm-addon-webgl';
import { lib } from "libapps"

const terminal = new Terminal()
terminal.loadAddon(new FitAddon());
terminal.loadAddon(new WebLinksAddon());

export class Xterm {
    elem: HTMLElement;
    term: Terminal;
    resizeListener: () => void;
    decoder: lib.UTF8Decoder;

    message: HTMLElement;
    messageTimeout: number;
    messageTimer: number;


    constructor(elem: HTMLElement) {
        this.elem = elem;
        this.term = new Terminal();
        const fitAddon = new FitAddon();
        this.term.loadAddon(fitAddon);
        const webLinksAddon = new WebLinksAddon();
        this.term.loadAddon(webLinksAddon);

        if (elem.ownerDocument) {
            this.message = elem.ownerDocument.createElement("div") ;
        }
        this.message.className = "xterm-overlay";
        this.messageTimeout = 2000;


        this.resizeListener = () => {
            fitAddon.fit();
            this.term.scrollToBottom();
            this.showMessage(String(this.term.cols) + "x" + String(this.term.rows), this.messageTimeout);
        };

        this.term.open(elem);
	this.term.focus();
	this.resizeListener();
	window.addEventListener("resize", () => { this.resizeListener(); });

        this.decoder = new lib.UTF8Decoder()
    };

    info(): { columns: number, rows: number } {
        return { columns: this.term.cols, rows: this.term.rows };
    };

    output(data: string) {
        this.term.write(this.decoder.decode(data));
    };

    showMessage(message: string, timeout: number) {
        this.message.textContent = message;
        this.elem.appendChild(this.message);

        if (this.messageTimer) {
            clearTimeout(this.messageTimer);
        }
        if (timeout > 0) {
            this.messageTimer = window.setTimeout(() => {
                this.elem.removeChild(this.message);
            }, timeout);
        }
    };

    removeMessage(): void {
        if (this.message.parentNode == this.elem) {
            this.elem.removeChild(this.message);
        }
    }

    setWindowTitle(title: string) {
        document.title = title;
    };

    setPreferences(value: object) {
    var color = new Array(5);
    var palette = new Array(16);
        Object.keys(value).forEach((key) => {
            if (key == "EnableWebGL" && key) {
                this.term.loadAddon(new WebglAddon());
            } else if (key == "font-size") {
                this.term.setOption("fontSize", value[key])
            } else if (key == "font-family") {
                this.term.setOption("fontFamily", value[key])
            } else if (key == "width") {
                this.term.setOption("cols", value[key])
            } else if (key == "height") {
                this.term.setOption("rows", value[key])
            } else if (key == "cursor-blink") {
                this.term.setOption("cursorBlink", value[key])
            } else if (key == "cursor-style") {
                this.term.setOption("cursorStyle", value[key])
            } else if (key == "scrollback-lines") {
                this.term.setOption("scrollback", value[key])
            } else if (key == "foreground-color") {
	color[0] = value[key]
            } else if (key == "background-color") {
	color[1] = value[key]
            } else if (key == "cursor-color") {
	color[2] = value[key]
            } else if (key == "cursor-accent") {
	color[3] = value[key]
            } else if (key == "selection-color") {
	color[4] = value[key]
            } else if (key == "color-palette-overrides") {
	palette = value[key]
            }
        });
    this.term.setOption("theme", {
	foreground:	color[0],
	background:	color[1],
	cursor:		color[2],
	cursorAccent:	color[3],
	selection:	color[4],
	black:		palette[0],
	red:		palette[1],
	green:		palette[2],
	yellow:		palette[3],
	blue:		palette[4],
	magenta:	palette[5],
	cyan:		palette[6],
	white:		palette[7],
	brightBlack:	palette[8],
	brightRed:	palette[9],
	brightGreen:	palette[10],
	brightYellow:	palette[11],
	brightBlue:	palette[12],
	brightMagenta:	palette[13],
	brightCyan:	palette[14],
	brightWhite:	palette[15]
    })
    }


    onInput(callback: (input: string) => void) {
        this.term.onData(data => {
            callback(data);
        });
    };

    onResize(callback: (columns: number, rows: number) => void) {
	this.term.onResize(data => {
        	callback(data.cols, data.rows);
	});
    };

    deactivate(): void {
        this.term.blur();
    }

    reset(): void {
        this.removeMessage();
        this.term.clear();
    }

    close(): void {
        window.removeEventListener("resize", this.resizeListener);
        this.term.dispose();
    }
}
