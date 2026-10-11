import { ImageResponse } from "next/og";

export const alt = "NESJA.OS — The Commercial Operating System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "linear-gradient(135deg, #0C1324 0%, #111A2F 60%, #13224a 100%)", color: "#F5F7FB" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 4 }}>NESJA<span style={{ color: "#12C6C2" }}>.OS</span></div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>Your commercial operation.</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#12C6C2" }}>One intelligent system.</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#C9D1DC" }}>The Commercial Operating System</div>
      </div>
    ),
    size,
  );
}
