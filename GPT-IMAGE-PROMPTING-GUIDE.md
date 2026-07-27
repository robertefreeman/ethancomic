# GPT-Image-2 Prompting Guide: Photo Restoration & General Best Practices

> **Purpose**: This document is a comprehensive prompting reference for OpenAI's `gpt-image-2` model (released April 2026, built on GPT-4o architecture). It is designed to be attached to an LLM as context for generating optimal image prompts — with a specialized focus on faithful photo restoration of historical/vintage photographs.

---

## Table of Contents

1. [Model Overview](#model-overview)
2. [API Parameters Reference](#api-parameters-reference)
3. [General Prompting Fundamentals](#general-prompting-fundamentals)
4. [Prompt Structure Formula](#prompt-structure-formula)
5. [Advanced Prompting Techniques](#advanced-prompting-techniques)
6. [Photo Restoration: Core Principles](#photo-restoration-core-principles)
7. [Restoration Prompts: Period-Authentic Style](#restoration-prompts-period-authentic-style)
8. [Restoration Prompts: Modern Enhancement](#restoration-prompts-modern-enhancement)
9. [Critical Constraints for Facial Preservation](#critical-constraints-for-facial-preservation)
10. [API Usage Examples for Restoration](#api-usage-examples-for-restoration)
11. [Common Pitfalls & Troubleshooting](#common-pitfalls--troubleshooting)
12. [Sources & References](#sources--references)

---

## Model Overview

`gpt-image-2` is OpenAI's most capable image generation and editing model as of April 2026. Key characteristics:

- **Architecture**: Built on GPT-4o multimodal foundation with Diffusion Transformer advances
- **Capabilities**: Generation, editing, inpainting, outpainting, compositing, style transfer
- **Input Fidelity**: Always high fidelity by default (the `input_fidelity` parameter is disabled because output is already high fidelity)
- **Text Rendering**: Near-perfect (~99% accuracy for English)
- **Identity Preservation**: Robust facial and identity preservation for edits and multi-step workflows
- **C2PA Metadata**: All outputs include digital watermark for content authenticity
- **Multi-Image Input**: Supports up to 16 reference images for edits

### Model Comparison

| Feature | gpt-image-2 | gpt-image-1.5 | gpt-image-1 |
|---------|-------------|----------------|-------------|
| Text Rendering | ★★★★★ | ★★★★☆ | ★★★★☆ |
| Prompt Adherence | ★★★★★ | ★★★★☆ | ★★★★☆ |
| Identity Preservation | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Editing Reliability | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| input_fidelity | Disabled (always high) | low / high | low / high |
| Flexible Resolution | Yes (any valid size) | Fixed options | Fixed options |

---

## API Parameters Reference

### Generation Endpoint: `POST /v1/images/generations`

| Parameter | Values | Notes |
|-----------|--------|-------|
| `model` | `"gpt-image-2"` | Required |
| `prompt` | string (max 32,000 chars) | The text description |
| `n` | 1–10 | Number of images to generate |
| `size` | Any valid resolution | See constraints below |
| `quality` | `"low"`, `"medium"`, `"high"` | Higher = slower, more detailed |
| `output_format` | `"png"`, `"jpeg"`, `"webp"` | PNG default |
| `background` | `"transparent"`, `"opaque"`, `"auto"` | For transparency support |
| `moderation` | `"auto"`, `"low"` | Content safety level |

### Editing Endpoint: `POST /v1/images/edits`

| Parameter | Values | Notes |
|-----------|--------|-------|
| `model` | `"gpt-image-2"` | Required |
| `image` | file(s) | Up to 16 source images |
| `mask` | file | Optional: defines editable regions |
| `prompt` | string | Edit instruction |
| `quality` | `"low"`, `"medium"`, `"high"` | Use high for restoration |
| `size` | Any valid resolution | Match input size when possible |

### Size Constraints for gpt-image-2

- Maximum edge length: < 3840px
- Both edges must be a multiple of 16
- Aspect ratio: max 3:1 (long:short)
- Total pixels: 655,360 – 8,294,400
- Above 2560×1440 (2K): experimental, results may be variable

### Popular Sizes

| Label | Resolution | Use Case |
|-------|-----------|----------|
| HD Portrait | 1024×1536 | Portraits, vertical photos |
| HD Landscape | 1536×1024 | Landscapes, group photos |
| Square | 1024×1024 | General purpose |
| 2K / QHD | 2560×1440 | High-quality widescreen |

---

## General Prompting Fundamentals

These principles apply to all gpt-image-2 prompts, based on patterns validated in production workflows:

### 1. Structure + Goal
Write prompts in a consistent order and include the intended use to set the "mode" and level of polish. For complex requests, use short labeled segments or line breaks instead of one long paragraph.

### 2. Specificity + Quality Cues
Be concrete about materials, shapes, textures, and the visual medium. Add targeted quality levers only when needed (e.g., *film grain*, *textured brushstrokes*, *macro detail*).

**For photorealism**: Include the word "photorealistic" directly in the prompt to strongly engage the model's photorealistic mode. Phrases like "real photograph," "taken on a real camera," or "professional photography" also help.

### 3. Constraints (What to Change vs. Preserve)
State exclusions and invariants explicitly:
- "no watermark"
- "preserve identity/geometry/layout"
- "change only X, keep everything else the same"

**For edits**: Repeat the preserve list on each iteration to reduce drift. If the edit should be surgical, say not to alter saturation, contrast, layout, camera angle, or surrounding objects.

### 4. Composition
Specify framing (close-up, wide, top-down), perspective/angle (eye-level, low-angle), and lighting/mood (soft diffuse, golden hour, high-contrast). Call out placement if layout matters.

### 5. Iterate Instead of Overloading
Start with a clean base prompt and refine with small, single-change follow-ups. Re-specify critical details if they start to drift between iterations.

### 6. Prompt Format Flexibility
Minimal prompts, descriptive paragraphs, JSON-like structures, instruction-style prompts, and tag-based prompts all work well. For production systems, prioritize a skimmable template over clever syntax.

---

## Prompt Structure Formula

The most effective gpt-image-2 prompts follow this logical order:

```
[Scene / Background] → [Subject] → [Key Details] → [Action/Position] → 
[Composition / Camera] → [Lighting / Mood] → [Style / Medium] → [Constraints]
```

### Formula Template

```
[Subject + Adjectives] doing [Action] in [Scene].
[Composition/Camera]. [Lighting/Atmosphere]. [Style/Medium].
[Exact constraints and exclusions].
```

### Example (Photorealistic)

```
A ceramic coffee mug filled with espresso, placed on a worn wooden café table.
Shallow depth of field. Warm morning light coming from the left. Photorealistic.
No text, no other objects in the frame.
```

### Example (Photography-Style)

```
Create a photorealistic candid photograph of an elderly sailor standing on a 
small fishing boat. He has weathered skin with visible wrinkles, pores, and 
sun texture. Shot like a 35mm film photograph, medium close-up at eye level, 
using a 50mm lens. Soft coastal daylight, shallow depth of field, subtle film 
grain, natural color balance. The image should feel honest and unposed, with 
real skin texture, worn materials, and everyday detail. No glamorization, no 
heavy retouching.
```

---

## Advanced Prompting Techniques

### Layering and Iteration
1. Start with a simple, clear base prompt
2. Evaluate results
3. Add single refinements per iteration ("make lighting warmer," "remove the extra element")
4. Use references like "same style as before" to leverage context

### Negative Constraints
Explicitly state what should NOT appear:
- "No watermark, no text, no logos"
- "Do not add any elements not present in the original"
- "No digital artifacts or over-sharpening"

### Quality Setting Strategy
| Use Case | Quality Setting | Rationale |
|----------|----------------|-----------|
| Quick iteration/previews | `low` | Fast, still good quality |
| General production | `medium` | Balanced speed/quality |
| Detailed restoration | `high` | Maximum fidelity for fine details |
| Dense text/infographics | `high` | Needed for legibility |
| Close-up portraits | `high` | Facial detail preservation |

### Multi-Image Reference
Supply reference images for:
- Style transfer ("apply Image 2's style to Image 1")
- Character/identity consistency
- Before/after editing
- Compositing ("put the element from Image 1 into the scene of Image 2")

Reference each input by index and description: "Image 1: the original photograph. Image 2: style reference."

---

## Photo Restoration: Core Principles

When using gpt-image-2 for photo restoration, the fundamental philosophy is **preservation over creation**. The model should repair damage and enhance quality while treating the original image as sacred ground.

### The Cardinal Rules of Restoration

1. **Never fabricate details that aren't evidenced in the source image**
2. **Never alter facial structure, features, or expressions**
3. **Never modify clothing, accessories, or personal items**
4. **Never change the composition, pose, or positioning of subjects**
5. **Never add elements that weren't present in the original**
6. **If detail cannot be recovered, leave it soft/undefined rather than inventing it**

### What Restoration SHOULD Do

- Remove scratches, tears, creases, and physical damage
- Correct fading, discoloration, and age-related degradation
- Reduce stains, water damage, and chemical deterioration
- Improve contrast and tonal range within the original's characteristics
- Sharpen genuinely present details that have become soft due to damage
- Fill small missing areas by inferring from immediately adjacent, clearly visible content

### What Restoration MUST NOT Do

- Sharpen or enhance features beyond what the original capture technology could produce
- Generate facial features for faces that are indistinct in the original
- "Improve" or "beautify" subjects
- Add modern photographic characteristics to period images (unless specifically requested for enhancement mode)
- Hallucinate background details, patterns, or textures not evidenced in the original
- Change skin tones, hair color, eye color, or any identifying features

---

## Restoration Prompts: Period-Authentic Style

These prompts restore images while maintaining their character as period photographs. The result should look like a well-preserved original, not a modern photograph.

### System Prompt (for LLM generating restoration prompts)

```
You are a photo restoration specialist. When generating prompts for gpt-image-2 
to restore historical photographs, you must ensure the output looks like a 
well-preserved period photograph — not a modern image. Maintain all characteristics 
of the era's photographic technology including grain structure, tonal range, 
depth of field, and color palette (or lack thereof). The goal is to reverse 
DAMAGE, not to reverse TIME.
```

### Template: Period-Authentic Restoration (General)

```
Restore this damaged photograph to its original condition as it would have 
appeared when first developed. 

REPAIR ONLY:
- Remove scratches, tears, creases, and surface damage
- Correct fading and restore original tonal range and contrast
- Remove stains, spots, and discoloration caused by age/storage
- Repair any torn or missing edge areas using adjacent visible content only

PRESERVE EXACTLY:
- All facial features, expressions, and proportions — do not alter any face
- All clothing details, patterns, textures, and accessories
- The original photographic grain and texture characteristic of the era
- The original depth of field and focus characteristics
- The original lighting direction and quality
- The original tonal palette (if black and white, keep black and white)
- All background elements and composition

DO NOT:
- Sharpen beyond what the original lens/film could have captured
- Add detail to any blurry or out-of-focus areas
- Generate or invent facial features for any indistinct faces
- Modify skin texture, remove natural wrinkles, or smooth skin
- Add color to a black and white photograph
- Modernize any aspect of the image
- Add any elements not clearly present in the original

If any face or area is too damaged or low-resolution to clearly distinguish 
features, leave it at its current level of clarity or slightly softer — 
do NOT attempt to reconstruct or invent what cannot be seen.

The result should appear as if this photograph was stored in ideal conditions 
and never sustained physical damage — a pristine period photograph, not a 
modern digital image.
```

### Template: Black & White Photo (Pre-1950s)

```
Restore this black and white photograph from [DECADE] era. Remove all physical 
damage including scratches, tears, foxing, stains, and creases. Restore the 
full tonal range from deep blacks to clean whites as it would have appeared 
when freshly printed on period-appropriate photographic paper.

CRITICAL CONSTRAINTS:
- Maintain the silver gelatin print look characteristic of [DECADE] photography
- Preserve the natural film grain structure — do not smooth or digitize it
- Keep the original depth of field (soft backgrounds should remain soft)
- All faces must remain EXACTLY as they appear — do not alter, enhance, 
  sharpen, or reconstruct any facial features
- All clothing, accessories, and personal items must remain unchanged
- Do not add contrast or sharpness beyond what [DECADE]-era cameras and 
  lenses could produce
- Any areas that are blurred or indistinct in the original must remain so
- Preserve the period-appropriate tonal curve (not modern high-contrast)

The output should look like a pristine, undamaged print from the same era 
— as if found in perfect storage conditions.
```

### Template: Color Photo (1950s-1980s)

```
Restore this color photograph from approximately [DECADE]. Correct the color 
shift and fading that has occurred over decades while maintaining period-
accurate color characteristics.

REPAIR:
- Correct the [yellow/magenta/cyan] color shift from chemical degradation
- Restore color saturation to period-appropriate levels (NOT modern vibrance)
- Remove scratches, dust, stains, and physical damage
- Restore contrast that has been lost to fading

PRESERVE:
- The slightly muted, warm color palette characteristic of [DECADE] color film
- The film grain and texture of the original emulsion
- The original depth of field and bokeh characteristics
- ALL facial features exactly as they appear — no enhancement or alteration
- ALL clothing, hair, and accessories exactly as shown
- The original exposure characteristics and lighting
- Any soft or slightly out-of-focus areas must remain so

DO NOT:
- Make colors more vibrant than [DECADE] film stock would produce
- Apply modern white balance correction
- Sharpen beyond the original lens capability
- Alter any person's appearance in any way
- Generate details in damaged areas that cannot be clearly inferred 
  from surrounding visible content

The result should look like a well-preserved [DECADE] photograph — with the 
characteristic look of [Kodachrome/Ektachrome/Fujicolor] film stock of that era.
```

### Template: Heavily Damaged Photo (Missing Areas)

```
Restore this heavily damaged photograph. Some areas have significant damage 
or missing content.

CRITICAL RULES FOR DAMAGED AREAS:
- For small damaged areas (scratches, spots): Repair by seamlessly blending 
  with immediately surrounding content
- For medium damaged areas on backgrounds/clothing: Reconstruct ONLY by 
  extending clearly visible adjacent patterns and textures
- For damaged areas on faces: DO NOT reconstruct. Leave any uncertain 
  facial areas at their current clarity or slightly softened. Never invent 
  or generate facial features
- For large missing areas: Extend only simple, clearly established patterns 
  (solid walls, sky, floor). If the missing area contained complex detail, 
  leave edges softened rather than guessing

ABSOLUTE CONSTRAINTS:
- No face shall be altered, enhanced, or reconstructed in any way
- No facial features shall be generated for faces that are unclear
- If a face is partially damaged and features cannot be determined from the 
  undamaged portion, leave the damaged area soft and undefined
- All visible clothing details, patterns, and accessories must be preserved exactly
- Maintain period-appropriate photographic characteristics throughout
- Do not modernize the image in any way

The goal is honest restoration — what CAN be recovered SHOULD be recovered; 
what CANNOT be recovered must be left gracefully undefined rather than fabricated.
```

---

## Restoration Prompts: Modern Enhancement

These prompts enhance the quality of historical photographs to appear as though captured with modern equipment — while STILL maintaining absolute fidelity to the original subjects, composition, and content.

### System Prompt (for LLM generating enhancement prompts)

```
You are a photo enhancement specialist. When generating prompts for gpt-image-2 
to enhance historical photographs, your goal is to improve technical quality 
(resolution, sharpness, noise, dynamic range) to modern standards while 
maintaining ABSOLUTE fidelity to the original subjects. Think of it as: 
"What would this exact moment have looked like if photographed with a modern 
full-frame camera?" The MOMENT is sacred. The PEOPLE are sacred. Only the 
TECHNICAL QUALITY changes.
```

### Template: Modern Enhancement (General)

```
Enhance this historical photograph to modern photographic quality standards 
while maintaining absolute fidelity to the original content.

ENHANCE (Technical Quality Only):
- Increase apparent resolution and fine detail clarity
- Improve tonal range and dynamic range to modern standards
- Reduce noise/grain to modern digital camera levels
- Enhance micro-contrast for improved perceived sharpness
- Improve color accuracy and white balance (for color photos)
- Enhance shadow and highlight detail recovery

ABSOLUTE PRESERVATION (Content Fidelity):
- Every facial feature, expression, and proportion must remain IDENTICAL
- All clothing details, patterns, wrinkles, and textures must be preserved exactly
- All accessories, jewelry, and personal items must remain unchanged
- Body proportions, posture, and positioning must not be altered
- Background elements and composition must remain exactly the same
- Hair style, texture, and color must remain unchanged
- Skin characteristics (wrinkles, marks, complexion) must be preserved

CRITICAL CONSTRAINTS:
- Do NOT alter any person's appearance in any way
- Do NOT smooth skin or remove natural features (wrinkles, moles, scars)
- Do NOT change or "improve" facial bone structure or features
- Do NOT modify body proportions or posture
- If a face or area is blurry/low-resolution in the original, enhance 
  ONLY to the extent that genuine detail can be recovered — do NOT 
  generate or hallucinate features that aren't clearly evidenced
- If facial features cannot be clearly distinguished in the original, they 
  should remain indistinct in the output. Blurry faces stay blurry. Do not 
  invent or clarify features that the original resolution cannot support
- Do NOT add bokeh, lens flare, or effects not in the original
- Maintain the exact same depth of field characteristics

The result should look like this exact scene and these exact people were 
photographed with a modern 45-megapixel full-frame camera — same moment, 
same reality, just captured with better technology.
```

### Template: Black & White to Enhanced B&W (No Colorization)

```
Enhance this black and white photograph to modern monochrome quality while 
keeping it in black and white.

ENHANCE:
- Improve resolution and fine detail (fabric textures, hair strands, etc.)
- Expand tonal range from deep rich blacks to clean bright whites
- Improve micro-contrast and perceived sharpness
- Reduce excessive grain while maintaining a natural photographic texture
- Recover detail in shadows and highlights

DO NOT:
- Add color of any kind — this must remain a black and white image
- Alter ANY facial features, expressions, or proportions
- Smooth skin or remove natural wrinkles/texture
- Change hair, clothing, or accessories in any way
- Sharpen or enhance any area that is out-of-focus in the original
- Generate detail for areas that are indistinct or blurry
- Change the composition, cropping, or framing
- Add modern photographic artifacts (lens flare, excessive bokeh)

FACE-SPECIFIC RULE:
If any face in the image is blurry, distant, partially obscured, or 
otherwise lacking clear feature definition — leave it at approximately 
the same level of clarity. Do NOT attempt to generate clear facial 
features. A blurry face must remain blurry. An indistinct face must 
remain indistinct. Only faces that are already clearly defined in the 
original may receive detail enhancement.

The result should look like a masterful modern black & white photograph 
of this exact scene — as if Ansel Adams had captured this exact moment 
with modern equipment.
```

### Template: Full Enhancement with Colorization (When Requested)

```
Enhance this black and white photograph to full modern color photographic 
quality. Apply historically accurate colorization appropriate to [DECADE/ERA].

COLORIZATION RULES:
- Apply realistic, period-accurate colors based on the era ([DECADE])
- Use natural, believable skin tones appropriate to the subjects
- Color clothing and accessories in period-appropriate colors — if specific 
  colors cannot be determined, use common colors of the era
- Background and environment colors should be realistic and era-appropriate
- Do NOT use oversaturated or modern-looking color grading

ENHANCEMENT:
- Improve resolution and detail to modern standards
- Apply modern dynamic range and tonal quality
- Reduce grain to modern digital levels

ABSOLUTE PRESERVATION:
- ALL facial features, expressions, bone structure — exactly as original
- ALL clothing details, patterns, folds, and textures — unchanged
- ALL accessories and personal items — unchanged
- Composition, framing, and posing — identical
- Body proportions and posture — identical

CRITICAL FACE RULE:
- Faces that are clear in the original may receive resolution enhancement 
  and natural colorization only
- Faces that are blurry, distant, or indistinct MUST remain at their 
  current level of clarity — do NOT generate clear features
- No face shall be "beautified," "improved," or altered in structure
- Skin texture, including wrinkles, pores, and natural marks, must be preserved

The result should look like a modern photograph of this exact moment — 
as if color digital photography existed in [DECADE].
```

---

## Critical Constraints for Facial Preservation

This section provides specific language for ensuring faces are never altered during restoration or enhancement. Use these constraint blocks in all restoration/enhancement prompts.

### The Facial Integrity Rule Set

```
FACIAL INTEGRITY CONSTRAINTS (Non-Negotiable):

1. CLEAR FACES (well-defined in original):
   - Enhance resolution and detail only
   - Preserve exact bone structure, proportions, and geometry
   - Maintain exact expression, eye direction, and mouth position
   - Keep all natural skin characteristics (wrinkles, marks, texture)
   - Do not smooth, reshape, or "improve" any feature

2. PARTIALLY CLEAR FACES (some features visible, some unclear):
   - Enhance only the clearly visible portions
   - Leave unclear portions at their current level of definition
   - Do NOT extrapolate or generate features in unclear areas
   - The boundary between clear and unclear should remain natural

3. BLURRY/INDISTINCT FACES (features not clearly distinguishable):
   - Leave ENTIRELY at current clarity level
   - Do NOT sharpen, clarify, or generate facial features
   - Do NOT attempt reconstruction from context or imagination
   - These faces should remain non-distinguished in the output
   - A slight softness is acceptable; artificial clarity is not

4. DISTANT/SMALL FACES (too small for detail):
   - Leave at current resolution — do not upscale individual faces
   - Do not generate features that the original pixel count cannot support
   - Keep them as natural background elements at their current scale

GENERAL FACE RULES:
- Never change the apparent age of any subject
- Never change skin tone or complexion
- Never add or remove glasses, hats, or facial accessories
- Never change hair color, style, or length
- Never alter ear shape, nose shape, lip shape, or eye shape
- Never adjust spacing between features
- Never "correct" perceived asymmetry — preserve natural asymmetry
```

### Quick Reference: Facial Constraint One-Liner

For shorter prompts, include at minimum:

```
Do not alter, enhance, generate, or reconstruct any facial features. 
Clear faces get resolution improvement only. Blurry or indistinct faces 
must remain blurry and indistinct — do not invent what cannot be seen.
```

---

## API Usage Examples for Restoration

### Python: Period-Authentic Restoration

```python
from openai import OpenAI
import base64

client = OpenAI()

def restore_photo_period_authentic(image_path: str, decade: str = "1940s"):
    """Restore a photo while maintaining period-authentic appearance."""
    
    prompt = f"""Restore this damaged photograph from approximately the {decade} 
to its original condition as it would have appeared when first developed.

REPAIR: Remove all scratches, tears, creases, stains, spots, foxing, and 
surface damage. Restore original tonal range and contrast lost to fading.

PRESERVE EXACTLY:
- All facial features, expressions, and proportions — no alteration whatsoever
- All clothing details, patterns, textures, and accessories
- Original photographic grain and texture characteristic of {decade} photography
- Original depth of field and focus characteristics
- Original lighting direction and quality
- Original tonal palette (keep black and white if black and white)
- All background elements and composition

DO NOT:
- Sharpen beyond what {decade}-era cameras could capture
- Add detail to blurry or out-of-focus areas
- Generate or reconstruct facial features for any indistinct faces
- Modify skin texture or remove natural features
- Modernize any aspect of the image
- Add elements not clearly present in the original

If any face is too damaged or low-resolution to clearly distinguish features, 
leave it at its current clarity — do NOT reconstruct or invent features.

Output should appear as a pristine, undamaged {decade} photograph."""

    result = client.images.edit(
        model="gpt-image-2",
        image=open(image_path, "rb"),
        prompt=prompt,
        quality="high",
        size="1024x1536",
        output_format="png",
    )
    
    return base64.b64decode(result.data[0].b64_json)
```

### Python: Modern Enhancement

```python
def enhance_photo_modern(image_path: str):
    """Enhance a historical photo to modern quality while preserving content."""
    
    prompt = """Enhance this historical photograph to modern digital photographic 
quality while maintaining ABSOLUTE fidelity to all original content.

ENHANCE: Resolution, detail clarity, tonal range, dynamic range, 
micro-contrast, shadow/highlight recovery. Reduce grain to modern levels.

ABSOLUTE PRESERVATION:
- Every facial feature, expression, and proportion — IDENTICAL to original
- All clothing, accessories, hair — exactly as shown
- Body proportions, posture, composition — unchanged
- Background elements — unchanged

CRITICAL FACE RULE:
- Clear faces: enhance resolution only, preserve all structure
- Blurry/indistinct faces: LEAVE BLURRY. Do not generate features.
  Do not clarify what cannot be seen. Blurry faces must remain blurry.
- Do not smooth skin, remove wrinkles, or alter any natural features

Do NOT add bokeh, lens flare, or modern effects. Maintain original 
depth of field. The result should look like this exact scene captured 
with a modern 45MP full-frame camera — same moment, better technology."""

    result = client.images.edit(
        model="gpt-image-2",
        image=open(image_path, "rb"),
        prompt=prompt,
        quality="high",
        size="1536x1024",
        output_format="png",
    )
    
    return base64.b64decode(result.data[0].b64_json)
```

### Python: Targeted Damage Repair with Mask

```python
def restore_with_mask(image_path: str, mask_path: str, damage_type: str = "scratches and tears"):
    """Restore only masked areas while leaving unmasked areas untouched."""
    
    prompt = f"""Repair ONLY the masked/damaged areas of this photograph. 
The damage consists of {damage_type}.

For masked areas: seamlessly repair by extending textures and patterns 
from the immediately surrounding undamaged content. Blend naturally.

For ALL unmasked areas (especially faces): DO NOT MODIFY IN ANY WAY. 
Leave completely untouched — no enhancement, no sharpening, no alteration.

CRITICAL: If the masked area overlaps any face and facial features are 
not clearly visible in undamaged adjacent areas, leave that facial region 
soft and undefined. Do NOT generate or reconstruct facial features.

Maintain all period-appropriate photographic characteristics."""

    result = client.images.edit(
        model="gpt-image-2",
        image=open(image_path, "rb"),
        mask=open(mask_path, "rb"),
        prompt=prompt,
        quality="high",
        size="1024x1536",
        output_format="png",
    )
    
    return base64.b64decode(result.data[0].b64_json)
```

---

## Common Pitfalls & Troubleshooting

### Problem: Model "Beautifies" or Modernizes Faces

**Cause**: Insufficient constraint language or vague restoration instruction.

**Solution**: Add explicit negative constraints:
```
Do NOT smooth skin. Do NOT reduce wrinkles. Do NOT alter bone structure. 
Do NOT "improve" any facial feature. Preserve exact natural appearance 
including all imperfections, asymmetry, and age-appropriate features.
```

### Problem: Blurry Faces Become Artificially Sharp

**Cause**: The model interprets "restore" as "enhance everything."

**Solution**: Add the blurry face rule explicitly:
```
BLURRY FACE RULE: Any face that is blurry, indistinct, or lacking clear 
feature definition in the original MUST remain at that same level of 
clarity in the output. Do NOT sharpen, clarify, or generate facial 
features for blurry faces. They must remain non-distinguished.
```

### Problem: Image Looks Too Modern After Restoration

**Cause**: Over-specification of "quality" without period constraints.

**Solution**: Add era-specific photographic constraints:
```
Maintain the photographic characteristics of [DECADE]: 
- [1920s-40s]: Silver gelatin tonal range, moderate contrast, no pure blacks
- [1950s-60s]: Kodachrome warm palette, slightly muted, gentle grain
- [1970s-80s]: Slightly warm cast, visible but fine grain, characteristic of 
  [Kodak/Fuji] consumer film stock
Do not apply modern digital processing characteristics.
```

### Problem: Model Adds Elements Not in Original

**Cause**: Insufficiently explicit preservation constraints.

**Solution**: Front-load the "do not add" instruction:
```
STRICT CONTENT FIDELITY: This image contains exactly what it contains. 
Do NOT add any object, person, text, element, or detail that is not 
clearly and unambiguously present in the original photograph. 
Restoration means REMOVING damage, not ADDING content.
```

### Problem: Color Photos Get Wrong Era Colors

**Cause**: Model defaults to modern color science.

**Solution**: Specify the film stock characteristics:
```
This photograph was likely shot on [Kodachrome 64 / Ektachrome / Fujicolor C200 / 
Agfacolor] film stock. Maintain the characteristic color palette of that emulsion:
- [Kodachrome]: Rich, warm, saturated reds and blues, deep shadows
- [Ektachrome]: Cooler, bluer cast, slightly less saturated
- [Fujicolor]: Green-shifted, softer contrast, pastel quality
- [Agfacolor]: Warm, slightly yellow-shifted, moderate saturation
Do NOT apply modern digital color science or white balance.
```

### Problem: Large Damaged Areas Get Hallucinated Content

**Cause**: Model tries to be "helpful" by generating plausible content.

**Solution**: 
```
For any area where damage has destroyed content that cannot be CLEARLY 
inferred from immediately adjacent visible content: leave that area as a 
soft, naturally-blended neutral tone matching the surrounding area. 
Do NOT generate, invent, or hallucinate content for areas where the 
original information is lost. When in doubt, leave it soft and undefined.
```

### Quality Setting Recommendations for Restoration

| Scenario | Quality | Rationale |
|----------|---------|-----------|
| Initial assessment / preview | `low` | Fast, see if approach works |
| Period-authentic restoration | `high` | Need fine grain/texture fidelity |
| Modern enhancement | `high` | Maximum detail recovery |
| Batch processing / iteration | `medium` | Balance speed and quality |
| Final output | `high` | Best possible result |

---

## Prompt Construction Checklist

When building a restoration prompt, ensure you include:

- [ ] **Action**: What type of restoration (repair damage / enhance / colorize)
- [ ] **Damage description**: What's wrong (scratches, fading, tears, stains)
- [ ] **Era specification**: Approximate decade of the photograph
- [ ] **Preservation list**: Explicit list of what must not change
- [ ] **Face rule**: Clear instruction on facial handling (especially for blurry faces)
- [ ] **Era characteristics**: Film stock / print type / photographic style to maintain
- [ ] **Negative constraints**: What NOT to do (modernize, add elements, smooth skin)
- [ ] **Ambiguity handling**: What to do when detail can't be recovered (leave soft)

---

## Sources & References

1. **OpenAI Official Prompting Guide** — "GPT Image Generation Models Prompting Guide" (developers.openai.com/cookbook) — Comprehensive production prompting patterns for gpt-image-2 including structure, constraints, and editing workflows.

2. **OpenAI API Documentation** — Image Generation and Image Editing endpoints (developers.openai.com/api/reference) — Parameters, size constraints, and model specifications.

3. **OpenAI Developer Forum** — "DALLE3 and gpt-image-1 Prompt Tips and Tricks Thread" (community.openai.com) — Community-validated techniques and failure mode documentation.

4. **OpenAI Developer Forum** — "Collection of GPT-4o-images prompting tips, issues and bugs" (community.openai.com) — Known issues and workarounds for image generation.

5. **OpenAI Cookbook** — "Generate Images With High Input Fidelity" (github.com/openai/openai-cookbook) — Technical guide on using input_fidelity for preservation-focused edits.

6. **Civitai Education** — "Civitai's Guide to GPT Image 1" (education.civitai.com) — Community prompting guide with style and technique comparisons.

7. **Kittl Blog** — "ChatGPT Image (GPT-Image-1) review" (kittl.com/blogs) — Production workflow analysis and quality assessment.

8. **img.ly Blog** — "OpenAI GPT-4o Image Generation (gpt-image-1) API: A Complete Guide for Creative Workflows" (img.ly/blog) — Detailed API integration patterns.

9. **Atlabs AI** — "The Ultimate GPT Image 2 Prompting Guide" (atlabs.ai/blog) — Prompt templates and scenario-specific tips for gpt-image-2.

10. **OpenAI Model Documentation** — gpt-image-2 model card (developers.openai.com/api/docs/models) — Official model capabilities and limitations.

---

## Appendix: Quick-Reference Prompt Snippets

### For Period Restoration (copy-paste ready)

```
Restore this [DECADE] photograph. Remove damage (scratches, tears, stains, fading). 
Preserve ALL facial features exactly. Maintain period film grain and tonal characteristics. 
Do NOT modernize, sharpen beyond era capability, or generate features for blurry faces. 
Blurry faces stay blurry. Output should look like a pristine period print.
```

### For Modern Enhancement (copy-paste ready)

```
Enhance to modern quality. Improve resolution, dynamic range, and detail. 
Preserve ALL faces, clothing, and composition EXACTLY. Clear faces get 
resolution boost only — no structural changes. Blurry/indistinct faces 
must remain blurry — do NOT generate features. No skin smoothing. 
No added effects. Same scene, better camera technology.
```

### Face Protection Clause (add to any prompt)

```
FACE RULE: Do not alter any facial feature. Clear faces: enhance resolution only. 
Blurry faces: leave blurry — do NOT clarify or generate features. 
No skin smoothing, no wrinkle removal, no structural changes to any face.
```

### Damage-Only Repair Clause (add to any prompt)

```
REPAIR ONLY DAMAGE: Remove scratches, tears, stains, and degradation. 
Do NOT add, modify, or enhance any content. Do NOT generate details 
for areas where original information is lost — leave them softly blended.
```
