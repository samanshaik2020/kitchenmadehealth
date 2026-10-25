import { ImageResponse } from "next/og";

export const alt = "Kitchen Made Health — practical guides to food and everyday wellbeing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#10261d", color: "#f6f2e9", padding: "70px", flexDirection: "column", justifyContent: "space-between", border: "18px solid #9dad82" }}>
      <div style={{ display: "flex", fontSize: 30, letterSpacing: 5, color: "#b9c8a4" }}>FOOD · KITCHEN · EVERYDAY WELLBEING</div>
      <div style={{ display: "flex", flexDirection: "column", fontFamily: "serif", fontSize: 92, lineHeight: 1.05 }}><span>Kitchen Made</span><span style={{ color: "#b9c8a4" }}>Health</span></div>
      <div style={{ display: "flex", fontSize: 28 }}>Practical ideas. Clear sources. Small, useful steps.</div>
    </div>,
    size,
  );
}
