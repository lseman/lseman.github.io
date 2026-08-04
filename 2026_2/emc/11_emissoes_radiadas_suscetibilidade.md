# Emissões radiadas e suscetibilidade

Emissão radiada é a produção não intencional de campo eletromagnético; suscetibilidade radiada é a resposta do equipamento a um campo incidente. Para fios e trilhas eletricamente curtos, dois modelos explicam grande parte dos problemas: laço de corrente diferencial e condutor excitado por corrente de modo comum.

## Sumário

1. [Modo diferencial e modo comum](#modo-diferencial-e-modo-comum)
2. [Modelo de emissão diferencial](#modelo-de-emissão-diferencial)
3. [Modelo de emissão de modo comum](#modelo-de-emissão-de-modo-comum)
4. [Medição e sondas de corrente](#medição-e-sondas-de-corrente)
5. [Suscetibilidade de fios e trilhas](#suscetibilidade-de-fios-e-trilhas)
6. [Cabos blindados e impedância de transferência](#cabos-blindados-e-impedância-de-transferência)
7. [Ensaios radiados](#ensaios-radiados)
8. [Diagnóstico pelo efeito dominante](#diagnóstico-pelo-efeito-dominante)
9. [Teoremas e derivações](#teoremas-e-derivações)
10. [Exemplo resolvido — Comparação de mitigação](#exemplo-resolvido--comparação-de-mitigação)
11. [Exemplo resolvido — Corrente de modo comum](#exemplo-resolvido--corrente-de-modo-comum)
12. [Insight: conversão de modo é frequentemente o elo oculto](#insight-conversão-de-modo-é-frequentemente-o-elo-oculto)
13. [Exercícios](#exercícios)
14. [Respostas selecionadas](#respostas-selecionadas)
15. [Exemplo numérico adicional — Emissão diferencial vs. comum](#exemplo-numérico-adicional--emissão-diferencial-vs-comum)
16. [Código Python — Comparação de emissão diferencial e comum vs. frequência](#código-python--comparação-de-emissão-diferencial-e-comum-vs-frequência)
17. [Exemplo numérico adicional — Conversão de dB para campo elétrico](#exemplo-numérico-adicional--conversão-de-db-para-campo-elétrico)
18. [Orçamento de emissão: da corrente ao campo](#orçamento-de-emissão-da-corrente-ao-campo)
19. [Código Python — orçamento DM/CM e limite](#código-python--orçamento-dmcm-e-limite)
20. [Suscetibilidade por altura efetiva](#suscetibilidade-por-altura-efetiva)
21. [Reflexão no solo: modelo de dois raios](#reflexão-no-solo-modelo-de-dois-raios)
22. [Referência principal](#referência-principal)

## Modo diferencial e modo comum

### Por que o modo comum domina a emissão radiada?

No modo diferencial, correntes iguais e opostas percorrem ida e retorno. O par irradia como pequeno laço, e a emissão aumenta com a área. No modo comum, os condutores carregam correntes no mesmo sentido em relação ao ambiente; cabos e estruturas se comportam como monopolos ou dipolos. Embora $I_{CM}$ possa ser muito menor que $I_{DM}$, o comprimento efetivo e a falta de cancelamento frequentemente fazem o modo comum dominar.

Conversão de modo ocorre por assimetria: impedâncias diferentes, conectores, descontinuidade no plano, capacitâncias desbalanceadas ou acoplamento desigual ao chassi.

> **Insight para Estudantes**: Imagine um cabo de 1 m com 10 mA de modo comum e um laço de 1 cm² com 100 mA de modo diferencial. O modo comum tem comprimento 100 vezes maior, enquanto o diferencial tem área 10.000 vezes menor. Mesmo com corrente 10 vezes menor, o modo comum pode irradiar mais porque o comprimento efetivo como antena é muito maior.

## Modelo de emissão diferencial

Para um pequeno laço de área $A$, a intensidade de campo distante cresce aproximadamente como

$$E_{DM}\propto \frac{f^2 I_{DM}A}{r}.$$

Logo, reduzir o tempo de subida, a corrente e a área do laço é decisivo. Em PCB, um plano de referência contínuo mantém o retorno próximo à trilha. Fendas, mudanças de camada sem via de retorno e conectores mal pinados aumentam a área.

### Derivação do campo do pequeno laço

**Teorema**: Para um laço de área $A$ no plano $xy$, com corrente fasorial $\hat{I}$ e momento magnético $\hat{m}=\hat{I}A\hat{z}$, o campo elétrico no campo distante é

$$\hat{E}_\phi=j\frac{\omega\mu_0\hat{m}}{4\pi}\frac{\beta_0}{r}\sin\theta e^{-j\beta_0r}=j\frac{f^2\mu_0\hat{I}A}{v_0}\frac{\sin\theta}{r}e^{-j2\pi r/\lambda}.$$

**Prova**: A partir dos campos do dipolo magnético, retém-se o termo $1/r$ em $\hat{E}_\phi$, que é proporcional a $\beta_0^2\hat{m}/r$. Como $\beta_0=2\pi f/v_0$, resulta a expressão. $\square$

## Modelo de emissão de modo comum

Um fio eletricamente curto de comprimento efetivo $l$ apresenta, em primeira aproximação,

$$E_{CM}\propto \frac{f I_{CM}l}{r}.$$

Próximo da ressonância, a aproximação de fio curto deixa de valer e a emissão pode aumentar fortemente. O controle exige reduzir a tensão que gera modo comum, equilibrar a interface, fornecer retorno de alta frequência e bloquear ou desviar corrente junto ao conector.

## Medição e sondas de corrente

Uma sonda de corrente tipo clamp mede corrente no cabo sem interrompê-lo. Abraçar todos os condutores de ida e retorno cancela idealmente o modo diferencial e revela a corrente líquida de modo comum. Abraçar um só condutor mede a combinação dos modos.

A conversão da leitura do receptor para corrente usa a impedância de transferência calibrada da sonda. Saturação, posição, corrente de baixa frequência e carga do instrumento devem ser verificadas. A sonda é excelente para correlação e pré-conformidade; o ensaio final segue o método normativo.

## Suscetibilidade de fios e trilhas

Um campo elétrico incidente induz tensão ao longo de condutores; um campo magnético variável induz tensão em laços:

$$V_{ind}=-\frac{d\Phi}{dt}.$$

A resposta depende de comprimento, área, orientação, polarização, terminação e ressonâncias. O campo acoplado pode entrar em modo comum e converter-se em diferencial na carga, ou acoplar diretamente como tensão diferencial.

Reduções típicas:

- diminuir área do laço e manter retorno adjacente;
- usar pares balanceados e boa simetria;
- filtrar no ponto de entrada;
- terminar a blindagem em baixa impedância ao chassi;
- limitar e filtrar antes da função sensível;
- evitar comprimentos ressonantes e pigtails.

## Cabos blindados e impedância de transferência

A qualidade de uma blindagem de cabo é descrita por sua impedância de transferência superficial:

$$Z_T=\frac{V_{interno}/l}{I_{blindagem}},$$

em $\Omega$/m. Menor $Z_T$ implica menor tensão interna para dada corrente externa. Trança, cobertura, material, conectores e terminações influenciam o resultado. Uma blindagem excelente ligada por um pigtail longo pode apresentar alta indutância e perder eficácia em RF.

## Ensaios radiados

Em emissão, distância, polarização, altura, azimute, detector e ambiente são controlados. Em imunidade, busca-se uma região de campo uniforme e monitora-se o critério funcional durante a varredura. Cabos devem ocupar a configuração prescrita, pois são parte da antena.

Resultados perto do limite devem incluir incerteza e variabilidade. Uma alteração que melhora uma orientação pode piorar outra; por isso a validação deve cobrir toda a banda e configuração de pior caso.

## Diagnóstico pelo efeito dominante

1. Correlacionar picos com fontes internas.
2. Medir corrente de modo comum nos cabos.
3. Fazer varredura de campo próximo sobre PCB e interfaces.
4. Alterar temporariamente área de laço, terminação de blindagem ou ferrite.
5. Observar qual intervenção muda significativamente o resultado.
6. Implementar a solução na fonte e repetir o ensaio completo.

## Teoremas e derivações

**Proposição**: Para um pequeno laço, reduzir todas as dimensões lineares por um fator $k$, mantendo corrente e frequência, reduz o campo distante por $k^2$.

**Prova**: O campo do pequeno laço é proporcional à área $A$. Se cada dimensão é multiplicada por $k$, então $A'=k^2A$ e, portanto, $E'=k^2E$. $\square$

**Proposição**: Um par perfeitamente balanceado, observado a distância muito maior que sua separação, cancela a primeira contribuição de dipolo elétrico associada às correntes diferenciais.

**Prova**: Os campos produzidos por correntes iguais e opostas têm praticamente a mesma amplitude e fase no observador distante. Sua soma de primeira ordem se anula; resta a contribuição ligada à separação finita, equivalente ao pequeno laço. Assimetrias e modo comum destroem o cancelamento. $\square$

## Exemplo resolvido — Comparação de mitigação

Um laço retangular de 40 mm por 20 mm é reduzido para 20 mm por 10 mm. A área passa de 800 para 200 mm². Pelo modelo de pequeno laço,

$$\frac{E_2}{E_1}=\frac{A_2}{A_1}=0{,}25,$$

uma redução ideal de

$$20\log_{10}(0{,}25)=-12{,}0\ \text{dB}.$$

A estimativa vale se corrente, frequência, distância e regime de pequeno laço permanecerem iguais.

## Exemplo resolvido — Corrente de modo comum

Uma sonda possui impedância de transferência $Z_T=1\ \Omega$ na frequência do pico. O receptor mede 54 dBµV:

$$V=10^{54/20}\ \mu\text{V}=501\ \mu\text{V},$$

$$I_{CM}=\frac{V}{Z_T}=501\ \mu\text{A}.$$

Se uma mitigação reduz a leitura para 40 dBµV, a corrente cai para 100 µA, melhoria de 14 dB.

## Insight: conversão de modo é frequentemente o elo oculto

Um driver diferencial pode ser eletricamente silencioso no modelo ideal e ainda excitar cabo em modo comum. Diferença de capacitância para chassi, skew, impedâncias desiguais e pinagem assimétrica convertem parte do sinal. Por isso, medir apenas a corrente diferencial ou apenas o espectro do driver pode não revelar o mecanismo radiador.

## Lista de Exercícios Propostos

**E.1** Compare a dependência em frequência dos modelos curtos de emissão diferencial e comum.

**E.2** Explique como uma fenda no plano de retorno aumenta emissão.

**E.3** Descreva como medir corrente de modo comum com uma sonda clamp.

**E.4** Por que uma corrente de modo comum pequena pode dominar uma corrente diferencial maior?

**E.5** Explique por que a conexão do conector à blindagem pode dominar o desempenho de um cabo blindado.

**E.6** Um laço tem área reduzida de 12 para 3 cm². Estime a redução de campo em dB.

**E.7** Uma sonda com $Z_T=0{,}5\ \Omega$ produz 200 µV no receptor. Qual é a corrente no cabo?

**E.8** Cite três assimetrias que convertem modo diferencial em modo comum.

## Gabarito

**E.6** Redução de campo em dB para laço com área reduzida de 12 para 3 cm².

Razão de áreas: $A_2/A_1=3/12=0{,}25$.

A emissão de campo para um pequeno laço é proporcional à área: $E\propto A$.

Redução em dB: $10\log_{10}(0{,}25)=10\cdot(-0{,}602)=-6{,}02$ dB para potência, ou $20\log_{10}(0{,}25)=-12{,}04$ dB para campo.

Resposta: Razão 0,25, portanto $-12{,}0$ dB.

**E.7** Corrente no cabo com sonda de $Z_T=0{,}5\ \Omega$ produzindo 200 µV.

Equação: $I=V/Z_T$.

$I=200\ \mu\text{V}/0{,}5\ \Omega=400\ \mu\text{A}$.

Resposta: $I=400\ \mu\text{A}$.

**E.8** Três assimetrias que convertem modo diferencial em modo comum.

1. Capacitâncias desiguais para chassi entre os condutores de ida e volta.
2. Impedâncias de saída diferentes nos drivers de ida e volta.
3. Pinagem/conector assimétrico, skew (diferenças de tempo de propagação) ou terminação desbalanceada.

Outros exemplos: diferenças de geometria de trilhas, desbalanceamento de componentes parasitas.

## Exemplo numérico adicional — Emissão diferencial vs. comum

Laço diferencial: $A=20\times10\ \text{mm}^2=2\times10^{-4}\ \text{m}^2$, $I_{DM}=100$ mA, $f=50$ MHz.
Campo diferencial: $E_{DM}\propto f^2 I_{DM} A/r$.

Cabo comum: $l=0.5$ m, $I_{CM}=10$ mA, $f=50$ MHz.
Campo comum: $E_{CM}\propto f I_{CM} l/r$.

Razão $E_{DM}/E_{CM}\propto (f I_{DM} A)/(I_{CM} l)$.
Com os valores: $(50\times10^6\cdot0.1\cdot2\times10^{-4})/(0.01\cdot0.5)=200$.
O modo diferencial domina para este laço pequeno, mas se a área aumentar ou $I_{CM}$ aumentar, o comum pode dominar.

## Código Python — Comparação de emissão diferencial e comum vs. frequência

```python
import numpy as np
import matplotlib.pyplot as plt

f = np.logspace(6, 9, 100)  # 1 MHz a 1 GHz

# Parâmetros
I_DM = 0.1      # 100 mA
A = 2e-4        # 20x10 mm^2 em m^2
I_CM = 0.01     # 10 mA
l = 0.5         # 0.5 m

# Campos proporcionais
E_DM_prop = (f**2) * I_DM * A
E_CM_prop = f * I_CM * l

plt.figure(figsize=(8, 5))
plt.semilogx(f, E_DM_prop, 'b-', linewidth=2, label='E_DM proporcional')
plt.semilogx(f, E_CM_prop, 'r-', linewidth=2, label='E_CM proporcional')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Campo Proporcional')
plt.title('Emissão Diferencial vs Comum vs Frequência')
plt.legend()
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Exemplo numérico adicional — Conversão de dB para campo elétrico

**Problema**: Um receptor mede 54 dBµV com uma antena de fator 18 dB/m. Qual é o campo elétrico?

**Solução**:

Fator de antena: $AF=18$ dB/m = fator linear de $10^{18/20}=8.91$ V/m por V.

Tensão medida: $V=10^{54/20}$ µV = $501$ µV = $0.501$ mV.

Campo elétrico: $E=V\cdot AF=0.501\times10^{-3}\cdot8.91=4.46\times10^{-3}$ V/m = $4.46$ mV/m.

Em dBµV/m: $E_{dB\mu V/m}=V_{dB\mu V}+AF_{dB/m}=54+18=72$ dBµV/m.

> **Insight para Estudantes**: O fator de antena converte tensão medida no receptor para campo elétrico incidente. Ele depende da frequência, do tipo de antena, e da calibração. Sempre verifique se o fator de antena inclui perdas de cabo e ganhos de pré-amplificador.

## Orçamento de emissão: da corrente ao campo

Para um pequeno loop diferencial de área $A$ e corrente senoidal RMS $I_{DM}$, uma estimativa de campo distante máximo é

$$
E_{DM}\approx\frac{\eta_0\beta^2 I_{DM}A}{4\pi r}.
$$

Para um condutor curto de comprimento efetivo $l_{eff}$ com corrente CM,

$$
E_{CM}\approx\frac{\eta_0\beta I_{CM}l_{eff}}{4\pi r}.
$$

Logo,

$$
\frac{E_{CM}}{E_{DM}}\approx
\frac{I_{CM}}{I_{DM}}\frac{l_{eff}}{\beta A}.
$$

**Corolário.** Como $\beta A$ pode ser muito menor que o comprimento efetivo do cabo, uma corrente CM dezenas ou centenas de vezes menor pode dominar a emissão.

### Exemplo numérico

Em 100 MHz, tome $A=4\,\text{cm}^2$, $I_{DM}=20\,\text{mA}$, $l_{eff}=0{,}5\,\text{m}$ e $I_{CM}=50\,\mu\text{A}$. A 3 m, os modelos fornecem aproximadamente $E_{DM}=0{,}74\,\text{mV/m}$ e $E_{CM}=2{,}62\,\text{mV/m}$; apesar de $I_{CM}/I_{DM}=1/400$, o cabo domina.

## Código Python — orçamento DM/CM e limite

```python
import numpy as np
import matplotlib.pyplot as plt

eta0, c, r = 376.730313, 299_792_458.0, 3.0
f = np.logspace(6, 9, 600)
beta = 2*np.pi*f/c
Idm, Icm = 20e-3, 50e-6
A, leff = 4e-4, 0.5

Edm = eta0*beta**2*Idm*A/(4*np.pi*r)
Ecm = eta0*beta*Icm*leff/(4*np.pi*r)
to_dBuVm = lambda E: 20*np.log10(np.maximum(E, 1e-30)/1e-6)

plt.semilogx(f, to_dBuVm(Edm), label='loop DM')
plt.semilogx(f, to_dBuVm(Ecm), label='cabo CM')
plt.xlabel('Frequência (Hz)'); plt.ylabel('Campo (dBµV/m)')
plt.title('Orçamento simplificado de emissão a 3 m')
plt.grid(True, which='both', alpha=.3); plt.legend(); plt.tight_layout()
```

**Limites:** ambos os modelos exigem fontes eletricamente curtas, campo distante, corrente conhecida e máximo angular. Cabos ressonantes, plano de terra e ambiente de ensaio exigem modelo ou medição mais completos.

## Suscetibilidade por altura efetiva

Para uma antena receptora linear,

$$
V_{oc}=\vec E\cdot\vec h_{eff},\qquad
V_L=V_{oc}\frac{Z_L}{Z_A+Z_L}.
$$

### Exemplo resolvido

Um campo de $10\,\text{V/m}$ incide alinhado a um cabo com $h_{eff}=0{,}12\,\text{m}$. Se $Z_A=150\,\Omega$ e $Z_L=50\,\Omega$, então $V_{oc}=1{,}2\,\text{V}$ e $V_L=0{,}30\,\text{V}$. O cálculo identifica o nível na porta; a falha ainda depende do filtro, da conversão de modo e do limiar funcional.

## Reflexão no solo: modelo de dois raios

Em campo aberto, a antena recebe a soma fasorial do caminho direto e do refletido:

$$
E=E_0\left(\frac{e^{-j\beta r_1}}{r_1}+\Gamma\frac{e^{-j\beta r_2}}{r_2}\right).
$$

Esse modelo explica máximos e mínimos com altura e frequência. Em ensaio, a varredura de altura busca o máximo, não uma distância que obedeça apenas a $1/r$.

## Referência principal

Síntese do Capítulo 8, "Radiated Emissions and Susceptibility", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 503–556.
