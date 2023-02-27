import { WebContainer } from "@webcontainer/api";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

import { files } from "./files";

export class WebContainerTerminal {
  private terminal!: Terminal;
  private webcontainerInstance!: WebContainer;
  options!: { terminalEl: HTMLElement | string; editorEl: HTMLTextAreaElement | string; iframeEl: HTMLIFrameElement | string };
  constructor(options: WebContainerTerminal["options"]) {
    this.options = Object.assign({}, options);
    this.initContainer();
    this.initTerminal();
    // return this;
  }

  /**
   * 初始化web容器
   */
  async initContainer() {
    let { editorEl } = this.options;
    editorEl = typeof editorEl === "string" ? (document.querySelector(editorEl) as HTMLTextAreaElement) : editorEl;
    window.addEventListener("load", async () => {
      this.webcontainerInstance = await WebContainer.boot();
      this.webcontainerInstance.mount(files);
      (editorEl as HTMLTextAreaElement).value = await this.webcontainerInstance.fs.readFile("index.js", "utf-8");

      const exitCode = await this.installDependencies();
      if (exitCode !== 0) {
        throw new Error("Installation failed");
      }
      this.startDevServe();
      this.startShell();
      this.writeFile();
    });
  }

  /**
   * 初始化终端
   */
  initTerminal() {
    let { terminalEl } = this.options;
    terminalEl = typeof terminalEl === "string" ? (document.querySelector(terminalEl) as HTMLElement) : terminalEl;
    if (!terminalEl) {
      return console.error("元素节点不存在");
    }
    try {
      this.terminal = new Terminal({
        convertEol: true,
      });
      this.terminal.open(terminalEl as HTMLElement);
    } catch (error) {
      console.error("初始化终端错误", error);
    }
  }

  /**
   * 安装依赖
   */
  async installDependencies() {
    const _this = this;
    const installProcess = await this.webcontainerInstance.spawn("npm", ["install"]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          _this.terminal.write(data);
        },
      })
    );
    return installProcess.exit;
  }

  async startDevServe() {
    const _this = this;

    const serverProcess = await this.webcontainerInstance.spawn("npm", ["run", "start"]);
    serverProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          _this.terminal.write(data);
        },
      })
    );
    this.webcontainerInstance.on("server-ready", (port, url) => {
      let { iframeEl } = this.options;
      iframeEl = typeof iframeEl === "string" ? (document.querySelector(iframeEl) as HTMLIFrameElement) : iframeEl;
      iframeEl.src = url;
    });
  }

  async startShell() {
    const _this = this;
    const shellProcess = await this.webcontainerInstance.spawn("jsh");
    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          _this.terminal.write(data);
        },
      })
    );
    const writer = shellProcess.input.getWriter();
    this.terminal.onData((data) => {
      writer.write(data);
    });
  }

  writeFile() {
    let { editorEl } = this.options;
    editorEl = typeof editorEl === "string" ? (document.querySelector(editorEl) as HTMLTextAreaElement) : editorEl;

    (editorEl as HTMLTextAreaElement).addEventListener("input", async (e) => {
      await this.webcontainerInstance.fs.writeFile("index.js", (e?.currentTarget as EventTarget)?.value as string);
    });
  }
}
