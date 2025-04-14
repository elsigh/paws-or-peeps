import { describe, it, expect } from "vitest";
import { detectImageContent } from "./image-processing";

describe("Image Processing", () => {
  describe("detectImageContent", () => {
    // Test with real images from URLs
    it("should detect a cat from a cat image", async () => {
      const result = await detectImageContent(
        "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg"
      );
      console.log("Cat detection result:", result);
      expect(result).toBe("cat");
    }, 30000);

    // it("should detect a dog from a dog image", async () => {
    //   const result = await detectImageContent(
    //     "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg"
    //   );
    //   console.log("Dog detection result:", result);
    //   expect(result.type).toBe("dog");
    //   expect(result.confidence).toBeGreaterThan(70);
    // }, 30000);

    // it("should detect a human from a human image", async () => {
    //   const result = await detectImageContent(
    //     "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
    //   );
    //   console.log("Human detection result:", result);
    //   expect(result.type).toBe("human");
    //   expect(result.confidence).toBeGreaterThan(70);
    // }, 30000);

    // // Test invalid inputs
    // it("should handle invalid image URLs", async () => {
    //   const result = await detectImageContent("invalid-url");
    //   expect(result.type).toBe("other");
    //   expect(result.confidence).toBe(60.0);
    // });

    // it("should handle null image URL", async () => {
    //   // @ts-ignore - Testing invalid input
    //   const result = await detectImageContent(null);
    //   expect(result.type).toBe("other");
    //   expect(result.confidence).toBe(60.0);
    // });
  });
});
