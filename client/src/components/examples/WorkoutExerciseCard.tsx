import WorkoutExerciseCard from "../WorkoutExerciseCard";

export default function WorkoutExerciseCardExample() {
  return (
    <div className="p-8 bg-background space-y-4">
      <WorkoutExerciseCard
        name="Supino Reto com Barra"
        sets={4}
        reps="8-10"
        rest={90}
        notes="Manter escápulas retraídas, descer controlado"
        onSwap={() => console.log("Swap exercise")}
      />
      <WorkoutExerciseCard
        name="Agachamento Livre"
        sets={3}
        reps="10-12"
        rest={120}
      />
    </div>
  );
}
