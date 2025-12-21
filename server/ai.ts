import { GoogleGenerativeAI } from "@google/generative-ai";
import type { User, CheckIn } from "@shared/schema";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface WorkoutPlanRequest {
  user: User;
  recentCheckIns?: CheckIn[];
}

interface GeneratedWorkout {
  weekNumber: number;
  dayNumber: number;
  focus: string;
  duration: number;
  exercises: Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    rest: number;
    notes?: string;
  }>;
}

export async function generateWorkoutPlan(request: WorkoutPlanRequest): Promise<{
  planName: string;
  description: string;
  workouts: GeneratedWorkout[];
}> {
  const { user, recentCheckIns } = request;

  const goalMap: Record<string, string> = {
    fat_loss: "perda de gordura e definição muscular",
    hypertrophy: "hipertrofia e ganho de massa muscular",
    strength: "força e aumento de carga",
    conditioning: "condicionamento físico e resistência",
  };

  const experienceMap: Record<string, string> = {
    beginner: "iniciante (menos de 6 meses)",
    intermediate: "intermediário (6 meses a 2 anos)",
    advanced: "avançado (mais de 2 anos)",
  };

  const locationMap: Record<string, string> = {
    home: "em casa",
    gym: "na academia",
    both: "em casa e na academia (misto)",
  };

  const checkInSummary = recentCheckIns && recentCheckIns.length > 0
    ? `\n\nCheck-ins recentes do usuário (últimos ${recentCheckIns.length} dias):
${recentCheckIns.map((ci, i) => `
Dia ${i + 1}:
- Humor: ${ci.mood}/10
- Sono: ${ci.sleep}h
- Dor: ${ci.pain}/10
- Fadiga: ${ci.fatigue}/10`).join('\n')}`
    : "";

  const prompt = `Você é um personal trainer especialista em periodização e RIR (Reps in Reserve). Crie um plano de treino de 4 semanas personalizado.

PERFIL DO ALUNO:
- Nome: ${user.name}
- Idade: ${user.age} anos, Sexo: ${user.sex === 'male' ? 'Masculino' : 'Feminino'}
- Altura: ${user.height}cm, Peso: ${user.weight}kg
- Nível: ${experienceMap[user.experience || 'beginner']}
- Objetivo: ${goalMap[user.goal || 'hypertrophy']}
- Disponibilidade: ${user.daysPerWeek} dias por semana, ${user.sessionMinutes} minutos por sessão
- Local: ${locationMap[user.location || 'gym']}
- Equipamentos: ${user.equipment && user.equipment.length > 0 ? user.equipment.join(', ') : 'Equipamento completo de academia'}
- Lesões/Limitações: ${user.injuries || 'Nenhuma'}${checkInSummary}

DIRETRIZES IMPORTANTES:
1. Progressão por RIR: Semana 1-2 (RIR 3-4), Semana 3 (RIR 2-3), Semana 4 (RIR 4-5, deload)
2. Variedade: Use diferentes exercícios mas mantenha exercícios principais para tracking de PRs
3. Volume: Ajuste conforme experiência (iniciante: 10-15 séries/grupo, intermediário: 15-20, avançado: 20-25)
4. Descanso apropriado: Compostos 90-120s, isolados 60-75s
5. Notas técnicas: Sempre inclua dicas de execução nos exercícios principais
6. Considere lesões: Evite exercícios que possam agravar áreas mencionadas
7. Se há check-ins recentes mostrando fadiga alta ou sono ruim, ajuste o volume para baixo

Gere estritamente um JSON válido com a seguinte estrutura (sem markdown, sem texto extra):
{
  "planName": "Nome do Plano (ex: Hipertrofia Full Body 4x)",
  "description": "Breve descrição do plano",
  "workouts": [
    {
      "weekNumber": 1,
      "dayNumber": 1,
      "focus": "Descrição do foco (ex: Peito e Tríceps)",
      "duration": 45,
      "exercises": [
        {
          "exerciseName": "Nome do exercício",
          "sets": 4,
          "reps": "8-10",
          "rest": 90,
          "notes": "Dicas de execução"
        }
      ]
    }
  ]
}

Crie TODOS os treinos das 4 semanas (${user.daysPerWeek} dias × 4 semanas = ${(user.daysPerWeek || 3) * 4} treinos no total).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown code blocks if Gemini adds them
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate workout plan");
  }
}

export async function adaptWorkoutForCheckIn(
  workout: { focus: string; exercises: Array<{ exerciseName: string; sets: number; reps: string; rest: number; notes?: string }> },
  checkIn: CheckIn,
  user: User
): Promise<{ adjustmentMessage: string; modifiedExercises?: Array<{ exerciseName: string; sets: number; reps: string; rest: number; notes?: string }> }> {
  const needsAdjustment = checkIn.sleep < 6 || checkIn.pain > 6 || checkIn.fatigue > 7 || checkIn.mood < 4;

  if (!needsAdjustment) {
    return {
      adjustmentMessage: "Você está bem! Treino mantido conforme planejado. Vamos com tudo! 💪",
    };
  }

  const prompt = `Você é um personal trainer adaptando um treino baseado no check-in diário do aluno.

TREINO ORIGINAL:
- Foco: ${workout.focus}
- Exercícios: ${workout.exercises.map(e => `${e.exerciseName} ${e.sets}x${e.reps}`).join(', ')}

CHECK-IN DE HOJE:
- Humor: ${checkIn.mood}/10 ${checkIn.mood < 4 ? '(baixo)' : ''}
- Sono: ${checkIn.sleep}h ${checkIn.sleep < 6 ? '(insuficiente)' : ''}
- Dor: ${checkIn.pain}/10 ${checkIn.pain > 6 ? '(alta)' : ''}
- Fadiga: ${checkIn.fatigue}/10 ${checkIn.fatigue > 7 ? '(alta)' : ''}

PERFIL:
- Lesões conhecidas: ${user.injuries || 'Nenhuma'}

Analise o check-in e:
1. Se dor alta (>6): Reduza carga estimada em 20%, foque em amplitude e técnica
2. Se fadiga alta (>7) ou sono ruim (<6h): Reduza volume (1 série a menos em tudo) ou sugira versão express
3. Se humor baixo (<4): Mantenha treino mas seja encorajador

Retorne JSON válido (sem markdown):
{
  "adjustmentMessage": "Mensagem amigável explicando os ajustes",
  "modifiedExercises": [mesma estrutura dos exercícios, com ajustes se necessário] ou null se manter original
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      adjustmentMessage: "Treino mantido. Ouça seu corpo e ajuste a intensidade conforme necessário.",
    };
  }
}
