import { ImageResponse } from "next/og";
import { getCourseDetail } from "@/lib/course-detail";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Course rating summary";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const detail = await getCourseDetail(decodeURIComponent(code));

  const accent = detail?.course.discipline?.colorAccent ?? "#8B5CF6";
  const usefulLabel = detail?.useful == null ? "Not enough ratings" : `${Math.round(detail.useful)}% useful`;

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
            {detail?.course.code ?? code}
          </div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, marginTop: 16, maxWidth: 1000 }}>
            {detail?.course.title ?? "Course not found"}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", fontSize: 30, color: accent }}>{usefulLabel}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#9AA3B2", letterSpacing: 2 }}>
            PURPLEPRINT
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
