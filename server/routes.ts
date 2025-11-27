import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateWorkoutPlan, adaptWorkoutForCheckIn } from "./ai";
import { insertUserSchema, insertCheckInSchema, workoutExercises } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
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

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Registration error:", error.message || error);
      if (error.errors) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
      }
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
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

      const { password: _, ...userWithoutPassword } = user;
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

    const { password, ...userWithoutPassword } = user;
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
      
      const aiPlan = await generateWorkoutPlan({ user, recentCheckIns });

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

      if (completed && load && rpe && rpe <= 3) {
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
        const lastWorkout = stats.lastWorkoutDate;
        let newStreak = stats.streak;

        if (lastWorkout) {
          const lastDate = new Date(lastWorkout);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak = stats.streak + 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const xpGain = 50;
        await storage.updateUserStats(req.session.userId, {
          xp: stats.xp + xpGain,
          level: Math.floor((stats.xp + xpGain) / 1200) + 1,
          streak: newStreak,
          longestStreak: Math.max(newStreak, stats.longestStreak),
          lastWorkoutDate: today,
          totalWorkouts: stats.totalWorkouts + 1,
          weeklyXP: stats.weeklyXP + xpGain,
        });

        if (newStreak === 7) {
          await storage.awardBadge(req.session.userId, "streak_7");
        }
        if (stats.totalWorkouts + 1 === 30) {
          await storage.awardBadge(req.session.userId, "workouts_30");
        }
      }

      res.json({ workout, xpGain: 50 });
    } catch (error: any) {
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

  // League routes
  app.get("/api/leagues/:tier", async (req, res) => {
    const members = await storage.getLeagueMembers(req.params.tier, 10);
    res.json(members);
  });

  const httpServer = createServer(app);
  return httpServer;
}
