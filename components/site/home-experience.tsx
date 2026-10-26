"use client";

import { useEffect, useRef } from "react";

export function HomeExperience({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    if (!container || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    container.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    container.dataset.reveal = "ready";
    return () => {
      observer.disconnect();
      delete container.dataset.reveal;
    };
  }, [children]);
  return <div ref={root} className="home-page">{children}</div>;
}
