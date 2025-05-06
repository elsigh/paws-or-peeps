import { APP_TITLE_WITH_EMOJI, OG_HEADLINE } from "@/lib/constants";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // Use static images for the homepage OG image
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://pawsorpeeps.com";
    const leftImage = `${baseUrl}/images/human.jpeg`;
    const rightImage = `${baseUrl}/images/animal.jpeg`;

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          backgroundColor: "#fff",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "40px",
            color: "#333",
          }}
        >
          {OG_HEADLINE}
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          {/* Left image */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "45%",
              height: "400px",
              position: "relative",
              overflow: "hidden",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={leftImage}
              alt="Human version"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Right image */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "45%",
              height: "400px",
              position: "relative",
              overflow: "hidden",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={rightImage}
              alt="Animal version"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
            fontSize: "28px",
            color: "#666",
          }}
        >
          {APP_TITLE_WITH_EMOJI}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
