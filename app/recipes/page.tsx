import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Recipe {
  _id: string;
  title: string;
  cuisine: string;
  skill: string;
}

export default async function RecipesPage() {
  const recipes = await api<Recipe[]>("/recipes");
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Recipes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <Link key={recipe._id} href={`/recipes/${recipe._id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{recipe.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {recipe.cuisine} • {recipe.skill}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
