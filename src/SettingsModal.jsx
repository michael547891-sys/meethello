import React, { useEffect, useRef, useState } from 'react';

const TABS = [
  { id: 'audio', label: 'Audio' },
  { id: 'video', label: 'Video' },
  { id: 'general', label: 'General' },
  { id: 'speech', label: 'Speech translation' },
  { id: 'reactions', label: 'Reactions' },
];

const SEND_RES = [
  'Auto',
  'Full high definition (1080p)',
  'High definition (720p)',
  'Standard definition (360p)',
];

const RECV_RES = [
  'Auto',
  'Full high definition (1080p)',
  'High definition (720p)',
  'Standard definition (360p)',
  'Standard definition (360p), one video at a time',
  'Audio only',
];

const PIP_OPTS = [
  'Always automatically show',
  'Only when Meet is minimized',
  'Never automatically show',
];

const LANGS = [
  'Chinese (Cantonese)',
  'Chinese (Mandarin)',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Filipino',
  'Finnish',
  'French',
  'Galician',
  'Georgian',
  'German',
  'Greek',
  'Hindi',
  'Hungarian',
  'Indonesian',
  'Italian',
  'Japanese',
  'Korean',
  'Polish',
  'Portuguese',
  'Romanian',
  'Russian',
  'Spanish',
  'Swedish',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Vietnamese',
];

const REACT_A11Y = [
  "Don't announce reactions",
  'Play a sound for all reactions',
  'Announce all reactions',
  'Announce all reactions with senders',
];

const IconAudio = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);
const IconVideo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);
const IconGeneral = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
  </svg>
);
const IconSpeech = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.5 17.5 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
  </svg>
);
const IconReactions = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);
const IconMic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);
const IconCam = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);
const IconSpeaker = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  </svg>
);

const TAB_ICONS = {
  audio: IconAudio,
  video: IconVideo,
  general: IconGeneral,
  speech: IconSpeech,
  reactions: IconReactions,
};

function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      className={`st-toggle ${on ? 'on' : 'off'}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    >
      <span className="st-toggle-knob" aria-hidden="true">
        {on ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
        )}
      </span>
    </button>
  );
}

function SettingSelect({
  label,
  value,
  options,
  onChange,
  icon,
  warn,
  open,
  onOpenChange,
  menuId,
  disabled = false,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) onOpenChange(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onOpenChange]);

  const opts = typeof options[0] === 'string'
    ? options.map((o) => ({ id: o, label: o }))
    : options;

  return (
    <div className="st-field" ref={ref}>
      {label && <div className="st-field-label">{label}</div>}
      <button
        type="button"
        className={`st-select ${open ? 'open' : ''} ${warn ? 'warn' : ''}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => onOpenChange(!open)}
      >
        {icon && <span className="st-select-ico">{icon}</span>}
        {warn && <span className="st-warn-dot" aria-hidden="true">!</span>}
        <span className="st-select-text">{value}</span>
        <svg className="st-caret" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && (
        <ul className="st-menu" role="listbox" id={menuId}>
          {opts.map((o) => (
            <li key={o.id} role="option" aria-selected={o.label === value || o.id === value}>
              <button
                type="button"
                className={(o.label === value || o.id === value) ? 'active' : ''}
                onClick={() => { onChange(o.id); onOpenChange(false); }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ title, desc, control, extra }) {
  return (
    <div className="st-row">
      <div className="st-row-text">
        <div className="st-row-title">{title}</div>
        {desc && <p className="st-row-desc">{desc}</p>}
        {extra}
      </div>
      {control && <div className="st-row-ctrl">{control}</div>}
    </div>
  );
}

export default function SettingsModal({
  mounted,
  shown,
  onClose,
  devices,
  mediaAllowed = true,
  sel,
  onSelectDevice,
  camFound,
  onTestSpeakers,
  pushToTalk = false,
  onPushToTalkChange = () => {},
  onSendResolutionChange,
}) {
  const [tab, setTab] = useState('audio');
  const [openMenu, setOpenMenu] = useState('');
  const [sendRes, setSendRes] = useState('Auto');
  const [resolutionError, setResolutionError] = useState('');
  const [recvRes, setRecvRes] = useState('Auto');
  const [diag, setDiag] = useState(true);
  const [pip, setPip] = useState('Always automatically show');
  const [desktopNotif, setDesktopNotif] = useState(true);
  const [leaveEmpty, setLeaveEmpty] = useState(true);
  const [contactsOnly, setContactsOnly] = useState(false);
  const [lang, setLang] = useState('English');
  const [showReactions, setShowReactions] = useState(true);
  const [anim, setAnim] = useState(true);
  const [sound, setSound] = useState(false);
  const [a11y, setA11y] = useState("Don't announce reactions");

  useEffect(() => {
    if (!shown) setOpenMenu('');
  }, [shown, tab]);

  if (!mounted) return null;

  const micOpts = (devices.mics || []).map((d) => ({ id: d.id, label: d.label }));
  const spkOpts = (devices.speakers || []).map((d) => ({ id: d.id, label: d.label }));
  const camOpts = camFound
    ? (devices.cams || []).map((d) => ({ id: d.id, label: d.label }))
    : [{ id: '', label: 'Camera not found' }];

  const micLabel = micOpts.find((d) => d.id === sel.mic)?.label || micOpts[0]?.label || 'Microphone';
  const spkLabel = spkOpts.find((d) => d.id === sel.speaker)?.label || spkOpts[0]?.label || 'Speakers';
  const camLabel = camFound
    ? (camOpts.find((d) => d.id === sel.cam)?.label || camOpts[0]?.label || 'Camera')
    : 'Camera not found';

  return (
    <>
      <div className={`st-scrim ${shown ? 'show' : ''}`} onMouseDown={onClose} aria-hidden="true" />
      <div className={`st-shell ${shown ? 'show' : ''}`}>
        <aside className="st-panel" role="dialog" aria-modal="true" aria-labelledby="st-title">
          <nav className="st-nav" aria-label="Settings">
            <h2 id="st-title">Settings</h2>
            {TABS.map((t) => {
              const Icon = TAB_ICONS[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`st-nav-item ${tab === t.id ? 'active' : ''}`}
                  aria-current={tab === t.id ? 'page' : undefined}
                  onClick={() => { setTab(t.id); setOpenMenu(''); }}
                >
                  <Icon />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="st-main">
            <div className="st-main-bar">
              <button type="button" className="fb-close" aria-label="Close" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="st-pages">
              <div className={`st-page ${tab === 'audio' ? 'show' : ''}`} aria-hidden={tab !== 'audio'}>
                <div className="st-content">
                  <SettingSelect
                    label="Microphone"
                    disabled={!mediaAllowed}
                    icon={<IconMic />}
                    value={mediaAllowed ? micLabel : 'Permission needed'}
                    options={micOpts.length ? micOpts : [{ id: '', label: 'No microphone found' }]}
                    onChange={(id) => id && onSelectDevice('mic', id)}
                    open={openMenu === 'mic'}
                    onOpenChange={(v) => setOpenMenu(v ? 'mic' : '')}
                    menuId="st-mic-menu"
                  />
                  <Row
                    title="Push to talk"
                    desc="Hold down the space bar to turn on your microphone."
                    control={<Toggle on={pushToTalk} onChange={onPushToTalkChange} label="Push to talk" />}
                  />
                  <div className="st-speaker-row">
                  <SettingSelect
                    label="Speakers"
                    disabled={!mediaAllowed}
                    icon={<IconSpeaker />}
                    value={mediaAllowed ? spkLabel : 'Permission needed'}
                    options={spkOpts.length ? spkOpts : [{ id: '', label: 'No speakers found' }]}
                    onChange={(id) => id && onSelectDevice('speaker', id)}
                    open={openMenu === 'spk'}
                    onOpenChange={(v) => setOpenMenu(v ? 'spk' : '')}
                    menuId="st-spk-menu"
                  />
                  <button className="st-test-speakers" type="button" onClick={onTestSpeakers}>Test</button>
                  </div>
                  <details className="st-call-controls">
                    <summary>Call controls</summary>
                    <p>Use a compatible headset to mute and unmute your microphone.</p>
                  </details>
                </div>
              </div>

              <div className={`st-page ${tab === 'video' ? 'show' : ''}`} aria-hidden={tab !== 'video'}>
                <div className="st-content">
                  <SettingSelect
                    label="Camera"
                    disabled={!mediaAllowed}
                    icon={<IconCam />}
                    value={mediaAllowed ? camLabel : 'Permission needed'}
                    warn={mediaAllowed && !camFound}
                    options={camOpts}
                    onChange={(id) => id && onSelectDevice('cam', id)}
                    open={openMenu === 'cam'}
                    onOpenChange={(v) => setOpenMenu(v ? 'cam' : '')}
                    menuId="st-cam-menu"
                  />
                  <SettingSelect
                    label="Send resolution (maximum)"
                    value={sendRes}
                    options={SEND_RES}
                    onChange={async (value) => {
                      setResolutionError('');
                      try {
                        await onSendResolutionChange?.(value);
                        setSendRes(value);
                      } catch {
                        setResolutionError('This camera could not use the selected resolution. Try a lower resolution.');
                      }
                    }}
                    open={openMenu === 'send'}
                    onOpenChange={(v) => setOpenMenu(v ? 'send' : '')}
                    menuId="st-send-menu"
                  />
                  {resolutionError && <p className="st-error" role="status">{resolutionError}</p>}
                  <SettingSelect
                    label="Receive resolution (maximum)"
                    value={recvRes}
                    options={RECV_RES}
                    onChange={setRecvRes}
                    open={openMenu === 'recv'}
                    onOpenChange={(v) => setOpenMenu(v ? 'recv' : '')}
                    menuId="st-recv-menu"
                  />
                </div>
              </div>

              <div className={`st-page ${tab === 'general' ? 'show' : ''}`} aria-hidden={tab !== 'general'}>
                <div className="st-content st-content-rows">
                  <Row
                    title="Send additional diagnostic info to Google"
                    desc="Google uses these system logs to make Meet better for everyone."
                    control={<Toggle on={diag} onChange={setDiag} label="Send additional diagnostic info to Google" />}
                  />
                  <Row
                    title="Automatic picture-in-picture"
                    desc="Select when you want picture-in-picture to automatically show."
                    extra={(
                      <div className="st-inline-select">
                        <SettingSelect
                          value={pip}
                          options={PIP_OPTS}
                          onChange={setPip}
                          open={openMenu === 'pip'}
                          onOpenChange={(v) => setOpenMenu(v ? 'pip' : '')}
                          menuId="st-pip-menu"
                        />
                      </div>
                    )}
                  />
                  <Row
                    title="Desktop notifications"
                    desc="Meet can show desktop notifications to let you answer incoming video calls and take other actions in Meet."
                    control={<Toggle on={desktopNotif} onChange={setDesktopNotif} label="Desktop notifications" />}
                    extra={(
                      <div className="st-banner">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                        <span>
                          <a href="https://support.google.com/chrome/answer/3220216" target="_blank" rel="noreferrer">Turn on notifications on your browser</a>
                          {' '}to see desktop notifications
                        </span>
                      </div>
                    )}
                  />
                  <Row
                    title="Leave empty calls"
                    desc="Removes you from a call after a few minutes if no one else joins."
                    control={<Toggle on={leaveEmpty} onChange={setLeaveEmpty} label="Leave empty calls" />}
                  />
                  <Row
                    title="Only contacts can call me"
                    desc="Google Contacts and people you've interacted with in Google services."
                    control={<Toggle on={contactsOnly} onChange={setContactsOnly} label="Only contacts can call me" />}
                    extra={(
                      <a className="st-link" href="https://support.google.com/contacts/answer/1061434" target="_blank" rel="noreferrer">
                        Learn more about saved contacts
                      </a>
                    )}
                  />
                  <Row
                    title="Add or change your phone number"
                    desc="Adding your phone number to your Google Account lets you call others and be called by them using that number."
                    control={(
                      <button type="button" className="st-outline-btn" disabled title="Requires a connected Google Account">Add or change</button>
                    )}
                  />
                  <Row
                    title="Block people"
                    desc="Only people from one-to-one calls can be blocked. People you block cannot call you, but can still join your meetings or group calls."
                    control={<button type="button" className="st-outline-btn" disabled title="Requires a connected Google Account">See who's blocked</button>}
                  />
                  <Row
                    title="Google Workspace smart features"
                    desc="Personalize your experience with smart features in Google Workspace and other Google products."
                    control={<button type="button" className="st-outline-btn" disabled title="Requires a connected Google Account">Manage</button>}
                  />
                </div>
              </div>

              <div className={`st-page ${tab === 'speech' ? 'show' : ''}`} aria-hidden={tab !== 'speech'}>
                <div className="st-content st-content-rows">
                  <div className="st-block">
                    <div className="st-row-title">Translate into this language</div>
                    <p className="st-row-desc">When using translation, you&apos;ll hear people translated into your selected language</p>
                    <SettingSelect
                      value={lang}
                      options={LANGS}
                      onChange={setLang}
                      open={openMenu === 'lang'}
                      onOpenChange={(v) => setOpenMenu(v ? 'lang' : '')}
                      menuId="st-lang-menu"
                    />
                  </div>
                  <div className="st-block">
                    <div className="st-row-title">Never translate these languages</div>
                    <button type="button" className="st-add-lang">+ Add a language</button>
                  </div>
                  <div className="st-block">
                    <div className="st-row-title">Translate my voice</div>
                    <p className="st-row-desc">Translate what you say for others</p>
                    <button type="button" className="st-primary-btn">Allow translation</button>
                    <a className="st-link" href="https://support.google.com/meet/answer/14081908" target="_blank" rel="noreferrer">
                      Learn more about speech translation
                    </a>
                  </div>
                </div>
              </div>

              <div className={`st-page ${tab === 'reactions' ? 'show' : ''}`} aria-hidden={tab !== 'reactions'}>
                <div className="st-content st-content-rows">
                  <Row
                    title="Show reactions from others"
                    desc="When off, your own reactions still appear"
                    control={<Toggle on={showReactions} onChange={setShowReactions} label="Show reactions from others" />}
                  />
                  <Row
                    title="Animation"
                    desc="Reactions move on the screen"
                    control={<Toggle on={anim} onChange={setAnim} label="Animation" />}
                  />
                  <Row
                    title="Sound"
                    desc="Sound can accompany reactions"
                    control={<Toggle on={sound} onChange={setSound} label="Sound" />}
                  />
                  <div className="st-block">
                    <div className="st-row-title">Accessibility</div>
                    <p className="st-row-desc">Select how you want to hear reactions if you are using a screen reader</p>
                    <SettingSelect
                      value={a11y}
                      options={REACT_A11Y}
                      onChange={setA11y}
                      open={openMenu === 'a11y'}
                      onOpenChange={(v) => setOpenMenu(v ? 'a11y' : '')}
                      menuId="st-a11y-menu"
                    />
                    <p className="st-hint">You can also press Shift + R to change how you hear reactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
