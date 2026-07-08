import { ImageResponse } from "next/og";

export const alt = "Barbearia Garcez — Corte com estilo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#1a2129",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.35em",
            color: "#bbbbbb",
            textTransform: "uppercase",
          }}
        >
          Barbearia
        </div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.05,
          }}
        >
          Garcez
        </div>
        <div style={{ display: "flex", marginTop: 28 }}>
          <div style={{ width: 220, height: 8, backgroundColor: "#1c69d4" }} />
        </div>
        <div style={{ fontSize: 34, marginTop: 36, color: "#bbbbbb" }}>
          O corte que define o homem. Agende online — sem cadastro.
        </div>
      </div>
    ),
    size,
  );
}
