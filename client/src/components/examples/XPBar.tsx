import XPBar from "../XPBar";

export default function XPBarExample() {
  return (
    <div className="p-8 bg-background">
      <XPBar currentXP={850} totalXP={1200} level={12} />
    </div>
  );
}
