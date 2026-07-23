"use client";

import { useEffect } from "react";

export function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `kmh-viewed-${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch(`/api/views/${postId}`, { method: "POST", keepalive: true });
  }, [postId]);

  return null;
}
