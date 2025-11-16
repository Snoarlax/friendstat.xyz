import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Axis, Plot } from "@/pages/Index";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface AxisEditorProps {
  axes: Axis[];
  setAxes: (axes: Axis[]) => void;
  plots: Plot[];
  setPlots: (plots: Plot[]) => void;
  useSharedMax: boolean;
  setUseSharedMax: (value: boolean) => void;
  sharedMaxValue: number;
  setSharedMaxValue: (value: number) => void;
}

export const AxisEditor = ({ axes, setAxes, plots, setPlots, useSharedMax, setUseSharedMax, sharedMaxValue, setSharedMaxValue }: AxisEditorProps) => {
  const addAxis = () => {
    const newId = Date.now().toString();
    const newAxis: Axis = {
      id: newId,
      name: `Axis ${axes.length + 1}`,
      max: 100,
    };
    
    setAxes([...axes, newAxis]);
    
    // Initialize values for this axis in all plots
    const updatedPlots = plots.map((plot) => ({
      ...plot,
      values: { ...plot.values, [newId]: 0 },
    }));
    setPlots(updatedPlots);
    
    toast.success("Axis added");
  };

  const removeAxis = (id: string) => {
    if (axes.length <= 1) {
      toast.error("Must have at least one axis");
      return;
    }
    
    setAxes(axes.filter((a) => a.id !== id));
    
    // Remove values for this axis from all plots
    const updatedPlots = plots.map((plot) => {
      const newValues = { ...plot.values };
      delete newValues[id];
      return { ...plot, values: newValues };
    });
    setPlots(updatedPlots);
    
    toast.success("Axis removed");
  };

  const updateAxis = (id: string, field: "name" | "max", value: string | number) => {
    setAxes(
      axes.map((axis) =>
        axis.id === id ? { ...axis, [field]: value } : axis
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-border bg-card/50 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="shared-max" className="text-sm font-medium">
            Use Shared Max Value
          </Label>
          <Switch
            id="shared-max"
            checked={useSharedMax}
            onCheckedChange={setUseSharedMax}
          />
        </div>
        {useSharedMax && (
          <div>
            <Label htmlFor="shared-max-value" className="text-sm">
              Shared Max Value
            </Label>
            <Input
              id="shared-max-value"
              type="number"
              min="1"
              value={sharedMaxValue}
              onChange={(e) => setSharedMaxValue(parseInt(e.target.value) || 1)}
              className="mt-1.5"
            />
          </div>
        )}
      </div>
      {axes.map((axis, index) => (
        <div key={axis.id} className="flex gap-3 items-end p-4 rounded-lg border border-border bg-card/50">
          <div className="flex-1">
            <Label htmlFor={`axis-name-${axis.id}`} className="text-sm">
              Axis Name
            </Label>
            <Input
              id={`axis-name-${axis.id}`}
              value={axis.name}
              onChange={(e) => updateAxis(axis.id, "name", e.target.value)}
              placeholder="Enter axis name"
              className="mt-1.5"
            />
          </div>
          {!useSharedMax && (
            <div className="w-24">
              <Label htmlFor={`axis-max-${axis.id}`} className="text-sm">
                Max Value
              </Label>
              <Input
                id={`axis-max-${axis.id}`}
                type="number"
                min="1"
                value={axis.max}
                onChange={(e) => updateAxis(axis.id, "max", parseInt(e.target.value) || 1)}
                className="mt-1.5"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeAxis(axis.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button onClick={addAxis} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Axis
      </Button>
    </div>
  );
};
