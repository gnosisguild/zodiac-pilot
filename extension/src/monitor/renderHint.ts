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
}

export function renderDisconnectHint() {
  renderToShadow('Zodiac Pilot disconnected<br/>Reload the page to continue.')
}

export function dismissHint() {
  if (shadow) shadow.innerHTML = ''
}
