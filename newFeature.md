Implement an "Auto Meal Nutrient Scanner" feature in this project.

CONTEXT — DO THIS FIRST:
Before writing any code, inspect the existing codebase to understand:
1. The current meal logging schema/model (fields for Meal Type, Food, Servings, calories, etc.)
2. The existing API route structure and conventions used in this project (Express routes, controllers, etc.)
3. The existing frontend structure/framework (React, plain JS, etc.) and how other forms/modals are built
4. Any existing camera/image upload handling in the app
5. How the database connection and existing meal-insert queries are currently written
Use what you find to keep this feature consistent with existing patterns — do not invent a new schema or new conventions if one already exists.

FEATURE REQUIREMENTS:

1. FRONTEND — Camera Capture
   - Add a button/entry point "Scan Meal" that prompts the user to open their device camera (use the native file input with `capture="environment"` for mobile camera access, or getUserMedia if a live camera UI is preferred — pick whichever matches this project's existing patterns).
   - After a photo is taken/selected, show a loading/analyzing state while it's sent to the backend.

2. BACKEND — Gemini API Integration
   - Create a new backend endpoint (e.g., POST /api/meals/scan) that:
     - Accepts the image (base64 or multipart)
     - Sends it to the Gemini API (use the Gemini vision-capable model) with a prompt instructing it to identify the food and estimate nutrition
     - Requests Gemini return STRICT JSON only, in this shape:
       {
         "foodName": string,
         "confidence": string,       // e.g. "high" | "medium" | "low"
         "servingSizeEstimate": string,
         "calories": number,
         "protein_g": number,
         "carbs_g": number,
         "fat_g": number,
         "notes": string             // optional short note, e.g. "estimate may vary"
       }
     - Parses and validates the JSON response server-side (strip markdown fences if present, handle malformed JSON gracefully with a clear error).
     - Store the Gemini API key in environment variables (.env), never hardcoded. Add GEMINI_API_KEY to .env.example if one exists.
     - Return the parsed nutrition JSON to the frontend.

3. FRONTEND — Display & Confirmation
   - Display the returned nutrition info clearly (food name, calories, macros, confidence/notes) in a card or modal.
   - Below it, show a confirmation prompt: "Should this meal be added to your meal tracking?" with Yes / No actions.
   - If YES:
     - Reveal a small form to collect:
       - Meal Type (dropdown matching whatever enum/options the existing schema uses, e.g. Breakfast/Lunch/Dinner/Snack)
       - Food (pre-filled from Gemini's foodName, editable)
       - Servings (numeric input, default 1, editable)
     - On submit, send this data + the nutrition info to the existing (or a new, schema-consistent) meal-logging endpoint to insert into the database, scaling calories/macros by the servings value if the schema expects per-entry totals.
     - Show a success confirmation after the insert.
   - If NO:
     - Just leave the nutrition info displayed on screen (no form, no DB write). Add a "Scan another" or "Close" action.

4. ERROR HANDLING
   - Handle: camera permission denied, image upload failure, Gemini API errors/timeouts, malformed Gemini JSON responses, and DB insert failures — each with a clear, user-facing error message (not raw stack traces).

5. CODE QUALITY
   - Match existing code style, naming conventions, and file structure in this repo.
   - Keep the Gemini prompt and JSON-parsing logic in a separate, reusable backend module/service rather than inline in the route handler.

Ask me if anything about the existing schema/routes is ambiguous before making assumptions.