# Fitness AI Coach BR

## Overview

Fitness AI Coach BR is a gamified fitness coaching application that generates personalized workout plans using AI, tracks daily progress through check-ins, and motivates users with a game-like progression system. The app features activity rings similar to Apple Fitness+, XP/level mechanics inspired by Duolingo, and league-based competition like Strava.

The application targets Brazilian users with a mix of home and gym workouts, supporting beginners to intermediate fitness levels. It operates on a freemium model with premium features and professional partnerships (personal trainers, nutritionists, physiotherapists).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Wouter for routing instead of Next.js/App Router.

**UI Library**: shadcn/ui component library built on Radix UI primitives, providing accessible and customizable components. The design follows a "fitness-arcade" aesthetic with:
- Dark theme as default
- Neon accent colors (greens, cyans, purples)
- Glassmorphism effects
- Micro-animations (150-250ms transitions)
- Activity ring visualizations

**Styling**: TailwindCSS with custom design tokens defined in CSS variables. Typography uses Inter for body text and Outfit for headings/stats.

**State Management**: 
- React Query (@tanstack/react-query) for server state
- React Context for authentication state
- Component-level useState for UI state

**Key Pages**:
- Landing: Marketing page with login/registration
- Onboarding: Multi-step wizard collecting user preferences
- Dashboard: Main HUD with activity rings, XP bar, streak tracking, and daily missions
- Workout Detail: Exercise-by-exercise logging with sets, reps, load, and RPE tracking
- Evolution: Progress visualization with heatmaps, PR sparklines, and badges
- Leagues: Weekly competitive rankings by tier
- Marketplace: Directory of professional fitness partners
- Account: User settings and LGPD compliance tools

### Backend Architecture

**Framework**: Express.js with TypeScript, running as a traditional server (not serverless).

**API Design**: RESTful endpoints under `/api/*` namespace:
- `/api/auth/*` - Registration, login, session management
- `/api/user/*` - User profile and stats
- `/api/workouts/*` - Workout plans and daily workouts
- `/api/personal-records` - PR tracking
- `/api/leagues` - League rankings
- `/api/check-ins` - Daily check-in submissions

**Session Management**: Express-session with connect-pg-simple for PostgreSQL-backed sessions.

**Authentication**: Username/password with bcrypt hashing. Sessions stored server-side with userId.

**AI Integration**: OpenAI API for generating personalized workout plans based on user profile and recent check-ins. The AI adapts workouts dynamically based on fatigue, pain levels, and recovery metrics.

### Data Storage

**Database**: PostgreSQL accessed via Drizzle ORM with Neon serverless driver.

**Schema Design**:
- `users` - Core user profile (demographics, preferences, equipment access)
- `user_stats` - Gamification metrics (XP, level, streak, league tier)
- `workout_plans` - AI-generated multi-week programs
- `workouts` - Individual workout sessions with scheduling
- `workout_exercises` - Exercise prescriptions (sets, reps, rest)
- `exercise_logs` - Actual performance data (load, reps, RPE)
- `check_ins` - Daily wellness metrics (mood, sleep, pain, fatigue)
- `personal_records` - PR tracking by exercise
- `user_badges` - Achievement unlocks
- `missions` - Daily/weekly challenges

**Data Relationships**: Users have one-to-many relationships with stats, plans, workouts, check-ins, PRs, and badges. Workouts belong to plans and contain multiple exercises, each with multiple logs per set.

### External Dependencies

**AI Services**:
- OpenAI API - Workout plan generation and adaptation using GPT models

**Database**:
- Neon PostgreSQL - Serverless Postgres database
- Drizzle ORM - Type-safe database queries and migrations

**UI Components**:
- Radix UI - Headless accessible component primitives
- shadcn/ui - Pre-styled component library
- Recharts - Data visualization for evolution charts
- Lucide React - Icon library

**Development Tools**:
- Vite - Build tool and dev server
- TypeScript - Type safety across frontend and backend
- Tailwind CSS - Utility-first styling
- Zod - Runtime schema validation

**Authentication & Sessions**:
- express-session - Session middleware
- connect-pg-simple - PostgreSQL session store
- bcrypt - Password hashing

**Deployment Target**: Replit Autoscale for production hosting with environment variables managed through Replit Secrets.

**LGPD Compliance**: Account page provides data download and account deletion functionality to comply with Brazilian data protection regulations.