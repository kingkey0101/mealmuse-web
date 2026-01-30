/**
 * Groq API Client
 * Handles all AI Chef, Recipe Generator, and content generation features
 * Free tier with great model availability: https://console.groq.com
 * Groq provides extremely fast inference with no cost limitations
 */

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("⚠️  GROQ_API_KEY environment variable is not set");
}

export interface HFGenerationOptions {
  maxNewTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

/**
 * Call Groq API for text generation
 * Groq uses OpenAI-compatible chat completions API
 */
export async function generateText(
  modelId: string,
  prompt: string,
  options: HFGenerationOptions = {}
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  try {
    const url = `${GROQ_API_BASE}/chat/completions`;
    console.log("Calling Groq API with model:", modelId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: options.maxNewTokens || 512,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Groq API error: ${response.status}`;
      const errorText = await response.text();
      console.error("Groq Error Response:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch {
        // If not JSON, just append the text
        errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    console.log("Groq Response:", responseText);
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Invalid response format: ${responseText}`);
    }

    // Extract generated text from Groq response
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      return data.choices[0].message.content;
    }

    throw new Error("Unexpected response format from Groq API");
  } catch (error) {
    console.error("Groq API error:", error);
    throw error;
  }
}

/**
 * AI Chef Chatbot - Conversational recipe and cooking advice
 */
export async function aiChefChat(
  userMessage: string,
  conversationContext: string = ""
): Promise<string> {
  // Use real Groq API (free tier has generous rate limits)
  const prompt = conversationContext
    ? `${conversationContext}\n\nUser: ${userMessage}\n\nAssistant:`
    : `You are MealMuse's AI Chef, a friendly and knowledgeable cooking assistant. Help users with recipes, cooking techniques, and culinary questions. Keep responses concise and practical.\n\nUser: ${userMessage}\n\nAssistant:`;

  return generateText("llama-3.1-8b-instant", prompt, {
    maxNewTokens: 1000,
    temperature: 0.7,
  });
}

/**
 * Generate a complete recipe from ingredients or description
 */
export async function generateRecipe(
  ingredients: string,
  cuisine?: string,
  dietary?: string[]
): Promise<string> {
  const dietaryNote =
    dietary && dietary.length > 0 ? `Dietary restrictions: ${dietary.join(", ")}. ` : "";
  const cuisineNote = cuisine ? `Cuisine type: ${cuisine}. ` : "";

  const prompt = `${dietaryNote}${cuisineNote}Create a detailed recipe using these ingredients: ${ingredients}

Format the recipe with:
1. Recipe Title
2. Cooking Time
3. Servings
4. Ingredients list
5. Step-by-step instructions
6. Tips

Recipe:`;

  return generateText("llama-3.1-8b-instant", prompt, {
    maxNewTokens: 800,
    temperature: 0.7,
  });
}

/**
 * Rewrite a recipe with different cooking style or skill level
 */
export async function rewriteRecipe(
  originalRecipe: string,
  style: string,
  skillLevel: string
): Promise<string> {
  const prompt = `Take this recipe:\n\n${originalRecipe}\n\nRewrite it for:
- Cooking Style: ${style}
- Skill Level: ${skillLevel}

Keep the same ingredients but adapt the instructions and techniques appropriately.

Rewritten Recipe:`;

  return generateText("llama-3.1-8b-instant", prompt, {
    maxNewTokens: 600,
    temperature: 0.7,
  });
}

/**
 * Explain an ingredient - uses classification/feature extraction
 */
export async function explainIngredient(ingredientName: string): Promise<string> {
  const prompt = `Provide a concise explanation of "${ingredientName}" as a cooking ingredient:
- What it is
- Common uses in cooking
- Nutritional benefits
- Storage tips
- 1-2 substitutes if needed

Keep it to 3-4 sentences.

Explanation:`;

  return generateText("llama-3.1-8b-instant", prompt, {
    maxNewTokens: 150,
    temperature: 0.5,
  });
}

/**
 * Suggest ingredient substitutes
 */
export async function suggestSubstitutes(ingredient: string, reason?: string): Promise<string> {
  const reasonNote = reason ? ` (because: ${reason})` : "";
  const prompt = `I need substitutes for "${ingredient}"${reasonNote}.

List 3-5 good alternatives with:
- Ingredient name
- How to use it as a substitute
- Any ratio adjustments needed

Substitutes:`;

  return generateText("llama-3.1-8b-instant", prompt, {
    maxNewTokens: 200,
    temperature: 0.6,
  });
}
