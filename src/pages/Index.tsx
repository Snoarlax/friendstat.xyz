import { useState } from "react";
import { SpiderChart } from "@/components/SpiderChart";
import { AxisEditor } from "@/components/AxisEditor";
import { PlotEditor } from "@/components/PlotEditor";
import { Card } from "@/components/ui/card";

export interface Axis {
  id: string;
  name: string;
  max: number;
}

export interface Plot {
  id: string;
  name: string;
  color: string;
  values: { [axisId: string]: number };
}

const Index = () => {
  const [axes, setAxes] = useState<Axis[]>([
    { id: "1", name: "Speed", max: 100 },
    { id: "2", name: "Power", max: 100 },
    { id: "3", name: "Defense", max: 100 },
    { id: "4", name: "Agility", max: 100 },
    { id: "5", name: "Intelligence", max: 100 },
  ]);

  const [plots, setPlots] = useState<Plot[]>([
    {
      id: "1",
      name: "Player A",
      color: "hsl(217, 91%, 60%)",
      values: { "1": 80, "2": 70, "3": 60, "4": 85, "5": 75 },
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Spider Chart Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and customize multi-dimensional radar charts</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart Display */}
          <Card className="p-6 lg:sticky lg:top-24 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Chart Preview</h2>
            <SpiderChart axes={axes} plots={plots} />
          </Card>

          {/* Controls */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Axes Configuration</h2>
              <AxisEditor axes={axes} setAxes={setAxes} plots={plots} setPlots={setPlots} />
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Data Plots</h2>
              <PlotEditor axes={axes} plots={plots} setPlots={setPlots} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
