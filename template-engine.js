/**
 * Educational Template Engine
 * Generic template system for educational content
 */
class EducationalTemplate {
    constructor(config) {
        this.config = config;
        this.simulatorState = null;
        this.init();
    }

    init() {
        this.applyTheme();
        this.renderMetadata();
        this.renderNavigation();
        this.renderHero();
        this.renderSections();
        this.renderFooter();
        this.setupEventListeners();
        this.observeReveals();
        this.initSyntaxHighlighting();
        document.getElementById('year').textContent = new Date().getFullYear();
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
        document.title = meta.title;
        
        // Update meta tags
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = meta.description;

        // Update navigation branding
        document.getElementById('nav-logo-text').textContent = meta.logo;
        document.getElementById('nav-title').textContent = meta.brand;
    }

    renderNavigation() {
        const navLinks = document.getElementById('nav-links');
        const mobileMenu = document.getElementById('mobile-menu');
        
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
        link.className = isMobile
            ? 'block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors'
            : 'px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors';
        link.textContent = section.title;
        return link;
    }

    renderHero() {
        const { hero } = this.config;
        
        document.getElementById('hero-title').textContent = hero.title;
        document.getElementById('hero-subtitle').textContent = hero.subtitle;
        
        // Render watermarks
        if (hero.watermarks) {
            const container = document.getElementById('watermarks-container');
            hero.watermarks.forEach((text, i) => {
                const watermark = document.createElement('div');
                watermark.className = `watermark watermark-${i + 1}`;
                watermark.textContent = text;
                container.appendChild(watermark);
            });
        }
        
        // Render quick links
        const heroNav = document.getElementById('hero-nav');
        hero.quickLinks.forEach(link => {
            const btn = document.createElement('a');
            btn.href = link.href;
            btn.className = `btn btn-${link.style}`;
            btn.textContent = link.text;
            heroNav.appendChild(btn);
        });
    }

    renderFooter() {
        const { footer } = this.config;
        
        document.getElementById('footer-title').textContent = footer.title;
        document.getElementById('footer-description').textContent = footer.description;
        document.getElementById('footer-copyright').textContent = footer.copyright;
        
        // Footer links
        const footerLinks = document.getElementById('footer-links');
        footer.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'block text-sm text-slate-400 hover:text-cyan-400 transition-colors';
            a.textContent = link.text;
            footerLinks.appendChild(a);
        });
        
        // Footer resources
        const footerResources = document.getElementById('footer-resources');
        footer.resources.forEach(resource => {
            const a = document.createElement('a');
            a.href = resource.href;
            a.className = 'w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors';
            a.innerHTML = `<span>${resource.emoji}</span>`;
            footerResources.appendChild(a);
        });
    }

    renderSections() {
        const mainContent = document.getElementById('main-content');
        
        this.config.sections.forEach(section => {
            const sectionEl = document.createElement('section');
            sectionEl.id = section.id;
            
            const container = document.createElement('div');
            container.className = 'container';
            
            const header = document.createElement('h2');
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
        
        switch(content.type) {
            case 'cards':
                wrapper.className = content.layout === 'grid-2'
                    ? 'grid md:grid-cols-2 gap-6'
                    : 'grid md:grid-cols-3 gap-6';
                content.items.forEach(item => {
                    wrapper.appendChild(this.createCard(item));
                });
                break;
            
            case 'code-examples':
                wrapper.className = 'space-y-8';
                content.items.forEach(item => {
                    wrapper.appendChild(this.createCodeExample(item));
                });
                break;
            
            case 'simulator':
                wrapper.appendChild(this.createSimulator(content));
                break;
            
            case 'analysis':
                wrapper.appendChild(this.createAnalysis(content));
                break;
            
            case 'exercises':
                wrapper.className = 'space-y-6';
                content.items.forEach(item => {
                    wrapper.appendChild(this.createExercise(item));
                });
                break;
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
        icon.textContent = item.icon;
        
        const title = document.createElement('h3');
        title.className = 'font-display mb-3';
        title.textContent = item.title;
        
        const description = document.createElement('p');
        description.className = 'text-slate-600 mb-4 text-sm leading-relaxed';
        description.textContent = item.description;
        
        const badge = document.createElement('span');
        badge.className = `badge badge-${item.color} mb-4 mono`;
        badge.textContent = item.highlight;
        
        body.appendChild(icon);
        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(badge);
        
        if (item.details) {
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
        headerTitle.textContent = item.title;
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
        pre.className = `language-${item.language}`;
        const code = document.createElement('code');
        code.className = `language-${item.language}`;
        code.textContent = item.code;
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

    createSimulator(content) {
        const container = document.createElement('div');
        container.className = 'card reveal';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        const headerTitle = document.createElement('h3');
        headerTitle.className = 'font-display text-lg';
        headerTitle.textContent = 'Interactive Simulator';
        header.appendChild(headerTitle);
        container.appendChild(header);
        
        const body = document.createElement('div');
        body.className = 'p-8';
        
        const desc = document.createElement('p');
        desc.className = 'text-slate-600 mb-6 text-sm leading-relaxed';
        desc.textContent = content.description;
        body.appendChild(desc);
        
        // Controls
        const controls = document.createElement('div');
        controls.className = 'grid md:grid-cols-3 gap-4 mb-6';
        
        controls.innerHTML = `
            <div class="control-group">
                <label for="sim-array">Array (comma-separated)</label>
                <input type="text" id="sim-array" value="5, 2, 9, 1, 7, 6, 3" placeholder="5, 2, 9, 1, 7, 6, 3">
            </div>
            <div class="control-group">
                <label for="sim-partition">Partition Scheme</label>
                <select id="sim-partition">
                    <option value="lomuto">Lomuto Partition</option>
                    <option value="hoare">Hoare Partition</option>
                    <option value="threeway">Three-Way Partition</option>
                </select>
            </div>
            <div class="control-group">
                <label for="sim-pivot">Pivot Strategy</label>
                <select id="sim-pivot">
                    <option value="last">Last Element</option>
                    <option value="first">First Element</option>
                    <option value="random">Random</option>
                    <option value="median3">Median-of-Three</option>
                </select>
            </div>
        `;
        body.appendChild(controls);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'flex gap-3 mb-6';
        actions.innerHTML = `
            <button class="btn btn-primary" id="run-sim-btn">▶ Run Simulation</button>
            <button class="btn btn-secondary" id="step-btn" disabled>⏯ Step Forward</button>
            <button class="btn btn-secondary" id="reset-btn">↻ Reset</button>
        `;
        body.appendChild(actions);
        
        // Stats
        const stats = document.createElement('div');
        stats.className = 'stats-grid mb-6';
        stats.innerHTML = `
            <div class="stat-box">
                <div class="stat-label">Comparisons</div>
                <div class="stat-value" id="sim-comparisons">0</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Swaps</div>
                <div class="stat-value" id="sim-swaps">0</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Recursive Calls</div>
                <div class="stat-value" id="sim-calls">0</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Current Depth</div>
                <div class="stat-value" id="sim-depth">0</div>
            </div>
        `;
        body.appendChild(stats);
        
        // Array visualization
        body.innerHTML += `
            <h4 class="text-sm font-semibold text-slate-700 mb-3">Array State:</h4>
            <div id="array-viz" class="array-visual"></div>
            <h4 class="text-sm font-semibold text-slate-700 mb-3 mt-6">Execution Log:</h4>
            <div id="sim-log" class="log-container"></div>
        `;
        
        container.appendChild(body);
        
        // Initialize simulator after DOM is ready
        setTimeout(() => {
            this.initSimulator();
        }, 100);
        
        return container;
    }

    initSimulator() {
        this.simulatorState = {
            steps: [],
            currentStep: 0,
            running: false,
            comparisons: 0,
            swaps: 0,
            calls: 0
        };

        document.getElementById('run-sim-btn').onclick = () => this.runSimulation();
        document.getElementById('step-btn').onclick = () => this.stepSimulation();
        document.getElementById('reset-btn').onclick = () => this.resetSimulation();
    }

    runSimulation() {
        const arrayInput = document.getElementById('sim-array').value;
        const partition = document.getElementById('sim-partition').value;
        const pivot = document.getElementById('sim-pivot').value;
        
        const arr = arrayInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        
        if (arr.length === 0) {
            this.addLog('error', 'Invalid array input');
            return;
        }
        
        this.simulatorState = {
            steps: [],
            currentStep: 0,
            running: false,
            comparisons: 0,
            swaps: 0,
            calls: 0,
            array: [...arr],
            partition,
            pivot
        };
        
        document.getElementById('sim-log').innerHTML = '';
        
        this.addLog('info', `Starting QuickSort with ${partition} partition and ${pivot} pivot`);
        this.addLog('info', `Initial array: [${arr.join(', ')}]`);
        
        this.generateSteps([...arr], 0, arr.length - 1, 0);
        
        this.updateStats();
        this.updateArray(arr);
        
        document.getElementById('step-btn').disabled = false;
        
        this.addLog('success', `Generated ${this.simulatorState.steps.length} steps`);
    }

    generateSteps(arr, low, high, depth) {
        if (low >= high) return;
        
        this.simulatorState.calls++;
        
        const step = {
            type: 'call',
            array: [...arr],
            low,
            high,
            depth,
            message: `quicksort(arr, ${low}, ${high}) at depth ${depth}`
        };
        this.simulatorState.steps.push(step);
        
        let pivotIdx = high;
        const pivotStrategy = this.simulatorState.pivot;
        
        if (pivotStrategy === 'first') {
            pivotIdx = low;
        } else if (pivotStrategy === 'random') {
            pivotIdx = low + Math.floor(Math.random() * (high - low + 1));
        } else if (pivotStrategy === 'median3' && high - low >= 2) {
            const mid = Math.floor((low + high) / 2);
            const vals = [[arr[low], low], [arr[mid], mid], [arr[high], high]];
            vals.sort((a, b) => a[0] - b[0]);
            pivotIdx = vals[1][1];
        }
        
        if (pivotIdx !== high && this.simulatorState.partition === 'lomuto') {
            [arr[pivotIdx], arr[high]] = [arr[high], arr[pivotIdx]];
            this.simulatorState.steps.push({
                type: 'pivot',
                array: [...arr],
                low,
                high,
                pivotIdx: high,
                message: `Selected pivot: ${arr[high]} (moved to position ${high})`
            });
        }
        
        let pi;
        if (this.simulatorState.partition === 'lomuto') {
            pi = this.lomutoPartitionSteps(arr, low, high);
        } else if (this.simulatorState.partition === 'hoare') {
            pi = this.hoarePartitionSteps(arr, low, high);
        } else {
            pi = this.lomutoPartitionSteps(arr, low, high);
        }
        
        this.simulatorState.steps.push({
            type: 'partitioned',
            array: [...arr],
            low,
            high,
            pivotIdx: pi,
            message: `Partition complete. Pivot at index ${pi}`
        });
        
        this.generateSteps(arr, low, pi - 1, depth + 1);
        this.generateSteps(arr, pi + 1, high, depth + 1);
    }

    lomutoPartitionSteps(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            this.simulatorState.comparisons++;
            this.simulatorState.steps.push({
                type: 'compare',
                array: [...arr],
                indices: [j, high],
                message: `Compare arr[${j}]=${arr[j]} with pivot=${pivot}`
            });
            
            if (arr[j] <= pivot) {
                i++;
                if (i !== j) {
                    this.simulatorState.swaps++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    this.simulatorState.steps.push({
                        type: 'swap',
                        array: [...arr],
                        indices: [i, j],
                        message: `Swap arr[${i}]=${arr[i]} with arr[${j}]=${arr[j]}`
                    });
                }
            }
        }
        
        this.simulatorState.swaps++;
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        this.simulatorState.steps.push({
            type: 'swap',
            array: [...arr],
            indices: [i + 1, high],
            message: `Place pivot ${pivot} at position ${i + 1}`
        });
        
        return i + 1;
    }

    hoarePartitionSteps(arr, low, high) {
        const pivot = arr[low];
        let i = low - 1;
        let j = high + 1;
        
        while (true) {
            do {
                i++;
                if (i <= high) {
                    this.simulatorState.comparisons++;
                }
            } while (i <= high && arr[i] < pivot);
            
            do {
                j--;
                if (j >= low) {
                    this.simulatorState.comparisons++;
                }
            } while (j >= low && arr[j] > pivot);
            
            if (i >= j) {
                return j;
            }
            
            this.simulatorState.swaps++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            this.simulatorState.steps.push({
                type: 'swap',
                array: [...arr],
                indices: [i, j],
                message: `Hoare: Swap arr[${i}]=${arr[i]} with arr[${j}]=${arr[j]}`
            });
        }
    }

    stepSimulation() {
        if (this.simulatorState.currentStep >= this.simulatorState.steps.length) {
            this.addLog('success', '✓ Sorting complete!');
            document.getElementById('step-btn').disabled = true;
            return;
        }
        
        const step = this.simulatorState.steps[this.simulatorState.currentStep];
        
        this.updateArray(step.array, step.indices, step.type);
        
        const logType = step.type === 'swap' ? 'warning' : 
                       step.type === 'compare' ? 'info' : 'success';
        this.addLog(logType, step.message);
        
        document.getElementById('sim-comparisons').textContent = this.simulatorState.comparisons;
        document.getElementById('sim-swaps').textContent = this.simulatorState.swaps;
        document.getElementById('sim-calls').textContent = this.simulatorState.calls;
        document.getElementById('sim-depth').textContent = step.depth || 0;
        
        this.simulatorState.currentStep++;
    }

    updateArray(arr, highlightIndices = [], type = '') {
        const viz = document.getElementById('array-viz');
        viz.innerHTML = '';
        
        arr.forEach((val, idx) => {
            const item = document.createElement('div');
            item.className = 'array-item';
            item.textContent = val;
            
            if (highlightIndices && highlightIndices.includes(idx)) {
                if (type === 'swap') {
                    item.classList.add('swapping');
                } else if (type === 'compare') {
                    item.classList.add('comparing');
                } else if (type === 'pivot') {
                    item.classList.add('pivot');
                }
            }
            
            viz.appendChild(item);
        });
    }

    addLog(type, message) {
        const log = document.getElementById('sim-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    updateStats() {
        document.getElementById('sim-comparisons').textContent = this.simulatorState.comparisons;
        document.getElementById('sim-swaps').textContent = this.simulatorState.swaps;
        document.getElementById('sim-calls').textContent = this.simulatorState.calls;
        document.getElementById('sim-depth').textContent = 0;
    }

    resetSimulation() {
        this.simulatorState = {
            steps: [],
            currentStep: 0,
            running: false,
            comparisons: 0,
            swaps: 0,
            calls: 0
        };
        
        document.getElementById('sim-log').innerHTML = '';
        document.getElementById('array-viz').innerHTML = '';
        document.getElementById('step-btn').disabled = true;
        this.updateStats();
        
        this.addLog('info', 'Simulator reset. Configure and run a new simulation.');
    }

    createAnalysis(content) {
        const container = document.createElement('div');
        container.className = 'card reveal';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        const headerTitle = document.createElement('h3');
        headerTitle.className = 'font-display text-lg';
        headerTitle.textContent = 'Complexity Comparison';
        header.appendChild(headerTitle);
        container.appendChild(header);
        
        const body = document.createElement('div');
        body.className = 'p-8';
        
        const desc = document.createElement('p');
        desc.className = 'text-slate-600 mb-6 text-sm leading-relaxed';
        desc.textContent = content.description;
        body.appendChild(desc);
        
        if (content.tableData) {
            const tableContainer = document.createElement('div');
            tableContainer.className = 'overflow-x-auto';
            
            const table = document.createElement('table');
            table.className = 'complexity-table mono text-sm';
            
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            content.tableData.headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            const tbody = document.createElement('tbody');
            content.tableData.rows.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${row.name}</strong></td>
                    <td>${row.best}</td>
                    <td>${row.average}</td>
                    <td>${row.worst}</td>
                    <td>${row.space}</td>
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
        title.textContent = item.title;
        titleDiv.appendChild(title);
        
        if (item.topics) {
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
        if (item.difficulty === 'easy') diffColor = 'emerald';
        else if (item.difficulty === 'medium') diffColor = 'amber';
        else if (item.difficulty === 'hard') diffColor = 'teal';
        difficulty.className += ` badge-${diffColor}`;
        difficulty.textContent = item.difficulty.toUpperCase();
        
        header.appendChild(titleDiv);
        header.appendChild(difficulty);
        body.appendChild(header);
        
        const description = document.createElement('p');
        description.className = 'text-slate-600 text-sm leading-relaxed';
        description.textContent = item.description;
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
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(reveal => observer.observe(reveal));
    }

    setupEventListeners() {
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        });

        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    document.getElementById('mobile-menu').classList.add('hidden');
                }
            });
        });

        const header = document.getElementById('main-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
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
        });
    }
}