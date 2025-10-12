/**
 * Enhanced Educational Template Engine
 * Generic template system for educational content with improved performance,
 * extensibility, and error handling - fully backward compatible
 * @version 2.0.0
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
            'simulator': this.renderSimulator.bind(this),
            'analysis': this.renderAnalysis.bind(this),
            'exercises': this.renderExercises.bind(this)
        };
        
        // Extensible algorithm registry for simulators
        this.algorithms = {};
        
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

    renderNavigation() {
        const navLinks = document.getElementById('nav-links');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (!navLinks || !mobileMenu) return;
        
        this.config.sections.forEach(section => {
            const link = this.createNavLink(section);
            navLinks.appendChild(link);
            
            const mobileLink = this.createNavLink(section, true);
            mobileMenu.appendChild(mobileLink);
        });
    }

    createNavLink(section, isMobile = false) {
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.setAttribute('aria-label', `Navigate to ${section.title}`);
        link.className = isMobile
            ? 'block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors'
            : 'px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors';
        link.textContent = section.title;
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

    // Individual content renderers for extensibility
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
        return this.createSimulator(content);
    }

    renderAnalysis(content, wrapper) {
        return this.createAnalysis(content);
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

    createCard(item) {
        const card = document.createElement('div');
        card.className = 'card reveal';
        
        const body = document.createElement('div');
        body.className = 'p-8';
        
        const icon = document.createElement('div');
        icon.className = 'icon-box mb-6';
        icon.textContent = item.icon || '';
        icon.setAttribute('aria-hidden', 'true');
        
        const title = document.createElement('h3');
        title.className = 'font-display mb-3';
        title.textContent = item.title || '';
        
        const description = document.createElement('p');
        description.className = 'text-slate-600 mb-4 text-sm leading-relaxed';
        description.textContent = item.description || '';
        
        const badge = document.createElement('span');
        badge.className = `badge badge-${item.color || 'slate'} mb-4 mono`;
        badge.textContent = item.highlight || '';
        
        body.appendChild(icon);
        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(badge);
        
        if (item.details && item.details.length > 0) {
            const list = document.createElement('ul');
            list.className = 'check-list text-sm text-slate-600 mt-4';
            item.details.forEach(detail => {
                const li = document.createElement('li');
                li.textContent = detail;
                list.appendChild(li);
            });
            body.appendChild(list);
        }
        
        card.appendChild(body);
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
            const desc = document.createElement('p');
            desc.className = 'text-sm text-slate-600 mb-4 leading-relaxed';
            desc.textContent = item.description;
            body.appendChild(desc);
        }
        
        const pre = document.createElement('pre');
        pre.className = `language-${item.language || 'javascript'}`;
        const code = document.createElement('code');
        code.className = `language-${item.language || 'javascript'}`;
        code.textContent = item.code || '';
        pre.appendChild(code);
        body.appendChild(pre);
        
        container.appendChild(body);
        
        setTimeout(() => {
            if (typeof Prism !== 'undefined') {
                Prism.highlightElement(code);
            }
        }, 100);
        
        return container;
    }

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

    /**
     * Create dynamic simulator controls from configuration
     */
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

    /**
     * Create dynamic simulator stats from configuration
     */
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

    /**
     * Initialize simulator with algorithm
     */
    initSimulator(content) {
        // Get algorithm from registry or use inline
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

    /**
     * Run simulation using configured algorithm
     */
    runSimulation() {
        if (!this.simulatorState?.algorithm) return;
        
        // Get control values
        const controls = {};
        if (this.simulatorState.content.controls) {
            this.simulatorState.content.controls.forEach(control => {
                const el = document.getElementById(control.id);
                if (el) {
                    controls[control.id] = el.value;
                }
            });
        }
        
        // Save state to history
        this.saveState();
        
        // Reset state
        this.simulatorState.steps = [];
        this.simulatorState.currentStep = 0;
        this.simulatorState.data = {};
        
        // Clear visualizations
        if (this.simulatorState.content.visualizations) {
            this.simulatorState.content.visualizations.forEach(viz => {
                const el = document.getElementById(viz.id);
                if (el) el.innerHTML = '';
            });
        }
        
        // Clear log if exists
        const logEl = document.getElementById('sim-log');
        if (logEl) logEl.innerHTML = '';
        
        this.log('info', 'Starting simulation...');
        
        // Run algorithm to generate steps
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

    /**
     * Step through simulation
     */
    stepSimulation() {
        if (!this.simulatorState || this.simulatorState.currentStep >= this.simulatorState.steps.length) {
            this.log('success', '✓ Simulation complete!');
            const stepBtn = document.getElementById('step-btn');
            if (stepBtn) stepBtn.disabled = true;
            return;
        }
        
        const step = this.simulatorState.steps[this.simulatorState.currentStep];
        
        // Execute step (user-defined visualizer)
        if (this.simulatorState.content.visualizer) {
            this.simulatorState.content.visualizer(step, this.simulatorState);
        }
        
        // Update stats
        if (step.stats) {
            Object.entries(step.stats).forEach(([key, value]) => {
                const el = document.getElementById(key);
                if (el) el.textContent = value;
            });
        }
        
        // Log message
        if (step.message) {
            this.log(step.type || 'info', step.message);
        }
        
        this.simulatorState.currentStep++;
    }

    /**
     * Reset simulation
     */
    resetSimulation() {
        if (!this.simulatorState) return;
        
        this.simulatorState.steps = [];
        this.simulatorState.currentStep = 0;
        this.simulatorState.data = {};
        
        // Clear visualizations
        if (this.simulatorState.content.visualizations) {
            this.simulatorState.content.visualizations.forEach(viz => {
                const el = document.getElementById(viz.id);
                if (el) el.innerHTML = '';
            });
        }
        
        // Clear log
        const logEl = document.getElementById('sim-log');
        if (logEl) logEl.innerHTML = '';
        
        // Reset stats
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

    /**
     * Generic logging utility
     */
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

    // State management methods
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
            
            // Keep only last 10 states
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
        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Event delegation for smooth scrolling
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

        // Debounced scroll handler
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
        
        // Update active navigation
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
        // Clear all intervals
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        // Clear scroll timeout
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