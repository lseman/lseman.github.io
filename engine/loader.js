/**
 * Educational Template Loader
 * 
 * This script automatically loads all dependencies and initializes
 * the educational template system. Just include this one file!
 * 
 * Usage:
 * <script src="educational-template-loader.js"></script>
 * <script>
 *   EducationalTemplateLoader.init(YOUR_CONFIG);
 * </script>
 */

(function () {
    'use strict';

    const LOADER_VERSION = '2.3.0';

    // Configuration
    const CDN_URLS = {
        tailwind: 'https://cdn.tailwindcss.com',
        prismCSS: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
        prismJS: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js',
        prismCore: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js',
        prismAutoloader: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
        prismPython: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js',
        fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Sora:wght@600;700;800&display=swap',
        lucide: 'https://unpkg.com/lucide@latest',
        mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
    };

    // Track loading state
    let isLoading = false;
    let isLoaded = false;
    let loadPromise = null;

    /**
     * Load a script dynamically
     */
    function loadScript(src, async = false) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            if (async) script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Load a CSS file dynamically
     */
    function loadCSS(href) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            // CSS failures shouldn't block, just resolve anyway
            link.onerror = resolve;
            document.head.appendChild(link);
        });
    }

    /**
     * Inject base styles
     */
    function injectBaseStyles() {
        const style = document.createElement('style');
        style.id = 'educational-template-base-styles';
        style.textContent = `
            /* Educational Template Base Styles v${LOADER_VERSION} */
            ${getBaseCSS()}
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup navigation dropdowns
     */
    function setupNavigationDropdowns() {
        // Close all dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });

        // Handle dropdown toggles
        document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const dropdown = trigger.closest('.nav-dropdown');
                const isActive = dropdown.classList.contains('active');

                // Close all other dropdowns
                document.querySelectorAll('.nav-dropdown.active').forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                dropdown.classList.toggle('active');
            });
        });

        // Keyboard navigation
        document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-dropdown-trigger');
            const menu = dropdown.querySelector('.nav-dropdown-menu');

            if (!menu) return;

            const items = menu.querySelectorAll('.nav-dropdown-item');

            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    if (dropdown.classList.contains('active') && items[0]) {
                        items[0].focus();
                    }
                }
            });

            items.forEach((item, index) => {
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = items[index + 1] || items[0];
                        next.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = items[index - 1] || items[items.length - 1];
                        prev.focus();
                    } else if (e.key === 'Escape') {
                        dropdown.classList.remove('active');
                        trigger.focus();
                    }
                });
            });
        });

        console.log('✅ Navigation dropdowns initialized');
    }

    /**
     * Inject HTML structure
     */
    function injectHTMLStructure() {
        const template = document.createElement('template');
        template.innerHTML = getHTMLTemplate();
        document.body.appendChild(template.content);

        // Setup mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const isExpanded = !mobileMenu.classList.contains('hidden');
                menuBtn.setAttribute('aria-expanded', isExpanded);
            });
        }

        // Initialize toast manager
        window.toast = new ToastManager();

        // Setup theme selector
        setupThemeSelector();

        // Setup scroll behavior for nav
        setupScrollBehavior();

        // Setup reveal animations
        setupRevealAnimations();

        // Setup navigation dropdowns
        setupNavigationDropdowns();
    }

    /**
     * Setup scroll behavior for navigation
     */
    function setupScrollBehavior() {
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('main-nav');
            if (!nav) return;

            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    /**
     * Setup reveal animations with IntersectionObserver
     */
    function setupRevealAnimations() {
        // Create observer for reveal animations
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all elements with reveal class
        const observeReveals = () => {
            const reveals = document.querySelectorAll('.reveal');
            reveals.forEach(el => revealObserver.observe(el));
        };

        // Initial observation
        observeReveals();

        // Re-observe when DOM changes (for dynamically added content)
        const mutationObserver = new MutationObserver(() => {
            observeReveals();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Reveal animations initialized');
    }

    /**
     * Setup theme selector functionality
     */
    function setupThemeSelector() {
        const themeToggle = document.getElementById('theme-toggle');

        if (!themeToggle) {
            console.warn('Theme toggle button not found');
            return;
        }

        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();

            // Check if ThemeManager is available
            if (typeof window.themeManager === 'undefined') {
                console.error('ThemeManager not loaded');
                if (typeof toast !== 'undefined') {
                    toast.error('Theme system not available');
                }
                return;
            }

            // Get available themes
            const themes = window.themeManager.getThemeNames();
            const currentTheme = localStorage.getItem('selectedTheme') || 'violet';

            // Create theme selection dropdown
            const menu = document.createElement('div');
            menu.className = 'absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50';
            menu.style.minWidth = '220px';
            menu.style.maxHeight = '400px';
            menu.style.overflowY = 'auto';

            // Add header
            const header = document.createElement('div');
            header.className = 'px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase';
            header.textContent = 'Select Theme';
            menu.appendChild(header);

            // Add theme options
            themes.forEach(themeName => {
                const theme = window.themeManager.themes[themeName];
                const item = document.createElement('button');
                item.className = 'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between';

                const info = document.createElement('div');
                info.innerHTML = `
                    <div class="font-medium text-sm">${theme.name}</div>
                    <div class="text-xs text-slate-500">${theme.description}</div>
                `;

                const colorPreview = document.createElement('div');
                colorPreview.className = 'w-6 h-6 rounded border border-slate-200 flex-shrink-0';
                colorPreview.style.background = theme.cssVariables['--brand'];

                item.appendChild(info);
                item.appendChild(colorPreview);

                if (themeName === currentTheme) {
                    item.classList.add('bg-slate-50');
                    const checkmark = document.createElement('span');
                    checkmark.className = 'text-violet-600 ml-2';
                    checkmark.innerHTML = '✓';
                    item.appendChild(checkmark);
                }

                item.onclick = () => {
                    window.themeManager.applyTheme(themeName);
                    localStorage.setItem('selectedTheme', themeName);

                    if (typeof toast !== 'undefined') {
                        toast.success(`Theme changed to ${theme.name}`, 2000);
                    }

                    menu.remove();
                };

                menu.appendChild(item);
            });

            // Position menu relative to button
            themeToggle.style.position = 'relative';
            themeToggle.appendChild(menu);

            // Close on click outside
            setTimeout(() => {
                const closeMenu = (e) => {
                    if (!themeToggle.contains(e.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                };
                document.addEventListener('click', closeMenu);
            }, 100);
        });
    }

    // --- MathJax v3 configuration (must be set before loading the script) ---
    window.MathJax = {
        // Only typeset when we tell it to (we inject content dynamically)
        startup: { typeset: false },
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
                        chtml: { linebreaks: { automatic: false }, matchFontHeight: true },
            processEscapes: true,
            packages: { '[+]': ['ams'] } // add AMS environments
        },
        options: {
            // Don't scan code blocks, scripts, styles, etc.
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            // Ignore everything unless it has .mathjax, helps performance & avoids false positives
            ignoreHtmlClass: 'no-mathjax',
            processHtmlClass: 'mathjax'
        }
    };


    /**
     * Load all dependencies
     */
    async function loadDependencies() {
        if (isLoaded) return;
        if (isLoading) return loadPromise;

        isLoading = true;

        loadPromise = (async () => {
            console.log('📚 Educational Template Loader v' + LOADER_VERSION);
            console.log('⏳ Loading dependencies...');

            try {
                // Load CSS dependencies in parallel
                await Promise.all([
                    loadCSS(CDN_URLS.fonts),
                    loadCSS(CDN_URLS.prismCSS)
                ]);

                // Inject base styles
                injectBaseStyles();

                // Inject HTML structure
                injectHTMLStructure();

                // Load JavaScript dependencies in sequence
                await loadScript(CDN_URLS.tailwind);
                await loadScript(CDN_URLS.lucide);

                // Load Prism with autoloader
                await loadScript(CDN_URLS.prismCore);
                await loadScript(CDN_URLS.prismAutoloader);
                console.log('✅ Prism with autoloader initialized');

                // Load MathJax asynchronously and typeset once after it's ready
                loadScript(CDN_URLS.mathjax, true)
                    .then(() => {
                        console.log('✅ MathJax loaded');
                        // Wait for MathJax startup promise, then typeset the current page
                        if (window.MathJax && MathJax.startup && MathJax.typesetPromise) {
                            MathJax.startup.promise.then(() => MathJax.typesetPromise());
                        }
                    })
                    .catch(() => {
                        console.warn('⚠️ MathJax failed to load (optional)');
                    });

                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                    console.log('✅ Lucide icons initialized');
                }

                // Set current year in footer
                const yearEl = document.getElementById('year');
                if (yearEl) {
                    yearEl.textContent = new Date().getFullYear();
                }

                isLoaded = true;
                console.log('✅ All dependencies loaded successfully');

            } catch (error) {
                console.error('❌ Failed to load dependencies:', error);
                throw error;
            }
        })();

        return loadPromise;
    }

    /**
     * Initialize the educational template
     */
    async function init(config) {
        if (!config) {
            throw new Error('EducationalTemplateLoader.init() requires a configuration object');
        }

        // Load dependencies first
        await loadDependencies();

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Make sure EducationalTemplate class is available
        if (typeof EducationalTemplate === 'undefined') {
            console.error('❌ EducationalTemplate class not found. Make sure educational-template-engine.js is loaded before calling init().');
            return null;
        }

        // Initialize ThemeManager if available
        if (typeof ThemeManager !== 'undefined' && !window.themeManager) {
            window.themeManager = new ThemeManager();
            const savedTheme = localStorage.getItem('selectedTheme') || 'violet';
            window.themeManager.applyTheme(savedTheme);
            console.log('✅ Theme Manager initialized with theme:', savedTheme);

            // Inject theme into config if not already present
            if (config && !config.theme) {
                config.theme = window.themeManager.getTheme(savedTheme);
            }
        }

        // Initialize template
        console.log('🚀 Initializing Educational Template');
        const instance = new EducationalTemplate(config);

        // Store global reference
        window.educationalTemplate = instance;

        console.log('✨ Educational Template ready!');
        return instance;
    }

    /**
     * Get base CSS
     */
    function getBaseCSS() {
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --brand: #8b5cf6;
            --brand-light: #a78bfa;
            --brand-dark: #7c3aed;
            --ink: #1e293b;
            --ink-lighter: #475569;
            --surface: #faf5ff;
            --hero-gradient-end: #ede9fe;
            --pattern-color-1: rgba(139, 92, 246, 0.05);
            --pattern-color-2: rgba(167, 139, 250, 0.08);
            --grid-color: rgba(139, 92, 246, 0.03);
            --card-hover-border: rgba(139, 92, 246, 0.3);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
   

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            :root.dark-mode {
                --ink: #f1f5f9;
                --ink-lighter: #cbd5e1;
                --surface: #0f172a;
                --hero-gradient-end: #1e293b;
            }
        }

        html {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: var(--ink);
            background: var(--surface);
            scroll-behavior: smooth;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        body {
            background: linear-gradient(to bottom, #ffffff, #f8fafc);
            min-height: 100vh;
        }

        /* Skip to main content for accessibility */
        .skip-to-content {
            position: absolute;
            top: -100px;
            left: 0;
            background: var(--brand);
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 0 0 0.5rem 0;
            z-index: 100;
            transition: top 0.3s;
        }

        .skip-to-content:focus {
            top: 0;
        }

        /* Loading skeleton */
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s ease-in-out infinite;
            border-radius: 0.5rem;
        }

        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        /* Loading spinner */
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(139, 92, 246, 0.1);
            border-top-color: var(--brand);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Toast notifications */
        .toast-container {
            position: fixed;
            top: 80px;
            right: 1rem;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            max-width: 400px;
        }

        .toast {
            background: white;
            padding: 1rem 1.25rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            display: flex;
            align-items: start;
            gap: 0.75rem;
            border-left: 4px solid var(--brand);
            animation: slideIn 0.3s ease;
            max-width: 100%;
        }

        .toast.success { border-left-color: #10b981; }
        .toast.error { border-left-color: #ef4444; }
        .toast.warning { border-left-color: #f59e0b; }
        .toast.info { border-left-color: #06b6d4; }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        .toast.hiding {
            animation: slideOut 0.3s ease forwards;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Sora', 'Inter', sans-serif;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: var(--ink);
        }

        h1 { font-size: clamp(2.5rem, 5vw, 3.5rem) !important; line-height: 1.1 !important; }
        h2 { font-size: clamp(2rem, 4vw, 2.5rem) !important; line-height: 1.2 !important; }
        h3 { font-size: clamp(1.25rem, 2.5vw, 1.5rem) !important; line-height: 1.3 !important; }

        .mono {
            font-family: 'JetBrains Mono', 'Consolas', monospace;
            letter-spacing: -0.01em;
        }

        .container {
            max-width: 75rem;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        /* Enhanced navigation */
        #main-nav {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;
        }

        #main-nav.scrolled {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: var(--shadow-md);
        }

        #main-nav a {
            position: relative;
            color: var(--ink-lighter);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        #main-nav a::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--brand);
            transition: width 0.3s ease;
        }

        #main-nav a:hover {
            color: var(--brand);
        }

        #main-nav a:hover::after {
            width: 100%;
        }

        #main-nav a[aria-current="page"] {
            color: var(--brand-dark);
            font-weight: 600;
        }

        /* Dark mode toggle */
        .theme-toggle {
            width: 40px;
            height: 40px;
            border-radius: 0.5rem;
            border: 1px solid rgba(15, 23, 42, 0.1);
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .theme-toggle:hover {
            background: var(--surface);
            border-color: var(--brand);
        }

        #hero {
            background: linear-gradient(135deg, #f8fafc 0%, var(--hero-gradient-end) 100%);
            position: relative;
            overflow: hidden;
        }

        .hero-pattern {
            position: absolute;
            inset: 0;
            background-image: 
                radial-gradient(circle at 20% 10%, var(--pattern-color-1), transparent 40%), 
                radial-gradient(circle at 80% 30%, var(--pattern-color-2), transparent 35%);
        }

        .grid-lines {
            position: absolute;
            inset: 0;
            background-size: 40px 40px;
            background-image: 
                linear-gradient(to right, var(--grid-color) 1px, transparent 1px), 
                linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
            mask-image: radial-gradient(circle at 50% 30%, black 30%, transparent 70%);
            -webkit-mask-image: radial-gradient(circle at 50% 30%, black 30%, transparent 70%);
        }

        /* Enhanced cards */
        .card {
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 1rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            position: relative;
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--brand), var(--brand-light));
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--card-hover-border);
        }

        .card:hover::before {
            transform: scaleX(1);
        }

        .card-header {
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
            padding: 1rem 1.5rem;
            background: var(--surface);
        }

        /* Icon badge styles */
        .icon-badge {
            width: 2rem;
            height: 2rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            background: var(--brand);
            color: white;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.5rem 0.875rem;
            background: white;
            border: 1px solid rgba(15, 23, 42, 0.12);
            border-radius: 0.5rem;
            font-size: 0.8125rem;
            font-weight: 500;
            color: var(--ink-lighter);
            box-shadow: var(--shadow-sm);
            transition: all 0.25s ease;
        }

        .badge:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            border-color: var(--brand);
            color: var(--brand);
        }

        .badge-cyan { background: #cffafe; color: #0e7490; border-color: #a5f3fc; }
        .badge-teal { background: #ccfbf1; color: #115e59; border-color: #99f6e4; }
        .badge-blue { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
        .badge-slate { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
        .badge-amber { background: #fef3c7; color: #92400e; border-color: #fde68a; }
        .badge-emerald { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
        .badge-purple { background: #f3e8ff; color: #6b21a8; border-color: #e9d5ff; }

        /* Enhanced buttons with icons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.9375rem;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .btn:active::before {
            width: 300px;
            height: 300px;
        }

        .btn-primary {
            background: var(--brand);
            color: white;
            box-shadow: var(--shadow-md);
        }

        .btn-primary:hover {
            background: var(--brand-dark);
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
            background: white;
            color: var(--ink);
            border: 1px solid rgba(15, 23, 42, 0.15);
            box-shadow: var(--shadow-sm);
        }

        .btn-secondary:hover {
            transform: translateY(-2px);
            border-color: var(--brand);
            color: var(--brand);
            box-shadow: var(--shadow-md);
        }

        .btn-outline {
            background: transparent;
            color: var(--brand);
            border: 2px solid var(--brand);
        }

        .btn-outline:hover {
            background: var(--brand);
            color: white;
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .icon-box {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            background: var(--brand);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            box-shadow: var(--shadow-md);
            transition: all 0.3s ease;
        }

        .card:hover .icon-box {
            transform: scale(1.05) rotate(5deg);
            box-shadow: var(--shadow-lg);
        }

        section {
            padding: 5rem 0;
            position: relative;
        }

        section:nth-child(odd) {
            background: white;
        }

        section:nth-child(even) {
            background: var(--surface);
        }

        .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .reveal.show {
            opacity: 1;
            transform: translateY(0);
        }

        .brand-text {
            color: var(--brand);
        }

        /* Enhanced check list with icons */
        .check-list {
            list-style: none;
            padding: 0;
        }

        .check-list li {
            display: -webkit-box;
            gap: 0.75rem;
            padding: 0.5rem 0;
            align-items: flex-start;
        }

        .check-list li::before {
            content: "✓";
            color: var(--brand);
            font-weight: bold;
            flex-shrink: 0;
            width: 1.25rem;
            height: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--surface);
            border-radius: 0.25rem;
        }

        pre[class*="language-"] {
            border-radius: 0.75rem;
            border: 1px solid rgba(15, 23, 42, 0.08);
            font-size: 0.8rem !important;
            position: relative;
        }

        pre[class*="language-"] code {
            font-size: 0.8rem !important;
            line-height: 1.6;
        }

        /* Copy button for code blocks */
        .code-block-wrapper {
            position: relative;
        }

        .copy-code-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 0.375rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .code-block-wrapper:hover .copy-code-btn {
            opacity: 1;
        }

        footer {
            background: linear-gradient(to bottom, #0f172a, #020617);
            color: #cbd5e1;
            border-top: 1px solid #1e293b;
            position: relative;
        }

        footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--brand) 0%, var(--brand-light) 100%);
            opacity: 0.6;
        }

        *:focus-visible {
            outline: 2px solid var(--brand);
            outline-offset: 2px;
            border-radius: 0.25rem;
        }

        #mobile-menu {
            background: white;
            border-top: 1px solid rgba(15, 23, 42, 0.08);
        }

        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }
            
            section {
                padding: 3rem 0;
            }

            .toast-container {
                right: 0.5rem;
                left: 0.5rem;
                max-width: none;
            }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        ::-webkit-scrollbar-track {
            background: var(--surface);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--brand);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--brand-dark);
        }

        /* Watermark animations */
        .watermark {
            position: absolute;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            font-size: clamp(1.5rem, 4vw, 3rem);
            color: var(--brand);
            opacity: 0.04;
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
        }

        .watermark-1 {
            top: 10%;
            left: 5%;
            transform: rotate(-15deg);
            animation: float-1 20s ease-in-out infinite;
        }

        .watermark-2 {
            top: 25%;
            right: 10%;
            transform: rotate(12deg);
            animation: float-2 18s ease-in-out infinite;
        }

        .watermark-3 {
            top: 50%;
            left: 15%;
            transform: rotate(-8deg);
            animation: float-3 22s ease-in-out infinite;
        }

        .watermark-4 {
            top: 60%;
            right: 20%;
            transform: rotate(18deg);
            animation: float-4 19s ease-in-out infinite;
        }

        .watermark-5 {
            top: 35%;
            left: 45%;
            transform: rotate(-20deg);
            animation: float-5 21s ease-in-out infinite;
        }

        @keyframes float-1 {
            0%, 100% { transform: rotate(-15deg) translateY(0px); }
            50% { transform: rotate(-12deg) translateY(-15px); }
        }

        @keyframes float-2 {
            0%, 100% { transform: rotate(12deg) translateY(0px); }
            50% { transform: rotate(15deg) translateY(-12px); }
        }

        @keyframes float-3 {
            0%, 100% { transform: rotate(-8deg) translateY(0px); }
            50% { transform: rotate(-5deg) translateY(-18px); }
        }

        @keyframes float-4 {
            0%, 100% { transform: rotate(18deg) translateY(0px); }
            50% { transform: rotate(20deg) translateY(-10px); }
        }

        @keyframes float-5 {
            0%, 100% { transform: rotate(-20deg) translateY(0px); }
            50% { transform: rotate(-18deg) translateY(-14px); }
        }

        .complexity-table {
            width: 100%;
            border-collapse: collapse;
        }

        .complexity-table th,
        .complexity-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .complexity-table th {
            background: var(--surface);
            font-weight: 600;
            color: var(--ink);
        }

        .complexity-table tr:hover {
            background: var(--surface);
        }

        /* Simulator Styles */
        .array-visual {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            justify-content: center;
            margin: 1.5rem 0;
        }

        .array-item {
            width: 3rem;
            height: 3rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border: 2px solid var(--brand);
            border-radius: 0.5rem;
            font-weight: 600;
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.3s ease;
        }

        .array-item.pivot {
            background: #fef3c7;
            border-color: #f59e0b;
            transform: scale(1.1);
        }

        .array-item.comparing {
            background: #dbeafe;
            border-color: #3b82f6;
        }

        .array-item.swapping {
            background: #fecaca;
            border-color: #ef4444;
            animation: shake 0.3s ease;
        }

        .array-item.sorted {
            background: #d1fae5;
            border-color: #10b981;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .log-container {
            max-height: 400px;
            overflow-y: auto;
            background: #1e293b;
            border-radius: 0.75rem;
            padding: 1rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8125rem;
        }

        .log-entry {
            padding: 0.5rem;
            margin: 0.25rem 0;
            border-left: 3px solid transparent;
            color: #cbd5e1;
        }

        .log-entry.info {
            border-left-color: #06b6d4;
            color: #a5f3fc;
        }

        .log-entry.success {
            border-left-color: #10b981;
            color: #6ee7b7;
        }

        .log-entry.warning {
            border-left-color: #f59e0b;
            color: #fcd34d;
        }

        .log-entry.error {
            border-left-color: #ef4444;
            color: #fca5a5;
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .control-group label {
            font-weight: 500;
            font-size: 0.875rem;
            color: var(--ink);
        }

        .control-group select,
        .control-group input {
            padding: 0.625rem;
            border: 1px solid rgba(15, 23, 42, 0.15);
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.3s ease;
        }

        .control-group select:focus,
        .control-group input:focus {
            outline: none;
            border-color: var(--brand);
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .stat-box {
            background: var(--surface);
            padding: 1rem;
            border-radius: 0.5rem;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat-box:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-sm);
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--ink-lighter);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--brand);
            font-family: 'JetBrains Mono', monospace;
        }

        /* Screen reader only class */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        /* Print styles */
        @media print {
            .no-print {
                display: none !important;
            }
            
            body {
                background: white;
            }
            
            .card {
                break-inside: avoid;
            }
        }

        /* FIXED HAMBURGER MENU CSS - Replace the previous version */

/* Menu Button (Desktop) */
.nav-menu-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: white;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 0.5rem;
    color: var(--ink-lighter);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-menu-button:hover {
    background: var(--surface);
    border-color: var(--brand);
    color: var(--brand);
}

/* Backdrop (separate element, lower z-index) */
.nav-menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    z-index: 999;
}

.nav-menu-backdrop.active {
    opacity: 1;
    visibility: visible;
}

/* Menu Panel (Slide-out, higher z-index) */
.nav-menu-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    max-width: 90vw;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
}

.nav-menu-panel.active {
    right: 0;
}

/* Menu Header */
.nav-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: var(--surface);
}

.nav-menu-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--ink-lighter);
    transition: color 0.3s ease;
    border-radius: 0.375rem;
}

.nav-menu-close:hover {
    color: var(--brand);
    background: rgba(139, 92, 246, 0.1);
}

/* Menu Content */
.nav-menu-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.nav-menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    color: var(--ink);
    text-decoration: none;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
    margin-bottom: 0.25rem;
}

.nav-menu-item:hover {
    background: var(--surface);
    color: var(--brand);
    transform: translateX(4px);
}

.nav-menu-item i {
    opacity: 0.7;
}

.nav-menu-item:hover i {
    opacity: 1;
}

/* Mobile adjustments */
@media (max-width: 768px) {
    .nav-menu-button {
        display: none; /* Use mobile hamburger instead */
    }
    
    .nav-menu-panel {
        width: 100%;
        max-width: 100%;
    }
}

/* Hide desktop nav links container on mobile */
@media (min-width: 769px) {
    #mobile-menu {
        display: none !important;
    }
}
        `;
    }

    /**
     * Get HTML template
     */
    function getHTMLTemplate() {
        return `
            <!-- Skip to main content for accessibility -->
            <a href="#main-content" class="skip-to-content">Skip to main content</a>

            <!-- Toast notification container -->
            <div id="toast-container" class="toast-container" role="status" aria-live="polite"></div>

            <!-- Loading overlay -->
            <div id="loading-overlay" class="fixed inset-0 bg-white z-50 flex items-center justify-center" style="display: none;">
                <div class="text-center">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-slate-600">Loading...</p>
                </div>
            </div>

            <nav id="main-nav" class="fixed top-0 left-0 right-0 z-50 no-print" role="navigation" aria-label="Main navigation">
                <div class="container">
                    <div class="flex items-center justify-between py-3">
                        <div class="flex items-center gap-3">
                            <div id="nav-logo" class="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold mono">
                                <span id="nav-logo-text">ED</span>
                            </div>
                            <span id="nav-title" class="text-lg font-semibold brand-text font-display">Education</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <div id="nav-links" class="hidden md:flex items-center gap-6 text-sm mono">
                                <!-- Populated by JS -->
                            </div>
                            <button id="theme-toggle" class="theme-toggle no-print" aria-label="Toggle dark mode" title="Toggle theme">
                                <i data-lucide="sun" class="w-5 h-5"></i>
                            </button>
                            <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg hover:bg-slate-100" aria-label="Toggle menu" aria-expanded="false">
                                <i data-lucide="menu" class="w-6 h-6"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="mobile-menu" class="hidden md:hidden pb-4">
                    <div class="container space-y-2">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </nav>

            <div style="height: 64px;" aria-hidden="setupNavigationDropdownstrue"></div>

            <header id="hero" class="relative py-20 min-h-[60vh] flex items-center" role="banner">
                <div class="hero-pattern" aria-hidden="true"></div>
                <div class="grid-lines" aria-hidden="true"></div>
                
                <div id="watermarks-container" aria-hidden="true">
                    <!-- Watermarks populated by JS -->
                </div>
                
                <div class="container relative z-10">
                    <div class="max-w-4xl">
                        <h1 id="hero-title" class="font-display mb-6 reveal show">
                            Welcome to Education
                        </h1>
                        <p id="hero-subtitle" class="text-xl text-slate-600 mb-8 leading-relaxed reveal show" style="animation-delay: 0.1s;">
                            Learn and master new concepts with interactive examples.
                        </p>
                        <div id="hero-nav" class="flex flex-wrap gap-3 reveal show" style="animation-delay: 0.2s;">
                            <!-- Populated by JS -->
                        </div>
                    </div>
                </div>
            </header>

            <main id="main-content" role="main">
                <!-- Sections populated by JS -->
            </main>

            <footer class="py-12 relative no-print" role="contentinfo">
                <div class="container">
                    <div class="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 id="footer-title" class="text-lg font-semibold mb-4 brand-text font-display">Education</h3>
                            <p id="footer-description" class="text-sm text-slate-400 leading-relaxed">
                                Learn and master new concepts.
                            </p>
                        </div>
                        <nav aria-label="Footer navigation">
                            <h4 class="text-sm font-semibold mb-4 text-slate-300">Quick Links</h4>
                            <div id="footer-links" class="space-y-2">
                                <!-- Populated by JS -->
                            </div>
                        </nav>
                        <div>
                            <h4 class="text-sm font-semibold mb-4 text-slate-300">Learning Resources</h4>
                            <div id="footer-resources" class="flex gap-3">
                                <!-- Populated by JS -->
                            </div>
                        </div>
                    </div>
                    <div class="pt-8 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p class="text-sm text-slate-400">
                            © <span id="year"></span> <span id="footer-copyright"></span>. Educational resource.
                        </p>
                        <div class="flex gap-6">
                            <a class="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2" href="#hero">
                                <i data-lucide="arrow-up" class="w-4 h-4"></i>
                                Back to top
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    /**
     * Toast Manager Class
     */
    class ToastManager {
        constructor() {
            this.container = document.getElementById('toast-container');
        }

        show(message, type = 'info', duration = 3000) {
            if (!this.container) return;

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;

            const iconMap = {
                success: 'check-circle',
                error: 'x-circle',
                warning: 'alert-triangle',
                info: 'info'
            };

            toast.innerHTML = `
                <i data-lucide="${iconMap[type]}" class="w-5 h-5 flex-shrink-0"></i>
                <div class="flex-1">
                    <p class="text-sm font-medium text-slate-900">${message}</p>
                </div>
                <button class="ml-2 text-slate-400 hover:text-slate-600" onclick="this.parentElement.classList.add('hiding'); setTimeout(() => this.parentElement.remove(), 300)">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            `;

            this.container.appendChild(toast);

            // Initialize Lucide icons in toast
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            if (duration > 0) {
                setTimeout(() => {
                    toast.classList.add('hiding');
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            }

            return toast;
        }

        success(message, duration) { return this.show(message, 'success', duration); }
        error(message, duration) { return this.show(message, 'error', duration); }
        warning(message, duration) { return this.show(message, 'warning', duration); }
        info(message, duration) { return this.show(message, 'info', duration); }
    }

    // Expose public API
    window.EducationalTemplateLoader = {
        version: LOADER_VERSION,
        init: init,
        loadDependencies: loadDependencies
    };

    console.log('📦 Educational Template Loader v' + LOADER_VERSION + ' ready');

})();