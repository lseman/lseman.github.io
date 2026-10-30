// Theory column of each PHY lesson. Math is LaTeX for KaTeX auto-render: \[ … \] display, \( … \) inline.
// String.raw keeps the backslashes; avoid "${" inside formulas (it would interpolate).
const R = String.raw;
const eq = (tex, note = '') => `<div class="eq">\\[${tex}\\]${note ? `<small>${note}</small>` : ''}</div>`;
const qa = list => `<h3>Verifique</h3>${list.map(([q, a]) => `<details class="q"><summary>${q}</summary><div>${a}</div></details>`).join('')}`;
const tasks = list => `<h3>Experimente</h3><ol class="tasks">${list.map(t => `<li>${t}</li>`).join('')}</ol>`;

export const THEORY = {
    mod: () => R`<h2>Modulação digital: de bits a símbolos</h2>
        <p class="lead">O modulador agrupa \(k = \log_2 M\) bits e escolhe um dos \(M\) pontos da constelação. Cada ponto é um número complexo \(s = I + jQ\): \(I\) modula o cosseno da portadora e \(Q\), o seno.</p>
        ${eq(R`s(t) = I(t)\cos(2\pi f_c t) - Q(t)\sin(2\pi f_c t)`, R`Envoltória complexa: \(\tilde s(t) = I(t) + jQ(t)\). A constelação é o retrato de \(\tilde s\) nos instantes de decisão.`)}
        <h3>PSK × QAM</h3>
        <p><b>M-PSK</b> põe os pontos num círculo, \(s_m = e^{j2\pi m/M}\): envoltória constante, o que permite um amplificador eficiente. Mas a distância mínima \(d_{\min} = 2\sin(\pi/M)\) despenca com \(M\).</p>
        <p><b>M-QAM</b> usa uma grade \(\sqrt M \times \sqrt M\), combinando amplitude e fase: \(d_{\min} = \sqrt{6/(M-1)}\) (com \(E_s = 1\)). Para \(M \ge 16\), a QAM separa melhor os pontos. Por isso o Wi-Fi usa QAM de 16 a 4096 pontos.</p>
        <h3>Detecção e regiões de decisão</h3>
        <p>Em ruído gaussiano, o detector de máxima verossimilhança escolhe o <b>ponto mais próximo</b>:</p>
        ${eq(R`\hat s = \arg\min_{s_m} |r - s_m|^2`, 'As linhas tracejadas dividem o plano em regiões de decisão; um erro acontece quando o ruído empurra o símbolo para fora da sua região (as setas vermelhas mostram alguns casos).')}
        ${eq(R`\left.\frac{E_b}{N_0}\right|_{\mathrm{dB}} = \left.\frac{E_s}{N_0}\right|_{\mathrm{dB}} - 10\log_{10} k`)}
        ${eq(R`P_s^{\mathrm{QAM}} \approx 4\left(1 - \frac{1}{\sqrt M}\right) Q\!\left(\sqrt{\frac{3E_s}{(M-1)N_0}}\right)`, R`\(Q(x)\) é a probabilidade de uma gaussiana padrão exceder \(x\).`)}
        ${eq(R`P_s^{\mathrm{PSK}} \approx 2\,Q\!\left(\sqrt{\frac{2E_s}{N_0}}\,\sin\frac{\pi}{M}\right)`)}
        <h3>Código Gray</h3>
        <p>Com rótulos Gray, pontos vizinhos diferem em <b>um único bit</b>. Como quase todo erro de símbolo cai num vizinho, \(\mathrm{BER} \approx \mathrm{SER}/k\). Com o binário natural, um erro para o vizinho pode trocar vários bits.</p>
        <h3>Imperfeições do transmissor e do receptor</h3>
        <ul><li><b>Fase</b>: o oscilador local está defasado e a constelação gira, \(r = s\,e^{j\phi}\).</li><li><b>CFO residual</b>: há um erro de frequência e a constelação gira a cada símbolo, \(\phi_n = \phi_0 + n\,\Delta\phi\), virando anéis.</li><li><b>Desbalanço IQ</b>: os ramos I e Q têm ganhos diferentes ou não estão a 90°, e a grade se deforma.</li><li><b>PA saturado</b> (modelo de Rapp): os pontos externos são comprimidos. A QAM sofre e a PSK quase não sente, porque tem envoltória constante.</li></ul>
        ${tasks([
            R`Fixe \(E_s/N_0 = 20\) dB e compare 16-QAM com 16-PSK. Qual tem mais erros? Compare o \(d_{\min}\) no painel.`,
            'Em 16-QAM com 12 dB, troque Gray por binário natural. A SER muda? E a BER?',
            R`Mude o eixo para \(E_b/N_0 = 8\) dB e compare BPSK com QPSK. O que acontece com a BER?`,
            'Em 64-QAM a 30 dB, ponha o PA com backoff de 1 dB. Repita com 8-PSK.',
            'Sem ruído (40 dB), aumente a fase até aparecerem erros em 8-PSK e em 16-QAM. Qual é o limite teórico de cada uma?',
            'Observe a "BER por posição de bit" em 16-QAM Gray. Os 4 bits são igualmente protegidos?',
        ])}
        ${qa([
            [R`Por que QPSK tem a mesma BER × \(E_b/N_0\) que BPSK, mas o dobro da taxa?`, R`QPSK são duas BPSK independentes, em cos e sin (ortogonais). Cada bit tem a mesma energia \(E_b\) e vê o mesmo ruído da BPSK. A banda é a mesma, então a eficiência espectral dobra de graça. Em \(E_s/N_0\), porém, QPSK precisa de +3 dB, pois \(E_s = 2E_b\).`],
            ['Quanto de SNR a mais 64-QAM precisa em relação a 16-QAM para a mesma SER?', R`Aproximadamente \(10\log_{10}(63/15) \approx 6{,}2\) dB em \(E_s/N_0\). Regra prática: cada 2 bits a mais por símbolo (\(M \times 4\)) custam ≈ 6 dB. É por isso que o MCS sobe em degraus conforme a SNR cresce.`],
            ['Qual a PAPR de 16-QAM e de 64-QAM, e por que isso importa?', R`16-QAM: \(18/10 \to 2{,}55\) dB; 64-QAM: \(98/42 \to 3{,}7\) dB; PSK: 0 dB. O amplificador precisa de recuo (backoff) para não comprimir os picos, e com OFDM a PAPR fica ainda maior (aula 7).`],
            ['Sem ruído, que erro de fase 8-PSK tolera?', R`\(\pi/M = 22{,}5^\circ\): a fronteira de decisão fica a meio caminho entre fases vizinhas. Em 16-QAM o canto externo erra antes, com cerca de \(16{,}9^\circ\).`],
            ['Por que, em 16-QAM Gray, os bits "de sinal" erram menos?', R`Em cada eixo (4-PAM), o 1º bit só muda ao cruzar o zero, o que acontece apenas a partir dos dois pontos internos. O 2º bit muda nas fronteiras \(\pm 2\), que todos os pontos vizinham. A BER do 2º bit é ≈ 2× a do 1º. O entrelaçador e o FEC do Wi-Fi distribuem essa diferença.`],
        ])}`,

    pulse: () => R`<h2>Formatação de pulso, ISI e diagrama de olho</h2>
        <p class="lead">Para transmitir \(R_s\) símbolos/s numa banda limitada, cada símbolo vira um <b>pulso</b> \(p(t)\). Pulsos com banda finita duram mais que \(T_s\) e se sobrepõem aos vizinhos. A questão é como sobrepor sem confundir o receptor.</p>
        ${eq(R`y(kT_s) = a_k\,p(0) + \underbrace{\sum_{m \ne k} a_m\,p\big((k-m)T_s\big)}_{\text{ISI}} + n_k`)}
        <h3>Critério de Nyquist</h3>
        <p>Não há ISI se o pulso <b>total</b> (transmissor ∗ canal ∗ receptor) for zero em todos os instantes de amostragem, exceto \(t = 0\):</p>
        ${eq(R`p(kT_s) = \delta[k] \iff \sum_{n} P\!\left(f - \frac{n}{T_s}\right) = T_s`)}
        <p>O pulso de menor banda que satisfaz isso é o sinc, com banda \(R_s/2\), mas suas caudas decaem devagar (\(1/t\)) e um pequeno erro de tempo acumula muita ISI.</p>
        ${eq(R`p_{\mathrm{RC}}(t) = \mathrm{sinc}\!\left(\frac{t}{T_s}\right)\frac{\cos(\pi\alpha t/T_s)}{1 - (2\alpha t/T_s)^2}`, R`Cosseno levantado (RC), roll-off \(\alpha \in [0, 1]\): banda \(B = (1+\alpha)R_s/2\) em banda base, \((1+\alpha)R_s\) na portadora.`)}
        <h3>Filtro casado</h3>
        <p>Em ruído branco, o filtro de recepção que maximiza a SNR no instante de decisão é o <b>casado</b> ao pulso recebido, \(h_{rx}(t) = p_{tx}(-t)\). Ele atinge o limite</p>
        ${eq(R`\mathrm{SNR}_{\max} = \frac{2E_s}{N_0}`, 'É por isso que as curvas de BER da aula 3 valem.')}
        <p>Para ter ao mesmo tempo filtro casado e pulso total de Nyquist, divide-se o cosseno levantado em duas metades: <b>RRC no transmissor e RRC no receptor</b>.</p>
        ${eq(R`P_{\mathrm{RRC}}(f)\,P_{\mathrm{RRC}}(f) = P_{\mathrm{RC}}(f)`)}
        <p>O pulso retangular com integrador (integra-e-descarrega) também é casado e livre de ISI, mas seu espectro sinc ocupa muita banda. É exatamente o pulso de cada subportadora OFDM (aula 7), onde a ortogonalidade resolve a sobreposição em frequência.</p>
        <h3>Lendo o diagrama de olho</h3>
        <ul><li><b>Abertura vertical</b>: margem contra ruído. A ISI fecha o olho mesmo sem ruído.</li><li><b>Abertura horizontal</b>: tolerância a erro de sincronismo de símbolo (cap. 9: sincronismo).</li><li><b>Inclinação</b> das bordas: sensibilidade ao erro de tempo. \(\alpha\) pequeno dá bordas mais íngremes.</li></ul>
        ${tasks([
            R`RRC + filtro casado, \(\alpha = 0{,}35\), \(E_b/N_0 = 30\) dB: o olho está aberto? Agora desloque o instante de amostragem \(\tau\) até \(\pm 0{,}3\,T_s\).`,
            R`Repita com \(\alpha = 0{,}05\) e \(\alpha = 1\). Qual tolera mais erro de tempo? Qual ocupa menos banda?`,
            'Troque o transmissor para RC mantendo o filtro casado. Por que aparece ISI se o RC já é de Nyquist?',
            'Com RC no transmissor, use o "passa-baixa largo" e depois "nenhum". O olho fica sem ISI, mas o que acontece com a BER em 8 dB?',
            R`Adicione um eco de 0,4 em \(1\,T_s\). O olho fecha? Que bloco do receptor resolveria (cap. 8: equalização)?`,
            'Reduza o span do RRC para 2 símbolos e observe o espectro e a ISI residual.',
        ])}
        ${qa([
            [R`Qual a eficiência espectral de 16-QAM com \(\alpha = 0{,}25\)?`, R`Banda na portadora \((1+\alpha)R_s\) e 4 bits por símbolo: \(\eta = 4/1{,}25 = 3{,}2\) b/s/Hz. Com \(\alpha \to 0\) o limite seria 4 b/s/Hz.`],
            ['Por que o filtro casado é ótimo?', R`Pela desigualdade de Cauchy-Schwarz: \(\mathrm{SNR} = \dfrac{\left|\int h(\tau)\,p(-\tau)\,d\tau\right|^2}{\frac{N_0}{2}\int |h|^2}\) é máxima quando \(h \propto p(-t)\). Qualquer outro filtro deixa passar mais ruído para o mesmo sinal (veja a "perda do filtro" no painel).`],
            [R`Por que um pequeno erro de tempo é pior com \(\alpha\) pequeno?`, R`As caudas decaem com \(1/t^3\) no RC (\(1/t\) no sinc). Com \(\alpha \to 0\), as amostras deslocadas \(p(kT_s+\tau)\) dos vizinhos somam-se lentamente e podem até divergir: o olho fica estreito.`],
            ['E o Wi-Fi, usa RRC?', 'O 802.11b (DSSS/CCK) usava um pulso de portadora única. O Wi-Fi OFDM não formata cada símbolo com RRC: o pulso de cada subportadora é retangular (com janelamento suave nas bordas), e a máscara espectral é garantida pelas subportadoras de guarda (aula 7).'],
        ])}`,

    ber: () => R`<h2>Probabilidade de erro de bit × \(E_b/N_0\)</h2>
        <p class="lead">Para comparar modulações com justiça, medimos a SNR <b>por bit</b>: \(E_b/N_0\) é a energia de cada bit dividida pela densidade espectral do ruído.</p>
        ${eq(R`P_b^{\mathrm{BPSK}} = Q\!\left(\sqrt{\frac{2E_b}{N_0}}\right)`, 'BPSK e QPSK: 9,6 dB para BER = 10⁻⁵.')}
        ${eq(R`P_b^{\mathrm{QAM}} \approx \frac{4}{k}\left(1 - \frac{1}{\sqrt M}\right) Q\!\left(\sqrt{\frac{3k\,E_b}{(M-1)N_0}}\right)`, 'Rótulos Gray, \\(k = \\log_2 M\\).')}
        <h3>Monte Carlo</h3>
        <p>O botão <b>Rodar Monte Carlo</b> transmite bits aleatórios por um canal com ruído gaussiano de variância \(N_0/2\) por dimensão e conta os erros. A estimativa só é confiável com dezenas de erros: para medir BER = \(10^{-5}\) com ±20% de precisão são precisos ≈ 100 erros, ou seja, ~\(10^7\) bits.</p>
        ${eq(R`N_{\text{bits}} \approx \frac{100}{\mathrm{BER}}, \qquad \frac{\Delta \widehat{\mathrm{BER}}}{\mathrm{BER}} \approx \frac{2}{\sqrt{N_{\text{erros}}}}`)}
        <h3>Canal com desvanecimento Rayleigh</h3>
        <p>Com multipercurso e sem diversidade, a SNR instantânea varia de forma exponencial. A BER média deixa de cair como uma "cachoeira" e passa a cair só <b>uma década a cada 10 dB</b>:</p>
        ${eq(R`\bar P_b^{\mathrm{BPSK}} = \frac12\left(1 - \sqrt{\frac{\bar\gamma}{1+\bar\gamma}}\right) \approx \frac{1}{4\bar\gamma}`, 'Para 10⁻⁵ é preciso ≈ 44 dB, contra 9,6 dB em AWGN. A aula 5 mostra como a diversidade recupera essa perda.')}
        <h3>Limite de Shannon e o plano potência × banda</h3>
        <p>A capacidade \(C = B\log_2(1 + \mathrm{SNR})\) impõe, para uma eficiência \(\eta = R_b/B\), um mínimo de energia por bit. Quando \(\eta \to 0\), esse mínimo tende a −1,59 dB: nenhum sistema confiável opera abaixo disso.</p>
        ${eq(R`\frac{E_b}{N_0} \ge \frac{2^\eta - 1}{\eta} \;\xrightarrow{\;\eta \to 0\;}\; \ln 2 = -1{,}59\ \mathrm{dB}`)}
        <p>O 2º gráfico posiciona cada modulação (\(\eta = \log_2 M\), banda de Nyquist) pela \(E_b/N_0\) que ela exige. Mais bits por símbolo dão mais eficiência espectral e custam mais potência. Os MCS do Wi-Fi (com FEC) ficam mais perto da curva de Shannon.</p>
        ${tasks([
            'Rode o Monte Carlo com BPSK, 8-PSK, 16-QAM e 64-QAM. Os pontos caem sobre as curvas? Onde se afastam?',
            'Por que os pontos de BER muito baixa demoram mais e às vezes nem aparecem?',
            R`Ative 16-PSK e 16-QAM: quantos dB separam as duas em \(10^{-5}\)?`,
            'Mude para Rayleigh e rode de novo. Meça a inclinação: quantas décadas por 10 dB?',
            'Na tabela, qual modulação fica mais perto do limite de Shannon? Por que nenhuma o atinge sem codificação?',
        ])}
        ${qa([
            ['Por que BPSK e QPSK aparecem como uma única curva?', R`Em \(E_b/N_0\) elas são idênticas: QPSK é BPSK em I e BPSK em Q. A diferença está na eficiência espectral (1 contra 2 b/s/Hz).`],
            [R`Para M-PSK, quanto custa dobrar \(M\) (de 8 para 16)?`, R`Cerca de 4 a 5 dB em \(10^{-5}\), e o custo cresce com \(M\) (\(d_{\min} \propto \sin(\pi/M)\)). Na QAM, ir de 16 para 64 custa ≈ 4 dB em \(E_b/N_0\). Por isso a QAM escala melhor.`],
            [R`O que é o "gap para Shannon" e quanto ele vale para modulação sem código a \(10^{-5}\)?`, 'É a distância horizontal entre o ponto da modulação e a curva de Shannon na mesma η. Sem FEC fica entre 7 e 9 dB. Códigos modernos (LDPC, turbo) reduzem o gap para 1 a 2 dB.'],
            ['No Rayleigh, por que aumentar a potência ajuda tão pouco?', R`Os erros vêm dos instantes de desvanecimento profundo, e \(P(|h|^2 < \varepsilon) \approx \varepsilon\). Dobrar a potência só reduz pela metade a fração de tempo "ruim". A saída é diversidade (tempo, frequência, espaço) e codificação.`],
        ])}`,

    fec: () => R`<h2>Codificação de canal: o código convolucional do Wi-Fi</h2>
        <p class="lead">O FEC acrescenta redundância controlada: a cada \(k\) bits de informação são enviados \(n\) bits codificados (taxa \(R = k/n\)). O receptor usa essa estrutura para corrigir erros sem retransmitir.</p>
        <h3>O codificador (BCC, K = 7)</h3>
        <p>Todo rádio 802.11 implementa o mesmo código convolucional: um registrador de 6 memórias (<b>64 estados</b>) e dois somadores módulo 2 com geradores \(g_0 = 133_8\) e \(g_1 = 171_8\). Cada bit de entrada gera dois bits de saída (A e B): \(R = 1/2\).</p>
        ${eq(R`\begin{aligned} A_i &= u_i \oplus u_{i-2} \oplus u_{i-3} \oplus u_{i-5} \oplus u_{i-6} && (1011011)\\ B_i &= u_i \oplus u_{i-1} \oplus u_{i-2} \oplus u_{i-3} \oplus u_{i-6} && (1111001)\end{aligned}`)}
        <h3>Puncionamento</h3>
        <p>As taxas 2/3, 3/4 e 5/6 saem do mesmo codificador: alguns bits são <b>roubados</b> (não transmitidos) segundo um padrão fixo. O decodificador trata cada bit roubado como desconhecido (LLR = 0). Taxa maior significa menos redundância e menor distância livre \(d_{\text{free}}\).</p>
        <h3>Decodificação de Viterbi</h3>
        <p>O decodificador percorre a treliça de 64 estados e guarda, para cada estado, o caminho sobrevivente de melhor métrica. O resultado é a sequência de máxima verossimilhança. Com <b>decisão suave</b>, cada bit entra como LLR (quanto o receptor "confia" nele); com <b>decisão dura</b>, entra só o sinal (0/1) e usa-se a distância de Hamming. A diferença típica é de ≈ 2 dB.</p>
        ${eq(R`L(b) = \ln\frac{P(b=0\mid y)}{P(b=1\mid y)} \approx \frac{1}{N_0}\Big(\min_{s:\,b=1}|y-s|^2 - \min_{s:\,b=0}|y-s|^2\Big)`)}
        <h3>Ganho de codificação</h3>
        <p>O ganho é a economia em \(E_b/N_0\) (por bit de <b>informação</b>) para atingir a mesma BER. Assintoticamente, com decisão suave:</p>
        ${eq(R`G_\infty \approx 10\log_{10}(R\,d_{\text{free}})\ \mathrm{dB}`, R`\(E_c = R\,E_b\): cada bit codificado carrega menos energia. Com SNR baixa, o código pode piorar a BER.`)}
        <h3>LDPC: chegando perto de Shannon</h3>
        <p>O Wi-Fi 6/7 usa principalmente <b>LDPC</b> (blocos de 648, 1296 ou 1944 bits). Um código LDPC é definido por uma matriz de paridade \(H\) esparsa: cada bit participa de poucas equações (aqui 3) e cada equação envolve poucos bits. A decodificação troca mensagens (LLRs) iterativamente entre bits e equações. Esta aula usa o <b>min-sum normalizado</b>, com até 30 iterações e parada quando todas as paridades são satisfeitas.</p>
        ${eq(R`H\,\mathbf c^{\mathsf T} = \mathbf 0, \qquad R = 1 - \frac{d_v}{d_c}`, R`Código regular aleatório \((3, d_c)\), \(n = 1296\), sem ciclos de 4. Tem a mesma família e o mesmo tamanho do Wi-Fi 6, mas não usa as matrizes do padrão.`)}
        ${eq(R`r_{c\to v} = 0{,}75 \prod_{v' \ne v} \operatorname{sgn}(q_{v'\to c}) \cdot \min_{v' \ne v} |q_{v'\to c}|`, 'Mensagem da equação c para o bit v (min-sum normalizado).')}
        <p>As linhas verticais finas marcam o <b>limite de Shannon</b> \(E_b/N_0 \ge (2^\eta-1)/\eta\) para \(\eta = k\,R\) bits por símbolo. O LDPC fica a ~1,5–2 dB dele; o BCC, a 4–5 dB.</p>
        <div class="note">O simulador de rede (Wi-Fi Lab) usa um modelo didático: \(\mathrm{BER}_{\text{cod}} = \mathrm{BER}_{\text{sem código}}(E_b/N_0 + G_R)\). A curva pontilhada fina mostra esse modelo; compare-a com o Viterbi de verdade.</div>
        ${tasks([
            R`Rode QPSK com \(R = 1/2\) e \(3/4\) (suave). Quanto vale o ganho de codificação em \(10^{-4}\) na tabela?`,
            'Escolha "suave e dura" e meça a diferença entre as duas decisões.',
            'Observe o início das curvas (0–2 dB): o código chega a piorar a BER? Por quê?',
            R`Compare 16-QAM 3/4 (3 bits úteis/símbolo) com 64-QAM 1/2 (3 bits úteis/símbolo). Qual exige menos \(E_b/N_0\)?`,
            'No exemplo de codificação, conte quantos bits saem para 12 bits de entrada em cada taxa.',
            'Com LDPC ligado, compare a inclinação da "cachoeira" LDPC com a do BCC e meça a distância até a linha de Shannon da mesma taxa.',
        ])}
        ${qa([
            [R`Por que não usar sempre \(R = 1/2\)?`, 'Porque ela gasta o dobro de símbolos (banda e tempo no ar) por bit útil. A adaptação de enlace (aula 8) troca robustez por taxa: com SNR alta, 5/6 entrega mais bits por segundo sem erros significativos.'],
            ['O que são os 6 bits de cauda?', 'Zeros acrescentados ao fim do bloco para levar o registrador de volta ao estado 0. Assim o Viterbi sabe onde a treliça termina e os últimos bits ficam tão protegidos quanto os demais.'],
            ['Por que o Wi-Fi entrelaça os bits antes do mapeamento QAM?', 'O Viterbi corrige bem erros espalhados, mas falha com rajadas. O entrelaçador espalha bits vizinhos por subportadoras distantes (desvanecimentos diferentes) e alterna bits mais e menos protegidos da QAM (aula 1).'],
            ['Por que o LDPC tem uma curva tão íngreme?', 'O decodificador iterativo tem um limiar: abaixo dele as mensagens não convergem e quase todo bloco falha; acima dele converge em poucas iterações e os erros somem rapidamente. Blocos longos deixam a transição mais abrupta. O preço é latência e complexidade (iterações).'],
            [R`O ganho assintótico de \(R = 1/2\) é \(10\log_{10} 5 \approx 7\) dB. Por que o medido é menor?`, R`O limite vale para BER \(\to 0\). Em \(10^{-4}\) o termo dominante ainda inclui muitos caminhos de erro (coeficientes da função de transferência), e o ganho real fica em 4 a 5 dB.`],
        ])}`,

    fading: () => R`<h2>Desvanecimento por multipercurso e diversidade</h2>
        <p class="lead">Dentro de casa, o sinal chega por dezenas de caminhos (paredes, móveis, pessoas). As réplicas somam-se com fases aleatórias e o ganho do canal \(h\) vira uma variável gaussiana complexa: \(|h|\) tem distribuição <b>Rayleigh</b> e \(|h|^2\), exponencial.</p>
        ${eq(R`h \sim \mathcal{CN}(0, 1), \qquad P(|h|^2 < \varepsilon) = 1 - e^{-\varepsilon} \approx \varepsilon`, 'A probabilidade de um desvanecimento 10 dB abaixo da média é ≈ 10%; de 20 dB, ≈ 1%.')}
        <h3>Doppler e tempo de coerência</h3>
        <p>Se alguém se move, as fases mudam e o canal varia no tempo com espalhamento Doppler \(f_d = v/\lambda\). A 5 GHz (\(\lambda = 6\) cm), uma pessoa andando (1,5 m/s) gera \(f_d \approx 25\) Hz. O canal fica praticamente constante durante o <b>tempo de coerência</b>:</p>
        ${eq(R`T_c \approx \frac{0{,}423}{f_d}`)}
        <h3>Diversidade</h3>
        <p>Com \(L\) cópias independentes do sinal (antenas separadas por mais de ~\(\lambda/2\), subportadoras distantes, instantes diferentes), é improvável que todas desvaneçam juntas. A BER passa a cair com \(\bar\gamma^{-L}\): \(L\) é a <b>ordem de diversidade</b>.</p>
        ${eq(R`\text{MRC:}\quad y = \sum_{l=1}^{L} h_l^*\, r_l \;\Rightarrow\; \gamma = \sum_{l=1}^{L} \gamma_l`, 'Combinação por razão máxima: pondera cada antena pelo conjugado do canal (ótimo). Soma ganho de arranjo e de diversidade.')}
        ${eq(R`\text{SC:}\quad \gamma = \max_l \gamma_l`, 'Seleção: usa só a melhor antena. Mais simples, mesma ordem de diversidade, menos ganho.')}
        ${eq(R`\bar P_b = \int_0^\infty P_b^{\mathrm{AWGN}}(\gamma)\, f_\gamma(\gamma)\, d\gamma \;\propto\; \bar\gamma^{-L}`, R`Com MRC, \(\gamma\) tem distribuição Gama de ordem \(L\). As curvas do painel são esta integral calculada numericamente.`)}
        <p>No Wi-Fi, a diversidade vem das <b>várias cadeias de recepção</b> do AP, do <b>STBC</b>, do <b>OFDM + entrelaçamento + FEC</b> (diversidade em frequência) e das retransmissões (diversidade temporal).</p>
        ${tasks([
            'Com L = 1, veja quanto tempo o sinal passa abaixo da linha vermelha (−10 dB). Compare com a teoria (≈ 9,5%).',
            'Suba para L = 2 e L = 4 com MRC. O que acontece com a fração de tempo em desvanecimento profundo?',
            'Na curva de BER, meça a inclinação para L = 1 e L = 2 (décadas por 10 dB).',
            'Compare MRC e SC com L = 4: a inclinação muda? E a posição horizontal?',
            R`Aumente \(f_d\) de 5 para 200 Hz. A BER média muda? O que muda para o receptor?`,
        ])}
        ${qa([
            ['Se a SNR média é 15 dB, por que a BPSK sem diversidade ainda erra tanto?', R`Porque em ~3% do tempo a SNR instantânea está abaixo de 0 dB, e esses instantes dominam a média. Com BPSK em AWGN a 15 dB a BER seria ~\(10^{-15}\); em Rayleigh, ≈ \(8\cdot 10^{-3}\).`],
            ['Por que as antenas precisam estar separadas?', R`Para que os canais sejam pouco correlacionados. Com espalhamento angular rico, meio comprimento de onda (3 cm em 5 GHz) já basta. Antenas muito próximas desvanecem juntas e a diversidade efetiva cai.`],
            ['O que o Doppler afeta, se não muda a BER média?', R`A duração dos desvanecimentos. Com \(f_d\) baixo, os vales são longos e destroem quadros inteiros (o FEC não salva). Com \(f_d\) alto, os vales são curtos e o entrelaçamento espalha os erros, mas a estimativa de canal (preâmbulo) fica desatualizada durante o quadro.`],
        ])}`,

    bf: () => R`<h2>Beamforming: somando ondas na direção certa</h2>
        <p class="lead">Com \(N\) antenas espaçadas de \(d\), a onda que sai da antena \(n\) chega a um receptor na direção \(\theta\) com uma fase extra \(2\pi n d \sin\theta/\lambda\). Aplicando a cada antena um peso complexo \(w_n\), o transmissor escolhe onde as ondas se somam em fase.</p>
        ${eq(R`a_n(\theta) = e^{\,j2\pi n (d/\lambda)\sin\theta}, \qquad G(\theta) = \Big|\sum_{n=0}^{N-1} w_n\, a_n(\theta)\Big|^2, \qquad \|\mathbf w\|^2 = 1`, R`\(G(\theta)\) é o ganho de potência em relação a uma antena irradiando a mesma potência total.`)}
        <h3>MRT (feixe casado)</h3>
        <p>\(\mathbf w = \mathbf a^*(\theta_u)/\sqrt N\) compensa exatamente as fases: na direção do usuário, as \(N\) contribuições somam-se coerentemente e \(G = N\) (\(10\log_{10} N\) dB: +6 dB com 4 antenas). Em outras direções a soma é parcial ou se cancela (nulos).</p>
        ${eq(R`\theta_{-3\,\mathrm{dB}} \approx \frac{0{,}886}{N\,(d/\lambda)\cos\theta}\ \text{rad}`)}
        <h3>Espaçamento e lobos de grade</h3>
        <p>Com \(d > \lambda/2\), surgem direções com a mesma diferença de fase: os <b>lobos de grade</b>, cópias do feixe principal que mandam energia para onde não se quer. É o equivalente espacial do aliasing (amostrar o espaço abaixo de "Nyquist"):</p>
        ${eq(R`\text{sem lobos de grade} \iff \frac{d}{\lambda} < \frac{1}{1 + |\sin\theta_0|}`)}
        <h3>MU-MIMO: vários usuários ao mesmo tempo</h3>
        <p>Com \(K\) usuários e um feixe para cada (MRT), parte da energia de um feixe vaza para os outros usuários e vira interferência. O <b>zero-forcing</b> escolhe pesos que anulam essa interferência:</p>
        ${eq(R`\mathbf W = \mathbf H^{\mathsf H}\big(\mathbf H\mathbf H^{\mathsf H}\big)^{-1}, \qquad \mathbf H = \big[\mathbf a(\theta_1)\ \cdots\ \mathbf a(\theta_K)\big]^{\mathsf T}`, R`Funciona se \(K \le N\). Com usuários angularmente próximos, \(\mathbf H\) fica mal condicionada e o ZF gasta potência para manter o nulo: o ganho cai.`)}
        ${eq(R`\mathrm{SINR}_k = \frac{\rho\,|\mathbf h_k^{\mathsf T}\mathbf w_k|^2}{\rho\sum_{j\ne k}|\mathbf h_k^{\mathsf T}\mathbf w_j|^2 + 1}`)}
        <p>No Wi-Fi o AP aprende o canal pela <b>sondagem</b> (NDP + relatório comprimido do cliente) e aplica a pré-codificação. Wi-Fi 5 introduziu MU-MIMO na descida; Wi-Fi 6, na subida também. O Wi-Fi Lab usa o ganho ideal \(10\log_{10}(N_{tx}/N_{ss})\).</p>
        ${tasks([
            R`Com MRT e um usuário a 25°, varie \(N\) de 1 a 16. O ganho no painel segue \(10\log_{10}N\)? O que acontece com a largura do feixe?`,
            R`Ponha \(d = 1\,\lambda\) e depois \(1{,}5\,\lambda\). Onde aparecem os lobos de grade?`,
            'Mude a visualização para "frente de onda" e observe as ondas saindo das antenas em direção ao usuário.',
            'Com 2 usuários (25° e −40°), compare MRT e ZF: SINR, interferência e o diagrama.',
            R`Aproxime os usuários (25° e 30°) com \(N = 4\). O que acontece com o ZF? E com \(N = 16\)?`,
        ])}
        ${qa([
            [R`Por que o ganho é \(N\) e não \(N^2\)?`, R`O campo na direção do usuário cresce com o número de antenas, mas a potência total é fixa: cada antena recebe amplitude \(1/\sqrt N\). Campo: \(N/\sqrt N = \sqrt N\); potência: \(N\). O ganho vem de concentrar a energia, não de criar energia.`],
            ['Por que a fase aplicada cresce linearmente com o índice da antena?', R`Para compensar o atraso geométrico: cada antena está \(d\sin\theta\) mais perto (ou longe) do usuário, o que corresponde a \(2\pi(d/\lambda)\sin\theta\) radianos. É uma rampa de fase, uma "lente" digital (veja o gráfico de pesos).`],
            ['O que limita o MU-MIMO na prática?', R`Estimativa de canal desatualizada (sondagem periódica, mobilidade), usuários com canais correlacionados, overhead do relatório de sondagem e limite de fluxos. Com multipercurso real, os canais não são só "direções", mas a ideia de pré-codificar com \(\mathbf H\) continua a mesma.`],
        ])}`,

    ofdm: () => R`<h2>OFDM: muitas portadoras lentas no lugar de uma rápida</h2>
        <p class="lead">Um canal Wi-Fi de 20 MHz com uma única portadora teria símbolos de 50 ns, da ordem do espalhamento de atraso de um escritório (50–150 ns). Cada símbolo se misturaria com os vizinhos (ISI) e o receptor precisaria de um equalizador longo.</p>
        <p>O OFDM divide a banda em \(N\) <b>subportadoras ortogonais</b> espaçadas de \(\Delta f\). Cada uma carrega um símbolo QAM lento (3,2 µs no Wi-Fi 4/5, 12,8 µs no Wi-Fi 6/7), e o multipercurso vira, em cada subportadora, uma simples multiplicação por \(H_k\).</p>
        ${eq(R`x[n] = \frac{1}{\sqrt N}\sum_{k=0}^{N-1} X_k\, e^{\,j2\pi kn/N} \quad (\text{IFFT})`, R`\(\Delta f = f_s/N\): 312,5 kHz (Wi-Fi 4/5) ou 78,125 kHz (Wi-Fi 6/7). Ortogonalidade: o sinc de cada subportadora zera nas outras.`)}
        <h3>Prefixo cíclico (GI)</h3>
        <p>Copiar o fim do símbolo para o início transforma a convolução linear com o canal numa convolução circular. Enquanto o atraso máximo couber no CP (0,8/1,6/3,2 µs), não há ISI nem ICI:</p>
        ${eq(R`Y_k = H_k X_k + N_k \;\Rightarrow\; \hat X_k^{\mathrm{ZF}} = \frac{Y_k}{\hat H_k}, \qquad \hat X_k^{\mathrm{MMSE}} = \frac{\hat H_k^*\, Y_k}{|\hat H_k|^2 + \sigma^2}`)}
        <h3>Estimação, pilotos e sincronismo</h3>
        <p>O preâmbulo (LTF) traz símbolos conhecidos para estimar \(H_k\); os <b>pilotos</b> rastreiam a fase residual ao longo do quadro. Um erro de frequência \(\varepsilon\) (CFO, em frações de \(\Delta f\)) desloca as amostras do pico do sinc e as subportadoras vazam umas nas outras (ICI):</p>
        ${eq(R`\text{ICI} \approx \sum_{m \ne 0} \mathrm{sinc}^2(\varepsilon - m)`)}
        <h3>Desvantagens</h3>
        <p>A soma de muitas senoides tem <b>PAPR alta</b> (o PA precisa de recuo, veja a aula 1) e o sistema é sensível a CFO e ruído de fase. As subportadoras em vales de \(|H_k|\) erram mais, e é aí que entram o entrelaçamento e o FEC (aula 4).</p>
        ${tasks([
            'Escolha o perfil "Eco forte em 2 µs" com GI 0,8 µs. Veja a região vermelha de ISI e a constelação. Depois mude o GI para 3,2 µs (Wi-Fi 6).',
            'Com TGn D, desligue o equalizador. Por que a constelação vira um anel?',
            R`Ponha CFO de 5% e depois 20% de \(\Delta f\). Veja o gráfico de ortogonalidade e o EVM.`,
            'Em SNR baixa (8 dB), compare a estimação ideal com a LTF e o ZF com o MMSE.',
            R`Compare Wi-Fi 5 e Wi-Fi 6 em 20 MHz: número de subportadoras, \(\Delta f\) e overhead do GI.`,
        ])}
        ${qa([
            ['Por que o Wi-Fi 6 usa símbolos 4× mais longos?', R`Com \(\Delta f\) 4× menor (78,125 kHz), o símbolo útil vai a 12,8 µs. O mesmo GI de 0,8 µs passa a custar 6% em vez de 20%, e há GIs maiores (3,2 µs) para ambientes externos. Em troca, é mais sensível a CFO e ruído de fase.`],
            ['O que acontece se o atraso do canal exceder o CP?', 'Parte do símbolo anterior cai na janela da FFT: ISI. A convolução deixa de ser circular e surge ICI. Aparece um "piso" de erro que mais potência não resolve.'],
            ['Por que a BER média em multipercurso é pior que em AWGN com a mesma SNR média?', 'Pela desigualdade de Jensen: a BER é convexa na SNR, e as subportadoras nos vales erram muito mais do que as dos picos acertam. Sem codificação e entrelaçamento, o OFDM sofre como um canal com desvanecimento (aula 5).'],
        ])}`,

    mcs: () => R`<h2>MCS: modulação + código conforme a SNR</h2>
        <p class="lead">Cada <b>MCS</b> (Modulation and Coding Scheme) combina uma constelação (aula 1) com uma taxa de código (aula 4). O transmissor escolhe o MCS mais alto que a SNR atual suporta com poucos erros. É a <b>adaptação de enlace</b>.</p>
        ${eq(R`R_{\mathrm{PHY}} = \frac{N_{ss}\, N_{sd}\, \log_2 M\; R_c}{T_{\text{sym}} + T_{\mathrm{GI}}}`, R`\(N_{sd}\): subportadoras de dados (234 em 20 MHz no Wi-Fi 6); \(T_{\text{sym}}\): 3,2 µs ou 12,8 µs.`)}
        <h3>Da SNR à \(E_b/N_0\)</h3>
        <p>Por subportadora, a SNR medida é \(E_s/N_0\) (um símbolo QAM por subportadora por símbolo OFDM). Cada símbolo carrega \(k\,R_c\) bits de informação:</p>
        ${eq(R`\left.\frac{E_b}{N_0}\right|_{\mathrm{dB}} = \mathrm{SNR}_{\mathrm{dB}} - 10\log_{10}(k\,R_c)`)}
        <h3>Distância até Shannon</h3>
        <p>Para cada eficiência \(\eta = k\,R_c\) bits por subportadora, Shannon exige no mínimo \(\mathrm{SNR} = 2^\eta - 1\). A diferença entre a SNR que o MCS realmente exige e esse mínimo é o <b>gap</b>. Ele vem da modulação finita, do tamanho do código e da PER desejada.</p>
        ${eq(R`C = N_{ss}\, B \log_2(1 + \mathrm{SNR}), \qquad \text{gap} = \mathrm{SNR}_{\text{MCS}} - 10\log_{10}\!\big(2^{\eta} - 1\big)`)}
        <p>O critério usado aqui é o mesmo do Wi-Fi Lab: <b>PER ≤ 10%</b> para um MPDU de 1538 bytes. A PER cresce com o tamanho do quadro:</p>
        ${eq(R`\mathrm{PER} = 1 - (1 - \mathrm{BER})^{8L}`)}
        <div class="note">No Wi-Fi Lab, selecione um cliente → aba <b>Enlace</b> → <b>Estudar este enlace ↗</b>. A página abre com a SNR, o padrão e o MCS daquele enlace.</div>
        ${tasks([
            'Varie a SNR de 0 a 45 dB e acompanhe o MCS escolhido. Em que SNR aparece cada modulação?',
            'Ache um ponto em que dois MCS com a mesma modulação e taxas diferentes (64-QAM 2/3, 3/4, 5/6) se sucedem. Quantos dB separam os degraus?',
            'Calcule à mão a taxa do MCS 11, 80 MHz, 2 fluxos, GI 0,8 µs e confira com a tabela.',
            R`Compare a eficiência \(\eta\) do MCS escolhido com a capacidade de Shannon. Qual é o gap em dB?`,
            R`Passe de 1 para 2 fluxos (\(N_{ss}\)). A taxa dobra? O que acontece com a SNR por fluxo no Wi-Fi Lab?`,
        ])}
        ${qa([
            ['Por que a escolha não é "o MCS de maior taxa com PER < 1%"?', R`Retransmitir 10% dos quadros custa menos que descer um MCS (perdendo 15–30% de taxa). Algoritmos reais (Minstrel, por exemplo) testam MCS vizinhos e maximizam a vazão esperada, \(\text{taxa} \times (1 - \mathrm{PER})\).`],
            ['Por que 4096-QAM (Wi-Fi 7) só aparece perto de 40 dB?', R`Cada passo \(M \times 4\) custa ≈ 6 dB (aula 1). Além disso, ruído de fase, EVM do transmissor e o PA limitam a SNR efetiva. Na prática, 1024/4096-QAM só funcionam a poucos metros do AP.`],
            ['Se a capacidade de Shannon é tão maior, para que serve ela?', 'É um limite superior: mostra quanto ainda é possível ganhar. O gap do Wi-Fi (~4–8 dB, com PER 10% e códigos curtos) explica por que LDPC, blocos maiores e HARQ aparecem nas novas gerações.'],
        ])}`,
};
