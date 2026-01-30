"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  addedAt: Date;
}

export default function ShoppingListClient() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [adding, setAdding] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    fetchShoppingList();
  }, [session]);

  const fetchShoppingList = async () => {
    try {
      const res = await fetch("/api/shopping-list");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setAdding(true);
    try {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: {
            name: newItemName.trim(),
            quantity: parseFloat(newItemQuantity) || 1,
            unit: newItemUnit.trim(),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems([...items, data.item]);
        setNewItemName("");
        setNewItemQuantity("1");
        setNewItemUnit("");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setAdding(false);
    }
  };

  const toggleItem = async (itemId: string, checked: boolean) => {
    // Optimistic update
    setItems(items.map((item) => (item.id === itemId ? { ...item, checked } : item)));

    try {
      await fetch("/api/shopping-list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, checked }),
      });
    } catch (error) {
      console.error("Error updating item:", error);
      // Revert on error
      setItems(items.map((item) => (item.id === itemId ? { ...item, checked: !checked } : item)));
    }
  };

  const deleteItem = async (itemId: string) => {
    // Optimistic update
    setItems(items.filter((item) => item.id !== itemId));

    try {
      await fetch(`/api/shopping-list?itemId=${itemId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      fetchShoppingList(); // Refetch on error
    }
  };

  const clearCheckedItems = async () => {
    const uncheckedItems = items.filter((item) => !item.checked);
    setItems(uncheckedItems);

    try {
      await fetch("/api/shopping-list?clearChecked=true", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error clearing items:", error);
      fetchShoppingList(); // Refetch on error
    }
  };

  const selectAllItems = async () => {
    // Optimistically update all items to checked
    const updatedItems = items.map((item) => ({ ...item, checked: true }));
    setItems(updatedItems);

    try {
      // Update each unchecked item
      await Promise.all(
        items
          .filter((item) => !item.checked)
          .map((item) =>
            fetch("/api/shopping-list", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ itemId: item.id, checked: true }),
            })
          )
      );
    } catch (error) {
      console.error("Error selecting all items:", error);
      fetchShoppingList(); // Refetch on error
    }
  };

  const selectNoneItems = async () => {
    // Optimistically update all items to unchecked
    const updatedItems = items.map((item) => ({ ...item, checked: false }));
    setItems(updatedItems);

    try {
      // Update each checked item
      await Promise.all(
        items
          .filter((item) => item.checked)
          .map((item) =>
            fetch("/api/shopping-list", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ itemId: item.id, checked: false }),
            })
          )
      );
    } catch (error) {
      console.error("Error unchecking all items:", error);
      fetchShoppingList(); // Refetch on error
    }
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#2D2D2D" }}>
            Shopping List
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Keep track of ingredients you need to buy
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {items.length > 0 && (
            <>
              {uncheckedItems.length > 0 && (
                <Button
                  onClick={selectAllItems}
                  variant="outline"
                  className="border-2 text-xs sm:text-sm"
                  style={{ borderColor: "#7A8854", color: "#7A8854" }}
                >
                  ✓ Select All
                </Button>
              )}
              {checkedItems.length > 0 && (
                <>
                  <Button
                    onClick={selectNoneItems}
                    variant="outline"
                    className="border-2 text-xs sm:text-sm"
                    style={{ borderColor: "#7A8854", color: "#7A8854" }}
                  >
                    ↺ Uncheck All
                  </Button>
                  <Button
                    onClick={clearCheckedItems}
                    variant="outline"
                    className="border-2 text-xs sm:text-sm"
                    style={{ borderColor: "#A28F7A", color: "#7A8854" }}
                  >
                    🗑️ Clear ({checkedItems.length})
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Item Form */}
      <Card className="border-2" style={{ borderColor: "#A28F7A" }}>
        <CardHeader style={{ backgroundColor: "#7A8854" }}>
          <CardTitle className="text-white text-lg sm:text-xl">Add New Item</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={addItem} className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="Item name (e.g., Tomatoes)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="border-2 text-sm"
              style={{ borderColor: "#A28F7A" }}
              required
            />
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Qty"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="flex-1 min-w-16 border-2 text-sm"
                style={{ borderColor: "#A28F7A" }}
                min="0"
                step="0.1"
              />
              <Input
                type="text"
                placeholder="Unit"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="flex-1 min-w-20 border-2 text-sm"
                style={{ borderColor: "#A28F7A" }}
              />
            </div>
            <Button
              type="submit"
              disabled={adding || !newItemName.trim()}
              className="w-full shadow-md text-sm sm:text-base"
              style={{ backgroundColor: "#7A8854", color: "#FFFFFF" }}
            >
              {adding ? "Adding..." : "Add Item"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <Card className="border-2" style={{ borderColor: "#A28F7A" }}>
        <CardHeader style={{ backgroundColor: "#E5D1DA" }}>
          <CardTitle style={{ color: "#2D2D2D" }} className="text-lg sm:text-xl">
            Items to Buy ({uncheckedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                style={{ color: "#A28F7A" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p>Your shopping list is empty</p>
              <p className="text-sm mt-1">Add items above to get started</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      item.checked ? "bg-muted/30" : "hover:shadow-md"
                    }`}
                    style={{ borderColor: "#E5D1DA" }}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => toggleItem(item.id, e.target.checked)}
                      className="h-5 w-5 rounded cursor-pointer flex-shrink-0"
                      style={{ accentColor: "#7A8854" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm sm:text-base break-words ${item.checked ? "line-through opacity-60" : ""}`}
                        style={{ color: "#2D2D2D" }}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
