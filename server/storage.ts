import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type UserStats,
  type WorkoutPlan,
  type Workout,
  type WorkoutExercise,
  type ExerciseLog,
  type CheckIn,
  type PersonalRecord,
  type UserBadge,
  type Mission,
  users,
  userStats,
  workoutPlans,
  workouts,
  workoutExercises,
  exerciseLogs,
  checkIns,
  personalRecords,
  userBadges,
  missions,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createUserStats(userId: string): Promise<UserStats>;
  updateUserStats(userId: string, data: Partial<UserStats>): Promise<UserStats | undefined>;
  
  // Workout plan operations
  createWorkoutPlan(plan: { userId: string; name: string; description?: string; weekCount?: number }): Promise<WorkoutPlan>;
  getActiveWorkoutPlan(userId: string): Promise<WorkoutPlan | undefined>;
  getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  
  // Workout operations
  createWorkout(workout: { planId: string; weekNumber: number; dayNumber: number; focus: string; duration: number; scheduledDate?: string }): Promise<Workout>;
  getWorkout(id: string): Promise<Workout | undefined>;
  getWorkoutsByPlan(planId: string): Promise<Workout[]>;
  getTodayWorkout(userId: string): Promise<Workout | undefined>;
  completeWorkout(workoutId: string): Promise<Workout | undefined>;
  
  // Workout exercise operations
  createWorkoutExercise(exercise: { workoutId: string; exerciseName: string; sets: number; reps: string; rest: number; notes?: string; orderIndex: number }): Promise<WorkoutExercise>;
  getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]>;
  
  // Exercise log operations
  logExerciseSet(log: { workoutExerciseId: string; setNumber: number; load?: number; reps?: number; rpe?: number; completed: boolean }): Promise<ExerciseLog>;
  getExerciseLogs(workoutExerciseId: string): Promise<ExerciseLog[]>;
  
  // Check-in operations
  createCheckIn(checkIn: { userId: string; date: string; mood: number; sleep: number; pain: number; fatigue: number }): Promise<CheckIn>;
  getTodayCheckIn(userId: string): Promise<CheckIn | undefined>;
  getUserCheckIns(userId: string, limit?: number): Promise<CheckIn[]>;
  
  // Personal record operations
  createPersonalRecord(pr: { userId: string; exerciseName: string; load: number; reps?: number }): Promise<PersonalRecord>;
  getPersonalRecords(userId: string): Promise<PersonalRecord[]>;
  getExercisePRHistory(userId: string, exerciseName: string): Promise<PersonalRecord[]>;
  
  // Badge operations
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  
  // Mission operations
  createMission(mission: { userId: string; type: string; title: string; description: string; target: number; date: string; xpReward: number }): Promise<Mission>;
  updateMissionProgress(missionId: string, progress: number): Promise<Mission | undefined>;
  completeMission(missionId: string): Promise<Mission | undefined>;
  getTodayMissions(userId: string): Promise<Mission[]>;
  getUserMissions(userId: string): Promise<Mission[]>;
  
  // League operations
  getLeagueMembers(tier: string, limit?: number): Promise<Array<{ userId: string; username: string; name: string; weeklyXP: number; rank: number }>>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async createUserStats(userId: string): Promise<UserStats> {
    const [stats] = await db.insert(userStats).values({ userId }).returning();
    return stats;
  }

  async updateUserStats(userId: string, data: Partial<UserStats>): Promise<UserStats | undefined> {
    const [stats] = await db.update(userStats).set({ ...data, updatedAt: new Date() }).where(eq(userStats.userId, userId)).returning();
    return stats;
  }

  // Workout plan operations
  async createWorkoutPlan(plan: { userId: string; name: string; description?: string; weekCount?: number }): Promise<WorkoutPlan> {
    await db.update(workoutPlans).set({ active: false }).where(eq(workoutPlans.userId, plan.userId));
    const [workoutPlan] = await db.insert(workoutPlans).values(plan).returning();
    return workoutPlan;
  }

  async getActiveWorkoutPlan(userId: string): Promise<WorkoutPlan | undefined> {
    const [plan] = await db.select().from(workoutPlans).where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.active, true)));
    return plan;
  }

  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return db.select().from(workoutPlans).where(eq(workoutPlans.userId, userId)).orderBy(desc(workoutPlans.createdAt));
  }

  // Workout operations
  async createWorkout(workout: { planId: string; weekNumber: number; dayNumber: number; focus: string; duration: number; scheduledDate?: string }): Promise<Workout> {
    const [w] = await db.insert(workouts).values(workout).returning();
    return w;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async getWorkoutsByPlan(planId: string): Promise<Workout[]> {
    return db.select().from(workouts).where(eq(workouts.planId, planId)).orderBy(workouts.weekNumber, workouts.dayNumber);
  }

  async getTodayWorkout(userId: string): Promise<Workout | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const plan = await this.getActiveWorkoutPlan(userId);
    if (!plan) return undefined;
    
    const [workout] = await db.select().from(workouts).where(and(eq(workouts.planId, plan.id), eq(workouts.scheduledDate, today)));
    return workout;
  }

  async completeWorkout(workoutId: string): Promise<Workout | undefined> {
    const [workout] = await db.update(workouts).set({ completed: true, completedAt: new Date() }).where(eq(workouts.id, workoutId)).returning();
    return workout;
  }

  // Workout exercise operations
  async createWorkoutExercise(exercise: { workoutId: string; exerciseName: string; sets: number; reps: string; rest: number; notes?: string; orderIndex: number }): Promise<WorkoutExercise> {
    const [ex] = await db.insert(workoutExercises).values(exercise).returning();
    return ex;
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    return db.select().from(workoutExercises).where(eq(workoutExercises.workoutId, workoutId)).orderBy(workoutExercises.orderIndex);
  }

  // Exercise log operations
  async logExerciseSet(log: { workoutExerciseId: string; setNumber: number; load?: number; reps?: number; rpe?: number; completed: boolean }): Promise<ExerciseLog> {
    const [exerciseLog] = await db.insert(exerciseLogs).values(log).returning();
    return exerciseLog;
  }

  async getExerciseLogs(workoutExerciseId: string): Promise<ExerciseLog[]> {
    return db.select().from(exerciseLogs).where(eq(exerciseLogs.workoutExerciseId, workoutExerciseId)).orderBy(exerciseLogs.setNumber);
  }

  // Check-in operations
  async createCheckIn(checkIn: { userId: string; date: string; mood: number; sleep: number; pain: number; fatigue: number }): Promise<CheckIn> {
    const [ci] = await db.insert(checkIns).values(checkIn).returning();
    return ci;
  }

  async getTodayCheckIn(userId: string): Promise<CheckIn | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [checkIn] = await db.select().from(checkIns).where(and(eq(checkIns.userId, userId), eq(checkIns.date, today)));
    return checkIn;
  }

  async getUserCheckIns(userId: string, limit: number = 30): Promise<CheckIn[]> {
    return db.select().from(checkIns).where(eq(checkIns.userId, userId)).orderBy(desc(checkIns.date)).limit(limit);
  }

  // Personal record operations
  async createPersonalRecord(pr: { userId: string; exerciseName: string; load: number; reps?: number }): Promise<PersonalRecord> {
    const [record] = await db.insert(personalRecords).values(pr).returning();
    return record;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords).where(eq(personalRecords.userId, userId)).orderBy(desc(personalRecords.achievedAt));
  }

  async getExercisePRHistory(userId: string, exerciseName: string): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords)
      .where(and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseName, exerciseName)))
      .orderBy(personalRecords.achievedAt);
  }

  // Badge operations
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [badge] = await db.insert(userBadges).values({ userId, badgeId }).returning();
    return badge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }

  // Mission operations
  async createMission(mission: { userId: string; type: string; title: string; description: string; target: number; date: string; xpReward: number }): Promise<Mission> {
    const [m] = await db.insert(missions).values(mission).returning();
    return m;
  }

  async updateMissionProgress(missionId: string, progress: number): Promise<Mission | undefined> {
    const [mission] = await db.update(missions).set({ progress }).where(eq(missions.id, missionId)).returning();
    return mission;
  }

  async completeMission(missionId: string): Promise<Mission | undefined> {
    const [mission] = await db.update(missions).set({ completed: true }).where(eq(missions.id, missionId)).returning();
    return mission;
  }

  async getTodayMissions(userId: string): Promise<Mission[]> {
    const today = new Date().toISOString().split('T')[0];
    return db.select().from(missions).where(and(eq(missions.userId, userId), eq(missions.date, today)));
  }

  async getUserMissions(userId: string): Promise<Mission[]> {
    return db.select().from(missions).where(eq(missions.userId, userId)).orderBy(desc(missions.date));
  }

  // League operations
  async getLeagueMembers(tier: string, limit: number = 10): Promise<Array<{ userId: string; username: string; name: string; weeklyXP: number; rank: number }>> {
    const members = await db
      .select({
        userId: userStats.userId,
        username: users.username,
        name: users.name,
        weeklyXP: userStats.weeklyXP,
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .where(eq(userStats.leagueTier, tier))
      .orderBy(desc(userStats.weeklyXP))
      .limit(limit);

    return members.map((member: any, index: number) => ({
      ...member,
      rank: index + 1,
    }));
  }
}

export const storage = new DbStorage();
