window.__ModuleLoader__.load({
  id: "dsh-vmic",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    let react = require("react");

    const CSS = `
.dsx-vmic-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: 58px;
  height: 30px;
  padding: 0 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  transition: background .12s ease;
}
.dsx-vmic-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.dsx-vmic-btn:disabled { cursor: default; opacity: .6; }
.dsx-vmic-spec { width: 30px; height: 18px; flex: 0 0 auto; visibility: hidden; }
.dsx-vmic-spec.active { visibility: visible; }
.dsx-vmic-ico { width: 16px; height: 16px; fill: currentColor; flex: 0 0 auto; }

/* Config panel (right-click on the mic button) */
.dsx-vmic-panel-wrap {
  position: fixed;
  z-index: 1200;
  top: 0; left: 0; right: 0; bottom: 0;
}
.dsx-vmic-panel {
  pointer-events: auto;
  position: absolute;
  width: 380px;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--dsw-alias-bg-overlay, #ffffff);
  color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  font-size: 12px;
  line-height: 18px;
}
.dsx-vmic-panel-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-overlay, #ffffff);
}
.dsx-vmic-panel-head .dsx-vmic-head-title { font-size: 13px; font-weight: 600; flex: 1; }
.dsx-vmic-head-icon {
  display: grid; place-items: center;
  flex: 0 0 auto;
  color: var(--dsw-alias-label-secondary);
}
.dsx-vmic-panel-body { overflow-y: auto; padding: 12px; }
.dsx-vmic-card {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  cursor: pointer;
  transition: border-color .12s ease, box-shadow .12s ease;
}
.dsx-vmic-card:hover { border-color: var(--dsw-alias-border-l2); }
.dsx-vmic-card.selected {
  border-color: var(--dsw-alias-state-success-primary, #2f9e44);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-state-success-primary, #2f9e44);
}
.dsx-vmic-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.dsx-vmic-card-title { font-weight: 600; flex: 1; }
.dsx-vmic-expand {
  flex: 0 0 auto;
  width: 20px; height: 20px;
  border: none; background: transparent;
  color: var(--dsw-alias-label-secondary);
  opacity: .45;
  cursor: pointer;
  display: grid; place-items: center;
  transition: transform .15s ease, color .12s ease, opacity .12s ease;
}
.dsx-vmic-expand:hover {
  background: transparent;
  color: var(--dsw-alias-label-primary);
  opacity: 1;
}
.dsx-vmic-expand svg { display: block; }
.dsx-vmic-chevron {
  transition: transform .15s ease;
  transform-box: fill-box;
  transform-origin: 50% 50%;
}
.dsx-vmic-chevron.open { transform: rotate(180deg); }
.dsx-vmic-card-logo {
  display: grid; place-items: center;
  flex: 0 0 auto;
  width: 16px; height: 16px;
}
.dsx-vmic-field { display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px; }
.dsx-vmic-field label { color: var(--dsw-alias-label-secondary); font-size: 11px; }
.dsx-vmic-field input[type=text], .dsx-vmic-field input[type=password],
.dsx-vmic-field-row input[type=text], .dsx-vmic-title-input {
  height: 26px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2, transparent);
  color: inherit;
  padding: 0 30px 0 8px;
  font-size: 12px;
  outline: none;
}
.dsx-vmic-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.dsx-vmic-field-row label {
  flex: 0 0 56px;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.dsx-vmic-field-row input { flex: 1; min-width: 0; padding: 0 8px; }
.dsx-vmic-title-input {
  flex: 1;
  min-width: 0;
  height: 22px;
  padding: 0 6px;
  font-weight: 600;
}
.dsx-vmic-key-row { display: flex; align-items: center; gap: 4px; }
.dsx-vmic-key-row input { flex: 1; }
.dsx-vmic-key-wrap { position: relative; flex: 1; display: flex; }
.dsx-vmic-key-wrap input { width: 100%; }
.dsx-vmic-eye {
  position: absolute;
  right: 2px; top: 0; bottom: 0;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  width: 26px;
  cursor: pointer;
  display: grid; place-items: center;
}
.dsx-vmic-eye:hover { color: var(--dsw-alias-label-primary); }
.dsx-vmic-row { display: flex; align-items: center; gap: 8px; }
.dsx-vmic-del-row { justify-content: center; margin-top: 2px; }
.dsx-vmic-pill {
  display: inline-flex;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  overflow: hidden;
  flex: 0 0 auto;
}
.dsx-vmic-pill button {
  border: none; background: transparent; color: var(--dsw-alias-label-secondary);
  font-size: 11px; padding: 2px 10px; cursor: pointer;
}
.dsx-vmic-pill button.on {
  background: var(--dsw-alias-state-success-primary, #2f9e44);
  color: #fff;
}
.dsx-vmic-tabs {
  display: inline-flex;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  overflow: hidden;
  flex: 0 0 auto;
}
.dsx-vmic-tab {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  padding: 3px 12px;
  cursor: pointer;
}
.dsx-vmic-tab.on {
  background: var(--dsw-alias-state-success-primary, #2f9e44);
  color: #fff;
}
.dsx-vmic-switch {
  flex: 0 0 auto;
  position: relative;
  width: 32px;
  height: 18px;
  border: 1px solid var(--dsw-alias-border-l2, #ccc);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2, transparent);
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}
.dsx-vmic-switch-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
  transition: left .15s ease, background .15s ease;
}
.dsx-vmic-switch.on {
  background: var(--dsw-alias-state-success-primary, #2f9e44);
  border-color: var(--dsw-alias-state-success-primary, #2f9e44);
}
.dsx-vmic-switch.on .dsx-vmic-switch-dot { left: 16px; background: #fff; }
.dsx-vmic-textarea {
  min-height: 54px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2, transparent);
  color: inherit;
  padding: 6px 8px;
  font-size: 12px;
  line-height: 16px;
  outline: none;
  resize: vertical;
  font-family: inherit;
}
.dsx-vmic-card-static { cursor: default; }
.dsx-vmic-card-static:hover { border-color: var(--dsw-alias-border-l1); }
.dsx-vmic-key-hint { font-size: 11px; }
.dsx-vmic-key-hint.ok { color: var(--dsw-alias-state-success-primary, #2f9e44); }
.dsx-vmic-key-hint.warn { color: var(--dsw-alias-state-error-primary, #e03131); }
.dsx-vmic-btn-sm {
  height: 24px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 11px;
  padding: 0 10px;
  cursor: pointer;
}
.dsx-vmic-btn-sm:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.06)); }
.dsx-vmic-btn-sm.primary {
  background: var(--dsw-alias-state-success-primary, #2f9e44);
  border-color: transparent;
  color: #fff;
}
.dsx-vmic-btn-sm.dsx-vmic-btn-danger {
  color: var(--dsw-alias-state-error-primary, #e03131);
  border-color: var(--dsw-alias-state-error-primary, #e03131);
}
.dsx-vmic-btn-sm.dsx-vmic-btn-danger:hover {
  background: var(--dsw-alias-state-error-primary, #e03131);
  color: #fff;
}
.dsx-vmic-btn-sm.dsx-vmic-btn-danger.confirm {
  background: var(--dsw-alias-state-error-primary, #e03131);
  color: #fff;
}
.dsx-vmic-label-row { display: flex; align-items: center; gap: 6px; }
.dsx-vmic-test-result { font-size: 11px; }
.dsx-vmic-test-result.ok { color: var(--dsw-alias-state-success-primary, #2f9e44); }
.dsx-vmic-test-result.fail { color: var(--dsw-alias-state-error-primary, #e03131); }
.dsx-vmic-test-result.pending { color: var(--dsw-alias-label-caption, #999); }
.dsx-vmic-save-state { font-size: 11px; color: var(--dsw-alias-label-caption, #999); flex: 0 0 auto; }
.dsx-vmic-save-state.saved { color: var(--dsw-alias-state-success-primary, #2f9e44); }
.dsx-vmic-save-state.error { color: var(--dsw-alias-state-error-primary, #e03131); }
`;

    let styleTag = null

    const getConfig = () => fetch('/vmic-config').then((r) => r.json())
    const postConfig = (body) => fetch('/vmic-config', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json())
    const getKey = (id) => fetch('/vmic-key?id=' + encodeURIComponent(id)).then((r) => r.json())
    const postTest = (id) => fetch('/vmic-test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then((r) => r.json())
    const postPolish = (text) => fetch('/vmic-polish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then((r) => r.json())
    const postPolishTest = () => fetch('/vmic-polish-test', { method: 'POST' }).then((r) => r.json())

    async function transcodeToWavDataUrl(blob) {
      const arrayBuffer = await blob.arrayBuffer()
      const ac = new AudioContext()
      let decoded
      try {
        decoded = await ac.decodeAudioData(arrayBuffer)
      } finally {
        try { ac.close() } catch (err) { /* noop */ }
      }
      const rate = 16000
      const frames = Math.max(1, Math.ceil(decoded.duration * rate))
      const off = new OfflineAudioContext(1, frames, rate)
      const source = off.createBufferSource()
      source.buffer = decoded
      source.connect(off.destination)
      source.start()
      const rendered = await off.startRendering()
      const samples = rendered.getChannelData(0)
      const dataLen = samples.length * 2
      const buffer = new ArrayBuffer(44 + dataLen)
      const view = new DataView(buffer)
      const writeStr = (offset, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
      }
      writeStr(0, 'RIFF')
      view.setUint32(4, 36 + dataLen, true)
      writeStr(8, 'WAVE')
      writeStr(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)
      view.setUint32(24, rate, true)
      view.setUint32(28, rate * 2, true)
      view.setUint16(32, 2, true)
      view.setUint16(34, 16, true)
      writeStr(36, 'data')
      view.setUint32(40, dataLen, true)
      for (let i = 0; i < samples.length; i++) {
        const sm = Math.max(-1, Math.min(1, samples[i]))
        view.setInt16(44 + i * 2, sm < 0 ? sm * 0x8000 : sm * 0x7fff, true)
      }
      const bytes = new Uint8Array(buffer)
      let binary = ''
      const chunk = 0x8000
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
      }
      return 'data:audio/wav;base64,' + btoa(binary)
    }

    // ── Config panel ──────────────────────────────────────────────────────

    // Provider logos (LobeHub icons: https://lobehub.com/icons/)
    const PROVIDER_ICONS = {
      'xiaomi-mimo': {
        color: '#ff6900',
        paths: [
          { d: 'M.958 15.936a.459.459 0 01.459.44v2.729a.46.46 0 01-.918 0v-2.729a.459.459 0 01.459-.44zm4.814-2.035a.46.46 0 01.553.45v4.754a.458.458 0 11-.918 0V15.48L3.74 17.202a.462.462 0 01-.655.016.462.462 0 01-.065-.082L.628 14.67a.459.459 0 01.658-.637l2.124 2.187 2.127-2.188a.46.46 0 01.235-.13zm2.068.004a.46.46 0 01.458.445v4.755a.46.46 0 01-.458.458.459.459 0 01-.458-.458V14.35a.459.459 0 01.458-.445zm1.973 2.014a.46.46 0 01.46.457v2.729a.46.46 0 01-.784.324.46.46 0 01-.134-.324v-2.729a.46.46 0 01.458-.458zm.002-2.045a.458.458 0 01.328.157l2.127 2.19 2.125-2.19a.459.459 0 01.784.318v4.756a.46.46 0 01-.455.458.46.46 0 01-.458-.458V15.48l-1.667 1.723a.46.46 0 01-.65.008l-.005-.005c0-.002-.002-.002-.004-.003l-2.455-2.534a.46.46 0 01-.008-.667.461.461 0 01.338-.128zm6.797 1.206a.46.46 0 01.53.651A1.966 1.966 0 0019.81 18.4a.462.462 0 01.623.18.46.46 0 01-.181.624 2.863 2.863 0 01-1.38.353l-.142-.004a2.88 2.88 0 01-2.393-4.263.461.461 0 01.274-.21zm.864-.931a2.884 2.884 0 013.915 3.914.46.46 0 01-.402.24l-.057-.004a.458.458 0 01-.164-.055.46.46 0 01-.182-.622 1.967 1.967 0 00-2.669-2.67.459.459 0 11-.441-.803zM9.59 6.368c1.481 0 1.696 1.202 1.696 1.654v2.648h-.917v-.432c-.26.346-.792.535-1.36.535-.133 0-1.289-.03-1.384-1.136-.082-.932.675-1.61 2.053-1.61h.691c0-.563-.367-.886-.983-.886-.44.013-.864.174-1.2.458l-.36-.664c.484-.379 1.012-.567 1.764-.567zm4.427.1c1.263 0 2.082.97 2.083 2.15 0 1.181-.824 2.154-2.083 2.154-1.26 0-2.084-.972-2.084-2.152 0-1.18.82-2.153 2.084-2.153zm6.801.015c.68 0 1.202.465 1.197 1.548v2.642H21.1V8.29c0-.312-.002-.98-.63-.98s-.628.667-.628.838v2.524h-.89V8.148c0-.17-.001-.838-.63-.838-.628 0-.628.668-.628.98v2.383h-.917v-4.03h.917V7a1.22 1.22 0 01.947-.516c.398 0 .76.193.982.686a1.321 1.321 0 011.195-.686zm-18.093.872l1.457-1.772H5.32L3.311 8.07l2.14 2.602H4.24L2.725 8.796 1.21 10.672H0L2.138 8.07.13 5.583h1.138l1.458 1.772zm4.149 3.317h-.916V6.644h.916v4.028zm16.99 0h-.916V6.644h.916v4.028zM9.925 8.71c-1.055 0-1.359.412-1.326.742.032.329.324.537.757.537a1.013 1.013 0 001.014-.968l.002-.31h-.447zM14.018 7.3c-.663 0-1.184.487-1.184 1.32 0 .832.52 1.32 1.184 1.32.662 0 1.182-.49 1.182-1.32 0-.832-.52-1.32-1.182-1.32zM6.417 5.001a.568.568 0 01.587.582.588.588 0 01-1.175 0A.57.57 0 016.417 5zm16.991 0a.57.57 0 01.592.582.588.588 0 01-1.174 0 .57.57 0 01.357-.542.572.572 0 01.225-.04z' },
        ],
      },
      'volcengine-doubao': {
        paths: [
          { d: 'M5.31 15.756c.172-3.75 1.883-5.999 2.549-6.739-3.26 2.058-5.425 5.658-6.358 8.308v1.12C1.501 21.513 4.226 24 7.59 24a6.59 6.59 0 002.2-.375c.353-.12.7-.248 1.039-.378.913-.899 1.65-1.91 2.243-2.992-4.877 2.431-7.974.072-7.763-4.5l.002.001z', color: '#1E37FC' },
          { d: 'M22.57 10.283c-1.212-.901-4.109-2.404-7.397-2.8.295 3.792.093 8.766-2.1 12.773a12.782 12.782 0 01-2.244 2.992c3.764-1.448 6.746-3.457 8.596-5.219 2.82-2.683 3.353-5.178 3.361-6.66a2.737 2.737 0 00-.216-1.084v-.002zM14.303 1.867C12.955.7 11.248 0 9.39 0 7.532 0 5.883.677 4.545 1.807 2.791 3.29 1.627 5.557 1.5 8.125v9.201c.932-2.65 3.097-6.25 6.357-8.307.5-.318 1.025-.595 1.569-.829 1.883-.801 3.878-.932 5.746-.706-.222-2.83-.718-5.002-.87-5.617h.001z', color: '#37E1BE' },
          { d: 'M14.303 1.867C12.955.7 11.248 0 9.39 0 7.532 0 5.883.677 4.545 1.807 2.791 3.29 1.627 5.557 1.5 8.125v9.201c.932-2.65 3.097-6.25 6.357-8.307.5-.318 1.025-.595 1.569-.829 1.883-.801 3.878-.932 5.746-.706-.222-2.83-.718-5.002-.87-5.617h.001z', color: '#A569FF' },
          { d: 'M17.305 4.961a199.47 199.47 0 01-1.08-1.094c-.202-.213-.398-.419-.586-.622l-1.333-1.378c.151.615.648 2.786.869 5.617 3.288.395 6.185 1.898 7.396 2.8-1.306-1.275-3.475-3.487-5.266-5.323z', color: '#1E37FC' },
        ],
      },
      // generic icon for custom providers: center-tallest equalizer bars
      '__custom__': {
        color: 'var(--dsw-alias-label-secondary, #888)',
        paths: [
          { d: 'M4 11.5v1M7.6 8.5v7M11.2 5v14M14.8 8.5v7M18.4 11.5v1', stroke: true },
        ],
      },
    }

    function ProviderLogo({ id }) {
      const icon = PROVIDER_ICONS[id] || PROVIDER_ICONS['__custom__']
      if (!icon) return null
      return react.createElement('span', {
        className: 'dsx-vmic-card-logo', style: { color: icon.color }, 'aria-hidden': 'true',
      }, react.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fillRule: 'evenodd' },
        icon.paths.map((p, i) => react.createElement('path', {
          key: i, d: p.d,
          fill: p.stroke ? 'none' : (p.color || icon.color || 'currentColor'),
          stroke: p.stroke ? 'currentColor' : undefined,
          strokeWidth: p.stroke ? 2.2 : undefined,
          strokeLinecap: p.stroke ? 'round' : undefined,
        })),
      ))
    }

    function EyeSvg() {
      return react.createElement('svg', {
        width: 13, height: 13, viewBox: '0 0 24 24', 'aria-hidden': 'true',
      }, react.createElement('path', {
        fill: 'currentColor',
        d: 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      }))
    }

    function ProviderCard({ provider, selected, onSelect, onChange, onDelete, isPreset, initiallyExpanded }) {
      const [showKey, setShowKey] = react.useState(false)
      const [revealed, setRevealed] = react.useState(undefined)
      const [testResult, setTestResult] = react.useState(undefined)
      const [expanded, setExpanded] = react.useState(initiallyExpanded === true)
      const [confirming, setConfirming] = react.useState(false)
      const confirmTimerRef = react.useRef(null)

      react.useEffect(() => () => {
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      }, [])

      const handleDeleteClick = (e) => {
        e.stopPropagation()
        if (confirming) {
          if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
          confirmTimerRef.current = null
          onDelete()
          return
        }
        setConfirming(true)
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
        confirmTimerRef.current = setTimeout(() => setConfirming(false), 3000)
      }

      const toggleKey = async () => {
        if (showKey) {
          setShowKey(false)
          setRevealed(undefined)
        } else {
          try {
            const r = await getKey(provider.id)
            setRevealed(r.key ?? '')
          } catch (err) {
            setRevealed('')
          }
          setShowKey(true)
        }
      }

      const runTest = async () => {
        setTestResult({ state: 'pending' })
        try {
          const r = await postTest(provider.id)
          if (r.ok) setTestResult({ state: 'ok', text: `✓ 成功 ${r.latencyMs}ms` + (r.text ? ` → "${r.text}"` : '') })
          else setTestResult({ state: 'fail', text: '✗ ' + (r.error || '失败') })
        } catch (err) {
          setTestResult({ state: 'fail', text: '✗ ' + String(err?.message ?? err) })
        }
      }

      return react.createElement('div', {
        className: 'dsx-vmic-card' + (selected ? ' selected' : ''),
        onClick: () => onSelect(provider.id),
        title: '点击选中为当前使用',
      },
        react.createElement('div', { className: 'dsx-vmic-card-head' },
          react.createElement(ProviderLogo, { id: provider.id }),
          (!isPreset && expanded)
            ? react.createElement('input', {
                className: 'dsx-vmic-title-input',
                type: 'text',
                value: provider.name || '',
                placeholder: provider.id,
                onClick: (e) => e.stopPropagation(),
                onChange: (e) => onChange({ ...provider, name: e.target.value }),
              })
            : react.createElement('span', { className: 'dsx-vmic-card-title' }, provider.name || provider.id),
          provider.type === 'volcengine-doubao' && react.createElement('span', {
            className: 'dsx-vmic-pill', title: '流式=边录边转写；非流式=录完转写',
            onClick: (e) => e.stopPropagation(),
          },
            react.createElement('button', {
              className: provider.live ? 'on' : '',
              onClick: () => onChange({ ...provider, live: true }),
            }, '流式'),
            react.createElement('button', {
              className: provider.live ? '' : 'on',
              onClick: () => onChange({ ...provider, live: false }),
            }, '非流式'),
          ),
          !isPreset && react.createElement('button', {
            className: 'dsx-vmic-expand',
            title: expanded ? '收起' : '展开',
            onClick: (e) => { e.stopPropagation(); setExpanded((v) => !v) },
          }, react.createElement('svg', {
            width: 12, height: 12, viewBox: '0 0 24 24', 'aria-hidden': 'true',
          }, react.createElement('path', {
            className: 'dsx-vmic-chevron' + (expanded ? ' open' : ''),
            fill: 'none', stroke: 'currentColor', strokeWidth: 2.4,
            strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M6 9l6 6 6-6',
          }))),
        ),
        react.createElement('div', { className: 'dsx-vmic-field' },
          react.createElement('label', { className: 'dsx-vmic-label-row' },
            'API Key',
            testResult && react.createElement('span', {
              className: 'dsx-vmic-test-result ' + testResult.state,
            }, testResult.state === 'pending' ? '测试中…' : testResult.text),
          ),
          react.createElement('div', { className: 'dsx-vmic-key-row' },
            react.createElement('div', { className: 'dsx-vmic-key-wrap' },
              react.createElement('input', {
                type: showKey ? 'text' : 'password',
                value: showKey ? revealed : (provider.draftKey || ''),
                placeholder: provider.keySet ? '••••••••' : '填写 API Key',
                onChange: (e) => onChange({ ...provider, draftKey: e.target.value }),
                onClick: (e) => e.stopPropagation(),
              }),
              react.createElement('button', {
                className: 'dsx-vmic-eye', title: showKey ? '隐藏' : '查看已配置的完整 API Key',
                onClick: (e) => { e.stopPropagation(); void toggleKey() },
              }, react.createElement(EyeSvg)),
            ),
            react.createElement('button', {
              className: 'dsx-vmic-btn-sm', title: '测试连通性',
              onClick: (e) => { e.stopPropagation(); void runTest() },
            }, '测试'),
          ),
        ),
        !isPreset && expanded && react.createElement('div', { className: 'dsx-vmic-field-row' },
          react.createElement('label', null, '接口地址'),
          react.createElement('input', {
            type: 'text', value: provider.baseUrl || '', placeholder: 'https://…/v1/chat/completions',
            onChange: (e) => onChange({ ...provider, baseUrl: e.target.value }),
            onClick: (e) => e.stopPropagation(),
          }),
        ),
        !isPreset && expanded && react.createElement('div', { className: 'dsx-vmic-field-row' },
          react.createElement('label', null, '模型 ID'),
          react.createElement('input', {
            type: 'text', value: provider.model || '', placeholder: 'model-id',
            onChange: (e) => onChange({ ...provider, model: e.target.value }),
            onClick: (e) => e.stopPropagation(),
          }),
        ),
        !isPreset && expanded && react.createElement('div', { className: 'dsx-vmic-row dsx-vmic-del-row' },
          react.createElement('button', {
            className: 'dsx-vmic-btn-sm dsx-vmic-btn-danger' + (confirming ? ' confirm' : ''),
            title: confirming ? '再次点击确认删除' : '删除该服务商',
            onClick: handleDeleteClick,
          }, confirming ? '确认删除？' : '删除'),
        ),
      )
    }

    function SparkleSvg() {
      return react.createElement('svg', {
        width: 14, height: 14, viewBox: '0 0 24 24', 'aria-hidden': 'true',
      }, react.createElement('path', {
        fill: 'currentColor',
        d: 'M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z',
      }))
    }

    function PolishCard({ polish, onChange }) {
      const p = polish || {}
      const [showKey, setShowKey] = react.useState(false)
      const [revealed, setRevealed] = react.useState(undefined)
      const [testResult, setTestResult] = react.useState(undefined)

      const toggleKey = async () => {
        if (showKey) {
          setShowKey(false)
          setRevealed(undefined)
        } else {
          try {
            const r = await getKey('__polish__')
            setRevealed(r.key ?? '')
          } catch (err) {
            setRevealed('')
          }
          setShowKey(true)
        }
      }

      const runTest = async () => {
        setTestResult({ state: 'pending' })
        try {
          const r = await postPolishTest()
          if (r.ok) setTestResult({ state: 'ok', text: `✓ 成功 ${r.latencyMs}ms` + (r.text ? ` → "${r.text}"` : '') })
          else setTestResult({ state: 'fail', text: '✗ ' + (r.error || '失败') })
        } catch (err) {
          setTestResult({ state: 'fail', text: '✗ ' + String(err?.message ?? err) })
        }
      }

      const keyHint = p.useDeepseekKey
        ? react.createElement('span', {
            className: 'dsx-vmic-key-hint ' + (p.deepseekKeySet ? 'ok' : 'warn'),
          }, p.deepseekKeySet ? '✓ DeepSeek Key 可用' : '⚠ 未检测到 DeepSeek Key')
        : null

      return react.createElement('div', { className: 'dsx-vmic-card dsx-vmic-card-static' },
        react.createElement('div', { className: 'dsx-vmic-card-head' },
          react.createElement('span', {
            className: 'dsx-vmic-card-logo', style: { color: 'var(--dsw-alias-label-secondary)' },
          }, react.createElement(SparkleSvg)),
          react.createElement('span', { className: 'dsx-vmic-card-title' }, 'AI 润色'),
          testResult && react.createElement('span', {
            className: 'dsx-vmic-test-result ' + testResult.state,
          }, testResult.state === 'pending' ? '测试中…' : testResult.text),
          react.createElement('span', {
            className: 'dsx-vmic-switch' + (p.enabled ? ' on' : ''),
            title: p.enabled ? '已开启：转写后自动润色' : '已关闭：直接插入转写原文',
            onClick: (e) => { e.stopPropagation(); onChange({ ...p, enabled: !p.enabled }) },
          }, react.createElement('span', { className: 'dsx-vmic-switch-dot' })),
        ),
        react.createElement('div', { className: 'dsx-vmic-field' },
          react.createElement('label', null, '润色提示词（{text} = 转写原文）'),
          react.createElement('textarea', {
            className: 'dsx-vmic-textarea',
            rows: 3,
            value: p.prompt || '',
            onChange: (e) => onChange({ ...p, prompt: e.target.value }),
            onClick: (e) => e.stopPropagation(),
          }),
        ),
        react.createElement('div', { className: 'dsx-vmic-field-row' },
          react.createElement('label', null, '接口地址'),
          react.createElement('input', {
            type: 'text', value: p.baseUrl || '', placeholder: 'https://…/v1/chat/completions',
            onChange: (e) => onChange({ ...p, baseUrl: e.target.value }),
            onClick: (e) => e.stopPropagation(),
          }),
        ),
        react.createElement('div', { className: 'dsx-vmic-field-row' },
          react.createElement('label', null, '模型 ID'),
          react.createElement('input', {
            type: 'text', value: p.model || '', placeholder: 'deepseek-chat',
            onChange: (e) => onChange({ ...p, model: e.target.value }),
            onClick: (e) => e.stopPropagation(),
          }),
        ),
        react.createElement('div', { className: 'dsx-vmic-field' },
          react.createElement('label', { className: 'dsx-vmic-label-row' }, 'API Key 来源', keyHint),
          react.createElement('span', { className: 'dsx-vmic-pill', onClick: (e) => e.stopPropagation() },
            react.createElement('button', {
              className: p.useDeepseekKey ? 'on' : '',
              onClick: () => onChange({ ...p, useDeepseekKey: true }),
            }, '复用 DeepSeek Key'),
            react.createElement('button', {
              className: p.useDeepseekKey ? '' : 'on',
              onClick: () => onChange({ ...p, useDeepseekKey: false }),
            }, '自定义 Key'),
          ),
        ),
        !p.useDeepseekKey && react.createElement('div', { className: 'dsx-vmic-key-row' },
          react.createElement('div', { className: 'dsx-vmic-key-wrap' },
            react.createElement('input', {
              type: showKey ? 'text' : 'password',
              value: showKey ? revealed : (p.draftKey || ''),
              placeholder: p.polishKeySet ? '••••••••' : '填写 API Key',
              onChange: (e) => onChange({ ...p, draftKey: e.target.value }),
              onClick: (e) => e.stopPropagation(),
            }),
            react.createElement('button', {
              className: 'dsx-vmic-eye', title: showKey ? '隐藏' : '查看已配置的完整 API Key',
              onClick: (e) => { e.stopPropagation(); void toggleKey() },
            }, react.createElement(EyeSvg)),
          ),
          react.createElement('button', {
            className: 'dsx-vmic-btn-sm', title: '用示例文本测试润色',
            onClick: (e) => { e.stopPropagation(); void runTest() },
          }, '测试'),
        ),
        p.useDeepseekKey && react.createElement('div', {
          className: 'dsx-vmic-row', style: { justifyContent: 'flex-end', marginTop: 4 },
        },
          react.createElement('button', {
            className: 'dsx-vmic-btn-sm', title: '用示例文本测试润色',
            onClick: (e) => { e.stopPropagation(); void runTest() },
          }, '测试润色'),
        ),
      )
    }

    function ConfigPanel({ anchor, onClose, onSaved }) {
      const [config, setConfig] = react.useState(undefined)
      const [saveState, setSaveState] = react.useState('')
      const [tab, setTab] = react.useState('asr')
      const configRef = react.useRef(null)
      const pendingRef = react.useRef(null)
      const timerRef = react.useRef(null)
      const stateTimerRef = react.useRef(null)
      const newIdsRef = react.useRef(new Set())

      react.useEffect(() => {
        getConfig().then((cfg) => { configRef.current = cfg; setConfig(cfg) })
          .catch(() => {})
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current)
          if (stateTimerRef.current) clearTimeout(stateTimerRef.current)
        }
      }, [])

      const buildPayload = (cfg) => {
        const keys = {}
        const providers = cfg.providers.map((p) => {
          const copy = { ...p }
          if (typeof copy.draftKey === 'string' && copy.draftKey !== '') {
            keys[p.id] = copy.draftKey
          }
          delete copy.draftKey
          delete copy.keySet
          if (copy.preset) {
            // built-in endpoints/models stay owned by the host preset
            delete copy.baseUrl
            delete copy.model
          }
          return copy
        })
        let polish
        let polishKey
        if (cfg.polish && typeof cfg.polish === 'object') {
          polish = { ...cfg.polish }
          if (typeof polish.draftKey === 'string' && polish.draftKey !== '') {
            polishKey = polish.draftKey
          }
          delete polish.draftKey
          delete polish.polishKeySet
          delete polish.deepseekKeySet
        }
        return {
          selectedProvider: cfg.selectedProvider,
          providers,
          language: cfg.language,
          timeoutMs: cfg.timeoutMs,
          polish,
          polishKey,
          keys,
        }
      }

      // real-time persist: every change is debounced and saved automatically
      const scheduleSave = (cfg) => {
        pendingRef.current = cfg
        setSaveState('saving')
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          const toSave = pendingRef.current
          pendingRef.current = null
          postConfig(buildPayload(toSave)).then(() => {
            setSaveState('saved')
            if (stateTimerRef.current) clearTimeout(stateTimerRef.current)
            stateTimerRef.current = setTimeout(() => setSaveState(''), 2000)
            if (onSaved) onSaved()
          }).catch(() => {
            setSaveState('error')
          })
        }, 300)
      }

      const mutate = (fn) => {
        if (!configRef.current) return
        const next = fn(configRef.current)
        configRef.current = next
        setConfig(next)
        scheduleSave(next)
      }

      const update = (provider) => mutate((cfg) => ({
        ...cfg,
        providers: cfg.providers.map((p) => (p.id === provider.id ? provider : p)),
      }))

      const select = (id) => mutate((cfg) => ({ ...cfg, selectedProvider: id }))

      const addCustom = () => mutate((cfg) => {
        const id = 'custom-' + Math.random().toString(16).slice(2, 8)
        newIdsRef.current.add(id)
        return {
          ...cfg,
          providers: [...cfg.providers, {
            id, type: 'openai-compatible', name: '自定义供应商',
            preset: false, enabled: true, baseUrl: '', model: '', live: false,
          }],
          selectedProvider: id,
        }
      })

      const remove = (id) => mutate((cfg) => ({
        ...cfg,
        providers: cfg.providers.filter((p) => p.id !== id),
        selectedProvider: cfg.selectedProvider === id ? cfg.providers[0]?.id : cfg.selectedProvider,
      }))

      const updatePolish = (polish) => mutate((cfg) => ({ ...cfg, polish }))

      if (!config) return null

      const panelStyle = {
        left: Math.max(8, Math.min(anchor.x - 340, window.innerWidth - 390)),
        top: Math.max(8, anchor.y - 24),
        transform: 'translateY(-100%)',
      }

      return react.createElement('div', {
        className: 'dsx-vmic-panel-wrap',
        onClick: (e) => { if (e.target === e.currentTarget) onClose() },
      },
        react.createElement('div', { className: 'dsx-vmic-panel', style: panelStyle },
          react.createElement('div', { className: 'dsx-vmic-panel-head' },
            react.createElement('span', { className: 'dsx-vmic-head-icon', 'aria-hidden': 'true' },
              react.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'currentColor' },
                react.createElement('path', { d: 'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z' }),
              ),
            ),
            react.createElement('div', { className: 'dsx-vmic-tabs' },
              react.createElement('button', {
                className: 'dsx-vmic-tab' + (tab === 'asr' ? ' on' : ''),
                onClick: () => setTab('asr'),
              }, '语音识别服务商'),
              react.createElement('button', {
                className: 'dsx-vmic-tab' + (tab === 'polish' ? ' on' : ''),
                onClick: () => setTab('polish'),
              }, 'AI 润色'),
            ),
            saveState === 'saved' && react.createElement('span', { className: 'dsx-vmic-save-state saved' }, '✓ 已保存'),
            saveState === 'saving' && react.createElement('span', { className: 'dsx-vmic-save-state' }, '保存中…'),
            saveState === 'error' && react.createElement('span', { className: 'dsx-vmic-save-state error' }, '✗ 保存失败'),
            tab === 'asr' && react.createElement('button', { className: 'dsx-vmic-btn-sm', onClick: addCustom }, '+ 添加服务商'),
          ),
          react.createElement('div', { className: 'dsx-vmic-panel-body' },
            tab === 'asr'
              ? config.providers.map((p) => react.createElement(ProviderCard, {
                  key: p.id,
                  provider: p,
                  selected: config.selectedProvider === p.id,
                  isPreset: p.preset === true,
                  initiallyExpanded: newIdsRef.current.has(p.id),
                  onSelect: select,
                  onChange: update,
                  onDelete: () => remove(p.id),
                }))
              : react.createElement(PolishCard, {
                  polish: config.polish || {},
                  onChange: updatePolish,
                }),
          ),
        ),
      )
    }

    // ── Mic button ────────────────────────────────────────────────────────

    /** Downsample an AudioBuffer channel to 16k mono PCM bytes. */
    function bufferTo16kPcm(audioBuffer) {
      const input = audioBuffer.getChannelData(0)
      const srcRate = audioBuffer.sampleRate
      const ratio = srcRate / 16000
      const outLen = Math.floor(input.length / ratio)
      const out = new Int16Array(outLen)
      for (let i = 0; i < outLen; i++) {
        const s = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)]))
        out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }
      const bytes = new Uint8Array(out.buffer)
      let binary = ''
      const chunk = 0x8000
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
      }
      return btoa(binary)
    }

    function VoiceButton(props) {
      const inputState = props.input || null
      const inputActions = props.inputActions
      const [recording, setRecording] = react.useState(false)
      const [busy, setBusy] = react.useState(false)
      const [busyLabel, setBusyLabel] = react.useState('')
      const [error, setError] = react.useState('')
      const [panelOpen, setPanelOpen] = react.useState(false)
      const recRef = react.useRef(null)
      const streamRef = react.useRef(null)
      const chunksRef = react.useRef([])
      const audioRef = react.useRef(null)
      const rafRef = react.useRef(0)
      const canvasRef = react.useRef(null)
      const btnRef = react.useRef(null)
      const panelAnchor = react.useRef({ x: 0, y: 0 })
      const liveRef = react.useRef(null) // { mode:'live', sessionId, pcmBuf, timer, baseDraft, lastText }

      const stopSpectrum = () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
        const audio = audioRef.current
        if (audio) {
          try { audio.source.disconnect() } catch (err) { /* noop */ }
          try { audio.analyser.disconnect() } catch (err) { /* noop */ }
          try { audio.ctx.close() } catch (err) { /* noop */ }
          audioRef.current = null
        }
        const canvas = canvasRef.current
        if (canvas) {
          const g = canvas.getContext('2d')
          if (g) g.clearRect(0, 0, canvas.width, canvas.height)
        }
      }

      const drawSpectrum = () => {
        const audio = audioRef.current
        const canvas = canvasRef.current
        if (!audio || !canvas) return
        const g = canvas.getContext('2d')
        const W = canvas.width
        const H = canvas.height
        g.clearRect(0, 0, W, H)
        audio.analyser.getByteFrequencyData(audio.freq)
        audio.analyser.getByteTimeDomainData(audio.td)
        let peak = 0
        for (let j = 0; j < audio.td.length; j++) {
          const d = Math.abs(audio.td[j] - 128) / 128
          if (d > peak) peak = d
        }
        audio.level = audio.level * 0.75 + peak * 0.25
        const n = audio.freq.length
        const low = 1
        const binHz = audio.ctx.sampleRate / audio.analyser.fftSize
        const high = Math.min(n - 1, Math.max(low + 7, Math.floor(7500 / binHz)))
        const bands = 7
        const raw = []
        for (let b = 0; b < bands; b++) {
          const f0 = Math.pow(b / bands, 1.5)
          const f1 = Math.pow((b + 1) / bands, 1.5)
          const i0 = low + Math.floor(f0 * (high - low))
          const i1 = low + Math.max(1, Math.floor(f1 * (high - low)))
          let sum = 0
          let cnt = 0
          for (let i = i0; i < i1 && i <= high; i++) {
            sum += audio.freq[i]
            cnt++
          }
          raw.push(cnt ? sum / cnt / 255 : 0)
        }
        for (let b = 0; b < bands; b++) {
          audio.bands[b] = audio.bands[b] * 0.7 + raw[b] * 0.3
        }
        const order = [0, 1, 2, 3, 4, 5, 6]
        order.sort((a, b) => audio.bands[b] - audio.bands[a])
        const slot = new Array(7)
        slot[3] = order[0]
        slot[2] = order[1]
        slot[4] = order[1]
        slot[1] = order[2]
        slot[5] = order[2]
        slot[0] = order[3]
        slot[6] = order[3]
        let color = ''
        try {
          color = getComputedStyle(document.documentElement)
            .getPropertyValue('--dsw-alias-label-primary').trim()
        } catch (err) { /* noop */ }
        if (!color) color = '#6b7280'
        const mid = H / 2
        const xs = [0, 8.9, 17.8, 26.7, 35.6, 44.5, 53.4]
        const bwInner = 5.6
        const gain = Math.min(1, audio.level * 2.4)
        g.fillStyle = color
        for (let i = 0; i < 7; i++) {
          const v = Math.min(1, audio.bands[slot[i]] * gain)
          const halfH = Math.max(2, (v * H) / 2 - 1)
          const x = xs[i]
          const y1 = mid - halfH
          const y2 = mid + halfH
          const r = Math.min(2.8, halfH)
          g.beginPath()
          g.moveTo(x + r, y1)
          g.lineTo(x + bwInner - r, y1)
          g.arcTo(x + bwInner, y1, x + bwInner, y1 + r, r)
          g.lineTo(x + bwInner, y2 - r)
          g.arcTo(x + bwInner, y2, x + bwInner - r, y2, r)
          g.lineTo(x + r, y2)
          g.arcTo(x, y2, x, y2 - r, r)
          g.lineTo(x, y1 + r)
          g.arcTo(x, y1, x + r, y1, r)
          g.closePath()
          g.fill()
        }
        rafRef.current = requestAnimationFrame(drawSpectrum)
      }

      const startSpectrum = (stream) => {
        try {
          const ctx = new AudioContext()
          const source = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 256
          analyser.smoothingTimeConstant = 0.7
          source.connect(analyser)
          audioRef.current = {
            ctx,
            source,
            analyser,
            freq: new Uint8Array(analyser.frequencyBinCount),
            td: new Uint8Array(analyser.fftSize),
            bands: [0, 0, 0, 0, 0, 0, 0],
            level: 0,
          }
          const canvas = canvasRef.current
          if (canvas) {
            canvas.width = 60
            canvas.height = 36
          }
          rafRef.current = requestAnimationFrame(drawSpectrum)
        } catch (err) {
          console.error('频谱启动失败', err)
        }
      }

      const clearAudio = () => {
        chunksRef.current = []
        const live = liveRef.current
        if (live && live.timer) {
          clearInterval(live.timer)
          live.timer = undefined
        }
        stopSpectrum()
        const stream = streamRef.current
        if (stream) {
          try { stream.getTracks().forEach((t) => t.stop()) } catch (err) { /* noop */ }
        }
        streamRef.current = null
        recRef.current = null
      }

      const postLive = (path, body) => fetch(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json())

      const liveFlush = async () => {
        const live = liveRef.current
        if (!live || live.pcmBuf.length === 0) return
        const pcmBase64 = live.pcmBuf
        live.pcmBuf = ''
        try {
          const result = live.sessionId
            ? await postLive('/vmic-asr-live/chunk', { sessionId: live.sessionId, pcmBase64 })
            : await postLive('/vmic-asr-live/start', { pcmBase64 })
          if (live.sessionId === '' && result && typeof result.sessionId === 'string') {
            live.sessionId = result.sessionId
          }
          if (result && typeof result.text === 'string' && result.text) {
            live.lastText = result.text
            if (inputActions && typeof inputActions.setDraft === 'function') {
              const base = live.baseDraft
              const next = base ? base + (/\s$/.test(base) ? '' : ' ') + result.text : result.text
              inputActions.setDraft(next)
            }
          }
          if (result && result.error) {
            live.lastError = result.error
          }
        } catch (err) {
          live.lastError = String(err?.message ?? err)
        }
      }

      // Live recording: capture 16k PCM directly from the mic stream, flush
      // incrementally, and stream recognized text into the draft.
      const startLive = async (stream) => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        const ctx = new AudioCtx()
        const source = ctx.createMediaStreamSource(stream)
        const processor = ctx.createScriptProcessor(4096, 1, 1)
        const live = {
          mode: 'live',
          sessionId: '',
          pcmBuf: '',
          timer: undefined,
          baseDraft: inputState ? (inputState.draft || '') : '',
          lastText: '',
          lastError: undefined,
          ctx,
          processor,
          source,
        }
        liveRef.current = live
        const chunkBuf = []
        let chunkAccum = 0
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0)
          const srcRate = e.inputBuffer.sampleRate
          const ratio = srcRate / 16000
          for (let i = 0; i < inputData.length; i += Math.max(1, Math.round(ratio))) {
            chunkBuf.push(inputData[i])
            chunkAccum++
          }
          // flush ~200ms worth (3200 samples) into the pcm buffer
          if (chunkAccum >= 3200) {
            const out = new Int16Array(chunkBuf.length)
            for (let i = 0; i < chunkBuf.length; i++) {
              const s = Math.max(-1, Math.min(1, chunkBuf[i]))
              out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
            }
            const bytes = new Uint8Array(out.buffer)
            let binary = ''
            const step = 0x8000
            for (let i = 0; i < bytes.length; i += step) {
              binary += String.fromCharCode.apply(null, bytes.subarray(i, i + step))
            }
            live.pcmBuf += btoa(binary)
            chunkBuf.length = 0
            chunkAccum = 0
          }
        }
        source.connect(processor)
        processor.connect(ctx.destination)
        live.timer = setInterval(() => { void liveFlush() }, 2500)
      }

      const liveStop = async () => {
        const live = liveRef.current
        if (!live) return
        if (live.timer) {
          clearInterval(live.timer)
          live.timer = undefined
        }
        try {
          live.processor.disconnect()
          live.source.disconnect()
          live.ctx.close()
        } catch (err) { /* noop */ }
        setRecording(false)
        setBusy(true)
        try {
          // flush remaining pcm then stop
          await liveFlush()
          const result = await postLive('/vmic-asr-live/stop', { sessionId: live.sessionId, pcmBase64: '' })
          const text = (result && typeof result.text === 'string' && result.text)
            ? result.text
            : live.lastText
          if (text) {
            const out = await polishIfEnabled(text)
            if (inputActions && typeof inputActions.setDraft === 'function') {
              const base = live.baseDraft
              const next = base ? base + (/\s$/.test(base) ? '' : ' ') + out.text : out.text
              inputActions.setDraft(next)
            }
            setError(out.failed ? '润色失败，已插入原文' : '')
          } else if (result && result.error) {
            setError(String(result.error))
          } else {
            setError('未识别到文本')
          }
        } catch (err) {
          setError(String(err?.message ?? err))
        } finally {
          setBusy(false)
          clearAudio()
          liveRef.current = null
        }
      }

      // Polish one transcribed text when the feature is enabled.
      // Always resolves: on failure the raw text comes back with failed=true.
      const polishIfEnabled = async (rawText) => {
        try {
          const cfg = await getConfig()
          const polish = cfg && cfg.polish
          if (!polish || polish.enabled !== true) return { text: rawText, polished: false }
          setBusyLabel('润色中…')
          const resp = await fetch('/vmic-polish', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: rawText }),
          })
          const result = await resp.json()
          if (result && typeof result.text === 'string' && result.text.trim()) {
            return { text: result.text.trim(), polished: true }
          }
          throw new Error(result && result.error ? String(result.error) : '润色失败')
        } catch {
          return { text: rawText, polished: false, failed: true }
        }
      }

      const finish = async (rec) => {
        try {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
          const dataUrl = await transcodeToWavDataUrl(blob)
          const resp = await fetch('/vmic-asr', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ audioDataUrl: dataUrl }),
          })
          const result = await resp.json()
          if (result && typeof result.text === 'string' && result.text) {
            const out = await polishIfEnabled(result.text)
            const draft = inputState ? (inputState.draft || '') : ''
            const next = draft ? draft + (/\s$/.test(draft) ? '' : ' ') + out.text : out.text
            if (inputActions && typeof inputActions.setDraft === 'function') {
              inputActions.setDraft(next)
              setError(out.failed ? '润色失败，已插入原文' : '')
            } else {
              setError('输入框不可用')
            }
          } else {
            const msg = result && result.error ? String(result.error) : '未知错误'
            setError(msg)
            console.error('语音识别失败', msg)
          }
        } catch (err) {
          const msg = String(err && err.message ? err.message : err)
          setError(msg)
          console.error('语音识别失败', err)
        } finally {
          setBusy(false)
          clearAudio()
        }
      }

      const start = async () => {
        try {
          setError('')
          setBusyLabel('')
          if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
            throw new Error('浏览器不支持麦克风')
          }
          if (typeof MediaRecorder === 'undefined') throw new Error('浏览器不支持 MediaRecorder')
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          streamRef.current = stream
          setRecording(true)
          startSpectrum(stream)
          // Decide live vs batch: volcengine-doubao with live=true streams.
          let live = false
          try {
            const cfg = await getConfig()
            const selected = (cfg.providers || []).find((p) => p.id === cfg.selectedProvider)
            live = Boolean(selected && selected.type === 'volcengine-doubao' && selected.live)
          } catch (err) { /* keep batch */ }
          if (live) {
            await startLive(stream)
          } else {
            const rec = new MediaRecorder(stream)
            chunksRef.current = []
            rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
            rec.onstop = () => { void finish(rec) }
            rec.onerror = () => {
              setRecording(false)
              setBusy(false)
              clearAudio()
            }
            recRef.current = rec
            rec.start(1000)
          }
        } catch (err) {
          const msg = String(err && err.message ? err.message : err)
          setError(msg)
          console.error('语音输入启动失败', err)
        }
      }

      const stop = () => {
        const live = liveRef.current
        setRecording(false)
        setBusy(true)
        if (live && live.mode === 'live') {
          void liveStop()
          return
        }
        const rec = recRef.current
        if (rec && rec.state !== 'inactive') rec.stop()
      }

      const onClick = () => {
        if (busy) return
        if (recording) stop()
        else void start()
      }

      const onContextMenu = (e) => {
        e.preventDefault()
        const rect = btnRef.current ? btnRef.current.getBoundingClientRect() : null
        if (rect) panelAnchor.current = { x: rect.right, y: rect.top }
        else panelAnchor.current = { x: e.clientX, y: e.clientY }
        setPanelOpen(true)
      }

      react.useEffect(() => () => {
        try { if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop() } catch (err) { /* noop */ }
        clearAudio()
      }, [])

      const label = busy ? (busyLabel || '识别中…') : (recording ? '停止录音' : '语音输入')
      const title = error ? `提示：${error}` : (recording ? '停止录音' : '语音输入（右键配置）')
      const mic = react.createElement('svg', {
        className: 'dsx-vmic-ico',
        viewBox: '0 0 24 24',
        'aria-hidden': 'true',
      }, react.createElement('path', { d: 'M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z' }))
      const spectrum = react.createElement('canvas', {
        className: 'dsx-vmic-spec',
        ref: canvasRef,
        'aria-hidden': 'true',
      })
      const specClass = 'dsx-vmic-spec' + (recording ? ' active' : '')
      const spec = react.cloneElement(spectrum, { className: specClass })

      return react.createElement(react.Fragment, null,
        react.createElement('button', {
          className: 'dsx-vmic-btn',
          ref: btnRef,
          type: 'button',
          title: title,
          'aria-label': label,
          disabled: busy,
          onClick: onClick,
          onContextMenu: onContextMenu,
        }, spec, mic),
        panelOpen && react.createElement(ConfigPanel, {
          anchor: panelAnchor.current,
          onClose: () => setPanelOpen(false),
          onSaved: () => {},
        }),
      )
    }

    /** Required service: the UI slot registry. */
    const inject = ['slots']

    function apply(ctx) {
      if (typeof document !== 'undefined') {
        styleTag = document.createElement('style')
        styleTag.setAttribute('data-dsh-vmic', '')
        styleTag.textContent = CSS
        document.head.appendChild(styleTag)
      }
      ctx.slots.inject('conversation.input.right', () => {
        const dispose = ctx.slots.register(
          { name: 'conversation.input.right', id: 'voice-input', order: 0 },
          (props) => react.createElement(VoiceButton, props),
        )
        return () => {
          dispose()
          if (styleTag && styleTag.parentNode) styleTag.parentNode.removeChild(styleTag)
          styleTag = null
        }
      })
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
