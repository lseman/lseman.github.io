// Theory column of each converter lesson. Math is LaTeX for KaTeX auto-render: \[ … \] display, \( … \) inline.
// String.raw keeps the backslashes; avoid "${" inside formulas (it would interpolate).
const R = String.raw;
const eq = (tex, note = '') => `<div class="eq">\\[${tex}\\]${note ? `<small>${note}</small>` : ''}</div>`;
const qa = list => `<h3>Verifique</h3>${list.map(([q, a]) => `<details class="q"><summary>${q}</summary><div>${a}</div></details>`).join('')}`;
const tasks = list => `<h3>Experimente</h3><ol class="tasks">${list.map(t => `<li>${t}</li>`).join('')}</ol>`;

export const THEORY = {
    pwm: () => R`<h2>Inversor monofásico: modulação PWM senoidal</h2>
        <p class="lead">Um inversor CC-CA só tem chaves: cada braço da ponte H liga a saída ao \(+V_{dc}\) ou ao \(0\). Para sintetizar uma senoide, o modulador decide <b>quanto tempo</b> cada braço fica em cima em cada período de chaveamento, de modo que a <b>média local</b> da tensão siga a referência.</p>
        <h3>Como o PWM é gerado</h3>
        <p>Compara-se uma referência senoidal \(v_r = m_a \sin\omega_1 t\) com uma portadora triangular \(v_c\) de frequência \(f_c = m_f f_1\). Quando \(v_r > v_c\), a chave superior do braço A conduz.</p>
        ${eq(R`m_a = \frac{\hat V_r}{\hat V_c}, \qquad m_f = \frac{f_c}{f_1}`, R`\(m_a\): índice de modulação (amplitude). \(m_f\): razão de frequências; inteiro e ímpar dá simetria de meia onda (sem harmônicos pares).`)}
        <p>A largura de cada pulso é proporcional à referência naquele instante. A média em um período da portadora vale \(\bar v_o = m_a V_{dc}\sin\omega_1 t\), então a fundamental é</p>
        ${eq(R`\hat V_{o1} = m_a\, V_{dc} \qquad (m_a \le 1)`)}
        <h3>Bipolar × unipolar</h3>
        <ul><li><b>Bipolar</b>: os dois braços chaveiam em oposição, \(v_o = \pm V_{dc}\). Os harmônicos aparecem em torno de \(m_f\), \(2m_f\), \(3m_f\)…</li>
        <li><b>Unipolar</b>: o braço B compara \(-v_r\) com a mesma portadora; a saída tem três níveis \(0, \pm V_{dc}\). As bandas ímpares em \(m_f\) se cancelam e o primeiro grupo vai para \(2m_f\): a frequência <b>aparente</b> na carga dobra com a mesma perda de chaveamento.</li></ul>
        <h3>Sobremodulação e onda quadrada</h3>
        <p>Para \(m_a > 1\), a referência ultrapassa a portadora, pulsos desaparecem e a relação deixa de ser linear. No limite, a saída vira onda quadrada:</p>
        ${eq(R`\hat V_{o1}^{\,\text{quadrada}} = \frac{4}{\pi}V_{dc} \approx 1{,}27\,V_{dc}, \qquad \hat V_{oh} = \frac{\hat V_{o1}}{h}\ (h \text{ ímpar})`)}
        <p>A <b>quase-quadrada</b> deixa a saída em zero por um ângulo \(\alpha\) em torno de cada cruzamento por zero, defasando os dois braços: \(\hat V_{o1} = \tfrac{4}{\pi}V_{dc}\cos\alpha\). Com \(\alpha = 30°\), o 3º harmônico some.</p>
        <h3>Distorção e carga</h3>
        ${eq(R`\mathrm{THD} = \frac{\sqrt{\sum_{h\ge2} V_h^2}}{V_1}`, R`Uma carga R-L atenua cada harmônico por \(|Z_h| = |R + jh\omega_1 L|\). Por isso a corrente é muito mais limpa que a tensão quando \(m_f\) é alto.`)}
        <p><b>Amostragem regular</b>: num modulador digital, a referência é lida uma vez por período da portadora e fica constante. Isso cria um atraso de meio período e harmônicos de baixa ordem quando \(m_f\) é pequeno.</p>
        ${tasks([
            R`Com \(m_f = 15\), bipolar, compare a fundamental medida com \(m_a V_{dc}\) para \(m_a = 0{,}5\) e \(1{,}0\).`,
            'Troque para unipolar. Para onde vai o primeiro grupo de harmônicos? O THD da corrente cai quanto?',
            R`Aumente \(m_a\) até 2: em que ponto o ganho deixa de ser linear? Compare com a curva teórica.`,
            R`Com \(m_f = 6\) (par), procure harmônicos pares no espectro. Volte para 7.`,
            R`Na quase-quadrada, ajuste \(m_a\) para \(\alpha = 30°\) (\(m_a \approx 1{,}10\)). O 3º harmônico some?`,
            R`Com \(m_f = 5\), compare amostragem natural e regular.`,
        ])}
        ${qa([
            ['Por que a corrente é quase senoidal mesmo com a tensão em pulsos?', R`A indutância da carga é um filtro passa-baixas: o harmônico \(h\) é atenuado por \(h\omega_1 L\). Os harmônicos de chaveamento, em \(m_f\) e acima, quase não passam.`],
            ['Qual a desvantagem de aumentar muito a frequência da portadora?', 'As perdas de chaveamento crescem com a frequência (energia por comutação × número de comutações), além de aumentar a EMI e o efeito do tempo morto.'],
        ])}`,

    tri: () => R`<h2>Inversor trifásico: SPWM, injeção de sequência zero e SVPWM</h2>
        <p class="lead">O inversor trifásico de dois níveis tem três braços. Cada braço liga sua fase ao \(+V_{dc}\) ou ao \(0\): são \(2^3 = 8\) estados. A carga em estrela só enxerga as <b>diferenças</b> entre os braços, e isso abre espaço para somar a mesma tensão às três referências sem alterar a tensão de linha.</p>
        <h3>SPWM e o limite linear</h3>
        <p>Com três senoides defasadas de 120° comparadas a uma portadora comum, a tensão de fase vale \(\hat V_{an1} = m_a V_{dc}/2\) e a de linha é</p>
        ${eq(R`\hat V_{ab1} = \frac{\sqrt3}{2}\, m_a\, V_{dc} \approx 0{,}866\, m_a V_{dc}`)}
        <p>O limite linear do SPWM é \(m_a = 1\): só \(86{,}6\%\) de \(V_{dc}\) chega como pico da tensão de linha.</p>
        <h3>Sequência zero</h3>
        <p>Somar \(v_0(t)\) às três referências não muda \(v_{ab} = v_{aN} - v_{bN}\). A carga não vê \(v_0\), mas o pico das referências diminui:</p>
        ${eq(R`v_x^* = m_a\sin(\theta - \varphi_x) + v_0(t)`)}
        <ul><li><b>3º harmônico (THI)</b>: \(v_0 = \tfrac{m_a}{6}\sin 3\theta\).</li>
        <li><b>SVPWM</b> (centrada): \(v_0 = -\tfrac{1}{2}(\max + \min)\). A referência modificada ganha a forma de "sela" e equivale à modulação vetorial.</li>
        <li><b>DPWM</b> (descontínua): \(v_0\) prende ao barramento a fase de maior módulo por 60°. Esse braço não chaveia, e as perdas de chaveamento caem cerca de 1/3.</li></ul>
        ${eq(R`m_a^{\max} = \frac{2}{\sqrt3} \approx 1{,}155 \quad\Rightarrow\quad \hat V_{ab1} = V_{dc}`, R`Ganho de 15,5% de tensão sem sair da região linear.`)}
        <h3>Vetores espaciais</h3>
        <p>A transformada de Clarke leva as três tensões a um vetor no plano \(\alpha\beta\). Os 6 estados ativos (100, 110, 010…) formam um hexágono de raio \(\tfrac{2}{3}V_{dc}\); os estados 000 e 111 são vetores nulos.</p>
        ${eq(R`\vec v = \tfrac{2}{3}\left(v_a + v_b\, e^{j2\pi/3} + v_c\, e^{-j2\pi/3}\right)`)}
        <p>O modulador vetorial sintetiza o vetor de referência em cada período \(T_s\) pela média dos dois vetores ativos adjacentes e dos nulos:</p>
        ${eq(R`T_1 = T_s\,\tfrac{\sqrt3}{2} m_a \sin\!\left(60° - \phi\right),\qquad T_2 = T_s\,\tfrac{\sqrt3}{2} m_a \sin\phi`)}
        ${eq(R`T_0 = T_s - T_1 - T_2`, R`\(\phi\): ângulo dentro do setor. A sequência simétrica 000 → V<sub>k</sub> → V<sub>k+1</sub> → 111 → V<sub>k+1</sub> → V<sub>k</sub> → 000 muda um braço por vez.`)}
        <p>O círculo inscrito no hexágono (raio \(V_{dc}/\sqrt3\)) é o limite linear. Fora dele, o vetor encosta nas bordas (sobremodulação), até chegar ao <b>six-step</b>, com \(\hat V_{ab1} = \tfrac{2\sqrt3}{\pi}V_{dc}\).</p>
        ${tasks([
            R`Com SPWM em \(m_a = 1{,}15\), anote a fundamental de linha e o THD. Troque para SVPWM.`,
            R`No gráfico das referências, veja a forma de \(v_0\) em cada modo. O pico da referência modificada passa de 1?`,
            'Mova o ângulo do vetor pelo hexágono: em cada setor, quais vetores ativos aparecem na sequência de chaveamento?',
            'Em DPWM, conte os trechos sem comutação no sinal de gatilho da fase a.',
            'Compare a tensão de fase van (5 níveis) com a de linha vab (3 níveis).',
        ])}
        ${qa([
            ['Se a carga não vê v₀, por que a tensão de fase van tem "degraus"?', R`\(v_{an}\) é medida em relação ao neutro da carga: \(v_{an} = v_{aN} - \tfrac{1}{3}(v_{aN}+v_{bN}+v_{cN})\). A sequência zero dos braços se cancela, mas o chaveamento produz os níveis \(0, \pm\tfrac13, \pm\tfrac23 V_{dc}\).`],
            ['Por que a SVPWM tem menos ripple de corrente que a SPWM no mesmo mf?', 'Ela centraliza os vetores nulos no período, dividindo o tempo de 000 e 111 igualmente. O erro de tensão em cada período fica menor, o que reduz o WTHD.'],
        ])}`,

    ml: () => R`<h2>Inversores multinível: ponte H em cascata</h2>
        <p class="lead">Em vez de pular de \(-V_{dc}\) a \(+V_{dc}\), um inversor multinível sobe uma "escada" de \(L\) degraus menores. O resultado é menos \(dv/dt\), menos THD e chaves de menor tensão, ao custo de mais chaves e fontes isoladas.</p>
        <h3>Ponte H em cascata (CHB)</h3>
        <p>\(n\) células, cada uma uma ponte H com sua própria fonte \(V_{cel}\), ligadas em série. Cada célula fornece \(-V_{cel}, 0\) ou \(+V_{cel}\):</p>
        ${eq(R`v_o = \sum_{k=1}^{n} v_k, \qquad L = 2n + 1 \text{ níveis}, \qquad \hat V_{o1} = m_a\, n\, V_{cel}`)}
        <p>O <b>NPC</b> (grampeado a diodo) e o <b>capacitor flutuante</b> geram a mesma escada a partir de um barramento único e usam modulações parecidas com as abaixo.</p>
        <h3>PWM com portadoras deslocadas em fase (PS-PWM)</h3>
        <p>Cada célula usa PWM unipolar com sua portadora, deslocada de \(180°/n\) da anterior. Os harmônicos de chaveamento se cancelam entre células até a banda</p>
        ${eq(R`f_{ap} = 2\, n\, f_c`, 'Todas as células comutam na mesma frequência e entregam a mesma potência: o arranjo natural para CHB.')}
        <h3>PWM com portadoras deslocadas em nível (LS-PWM)</h3>
        <p>\(L-1\) portadoras empilhadas, cada uma cobrindo uma faixa de amplitude. A saída sobe um nível quando a referência ultrapassa a portadora daquela faixa:</p>
        <ul><li><b>PD</b> (mesma fase): o menor THD de linha;</li><li><b>POD</b>: portadoras abaixo de zero invertidas;</li><li><b>APOD</b>: portadoras adjacentes alternadas.</li></ul>
        <p>Na CHB, as faixas mais externas só são usadas perto do pico: as células <b>não dividem a potência igualmente</b>, o que exige rotação de sinais.</p>
        <h3>Nível mais próximo (NLC)</h3>
        ${eq(R`n^*(t) = \mathrm{round}\!\left(n\, m_a \sin\omega_1 t\right)`, 'Escada pura na frequência fundamental: comutação mínima, ótima com muitos níveis (MMC em HVDC), ruim com poucos.')}
        ${tasks([
            'Com 5 níveis e PS-PWM, onde aparece o primeiro grupo de harmônicos? Compare com 2nmf.',
            'Troque para PD, POD e APOD e compare o THD e o espectro.',
            'Com PD, veja a barra de potência por célula. Qual célula trabalha mais? E com PS-PWM?',
            'Em NLC, aumente o número de níveis de 3 até 11 e acompanhe o THD.',
            R`Reduza \(m_a\) para 0,4 com 9 níveis: quantos níveis são usados de fato?`,
        ])}
        ${qa([
            ['Por que o multinível reduz a EMI?', R`Cada comutação muda a saída em \(V_{cel}\), não em \(nV_{cel}\). O \(dv/dt\) e as correntes de modo comum pelos acoplamentos capacitivos caem na mesma proporção.`],
            ['Qual a principal limitação da CHB?', 'Cada célula precisa de uma fonte CC isolada (transformador com vários secundários ou baterias e painéis separados). O NPC e o MMC evitam isso com capacitores, que por sua vez exigem controle de balanço de tensão.'],
        ])}`,

    ret: () => R`<h2>Retificadores CA-CC e fator de potência</h2>
        <p class="lead">O retificador converte a rede CA em CC. Diodos e tiristores só conduzem em partes do ciclo: a corrente da rede deixa de ser senoidal, e o fator de potência cai mesmo sem defasagem.</p>
        <h3>Ponte de diodos com filtro capacitivo</h3>
        <p>O capacitor carrega até perto do pico \(V_m\) e alimenta a carga no resto do ciclo. A rede só fornece corrente em <b>pulsos estreitos</b> perto do pico:</p>
        ${eq(R`\Delta V_o \approx \frac{V_o}{2 f R C}, \qquad V_o \approx V_m - \tfrac12\Delta V_o`, R`A indutância da linha \(L_s\) alarga os pulsos: é o PFC passivo mais simples.`)}
        <h3>Ponte tiristorizada (controlada)</h3>
        <p>O tiristor só entra em condução quando recebe pulso de gatilho, \(\alpha\) graus depois do ponto em que um diodo entraria. Em condução contínua (carga muito indutiva):</p>
        ${eq(R`V_d = \frac{2\sqrt2}{\pi}V\cos\alpha \approx 0{,}9\,V\cos\alpha \quad\text{(1φ)}`)}
        ${eq(R`V_d = \frac{3\sqrt2}{\pi}V_{LL}\cos\alpha \approx 1{,}35\,V_{LL}\cos\alpha \quad\text{(3φ)}`, R`Para \(\alpha > 90°\) a tensão média fica negativa: com uma fonte na carga, a ponte opera como <b>inversor</b> comutado pela rede.`)}
        <h3>Fator de potência com distorção</h3>
        ${eq(R`\mathrm{FP} = \frac{P}{S} = \underbrace{\frac{I_1}{I_{rms}}}_{\text{distorção}}\;\underbrace{\cos\varphi_1}_{\text{deslocamento}}, \qquad \frac{I_1}{I_{rms}} = \frac{1}{\sqrt{1 + \mathrm{THD}_i^2}}`)}
        <p>Só a fundamental da corrente, em fase com a tensão, transporta potência ativa. Os harmônicos aumentam \(I_{rms}\) (perdas, aquecimento de cabos e transformadores) sem entregar energia. Na ponte tiristorizada, \(\cos\varphi_1 = \cos\alpha\).</p>
        ${eq(R`S^2 = P^2 + Q_1^2 + D^2`, R`\(D\): potência de distorção, gerada pelos harmônicos.`)}
        <p>Na ponte trifásica com corrente CC lisa, a corrente de linha é retangular (120°) e só tem harmônicos \(h = 6k \pm 1\), com \(I_h = I_1/h\): 5º, 7º, 11º, 13º…</p>
        ${tasks([
            R`Ponte a diodos: aumente \(C\) de 220 para 4700 µF. O ripple cai, mas o que acontece com o pico de corrente e o FP?`,
            R`Aumente \(L_s\) (PFC passivo) e veja o FP na varredura. Quanto custa em queda de \(V_o\)?`,
            R`Tiristor monofásico com \(L\) grande: varie \(\alpha\) de 0° a 90° e compare \(V_d\) com \(0{,}9V\cos\alpha\). O FP segue \(\cos\alpha\)?`,
            R`Reduza \(L\) até a corrente se anular em parte do ciclo (condução descontínua). A fórmula ainda vale?`,
            'Na ponte trifásica, confira no espectro que só aparecem 5, 7, 11, 13… com Ih ≈ I1/h.',
        ])}
        ${qa([
            ['Por que o FP de uma fonte de PC sem PFC fica em torno de 0,6?', 'A corrente vem em pulsos curtos perto do pico da tensão: a fundamental está em fase (DPF ≈ 1), mas o THD passa de 100%, e o fator de distorção sozinho fica em torno de 0,6.'],
            ['Por que os harmônicos triplos se somam no neutro?', 'Em cargas monofásicas ligadas fase-neutro, o 3º harmônico das três fases está em fase (3 × 120° = 360°). Eles não se cancelam no neutro e se somam: o neutro pode conduzir mais corrente que as fases.'],
        ])}`,

    pfc: () => R`<h2>Correção ativa do fator de potência (PFC boost)</h2>
        <p class="lead">Para que a rede veja uma carga resistiva, a corrente de entrada deve ser uma senoide <b>em fase</b> com a tensão. O PFC ativo põe um conversor boost depois da ponte de diodos e controla a corrente do indutor para seguir \(|v_s|\).</p>
        <h3>O conversor boost</h3>
        ${eq(R`\text{ligada: } L\frac{di_L}{dt} = |v_s|`)}
        ${eq(R`\text{desligada: } L\frac{di_L}{dt} = |v_s| - V_o`, R`Exige \(V_o > V_m\): com 220 V (pico de 311 V), usa-se tipicamente 380 a 400 V.`)}
        <p>Em regime, a razão cíclica média em cada instante é</p>
        ${eq(R`d(t) = 1 - \frac{|v_s(t)|}{V_o}`, 'É o termo de alimentação direta (feedforward) da malha de corrente.')}
        <h3>Duas malhas de controle</h3>
        <ol><li><b>Malha de tensão</b> (lenta, ~10 Hz): um PI compara \(V_{ref}\) com \(v_o\) e define a amplitude \(I_{pk}\) da corrente.</li>
        <li><b>Malha de corrente</b> (rápida, ~kHz): faz \(i_L\) seguir \(i_{ref}(t) = I_{pk}\,|\sin\omega t|\).</li></ol>
        ${eq(R`P_{in} = \tfrac12 V_m I_{pk} = P_o \quad\Rightarrow\quad I_{pk} = \frac{2P_o}{V_m}`)}
        <p>A potência instantânea de entrada pulsa em \(2f\), \(p(t) = P_o(1 - \cos 2\omega t)\), e o capacitor absorve essa diferença. O ripple de 120 Hz é inevitável:</p>
        ${eq(R`\Delta V_o \approx \frac{P_o}{2\pi f\, C\, V_o}`, R`Se a malha de tensão for rápida demais, ela "corrige" esse ripple, \(I_{pk}\) passa a oscilar em 120 Hz e a corrente de entrada ganha 3º harmônico. Por isso a banda fica bem abaixo de \(2f\).`)}
        <h3>Estratégias da malha de corrente</h3>
        <ul><li><b>Corrente média</b> (frequência fixa, PWM centrado): a corrente é amostrada no meio do intervalo desligado, onde vale a média do período, e \(d = 1 - |v_s|/V_o + k_c\,(i_{ref} - i_L)\,L f_s / V_o\). Opera em condução contínua (CCM), com ripple pequeno; é a mais usada acima de ~300 W.</li>
        <li><b>Histerese</b>: liga quando \(i_L < i_{ref} - h/2\) e desliga quando \(i_L > i_{ref} + h/2\). Simples e rápida, mas a frequência varia ao longo do ciclo.</li>
        <li><b>Modo crítico (CrM)</b>: tempo ligado constante; a chave religa quando \(i_L\) zera. O pico é \(2i_{ref}\) e a média segue a senoide. Comutação suave (ZCS) e indutor pequeno, para potências baixas.</li></ul>
        <h3>Normas</h3>
        <p>A IEC 61000-3-2 limita os harmônicos de corrente de equipamentos de até 16 A por fase. A classe D (PCs, TVs, 75–600 W) é dada em mA/W: o 3º harmônico ≤ 3,4 mA/W. Sem PFC, uma fonte com filtro capacitivo não atende a esses limites.</p>
        ${tasks([
            'Compare a corrente com PFC e a fantasma cinza (sem PFC, mesma potência). Quanto melhora o FP?',
            R`No modo corrente média, desligue o feedforward. O erro de corrente perto do cruzamento por zero aumenta?`,
            'Aumente a banda da malha de tensão de 10 para 60 Hz. O ripple de Vo cai, mas o que acontece com o 3º harmônico?',
            R`Reduza \(L\) até o indutor entrar em condução descontínua perto dos cruzamentos (veja "CCM %").`,
            'Em histerese, aumente a banda: o que acontece com a frequência média de chaveamento e com o ripple?',
            'Em CrM, mova o zoom do pico (90°) para 20°: como mudam a frequência e o pico de corrente?',
        ])}
        ${qa([
            ['Por que não basta um capacitor maior para melhorar o FP?', 'Sem PFC, um capacitor maior estreita ainda mais os pulsos de carga: o THD aumenta e o FP piora. Só um controle ativo (ou um indutor grande) muda a forma da corrente.'],
            ['O que acontece com Vo se a rede cai de 220 para 127 V?', R`A malha de tensão aumenta \(I_{pk}\) para manter \(P_o\). \(V_o\) continua regulado (boost: \(V_o > V_m\) ainda vale), mas as perdas de condução crescem com a corrente.`],
        ])}`,
};
