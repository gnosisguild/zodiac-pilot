import { BadgeIcon, ZodiacPaper } from 'zodiac-ui-components'
import './App.css'

function App() {
  return (
    <div className="container">
      <main className="main">
        <section className="descriptionContainer">
          <ZodiacPaper>
            <div className="description">
              <h1>Zodiac Pilot</h1>
              <p>
                A Chrome extension for building transactions for your Gnosis
                Safe.
              </p>
              <ul>
                <li>Batch several transactions together to save on gas</li>
                <li>Simulate every transaction with Tenderly</li>
                <li>
                  Compatible with Zodiac mods for any kind of Safe architecture
                </li>
                <li>
                  Submit transactions directly to the Safe for easy signing
                </li>
              </ul>
              <a
                className="button"
                href="https://chrome.google.com/webstore/detail/zodiac-pilot/jklckajipokenkbbodifahogmidkekcb"
              >
                Install Extension
              </a>
            </div>
          </ZodiacPaper>
        </section>
        <section className="demo">
          <div className="videoContainer">
            <video
              src="pilot-demo.mp4"
              loop
              muted
              autoPlay
              poster="pilot-demo-start.jpg"
            ></video>
          </div>
        </section>
      </main>
      <footer>
        <div className="links">
          <a href="https://discord.gg/tXugWAMX">
            <img alt="discord" src="discord.svg" />
          </a>
          <a href="https://github.com/gnosis/zodiac-pilot">
            <img alt="github" src="github.svg" />
          </a>
        </div>
        <a href="https://gnosisguild.org" className="guild-badge">
          <BadgeIcon icon="zodiac" size={34} /> <p>Built by Gnosis Guild</p>
        </a>
      </footer>
    </div>
  )
}

export default App
