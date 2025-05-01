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

export const HUMAN_TO_ANIMAL_PROMPT_CHARMING = (
  targetAnimalType: string,
  gender: string,
) =>
  `The human subject is ${gender}.
IMPORTANT: The emotional expression and mood MUST match the original human image exactly. Do NOT make the ${targetAnimalType} appear happier, more cheerful, or more delightful than the original. If the human is sad, angry, or neutral, the ${targetAnimalType} must reflect that same mood.

Create a heartwarming ${targetAnimalType} portrait that captures the human's personality and spirit.

Style Guide:
- Use a charming, animated film quality (think Zootopia/Raya-level detail)
- Create soft, appealing lighting that highlights character
- Maintain a playful yet dignified presence, but do NOT alter the original mood or expression
- Ensure eyes are expressive and engaging, drawing viewers in

Character Translation:
1. Personality Mapping:
   - Mirror the human's facial expression and emotional energy exactly
   - Capture their unique personality traits in the ${targetAnimalType}'s pose and expression
   - Preserve their distinct character while making it feel natural for a ${targetAnimalType}

2. Detail Enhancement:
   - Add subtle details that make the ${targetAnimalType} feel both realistic and appealing
   - Include small personality touches that hint at the human's character
   - Ensure fur/feathers have a soft, touchable quality

3. Emotional Connection:
   - Create an immediate sense of recognition between the original and transformed image
   - The emotional presence must be identical to the original photo, whether it is warmth, sadness, anger, or any other mood.`;

export const ANIMAL_TO_HUMAN_PROMPT_CHARMING = (type: string, gender: string) =>
  `The human subject is ${gender}.
IMPORTANT: The emotional expression and mood MUST match the original ${type} image exactly. Do NOT make the human appear happier, more cheerful, or more delightful than the original. If the ${type} is sad, angry, or neutral, the human must reflect that same mood.

Create a delightful animated human character portrait that captures the spirit of this ${type}. 

IMPORTANT: The output MUST be a HUMAN CHARACTER - like a Disney/Pixar protagonist, NOT an animal.

Style Guide:
- Use high-quality animated film aesthetic (like modern Disney/Pixar human characters)
- Think of human characters like those in Frozen, Tangled, or Big Hero 6
- Create warm, inviting lighting that brings out personality
- Ensure the result is clearly a human face with human features

Character Translation Rules:
1. Human Features Required:
   - Must have a human face, human eyes, human nose, human mouth
   - Human hair instead of fur/feathers
   - Human skin instead of animal features
   - NO animal features in the final image

2. Personality Transfer:
   - Transform the ${type}'s personality and emotional expression into human expressions, matching the original mood exactly
   - Use the ${type}'s colors as inspiration for hair/eye color
   - Capture the ${type}'s energy in human body language
   - The emotional presence must be identical to the original ${type}, whether it is warmth, sadness, anger, or any other mood

3. Animation Style:
   - Clean, appealing animated human character design
   - Expressive human eyes that maintain the character's spirit
   - Soft, appealing lighting like modern animated films
   - Natural human skin tones and textures in animated style

The final image MUST be a human character in animated style - imagine if this ${type} was cast as a human protagonist in a Disney/Pixar film.`;

// Realistic style prompts - optimized for natural, photorealistic transformations
export const ORIGINAL_IMAGE_PROMPT_REALISTIC = `Enhance this image to professional photography quality while maintaining natural appearance:
- Match the quality of high-end portrait/wildlife photography
- Optimize lighting and detail
- Keep natural color tones
- Preserve the original subject exactly as is
- No style changes, just quality enhancement

The final image should look like it was taken by a professional photographer with high-end equipment.`;

export const HUMAN_TO_ANIMAL_PROMPT_REALISTIC = (
  targetAnimalType: string,
  gender: string,
) =>
  `The human subject is ${gender}.
IMPORTANT: The emotional expression and mood MUST match the original human image exactly. Do NOT alter the mood or emotional tone. If the human is sad, angry, or neutral, the ${targetAnimalType} must reflect that same mood.

Transform this human into a photorealistic ${targetAnimalType} portrait.

IMPORTANT: The output MUST be a ${targetAnimalType}, not a human. Create a ${targetAnimalType} that captures the personality of the human.

Requirements:
- Output must be a realistic ${targetAnimalType}
- Professional wildlife photography quality
- Natural ${targetAnimalType} anatomy and features
- Maintain the emotional expression and mood of the human exactly
- Use the human's features as inspiration for the ${targetAnimalType}'s coloring

Example translation:
- Human's hair color → Similar-toned fur/feathers
- Human's eye color → Similar ${targetAnimalType} eye color
- Human's expression → Equivalent ${targetAnimalType} expression, matching the original mood
- Human's pose → Natural ${targetAnimalType} pose that conveys similar feeling

The final image MUST be a photorealistic ${targetAnimalType} portrait that looks like a professional wildlife photo, while capturing the essence and personality of the original human.`;

export const ANIMAL_TO_HUMAN_PROMPT_REALISTIC = (
  type: string,
  gender: string,
) =>
  `The human subject is ${gender}.
IMPORTANT: The emotional expression and mood MUST match the original ${type} image exactly. Do NOT alter the mood or emotional tone. If the ${type} is sad, angry, or neutral, the human must reflect that same mood.

Transform this ${type} into a photorealistic human portrait. 

IMPORTANT: The output MUST be a human being, not an animal. Create a human face that captures the personality of the ${type}.

Requirements:
- Output must be a realistic human face/portrait
- NO animal features in the final image
- Natural human skin, eyes, nose, and mouth
- Professional portrait photography style
- Maintain the emotional expression and personality of the ${type}, matching the original mood exactly
- Use the ${type}'s colors and patterns as inspiration for human features (hair color, eye color, etc.)

Example translation:
- ${type}'s alert ears → Raised eyebrows or attentive expression
- ${type}'s fur color → Similar-toned hair color
- ${type}'s eye color → Similar human eye color
- ${type}'s expression → Equivalent human facial expression, matching the original mood

The final image MUST be a photorealistic human portrait that looks like a professional headshot, while capturing the essence and personality of the original ${type}.`;

export const ORIGINAL_IMAGE_PROMPT_APOCALYPTIC = `Transform this image into an epic, hellish fantasy portrait as if it were forged in the depths of the underworld.
Apply a bold, infernal style inspired by classic depictions of Hell, with:
- Rivers of lava, volcanic landscapes, and burning skies
- Demonic and devilish features: horns, fangs, bat wings, glowing red or orange eyes, and infernal runes or pentagrams
- Fiery, high-contrast lighting, magical embers, and swirling brimstone smoke
- Sinister, magical, and otherworldly details: chains, spiked armor, obsidian, and hellfire
- Preservation of the original composition and emotional expression, but filtered through a lens of demonic fantasy and infernal horror
The final image should look like a character or creature from a hellish, high-fantasy underworld, with unmistakable devilish and magical elements.
The result should be unapologetically infernal, fantastical, and visually striking.`;

export const HUMAN_TO_ANIMAL_PROMPT_APOCALYPTIC = (
  targetAnimalType: string,
  gender: string,
) =>
  `The human subject is ${gender}.
Transform this human into a ${targetAnimalType} as if reborn in the infernal depths of Hell.
Style Guide:
- Go all-in on hellish, demonic, and fantasy horror: horns, fangs, glowing red or orange eyes, bat wings, spiked tails, and infernal runes
- Place the creature in a volcanic, brimstone-filled landscape with rivers of lava, burning skies, and magical fire
- Use dramatic, fiery lighting, magical embers, and swirling smoke
- Add sinister, magical, and otherworldly details: chains, spiked armor, obsidian, pentagrams, and hellfire
- The ${targetAnimalType} should look like a powerful demon or hellbeast, but still recognizable as a transformation of the original human
- Mirror the human's emotional expression, but amplify it with infernal energy and fantasy horror
The result should be a visually stunning, devilish, and magical ${targetAnimalType} straight out of a hellish fantasy realm.`;

export const ANIMAL_TO_HUMAN_PROMPT_APOCALYPTIC = (
  type: string,
  gender: string,
) =>
  `The human subject is ${gender}.
Transform this ${type} into a human as if they were a lord or denizen of Hell in a high-fantasy universe.
Style Guide:
- Give the human demonic and infernal features: horns, fangs, glowing red or orange eyes, bat wings, magical tattoos, and infernal runes or pentagrams
- Place the character in a volcanic, hellish landscape with rivers of lava, burning skies, and magical fire
- Use dramatic, fiery lighting, magical embers, and swirling brimstone smoke
- Add sinister, magical, and otherworldly details: chains, spiked armor, obsidian, pentagrams, and hellfire
- The human should look like a powerful demon, warlock, or hell-prince(ss), but still echo the original ${type}'s spirit and expression
- Mirror the animal's emotional expression, but amplify it with infernal energy and fantasy horror
The result should be a visually stunning, devilish, and magical human straight out of a hellish fantasy underworld.`;

export const ORIGINAL_IMAGE_PROMPT_CHIBI = `Transform this image into a high-quality chibi-style portrait that balances cute aesthetics with realistic details.

Requirements:
- Professional chibi art style with realistic texturing and lighting
- Large head relative to body (approximately 1:2 or 1:3 ratio)
- Detailed, expressive anime-style eyes with realistic reflections and depth
- Semi-realistic facial features while maintaining chibi proportions
- Soft yet defined shapes with proper volume and form
- Natural color palette with subtle gradients
- Maintain core personality and expression
- Add subtle shading and highlights for dimensionality
- Keep the composition balanced and focused
- Professional lighting with soft shadows
- High-resolution details in hair, skin, and clothing
- Maintain a cute aesthetic while avoiding oversimplification

The final image should be a high-quality chibi interpretation that combines cute stylization with realistic rendering techniques.`;

export const HUMAN_TO_ANIMAL_PROMPT_CHIBI = (
  targetAnimalType: string,
  gender: string,
) =>
  `The human subject is ${gender}.
Transform this human into a high-quality chibi-style ${targetAnimalType} that balances cute aesthetics with realistic details.

Requirements:
- Professional chibi art style with realistic texturing and lighting
- Large head relative to body (approximately 1:2 ratio)
- Detailed, expressive anime-style eyes with realistic reflections
- Semi-realistic animal features while maintaining chibi proportions
- Natural fur/feather textures with proper volume
- Realistic color gradients and shading
- Maintain the emotional expression and personality exactly
- Add depth through careful shading and highlights
- Keep the composition balanced and focused
- Professional lighting with soft shadows
- High-resolution details in fur/feathers/features
- Maintain a cute aesthetic while preserving realism

Use the human's features as inspiration:
- Human's hair color → Similar-toned fur/feathers with realistic texturing
- Human's eye color → Similar ${targetAnimalType} eye color with depth and shine
- Human's expression → Equivalent chibi ${targetAnimalType} expression with anatomical accuracy
- Human's personality → Reflected in the pose and demeanor

The final image MUST be a high-quality chibi ${targetAnimalType} that combines cute stylization with realistic rendering techniques.`;

export const ANIMAL_TO_HUMAN_PROMPT_CHIBI = (type: string, gender: string) =>
  `The human subject is ${gender}.
Transform this ${type} into a high-quality chibi-style human that balances cute aesthetics with realistic details.

Requirements:
- Professional chibi art style with realistic texturing and lighting
- Large head relative to body (approximately 1:2 ratio)
- Detailed, expressive anime-style eyes with realistic reflections
- Semi-realistic facial features while maintaining chibi proportions
- Natural skin texture and hair with proper volume
- Realistic color gradients and shading
- Maintain the emotional expression and personality exactly
- Add depth through careful shading and highlights
- Keep the composition balanced and focused
- Professional lighting with soft shadows
- High-resolution details in hair, skin, and clothing
- Maintain a cute aesthetic while preserving realism

Use the ${type}'s features as inspiration:
- ${type}'s fur/feather color → Similar-toned hair with realistic texturing
- ${type}'s eye color → Similar human eye color with depth and shine
- ${type}'s expression → Equivalent chibi human expression with anatomical accuracy
- ${type}'s personality → Reflected in the pose and demeanor

The final image MUST be a high-quality chibi human that combines cute stylization with realistic rendering techniques.`;

export const ORIGINAL_IMAGE_PROMPT_ANGELIC = `Transform this image into a heavenly, ethereal portrait with divine aesthetics.

Requirements:
- Celestial, ethereal atmosphere with soft glowing light
- Delicate, luminous skin tones with subtle iridescence
- Flowing, ethereal fabrics in white and gold
- Soft, warm lighting with divine rays and halos
- Gentle, serene expression
- Incorporate subtle floating elements like feathers or light particles
- Add a subtle golden aura or nimbus
- Maintain a peaceful, tranquil composition
- Use a color palette of whites, golds, and soft pastels
- Include delicate, ethereal details like gossamer textures
- Create a sense of weightlessness and grace

The final image should evoke a sense of divine beauty, peace, and celestial grace while maintaining the subject's core essence.`;

export const HUMAN_TO_ANIMAL_PROMPT_ANGELIC = (
  targetAnimalType: string,
  gender: string,
) =>
  `Transform this ${gender} human into a divine, ethereal ${targetAnimalType} with angelic qualities.

Requirements:
- Create a majestic, celestial ${targetAnimalType} with divine features
- Add subtle glowing effects and halos
- Use a palette of whites, golds, and soft pastels
- Include ethereal elements like floating feathers or light particles
- Maintain a gentle, peaceful expression
- Add luminous fur/scales/feathers with an otherworldly sheen
- Create a heavenly atmosphere with divine lighting
- Incorporate subtle golden accents
- Keep the pose graceful and serene
- Add delicate, ethereal details

The final image should portray a divine, angelic ${targetAnimalType} that emanates peace and celestial beauty.`;

export const ANIMAL_TO_HUMAN_PROMPT_ANGELIC = (
  sourceAnimalType: string,
  gender: string,
) =>
  `Transform this ${sourceAnimalType} into a divine, ethereal ${gender} human with angelic qualities.

Requirements:
- Create a celestial human figure with ethereal features
- Incorporate subtle elements from the original ${sourceAnimalType}
- Add flowing, ethereal white and gold garments
- Include a soft, divine glow or halo
- Use luminous skin tones with subtle iridescence
- Create a heavenly atmosphere with gentle lighting
- Add floating elements like feathers or light particles
- Maintain a serene, peaceful expression
- Use a palette of whites, golds, and soft pastels
- Include delicate, ethereal details

The final image should be a divine human interpretation that captures the ${sourceAnimalType}'s essence in an angelic form.`;

export const ORIGINAL_IMAGE_PROMPT_GOTHIC = `Transform this image into a dark, Victorian Gothic masterpiece.

Requirements:
- Dark, brooding atmosphere with dramatic shadows
- Rich, deep colors with emphasis on blacks, deep purples, and dark reds
- Victorian-era architectural elements in the background
- Gothic fashion elements like lace, velvet, and ornate details
- Dramatic lighting with candlelight or moonlight effects
- Incorporate Gothic motifs like gargoyles, ravens, or thorny roses
- Add a sense of elegant melancholy
- Maintain the subject's core features but enhance with Gothic aesthetics
- Include period-appropriate details and textures
- Create a haunting, romantic atmosphere

The final image should evoke the essence of Victorian Gothic art while maintaining the subject's identity.`;

export const HUMAN_TO_ANIMAL_PROMPT_GOTHIC = (
  targetAnimalType: string,
  gender: string,
) =>
  `Transform this ${gender} human into a Gothic ${targetAnimalType} with Victorian-era aesthetics.

Requirements:
- Create a dark, brooding ${targetAnimalType} with Gothic features
- Incorporate Victorian-era fashion elements and details
- Use dramatic lighting with candlelight or moonlight effects
- Add Gothic motifs like thorny roses or ravens in the background
- Maintain the emotional expression exactly as in the original
- Include period-appropriate accessories or decorative elements
- Create a haunting, romantic atmosphere
- Use rich, deep colors with emphasis on blacks and dark tones
- Keep the pose elegant and dramatic
- Add Gothic architectural elements in the background

The final image should be a Gothic ${targetAnimalType} that captures both the Victorian era's darkness and the original subject's essence.`;

export const ANIMAL_TO_HUMAN_PROMPT_GOTHIC = (
  sourceAnimalType: string,
  gender: string,
) =>
  `Transform this ${sourceAnimalType} into a Gothic Victorian ${gender} human.

Requirements:
- Create a dark, brooding human figure with Gothic features
- Include Victorian-era fashion (lace, velvet, ornate details)
- Use dramatic lighting with candlelight or moonlight effects
- Add Gothic motifs and architectural elements
- Maintain the original ${sourceAnimalType}'s expression and personality
- Include period-appropriate accessories and hairstyles
- Create a haunting, romantic atmosphere
- Use rich, deep colors with emphasis on blacks and dark tones
- Keep the pose elegant and dramatic
- Add Gothic background elements

The final image should be a Gothic Victorian human that captures the ${sourceAnimalType}'s essence in a darkly romantic way.`;

export const ORIGINAL_IMAGE_PROMPT_DECO = `Transform this image into an Art Deco masterpiece.

Requirements:
- Bold geometric patterns and shapes
- Luxurious, metallic color palette (gold, silver, bronze)
- Clean lines and symmetrical composition
- Incorporate classic Art Deco motifs (sunbursts, zigzags, chevrons)
- Elegant, streamlined design elements
- Rich textures inspired by 1920s and 1930s aesthetics
- Maintain the subject's core features but enhance with Deco style
- Add decorative borders or frames in Deco style
- Use bold, contrasting colors
- Create a sense of luxury and sophistication

The final image should embody the glamour and sophistication of the Art Deco period.`;

export const HUMAN_TO_ANIMAL_PROMPT_DECO = (
  targetAnimalType: string,
  gender: string,
) =>
  `Transform this ${gender} human into an Art Deco styled ${targetAnimalType}.

Requirements:
- Create a stylized ${targetAnimalType} with Art Deco aesthetics
- Incorporate geometric patterns and clean lines
- Use metallic colors (gold, silver, bronze)
- Add classic Art Deco motifs and designs
- Maintain the emotional expression exactly as in the original
- Include decorative elements from the 1920s/30s era
- Create a luxurious, sophisticated atmosphere
- Use bold, contrasting colors
- Keep the pose elegant and refined
- Add Art Deco architectural elements or frames

The final image should be an elegant ${targetAnimalType} that embodies Art Deco style while maintaining the original subject's character.`;

export const ANIMAL_TO_HUMAN_PROMPT_DECO = (
  sourceAnimalType: string,
  gender: string,
) =>
  `Transform this ${sourceAnimalType} into an Art Deco styled ${gender} human.

Requirements:
- Create a stylized human figure with Art Deco aesthetics
- Include geometric patterns and clean lines
- Use metallic colors and bold contrasts
- Add classic Art Deco motifs and designs
- Maintain the original ${sourceAnimalType}'s expression and personality
- Include 1920s/30s fashion and hairstyles
- Create a luxurious, sophisticated atmosphere
- Use the characteristic Art Deco color palette
- Keep the pose elegant and refined
- Add Art Deco architectural elements or frames

The final image should be a sophisticated Art Deco human that captures the ${sourceAnimalType}'s essence in a glamorous way.`;

export const ORIGINAL_IMAGE_PROMPT_LEGO = `Transform this image into a LEGO-style creation.

Requirements:
- Convert all elements into LEGO brick and piece aesthetics
- Maintain the characteristic LEGO minifigure style
- Use bright, plastic-like colors with slight reflection
- Add subtle studs and brick patterns
- Create a playful, toy-like atmosphere
- Include recognizable LEGO piece shapes and connections
- Maintain core features but adapt to LEGO limitations
- Add characteristic LEGO texture and shine
- Keep the composition clear and well-structured
- Create a sense of buildable reality

The final image should look like an authentic LEGO creation while maintaining recognizable features of the subject.`;

export const HUMAN_TO_ANIMAL_PROMPT_LEGO = (
  targetAnimalType: string,
  gender: string,
) =>
  `Transform this ${gender} human into a LEGO ${targetAnimalType}.

Requirements:
- Create a ${targetAnimalType} using LEGO brick aesthetics
- Use the characteristic LEGO color palette
- Add visible studs and brick patterns
- Maintain the emotional expression as much as possible within LEGO limitations
- Include recognizable LEGO piece shapes
- Create a playful, toy-like atmosphere
- Use plastic-like textures with slight reflection
- Keep the design buildable and realistic to LEGO
- Add characteristic LEGO joints and connections
- Include LEGO-style background elements

The final image should be a convincing LEGO ${targetAnimalType} that captures the essence of both LEGO and the original subject.`;

export const ANIMAL_TO_HUMAN_PROMPT_LEGO = (
  sourceAnimalType: string,
  gender: string,
) =>
  `Transform this ${sourceAnimalType} into a LEGO minifigure ${gender} human.

Requirements:
- Create a LEGO minifigure with characteristic proportions
- Use the classic LEGO color palette
- Add visible studs and brick patterns
- Maintain the original ${sourceAnimalType}'s expression within LEGO limitations
- Include standard LEGO minifigure features
- Create a playful, toy-like atmosphere
- Use plastic-like textures with slight reflection
- Keep the design true to LEGO minifigure capabilities
- Add characteristic LEGO accessories
- Include LEGO-style background elements

The final image should be an authentic LEGO minifigure that captures the ${sourceAnimalType}'s personality in LEGO form.`;

export const ORIGINAL_IMAGE_PROMPT_KOGAL = `Transform this image into a vibrant Kogal fashion style portrait.

Requirements:
- Contemporary Japanese high school fashion aesthetics
- Loose socks, platform shoes, and trendy accessories
- Bleached or dyed hair (typically blonde or brown)
- Playful and energetic pose
- Bright, colorful makeup with emphasis on eye makeup
- Modern street fashion elements
- Maintain core facial features while adding Kogal style
- Include fashionable accessories like phone decorations or bags
- Create a lively, youthful atmosphere
- Add contemporary urban background elements

The final image should embody the energetic, fashion-forward Kogal style while maintaining the subject's identity.`;

export const HUMAN_TO_ANIMAL_PROMPT_KOGAL = (
  targetAnimalType: string,
  gender: string,
) =>
  `Transform this ${gender} human into a Kogal-styled ${targetAnimalType}.

Requirements:
- Create a ${targetAnimalType} with modern Japanese fashion elements
- Add Kogal-inspired accessories and styling
- Include trendy decorations and embellishments
- Maintain the emotional expression exactly as in the original
- Use bright, vibrant colors
- Keep the pose energetic and playful
- Add fashionable accessories appropriate for a ${targetAnimalType}
- Create a contemporary urban atmosphere
- Use modern, street-style lighting
- Include playful background elements

The final image should be a fashion-forward ${targetAnimalType} that captures both Kogal style and the original subject's personality.`;

export const ANIMAL_TO_HUMAN_PROMPT_KOGAL = (
  sourceAnimalType: string,
  gender: string,
) =>
  `Transform this ${sourceAnimalType} into a Kogal-styled ${gender} human.

Requirements:
- Create a modern Japanese high school fashion look
- Include signature Kogal elements (loose socks, platform shoes)
- Add trendy accessories and phone decorations
- Maintain the original ${sourceAnimalType}'s expression and personality
- Use contemporary makeup styles
- Keep the pose energetic and confident
- Add fashionable bags or accessories
- Create a lively urban atmosphere
- Use bright, modern lighting
- Include street fashion elements

The final image should be a Kogal-styled human that captures the ${sourceAnimalType}'s personality in a contemporary fashion context.`;

export const ORIGINAL_IMAGE_PROMPT_LOLITA = `Transform this image into an elegant Lolita fashion style portrait.

Requirements:
- Classic Lolita fashion aesthetics with Victorian influences
- Elaborate dresses with petticoats and frills
- Delicate lace, ribbons, and bows
- Elegant hairstyles with decorative accessories
- Soft, doll-like makeup
- Maintain core facial features while adding Lolita style
- Include classic accessories like parasols or tea party elements
- Create a romantic, fairy-tale atmosphere
- Use pastel or rich jewel-toned colors
- Add decorative background elements

The final image should embody the elegant, doll-like Lolita fashion style while maintaining the subject's identity.`;

export const HUMAN_TO_ANIMAL_PROMPT_LOLITA = (
  targetAnimalType: string,
  gender: string,
) =>
  `Transform this ${gender} human into a Lolita-styled ${targetAnimalType}.

Requirements:
- Create a ${targetAnimalType} with elegant Lolita fashion elements
- Add Victorian-inspired accessories and styling
- Include lace, ribbons, and decorative elements
- Maintain the emotional expression exactly as in the original
- Use soft, romantic colors
- Keep the pose elegant and graceful
- Add classic Lolita accessories adapted for a ${targetAnimalType}
- Create a fairy-tale atmosphere
- Use soft, dreamy lighting
- Include romantic background elements

The final image should be an elegant ${targetAnimalType} that captures both Lolita fashion and the original subject's essence.`;

export const ANIMAL_TO_HUMAN_PROMPT_LOLITA = (
  sourceAnimalType: string,
  gender: string,
) =>
  `Transform this ${sourceAnimalType} into a Lolita-styled ${gender} human.

Requirements:
- Create an elegant Lolita fashion ensemble
- Include signature elements (petticoats, frills, lace)
- Add decorative accessories and hair ornaments
- Maintain the original ${sourceAnimalType}'s expression and personality
- Use doll-like makeup styling
- Keep the pose graceful and refined
- Add classic Lolita accessories
- Create a romantic atmosphere
- Use soft, flattering lighting
- Include Victorian-inspired elements

The final image should be a Lolita-styled human that captures the ${sourceAnimalType}'s personality in an elegant, doll-like fashion context.`;
