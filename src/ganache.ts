import ganache from 'ganache'
// Ganache and @ethereum/vm use eval and wasm-eval so we cannot run it in an extension page or a background script.
// The only way we can use it is via a Sandbox page (https://developer.chrome.com/docs/extensions/mv3/manifest/sandbox/).
// So this script is loaded from ganache.html which is embedded as an iframe into the extension page, communication happens via postMessage.

console.log('GANACHE', ganache.provider)
