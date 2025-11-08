import PRSparkline from "../PRSparkline";

export default function PRSparklineExample() {
  const mockData = [
    { week: 1, value: 80 },
    { week: 2, value: 82.5 },
    { week: 3, value: 82.5 },
    { week: 4, value: 85 },
    { week: 5, value: 87.5 },
    { week: 6, value: 87.5 },
    { week: 7, value: 90 },
    { week: 8, value: 92.5 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 bg-background">
      <PRSparkline exerciseName="Supino Reto" data={mockData} unit="kg" />
      <PRSparkline
        exerciseName="Agachamento"
        data={[
          { week: 1, value: 100 },
          { week: 2, value: 105 },
          { week: 3, value: 105 },
          { week: 4, value: 110 },
          { week: 5, value: 115 },
          { week: 6, value: 115 },
          { week: 7, value: 120 },
          { week: 8, value: 125 },
        ]}
        unit="kg"
      />
    </div>
  );
}
