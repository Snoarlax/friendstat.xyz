import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { Axis, Plot } from "@/pages/Index";
import { useRef, useEffect, useState } from "react";

interface SpiderChartProps {
  axes: Axis[];
  plots: Plot[];
  isSmallChart?: boolean;
  selectedPlotId: string | null;
  setSelectedPlotId: (id: string | null) => void;
  setPlots: (plots: Plot[]) => void;
}

export const SpiderChart = ({ axes, plots, isSmallChart, selectedPlotId, setSelectedPlotId, setPlots }: SpiderChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [chartCenter, setChartCenter] = useState({ x: 0, y: 0 });
  const [chartRadius, setChartRadius] = useState(0);
  const [fontSize, setFontSize] = useState({ axis: 12, radius: 10 });

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
  }, [axes, plots]);

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
    const value = Math.round(normalizedDistance * selectedAxis.max);
    
    // Update the selected plot
    const updatedPlots = plots.map(plot => {
      if (plot.id === selectedPlotId) {
        return {
          ...plot,
          values: { ...plot.values, [selectedAxis.id]: Math.max(0, Math.min(value, selectedAxis.max)) }
        };
      }
      return plot;
    });
    
    setPlots(updatedPlots);
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
  // Transform data for recharts
  const chartData = axes.map((axis) => {
    const dataPoint: any = {
      axis: axis.name,
      fullMark: axis.max,
    };
    plots.forEach((plot) => {
      const plotValue = plot.values[axis.id] || 0;
      dataPoint[plot.name] = Math.max(0, Math.min(axis.max, plotValue));
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
      {selectedPlot && (
        <div className="absolute top-2 left-2 z-[5] px-3 py-1.5 rounded-md bg-card border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: selectedPlot.color }}
            />
            <span className="text-sm font-medium">Editing: {selectedPlot.name}</span>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="axis" 
          tick={isSmallChart ? false : { fill: "hsl(var(--foreground))", fontSize: fontSize.axis, dy: -8 }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, Math.max(...axes.map(a => a.max))]}
          tick={isSmallChart ? false : { fill: "hsl(var(--muted-foreground))", fontSize: fontSize.radius }}
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
            onClick={() => setSelectedPlotId(plot.id)}
            style={{ cursor: 'pointer' }}
          />
        ))}
        <Legend 
          wrapperStyle={{ 
            paddingTop: "20px",
            fontSize: "14px"
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
    </div>
  );
};
