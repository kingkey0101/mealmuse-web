import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Recipe {
  _id: string;
  title: string;
  cuisine: string | string[];
  skill: string;
  ingredients: string[];
  steps: string[];
  equipment: string[];
}

export default async function RecipeDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const response = await api<{ body: string }>(`/recipes/${id}`);
  const recipe: Recipe = JSON.parse(response.body);
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <Link href="/recipes" className="text-sm text-blue-600 hover:underline">
        ← Back to recipes
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl"> {recipe.title} </CardTitle>
          <p className="text-muted-foreground">
            {Array.isArray(recipe.cuisine)
              ? recipe.cuisine.join(", ")
              : recipe.cuisine}
            • {recipe.skill}
          </p>
        </CardHeader>
        {/* Ingredients */}
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((item, i) => (
                <li key={i}> {item} </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              {recipe.steps.map((step, i) => (
                <li key={i}> {step} </li>
              ))}
            </ol>
          </section>
          {/* Equipment */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Equipment</h2>
            <ul className="list-disc list-inside space-y-1">
              {recipe.equipment.map((tool, i) => (
                <li key={i}>{tool}</li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
