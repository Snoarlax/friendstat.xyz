import { useState, useEffect, useRef } from "react";
import { SpiderChart } from "@/components/SpiderChart";
import { AxisEditor } from "@/components/AxisEditor";
import { PlotEditor } from "@/components/PlotEditor";
import { Card } from "@/components/ui/card";
import { Menu, X } from "lucide-react";

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
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [isSmallChart, setIsSmallChart] = useState(false);
  const chartRef = useRef(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [useSharedMax, setUseSharedMax] = useState(false);
  const [sharedMaxValue, setSharedMaxValue] = useState(10);
  const [axes, setAxes] = useState<Axis[]>([
    { id: "1", name: "Speed", max: 5 },
    { id: "2", name: "Power", max: 5 },
    { id: "3", name: "Defense", max: 5 },
    { id: "4", name: "Agility", max: 5 },
    { id: "5", name: "Intelligence", max: 5 },
  ]);

  const [plots, setPlots] = useState<Plot[]>([
    {
      id: "1",
      name: "Player A",
      color: "hsl(217, 91%, 60%)",
      values: { "1": 80, "2": 70, "3": 60, "4": 85, "5": 75 },
    },
  ]);

  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(plots[0]?.id || null);

  {/* Update isSmallChart on window size change */}
  useEffect(() => {
    const viewportHeight = window.innerHeight;
    if (!chartRef.current) return;

    const observer = new ResizeObserver( () => {
      const chartHeight = chartRef.current.clientHeight;
      setIsSmallChart(menuIsOpen || chartHeight < viewportHeight * 0.4);
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Display */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex flex-row justify-between items-center">
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-foreground font-space">FriendStat.xyz</h1>
            <p className="text-sm text-muted-foreground mt-1 font-space">Create and customize radar charts</p>
          </div>
          <button 
            onClick={() => setMenuIsOpen(!menuIsOpen)} 
            className="flex w-14 h-14 bg-blue-500 hover:bg-black text-white rounded-full shadow-lg items-center justify-center transition-all active:scale-95">
            {menuIsOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 flex-1 flex flex-col">
        <div className="h-screen gap-6 flex flex-col min-h-0">
          {/* Chart Display */}
          <Card ref={chartRef} className="flex flex-1 items-center justify-center p-6 min-h-[40vh]">
            <SpiderChart 
              axes={axes} 
              plots={plots} 
              isSmallChart={isSmallChart}
              selectedPlotId={selectedPlotId}
              setSelectedPlotId={setSelectedPlotId}
              setPlots={setPlots}
              showLegend={showLegend}
              setShowLegend={setShowLegend}
              showLabels={showLabels}
              setShowLabels={setShowLabels}
              useSharedMax={useSharedMax}
              sharedMaxValue={sharedMaxValue}
            />
          </Card>

          {/* Controls */}
          {menuIsOpen && (
            <div className={`transition-all duration-300 ease-out`}>
              <Card className="p-6 flex flex-col h-screen" >
                <h2 className="text-lg font-semibold mb-4 text-foreground">Configuration</h2>
                <div className="flex-1 overflow-y-auto space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Axes Configuration</h3>
                    <AxisEditor 
                      axes={axes} 
                      setAxes={setAxes} 
                      plots={plots} 
                      setPlots={setPlots}
                      useSharedMax={useSharedMax}
                      setUseSharedMax={setUseSharedMax}
                      sharedMaxValue={sharedMaxValue}
                      setSharedMaxValue={setSharedMaxValue}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Plots Configuration</h3>
                    <PlotEditor 
                      axes={axes} 
                      plots={plots} 
                      setPlots={setPlots}
                      selectedPlotId={selectedPlotId}
                      setSelectedPlotId={setSelectedPlotId}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
