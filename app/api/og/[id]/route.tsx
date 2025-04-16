import { ImageResponse } from "next/og";
import { getImageById } from "@/lib/image-processing";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the image data
    const imageData = await getImageById(id);

    if (!imageData) {
      return new Response("Image not found", { status: 404 });
    }

    const { original_url, animated_url, opposite_url, image_type } = imageData;

    // Determine which images to show side by side
    const leftImage = image_type === "human" ? animated_url : opposite_url;
    const rightImage = image_type === "human" ? opposite_url : animated_url;

    return new ImageResponse(
      (
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
            Which is the real picture?
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  padding: "10px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  textAlign: "center",
                  fontSize: "24px",
                }}
              >
                Human 👤
              </div>
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  padding: "10px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  textAlign: "center",
                  fontSize: "24px",
                }}
              >
                {imageData.target_animal_type || "Cat"} 🐾
              </div>
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
            🐾 Paws or Peeps 💁 | Vote on the original!
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
