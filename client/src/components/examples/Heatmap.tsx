import Heatmap from "../Heatmap";

export default function HeatmapExample() {
  const mockData = Array.from({ length: 84 }, (_, i) => ({
    date: new Date(Date.now() - (83 - i) * 86400000).toISOString().split("T")[0],
    count: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0,
  }));

  return (
    <div className="p-8 bg-background">
      <h3 className="text-lg font-semibold mb-4">Últimas 12 semanas</h3>
      <Heatmap data={mockData} />
    </div>
  );
}
