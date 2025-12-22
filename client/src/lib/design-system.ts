export const colors = {
    primary: {
        main: '#00D9FF',
        light: '#33E0FF',
        dark: '#00A8CC',
        glow: 'rgba(0, 217, 255, 0.3)',
    },
    success: {
        main: '#00FF88',
        light: '#33FF99',
        dark: '#00CC6A',
        glow: 'rgba(0, 255, 136, 0.4)',
    },
    warning: {
        main: '#FFB800',
        light: '#FFC933',
        dark: '#CC9300',
    },
    error: {
        main: '#FF3366',
        light: '#FF5577',
        dark: '#CC2952',
    },
    legendary: {
        main: '#BB00FF',
        light: '#CC33FF',
        dark: '#9900CC',
        glow: 'rgba(187, 0, 255, 0.5)',
    },
    dark: {
        bg: '#0A0E1A',
        card: '#1A1F35',
        elevated: '#252B45',
        border: '#2D3452',
    },
    text: {
        primary: '#FFFFFF',
        secondary: '#B8BFCC',
        muted: '#7C8499',
    },
    rarity: {
        common: '#B8BFCC',
        uncommon: '#00FF88',
        rare: '#00D9FF',
        epic: '#BB00FF',
        legendary: 'linear-gradient(135deg, #FFB800 0%, #FF3366 50%, #BB00FF 100%)',
    },
} as const;

export const animations = {
    // Spring physics (natural feel)
    spring: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
    },

    // Smooth easing
    smooth: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },

    // Quick response
    quick: {
        duration: 0.15,
        ease: [0.4, 0, 0.6, 1] as [number, number, number, number],
    },

    // Celebration
    celebration: {
        duration: 0.6,
        ease: 'easeOut' as const,
    },

    // Slow and dramatic
    dramatic: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
} as const;

export const typography = {
    fontFamily: {
        display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace',
    },

    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem',// 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
    },

    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
    },

    lineHeight: {
        tight: 1.2,
        base: 1.5,
        relaxed: 1.75,
    },
} as const;

export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
} as const;

export const borderRadius = {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
} as const;

export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: {
        primary: `0 0 20px ${colors.primary.glow}`,
        success: `0 0 20px ${colors.success.glow}`,
        legendary: `0 0 30px ${colors.legendary.glow}`,
    },
} as const;

export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
} as const;

// Glassmorphism presets
export const glass = {
    light: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    medium: {
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
    },
    heavy: {
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
    },
} as const;

// Breakpoints for responsive design
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;
