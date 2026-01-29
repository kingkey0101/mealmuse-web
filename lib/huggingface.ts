/**
 * Hugging Face Inference API Client
 * Handles all AI Chef, Recipe Generator, and content generation features
 */

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const HF_API_KEY = process.env.MM_HF_API_KEY;

if (!HF_API_KEY) {
  console.error("⚠️  MM_HF_API_KEY environment variable is not set");
}

export interface HFGenerationOptions {
  maxNewTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

/**
 * Call Hugging Face Inference API for text generation
 */
export async function generateText(
  modelId: string,
  prompt: string,
  options: HFGenerationOptions = {}
): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error("Hugging Face API key not configured");
  }

  try {
    const response = await fetch(`${HF_API_BASE}/${modelId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxNewTokens || 512,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.95,
          top_k: options.topK || 50,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Hugging Face API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Extract generated text from response
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    }

    throw new Error("Unexpected response format from Hugging Face API");
  } catch (error) {
    console.error("Hugging Face API error:", error);
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
  const prompt = conversationContext
    ? `${conversationContext}\n\nUser: ${userMessage}\n\nAI Chef:`
    : `You are MealMuse's AI Chef, a friendly and knowledgeable cooking assistant. Help users with recipes, cooking techniques, and culinary questions. Keep responses concise and practical.\n\nUser: ${userMessage}\n\nAI Chef:`;

  return generateText("meta-llama/Llama-2-7b-chat-hf", prompt, {
    maxNewTokens: 300,
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

  return generateText("meta-llama/Llama-2-7b-chat-hf", prompt, {
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

  return generateText("meta-llama/Llama-2-7b-chat-hf", prompt, {
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

  return generateText("meta-llama/Llama-2-7b-chat-hf", prompt, {
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

  return generateText("meta-llama/Llama-2-7b-chat-hf", prompt, {
    maxNewTokens: 200,
    temperature: 0.6,
  });
}
