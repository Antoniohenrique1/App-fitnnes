import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface CheckinSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  emoji?: string[];
}

export default function CheckinSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  emoji = [],
}: CheckinSliderProps) {
  const emojiIndex = emoji.length > 0 ? Math.min(Math.floor((value - 1) / (max / emoji.length)), emoji.length - 1) : -1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          {emojiIndex >= 0 && (
            <span className="text-xl">{emoji[emojiIndex]}</span>
          )}
          <span className="text-2xl font-bold font-['Outfit'] tabular-nums min-w-[3ch] text-right">{value}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={1}
        className="cursor-pointer"
        data-testid={`slider-${label.toLowerCase().replace(/\s/g, "-")}`}
      />
    </div>
  );
}
