"use client";

import { ArrowRight, Leaf } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const INTRO_STORAGE_KEY = "kmh-intro-seen";

function subscribeToIntroPreference() {
  return () => undefined;
}

function getIntroPreference() {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function IntroExperience() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const finishing = useRef(false);
  const introSeen = useSyncExternalStore(
    subscribeToIntroPreference,
    getIntroPreference,
    () => false,
  );

  const finishIntro = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;

    setLeaving(true);
    try {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {
      // The intro still works when browser storage is unavailable.
    }
    window.setTimeout(() => setVisible(false), 850);
  }, []);

  useEffect(() => {
    if (introSeen || !visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(finishIntro, reducedMotion ? 1200 : 4800);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [finishIntro, introSeen, visible]);

  if (!visible || (introSeen && !leaving)) return null;

  return (
    <div
      className={`intro-screen grain ${leaving ? "intro-screen-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Kitchen Made Health"
    >
      <div className="intro-orbit intro-orbit-one" aria-hidden="true" />
      <div className="intro-orbit intro-orbit-two" aria-hidden="true" />
      <div className="intro-glow" aria-hidden="true" />

      <div className="intro-content">
        <div className="intro-mark" aria-hidden="true">
          <Leaf size={21} strokeWidth={1.5} />
        </div>
        <p className="intro-kicker">From the kitchen, for everyday health</p>
        <h1 className="intro-title">
          <span className="intro-word intro-word-one">Kitchen</span>
          <span className="intro-word intro-word-two">Made</span>
          <span className="intro-word intro-word-three">Health</span>
        </h1>
        <div className="intro-rule" aria-hidden="true">
          <span />
        </div>
        <p className="intro-subtitle">Where living well takes root.</p>
      </div>

      <button type="button" onClick={finishIntro} className="intro-enter">
        Enter the kitchen <ArrowRight size={15} />
      </button>
      <p className="intro-edition" aria-hidden="true">
        Thoughtful food · useful tools · healthier rituals
      </p>
    </div>
  );
}
