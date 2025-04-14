import { describe, it, expect } from "vitest";
import { detectImageContent } from "./image-processing";

describe("Image Processing", () => {
  describe("detectImageContent", () => {
    // Test with real images from URLs
    it("should detect a cat from a cat image", async () => {
      const result = await detectImageContent(
        "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg"
      );
      expect(result.toLowerCase()).toBe("cat");
    }, 30000);

    it("should detect a dog from a dog image", async () => {
      const result = await detectImageContent(
        "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg"
      );
      expect(result.toLowerCase()).toBe("dog");
    }, 30000);

    it("should detect a human from a human image", async () => {
      const result = await detectImageContent(
        "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
      );
      expect(result.toLowerCase()).toBe("human");
    }, 30000);

    // Test invalid inputs
    it("should handle invalid image URLs", async () => {
      await expect(detectImageContent("invalid-url")).rejects.toThrowError(
        "Invalid URL"
      );
    });

    it("should handle null image URL", async () => {
      // @ts-ignore - Testing invalid input
      await expect(detectImageContent(null)).rejects.toThrowError(
        "Invalid URL"
      );
    });
  });
});
