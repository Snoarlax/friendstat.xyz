import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Axis, Plot } from "@/pages/Index";
import { toast } from "sonner";

interface PlotEditorProps {
  axes: Axis[];
  plots: Plot[];
  setPlots: (plots: Plot[]) => void;
  selectedPlotId: string | null;
  setSelectedPlotId: (id: string | null) => void;
}

const defaultColors = [
  "hsl(217, 91%, 60%)",
  "hsl(189, 94%, 43%)",
  "hsl(271, 81%, 56%)",
  "hsl(31, 97%, 72%)",
  "hsl(142, 76%, 36%)",
];

export const PlotEditor = ({ axes, plots, setPlots, selectedPlotId, setSelectedPlotId }: PlotEditorProps) => {
  const addPlot = () => {
    const newId = Date.now().toString();
    const values: { [axisId: string]: number } = {};
    axes.forEach((axis) => {
      values[axis.id] = 0;
    });

    const newPlot: Plot = {
      id: newId,
      name: `Plot ${plots.length + 1}`,
      color: defaultColors[plots.length % defaultColors.length],
      values,
    };

    setPlots([...plots, newPlot]);
    setSelectedPlotId(newId);
    toast.success("Plot added");
  };

  const removePlot = (id: string) => {
    setPlots(plots.filter((p) => p.id !== id));
    toast.success("Plot removed");
  };

  const updatePlot = (id: string, field: "name" | "color", value: string) => {
    setPlots(
      plots.map((plot) =>
        plot.id === id ? { ...plot, [field]: value } : plot
      )
    );
  };

  const updatePlotValue = (plotId: string, axisId: string, value: number) => {
    setPlots(
      plots.map((plot) =>
        plot.id === plotId
          ? { ...plot, values: { ...plot.values, [axisId]: value } }
          : plot
      )
    );
  };

  return (
    <div className="space-y-6">
      {plots.map((plot) => (
        <div 
          key={plot.id} 
          className={`p-4 rounded-lg border space-y-4 cursor-pointer transition-all ${
            plot.id === selectedPlotId 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-border bg-card/50 hover:border-primary/50'
          }`}
          onClick={() => setSelectedPlotId(plot.id)}
        >
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor={`plot-name-${plot.id}`} className="text-sm">
                Plot Name
              </Label>
              <Input
                id={`plot-name-${plot.id}`}
                value={plot.name}
                onChange={(e) => updatePlot(plot.id, "name", e.target.value)}
                placeholder="Enter plot name"
                className="mt-1.5"
              />
            </div>
            <div className="w-32">
              <Label htmlFor={`plot-color-${plot.id}`} className="text-sm">
                Color
              </Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id={`plot-color-${plot.id}`}
                  type="color"
                  value={plot.color.startsWith("hsl") ? "#3b82f6" : plot.color}
                  onChange={(e) => updatePlot(plot.id, "color", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <div
                  className="w-10 h-10 rounded border border-border"
                  style={{ backgroundColor: plot.color }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePlot(plot.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Values</Label>
            <div className="grid grid-cols-2 gap-3">
              {axes.map((axis) => (
                <div key={axis.id}>
                  <Label htmlFor={`value-${plot.id}-${axis.id}`} className="text-xs text-muted-foreground">
                    {axis.name}
                  </Label>
                  <Input
                    id={`value-${plot.id}-${axis.id}`}
                    type="number"
                    min="0"
                    max={axis.max}
                    value={plot.values[axis.id] || 0}
                    onChange={(e) =>
                      updatePlotValue(plot.id, axis.id, parseInt(e.target.value) || 0)
                    }
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <Button onClick={addPlot} className="w-full" variant="default">
        <Plus className="h-4 w-4 mr-2" />
        Add Plot
      </Button>
    </div>
  );
};
