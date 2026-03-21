import { useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { STORAGE_KEYS, AUDIO_PARAMS } from '../constants.js';

export function useAudio() {
  const ctxRef = useRef(null);
  const [muted, setMuted] = useLocalStorage(STORAGE_KEYS.SETTINGS + '-muted', false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq, duration, type, startTime) => {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }, [muted, getCtx]);

  const playFlip = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    const { freq, duration, type } = AUDIO_PARAMS.flip;
    playTone(freq, duration, type, ctx.currentTime);
  }, [muted, getCtx, playTone]);

  const playShuffle = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    const { freq, duration, type, repeat, gap } = AUDIO_PARAMS.shuffle;
    for (let i = 0; i < repeat; i++) {
      playTone(freq + Math.random() * 200, duration, type, ctx.currentTime + (i * gap) / 1000);
    }
  }, [muted, getCtx, playTone]);

  const playSuccess = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    const { freqs, duration, type } = AUDIO_PARAMS.success;
    playTone(freqs[0], duration, type, ctx.currentTime);
    playTone(freqs[1], duration, type, ctx.currentTime + duration * 0.8);
  }, [muted, getCtx, playTone]);

  const playFail = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    const { freqs, duration, type } = AUDIO_PARAMS.fail;
    playTone(freqs[0], duration, type, ctx.currentTime);
    playTone(freqs[1], duration * 1.5, type, ctx.currentTime + duration * 0.5);
  }, [muted, getCtx, playTone]);

  return {
    playFlip,
    playShuffle,
    playSuccess,
    playFail,
    muted,
    setMuted,
  };
}
