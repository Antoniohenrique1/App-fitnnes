import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { analyzeWorkout, generateWorkoutPlan, adaptWorkoutForCheckIn } from "./ai.js";
import {
  registerUserSchema,
  insertCheckInSchema,
  workoutExercises,
  insertPostSchema,
  insertPostCommentSchema,
  insertGamificationEventSchema,
  insertWorkoutSessionSchema
} from "../shared/schema.js";
import { db } from "./db.js";
import {
  addComment,
  toggleFollow,
  getLeaderboard,
  getUserProfileData,
} from "./social.js";
import { getEmotionalFeedback } from "./emotional-ai.js";
import { awardXp } from "./gamification.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import "./types.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        name: userData.name,
        passwordHash: hashedPassword,
      });

      await storage.createUserStats(user.id);

      if (req.session) {
        req.session.userId = user.id;
        await new Promise<void>((resolve, reject) => {
          req.session!.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Registration error:", error.message || error);
      if (error.errors) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
        // Return detailed validation errors for debugging
        return res.status(400).json({
          error: "Invalid request data",
          details: error.errors.map((e: any) => ({
            field: e.path?.join('.') || 'unknown',
            message: e.message
          }))
        });
      }
      res.status(400).json({ error: error.message || "Invalid request data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const trimmedUsername = username?.trim();
      const user = await storage.getUserByUsername(trimmedUsername);

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (req.session) {
        req.session.userId = user.id;
        await new Promise<void>((resolve, reject) => {
          req.session!.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // User stats routes
  app.get("/api/user/stats", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const stats = await storage.getUserStats(req.session.userId);
    res.json(stats);
  });

  // Workout plan generation
  app.post("/api/workouts/generate-plan", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const recentCheckIns = await storage.getUserCheckIns(req.session.userId, 7);

      // Add timeout to AI generation (30 seconds)
      const aiPromise = generateWorkoutPlan({ user, recentCheckIns });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI generation timeout after 30 seconds")), 30000)
      );

      const aiPlan = await Promise.race([aiPromise, timeoutPromise]);

      const plan = await storage.createWorkoutPlan({
        userId: req.session.userId,
        name: aiPlan.planName,
        description: aiPlan.description,
        weekCount: 4,
      });

      const today = new Date();
      for (const workoutData of aiPlan.workouts) {
        const daysOffset = (workoutData.weekNumber - 1) * 7 + (workoutData.dayNumber - 1);
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + daysOffset);

        const workout = await storage.createWorkout({
          planId: plan.id,
          weekNumber: workoutData.weekNumber,
          dayNumber: workoutData.dayNumber,
          focus: workoutData.focus,
          duration: workoutData.duration,
          scheduledDate: scheduledDate.toISOString().split('T')[0],
        });

        for (let i = 0; i < workoutData.exercises.length; i++) {
          const ex = workoutData.exercises[i];
          await storage.createWorkoutExercise({
            workoutId: workout.id,
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            notes: ex.notes,
            orderIndex: i,
          });
        }
      }

      res.json({ plan, message: "Plano criado com sucesso!" });
    } catch (error: any) {
      console.error("Error generating plan:", error);
      res.status(500).json({ error: error.message || "Failed to generate workout plan" });
    }
  });

  // Get today's workout
  app.get("/api/workouts/today", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const workout = await storage.getTodayWorkout(req.session.userId);
    if (!workout) {
      return res.json({ workout: null });
    }

    const exercises = await storage.getWorkoutExercises(workout.id);
    res.json({ workout, exercises });
  });

  // Get workout details
  app.get("/api/workouts/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const workout = await storage.getWorkout(req.params.id);
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    const exercises = await storage.getWorkoutExercises(workout.id);

    const exercisesWithLogs = await Promise.all(
      exercises.map(async (ex) => {
        const logs = await storage.getExerciseLogs(ex.id);
        return { ...ex, logs };
      })
    );

    res.json({ workout, exercises: exercisesWithLogs });
  });

  // Log exercise set
  app.post("/api/workouts/log-set", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { workoutExerciseId, setNumber, load, reps, rpe, completed } = req.body;
      const log = await storage.logExerciseSet({
        workoutExerciseId,
        setNumber,
        load,
        reps,
        rpe,
        completed,
      });

      if (completed) {
        await awardXp(req.session.userId, "EXERCISE_SET_COMPLETE");

        if (load && rpe && rpe <= 3) {
          const exercise = await db.select().from(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId)).limit(1);
          if (exercise[0]) {
            const currentPRs = await storage.getExercisePRHistory(req.session.userId, exercise[0].exerciseName);
            const maxPR = currentPRs.length > 0 ? Math.max(...currentPRs.map(pr => pr.load)) : 0;

            if (load > maxPR) {
              await storage.createPersonalRecord({
                userId: req.session.userId,
                exerciseName: exercise[0].exerciseName,
                load,
                reps,
              });
              await awardXp(req.session.userId, "PERSONAL_RECORD");
            }
          }
        }
      }

      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Complete workout
  app.post("/api/workouts/:id/complete", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const workout = await storage.completeWorkout(req.params.id);
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }

      const stats = await storage.getUserStats(req.session.userId);
      if (stats) {
        const today = new Date().toISOString().split('T')[0];
        const lastWorkout = (stats as any).lastWorkoutDate;
        let newStreak = stats.currentStreak;

        if (lastWorkout) {
          const lastDate = new Date(lastWorkout);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak = stats.currentStreak + 1;
            await awardXp(req.session.userId, "STREAK_INCREMENT");
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const xpResult = await awardXp(req.session.userId, "WORKOUT_COMPLETE");
        const coinsGain = 100;

        await storage.updateUserStats(req.session.userId, {
          coins: stats.coins + coinsGain,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, stats.longestStreak),
          // lastWorkoutDate: today, // Ensure this field exists in stats or profile
          totalWorkouts: stats.totalWorkouts + 1,
        });

        if (newStreak === 7) {
          await storage.awardBadge(req.session.userId, "streak_7");
        }
        if (stats.totalWorkouts + 1 === 30) {
          await storage.awardBadge(req.session.userId, "workouts_30");
        }
      }

      // Create social post for workout completion
      try {
        await createPost(req.session.userId, {
          type: "workout",
          content: `Mais um treino finalizado! Protocolo concluído com sucesso. 🔥 #Foco #Evolução`,
          workoutId: req.params.id,
          visibility: "public"
        });
      } catch (postError) {
        console.error("Error creating social post:", postError);
      }

      res.json({ workout, xpGain: 50, coinsGain: 100 });
    } catch (error: any) {
      console.error("Error completing workout:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Check-in routes
  app.post("/api/checkin", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const checkInData = insertCheckInSchema.parse({
        ...req.body,
        userId: req.session.userId,
        date: new Date().toISOString().split('T')[0],
      });

      const checkIn = await storage.createCheckIn(checkInData);
      res.json(checkIn);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/checkin/today", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const checkIn = await storage.getTodayCheckIn(req.session.userId);
    res.json(checkIn || null);
  });

  // Missions routes
  app.get("/api/missions/today", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const missions = await storage.getTodayMissions(req.session.userId);
    res.json(missions);
  });

  // Personal records routes
  app.get("/api/personal-records", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const prs = await storage.getPersonalRecords(req.session.userId);
    res.json(prs);
  });

  app.get("/api/personal-records/:exerciseName", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const history = await storage.getExercisePRHistory(req.session.userId, req.params.exerciseName);
    res.json(history);
  });

  // Badges routes
  app.get("/api/badges", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const badges = await storage.getUserBadges(req.session.userId);
    res.json(badges);
  });

  // Social Feed routes
  app.get("/api/social/feed", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const feed = await getFeed(req.session.userId, limit, offset);
    res.json(feed);
  });

  app.post("/api/social/posts", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await createPost(req.session.userId, postData as any);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/social/posts/:id/like", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const result = await toggleLike(req.session.userId, req.params.id);
    res.json(result);
  });

  app.post("/api/social/posts/:id/comment", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { content } = req.body;
      const comment = await addComment(req.session.userId, req.params.id, content);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Following routes
  app.post("/api/social/follow/:userId", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const result = await toggleFollow(req.session.userId, req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Profile and Economy
  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const profileData = await getUserProfileData(req.params.id);
      res.json(profileData);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/users/profile", async (req, res) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
      const { bio, avatarUrl } = req.body;
      const updatedUser = await storage.updateUser(req.session.userId, { bio, avatarUrl });
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/shop/items", async (_req, res) => {
    try {
      const items = await storage.getShopItems();
      res.json(items);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/shop/purchase", async (req, res) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
      const { itemId, currency } = req.body;
      const result = await storage.purchaseItem(req.session.userId, itemId, currency);
      if (!result.success) return res.status(400).json(result);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/inventory", async (req, res) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
      const inventory = await storage.getUserInventory(req.session.userId);
      res.json(inventory);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/inventory/:id/equip", async (req, res) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
      const updated = await storage.equipItem(req.session.userId, req.params.id);
      if (!updated) return res.status(404).json({ error: "Item not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Leaderboard routes
  app.get("/api/social/leaderboard", async (req, res) => {
    const type = (req.query.type as "global" | "friends") || "global";
    const period = (req.query.period as "weekly" | "all_time") || "weekly";
    const userId = req.session?.userId;
    const leaderboard = await getLeaderboard(type, period, userId);
    res.json(leaderboard);
  });

  // AI Feedback route
  app.get("/api/ai/feedback", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const feedback = await getEmotionalFeedback(req.session.userId);
    res.json(feedback);
  });

  // Seed shop items if empty
  (async () => {
    try {
      const items = await storage.getShopItems();
      if (items.length === 0) {
        const defaultItems = [
          { name: "Gelo de Ofensiva", description: "Protege sua ofensiva por 24h caso você perca um dia de treino.", priceCoins: 500, priceGems: 0, type: "streak_freeze", rarity: "rare", icon: "Snowflake" },
          { name: "Poção de XP (1.5x)", description: "Aumenta o XP ganho em 50% por 1 hora.", priceCoins: 250, priceGems: 0, type: "booster", rarity: "uncommon", icon: "Zap" },
          { name: "Título: A Lenda", description: "Um título exclusivo exibido no seu perfil.", priceCoins: 1000, priceGems: 10, type: "title", rarity: "legendary", icon: "Crown" },
          { name: "Avatar Cyberpunk", description: "Uma moldura futurista para o seu avatar.", priceCoins: 0, priceGems: 50, type: "skin", rarity: "epic", icon: "UserCircle" },
          { name: "Aura Neon", description: "Um efeito visual brilhante para o seu perfil.", priceCoins: 750, priceGems: 5, type: "skin", rarity: "rare", icon: "Sparkles" },
        ];

        for (const item of defaultItems) {
          await storage.createShopItem(item);
        }
        console.log("Shop items seeded successfully.");
      }
    } catch (seedError) {
      console.error("Error seeding shop items:", seedError);
    }
  })();

  // --- New Architecture API (Phase 1) ---

  // 1. Settings API
  app.get("/api/settings", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    const settings = await storage.getUserSettings(req.session.userId);
    // If no settings exist, return default structure (client should handle null)
    res.json(settings || {});
  });

  app.patch("/api/settings", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    try {
      // Allow partial updates
      const data = insertUserSettingsSchema.partial().parse(req.body);
      const updated = await storage.updateUserSettings(req.session.userId, data);
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: "Invalid settings data", details: e.message });
    }
  });

  // 2. Gamification Events (Event Sourcing)
  app.get("/api/gamification/events", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const events = await storage.getGamificationEvents(req.session.userId, limit);
    res.json(events);
  });

  app.post("/api/gamification/events", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    try {
      // Force userId from session
      const data = insertGamificationEventSchema.parse({ ...req.body, userId: req.session.userId });
      const created = await storage.createGamificationEvent(data);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: "Invalid event data", details: e.message });
    }
  });

  // 3. History (Workout Sessions)
  app.get("/api/history", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    const history = await storage.getUserWorkoutSessions(req.session.userId);
    res.json(history);
  });

  app.post("/api/history", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    try {
      const data = insertWorkoutSessionSchema.parse({ ...req.body, userId: req.session.userId });
      const created = await storage.createWorkoutSession(data);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: "Invalid session data", details: e.message });
    }
  });

  // 4. AI Analysis (Phase 2)
  app.post("/api/ai/analyze", async (req, res) => {
    if (!req.session?.userId) return res.sendStatus(401);
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.sendStatus(404);

      const analysis = await analyzeWorkout({
        ...req.body,
        user
      });
      res.json(analysis);
    } catch (e: any) {
      res.status(500).json({ error: "Analysis failed", details: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
