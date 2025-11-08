import { useState } from "react";
import CheckinSlider from "../CheckinSlider";

export default function CheckinSliderExample() {
  const [mood, setMood] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [pain, setPain] = useState(2);

  return (
    <div className="space-y-6 p-8 bg-background max-w-md">
      <CheckinSlider
        label="Como você está se sentindo?"
        value={mood}
        onChange={setMood}
        emoji={["😫", "😕", "😐", "🙂", "😊"]}
      />
      <CheckinSlider
        label="Horas de sono"
        value={sleep}
        onChange={setSleep}
        min={0}
        max={12}
      />
      <CheckinSlider
        label="Nível de dor"
        value={pain}
        onChange={setPain}
        emoji={["😌", "😌", "😐", "😣", "😖"]}
      />
    </div>
  );
}
