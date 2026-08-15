const { JSDOM } = require('jsdom');
const fs = require('fs');
const jsCode = fs.readFileSync('dist/assets/' + fs.readdirSync('dist/assets').find(f => f.endsWith('.js')), 'utf-8');

const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`, {
  runScripts: "dangerously",
  url: "http://localhost/"
});

dom.window.console.log = (...args) => console.log('LOG:', ...args);
dom.window.console.error = (...args) => console.error('ERROR:', ...args);
dom.window.console.warn = (...args) => console.warn('WARN:', ...args);

try {
  const scriptEl = dom.window.document.createElement("script");
  scriptEl.textContent = jsCode;
  dom.window.document.head.appendChild(scriptEl);
} catch (e) {
  console.error("Caught error:", e);
}
