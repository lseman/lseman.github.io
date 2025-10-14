/**
 * Time Series Preprocessing Educational Content Configuration
 * Comprehensive guide to preparing time series data for modeling
 */

const CONTENT_CONFIG = {
    meta: {
        title: "Time Series Preprocessing | Complete Guide",
        description: "Master stationarity testing, detrending, ACF/PACF analysis, filtering, and advanced decomposition techniques",
        logo: "🔧",
        brand: "TS Preprocessing"
    },

    theme: {
        cssVariables: {
            '--primary-50': '#f0f9ff',
            '--primary-100': '#e0f2fe',
            '--primary-500': '#0ea5e9',
            '--primary-600': '#0284c7',
            '--primary-700': '#0369a1'
        },
        revealThreshold: 0.12,
        revealOnce: true
    },

    hero: {
        title: "Time Series Preprocessing",
        subtitle: "Transform Raw Data into Model-Ready Features",
        watermarks: [
            "STATIONARITY",
            "DETRENDING",
            "FILTERING",
            "DECOMPOSITION"
        ],
        quickLinks: [
            { text: "Check Stationarity", href: "#stationarity", style: "primary" },
            { text: "View Methods", href: "#methods", style: "secondary" }
        ]
    },

    sections: [
        {
            id: "overview",
            title: "Why Preprocessing Matters",
            icon: "🎯",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "⚠️",
                        title: "The Problem",
                        description: "Raw time series data is messy: trends, seasonality, non-stationarity, noise, outliers, and missing values can sabotage model performance.",
                        highlight: "CHALLENGES",
                        color: "red",
                        details: [
                            "Non-stationary distributions",
                            "Mixed signal components",
                            "Noise contamination",
                            "Scale inconsistencies"
                        ]
                    },
                    {
                        icon: "🔧",
                        title: "The Solution",
                        description: "Preprocessing transforms data into a clean, stationary, properly scaled format that models can learn from effectively.",
                        highlight: "TECHNIQUES",
                        color: "cyan",
                        details: [
                            "Stationarity testing & transformation",
                            "Decomposition into components",
                            "Noise filtering",
                            "Feature engineering"
                        ]
                    },
                    {
                        icon: "📈",
                        title: "The Impact",
                        description: "Proper preprocessing can improve forecast accuracy by 30-50%, reduce training time, and make models more robust to distribution shifts.",
                        highlight: "BENEFITS",
                        color: "emerald",
                        details: [
                            "Better model convergence",
                            "Improved accuracy",
                            "More interpretable results",
                            "Robust predictions"
                        ]
                    }
                ]
            }
        },
        {
            id: "stationarity",
            title: "Stationarity Detection",
            icon: "📊",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "📉",
                        title: "Augmented Dickey–Fuller (ADF)",
                        description: "Tests for the presence of a unit root in an autoregressive model. Low p-value (< 0.05) rejects the null hypothesis, indicating stationarity.",
                        highlight: "UNIT ROOT TEST",
                        color: "blue",
                        details: [
                            "Model: $\\Delta y_t = \\alpha + \\beta t + \\gamma y_{t-1} + \\sum_{i=1}^p \\delta_i \\Delta y_{t-i} + \\varepsilon_t$",
                            "Null hypothesis: $H_0: \\gamma = 0 \\Rightarrow \\text{non-stationary}$",
                            "Alternative: $H_1: \\gamma < 0 \\Rightarrow \\text{stationary}$",
                            "If p-value < 0.05 → reject $H_0$ (series is stationary)"
                        ]
                    },
                    {
                        icon: "🔍",
                        title: "KPSS Test",
                        description: "Complements ADF by reversing hypotheses. Tests whether a time series is stationary around a deterministic trend.",
                        highlight: "TREND-STATIONARY",
                        color: "purple",
                        details: [
                            "Model: $y_t = r_t + \\beta t + \\varepsilon_t, \\quad r_t = r_{t-1} + u_t$",
                            "Null hypothesis: $H_0: \\text{Series is stationary around a trend}$",
                            "Alternative: $H_1: \\text{Series is non-stationary}$",
                            "Test statistic: $\\text{KPSS} = \\frac{1}{T^2 \\hat{\\sigma}^2} \\sum_{t=1}^{T} S_t^2, \\quad S_t = \\sum_{i=1}^{t} \\hat{\\varepsilon}_i$",
                            "If p-value > 0.05 → fail to reject $H_0$ (series is stationary)"
                        ]
                    },
                    {
                        icon: "📐",
                        title: "Phillips–Perron (PP)",
                        description: "Similar to ADF but robust to heteroskedasticity and autocorrelation using non-parametric corrections.",
                        highlight: "ROBUST",
                        color: "amber",
                        details: [
                            "Model: $\\Delta y_t = \\alpha + \\beta t + \\gamma y_{t-1} + \\varepsilon_t$",
                            "Null hypothesis: $H_0: \\gamma = 0 \\Rightarrow \\text{non-stationary}$",
                            "Alternative: $H_1: \\gamma < 0 \\Rightarrow \\text{stationary}$",
                            "Test statistic uses correction: $Z_\\rho = T(\\hat{\\rho} - 1) - \\tfrac{1}{2}T\\hat{\\sigma}^2$",
                            "If p-value < 0.05 → reject $H_0$ (stationary)"
                        ]
                    },
                    {
                        icon: "👁️",
                        title: "Visual Inspection",
                        description: "Stationary series have constant mean and variance. Plot raw data, rolling mean, and variance to visually inspect stability.",
                        highlight: "INTUITIVE",
                        color: "cyan",
                        details: [
                            "Check if $\E[y_t] = \\mu$ and $Var(y_t) = \\sigma^2$ are constant over time",
                            "Rolling mean: $\\bar{y}_t = \\frac{1}{w}\\sum_{i=t-w+1}^{t} y_i$",
                            "Rolling variance: $s_t^2 = \\frac{1}{w-1}\\sum_{i=t-w+1}^{t}(y_i - \\bar{y}_t)^2$",
                            "If both remain stable → likely stationary"
                        ]
                    }
                ]
            }
        },

        {
            id: "stationarity-tutorial",
            title: "Stationarity Testing Workflow",
            icon: "🔬",
            content: {
                type: "visual-tutorial",
                title: "Step-by-Step Stationarity Detection",
                description: "Complete workflow for testing and achieving stationarity",
                visualizationType: "array",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Visual Check",
                        badgeColor: "slate",
                        title: "Plot the Series",
                        description: "Start with visual inspection. Plot the raw series and look for obvious trends, seasonality, or changing variance.",
                        array: [
                            { value: "📈", highlight: "default", label: "Trend?" },
                            { value: "🌊", highlight: "default", label: "Season?" },
                            { value: "📊", highlight: "default", label: "Variance?" }
                        ],
                        note: "Clear upward trend → Non-stationary",
                        code: `import matplotlib.pyplot as plt

# Plot the series
plt.figure(figsize=(12, 4))
plt.plot(series)
plt.title('Raw Time Series')
plt.show()

# Rolling statistics
rolling_mean = series.rolling(window=12).mean()
rolling_std = series.rolling(window=12).std()`,
                        codeLanguage: "python"
                    },
                    {
                        stepNumber: 2,
                        badge: "ADF Test",
                        badgeColor: "blue",
                        title: "Run Augmented Dickey-Fuller",
                        description: "Apply ADF test. If p-value < 0.05, reject null hypothesis (series is stationary).",
                        array: [
                            { value: "ADF", highlight: "processing", label: "Testing..." },
                            { value: "p=0.12", highlight: "swap", label: "Failed!" },
                            { value: "Non-St", highlight: "swap", label: "Result" }
                        ],
                        note: "p-value = 0.12 > 0.05 → Non-stationary",
                        code: `from statsmodels.tsa.stattools import adfuller

result = adfuller(series)
print(f'ADF Statistic: {result[0]:.4f}')
print(f'p-value: {result[1]:.4f}')
if result[1] < 0.05:
    print('✓ Stationary')
else:
    print('✗ Non-stationary')`,
                        codeLanguage: "python"
                    },
                    {
                        stepNumber: 3,
                        badge: "KPSS Test",
                        badgeColor: "purple",
                        title: "Confirm with KPSS",
                        description: "Run KPSS test for confirmation. Here p-value < 0.05 means non-stationary (reversed hypothesis).",
                        array: [
                            { value: "KPSS", highlight: "processing", label: "Testing..." },
                            { value: "p=0.01", highlight: "swap", label: "Reject H₀" },
                            { value: "Non-St", highlight: "swap", label: "Confirmed" }
                        ],
                        note: "p-value = 0.01 < 0.05 → Non-stationary (KPSS rejects H₀)",
                        code: `from statsmodels.tsa.stattools import kpss

result = kpss(series, regression='ct')
print(f'KPSS Statistic: {result[0]:.4f}')
print(f'p-value: {result[1]:.4f}')
if result[1] > 0.05:
    print('✓ Stationary')
else:
    print('✗ Non-stationary')`,
                        codeLanguage: "python"
                    },
                    {
                        stepNumber: 4,
                        badge: "Transform",
                        badgeColor: "emerald",
                        title: "Apply Differencing",
                        description: "Make series stationary by differencing: y'(t) = y(t) - y(t-1). Removes trends.",
                        array: [
                            { value: "Diff", highlight: "active", label: "Applied" },
                            { value: "ADF✓", highlight: "sorted", label: "p<0.05" },
                            { value: "Station", highlight: "sorted", label: "Success!" }
                        ],
                        note: "After differencing: ADF p-value = 0.001 → Stationary!",
                        code: `# First-order differencing
series_diff = series.diff().dropna()

# Test again
result = adfuller(series_diff)
print(f'After differencing p-value: {result[1]:.4f}')
# p-value: 0.0001 ✓ Stationary!`,
                        codeLanguage: "python"
                    }
                ],
                insight: {
                    icon: "💡",
                    title: "Best Practices",
                    color: "blue",
                    text: "Always use both ADF and KPSS tests together. They have complementary null hypotheses, and agreement between both provides stronger evidence.",
                    points: [
                        "ADF stationary + KPSS stationary = Definitely stationary",
                        "ADF non-stationary + KPSS non-stationary = Definitely non-stationary",
                        "Contradictory results = Trend-stationary (try detrending)",
                        "Most forecasting models require stationarity"
                    ]
                }
            }
        },
        {
            id: "detrending",
            title: "Detrending Methods",
            icon: "📐",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "➖",
                        title: "Differencing",
                        description: "Subtract previous value: $y'(t) = y(t) - y(t-d)$. First-order ($d=1$) removes linear trends. Seasonal differencing ($d=\\text{season}$) removes seasonality.",
                        highlight: "SIMPLE & EFFECTIVE",
                        color: "cyan",
                        details: [
                            "First-order: $\\Delta y(t) = y(t) - y(t-1)$",
                            "Seasonal: $\\Delta_s y(t) = y(t) - y(t-s)$",
                            "Can be applied multiple times",
                            "Reversible transformation"
                        ]
                    },
                    {
                        icon: "📏",
                        title: "Linear Detrending",
                        description: "Fit linear regression to time, subtract: $\\text{residual} = y - (\\beta_0 + \\beta_1 t)$. Works for series with clear linear trends.",
                        highlight: "PARAMETRIC",
                        color: "blue",
                        details: [
                            "Fit: $y = \\beta_0 + \\beta_1 t + \\varepsilon$",
                            "Detrended: $y' = y - \\hat{y}$",
                            "Assumes linear trend",
                            "Good for visualization"
                        ]
                    },
                    {
                        icon: "〰️",
                        title: "Polynomial Detrending",
                        description: "Fit polynomial of degree $n$, subtract. Captures non-linear trends but risk of overfitting with high degrees.",
                        highlight: "NON-LINEAR",
                        color: "purple",
                        details: [
                            "Fit: $y = \\beta_0 + \\beta_1 t + \\beta_2 t^2 + \\dots$",
                            "Flexible for curves",
                            "Use degree 2–3 typically",
                            "Higher degrees → overfitting"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "HP Filter (Hodrick–Prescott)",
                        description: "Decompose into trend and cycle by minimizing: $\\sum_t (y_t - \\tau_t)^2 + \\lambda \\sum_t [(\\tau_{t+1}-\\tau_t) - (\\tau_t - \\tau_{t-1})]^2$. $\\lambda$ controls smoothness.",
                        highlight: "SMOOTH TRENDS",
                        color: "amber",
                        details: [
                            "Balances fit vs smoothness",
                            "$\\lambda = 1600$ for quarterly data",
                            "$\\lambda = 14400$ for monthly data",
                            "Popular in economics"
                        ]
                    },
                    {
                        icon: "📉",
                        title: "Moving Average Detrending",
                        description: "Subtract moving average from series. MA captures trend, residual is detrended. Window size determines smoothness.",
                        highlight: "INTUITIVE",
                        color: "teal",
                        details: [
                            "Trend $= \\text{MA}(y, \\text{window})$",
                            "Detrended $= y - \\text{MA}(y)$",
                            "Larger window → smoother",
                            "Simple and interpretable"
                        ]
                    },
                    {
                        icon: "🔀",
                        title: "STL Decomposition",
                        description: "Seasonal-Trend decomposition using LOESS. Separates series into trend, seasonal, and residual. Very flexible and robust.",
                        highlight: "GOLD STANDARD",
                        color: "emerald",
                        details: [
                            "$y = \\text{Trend} + \\text{Seasonal} + \\text{Residual}$",
                            "Handles any seasonality",
                            "Robust to outliers",
                            "Use residual for modeling"
                        ]
                    }
                ]
            }
        },


        {
            id: "detrending-tutorial",
            title: "Detrending Visual Guide",
            icon: "📐",
            content: {
                type: "visual-tutorial",
                title: "Series Decomposition Process",
                description: "How STL decomposition separates components",
                visualizationType: "array",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Original",
                        badgeColor: "slate",
                        title: "Raw Time Series",
                        description: "Original series with trend, seasonality, and noise mixed together.",
                        array: [
                            { value: "100", highlight: "default" },
                            { value: "105", highlight: "default" },
                            { value: "98", highlight: "default" },
                            { value: "110", highlight: "default" },
                            { value: "115", highlight: "default" },
                            { value: "108", highlight: "default" }
                        ],
                        note: "Mixed signal: Trend ↗ + Seasonal 🌊 + Noise ⚡"
                    },
                    {
                        stepNumber: 2,
                        badge: "Trend",
                        badgeColor: "blue",
                        title: "Extract Trend Component",
                        description: "Smooth, long-term progression. Captures overall direction over time.",
                        array: [
                            { value: "100", highlight: "compare", label: "T" },
                            { value: "102", highlight: "compare", label: "T" },
                            { value: "104", highlight: "compare", label: "T" },
                            { value: "106", highlight: "compare", label: "T" },
                            { value: "108", highlight: "compare", label: "T" },
                            { value: "110", highlight: "compare", label: "T" }
                        ],
                        note: "Steady upward trend: +2 per period"
                    },
                    {
                        stepNumber: 3,
                        badge: "Seasonal",
                        badgeColor: "purple",
                        title: "Extract Seasonal Component",
                        description: "Repeating patterns at fixed intervals. Period = 3 in this example.",
                        array: [
                            { value: "+5", highlight: "selected", label: "S" },
                            { value: "+3", highlight: "selected", label: "S" },
                            { value: "-8", highlight: "selected", label: "S" },
                            { value: "+5", highlight: "selected", label: "S" },
                            { value: "+3", highlight: "selected", label: "S" },
                            { value: "-8", highlight: "selected", label: "S" }
                        ],
                        note: "Repeating pattern: [+5, +3, -8, +5, +3, -8, ...]"
                    },
                    {
                        stepNumber: 4,
                        badge: "Residual",
                        badgeColor: "emerald",
                        title: "Residual (Noise)",
                        description: "What remains after removing trend and seasonality. This is what we model!",
                        array: [
                            { value: "-5", highlight: "sorted", label: "ε" },
                            { value: "0", highlight: "sorted", label: "ε" },
                            { value: "+2", highlight: "sorted", label: "ε" },
                            { value: "-1", highlight: "sorted", label: "ε" },
                            { value: "+4", highlight: "sorted", label: "ε" },
                            { value: "+6", highlight: "sorted", label: "ε" }
                        ],
                        note: "Stationary, zero-mean noise: ready for modeling!"
                    }
                ],
                insight: {
                    icon: "🎯",
                    title: "Why Decompose?",
                    color: "teal",
                    text: "Decomposition reveals the underlying structure. Models trained on residuals are more accurate because they don't waste capacity learning obvious trends or seasonality.",
                    points: [
                        "Trend can be modeled separately (regression)",
                        "Seasonality is deterministic (lookup table)",
                        "Residual contains the interesting patterns",
                        "Reassemble: y = Trend + Seasonal + Predicted_Residual"
                    ]
                }
            }
        },
        {
            id: "acf-pacf",
            title: "ACF & PACF for Lag Selection",
            icon: "📊",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔗",
                        title: "Autocorrelation Function (ACF)",
                        description: "Measures how strongly the series $y_t$ correlates with its lagged versions $y_{t-k}$. The ACF at lag $k$ is defined as $\\rho_k = \\text{Corr}(y_t, y_{t-k})$, capturing both direct and indirect relationships. A slowly decaying ACF indicates persistent memory or non-stationarity. Confidence bounds (typically $\\pm 1.96/\\sqrt{n}$) help identify significant lags. ACF is especially useful for diagnosing moving-average $(\\text{MA}(q))$ structures.",
                        highlight: "TOTAL CORRELATION",
                        color: "cyan",
                        details: [
                            "Formula: $\\rho_k = \\dfrac{E[(y_t - \\mu)(y_{t-k} - \\mu)]}{\\sigma^2}$",
                            "Range: $[-1, 1]$ (perfect negative → perfect positive)",
                            "Significant if $|\\rho_k| > 1.96/\\sqrt{n}$ (approx. 95% CI)",
                            "MA($q$): ACF cuts off after lag $q$, PACF tails off"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Partial Autocorrelation (PACF)",
                        description: "Measures the <b>direct</b> correlation between $y_t$ and $y_{t-k}$ after removing the influence of intermediate lags $y_{t-1}, \\ldots, y_{t-(k-1)}$. It shows how much of the correlation remains once earlier dependencies are accounted for. The PACF at lag $k$ equals the coefficient $\\phi_{kk}$ in the regression $y_t = \\phi_{k1}y_{t-1} + \\dots + \\phi_{kk}y_{t-k} + \\varepsilon_t$. A sharp PACF cutoff indicates the appropriate AR order.",
                        highlight: "DIRECT CORRELATION",
                        color: "purple",
                        details: [
                            "Removes indirect effects of shorter lags",
                            "Computed via Yule–Walker or OLS regression",
                            "PACF($p$) cutoff → AR($p$) process",
                            "AR($p$): PACF cuts off after $p$, ACF tails off"
                        ]
                    },
                    {
                        icon: "🔢",
                        title: "Determining Optimal Lags",
                        description: "Lag selection balances model complexity and predictive power. For classical ARIMA models, ACF and PACF patterns indicate $(p, d, q)$ orders. For neural networks (LSTM, Transformer), lags can be chosen using significant ACF correlations or based on seasonality detected in ACF/PACF plots. Information criteria like AIC/BIC or cross-validation can refine lag choices further.",
                        highlight: "MODEL INPUTS",
                        color: "amber",
                        details: [
                            "ARIMA: infer $(p, d, q)$ from ACF/PACF patterns",
                            "Neural models: include lags up to first ACF cutoff",
                            "Seasonal ACF spikes → seasonal lag inclusion",
                            "Validate via AIC, BIC, or time-series CV"
                        ]
                    },
                    {
                        icon: "📐",
                        title: "Interpretation Patterns",
                        description: "Characteristic ACF/PACF shapes reveal underlying dynamics. ACF decaying slowly indicates non-stationarity (trend or unit root). An ACF that cuts off after $q$ lags and a PACF that decays gradually implies an MA($q$) process. Conversely, PACF cutting off after $p$ lags with a decaying ACF suggests an AR($p$). If both decay smoothly, the process is mixed ARMA or requires differencing.",
                        highlight: "PATTERN RECOGNITION",
                        color: "teal",
                        details: [
                            "ACF slow decay → apply differencing to stationarize",
                            "ACF cutoff → MA process",
                            "PACF cutoff → AR process",
                            "Both decay → ARMA or ARIMA structure"
                        ]
                    }
                ]
            }
        },


        {
            id: "filtering",
            title: "Filtering & Smoothing",
            icon: "🌊",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "📊",
                        title: "Moving Average",
                        description: "Simple mean over a fixed window. Reduces random noise but introduces delay. Larger window = smoother output but more lag.",
                        highlight: "BASIC",
                        color: "blue",
                        details: [
                            "Trailing MA: $\\displaystyle \\hat y_t = \\frac{1}{k}\\sum_{i=0}^{k-1} y_{t-i}$",
                            "Centered MA: $\\displaystyle \\hat y_t = \\frac{1}{k}\\sum_{i=-(k-1)/2}^{(k-1)/2} y_{t+i}$ (odd $k$)",
                            "Introduces lag ≈ $(k-1)/2$ samples",
                            "Linear filter with equal weights"
                        ]
                    },
                    {
                        icon: "📉",
                        title: "Exponential Smoothing",
                        description: "Weighted average with exponentially decreasing weights. Responds faster to recent changes than MA.",
                        highlight: "WEIGHTED",
                        color: "cyan",
                        details: [
                            "Recursive form: $\\hat y_t = \\alpha y_t + (1-\\alpha)\\hat y_{t-1}$, $0<\\alpha\\le1$",
                            "Closed form: $\\displaystyle \\hat y_t = \\sum_{i=0}^{\\infty} \\alpha(1-\\alpha)^i y_{t-i}$",
                            "Effective window ≈ $\\tfrac{2}{\\alpha}-1$ samples",
                            "Foundation of ETS (Error-Trend-Seasonal) models"
                        ]
                    },
                    {
                        icon: "〰️",
                        title: "Savitzky–Golay Filter",
                        description: "Fits a local polynomial to data within a moving window, preserving shape and peaks better than MA.",
                        highlight: "SHAPE-PRESERVING",
                        color: "purple",
                        details: [
                            "Local least-squares fit: $\\displaystyle \\min_{a_0,\\dots,a_m}\\sum_{i=-r}^{r} (y_{t+i}-\\sum_{j=0}^{m}a_j i^j)^2$",
                            "Output at window center: $\\hat y_t = \\mathbf{c}^\\top \\mathbf{y}_{t-r:t+r}$, with $\\mathbf{c}=(X^\\top X)^{-1}X^\\top\\mathbf{e}_1$",
                            "Preserves peaks and curvature",
                            "Can estimate derivatives $\\hat y'_t, \\hat y''_t$"
                        ]
                    },
                    {
                        icon: "🔊",
                        title: "Butterworth Filter",
                        description: "Low-pass filter with maximally flat frequency response. Removes high-frequency noise smoothly.",
                        highlight: "FREQUENCY DOMAIN",
                        color: "amber",
                        details: [
                            "Analog magnitude: $|H(j\\omega)|^2 = \\frac{1}{1+(\\tfrac{\\omega}{\\omega_c})^{2n}}$",
                            "Order $n$ controls transition steepness",
                            "Discrete version via bilinear transform: $s=\\tfrac{2}{T}\\tfrac{1-z^{-1}}{1+z^{-1}}$",
                            "Difference eq.: $y_t=\\sum_{i=1}^{n}a_i y_{t-i}+\\sum_{i=0}^{n}b_i x_{t-i}$"
                        ]
                    },
                    {
                        icon: "📡",
                        title: "Kalman Filter",
                        description: "Optimal recursive estimator combining predictions and noisy measurements using uncertainty modeling.",
                        highlight: "OPTIMAL",
                        color: "teal",
                        details: [
                            "State-space model: $x_t=Ax_{t-1}+Bu_t+w_t$, $y_t=Cx_t+v_t$",
                            "Noises: $w_t\\sim\\mathcal N(0,Q)$, $v_t\\sim\\mathcal N(0,R)$",
                            "Prediction: $\\hat x_{t|t-1}=A\\hat x_{t-1|t-1}+Bu_t$",
                            "Update: $K_t=P_{t|t-1}C^T(CP_{t|t-1}C^T+R)^{-1}$"
                        ]
                    },
                    {
                        icon: "🎚️",
                        title: "Median Filter",
                        description: "Non-linear filter replacing each point with the median of its neighbors. Robust to spikes and outliers.",
                        highlight: "OUTLIER-ROBUST",
                        color: "emerald",
                        details: [
                            "Operation: $\\hat y_t = \\\text{median}(y_{t-r},\\dots,y_{t+r})$",
                            "Rejects impulsive noise (spikes)",
                            "Preserves edges and step transitions",
                            "Excellent for image and signal preprocessing"
                        ]
                    }
                ]
            }
        }
        ,
        {
            id: "outliers",
            title: "Outlier Detection & Treatment",
            icon: "🧹",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "📦",
                        title: "IQR Rule (Global)",
                        description: "Detect extreme values using quartiles. Simple baseline; ignores seasonality and local context.",
                        highlight: "FAST BASELINE",
                        color: "blue",
                        details: [
                            "Quartiles: $Q_1, Q_3$, $\\text{IQR}=Q_3-Q_1$",
                            "Bounds: $[\,Q_1-1.5\,\\text{IQR},\; Q_3+1.5\,\\text{IQR}\,]$",
                            "Flag: $x_t$ outside bounds $\Rightarrow$ outlier",
                            "Treatment: interpolate, winsorize, or mask"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Z-Score & Robust Z",
                        description: "Standardize values; prefer robust version with median and MAD for heavy tails.",
                        highlight: "ROBUST",
                        color: "purple",
                        details: [
                            "Z-score: $z_t=\dfrac{x_t-\mu}{\sigma}$ (flag if $|z_t|>k$)",
                            "Robust Z: $z_t^{\text{rob}}=0.6745\dfrac{x_t-\tilde{x}}{\\text{MAD}}$",
                            "$\tilde{x}$ median, $\\text{MAD}=\\text{median}(|x_t-\tilde{x}|)$",
                            "Typical thresholds: $k\in[3, 3.5]$"
                        ]
                    },
                    {
                        icon: "🪟",
                        title: "Hampel Filter (Local)",
                        description: "Sliding-window median/MAD detector; preserves edges and adapts to local level.",
                        highlight: "SLIDING WINDOW",
                        color: "teal",
                        details: [
                            "Window $W_t=\{x_{t-r},\\dots,x_{t+r}\}$",
                            "Median $m_t=\\text{median}(W_t)$, $\text{MAD}*t$ on $W_t$",
                            "Flag if $\\displaystyle \\frac{|x_t-m_t|}{1.4826\,\text{MAD}*t}>k$",
                            "Replace $x_t\\leftarrow m_t$ or local interpolation"
                        ]
                    },
                    {
                        icon: "📐",
                        title: "Trend–Seasonality Aware",
                        description: "Remove trend/seasonality and detect outliers on residuals to avoid false positives.",
                        highlight: "STL RESIDUALS",
                        color: "amber",
                        details: [
                            "Decompose: $x_t=T_t+S_t+R_t$ (e.g., STL)",
                            "Detect on $R_t$: $z_t=\\dfrac{R_t-\\mu_R}{\\sigma_R}$ or robust Z",
                            "Seasonal robust bounds per phase $\\phi$: quantiles of $R*{t: \\text{phase}(t)=\phi}$",
                            "Recompose after treatment"
                        ]
                    },
                    {
                        icon: "🔀",
                        title: "Generalized ESD (Anomaly Count Unknown)",
                        description: "Iteratively remove most extreme points and test with Grubbs-like statistic.",
                        highlight: "MULTIPLE OUTLIERS",
                        color: "cyan",
                        details: [
                            "For $i=1..k*{\\max}$: $R_i=\\max_t \\dfrac{|x_t-\\bar{x}|}{s}$",
                            "Compare $R_i$ to critical $\\lambda_i(\\alpha,n)$",
                            "Stop at first non-rejection; flagged set $=\{1..i^*\}$",
                            "Use on residuals $R_t$ for seasonality"
                        ]
                    },
                    {
                        icon: "🧭",
                        title: "Level Shifts vs Spikes",
                        description: "Differentiate transient spikes from regime changes using change-point tests.",
                        highlight: "CHANGE-POINT",
                        color: "emerald",
                        details: [
                            "CUSUM: $S_t=\\sum_{i=1}^t (x_i-\\bar{x})$; large excursions $\Rightarrow$ shift",
                            "Penalized cost (e.g., PELT) on mean/variance changes",
                            "Treat shifts with segmentation, not point fixes",
                            "Model downstream as separate regimes"
                        ]
                    },
                    {
                        icon: "🧪",
                        title: "Treatment Options",
                        description: "Choose minimally invasive fixes; keep an outlier mask for modeling.",
                        highlight: "BEST PRACTICES",
                        color: "slate",
                        details: [
                            "Interpolate (linear/spline) isolated spikes",
                            "Winsorize to nearest bound for rare extremes",
                            "Local median replacement (Hampel) within window",
                            "Never leak future: fit stats on train only"
                        ]
                    },
                    {
                        icon: "🧯",
                        title: "When NOT to Remove",
                        description: "Outliers may be signal (events, promotions, failures). Prefer labeling over deletion.",
                        highlight: "CAUTION",
                        color: "red",
                        details: [
                            "Keep an $\\texttt{is\_outlier}_t$ feature",
                            "Stress-test forecasts with/without treatment",
                            "Domain review for causality",
                            "Document reversible transforms"
                        ]
                    },
                    {
                        icon: "🔎",
                        title: "Quick Recipe",
                        description: "Practical default pipeline for most business series.",
                        highlight: "DEFAULT",
                        color: "indigo",
                        details: [
                            "STL $\\Rightarrow$ residuals $R_t$",
                            "Robust Z on $R_t$ with $k=3.5$",
                            "Hampel for remaining local spikes",
                            "Recompose and store outlier mask"
                        ]
                    }
                ]
            }
        },
        {
  id: "change-points",
  title: "Change Points & Regime Shifts",
  icon: "🧭",
  content: {
    type: "cards",
    layout: "grid-3",
    items: [
      {
        icon: "📈",
        title: "Detection",
        description: "Identify level/variance/seasonality breaks.",
        highlight: "SEGMENTATION",
        color: "blue",
        details: [
          "CUSUM/BOCPD/PELT",
          "Energy/cost-based methods",
          "Seasonality shift detection"
        ]
      },
      {
        icon: "🗂️",
        title: "Treatment",
        description: "Segment and model per-regime or include regime features.",
        highlight: "HANDLING",
        color: "amber",
        details: [
          "Piecewise models per segment",
          "Regime indicators as inputs",
          "Warm-start after detected shift"
        ]
      },
      {
        icon: "🔁",
        title: "Drift Monitoring",
        description: "Track distribution drift between train and live.",
        highlight: "MONITOR",
        color: "slate",
        details: [
          "PSI/KS tests on features/residuals",
          "Adaptive retraining triggers",
          "Shadow models for canarying"
        ]
      }
    ]
  }
},
        {
            id: "emd",
            title: "Empirical Mode Decomposition (EMD)",
            icon: "🌊",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "🔬",
                        title: "How EMD Works",
                        description: "Decomposes signal into Intrinsic Mode Functions (IMFs) via sifting. Each IMF represents a different frequency component, from high to low.",
                        highlight: "ADAPTIVE",
                        color: "cyan",
                        details: [
                            "1. Find local maxima/minima",
                            "2. Create upper/lower envelopes",
                            "3. Compute mean envelope",
                            "4. Subtract to get IMF",
                            "5. Repeat on residual"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Intrinsic Mode Functions",
                        description: "IMFs are oscillatory modes with: (1) number of extrema and zero-crossings differ by at most 1, (2) mean of envelopes is zero.",
                        highlight: "IMF PROPERTIES",
                        color: "purple",
                        details: [
                            "Mono-component signals",
                            "Well-defined instantaneous frequency",
                            "IMF1 = highest frequency",
                            "IMFn + residual = original"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "EEMD (Ensemble EMD)",
                        description: "Adds white noise, performs EMD, averages results. Solves mode mixing problem where different frequencies appear in same IMF.",
                        highlight: "IMPROVED",
                        color: "amber",
                        details: [
                            "Adds noise ensemble",
                            "Averages IMFs across trials",
                            "Reduces mode mixing",
                            "More stable decomposition"
                        ]
                    },
                    {
                        icon: "🚀",
                        title: "Use Cases",
                        description: "Ideal for non-linear, non-stationary signals. Popular in: biomedical (EEG, ECG), climate science, financial data, structural health monitoring.",
                        highlight: "APPLICATIONS",
                        color: "teal",
                        details: [
                            "No predefined basis functions",
                            "Data-driven decomposition",
                            "Handles non-stationarity",
                            "Better than wavelets for irregular data"
                        ]
                    }
                ]
            }
        },

        {
            id: "emd-tutorial",
            title: "EMD Decomposition Process",
            icon: "🔬",
            content: {
                type: "visual-tutorial",
                title: "How Sifting Extracts IMFs",
                description: "Step-by-step EMD sifting process to extract intrinsic mode functions",
                visualizationType: "array",
                steps: [
                    {
                        stepNumber: 1,
                        badge: "Input",
                        badgeColor: "slate",
                        title: "Original Signal",
                        description: "Complex non-stationary signal with multiple frequency components mixed together.",
                        array: [
                            { value: "y(t)", highlight: "default", label: "Mixed" }
                        ],
                        note: "Goal: Separate into frequency components"
                    },
                    {
                        stepNumber: 2,
                        badge: "Extrema",
                        badgeColor: "cyan",
                        title: "Identify Local Extrema",
                        description: "Find all local maxima and minima in the signal.",
                        array: [
                            { value: "↑Max", highlight: "active", label: "Peak" },
                            { value: "↓Min", highlight: "compare", label: "Valley" },
                            { value: "↑Max", highlight: "active", label: "Peak" }
                        ],
                        note: "Extrema define envelope boundaries"
                    },
                    {
                        stepNumber: 3,
                        badge: "Envelopes",
                        badgeColor: "purple",
                        title: "Interpolate Envelopes",
                        description: "Create upper envelope (through maxima) and lower envelope (through minima) using cubic splines.",
                        array: [
                            { value: "Eᵤ(t)", highlight: "selected", label: "Upper" },
                            { value: "Eₗ(t)", highlight: "compare-right", label: "Lower" }
                        ],
                        note: "Smooth curves connecting extrema"
                    },
                    {
                        stepNumber: 4,
                        badge: "Mean",
                        badgeColor: "amber",
                        title: "Compute Mean Envelope",
                        description: "Average of upper and lower envelopes: m(t) = [Eᵤ(t) + Eₗ(t)] / 2",
                        array: [
                            { value: "m(t)", highlight: "processing", label: "Mean" }
                        ],
                        note: "m(t) = (Eᵤ + Eₗ) / 2"
                    },
                    {
                        stepNumber: 5,
                        badge: "Sift",
                        badgeColor: "blue",
                        title: "Subtract Mean",
                        description: "h(t) = y(t) - m(t). If h(t) satisfies IMF criteria, it's IMF1. Otherwise, repeat sifting on h(t).",
                        array: [
                            { value: "h(t)", highlight: "active", label: "Proto-IMF" }
                        ],
                        note: "Iterate until IMF conditions met"
                    },
                    {
                        stepNumber: 6,
                        badge: "IMF1",
                        badgeColor: "emerald",
                        title: "Extract First IMF",
                        description: "IMF1 contains highest frequency oscillations. Subtract from original: r(t) = y(t) - IMF1(t).",
                        array: [
                            { value: "IMF₁", highlight: "sorted", label: "High freq" }
                        ],
                        note: "Highest frequency component isolated"
                    },
                    {
                        stepNumber: 7,
                        badge: "Iterate",
                        badgeColor: "teal",
                        title: "Repeat on Residual",
                        description: "Apply sifting to r(t) to extract IMF2, IMF3, ... until residual is monotonic trend.",
                        array: [
                            { value: "IMF₂", highlight: "sorted-left", label: "Medium" },
                            { value: "IMF₃", highlight: "sorted-left", label: "Low" },
                            { value: "Trend", highlight: "sorted-right", label: "Residual" }
                        ],
                        note: "Complete decomposition: y = Σ IMFᵢ + trend"
                    }
                ],
                insight: {
                    icon: "🌊",
                    title: "EMD Advantages",
                    color: "cyan",
                    text: "Unlike Fourier or wavelet transforms that use predefined basis functions, EMD is fully data-driven and adaptive. Each IMF is derived directly from the signal's own oscillatory patterns.",
                    points: [
                        "No predetermined basis (unlike wavelets)",
                        "Handles non-linear and non-stationary data",
                        "Intuitive frequency separation",
                        "Each IMF is physically meaningful"
                    ]
                }
            }
        },

        {
            id: "normalization",
            title: "Scaling & Normalization",
            icon: "⚖️",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "📏",
                        title: "Min-Max Scaling",
                        description: "Rescale to [0, 1]: x' = (x - min) / (max - min). Preserves relationships but sensitive to outliers.",
                        highlight: "[0, 1]",
                        color: "blue",
                        details: [
                            "Output range: [0, 1]",
                            "x' = (x - xₘᵢₙ) / (xₘₐₓ - xₘᵢₙ)",
                            "Preserves shape",
                            "Outlier-sensitive"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Z-Score (Standardization)",
                        description: "Center around 0 with unit variance: z = (x - μ) / σ. Robust to outliers, assumes normal distribution.",
                        highlight: "μ=0, σ=1",
                        color: "purple",
                        details: [
                            "z = (x - μ) / σ",
                            "Mean = 0, Std = 1",
                            "For normal distributions",
                            "Compare across scales"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "Robust Scaling",
                        description: "Use median and IQR: x' = (x - median) / IQR. Handles outliers better than z-score.",
                        highlight: "OUTLIER-ROBUST",
                        color: "teal",
                        details: [
                            "x' = (x - Q₂) / (Q₃ - Q₁)",
                            "Uses median & IQR",
                            "Outlier resistant",
                            "Good for skewed data"
                        ]
                    },
                    {
                        icon: "📐",
                        title: "Log Transform",
                        description: "Apply log: y = log(x). Stabilizes variance for exponentially growing series. Handle zeros by adding constant.",
                        highlight: "VARIANCE STABILIZATION",
                        color: "amber",
                        details: [
                            "y = log(x + c)",
                            "Reduces right skew",
                            "Stabilizes variance",
                            "Makes multiplicative → additive"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Power Transform",
                        description: "Box-Cox (λ) or Yeo-Johnson: makes data more Gaussian. Automatically finds optimal transformation power.",
                        highlight: "AUTO-TUNED",
                        color: "cyan",
                        details: [
                            "Box-Cox: x^λ (positive only)",
                            "Yeo-Johnson: handles negatives",
                            "Finds optimal λ",
                            "Makes data normal"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "When to Scale",
                        description: "Always scale for: neural networks, SVM, KNN, gradient descent. Not needed for: tree-based models (RF, XGBoost).",
                        highlight: "BEST PRACTICES",
                        color: "emerald",
                        details: [
                            "Neural nets: Always scale",
                            "Trees: No scaling needed",
                            "Distance-based: Scale",
                            "Fit on train, transform test"
                        ]
                    }
                ]
            }
        },

        {
            id: "code-examples",
            title: "Implementation Code",
            icon: "💻",
            content: {
                type: "code-examples",
                items: [
                    {
                        title: "Stationarity Testing Pipeline",
                        description: "Complete function to test stationarity with ADF and KPSS",
                        language: "python",
                        code: `from statsmodels.tsa.stattools import adfuller, kpss
import numpy as np

def check_stationarity(series, name='Series'):
    """
    Comprehensive stationarity check using ADF and KPSS
    """
    print(f"\\n{'='*50}")
    print(f"Stationarity Test: {name}")
    print('='*50)
    
    # ADF Test (H0: non-stationary)
    adf_result = adfuller(series, autolag='AIC')
    print(f"\\nADF Test:")
    print(f"  Statistic: {adf_result[0]:.6f}")
    print(f"  p-value: {adf_result[1]:.6f}")
    print(f"  Critical Values:")
    for key, value in adf_result[4].items():
        print(f"    {key}: {value:.3f}")
    adf_stationary = adf_result[1] < 0.05
    print(f"  Result: {'✓ Stationary' if adf_stationary else '✗ Non-stationary'}")
    
    # KPSS Test (H0: stationary)
    kpss_result = kpss(series, regression='ct', nlags='auto')
    print(f"\\nKPSS Test:")
    print(f"  Statistic: {kpss_result[0]:.6f}")
    print(f"  p-value: {kpss_result[1]:.6f}")
    print(f"  Critical Values:")
    for key, value in kpss_result[3].items():
        print(f"    {key}: {value:.3f}")
    kpss_stationary = kpss_result[1] > 0.05
    print(f"  Result: {'✓ Stationary' if kpss_stationary else '✗ Non-stationary'}")
    
    # Combined verdict
    print(f"\\n{'='*50}")
    if adf_stationary and kpss_stationary:
        print("✓✓ DEFINITELY STATIONARY")
    elif not adf_stationary and not kpss_stationary:
        print("✗✗ DEFINITELY NON-STATIONARY - Apply differencing")
    else:
        print("⚠ TREND-STATIONARY - Consider detrending")
    print('='*50)
    
    return {
        'adf_stationary': adf_stationary,
        'kpss_stationary': kpss_stationary,
        'adf_pvalue': adf_result[1],
        'kpss_pvalue': kpss_result[1]
    }

# Example usage
import pandas as pd
np.random.seed(42)

# Non-stationary series (with trend)
t = np.arange(100)
non_stationary = 0.5 * t + np.random.randn(100) * 5
check_stationarity(non_stationary, 'Non-stationary with trend')

# Make it stationary by differencing
stationary = np.diff(non_stationary)
check_stationarity(stationary, 'After differencing')`,
                        runnable: true
                    },
                    {
                        title: "STL Decomposition",
                        description: "Seasonal-Trend decomposition using LOESS",
                        language: "python",
                        code: `from statsmodels.tsa.seasonal import STL
import numpy as np
import pandas as pd

def perform_stl_decomposition(series, period=12):
    """
    Decompose series into trend, seasonal, and residual
    
    Parameters:
    - series: array-like time series
    - period: seasonal period (12 for monthly, 4 for quarterly)
    """
    # Ensure pandas Series with datetime index
    if not isinstance(series, pd.Series):
        series = pd.Series(series)
    
    # Perform STL decomposition
    stl = STL(series, seasonal=period, trend=None)
    result = stl.fit()
    
    print("STL Decomposition Results:")
    print(f"  Original variance: {series.var():.4f}")
    print(f"  Trend variance: {result.trend.var():.4f}")
    print(f"  Seasonal variance: {result.seasonal.var():.4f}")
    print(f"  Residual variance: {result.resid.var():.4f}")
    
    # Calculate strength of components
    var_resid = result.resid.var()
    strength_trend = max(0, 1 - var_resid / (result.trend + result.resid).var())
    strength_seasonal = max(0, 1 - var_resid / (result.seasonal + result.resid).var())
    
    print(f"\\n  Trend strength: {strength_trend:.4f}")
    print(f"  Seasonal strength: {strength_seasonal:.4f}")
    
    return {
        'trend': result.trend.values,
        'seasonal': result.seasonal.values,
        'residual': result.resid.values,
        'strength_trend': strength_trend,
        'strength_seasonal': strength_seasonal
    }

# Example: Create synthetic series with trend and seasonality
np.random.seed(42)
n = 120  # 10 years of monthly data
t = np.arange(n)

# Components
trend = 0.5 * t
seasonal = 10 * np.sin(2 * np.pi * t / 12)
noise = np.random.randn(n) * 2
series = trend + seasonal + noise

# Decompose
components = perform_stl_decomposition(series, period=12)

print(f"\\nResidual is stationary and ready for modeling!")
print(f"Mean of residual: {components['residual'].mean():.6f}")
print(f"Std of residual: {components['residual'].std():.4f}")`,
                        runnable: true
                    },
                    {
                        title: "ACF & PACF Analysis",
                        description: "Determine optimal number of lags for modeling",
                        language: "python",
                        code: `from statsmodels.tsa.stattools import acf, pacf
import numpy as np

def analyze_acf_pacf(series, max_lags=40, alpha=0.05):
    """
    Calculate ACF and PACF to determine optimal lags
    
    Returns significant lags and interpretation
    """
    # Calculate ACF and PACF
    acf_values, acf_confint = acf(series, nlags=max_lags, 
                                    alpha=alpha, fft=False)
    pacf_values, pacf_confint = pacf(series, nlags=max_lags, 
                                      alpha=alpha, method='ywm')
    
    # Confidence interval (1.96 / sqrt(n) for 95%)
    n = len(series)
    confidence_bound = 1.96 / np.sqrt(n)
    
    # Find significant lags
    acf_significant = np.where(np.abs(acf_values[1:]) > confidence_bound)[0] + 1
    pacf_significant = np.where(np.abs(pacf_values[1:]) > confidence_bound)[0] + 1
    
    print("ACF/PACF Analysis:")
    print("="*50)
    print(f"Confidence bound: ±{confidence_bound:.4f}")
    
    print(f"\\nSignificant ACF lags: {acf_significant[:10]}")  # First 10
    print(f"Significant PACF lags: {pacf_significant[:10]}")
    
    # Interpretation
    print("\\nInterpretation:")
    
    # Check for non-stationarity
    if acf_values[1] > 0.95:
        print("  ⚠ ACF decays very slowly → Series is likely non-stationary")
        print("  → Recommendation: Apply differencing")
    
    # AR order suggestion
    if len(pacf_significant) > 0:
        ar_order = pacf_significant[0] if pacf_significant[0] < 10 else 10
        print(f"  Suggested AR order (p): {ar_order}")
        print(f"    (PACF cuts off after lag {ar_order})")
    
    # MA order suggestion  
    if len(acf_significant) > 0:
        ma_order = acf_significant[0] if acf_significant[0] < 10 else 10
        print(f"  Suggested MA order (q): {ma_order}")
        print(f"    (ACF cuts off after lag {ma_order})")
    
    # For neural networks
    print(f"\\n  For LSTM/Transformers:")
    print(f"    Include lags up to: {min(acf_significant[-1] if len(acf_significant) > 0 else 10, 50)}")
    
    return {
        'acf': acf_values,
        'pacf': pacf_values,
        'acf_significant': acf_significant,
        'pacf_significant': pacf_significant,
        'confidence_bound': confidence_bound
    }

# Example: AR(2) process
np.random.seed(42)
n = 500
ar2_process = np.zeros(n)
ar2_process[0] = np.random.randn()
ar2_process[1] = np.random.randn()

for t in range(2, n):
    ar2_process[t] = 0.6 * ar2_process[t-1] - 0.3 * ar2_process[t-2] + np.random.randn()

analyze_acf_pacf(ar2_process, max_lags=30)`,
                        runnable: true
                    },
                    {
                        title: "EMD Implementation",
                        description: "Empirical Mode Decomposition using PyEMD",
                        language: "python",
                        code: `# Note: Requires PyEMD library
# pip install EMD-signal

from PyEMD import EMD
import numpy as np

def perform_emd(signal, max_imf=10):
    """
    Perform Empirical Mode Decomposition
    
    Returns:
    - IMFs: Intrinsic Mode Functions (high freq → low freq)
    - residual: Monotonic trend
    """
    # Initialize EMD
    emd = EMD()
    emd.FIXE_H = 5  # Stop criterion for sifting
    
    # Decompose
    imfs = emd(signal, max_imf=max_imf)
    
    print(f"EMD Decomposition:")
    print(f"  Number of IMFs: {len(imfs)}")
    
    # Analyze each IMF
    for i, imf in enumerate(imfs):
        # Count extrema
        extrema = np.sum(np.diff(np.sign(np.diff(imf))) != 0) + 1
        mean_period = len(imf) / (extrema / 2) if extrema > 0 else np.inf
        
        print(f"\\n  IMF {i+1}:")
        print(f"    Variance: {np.var(imf):.4f}")
        print(f"    Mean period: {mean_period:.2f}")
        print(f"    Frequency: ~{1/mean_period:.4f} Hz" if mean_period != np.inf else "")
    
    # Verify perfect reconstruction
    reconstructed = np.sum(imfs, axis=0)
    reconstruction_error = np.max(np.abs(signal - reconstructed))
    print(f"\\n  Reconstruction error: {reconstruction_error:.2e}")
    
    return imfs

# Example: Create complex signal
np.random.seed(42)
t = np.linspace(0, 10, 1000)

# High frequency + medium frequency + trend + noise
signal = (np.sin(2 * np.pi * 5 * t) +          # 5 Hz
          2 * np.sin(2 * np.pi * 1 * t) +      # 1 Hz  
          0.5 * t +                             # Linear trend
          0.2 * np.random.randn(len(t)))       # Noise

print("Decomposing complex signal...")
imfs = perform_emd(signal)

print(f"\\nSignal decomposed into {len(imfs)} components")
print("IMF1 = highest frequency, IMFn = lowest frequency/trend")`,
                        runnable: false
                    },
                    {
                        title: "Complete Preprocessing Pipeline",
                        description: "Production-ready preprocessing function",
                        language: "python",
                        code: `import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.seasonal import STL
from scipy import signal

def preprocess_time_series(
    series,
    test_stationarity=True,
    remove_trend=True,
    remove_seasonality=True,
    period=12,
    apply_filter=True,
    filter_window=5,
    scale=True
):
    """
    Complete preprocessing pipeline for time series
    
    Steps:
    1. Handle missing values
    2. Remove outliers
    3. Test stationarity
    4. Decompose (trend + seasonal)
    5. Apply smoothing filter
    6. Scale/normalize
    """
    result = {}
    
    # 1. Handle missing values
    if isinstance(series, pd.Series):
        series = series.interpolate(method='linear')
    series = np.array(series)
    
    # 2. Remove outliers (IQR method)
    Q1 = np.percentile(series, 25)
    Q3 = np.percentile(series, 75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    outlier_mask = (series < lower_bound) | (series > upper_bound)
    n_outliers = np.sum(outlier_mask)
    
    if n_outliers > 0:
        # Replace outliers with interpolated values
        series_clean = series.copy()
        series_clean[outlier_mask] = np.nan
        series_clean = pd.Series(series_clean).interpolate().values
        print(f"Removed {n_outliers} outliers ({n_outliers/len(series)*100:.1f}%)")
    else:
        series_clean = series
    
    result['original'] = series
    result['cleaned'] = series_clean
    
    # 3. Decomposition
    if remove_trend or remove_seasonality:
        stl = STL(pd.Series(series_clean), seasonal=period)
        decomp = stl.fit()
        
        trend = decomp.trend.values
        seasonal = decomp.seasonal.values
        residual = decomp.resid.values
        
        result['trend'] = trend
        result['seasonal'] = seasonal
        result['residual'] = residual
        
        # Remove components as requested
        processed = series_clean.copy()
        if remove_trend:
            processed = processed - trend
        if remove_seasonality:
            processed = processed - seasonal
    else:
        processed = series_clean
    
    # 4. Apply smoothing filter
    if apply_filter and filter_window > 1:
        # Savitzky-Golay filter (preserves features)
        processed = signal.savgol_filter(
            processed, 
            window_length=filter_window,
            polyorder=2
        )
        print(f"Applied Savitzky-Golay filter (window={filter_window})")
    
    result['processed'] = processed
    
    # 5. Scale
    if scale:
        scaler = StandardScaler()
        scaled = scaler.fit_transform(processed.reshape(-1, 1)).flatten()
        result['scaled'] = scaled
        result['scaler'] = scaler
        print(f"Scaled: mean={scaled.mean():.4f}, std={scaled.std():.4f}")
    else:
        result['scaled'] = processed
    
    print("\\nPreprocessing complete!")
    print(f"  Shape: {len(series)} → {len(result['scaled'])}")
    
    return result

# Example usage
np.random.seed(42)
t = np.arange(200)
series = 0.5*t + 10*np.sin(2*np.pi*t/12) + np.random.randn(200)*3

result = preprocess_time_series(
    series,
    remove_trend=True,
    remove_seasonality=True,
    period=12,
    apply_filter=True,
    scale=True
)

print(f"\\nReady for modeling: {result['scaled'][:10]}")`,
                        runnable: true
                    }
                ]
            }
        },

        {
            id: "comparison",
            title: "Method Comparison",
            icon: "⚖️",
            content: {
                type: "analysis",
                title: "Preprocessing Methods Comparison",
                description: "When to use each preprocessing technique",
                tableData: {
                    headers: ["Method", "Best For", "Pros", "Cons", "Complexity"],
                    rows: [
                        {
                            name: "Differencing",
                            best: "Removing trends",
                            average: "Simple, reversible",
                            worst: "Loses 1 observation",
                            space: "O(1)"
                        },
                        {
                            name: "STL Decomposition",
                            best: "Seasonal data",
                            average: "Flexible, robust",
                            worst: "Requires seasonality",
                            space: "O(n)"
                        },
                        {
                            name: "EMD",
                            best: "Non-linear signals",
                            average: "Adaptive, no basis",
                            worst: "Slow, mode mixing",
                            space: "O(n²)"
                        },
                        {
                            name: "Exponential Smoothing",
                            best: "Noise reduction",
                            average: "Fast, online",
                            worst: "Parameter tuning",
                            space: "O(1)"
                        },
                        {
                            name: "Savitzky-Golay",
                            best: "Preserving features",
                            average: "Keeps peaks/valleys",
                            worst: "Edge effects",
                            space: "O(n·k)"
                        },
                        {
                            name: "Kalman Filter",
                            best: "Real-time, noisy",
                            average: "Optimal, online",
                            worst: "Requires model",
                            space: "O(n)"
                        },
                        {
                            name: "HP Filter",
                            best: "Economic trends",
                            average: "Smooth trends",
                            worst: "End-point bias",
                            space: "O(n)"
                        },
                        {
                            name: "Wavelet Transform",
                            best: "Multi-scale",
                            average: "Time-frequency",
                            worst: "Complex",
                            space: "O(n log n)"
                        }
                    ],
                    notes: [
                        "<strong>Best For</strong>: Primary use case",
                        "<strong>Pros</strong>: Main advantages",
                        "<strong>Cons</strong>: Key limitations",
                        "<strong>Complexity</strong>: Computational cost for series of length n"
                    ]
                }
            }
        },

        {
            id: "workflow",
            title: "Recommended Workflow",
            icon: "🔄",
            content: {
                type: "cards",
                layout: "grid-2",
                items: [
                    {
                        icon: "1️⃣",
                        title: "Step 1: Explore & Clean",
                        description: "Visualize data, handle missing values, remove outliers using IQR or Z-score method.",
                        highlight: "INITIAL",
                        color: "blue",
                        details: [
                            "Plot the series",
                            "Check for missing values",
                            "Identify outliers (IQR method)",
                            "Interpolate or remove bad data"
                        ]
                    },
                    {
                        icon: "2️⃣",
                        title: "Step 2: Test Stationarity",
                        description: "Run ADF and KPSS tests. Check rolling mean/variance. If non-stationary, proceed to detrending.",
                        highlight: "DIAGNOSIS",
                        color: "purple",
                        details: [
                            "Visual inspection",
                            "ADF test (p < 0.05 = stationary)",
                            "KPSS test (p > 0.05 = stationary)",
                            "Plot ACF for slow decay"
                        ]
                    },
                    {
                        icon: "3️⃣",
                        title: "Step 3: Decompose",
                        description: "Use STL or EMD to separate trend, seasonality, and noise. Model the residual component.",
                        highlight: "SEPARATION",
                        color: "cyan",
                        details: [
                            "STL for seasonal data",
                            "EMD for non-linear patterns",
                            "Extract residual component",
                            "Residual should be stationary"
                        ]
                    },
                    {
                        icon: "4️⃣",
                        title: "Step 4: Determine Lags",
                        description: "Plot ACF/PACF to identify significant lags. Use information criteria (AIC/BIC) for model selection.",
                        highlight: "LAG SELECTION",
                        color: "amber",
                        details: [
                            "Plot ACF and PACF",
                            "Identify significant lags",
                            "Consider seasonal lags",
                            "For neural nets: include all significant"
                        ]
                    },
                    {
                        icon: "5️⃣",
                        title: "Step 5: Filter Noise",
                        description: "Apply smoothing if needed. Savitzky-Golay preserves features. Exponential smoothing for online learning.",
                        highlight: "SMOOTHING",
                        color: "teal",
                        details: [
                            "Choose filter based on use case",
                            "Savitzky-Golay for feature preservation",
                            "Exp smoothing for real-time",
                            "Avoid over-smoothing"
                        ]
                    },
                    {
                        icon: "6️⃣",
                        title: "Step 6: Scale & Engineer",
                        description: "Normalize for neural networks. Create lag features, rolling statistics, time features (day, month, etc.).",
                        highlight: "FINALIZE",
                        color: "emerald",
                        details: [
                            "StandardScaler for neural nets",
                            "MinMaxScaler for bounded activation",
                            "Create lag features",
                            "Add time-based features"
                        ]
                    }
                ]
            }
        },

        {
            id: "pitfalls",
            title: "Common Pitfalls",
            icon: "⚠️",
            content: {
                type: "cards",
                layout: "grid-3",
                items: [
                    {
                        icon: "❌",
                        title: "Data Leakage",
                        description: "Never fit scalers or compute statistics on entire dataset. Fit on train, transform on test to avoid peeking into future.",
                        highlight: "CRITICAL ERROR",
                        color: "red",
                        details: [
                            "Fit transformers on train only",
                            "No future information in features",
                            "Rolling windows, not expanding",
                            "Time-based train/test split"
                        ]
                    },
                    {
                        icon: "🔄",
                        title: "Over-Differencing",
                        description: "Applying differencing too many times makes series over-stationary and hard to model. One differencing usually sufficient.",
                        highlight: "LESS IS MORE",
                        color: "amber",
                        details: [
                            "Test stationarity after each diff",
                            "Usually 1st order is enough",
                            "Seasonal diff for seasonality",
                            "Don't diff if already stationary"
                        ]
                    },
                    {
                        icon: "📊",
                        title: "Ignoring Decomposition",
                        description: "Modeling trend+seasonality+noise together wastes model capacity. Decompose first, model residual separately.",
                        highlight: "EFFICIENCY",
                        color: "purple",
                        details: [
                            "Trend is deterministic",
                            "Seasonality is periodic",
                            "Model residual is hard part",
                            "Reassemble at prediction time"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Over-Smoothing",
                        description: "Aggressive filtering removes real signal, not just noise. Validate that filtered series still contains information.",
                        highlight: "SIGNAL LOSS",
                        color: "teal",
                        details: [
                            "Compare ACF before/after",
                            "Check if forecast improves",
                            "Preserve important features",
                            "Less smoothing for high-freq data"
                        ]
                    },
                    {
                        icon: "📏",
                        title: "Wrong Scaling Method",
                        description: "MinMax sensitive to outliers. Z-score assumes normal. Use robust scaling for skewed distributions with outliers.",
                        highlight: "DISTRIBUTION MATTERS",
                        color: "blue",
                        details: [
                            "Check distribution first",
                            "Robust scaler for outliers",
                            "Log transform for exponential",
                            "Test different methods"
                        ]
                    },
                    {
                        icon: "🎯",
                        title: "Forgetting Invertibility",
                        description: "Can you reverse transformations to get predictions in original scale? Log, differencing are invertible. Complex transforms may not be.",
                        highlight: "REVERSIBILITY",
                        color: "cyan",
                        details: [
                            "Store transformation parameters",
                            "Test inverse transform",
                            "Document transform chain",
                            "Essential for interpretability"
                        ]
                    }
                ]
            }
        }
    ],

    footer: {
        title: "Time Series Preprocessing",
        description: "Comprehensive guide to data preparation for forecasting. Educational content - verify methods for your specific use case.",
        copyright: "© 2024 Educational Content",
        links: [
            { text: "statsmodels", href: "https://www.statsmodels.org" },
            { text: "scipy.signal", href: "https://docs.scipy.org/doc/scipy/reference/signal.html" },
            { text: "PyEMD", href: "https://github.com/laszukdawid/PyEMD" }
        ],
        resources: [
            { emoji: "📚", label: "Documentation", href: "#" },
            { emoji: "💻", label: "Code Examples", href: "#" },
            { emoji: "🎓", label: "Tutorials", href: "#" }
        ]
    }
};

// Initialize the template when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const template = new EducationalTemplate(CONTENT_CONFIG);

    // Optional: Clean up on page unload
    window.addEventListener('beforeunload', () => {
        template.destroy();
    });
});