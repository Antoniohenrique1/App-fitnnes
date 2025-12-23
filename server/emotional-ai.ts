import { db } from "./db.js";
import { eq } from "drizzle-orm";
import { userStats, users } from "../shared/schema.js";

type PersonaType = "sergeant" | "mentor" | "scientist" | "zen";

const FEEDBACK_TEMPLATES: Record<PersonaType, any> = {
    sergeant: {
        streak_high: [
            "Sua sequência está épica, soldado! Não ouse quebrar esse ritmo.",
            "Disciplina é o que te separa da mediocridade. Mantenha o foco!",
            "A dor é temporária, o orgulho é para sempre. Mais um dia vencido.",
        ],
        streak_low: [
            "Onde você estava? O campo de batalha não espera por ninguém. Volte agora!",
            "Desculpas não queimam calorias. Vamos trabalhar imediatamente.",
        ],
        level_up: [
            "Promoção merecida! Você agora é mais do que era ontem. Continue subindo.",
        ],
        general: [
            "Mexa-se! Seu potencial está sendo desperdiçado no sofá.",
            "Quem quer arruma um jeito, quem não quer arruma uma desculpa.",
        ]
    },
    mentor: {
        streak_high: [
            "Sua consistência é inspiradora. Estou orgulhoso da sua jornada.",
            "Um dia de cada vez, e olha onde você chegou. Continue assim, lenda.",
        ],
        streak_low: [
            "Todos temos dias difíceis. O importante é o que fazemos hoje. Vamos recomeçar?",
            "Senti sua falta. O equilíbrio é a chave, vamos voltar ao ritmo com calma.",
        ],
        level_up: [
            "Uma nova fase se inicia. Sua evolução é reflexo da sua dedicação constante.",
        ],
        general: [
            "Pequenos hábitos geram grandes transformações. Qual o foco de hoje?",
            "Ouça seu corpo, mas desafie sua mente.",
        ]
    },
    scientist: {
        streak_high: [
            "Métricas em alta. Sua zona de performance está ideal. Prossiga com o protocolo.",
            "Consistência de 95% detectada. A bio-otimização está em progresso acelerado.",
        ],
        streak_low: [
            "Desvio detectado na rotina basal. Recomendado reinício imediato para evitar atrofia.",
            "Dados insuficientes nos últimos dias. Necessário input de treino para recalibragem.",
        ],
        level_up: [
            "Eficiência aumentada. Novos parâmetros desbloqueados. Sua capacidade física evoluiu 8%.",
        ],
        general: [
            "Analises preliminares sugerem que você está pronto para novos desafios.",
            "Base de dados atualizada. Seu perfil morfológico está mudando conforme o plano.",
        ]
    },
    zen: {
        streak_high: [
            "Sua energia está fluindo em harmonia. O corpo e a mente estão em sintonia.",
            "Respire. Sinta cada movimento. Sua presença é sua maior força.",
        ],
        streak_low: [
            "A vida tem seus fluxos. Volte ao centro quando estiver pronto. O tapete te espera.",
            "Não se cobre. Apenas retorne ao estado de movimento e consciência.",
        ],
        level_up: [
            "Um novo nível de consciência corporal alcançado. Continue vibrando alto.",
        ],
        general: [
            "O movimento é uma oração para o corpo. Pratique com gratidão.",
            "Encontre o silêncio no esforço.",
        ]
    }
};

export async function getEmotionalFeedback(userId: string) {
    const [stats] = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);

    if (!stats) return null;

    // For now, default to 'mentor' if not set in user profile (need to add persona field to users)
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    const persona = (user as any)?.persona || "mentor";
    const templates = FEEDBACK_TEMPLATES[persona as PersonaType] || FEEDBACK_TEMPLATES.mentor;

    let category = "general";
    if (stats.streak >= 7) category = "streak_high";
    else if (stats.streak < 1) category = "streak_low";

    const options = templates[category] || templates.general;
    const message = options[Math.floor(Math.random() * options.length)];

    return {
        persona,
        personaName: (persona as string).toUpperCase(),
        message,
        category
    };
}
