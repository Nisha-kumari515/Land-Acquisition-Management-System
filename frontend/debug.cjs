const { JSDOM } = require('jsdom');
const virtualConsole = new (require('jsdom')).VirtualConsole();
virtualConsole.on("error", () => { console.error("VC ERROR:", ...arguments); });
virtualConsole.on("warn", () => { console.warn("VC WARN:", ...arguments); });
virtualConsole.on("info", () => { console.info("VC INFO:", ...arguments); });
virtualConsole.on("dir", () => { console.dir("VC DIR:", ...arguments); });
virtualConsole.on("log", () => { console.log("VC LOG:", ...arguments); });
virtualConsole.on("jsdomError", (e) => { console.error("JSDOM ERROR:", e.message, e.detail); });

JSDOM.fromURL("http://localhost:5173/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  dom.window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error("WINDOW ERROR:", msg, error);
  };
  setTimeout(() => {
    console.log("Body HTML:", dom.window.document.body.innerHTML);
    process.exit(0);
  }, 3000);
}).catch(err => {
    console.error("FETCH ERROR", err);
});
