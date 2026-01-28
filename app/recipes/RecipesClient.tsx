// "use client";

// import { useEffect, useState } from "react";
// import { api } from "@/lib/api";

// export default function RecipesClient() {
//   const [recipes, setRecipes] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     api("/recipes")
//       .then((data) => setRecipes(data as any[]))
//       .catch((err) => setError(err.message));
//   }, []);

//   if (error) return <div>Error: {error}</div>;
//   if (!recipes.length) return <div>Loading...</div>;

//   return (
//     <div>
//       {recipes.map((r) => (
//         <div key={r._id}>{r.title}</div>
//       ))}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function RecipesClient() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Session:", session);

    api("/recipes")
      .then((data) => {
        console.log("Recipes response:", data);
        setRecipes(data as any[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!recipes.length)
    return <div>No recipes found. Create your first recipe!</div>;

  return (
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
  );
}
