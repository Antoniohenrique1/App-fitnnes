import StreakFlame from "../StreakFlame";

export default function StreakFlameExample() {
  return (
    <div className="flex gap-4 p-8 bg-background">
      <StreakFlame streak={12} freezeAvailable />
      <StreakFlame streak={5} />
    </div>
  );
}
