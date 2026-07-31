import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Dashboard</h1>
          <p className="text-on-surface-variant">Welcome to your AquaPrint AI Dashboard.</p>
        </div>
        <Button className="bg-primary text-on-primary">
          Scan Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards to test the layout and components */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Water Footprint</CardTitle>
            <CardDescription>Your daily consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-display font-bold text-primary">0L</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Eco Grade</CardTitle>
            <CardDescription>Current average</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-display font-bold text-secondary">A</p>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Your last 5 scanned items</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-24">
            <p className="text-on-surface-variant text-sm">No recent scans</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
