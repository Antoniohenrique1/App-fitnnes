# Design Guidelines: Fitness AI Coach BR

## Design Approach

**Reference-Based Approach**: Draw inspiration from gamified fitness and wellness apps while maintaining the unique "fitness-arcade" aesthetic:
- **Apple Fitness+**: Activity rings animation, clean data visualization, workout presentation
- **Duolingo**: Streak mechanics, XP progression, mission system, playful gamification
- **Strava**: Achievement badges, social comparison (leagues), performance tracking
- **Notion**: Clean dark mode, card-based layouts, information hierarchy

**Core Principles**:
- Motivational without being overwhelming
- Data-rich but digestible
- Gamified elements feel rewarding, not childish
- Dark theme reduces eye strain during evening workouts

## Typography

**Font Stack**: Google Fonts via CDN
- **Primary**: Inter (variable weight) - body text, UI elements, data
- **Accent**: Outfit (600-700) - headings, XP numbers, level displays

**Hierarchy**:
- Page titles: text-4xl font-bold (Outfit)
- Section headers: text-2xl font-semibold (Outfit)
- Card titles: text-lg font-semibold (Inter)
- Body text: text-base font-normal (Inter)
- Captions/metadata: text-sm text-muted-foreground (Inter)
- Numbers/stats: text-3xl font-bold tabular-nums (Outfit)

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** for consistency
- Component padding: p-4 to p-8
- Section spacing: space-y-8 to space-y-12
- Card gaps: gap-4 to gap-6
- Icon-to-text spacing: gap-2

**Container Strategy**:
- Dashboard: max-w-7xl mx-auto px-4
- Content pages: max-w-4xl mx-auto px-4
- Full-width sections: w-full with inner containers

**Grid Patterns**:
- Mission cards: grid-cols-1 md:grid-cols-3 gap-4
- Activity rings: Centered focal point, mobile stacks vertically
- Evolution metrics: grid-cols-1 md:grid-cols-2 gap-6

## Component Library

### Core Components

**Activity Rings (Dashboard Centerpiece)**:
- Three concentric SVG rings (120px diameter mobile, 200px desktop)
- Animated stroke-dashoffset with spring easing
- Inner ring: Workout (neon green #B5FF00)
- Middle ring: Volume (cyan #00E5FF)
- Outer ring: Recovery (purple gradient)
- Center displays primary metric (e.g., "85%")

**XP Bar**:
- Full-width progress bar with rounded-full edges
- Height: h-3
- Background: bg-muted with glassmorphism (bg-opacity-20 backdrop-blur-sm)
- Fill: gradient from neon green to cyan
- Level badge positioned at start: rounded-full with border-2

**Streak Flame**:
- Flame icon (lucide-react) with pulsing animation when active
- Display format: "🔥 12 dias" with large number (text-2xl font-bold)
- Streak freeze indicator: shield icon overlay when available
- Position: Top-right of dashboard

**Mission Cards**:
- Card with rounded-2xl border-2 border-muted
- Checkbox indicator (completed missions show green checkmark animation)
- Progress bar for quantitative missions
- Layout: Icon left, text center, progress right
- Hover: subtle scale-105 transform

**Badge Grid**:
- Masonry-style grid showing earned badges with opacity-100
- Locked badges at opacity-40 with lock icon overlay
- Badge design: Circular containers with icon + rarity glow
- Rarity tiers: Common (gray), Rare (cyan), Epic (green), Legendary (gold gradient)

**Workout Exercise Card**:
- Glassmorphism container: backdrop-blur-md bg-card/50
- Header: Exercise name + swap button (if pain ≥6)
- Body: Sets tracker with checkboxes, rep range, rest timer
- Footer: Load input + RPE selector (1-10 scale with emoji indicators)

**Heatmap (Evolution Page)**:
- GitHub-style contribution grid
- Each cell: w-3 h-3 rounded-sm
- Color intensity: 5 levels from bg-muted to full neon green
- Tooltip on hover: Date + completion percentage

**PR Sparkline**:
- Miniature line chart (h-12)
- Y-axis: Relative to exercise PR range
- X-axis: Last 8-12 weeks
- Peak marked with small dot and label
- Stroke: gradient from green to cyan

### Navigation

**Top Bar** (sticky):
- Logo left (text + minimal icon)
- Navigation center (Dashboard, Evolução, Ligas, Marketplace)
- User avatar + notification bell right
- Mobile: Hamburger menu, drawer from right

**Bottom Navigation** (mobile only):
- Fixed bottom-0 with 4-5 primary actions
- Active state: Icon fills with neon color + label visible
- Glassmorphism background

### Data Displays

**Stat Cards**:
- Border-l-4 with neon accent color
- Large number top (text-3xl)
- Label bottom (text-sm text-muted-foreground)
- Subtle background gradient on hover

**League Card**:
- Tier badge prominent (Bronze/Silver/Gold/Diamond with matching colors)
- Ranking list: Top 3 highlighted with podium icons
- User's position always visible (sticky or highlighted)
- Compact avatar + name + XP score layout

### Forms & Inputs

**Onboarding Wizard**:
- Step indicator at top (dots with progress line)
- Large, touch-friendly inputs (min-h-12)
- Single question per screen on mobile
- Primary CTA: Full-width rounded-xl button with gradient

**Check-in Sliders**:
- Large touch targets for mood/pain/fatigue (1-10 scales)
- Emoji feedback at thumb position
- Label shows selected value dynamically
- Subtle haptic-style pulse animation on value change

## Visual Treatment

**Dark Theme Foundation**:
- Background: #0A0A0A
- Card background: #141414
- Muted elements: #262626
- Text: #FAFAFA (primary), #A3A3A3 (muted)

**Neon Accents** (use sparingly for emphasis):
- Primary green: #B5FF00
- Secondary cyan: #00E5FF
- Apply to: Ring fills, CTAs, active states, success states
- Glow effect: box-shadow with neon color at 40% opacity

**Glassmorphism**:
- backdrop-blur-md with bg-card/50
- border border-white/10
- Apply to: Floating cards, modals, navigation overlay

**Shadows**:
- Cards: shadow-lg shadow-black/20
- Elevated elements: shadow-xl shadow-neon-green/10

## Animations

**Micro-interactions** (150-250ms duration):
- Ring progress fills on mount: Spring easing
- Mission completion: Confetti burst (10-15 particles), checkmark scale
- Level up: XP bar pulse + badge scale-in
- Button press: scale-95 active state

**Page Transitions**:
- Fade in content: opacity-0 to opacity-100 (200ms)
- Slide-up modals: translate-y-8 to translate-y-0

**Prohibited**:
- Continuous looping animations (except loading spinners)
- Parallax scrolling effects
- Excessive hover animations

## Images

**Hero Section** (/landing):
- Full-width split layout (text left, image right on desktop)
- Image: Fit person using phone in gym/home workout setting
- Apply gradient overlay (from bg-black/60 to transparent)
- Mobile: Image background with text overlay, blurred background for text readability

**Workout Illustrations**:
- Exercise cards: Small thumbnail icons (64x64) from Heroicons or custom simple line illustrations
- No need for photographic exercise demonstrations in MVP

**Partner Avatars** (/marketplace):
- Circular headshots (w-16 h-16)
- Professional photos of trainers/nutritionists

**Badge Icons**:
- Use Lucide React icons: Trophy, Target, Flame, Star, Award, Zap, Heart
- SVG format, single color with neon glow applied

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (2 column grids)
- Desktop: > 1024px (3 column grids, sidebar layouts)

**Dashboard Adaptations**:
- Mobile: Rings stack vertically, full-width mission cards
- Desktop: Rings centered top, missions in 3-column grid below

**Key Mobile Optimizations**:
- Touch targets minimum 44x44px
- Thumb-friendly zone for primary actions
- Swipe gestures for workout exercise progression
- Pull-to-refresh for dashboard data