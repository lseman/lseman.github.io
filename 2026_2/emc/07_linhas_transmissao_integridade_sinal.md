# Linhas de transmissão e integridade de sinal

> Compatibilidade Eletromagnética — Apostila de Curso  
> Tópicos: equações do telegrafista · parâmetros distribuídos · reflexões · integridade de sinal · perdas · terminações

## Objetivos de aprendizagem

Ao concluir este capítulo, você deverá ser capaz de:

- decidir quando uma interconexão deve ser tratada como linha de transmissão;
- derivar e interpretar as equações do telegrafista;
- calcular velocidade, impedância característica, atraso e coeficientes de reflexão;
- construir diagramas de reflexões para excitação por degrau;
- analisar uma linha em regime senoidal;
- selecionar terminações e relacionar integridade de sinal a EMC;
- reconhecer os limites dos modelos sem perdas e concentrados.

## Sumário

1. [Do circuito concentrado ao circuito distribuído](#do-circuito-concentrado-ao-circuito-distribuído)
2. [Equações do telegrafista](#equações-do-telegrafista)
3. [Parâmetros por unidade de comprimento](#parâmetros-por-unidade-de-comprimento)
4. [Reflexão e transmissão](#reflexão-e-transmissão)
5. [Resposta no tempo e diagrama de reflexões](#resposta-no-tempo-e-diagrama-de-reflexões)
6. [Quando a interconexão "vira" linha?](#quando-a-interconexão-vira-linha)
7. [Integridade de sinal](#integridade-de-sinal)
8. [Terminações](#terminações)
9. [Solução fasorial e impedância de entrada](#solução-fasorial-e-impedância-de-entrada)
10. [Ondas estacionárias e potência](#ondas-estacionárias-e-potência)
11. [Modelo concentrado aproximado](#modelo-concentrado-aproximado)
12. [Armadilhas frequentes](#armadilhas-frequentes)
13. [Exercícios propostos](#exercícios-propostos)
14. [Exemplo numérico resolvido: linha de 3 m com carga reativa](#exemplo-numérico-resolvido-linha-de-3-m-com-carga-reativa)
15. [Código Python: Reflexão e VSWR](#código-python-reflexão-e-vswr)
16. [Código Python: Diagrama de reflexões no tempo](#código-python-diagrama-de-reflexões-no-tempo)
17. [Exemplo numérico passo a passo: cálculo de parâmetros de linha](#exemplo-numérico-passo-a-passo-cálculo-de-parâmetros-de-linha)
18. [Comparação entre linha ideal e rede LC segmentada](#comparação-entre-linha-ideal-e-rede-lc-segmentada)
19. [TDR: extração de impedância](#tdr-extração-de-impedância)
20. [Laboratório SPICE — reflexão e terminação](#laboratório-spice--reflexão-e-terminação)
21. [Referência principal](#referência-principal)

## Do circuito concentrado ao circuito distribuído

### Conceito fundamental: quando um fio "vira" uma linha?

Em circuitos concentrados, supõe-se que tensão e corrente mudam instantaneamente em todo o elemento. Uma interconexão real armazena energia elétrica e magnética ao longo do comprimento; uma perturbação leva tempo para se propagar. Quando esse atraso é comparável ao tempo de variação do sinal, $V$ e $I$ dependem simultaneamente da posição $z$ e do tempo $t$.

> **Insight para Estudantes**: Não é a frequência de clock que determina se você precisa tratar um fio como linha de transmissão, mas sim o **tempo de subida** ($t_r$) do sinal. Um clock de 10 MHz com tempo de subida de 100 ps se comporta como uma linha de transmissão, enquanto um clock de 100 MHz com tempo de subida de 10 ns pode ainda ser tratado como circuito concentrado.

**Definição**: Uma **linha de transmissão** é uma estrutura de dois ou mais condutores na qual os parâmetros elétricos são distribuídos e a propagação deve ser descrita por ondas.

### O modelo distribuído

Para um trecho diferencial $\Delta z$, definem-se:

| Parâmetro por unidade de comprimento | Unidade | Fenômeno |
|---|---:|---|
| $R$ | $\Omega/\text{m}$ | perda ôhmica nos condutores |
| $L$ | $\text{H}/\text{m}$ | energia magnética |
| $G$ | $\text{S}/\text{m}$ | perda no dielétrico |
| $C$ | $\text{F}/\text{m}$ | energia elétrica |

O modelo diferencial contém $R\Delta z$ e $L\Delta z$ em série, e $G\Delta z$ e $C\Delta z$ em paralelo, conforme ilustrado na Fig. 4.4 do Capítulo 4 de Paul.

> **Dedução Conceitual**: Por que parâmetros distribuídos? Porque um fio não é apenas um caminho para corrente; ele é um **capacitor** entre os condutores e um **indutor** ao longo do caminho da corrente. Quando o sinal muda rapidamente, esses elementos armazenam e liberam energia, criando ondas que se propagam.

## Equações do telegrafista

**Teorema (Equações do telegrafista)**: Para uma linha uniforme, linear e incrementalmente curta, tensão e corrente satisfazem

$$
\frac{\partial V}{\partial z}=-RI-L\frac{\partial I}{\partial t},
\qquad
\frac{\partial I}{\partial z}=-GV-C\frac{\partial V}{\partial t}.
$$

**Prova**: Aplique a lei das tensões de Kirchhoff ao trecho $\Delta z$:

$$V(z,t)-V(z+\Delta z,t)=R\Delta z\,I+L\Delta z\frac{\partial I}{\partial t}.$$

Divida por $\Delta z$ e tome $\Delta z\to0$:

$$\lim_{\Delta z\to0}\frac{V(z,t)-V(z+\Delta z,t)}{\Delta z}=\frac{\partial V}{\partial z}.$$

Para a corrente, aplique a lei dos nós à corrente desviada por $G\Delta z$ e $C\Delta z$:

$$I(z,t)-I(z+\Delta z,t)=G\Delta z\,V+C\Delta z\frac{\partial V}{\partial t}.$$

O mesmo limite produz a segunda equação. $\square$

### Equações de onda

Diferenciando a primeira equação em $z$ e substituindo a segunda, obtém-se

$$
\frac{\partial^2V}{\partial z^2}
=LC\frac{\partial^2V}{\partial t^2}
+(RC+LG)\frac{\partial V}{\partial t}+RGV.
$$

A corrente satisfaz uma equação análoga. Para uma linha sem perdas, $R=G=0$:

$$
\frac{\partial^2V}{\partial z^2}=LC\frac{\partial^2V}{\partial t^2}.
$$

**Teorema**: Na linha sem perdas, a velocidade de fase e a impedância característica são

$$v_p=\frac{1}{\sqrt{LC}},\qquad Z_0=\sqrt{\frac{L}{C}}.$$

**Prova**: Insira uma onda progressiva $V^+(t-z/v_p)$ na equação de onda. Pela regra da cadeia, os dois lados só são iguais se $1/v_p^2=LC$. Substituindo a mesma onda na primeira equação do telegrafista e integrando em seu argumento, resulta $V^+/I^+=v_pL=\sqrt{L/C}$. Para a onda regressiva, o sinal da corrente se inverte. $\square$

Assim,

$$
V(z,t)=V^+\left(t-\frac{z}{v_p}\right)+V^-\left(t+\frac{z}{v_p}\right),
$$

$$
I(z,t)=\frac{1}{Z_0}\left[V^+\left(t-\frac{z}{v_p}\right)-V^-\left(t+\frac{z}{v_p}\right)\right].
$$

Insight de engenharia: $Z_0$ não é a resistência DC do fio. É a razão $V/I$ de uma onda viajante, determinada pelo armazenamento distribuído de energia elétrica e magnética.

## Parâmetros por unidade de comprimento

Em modo TEM e meio homogêneo,

$$LC=\mu\varepsilon,\qquad v_p=\frac{1}{\sqrt{\mu\varepsilon}}.$$

Para dielétrico não magnético homogêneo,

$$v_p\approx\frac{c}{\sqrt{\varepsilon_r}}.$$

Microstrip é parcialmente preenchida por ar e parcialmente pelo substrato; usa-se uma permissividade efetiva $\varepsilon_{eff}$ entre 1 e $\varepsilon_r$.

### Perdas e efeito pelicular

O efeito pelicular tem profundidade

$$\delta=\sqrt{\frac{2}{\omega\mu\sigma}},$$

fazendo $R(f)$ crescer aproximadamente como $\sqrt f$ quando a espessura do condutor é muito maior que $\delta$. Para dielétrico com tangente de perdas $\tan\delta_d$,

$$G\approx\omega C\tan\delta_d.$$

Esses efeitos atenuam mais as componentes de alta frequência, arredondam bordas e produzem interferência intersimbólica.

## Reflexão e transmissão

Considere uma linha de impedância $Z_0$ terminada por $Z_L$. No ponto da carga,

$$V_L=V^++V^-,\qquad I_L=\frac{V^+-V^-}{Z_0}.$$

**Teorema**: O coeficiente de reflexão de tensão na carga é

$$\Gamma_L=\frac{V^-}{V^+}=\frac{Z_L-Z_0}{Z_L+Z_0}.$$

**Prova**: Imponha $Z_L=V_L/I_L$ às expressões anteriores:

$$Z_L=Z_0\frac{V^++V^-}{V^+-V^-}.$$

Dividindo por $V^+$ e isolando $V^-/V^+$, obtém-se o resultado. $\square$

Casos importantes:

| Carga | $\Gamma_L$ | Efeito |
|---|---:|---|
| $Z_L=Z_0$ | 0 | absorção total |
| circuito aberto | $+1$ | tensão dobra, corrente zera |
| curto-circuito | $-1$ | tensão zera, corrente dobra em módulo |
| $Z_L>Z_0$ resistivo | $0<\Gamma_L<1$ | reflexão de mesma polaridade |
| $Z_L<Z_0$ resistivo | $-1<\Gamma_L<0$ | reflexão invertida |

O coeficiente de transmissão de tensão na carga é

$$\tau_L=1+\Gamma_L=\frac{2Z_L}{Z_L+Z_0}.$$

### Exemplo resolvido: carga de 100 Ω em linha de 50 Ω

Dados $Z_0=50\ \Omega$ e $Z_L=100\ \Omega$:

$$\Gamma_L=\frac{100-50}{100+50}=\frac13.$$

Se a onda incidente tem 2 V, a refletida tem $2/3$ V e a tensão instantânea na carga após a chegada é

$$V_L=2+\frac23=2{,}667\ \text{V}.$$

A reflexão é positiva porque a carga exige menos corrente que a onda incidente transporta; a combinação com uma onda regressiva positiva reduz a corrente líquida.

## Resposta no tempo e diagrama de reflexões

Uma fonte de degrau $V_S$ com resistência $R_S$ lança inicialmente

$$V_0^+=V_S\frac{Z_0}{R_S+Z_0}.$$

O atraso de ida é

$$t_d=\frac{l}{v_p},$$

e o coeficiente na fonte é

$$\Gamma_S=\frac{R_S-Z_0}{R_S+Z_0}.$$

Cada chegada a uma terminação gera nova onda igual à onda incidente multiplicada pelo $\Gamma$ local. O diagrama de reflexões registra amplitude, direção e instante de cada evento.

### Exemplo resolvido: linha aberta

Uma fonte de 5 V e $R_S=50\ \Omega$ alimenta linha de $Z_0=50\ \Omega$, $t_d=4$ ns, aberta na carga.

1. O degrau lançado é $V_0^+=5(50/100)=2{,}5$ V.
2. Em $t=4$ ns, $\Gamma_L=+1$ e a carga passa a $2{,}5+2{,}5=5$ V.
3. A reflexão de 2,5 V retorna à fonte em $t=8$ ns.
4. Como $\Gamma_S=0$, ela é absorvida e o processo termina.

Esse exemplo explica por que a carga pode receber a tensão correta mesmo que a primeira onda tenha metade do valor final.

### Diagrama de reflexões (ladder diagram)

Para múltiplas reflexões, constrói-se um diagrama de reflexões (ladder diagram) onde o eixo horizontal é o tempo e o eixo vertical é a amplitude. Cada segmento representa uma onda viajando na direção $+z$ ou $-z$. O método de reflexões sucessivas permite calcular a tensão em qualquer ponto e tempo como uma soma finita ou infinita de ondas.

## Quando a interconexão "vira" linha?

O critério físico é comparar atraso e tempo de subida. Uma regra conservadora comum é tratar a interconexão como linha quando

$$t_d\gtrsim\frac{t_r}{6},
\qquad
l\gtrsim\frac{v_pt_r}{6}.$$

Não é a frequência de clock que decide, mas a rapidez da borda.

### Exemplo resolvido

Para $t_r=1$ ns e $v_p=1{,}5\times10^8$ m/s:

$$l_{crit}\approx\frac{1{,}5\times10^8\times10^{-9}}{6}=0{,}025\ \text{m}=2{,}5\ \text{cm}.$$

Uma trilha de 8 cm precisa de análise distribuída mesmo que transporte um clock de apenas alguns megahertz.

## Integridade de sinal

Integridade de sinal significa entregar ao receptor níveis e instantes válidos. Os mecanismos principais são:

- **ringing, overshoot e undershoot:** reflexões e ressonâncias;
- **crosstalk:** acoplamento a interconexões vizinhas;
- **jitter:** variação do instante de cruzamento do limiar;
- **ISI:** memória do canal por perdas e dispersão;
- **ground bounce e ruído da alimentação:** impedância comum no retorno e na PDN.

Uma margem de tensão grande não garante margem temporal: ringing perto do limiar pode criar múltiplos cruzamentos. Da mesma forma, um sinal visualmente limpo pode ter jitter excessivo.

## Terminações

### Série na fonte

Escolhe-se $R_S+R_T\approx Z_0$. A primeira onda geralmente tem amplitude reduzida; após refletir na carga de alta impedância, alcança o valor final. É eficiente para ligação ponto a ponto e consome pouca potência DC, mas a forma de onda no meio da linha tem patamar intermediário.

### Paralela na carga

Coloca-se $R_T\approx Z_0$ junto à carga. A onda é absorvida imediatamente. A desvantagem é consumo DC e maior exigência do driver.

### Thévenin e AC

A terminação Thévenin fornece equivalente resistivo ao nível de polarização. A terminação AC usa capacitor em série e elimina consumo DC, mas só casa durante transições e exige escolha de constante de tempo.

Insight de engenharia: a melhor terminação não é a que deixa a simulação mais bonita; é a que mantém margens em PVT, não sobrecarrega o driver e não cria retorno ou emissão indesejados.

## Solução fasorial e impedância de entrada

Em regime senoidal,

$$\frac{d\hat V}{dz}=-(R+j\omega L)\hat I,\qquad
\frac{d\hat I}{dz}=-(G+j\omega C)\hat V.$$

Definem-se

$$\gamma=\alpha+j\beta=\sqrt{(R+j\omega L)(G+j\omega C)},$$

$$Z_0=\sqrt{\frac{R+j\omega L}{G+j\omega C}}.$$

As soluções são

$$\hat V(z)=V^+e^{-\gamma z}+V^-e^{\gamma z},$$

$$\hat I(z)=\frac{V^+}{Z_0}e^{-\gamma z}-\frac{V^-}{Z_0}e^{\gamma z}.$$

Para uma linha de comprimento $l$ terminada em $Z_L$, a impedância de entrada é

$$Z_{in}=Z_0\frac{Z_L+Z_0\tanh(\gamma l)}{Z_0+Z_L\tanh(\gamma l)}.$$

**Teorema (Impedância de entrada para linha com perdas)**: Para uma linha com parâmetros distribuídos $R$, $L$, $G$, $C$, a impedância de entrada vista a uma distância $l$ da carga $Z_L$ é dada por

$$Z_{in}=Z_0\frac{Z_L+Z_0\tanh(\gamma l)}{Z_0+Z_L\tanh(\gamma l)},$$

onde $\gamma=\alpha+j\beta=\sqrt{(R+j\omega L)(G+j\omega C)}$ é a constante de propagação e $Z_0=\sqrt{(R+j\omega L)/(G+j\omega C)}$ é a impedância característica complexa.

**Prova**: Na carga ($z=l$), tem-se $\hat V(l)=V_L$ e $\hat I(l)=I_L=V_L/Z_L$. Das soluções gerais,

$$V_L=V^+e^{-\gamma l}+V^-e^{\gamma l},$$

$$I_L=\frac{V^+}{Z_0}e^{-\gamma l}-\frac{V^-}{Z_0}e^{\gamma l}.$$

Dividindo a primeira pela segunda e impondo $V_L/I_L=Z_L$, obtém-se

$$Z_L=Z_0\frac{V^+e^{-\gamma l}+V^-e^{\gamma l}}{V^+e^{-\gamma l}-V^-e^{\gamma l}}.$$

Definindo $\Gamma_l=V^-e^{\gamma l}/(V^+e^{-\gamma l})=\Gamma_L e^{-2\gamma l}$, onde $\Gamma_L=(Z_L-Z_0)/(Z_L+Z_0)$, tem-se

$$Z_L=Z_0\frac{1+\Gamma_l}{1-\Gamma_l}.$$

Na entrada ($z=0$), $Z_{in}=\hat V(0)/\hat I(0)=Z_0(1+\Gamma_0)/(1-\Gamma_0)$, onde $\Gamma_0=V^-/V^+=\Gamma_l e^{-2\gamma l}=\Gamma_L e^{-4\gamma l}$. Usando a identidade $\tanh(x)=(e^{2x}-1)/(e^{2x}+1)$, resulta

$$Z_{in}=Z_0\frac{Z_L+Z_0\tanh(\gamma l)}{Z_0+Z_L\tanh(\gamma l)}.$\square$$

Na linha sem perdas, $\gamma=j\beta$:

$$Z_{in}=Z_0\frac{Z_L+jZ_0\tan(\beta l)}{Z_0+jZ_L\tan(\beta l)}.$$

**Corolário**: Uma linha sem perdas de quarto de onda transforma impedâncias segundo

$$Z_{in}=\frac{Z_0^2}{Z_L}.$$

**Prova**: Tome o limite de $Z_{in}$ quando $\beta l\to\pi/2$, dividindo numerador e denominador por $\tan(\beta l)$:

$$\lim_{\beta l\to\pi/2}Z_0\frac{Z_L+jZ_0\tan(\beta l)}{Z_0+jZ_L\tan(\beta l)}
=Z_0\lim_{x\to\infty}\frac{Z_L/x+jZ_0}{Z_0/x+jZ_L}
=Z_0\frac{jZ_0}{jZ_L}=\frac{Z_0^2}{Z_L}.$$

$\square$

**Corolário**: Uma linha de meia onda repete a impedância da carga: para $\beta l=\pi$, $\tan(\beta l)=0$, logo $Z_{in}=Z_L$.

## Ondas estacionárias e potência

O módulo de $V$ varia entre $|V^+|(1+|\Gamma|)$ e $|V^+|(1-|\Gamma|)$. A relação de onda estacionária é

$$VSWR=\frac{1+|\Gamma|}{1-|\Gamma|}.$$

**Teorema (Relação entre VSWR e coeficiente de reflexão)**: Para uma linha com impedância característica real $Z_0$, a relação de onda estacionária de tensão é relacionada ao coeficiente de reflexão $\Gamma_L$ por

$$VSWR=\frac{1+|\Gamma_L|}{1-|\Gamma_L|}.$$

**Prova**: A tensão total na linha é $V(z)=V^+e^{-\gamma z}+V^-e^{\gamma z}=V^+e^{-\gamma z}(1+\Gamma(z))$, onde $\Gamma(z)=V^-e^{2\gamma z}/V^+$. O módulo máximo ocorre quando $\Gamma(z)$ está em fase com 1, isto é, $|V|_{max}=|V^+|(1+|\Gamma_L|)$. O módulo mínimo ocorre quando $\Gamma(z)$ está em oposição de fase, isto é, $|V|_{min}=|V^+|(1-|\Gamma_L|)$. Portanto,

$$VSWR=\frac{|V|_{max}}{|V|_{min}}=\frac{1+|\Gamma_L|}{1-|\Gamma_L|}.$\square$

A fração de potência refletida é $|\Gamma|^2$ para impedância característica real. Em carga puramente reativa, $|\Gamma|=1$: toda potência média é refletida.

## Modelo concentrado aproximado

Se o comprimento elétrico for pequeno, a linha pode ser aproximada por

$$L_{tot}=Ll,\qquad C_{tot}=Cl,$$

em uma seção $\pi$ ou T. Uma única seção é adequada apenas quando a variação de fase ao longo do trecho é pequena. Dividir em mais seções melhora a aproximação até que o atraso distribuído ou as perdas dependentes de frequência exijam um modelo próprio de linha.

## Armadilhas frequentes

- Usar frequência de clock, e não tempo de subida, como critério.
- Informar $Z_0$ sem stack-up, geometria e tolerância de fabricação.
- Terminar longe da carga ou da fonte correspondente.
- Ignorar vias, conectores e stubs como descontinuidades.
- Tratar plano de retorno interrompido como "terra ideal".
- Confundir atenuação com ausência de reflexão.
- Aplicar fórmulas de linha sem perdas onde $R(f)$ e $G(f)$ fecham o olho.

## Lista de Exercícios Propostos

**E.1** Derive as equações do telegrafista incluindo $R$, $L$, $G$ e $C$.

**E.2** Para $L=250$ nH/m e $C=100$ pF/m, calcule $Z_0$, $v_p$ e o atraso de 2 m.

**E.3** Uma linha de 75 Ω termina em 25 Ω. Calcule $\Gamma_L$, $\tau_L$ e VSWR.

**E.4** Uma fonte de 3,3 V com 20 Ω dirige linha de 50 Ω aberta. Determine a primeira onda e a tensão na carga após $t_d$.

**E.5** Construa as quatro primeiras reflexões para $R_S=100\ \Omega$, $Z_0=50\ \Omega$ e $Z_L=25\ \Omega$.

**E.6** Determine o comprimento crítico para $t_r=200$ ps e atraso de 60 ps/cm.

**E.7** Mostre que uma linha de meia onda repete a impedância da carga.

**E.8** Um capacitor de entrada de 5 pF termina uma linha de 50 Ω. Explique qualitativamente como $\Gamma_L$ muda durante uma borda.

**E.9** Compare terminação série e paralela quanto a potência, waveform intermediária e topologia.

**E.10** Explique como perdas dependentes de frequência geram ISI.

## Gabarito

**E.2** Para $L=250$ nH/m e $C=100$ pF/m, calcule $Z_0$, $v_p$ e o atraso de 2 m.

$Z_0=\sqrt{L/C}=\sqrt{250\times10^{-9}/100\times10^{-12}}=\sqrt{2500}=50\ \Omega$.

$v_p=1/\sqrt{LC}=1/\sqrt{250\times10^{-9}\cdot100\times10^{-12}}=1/\sqrt{2.5\times10^{-17}}=2\times10^8$ m/s.

Atraso para 2 m: $t_d=l/v_p=2/(2\times10^8)=10$ ns.

**E.3** Linha de 75 Ω termina em 25 Ω. Calcule $\Gamma_L$, $\tau_L$ e VSWR.

$\Gamma_L=(Z_L-Z_0)/(Z_L+Z_0)=(25-75)/(25+75)=-50/100=-0{,}5$.

$\tau_L=1+\Gamma_L=1-0{,}5=0{,}5$.

$VSWR=(1+|\Gamma_L|)/(1-|\Gamma_L|)=(1+0{,}5)/(1-0{,}5)=1{,}5/0{,}5=3$.

**E.6** Comprimento crítico para $t_r=200$ ps e atraso de 60 ps/cm.

Tempo de atraso por metro: $60\text{ ps/cm}=6000\text{ ps/m}=6\text{ ns/m}$.

Comprimento crítico: $l_{crit}=v_p\cdot t_r/6$. Como $t_d=l\cdot(60\text{ ps/cm})$, temos $l_{crit}=t_r/6/(60\text{ ps/cm})=200\text{ ps}/6/(60\text{ ps/cm})=33{,}33/60=0{,}556$ cm.

Resposta: $l_{crit}\approx0{,}56$ cm.

**E.7** Linha de meia onda repete impedância da carga.

Para linha sem perdas, $Z_{in}=Z_0\frac{Z_L+jZ_0\tan(\beta l)}{Z_0+jZ_L\tan(\beta l)}$. Para meia onda, $l=\lambda/2$, logo $\beta l=2\pi l/\lambda=\pi$. Como $\tan(\pi)=0$, tem-se $Z_{in}=Z_0\frac{Z_L+0}{Z_0+0}=Z_L$.

**E.8** Capacitor de 5 pF termina linha de 50 Ω. Como $\Gamma_L$ muda durante uma borda.

Inicialmente, para frequências muito altas (borda rápida), o capacitor se comporta como curto-circuito ($Z_C\approx0$), logo $\Gamma_L\approx-1$. À medida que a borda avança e as componentes de baixa frequência se estabelecem, a impedância do capacitor aumenta ($Z_C=1/(j\omega C)$), e $\Gamma_L$ tende a $(Z_C-Z_0)/(Z_C+Z_0)$, que para $Z_C\gg Z_0$ tende a $+1$. Portanto, $\Gamma_L$ varia de $-1$ para $+1$ durante a borda.

**E.10** Perdas dependentes de frequência geram ISI.

Perdas por efeito pelicular fazem $R(f)\propto\sqrt{f}$, e perdas no dielétrico fazem $G(f)\propto f$. Isso produz atenuação seletiva: componentes de alta frequência são mais atenuadas que as de baixa frequência. Bordas de sinal, que dependem de altas frequências, são arredondadas, e os símbolos anteriores se sobrepõem ao atual, causando interferência intersimbólica (ISI).

## Exemplo numérico resolvido: linha de 3 m com carga reativa

Dados: $Z_0=50\ \Omega$, $l=3$ m, $v_p=2\times10^8$ m/s, $f=100$ MHz, $Z_L=25-j25\ \Omega$.

1. Atraso de propagação: $t_d=l/v_p=3/(2\times10^8)=15$ ns.
2. Comprimento de onda: $\lambda=v_p/f=2$ m.
3. Fase: $\beta l=2\pi l/\lambda=2\pi(3/2)=3\pi$ rad.
4. $\tan(\beta l)=\tan(3\pi)=0$.
5. $Z_{in}=Z_0\frac{Z_L+jZ_0\tan(\beta l)}{Z_0+jZ_L\tan(\beta l)}=Z_L=25-j25\ \Omega$.

Para meia onda ($l=\lambda/2=1$ m), $Z_{in}=Z_L$ independentemente de $Z_L$.

## Código Python: Reflexão e VSWR

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros da linha
Z0 = 50.0  # Impedância característica (Ω)

# Varre carga de 0 a 100 Ω
ZL_real = np.linspace(0, 100, 500)
Gamma_real = (ZL_real - Z0) / (ZL_real + Z0)
den_vswr = 1 - np.abs(Gamma_real)
VSWR_real = np.divide(
    1 + np.abs(Gamma_real), den_vswr,
    out=np.full_like(Gamma_real, np.inf), where=den_vswr > 0
)

plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(ZL_real, Gamma_real, 'b-', label='Γ_L')
plt.axhline(0, color='k', linestyle='--')
plt.axhline(1, color='r', linestyle='--')
plt.axhline(-1, color='r', linestyle='--')
plt.xlabel('Z_L (Ω)')
plt.ylabel('Γ_L')
plt.title('Coeficiente de Reflexão vs Carga Resistiva')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(ZL_real, VSWR_real, 'g-')
plt.xlabel('Z_L (Ω)')
plt.ylabel('VSWR')
plt.title('VSWR vs Carga Resistiva')
plt.grid(True)

plt.tight_layout()
plt.show()
```

## Código Python: Diagrama de reflexões no tempo

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros
VS = 5.0      # Tensão da fonte (V)
RS = 50.0     # Resistência da fonte (Ω)
Z0 = 50.0     # Impedância característica (Ω)
ZL = np.inf   # Carga aberta (∞)
ld = 3.0      # Comprimento da linha (m)
vp = 2e8      # Velocidade de propagação (m/s)
tr = 0.1e-9   # Tempo de subida (100 ps)
t_sim = 100e-9 # Tempo total de simulação (100 ns)

td = ld / vp  # Atraso de propagação (15 ns)

# Coeficientes de reflexão
Gamma_S = (RS - Z0) / (RS + Z0)
if np.isinf(ZL):
    Gamma_L = 1.0
else:
    Gamma_L = (ZL - Z0) / (ZL + Z0)

# Primeiro degrau lançado
V0 = VS * Z0 / (RS + Z0)

# Simulação do diagrama de reflexões
t = np.linspace(0, t_sim, 1000)
V_load = np.zeros_like(t)

# Calcula tensão na carga com reflexões sucessivas
n_reflections = 10
for n in range(n_reflections + 1):
    # Tempo de chegada da n-ésima onda
    t_arrive = n * 2 * td
    if t_arrive <= t_sim:
        # Amplitude da onda
        if n == 0:
            V_wave = V0
        else:
            V_wave = V0 * (Gamma_L * Gamma_S) ** ((n-1)//2 + (1 if n%2==1 else 0))
            if n%2 == 0:
                V_wave *= Gamma_L
        
        # Aplica ao sinal
        mask = t >= t_arrive
        V_load[mask] += V_wave

plt.figure(figsize=(8, 4))
plt.plot(t*1e9, V_load, 'b-', linewidth=2)
plt.axhline(VS, color='r', linestyle='--', label=f'Tensão final = {VS}V')
plt.xlabel('Tempo (ns)')
plt.ylabel('Tensão na Carga (V)')
plt.title('Resposta no Tempo: Linha Aberta')
plt.legend()
plt.grid(True)
plt.show()
```

## Exemplo numérico passo a passo: cálculo de parâmetros de linha

**Problema**: Uma trilha de microstrip tem $L=250$ nH/m e $C=100$ pF/m. Calcule $Z_0$, $v_p$, e o atraso para 2 m.

**Solução passo a passo**:

1. Impedância característica: $Z_0=\sqrt{L/C}=\sqrt{250\times10^{-9}/100\times10^{-12}}=\sqrt{2500}=50\ \Omega$.

2. Velocidade de propagação: $v_p=1/\sqrt{LC}=1/\sqrt{250\times10^{-9}\cdot100\times10^{-12}}=1/\sqrt{2.5\times10^{-17}}=1/(5\times10^{-9})=2\times10^8$ m/s.

3. Atraso para 2 m: $t_d=l/v_p=2/(2\times10^8)=10$ ns.

> **Insight para Estudantes**: Note que $Z_0$ depende apenas da razão $L/C$, não dos valores absolutos. Isso significa que você pode mudar as dimensões físicas da trilha (que afetam $L$ e $C$ individualmente) mas manter $Z_0$ constante se a razão for preservada.

## Comparação entre linha ideal e rede LC segmentada

Uma linha sem perdas de atraso $t_d$ pode ser aproximada por $N$ seções com $L'=Z_0/v_p$ e $C'=1/(Z_0v_p)$. Cada seção possui $L'L/N$ e $C'L/N$. A aproximação só é confiável abaixo de uma fração da frequência de corte artificial da escada.

**Teorema de conservação em linha sem perdas.** Multiplicando as equações do telegrafista por $v$ e $i$, respectivamente, e somando,

$$
\frac{\partial}{\partial z}(vi)+
\frac{\partial}{\partial t}\left(\frac12Cv^2+\frac12Li^2\right)=0.
$$

O primeiro termo é divergência de potência; o segundo é a taxa de variação da energia elétrica e magnética por unidade de comprimento. Assim, uma linha ideal apenas transporta e armazena energia.

## TDR: extração de impedância

Para um degrau lançado em uma linha de referência $Z_0$, a reflexão medida $\Gamma(t)$ fornece

$$
Z(t)=Z_0\frac{1+\Gamma(t)}{1-\Gamma(t)}.
$$

### Exemplo

Um TDR de 50 Ω mede degrau incidente de 0,5 V e acréscimo refletido de 0,1 V. $\Gamma=0{,}2$ e $Z=75\,\Omega$. Se o evento aparece 4 ns após o plano de referência e $v_p=2\times10^8$ m/s, a descontinuidade está a $z=v_pt/2=0{,}40$ m; o fator dois representa ida e volta.

```python
import numpy as np
import matplotlib.pyplot as plt
t = np.linspace(0, 10e-9, 2000)
gamma = 0.2/(1 + np.exp(-(t-4e-9)/0.08e-9))
Z0 = 50
Z = Z0*(1+gamma)/(1-gamma)
plt.plot(t*1e9, Z); plt.xlabel('Tempo de ida e volta (ns)')
plt.ylabel('Impedância aparente (Ω)'); plt.grid(True, alpha=.3); plt.tight_layout()
```

## Laboratório SPICE — reflexão e terminação

```spice
Vstep src 0 PULSE(0 1 0 100p 100p 5n 10n)
Rsrc src in 10
Tline in 0 out 0 Z0=50 TD=2n
Rload out 0 100
.tran 5p 20n 0 20p
.print tran v(in) v(out)
.end
```

Para $Z_L=100\,\Omega$, espere $\Gamma_L=1/3$. Repita com 50 Ω, circuito aberto e curto. Depois use $R_{src}=50\,\Omega$ e confirme que a reflexão que retorna à fonte é absorvida. O passo máximo deve resolver a borda e o atraso.

## Referência principal

Síntese e desenvolvimento didático do Capítulo 4, "Transmission Lines and Signal Integrity", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 177–297.
