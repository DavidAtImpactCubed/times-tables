interface Props {
  onBack: () => void
}

/** A small credits page, reached from the landing screen. */
export function CreditsScreen({ onBack }: Props) {
  return (
    <div className="screen credits-screen" data-testid="credits">
      <header className="credits-header">
        <button className="btn btn-round" onClick={onBack} aria-label="Back" data-testid="credits-back">
          ↩
        </button>
        <h1>Credits</h1>
      </header>

      <div className="credits-card">
        <section>
          <h2>🧑‍💻 Game &amp; code</h2>
          <p>Built by Claude (Anthropic).</p>
        </section>

        <section>
          <h2>🎙️ Character voices</h2>
          <p>Voiced with ElevenLabs:</p>
          <ul>
            <li>Star Goblin — “Toby, Little Mythical Monster”</li>
            <li>Olivia the Owl — “Lucy”</li>
            <li>Your monster — “Canny”</li>
          </ul>
          <p className="credits-note">Questions and any extra lines use your device’s built-in speech voice.</p>
        </section>

        <section>
          <h2>🎨 Art</h2>
          <p>Background scenes and illustrations generated with ChatGPT (OpenAI), then hand-assembled into the game.</p>
          <p className="credits-note">Counting-hand illustrations by dkdlv, from OpenClipart (public domain).</p>
        </section>

        <section>
          <h2>🔊 Sound</h2>
          <p>Sound effects generated live with the Web Audio API.</p>
        </section>

        <section>
          <h2>📚 Learning</h2>
          <p>
            Olivia’s clever tricks and the level progression draw on published primary-maths guidance from the NCETM,
            Oxford Owl and Third Space Learning.
          </p>
        </section>

        <section>
          <h2>🛠️ Built with</h2>
          <p>React, Vite and TypeScript. Hosted free on GitHub Pages.</p>
        </section>

        <p className="credits-love">Made with ❤️ for two brilliant young mathematicians.</p>
      </div>
    </div>
  )
}
