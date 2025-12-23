-- ============================================================
-- FIT AI - SCHEMA COMPLETO PARA SUPABASE
-- Versão: 2.0 | Data: 2024-12-23
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- PARTE 1: CRIAÇÃO DOS SCHEMAS
-- ============================================================

CREATE SCHEMA IF NOT EXISTS game;
CREATE SCHEMA IF NOT EXISTS workout;
CREATE SCHEMA IF NOT EXISTS social;
CREATE SCHEMA IF NOT EXISTS shop;

-- ============================================================
-- PARTE 2: EXTENSÕES NECESSÁRIAS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto

-- ============================================================
-- PARTE 3: TIPOS ENUM (Para melhor performance e validação)
-- ============================================================

-- Enum para sexo
DO $$ BEGIN
    CREATE TYPE sex_type AS ENUM ('male', 'female', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para nível de experiência
DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para objetivo
DO $$ BEGIN
    CREATE TYPE fitness_goal AS ENUM ('fat_loss', 'hypertrophy', 'strength', 'conditioning', 'health');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para local de treino
DO $$ BEGIN
    CREATE TYPE training_location AS ENUM ('home', 'gym', 'outdoor', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para persona da IA
DO $$ BEGIN
    CREATE TYPE ai_persona AS ENUM ('sergeant', 'mentor', 'scientist', 'zen', 'legend');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para tier de assinatura
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'legend');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para rank
DO $$ BEGIN
    CREATE TYPE player_rank AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Legend');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para status do treino
DO $$ BEGIN
    CREATE TYPE workout_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para status da sessão
DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para tipo de post
DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('workout', 'achievement', 'milestone', 'photo', 'text', 'challenge');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para visibilidade
DO $$ BEGIN
    CREATE TYPE visibility_type AS ENUM ('public', 'followers', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para categoria de item
DO $$ BEGIN
    CREATE TYPE item_category AS ENUM ('consumable', 'cosmetic', 'booster', 'title', 'avatar_frame', 'theme');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para raridade
DO $$ BEGIN
    CREATE TYPE rarity_type AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para dificuldade de desafio
DO $$ BEGIN
    CREATE TYPE challenge_difficulty AS ENUM ('easy', 'medium', 'hard', 'extreme', 'impossible');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- PARTE 4: TABELA PROFILES (Core - Usuários)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    -- Identificação (UUID gerado automaticamente - sem link com auth.users)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Autenticação local
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- bcrypt hash
    
    -- Dados básicos
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    
    -- Dados físicos
    date_of_birth DATE,
    sex sex_type,
    height_cm SMALLINT CHECK (height_cm IS NULL OR height_cm BETWEEN 100 AND 250),
    weight_kg DECIMAL(5,2) CHECK (weight_kg IS NULL OR weight_kg BETWEEN 30 AND 300),
    body_fat_percentage DECIMAL(4,2) CHECK (body_fat_percentage IS NULL OR body_fat_percentage BETWEEN 3 AND 60),
    
    -- Preferências de treino
    experience_level experience_level DEFAULT 'beginner',
    primary_goal fitness_goal DEFAULT 'hypertrophy',
    secondary_goal fitness_goal,
    training_days_per_week SMALLINT DEFAULT 3 CHECK (training_days_per_week BETWEEN 1 AND 7),
    session_duration_minutes SMALLINT DEFAULT 60 CHECK (session_duration_minutes BETWEEN 15 AND 180),
    preferred_location training_location DEFAULT 'gym',
    available_equipment TEXT[] DEFAULT '{}',
    injuries_notes TEXT,
    
    -- Coach IA
    ai_persona ai_persona DEFAULT 'mentor',
    ai_language TEXT DEFAULT 'pt-BR',
    
    -- Assinatura
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_started_at TIMESTAMPTZ,
    subscription_expires_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    
    -- Configurações
    theme TEXT DEFAULT 'dark',
    audio_enabled BOOLEAN DEFAULT true,
    haptics_enabled BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT true,
    notifications_email BOOLEAN DEFAULT false,
    privacy_mode visibility_type DEFAULT 'public',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT bio_length CHECK (bio IS NULL OR LENGTH(bio) <= 500)
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_username_search ON public.profiles USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen_at DESC);

-- ============================================================
-- PARTE 5: SCHEMA GAME (Gamificação)
-- ============================================================

-- Estatísticas do usuário (Read Model)
CREATE TABLE IF NOT EXISTS game.user_stats (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- XP e Nível
    total_xp INTEGER DEFAULT 0 NOT NULL CHECK (total_xp >= 0),
    current_level SMALLINT DEFAULT 1 NOT NULL CHECK (current_level >= 1),
    xp_to_next_level INTEGER DEFAULT 100 NOT NULL,
    rank player_rank DEFAULT 'Bronze' NOT NULL,
    prestige_level SMALLINT DEFAULT 0 NOT NULL CHECK (prestige_level >= 0),
    
    -- Economia
    coins INTEGER DEFAULT 0 NOT NULL CHECK (coins >= 0),
    gems INTEGER DEFAULT 0 NOT NULL CHECK (gems >= 0),
    lifetime_coins_earned INTEGER DEFAULT 0 NOT NULL,
    lifetime_gems_earned INTEGER DEFAULT 0 NOT NULL,
    
    -- Ofensiva (Streak)
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
    streak_freezes_available SMALLINT DEFAULT 1 NOT NULL CHECK (streak_freezes_available >= 0),
    streak_freeze_used_today BOOLEAN DEFAULT false,
    last_activity_date DATE,
    
    -- Contadores de treino
    total_workouts INTEGER DEFAULT 0 NOT NULL,
    total_workout_minutes INTEGER DEFAULT 0 NOT NULL,
    perfect_workouts INTEGER DEFAULT 0 NOT NULL,
    personal_records_broken INTEGER DEFAULT 0 NOT NULL,
    total_weight_lifted DECIMAL(12,2) DEFAULT 0 NOT NULL,
    total_calories_burned INTEGER DEFAULT 0 NOT NULL,
    
    -- Conquistas e Desafios
    achievements_unlocked INTEGER DEFAULT 0 NOT NULL,
    challenges_completed INTEGER DEFAULT 0 NOT NULL,
    daily_missions_completed INTEGER DEFAULT 0 NOT NULL,
    weekly_missions_completed INTEGER DEFAULT 0 NOT NULL,
    
    -- Social
    followers_count INTEGER DEFAULT 0 NOT NULL,
    following_count INTEGER DEFAULT 0 NOT NULL,
    posts_count INTEGER DEFAULT 0 NOT NULL,
    likes_received INTEGER DEFAULT 0 NOT NULL,
    
    -- Weekly stats (resetados semanalmente)
    weekly_xp INTEGER DEFAULT 0 NOT NULL,
    weekly_workouts INTEGER DEFAULT 0 NOT NULL,
    weekly_rank_position INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Eventos de gamificação (Event Sourcing)
CREATE TABLE IF NOT EXISTS game.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Tipo e valores
    event_type TEXT NOT NULL,
    xp_delta INTEGER DEFAULT 0 NOT NULL,
    coins_delta INTEGER DEFAULT 0,
    gems_delta INTEGER DEFAULT 0,
    
    -- Contexto
    source TEXT, -- 'workout', 'challenge', 'achievement', 'social', 'daily_mission', 'manual'
    source_id UUID, -- ID do treino, desafio, etc.
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Para auditoria
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_game_events_user ON game.events(user_id);
CREATE INDEX IF NOT EXISTS idx_game_events_user_date ON game.events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_events_type ON game.events(event_type);
CREATE INDEX IF NOT EXISTS idx_game_events_source ON game.events(source, source_id);

-- Conquistas (Definições)
CREATE TABLE IF NOT EXISTS game.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL, -- 'workout', 'streak', 'social', 'challenge', 'legend', 'secret'
    rarity rarity_type DEFAULT 'common' NOT NULL,
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    coins_reward INTEGER DEFAULT 0,
    gems_reward INTEGER DEFAULT 0,
    requirement_type TEXT NOT NULL, -- 'count', 'streak', 'level', 'custom'
    requirement_value INTEGER NOT NULL,
    requirement_metadata JSONB DEFAULT '{}',
    is_secret BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Conquistas do usuário
CREATE TABLE IF NOT EXISTS game.user_achievements (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES game.achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 NOT NULL,
    unlocked_at TIMESTAMPTZ,
    notified BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON game.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON game.user_achievements(user_id) WHERE unlocked_at IS NOT NULL;

-- Desafios (Definições)
CREATE TABLE IF NOT EXISTS game.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    challenge_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'special', 'community'
    difficulty challenge_difficulty DEFAULT 'medium' NOT NULL,
    rarity rarity_type DEFAULT 'common' NOT NULL,
    
    -- Recompensas
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    coins_reward INTEGER DEFAULT 0 NOT NULL,
    gems_reward INTEGER DEFAULT 0,
    
    -- Requisitos
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    requirement_metadata JSONB DEFAULT '{}',
    
    -- Período
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenges_active ON game.challenges(starts_at, ends_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenges_type ON game.challenges(challenge_type, is_active);

-- Participação em desafios
CREATE TABLE IF NOT EXISTS game.user_challenges (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES game.challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'claimed')),
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON game.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_active ON game.user_challenges(user_id) WHERE status = 'active';

-- Missões diárias
CREATE TABLE IF NOT EXISTS game.daily_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Detalhes da missão
    mission_type TEXT NOT NULL, -- 'workout', 'sets', 'reps', 'time', 'checkin', 'social'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    
    -- Progresso
    target INTEGER NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    claimed BOOLEAN DEFAULT false NOT NULL,
    
    -- Recompensas
    xp_reward INTEGER NOT NULL,
    coins_reward INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    
    UNIQUE(user_id, mission_date, mission_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON game.daily_missions(user_id, mission_date);
CREATE INDEX IF NOT EXISTS idx_daily_missions_pending ON game.daily_missions(user_id, mission_date) WHERE NOT completed;

-- ============================================================
-- PARTE 6: SCHEMA WORKOUT (Treinos)
-- ============================================================

-- Planos de treino
CREATE TABLE IF NOT EXISTS workout.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Detalhes
    name TEXT NOT NULL,
    description TEXT,
    duration_weeks SMALLINT DEFAULT 4 NOT NULL CHECK (duration_weeks BETWEEN 1 AND 52),
    days_per_week SMALLINT NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
    
    -- IA
    is_ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    ai_model_version TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    started_at DATE,
    completed_at DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user ON workout.plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_active ON workout.plans(user_id) WHERE is_active = true;

-- Treinos individuais
CREATE TABLE IF NOT EXISTS workout.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES workout.plans(id) ON DELETE CASCADE,
    
    -- Posição
    week_number SMALLINT NOT NULL CHECK (week_number >= 1),
    day_number SMALLINT NOT NULL CHECK (day_number BETWEEN 1 AND 7),
    
    -- Detalhes
    name TEXT,
    focus TEXT NOT NULL, -- 'Peito e Tríceps', 'Pernas', etc.
    muscle_groups TEXT[] DEFAULT '{}',
    estimated_duration_minutes SMALLINT NOT NULL CHECK (estimated_duration_minutes > 0),
    estimated_calories INTEGER,
    
    -- Agendamento
    scheduled_date DATE,
    
    -- Status
    status workout_status DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    actual_duration_minutes SMALLINT,
    
    -- Avaliação
    user_rating SMALLINT CHECK (user_rating IS NULL OR user_rating BETWEEN 1 AND 5),
    user_notes TEXT,
    difficulty_felt SMALLINT CHECK (difficulty_felt IS NULL OR difficulty_felt BETWEEN 1 AND 10),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(plan_id, week_number, day_number)
);

CREATE INDEX IF NOT EXISTS idx_workouts_plan ON workout.workouts(plan_id);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled ON workout.workouts(scheduled_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workout.workouts(scheduled_date DESC);

-- Exercícios nos treinos
CREATE TABLE IF NOT EXISTS workout.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workout.workouts(id) ON DELETE CASCADE,
    
    -- Detalhes do exercício
    exercise_name TEXT NOT NULL,
    exercise_id TEXT, -- referência para biblioteca de exercícios futura
    muscle_group TEXT,
    equipment TEXT,
    
    -- Prescrição
    sets SMALLINT NOT NULL CHECK (sets BETWEEN 1 AND 20),
    reps TEXT NOT NULL, -- '8-12', '10', 'AMRAP', etc.
    rest_seconds SMALLINT DEFAULT 90 CHECK (rest_seconds BETWEEN 0 AND 600),
    tempo TEXT, -- '3-1-2-0' (excêntrico-pausa-concêntrico-pausa)
    rir SMALLINT CHECK (rir IS NULL OR rir BETWEEN 0 AND 5), -- Reps in Reserve
    
    -- Ordem e notas
    order_index SMALLINT NOT NULL,
    notes TEXT,
    video_url TEXT,
    
    -- Superset/Circuit
    superset_group SMALLINT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(workout_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_workout_exercises ON workout.exercises(workout_id);

-- Logs de exercícios (Performance)
CREATE TABLE IF NOT EXISTS workout.exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES workout.exercises(id) ON DELETE CASCADE,
    session_id UUID, -- referência para a sessão de treino
    
    -- Set info
    set_number SMALLINT NOT NULL CHECK (set_number >= 1),
    set_type TEXT DEFAULT 'working' CHECK (set_type IN ('warmup', 'working', 'dropset', 'rest_pause', 'failure')),
    
    -- Performance
    weight_kg DECIMAL(6,2) CHECK (weight_kg IS NULL OR weight_kg >= 0),
    reps_completed SMALLINT CHECK (reps_completed IS NULL OR reps_completed >= 0),
    duration_seconds SMALLINT CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    distance_meters INTEGER,
    
    -- Feedback
    rpe SMALLINT CHECK (rpe IS NULL OR rpe BETWEEN 1 AND 10),
    form_quality SMALLINT CHECK (form_quality IS NULL OR form_quality BETWEEN 1 AND 10),
    pain_level SMALLINT CHECK (pain_level IS NULL OR pain_level BETWEEN 0 AND 10),
    
    -- Status
    completed BOOLEAN DEFAULT false NOT NULL,
    skipped BOOLEAN DEFAULT false,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise ON workout.exercise_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session ON workout.exercise_logs(session_id);

-- Sessões de treino
CREATE TABLE IF NOT EXISTS workout.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workout.workouts(id) ON DELETE SET NULL,
    
    -- Tipo
    session_type TEXT DEFAULT 'structured' CHECK (session_type IN ('structured', 'freestyle', 'cardio', 'recovery')),
    
    -- Tempo
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    pause_duration_seconds INTEGER DEFAULT 0,
    
    -- Status
    status session_status DEFAULT 'active',
    
    -- Métricas calculadas
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    total_weight_lifted DECIMAL(10,2) DEFAULT 0,
    calories_burned INTEGER,
    
    -- IA Feedback
    ai_form_score SMALLINT CHECK (ai_form_score IS NULL OR ai_form_score BETWEEN 0 AND 100),
    ai_intensity_score SMALLINT CHECK (ai_intensity_score IS NULL OR ai_intensity_score BETWEEN 0 AND 100),
    ai_feedback_summary TEXT,
    ai_feedback_detailed JSONB,
    
    -- Localização (opcional)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    gym_name TEXT,
    
    -- Telemetria bruta
    raw_telemetry JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout.sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout ON workout.sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_active ON workout.sessions(user_id) WHERE status = 'active';

-- Check-ins diários
CREATE TABLE IF NOT EXISTS workout.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Métricas subjetivas (1-10)
    energy_level SMALLINT NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
    mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 10),
    sleep_quality SMALLINT NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 24),
    stress_level SMALLINT NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
    soreness SMALLINT NOT NULL CHECK (soreness BETWEEN 1 AND 10),
    motivation SMALLINT NOT NULL CHECK (motivation BETWEEN 1 AND 10),
    
    -- Físico
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    
    -- Notas
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON workout.check_ins(user_id, check_in_date DESC);

-- Recordes pessoais
CREATE TABLE IF NOT EXISTS workout.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Exercício
    exercise_name TEXT NOT NULL,
    exercise_id TEXT,
    
    -- Tipo de recorde
    record_type TEXT NOT NULL CHECK (record_type IN ('1rm', 'weight', 'reps', 'volume', 'time', 'distance')),
    
    -- Valores
    value DECIMAL(10,2) NOT NULL,
    reps SMALLINT,
    estimated_1rm DECIMAL(10,2),
    
    -- Contexto
    session_id UUID REFERENCES workout.sessions(id) ON DELETE SET NULL,
    previous_record_id UUID REFERENCES workout.personal_records(id),
    improvement_percentage DECIMAL(5,2),
    
    achieved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Para histórico
    is_current BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_personal_records_user ON workout.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON workout.personal_records(user_id, exercise_name) WHERE is_current = true;

-- ============================================================
-- PARTE 7: SCHEMA SOCIAL (Comunidade)
-- ============================================================

-- Posts
CREATE TABLE IF NOT EXISTS social.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Conteúdo
    post_type post_type NOT NULL,
    content TEXT,
    media_urls TEXT[],
    
    -- Referências
    related_workout_id UUID REFERENCES workout.workouts(id) ON DELETE SET NULL,
    related_session_id UUID REFERENCES workout.sessions(id) ON DELETE SET NULL,
    related_achievement_id TEXT,
    related_challenge_id UUID,
    related_record_id UUID REFERENCES workout.personal_records(id) ON DELETE SET NULL,
    
    -- Visibilidade
    visibility visibility_type DEFAULT 'public',
    
    -- Contadores (denormalizados para performance)
    likes_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    shares_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Status
    is_pinned BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON social.posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_feed ON social.posts(created_at DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_posts_type ON social.posts(post_type, created_at DESC);

-- Likes em posts
CREATE TABLE IF NOT EXISTS social.post_likes (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES social.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON social.post_likes(post_id);

-- Comentários
CREATE TABLE IF NOT EXISTS social.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES social.comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON social.comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_author ON social.comments(author_id);

-- Follows
CREATE TABLE IF NOT EXISTS social.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followers ON social.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON social.follows(follower_id);

-- Leaderboards
CREATE TABLE IF NOT EXISTS social.leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tipo
    leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('global', 'friends', 'challenge', 'gym')),
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    
    -- Usuário
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Posição
    rank_position INTEGER NOT NULL,
    previous_rank INTEGER,
    rank_change INTEGER,
    
    -- Pontuação
    score INTEGER NOT NULL,
    
    -- Contexto
    challenge_id UUID,
    gym_id UUID,
    
    -- Período
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(leaderboard_type, period, user_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON social.leaderboards(leaderboard_type, period, rank_position);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user ON social.leaderboards(user_id);

-- ============================================================
-- PARTE 8: SCHEMA SHOP (Loja)
-- ============================================================

-- Itens da loja
CREATE TABLE IF NOT EXISTS shop.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    
    -- Detalhes
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    preview_url TEXT,
    
    -- Categoria
    category item_category NOT NULL,
    subcategory TEXT,
    rarity rarity_type DEFAULT 'common' NOT NULL,
    
    -- Preços
    price_coins INTEGER DEFAULT 0 NOT NULL CHECK (price_coins >= 0),
    price_gems INTEGER DEFAULT 0 NOT NULL CHECK (price_gems >= 0),
    original_price_coins INTEGER,
    original_price_gems INTEGER,
    
    -- Efeito (para boosters)
    effect_type TEXT, -- 'xp_multiplier', 'coin_multiplier', 'streak_freeze', etc.
    effect_value DECIMAL(5,2),
    effect_duration_hours INTEGER,
    
    -- Disponibilidade
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    limited_stock INTEGER,
    sold_count INTEGER DEFAULT 0,
    
    -- Requisitos
    required_level SMALLINT,
    required_tier subscription_tier,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_items_category ON shop.items(category) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_shop_items_featured ON shop.items(is_featured, category) WHERE is_available = true;

-- Inventário do usuário
CREATE TABLE IF NOT EXISTS shop.user_inventory (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop.items(id) ON DELETE CASCADE,
    
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 0),
    is_equipped BOOLEAN DEFAULT false,
    
    -- Para itens com duração
    expires_at TIMESTAMPTZ,
    
    acquired_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMPTZ,
    
    PRIMARY KEY (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory ON shop.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped ON shop.user_inventory(user_id) WHERE is_equipped = true;

-- Transações
CREATE TABLE IF NOT EXISTS shop.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Tipo
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'reward', 'refund', 'gift', 'subscription')),
    
    -- Item (se applicable)
    item_id UUID REFERENCES shop.items(id),
    quantity INTEGER DEFAULT 1,
    
    -- Valores
    coins_amount INTEGER DEFAULT 0,
    gems_amount INTEGER DEFAULT 0,
    real_money_amount DECIMAL(10,2),
    currency TEXT,
    
    -- Stripe
    stripe_payment_intent_id TEXT,
    stripe_receipt_url TEXT,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON shop.transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe ON shop.transactions(stripe_payment_intent_id);

-- ============================================================
-- PARTE 9: TRIGGERS E FUNÇÕES
-- ============================================================

-- Função: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: profiles updated_at
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: user_stats updated_at
CREATE TRIGGER trigger_user_stats_updated_at
    BEFORE UPDATE ON game.user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: workout.plans updated_at
CREATE TRIGGER trigger_workout_plans_updated_at
    BEFORE UPDATE ON workout.plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função: Criar user_stats quando profile é criado
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO game.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_stats
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- Função: Processar evento de gamificação
CREATE OR REPLACE FUNCTION game.process_game_event()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE game.user_stats
    SET 
        total_xp = total_xp + COALESCE(NEW.xp_delta, 0),
        coins = coins + COALESCE(NEW.coins_delta, 0),
        gems = gems + COALESCE(NEW.gems_delta, 0),
        lifetime_coins_earned = CASE 
            WHEN NEW.coins_delta > 0 THEN lifetime_coins_earned + NEW.coins_delta 
            ELSE lifetime_coins_earned 
        END,
        lifetime_gems_earned = CASE 
            WHEN NEW.gems_delta > 0 THEN lifetime_gems_earned + NEW.gems_delta 
            ELSE lifetime_gems_earned 
        END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_game_event
    AFTER INSERT ON game.events
    FOR EACH ROW EXECUTE FUNCTION game.process_game_event();

-- Função: Atualizar contadores de likes em posts
CREATE OR REPLACE FUNCTION social.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes
    AFTER INSERT OR DELETE ON social.post_likes
    FOR EACH ROW EXECUTE FUNCTION social.update_post_likes_count();

-- Função: Atualizar contadores de comentários em posts
CREATE OR REPLACE FUNCTION social.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NULL THEN
        UPDATE social.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NULL THEN
        UPDATE social.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments
    AFTER INSERT OR DELETE ON social.comments
    FOR EACH ROW EXECUTE FUNCTION social.update_post_comments_count();

-- Função: Atualizar contadores de follows
CREATE OR REPLACE FUNCTION social.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE game.user_stats SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
        UPDATE game.user_stats SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE game.user_stats SET following_count = GREATEST(following_count - 1, 0) WHERE user_id = OLD.follower_id;
        UPDATE game.user_stats SET followers_count = GREATEST(followers_count - 1, 0) WHERE user_id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON social.follows
    FOR EACH ROW EXECUTE FUNCTION social.update_follow_counts();

-- ============================================================
-- PARTE 10: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE social.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE social.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop.transactions ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies: user_stats
CREATE POLICY "Stats are viewable by everyone" ON game.user_stats
    FOR SELECT USING (true);

CREATE POLICY "Stats are updated by system only" ON game.user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies: events
CREATE POLICY "Users can view own events" ON game.events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON game.events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies: achievements (definições são públicas)
CREATE POLICY "Achievements are viewable by everyone" ON game.achievements
    FOR SELECT USING (true);

-- Policies: user_achievements
CREATE POLICY "User achievements are viewable by everyone" ON game.user_achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own achievements" ON game.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON game.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies: challenges (definições são públicas)
CREATE POLICY "Challenges are viewable by everyone" ON game.challenges
    FOR SELECT USING (true);

-- Policies: user_challenges
CREATE POLICY "User challenges are viewable by everyone" ON game.user_challenges
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own challenges" ON game.user_challenges
    FOR ALL USING (auth.uid() = user_id);

-- Policies: daily_missions
CREATE POLICY "Users can view own missions" ON game.daily_missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own missions" ON game.daily_missions
    FOR ALL USING (auth.uid() = user_id);

-- Policies: workout.plans
CREATE POLICY "Users can view own plans" ON workout.plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plans" ON workout.plans
    FOR ALL USING (auth.uid() = user_id);

-- Policies: workout.workouts
CREATE POLICY "Workouts are viewable via plan" ON workout.workouts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM workout.plans WHERE id = plan_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can manage own workouts" ON workout.workouts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM workout.plans WHERE id = plan_id AND user_id = auth.uid())
    );

-- Policies: workout.exercises
CREATE POLICY "Exercises are viewable via workout" ON workout.exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout.workouts w
            JOIN workout.plans p ON w.plan_id = p.id
            WHERE w.id = workout_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own exercises" ON workout.exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workout.workouts w
            JOIN workout.plans p ON w.plan_id = p.id
            WHERE w.id = workout_id AND p.user_id = auth.uid()
        )
    );

-- Policies: exercise_logs
CREATE POLICY "Logs are viewable via exercise" ON workout.exercise_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout.exercises e
            JOIN workout.workouts w ON e.workout_id = w.id
            JOIN workout.plans p ON w.plan_id = p.id
            WHERE e.id = exercise_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own logs" ON workout.exercise_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workout.exercises e
            JOIN workout.workouts w ON e.workout_id = w.id
            JOIN workout.plans p ON w.plan_id = p.id
            WHERE e.id = exercise_id AND p.user_id = auth.uid()
        )
    );

-- Policies: sessions
CREATE POLICY "Users can view own sessions" ON workout.sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON workout.sessions
    FOR ALL USING (auth.uid() = user_id);

-- Policies: check_ins
CREATE POLICY "Users can view own check_ins" ON workout.check_ins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own check_ins" ON workout.check_ins
    FOR ALL USING (auth.uid() = user_id);

-- Policies: personal_records
CREATE POLICY "Records are viewable by everyone" ON workout.personal_records
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own records" ON workout.personal_records
    FOR ALL USING (auth.uid() = user_id);

-- Policies: posts
CREATE POLICY "Public posts are viewable by everyone" ON social.posts
    FOR SELECT USING (
        visibility = 'public' OR 
        author_id = auth.uid() OR
        (visibility = 'followers' AND EXISTS (
            SELECT 1 FROM social.follows WHERE follower_id = auth.uid() AND following_id = author_id
        ))
    );

CREATE POLICY "Users can manage own posts" ON social.posts
    FOR ALL USING (auth.uid() = author_id);

-- Policies: post_likes
CREATE POLICY "Likes are viewable by everyone" ON social.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON social.post_likes
    FOR ALL USING (auth.uid() = user_id);

-- Policies: comments
CREATE POLICY "Comments are viewable by everyone" ON social.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON social.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments" ON social.comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON social.comments
    FOR DELETE USING (auth.uid() = author_id);

-- Policies: follows
CREATE POLICY "Follows are viewable by everyone" ON social.follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON social.follows
    FOR ALL USING (auth.uid() = follower_id);

-- Policies: leaderboards
CREATE POLICY "Leaderboards are viewable by everyone" ON social.leaderboards
    FOR SELECT USING (true);

-- Policies: shop.items
CREATE POLICY "Shop items are viewable by everyone" ON shop.items
    FOR SELECT USING (true);

-- Policies: user_inventory
CREATE POLICY "Users can view own inventory" ON shop.user_inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own inventory" ON shop.user_inventory
    FOR ALL USING (auth.uid() = user_id);

-- Policies: transactions
CREATE POLICY "Users can view own transactions" ON shop.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON shop.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PARTE 11: DADOS INICIAIS (Seeds)
-- ============================================================

-- Conquistas padrão
INSERT INTO game.achievements (id, name, description, icon, category, rarity, xp_reward, coins_reward, requirement_type, requirement_value, sort_order) VALUES
    ('first_workout', 'Primeiro Passo', 'Complete seu primeiro treino', '🏋️', 'workout', 'common', 50, 100, 'count', 1, 1),
    ('workouts_10', 'Dedicado', 'Complete 10 treinos', '💪', 'workout', 'uncommon', 150, 300, 'count', 10, 2),
    ('workouts_50', 'Atleta', 'Complete 50 treinos', '🔥', 'workout', 'rare', 500, 1000, 'count', 50, 3),
    ('workouts_100', 'Spartano', 'Complete 100 treinos', '⚔️', 'workout', 'epic', 1000, 2500, 'count', 100, 4),
    ('workouts_365', 'Lenda Anual', 'Complete 365 treinos', '👑', 'workout', 'legendary', 5000, 10000, 'count', 365, 5),
    ('streak_7', 'Semana Perfeita', 'Mantenha uma ofensiva de 7 dias', '🔥', 'streak', 'uncommon', 200, 500, 'streak', 7, 10),
    ('streak_30', 'Mês Invicto', 'Mantenha uma ofensiva de 30 dias', '🌟', 'streak', 'rare', 750, 1500, 'streak', 30, 11),
    ('streak_100', 'Centurião', 'Mantenha uma ofensiva de 100 dias', '🏆', 'streak', 'epic', 2500, 5000, 'streak', 100, 12),
    ('streak_365', 'Lenda Imortal', 'Mantenha uma ofensiva de 365 dias', '💎', 'streak', 'mythic', 10000, 20000, 'streak', 365, 13),
    ('first_pr', 'Superação', 'Quebre seu primeiro recorde pessoal', '📈', 'workout', 'common', 75, 150, 'count', 1, 20),
    ('prs_10', 'Evolução Constante', 'Quebre 10 recordes pessoais', '🚀', 'workout', 'uncommon', 300, 600, 'count', 10, 21),
    ('level_10', 'Nível 10', 'Alcance o nível 10', '⭐', 'legend', 'uncommon', 100, 250, 'level', 10, 30),
    ('level_25', 'Nível 25', 'Alcance o nível 25', '🌟', 'legend', 'rare', 300, 750, 'level', 25, 31),
    ('level_50', 'Nível 50', 'Alcance o nível 50', '💫', 'legend', 'epic', 750, 2000, 'level', 50, 32),
    ('level_100', 'Centenário', 'Alcance o nível 100', '👑', 'legend', 'legendary', 2000, 5000, 'level', 100, 33),
    ('first_follower', 'Social Starter', 'Ganhe seu primeiro seguidor', '👥', 'social', 'common', 25, 50, 'count', 1, 40),
    ('followers_100', 'Influenciador', 'Ganhe 100 seguidores', '🎯', 'social', 'rare', 500, 1000, 'count', 100, 41),
    ('perfect_form', 'Forma Perfeita', 'Obtenha 100% de precisão em um treino', '🎯', 'workout', 'rare', 250, 500, 'custom', 1, 50),
    ('early_bird', 'Madrugador', 'Complete um treino antes das 6h', '🌅', 'secret', 'uncommon', 100, 200, 'custom', 1, 60),
    ('night_owl', 'Coruja', 'Complete um treino depois das 22h', '🌙', 'secret', 'uncommon', 100, 200, 'custom', 1, 61)
ON CONFLICT (id) DO NOTHING;

-- Itens da loja padrão
INSERT INTO shop.items (slug, name, description, icon, category, rarity, price_coins, price_gems, effect_type, effect_value, effect_duration_hours) VALUES
    ('streak_freeze', 'Gelo de Ofensiva', 'Protege sua ofensiva por 24h caso você perca um dia', '❄️', 'consumable', 'rare', 500, 0, 'streak_freeze', 1, 24),
    ('xp_boost_1h', 'Poção de XP (1h)', 'Aumenta o XP ganho em 50% por 1 hora', '⚡', 'booster', 'uncommon', 250, 0, 'xp_multiplier', 1.5, 1),
    ('xp_boost_24h', 'Poção de XP (24h)', 'Aumenta o XP ganho em 50% por 24 horas', '🔥', 'booster', 'rare', 1000, 5, 'xp_multiplier', 1.5, 24),
    ('double_coins_1h', 'Moedas Dobradas (1h)', 'Dobra as moedas ganhas por 1 hora', '💰', 'booster', 'uncommon', 300, 0, 'coin_multiplier', 2.0, 1),
    ('title_legend', 'Título: A Lenda', 'Um título exclusivo exibido no seu perfil', '👑', 'title', 'legendary', 5000, 50, NULL, NULL, NULL),
    ('title_warrior', 'Título: Guerreiro', 'Mostre sua determinação', '⚔️', 'title', 'epic', 2500, 25, NULL, NULL, NULL),
    ('title_beast', 'Título: A Besta', 'Para quem não conhece limites', '🦁', 'title', 'epic', 2500, 25, NULL, NULL, NULL),
    ('frame_fire', 'Moldura de Fogo', 'Uma moldura ardente para seu avatar', '🔥', 'avatar_frame', 'rare', 1500, 15, NULL, NULL, NULL),
    ('frame_neon', 'Moldura Neon', 'Uma moldura futurista para seu avatar', '💜', 'avatar_frame', 'epic', 2000, 20, NULL, NULL, NULL),
    ('frame_gold', 'Moldura Dourada', 'Para os campeões de verdade', '✨', 'avatar_frame', 'legendary', 5000, 50, NULL, NULL, NULL),
    ('theme_dark', 'Tema Escuro Premium', 'Um tema escuro ultra polido', '🌙', 'theme', 'rare', 1000, 10, NULL, NULL, NULL),
    ('theme_neon', 'Tema Cyberpunk', 'Neon e futurismo', '🌃', 'theme', 'epic', 2000, 20, NULL, NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTE 12: VIEWS ÚTEIS
-- ============================================================

-- View: Perfil completo com stats
CREATE OR REPLACE VIEW public.profile_with_stats AS
SELECT 
    p.*,
    s.total_xp,
    s.current_level,
    s.rank,
    s.prestige_level,
    s.coins,
    s.gems,
    s.current_streak,
    s.longest_streak,
    s.total_workouts,
    s.perfect_workouts,
    s.personal_records_broken,
    s.achievements_unlocked,
    s.followers_count,
    s.following_count,
    s.posts_count,
    s.weekly_xp
FROM public.profiles p
LEFT JOIN game.user_stats s ON p.id = s.user_id;

-- View: Feed público
CREATE OR REPLACE VIEW social.public_feed AS
SELECT 
    p.*,
    pr.username AS author_username,
    pr.full_name AS author_name,
    pr.avatar_url AS author_avatar
FROM social.posts p
JOIN public.profiles pr ON p.author_id = pr.id
WHERE p.visibility = 'public'
ORDER BY p.created_at DESC;

-- View: Leaderboard semanal global
CREATE OR REPLACE VIEW game.weekly_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY s.weekly_xp DESC) AS position,
    p.id AS user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    s.weekly_xp,
    s.current_level,
    s.rank
FROM game.user_stats s
JOIN public.profiles p ON s.user_id = p.id
WHERE s.weekly_xp > 0
ORDER BY s.weekly_xp DESC
LIMIT 100;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Schema FIT AI criado com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas em: public, game, workout, social, shop';
    RAISE NOTICE '🔒 RLS habilitado em todas as tabelas';
    RAISE NOTICE '⚡ Triggers configurados para automação';
END
$$;
