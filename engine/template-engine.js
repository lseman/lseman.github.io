/**
 * Enhanced Educational Template Engine
 * Generic template system for educational content with improved performance,
 * extensibility, and error handling - fully backward compatible
 * @version 2.1.1 - Fixed output display bug
 */
class EducationalTemplate {
    constructor(config) {
        if (!config) {
            throw new Error('EducationalTemplate: Configuration is required');
        }

        this.config = this.validateConfig(config);
        this.simulatorState = null;
        this.observers = []; // Track observers for cleanup
        this.intervals = []; // Track intervals for cleanup
        this.scrollTimeout = null;

        // Extensible content renderers - users can add custom types
        this.contentRenderers = {
            'cards': this.renderCards.bind(this),
            'images': this.renderImages.bind(this),
            'code-examples': this.renderCodeExamples.bind(this),
            'code-blocks': this.renderCodeExamples.bind(this), // Alias for code-examples
            'simulator': this.renderSimulator.bind(this),
            'analysis': this.renderAnalysis.bind(this),
            'exercises': this.renderExercises.bind(this),
            'visual-tutorial': this.renderVisualTutorial.bind(this)
        };

        // Extensible algorithm registry for simulators
        this.algorithms = {};

        // Pyodide instance (lazy loaded)
        this.pyodide = null;
        this.pyodideLoading = false;
        this.pyodideLoadPromise = null;

        this.init();
    }

    /**
     * Register a custom algorithm for use in simulators
     * @param {string} name - Algorithm identifier
     * @param {Function} algorithm - Algorithm implementation
     */
    registerAlgorithm(name, algorithm) {
        this.algorithms[name] = algorithm;
    }

    /**
     * Register a custom content renderer
     * @param {string} type - Content type identifier
     * @param {Function} renderer - Renderer function
     */
    registerContentRenderer(type, renderer) {
        this.contentRenderers[type] = renderer.bind(this);
    }

    /**
     * Initialize Pyodide for running Python code
     * Lazy loads Pyodide only when needed
     */
    async initPyodide() {
        if (this.pyodide) {
            return this.pyodide;
        }

        if (this.pyodideLoadPromise) {
            return this.pyodideLoadPromise;
        }

        this.pyodideLoading = true;

        this.pyodideLoadPromise = (async () => {
            try {
                // Load Pyodide from CDN
                if (typeof loadPyodide === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
                    document.head.appendChild(script);

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                    });
                }

                this.pyodide = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
                });

                console.log('✅ Pyodide loaded successfully');
                await this.pyodide.loadPackage("statsmodels");
                await this.pyodide.loadPackage("scikit-learn");
                this.pyodideLoading = false;
                return this.pyodide;
            } catch (error) {
                console.error('❌ Failed to load Pyodide:', error);
                this.pyodideLoading = false;
                throw error;
            }
        })();

        return this.pyodideLoadPromise;
    }

    /**
     * Run Python code using Pyodide
     * @param {string} code - Python code to execute
     * @param {HTMLElement} outputElement - Element to display output
     */
    async runPythonCode(code, outputElement) {
        if (!outputElement) {
            console.error('Output element not provided');
            return;
        }

        // Show loading state
        outputElement.innerHTML = `
            <div class="flex items-center gap-2 text-cyan-600">
                <div class="animate-spin h-4 w-4 border-2 border-cyan-600 border-t-transparent rounded-full"></div>
                <span>Loading Python environment...</span>
            </div>
        `;

        try {
            // Initialize Pyodide if not already loaded
            const pyodide = await this.initPyodide();

            // Clear output
            outputElement.innerHTML = '';

            // Capture stdout
            await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
            `);

            // Run the user's code
            try {
                await pyodide.runPythonAsync(code);

                // Get stdout content
                const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
                const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

                if (stdout) {
                    const outputDiv = document.createElement('div');
                    outputDiv.className = 'text-emerald-600 whitespace-pre-wrap font-mono text-sm';
                    outputDiv.textContent = stdout;
                    outputElement.appendChild(outputDiv);
                }

                if (stderr) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-amber-600 whitespace-pre-wrap font-mono text-sm mt-2';
                    errorDiv.textContent = stderr;
                    outputElement.appendChild(errorDiv);
                }

                if (!stdout && !stderr) {
                    outputElement.innerHTML = '<div class="text-slate-500 text-sm italic">Code executed successfully (no output)</div>';
                }

            } catch (error) {
                // Python execution error
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-red-600 whitespace-pre-wrap font-mono text-sm';
                errorDiv.textContent = `Error: ${error.message}`;
                outputElement.innerHTML = '';
                outputElement.appendChild(errorDiv);
            }

        } catch (error) {
            // Pyodide loading error
            outputElement.innerHTML = `
                <div class="text-red-600 text-sm">
                    <strong>Failed to load Python environment:</strong><br>
                    ${error.message}
                </div>
            `;
        }
    }

    /**
     * Validate configuration and warn about missing required fields
     */
    validateConfig(config) {
        const required = ['meta', 'sections', 'hero', 'footer'];
        const missing = required.filter(key => !config[key]);

        if (missing.length) {
            console.warn(`EducationalTemplate: Missing config keys: ${missing.join(', ')}`);
        }

        // Set defaults for optional fields
        return {
            ...config,
            theme: config.theme || {},
            sections: config.sections || [],
            hero: {
                watermarks: [],
                quickLinks: [],
                ...config.hero
            },
            footer: {
                links: [],
                resources: [],
                ...config.footer
            }
        };
    }

    init() {
        try {
            this.applyTheme();
            this.renderMetadata();
            this.renderNavigation();
            this.renderHero();
            this.renderSections();
            this.renderFooter();
            this.setupEventListeners();
            this.observeReveals();
            this.initSyntaxHighlighting();

            const yearEl = document.getElementById('year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        } catch (error) {
            console.error('EducationalTemplate: Initialization error', error);
        }
    }

    applyTheme() {
        const { theme } = this.config;

        // Apply CSS variables
        if (theme.cssVariables) {
            const root = document.documentElement;
            Object.entries(theme.cssVariables).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }

        // Apply Tailwind config if needed
        if (theme.tailwindExtend && typeof tailwind !== 'undefined') {
            tailwind.config = {
                theme: {
                    extend: theme.tailwindExtend
                }
            };
        }
    }

    renderMetadata() {
        const { meta } = this.config;
        if (!meta) return;

        document.title = meta.title || 'Educational Template';

        // Update meta tags
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = meta.description || '';

        // Update navigation branding
        const logoEl = document.getElementById('nav-logo-text');
        const titleEl = document.getElementById('nav-title');

        if (logoEl) logoEl.textContent = meta.logo || '';
        if (titleEl) titleEl.textContent = meta.brand || '';
    }

    /**
 * FIXED HAMBURGER MENU - Replace renderNavigation() in EducationalTemplate
 */

    renderNavigation() {
        const navLinks = document.getElementById('nav-links');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!navLinks || !mobileMenu) return;

        // Clear existing
        navLinks.innerHTML = '';
        mobileMenu.innerHTML = '';

        // Desktop: Just show a menu button
        const menuButton = document.createElement('button');
        menuButton.className = 'nav-menu-button';
        menuButton.id = 'desktop-menu-btn';
        menuButton.setAttribute('aria-label', 'Open navigation menu');
        menuButton.innerHTML = `
        <i data-lucide="menu" class="w-5 h-5"></i>
        <span>Menu</span>
    `;
        navLinks.appendChild(menuButton);

        // Create backdrop (separate element)
        const backdrop = document.createElement('div');
        backdrop.className = 'nav-menu-backdrop';
        backdrop.id = 'nav-menu-backdrop';
        document.body.appendChild(backdrop);

        // Create the slide-out menu panel
        const menuPanel = document.createElement('div');
        menuPanel.className = 'nav-menu-panel';
        menuPanel.id = 'nav-menu-panel';

        const panelHeader = document.createElement('div');
        panelHeader.className = 'nav-menu-header';
        panelHeader.innerHTML = `
        <h3 class="font-semibold text-lg">Navigation</h3>
        <button class="nav-menu-close" id="menu-close-btn" aria-label="Close menu">
            <i data-lucide="x" class="w-6 h-6"></i>
        </button>
    `;
        menuPanel.appendChild(panelHeader);

        const menuContent = document.createElement('div');
        menuContent.className = 'nav-menu-content';

        // Add all sections to the menu
        this.config.sections.forEach(section => {
            const item = document.createElement('a');
            item.href = `#${section.id}`;
            item.className = 'nav-menu-item';

            const icon = this.extractIcon(section.icon);
            if (icon) {
                const iconEl = document.createElement('i');
                iconEl.setAttribute('data-lucide', icon);
                iconEl.className = 'w-5 h-5';
                item.appendChild(iconEl);
            }

            const label = document.createElement('span');
            label.textContent = section.title;
            item.appendChild(label);

            menuContent.appendChild(item);
        });

        menuPanel.appendChild(menuContent);
        document.body.appendChild(menuPanel);

        // Mobile: Use existing mobile menu structure
        this.config.sections.forEach(section => {
            const item = document.createElement('a');
            item.href = `#${section.id}`;
            item.className = 'flex items-center gap-3 py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors';

            const icon = this.extractIcon(section.icon);
            if (icon) {
                const iconEl = document.createElement('i');
                iconEl.setAttribute('data-lucide', icon);
                iconEl.className = 'w-5 h-5';
                item.appendChild(iconEl);
            }

            const label = document.createElement('span');
            label.textContent = section.title;
            item.appendChild(label);

            mobileMenu.appendChild(item);
        });

        // Initialize icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 50);

        // Setup menu interactions
        this.setupMenuPanel();
    }

    setupMenuPanel() {
        const menuBtn = document.getElementById('desktop-menu-btn');
        const closeBtn = document.getElementById('menu-close-btn');
        const panel = document.getElementById('nav-menu-panel');
        const backdrop = document.getElementById('nav-menu-backdrop');

        if (!panel || !backdrop) return;

        // Open menu
        const openMenu = () => {
            panel.classList.add('active');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        // Close menu
        const closeMenu = () => {
            panel.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (menuBtn) {
            menuBtn.addEventListener('click', openMenu);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        // Close on backdrop click
        backdrop.addEventListener('click', closeMenu);

        // Close on link click
        panel.querySelectorAll('.nav-menu-item').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    extractIcon(iconText) {
        if (!iconText) return null;

        const iconMap = {
            '📚': 'book-open', '📖': 'book',
            '🎯': 'target', '✅': 'check-circle',
            '💻': 'code', '⌨️': 'code',
            '🏠': 'home',
            'ℹ️': 'info', '❓': 'help-circle',
            '⚡': 'zap', '🚀': 'rocket',
            '🎓': 'graduation-cap',
            '📊': 'bar-chart', '📈': 'trending-up',
            '🔬': 'microscope',
            '🎨': 'palette',
            '📝': 'edit',
            '⚙️': 'settings',
            '📁': 'folder',
            '🔍': 'search'
        };

        return iconMap[iconText] || null;
    }

    // Backward compatibility
    createNavLink(section, isMobile = false) {
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.textContent = section.title;
        link.className = isMobile
            ? 'flex items-center gap-2 py-2'
            : 'flex items-center gap-2';
        return link;
    }

    renderHero() {
        const { hero } = this.config;
        if (!hero) return;

        const titleEl = document.getElementById('hero-title');
        const subtitleEl = document.getElementById('hero-subtitle');

        if (titleEl) titleEl.textContent = hero.title || '';
        if (subtitleEl) subtitleEl.textContent = hero.subtitle || '';

        // Render watermarks
        if (hero.watermarks) {
            const container = document.getElementById('watermarks-container');
            if (container) {
                hero.watermarks.forEach((text, i) => {
                    const watermark = document.createElement('div');
                    watermark.className = `watermark watermark-${i + 1}`;
                    watermark.textContent = text;
                    watermark.setAttribute('aria-hidden', 'true');
                    container.appendChild(watermark);
                });
            }
        }

        // Render quick links
        const heroNav = document.getElementById('hero-nav');
        if (heroNav && hero.quickLinks) {
            hero.quickLinks.forEach(link => {
                const btn = document.createElement('a');
                btn.href = link.href;
                btn.className = `btn btn-${link.style}`;
                btn.textContent = link.text;
                btn.setAttribute('aria-label', link.text);
                heroNav.appendChild(btn);
            });
        }
    }

    renderFooter() {
        const { footer } = this.config;
        if (!footer) return;

        const titleEl = document.getElementById('footer-title');
        const descEl = document.getElementById('footer-description');
        const copyrightEl = document.getElementById('footer-copyright');

        if (titleEl) titleEl.textContent = footer.title || '';
        if (descEl) descEl.textContent = footer.description || '';
        if (copyrightEl) copyrightEl.textContent = footer.copyright || '';

        // Footer links
        const footerLinks = document.getElementById('footer-links');
        if (footerLinks && footer.links) {
            footer.links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.href;
                a.className = 'block text-sm text-slate-400 hover:text-cyan-400 transition-colors';
                a.textContent = link.text;
                footerLinks.appendChild(a);
            });
        }

        // Footer resources
        const footerResources = document.getElementById('footer-resources');
        if (footerResources && footer.resources) {
            footer.resources.forEach(resource => {
                const a = document.createElement('a');
                a.href = resource.href;
                a.className = 'w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors';
                a.innerHTML = `<span aria-label="${resource.label || 'Resource'}">${resource.emoji}</span>`;
                footerResources.appendChild(a);
            });
        }
    }

    renderSections() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        this.config.sections.forEach(section => {
            const sectionEl = document.createElement('section');
            sectionEl.id = section.id;
            sectionEl.setAttribute('aria-labelledby', `${section.id}-heading`);

            const container = document.createElement('div');
            container.className = 'container';

            const header = document.createElement('h2');
            header.id = `${section.id}-heading`;
            header.className = 'font-display mb-12 reveal';
            header.innerHTML = `${section.icon} ${section.title}`;
            container.appendChild(header);

            const contentEl = this.renderContent(section.content);
            container.appendChild(contentEl);

            sectionEl.appendChild(container);
            mainContent.appendChild(sectionEl);
        });
    }

    renderContent(content) {
        const wrapper = document.createElement('div');

        if (!content || !content.type) {
            console.warn('EducationalTemplate: Invalid content structure');
            return wrapper;
        }

        const renderer = this.contentRenderers[content.type];

        if (!renderer) {
            console.warn(`EducationalTemplate: Unknown content type: ${content.type}`);
            return wrapper;
        }

        return renderer(content, wrapper);
    }

    // ========================================================================
    // CONTENT RENDERERS
    // ========================================================================

    renderCards(content, wrapper) {
        wrapper.className = content.layout === 'grid-2'
            ? 'grid md:grid-cols-2 gap-6'
            : 'grid md:grid-cols-3 gap-6';

        if (content.items) {
            content.items.forEach(item => {
                wrapper.appendChild(this.createCard(item));
            });
        }

        return wrapper;
    }

    renderImages(content, wrapper) {
        wrapper.className = 'grid md:grid-cols-1 gap-6';

        if (content.items) {
            content.items.forEach(item => {
                const img = document.createElement('img');
                img.alt = item.alt || '';
                img.className = 'rounded-lg shadow-lg reveal';

                // Enhanced GIF handling with configurable refresh
                if (item.src.endsWith('.gif')) {
                    const baseSrc = item.src.split('?')[0];
                    img.src = `${baseSrc}?t=${Date.now()}`;

                    img.addEventListener('load', () => {
                        const refreshInterval = item.refreshInterval ||
                            this.config.theme?.gifRefreshInterval ||
                            6000;
                        const interval = setInterval(() => {
                            img.src = `${baseSrc}?t=${Date.now()}`;
                        }, refreshInterval);
                        this.intervals.push(interval);
                    }, { once: true });
                } else {
                    img.src = item.src;
                }

                wrapper.appendChild(img);
            });
        }

        return wrapper;
    }

    renderCodeExamples(content, wrapper) {
        wrapper.className = 'space-y-8';

        if (content.items) {
            content.items.forEach(item => {
                wrapper.appendChild(this.createCodeExample(item));
            });
        }

        return wrapper;
    }

    renderSimulator(content, wrapper) {
        wrapper.appendChild(this.createSimulator(content));
        return wrapper;
    }

    renderAnalysis(content, wrapper) {
        wrapper.appendChild(this.createAnalysis(content));
        return wrapper;
    }

    renderExercises(content, wrapper) {
        wrapper.className = 'space-y-6';

        if (content.items) {
            content.items.forEach(item => {
                wrapper.appendChild(this.createExercise(item));
            });
        }

        return wrapper;
    }

    /**
     * Render Visual Tutorial - Step-by-step algorithm visualization
     * Supports arrays, trees, graphs with customizable highlighting
     */
    renderVisualTutorial(content, wrapper) {
        const container = document.createElement('div');
        container.className = 'card reveal';

        const header = document.createElement('div');
        header.className = 'card-header';
        const headerTitle = document.createElement('h3');
        headerTitle.className = 'font-display text-lg';
        headerTitle.textContent = content.title || 'Visual Tutorial';
        header.appendChild(headerTitle);
        container.appendChild(header);

        const body = document.createElement('div');
        body.className = 'p-8';

        if (content.description) {
            // Helper: format Markdown-style bold (**text**) to <b>text</b>
            const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            const desc = document.createElement('p');
            desc.className = 'text-slate-600 mb-8 leading-relaxed';
            desc.innerHTML = formatBold(content.description);
            body.appendChild(desc);
        }

        // Render each step
        if (content.steps && content.steps.length > 0) {
            content.steps.forEach(step => {
                const stepDiv = this.createTutorialStep(step, content);
                body.appendChild(stepDiv);
            });
        }

        // Insight box at the end
        if (content.insight) {
            const insightBox = this.createInsightBox(content.insight);
            body.appendChild(insightBox);
        }

        container.appendChild(body);
        wrapper.appendChild(container);
        return wrapper;
    }

    // ========================================================================
    // VISUAL TUTORIAL HELPERS
    // ========================================================================

    /**
     * Create a single tutorial step with visualization
     */
    createTutorialStep(step, tutorialContent) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'mb-12 pb-8 border-b border-slate-200 last:border-b-0';

        // Step header
        const stepHeader = document.createElement('div');
        stepHeader.className = 'flex items-center gap-4 mb-4';

        const badge = document.createElement('span');
        badge.className = `badge badge-${step.badgeColor || 'cyan'} mono`;
        badge.textContent = step.badge || `Step ${step.stepNumber || ''}`;
        stepHeader.appendChild(badge);

        const title = document.createElement('h4');
        title.className = 'text-lg font-semibold text-slate-900';
        title.textContent = step.title || '';
        stepHeader.appendChild(title);

        stepDiv.appendChild(stepHeader);

        // Step description
        if (step.description) {
            // Helper: format Markdown-style bold (**text**) to <b>text</b>
            const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            const description = document.createElement('p');
            description.className = 'text-sm text-slate-600 mb-6 leading-relaxed';
            description.innerHTML = formatBold(step.description);
            stepDiv.appendChild(description);
        }

        // Visualization based on type
        const vizType = step.visualizationType || tutorialContent.visualizationType || 'array';
        let viz;

        switch (vizType) {
            case 'array':
                viz = this.createArrayVisualization(step);
                break;
            case 'tree':
                viz = this.createTreeVisualization(step);
                break;
            case 'linked-list':
                viz = this.createLinkedListVisualization(step);
                break;
            case 'custom':
                viz = step.customRender ? step.customRender() : this.createArrayVisualization(step);
                break;
            default:
                viz = this.createArrayVisualization(step);
        }

        stepDiv.appendChild(viz);

        // Pointer indicators (for algorithms with pointers)
        if (step.pointers) {
            const pointerDiv = this.createPointerIndicators(step.pointers);
            stepDiv.appendChild(pointerDiv);
        }

        // Additional note
        if (step.note) {
            // Helper: format Markdown-style bold (**text**) to <b>text</b>
            const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            const note = document.createElement('p');
            note.className = 'text-sm text-center text-slate-500 mt-4 italic';
            note.innerHTML = formatBold(step.note);
            stepDiv.appendChild(note);
        }

        // Code snippet for this step (optional)
        if (step.code) {
            const codeSection = document.createElement('div');
            codeSection.className = 'mt-4 bg-slate-50 rounded-lg p-4';

            const codeLabel = document.createElement('div');
            codeLabel.className = 'text-xs font-semibold text-slate-600 mb-2 mono';
            codeLabel.textContent = '💻 CODE AT THIS STEP';
            codeSection.appendChild(codeLabel);

            const pre = document.createElement('pre');
            pre.className = 'text-xs';
            pre.style.background = 'transparent';
            pre.style.padding = '0';
            const code = document.createElement('code');
            code.className = `language-${step.codeLanguage || 'python'}`;
            code.textContent = step.code;
            pre.appendChild(code);
            codeSection.appendChild(pre);

            stepDiv.appendChild(codeSection);

            setTimeout(() => {
                if (typeof Prism !== 'undefined') {
                    Prism.highlightElement(code);
                }
            }, 100);
        }

        return stepDiv;
    }

    /**
     * Create array visualization with highlights
     */
    createArrayVisualization(step) {
        const arrayViz = document.createElement('div');
        arrayViz.className = 'flex gap-3 items-end mb-4 justify-center flex-wrap';
        arrayViz.setAttribute('role', 'img');
        arrayViz.setAttribute('aria-label', `Array state: ${step.title}`);

        if (!step.array || step.array.length === 0) {
            arrayViz.innerHTML = '<p class="text-slate-400">No data to display</p>';
            return arrayViz;
        }

        step.array.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'text-center transition-all duration-300';

            const box = document.createElement('div');
            box.className = 'w-16 h-16 flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300';

            // Get value and highlight
            const value = typeof item === 'object' ? item.value : item;
            const highlight = typeof item === 'object' ? item.highlight : null;
            const label = typeof item === 'object' ? item.label : null;

            // Apply highlight styles
            const highlightStyles = this.getHighlightStyle(highlight);
            box.className += ' ' + highlightStyles.boxClass;

            box.textContent = value;
            itemDiv.appendChild(box);

            // Label below box
            if (label) {
                const labelEl = document.createElement('div');
                labelEl.className = 'text-xs mt-2 mono ' + highlightStyles.labelClass;
                labelEl.textContent = label;
                itemDiv.appendChild(labelEl);
            }

            arrayViz.appendChild(itemDiv);
        });

        return arrayViz;
    }

    /**
     * Get CSS classes for different highlight types
     */
    getHighlightStyle(highlight) {
        const styles = {
            'pivot': {
                boxClass: 'bg-amber-100 border-2 border-amber-500 shadow-md',
                labelClass: 'text-amber-600 font-semibold'
            },
            'pivot-final': {
                boxClass: 'bg-amber-200 border-2 border-amber-600 shadow-lg ring-2 ring-amber-300',
                labelClass: 'text-amber-700 font-bold'
            },
            'compare': {
                boxClass: 'bg-blue-100 border-2 border-blue-500 shadow-md',
                labelClass: 'text-blue-600 font-semibold'
            },
            'compare-right': {
                boxClass: 'bg-purple-100 border-2 border-purple-500 shadow-md',
                labelClass: 'text-purple-600 font-semibold'
            },
            'swap': {
                boxClass: 'bg-red-100 border-2 border-red-500 shadow-md animate-pulse',
                labelClass: 'text-red-600 font-semibold'
            },
            'sorted': {
                boxClass: 'bg-emerald-100 border-2 border-emerald-500',
                labelClass: 'text-emerald-600 font-semibold'
            },
            'sorted-left': {
                boxClass: 'bg-emerald-100 border-2 border-emerald-500',
                labelClass: 'text-emerald-600 font-semibold'
            },
            'sorted-right': {
                boxClass: 'bg-purple-100 border-2 border-purple-500',
                labelClass: 'text-purple-600 font-semibold'
            },
            'active': {
                boxClass: 'bg-cyan-100 border-2 border-cyan-500 shadow-md',
                labelClass: 'text-cyan-600 font-semibold'
            },
            'processing': {
                boxClass: 'bg-yellow-100 border-2 border-yellow-500',
                labelClass: 'text-yellow-600 font-semibold'
            },
            'selected': {
                boxClass: 'bg-indigo-100 border-2 border-indigo-500 shadow-md',
                labelClass: 'text-indigo-600 font-semibold'
            },
            'default': {
                boxClass: 'bg-white border-2 border-slate-300',
                labelClass: 'text-slate-500'
            }
        };

        return styles[highlight] || styles['default'];
    }

    /**
     * Create tree visualization (for recursive algorithms)
     */
    createTreeVisualization(step) {
        const treeViz = document.createElement('div');
        treeViz.className = 'flex flex-col items-center gap-4 py-4';
        treeViz.setAttribute('role', 'img');
        treeViz.setAttribute('aria-label', 'Tree visualization');

        if (!step.tree) {
            treeViz.innerHTML = '<p class="text-slate-400">No tree data</p>';
            return treeViz;
        }

        // Render tree recursively
        const renderTreeNode = (node, depth = 0) => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'flex flex-col items-center';

            // Node box
            const box = document.createElement('div');
            box.className = 'px-4 py-2 rounded-lg border-2 font-semibold text-sm';

            const highlight = node.highlight || 'default';
            const styles = this.getHighlightStyle(highlight);
            box.className += ' ' + styles.boxClass;
            box.textContent = Array.isArray(node.value) ? `[${node.value.join(',')}]` : node.value;

            nodeDiv.appendChild(box);

            // Children
            if (node.children && node.children.length > 0) {
                const arrow = document.createElement('div');
                arrow.className = 'text-2xl text-slate-400 my-2';
                arrow.textContent = '⬇️';
                nodeDiv.appendChild(arrow);

                const childrenDiv = document.createElement('div');
                childrenDiv.className = 'flex gap-8 items-start';

                node.children.forEach(child => {
                    childrenDiv.appendChild(renderTreeNode(child, depth + 1));
                });

                nodeDiv.appendChild(childrenDiv);
            }

            return nodeDiv;
        };

        treeViz.appendChild(renderTreeNode(step.tree));
        return treeViz;
    }

    /**
     * Create linked list visualization (singly or doubly linked)
     */
    createLinkedListVisualization(step) {
        const listViz = document.createElement('div');
        listViz.className = 'flex flex-col items-center gap-6 py-8 px-4';
        listViz.setAttribute('role', 'img');
        listViz.setAttribute('aria-label', `Linked list visualization: ${step.title}`);

        if (!step.data || !step.data.nodes || step.data.nodes.length === 0) {
            listViz.innerHTML = '<p class="text-slate-400">No linked list data</p>';
            return listViz;
        }

        const listType = step.data.type || 'singly';
        const nodes = step.data.nodes;

        // Container for nodes and arrows
        const nodesContainer = document.createElement('div');
        nodesContainer.className = 'flex items-center gap-4 flex-wrap justify-center';

        // Add Head label
        const headLabel = document.createElement('div');
        headLabel.className = 'text-sm font-bold text-purple-600 px-3 py-1 bg-purple-50 rounded border-2 border-purple-300';
        headLabel.textContent = 'HEAD';
        nodesContainer.appendChild(headLabel);

        // Render each node
        nodes.forEach((node, index) => {
            // Create node container
            const nodeContainer = document.createElement('div');
            nodeContainer.className = 'flex items-center gap-2';

            // Create the node box
            const nodeBox = document.createElement('div');
            nodeBox.className = 'flex flex-col items-center';

            // Node content box
            const nodeContent = document.createElement('div');
            nodeContent.className = 'flex items-center bg-white border-3 border-slate-700 rounded-lg shadow-lg transition-all duration-300';
            
            if (listType === 'doubly') {
                // Doubly linked: [prev | data | next]
                const prevBox = document.createElement('div');
                prevBox.className = 'w-10 h-16 flex items-center justify-center border-r-2 border-slate-300 text-xs text-slate-400';
                prevBox.innerHTML = node.prev !== null ? '←' : '∅';
                
                const dataBox = document.createElement('div');
                dataBox.className = 'w-16 h-16 flex items-center justify-center font-bold text-xl text-slate-900';
                dataBox.textContent = node.data;
                
                const nextBox = document.createElement('div');
                nextBox.className = 'w-10 h-16 flex items-center justify-center border-l-2 border-slate-300 text-xs text-slate-400';
                nextBox.innerHTML = node.next !== null ? '→' : '∅';
                
                nodeContent.appendChild(prevBox);
                nodeContent.appendChild(dataBox);
                nodeContent.appendChild(nextBox);
            } else {
                // Singly linked: [data | next]
                const dataBox = document.createElement('div');
                dataBox.className = 'w-16 h-16 flex items-center justify-center font-bold text-xl text-slate-900 border-r-2 border-slate-300';
                dataBox.textContent = node.data;
                
                const nextBox = document.createElement('div');
                nextBox.className = 'w-12 h-16 flex items-center justify-center text-xs text-slate-400';
                nextBox.innerHTML = node.next !== null ? '→' : '∅';
                
                nodeContent.appendChild(dataBox);
                nodeContent.appendChild(nextBox);
            }
            
            nodeBox.appendChild(nodeContent);

            // Node label (optional)
            if (node.label) {
                const label = document.createElement('div');
                label.className = 'text-xs text-slate-500 mt-2 font-mono';
                label.textContent = node.label;
                nodeBox.appendChild(label);
            }

            nodeContainer.appendChild(nodeBox);

            // Add arrow between nodes (except for last node)
            if (index < nodes.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'flex flex-col items-center gap-1';
                
                if (listType === 'doubly') {
                    // Bidirectional arrows
                    const forwardArrow = document.createElement('div');
                    forwardArrow.className = 'text-purple-500 text-2xl';
                    forwardArrow.textContent = '→';
                    
                    const backwardArrow = document.createElement('div');
                    backwardArrow.className = 'text-blue-500 text-2xl';
                    backwardArrow.textContent = '←';
                    
                    arrow.appendChild(forwardArrow);
                    arrow.appendChild(backwardArrow);
                } else {
                    // Single direction arrow
                    const forwardArrow = document.createElement('div');
                    forwardArrow.className = 'text-purple-500 text-3xl';
                    forwardArrow.textContent = '→';
                    arrow.appendChild(forwardArrow);
                }
                
                nodeContainer.appendChild(arrow);
            }

            nodesContainer.appendChild(nodeContainer);
        });

        // Add None/Null indicator at the end
        const nullBox = document.createElement('div');
        nullBox.className = 'text-sm font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded border-2 border-slate-300';
        nullBox.textContent = 'None';
        nodesContainer.appendChild(nullBox);

        listViz.appendChild(nodesContainer);

        // Add explanation text
        if (step.explanation && step.explanation.length > 0) {
            // Helper: format Markdown-style bold (**text**) to <b>text</b>
            const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            const explanationBox = document.createElement('div');
            explanationBox.className = 'mt-6 p-4 bg-slate-50 rounded-lg max-w-3xl';
            
            const explanationList = document.createElement('ul');
            explanationList.className = 'text-sm text-slate-700 space-y-2';
            
            step.explanation.forEach(point => {
                const li = document.createElement('li');
                li.className = 'flex items-start gap-2';
                li.innerHTML = `<span class="text-purple-600 font-bold mt-1">•</span><span>${formatBold(point)}</span>`;
                explanationList.appendChild(li);
            });
            
            explanationBox.appendChild(explanationList);
            listViz.appendChild(explanationBox);
        }

        // Add complexity info
        if (step.complexity) {
            // Helper: format Markdown-style bold (**text**) to <b>text</b>
            const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            const complexityBox = document.createElement('div');
            complexityBox.className = 'mt-4 text-xs text-slate-500 font-mono bg-amber-50 px-4 py-2 rounded border border-amber-200';
            complexityBox.innerHTML = formatBold(step.complexity);
            listViz.appendChild(complexityBox);
        }

        return listViz;
    }

    /**
     * Create pointer indicators (i, j, left, right, etc.)
     */
    createPointerIndicators(pointers) {
        const pointerDiv = document.createElement('div');
        pointerDiv.className = 'flex justify-around items-center px-8 text-xs mono mt-4 flex-wrap gap-2';

        Object.entries(pointers).forEach(([name, info]) => {
            const pointer = document.createElement('div');
            pointer.className = `text-${info.color || 'slate'}-600 font-semibold`;
            pointer.textContent = info.direction === 'left'
                ? `← ${name}: ${info.label || ''}`
                : `${name}: ${info.label || ''} →`;
            pointerDiv.appendChild(pointer);
        });

        return pointerDiv;
    }

    /**
     * Create insight box at end of tutorial
     */
    createInsightBox(insight) {
        // Helper: format Markdown-style bold (**text**) to <b>text</b>
        const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        
        const color = insight.color || 'cyan';
        const icon = insight.icon || '💡';

        const insightBox = document.createElement('div');
        insightBox.className = `bg-${color}-50 border-l-4 border-${color}-500 p-6 rounded-lg mt-8`;

        const title = document.createElement('h4');
        title.className = `font-semibold text-${color}-900 mb-2`;
        title.textContent = `${icon} ${insight.title || 'Key Insight'}`;
        insightBox.appendChild(title);

        const text = document.createElement('p');
        text.className = `text-sm text-${color}-800 leading-relaxed`;
        text.innerHTML = formatBold(insight.text || '');
        insightBox.appendChild(text);

        if (insight.points && insight.points.length > 0) {
            const list = document.createElement('ul');
            list.className = `mt-3 space-y-1 text-sm text-${color}-800`;

            insight.points.forEach(point => {
                const li = document.createElement('li');
                li.className = 'flex items-start gap-2';
                li.innerHTML = `<span class="text-${color}-600 font-bold">•</span><span>${formatBold(point)}</span>`;
                list.appendChild(li);
            });

            insightBox.appendChild(list);
        }

        return insightBox;
    }

    // ========================================================================
    // CARD, CODE, AND OTHER COMPONENT CREATORS
    // ========================================================================
createCard(item) {
    const card = document.createElement('div');
    card.className = 'card reveal';

    const body = document.createElement('div');
    body.className = 'p-8';

    // Helper: format Markdown-style bold (**text**) to <b>text</b>
    const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Helper: extract inner code from fenced pseudocode
    const extractPseudocode = code => {
        if (!code) return '';
        return code.replace(/^```[\s\S]*?\n?/, '').replace(/\n?```$/, '').trim();
    };

    // Icon
    const icon = document.createElement('div');
    icon.className = 'icon-box mb-6';
    icon.textContent = item.icon || '';
    icon.setAttribute('aria-hidden', 'true');

    // Title
    const title = document.createElement('h3');
    title.className = 'font-display mb-3';
    title.innerHTML = formatBold(item.title || '');

    // Description
    const description = document.createElement('p');
    description.className = 'math-nowrap';
    description.innerHTML = formatBold(item.description || '');

    // Badge
    const badge = document.createElement('span');
    badge.className = `badge badge-${item.color || 'slate'} mb-4 mono`;
    badge.textContent = item.highlight || '';

    // Math (new block)
    const math = document.createElement('div');
    math.className = 'mt-4 mathjax-block';
    if (item.math && item.math.length > 0) {
        item.math.forEach(expr => {
            const p = document.createElement('p');
            p.innerHTML = expr; // keep LaTeX-friendly syntax
            math.appendChild(p);
        });
    }

    // Compose body
    body.appendChild(icon);
    body.appendChild(title);
    body.appendChild(description);

    if (item.math && item.math.length > 0) body.appendChild(math);

    body.appendChild(badge);

    // Details list
    if (item.details && item.details.length > 0) {
        const list = document.createElement('ul');
        list.className = 'check-list text-sm text-slate-600 mt-4';
        item.details.forEach(detail => {
            const li = document.createElement('li');
            li.innerHTML = formatBold(detail); // support bold inside details
            list.appendChild(li);
        });
        body.appendChild(list);
    }

    // Pseudocode block
    if (item.pseudocode) {
        const pseudocodeDiv = document.createElement('div');
        pseudocodeDiv.className = 'mt-6';
        
        const pseudocodeLabel = document.createElement('h4');
        pseudocodeLabel.className = 'font-semibold mb-2 text-slate-700';
        pseudocodeLabel.textContent = 'Pseudocode';
        
        const codePre = document.createElement('pre');
        codePre.className = 'bg-slate-100 rounded-lg p-4 overflow-x-auto';
        
        const codeCode = document.createElement('code');
        codeCode.className = 'text-sm text-slate-800';
        codeCode.textContent = extractPseudocode(item.pseudocode);
        
        codePre.appendChild(codeCode);
        pseudocodeDiv.appendChild(pseudocodeLabel);
        pseudocodeDiv.appendChild(codePre);
        body.appendChild(pseudocodeDiv);
    }

    card.appendChild(body);

    // ✅ Trigger MathJax typesetting for this card after it's appended
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([card]);
    }

    return card;
}

    createCodeExample(item) {
        const container = document.createElement('div');
        container.className = 'card reveal';

        const header = document.createElement('div');
        header.className = 'card-header';
        const headerTitle = document.createElement('h3');
        headerTitle.className = 'font-display text-lg';
        headerTitle.textContent = item.title || 'Code Example';
        header.appendChild(headerTitle);
        container.appendChild(header);

        const body = document.createElement('div');
        body.className = 'p-6';

        if (item.description) {
            // Helper: format Markdown-style bold (**text**) to <b>text</b>
            const formatBold = text => text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            const desc = document.createElement('p');
            desc.className = 'text-sm text-slate-600 mb-4 leading-relaxed';
            desc.innerHTML = formatBold(item.description);
            body.appendChild(desc);
        }

        const pre = document.createElement('pre');
        pre.className = `language-${item.language || 'javascript'}`;
        const code = document.createElement('code');
        code.className = `language-${item.language || 'javascript'}`;
        code.textContent = item.code || '';
        pre.appendChild(code);
        body.appendChild(pre);

        // Add Run button for Python code (if not explicitly disabled)
        const language = item.language || 'javascript';
        const enableRun = item.runnable !== false && language === 'python';

        if (enableRun) {
            const runSection = document.createElement('div');
            runSection.className = 'mt-4 pt-4 border-t border-slate-200';

            // Run button
            const runButton = document.createElement('button');
            runButton.className = 'btn btn-primary text-sm';
            runButton.innerHTML = '▶ Run Code';
            runButton.setAttribute('aria-label', 'Run Python code');

            // Output area
            const outputArea = document.createElement('div');
            outputArea.className = 'hidden mt-4 p-4 bg-slate-900 rounded-lg';
            outputArea.setAttribute('role', 'region');
            outputArea.setAttribute('aria-label', 'Code output');
            outputArea.setAttribute('aria-live', 'polite');

            const outputLabel = document.createElement('div');
            outputLabel.className = 'text-xs text-slate-400 mb-2 font-semibold mono';
            outputLabel.textContent = 'OUTPUT:';
            outputArea.appendChild(outputLabel);

            const outputContent = document.createElement('div');
            outputContent.className = 'output-content';
            outputArea.appendChild(outputContent);

            // Run button click handler - FIXED: Show outputArea before running code
            runButton.addEventListener('click', async () => {
                runButton.disabled = true;
                runButton.innerHTML = '⏳ Running...';

                // CRITICAL FIX: Remove hidden class from outputArea
                outputArea.classList.remove('hidden');

                await this.runPythonCode(item.code || '', outputContent);

                runButton.disabled = false;
                runButton.innerHTML = '▶ Run Code';
            });

            runSection.appendChild(runButton);
            runSection.appendChild(outputArea);
            body.appendChild(runSection);
        }

        container.appendChild(body);

        setTimeout(() => {
            if (typeof Prism !== 'undefined') {
                Prism.highlightElement(code);
            }
        }, 100);

        return container;
    }

    createExercise(item) {
        const card = document.createElement('div');
        card.className = 'card reveal';

        const body = document.createElement('div');
        body.className = 'p-8';

        const header = document.createElement('div');
        header.className = 'flex items-start justify-between mb-4 gap-4';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'flex-1';

        const title = document.createElement('h3');
        title.className = 'font-display text-lg mb-2';
        title.textContent = item.title || '';
        titleDiv.appendChild(title);

        if (item.topics && item.topics.length > 0) {
            const topicsDiv = document.createElement('div');
            topicsDiv.className = 'flex flex-wrap gap-2 mt-2';
            item.topics.forEach(topic => {
                const topicBadge = document.createElement('span');
                topicBadge.className = 'badge badge-cyan mono text-xs';
                topicBadge.textContent = topic;
                topicsDiv.appendChild(topicBadge);
            });
            titleDiv.appendChild(topicsDiv);
        }

        const difficulty = document.createElement('span');
        difficulty.className = 'badge mono';
        let diffColor = 'slate';
        const diff = (item.difficulty || 'medium').toLowerCase();
        if (diff === 'easy') diffColor = 'emerald';
        else if (diff === 'medium') diffColor = 'amber';
        else if (diff === 'hard') diffColor = 'teal';
        difficulty.className += ` badge-${diffColor}`;
        difficulty.textContent = diff.toUpperCase();

        header.appendChild(titleDiv);
        header.appendChild(difficulty);
        body.appendChild(header);

        const description = document.createElement('p');
        description.className = 'text-slate-600 text-sm leading-relaxed';
        description.textContent = item.description || '';
        body.appendChild(description);

        card.appendChild(body);
        return card;
    }

    // ========================================================================
    // SIMULATOR METHODS
    // ========================================================================

    /**
     * Generic Simulator Creator
     * Supports any algorithm through configuration
     */
    createSimulator(content) {
        const container = document.createElement('div');
        container.className = 'card reveal';

        const header = document.createElement('div');
        header.className = 'card-header';
        const headerTitle = document.createElement('h3');
        headerTitle.className = 'font-display text-lg';
        headerTitle.textContent = content.title || 'Interactive Simulator';
        header.appendChild(headerTitle);
        container.appendChild(header);

        const body = document.createElement('div');
        body.className = 'p-8';

        if (content.description) {
            const desc = document.createElement('p');
            desc.className = 'text-slate-600 mb-6 text-sm leading-relaxed';
            desc.textContent = content.description;
            body.appendChild(desc);
        }

        // Render dynamic controls
        if (content.controls) {
            const controls = this.createSimulatorControls(content.controls);
            body.appendChild(controls);
        }

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'flex gap-3 mb-6';
        actions.innerHTML = `
            <button class="btn btn-primary" id="run-sim-btn" aria-label="Run simulation">▶ Run</button>
            <button class="btn btn-secondary" id="step-btn" disabled aria-label="Step forward">⏯ Step</button>
            <button class="btn btn-secondary" id="reset-btn" aria-label="Reset simulation">↻ Reset</button>
        `;
        body.appendChild(actions);

        // Stats (dynamic based on content.stats)
        if (content.stats) {
            const stats = this.createSimulatorStats(content.stats);
            body.appendChild(stats);
        }

        // Visualizations (dynamic based on content.visualizations)
        if (content.visualizations) {
            content.visualizations.forEach(viz => {
                const vizSection = document.createElement('div');
                vizSection.className = 'mb-6';

                const vizTitle = document.createElement('h4');
                vizTitle.className = 'text-sm font-semibold text-slate-700 mb-3';
                vizTitle.textContent = viz.label;
                vizSection.appendChild(vizTitle);

                const vizContainer = document.createElement('div');
                vizContainer.id = viz.id;
                vizContainer.className = viz.className || 'array-visual';
                vizContainer.setAttribute('role', 'region');
                vizContainer.setAttribute('aria-label', viz.label);
                vizSection.appendChild(vizContainer);

                body.appendChild(vizSection);
            });
        }

        container.appendChild(body);

        // Initialize simulator with algorithm
        setTimeout(() => {
            this.initSimulator(content);
        }, 100);

        return container;
    }

    createSimulatorControls(controlsConfig) {
        const controls = document.createElement('div');
        controls.className = 'grid md:grid-cols-3 gap-4 mb-6';

        controlsConfig.forEach(control => {
            const controlGroup = document.createElement('div');
            controlGroup.className = 'control-group';

            const label = document.createElement('label');
            label.htmlFor = control.id;
            label.textContent = control.label;
            controlGroup.appendChild(label);

            let input;
            if (control.type === 'select') {
                input = document.createElement('select');
                input.id = control.id;
                input.setAttribute('aria-label', control.label);

                control.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.label;
                    if (option.selected) opt.selected = true;
                    input.appendChild(opt);
                });
            } else {
                input = document.createElement('input');
                input.type = control.type || 'text';
                input.id = control.id;
                input.value = control.value || '';
                input.placeholder = control.placeholder || '';
                input.setAttribute('aria-label', control.label);

                if (control.helpText) {
                    input.setAttribute('aria-describedby', `${control.id}-help`);
                    const helpSpan = document.createElement('span');
                    helpSpan.id = `${control.id}-help`;
                    helpSpan.className = 'sr-only';
                    helpSpan.textContent = control.helpText;
                    controlGroup.appendChild(helpSpan);
                }
            }

            controlGroup.appendChild(input);
            controls.appendChild(controlGroup);
        });

        return controls;
    }

    createSimulatorStats(statsConfig) {
        const stats = document.createElement('div');
        stats.className = 'stats-grid mb-6';

        statsConfig.forEach(stat => {
            const statBox = document.createElement('div');
            statBox.className = 'stat-box';

            const statLabel = document.createElement('div');
            statLabel.className = 'stat-label';
            statLabel.textContent = stat.label;

            const statValue = document.createElement('div');
            statValue.className = 'stat-value';
            statValue.id = stat.id;
            statValue.setAttribute('aria-live', 'polite');
            statValue.textContent = stat.initial || '0';

            statBox.appendChild(statLabel);
            statBox.appendChild(statValue);
            stats.appendChild(statBox);
        });

        return stats;
    }

    initSimulator(content) {
        const algorithm = content.algorithm
            ? (typeof content.algorithm === 'string'
                ? this.algorithms[content.algorithm]
                : content.algorithm)
            : null;

        if (!algorithm) {
            console.warn('EducationalTemplate: No algorithm provided for simulator');
            return;
        }

        this.simulatorState = {
            content,
            algorithm,
            steps: [],
            currentStep: 0,
            running: false,
            data: {},
            history: []
        };

        const runBtn = document.getElementById('run-sim-btn');
        const stepBtn = document.getElementById('step-btn');
        const resetBtn = document.getElementById('reset-btn');

        if (runBtn) runBtn.onclick = () => this.runSimulation();
        if (stepBtn) stepBtn.onclick = () => this.stepSimulation();
        if (resetBtn) resetBtn.onclick = () => this.resetSimulation();
    }

    runSimulation() {
        if (!this.simulatorState?.algorithm) return;

        const controls = {};
        if (this.simulatorState.content.controls) {
            this.simulatorState.content.controls.forEach(control => {
                const el = document.getElementById(control.id);
                if (el) {
                    controls[control.id] = el.value;
                }
            });
        }

        this.saveState();

        this.simulatorState.steps = [];
        this.simulatorState.currentStep = 0;
        this.simulatorState.data = {};

        if (this.simulatorState.content.visualizations) {
            this.simulatorState.content.visualizations.forEach(viz => {
                const el = document.getElementById(viz.id);
                if (el) el.innerHTML = '';
            });
        }

        const logEl = document.getElementById('sim-log');
        if (logEl) logEl.innerHTML = '';

        this.log('info', 'Starting simulation...');

        try {
            const result = this.simulatorState.algorithm({
                controls,
                state: this.simulatorState,
                log: this.log.bind(this),
                addStep: (step) => this.simulatorState.steps.push(step)
            });

            if (result && result.steps) {
                this.simulatorState.steps = result.steps;
            }

            this.log('success', `Generated ${this.simulatorState.steps.length} steps`);

            const stepBtn = document.getElementById('step-btn');
            if (stepBtn) stepBtn.disabled = false;

        } catch (error) {
            this.log('error', `Error: ${error.message}`);
            console.error('Simulator error:', error);
        }
    }

    stepSimulation() {
        if (!this.simulatorState || this.simulatorState.currentStep >= this.simulatorState.steps.length) {
            this.log('success', '✓ Simulation complete!');
            const stepBtn = document.getElementById('step-btn');
            if (stepBtn) stepBtn.disabled = true;
            return;
        }

        const step = this.simulatorState.steps[this.simulatorState.currentStep];

        if (this.simulatorState.content.visualizer) {
            this.simulatorState.content.visualizer(step, this.simulatorState);
        }

        if (step.stats) {
            Object.entries(step.stats).forEach(([key, value]) => {
                const el = document.getElementById(key);
                if (el) el.textContent = value;
            });
        }

        if (step.message) {
            this.log(step.type || 'info', step.message);
        }

        this.simulatorState.currentStep++;
    }

    resetSimulation() {
        if (!this.simulatorState) return;

        this.simulatorState.steps = [];
        this.simulatorState.currentStep = 0;
        this.simulatorState.data = {};

        if (this.simulatorState.content.visualizations) {
            this.simulatorState.content.visualizations.forEach(viz => {
                const el = document.getElementById(viz.id);
                if (el) el.innerHTML = '';
            });
        }

        const logEl = document.getElementById('sim-log');
        if (logEl) logEl.innerHTML = '';

        if (this.simulatorState.content.stats) {
            this.simulatorState.content.stats.forEach(stat => {
                const el = document.getElementById(stat.id);
                if (el) el.textContent = stat.initial || '0';
            });
        }

        const stepBtn = document.getElementById('step-btn');
        if (stepBtn) stepBtn.disabled = true;

        this.log('info', 'Simulator reset. Configure and run a new simulation.');
    }

    log(type, message) {
        const logEl = document.getElementById('sim-log');
        if (!logEl) {
            console.log(`[${type}] ${message}`);
            return;
        }

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.setAttribute('role', 'status');

        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;

        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
    }

    saveState() {
        if (!this.simulatorState) return;

        try {
            const state = JSON.stringify({
                data: this.simulatorState.data,
                currentStep: this.simulatorState.currentStep
            });

            if (!this.simulatorState.history) {
                this.simulatorState.history = [];
            }

            this.simulatorState.history.push(state);

            if (this.simulatorState.history.length > 10) {
                this.simulatorState.history.shift();
            }
        } catch (e) {
            console.warn('EducationalTemplate: Could not save state:', e);
        }
    }

    restoreState(index = -1) {
        if (!this.simulatorState?.history?.length) return false;

        try {
            const state = this.simulatorState.history.at(index);
            if (state) {
                const parsed = JSON.parse(state);
                Object.assign(this.simulatorState, parsed);
                return true;
            }
        } catch (e) {
            console.warn('EducationalTemplate: Could not restore state:', e);
        }
        return false;
    }

    // ========================================================================
    // ANALYSIS TABLE CREATOR
    // ========================================================================

    createAnalysis(content) {
        const container = document.createElement('div');
        container.className = 'card reveal';

        const header = document.createElement('div');
        header.className = 'card-header';
        const headerTitle = document.createElement('h3');
        headerTitle.className = 'font-display text-lg';
        headerTitle.textContent = content.title || 'Analysis';
        header.appendChild(headerTitle);
        container.appendChild(header);

        const body = document.createElement('div');
        body.className = 'p-8';

        if (content.description) {
            const desc = document.createElement('p');
            desc.className = 'text-slate-600 mb-6 text-sm leading-relaxed';
            desc.textContent = content.description;
            body.appendChild(desc);
        }

        if (content.tableData) {
            const tableContainer = document.createElement('div');
            tableContainer.className = 'overflow-x-auto';

            const table = document.createElement('table');
            table.className = 'complexity-table mono text-sm';
            table.setAttribute('role', 'table');

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            content.tableData.headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                th.setAttribute('scope', 'col');
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            content.tableData.rows.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${row.name || ''}</strong></td>
                    <td>${row.best || 'N/A'}</td>
                    <td>${row.average || 'N/A'}</td>
                    <td>${row.worst || 'N/A'}</td>
                    <td>${row.space || 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            tableContainer.appendChild(table);
            body.appendChild(tableContainer);

            if (content.tableData.notes) {
                const notes = document.createElement('div');
                notes.className = 'mt-6 text-xs text-slate-500 space-y-2';
                content.tableData.notes.forEach(note => {
                    const p = document.createElement('p');
                    p.innerHTML = note;
                    notes.appendChild(p);
                });
                body.appendChild(notes);
            }
        }

        container.appendChild(body);
        return container;
    }

    // ========================================================================
    // EVENT HANDLERS AND UTILITIES
    // ========================================================================

    initSyntaxHighlighting() {
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    observeReveals() {
        const reveals = document.querySelectorAll('.reveal');
        const revealOnce = this.config.theme?.revealOnce !== false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    if (revealOnce) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold: this.config.theme?.revealThreshold || 0.1,
            rootMargin: '0px'
        });

        reveals.forEach(reveal => observer.observe(reveal));
        this.observers.push(observer);
    }

    setupEventListeners() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            }
        });

        window.addEventListener('scroll', () => {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            this.scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 10);
        }, { passive: true });
    }

    handleScroll() {
        const header = document.getElementById('main-nav');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll(`a[href="#${sectionId}"]`).forEach(link => {
                    link.setAttribute('aria-current', 'page');
                });
            } else {
                document.querySelectorAll(`a[href="#${sectionId}"]`).forEach(link => {
                    link.removeAttribute('aria-current');
                });
            }
        });
    }

    /**
     * Cleanup method to prevent memory leaks
     * Call this when removing the template or navigating away
     */
    destroy() {
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];

        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        console.log('EducationalTemplate: Cleanup complete');
    }
}

// Export for use in modules or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EducationalTemplate;
} else if (typeof window !== 'undefined') {
    window.EducationalTemplate = EducationalTemplate;
}