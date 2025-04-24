// Original prompts preserved for reference
// export const ORIGINAL_IMAGE_PROMPT = `Stylize this image with a touch of stylized realism, subtle sharpening, maintaining original composition,
//   aspect ratio, and subject positioning/direction.`;

// export const HUMAN_TO_ANIMAL_PROMPT = (targetAnimalType: string) =>
//   `Generate a portrait of a ${targetAnimalType} that is a representation in animal form of the input human image.

// Style:
// * Subtle, stylized realistic style.
// * Emphasize expressive eyes and subtle shifts in muscle tension to convey emotional state.

// Core Task:
// * Analyze: Carefully examine the input human image to identify and extract the primary colors, facial expression and emotional
//   mood (e.g., happiness, sadness, anger, surprise).
// * Translate: Translate this specific emotional state onto the face of the ${targetAnimalType} in a manner that feels natural
//   and believable for that species. Consider how this particular emotion would be expressed through the animal's unique facial features.`;

// export const ANIMAL_TO_HUMAN_PROMPT = (type: string) =>
//   `Render this image of a ${type} as a human with subtle, stylized photorealism (like Pixar or Dreamworks)
// with shot-on-iPhone level quality. Maintain the essential features and overall composition of the original photo.
// Ensure the final image depicts a human with standard human anatomy and facial features, with no ${type} characteristics
// like fur, feathers, tails, claws, or animal-like features.`;

// Charming style prompts - optimized for delightful, appealing transformations
export const ORIGINAL_IMAGE_PROMPT_CHARMING = `Transform this image into a charming, storybook-like portrait while maintaining its essence.
Apply a warm, inviting style reminiscent of high-end animated films, with:
- Enhanced lighting that creates a gentle glow
- Subtle color enhancement to create a warm, welcoming mood
- Crisp details that make the subject "pop" without looking artificial
- Preservation of the original composition and emotional expression
Make it feel like a moment from a beloved animated feature film.`;

export const HUMAN_TO_ANIMAL_PROMPT_CHARMING = (targetAnimalType: string) =>
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

export const ANIMAL_TO_HUMAN_PROMPT_CHARMING = (type: string) =>
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

// Realistic style prompts - optimized for natural, photorealistic transformations
export const ORIGINAL_IMAGE_PROMPT_REALISTIC = `Enhance this image to professional photography quality while maintaining natural appearance:
- Match the quality of high-end portrait/wildlife photography
- Optimize lighting and detail
- Keep natural color tones
- Preserve the original subject exactly as is
- No style changes, just quality enhancement

The final image should look like it was taken by a professional photographer with high-end equipment.`;

export const HUMAN_TO_ANIMAL_PROMPT_REALISTIC = (targetAnimalType: string) =>
  `Transform this human into a photorealistic ${targetAnimalType} portrait.

IMPORTANT: The output MUST be a ${targetAnimalType}, not a human. Create a ${targetAnimalType} that captures the personality of the human.

Requirements:
- Output must be a realistic ${targetAnimalType}
- Professional wildlife photography quality
- Natural ${targetAnimalType} anatomy and features
- Maintain the emotional expression of the human
- Use the human's features as inspiration for the ${targetAnimalType}'s coloring

Example translation:
- Human's hair color → Similar-toned fur/feathers
- Human's eye color → Similar ${targetAnimalType} eye color
- Human's expression → Equivalent ${targetAnimalType} expression
- Human's pose → Natural ${targetAnimalType} pose that conveys similar feeling

The final image MUST be a photorealistic ${targetAnimalType} portrait that looks like a professional wildlife photo, while capturing the essence and personality of the original human.`;

export const ANIMAL_TO_HUMAN_PROMPT_REALISTIC = (type: string) =>
  `Transform this ${type} into a photorealistic human portrait. 

IMPORTANT: The output MUST be a human being, not an animal. Create a human face that captures the personality of the ${type}.

Requirements:
- Output must be a realistic human face/portrait
- NO animal features in the final image
- Natural human skin, eyes, nose, and mouth
- Professional portrait photography style
- Maintain the emotional expression and personality of the ${type}
- Use the ${type}'s colors and patterns as inspiration for human features (hair color, eye color, etc.)

Example translation:
- ${type}'s alert ears → Raised eyebrows or attentive expression
- ${type}'s fur color → Similar-toned hair color
- ${type}'s eye color → Similar human eye color
- ${type}'s expression → Equivalent human facial expression

The final image MUST be a photorealistic human portrait that looks like a professional headshot, while capturing the essence and personality of the original ${type}.`;
