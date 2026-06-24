import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosClient';

/**
 * useIdleTimeout — Auto-ejects the user after 60 seconds of inactivity.
 *
 * Flow:
 *   1. Idle for IDLE_MS → show 10-second countdown modal
 *   2. If countdown reaches zero → revoke JWT, clear storage, redirect to /login
 *   3. If user interacts during countdown → reset timer silently
 *
 * Returns: { showCountdown, countdown, resetTimer }
 */
const IDLE_MS = 60_000;       // 60 seconds before countdown starts
const COUNTDOWN_SEC = 10;    // 10-second warning before auto-eject

export const useIdleTimeout = (enabled = true) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);

  const idleTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const ejectUser = useCallback(async () => {
    // Revoke JWT server-side
    const token = localStorage.getItem('fintech_jwt');
    if (token) {
      try {
        await api.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* Silent */ }
    }
    localStorage.removeItem('fintech_jwt');
    localStorage.removeItem('fintech_username');
    localStorage.removeItem('anti_phishing_phrase');
    window.location.href = '/login';
  }, []);

  const startCountdown = useCallback(() => {
    setShowCountdown(true);
    setCountdown(COUNTDOWN_SEC);

    let remaining = COUNTDOWN_SEC;
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownTimerRef.current);
        ejectUser();
      }
    }, 1000);
  }, [ejectUser]);

  const resetTimer = useCallback(() => {
    // If countdown is showing, dismiss it
    if (showCountdown) {
      clearInterval(countdownTimerRef.current);
      setShowCountdown(false);
      setCountdown(COUNTDOWN_SEC);
    }

    // Reset the idle timer
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(startCountdown, IDLE_MS);
  }, [showCountdown, startCountdown]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    idleTimerRef.current = setTimeout(startCountdown, IDLE_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimeout(idleTimerRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, [enabled, resetTimer, startCountdown]);

  return { showCountdown, countdown, resetTimer };
};
