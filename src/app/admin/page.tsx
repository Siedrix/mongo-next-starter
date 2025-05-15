import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">URL Management</h3>
          <p className="text-muted-foreground mb-4">View and manage URLs in the system</p>
          <Button asChild>
            <Link href="/admin/urls">Manage URLs</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}