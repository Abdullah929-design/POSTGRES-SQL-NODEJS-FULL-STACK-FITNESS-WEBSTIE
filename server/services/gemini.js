const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PROMPT = `You are a nutrition estimation assistant. Analyze the food image and estimate its nutrition.
Respond with STRICT JSON only (no prose, no markdown fences). Use exactly this shape:
{
  "foodName": string,
  "confidence": string,        // one of "high" | "medium" | "low"
  "servingSizeEstimate": string,
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "notes": string              // optional short note, e.g. "estimate may vary"
}
If you cannot identify any food, set foodName to an empty string and explain in notes.`;

/**
 * Send a base64-encoded image to the Gemini vision model and return a parsed,
 * validated nutrition object.
 *
 * @param {string} base64Image - raw base64 (without the `data:` prefix)
 * @param {string} mimeType    - e.g. "image/jpeg"
 * @returns {Promise<{foodName,confidence,servingSizeEstimate,calories,protein_g,carbs_g,fat_g,notes}>}
 */
async function analyzeFoodImage(base64Image, mimeType = 'image/jpeg') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }
  if (!base64Image) {
    throw new Error('No image data provided');
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  };

  let response;
  try {
    response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      payload,
      { timeout: 30000 }
    );
  } catch (err) {
    if (err.response) {
      const detail =
        err.response.data && err.response.data.error
          ? err.response.data.error.message || JSON.stringify(err.response.data.error)
          : `status ${err.response.status}`;
      throw new Error(`Gemini API error: ${detail}`);
    }
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      throw new Error('Gemini request timed out. Please try again.');
    }
    throw new Error('Failed to reach Gemini API. Check your network connection.');
  }

  // --- Extract the text payload from Gemini's response ---
  let text;
  try {
    text = response.data.candidates[0].content.parts[0].text;
  } catch (e) {
    throw new Error('Unexpected Gemini response format');
  }

  // --- Strip markdown fences if present, then parse ---
  const parsed = parseStrictJson(text);
  if (!parsed) {
    throw new Error('Could not parse nutrition result from Gemini');
  }

  const result = {
    foodName: typeof parsed.foodName === 'string' ? parsed.foodName.trim() : '',
    confidence:
      typeof parsed.confidence === 'string' ? parsed.confidence.trim().toLowerCase() : 'low',
    servingSizeEstimate:
      typeof parsed.servingSizeEstimate === 'string' ? parsed.servingSizeEstimate.trim() : '',
    calories: toNumber(parsed.calories),
    protein_g: toNumber(parsed.protein_g),
    carbs_g: toNumber(parsed.carbs_g),
    fat_g: toNumber(parsed.fat_g),
    notes: typeof parsed.notes === 'string' ? parsed.notes.trim() : '',
  };

  if (!result.foodName) {
    throw new Error('No food identified in the image. Try a clearer photo.');
  }

  return result;
}

/**
 * Parse JSON that may be wrapped in ```json ... ``` fences.
 * Returns the parsed object or null if it cannot be parsed.
 */
function parseStrictJson(text) {
  if (typeof text !== 'string') return null;
  let cleaned = text.trim();

  // Remove a leading/trailing markdown code fence if present.
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Some models wrap the JSON in extra prose; try to extract the first {...} block.
  const braceStart = cleaned.indexOf('{');
  const braceEnd = cleaned.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd > braceStart) {
    cleaned = cleaned.slice(braceStart, braceEnd + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

module.exports = { analyzeFoodImage };
