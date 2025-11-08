import ActivityRing from "../ActivityRing";

export default function ActivityRingExample() {
  return (
    <div className="flex gap-8 p-8 bg-background">
      <ActivityRing
        percentage={85}
        color="hsl(var(--chart-1))"
        label="Treino"
        value="34min"
      />
      <ActivityRing
        percentage={72}
        color="hsl(var(--chart-2))"
        label="Volume"
        value="18/25"
      />
      <ActivityRing
        percentage={90}
        color="hsl(var(--chart-3))"
        label="Recuperação"
        value="90%"
      />
    </div>
  );
}
