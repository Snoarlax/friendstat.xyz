import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { Axis, Plot } from "@/pages/Index";
import { useState, useEffect } from "react";

interface SpiderChartProps {
  axes: Axis[];
  plots: Plot[];
}

export const SpiderChart = ({ axes, plots }: SpiderChartProps) => {
  const [isSmallChart, setIsSmallChart] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      const viewportHeight = window.innerHeight;
      const chartElement = document.querySelector('.recharts-wrapper');
      if (chartElement) {
        const chartHeight = chartElement.clientHeight;
        setIsSmallChart(chartHeight < viewportHeight * 0.5);
      }
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [axes, plots]);

  // Transform data for recharts
  const chartData = axes.map((axis) => {
    const dataPoint: any = {
      axis: axis.name,
      fullMark: axis.max,
    };
    
    plots.forEach((plot) => {
      dataPoint[plot.name] = plot.values[axis.id] || 0;
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


  return (
    <ResponsiveContainer width="99%">
      <RadarChart data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="axis" 
          tick={isSmallChart ? false : { fill: "hsl(var(--foreground))", fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, "dataMax"]}
          tick={isSmallChart ? false : { fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
        />
        {plots.map((plot) => (
          <Radar
            key={plot.id}
            name={plot.name}
            dataKey={plot.name}
            stroke={plot.color}
            fill={plot.color}
            fillOpacity={0.3}
            strokeWidth={2}
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
  );
};
