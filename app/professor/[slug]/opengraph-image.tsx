import { ImageResponse } from "next/og";
import { getProfessorDetail } from "@/lib/professor-detail";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Professor rating summary";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getProfessorDetail(decodeURIComponent(slug));

  const accent = detail?.professor.discipline?.colorAccent ?? "#8B5CF6";
  const clarityLabel =
    detail?.clarity == null ? "Not enough ratings" : `${Math.round(detail.clarity)}% clarity`;
  const name = detail ? `${detail.professor.firstName} ${detail.professor.lastName}` : "Professor not found";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0E14",
          padding: 72,
          color: "#EDEBE6",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", width: 64, height: 8, background: accent }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, letterSpacing: 4, color: "#9AA3B2", textTransform: "uppercase" }}>
            {detail?.professor.title ?? "Professor"}
          </div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, marginTop: 16, maxWidth: 1000 }}>
            {name}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", fontSize: 30, color: accent }}>{clarityLabel}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#9AA3B2", letterSpacing: 2 }}>
            WESTERN ENG INSIDER
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
