import { DashboardLayout } from "@/components/dashboard-layout";
import ShoppingListClient from "./ShoppingListClient";

export default function ShoppingListPage() {
  return (
    <DashboardLayout>
      <ShoppingListClient />
    </DashboardLayout>
  );
}
