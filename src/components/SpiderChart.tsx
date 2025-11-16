import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { Axis, Plot } from "@/pages/Index";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, EyeOff, Tag, Type } from "lucide-react";
import { toast } from "sonner";

interface SpiderChartProps {
  axes: Axis[];
  plots: Plot[];
  isSmallChart?: boolean;
  selectedPlotId: string | null;
  setSelectedPlotId: (id: string | null) => void;
  setPlots: (plots: Plot[]) => void;
  showLegend: boolean;
  setShowLegend: (value: boolean) => void;
  showLabels: boolean;
  setShowLabels: (value: boolean) => void;
  useSharedMax: boolean;
  sharedMaxValue: number;
  setAxes: (axes: Axis[]) => void;
}

const defaultColors = [
  "hsl(217, 91%, 60%)",
  "hsl(189, 94%, 43%)",
  "hsl(271, 81%, 56%)",
  "hsl(31, 97%, 72%)",
  "hsl(142, 76%, 36%)",
];

export const SpiderChart = ({ axes, plots, isSmallChart, selectedPlotId, setSelectedPlotId, setPlots, showLegend, setShowLegend, showLabels, setShowLabels, useSharedMax, sharedMaxValue, setAxes }: SpiderChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [chartCenter, setChartCenter] = useState({ x: 0, y: 0 });
  const [chartRadius, setChartRadius] = useState(0);
  const [fontSize, setFontSize] = useState({ axis: 12, radius: 10 });
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingAxisId, setEditingAxisId] = useState<string | null>(null);
  const [editingAxisName, setEditingAxisName] = useState("");

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

  const removePlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlots(plots.filter((p) => p.id !== id));
    if (selectedPlotId === id) {
      setSelectedPlotId(null);
    }
    toast.success("Plot removed");
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateChartDimensions = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      setChartRadius(size * 0.35); // Approximate chart radius
      setChartCenter({ x: rect.width / 2, y: rect.height / 2 });
      
      // Scale font sizes based on chart size
      const axisFontSize = Math.max(8, Math.min(16, size / 30));
      const radiusFontSize = Math.max(7, Math.min(12, size / 40));
      setFontSize({ axis: axisFontSize, radius: radiusFontSize });
    };

    updateChartDimensions();
    window.addEventListener('resize', updateChartDimensions);
    return () => window.removeEventListener('resize', updateChartDimensions);
  }, [axes, plots, isSmallChart]);

  const handleChartInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !selectedPlotId) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - chartCenter.x;
    const y = e.clientY - rect.top - chartCenter.y;
    
    // Calculate angle and distance from center
    const angle = Math.atan2(y, x);
    const distance = Math.sqrt(x * x + y * y);
    
    // Normalize angle to 0-2π starting from top
    let normalizedAngle = angle + Math.PI / 2;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    
    // Determine which axis this corresponds to
    const anglePerAxis = (2 * Math.PI) / axes.length;
    let axisIndex = Math.round(normalizedAngle / anglePerAxis) % axes.length;
    
    const selectedAxis = axes[axisIndex];
    if (!selectedAxis) return;
    
    // Calculate value based on distance (max at chartRadius)
    const normalizedDistance = Math.min(distance / chartRadius, 1);
    const axisMax = useSharedMax ? sharedMaxValue : selectedAxis.max;
    const value = Math.round(normalizedDistance * axisMax);
    
    // Update the selected plot
    const updatedPlots = plots.map(plot => {
      if (plot.id === selectedPlotId) {
        const axisMax = useSharedMax ? sharedMaxValue : selectedAxis.max;
        return {
          ...plot,
          values: { ...plot.values, [selectedAxis.id]: Math.max(0, Math.min(value, axisMax)) }
        };
      }
      return plot;
    });
    if (distance <= chartRadius * 1.25){
      setPlots(updatedPlots);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPlotId) return;
    setIsDragging(true);
    handleChartInteraction(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleChartInteraction(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePlotNameDoubleClick = (plot: Plot) => {
    setEditingPlotId(plot.id);
    setEditingName(plot.name);
  };

  const handlePlotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handlePlotNameSave = () => {
    if (editingPlotId && editingName.trim()) {
      const updatedPlots = plots.map(plot =>
        plot.id === editingPlotId ? { ...plot, name: editingName.trim() } : plot
      );
      setPlots(updatedPlots);
    }
    setEditingPlotId(null);
    setEditingName("");
  };

  const handlePlotNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePlotNameSave();
    } else if (e.key === "Escape") {
      setEditingPlotId(null);
      setEditingName("");
    }
  };

  const handleAxisLabelDoubleClick = (axis: Axis) => {
    setEditingAxisId(axis.id);
    setEditingAxisName(axis.name);
  };

  const handleAxisLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingAxisName(e.target.value);
  };

  const handleAxisLabelSave = (axisId: string) => {
    if (editingAxisName.trim()) {
      const updatedAxes = axes.map(axis =>
        axis.id === axisId ? { ...axis, name: editingAxisName.trim() } : axis
      );
      setAxes(updatedAxes);
      setEditingAxisId(null);
      setEditingAxisName("");
    }
  };

  const handleAxisLabelKeyDown = (e: React.KeyboardEvent, axisId: string) => {
    if (e.key === 'Enter') {
      handleAxisLabelSave(axisId);
    } else if (e.key === 'Escape') {
      setEditingAxisId(null);
      setEditingAxisName("");
    }
  };

  // Transform data for recharts
  const effectiveMax = useSharedMax ? sharedMaxValue : Math.max(...axes.map(a => a.max));
  const chartData = axes.map((axis) => {
    const axisMax = useSharedMax ? sharedMaxValue : axis.max;
    const dataPoint: any = {
      axis: axis.name,
      fullMark: axisMax,
    };
    plots.forEach((plot) => {
      const plotValue = plot.values[axis.id] || 0;
      dataPoint[plot.name] = Math.max(0, Math.min(axisMax, plotValue));
    });
    
    return dataPoint;
  });

  if (axes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Add at least one axis to see the chart
      </div>
    );
  }


  const selectedPlot = plots.find(p => p.id === selectedPlotId);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : (selectedPlotId ? 'grab' : 'default') }}
    >
      {/* View Control Buttons in top right */}
      {!isSmallChart && (
        <div className="absolute top-2 right-2 z-[5] flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowLegend(!showLegend)}
            className="h-8 w-8"
            title={showLegend ? "Hide legend" : "Show legend"}
          >
            {showLegend ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowLabels(!showLabels)}
            className="h-8 w-8"
            title={showLabels ? "Hide labels" : "Show labels"}
          >
            {showLabels ? <Type className="h-4 w-4" /> : <Type className="h-4 w-4 opacity-50" />}
          </Button>
        </div>
      )}

      {/* Custom Legend in top left */}
      {!isSmallChart && showLegend && (<div className="absolute top-2 left-2 z-[5] bg-card border border-border rounded-md shadow-sm p-2">
        <div className="flex flex-col gap-1.5">
          {plots.map((plot) => (
            <div
              key={plot.id}
              className={`group flex items-center gap-2 px-2 py-1 rounded transition-colors hover:bg-muted/50 ${
                plot.id === selectedPlotId ? 'bg-muted ring-2 ring-primary/20' : ''
              }`}
            >
              <button
                onClick={() => setSelectedPlotId(plot.id)}
                className="flex items-center gap-2 flex-1"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: plot.color }}
                />
                {editingPlotId === plot.id ? (
                  <Input
                    value={editingName}
                    onChange={handlePlotNameChange}
                    onBlur={handlePlotNameSave}
                    onKeyDown={handlePlotNameKeyDown}
                    className="h-6 text-sm px-1 py-0"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span 
                    className="text-sm font-medium cursor-text"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handlePlotNameDoubleClick(plot);
                    }}
                  >
                    {plot.name}
                  </span>
                )}
              </button>
              <button
                onClick={(e) => removePlot(plot.id, e)}
                className="p-1 hover:bg-destructive/10 rounded text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            onClick={addPlot}
            variant="outline"
            size="sm"
            className="mt-1 w-full justify-start gap-2"
          >
            <Plus className="h-3 w-3" />
            Add Plot
          </Button>
        </div>
      </div>)}

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
        <PolarGrid 
          stroke="hsl(var(--border))" 
          gridType={effectiveMax < 10 ? "circle" : "polygon"}
        />
        <PolarAngleAxis 
          dataKey="axis" 
          tick={(props) => {
            if (isSmallChart || !showLabels) return null;
            
            const { x, y, payload } = props;
            const axis = axes.find(a => a.name === payload.value);
            
            if (!axis) return null;
            
            if (editingAxisId === axis.id) {
              return (
                <foreignObject x={x - 60} y={y - 12} width="120" height="24">
                  <Input
                    value={editingAxisName}
                    onChange={handleAxisLabelChange}
                    onBlur={() => handleAxisLabelSave(axis.id)}
                    onKeyDown={(e) => handleAxisLabelKeyDown(e, axis.id)}
                    autoFocus
                    className="h-6 text-xs px-2"
                  />
                </foreignObject>
              );
            }
            
            return (
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize={fontSize.axis}
                onDoubleClick={() => handleAxisLabelDoubleClick(axis)}
                style={{ cursor: 'pointer' }}
              >
                {payload.value}
              </text>
            );
          }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, effectiveMax]}
          tick={isSmallChart || !showLabels ? false : { fill: "hsl(var(--muted-foreground))", fontSize: fontSize.radius }}
          tickCount={effectiveMax < 10 ? effectiveMax + 1 : undefined}
        />
        {plots.map((plot) => (
          <Radar
            key={plot.id}
            name={plot.name}
            dataKey={plot.name}
            stroke={plot.color}
            fill={plot.color}
            fillOpacity={plot.id === selectedPlotId ? 0.5 : 0.2}
            strokeWidth={plot.id === selectedPlotId ? 3 : 2}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
    </div>
  );
};
