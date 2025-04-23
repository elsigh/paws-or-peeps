// Original prompts preserved for reference
export const ORIGINAL_IMAGE_PROMPT = `Stylize this image with a touch of stylized realism, subtle sharpening, maintaining original composition, 
  aspect ratio, and subject positioning/direction.`;

export const HUMAN_TO_ANIMAL_PROMPT = (targetAnimalType: string) =>
  `Generate a portrait of a ${targetAnimalType} that is a representation in animal form of the input human image.

Style: 
* Subtle, stylized realistic style.
* Emphasize expressive eyes and subtle shifts in muscle tension to convey emotional state.

Core Task: 
* Analyze: Carefully examine the input human image to identify and extract the primary colors, facial expression and emotional 
  mood (e.g., happiness, sadness, anger, surprise).
* Translate: Translate this specific emotional state onto the face of the ${targetAnimalType} in a manner that feels natural 
  and believable for that species. Consider how this particular emotion would be expressed through the animal's unique facial features.`;

export const ANIMAL_TO_HUMAN_PROMPT = (type: string) =>
  `Render this image of a ${type} as a human with subtle, stylized photorealism (like Pixar or Dreamworks) 
with shot-on-iPhone level quality. Maintain the essential features and overall composition of the original photo. 
Ensure the final image depicts a human with standard human anatomy and facial features, with no ${type} characteristics 
like fur, feathers, tails, claws, or animal-like features.`;

// Enhanced V2 prompts for more delightful and engaging results
export const ORIGINAL_IMAGE_PROMPT_V2 = `Transform this image into a charming, storybook-like portrait while maintaining its essence.
Apply a warm, inviting style reminiscent of high-end animated films, with:
- Enhanced lighting that creates a gentle glow
- Subtle color enhancement to create a warm, welcoming mood
- Crisp details that make the subject "pop" without looking artificial
- Preservation of the original composition and emotional expression
Make it feel like a moment from a beloved animated feature film.`;

export const HUMAN_TO_ANIMAL_PROMPT_V2 = (targetAnimalType: string) =>
  `Create a heartwarming ${targetAnimalType} portrait that captures the human's personality and spirit.

Style Guide:
- Use a charming, animated film quality (think Zootopia/Raya-level detail)
- Create soft, appealing lighting that highlights character
- Maintain a playful yet dignified presence
- Ensure eyes are expressive and engaging, drawing viewers in

Character Translation:
1. Personality Mapping:
   - Mirror the human's facial expression and emotional energy
   - Capture their unique personality traits in the ${targetAnimalType}'s pose and expression
   - Preserve their distinct character while making it feel natural for a ${targetAnimalType}

2. Detail Enhancement:
   - Add subtle details that make the ${targetAnimalType} feel both realistic and appealing
   - Include small personality touches that hint at the human's character
   - Ensure fur/feathers have a soft, touchable quality

3. Emotional Connection:
   - Create an immediate sense of recognition between the original and transformed image
   - Make viewers smile at the clever translation of human traits to ${targetAnimalType} features
   - Keep the same emotional warmth and presence as the original photo`;

export const ANIMAL_TO_HUMAN_PROMPT_V2 = (type: string) =>
  `Create a delightful human portrait that captures the spirit and charm of this ${type}.

Style Guide:
- Use a high-quality animated film aesthetic (think modern Disney/Pixar human characters)
- Create warm, inviting lighting that brings out personality
- Maintain a natural, appealing human appearance
- Ensure eyes capture the same spark and character as the ${type}

Character Translation:
1. Personality Preservation:
   - Transform the ${type}'s expression into human facial features while keeping the emotional essence
   - Capture the animal's unique personality in human body language and pose
   - Maintain the same energy and charm in human form

2. Feature Adaptation:
   - Create natural human features that subtly echo the ${type}'s most endearing characteristics
   - Use hair style, facial features, and expression to capture the ${type}'s personality
   - Ensure the human looks completely natural while feeling familiar to the original ${type}

3. Emotional Connection:
   - Make the connection between the original and transformed image immediately apparent
   - Keep the same emotional warmth and presence
   - Create a human portrait that makes viewers smile at the clever transformation`;
