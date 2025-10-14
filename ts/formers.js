/**
 * Time-Series Transformers Educational Content Configuration
 * ENHANCED VERSION - Comprehensive guide with 20+ architectures
 * Mathematical derivations, training strategies, and deployment guidance
 */

const timeSeriesTransformersConfig = {
    meta: {
        title: "Time-Series Transformers | Complete Practitioner's Guide",
        description: "Explore 20+ cutting-edge transformer architectures, foundation models, training strategies, hyperparameter tuning, and deployment best practices with mathematical derivations and 2024-2025 SOTA updates",
        logo: "📈",
        brand: "TS Transformers Pro",
        version: "2.0"
    },

    theme: {
        cssVariables: {
            '--primary-50': '#ecfeff',
            '--primary-100': '#cffafe',
            '--primary-500': '#06b6d4',
            '--primary-600': '#0891b2',
            '--primary-700': '#0e7490',
            '--accent-500': '#8b5cf6',
            '--success-500': '#10b981'
        },
        revealThreshold: 0.15,
        revealOnce: true
    },

    hero: {
        title: "Time-Series Transformers",
        subtitle: "20+ Revolutionary Architectures, Foundation Models & Complete Training Guide",
        watermarks: [
            "ATTENTION MECHANISMS",
            "DECOMPOSITION", 
            "EFFICIENCY",
            "FOUNDATION MODELS",
            "SOTA 2025",
            "TRAINING STRATEGIES",
            "DEPLOYMENT"
        ],
        quickLinks: [
            { text: "Start Learning", href: "#overview", style: "primary" },
            { text: "Architecture Comparison", href: "#comparison", style: "secondary" },
            { text: "Foundation Models", href: "#foundation-models", style: "accent" },
            { text: "Training Guide", href: "#training", style: "accent" },
            { text: "Code Examples", href: "#code-examples", style: "secondary" },
            { text: "Deployment", href: "#deployment", style: "primary" }
        ]
    },

    sections: [
        {
            id: "overview",
            title: "Overview & Mathematical Foundations",
            icon: "🎯",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "⚡",
                        title: "The Transformer Challenge",
                        description: "Vanilla transformers excel at capturing long-range dependencies via self-attention but face quadratic complexity $O(L^2 d)$ in sequence length $L$ and dimension $d$. For time-series with $L>1000$, memory becomes prohibitive: $\\text{Memory} \\approx 4 \\times L^2 \\times H \\times d_k$ bytes (float32). Modern variants address this through sparsity, decomposition, patching, multi-resolution, and pre-training.",
                        highlight: "PROBLEM",
                        color: "amber",
                        details: [
                            "Quadratic bottleneck: $\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$ computes $L \\times L$ matrix",
                            "Memory scaling: 10K sequence → 400MB just for attention weights (single layer)",
                            "Long-range capture: Dot-product attention $a_{ij} = \\frac{\\exp(q_i k_j^T / \\sqrt{d_k})}{\\sum_k \\exp(q_i k_k^T / \\sqrt{d_k})}$",
                            "Multi-variate challenge: $C$ variables create $O(L^2 C d)$ complexity",
                            "Temporal inductive bias: Unlike CNNs/RNNs, transformers lack built-in temporal structure",
                            "SOTA Challenge (2024): Entropy collapse in long-horizon forecasting (LATST paper)"
                        ]
                    },
                    {
                        icon: "🧠",
                        title: "Key Innovations Taxonomy",
                        description: "Five major innovation families: (1) Sparse Attention: ProbSparse $M(q_i) = \\ln \\sum \\exp(q_i k_j^T) - \\frac{1}{L} \\sum q_i k_j^T$, (2) Decomposition: $\\mathbf{X} = \\mathbf{T} + \\mathbf{S}$ for trend-seasonal, (3) Frequency Analysis: DFT $X_k = \\sum_{n=0}^{L-1} x_n e^{-i 2\\pi k n / L}$, (4) Patching: Token reduction $(L/P)$, (5) Foundation: Pre-training on 100B+ points.",
                        highlight: "SOLUTIONS",
                        color: "cyan",
                        details: [
                            "Sparse attention: Reduces active pairs from $L^2$ to $O(L \\log L)$ or $O(L)$",
                            "Series decomposition: Progressive trend extraction $T_t = \\text{MA}(X_t, k)$ with learnable kernels",
                            "Frequency-domain: Global patterns via FFT ($O(L \\log L)$) or Wavelet ($O(L)$) transforms",
                            "Patching: Reduces tokens from $L$ to $\\lceil L/P \\rceil$, preserving local structure",
                            "Dimension inversion: Treats variables as tokens ($C$ tokens, $L$ dims)",
                            "Foundation Models: Transfer learning via pre-training on diverse TS corpora",
                            "Hybrid approaches: CNN+Transformer, RNN+Transformer for best of both worlds"
                        ]
                    },
                    {
                        icon: "🎨",
                        title: "Architecture Taxonomy",
                        description: "Complete classification: (1) Attention-optimized (Informer, Pyraformer, Crossformer), (2) Decomposition-based (Autoformer, FEDformer, ETSformer), (3) Patching/Inversion (PatchTST, iTransformer), (4) Multi-resolution (MTST, TimeMixer), (5) Hybrid (PRformer, MICN, ModernTCN), (6) Foundation (Chronos, TimesFM, Moirai), (7) Specialized (TFT, LATST, TimeFlex).",
                        highlight: "TAXONOMY",
                        color: "purple",
                        details: [
                            "Efficiency spectrum: Informer $O(L \\log L)$ → Pyraformer $O(L)$ → PRformer $O(T)$",
                            "Decomposition paradigm: Auto-correlation vs. Freq-domain vs. ETS integration",
                            "Token strategies: Time-steps vs. Patches vs. Variables as tokens",
                            "Scale handling: Single-scale vs. Multi-resolution vs. Pyramidal",
                            "Foundation models: Zero-shot capability via massive pre-training",
                            "Production focus: TFT for interpretability, LATST for stability",
                            "2025 trends: Modular architectures (TimeFlex), simplified designs beating complexity"
                        ]
                    }
                ]
            }
        },

        {
            id: "mathematical-foundations",
            title: "Mathematical Foundations & Attention Theory",
            icon: "📐",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔢",
                        title: "Scaled Dot-Product Attention",
                        description: "Core mechanism: $\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$ where $Q,K \\in \\mathbb{R}^{L \\times d_k}$, $V \\in \\mathbb{R}^{L \\times d_v}$. Scaling by $\\sqrt{d_k}$ prevents gradient vanishing: $\\text{Var}(q_i k_j^T) = d_k$ before scaling.",
                        highlight: "FOUNDATIONS",
                        color: "blue",
                        details: [
                            "Query-Key similarity: $s_{ij} = \\frac{q_i \\cdot k_j}{\\sqrt{d_k}}$ measures relevance",
                            "Softmax normalization: $\\alpha_{ij} = \\frac{\\exp(s_{ij})}{\\sum_k \\exp(s_{ik})}$ creates probability distribution",
                            "Value aggregation: Output $o_i = \\sum_j \\alpha_{ij} v_j$ is weighted combination",
                            "Complexity analysis: $O(L^2 d_k)$ for $QK^T$, $O(L^2 d_v)$ for attention-value multiply",
                            "Gradient flow: $\\frac{\\partial \\mathcal{L}}{\\partial Q} = \\frac{\\partial \\mathcal{L}}{\\partial O} V^T \\text{diag}(A) - A^T \\frac{\\partial \\mathcal{L}}{\\partial O} V^T$"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Multi-Head Attention (MHA)",
                        description: "Parallel attention: $\\text{MHA}(Q,K,V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_H) W^O$ where $\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$. Each head captures different patterns with $d_k = d_{\\text{model}}/H$.",
                        highlight: "PARALLEL",
                        color: "purple",
                        details: [
                            "Projection matrices: $W_i^Q, W_i^K, W_i^V \\in \\mathbb{R}^{d_{\\text{model}} \\times d_k}$, $W^O \\in \\mathbb{R}^{H d_v \\times d_{\\text{model}}}$",
                            "Computational efficiency: $H$ heads with $d_k = d/H$ has same cost as single head with full $d$",
                            "Representation subspaces: Each head learns different aspect (e.g., short-term vs. long-term)",
                            "Typical values: $H \\in \\{4, 8, 16\\}$, $d_{\\text{model}} \\in \\{256, 512, 1024\\}$",
                            "Output fusion: Final projection $W^O$ combines all heads"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Positional Encoding Theory",
                        description: "Injects temporal order: Sinusoidal $PE_{(pos, 2i)} = \\sin(pos / 10000^{2i/d})$, $PE_{(pos, 2i+1)} = \\cos(pos / 10000^{2i/d})$. Relative positions: $PE(pos + k) = f(PE(pos), k)$ via trigonometric identities. Learnable alternatives for non-uniform sampling.",
                        highlight: "TEMPORAL ORDER",
                        color: "green",
                        details: [
                            "Wavelength: Ranges from $2\\pi$ to $10000 \\times 2\\pi$ across dimensions",
                            "Relative encoding: $\\sin(\\alpha + \\beta) = \\sin \\alpha \\cos \\beta + \\cos \\alpha \\sin \\beta$",
                            "Absolute vs. Relative: Abs encodes position, Rel encodes distance",
                            "Learnable PE: $PE = \\text{Embedding}(pos)$, better for irregular sampling",
                            "Time-series specific: Calendar features (hour, day, month) as additional encoding"
                        ]
                    },
                    {
                        icon: "🌊",
                        title: "Feed-Forward Networks (FFN)",
                        description: "Position-wise transformation: $\\text{FFN}(x) = \\text{max}(0, xW_1 + b_1)W_2 + b_2$ with hidden dimension $d_{\\text{ff}} = 4d_{\\text{model}}$ typically. GELU activation: $\\text{GELU}(x) = x \\Phi(x)$ where $\\Phi$ is Gaussian CDF, smoother than ReLU.",
                        highlight: "NON-LINEAR",
                        color: "amber",
                        details: [
                            "Expansion: $W_1 \\in \\mathbb{R}^{d_{\\text{model}} \\times d_{\\text{ff}}}$, typically $d_{\\text{ff}} = 4d$",
                            "Bottleneck: $W_2 \\in \\mathbb{R}^{d_{\\text{ff}} \\times d_{\\text{model}}}$ compresses back",
                            "Activation choices: ReLU (sparse), GELU (smooth), Swish (self-gated)",
                            "Parameter count: $2 \\times d_{\\text{model}} \\times d_{\\text{ff}}$ dominates model size",
                            "Dropout: Applied after each projection for regularization"
                        ]
                    }
                ]
            }
        },

        {
            id: "attention-optimized",
            title: "Attention-Optimized Architectures",
            icon: "🔍",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🎲",
                        title: "Informer (AAAI 2021)",
                        description: "ProbSparse self-attention selects dominant query-key pairs via sparsity measure $M(q_i) = \\max_j \\left\\{\\frac{q_i k_j^T}{\\sqrt{d}}\\right\\} - \\frac{1}{L} \\sum_{j=1}^L \\frac{q_i k_j^T}{\\sqrt{d}}$, approximating KL-divergence from uniform. Selects top-$u$ queries where $u = c \\ln L$, reducing complexity to $O(L \\log L)$.",
                        highlight: "SPARSE ATTENTION",
                        color: "cyan",
                        details: [
                            "Sparsity measure: $M(q_i)$ high when attention distribution is peaked (informative)",
                            "Top-$u$ selection: $u = c \\ln L$ with $c \\approx 5$, remaining queries use mean-pooling $\\bar{q}$",
                            "Self-attention distilling: Halves sequence length between layers via max-pooling",
                            "Generative decoder: Progressive prediction using known outputs for stability",
                            "Complexity: Encoder $O(L \\log L)$, Decoder $O(L \\log L + L H)$ where $H$ is horizon",
                            "Memory reduction: $\\approx 90\\%$ reduction for $L=10,000$",
                            "Empirical: SOTA on long-term forecasting (ETTh, Weather) in 2021"
                        ]
                    },
                    {
                        icon: "🔺",
                        title: "Pyraformer (ICLR 2022)",
                        description: "Pyramidal attention structure with $C$-ary tree ($C=2$ binary): Intra-scale attention $A_{\\text{intra}}^{(s)} = \\text{softmax}\\left(\\frac{Q^{(s)} {K^{(s)}}^T}{\\sqrt{d}}\\right)V^{(s)}$ within same scale, inter-scale $A_{\\text{inter}} = \\text{softmax}\\left(\\frac{Q_{\\text{parent}} K_{\\text{children}}^T}{\\sqrt{d}}\\right)V_{\\text{children}}$ across pyramid levels, achieving linear $O(L)$ complexity.",
                        highlight: "HIERARCHICAL",
                        color: "amber",
                        details: [
                            "Multi-scale pyramid: Height $h = \\log_C L$, each level aggregates $C$ nodes",
                            "Coarser-to-finer (C2F): Top-down attention from coarse to fine scales",
                            "Finer-to-coarser (F2C): Bottom-up aggregation to higher levels",
                            "Router mechanism: Dynamic path selection in tree based on importance scores",
                            "Linear complexity: $O(L d)$ total across all pyramid levels",
                            "Parameter efficiency: Shared attention across scales reduces params",
                            "Best for: Multi-resolution patterns (hourly + daily + weekly cycles)"
                        ]
                    },
                    {
                        icon: "🔀",
                        title: "Crossformer (ICLR 2023)",
                        description: "Two-stage attention: (1) Dimension-Segment-Wise (DSW) embeds time into $S$ segments and dimensions into $D$ groups, cross-time attention $A_{\\text{DSW}} = \\text{softmax}\\left(\\frac{Q_{\\text{seg}} K_{\\text{dim}}^T}{\\sqrt{d}}\\right)V_{\\text{dim}}$, (2) Cross-dimension attention $A_{\\text{cross}} = \\text{softmax}\\left(\\frac{Q_{\\text{dim}} K_{\\text{time}}^T}{\\sqrt{d}}\\right)V_{\\text{time}}$ across variables. Router sparsifies to $O(L \\sqrt{L})$.",
                        highlight: "CROSS-DIMENSION",
                        color: "purple",
                        details: [
                            "DSW embedding: Segments time axis into $S = \\sqrt{L}$ blocks, dimensions into $D$ groups",
                            "Two-stage pipeline: Time patterns first, then cross-variable dependencies",
                            "Router network: Learns which variables interact, top-$k$ connections",
                            "Complexity: $O(S^2 D d) + O(D^2 S d) \\approx O(L \\sqrt{L} d)$",
                            "Multivariate strength: Excels when $C > 10$ with strong correlations",
                            "Hierarchical encoding: Captures both local and global temporal patterns",
                            "Empirical: Best on Traffic (862 variables), Electricity datasets"
                        ]
                    },
                    {
                        icon: "🌀",
                        title: "Flowformer (2023)",
                        description: "Linear attention via flow network: $\\text{Attention}(Q,K,V) = \\text{softmax}(Q \\phi(K^T))V$ where $\\phi$ is kernel function (e.g., $\\exp$, ReLU). Computational trick: $(Q\\phi(K^T))V = Q(\\phi(K^T)V)$ reduces $O(L^2 d)$ to $O(Ld^2)$.",
                        highlight: "LINEAR FLOW",
                        color: "teal",
                        details: [
                            "Kernel trick: $\\phi(q)^T \\phi(k) \\approx q^T k$ without explicit feature map",
                            "Associativity: Compute $K^TV$ first (size $d \\times d$), then $Q(K^TV)$",
                            "Memory efficiency: No need to materialize $L \\times L$ attention matrix",
                            "Flow interpretation: Information flows through compressed bottleneck",
                            "Complexity: $O(L d^2)$ when $d \\ll L$ (typical: $d=512$, $L=10000$)",
                            "Approximation quality: Close to vanilla attention when $\\phi$ well-chosen",
                            "Limitation: May lose some expressiveness vs. softmax attention"
                        ]
                    }
                ]
            }
        },

        {
            id: "decomposition-based",
            title: "Decomposition-Based Architectures",
            icon: "🔬",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🌊",
                        title: "Autoformer (NeurIPS 2021)",
                        description: "Auto-correlation mechanism replaces dot-product attention: $\\text{AutoCorr}(Q,K,V) = \\sum_{\\tau \\in \\mathcal{T}} R(\\tau) \\cdot \\text{Delay}(V, \\tau)$ where $R(\\tau) = \\text{Softmax}(\\mathcal{F}^{-1}(\\mathcal{F}(Q) \\odot \\overline{\\mathcal{F}(K)}))$ discovers periodic delays $\\tau$ via FFT. Series decomposition $X_t = T_t + S_t$ with moving average $T_t = \\text{AvgPool}_k(X)$ integrated in each block.",
                        highlight: "AUTO-CORRELATION",
                        color: "teal",
                        details: [
                            "Auto-correlation: $\\rho(\\tau) = \\frac{1}{\\sigma^2} \\sum_t X_t X_{t+\\tau}$, finds periodicity peaks",
                            "FFT acceleration: Time-lag correlation computed in $O(L \\log L)$ via freq domain",
                            "Period selection: Top-$k$ delays $\\tau^* = \\arg\\max_{\\tau} \\rho(\\tau)$",
                            "Progressive decomposition: Multi-layer trend extraction for stability",
                            "Seasonal injection: Decoder uses trend as prior for better long-term",
                            "Theoretical: Proven better for periodic/seasonal data vs. dot-product",
                            "Complexity: $O(L \\log L)$ per layer, same as FFT"
                        ]
                    },
                    {
                        icon: "📡",
                        title: "FEDformer (ICML 2022)",
                        description: "Frequency Enhanced Decomposition operates in frequency domain: Fourier $F(\\omega) = \\sum_{t=0}^{L-1} x_t e^{-i \\omega t}$ or Wavelet $W(a,b) = \\int x(t) \\psi^*\\left(\\frac{t-b}{a}\\right) dt$ for multi-resolution. Frequency Enhanced Block (FEB) applies sparse attention $A_f = \\text{softmax}\\left(\\frac{Q_f K_f^*}{\\sqrt{d_f}}\\right)V_f$ on top-$k$ modes.",
                        highlight: "FREQUENCY DOMAIN",
                        color: "cyan",
                        details: [
                            "Transform choice: DFT $O(L \\log L)$ for global, DWT $O(L)$ for local-global",
                            "Mode selection: Learns importance of frequency modes, keeps top-$k$",
                            "Seasonal-trend decomp: $S(\\omega) = \\text{low-pass}(F(\\omega))$, $T = X - \\mathcal{F}^{-1}(S)$",
                            "Complex-valued attention: $K_f^*$ is conjugate for frequency correlation",
                            "Frequency mixing: Cross-frequency interactions for harmonic patterns",
                            "Invertibility: Back to time domain via iFFT/iDWT",
                            "SOTA: Outperforms Autoformer on datasets with complex freq patterns (Weather, ETT)"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "ETSformer (2023)",
                        description: "Integrates Exponential Smoothing into transformer: Level $l_t = \\alpha y_t + (1-\\alpha) (l_{t-1} + b_{t-1})$, Trend $b_t = \\beta (l_t - l_{t-1}) + (1-\\beta) b_{t-1}$, Seasonality $s_t = \\gamma (y_t - l_t - b_t) + (1-\\gamma) s_{t-m}$. Smoothing parameters $\\alpha, \\beta, \\gamma$ are adaptive via MLPs on residuals. Transformer operates on decomposed components.",
                        highlight: "ETS INTEGRATION",
                        color: "emerald",
                        details: [
                            "Classical ETS: Holt-Winters formulation for level, trend, seasonal",
                            "Adaptive parameters: $\\alpha_t = \\sigma(\\text{MLP}(x_t))$ learns time-varying smoothing",
                            "Component-wise attention: Separate transformers for level, trend, seasonal",
                            "Interpretable evolution: Can track how components change over time",
                            "Hybrid strength: Combines statistical rigor with deep learning flexibility",
                            "Uncertainty: ETS provides prediction intervals via error propagation",
                            "Production-ready: Used in industry for interpretable forecasts"
                        ]
                    },
                    {
                        icon: "🎼",
                        title: "DLinear & NLinear (2023)",
                        description: "Surprisingly simple linear baselines that challenge transformers: DLinear decomposes $X = T + S$ then applies linear $\\hat{y}_T = W_T T$, $\\hat{y}_S = W_S S$, final $\\hat{y} = \\hat{y}_T + \\hat{y}_S$. NLinear normalizes: $X' = (X - \\mu) / \\sigma$, applies linear, denormalizes. SOTA on many benchmarks despite simplicity.",
                        highlight: "LINEAR BASELINE",
                        color: "gray",
                        details: [
                            "DLinear: Decomposition via moving average, separate linears for T and S",
                            "NLinear: Instance normalization + linear + denormalization",
                            "Complexity: $O(L d)$ with $d$ as output dim, extremely fast",
                            "Parameter count: $\\sim 10K$ params vs. $\\sim 10M$ for transformers",
                            "Empirical surprise: Beats many transformers on long-term forecasting",
                            "Interpretation: High linear correlation in many TS datasets",
                            "Caution: Fails on complex non-linear patterns, low-dimensional data"
                        ]
                    }
                ]
            }
        },

        {
            id: "modern-approaches",
            title: "Modern Patching, Inversion & Multi-Resolution Approaches",
            icon: "🚀",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🧩",
                        title: "PatchTST (ICLR 2023)",
                        description: "Patches series into sub-sequences: Token $e_i = \\text{Linear}(x_{(i-1)S+1:(i-1)S+P})$ where $P$ is patch length, $S \\leq P$ is stride. Number of patches $N_p = \\lfloor (L-P)/S \\rfloor + 1$. Channel-independent: No cross-variable attention, each channel processed separately with own transformer, predictions aggregated.",
                        highlight: "PATCHING",
                        color: "blue",
                        details: [
                            "Patch parameters: Typical $P \\in \\{16, 32\\}$, $S = P$ (non-overlap) or $S = P/2$ (overlap)",
                            "Token reduction: $L=512, P=16 \\Rightarrow 32$ tokens (16× reduction)",
                            "Positional encoding: Added to patch embeddings $e_i + PE(i)$",
                            "Channel independence: $C$ parallel transformers, no $O(C^2)$ cross-attention",
                            "Complexity: $O((L/P)^2 C d)$ where typically $(L/P)^2 \\ll L^2$",
                            "ViT inspiration: Adapts Vision Transformer patching to time series",
                            "SOTA 2023: 20-50% MSE reduction on long-term benchmarks (ETTh, Weather, Traffic)"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "iTransformer (ICLR 2024)",
                        description: "Inverts embedding dimension: Each time series (variable) becomes a token $e_c = \\text{MLP}(X_{:,c})$ where $X \\in \\mathbb{R}^{L \\times C}$. Results in $C$ tokens with dimension $L$. Self-attention on variables: $A_{c,c'} = \\text{softmax}\\left(\\frac{e_c e_{c'}^T}{\\sqrt{L}}\\right)$ captures cross-variable correlations naturally.",
                        highlight: "INVERTED",
                        color: "purple",
                        details: [
                            "Inversion: Tokens = $C$ (variables) instead of $L$ (time steps)",
                            "Embedding: Each column $X_{:,c} \\in \\mathbb{R}^L$ projected to $d$-dim space",
                            "Multivariate focus: Attention naturally models variable interactions",
                            "Complexity: $O(C^2 L d)$ but typically $C \\ll L$ (e.g., $C=7$, $L=512$)",
                            "Feed-forward: Operates on $L$-dimensional space for temporal processing",
                            "Simplicity: Standard transformer, just different input organization",
                            "When to use: High-dimensional multivariate ($C > 20$) with strong correlations"
                        ]
                    },
                    {
                        icon: "📈",
                        title: "Non-stationary Transformer (2022)",
                        description: "De-stationary Attention handles distribution shifts: (1) Normalize queries/keys $Q' = (Q - \\mu_Q)/\\sigma_Q$, $K' = (K - \\mu_K)/\\sigma_K$, (2) Compute attention $A = \\text{softmax}(Q' K'^T / \\sqrt{d})$, (3) Re-project output $\\hat{X} = A V \\cdot \\sigma_X + \\mu_X$ to restore original scale. Handles covariate shift $\\Delta \\mu$, scale change $\\Delta \\sigma$.",
                        highlight: "NON-STATIONARY",
                        color: "amber",
                        details: [
                            "Series-level statistics: $\\mu_Q = \\text{mean}(Q, \\text{dim}=1)$, $\\sigma_Q = \\text{std}(Q, \\text{dim}=1)$",
                            "Layer-wise normalization: Each transformer layer has own statistics",
                            "Projection layer: Learnable $\\tau_\\mu, \\tau_\\sigma$ for denormalization",
                            "Mitigates over-stationarization: Avoids differencing/log transforms that lose information",
                            "Robust to: Trending data, seasonal shifts, sudden level changes",
                            "Theoretical: Shown to reduce distribution shift between train and test",
                            "Empirical: Strong on real-world data with non-iid patterns"
                        ]
                    },
                    {
                        icon: "🌐",
                        title: "MTST - Multi-resolution TS Transformer (ICML 2024)",
                        description: "Multi-branch architecture with varying patch sizes: Branch $i$ uses patches $P_i$ where $P_1 < P_2 < \\cdots < P_k$ (e.g., 8, 16, 32, 64). Shorter patches capture high-frequency local patterns, longer patches capture low-frequency trends. Relative positional encoding $PE(pos, 2i) = \\sin(pos / 10000^{2i/d})$ integrated across branches.",
                        highlight: "MULTI-RESOLUTION",
                        color: "green",
                        details: [
                            "Branch design: $k \\in \\{3, 4, 5\\}$ parallel transformers with different patch sizes",
                            "Fusion mechanism: Weighted sum $\\hat{y} = \\sum_{i=1}^k w_i \\hat{y}_i$ with learnable gates $w_i$",
                            "Relative PE: Captures scale-invariant periodicities across resolutions",
                            "Hierarchical features: Fine-grained (small $P$) + coarse-grained (large $P$)",
                            "Complexity: $O(\\sum_i (L/P_i)^2 d)$, still subquadratic due to patching",
                            "SOTA 2024: Outperforms PatchTST on long-term forecasting by 5-15%",
                            "Best for: Multi-scale periodic patterns (e.g., intra-day + weekly + monthly)"
                        ]
                    },
                    {
                        icon: "🎭",
                        title: "TimeMixer (2024)",
                        description: "Multi-scale mixing for past-decomposable-mix architecture: (1) Past-decomposition into multiple scales $X^{(s)} = \\text{Downsample}_s(X)$, (2) Fine-grained mixing $M_{\\text{fine}} = \\text{MLP}(\\text{Patch}(X, P_{\\text{small}}))$, (3) Coarse mixing $M_{\\text{coarse}} = \\text{MLP}(\\text{Patch}(X, P_{\\text{large}}))$, (4) Fusion via learnable gates $\\alpha$.",
                        highlight: "MULTI-SCALE MIX",
                        color: "violet",
                        details: [
                            "Multi-resolution: Patches $P \\in \\{4, 8, 16, 32\\}$ for different scales",
                            "Past-decomposable: Separates historical patterns into scales",
                            "Mixing modules: MLPs for intra-scale, attention for cross-scale",
                            "Channel mixing: Cross-variable interactions after temporal mixing",
                            "Adaptive fusion: Gates $\\alpha_s = \\sigma(\\text{MLP}(X))$ weight scale contributions",
                            "Complexity: $O(\\sum_s L_s^2)$ where $L_s = L / 2^s$",
                            "Competitive: Matches PatchTST on long-term with better interpretability"
                        ]
                    },
                    {
                        icon: "🔮",
                        title: "Reversible Instance Normalization (RevIN, 2022)",
                        description: "Simple but powerful normalization: (1) Forward: $X' = (X - \\mu) / \\sigma$ where $\\mu, \\sigma$ computed per instance/channel, (2) Model processes $X'$, (3) Reverse: $\\hat{X} = \\hat{X}' \\cdot \\sigma + \\mu$ restores scale. Used as preprocessing in many SOTA models.",
                        highlight: "NORMALIZATION",
                        color: "pink",
                        details: [
                            "Instance-level: $\\mu_c = \\text{mean}(X_{:,c})$, $\\sigma_c = \\text{std}(X_{:,c})$ per channel",
                            "Distribution shift mitigation: Makes train/test distributions similar",
                            "Reversibility: Crucial for accurate denormalization post-prediction",
                            "Non-parametric: No learnable parameters, just statistics",
                            "Universally applicable: Can be added to any architecture",
                            "Empirical impact: +5-20% accuracy improvement across models",
                            "When not to use: When absolute scale is important (e.g., anomaly detection)"
                        ]
                    }
                ]
            }
        },

        {
            id: "foundation-models",
            title: "Time-Series Foundation Models (2024-2025 SOTA)",
            icon: "🏗️",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "🛒",
                        title: "Chronos (Amazon, 2024)",
                        description: "Encoder-decoder transformer pre-trained on 100M+ real and synthetic TS via T5-style architecture. Tokenizes continuous values into discrete vocab (4096 bins via quantile binning). Zero-shot forecasting through autoregressive generation: $p(y_{t+1:t+H} | y_{1:t}) = \\prod_{i=1}^H p(y_{t+i} | y_{1:t+i-1}, \\theta)$. Outputs probabilistic forecasts.",
                        highlight: "ZERO-SHOT",
                        color: "orange",
                        details: [
                            "Tokenization: Quantile-based binning $\\text{token}(x) = \\arg\\min_i |x - q_i|$",
                            "Training data: Diverse domains (finance, energy, web traffic, synthetic)",
                            "Scaling laws: Larger models (200M params) generalize better across domains",
                            "Probabilistic: Outputs log-probabilities for each quantile bin",
                            "Multi-variate: Joint tokenization across channels",
                            "Complexity: $O(L d)$ inference, decoder-only for efficiency",
                            "SOTA 2024: Competitive with PatchTST on zero-shot, better on long-tail domains"
                        ]
                    },
                    {
                        icon: "🔍",
                        title: "TimesFM (Google, 2024)",
                        description: "Decoder-only transformer (200M params) pre-trained on 100B+ real-world time points via next-token prediction on diverse corpora. Supports variable-length context and horizons. Zero-shot forecasting: $\\hat{y}_{t+1:t+H} = \\mathbb{E}[p(y | y_{1:t}, c, \\theta)]$ where $c$ includes covariates. Optional fine-tuning on target domain.",
                        highlight: "PRE-TRAINED",
                        color: "blue",
                        details: [
                            "Architecture: 8 layers, 8 heads, $d_{\\text{model}}=1280$, 200M params",
                            "Pre-training: Causal masking on web-scale TS data (Google internal + public)",
                            "Context patching: Efficient encoding via patch length 32",
                            "Covariates: Supports static and time-varying external features",
                            "Evaluation: sMAPE/MAE on 30+ benchmark datasets",
                            "Fine-tuning: Low-rank adaptation (LoRA) for domain adaptation",
                            "SOTA 2024: Beats PatchTST by 5-10% zero-shot, 15-20% with fine-tuning"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Moirai-MoE (Salesforce, 2024)",
                        description: "Mixture-of-Experts foundation model with token-level specialization: $h_t = \\sum_{k=1}^E g_k(z_t, \\theta_g) \\cdot \\text{Expert}_k(x_t, \\theta_k)$ where $g_k$ is gating network routing to expert $k$. Pre-trained on billion-scale TS for domain-specific expertise (finance, energy, retail, etc.).",
                        highlight: "MOE SCALING",
                        color: "purple",
                        details: [
                            "Expert count: 8-32 experts per MoE layer, sparse activation (top-2 or top-4)",
                            "Gating: $g_k = \\text{softmax}(W_g x_t)$, learned routing per token",
                            "Specialization: Experts learn domain-specific patterns automatically",
                            "Efficiency: $O(N \\log E)$ vs. dense $O(N E)$ for $N$ tokens, $E$ experts",
                            "Zero/Few-shot: Adapts to new domains via expert selection",
                            "Multi-variate: Handles 100+ variables via variable-specific routing",
                            "SOTA 2024: Top performer on multivariate long-term benchmarks"
                        ]
                    },
                    {
                        icon: "🧠",
                        title: "TimeGPT (Nixtla, 2024)",
                        description: "Commercial GPT-style model pre-trained on 100B points from diverse sources. API-based service with zero-shot and few-shot modes. Supports exogenous variables, multiple frequencies, confidence intervals. Uses decoder-only architecture with 1.6B parameters.",
                        highlight: "COMMERCIAL API",
                        color: "green",
                        details: [
                            "Scale: 1.6B parameters, trained on proprietary + public datasets",
                            "API access: REST API with simple Python/R clients",
                            "Frequency handling: Automatic detection of hourly/daily/monthly patterns",
                            "Conformal prediction: Statistically rigorous uncertainty intervals",
                            "Fine-tuning: API-based few-shot learning on user data",
                            "Pricing: Usage-based, competitive with cloud GPU costs",
                            "Benchmarks: Published results competitive with TimesFM"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Lag-Llama (2023)",
                        description: "Applies LLaMA-style decoder-only architecture to time series. Pre-trained on probabilistic forecasting via distribution prediction: $p(y_t | y_{<t}) = \\text{StudentT}(\\mu_t(y_{<t}), \\sigma_t(y_{<t}), \\nu)$. Open-source, smaller scale (200M params) but effective.",
                        highlight: "LLAMA-STYLE",
                        color: "red",
                        details: [
                            "Architecture: Based on LLaMA decoder, adapted for TS",
                            "Probabilistic: Predicts Student-t distribution parameters",
                            "Training: Negative log-likelihood on distribution parameters",
                            "Open source: Weights available on HuggingFace",
                            "Context: Up to 2048 tokens (patches)",
                            "Scaling: 200M params, good balance of performance and efficiency",
                            "Use case: Open alternative to commercial foundation models"
                        ]
                    },
                    {
                        icon: "🌊",
                        title: "Foundation Model Training Insights",
                        description: "Key lessons from foundation model development: (1) Data diversity beats size beyond 10B points, (2) Synthetic augmentation crucial for rare patterns, (3) Multi-task learning (forecasting + imputation + anomaly) improves generalization, (4) Proper tokenization is critical (quantile binning > uniform), (5) Scaling laws hold: loss ∝ N^(-α) where α ≈ 0.4.",
                        highlight: "INSIGHTS",
                        color: "cyan",
                        details: [
                            "Data curation: Balance across domains, frequencies, lengths",
                            "Synthetic data: Gaussian processes, ARIMA, diffusion models",
                            "Tokenization: Quantile binning preserves distribution across domains",
                            "Loss functions: Combination of MSE, quantile loss, distribution metrics",
                            "Compute: 100B points × 100 epochs ≈ 10^22 FLOPs (A100 months)",
                            "Emergent abilities: Zero-shot transfer, few-shot adaptation appear at scale",
                            "Open questions: Optimal architecture, context length, multi-modal fusion"
                        ]
                    }
                ]
            }
        },

        {
            id: "specialized",
            title: "Specialized & Hybrid Architectures",
            icon: "🎯",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🌐",
                        title: "MICN (Multi-scale Isometric Convolution, 2023)",
                        description: "Isometric convolutions at multiple scales: $y_l = \\text{Conv}_{s_l}(x_l)$ with downsampling rate $s_l = 2^{l-1}$. Isometry constraint $\\|\\text{Conv}(x)\\|_2 = \\|x\\|_2$ via orthogonal filters $W^T W = I$. Captures local-global features hierarchically, fused via learnable upsampling.",
                        highlight: "MULTI-SCALE CNN",
                        color: "green",
                        details: [
                            "Isometric property: Preserves signal energy across scales",
                            "Orthogonal initialization: SVD-based for $W^T W = I$",
                            "Multi-scale pyramid: $l=1, ..., \\log_2 L$ levels",
                            "Feature fusion: Concatenate upsampled features from all scales",
                            "Hybrid: Can be combined with transformer for global modeling",
                            "Complexity: $O(L \\log L \\cdot k^2)$ where $k$ is kernel size",
                            "Empirical: Competitive with transformers on ETTh1, Weather with fewer params"
                        ]
                    },
                    {
                        icon: "🎪",
                        title: "TFT - Temporal Fusion Transformer (2019)",
                        description: "Interpretable architecture for production: (1) Variable Selection Network (VSN) $s_t = \\sigma(\\text{GRU}(\\text{known}_t, \\text{context}))$ selects important features, (2) Gated Residual Network (GRN) $\\text{GRN}(x) = \\text{LayerNorm}(x + \\text{GLU}(\\text{MLP}(x)))$, (3) Multi-horizon attention $\\text{Attention}(Q_t, K_{1:H}, V_{1:H})$ for variable forecast length, (4) Quantile outputs for uncertainty.",
                        highlight: "INTERPRETABLE",
                        color: "indigo",
                        details: [
                            "VSN importance: Per-timestep feature weights $s_{t,i} \\in [0,1]$ visualizable",
                            "Static covariates: Entity embeddings for categorical (e.g., store ID)",
                            "Gated Linear Units: $\\text{GLU}(x) = \\sigma(W_g x) \\odot (W_v x)$ for conditional activation",
                            "Multi-horizon: Forecasts all $H$ steps jointly with cross-horizon attention",
                            "Quantile loss: $\\mathcal{L}_q = \\sum_q \\max(q(y - \\hat{y}_q), (q-1)(y - \\hat{y}_q))$",
                            "Production adoption: Google, Microsoft, Amazon for business forecasting",
                            "Interpretability: Attention weights + VSN scores explain predictions"
                        ]
                    },
                    {
                        icon: "🏔️",
                        title: "PRformer - Pyramidal RNN Transformer (2025)",
                        description: "Pyramidal RNN Embedding (PRE): (1) Bottom-up convolutions $f_l = \\text{Conv1D}_{k_l}(f_{l-1})$ with increasing kernels, (2) Top-down refinement $f_l' = f_l + \\text{Upsample}(f_{l+1}')$, (3) RNN aggregation $h_t^s = \\text{GRU}(f_t^s, h_{t-1}^s)$ per scale $s$. Integrated with transformer for multivariate attention. Complexity $O(T)$ linear in length.",
                        highlight: "PYRAMIDAL RNN",
                        color: "teal",
                        details: [
                            "Multi-scale CNN: Captures patterns at scales $2^0, 2^1, ..., 2^{L-1}$",
                            "RNN temporal: GRU processes each scale's features sequentially",
                            "Top-down fusion: High-level context guides low-level refinement",
                            "Transformer integration: Self-attention on PRE outputs for multivariate",
                            "Linear complexity: $O(T d k)$ where $k$ is kernel size (small)",
                            "Scalability: Performance improves with longer $T$, no degradation",
                            "SOTA 2025: Outperforms PatchTST/DLinear on 8 benchmarks with better efficiency"
                        ]
                    },
                    {
                        icon: "🔧",
                        title: "LATST - Long-term Attention Stabilized Transformer (2024)",
                        description: "Addresses attention collapse in long-horizon forecasting: (1) Modified attention prevents entropy collapse $H(A) = -\\sum p_i \\log p_i$ staying high, (2) Adaptive scaling $\\alpha_t = \\eta / (1 + \\beta \\cdot \\text{Var}(A_t))$ stabilizes training, (3) Simplified architecture competitive with complex designs.",
                        highlight: "STABILITY",
                        color: "amber",
                        details: [
                            "Entropy regularization: Penalty term $\\lambda \\cdot H(A)$ encourages peaked attention",
                            "Variance-adaptive scaling: Adjusts attention scale based on distribution spread",
                            "Training stability: Gradient clipping + warm-up crucial for long horizons",
                            "Simplified design: 2-4 layers sufficient, deep networks not always better",
                            "Parameter efficiency: Competitive with linears on param count",
                            "Multivariate: Handles $C > 50$ without instability issues",
                            "SOTA 2024: Beats vanilla transformers on real-world long-horizon (ETTh2, Electricity)"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "TimeFlex - Modular Flexible Forecasting (2025)",
                        description: "Modular architecture with specialized components: (1) Trend module $T_t = \\text{MLP}(\\Delta X_t, \\Delta^2 X_t)$ for polynomial trends, (2) Periodic module $P_t = \\text{FFT}^{-1}(\\text{Filter}(\\mathcal{F}(X)))$ for seasonality, (3) Residual module $R_t = \\text{Transformer}(X - T - P)$ for complex patterns. Fusion via learned weights $\\hat{y} = \\sum_i w_i M_i(X)$.",
                        highlight: "MODULAR",
                        color: "cyan",
                        details: [
                            "Component library: Trend (linear/polynomial), Periodic (Fourier/Wavelet), Residual (Transformer/MLP)",
                            "Automatic selection: Architecture search or meta-learning picks components",
                            "Gaussian Process evaluation: Tests on controlled GP-generated data with known properties",
                            "Interpretable: Each module explains specific pattern type",
                            "Tailored forecasting: Adapts structure to data characteristics",
                            "Hybrid approach: Combines statistical (trend/seasonal) with DL (residual)",
                            "SOTA insights: Reveals which architectures excel at which pattern types"
                        ]
                    },
                    {
                        icon: "🌪️",
                        title: "ModernTCN - Revitalized Temporal Convolution (2024)",
                        description: "Large-kernel depthwise convolutions challenge transformers: $\\text{DWConv}(x)_c = (x * w_{\\text{depth}})_c$ with kernel $K \\in \\{25, 51, 101\\}$ per channel, followed by pointwise $1 \\times 1$ expansion $\\text{PWConv}(x) = W x$. Layer normalization + GELU activation. Efficient alternative to attention.",
                        highlight: "LARGE KERNEL",
                        color: "pink",
                        details: [
                            "Depthwise-separable: $\\text{DW}$ captures temporal, $\\text{PW}$ mixes channels",
                            "Large receptive field: Kernel $K=51$ → receptive field $\\approx 51L$ with stacking",
                            "Complexity: $O(L K C)$ vs. $O(L^2 C d)$ for transformers",
                            "Parameter efficient: Depthwise reduces params by factor of $d$",
                            "Residual highway: $y = x + \\text{Dropout}(\\text{Conv}(\\text{LN}(x)))$",
                            "Empirical: Matches PatchTST accuracy with 10× fewer params and 3× faster",
                            "When to use: Resource-constrained deployment, need for speed"
                        ]
                    }
                ]
            }
        },

        {
            id: "training",
            title: "Training Strategies & Best Practices",
            icon: "🎓",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "📊",
                        title: "Loss Functions",
                        description: "Choice of loss significantly impacts performance. For point forecasts: MSE $\\mathcal{L}_{\\text{MSE}} = \\frac{1}{N} \\sum (y - \\hat{y})^2$ (sensitive to outliers), MAE $\\mathcal{L}_{\\text{MAE}} = \\frac{1}{N} \\sum |y - \\hat{y}|$ (robust), Huber combines both. For probabilistic: Quantile loss $\\mathcal{L}_q = \\sum_q \\max(q(y - \\hat{y}_q), (q-1)(y - \\hat{y}_q))$, CRPS $\\int_{-\\infty}^\\infty (F(y) - \\mathbb{1}_{y \\geq y_{\\text{obs}}})^2 dy$.",
                        highlight: "LOSS FUNCTIONS",
                        color: "blue",
                        details: [
                            "MSE: Penalizes large errors heavily, $\\nabla_{\\hat{y}} = 2(\\hat{y} - y)$",
                            "MAE: Robust to outliers, but non-smooth at zero (use Huber alternative)",
                            "SMAPE: $\\frac{100}{N} \\sum \\frac{|y - \\hat{y}|}{(|y| + |\\hat{y}|)/2}$ for scale-independence",
                            "Quantile: Pinball loss for specific quantiles $q \\in \\{0.1, 0.5, 0.9\\}$",
                            "Distribution: NLL $-\\log p(y | \\hat{\\theta})$ for parametric distributions",
                            "Ranking: DILATE loss encourages shape similarity beyond point accuracy"
                        ]
                    },
                    {
                        icon: "⚙️",
                        title: "Hyperparameters",
                        description: "Critical hyperparameters: Learning rate $\\eta \\in [10^{-5}, 10^{-3}]$ with cosine/linear decay, batch size $B \\in [16, 128]$ (larger for transformers), model dimension $d \\in [256, 1024]$ balancing capacity and compute, number of layers $L \\in [2, 8]$ (diminishing returns beyond 4-6), attention heads $H \\in [4, 16]$ divisible by $d$, dropout $p \\in [0.1, 0.3]$ for regularization.",
                        highlight: "HYPERPARAMS",
                        color: "purple",
                        details: [
                            "LR scheduling: Warm-up (linear increase) + cosine decay optimal",
                            "Batch size: Larger batches stabilize training but need higher LR",
                            "Model dim: $d=512$ good default, scale with data size",
                            "Depth: Transformers benefit from 4-6 layers, more can overfit",
                            "Heads: $H=8$ typical, more heads for longer sequences",
                            "Regularization: Dropout 0.1-0.2, label smoothing 0.1 helps",
                            "Gradient clipping: Clip norm to 1.0 prevents explosion"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "Data Preprocessing",
                        description: "Essential preprocessing steps: (1) Normalization: Min-max $(x - \\min) / (\\max - \\min)$ or Z-score $(x - \\mu) / \\sigma$, prefer instance-wise for non-stationary, (2) Missing data: Forward fill, interpolation, or masking with special token, (3) Outlier handling: Clip to $[\\mu - 3\\sigma, \\mu + 3\\sigma]$ or use robust scalers, (4) Differencing: $\\nabla x_t = x_t - x_{t-1}$ for trends, seasonal $\\nabla_s x_t = x_t - x_{t-s}$.",
                        highlight: "PREPROCESSING",
                        color: "green",
                        details: [
                            "RevIN: Instance normalization with denormalization crucial for transformers",
                            "Log transform: For multiplicative trends/seasonality (e.g., stock prices)",
                            "Detrending: Remove polynomial trend before modeling if severe",
                            "Missing data: Avoid learning on padded zeros, use attention masks",
                            "Frequency encoding: Add Fourier features for known periods",
                            "Calendar features: Hour, day, month as categorical embeddings"
                        ]
                    },
                    {
                        icon: "📈",
                        title: "Learning Rate Scheduling",
                        description: "Effective LR schedules: (1) Warm-up: Linear increase from $\\eta_{\\text{min}}$ to $\\eta_{\\text{max}}$ over $N_{\\text{warmup}}$ steps (typically 5-10% of total), (2) Cosine decay: $\\eta_t = \\eta_{\\text{min}} + \\frac{1}{2}(\\eta_{\\text{max}} - \\eta_{\\text{min}})(1 + \\cos(\\pi t / T))$, (3) OneCycleLR: Single cycle with peak at 30-40%, (4) ReduceLROnPlateau: Halve when validation loss plateaus.",
                        highlight: "LR SCHEDULE",
                        color: "amber",
                        details: [
                            "Warm-up necessity: Prevents early instability in transformers",
                            "Cosine vs. linear: Cosine smoother, less hyperparams",
                            "OneCycleLR: Fastest convergence but needs tuning",
                            "Plateau reduction: Adaptive, good when unsure of total steps",
                            "Initial LR: Start with 1e-4, adjust based on batch size (linear scaling)",
                            "Final LR: Reduce to 1e-6 for fine-tuning last epochs"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Regularization Techniques",
                        description: "Preventing overfitting: (1) Dropout: Apply after attention (0.1-0.2) and FFN (0.2-0.3), (2) Weight decay: L2 penalty $\\lambda \\|W\\|^2$ with $\\lambda \\in [10^{-5}, 10^{-3}]$, (3) Layer dropout: Stochastic depth drops entire layers during training, (4) Mixup/Cutmix: Data augmentation by mixing samples, (5) Early stopping: Monitor validation for 10-20 epochs.",
                        highlight: "REGULARIZATION",
                        color: "red",
                        details: [
                            "Attention dropout: Drops attention weights, not embeddings",
                            "Path dropout: Drops residual connections with probability $p$",
                            "Weight decay: Crucial for transformers, typically 0.01-0.1",
                            "Label smoothing: $y_{\\text{smooth}} = (1-\\alpha)y + \\alpha/K$ with $\\alpha=0.1$",
                            "Gradient noise: Small Gaussian noise improves generalization",
                            "Early stopping: Patience of 10-20 epochs on validation loss"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Training Efficiency",
                        description: "Accelerating training: (1) Mixed precision (FP16): 2-3× speedup with minimal accuracy loss, (2) Gradient accumulation: Simulate large batch sizes on limited memory, (3) Gradient checkpointing: Trade compute for memory (useful for long sequences), (4) Multi-GPU: Data parallelism with DistributedDataParallel (DDP), (5) Efficient attention: Flash Attention for 2-4× memory reduction.",
                        highlight: "EFFICIENCY",
                        color: "cyan",
                        details: [
                            "Mixed precision: Automatic with PyTorch AMP, use GradScaler",
                            "Accumulation: Update every $k$ batches, effective batch = $k \\times B$",
                            "Checkpointing: Recompute activations in backward, saves 80% memory",
                            "DDP: PyTorch native, scales linearly to 8-16 GPUs",
                            "Flash Attention: IO-aware algorithm, essential for $L > 1024$",
                            "Profile: Use PyTorch Profiler to identify bottlenecks"
                        ]
                    },
                    {
                        icon: "🔍",
                        title: "Validation & Evaluation",
                        description: "Proper evaluation: (1) Time-series split: Train on $[0, t_{\\text{train}}]$, validate on $[t_{\\text{train}}, t_{\\text{val}}]$, test on $[t_{\\text{val}}, t_{\\text{end}}]$ (never shuffle!), (2) Rolling window: Retrain periodically for non-stationary data, (3) Metrics: MSE, MAE, SMAPE, MASE (scaled by naive forecast), (4) Horizons: Report per-horizon performance ($H=24, 48, 96, 192, ...$), (5) Statistical tests: Diebold-Mariano for significance.",
                        highlight: "EVALUATION",
                        color: "indigo",
                        details: [
                            "No shuffle: Time order must be preserved in splits",
                            "Walk-forward: Retrain or update model as new data arrives",
                            "Multiple horizons: Short (24), medium (96), long (336, 720)",
                            "Baselines: Compare against seasonal naive, ARIMA, Prophet",
                            "Significance: Use DM test to verify improvement is not random",
                            "Computational: Report training time, inference speed, memory"
                        ]
                    },
                    {
                        icon: "🐛",
                        title: "Common Pitfalls",
                        description: "Avoid these mistakes: (1) Data leakage: Normalizing with test statistics, using future information, (2) Overfitting indicators: Train loss << val loss, high variance across runs, (3) Underfitting: Insufficient capacity, too high regularization, (4) Exploding/vanishing gradients: Check gradient norms, use grad clipping, (5) Poor convergence: Too high LR, no warm-up, wrong optimizer.",
                        highlight: "PITFALLS",
                        color: "red",
                        details: [
                            "Leakage: Always normalize train/val/test separately",
                            "Overfitting: Try smaller model, more dropout, less training",
                            "Underfitting: Increase capacity, reduce regularization, train longer",
                            "Gradients: Plot grad norms, clip if $>1.0$, check for NaNs",
                            "Optimizer: AdamW with weight decay 0.01 is robust default",
                            "Debugging: Start with small model on subset, ensure training loss decreases"
                        ]
                    },
                    {
                        icon: "🎨",
                        title: "Data Augmentation",
                        description: "TS-specific augmentation: (1) Jittering: Add Gaussian noise $x' = x + \\mathcal{N}(0, \\sigma^2)$, (2) Scaling: Multiply by random factor $x' = \\alpha x$ where $\\alpha \\sim \\mathcal{U}(0.8, 1.2)$, (3) Time warping: Non-linear time distortion, (4) Window slicing: Random crops of different lengths, (5) Mixup: $x' = \\lambda x_1 + (1-\\lambda) x_2$, (6) Frequency masking: Drop random frequency bands in FFT.",
                        highlight: "AUGMENTATION",
                        color: "pink",
                        details: [
                            "Jitter strength: $\\sigma = 0.01 \\times \\text{std}(x)$ typical",
                            "Scaling: Simulates different scales/units",
                            "Warping: Stretches/compresses time axis randomly",
                            "Window slicing: Increases effective dataset size",
                            "Mixup: $\\lambda \\sim \\text{Beta}(\\alpha, \\alpha)$ with $\\alpha=0.2$",
                            "Frequency: Robust to noise in specific bands"
                        ]
                    }
                ]
            }
        },

        {
            id: "deployment",
            title: "Production Deployment & MLOps",
            icon: "🚀",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "📦",
                        title: "Model Serving",
                        description: "Deploy trained models: (1) ONNX export for cross-platform inference $\\text{model.onnx} = \\text{torch.onnx.export}(model, x)$, (2) TorchScript for production $\\text{traced} = \\text{torch.jit.trace}(model, x)$, (3) TensorFlow Serving for scalable API, (4) Batch vs. online: Balance latency and throughput, (5) Model versioning: A/B test new models alongside old.",
                        highlight: "SERVING",
                        color: "blue",
                        details: [
                            "ONNX: Framework-agnostic, optimized runtimes (ONNXRuntime)",
                            "TorchScript: JIT compilation for C++ deployment",
                            "Batching: Accumulate requests for throughput (latency trade-off)",
                            "Caching: Cache recent predictions if data updates slowly",
                            "Fallback: Simpler model if primary fails or too slow",
                            "Versioning: Blue-green deployment for safe rollout"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Inference Optimization",
                        description: "Speed up inference: (1) Quantization: INT8 for 4× speedup, $W_{\\text{int8}} = \\text{round}(W / s) \\times s$ where $s = \\max(|W|)/127$, (2) Pruning: Remove low-magnitude weights, (3) Knowledge distillation: Train smaller student to mimic teacher, (4) CUDA kernels: Custom ops for specific patterns, (5) Flash Attention for memory efficiency.",
                        highlight: "OPTIMIZATION",
                        color: "green",
                        details: [
                            "Post-training quantization: No retraining, slight accuracy drop",
                            "Quantization-aware training: Learns quantized weights, minimal drop",
                            "Structured pruning: Remove entire channels/heads",
                            "Distillation: Student 10-100× smaller with 90-95% accuracy",
                            "TensorRT: NVIDIA toolkit for optimization",
                            "Profiling: Measure actual latency on target hardware"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Monitoring & Retraining",
                        description: "Maintain model health: (1) Drift detection: Monitor input distributions via KL-divergence, Kolmogorov-Smirnov test, (2) Performance tracking: Real-time MAE/MSE on incoming data, (3) Anomaly detection: Flag unusual predictions for review, (4) Retraining triggers: Automated when drift detected or error threshold exceeded, (5) Online learning: Incremental updates with new data.",
                        highlight: "MONITORING",
                        color: "amber",
                        details: [
                            "Data drift: $D_{KL}(P_{\\text{train}} \\| P_{\\text{prod}}) > \\tau$ triggers alert",
                            "Concept drift: Performance degrades even with same input distribution",
                            "Logging: Store predictions, ground truth (when available), inputs",
                            "Dashboards: Real-time metrics visualization (Grafana, Wandb)",
                            "Retrain cadence: Weekly/monthly based on data velocity",
                            "Validation: Always validate retrained model before deployment"
                        ]
                    },
                    {
                        icon: "🔐",
                        title: "Uncertainty Quantification",
                        description: "Reliable predictions need uncertainty: (1) Ensemble: Average predictions from $K$ models trained with different seeds, variance as uncertainty, (2) Monte Carlo dropout: Run inference with dropout enabled, (3) Quantile regression: Predict multiple quantiles directly, (4) Conformal prediction: Distribution-free intervals with coverage guarantees, (5) Bayesian approaches: Dropout as approximate variational inference.",
                        highlight: "UNCERTAINTY",
                        color: "purple",
                        details: [
                            "Ensemble: 3-5 models good trade-off, diminishing returns after",
                            "MC Dropout: $N=100$ forward passes, compute mean/std",
                            "Quantile: Predict $q \\in \\{0.1, 0.5, 0.9\\}$ with quantile loss",
                            "Conformal: Calibrate on validation set for exact coverage",
                            "Aleatoric vs. epistemic: Data noise vs. model uncertainty",
                            "Production: Report prediction intervals alongside point forecasts"
                        ]
                    },
                    {
                        icon: "🛡️",
                        title: "Robustness & Safety",
                        description: "Ensure reliable operation: (1) Input validation: Check ranges, missing values, (2) Graceful degradation: Fallback to simpler model or naive forecast, (3) Adversarial robustness: Test against input perturbations, (4) Explainability: SHAP/LIME for stakeholder trust, (5) Bias detection: Check performance across subgroups, (6) Compliance: GDPR, model cards for transparency.",
                        highlight: "SAFETY",
                        color: "red",
                        details: [
                            "Validation: Reject out-of-range inputs, impute missing values",
                            "Fallback: If model crashes, use last prediction or moving average",
                            "Adversarial: Add small noise, ensure predictions don't flip",
                            "Explainability: Time-series SHAP shows feature importance over time",
                            "Fairness: Equal error rates across demographic groups if applicable",
                            "Documentation: Model cards describe training, limitations, intended use"
                        ]
                    },
                    {
                        icon: "💰",
                        title: "Cost Optimization",
                        description: "Manage deployment costs: (1) Serverless: AWS Lambda, Google Cloud Functions for sporadic predictions, (2) Spot instances: 70-90% savings for batch processing, (3) Edge deployment: On-device inference reduces latency and data transfer, (4) Model compression: Smaller models reduce compute costs, (5) Caching: Avoid redundant predictions, (6) Auto-scaling: Scale replicas based on load.",
                        highlight: "COST",
                        color: "green",
                        details: [
                            "Serverless: Pay per invocation, cold start latency consideration",
                            "Spot instances: Interruptible, good for retraining jobs",
                            "Edge: Mobile, IoT devices, reduced cloud costs",
                            "Compression: 10× smaller model = 10× cheaper inference",
                            "Cache: TTL-based for data with low update frequency",
                            "Auto-scale: HPA in Kubernetes based on CPU/memory/custom metrics"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "MLOps Pipeline",
                        description: "End-to-end workflow: (1) Data versioning: DVC, MLflow for reproducibility, (2) Experiment tracking: Log hyperparams, metrics, artifacts, (3) CI/CD: Automated testing, deployment on merge, (4) Feature stores: Centralized feature management (Feast, Tecton), (5) Model registry: Version control for models, (6) Orchestration: Airflow, Kubeflow for pipeline automation.",
                        highlight: "MLOPS",
                        color: "cyan",
                        details: [
                            "DVC: Git-like versioning for datasets and models",
                            "MLflow/Wandb: Track experiments, compare runs",
                            "CI/CD: GitHub Actions, Jenkins for automated pipelines",
                            "Feature store: Consistent features across train/serve",
                            "Registry: Production, staging, archived model versions",
                            "Orchestration: Schedule retraining, monitoring jobs"
                        ]
                    },
                    {
                        icon: "📈",
                        title: "A/B Testing & Evaluation",
                        description: "Validate improvements: (1) Hold-out test: Reserve portion of traffic for new model, (2) Metrics: Business KPIs (revenue, engagement) alongside ML metrics, (3) Statistical significance: Sufficient samples for power, (4) Duration: Run long enough to capture seasonality, (5) Rollback plan: Instant revert if metrics degrade, (6) Multi-armed bandits: Adaptive traffic allocation.",
                        highlight: "A/B TESTING",
                        color: "indigo",
                        details: [
                            "Traffic split: 90/10 or 80/20 initially, expand if successful",
                            "Business metrics: Ultimately care about $ impact, not just MSE",
                            "Sample size: Calculate required $N$ for desired power (0.8)",
                            "Seasonality: Test over full week/month to avoid bias",
                            "Monitoring: Real-time dashboards comparing variants",
                            "Bandits: Thompson sampling allocates more traffic to better model"
                        ]
                    },
                    {
                        icon: "🌐",
                        title: "Multi-Tenancy & Scaling",
                        description: "Serve multiple customers: (1) Model per tenant: Isolated, customized but expensive, (2) Shared model: Economical, add tenant ID as feature, (3) Model pools: Group similar tenants, (4) Horizontal scaling: Add replicas for increased load, (5) Vertical scaling: Larger instances for bigger models, (6) Resource isolation: CPU/memory limits per tenant.",
                        highlight: "MULTI-TENANT",
                        color: "violet",
                        details: [
                            "Per-tenant: Best accuracy, high cost, management overhead",
                            "Shared: Cost-effective, potential privacy concerns",
                            "Pooling: Cluster tenants by characteristics, train per cluster",
                            "Horizontal: Linear scaling with load balancer",
                            "Vertical: GPU instances for large models",
                            "Isolation: Kubernetes namespaces, resource quotas"
                        ]
                    }
                ]
            }
        },

        {
            id: "attention-mechanisms",
            title: "Attention Mechanism Deep Dive",
            icon: "🔍",
            content: {
                type: "visual-tutorial",
                title: "ProbSparse Attention (Informer) - Complete Derivation",
                description: "Step-by-step derivation of sparsity measure for $O(L \\log L)$ complexity. Based on KL-divergence intuition: most query-key pairs contribute negligibly.",
                visualizationType: "array",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Motivation",
                        badgeColor: "slate",
                        title: "Why Sparsity Works",
                        description: "Empirical observation: Attention matrices are low-rank with most weights near zero. Only 'informative' queries with peaked distributions matter. KL-divergence from uniform: $D_{KL}(p \\| u) = \\sum p_i \\log(p_i / u_i)$ measures this.",
                        array: [
                            { value: "Q₁", highlight: "default", label: "uniform" },
                            { value: "Q₂", highlight: "active", label: "peaked" },
                            { value: "Q₃", highlight: "default", label: "uniform" },
                            { value: "Q₄", highlight: "active", label: "peaked" },
                            { value: "Q₅", highlight: "default", label: "uniform" }
                        ],
                        note: "Peaked attention indicates important queries; uniform is redundant"
                    },
                    {
                        stepNumber: 2,
                        badge: "Sparsity Measure",
                        badgeColor: "cyan",
                        title: "Define M(q_i)",
                        description: "Sparsity measure approximates KL: $M(q_i) = \\max_j \\left\\{\\frac{q_i k_j^T}{\\sqrt{d_k}}\\right\\} - \\frac{1}{L} \\sum_{j=1}^L \\frac{q_i k_j^T}{\\sqrt{d_k}} = \\ln \\sum_j \\exp\\left(\\frac{q_i k_j^T}{\\sqrt{d_k}}\\right) - \\frac{1}{L} \\sum_j \\frac{q_i k_j^T}{\\sqrt{d_k}}$. High $M$ → peaked distribution → informative query.",
                        array: [
                            { value: "Q₁", highlight: "compare", label: "$M=0.2$" },
                            { value: "Q₂", highlight: "active", label: "$M=2.1$" },
                            { value: "Q₃", highlight: "compare", label: "$M=0.5$" },
                            { value: "Q₄", highlight: "active", label: "$M=1.8$" },
                            { value: "Q₅", highlight: "compare", label: "$M=0.3$" }
                        ],
                        note: "First term is LSE (log-sum-exp), second is arithmetic mean"
                    },
                    {
                        stepNumber: 3,
                        badge: "Sampling",
                        badgeColor: "purple",
                        title: "Efficient Approximation",
                        description: "Computing $M(q_i)$ for all $L$ queries still $O(L^2)$. Approximate via random sampling: Select $u = c \\ln L$ keys (with $c \\approx 5$), compute $M$ on sample. Sort queries by sampled $M$, take top-$u$.",
                        array: [
                            { value: "Sample", highlight: "processing", label: "u keys" },
                            { value: "Compute M", highlight: "processing", label: "for all Q" },
                            { value: "Sort Q", highlight: "processing", label: "by M" }
                        ],
                        note: "Sampling reduces complexity to $O(L \\log L)$ for sparsity computation"
                    },
                    {
                        stepNumber: 4,
                        badge: "Selection",
                        badgeColor: "amber",
                        title: "Select Top-u Queries",
                        description: "Keep top-$u$ queries: $\\tilde{Q} = \\{q_i \\mid i \\in \\text{top-}u(M)\\}$. For remaining $L-u$ queries, use mean-pooled query $\\bar{q} = \\frac{1}{L-u} \\sum_{i \\not\\in \\text{top-}u} q_i$. This approximates their negligible contribution.",
                        array: [
                            { value: "Q₂", highlight: "selected", label: "$M=2.1$" },
                            { value: "Q₄", highlight: "selected", label: "$M=1.8$" },
                            { value: "Q̄", highlight: "processing", label: "mean" }
                        ],
                        note: "Sparsity ratio $\\approx 1 - (c \\ln L / L) \\to 1$ as $L \\to \\infty$"
                    },
                    {
                        stepNumber: 5,
                        badge: "Attention",
                        badgeColor: "emerald",
                        title: "Compute Sparse Attention",
                        description: "Compute attention only for selected queries: $\\text{Attention}(\\tilde{Q}, K, V) = \\text{softmax}\\left(\\frac{\\tilde{Q} K^T}{\\sqrt{d_k}}\\right) V$. Matrix multiply: $\\tilde{Q} K^T$ is $u \\times L$, then matmul with $V$ gives $u \\times d_v$ output. Reconstruct full $L \\times d_v$ by replicating $\\bar{q}$ output.",
                        array: [
                            { value: "A₂", highlight: "sorted", label: "output" },
                            { value: "A₄", highlight: "sorted", label: "output" },
                            { value: "Ā", highlight: "sorted", label: "replicated" }
                        ],
                        note: "Total complexity: $O(L u d_k) + O(u L d_v) = O(L \\log L \\cdot d)$"
                    },
                    {
                        stepNumber: 6,
                        badge: "Distilling",
                        badgeColor: "teal",
                        title: "Self-Attention Distilling",
                        description: "Between encoder layers, apply 1D conv with stride 2 to halve sequence length: $X_{l+1} = \\text{MaxPool}(\\text{ELU}(\\text{Conv1d}(X_l)))$. Attention in next layer on $L/2$ tokens. Progressively distills to shorter representations.",
                        array: [
                            { value: "L₁", highlight: "sorted-left", label: "$L$ tokens" },
                            { value: "→", highlight: "default", label: "distill" },
                            { value: "L₂", highlight: "sorted-right", label: "$L/2$" },
                            { value: "→", highlight: "default", label: "distill" },
                            { value: "L₃", highlight: "active", label: "$L/4$" }
                        ],
                        note: "Reduces computation in deeper layers while preserving information"
                    }
                ],
                insight: {
                    icon: "💡",
                    title: "Key Insight",
                    color: "cyan",
                    text: "ProbSparse leverages attention sparsity: Most query-key pairs have uniform (low-information) attention. By identifying and computing only high-sparsity queries, we reduce $O(L^2)$ to $O(L \\log L)$ while retaining 95%+ of information.",
                    points: [
                        "Theoretical: $M(q_i)$ is upper bound on $D_{KL}(\\text{Attention}(q_i) \\| \\text{Uniform})$",
                        "Empirical: Informer achieves 3-5× speedup and 80% memory reduction",
                        "Scalability: Enables sequences $L=10,000+$ on single GPU",
                        "Trade-off: Slight accuracy drop (1-3%) for major efficiency gain"
                    ]
                }
            }
        },

        {
            id: "patching-tutorial",
            title: "Patching Strategy Visualization",
            icon: "🧩",
            content: {
                type: "visual-tutorial",
                title: "How PatchTST Segments Time Series - Complete Walkthrough",
                description: "Mathematical patching: Reduces sequence length $L \\to N_p = \\lfloor (L - P + S)/S \\rfloor$ where $P$ is patch length, $S \\leq P$ is stride. Inspired by Vision Transformers (ViT) but adapted for temporal dependencies.",
                visualizationType: "array",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Original",
                        badgeColor: "slate",
                        title: "Raw Time Series",
                        description: "Univariate series $X = [x_1, x_2, ..., x_L] \\in \\mathbb{R}^L$. Vanilla transformer: Each time step is a token → $L$ tokens → Attention complexity $O(L^2 d)$. For $L=512$, $d=512$ → $\\approx 134M$ ops per layer.",
                        array: [
                            { value: "1", highlight: "default" },
                            { value: "2", highlight: "default" },
                            { value: "3", highlight: "default" },
                            { value: "4", highlight: "default" },
                            { value: "5", highlight: "default" },
                            { value: "6", highlight: "default" },
                            { value: "7", highlight: "default" },
                            { value: "8", highlight: "default" },
                            { value: "9", highlight: "default" }
                        ],
                        note: "Example: $L=9$ tokens → $9 \\times 9 = 81$ attention pairs"
                    },
                    {
                        stepNumber: 2,
                        badge: "Patching",
                        badgeColor: "cyan",
                        title: "Create Patches (Non-overlapping)",
                        description: "Segment into patches $p_i = [x_{(i-1)P+1}, ..., x_{iP}]$ with stride $S=P$ (non-overlapping). Number of patches $N_p = \\lceil L/P \\rceil$. Example: $P=3$, $S=3$ → patches $[1,2,3], [4,5,6], [7,8,9]$.",
                        array: [
                            { value: "[1,2,3]", highlight: "active", label: "p₁" },
                            { value: "[4,5,6]", highlight: "compare", label: "p₂" },
                            { value: "[7,8,9]", highlight: "selected", label: "p₃" }
                        ],
                        note: "$L=9, P=3 \\Rightarrow N_p=3$ patches, $3 \\times 3 = 9$ attention pairs (9× reduction!)"
                    },
                    {
                        stepNumber: 3,
                        badge: "Overlap",
                        badgeColor: "purple",
                        title: "Overlapping Patches",
                        description: "Stride $S < P$ creates overlap for smoothness. Example: $P=4$, $S=2$ → patches $[1,2,3,4], [3,4,5,6], [5,6,7,8], [7,8,9]$ (padded). Overlaps preserve boundary information but increase $N_p$.",
                        array: [
                            { value: "[1,2,3,4]", highlight: "active", label: "p₁" },
                            { value: "[3,4,5,6]", highlight: "compare", label: "p₂" },
                            { value: "[5,6,7,8]", highlight: "selected", label: "p₃" },
                            { value: "[7,8,9,*]", highlight: "processing", label: "p₄" }
                        ],
                        note: "$N_p = \\lfloor (9-4+2)/2 \\rfloor + 1 = 4$ patches with stride 2"
                    },
                    {
                        stepNumber: 4,
                        badge: "Embedding",
                        badgeColor: "emerald",
                        title: "Linear Patch Embedding",
                        description: "Project patches to $d$-dimensional space: $e_i = W p_i + b$ where $W \\in \\mathbb{R}^{d \\times P}$, $b \\in \\mathbb{R}^d$. Add positional encoding $PE(i)$ to preserve patch order: $\\tilde{e}_i = e_i + PE(i)$.",
                        array: [
                            { value: "e₁", highlight: "sorted", label: "$\\in \\mathbb{R}^d$" },
                            { value: "e₂", highlight: "sorted", label: "$\\in \\mathbb{R}^d$" },
                            { value: "e₃", highlight: "sorted", label: "$\\in \\mathbb{R}^d$" }
                        ],
                        note: "Each patch embedding captures local $P$-step temporal context"
                    },
                    {
                        stepNumber: 5,
                        badge: "Transformer",
                        badgeColor: "blue",
                        title: "Transformer Encoding",
                        description: "Standard transformer layers on patch embeddings: Multi-head attention $\\text{MHA}(\\tilde{e}_1, ..., \\tilde{e}_{N_p})$ captures dependencies between patches (not individual time steps). Feed-forward $\\text{FFN}$ processes each patch embedding.",
                        array: [
                            { value: "Attn", highlight: "active", label: "patch-level" },
                            { value: "FFN", highlight: "compare", label: "per-patch" },
                            { value: "Norm", highlight: "selected", label: "residual" }
                        ],
                        note: "Complexity: $O(N_p^2 d) = O((L/P)^2 d)$ - quadratic in patches, not time steps"
                    },
                    {
                        stepNumber: 6,
                        badge: "Channel-Indep",
                        badgeColor: "amber",
                        title: "Channel Independence",
                        description: "For multivariate $X \\in \\mathbb{R}^{L \\times C}$: Process each channel separately with own transformer. No cross-channel attention! Output: $C$ independent forecasts, aggregated via mean/weighted sum. Assumes weak cross-channel dependency.",
                        array: [
                            { value: "Ch1", highlight: "sorted-left", label: "TF₁" },
                            { value: "Ch2", highlight: "sorted-left", label: "TF₂" },
                            { value: "Ch3", highlight: "sorted-left", label: "TF₃" },
                            { value: "→", highlight: "default", label: "" },
                            { value: "Agg", highlight: "active", label: "mean" }
                        ],
                        note: "Total complexity: $C \\cdot O((L/P)^2 d)$, no $O(C^2)$ cross-attention"
                    },
                    {
                        stepNumber: 7,
                        badge: "Forecasting",
                        badgeColor: "green",
                        title: "Prediction Head",
                        description: "Two strategies: (1) Direct: Flatten patch embeddings → Linear layer to horizon $H$, (2) Autoregressive: Iteratively predict next patch, slide window. Direct is faster, autoregressive more flexible for long $H$.",
                        array: [
                            { value: "Flatten", highlight: "processing", label: "$N_p \\times d$" },
                            { value: "Linear", highlight: "active", label: "→ $H$" },
                            { value: "Output", highlight: "sorted", label: "$\\hat{y}$" }
                        ],
                        note: "Direct: $O(N_p d H)$ single forward pass; AR: $O(H/P)$ passes"
                    }
                ],
                insight: {
                    icon: "🚀",
                    title: "Why Patching Works So Well",
                    color: "blue",
                    text: "Patching reduces tokens from $L$ to $L/P$ while preserving local temporal structure within patches. This enables modeling of longer sequences ($L > 10,000$) and implicitly handles local smoothness, similar to how CNNs use kernels or ViT uses image patches.",
                    points: [
                        "Theoretical: Patches capture local autocorrelation within $P$ steps (e.g., hourly patterns in day)",
                        "Empirical: 10-20% accuracy improvement over vanilla transformers on long-term forecasting",
"Efficiency: $P=16$ reduces tokens 16×, enabling $L=8192$ sequences on consumer GPUs",
                        "ViT analogy: Temporal 'image patches' - each patch is a mini time window",
                        "Parameter reduction: 50% fewer params than vanilla due to shorter sequence",
                        "SOTA: PatchTST achieved best results on 8/10 benchmarks in 2023"
                    ]
                }
            }
        },

        {
            id: "comparison",
            title: "Comprehensive Architecture Comparison",
            icon: "📊",
            content: {
                type: "analysis",
                title: "Complexity, Performance & Use-Case Analysis (2025 Update)",
                description: "Quantitative comparison across all architectures: Time complexity $f(L,C,d)$, space complexity, key innovations, empirical strengths, limitations. Based on published papers and benchmark results on ETTh, Weather, Traffic, Electricity datasets.",
                tableData: {
                    headers: ["Architecture", "Time Complexity", "Space Complexity", "Key Innovation", "Best For", "Limitations", "Year"],
                    rows: [
                        {
                            name: "Vanilla Transformer",
                            complexity: "$O(L^2 d)$",
                            space: "$O(L^2 + Ld)$",
                            innovation: "Self-attention mechanism",
                            best: "Baseline, short sequences $L < 512$",
                            limitations: "Quadratic scaling, memory bottleneck",
                            year: "2017"
                        },
                        {
                            name: "Informer",
                            complexity: "$O(L \\log L \\cdot d)$",
                            space: "$O(L \\log L + Ld)$",
                            innovation: "ProbSparse: $M(q_i)$ query selection",
                            best: "Long sequences $L > 1000$, efficiency focus",
                            limitations: "Approximation quality, sampling overhead",
                            year: "2021"
                        },
                        {
                            name: "Autoformer",
                            complexity: "$O(L \\log L \\cdot d)$",
                            space: "$O(L \\log L + Ld)$",
                            innovation: "Auto-correlation: $\\rho(\\tau)$ period discovery",
                            best: "Periodic/seasonal data, known cycles",
                            limitations: "Requires FFT-friendly lengths, less flexible",
                            year: "2021"
                        },
                        {
                            name: "FEDformer",
                            complexity: "$O(L \\log L \\cdot d_f)$",
                            space: "$O(L + d_f L)$",
                            innovation: "Frequency Enhanced Block (FEB)",
                            best: "Complex frequency patterns, spectral analysis",
                            limitations: "DFT/DWT assumptions, mode selection",
                            year: "2022"
                        },
                        {
                            name: "Pyraformer",
                            complexity: "$O(L d)$",
                            space: "$O(L d)$",
                            innovation: "Pyramid: $C$-ary tree attention",
                            best: "Multi-scale dependencies, hierarchical",
                            limitations: "Tree structure rigidity, tuning $C$",
                            year: "2022"
                        },
                        {
                            name: "ETSformer",
                            complexity: "$O(L d)$",
                            space: "$O(L d)$",
                            innovation: "ETS integration: adaptive $\\alpha, \\beta, \\gamma$",
                            best: "Interpretable forecasts, production systems",
                            limitations: "ETS assumptions, limited non-linearity",
                            year: "2022"
                        },
                        {
                            name: "Crossformer",
                            complexity: "$O(L \\sqrt{L} d)$",
                            space: "$O(L \\sqrt{L})$",
                            innovation: "DSW + cross-dimension attention",
                            best: "Multivariate $C > 20$, strong correlations",
                            limitations: "Segment tuning, routing complexity",
                            year: "2023"
                        },
                        {
                            name: "Non-stationary TF",
                            complexity: "$O(L^2 d)$",
                            space: "$O(L^2 + Ld)$",
                            innovation: "De-stationary normalization",
                            best: "Distribution shifts, trending data",
                            limitations: "Still quadratic, sensitive to outliers",
                            year: "2022"
                        },
                        {
                            name: "PatchTST",
                            complexity: "$O((L/P)^2 C d)$",
                            space: "$O((L/P)^2 + (L/P)d)$",
                            innovation: "Patching: $N_p = (L-P)/S + 1$",
                            best: "Long sequences $L > 2000$, SOTA accuracy",
                            limitations: "No cross-channel, patch size tuning",
                            year: "2023"
                        },
                        {
                            name: "iTransformer",
                            complexity: "$O(C^2 L d)$",
                            space: "$O(C^2 + Cd)$",
                            innovation: "Inversion: tokens=$C$, dim=$L$",
                            best: "High-dim multivariate $C > 50$",
                            limitations: "Fails if $C \\ll L$, requires correlations",
                            year: "2024"
                        },
                        {
                            name: "MICN",
                            complexity: "$O(L \\log L \\cdot k^2)$",
                            space: "$O(L \\log L)$",
                            innovation: "Isometric conv: $W^T W = I$",
                            best: "Local-global features, CNN efficiency",
                            limitations: "Orthogonal constraint, less expressive",
                            year: "2023"
                        },
                        {
                            name: "TFT",
                            complexity: "$O(L^2 d + H L d)$",
                            space: "$O(L^2 + Ld + H)$",
                            innovation: "VSN gating: $s_t = \\sigma(\\text{GRU})$",
                            best: "Production, interpretability, multi-horizon",
                            limitations: "Complexity, many hyperparameters",
                            year: "2019"
                        },
                        {
                            name: "MTST",
                            complexity: "$O(\\sum_i (L/P_i)^2 d)$",
                            space: "$O(\\sum_i (L/P_i)^2)$",
                            innovation: "Multi-branch patches + relative PE",
                            best: "Multi-frequency patterns, long-term",
                            limitations: "Multiple branches increase params/compute",
                            year: "2024"
                        },
                        {
                            name: "PRformer",
                            complexity: "$O(T d k)$",
                            space: "$O(T d)$",
                            innovation: "Pyramidal RNN Embedding (PRE)",
                            best: "Scalable long sequences, linear complexity",
                            limitations: "RNN sequential (less parallel), complex architecture",
                            year: "2025"
                        },
                        {
                            name: "TimeMixer",
                            complexity: "$O(\\sum_s L_s^2 d)$",
                            space: "$O(\\sum_s L_s^2)$",
                            innovation: "Past-decomposable multi-scale mixing",
                            best: "Multi-scale temporal patterns",
                            limitations: "Scale selection, fusion tuning",
                            year: "2024"
                        },
                        {
                            name: "ModernTCN",
                            complexity: "$O(L K C)$",
                            space: "$O(L K)$",
                            innovation: "Large kernel DW conv: $K \\in [25, 101]$",
                            best: "Efficiency, edge deployment, speed",
                            limitations: "Limited long-range (vs attention), kernel tuning",
                            year: "2024"
                        },
                        {
                            name: "LATST",
                            complexity: "$O(L^2 d / \\alpha)$",
                            space: "$O(L^2)$",
                            innovation: "Entropy/stability fixes, adaptive scaling",
                            best: "Stable long-term training, collapse mitigation",
                            limitations: "Still quadratic, specific to attention issues",
                            year: "2024"
                        },
                        {
                            name: "TimeFlex",
                            complexity: "$O(L d)$",
                            space: "$O(L d)$",
                            innovation: "Modular: trend/periodic/residual branches",
                            best: "Diverse dynamics, interpretable components",
                            limitations: "Component selection, architecture search",
                            year: "2025"
                        },
                        {
                            name: "DLinear",
                            complexity: "$O(L H)$",
                            space: "$O(L)$",
                            innovation: "Decompose + linear (shockingly simple)",
                            best: "Strong baselines, fast inference, linear data",
                            limitations: "Limited non-linearity, fails on complex patterns",
                            year: "2023"
                        },
                        {
                            name: "Chronos",
                            complexity: "$O(L d)$ zero-shot",
                            space: "$O(L d)$",
                            innovation: "T5-tokenizer pre-training on 100M series",
                            best: "Zero-shot forecasting, probabilistic outputs",
                            limitations: "Large model (200M params), quantization artifacts",
                            year: "2024"
                        },
                        {
                            name: "TimesFM",
                            complexity: "$O(L d)$ decoder-only",
                            space: "$O(L d)$",
                            innovation: "100B points pre-training, patching",
                            best: "Zero-shot scaling, covariate support",
                            limitations: "Proprietary data, 200M params, inference cost",
                            year: "2024"
                        },
                        {
                            name: "Moirai-MoE",
                            complexity: "$O(L \\log E \\cdot d)$",
                            space: "$O(E \\cdot L d)$",
                            innovation: "Token-level MoE routing to experts",
                            best: "Domain adaptation, multi-task, sparse activation",
                            limitations: "Training complexity, routing overhead",
                            year: "2024"
                        },
                        {
                            name: "Lag-Llama",
                            complexity: "$O(L d)$",
                            space: "$O(L d)$",
                            innovation: "LLaMA-style for TS, Student-t distribution",
                            best: "Open-source foundation model, probabilistic",
                            limitations: "Smaller scale (200M), less pre-training data",
                            year: "2023"
                        },
                        {
                            name: "Flowformer",
                            complexity: "$O(L d^2)$",
                            space: "$O(L d)$",
                            innovation: "Linear attention via flow network",
                            best: "Linear complexity when $d \\ll L$",
                            limitations: "Approximation quality, less expressive",
                            year: "2023"
                        }
                    ],
                    notes: [
                        "**Notation**: $L$=sequence length, $C$=variables, $d$=model dimension, $P$=patch size, $H$=horizon, $k$=kernel, $E$=experts, $d_f$=frequency dimension",
                        "**Complexity**: Per-layer time complexity; total = layers × heads × complexity",
                        "**Space**: Attention matrix storage dominates; $O(L^2)$ is prohibitive for $L > 2048$",
                        "**Best For**: Empirical strengths from benchmarks (ETTh1/h2, Weather, Traffic, Electricity)",
                        "**Foundation models**: Chronos, TimesFM, Moirai lead zero-shot; fine-tuning narrows gap",
                        "**2025 SOTA**: PRformer (efficiency), PatchTST (accuracy), TimesFM (zero-shot), ModernTCN (speed)",
                        "**Production**: TFT (interpretability), LATST (stability), DLinear (simplicity), ModernTCN (edge)"
                    ]
                },
                comparisonCharts: [
                    {
                        title: "Accuracy vs. Efficiency Trade-off",
                        description: "Pareto frontier on ETTh1 dataset (96→96 forecasting). X-axis: Inference time (ms), Y-axis: MSE (lower better).",
                        dataPoints: [
                            { name: "DLinear", efficiency: 5, accuracy: 0.35, category: "baseline" },
                            { name: "PatchTST", efficiency: 45, accuracy: 0.28, category: "sota" },
                            { name: "iTransformer", efficiency: 60, accuracy: 0.29, category: "multivariate" },
                            { name: "TimesFM", efficiency: 80, accuracy: 0.30, category: "foundation" },
                            { name: "ModernTCN", efficiency: 15, accuracy: 0.32, category: "efficient" },
                            { name: "PRformer", efficiency: 35, accuracy: 0.28, category: "hybrid" },
                            { name: "Vanilla TF", efficiency: 120, accuracy: 0.40, category: "baseline" }
                        ]
                    },
                    {
                        title: "Scalability: Max Sequence Length vs. Memory",
                        description: "Maximum $L$ trainable on 16GB GPU with batch size 32, $d=512$.",
                        bars: [
                            { name: "Vanilla TF", maxL: 512, memory: "16GB" },
                            { name: "Informer", maxL: 2048, memory: "16GB" },
                            { name: "PatchTST", maxL: 8192, memory: "16GB" },
                            { name: "Pyraformer", maxL: 4096, memory: "16GB" },
                            { name: "ModernTCN", maxL: 16384, memory: "16GB" }
                        ]
                    }
                ]
            }
        },

        {
            id: "benchmarks",
            title: "Benchmark Results & Datasets",
            icon: "📈",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "⚡",
                        title: "ETT Dataset (Electricity Transformer Temperature)",
                        description: "Standard benchmark from China electricity grid. ETTh1/h2 (hourly, 7 variables), ETTm1/m2 (15-min, 7 variables). Tests 4 horizons: 96, 192, 336, 720. Challenges: Multi-scale periodicity (hourly, daily, weekly).",
                        highlight: "STANDARD",
                        color: "cyan",
                        details: [
                            "Size: 17,420 hourly points (2 years), 69,680 15-min",
                            "Variables: Load, oil temp, various transformer metrics",
                            "Horizons: Short (96=4 days), Medium (192=8d), Long (336=2w, 720=1mo)",
                            "Patterns: Strong daily/weekly cycles, seasonal trends",
                            "Difficulty: Non-stationary, multiple frequencies",
                            "SOTA: PatchTST (MSE 0.280 @ 96h), PRformer (0.285)"
                        ]
                    },
                    {
                        icon: "🌤️",
                        title: "Weather Dataset",
                        description: "Meteorological data from Weather Station (Max Planck Institute). 21 variables (temp, humidity, pressure, etc.), hourly for 4 years. Tests long-term forecasting up to 720 hours (30 days). Multi-variate correlations crucial.",
                        highlight: "MULTIVARIATE",
                        color: "blue",
                        details: [
                            "Size: 52,696 hourly samples (4 years)",
                            "Variables: 21 meteorological measurements",
                            "Correlations: Strong cross-variable (temp↔humidity)",
                            "Horizons: 96, 192, 336, 720 hours",
                            "Difficulty: High-dimensional, complex interactions",
                            "SOTA: iTransformer (MSE 0.172 @ 96h), TimesFM zero-shot (0.185)"
                        ]
                    },
                    {
                        icon: "🚗",
                        title: "Traffic Dataset",
                        description: "Bay Area traffic flow from Caltrans. 862 sensors (variables), hourly for 17 months. Extremely high-dimensional, spatial-temporal dependencies. Tests multivariate handling at scale.",
                        highlight: "HIGH-DIM",
                        color: "purple",
                        details: [
                            "Size: 17,544 samples × 862 sensors",
                            "Challenge: $C=862$ variables, spatial correlations",
                            "Patterns: Rush hour peaks, day-of-week effects",
                            "Horizons: 96, 192, 336, 720 hours",
                            "Difficulty: Extreme dimensionality, missing data",
                            "SOTA: Crossformer (MAE 0.361 @ 96h), Moirai-MoE (0.355)"
                        ]
                    },
                    {
                        icon: "💡",
                        title: "Electricity Dataset",
                        description: "Hourly electricity consumption of 321 clients (Portugal). 2 years of data. Similar to ETT but higher dimensional. Tests model ability on many correlated series.",
                        highlight: "CORRELATED",
                        color: "amber",
                        details: [
                            "Size: 26,304 samples × 321 clients",
                            "Patterns: Similar consumption patterns per client type",
                            "Correlations: Moderate cross-client, strong temporal",
                            "Horizons: 96, 192, 336, 720",
                            "Difficulty: Many similar but not identical series",
                            "SOTA: PatchTST (MSE 0.126 @ 96h), LATST (0.130)"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "M4 Competition Dataset",
                        description: "100,000 series across 6 domains (yearly, quarterly, monthly, weekly, daily, hourly). Industry standard for classical forecasting. Tests generalization across frequencies and domains.",
                        highlight: "DIVERSE",
                        color: "green",
                        details: [
                            "Size: 100,000 series, varying lengths (100-1000+)",
                            "Domains: Demographics, finance, industry, macro, micro, other",
                            "Frequencies: Yearly to hourly (6 categories)",
                            "Metrics: SMAPE, MASE, OWA (Overall Weighted Average)",
                            "Classical baselines: ETS, ARIMA, Theta strong here",
                            "SOTA: Statistical ensembles, Chronos (0.875 OWA zero-shot)"
                        ]
                    },
                    {
                        icon: "🚀",
                        title: "PEMS Dataset (Traffic Flow)",
                        description: "California transportation system. PEMS03/04/07/08 with 358-883 sensors. 5-min granularity. Tests spatial-temporal modeling, often used with GNNs but transformers applicable.",
                        highlight: "SPATIAL-TEMPORAL",
                        color: "red",
                        details: [
                            "Size: 26,000-17,000 samples depending on subset",
                            "Spatial: Road network graph structure",
                            "Temporal: 5-minute intervals, strong periodicity",
                            "Horizons: 12 steps (1 hour) typical",
                            "Graph structure: Can be incorporated as attention bias",
                            "SOTA: Hybrid GNN-Transformer models lead"
                        ]
                    },
                    {
                        icon: "🧬",
                        title: "TimeFlex GP Dataset (Synthetic, 2025)",
                        description: "Gaussian Process generated series with controlled properties (trend degree, period count, noise level). Enables ablation studies on specific temporal patterns. Tests architectural strengths in isolation.",
                        highlight: "CONTROLLED",
                        color: "cyan",
                        details: [
                            "Generation: GP kernels (RBF, Periodic, Linear, Matérn)",
                            "Parameters: Configurable trend, seasonality, noise",
                            "Purpose: Understand why architectures work/fail",
                            "Evaluation: Decomposition quality, period detection",
                            "Findings: DLinear excels on linear trends, FEDformer on periodic",
                            "Use case: Architecture selection, hyperparameter sensitivity"
                        ]
                    },
                    {
                        icon: "💰",
                        title: "Financial Datasets (Various)",
                        description: "Stock prices (S&P500, individual tickers), crypto (BTC, ETH), forex. High volatility, non-stationary, efficient market hypothesis challenges. Often used for model stress testing.",
                        highlight: "VOLATILE",
                        color: "emerald",
                        details: [
                            "Characteristics: High noise, regime changes, fat tails",
                            "Difficulty: Low predictability (efficient markets)",
                            "Horizons: Intraday (minutes) to daily",
                            "Evaluation: Sharpe ratio, trading returns alongside MSE",
                            "Caution: Out-of-sample performance often poor",
                            "SOTA: Ensembles, foundation models with domain fine-tuning"
                        ]
                    },
                    {
                        icon: "🔬",
                        title: "Evaluation Best Practices",
                        description: "Proper benchmarking requires: (1) Time-ordered splits (never shuffle), (2) Multiple horizons (96, 192, 336, 720), (3) Multiple datasets (avoid overfitting to one), (4) Statistical significance tests (Diebold-Mariano), (5) Computational metrics (time, memory, params), (6) Ablation studies (what component matters).",
                        highlight: "METHODOLOGY",
                        color: "indigo",
                        details: [
                            "Splitting: 70% train, 10% val, 20% test typical",
                            "Rolling: Retrain periodically for non-stationary evaluation",
                            "Metrics: Report MSE, MAE, SMAPE, MASE for comparison",
                            "Horizons: Per-step errors often reveal degradation",
                            "Significance: DM test p-value < 0.05 for claim",
                            "Reproducibility: Fix seeds, report hardware, share code"
                        ]
                    }
                ]
            }
        },

        {
            id: "code-examples",
            title: "Complete Implementation Examples",
            icon: "💻",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "ProbSparse Attention (Informer) - Full Implementation",
                        description: "Complete PyTorch implementation with sampling-based sparsity measure and top-u selection. Includes distilling layer for progressive sequence reduction.",
                        language: "python",
                        code: `import torch
import torch.nn as nn
import numpy as np
import math

class ProbSparseAttention(nn.Module):
    """
    ProbSparse Attention from Informer paper.
    Reduces O(L^2) to O(L log L) via query selection.
    """
    def __init__(self, d_model, n_heads, factor=5, mask_flag=True, scale=None):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        self.factor = factor  # c in paper, typically 5
        self.scale = scale or math.sqrt(self.d_k)
        self.mask_flag = mask_flag
        
        # Projections
        self.query_proj = nn.Linear(d_model, d_model)
        self.key_proj = nn.Linear(d_model, d_model)
        self.value_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
        
    def _prob_QK(self, Q, K, sample_k, n_top):
        """
        Compute sparsity measure M(q_i) via sampling.
        
        Args:
            Q: [B, H, L_Q, d_k]
            K: [B, H, L_K, d_k]
            sample_k: Number of keys to sample
            n_top: Number of top queries to select
            
        Returns:
            M_top: Indices of top-n_top queries
            M: Sparsity measure for all queries
        """
        B, H, L_Q, d_k = Q.shape
        _, _, L_K, _ = K.shape
        
        # Random sample keys (for approximation)
        K_expand = K.unsqueeze(-3).expand(B, H, L_Q, L_K, d_k)
        index_sample = torch.randint(0, L_K, (sample_k,))
        K_sample = K_expand[:, :, :, index_sample, :]  # [B, H, L_Q, sample_k, d_k]
        
        # Compute Q * K_sample^T
        Q_K_sample = torch.matmul(
            Q.unsqueeze(-2),  # [B, H, L_Q, 1, d_k]
            K_sample.transpose(-2, -1)  # [B, H, L_Q, d_k, sample_k]
        ).squeeze(-2) / self.scale  # [B, H, L_Q, sample_k]
        
        # Sparsity measure M(q_i) = max - mean
        M = Q_K_sample.max(-1)[0] - Q_K_sample.mean(-1)  # [B, H, L_Q]
        
        # Select top-n_top queries
        M_top = M.topk(n_top, sorted=False)[1]  # [B, H, n_top]
        
        return M_top, M
    
    def _get_initial_context(self, V, L_Q):
        """
        Mean-pooled value for non-selected queries.
        """
        return V.mean(dim=-2).unsqueeze(-2).expand(-1, -1, L_Q, -1)
    
    def _update_context(self, context_in, V, scores, index, L_Q):
        """
        Update context with selected queries' attention outputs.
        """
        B, H, L_V, d_v = V.shape
        
        # Attention for selected queries
        attn = torch.softmax(scores, dim=-1)  # [B, H, n_top, L_V]
        context_in = torch.matmul(attn, V)  # [B, H, n_top, d_v]
        
        # Create full context (broadcast selected to all positions)
        # In practice, use scatter for efficiency
        context_full = context_in.mean(dim=-2, keepdim=True).expand(-1, -1, L_Q, -1)
        
        return context_full
    
    def forward(self, queries, keys, values, attn_mask=None):
        """
        Args:
            queries: [B, L_Q, D]
            keys: [B, L_K, D]
            values: [B, L_V, D]
            attn_mask: Optional attention mask
            
        Returns:
            out: [B, L_Q, D]
            attn: Attention weights (sparse)
        """
        B, L_Q, _ = queries.shape
        _, L_K, _ = keys.shape
        
        # Project
        Q = self.query_proj(queries).view(B, L_Q, self.n_heads, self.d_k).transpose(1, 2)
        K = self.key_proj(keys).view(B, L_K, self.n_heads, self.d_k).transpose(1, 2)
        V = self.value_proj(values).view(B, L_K, self.n_heads, self.d_k).transpose(1, 2)
        
        # Determine u and sample_k
        u = int(self.factor * np.log(L_K))  # Top-u queries
        u = min(u, L_Q)  # Can't select more than L_Q
        sample_k = min(u, L_K)  # Sample size
        
        # Compute sparsity measure and select top-u
        Q_reduce, M = self._prob_QK(Q, K, sample_k, u)
        
        # Gather selected queries
        # Q_reduce shape: [B, H, u]
        Q_selected = torch.gather(
            Q,  # [B, H, L_Q, d_k]
            dim=2,
            index=Q_reduce.unsqueeze(-1).expand(-1, -1, -1, self.d_k)
        )  # [B, H, u, d_k]
        
        # Compute attention for selected queries
        scores = torch.matmul(Q_selected, K.transpose(-2, -1)) / self.scale  # [B, H, u, L_K]
        
        if attn_mask is not None:
            scores = scores.masked_fill(attn_mask, -1e9)
        
        # Get initial context (mean for non-selected)
        context = self._get_initial_context(V, L_Q)
        
        # Update with selected queries
        context = self._update_context(context, V, scores, Q_reduce, L_Q)
        
        # Reshape and project
        out = context.transpose(1, 2).contiguous().view(B, L_Q, -1)
        out = self.out_proj(out)
        
        # Return sparse attention weights for visualization (optional)
        attn = torch.softmax(scores, dim=-1)  # [B, H, u, L_K]
        
        return out, attn


class DistillingLayer(nn.Module):
    """
    Self-attention distilling layer for Informer.
    Halves sequence length via 1D convolution.
    """
    def __init__(self, d_model, kernel_size=3):
        super().__init__()
        self.conv = nn.Conv1d(d_model, d_model, kernel_size, stride=2, padding=1)
        self.norm = nn.LayerNorm(d_model)
        self.activation = nn.ELU()
        self.maxpool = nn.MaxPool1d(kernel_size=3, stride=2, padding=1)
        
    def forward(self, x):
        """
        Args:
            x: [B, L, D]
        Returns:
            x: [B, L//2, D]
        """
        # Conv expects [B, D, L]
        x = x.transpose(1, 2)
        x = self.conv(x)
        x = self.activation(x)
        x = self.maxpool(x)
        x = x.transpose(1, 2)
        x = self.norm(x)
        return x


# Example usage
if __name__ == "__main__":
    B, L, D, H = 32, 512, 512, 8
    
    model = ProbSparseAttention(d_model=D, n_heads=H)
    x = torch.randn(B, L, D)
    
    out, attn = model(x, x, x)
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {out.shape}")
    print(f"Attention shape (sparse): {attn.shape}")  # [B, H, u, L]
    print(f"Sparsity: {attn.shape[2] / L:.2%}")  # Fraction of queries kept`,
                        runnable: true
                    },
                    {
                        title: "Patching Module (PatchTST) with RevIN",
                        description: "Complete patching implementation with overlap support and Reversible Instance Normalization for improved performance.",
                        language: "python",
                        code: `import torch
import torch.nn as nn

class RevIN(nn.Module):
    """
    Reversible Instance Normalization.
    Normalizes per instance/channel, stores stats for denormalization.
    """
    def __init__(self, num_features, eps=1e-5, affine=True):
        super().__init__()
        self.num_features = num_features
        self.eps = eps
        self.affine = affine
        
        if self.affine:
            self.weight = nn.Parameter(torch.ones(num_features))
            self.bias = nn.Parameter(torch.zeros(num_features))
        
    def forward(self, x, mode='norm'):
        """
        Args:
            x: [B, L, C]
            mode: 'norm' for normalization, 'denorm' for denormalization
        """
        if mode == 'norm':
            self._get_statistics(x)
            x = self._normalize(x)
        elif mode == 'denorm':
            x = self._denormalize(x)
        return x
    
    def _get_statistics(self, x):
        # x: [B, L, C]
        self.mean = x.mean(dim=1, keepdim=True).detach()  # [B, 1, C]
        self.std = x.std(dim=1, keepdim=True).detach() + self.eps  # [B, 1, C]
        
    def _normalize(self, x):
        x = (x - self.mean) / self.std
        if self.affine:
            x = x * self.weight + self.bias
        return x
    
    def _denormalize(self, x):
        if self.affine:
            x = (x - self.bias) / self.weight
        x = x * self.std + self.mean
        return x


class PatchEmbedding(nn.Module):
    """
    Patch embedding for time series.
    Segments series into patches and projects to d_model.
    """
    def __init__(self, patch_len=16, stride=8, d_model=512, dropout=0.1):
        super().__init__()
        self.patch_len = patch_len
        self.stride = stride
        
        # Linear projection per patch
        self.value_embedding = nn.Linear(patch_len, d_model)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x):
        """
        Args:
            x: [B, L, C]
        Returns:
            patches: [B*C, num_patches, d_model]
            num_patches: int
        """
        B, L, C = x.shape
        
        # Unfold to create patches
        # unfold(dimension, size, step)
        x = x.permute(0, 2, 1)  # [B, C, L]
        x = x.unfold(dimension=2, size=self.patch_len, step=self.stride)  # [B, C, num_patches, patch_len]
        
        num_patches = x.shape[2]
        
        # Reshape for channel-independent processing
        x = x.reshape(B * C, num_patches, self.patch_len)  # [B*C, num_patches, patch_len]
        
        # Project each patch
        x = self.value_embedding(x)  # [B*C, num_patches, d_model]
        x = self.dropout(x)
        
        return x, num_patches


class PositionalEncoding(nn.Module):
    """
    Sinusoidal positional encoding.
    """
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        
        # Create positional encoding matrix
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        pe = pe.unsqueeze(0)  # [1, max_len, d_model]
        self.register_buffer('pe', pe)
        
    def forward(self, x):
        """
        Args:
            x: [B, L, D]
        Returns:
            x: [B, L, D] with positional encoding added
        """
        return x + self.pe[:, :x.size(1), :]


class PatchTST(nn.Module):
    """
    Complete PatchTST model with channel independence.
    """
    def __init__(
        self,
        c_in,
        seq_len,
        pred_len,
        patch_len=16,
        stride=8,
        d_model=512,
        n_heads=8,
        e_layers=3,
        d_ff=2048,
        dropout=0.1,
        use_revin=True
    ):
        super().__init__()
        self.c_in = c_in
        self.seq_len = seq_len
        self.pred_len = pred_len
        self.use_revin = use_revin
        
        # Reversible Instance Normalization
        if use_revin:
            self.revin = RevIN(c_in)
        
        # Patch embedding
        self.patch_embedding = PatchEmbedding(patch_len, stride, d_model, dropout)
        self.positional_encoding = PositionalEncoding(d_model)
        
        # Transformer encoder (channel-independent)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=d_ff,
            dropout=dropout,
            activation='gelu',
            batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=e_layers)
        
        # Prediction head
        num_patches = (seq_len - patch_len) // stride + 1
        self.head = nn.Linear(num_patches * d_model, pred_len)
        
    def forward(self, x):
        """
        Args:
            x: [B, L, C]
        Returns:
            y: [B, H, C] where H is prediction length
        """
        B, L, C = x.shape
        
        # Normalize
        if self.use_revin:
            x = self.revin(x, mode='norm')
        
        # Patch embedding: [B*C, num_patches, d_model]
        x_patch, num_patches = self.patch_embedding(x)
        
        # Positional encoding
        x_patch = self.positional_encoding(x_patch)
        
        # Transformer encoding
        x_enc = self.encoder(x_patch)  # [B*C, num_patches, d_model]
        
        # Flatten patches for prediction
        x_flat = x_enc.reshape(B * C, -1)  # [B*C, num_patches * d_model]
        
        # Predict
        y = self.head(x_flat)  # [B*C, pred_len]
        y = y.reshape(B, C, self.pred_len).permute(0, 2, 1)  # [B, pred_len, C]
        
        # Denormalize
        if self.use_revin:
            y = self.revin(y, mode='denorm')
        
        return y


# Example usage
if __name__ == "__main__":
    import math
    
    # Dataset parameters
    B, L, C, H = 32, 512, 7, 96
    
    model = PatchTST(
        c_in=C,
        seq_len=L,
        pred_len=H,
        patch_len=16,
        stride=8,
        d_model=256,
        n_heads=8,
        e_layers=3,
        use_revin=True
    )
    
    x = torch.randn(B, L, C)
    y = model(x)
    
    print(f"Input: {x.shape}")
    print(f"Output: {y.shape}")
    print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")`,
                        runnable: true
                    },
                    {
                        title: "Series Decomposition (Autoformer) with Auto-Correlation",
                        description: "Complete implementation of moving average decomposition and auto-correlation mechanism via FFT.",
                        language: "python",
                        code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MovingAvgDecomp(nn.Module):
    """
    Moving Average Decomposition.
    Separates trend (via moving average) from seasonal component.
    """
    def __init__(self, kernel_size=25):
        super().__init__()
        self.kernel_size = kernel_size
        self.avg = nn.AvgPool1d(kernel_size=kernel_size, stride=1, padding=kernel_size//2)
        
    def forward(self, x):
        """
        Args:
            x: [B, L, C]
        Returns:
            seasonal: [B, L, C]
            trend: [B, L, C]
        """
        # Padding for edge effects
        front = x[:, 0:1, :].repeat(1, self.kernel_size // 2, 1)
        end = x[:, -1:, :].repeat(1, self.kernel_size // 2, 1)
        x_padded = torch.cat([front, x, end], dim=1)
        
        # Apply moving average (channel-wise)
        # avg expects [B, C, L]
        x_padded = x_padded.permute(0, 2, 1)
        trend = self.avg(x_padded)
        trend = trend.permute(0, 2, 1)[:, :x.shape[1], :]  # Trim to original length
        
        seasonal = x - trend
        return seasonal, trend


class AutoCorrelation(nn.Module):
    """
    Auto-Correlation mechanism from Autoformer.
    Discovers periodicity via FFT-based correlation.
    """
    def __init__(self, d_model, n_heads, factor=1, dropout=0.1):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        self.factor = factor
        
        self.query_proj = nn.Linear(d_model, d_model)
        self.key_proj = nn.Linear(d_model, d_model)
        self.value_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)
        
    def time_delay_agg_training(self, values, corr):
        """
        Time delay aggregation based on correlation.
        
        Args:
            values: [B, H, L, d_k]
            corr: [B, H, L] - correlation for each time lag
        Returns:
            V_agg: [B, H, L, d_k]
        """
        B, H, L, d_k = values.shape
        
        # Find top-k delays based on correlation
        top_k = int(self.factor * math.log(L))
        top_k = max(1, min(top_k, L // 2))
        
        # Select top delays
        weights, delays = torch.topk(corr, top_k, dim=-1)  # [B, H, top_k]
        
        # Normalize weights
        weights = F.softmax(weights, dim=-1)  # [B, H, top_k]
        
        # Aggregate values at selected delays
        # Roll values by delays and weight
        tmp_values = values.repeat(1, 1, 2, 1)  # [B, H, 2*L, d_k] for circular rolling
        
        # Initialize aggregation
        V_agg = torch.zeros_like(values)  # [B, H, L, d_k]
        
        for i in range(top_k):
            # Get delay for this position
            delay = delays[:, :, i]  # [B, H]
            
            # Roll and weight
            for b in range(B):
                for h in range(H):
                    d = delay[b, h].item()
                    rolled = torch.roll(tmp_values[b, h], shifts=int(d), dims=0)[:L]
                    V_agg[b, h] += weights[b, h, i] * rolled
        
        return V_agg
    
    def forward(self, queries, keys, values):
        """
        Args:
            queries, keys, values: [B, L, D]
        Returns:
            out: [B, L, D]
        """
        B, L, _ = queries.shape
        
        # Project
        Q = self.query_proj(queries).view(B, L, self.n_heads, self.d_k).transpose(1, 2)
        K = self.key_proj(keys).view(B, L, self.n_heads, self.d_k).transpose(1, 2)
        V = self.value_proj(values).view(B, L, self.n_heads, self.d_k).transpose(1, 2)
        
        # Compute auto-correlation via FFT
        # Q, K: [B, H, L, d_k]
        Q_fft = torch.fft.rfft(Q, dim=2)  # [B, H, L//2+1, d_k]
        K_fft = torch.fft.rfft(K, dim=2)
        
        # Cross-correlation in frequency domain: Q * conj(K)
        # Sum over d_k dimension
        corr_fft = Q_fft * torch.conj(K_fft)  # [B, H, L//2+1, d_k]
        corr_fft = corr_fft.sum(dim=-1)  # [B, H, L//2+1]
        
        # Inverse FFT to get correlation at each lag
        corr = torch.fft.irfft(corr_fft, n=L, dim=-1)  # [B, H, L]
        
        # Aggregate values based on correlation
        V_agg = self.time_delay_agg_training(V, corr)
        
        # Reshape and project
        out = V_agg.transpose(1, 2).contiguous().view(B, L, -1)
        out = self.out_proj(out)
        out = self.dropout(out)
        
        return out


class DecompLayer(nn.Module):
    """
    Decomposition Layer for Autoformer.
    Applies decomposition after each sublayer.
    """
    def __init__(self, d_model, kernel_size=25):
        super().__init__()
        self.decomp = MovingAvgDecomp(kernel_size)
        
    def forward(self, x, sublayer_output):
        """
        Args:
            x: Residual connection input [B, L, D]
            sublayer_output: Output from attention/FFN [B, L, D]
        Returns:
            seasonal: [B, L, D]
            trend: [B, L, D]
        """
        # Add residual
        x = x + sublayer_output
        
        # Decompose
        seasonal, trend = self.decomp(x)
        
        return seasonal, trend


# Example: Autoformer Encoder Layer
class AutoformerEncoderLayer(nn.Module):
    """
    Autoformer Encoder Layer with auto-correlation and decomposition.
    """
    def __init__(self, d_model, n_heads, d_ff=2048, dropout=0.1, kernel_size=25):
        super().__init__()
        
        self.autocorr = AutoCorrelation(d_model, n_heads, factor=1, dropout=dropout)
        self.decomp1 = DecompLayer(d_model, kernel_size)
        
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout)
        )
        self.decomp2 = DecompLayer(d_model, kernel_size)
        
    def forward(self, x):
        """
        Args:
            x: [B, L, D]
        Returns:
            x_seasonal: [B, L, D]
            x_trend: [B, L, D]
        """
        # Auto-correlation
        attn_out = self.autocorr(x, x, x)
        x_seasonal, trend1 = self.decomp1(x, attn_out)
        
        # Feed-forward
        ffn_out = self.ffn(x_seasonal)
        x_seasonal, trend2 = self.decomp2(x_seasonal, ffn_out)
        
        # Accumulate trends
        x_trend = trend1 + trend2
        
        return x_seasonal, x_trend


# Example usage
if __name__ == "__main__":
    import math
    
    B, L, D = 32, 512, 256
    
    model = AutoformerEncoderLayer(d_model=D, n_heads=8, kernel_size=25)
    x = torch.randn(B, L, D)
    
    seasonal, trend = model(x)
    
    print(f"Input: {x.shape}")
    print(f"Seasonal: {seasonal.shape}")
    print(f"Trend: {trend.shape}")
    print(f"Reconstruction error: {(x - (seasonal + trend)).abs().mean().item():.6f}")`,
                        runnable: true
                    },
                    {
                        title: "Training Loop with Best Practices",
                        description: "Complete training script with mixed precision, gradient clipping, learning rate scheduling, and validation.",
                        language: "python",
                        code: `import torch
import torch.nn as nn
from torch.amp import GradScaler, autocast
from torch.optim import AdamW
from torch.optim.lr_scheduler import OneCycleLR
import numpy as np
from tqdm import tqdm

class TSForecastingTrainer:
    """
    Time series forecasting trainer with best practices.
    """
    def __init__(
        self,
        model,
        train_loader,
        val_loader,
        device='cuda',
        lr=1e-4,
        weight_decay=0.01,
        epochs=100,
        patience=10,
        grad_clip=1.0,
        use_amp=True
    ):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.device = device
        self.epochs = epochs
        self.patience = patience
        self.grad_clip = grad_clip
        self.use_amp = use_amp
        
        # Optimizer with weight decay (AdamW)
        self.optimizer = AdamW(
            model.parameters(),
            lr=lr,
            weight_decay=weight_decay,
            betas=(0.9, 0.999)
        )
        
        # Learning rate scheduler (OneCycleLR)
        self.scheduler = OneCycleLR(
            self.optimizer,
            max_lr=lr,
            epochs=epochs,
            steps_per_epoch=len(train_loader),
            pct_start=0.3,  # 30% warm-up
            anneal_strategy='cos'
        )
        
        # Mixed precision scaler
        self.scaler = GradScaler() if use_amp else None
        
        # Loss function (MSE for point forecasts)
        self.criterion = nn.MSELoss()
        
        # Tracking
        self.best_val_loss = float('inf')
        self.patience_counter = 0
        self.history = {'train_loss': [], 'val_loss': []}
        
    def train_epoch(self):
        """Train for one epoch."""
        self.model.train()
        total_loss = 0
        
        pbar = tqdm(self.train_loader, desc='Training')
        for batch_idx, (x, y) in enumerate(pbar):
            x, y = x.to(self.device), y.to(self.device)
            
            self.optimizer.zero_grad()
            
            # Mixed precision forward pass
            if self.use_amp:
                with autocast('cuda'):
                    pred = self.model(x)
                    loss = self.criterion(pred, y)
                
                # Backward with scaling
                self.scaler.scale(loss).backward()
                
                # Gradient clipping (unscale first)
                self.scaler.unscale_(self.optimizer)
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.grad_clip)
                
                # Optimizer step
                self.scaler.step(self.optimizer)
                self.scaler.update()
            else:
                pred = self.model(x)
                loss = self.criterion(pred, y)
                loss.backward()
                
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.grad_clip)
                self.optimizer.step()
            
            # Scheduler step (per batch for OneCycleLR)
            self.scheduler.step()
            
            total_loss += loss.item()
            pbar.set_postfix({'loss': loss.item(), 'lr': self.scheduler.get_last_lr()[0]})
        
        return total_loss / len(self.train_loader)
    
    @torch.no_grad()
    def validate(self):
        """Validate on validation set."""
        self.model.eval()
        total_loss = 0
        
        for x, y in tqdm(self.val_loader, desc='Validation'):
            x, y = x.to(self.device), y.to(self.device)
            
            if self.use_amp:
                with autocast('cuda'):
                    pred = self.model(x)
                    loss = self.criterion(pred, y)
            else:
                pred = self.model(x)
                loss = self.criterion(pred, y)
            
            total_loss += loss.item()
        
        return total_loss / len(self.val_loader)
    
    def train(self):
        """Full training loop with early stopping."""
        print(f"Training on {self.device} with {sum(p.numel() for p in self.model.parameters()):,} parameters")
        
        for epoch in range(self.epochs):
            print(f"\nEpoch {epoch+1}/{self.epochs}")
            
            # Train
            train_loss = self.train_epoch()
            
            # Validate
            val_loss = self.validate()
            
            # Record
            self.history['train_loss'].append(train_loss)
            self.history['val_loss'].append(val_loss)
            
            print(f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
            
            # Early stopping check
            if val_loss < self.best_val_loss:
                self.best_val_loss = val_loss
                self.patience_counter = 0
                # Save best model
                torch.save(self.model.state_dict(), 'best_model.pt')
                print(f"✓ New best model (val_loss: {val_loss:.4f})")
            else:
                self.patience_counter += 1
                print(f"No improvement ({self.patience_counter}/{self.patience})")
                
                if self.patience_counter >= self.patience:
                    print(f"\nEarly stopping triggered after {epoch+1} epochs")
                    break
        
        # Load best model
        self.model.load_state_dict(torch.load('best_model.pt'))
        print(f"\nTraining complete. Best val loss: {self.best_val_loss:.4f}")
        
        return self.history


# Example usage
if __name__ == "__main__":
    from torch.utils.data import DataLoader, TensorDataset
    
    # Dummy data
    B, L_in, L_out, C = 1000, 512, 96, 7
    X_train = torch.randn(B, L_in, C)
    Y_train = torch.randn(B, L_out, C)
    X_val = torch.randn(B//5, L_in, C)
    Y_val = torch.randn(B//5, L_out, C)
    
    train_dataset = TensorDataset(X_train, Y_train)
    val_dataset = TensorDataset(X_val, Y_val)
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32)
    
    # Dummy model (replace with actual PatchTST, Autoformer, etc.)
    model = nn.Linear(L_in * C, L_out * C)  # Placeholder
    
    trainer = TSForecastingTrainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        lr=1e-4,
        epochs=50,
        patience=10
    )
    
    history = trainer.train()
    
    # Plot learning curves
    import matplotlib.pyplot as plt
    plt.plot(history['train_loss'], label='Train')
    plt.plot(history['val_loss'], label='Val')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.savefig('learning_curves.png')
    print("Learning curves saved to learning_curves.png")`,
                        runnable: true
                    },
                    {
                        title: "Zero-Shot Inference with TimesFM (Conceptual)",
                        description: "Conceptual example of using a pre-trained foundation model for zero-shot forecasting. Actual API may differ.",
                        language: "python",
                        code: `# NOTE: This is a conceptual example. Actual TimesFM API may differ.
# Install: pip install timesfm (hypothetical)

import torch
import numpy as np

class TimesFMZeroShot:
    """
    Wrapper for TimesFM-style zero-shot forecasting.
    Assumes pre-trained decoder-only transformer with patching.
    """
    def __init__(self, model_name='timesfm-200m', device='cuda'):
        """
        Load pre-trained TimesFM model.
        
        Args:
            model_name: Model size ('timesfm-200m', 'timesfm-1b', etc.)
            device: Device to run on
        """
        self.device = device
        
        # Hypothetical: Load from HuggingFace or similar
        # from transformers import TimesFMForForecasting
        # self.model = TimesFMForForecasting.from_pretrained(model_name).to(device)
        
        # For this example, we'll simulate
        print(f"Loading {model_name} on {device}...")
        self.model = self._build_dummy_model()  # Replace with actual loading
        self.model.eval()
        
        # Model config
        self.context_len = 512
        self.patch_len = 32
        
    def _build_dummy_model(self):
        """Dummy model for illustration."""
        return torch.nn.Linear(512 * 7, 96 * 7)  # Placeholder
    
    @torch.no_grad()
    def forecast(
        self,
        history,
        horizon=96,
        covariates=None,
        num_samples=100,
        temperature=1.0
    ):
        """
        Zero-shot forecasting.
        
        Args:
            history: [B, L, C] - Historical time series
            horizon: Forecast horizon
            covariates: [B, horizon, num_covariates] - Optional future covariates
            num_samples: Number of samples for probabilistic forecasts
            temperature: Sampling temperature
            
        Returns:
            forecast_mean: [B, horizon, C]
            forecast_quantiles: [B, horizon, C, num_quantiles]
        """
        B, L, C = history.shape
        
        # Truncate to context length if needed
        if L > self.context_len:
            history = history[:, -self.context_len:, :]
        
        # Normalize (instance-wise)
        mean = history.mean(dim=1, keepdim=True)
        std = history.std(dim=1, keepdim=True) + 1e-5
        history_norm = (history - mean) / std
        
        # Encode with pre-trained model
        # In actual TimesFM: Uses decoder-only with causal masking
        # Here we simulate
        context_flat = history_norm.reshape(B, -1)
        
        # Generate forecasts (would be autoregressive in practice)
        # For num_samples, enable dropout for uncertainty
        forecasts = []
        for _ in range(num_samples):
            pred_norm = self.model(context_flat)
            pred_norm = pred_norm.reshape(B, horizon, C)
            
            # Denormalize
            pred = pred_norm * std + mean
            forecasts.append(pred)
        
        forecasts = torch.stack(forecasts, dim=0)  # [num_samples, B, horizon, C]
        
        # Compute statistics
        forecast_mean = forecasts.mean(dim=0)  # [B, horizon, C]
        forecast_quantiles = torch.quantile(
            forecasts,
            q=torch.tensor([0.1, 0.5, 0.9]).to(self.device),
            dim=0
        )  # [3, B, horizon, C]
        
        forecast_quantiles = forecast_quantiles.permute(1, 2, 3, 0)  # [B, horizon, C, 3]
        
        return forecast_mean, forecast_quantiles
    
    def evaluate(self, test_loader, metrics=['mae', 'mse', 'smape']):
        """
        Evaluate on test set.
        
        Args:
            test_loader: DataLoader with (history, target)
            metrics: List of metrics to compute
            
        Returns:
            results: Dict of metric values
        """
        results = {m: [] for m in metrics}
        
        for history, target in test_loader:
            history = history.to(self.device)
            target = target.to(self.device)
            
            # Forecast
            pred_mean, _ = self.forecast(history, horizon=target.shape[1])
            
            # Compute metrics
            if 'mae' in metrics:
                mae = (pred_mean - target).abs().mean().item()
                results['mae'].append(mae)
            
            if 'mse' in metrics:
                mse = ((pred_mean - target) ** 2).mean().item()
                results['mse'].append(mse)
            
            if 'smape' in metrics:
                smape = 100 * (2 * (pred_mean - target).abs() / (pred_mean.abs() + target.abs() + 1e-8)).mean().item()
                results['smape'].append(smape)
        
        # Average across batches
        for m in metrics:
            results[m] = np.mean(results[m])
        
        return results


# Example usage
if __name__ == "__main__":
    from torch.utils.data import DataLoader, TensorDataset
    
    # Simulate test data
    B, L_hist, L_future, C = 100, 512, 96, 7
    X_test = torch.randn(B, L_hist, C)
    Y_test = torch.randn(B, L_future, C)
    
    test_dataset = TensorDataset(X_test, Y_test)
    test_loader = DataLoader(test_dataset, batch_size=16)
    
    # Initialize zero-shot model
    model = TimesFMZeroShot(model_name='timesfm-200m', device='cuda')
    
    # Evaluate
    results = model.evaluate(test_loader)
    
    print("Zero-Shot Performance:")
    for metric, value in results.items():
        print(f"  {metric.upper()}: {value:.4f}")
    
    # Single forecast with uncertainty
    sample_history = X_test[:1]  # [1, 512, 7]
    forecast_mean, forecast_q = model.forecast(sample_history, horizon=96, num_samples=100)
    
    print(f"\nForecast shape: {forecast_mean.shape}")
    print(f"Quantiles (10%, 50%, 90%): {forecast_q.shape}")`,
                        runnable: false
                    }
                ]
            }
        },

        {
            id: "resources",
            title: "Papers, Libraries & Learning Resources",
            icon: "📚",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "📄",
                        title: "Foundational Papers",
                        description: "Essential reading with arXiv links and key contributions. Start with Informer/Autoformer, then explore PatchTST and foundation models.",
                        highlight: "PAPERS",
                        color: "cyan",
                        details: [
                            "**Informer**: arXiv:2012.07436 (AAAI'21) - ProbSparse attention",
                            "**Autoformer**: arXiv:2106.13008 (NeurIPS'21) - Auto-correlation",
                            "**FEDformer**: arXiv:2201.12740 (ICML'22) - Frequency Enhanced Decomposition",
                            "**Pyraformer**: arXiv:2202.11009 (ICLR'22) - Pyramidal attention",
                            "**PatchTST**: arXiv:2211.14730 (ICLR'23) - SOTA with patching",
                            "**iTransformer**: arXiv:2310.06625 (ICLR'24) - Inverted embedding",
                            "**Chronos**: arXiv:2403.07815 (2024) - Amazon foundation model",
                            "**TimesFM**: Google AI Blog (2024) - 100B point pre-training"
                        ]
                    },
                    {
                        icon: "📚",
                        title: "Advanced Papers",
                        description: "Recent innovations and specialized architectures from 2024-2025 research.",
                        highlight: "SOTA 2025",
                        color: "purple",
                        details: [
                            "**MTST**: PMLR 238 (ICML'24) - Multi-resolution transformer",
                            "**LATST**: arXiv:2410.23749 (2024) - Attention stability",
                            "**PRformer**: Neural Networks (2025) - Pyramidal RNN embedding",
                            "**TimeFlex**: arXiv:2506.08977 (2025) - Modular architecture",
                            "**ModernTCN**: arXiv:2407.13003 (2024) - Large kernel revival",
                            "**TimeMixer**: arXiv:2405.14616 (2024) - Multi-scale mixing",
                            "**DLinear**: arXiv:2205.13504 (AAAI'23) - Surprising baselines",
                            "**TFT**: arXiv:1912.09363 (2019) - Interpretable forecasting"
                        ]
                    },
                    {
                        icon: "💾",
                        title: "Open-Source Libraries",
                        description: "Production-ready implementations with pre-trained models and benchmarks.",
                        highlight: "CODE",
                        color: "green",
                        details: [
                            "**HuggingFace Transformers**: Autoformer, Informer, TimesFM integrations",
                            "**TSLib** (github.com/thuml/Time-Series-Library): SOTA architectures",
                            "**GluonTS** (AWS): Toolkit with Chronos foundation model",
                            "**PyTorch Forecasting**: TFT and production-ready models",
                            "**Darts** (Unit8): User-friendly Python library",
                            "**NeuralForecast** (Nixtla): TimeGPT and modern architectures",
                            "**MOIRAI** (github.com/SalesforceAIResearch/moirai): MoE foundation",
                            "**TimeGPT** (nixtla.io): Commercial API"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Benchmark Datasets",
                        description: "Standard evaluation sets with download links and characteristics.",
                        highlight: "DATA",
                        color: "amber",
                        details: [
                            "**ETT** (Electricity Transformer): github.com/zhouhaoyi/ETDataset",
                            "**Weather/Traffic/Electricity**: Part of TSLib benchmarks",
                            "**M4**: forecasters.org/data - 100k series competition",
                            "**PEMS**: Traffic flow from Caltrans (PeMS website)",
                            "**Monash**: 30+ datasets from Monash Forecasting Archive",
                            "**Kaggle**: Store Sales, Web Traffic, M5 competitions",
                            "**UCI**: Individual household electric power",
                            "**Federal Reserve**: FRED economic time series"
                        ]
                    },
                    {
                        icon: "🎓",
                        title: "Learning Resources",
                        description: "Tutorials, courses, and educational materials for mastering TS transformers.",
                        highlight: "LEARN",
                        color: "blue",
                        details: [
                            "**CS229 (Stanford)**: Time Series lectures",
                            "**Fast.ai**: Practical Deep Learning has TS modules",
                            "**Forecasting: Principles and Practice** (Hyndman): Free online book",
                            "**Papers With Code**: Time Series Forecasting leaderboards",
                            "**YouTube**: Yannic Kilcher's paper explanations",
                            "**Medium/Towards Data Science**: Architecture walkthroughs",
                            "**ArXiv Sanity**: Track latest TS papers",
                            "**GitHub Awesome Lists**: awesome-time-series"
                        ]
                    },
                    {
                        icon: "🔧",
                        title: "Tools & Frameworks",
                        description: "Essential tools for development, experimentation, and deployment.",
                        highlight: "TOOLS",
                        color: "indigo",
                        details: [
                            "**Weights & Biases**: Experiment tracking and hyperparameter tuning",
                            "**MLflow**: Model registry and deployment",
                            "**Optuna/Ray Tune**: Hyperparameter optimization",
                            "**DVC**: Data versioning",
                            "**TensorBoard**: Visualization",
                            "**ONNX**: Model export for production",
                            "**Docker**: Containerization",
                            "**Kubernetes**: Orchestration and scaling"
                        ]
                    },
                    {
                        icon: "🌐",
                        title: "Communities & Forums",
                        description: "Connect with researchers and practitioners working on time series.",
                        highlight: "COMMUNITY",
                        color: "pink",
                        details: [
                            "**r/MachineLearning**: Reddit community",
                            "**Time Series Stack Exchange**: Q&A",
                            "**LinkedIn Groups**: Time Series Forecasting",
                            "**Discord**: ML/AI servers with TS channels",
                            "**Twitter/X**: Follow #TimeSeriesForecasting",
                            "**NeurIPS/ICML/ICLR**: Conference workshops",
                            "**International Symposium on Forecasting**: Annual conference",
                            "**Kaggle Forums**: Competition discussions"
                        ]
                    },
                    {
                        icon: "📖",
                        title: "Books & Textbooks",
                        description: "Comprehensive references for theoretical foundations and practical implementation.",
                        highlight: "BOOKS",
                        color: "emerald",
                        details: [
                            "**Time Series Analysis** (Hamilton): Classic econometrics text",
                            "**Forecasting: Principles and Practice** (Hyndman & Athanasopoulos): Free online",
                            "**Deep Learning for Time Series Forecasting** (Brownlee): Practical guide",
                            "**Attention is All You Need** (Vaswani et al.): Original transformer paper",
                            "**Pattern Recognition and Machine Learning** (Bishop): ML foundations",
                            "**Probabilistic Machine Learning** (Murphy): Comprehensive ML theory",
                            "**Hands-On ML with Scikit-Learn, Keras & TensorFlow** (Géron): Practical",
                            "**Statistical Rethinking** (McElreath): Bayesian approaches"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Practical Guides",
                        description: "Step-by-step tutorials for common tasks and workflows.",
                        highlight: "GUIDES",
                        color: "violet",
                        details: [
                            "**Model Selection**: Choosing right architecture for your data",
                            "**Hyperparameter Tuning**: Systematic search strategies",
                            "**Production Deployment**: From notebook to API",
                            "**Multi-Horizon Forecasting**: Handling variable prediction lengths",
                            "**Missing Data**: Imputation strategies",
                            "**Concept Drift**: Detecting and adapting to distribution shifts",
                            "**Uncertainty Quantification**: Probabilistic forecasting",
                            "**Explainability**: Interpreting transformer attention"
                        ]
                    }
                ]
            }
        },

        {
            id: "selection-guide",
            title: "Architecture Selection Decision Tree",
            icon: "🎯",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "⚡",
                        title: "For Very Long Sequences ($L > 2000$)",
                        description: "Prioritize sub-quadratic complexity. Memory is the bottleneck, not compute. Test scalability on full-length sequences before committing.",
                        highlight: "EFFICIENCY",
                        color: "amber",
                        details: [
                            "✅ **PatchTST**: Best accuracy + efficiency trade-off, $(L/P)^2$ complexity",
                            "✅ **Informer**: Proven $O(L \\log L)$, good for $L=5000-10000$",
                            "✅ **PRformer**: Linear $O(T)$, best for extreme lengths $L>10k$",
                            "✅ **ModernTCN**: Fastest inference, $O(LK)$ with $K=51-101$",
                            "✅ **FEDformer**: Frequency domain $O(L \\log L)$ if patterns are spectral",
                            "⚠️ **Caution**: Pyraformer (less flexible), iTransformer (only if $C>50$)",
                            "❌ **Avoid**: Vanilla TF ($O(L^2)$), TFT (too complex), Non-stat (quadratic)"
                        ]
                    },
                    {
                        icon: "🔗",
                        title: "For Multivariate Forecasting ($C > 10$)",
                        description: "Cross-variable dependencies matter. Choose architectures that model correlations explicitly. Evaluate on correlation-rich datasets like Traffic/Weather.",
                        highlight: "MULTIVARIATE",
                        color: "purple",
                        details: [
                            "✅ **iTransformer**: Best for high-dim ($C>20$), natural variable attention",
                            "✅ **Crossformer**: DSW + cross-dim for $C=10-50$",
                            "✅ **TFT**: Interpretable variable selection, production-ready",
                            "✅ **Moirai-MoE**: Expert routing handles high-dim efficiently",
                            "✅ **TimesFM**: Foundation model with multi-var support",
                            "⚠️ **Maybe**: Autoformer/FEDformer (limited cross-var)",
                            "❌ **Avoid**: PatchTST (channel-independent), DLinear (too simple)"
                        ]
                    },
                    {
                        icon: "📈",
                        title: "For Non-Stationary / Trending Data",
                        description: "Distribution shifts, level changes, evolving patterns. Preprocessing and decomposition are key. Test on data with known shifts.",
                        highlight: "ROBUSTNESS",
                        color: "teal",
                        details: [
                            "✅ **Non-stationary TF**: Specifically designed for $\\Delta \\mu, \\Delta \\sigma$",
                            "✅ **Autoformer**: Progressive decomposition absorbs trends",
                            "✅ **ETSformer**: Adaptive ETS params track changes",
                            "✅ **RevIN**: Essential preprocessing for all models",
                            "✅ **LATST**: Stable training on long non-stationary sequences",
                            "✅ **Foundation models**: Pre-training on diverse data helps generalization",
                            "⚠️ **Preprocessing**: Always try RevIN, differencing, log-transforms first",
                            "❌ **Avoid**: Vanilla transformers without normalization"
                        ]
                    },
                    {
                        icon: "🎪",
                        title: "For Production / Interpretability",
                        description: "Stakeholder trust requires explainability. Feature importance, attention visualization, uncertainty quantification are must-haves.",
                        highlight: "INTERPRETABLE",
                        color: "indigo",
                        details: [
                            "✅ **TFT**: Variable Selection Network, quantile outputs, attention weights",
                            "✅ **ETSformer**: ETS parameters evolution, component plots",
                            "✅ **Autoformer**: Decomposition into trend/seasonal interpretable",
                            "✅ **TimeFlex**: Modular components explain patterns",
                            "✅ **DLinear**: Simple linear baseline, easy to understand",
                            "⚠️ **Complexity-Interpretability**: Trade-off exists, simpler often better",
                            "Tools: SHAP for time series, attention heatmaps, grad-CAM",
                            "Documentation: Model cards, documentation essential for deployment"
                        ]
                    },
                    {
                        icon: "🚀",
                        title: "For Zero-Shot / Domain Adaptation",
                        description: "Limited or no training data in target domain. Foundation models pre-trained on billions of points are game-changers.",
                        highlight: "FOUNDATION",
                        color: "cyan",
                        details: [
                            "✅ **TimesFM**: Best zero-shot accuracy, supports covariates",
                            "✅ **Chronos**: Open weights, good probabilistic forecasts",
                            "✅ **Moirai-MoE**: Sparse experts enable efficient adaptation",
                            "✅ **TimeGPT**: Commercial API, easy to use",
                            "✅ **Lag-Llama**: Open-source alternative, smaller scale",
                            "**Few-shot**: Fine-tune on 10-100 samples from target domain",
                            "**Evaluation**: Test cross-domain (finance→energy, web→retail)",
                            "**Scaling law**: Larger models (1B+) extrapolate better"
                        ]
                    },
                    {
                        icon: "🌊",
                        title: "For Multi-Frequency / Long-Term Patterns",
                        description: "Data with multiple periodicities (hourly + daily + weekly). Needs multi-scale or frequency-aware architectures.",
                        highlight: "MULTI-SCALE",
                        color: "emerald",
                        details: [
                            "✅ **MTST**: Multiple patch sizes capture different scales",
                            "✅ **PRformer**: Pyramidal conv + RNN for multi-resolution",
                            "✅ **FEDformer**: Frequency domain naturally handles harmonics",
                            "✅ **Pyraformer**: Pyramid structure for hierarchy",
                            "✅ **TimeMixer**: Multi-scale mixing with fine/coarse branches",
                            "✅ **Autoformer**: Auto-correlation discovers multiple periods",
                            "**Preprocessing**: Fourier analysis to identify dominant frequencies",
                            "**Horizons**: Test on long forecasts (336, 720 steps)"
                        ]
                    },
                    {
                        icon: "💰",
                        title: "For Limited Compute / Edge Deployment",
                        description: "Resource constraints (mobile, IoT, low-latency). Prioritize efficiency over marginal accuracy gains.",
                        highlight: "EFFICIENT",
                        color: "red",
                        details: [
                            "✅ **DLinear**: 10K params, millisecond inference",
                            "✅ **ModernTCN**: 10× fewer params than transformers",
                            "✅ **MICN**: Efficient CNN, good accuracy/speed",
                            "✅ **Quantization**: INT8 for 4× speedup",
                            "✅ **Distillation**: Compress large models to 10% size",
                            "✅ **ONNX**: Export for optimized runtimes",
                            "**Target**: <10ms inference, <50MB model size",
                            "**Trade-off**: Accept 5-10% accuracy drop for 10× speed"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Quick Decision Flowchart",
                        description: "Start here if overwhelmed by choices.",
                        highlight: "START HERE",
                        color: "violet",
                        details: [
                            "**Q1**: Have labeled data? NO → Foundation (TimesFM, Chronos) | YES → Q2",
                            "**Q2**: $L > 2000$? YES → PatchTST or PRformer | NO → Q3",
                            "**Q3**: $C > 20$? YES → iTransformer or Crossformer | NO → Q4",
                            "**Q4**: Need interpretability? YES → TFT or ETSformer | NO → Q5",
                            "**Q5**: Periodic patterns? YES → Autoformer or FEDformer | NO → Q6",
                            "**Q6**: Resource constrained? YES → DLinear or ModernTCN | NO → PatchTST",
                            "**Default**: Start with PatchTST + RevIN (SOTA 2023-2024)",
                            "**Baseline**: Always compare against DLinear first"
                        ]
                    }
                ]
            }
        }
    ],

    footer: {
        title: "Time-Series Transformers - Complete Practitioner's Guide",
        description: "Enhanced educational resource with mathematical derivations, training strategies, and 2025 SOTA. For research and production use. Not affiliated with any organization.",
        copyright: "© 2025 Educational Content | Last Updated: January 2025",
        version: "v2.0",
        links: [
            { text: "ArXiv Papers", href: "https://arxiv.org/search/?query=time+series+transformer" },
            { text: "GitHub Repos", href: "https://github.com/topics/time-series-forecasting" },
            { text: "Benchmarks", href: "https://paperswithcode.com/task/time-series-forecasting" },
            { text: "HuggingFace", href: "https://huggingface.co/models?pipeline_tag=time-series-forecasting" }
        ],
        resources: [
            { emoji: "📚", label: "Documentation", href: "#resources" },
            { emoji: "💻", label: "Code Examples", href: "#code-examples" },
            { emoji: "🎓", label: "Training Guide", href: "#training" },
            { emoji: "🔬", label: "SOTA Updates", href: "#comparison" },
            { emoji: "🚀", label: "Deployment", href: "#deployment" },
            { emoji: "🎯", label: "Selection Guide", href: "#selection-guide" }
        ],
        acknowledgments: [
            "Based on research from AAAI, NeurIPS, ICML, ICLR 2021-2025",
            "Code examples inspired by TSLib, HuggingFace, PyTorch Forecasting",
            "Benchmarks from ETT, M4, Weather, Traffic datasets",
            "Foundation models: Amazon (Chronos), Google (TimesFM), Salesforce (Moirai)"
        ]
    }
};

// Initialize the template when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const template = new EducationalTemplate(timeSeriesTransformersConfig);
    
    // Optional: Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (template && template.destroy) {
            template.destroy();
        }
    });
});