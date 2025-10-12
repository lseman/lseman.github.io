/**
 * Pre-defined Theme System
 * Beautiful, accessible color themes for Educational Template Engine
 * @version 1.0.0
 */

class ThemeManager {
    constructor() {
        this.themes = {

            default: {
                name: 'Default',
                description: 'The default theme with balanced colors',
                cssVariables: {
                    '--brand': '#0891b2',
                    '--brand-light': '#06b6d4',
                    '--brand-dark': '#0e7490',
                    '--ink': '#0f172a',
                    '--ink-lighter': '#475569',
                    '--surface': '#f8fafc',
                    '--hero-gradient-end': '#e0f2fe',
                    '--pattern-color-1': 'rgba(6, 182, 212, 0.08)',
                    '--pattern-color-2': 'rgba(14, 116, 144, 0.05)',
                    '--grid-color': 'rgba(8, 145, 178, 0.05)',
                    '--card-hover-border': 'rgba(8, 145, 178, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }
            },
            // Purple/Violet - Creative & Imaginative
            violet: {
                name: 'Violet Dream',
                description: 'A creative purple palette perfect for innovative content',
                cssVariables: {
                    '--brand': '#8b5cf6',
                    '--brand-light': '#a78bfa',
                    '--brand-dark': '#7c3aed',
                    '--brand-darker': '#6d28d9',
                    '--accent': '#ec4899',
                    '--accent-light': '#f472b6',
                    '--ink': '#1e293b',
                    '--ink-light': '#334155',
                    '--ink-lighter': '#475569',
                    '--ink-lightest': '#64748b',
                    '--surface': '#faf5ff',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#faf5ff',
                    '--hero-gradient-end': '#ede9fe',
                    '--pattern-color-1': 'rgba(139, 92, 246, 0.05)',
                    '--pattern-color-2': 'rgba(167, 139, 250, 0.08)',
                    '--grid-color': 'rgba(139, 92, 246, 0.03)',
                    '--card-hover-border': 'rgba(139, 92, 246, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(139, 92, 246, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(139, 92, 246, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(139, 92, 246, 0.2)'
                }
            },

            // Cyan/Teal - Professional & Tech
            cyan: {
                name: 'Cyber Cyan',
                description: 'A professional tech-inspired cyan theme',
                cssVariables: {
                    '--brand': '#0891b2',
                    '--brand-light': '#06b6d4',
                    '--brand-dark': '#0e7490',
                    '--brand-darker': '#155e75',
                    '--accent': '#8b5cf6',
                    '--accent-light': '#a78bfa',
                    '--ink': '#0f172a',
                    '--ink-light': '#1e293b',
                    '--ink-lighter': '#475569',
                    '--ink-lightest': '#64748b',
                    '--surface': '#f0fdfa',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#f0fdfa',
                    '--hero-gradient-end': '#ccfbf1',
                    '--pattern-color-1': 'rgba(6, 182, 212, 0.08)',
                    '--pattern-color-2': 'rgba(14, 116, 144, 0.05)',
                    '--grid-color': 'rgba(8, 145, 178, 0.05)',
                    '--card-hover-border': 'rgba(8, 145, 178, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(8, 145, 178, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(8, 145, 178, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(8, 145, 178, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(8, 145, 178, 0.2)'
                }
            },

            // Emerald/Green - Fresh & Growth
            emerald: {
                name: 'Emerald Forest',
                description: 'A fresh green palette for nature and growth topics',
                cssVariables: {
                    '--brand': '#10b981',
                    '--brand-light': '#34d399',
                    '--brand-dark': '#059669',
                    '--brand-darker': '#047857',
                    '--accent': '#f59e0b',
                    '--accent-light': '#fbbf24',
                    '--ink': '#064e3b',
                    '--ink-light': '#065f46',
                    '--ink-lighter': '#047857',
                    '--ink-lightest': '#6b7280',
                    '--surface': '#f0fdf4',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#f0fdf4',
                    '--hero-gradient-end': '#d1fae5',
                    '--pattern-color-1': 'rgba(16, 185, 129, 0.06)',
                    '--pattern-color-2': 'rgba(52, 211, 153, 0.08)',
                    '--grid-color': 'rgba(16, 185, 129, 0.04)',
                    '--card-hover-border': 'rgba(16, 185, 129, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(16, 185, 129, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(16, 185, 129, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(16, 185, 129, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(16, 185, 129, 0.2)'
                }
            },

            // Rose/Pink - Warm & Friendly
            rose: {
                name: 'Rose Garden',
                description: 'A warm pink palette perfect for creative and friendly content',
                cssVariables: {
                    '--brand': '#f43f5e',
                    '--brand-light': '#fb7185',
                    '--brand-dark': '#e11d48',
                    '--brand-darker': '#be123c',
                    '--accent': '#8b5cf6',
                    '--accent-light': '#a78bfa',
                    '--ink': '#1f2937',
                    '--ink-light': '#374151',
                    '--ink-lighter': '#4b5563',
                    '--ink-lightest': '#6b7280',
                    '--surface': '#fff1f2',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#fff1f2',
                    '--hero-gradient-end': '#ffe4e6',
                    '--pattern-color-1': 'rgba(244, 63, 94, 0.05)',
                    '--pattern-color-2': 'rgba(251, 113, 133, 0.08)',
                    '--grid-color': 'rgba(244, 63, 94, 0.04)',
                    '--card-hover-border': 'rgba(244, 63, 94, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(244, 63, 94, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(244, 63, 94, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(244, 63, 94, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(244, 63, 94, 0.2)'
                }
            },

            // Amber/Orange - Energetic & Bold
            amber: {
                name: 'Amber Glow',
                description: 'An energetic orange palette for bold, impactful content',
                cssVariables: {
                    '--brand': '#f59e0b',
                    '--brand-light': '#fbbf24',
                    '--brand-dark': '#d97706',
                    '--brand-darker': '#b45309',
                    '--accent': '#ef4444',
                    '--accent-light': '#f87171',
                    '--ink': '#1c1917',
                    '--ink-light': '#292524',
                    '--ink-lighter': '#44403c',
                    '--ink-lightest': '#78716c',
                    '--surface': '#fffbeb',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#fffbeb',
                    '--hero-gradient-end': '#fef3c7',
                    '--pattern-color-1': 'rgba(245, 158, 11, 0.06)',
                    '--pattern-color-2': 'rgba(251, 191, 36, 0.08)',
                    '--grid-color': 'rgba(245, 158, 11, 0.04)',
                    '--card-hover-border': 'rgba(245, 158, 11, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(245, 158, 11, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(245, 158, 11, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(245, 158, 11, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(245, 158, 11, 0.2)'
                }
            },

            // Indigo/Blue - Trust & Stability
            indigo: {
                name: 'Indigo Night',
                description: 'A trustworthy blue palette for corporate and educational content',
                cssVariables: {
                    '--brand': '#4f46e5',
                    '--brand-light': '#6366f1',
                    '--brand-dark': '#4338ca',
                    '--brand-darker': '#3730a3',
                    '--accent': '#06b6d4',
                    '--accent-light': '#22d3ee',
                    '--ink': '#0f172a',
                    '--ink-light': '#1e293b',
                    '--ink-lighter': '#334155',
                    '--ink-lightest': '#64748b',
                    '--surface': '#eef2ff',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#eef2ff',
                    '--hero-gradient-end': '#e0e7ff',
                    '--pattern-color-1': 'rgba(79, 70, 229, 0.05)',
                    '--pattern-color-2': 'rgba(99, 102, 241, 0.08)',
                    '--grid-color': 'rgba(79, 70, 229, 0.04)',
                    '--card-hover-border': 'rgba(79, 70, 229, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(79, 70, 229, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(79, 70, 229, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(79, 70, 229, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(79, 70, 229, 0.2)'
                }
            },

            // Slate/Monochrome - Minimal & Elegant
            slate: {
                name: 'Slate Minimal',
                description: 'A minimal monochrome palette for elegant, distraction-free content',
                cssVariables: {
                    '--brand': '#0f172a',
                    '--brand-light': '#334155',
                    '--brand-dark': '#020617',
                    '--brand-darker': '#000000',
                    '--accent': '#64748b',
                    '--accent-light': '#94a3b8',
                    '--ink': '#0f172a',
                    '--ink-light': '#1e293b',
                    '--ink-lighter': '#334155',
                    '--ink-lightest': '#475569',
                    '--surface': '#f8fafc',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#f8fafc',
                    '--hero-gradient-end': '#f1f5f9',
                    '--pattern-color-1': 'rgba(15, 23, 42, 0.03)',
                    '--pattern-color-2': 'rgba(51, 65, 85, 0.05)',
                    '--grid-color': 'rgba(15, 23, 42, 0.02)',
                    '--card-hover-border': 'rgba(15, 23, 42, 0.2)',
                    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
                }
            },

            // Ocean - Deep Blue/Teal
            ocean: {
                name: 'Ocean Depths',
                description: 'A deep ocean palette blending blue and teal',
                cssVariables: {
                    '--brand': '#0284c7',
                    '--brand-light': '#0ea5e9',
                    '--brand-dark': '#0369a1',
                    '--brand-darker': '#075985',
                    '--accent': '#14b8a6',
                    '--accent-light': '#2dd4bf',
                    '--ink': '#083344',
                    '--ink-light': '#164e63',
                    '--ink-lighter': '#155e75',
                    '--ink-lightest': '#475569',
                    '--surface': '#f0f9ff',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#f0f9ff',
                    '--hero-gradient-end': '#e0f2fe',
                    '--pattern-color-1': 'rgba(2, 132, 199, 0.06)',
                    '--pattern-color-2': 'rgba(14, 165, 233, 0.08)',
                    '--grid-color': 'rgba(2, 132, 199, 0.04)',
                    '--card-hover-border': 'rgba(2, 132, 199, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(2, 132, 199, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(2, 132, 199, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(2, 132, 199, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(2, 132, 199, 0.2)'
                }
            },

            // Sunset - Orange to Purple Gradient
            sunset: {
                name: 'Sunset Vibes',
                description: 'A warm sunset palette with gradient tones',
                cssVariables: {
                    '--brand': '#f97316',
                    '--brand-light': '#fb923c',
                    '--brand-dark': '#ea580c',
                    '--brand-darker': '#c2410c',
                    '--accent': '#ec4899',
                    '--accent-light': '#f472b6',
                    '--ink': '#1c1917',
                    '--ink-light': '#292524',
                    '--ink-lighter': '#44403c',
                    '--ink-lightest': '#78716c',
                    '--surface': '#fff7ed',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#fff7ed',
                    '--hero-gradient-end': '#fed7aa',
                    '--pattern-color-1': 'rgba(249, 115, 22, 0.06)',
                    '--pattern-color-2': 'rgba(251, 146, 60, 0.08)',
                    '--grid-color': 'rgba(249, 115, 22, 0.04)',
                    '--card-hover-border': 'rgba(249, 115, 22, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(249, 115, 22, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(249, 115, 22, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(249, 115, 22, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(249, 115, 22, 0.2)'
                }
            },

            // Forest - Dark Green
            forest: {
                name: 'Forest Deep',
                description: 'A rich forest green palette for natural, earthy content',
                cssVariables: {
                    '--brand': '#166534',
                    '--brand-light': '#16a34a',
                    '--brand-dark': '#14532d',
                    '--brand-darker': '#052e16',
                    '--accent': '#84cc16',
                    '--accent-light': '#a3e635',
                    '--ink': '#1c1917',
                    '--ink-light': '#292524',
                    '--ink-lighter': '#44403c',
                    '--ink-lightest': '#57534e',
                    '--surface': '#f7fee7',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#f7fee7',
                    '--hero-gradient-end': '#ecfccb',
                    '--pattern-color-1': 'rgba(22, 101, 52, 0.06)',
                    '--pattern-color-2': 'rgba(22, 163, 74, 0.08)',
                    '--grid-color': 'rgba(22, 101, 52, 0.04)',
                    '--card-hover-border': 'rgba(22, 101, 52, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(22, 101, 52, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(22, 101, 52, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(22, 101, 52, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(22, 101, 52, 0.2)'
                }
            },

            // Crimson - Bold Red
            crimson: {
                name: 'Crimson Bold',
                description: 'A bold crimson palette for high-impact, attention-grabbing content',
                cssVariables: {
                    '--brand': '#dc2626',
                    '--brand-light': '#ef4444',
                    '--brand-dark': '#b91c1c',
                    '--brand-darker': '#991b1b',
                    '--accent': '#f59e0b',
                    '--accent-light': '#fbbf24',
                    '--ink': '#1c1917',
                    '--ink-light': '#292524',
                    '--ink-lighter': '#44403c',
                    '--ink-lightest': '#78716c',
                    '--surface': '#fef2f2',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#fef2f2',
                    '--hero-gradient-end': '#fee2e2',
                    '--pattern-color-1': 'rgba(220, 38, 38, 0.05)',
                    '--pattern-color-2': 'rgba(239, 68, 68, 0.08)',
                    '--grid-color': 'rgba(220, 38, 38, 0.04)',
                    '--card-hover-border': 'rgba(220, 38, 38, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(220, 38, 38, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(220, 38, 38, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(220, 38, 38, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(220, 38, 38, 0.2)'
                }
            },

            // Lavender - Soft Purple
            lavender: {
                name: 'Lavender Fields',
                description: 'A soft, calming lavender palette for relaxing content',
                cssVariables: {
                    '--brand': '#9333ea',
                    '--brand-light': '#a855f7',
                    '--brand-dark': '#7e22ce',
                    '--brand-darker': '#6b21a8',
                    '--accent': '#ec4899',
                    '--accent-light': '#f472b6',
                    '--ink': '#1e1b4b',
                    '--ink-light': '#312e81',
                    '--ink-lighter': '#4c1d95',
                    '--ink-lightest': '#6b7280',
                    '--surface': '#faf5ff',
                    '--surface-elevated': '#ffffff',
                    '--hero-gradient-start': '#faf5ff',
                    '--hero-gradient-end': '#f3e8ff',
                    '--pattern-color-1': 'rgba(147, 51, 234, 0.05)',
                    '--pattern-color-2': 'rgba(168, 85, 247, 0.08)',
                    '--grid-color': 'rgba(147, 51, 234, 0.03)',
                    '--card-hover-border': 'rgba(147, 51, 234, 0.3)',
                    '--shadow-sm': '0 1px 2px 0 rgba(147, 51, 234, 0.05)',
                    '--shadow-md': '0 4px 6px -1px rgba(147, 51, 234, 0.1)',
                    '--shadow-lg': '0 10px 15px -3px rgba(147, 51, 234, 0.15)',
                    '--shadow-xl': '0 20px 25px -5px rgba(147, 51, 234, 0.2)'
                }
            }
        };
    }

    /**
     * Get a theme by name
     * @param {string} themeName - Name of the theme
     * @returns {Object|null} Theme object or null if not found
     */
    getTheme(themeName) {
        return this.themes[themeName] || null;
    }

    /**
     * Get all available themes
     * @returns {Object} All themes
     */
    getAllThemes() {
        return this.themes;
    }

    /**
     * Get theme names for selection
     * @returns {Array} Array of theme names
     */
    getThemeNames() {
        return Object.keys(this.themes);
    }

    /**
     * Get theme info for display
     * @returns {Array} Array of theme info objects
     */
    getThemeInfo() {
        return Object.entries(this.themes).map(([key, theme]) => ({
            id: key,
            name: theme.name,
            description: theme.description,
            brandColor: theme.cssVariables['--brand']
        }));
    }

    /**
     * Register a custom theme
     * @param {string} name - Theme identifier
     * @param {Object} theme - Theme configuration
     */
    registerTheme(name, theme) {
        if (this.themes[name]) {
            console.warn(`Theme '${name}' already exists. Overwriting...`);
        }
        this.themes[name] = theme;
    }

    /**
     * Apply a theme to the document
     * @param {string} themeName - Name of the theme to apply
     * @returns {boolean} Success status
     */
    applyTheme(themeName) {
        const theme = this.getTheme(themeName);
        if (!theme) {
            console.error(`Theme '${themeName}' not found`);
            return false;
        }

        const root = document.documentElement;
        Object.entries(theme.cssVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        console.log(`Applied theme: ${theme.name}`);
        return true;
    }

    /**
     * Create a theme preview element
     * @param {string} themeName - Theme to preview
     * @returns {HTMLElement} Preview element
     */
    createThemePreview(themeName) {
        const theme = this.getTheme(themeName);
        if (!theme) return null;

        const preview = document.createElement('div');
        preview.className = 'theme-preview';
        preview.style.cssText = `
            padding: 1rem;
            border-radius: 0.5rem;
            border: 2px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.2s;
        `;

        const colors = document.createElement('div');
        colors.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';

        // Show primary colors
        ['--brand', '--brand-light', '--accent'].forEach(varName => {
            const color = theme.cssVariables[varName];
            const swatch = document.createElement('div');
            swatch.style.cssText = `
                width: 3rem;
                height: 3rem;
                border-radius: 0.375rem;
                background: ${color};
                border: 1px solid rgba(0,0,0,0.1);
            `;
            colors.appendChild(swatch);
        });

        const info = document.createElement('div');
        info.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">${theme.name}</div>
            <div style="font-size: 0.875rem; color: #64748b;">${theme.description}</div>
        `;

        preview.appendChild(colors);
        preview.appendChild(info);

        preview.addEventListener('click', () => {
            this.applyTheme(themeName);
            document.querySelectorAll('.theme-preview').forEach(p => {
                p.style.borderColor = '#e2e8f0';
            });
            preview.style.borderColor = theme.cssVariables['--brand'];
        });

        return preview;
    }

    /**
     * Create a theme selector UI
     * @param {HTMLElement} container - Container to render selector in
     */
    createThemeSelector(container) {
        if (!container) {
            console.error('Container element required for theme selector');
            return;
        }

        const selector = document.createElement('div');
        selector.className = 'theme-selector';
        selector.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            padding: 1rem;
        `;

        this.getThemeNames().forEach(themeName => {
            const preview = this.createThemePreview(themeName);
            if (preview) {
                selector.appendChild(preview);
            }
        });

        container.appendChild(selector);
    }

    /**
     * Generate a random theme based on a primary color
     * @param {string} primaryColor - Hex color code
     * @param {string} themeName - Name for the generated theme
     * @returns {Object} Generated theme object
     */
    generateTheme(primaryColor, themeName = 'custom') {
        // Simple color manipulation (in production, use a proper color library)
        const lighten = (color, percent) => {
            // Simplified - in production use proper color manipulation
            return color;
        };

        const darken = (color, percent) => {
            return color;
        };

        const theme = {
            name: themeName,
            description: 'Custom generated theme',
            cssVariables: {
                '--brand': primaryColor,
                '--brand-light': lighten(primaryColor, 10),
                '--brand-dark': darken(primaryColor, 10),
                '--brand-darker': darken(primaryColor, 20),
                // ... would generate full palette
            }
        };

        return theme;
    }
}

// Usage examples
const themeManager = new ThemeManager();

// Apply a theme
// themeManager.applyTheme('violet');

// Get theme info
// const themes = themeManager.getThemeInfo();
// console.log(themes);

// Create a theme selector
// const container = document.getElementById('theme-selector-container');
// themeManager.createThemeSelector(container);

// Register a custom theme
// themeManager.registerTheme('myCustomTheme', {
//     name: 'My Custom Theme',
//     description: 'A unique custom theme',
//     cssVariables: { ... }
// });

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
} else if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;
}