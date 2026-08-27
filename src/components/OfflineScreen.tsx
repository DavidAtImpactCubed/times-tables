import { useEffect, useState } from 'react'
import { sfx } from '../logic/audio'
import {
  askOfflineStatus,
  offlineSupported,
  onOfflineState,
  startOfflineDownload,
  type OfflineState,
} from '../logic/offline'

interface Props {
  onBack: () => void
}

const mb = (bytes: number) => `${(bytes / 1048576).toFixed(0)} MB`

/**
 * Download the whole game onto this phone, for playing with no signal —
 * a plane, a car, a holiday cottage. Everything the game needs is a fixed,
 * known set of files, so this is just "fetch all of them now" with a bar to
 * watch, and a plain answer to the only question that matters before take-off:
 * is it all here yet?
 */
export function OfflineScreen({ onBack }: Props) {
  const supported = offlineSupported()
  const [state, setState] = useState<OfflineState | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const stop = onOfflineState((s) => {
      setState(s)
      if (s.finished) setDownloading(false)
    })
    void askOfflineStatus()
    return stop
  }, [])

  const ready = state ? state.done >= state.total : false
  const pct = state && state.total ? Math.round((state.done / state.total) * 100) : 0

  const start = async () => {
    sfx.click()
    setDownloading(true)
    if (!(await startOfflineDownload())) setDownloading(false)
  }

  return (
    <div className="screen offline-screen" data-testid="offline">
      <header className="credits-header">
        <button className="btn btn-round" onClick={onBack} aria-label="Back" data-testid="offline-back">
          ↩
        </button>
        <h1>Play with no internet</h1>
      </header>

      <div className="credits-card">
        {!supported ? (
          <p data-testid="offline-unsupported">
            This phone’s browser can’t save the game for offline play. It will still need a connection.
          </p>
        ) : (
          <>
            <p>
              Download the whole island — every picture and every spoken line — onto this phone. Then it plays on a
              plane, in the car, or anywhere with no signal.
            </p>

            {ready ? (
              <div className="offline-ready" data-testid="offline-ready">
                <span className="offline-tick">✅</span>
                <div>
                  <strong>Ready to fly.</strong>
                  <p>All {state?.total} files are saved on this phone. You can turn the internet off.</p>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="btn btn-primary btn-big"
                  disabled={downloading || !state}
                  onClick={start}
                  data-testid="offline-download"
                >
                  {downloading ? 'Downloading…' : state ? `Download everything (${mb(state.bytes)})` : 'Getting ready…'}
                </button>
                {state && (state.done > 0 || downloading) && (
                  <div className="offline-progress" data-testid="offline-progress">
                    <div className="offline-bar">
                      <div className="offline-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p>
                      {state.done} of {state.total} files ({pct}%)
                    </p>
                  </div>
                )}
                {downloading && (
                  <p className="offline-note">
                    Keep this screen open while it downloads, and stay on wi-fi if you can — it’s about{' '}
                    {state ? mb(state.bytes) : 'a big download'}.
                  </p>
                )}
                {state?.finished && state.failed ? (
                  <p className="offline-warn" data-testid="offline-failed">
                    {state.failed} {state.failed === 1 ? 'file' : 'files'} wouldn’t download. Tap the button again while
                    you still have signal.
                  </p>
                ) : null}
              </>
            )}

            <p className="offline-note">
              The download stays on this phone until the browser’s data is cleared. Each phone needs its own copy.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
