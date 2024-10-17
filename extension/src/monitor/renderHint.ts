import '../panel/global.css'
import './hint.css'
import hintHtmlTemplate from './hint.html'

const basePath = window.document.documentElement.dataset.__zodiacPilotBasePath
if (!basePath) throw new Error('__zodiacPilotBasePath not set')
const hintHtml = hintHtmlTemplate.replace(/\{\{BASE_PATH\}\}/g, basePath)

window.addEventListener('beforeunload', () => {
  dismissHint()
})

window.addEventListener('ZodiacPilot:monitor:reload', (ev) => {
  dismissHint()
  window.location.reload()
  ev.stopImmediatePropagation()
})

window.addEventListener('ZodiacPilot:monitor:dismiss', () => {
  dismissHint()
})

let shadow: ShadowRoot | null = null

function renderToShadow(hint: string) {
  if (shadow) shadow.innerHTML = ''
  if (!shadow) {
    const shadowHost = document.createElement('div')
    shadow = shadowHost.attachShadow({ mode: 'open' })
    const body = window.document.body || window.document.documentElement
    body.appendChild(shadowHost)
  }

  const container = document.createElement('div')
  container.innerHTML = hintHtml
  const template = container.firstElementChild as HTMLTemplateElement
  template.content.getElementById('message')!.innerHTML = hint
  shadow.appendChild(template.content)
}

export function renderConnectHint() {
  renderToShadow('Reload the page to connect Zodiac Pilot.')
  // TODO we keep it disabled for now just to go sure it will actually work and won't interfere with the declarative net request rules
  // addPrerenderRule()
}

export function renderDisconnectHint() {
  renderToShadow('Zodiac Pilot disconnected<br/>Reload the page to continue.')
  // TODO we keep it disabled for now just to go sure it will actually work and won't interfere with the declarative net request rules
  // addPrerenderRule()
}

export function dismissHint() {
  if (shadow) shadow.innerHTML = ''
  // TODO we keep it disabled for now just to go sure it will actually work and won't interfere with the declarative net request rules
  // removePrerenderRule()
}

// let specScript: HTMLScriptElement | null = null

/** Adds a prerender rule for the current href so the reload will be instant */
// function addPrerenderRule() {
//   if (specScript) specScript.remove()
//   specScript = document.createElement('script')
//   specScript.type = 'speculationrules'
//   const specRules = {
//     prefetch: [
//       {
//         source: 'list',
//         urls: [window.location.href],
//         eagerness: 'immediate',
//       },
//     ],
//   }
//   specScript.textContent = JSON.stringify(specRules)
//   document.body.append(specScript)
// }

// function removePrerenderRule() {
//   if (specScript) specScript.remove()
//   specScript = null
// }