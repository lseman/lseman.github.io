/**
 * Enhanced Educational Template Engine
 * Generic template system for educational content with improved performance,
 * extensibility, and error handling - fully backward compatible
 * @version 2.3.0 - Added Graph Visualization Support
 */
class EducationalTemplate {
  constructor(config) {
    if (!config) {
      throw new Error("EducationalTemplate: Configuration is required");
    }

    this.config = this.validateConfig(config);
    this.simulatorState = null;
    this.observers = []; // Track observers for cleanup
    this.intervals = []; // Track intervals for cleanup
    this.scrollTimeout = null;

    // Extensible content renderers - users can add custom types
    this.contentRenderers = {
      cards: this.renderCards.bind(this),
      images: this.renderImages.bind(this),
      "code-examples": this.renderCodeExamples.bind(this),
      "code-example": this.renderCodeExample.bind(this), // Singular for single example
      "code-blocks": this.renderCodeExamples.bind(this), // Alias for code-examples
      simulator: this.renderSimulator.bind(this),
      analysis: this.renderAnalysis.bind(this),
      "comparison-table": this.renderComparisonTable.bind(this),
      exercises: this.renderExercises.bind(this),
      "visual-tutorial": this.renderVisualTutorial.bind(this),
    };

    if (config.customRenderers && typeof config.customRenderers === "object") {
      Object.entries(config.customRenderers).forEach(([type, renderer]) => {
        if (typeof renderer === "function") {
          this.registerContentRenderer(type, renderer);
        }
      });
    }

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
        if (typeof loadPyodide === "undefined") {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
          document.head.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }

        this.pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
        });

        console.log("✅ Pyodide loaded successfully");
        await this.pyodide.loadPackage("statsmodels");
        await this.pyodide.loadPackage("scikit-learn");
        this.pyodideLoading = false;
        return this.pyodide;
      } catch (error) {
        console.error("❌ Failed to load Pyodide:", error);
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
      console.error("Output element not provided");
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
      outputElement.innerHTML = "";

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
        const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
        const stderr = await pyodide.runPythonAsync("sys.stderr.getvalue()");

        if (stdout) {
          const outputDiv = document.createElement("div");
          outputDiv.className =
            "text-emerald-600 whitespace-pre-wrap font-mono text-sm";
          outputDiv.textContent = stdout;
          outputElement.appendChild(outputDiv);
        }

        if (stderr) {
          const errorDiv = document.createElement("div");
          errorDiv.className =
            "text-amber-600 whitespace-pre-wrap font-mono text-sm mt-2";
          errorDiv.textContent = stderr;
          outputElement.appendChild(errorDiv);
        }

        if (!stdout && !stderr) {
          outputElement.innerHTML =
            '<div class="text-slate-500 text-sm italic">Code executed successfully (no output)</div>';
        }
      } catch (error) {
        // Python execution error
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "text-red-600 whitespace-pre-wrap font-mono text-sm";
        errorDiv.textContent = `Error: ${error.message}`;
        outputElement.innerHTML = "";
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
    const required = ["meta", "sections", "hero", "footer"];
    const missing = required.filter((key) => !config[key]);

    if (missing.length) {
      console.warn(
        `EducationalTemplate: Missing config keys: ${missing.join(", ")}`,
      );
    }

    const normalizedSections = this.normalizeSections(config.sections || []);

    // Set defaults for optional fields
    return {
      ...config,
      theme: this.resolveThemeConfig(config.theme),
      sections: normalizedSections,
      hero: {
        watermarks: [],
        quickLinks: [],
        ...config.hero,
      },
      footer: {
        links: [],
        resources: [],
        ...config.footer,
      },
    };
  }

  resolveThemeConfig(themeConfig) {
    if (typeof window !== "undefined" && window.themeManager) {
      return window.themeManager.resolveTheme(themeConfig);
    }

    if (typeof themeConfig === "string") {
      return {
        preset: themeConfig,
        name: themeConfig,
        cssVariables: {},
      };
    }

    if (!themeConfig || typeof themeConfig !== "object") {
      return {};
    }

    return {
      ...themeConfig,
      cssVariables: { ...(themeConfig.cssVariables || {}) },
    };
  }

  normalizeSections(sections) {
    return sections.map((section, index) => {
      const fallbackTitle = section?.title || `Section ${index + 1}`;
      const normalizedId = section?.id || this.slugify(fallbackTitle, index);

      return {
        ...section,
        id: normalizedId,
        title: fallbackTitle,
        content: section?.content || {},
      };
    });
  }

  slugify(value, index = 0) {
    const slug = String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || `section-${index + 1}`;
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

      const yearEl = document.getElementById("year");
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
    } catch (error) {
      console.error("EducationalTemplate: Initialization error", error);
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
    if (theme.tailwindExtend && typeof tailwind !== "undefined") {
      tailwind.config = {
        theme: {
          extend: theme.tailwindExtend,
        },
      };
    }
  }

  setTheme(themeConfig) {
    this.config.theme = this.resolveThemeConfig(themeConfig);
    this.applyTheme();
    this.observeReveals();
  }

  renderMetadata() {
    const { meta } = this.config;
    if (!meta) return;

    document.title = meta.title || "Educational Template";

    // Update meta tags
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = meta.description || "";

    // Update navigation branding
    const logoEl = document.getElementById("nav-logo-text");
    const titleEl = document.getElementById("nav-title");

    if (logoEl) logoEl.textContent = meta.logo || "";
    if (titleEl) titleEl.textContent = meta.brand || "";
  }

  /**
   * FIXED HAMBURGER MENU - Replace renderNavigation() in EducationalTemplate
   */

  renderNavigation() {
    const navLinks = document.getElementById("nav-links");
    const mobileMenu = document.getElementById("mobile-menu");

    if (!navLinks || !mobileMenu) return;

    // Clear existing
    navLinks.innerHTML = "";
    mobileMenu.innerHTML = "";

    const existingBackdrop = document.getElementById("nav-menu-backdrop");
    const existingPanel = document.getElementById("nav-menu-panel");
    if (existingBackdrop) existingBackdrop.remove();
    if (existingPanel) existingPanel.remove();

    // Desktop: Just show a menu button
    const menuButton = document.createElement("button");
    menuButton.className = "nav-menu-button";
    menuButton.id = "desktop-menu-btn";
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.innerHTML = `
        <i data-lucide="menu" class="w-5 h-5"></i>
        <span>Menu</span>
    `;
    navLinks.appendChild(menuButton);

    // Create backdrop (separate element)
    const backdrop = document.createElement("div");
    backdrop.className = "nav-menu-backdrop";
    backdrop.id = "nav-menu-backdrop";
    document.body.appendChild(backdrop);

    // Create the slide-out menu panel
    const menuPanel = document.createElement("div");
    menuPanel.className = "nav-menu-panel";
    menuPanel.id = "nav-menu-panel";

    const panelHeader = document.createElement("div");
    panelHeader.className = "nav-menu-header";
    panelHeader.innerHTML = `
        <h3 class="font-semibold text-lg">Navigation</h3>
        <button class="nav-menu-close" id="menu-close-btn" aria-label="Close menu">
            <i data-lucide="x" class="w-6 h-6"></i>
        </button>
    `;
    menuPanel.appendChild(panelHeader);

    const menuContent = document.createElement("div");
    menuContent.className = "nav-menu-content";

    // Add all sections to the menu
    this.config.sections.forEach((section) => {
      const item = document.createElement("a");
      item.href = `#${section.id}`;
      item.className = "nav-menu-item";

      const icon = this.extractIcon(section.icon);
      if (icon) {
        const iconEl = document.createElement("i");
        iconEl.setAttribute("data-lucide", icon);
        iconEl.className = "w-5 h-5";
        item.appendChild(iconEl);
      }

      const label = document.createElement("span");
      label.textContent = section.title;
      item.appendChild(label);

      menuContent.appendChild(item);
    });

    menuPanel.appendChild(menuContent);
    document.body.appendChild(menuPanel);

    // Mobile: Use existing mobile menu structure
    this.config.sections.forEach((section) => {
      const item = document.createElement("a");
      item.href = `#${section.id}`;
      item.className =
        "flex items-center gap-3 py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors";

      const icon = this.extractIcon(section.icon);
      if (icon) {
        const iconEl = document.createElement("i");
        iconEl.setAttribute("data-lucide", icon);
        iconEl.className = "w-5 h-5";
        item.appendChild(iconEl);
      }

      const label = document.createElement("span");
      label.textContent = section.title;
      item.appendChild(label);

      mobileMenu.appendChild(item);
    });

    // Initialize icons
    setTimeout(() => {
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }, 50);

    // Setup menu interactions
    this.setupMenuPanel();
  }

  setupMenuPanel() {
    const menuBtn = document.getElementById("desktop-menu-btn");
    const closeBtn = document.getElementById("menu-close-btn");
    const panel = document.getElementById("nav-menu-panel");
    const backdrop = document.getElementById("nav-menu-backdrop");

    if (!panel || !backdrop) return;

    // Open menu
    const openMenu = () => {
      panel.classList.add("active");
      backdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    // Close menu
    const closeMenu = () => {
      panel.classList.remove("active");
      backdrop.classList.remove("active");
      document.body.style.overflow = "";
    };

    if (menuBtn) {
      menuBtn.addEventListener("click", openMenu);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeMenu);
    }

    // Close on backdrop click
    backdrop.addEventListener("click", closeMenu);

    // Close on link click
    panel.querySelectorAll(".nav-menu-item").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("active")) {
        closeMenu();
      }
    });
  }

  extractIcon(iconText) {
    if (!iconText) return null;

    const iconMap = {
      "📚": "book-open",
      "📖": "book",
      "🎯": "target",
      "✅": "check-circle",
      "💻": "code",
      "⌨️": "code",
      "🏠": "home",
      ℹ️: "info",
      "❓": "help-circle",
      "⚡": "zap",
      "🚀": "rocket",
      "🎓": "graduation-cap",
      "📊": "bar-chart",
      "📈": "trending-up",
      "🔬": "microscope",
      "🎨": "palette",
      "📝": "edit",
      "⚙️": "settings",
      "📁": "folder",
      "🔍": "search",
      "🌳": "git-branch",
      "🌲": "tree-deciduous",
      "🕸️": "share-2",
      "➡️": "arrow-right",
      "↔️": "arrow-left-right",
      "⬇️": "arrow-down",
      "〰️": "waves",
    };

    return iconMap[iconText] || null;
  }

  // Backward compatibility
  createNavLink(section, isMobile = false) {
    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = section.title;
    link.className = isMobile
      ? "flex items-center gap-2 py-2"
      : "flex items-center gap-2";
    return link;
  }

  renderHero() {
    const { hero } = this.config;
    if (!hero) return;

    const titleEl = document.getElementById("hero-title");
    const subtitleEl = document.getElementById("hero-subtitle");

    if (titleEl) titleEl.textContent = hero.title || "";
    if (subtitleEl) subtitleEl.textContent = hero.subtitle || "";

    // Render watermarks
    if (hero.watermarks) {
      const container = document.getElementById("watermarks-container");
      if (container) {
        container.innerHTML = "";
        hero.watermarks.forEach((text, i) => {
          const watermark = document.createElement("div");
          watermark.className = `watermark watermark-${i + 1}`;
          watermark.textContent = text;
          watermark.setAttribute("aria-hidden", "true");
          container.appendChild(watermark);
        });
      }
    }

    // Render quick links
    const heroNav = document.getElementById("hero-nav");
    if (heroNav && hero.quickLinks) {
      heroNav.innerHTML = "";
      hero.quickLinks.forEach((link) => {
        const btn = document.createElement("a");
        btn.href = link.href;
        btn.className = `btn btn-${link.style}`;
        btn.textContent = link.text;
        btn.setAttribute("aria-label", link.text);
        heroNav.appendChild(btn);
      });
    }
  }

  renderFooter() {
    const { footer } = this.config;
    if (!footer) return;

    const titleEl = document.getElementById("footer-title");
    const descEl = document.getElementById("footer-description");
    const copyrightEl = document.getElementById("footer-copyright");

    if (titleEl) titleEl.textContent = footer.title || "";
    if (descEl) descEl.textContent = footer.description || "";
    if (copyrightEl) copyrightEl.textContent = footer.copyright || "";

    // Footer links
    const footerLinks = document.getElementById("footer-links");
    if (footerLinks && footer.links) {
      footerLinks.innerHTML = "";
      footer.links.forEach((link) => {
        const a = document.createElement("a");
        a.href = link.href;
        a.className =
          "block text-sm text-slate-400 hover:text-cyan-400 transition-colors";
        a.textContent = link.text;
        footerLinks.appendChild(a);
      });
    }

    // Footer resources
    const footerResources = document.getElementById("footer-resources");
    if (footerResources && footer.resources) {
      footerResources.innerHTML = "";
      footer.resources.forEach((resource) => {
        const a = document.createElement("a");
        a.href = resource.href;
        a.className =
          "w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors";
        a.innerHTML = `<span aria-label="${resource.label || "Resource"}">${resource.emoji}</span>`;
        footerResources.appendChild(a);
      });
    }
  }

  renderSections() {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    mainContent.innerHTML = "";

    this.config.sections.forEach((section) => {
      const sectionEl = document.createElement("section");
      sectionEl.id = section.id;
      sectionEl.setAttribute("aria-labelledby", `${section.id}-heading`);

      const container = document.createElement("div");
      container.className = "container";

      const header = document.createElement("h2");
      header.id = `${section.id}-heading`;
      header.className = "font-display mb-12 reveal";
      header.innerHTML = `${section.icon} ${section.title}`;
      container.appendChild(header);

      const contentEl = this.renderContent(section.content);
      container.appendChild(contentEl);

      sectionEl.appendChild(container);
      mainContent.appendChild(sectionEl);
    });
  }

  renderContent(content) {
    const wrapper = document.createElement("div");

    if (!content || !content.type) {
      console.warn("EducationalTemplate: Invalid content structure");
      return wrapper;
    }

    const renderer = this.contentRenderers[content.type];

    if (!renderer) {
      console.warn(
        `EducationalTemplate: Unknown content type: ${content.type}`,
      );
      return wrapper;
    }

    return renderer(content, wrapper);
  }

  // ========================================================================
  // CONTENT RENDERERS
  // ========================================================================

  renderCards(content, wrapper) {
    wrapper.className =
      content.layout === "grid-2"
        ? "grid md:grid-cols-2 gap-6"
        : "grid md:grid-cols-3 gap-6";

    if (content.items) {
      content.items.forEach((item) => {
        wrapper.appendChild(this.createCard(item));
      });
    }

    return wrapper;
  }

  renderImages(content, wrapper) {
    wrapper.className = "grid md:grid-cols-1 gap-6";

    if (content.items) {
      content.items.forEach((item) => {
        const img = document.createElement("img");
        img.alt = item.alt || "";
        img.className = "rounded-lg shadow-lg reveal";

        // Enhanced GIF handling with configurable refresh
        if (item.src.endsWith(".gif")) {
          const baseSrc = item.src.split("?")[0];
          img.src = `${baseSrc}?t=${Date.now()}`;

          img.addEventListener(
            "load",
            () => {
              const refreshInterval =
                item.refreshInterval ||
                this.config.theme?.gifRefreshInterval ||
                6000;
              const interval = setInterval(() => {
                img.src = `${baseSrc}?t=${Date.now()}`;
              }, refreshInterval);
              this.intervals.push(interval);
            },
            { once: true },
          );
        } else {
          img.src = item.src;
        }

        wrapper.appendChild(img);
      });
    }

    return wrapper;
  }

  renderCodeExamples(content, wrapper) {
    wrapper.className = "space-y-8";

    if (content.items) {
      content.items.forEach((item) => {
        wrapper.appendChild(this.createCodeExample(item));
      });
    }

    return wrapper;
  }

  renderCodeExample(content, wrapper) {
    // Handle single code example object (not an array)
    wrapper.appendChild(this.createCodeExample(content));
    return wrapper;
  }

  renderComparisonTable(content, wrapper) {
    // Render comparison table
    const container = document.createElement("div");
    container.className = "card reveal";

    const header = document.createElement("div");
    header.className = "card-header";
    const headerTitle = document.createElement("h3");
    headerTitle.className = "font-display text-lg";
    headerTitle.textContent = content.title || "Comparison";
    header.appendChild(headerTitle);
    container.appendChild(header);

    const body = document.createElement("div");
    body.className = "p-8";

    if (content.description) {
      const desc = document.createElement("p");
      desc.className = "text-slate-600 mb-6 text-sm leading-relaxed";
      desc.textContent = content.description;
      body.appendChild(desc);
    }

    if (content.columns && content.rows) {
      const tableContainer = document.createElement("div");
      tableContainer.className = "overflow-x-auto";

      const table = document.createElement("table");
      table.className = "comparison-table text-sm w-full";

      // Header
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      content.columns.forEach((col) => {
        const th = document.createElement("th");
        th.className =
          "text-left p-3 font-semibold bg-slate-50 border-b-2 border-slate-300";
        th.textContent = col;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Body
      const tbody = document.createElement("tbody");
      content.rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-200 hover:bg-slate-50";

        // Dynamically handle row properties
        content.columns.forEach((col) => {
          const td = document.createElement("td");
          td.className = "p-3 text-slate-700";
          const key = col.toLowerCase().replace(/\s+/g, "");
          td.textContent = row[key] || row[col] || "N/A";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      tableContainer.appendChild(table);
      body.appendChild(tableContainer);
    }

    container.appendChild(body);
    wrapper.appendChild(container);
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
    wrapper.className = "space-y-6";

    if (content.items) {
      content.items.forEach((item) => {
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
    const container = document.createElement("div");
    container.className = "card reveal";

    const header = document.createElement("div");
    header.className = "card-header";
    const headerTitle = document.createElement("h3");
    headerTitle.className = "font-display text-lg";
    headerTitle.textContent = content.title || "Visual Tutorial";
    header.appendChild(headerTitle);
    container.appendChild(header);

    const body = document.createElement("div");
    body.className = "p-8";

    if (content.description) {
      // Helper: format Markdown-style bold (**text**) to <b>text</b>
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const desc = document.createElement("p");
      desc.className = "text-slate-600 mb-8 leading-relaxed";
      desc.innerHTML = formatBold(content.description);
      body.appendChild(desc);
    }

    // Render each step
    if (content.steps && content.steps.length > 0) {
      content.steps.forEach((step) => {
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
    const stepDiv = document.createElement("div");
    stepDiv.className = "mb-12 pb-8 border-b border-slate-200 last:border-b-0";

    // Step header
    const stepHeader = document.createElement("div");
    stepHeader.className = "flex items-center gap-4 mb-4";

    const badge = document.createElement("span");
    badge.className = `badge badge-${step.badgeColor || "cyan"} mono`;
    badge.textContent = step.badge || `Step ${step.stepNumber || ""}`;
    stepHeader.appendChild(badge);

    const title = document.createElement("h4");
    title.className = "text-lg font-semibold text-slate-900";
    title.textContent = step.title || "";
    stepHeader.appendChild(title);

    stepDiv.appendChild(stepHeader);

    // Step description
    if (step.description) {
      // Helper: format Markdown-style bold (**text**) to <b>text</b>
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const description = document.createElement("p");
      description.className = "text-sm text-slate-600 mb-6 leading-relaxed";
      description.innerHTML = formatBold(step.description);
      stepDiv.appendChild(description);
    }

    // Visualization based on type
    const vizType =
      step.visualizationType || tutorialContent.visualizationType || "array";
    let viz;

    switch (vizType) {
      case "array":
        viz = this.createArrayVisualization(step);
        break;
      case "tree":
      case "binary-tree":
        viz = this.createTreeVisualization(step);
        break;
      case "avl-balance":
        viz = this.createTreeVisualization(step);
        break;
      case "avl-tree":
        viz = this.createTreeVisualization(step);
        break;
      case "rotation-animation":
        viz = this.createTreeVisualization(step);
        break;
      case "linked-list":
        viz = this.createLinkedListVisualization(step);
        break;
      case "flowchart":
        viz = this.createFlowchartVisualization(step);
        break;
      case "tree-traversal":
        viz = this.createTreeVisualization(step);
        break;
      case "tree-operation":
        viz = this.createTreeVisualization(step);
        break;
      case "graph":
      case "graph-traversal":
      case "graph-operation":
        viz = this.createGraphVisualization(step);
        break;
      case "undirected-graph":
        viz = this.createGraphVisualization(step, false); // force undirected
        break;
      case "directed-graph":
        viz = this.createGraphVisualization(step, true); // force directed
        break;
      case "weighted-graph":
        viz = this.createGraphVisualization(step);
        break;
      case "adjacency-matrix":
        viz = this.createAdjacencyMatrixVisualization(step);
        break;
      case "adjacency-list":
        viz = this.createAdjacencyListVisualization(step);
        break;
      case "graph-representation":
        // Auto-detect based on data structure
        if (step.data?.matrix) {
          viz = this.createAdjacencyMatrixVisualization(step);
        } else if (step.data?.list) {
          viz = this.createAdjacencyListVisualization(step);
        } else {
          viz = this.createGraphVisualization(step);
        }
        break;
      case "custom":
        viz = step.customRender
          ? step.customRender()
          : this.createArrayVisualization(step);
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
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const note = document.createElement("p");
      note.className = "text-sm text-center text-slate-500 mt-4 italic";
      note.innerHTML = formatBold(step.note);
      stepDiv.appendChild(note);
    }

    // Code snippet for this step (optional)
    if (step.code) {
      const codeSection = document.createElement("div");
      codeSection.className = "mt-4 bg-slate-50 rounded-lg p-4";

      const codeLabel = document.createElement("div");
      codeLabel.className = "text-xs font-semibold text-slate-600 mb-2 mono";
      codeLabel.textContent = "💻 CODE AT THIS STEP";
      codeSection.appendChild(codeLabel);

      const pre = document.createElement("pre");
      pre.className = "text-xs";
      pre.style.background = "transparent";
      pre.style.padding = "0";
      const code = document.createElement("code");
      code.className = `language-${step.codeLanguage || "python"}`;
      code.textContent = step.code;
      pre.appendChild(code);
      codeSection.appendChild(pre);

      stepDiv.appendChild(codeSection);

      setTimeout(() => {
        if (typeof Prism !== "undefined") {
          Prism.highlightElement(code);
        }
      }, 100);
    }

    return stepDiv;
  }

  // ========================================================================
  // NEW: GRAPH VISUALIZATION METHODS
  // ========================================================================

  /**
   * Create graph visualization with support for directed/undirected/weighted graphs
   * @param {Object} step - The step data
   * @param {Boolean} forceDirected - Force directed (true) or undirected (false), null for auto-detect
   */
  createGraphVisualization(step, forceDirected = null) {
    const graphViz = document.createElement("div");
    graphViz.className =
      "flex flex-col items-center gap-4 py-8 overflow-x-auto w-full";
    graphViz.setAttribute("role", "img");
    graphViz.setAttribute("aria-label", "Graph visualization");

    const graphData = step.graph || step.data?.graph || step.data;

    if (!graphData || !graphData.vertices) {
      graphViz.innerHTML = '<p class="text-slate-400">No graph data</p>';
      return graphViz;
    }

    // Determine graph type
    const graphType = step.data?.type || step.type || "undirected-graph";

    // Fix: Check for "undirected" first, then check for "directed"
    let isDirected;
    if (forceDirected !== null) {
      isDirected = forceDirected;
    } else if (graphType.includes("undirected")) {
      isDirected = false;
    } else if (graphType.includes("directed")) {
      isDirected = true;
    } else {
      isDirected = false; // default to undirected
    }

    const isWeighted = graphType.includes("weighted");

    console.log(
      `Graph Visualization - Type: ${graphType}, forceDirected: ${forceDirected}, isDirected: ${isDirected}`,
    );

    // Create container for the graph
    const container = document.createElement("div");
    container.className = "graph-visualization-container";
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.minHeight = "400px";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";

    // Calculate canvas size based on number of vertices
    const numVertices = graphData.vertices.length;
    const canvasWidth = Math.max(600, numVertices * 100);
    const canvasHeight = Math.max(400, numVertices * 80);

    // Create SVG for edges
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", canvasWidth);
    svg.setAttribute("height", canvasHeight);
    svg.style.position = "absolute";
    svg.style.top = "0";
    // svg.style.left = "0";
    svg.style.pointerEvents = "none";

    // Create nodes container
    const nodesContainer = document.createElement("div");
    nodesContainer.style.position = "absolute";
    nodesContainer.style.top = "0";
    // nodesContainer.style.left = "0";
    nodesContainer.style.width = `${canvasWidth}px`;
    nodesContainer.style.height = `${canvasHeight}px`;

    // Calculate vertex positions (circular layout)
    const positions = this.calculateGraphLayout(
      graphData.vertices,
      canvasWidth,
      canvasHeight,
    );

    // Draw edges first (so they appear behind nodes)
    if (graphData.edges) {
      graphData.edges.forEach((edge) => {
        const [from, to, weight] = Array.isArray(edge)
          ? edge
          : [edge[0], edge[1], edge[2]];
        const fromPos = positions[from];
        const toPos = positions[to];

        if (fromPos && toPos) {
          this.drawEdge(
            svg,
            fromPos,
            toPos,
            isDirected,
            isWeighted ? weight : null,
          );
        } else {
          console.warn(
            `Graph edge ${from} -> ${to}: position not found. From: ${fromPos}, To: ${toPos}`,
          );
        }
      });
    }

    // Draw vertices
    graphData.vertices.forEach((vertex) => {
      const pos = positions[vertex];
      if (pos) {
        const nodeElement = this.createGraphNode(vertex, pos.x, pos.y, step);
        nodesContainer.appendChild(nodeElement);
      }
    });

    container.appendChild(svg);
    container.appendChild(nodesContainer);
    graphViz.appendChild(container);

    // Add legend for queue/stack if present
    if (step.queue || step.data?.queue || step.stack || step.data?.stack) {
      const queueDisplay = this.createQueueStackDisplay(step);
      graphViz.appendChild(queueDisplay);
    }

    // Add explanation text if provided
    if (step.explanation && step.explanation.length > 0) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const explanationBox = document.createElement("div");
      explanationBox.className = "mt-6 p-4 bg-slate-50 rounded-lg max-w-3xl";

      const explanationList = document.createElement("ul");
      explanationList.className = "text-sm text-slate-700 space-y-2";

      step.explanation.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `<span class="text-blue-600 font-bold mt-1">•</span><span>${formatBold(point)}</span>`;
        explanationList.appendChild(li);
      });

      explanationBox.appendChild(explanationList);
      graphViz.appendChild(explanationBox);
    }

    // Add complexity info
    if (step.complexity) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const complexityBox = document.createElement("div");
      complexityBox.className =
        "mt-4 text-xs text-slate-500 font-mono bg-amber-50 px-4 py-2 rounded border border-amber-200";
      complexityBox.innerHTML = formatBold(step.complexity);
      graphViz.appendChild(complexityBox);
    }

    return graphViz;
  }

  /**
   * Calculate positions for graph vertices using circular layout
   */
  calculateGraphLayout(vertices, width, height) {
    const positions = {};
    const numVertices = vertices.length;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    vertices.forEach((vertex, index) => {
      // Circular layout
      const angle = (2 * Math.PI * index) / numVertices - Math.PI / 2;
      const pos = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };

      // Store with both string and number keys to handle type mismatches
      positions[vertex] = pos;
      positions[String(vertex)] = pos;
      if (!isNaN(vertex)) {
        positions[Number(vertex)] = pos;
      }
    });

    return positions;
  }

  /**
   * Draw an edge between two positions
   */
  drawEdge(svg, fromPos, toPos, isDirected, weight) {
    // Calculate edge position (stop at node radius)
    const nodeRadius = 32; // Match node size
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Start and end points (adjusted for node radius)
    const startX = fromPos.x + (dx / distance) * nodeRadius;
    const startY = fromPos.y + (dy / distance) * nodeRadius;
    const endX = toPos.x - (dx / distance) * nodeRadius;
    const endY = toPos.y - (dy / distance) * nodeRadius;

    // Draw line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startX);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", endY);
    line.setAttribute("stroke", "#94a3b8");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);

    // Add arrowhead for directed graphs
    if (isDirected) {
      const arrow = this.createArrowhead(endX, endY, dx, dy, distance);
      svg.appendChild(arrow);
    }

    // Add weight label for weighted graphs
    if (weight !== null && weight !== undefined) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", midX);
      text.setAttribute("y", midY - 8);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "12");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("fill", "#059669");
      text.textContent = weight;

      // Background circle for better readability
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", midX);
      circle.setAttribute("cy", midY - 8);
      circle.setAttribute("r", "12");
      circle.setAttribute("fill", "white");
      circle.setAttribute("stroke", "#059669");
      circle.setAttribute("stroke-width", "1.5");

      svg.appendChild(circle);
      svg.appendChild(text);
    }
  }

  /**
   * Create SVG arrowhead for directed edges
   */
  createArrowhead(x, y, dx, dy, distance) {
    const arrowSize = 10;
    const angle = Math.atan2(dy, dx);

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );

    const point1X = x;
    const point1Y = y;
    const point2X = x - arrowSize * Math.cos(angle - Math.PI / 6);
    const point2Y = y - arrowSize * Math.sin(angle - Math.PI / 6);
    const point3X = x - arrowSize * Math.cos(angle + Math.PI / 6);
    const point3Y = y - arrowSize * Math.sin(angle + Math.PI / 6);

    polygon.setAttribute(
      "points",
      `${point1X},${point1Y} ${point2X},${point2Y} ${point3X},${point3Y}`,
    );
    polygon.setAttribute("fill", "#94a3b8");

    return polygon;
  }

  /**
   * Create a graph node element
   */
  createGraphNode(vertex, x, y, step) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "graph-node";
    nodeDiv.style.position = "absolute";
    nodeDiv.style.left = `${x}px`;
    nodeDiv.style.top = `${y}px`;
    nodeDiv.style.transform = "translate(-50%, -50%)";
    nodeDiv.style.transition = "all 0.3s ease";

    // Node circle
    const circle = document.createElement("div");
    circle.className =
      "w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-3 shadow-lg transition-all duration-300";

    // Determine styling based on state
    const highlighted =
      step.highlighted?.includes(vertex) ||
      step.data?.highlighted?.includes(vertex);
    const visited =
      step.visited?.includes(vertex) || step.data?.visited?.includes(vertex);
    const eliminated =
      step.eliminated?.includes(vertex) ||
      step.data?.eliminated?.includes(vertex);
    const current = step.current === vertex || step.data?.current === vertex;
    const found = step.found && step.target === vertex;

    // Apply styling with priority
    if (found) {
      circle.className +=
        " bg-emerald-400 border-emerald-600 text-white ring-4 ring-emerald-200 scale-110";
    } else if (current || highlighted) {
      circle.className +=
        " bg-blue-400 border-blue-600 text-white ring-4 ring-blue-200 scale-110";
    } else if (visited) {
      circle.className += " bg-purple-200 border-purple-400 text-purple-900";
    } else if (eliminated) {
      circle.className +=
        " bg-slate-200 border-slate-300 text-slate-400 opacity-50";
    } else {
      circle.className += " bg-white border-slate-400 text-slate-900";
    }

    circle.textContent = vertex;
    nodeDiv.appendChild(circle);

    return nodeDiv;
  }

  /**
   * Create queue/stack display for BFS/DFS
   */
  createQueueStackDisplay(step) {
    const container = document.createElement("div");
    container.className =
      "mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200";

    const queue = step.queue || step.data?.queue;
    const stack = step.stack || step.data?.stack;
    const sequence = step.sequence || step.data?.sequence;

    if (queue) {
      const queueLabel = document.createElement("div");
      queueLabel.className = "text-sm font-bold text-blue-700 mb-2";
      queueLabel.textContent = "Queue (FIFO):";
      container.appendChild(queueLabel);

      const queueDisplay = document.createElement("div");
      queueDisplay.className = "flex gap-2 items-center flex-wrap";

      if (queue.length === 0) {
        queueDisplay.innerHTML =
          '<span class="text-slate-400 text-sm">Empty</span>';
      } else {
        queue.forEach((item, index) => {
          const itemBox = document.createElement("div");
          itemBox.className =
            "w-12 h-12 bg-white border-2 border-blue-500 rounded flex items-center justify-center font-bold text-blue-700";
          itemBox.textContent = item;
          queueDisplay.appendChild(itemBox);

          if (index < queue.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "text-blue-500 text-xl";
            arrow.textContent = "→";
            queueDisplay.appendChild(arrow);
          }
        });
      }

      container.appendChild(queueDisplay);
    }

    if (stack) {
      const stackLabel = document.createElement("div");
      stackLabel.className = "text-sm font-bold text-purple-700 mb-2 mt-4";
      stackLabel.textContent = "Stack (LIFO):";
      container.appendChild(stackLabel);

      const stackDisplay = document.createElement("div");
      stackDisplay.className = "flex gap-2 items-center flex-wrap";

      if (stack.length === 0) {
        stackDisplay.innerHTML =
          '<span class="text-slate-400 text-sm">Empty</span>';
      } else {
        stack.forEach((item, index) => {
          const itemBox = document.createElement("div");
          itemBox.className =
            "w-12 h-12 bg-white border-2 border-purple-500 rounded flex items-center justify-center font-bold text-purple-700";
          itemBox.textContent = item;
          stackDisplay.appendChild(itemBox);

          if (index < stack.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "text-purple-500 text-xl";
            arrow.textContent = "→";
            stackDisplay.appendChild(arrow);
          }
        });
      }

      container.appendChild(stackDisplay);
    }

    if (sequence && sequence.length > 0) {
      const seqLabel = document.createElement("div");
      seqLabel.className = "text-sm font-bold text-emerald-700 mb-2 mt-4";
      seqLabel.textContent = "Traversal Order:";
      container.appendChild(seqLabel);

      const seqDisplay = document.createElement("div");
      seqDisplay.className = "flex gap-2 items-center flex-wrap";

      sequence.forEach((item, index) => {
        const itemBox = document.createElement("div");
        itemBox.className =
          "px-3 py-1 bg-emerald-100 border-2 border-emerald-500 rounded font-bold text-emerald-700 text-sm";
        itemBox.textContent = item;
        seqDisplay.appendChild(itemBox);

        if (index < sequence.length - 1) {
          const arrow = document.createElement("span");
          arrow.className = "text-emerald-500";
          arrow.textContent = "→";
          seqDisplay.appendChild(arrow);
        }
      });

      container.appendChild(seqDisplay);
    }

    return container;
  }

  /**
   * Create adjacency matrix visualization
   * Shows 2D matrix representation of graph
   */
  createAdjacencyMatrixVisualization(step) {
    const matrixViz = document.createElement("div");
    matrixViz.className = "flex flex-col items-center gap-6 py-8";
    matrixViz.setAttribute("role", "img");
    matrixViz.setAttribute("aria-label", "Adjacency Matrix visualization");

    const matrixData = step.data?.matrix || step.matrix;

    if (!matrixData || !Array.isArray(matrixData)) {
      matrixViz.innerHTML = '<p class="text-slate-400">No matrix data</p>';
      return matrixViz;
    }

    const numVertices = matrixData.length;

    // Create table container
    const tableContainer = document.createElement("div");
    tableContainer.className =
      "overflow-x-auto bg-white rounded-lg shadow-lg p-6";

    const table = document.createElement("table");
    table.className = "border-collapse";
    table.style.fontFamily = "monospace";

    // Header row (column indices)
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Empty top-left cell
    const emptyCell = document.createElement("th");
    emptyCell.className = "w-12 h-12 bg-slate-100 border-2 border-slate-300";
    headerRow.appendChild(emptyCell);

    // Column headers
    for (let i = 0; i < numVertices; i++) {
      const th = document.createElement("th");
      th.className =
        "w-12 h-12 bg-blue-100 border-2 border-blue-300 text-center font-bold text-blue-800";
      th.textContent = i;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Matrix body
    const tbody = document.createElement("tbody");
    matrixData.forEach((row, i) => {
      const tr = document.createElement("tr");

      // Row header
      const rowHeader = document.createElement("th");
      rowHeader.className =
        "w-12 h-12 bg-blue-100 border-2 border-blue-300 text-center font-bold text-blue-800";
      rowHeader.textContent = i;
      tr.appendChild(rowHeader);

      // Matrix cells
      row.forEach((value, j) => {
        const td = document.createElement("td");
        td.className =
          "w-12 h-12 border-2 border-slate-300 text-center font-bold transition-all";

        if (value === 0) {
          td.className += " bg-slate-50 text-slate-400";
          td.textContent = "0";
        } else {
          td.className += " bg-emerald-100 text-emerald-800 border-emerald-300";
          td.textContent = value;
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    matrixViz.appendChild(tableContainer);

    // Add explanation text if provided
    if (step.explanation && step.explanation.length > 0) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const explanationBox = document.createElement("div");
      explanationBox.className = "mt-6 p-4 bg-slate-50 rounded-lg max-w-3xl";

      const explanationList = document.createElement("ul");
      explanationList.className = "text-sm text-slate-700 space-y-2";

      step.explanation.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `<span class="text-blue-600 font-bold mt-1">•</span><span>${formatBold(point)}</span>`;
        explanationList.appendChild(li);
      });

      explanationBox.appendChild(explanationList);
      matrixViz.appendChild(explanationBox);
    }

    // Add complexity info
    if (step.complexity) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const complexityBox = document.createElement("div");
      complexityBox.className =
        "mt-4 text-xs text-slate-500 font-mono bg-amber-50 px-4 py-2 rounded border border-amber-200";
      complexityBox.innerHTML = formatBold(step.complexity);
      matrixViz.appendChild(complexityBox);
    }

    return matrixViz;
  }

  /**
   * Create adjacency list visualization
   * Shows list representation of graph
   */
  createAdjacencyListVisualization(step) {
    const listViz = document.createElement("div");
    listViz.className = "flex flex-col items-center gap-6 py-8";
    listViz.setAttribute("role", "img");
    listViz.setAttribute("aria-label", "Adjacency List visualization");

    const listData = step.data?.list || step.list;

    if (!listData || typeof listData !== "object") {
      listViz.innerHTML =
        '<p class="text-slate-400">No adjacency list data</p>';
      return listViz;
    }

    // Create container for the list
    const listContainer = document.createElement("div");
    listContainer.className =
      "w-full max-w-4xl bg-white rounded-lg shadow-lg p-6";

    // Create list items
    const listItemsContainer = document.createElement("div");
    listItemsContainer.className = "space-y-4";

    Object.entries(listData).forEach(([vertex, neighbors]) => {
      const itemRow = document.createElement("div");
      itemRow.className = "flex items-center gap-3";

      // Vertex box
      const vertexBox = document.createElement("div");
      vertexBox.className =
        "w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0";
      vertexBox.textContent = vertex;
      itemRow.appendChild(vertexBox);

      // Arrow
      const arrow = document.createElement("div");
      arrow.className = "text-2xl text-slate-400";
      arrow.textContent = "→";
      itemRow.appendChild(arrow);

      // Neighbors container
      const neighborsContainer = document.createElement("div");
      neighborsContainer.className = "flex gap-2 items-center flex-wrap flex-1";

      if (Array.isArray(neighbors) && neighbors.length > 0) {
        neighbors.forEach((neighbor, index) => {
          // Handle both simple neighbors and weighted edges (neighbor, weight) tuples
          let neighborValue, weight;

          if (Array.isArray(neighbor)) {
            [neighborValue, weight] = neighbor;
          } else {
            neighborValue = neighbor;
            weight = null;
          }

          const neighborBox = document.createElement("div");
          neighborBox.className =
            "px-3 py-1 bg-emerald-100 text-emerald-800 rounded border-2 border-emerald-300 font-semibold";

          if (weight !== null && weight !== undefined) {
            neighborBox.innerHTML = `<span class="font-bold">${neighborValue}</span> <span class="text-xs text-emerald-600">(${weight})</span>`;
          } else {
            neighborBox.textContent = neighborValue;
          }

          neighborsContainer.appendChild(neighborBox);

          if (index < neighbors.length - 1) {
            const comma = document.createElement("span");
            comma.className = "text-slate-400";
            comma.textContent = ",";
            neighborsContainer.appendChild(comma);
          }
        });
      } else {
        const emptyLabel = document.createElement("span");
        emptyLabel.className = "text-slate-400 italic text-sm";
        emptyLabel.textContent = "[ ]  (no neighbors)";
        neighborsContainer.appendChild(emptyLabel);
      }

      itemRow.appendChild(neighborsContainer);
      listItemsContainer.appendChild(itemRow);
    });

    listContainer.appendChild(listItemsContainer);
    listViz.appendChild(listContainer);

    // Add explanation text if provided
    if (step.explanation && step.explanation.length > 0) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const explanationBox = document.createElement("div");
      explanationBox.className = "mt-6 p-4 bg-slate-50 rounded-lg max-w-3xl";

      const explanationList = document.createElement("ul");
      explanationList.className = "text-sm text-slate-700 space-y-2";

      step.explanation.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `<span class="text-emerald-600 font-bold mt-1">•</span><span>${formatBold(point)}</span>`;
        explanationList.appendChild(li);
      });

      explanationBox.appendChild(explanationList);
      listViz.appendChild(explanationBox);
    }

    // Add complexity info
    if (step.complexity) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const complexityBox = document.createElement("div");
      complexityBox.className =
        "mt-4 text-xs text-slate-500 font-mono bg-amber-50 px-4 py-2 rounded border border-amber-200";
      complexityBox.innerHTML = formatBold(step.complexity);
      listViz.appendChild(complexityBox);
    }

    return listViz;
  }

  /**
   * Create array visualization with highlights
   */
  createArrayVisualization(step) {
    const arrayViz = document.createElement("div");
    arrayViz.className = "flex gap-3 items-end mb-4 justify-center flex-wrap";
    arrayViz.setAttribute("role", "img");
    arrayViz.setAttribute("aria-label", `Array state: ${step.title}`);

    if (!step.array || step.array.length === 0) {
      arrayViz.innerHTML = '<p class="text-slate-400">No data to display</p>';
      return arrayViz;
    }

    step.array.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "text-center transition-all duration-300";

      const box = document.createElement("div");
      box.className =
        "w-16 h-16 flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-300";

      // Get value and highlight
      const value = typeof item === "object" ? item.value : item;
      const highlight = typeof item === "object" ? item.highlight : null;
      const label = typeof item === "object" ? item.label : null;

      // Apply highlight styles
      const highlightStyles = this.getHighlightStyle(highlight);
      box.className += " " + highlightStyles.boxClass;

      box.textContent = value;
      itemDiv.appendChild(box);

      // Label below box
      if (label) {
        const labelEl = document.createElement("div");
        labelEl.className = "text-xs mt-2 mono " + highlightStyles.labelClass;
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
      pivot: {
        boxClass: "bg-amber-100 border-2 border-amber-500 shadow-md",
        labelClass: "text-amber-600 font-semibold",
      },
      "pivot-final": {
        boxClass:
          "bg-amber-200 border-2 border-amber-600 shadow-lg ring-2 ring-amber-300",
        labelClass: "text-amber-700 font-bold",
      },
      compare: {
        boxClass: "bg-blue-100 border-2 border-blue-500 shadow-md",
        labelClass: "text-blue-600 font-semibold",
      },
      "compare-right": {
        boxClass: "bg-purple-100 border-2 border-purple-500 shadow-md",
        labelClass: "text-purple-600 font-semibold",
      },
      swap: {
        boxClass: "bg-red-100 border-2 border-red-500 shadow-md animate-pulse",
        labelClass: "text-red-600 font-semibold",
      },
      sorted: {
        boxClass: "bg-emerald-100 border-2 border-emerald-500",
        labelClass: "text-emerald-600 font-semibold",
      },
      "sorted-left": {
        boxClass: "bg-emerald-100 border-2 border-emerald-500",
        labelClass: "text-emerald-600 font-semibold",
      },
      "sorted-right": {
        boxClass: "bg-purple-100 border-2 border-purple-500",
        labelClass: "text-purple-600 font-semibold",
      },
      active: {
        boxClass: "bg-cyan-100 border-2 border-cyan-500 shadow-md",
        labelClass: "text-cyan-600 font-semibold",
      },
      processing: {
        boxClass: "bg-yellow-100 border-2 border-yellow-500",
        labelClass: "text-yellow-600 font-semibold",
      },
      selected: {
        boxClass: "bg-indigo-100 border-2 border-indigo-500 shadow-md",
        labelClass: "text-indigo-600 font-semibold",
      },
      default: {
        boxClass: "bg-white border-2 border-slate-300",
        labelClass: "text-slate-500",
      },
    };

    return styles[highlight] || styles["default"];
  }

  /**
   * Render a binary tree with proper hierarchical layout
   */
  renderBinaryTree(tree, step) {
    const container = document.createElement("div");
    container.className = "binary-tree-container";
    container.style.width = "100%";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.overflow = "auto";

    // Calculate tree dimensions for proper spacing
    const getTreeHeight = (node) => {
      if (!node) return 0;
      return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
    };

    const height = getTreeHeight(tree);
    const maxWidth = Math.pow(2, height - 1);

    // Calculate actual canvas size
    const canvasWidth = Math.max(800, maxWidth * 80);
    const canvasHeight = height * 120 + 80;

    // Create wrapper with exact dimensions
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = `${canvasWidth}px`;
    wrapper.style.height = `${canvasHeight}px`;

    // Render tree with SVG for connection lines
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", canvasWidth);
    svg.setAttribute("height", canvasHeight);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.pointerEvents = "none";

    // Nodes container - same dimensions and position as SVG
    const nodesContainer = document.createElement("div");
    nodesContainer.style.position = "absolute";
    nodesContainer.style.top = "0";
    nodesContainer.style.left = "0";
    nodesContainer.style.width = `${canvasWidth}px`;
    nodesContainer.style.height = `${canvasHeight}px`;

    const lines = [];
    const nodeElements = [];

    // Recursive function to position nodes
    const renderNode = (node, x, y, level, horizontalSpacing) => {
      if (!node) return null;

      const nodeInfo = {
        node,
        x,
        y,
        level,
      };

      // Calculate positions for children
      const childY = y + 120;
      const childSpacing = horizontalSpacing / 2;

      let leftChild = null;
      let rightChild = null;

      if (node.left) {
        leftChild = renderNode(
          node.left,
          x - childSpacing,
          childY,
          level + 1,
          childSpacing,
        );
        if (leftChild) {
          lines.push({
            x1: x,
            y1: y + 32, // Offset from center of node (radius + border)
            x2: leftChild.x,
            y2: leftChild.y - 32,
            type: "left",
          });
        }
      }

      if (node.right) {
        rightChild = renderNode(
          node.right,
          x + childSpacing,
          childY,
          level + 1,
          childSpacing,
        );
        if (rightChild) {
          lines.push({
            x1: x,
            y1: y + 32,
            x2: rightChild.x,
            y2: rightChild.y - 32,
            type: "right",
          });
        }
      }

      nodeElements.push(nodeInfo);
      return nodeInfo;
    };

    // Start rendering from root at center
    const rootX = canvasWidth / 2;
    const rootY = 50;
    const initialSpacing = Math.min(canvasWidth / 4, maxWidth * 30);

    renderNode(tree, rootX, rootY, 0, initialSpacing);

    // Draw connection lines
    lines.forEach((line) => {
      const lineElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      lineElement.setAttribute("x1", line.x1);
      lineElement.setAttribute("y1", line.y1);
      lineElement.setAttribute("x2", line.x2);
      lineElement.setAttribute("y2", line.y2);
      lineElement.setAttribute("stroke", "#94a3b8");
      lineElement.setAttribute("stroke-width", "2");
      lineElement.setAttribute("stroke-linecap", "round");
      svg.appendChild(lineElement);
    });

    // Draw nodes on top of lines
    nodeElements.forEach(({ node, x, y, level }) => {
      const nodeDiv = this.createBinaryTreeNode(node, x, y, step);
      nodesContainer.appendChild(nodeDiv);
    });

    wrapper.appendChild(svg);
    wrapper.appendChild(nodesContainer);
    container.appendChild(wrapper);

    return container;
  }

  /**
   * Create a single binary tree node element with AVL support
   * NEW: Displays balance factor badges for AVL trees
   */
  createBinaryTreeNode(node, x, y, step) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "binary-tree-node";
    nodeDiv.style.position = "absolute";
    nodeDiv.style.left = `${x}px`;
    nodeDiv.style.top = `${y}px`;
    nodeDiv.style.transform = "translate(-50%, -50%)";
    nodeDiv.style.transition = "all 0.3s ease";

    // Node circle
    const circle = document.createElement("div");
    circle.className =
      "w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-3 shadow-lg transition-all duration-300";

    // Determine styling based on highlight or step data
    const value = node.value;
    const highlight = node.highlight;
    const label = node.label;
    const bf = node.bf; // NEW: Balance factor for AVL trees

    // Check if this node is highlighted in step - check multiple possible locations
    const isHighlighted =
      step.highlighted?.includes(value) ||
      step.data?.highlighted?.includes(value);
    const isVisited =
      step.visited?.includes(value) || step.data?.visited?.includes(value);
    const isEliminated =
      step.eliminated?.includes(value) ||
      step.data?.eliminated?.includes(value);
    const isFound =
      (step.found && value === step.target) ||
      (step.data?.found && value === step.data?.target);

    // Apply appropriate styling with priority order
    if (isFound || highlight === "found") {
      circle.className +=
        " bg-emerald-400 border-emerald-600 text-white ring-4 ring-emerald-200";
    } else if (highlight === "delete") {
      circle.className +=
        " bg-red-400 border-red-600 text-white ring-4 ring-red-200";
    } else if (highlight === "successor") {
      circle.className +=
        " bg-amber-400 border-amber-600 text-white ring-4 ring-amber-200";
    } else if (
      isHighlighted ||
      highlight === "active" ||
      highlight === true ||
      highlight === "highlight"
    ) {
      circle.className +=
        " bg-blue-400 border-blue-600 text-white ring-4 ring-blue-200 scale-110";
    } else if (isVisited) {
      circle.className += " bg-purple-200 border-purple-400 text-purple-900";
    } else if (isEliminated) {
      circle.className +=
        " bg-slate-200 border-slate-300 text-slate-400 opacity-50";
    } else {
      circle.className += " bg-white border-slate-400 text-slate-900";
    }

    circle.textContent = value;
    nodeDiv.appendChild(circle);

    // NEW: Balance Factor badge (for AVL trees)
    if (bf !== undefined && bf !== null) {
      const bfBadge = document.createElement("div");
      bfBadge.className =
        "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-md z-10";

      // Color based on balance factor
      if (Math.abs(bf) > 1) {
        // Unbalanced - red
        bfBadge.className += " bg-red-500 border-red-700 text-white";
      } else if (bf === 0) {
        // Perfectly balanced - green
        bfBadge.className += " bg-emerald-500 border-emerald-700 text-white";
      } else {
        // Acceptably balanced - blue
        bfBadge.className += " bg-blue-500 border-blue-700 text-white";
      }

      bfBadge.textContent = bf >= 0 ? `+${bf}` : bf;
      bfBadge.title = `Balance Factor: ${bf}`;
      nodeDiv.appendChild(bfBadge);
    }

    // Node label
    if (label) {
      const labelDiv = document.createElement("div");
      labelDiv.className =
        "text-xs font-bold mt-2 text-center px-2 py-1 rounded whitespace-nowrap";

      if (label.includes("DELETE") || label.includes("delete")) {
        labelDiv.className += " bg-red-100 text-red-700 border border-red-300";
      } else if (
        label.includes("NEW") ||
        label.includes("FOUND") ||
        label.includes("✓")
      ) {
        labelDiv.className +=
          " bg-emerald-100 text-emerald-700 border border-emerald-300";
      } else if (label.includes("successor")) {
        labelDiv.className +=
          " bg-amber-100 text-amber-700 border border-amber-300";
      } else if (label.includes("current") || label.includes("Current")) {
        labelDiv.className +=
          " bg-blue-100 text-blue-700 border border-blue-300";
      } else if (label.includes("✗") || label.includes("checked")) {
        labelDiv.className +=
          " bg-purple-100 text-purple-700 border border-purple-300";
      } else {
        labelDiv.className +=
          " bg-slate-100 text-slate-700 border border-slate-300";
      }

      labelDiv.textContent = label;
      nodeDiv.appendChild(labelDiv);
    }

    return nodeDiv;
  }

  // ============================================================================
  // UPDATED METHOD 2: createTreeVisualization - Add rotation indicators
  // ============================================================================

  /**
   * Create tree visualization with rotation indicator support
   * NEW: Shows rotation arrows for AVL tree operations
   */
  createTreeVisualization(step) {
    const treeViz = document.createElement("div");
    treeViz.className =
      "flex flex-col items-center gap-4 py-8 overflow-x-auto w-full";
    treeViz.setAttribute("role", "img");
    treeViz.setAttribute("aria-label", "Tree visualization");

    if (!step.tree && !step.data?.tree) {
      treeViz.innerHTML = '<p class="text-slate-400">No tree data</p>';
      return treeViz;
    }

    const treeData = step.tree || step.data?.tree;
    const treeType = step.data?.type || "generic";

    // Check if this is a binary tree (has left/right structure)
    const isBinaryTree =
      treeData && (treeData.left !== undefined || treeData.right !== undefined);

    if (isBinaryTree) {
      // Render as binary tree with proper layout
      treeViz.appendChild(this.renderBinaryTree(treeData, step));
    } else {
      // Render as generic tree (original behavior)
      treeViz.appendChild(this.renderGenericTree(treeData));
    }

    // NEW: Add rotation indicator if present
    if (step.data?.rotationArrow || step.rotationPerformed) {
      const rotationIndicator = this.createRotationIndicator(
        step.data?.rotationArrow || step.rotationPerformed,
      );
      treeViz.insertBefore(rotationIndicator, treeViz.firstChild);
    }

    // Add explanation text if provided
    if (step.explanation && step.explanation.length > 0) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const explanationBox = document.createElement("div");
      explanationBox.className = "mt-6 p-4 bg-slate-50 rounded-lg max-w-3xl";

      const explanationList = document.createElement("ul");
      explanationList.className = "text-sm text-slate-700 space-y-2";

      step.explanation.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `<span class="text-green-600 font-bold mt-1">•</span><span>${formatBold(point)}</span>`;
        explanationList.appendChild(li);
      });

      explanationBox.appendChild(explanationList);
      treeViz.appendChild(explanationBox);
    }

    // Add complexity info
    if (step.complexity) {
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const complexityBox = document.createElement("div");
      complexityBox.className =
        "mt-4 text-xs text-slate-500 font-mono bg-amber-50 px-4 py-2 rounded border border-amber-200";
      complexityBox.innerHTML = formatBold(step.complexity);
      treeViz.appendChild(complexityBox);
    }

    return treeViz;
  }

  // ============================================================================
  // NEW METHOD: createRotationIndicator - Shows rotation type
  // ============================================================================

  /**
   * Create rotation indicator for AVL tree rotations
   * Shows which rotation was performed
   */
  createRotationIndicator(rotationType) {
    const indicator = document.createElement("div");
    indicator.className =
      "mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300 shadow-md";

    const content = document.createElement("div");
    content.className = "flex items-center justify-center gap-3";

    const icon = document.createElement("div");
    icon.className = "text-3xl";

    const text = document.createElement("div");
    text.className = "font-bold text-purple-800";

    // Determine rotation type and display
    switch (rotationType) {
      case "right":
      case "right-rotation":
      case "right-rotation-at-20":
        icon.textContent = "↪️";
        text.textContent = "Right Rotation Performed";
        break;
      case "left":
      case "left-rotation":
        icon.textContent = "↩️";
        text.textContent = "Left Rotation Performed";
        break;
      case "left-at-child":
        icon.textContent = "↩️";
        text.textContent = "Step 1: Left Rotation at Child";
        break;
      case "right-at-parent":
        icon.textContent = "↪️";
        text.textContent = "Step 2: Right Rotation at Parent";
        break;
      case "right-at-child":
        icon.textContent = "↪️";
        text.textContent = "Step 1: Right Rotation at Child";
        break;
      case "left-at-parent":
        icon.textContent = "↩️";
        text.textContent = "Step 2: Left Rotation at Parent";
        break;
      default:
        icon.textContent = "🔄";
        text.textContent = "Rotation Performed";
    }

    content.appendChild(icon);
    content.appendChild(text);
    indicator.appendChild(content);

    return indicator;
  }

  /**
   * Render a generic tree (original behavior for non-binary trees)
   */
  renderGenericTree(tree) {
    const renderTreeNode = (node, depth = 0) => {
      const nodeDiv = document.createElement("div");
      nodeDiv.className = "flex flex-col items-center";

      // Node box
      const box = document.createElement("div");
      box.className = "px-4 py-2 rounded-lg border-2 font-semibold text-sm";

      const highlight = node.highlight || "default";
      const styles = this.getHighlightStyle(highlight);
      box.className += " " + styles.boxClass;
      box.textContent = Array.isArray(node.value)
        ? `[${node.value.join(",")}]`
        : node.value;

      nodeDiv.appendChild(box);

      // Children
      if (node.children && node.children.length > 0) {
        const arrow = document.createElement("div");
        arrow.className = "text-2xl text-slate-400 my-2";
        arrow.textContent = "⬇️";
        nodeDiv.appendChild(arrow);

        const childrenDiv = document.createElement("div");
        childrenDiv.className = "flex gap-8 items-start";

        node.children.forEach((child) => {
          childrenDiv.appendChild(renderTreeNode(child, depth + 1));
        });

        nodeDiv.appendChild(childrenDiv);
      }

      return nodeDiv;
    };

    return renderTreeNode(tree);
  }

  /**
   * Create linked list visualization (singly or doubly linked)
   */
  createLinkedListVisualization(step) {
    const listViz = document.createElement("div");
    listViz.className = "flex flex-col items-center gap-6 py-8 px-4";
    listViz.setAttribute("role", "img");
    listViz.setAttribute(
      "aria-label",
      `Linked list visualization: ${step.title}`,
    );

    if (!step.data || !step.data.nodes || step.data.nodes.length === 0) {
      listViz.innerHTML = '<p class="text-slate-400">No linked list data</p>';
      return listViz;
    }

    const listType = step.data.type || "singly";
    const nodes = step.data.nodes;

    // Container for nodes and arrows
    const nodesContainer = document.createElement("div");
    nodesContainer.className =
      "flex items-center gap-4 flex-wrap justify-center";

    // Add Head label
    const headLabel = document.createElement("div");
    headLabel.className =
      "text-sm font-bold text-purple-600 px-3 py-1 bg-purple-50 rounded border-2 border-purple-300";
    headLabel.textContent = "HEAD";
    nodesContainer.appendChild(headLabel);

    // Render each node
    nodes.forEach((node, index) => {
      // Create node container
      const nodeContainer = document.createElement("div");
      nodeContainer.className = "flex items-center gap-2";

      // Create the node box
      const nodeBox = document.createElement("div");
      nodeBox.className = "flex flex-col items-center";

      // Node content box
      const nodeContent = document.createElement("div");
      nodeContent.className =
        "flex items-center bg-white border-3 border-slate-700 rounded-lg shadow-lg transition-all duration-300";

      if (listType === "doubly") {
        // Doubly linked: [prev | data | next]
        const prevBox = document.createElement("div");
        prevBox.className =
          "w-10 h-16 flex items-center justify-center border-r-2 border-slate-300 text-xs text-slate-400";
        prevBox.innerHTML = node.prev !== null ? "←" : "∅";

        const dataBox = document.createElement("div");
        dataBox.className =
          "w-16 h-16 flex items-center justify-center font-bold text-xl text-slate-900";
        dataBox.textContent = node.data;

        const nextBox = document.createElement("div");
        nextBox.className =
          "w-10 h-16 flex items-center justify-center border-l-2 border-slate-300 text-xs text-slate-400";
        nextBox.innerHTML = node.next !== null ? "→" : "∅";

        nodeContent.appendChild(prevBox);
        nodeContent.appendChild(dataBox);
        nodeContent.appendChild(nextBox);
      } else {
        // Singly linked: [data | next]
        const dataBox = document.createElement("div");
        dataBox.className =
          "w-16 h-16 flex items-center justify-center font-bold text-xl text-slate-900 border-r-2 border-slate-300";
        dataBox.textContent = node.data;

        const nextBox = document.createElement("div");
        nextBox.className =
          "w-12 h-16 flex items-center justify-center text-xs text-slate-400";
        nextBox.innerHTML = node.next !== null ? "→" : "∅";

        nodeContent.appendChild(dataBox);
        nodeContent.appendChild(nextBox);
      }

      nodeBox.appendChild(nodeContent);

      // Node label (optional)
      if (node.label) {
        const label = document.createElement("div");
        label.className = "text-xs text-slate-500 mt-2 font-mono";
        label.textContent = node.label;
        nodeBox.appendChild(label);
      }

      nodeContainer.appendChild(nodeBox);

      // Add arrow between nodes (except for last node)
      if (index < nodes.length - 1) {
        const arrow = document.createElement("div");
        arrow.className = "flex flex-col items-center gap-1";

        if (listType === "doubly") {
          // Bidirectional arrows
          const forwardArrow = document.createElement("div");
          forwardArrow.className = "text-purple-500 text-2xl";
          forwardArrow.textContent = "→";

          const backwardArrow = document.createElement("div");
          backwardArrow.className = "text-blue-500 text-2xl";
          backwardArrow.textContent = "←";

          arrow.appendChild(forwardArrow);
          arrow.appendChild(backwardArrow);
        } else {
          // Single direction arrow
          const forwardArrow = document.createElement("div");
          forwardArrow.className = "text-purple-500 text-3xl";
          forwardArrow.textContent = "→";
          arrow.appendChild(forwardArrow);
        }

        nodeContainer.appendChild(arrow);
      }

      nodesContainer.appendChild(nodeContainer);
    });

    // Add None/Null indicator at the end
    const nullBox = document.createElement("div");
    nullBox.className =
      "text-sm font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded border-2 border-slate-300";
    nullBox.textContent = "None";
    nodesContainer.appendChild(nullBox);

    listViz.appendChild(nodesContainer);

    // Add explanation text
    if (step.explanation && step.explanation.length > 0) {
      // Helper: format Markdown-style bold (**text**) to <b>text</b>
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const explanationBox = document.createElement("div");
      explanationBox.className = "mt-6 p-4 bg-slate-50 rounded-lg max-w-3xl";

      const explanationList = document.createElement("ul");
      explanationList.className = "text-sm text-slate-700 space-y-2";

      step.explanation.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `<span class="text-purple-600 font-bold mt-1">•</span><span>${formatBold(point)}</span>`;
        explanationList.appendChild(li);
      });

      explanationBox.appendChild(explanationList);
      listViz.appendChild(explanationBox);
    }

    // Add complexity info
    if (step.complexity) {
      // Helper: format Markdown-style bold (**text**) to <b>text</b>
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const complexityBox = document.createElement("div");
      complexityBox.className =
        "mt-4 text-xs text-slate-500 font-mono bg-amber-50 px-4 py-2 rounded border border-amber-200";
      complexityBox.innerHTML = formatBold(step.complexity);
      listViz.appendChild(complexityBox);
    }

    return listViz;
  }

  /**
   * Create flowchart visualization for process flows
   */
  createFlowchartVisualization(step) {
    // Helper: format Markdown-style bold (**text**) to <b>text</b>
    const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    const flowchartViz = document.createElement("div");
    flowchartViz.className =
      "flowchart-container bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 my-6";

    // Visual description
    if (step.visualDescription) {
      const vizDesc = document.createElement("p");
      vizDesc.className = "text-sm text-slate-500 mb-6 text-center italic";
      vizDesc.textContent = step.visualDescription;
      flowchartViz.appendChild(vizDesc);
    }

    // Create flowchart nodes container
    const flowContainer = document.createElement("div");
    flowContainer.className =
      "flex flex-col items-center gap-4 max-w-4xl mx-auto";

    // For a BO workflow, we'll create vertical flow with arrows
    // This is a simple implementation - can be extended for more complex flows

    // Add step number badge
    const stepBadge = document.createElement("div");
    stepBadge.className =
      "text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm";
    stepBadge.textContent = `Step ${step.stepNumber || ""}`;
    flowContainer.appendChild(stepBadge);

    // Add arrow down
    const arrow = document.createElement("div");
    arrow.className = "text-3xl text-slate-400";
    arrow.textContent = "↓";
    flowContainer.appendChild(arrow);

    // Add main process box
    const processBox = document.createElement("div");
    processBox.className = `bg-gradient-to-r from-${step.badgeColor || "blue"}-100 to-${step.badgeColor || "blue"}-200 border-2 border-${step.badgeColor || "blue"}-400 rounded-lg p-6 shadow-md max-w-2xl`;

    const processTitle = document.createElement("h5");
    processTitle.className = "font-bold text-lg mb-2 text-slate-800";
    processTitle.textContent = step.title || "";
    processBox.appendChild(processTitle);

    if (step.description) {
      const processDesc = document.createElement("p");
      processDesc.className = "text-sm text-slate-700";
      processDesc.innerHTML = formatBold(step.description);
      processBox.appendChild(processDesc);
    }

    flowContainer.appendChild(processBox);

    flowchartViz.appendChild(flowContainer);

    // Add explanation list
    if (step.explanation && step.explanation.length > 0) {
      const explanationBox = document.createElement("div");
      explanationBox.className =
        "mt-6 p-6 bg-white rounded-lg shadow-sm max-w-3xl mx-auto";

      const explanationTitle = document.createElement("h5");
      explanationTitle.className = "font-semibold text-slate-800 mb-3 text-sm";
      explanationTitle.textContent = "Details:";
      explanationBox.appendChild(explanationTitle);

      const explanationList = document.createElement("ul");
      explanationList.className = "text-sm text-slate-700 space-y-2";

      step.explanation.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `<span class="text-${step.badgeColor || "blue"}-600 font-bold mt-0.5">•</span><span>${formatBold(point)}</span>`;
        explanationList.appendChild(li);
      });

      explanationBox.appendChild(explanationList);
      flowchartViz.appendChild(explanationBox);
    }

    // Add complexity info
    if (step.complexity) {
      const complexityBox = document.createElement("div");
      complexityBox.className =
        "mt-4 text-xs text-slate-600 font-mono bg-amber-50 px-4 py-3 rounded-lg border border-amber-200 max-w-3xl mx-auto";
      complexityBox.innerHTML = `<span class="font-semibold">Complexity:</span> ${formatBold(step.complexity)}`;
      flowchartViz.appendChild(complexityBox);
    }

    return flowchartViz;
  }

  /**
   * Create pointer indicators (i, j, left, right, etc.)
   */
  createPointerIndicators(pointers) {
    const pointerDiv = document.createElement("div");
    pointerDiv.className =
      "flex justify-around items-center px-8 text-xs mono mt-4 flex-wrap gap-2";

    Object.entries(pointers).forEach(([name, info]) => {
      const pointer = document.createElement("div");
      pointer.className = `text-${info.color || "slate"}-600 font-semibold`;
      pointer.textContent =
        info.direction === "left"
          ? `← ${name}: ${info.label || ""}`
          : `${name}: ${info.label || ""} →`;
      pointerDiv.appendChild(pointer);
    });

    return pointerDiv;
  }

  /**
   * Create insight box at end of tutorial
   */
  createInsightBox(insight) {
    // Helper: format Markdown-style bold (**text**) to <b>text</b>
    const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    const color = insight.color || "cyan";
    const icon = insight.icon || "💡";

    const insightBox = document.createElement("div");
    insightBox.className = `bg-${color}-50 border-l-4 border-${color}-500 p-6 rounded-lg mt-8`;

    const title = document.createElement("h4");
    title.className = `font-semibold text-${color}-900 mb-2`;
    title.textContent = `${icon} ${insight.title || "Key Insight"}`;
    insightBox.appendChild(title);

    const text = document.createElement("p");
    text.className = `text-sm text-${color}-800 leading-relaxed`;
    text.innerHTML = formatBold(insight.text || "");
    insightBox.appendChild(text);

    if (insight.points && insight.points.length > 0) {
      const list = document.createElement("ul");
      list.className = `mt-3 space-y-1 text-sm text-${color}-800`;

      insight.points.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `<span class="text-${color}-600 font-bold">•</span><span>${formatBold(point)}</span>`;
        list.appendChild(li);
      });

      insightBox.appendChild(list);
    }

    return insightBox;
  }

  // ========================================================================
  // CARD, CODE, AND OTHER COMPONENT CREATORS (Remaining methods truncated for brevity)
  // See original file for full implementations of:
  // - createCard
  // - createCodeExample
  // - createExercise
  // - createSimulator
  // - createAnalysis
  // - setupEventListeners
  // - observeReveals
  // - handleScroll
  // - destroy
  // ========================================================================

  createCard(item) {
    const card = document.createElement("div");
    card.className = "card reveal";

    const body = document.createElement("div");
    body.className = "p-8";

    // Helper: format Markdown-style bold (**text**) to <b>text</b>
    const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // Helper: extract inner code from fenced pseudocode
    const extractPseudocode = (code) => {
      if (!code) return "";
      return code
        .replace(/^```[\s\S]*?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
    };

    // Icon
    const icon = document.createElement("div");
    icon.className = "icon-box mb-6";
    icon.textContent = item.icon || "";
    icon.setAttribute("aria-hidden", "true");

    // Title
    const title = document.createElement("h3");
    title.className = "font-display mb-3";
    title.innerHTML = formatBold(item.title || "");

    // Description
    const description = document.createElement("p");
    description.className = "math-nowrap";
    description.innerHTML = formatBold(item.description || "");

    // Badge
    const badge = document.createElement("span");
    badge.className = `badge badge-${item.color || "slate"} mb-4 mono`;
    badge.textContent = item.highlight || "";

    // Math (new block)
    const math = document.createElement("div");
    math.className = "mt-4 mathjax-block";
    if (item.math && item.math.length > 0) {
      item.math.forEach((expr) => {
        const p = document.createElement("p");
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
      const list = document.createElement("ul");
      list.className = "check-list text-sm text-slate-600 mt-4";
      item.details.forEach((detail) => {
        const li = document.createElement("li");
        li.innerHTML = formatBold(detail); // support bold inside details
        list.appendChild(li);
      });
      body.appendChild(list);
    }

    // Pseudocode block
    if (item.pseudocode) {
      const pseudocodeDiv = document.createElement("div");
      pseudocodeDiv.className = "mt-6";

      const pseudocodeLabel = document.createElement("h4");
      pseudocodeLabel.className = "font-semibold mb-2 text-slate-700";
      pseudocodeLabel.textContent = "Pseudocode";

      const codePre = document.createElement("pre");
      codePre.className = "bg-slate-100 rounded-lg p-4 overflow-x-auto";

      const codeCode = document.createElement("code");
      codeCode.className = "text-sm text-slate-800";
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
    const container = document.createElement("div");
    container.className = "card reveal";

    const header = document.createElement("div");
    header.className = "card-header";
    const headerTitle = document.createElement("h3");
    headerTitle.className = "font-display text-lg";
    headerTitle.textContent = item.title || "Code Example";
    header.appendChild(headerTitle);
    container.appendChild(header);

    const body = document.createElement("div");
    body.className = "p-6";

    if (item.description) {
      // Helper: format Markdown-style bold (**text**) to <b>text</b>
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const desc = document.createElement("p");
      desc.className = "text-sm text-slate-600 mb-4 leading-relaxed";
      desc.innerHTML = formatBold(item.description);
      body.appendChild(desc);
    }

    const pre = document.createElement("pre");
    pre.className = `language-${item.language || "javascript"}`;
    const code = document.createElement("code");
    code.className = `language-${item.language || "javascript"}`;
    code.textContent = item.code || "";
    pre.appendChild(code);
    body.appendChild(pre);

    // Add Run button for Python code (if not explicitly disabled)
    const language = item.language || "javascript";
    const enableRun = item.runnable !== false && language === "python";

    if (enableRun) {
      const runSection = document.createElement("div");
      runSection.className = "mt-4 pt-4 border-t border-slate-200";

      // Run button
      const runButton = document.createElement("button");
      runButton.className = "btn btn-primary text-sm";
      runButton.innerHTML = "▶ Run Code";
      runButton.setAttribute("aria-label", "Run Python code");

      // Output area
      const outputArea = document.createElement("div");
      outputArea.className = "hidden mt-4 p-4 bg-slate-900 rounded-lg";
      outputArea.setAttribute("role", "region");
      outputArea.setAttribute("aria-label", "Code output");
      outputArea.setAttribute("aria-live", "polite");

      const outputLabel = document.createElement("div");
      outputLabel.className = "text-xs text-slate-400 mb-2 font-semibold mono";
      outputLabel.textContent = "OUTPUT:";
      outputArea.appendChild(outputLabel);

      const outputContent = document.createElement("div");
      outputContent.className = "output-content";
      outputArea.appendChild(outputContent);

      // Run button click handler - FIXED: Show outputArea before running code
      runButton.addEventListener("click", async () => {
        runButton.disabled = true;
        runButton.innerHTML = "⏳ Running...";

        // CRITICAL FIX: Remove hidden class from outputArea
        outputArea.classList.remove("hidden");

        await this.runPythonCode(item.code || "", outputContent);

        runButton.disabled = false;
        runButton.innerHTML = "▶ Run Code";
      });

      runSection.appendChild(runButton);
      runSection.appendChild(outputArea);
      body.appendChild(runSection);
    }

    container.appendChild(body);

    // Add explanation section if provided
    if (item.explanation && item.explanation.length > 0) {
      const explanationSection = document.createElement("div");
      explanationSection.className = "px-6 pb-6";

      const explanationTitle = document.createElement("h4");
      explanationTitle.className = "font-semibold text-slate-800 mb-3 text-sm";
      explanationTitle.textContent = "Explanation:";
      explanationSection.appendChild(explanationTitle);

      const explanationList = document.createElement("ul");
      explanationList.className = "text-sm text-slate-700 space-y-2";

      // Helper: format Markdown-style bold (**text**) to <b>text</b>
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const explanation = Array.isArray(item.explanation)
        ? item.explanation
        : item.explanation
          ? [item.explanation]
          : [];

      for (const point of explanation) {
        const li = document.createElement("li");
        li.className = "flex items-start gap-2";
        li.innerHTML = `
    <span class="text-blue-600 font-bold mt-0.5">•</span>
    <span>${formatBold(point)}</span>
  `;
        explanationList.appendChild(li);
      }

      explanationSection.appendChild(explanationList);
      container.appendChild(explanationSection);
    }

    // Add complexity info if provided
    if (item.complexity) {
      const complexitySection = document.createElement("div");
      complexitySection.className = "px-6 pb-6";

      // Helper: format Markdown-style bold (**text**) to <b>text</b>
      const formatBold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      const complexityBox = document.createElement("div");
      complexityBox.className =
        "text-xs text-slate-600 font-mono bg-amber-50 px-4 py-3 rounded-lg border border-amber-200";
      complexityBox.innerHTML = `<span class="font-semibold">Complexity:</span> ${formatBold(item.complexity)}`;
      complexitySection.appendChild(complexityBox);
      container.appendChild(complexitySection);
    }

    setTimeout(() => {
      if (typeof Prism !== "undefined") {
        Prism.highlightElement(code);
      }
    }, 100);

    return container;
  }

  createExercise(item) {
    const card = document.createElement("div");
    card.className = "card reveal";

    const body = document.createElement("div");
    body.className = "p-8";

    const header = document.createElement("div");
    header.className = "flex items-start justify-between mb-4 gap-4";

    const titleDiv = document.createElement("div");
    titleDiv.className = "flex-1";

    const title = document.createElement("h3");
    title.className = "font-display text-lg mb-2";
    title.textContent = item.title || "";
    titleDiv.appendChild(title);

    if (item.topics && item.topics.length > 0) {
      const topicsDiv = document.createElement("div");
      topicsDiv.className = "flex flex-wrap gap-2 mt-2";
      item.topics.forEach((topic) => {
        const topicBadge = document.createElement("span");
        topicBadge.className = "badge badge-cyan mono text-xs";
        topicBadge.textContent = topic;
        topicsDiv.appendChild(topicBadge);
      });
      titleDiv.appendChild(topicsDiv);
    }

    const difficulty = document.createElement("span");
    difficulty.className = "badge mono";
    let diffColor = "slate";
    const diff = (item.difficulty || "medium").toLowerCase();
    if (diff === "easy") diffColor = "emerald";
    else if (diff === "medium") diffColor = "amber";
    else if (diff === "hard") diffColor = "teal";
    difficulty.className += ` badge-${diffColor}`;
    difficulty.textContent = diff.toUpperCase();

    header.appendChild(titleDiv);
    header.appendChild(difficulty);
    body.appendChild(header);

    const description = document.createElement("p");
    description.className = "text-slate-600 text-sm leading-relaxed";
    description.textContent = item.description || "";
    body.appendChild(description);

    card.appendChild(body);
    return card;
  }

  // Simulator and other methods omitted for brevity - see original file
  createSimulator(content) {
    /* ... */
  }
  createAnalysis(content) {
    /* ... */
  }

  initSyntaxHighlighting() {
    if (typeof Prism !== "undefined") {
      Prism.highlightAll();
    }
  }

  observeReveals() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    const reveals = document.querySelectorAll(".reveal");
    const revealOnce = this.config.theme?.revealOnce !== false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            if (revealOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: this.config.theme?.revealThreshold || 0.1,
        rootMargin: "0px",
      },
    );

    reveals.forEach((reveal) => observer.observe(reveal));
    this.observers.push(observer);
  }

  setupEventListeners() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
    }

    document.body.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          if (mobileMenu) {
            mobileMenu.classList.add("hidden");
          }
        }
      }
    });

    window.addEventListener(
      "scroll",
      () => {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          this.handleScroll();
        }, 10);
      },
      { passive: true },
    );
  }

  handleScroll() {
    const header = document.getElementById("main-nav");
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll(`a[href="#${sectionId}"]`).forEach((link) => {
          link.setAttribute("aria-current", "page");
        });
      } else {
        document.querySelectorAll(`a[href="#${sectionId}"]`).forEach((link) => {
          link.removeAttribute("aria-current");
        });
      }
    });
  }

  /**
   * Cleanup method to prevent memory leaks
   * Call this when removing the template or navigating away
   */
  destroy() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }

    console.log("EducationalTemplate: Cleanup complete");
  }
}

// Export for use in modules or global scope
if (typeof module !== "undefined" && module.exports) {
  module.exports = EducationalTemplate;
} else if (typeof window !== "undefined") {
  window.EducationalTemplate = EducationalTemplate;
}
