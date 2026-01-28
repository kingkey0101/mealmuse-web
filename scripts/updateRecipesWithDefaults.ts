import { config } from "dotenv";
import { resolve } from "path";
import { MongoClient } from "mongodb";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI?.replace(/^'|'$/g, ""); // Remove quotes if present

if (!uri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function updateRecipes() {
  try {
    const client = new MongoClient(uri as string);
    await client.connect();
    const db = client.db();
    const recipesCollection = db.collection("recipes");

    // Add dietary preferences and cooking times based on recipe characteristics
    const recipes = await recipesCollection.find({}).toArray();

    for (const recipe of recipes) {
      const updates: any = {};

      // Add intelligent dietary preferences based on recipe content
      // Force re-tag all recipes with improved logic
      {
        const dietary = [];
        const title = (recipe.title || "").toLowerCase();
        const ingredientsText = JSON.stringify(recipe.ingredients || []).toLowerCase();
        const allText = title + " " + ingredientsText;

        // Check for animal products - expanded list
        const hasMeat = allText.match(
          /\b(chicken|beef|pork|meat|bacon|sausage|lamb|turkey|duck|ham|pancetta|prosciutto|chorizo|salami|pepperoni|steak|ribs|meatball|bulgogi|bbq|brisket)\b/
        );
        const hasFish = allText.match(
          /\b(fish|salmon|tuna|shrimp|prawn|seafood|cod|halibut|tilapia|scampi|crab|lobster|anchov)\b/
        );
        const hasDairy = allText.match(
          /\b(milk|cheese|cream|butter|yogurt|parmesan|mozzarella|cheddar|feta|ricotta|brie|gouda|swiss)\b/
        );
        const hasEggs = allText.match(/\b(egg|omelette|omelet|carbonara|frittata|quiche)\b/);
        const hasGluten = allText.match(
          /\b(wheat|flour|bread|pasta|noodle|ramen|spaghetti|linguine|penne|fettuccine|macaroni|couscous|bulgur|seitan|crouton|breading)\b/
        );

        // Vegan: no animal products at all
        if (!hasMeat && !hasFish && !hasDairy && !hasEggs) {
          dietary.push("Vegan");
          dietary.push("Vegetarian"); // Vegan is also vegetarian
        }
        // Vegetarian: no meat or fish, but may have dairy/eggs
        else if (!hasMeat && !hasFish) {
          dietary.push("Vegetarian");
        }

        // Gluten-Free: no wheat/bread/pasta
        if (!hasGluten) {
          dietary.push("Gluten-Free");
        }

        // Dairy-Free: no milk/cheese/cream
        if (!hasDairy) {
          dietary.push("Dairy-Free");
        }

        // Keto: Must have protein (meat/fish/eggs) AND no high-carb foods
        // Be conservative - only tag if clearly keto-friendly
        const hasHighCarb = allText.match(
          /\b(pasta|rice|bread|potato|noodle|sugar|honey|sweet|cake|cookie|fruit|bean|lentil)\b/
        );
        if (!hasHighCarb && (hasMeat || hasFish || hasEggs) && !hasGluten) {
          // Only add keto if it's clearly low-carb with protein
          if (allText.match(/\b(salmon|steak|chicken|beef|bacon|egg|avocado|cheese)\b/)) {
            dietary.push("Keto");
          }
        }

        // Paleo: Meat/fish/eggs + veggies, no dairy/grains/legumes/processed
        // Very conservative - only clear paleo dishes
        const hasGrains = allText.match(/\b(wheat|rice|oat|grain|pasta|bread|corn|quinoa)\b/);
        const hasLegumes = allText.match(/\b(bean|lentil|pea|chickpea|falafel|soy|tofu|peanut)\b/);
        const hasProcessed = allText.match(/\b(sugar|candy|soda|processed)\b/);
        if (!hasDairy && !hasGrains && !hasLegumes && !hasProcessed && (hasMeat || hasFish)) {
          // Only tag if clearly paleo-style
          if (allText.match(/\b(grilled|roasted|baked|steak|salmon|chicken|vegetables?|salad)\b/)) {
            dietary.push("Paleo");
          }
        }

        updates.dietary = dietary;
      }

      // Add cooking time if missing (reasonable estimates)
      if (!recipe.cookingTime && !recipe.readyInMinutes) {
        let estimatedTime = 30; // default

        // Estimate based on skill level
        const skill = recipe.skill?.toLowerCase();
        if (skill === "beginner") estimatedTime = 20;
        if (skill === "intermediate") estimatedTime = 35;
        if (skill === "advanced") estimatedTime = 50;

        updates.cookingTime = estimatedTime;
      }

      // Update if we have changes
      if (Object.keys(updates).length > 0) {
        await recipesCollection.updateOne({ _id: recipe._id }, { $set: updates });
        console.log(`Updated recipe: ${recipe.title}`);
      }
    }

    console.log("\n✅ All recipes updated successfully!");
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("Error updating recipes:", error);
    process.exit(1);
  }
}

updateRecipes();
