import { useState, useEffect, useCallback } from 'react';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   LAYER 4: PRIVACY SHIELD — VIEWPORT OBFUSCATION ENGINE     ║
 * ║   Threat: Shoulder Surfing / Screen Capture / Tab Exposure   ║
 * ║   Defense: Blur + lock on focus loss and 2-min inactivity   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Usage in any component:
 *   const { privacyActive, unlock } = useSecurityShield();
 *   <div className={privacyActive ? 'blur-xl select-none' : ''}>
 *     ...sensitive data...
 *   </div>
 *
 * The hook will:
 *   1. Blur immediately when the user switches tabs / minimizes window
 *   2. Auto-lock after 2 minutes of zero mouse/keyboard activity
 *   3. Require the user to click a button to reveal data again
 */
export const useSecurityShield = (timeoutMs = 120_000) => {
  const [privacyActive, setPrivacyActive] = useState(false);

  const lock = useCallback(() => setPrivacyActive(true), []);
  const unlock = useCallback(() => setPrivacyActive(false), []);

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(lock, timeoutMs);
    };

    // Immediately blur if user leaves the active browser tab
    const handleBlur = () => lock();
    // Do NOT auto-unlock on focus — require explicit user action
    const handleFocus = () => {}; // intentionally empty

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    // Start the inactivity countdown on mount
    resetTimer();

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      clearTimeout(inactivityTimer);
    };
  }, [lock, timeoutMs]);

  return { privacyActive, lock, unlock };
};
