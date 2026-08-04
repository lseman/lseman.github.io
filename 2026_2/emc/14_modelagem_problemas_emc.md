# Modelagem de problemas EMC

> Este capítulo não reapresenta a física dos capítulos 6–12. Seu papel é transformar uma hipótese EMC em um modelo calculável, escolher a fidelidade necessária e validar o resultado contra medição ou simulação.

## Objetivos de aprendizagem

Ao final, você deve ser capaz de:

1. formular a pergunta que o modelo precisa responder;
2. escolher entre modelo concentrado, distribuído, modal ou de campo;
3. declarar entradas, saídas, condições de contorno e faixa de validade;
4. incluir parasitas e não linearidades que alterem a conclusão;
5. modelar ESD e surge sem misturar grandezas temporais e fasoriais;
6. validar dimensões, casos-limite, sensibilidade e incerteza.

## Sumário

1. [O modelo mais simples que preserva o mecanismo](#o-modelo-mais-simples-que-preserva-o-mecanismo)
2. [Escolha da representação](#escolha-da-representação)
3. [Modelo unificado por funções de transferência](#modelo-unificado-por-funções-de-transferência)
4. [Modelagem de filtros como rede de duas portas](#modelagem-de-filtros-como-rede-de-duas-portas)
5. [ESD: fonte, caminho e vítima no domínio do tempo](#esd-fonte-caminho-e-vítima-no-domínio-do-tempo)
6. [Surge, EFT e outros transientes](#surge-eft-e-outros-transientes)
7. [Validação e incerteza](#validação-e-incerteza)
8. [Exemplo integrado: buck e sensor](#exemplo-integrado-buck-e-sensor)
9. [Exercícios](#exercícios)
10. [Laboratório Python — ESD e caminho de acoplamento](#laboratório-python--esd-e-caminho-de-acoplamento)
11. [Laboratório Python — rede ABCD de filtro LC](#laboratório-python--rede-abcd-de-filtro-lc)
12. [Sensibilidade e Monte Carlo](#sensibilidade-e-monte-carlo)
13. [Laboratório SPICE — injeção transitória e proteção](#laboratório-spice--injeção-transitória-e-proteção)
14. [Entrega recomendada](#entrega-recomendada)

## O modelo mais simples que preserva o mecanismo

Um modelo EMC é uma representação orientada a uma decisão. Antes de escrever equações, complete:

| Pergunta | Registro mínimo |
|---|---|
| Qual decisão será tomada? | componente, geometria, mitigação ou margem |
| Qual é a saída? | tensão, corrente, campo, potência, erro ou probabilidade |
| Qual é a excitação? | forma de onda/espectro, impedância e estado operacional |
| Qual é o caminho? | retorno, parasitas, portas e condições de contorno |
| Qual banda e escala temporal? | $f_{min}$–$f_{max}$, $t_r$, duração, repetição |
| Como será validado? | medição, simulação de maior fidelidade ou caso analítico |

Um resultado numericamente preciso não compensa um mecanismo ausente. Comece com o diagrama fonte–caminho–vítima do [capítulo Caracterização e diagnóstico de casos EMC](02_caracterizacao_casos_emc.md).

## Escolha da representação

### Circuito concentrado

Use R, L, C e fontes controladas quando as dimensões relevantes forem eletricamente pequenas e a distribuição espacial não alterar a resposta. Uma triagem comum é comparar o atraso $t_d$ da interconexão com o tempo de subida $t_r$. Se $t_d$ deixa de ser pequeno diante de $t_r$, consulte o [capítulo Linhas de transmissão e integridade de sinal](07_linhas_transmissao_integridade_sinal.md).

Parasitas de terminais, encapsulamentos e montagem pertencem ao [capítulo Comportamento não ideal de componentes](06_componentes_nao_ideais.md). O modelo deve usar, quando relevante, ESR, ESL, capacitância paralela, perdas e dependência com frequência/temperatura — não apenas o valor nominal.

### Linha de transmissão

Use parâmetros distribuídos quando atraso, reflexão, terminação ou ondas acopladas determinarem a resposta. Declare $Z_0$, velocidade, perdas, comprimento, fonte e carga. Para linhas acopladas, matrizes por unidade de comprimento ou modos par/ímpar são preferíveis a uma única capacitância mútua; veja [crosstalk](09_crosstalk.md).

### Modelo modal

Em pares e cabos, modele DM e CM separadamente e inclua a conversão causada por assimetrias. A convenção de corrente deve permanecer explícita. Modelos e medições de condução estão no [capítulo Emissões conduzidas e suscetibilidade](10_emissoes_conduzidas_suscetibilidade.md); a consequência radiada está no [capítulo Emissões radiadas e suscetibilidade](11_emissoes_radiadas_suscetibilidade.md).

### Modelo de antena ou de campo

Use modelo de antena quando distribuição de corrente, polarização, ganho ou abertura efetiva importarem; veja o [capítulo Antenas](08_antenas.md). Use método de campo completo quando geometria tridimensional, materiais, cavidades, difração ou campo próximo não puderem ser reduzidos com segurança. A teoria de blindagem e aberturas pertence ao [capítulo Blindagem](12_blindagem.md).

## Modelo unificado por funções de transferência

Para um caso aproximadamente linear,

$$
Y(f)=S(f)\,H_c(f)\,H_v(f),
$$

onde $S$ é a fonte, $H_c$ o caminho e $H_v$ a resposta da vítima. O procedimento é:

1. obter $S(f)$ na grandeza realmente injetada;
2. calcular ou medir $H_c(f)$ entre portas bem definidas;
3. caracterizar o limiar ou a resposta $H_v(f)$;
4. reconstruir $y(t)$ se duração, pico ou janela temporal forem relevantes;
5. comparar com o critério funcional e sua incerteza.

### Quando o produto linear falha

O modelo precisa ser ampliado em presença de diodos de proteção, saturação de ferrite, *clamping*, *slew-rate limiting*, comutação dependente de estado, recuperação de firmware ou aquecimento. Nesses casos, use simulação transitória ou modelo por estados e valide cada regime.

## Modelagem de filtros como rede de duas portas

Não existe “atenuação do filtro” independente do circuito. Modele fonte, filtro, carga e retornos como uma rede completa. Para uma matriz ABCD,

$$
\begin{bmatrix}V_1\\I_1\end{bmatrix}=
\begin{bmatrix}A&B\\C&D\end{bmatrix}
\begin{bmatrix}V_2\\I_2\end{bmatrix}.
$$

Com $Z_S$ e $Z_L$ especificados, calcule a transferência e compare as condições com/sem filtro. Inclua ESR/ESL, capacitância parasita do indutor, acoplamento CM–DM, layout e impedância do retorno. Um filtro medido em 50 Ω pode ressoar ou atenuar menos na aplicação.

O comportamento dos componentes está no [capítulo Comportamento não ideal de componentes](06_componentes_nao_ideais.md), a topologia e medição conduzida no [capítulo Emissões conduzidas e suscetibilidade](10_emissoes_conduzidas_suscetibilidade.md), e a escolha de mitigação no [capítulo Minimização de interferências EMC](15_minimizacao_interferencias.md).

### Validação mínima de um filtro

- confira resposta sem perdas e com perdas;
- varie $Z_S$ e $Z_L$ em faixas plausíveis;
- procure ressonância e ganho de tensão/corrente;
- avalie CM e DM separadamente;
- compare perda de inserção calculada e medida com o mesmo arranjo.

## ESD: fonte, caminho e vítima no domínio do tempo

ESD é um transiente rápido e não deve ser reduzido ao produto entre pico temporal de corrente e uma impedância conhecida em uma única frequência.

### Forma de onda

Uma aproximação didática por dupla exponencial é

$$
i(t)=I_0\left(e^{-\alpha t}-e^{-\beta t}\right)u(t),\qquad \beta>\alpha.
$$

Os parâmetros devem ser ajustados ao nível, modo de descarga e edição normativa aplicáveis. Esse modelo simples pode não reproduzir simultaneamente frente, primeiro pico, vale e segundo pico; use uma forma multipulso ou dados medidos quando isso afetar a decisão.

### Caminho de acoplamento

No caso linear,

$$
V(f)=I_{ESD}(f)Z_{acopl}(f),\qquad
v(t)=\mathcal{F}^{-1}\{V(f)\}.
$$

$Z_{acopl}(f)$ inclui carcaça, juntas, planos, cabos, capacitâncias para chassi e referência local da vítima. A medição deve preservar a banda e evitar loops de ponta que dominem o resultado.

### Resposta funcional

Relacione o transiente interno a um mecanismo: cruzamento de limiar, queda da PDN, disparo de reset, corrupção de comunicação ou *latch-up*. Um pico interno menor após uma mudança é evidência útil; a aprovação depende do critério funcional e do ensaio do [capítulo Normas, Padronizações e Ensaios de EMC](04_normas_padronizacoes_ensaios.md).

## Surge, EFT e outros transientes

Uma forma de tensão por dupla exponencial pode ser escrita como

$$
v_s(t)=V_0\left(e^{-t/\tau_2}-e^{-t/\tau_1}\right)u(t),\qquad \tau_2>\tau_1.
$$

Os rótulos de forma de onda não bastam para definir o circuito. Inclua impedância do gerador, rede de acoplamento/desacoplamento, terminação e estado do equipamento. Para elementos de proteção, modele curva $I$–$V$, resistência dinâmica, capacitância, indutância de conexão, energia e tolerâncias.

Para EFT, a repetição dos pulsos e o acúmulo de estado podem ser tão importantes quanto um pulso isolado. Para surge, energia e coordenação entre estágios de proteção costumam dominar.

## Validação e incerteza

### Verificações obrigatórias

1. **Dimensões:** cada equação fecha em unidades SI.
2. **Casos-limite:** a resposta tende ao comportamento físico esperado.
3. **Conservação/passividade:** uma rede passiva não cria energia.
4. **Sensibilidade:** varie parâmetros incertos e identifique os dominantes.
5. **Convergência:** reduza passo temporal/malha e compare.
6. **Referência:** confronte ao menos um ponto com medição ou solução conhecida.

### Orçamento de incerteza

Separe variabilidade física, tolerâncias, calibração, repetibilidade, posicionamento e erro de modelo. Quando uma distribuição probabilística não for justificável, apresente intervalos e cenários. Uma margem menor que a incerteza combinada não é uma conclusão robusta.

## Exemplo integrado: buck e sensor

**Pergunta:** qual mudança reduz mais a perturbação na entrada do ADC: diminuir $dv/dt$, reduzir capacitância parasita ou filtrar a vítima?

1. Modele a corrente injetada por $i_c(t)=C_p\,dv/dt$.
2. Obtenha $Z_{ret}(f)$ do caminho até a referência do sensor.
3. Inclua o filtro de entrada e o instante de amostragem do ADC.
4. Varie $C_p$, tempo de subida, ESR/ESL e impedância de retorno.
5. Compare a previsão com medida simultânea do nó de comutação e do erro.

O resultado não deve ser apenas uma curva: apresente a faixa em que o modelo é válido, o parâmetro dominante e a intervenção que diferencia hipóteses concorrentes.

## Exercícios

**E.1** Um capacitor de 100 nF tem ESR de $30\,m\Omega$ e ESL de $1\,nH$. Escreva $Z(f)$, estime a autorressonância e indique o capítulo-dono da teoria física.

**E.2** Uma interconexão tem atraso de 2 ns e a borda varia entre 0,5 ns e 20 ns. Compare a adequação dos modelos concentrado e distribuído.

**E.3** Desenhe as portas de uma rede de duas portas para um filtro de alimentação e liste quatro parasitas de layout ausentes no esquema ideal.

**E.4** Explique por que $i_{pico}Z(100\,MHz)$ não é um modelo temporal de ESD.

**E.5** Monte um plano de validação para o caso do buck, incluindo caso-limite, varredura de sensibilidade e medição discriminante.

**E.6** Um modelo reduzido e uma simulação 3D discordam 8 dB. Liste testes para separar erro de parâmetro, condição de contorno, discretização e mecanismo ausente.

### Respostas orientativas

**E.1** $Z=ESR+j\omega ESL+1/(j\omega C)$ e $f_{SR}\approx1/(2\pi\sqrt{ESL\,C})\approx15{,}9\,MHz$. A teoria está no [capítulo Comportamento não ideal de componentes](06_componentes_nao_ideais.md).

**E.2** Com borda de 0,5 ns, $t_d/t_r=4$ e o modelo distribuído é indispensável. Com 20 ns, $t_d/t_r=0{,}1$ pode permitir aproximação concentrada, desde que a margem desejada e as descontinuidades sejam avaliadas.

**E.4** O pico pertence ao tempo e $Z(100\,MHz)$ é um ponto fasorial. É preciso multiplicar os espectros em toda a banda e transformar de volta, ou resolver o circuito transitório.

## Laboratório Python — ESD e caminho de acoplamento

O exemplo constrói uma corrente de dupla exponencial, calcula sua FFT, aplica uma impedância de acoplamento $R+j\omega L$ e retorna ao tempo. Ele demonstra por que um único valor de impedância não basta.

```python
import numpy as np
import matplotlib.pyplot as plt

dt, tmax = 20e-12, 200e-9
t = np.arange(0, tmax, dt)
alpha, beta = 1/35e-9, 1/0.8e-9
shape = np.exp(-alpha*t) - np.exp(-beta*t)
i = 30.0*shape/shape.max()              # 30 A de pico didático

freq = np.fft.rfftfreq(t.size, dt)
I = np.fft.rfft(i)
Rpath, Lpath = 40e-3, 3e-9
Z = Rpath + 1j*2*np.pi*freq*Lpath
v = np.fft.irfft(I*Z, n=t.size)

fig, ax = plt.subplots(2, 1, figsize=(9, 6), sharex=True)
ax[0].plot(t*1e9, i); ax[0].set_ylabel('Corrente (A)')
ax[1].plot(t*1e9, v); ax[1].set_ylabel('Tensão (V)')
ax[1].set_xlabel('Tempo (ns)')
for a in ax: a.grid(True, alpha=.3)
plt.tight_layout()
```

**Casos-limite:** com $L=0$, confirme $v(t)=Ri(t)$; com $R=0$, compare $v(t)$ a $L\,di/dt$. O pico negativo após a frente não é necessariamente uma falha numérica: decorre da derivada durante a cauda.

## Laboratório Python — rede ABCD de filtro LC

```python
import numpy as np
import matplotlib.pyplot as plt

f = np.logspace(3, 9, 1200)
w = 2*np.pi*f
Zs, Zl = 5.0, 20.0
L, rL, cp = 4.7e-6, 80e-3, 8e-12
C, esr, esl = 220e-9, 30e-3, 1.2e-9
Zseries = 1/(1/(rL + 1j*w*L) + 1j*w*cp)
Zcap = esr + 1j*w*esl + 1/(1j*w*C)
Yshunt = 1/Zcap

# Cascata: elemento série seguido de elemento shunt
A = 1 + Zseries*Yshunt
B = Zseries
Cmat = Yshunt
D = np.ones_like(f)
H = Zl/(A*Zl + B + Zs*(Cmat*Zl + D))
H0 = Zl/(Zs + Zl)
IL = 20*np.log10(np.abs(H0/H))

plt.semilogx(f, IL)
plt.axhline(0, color='k', lw=.8)
plt.xlabel('Frequência (Hz)'); plt.ylabel('Perda de inserção (dB)')
plt.title('Filtro LC real entre impedâncias não normalizadas')
plt.grid(True, which='both', alpha=.3); plt.tight_layout()
```

Varra $Z_S$ e $Z_L$. Regiões com perda de inserção negativa indicam amplificação por ressonância/mismatch, não criação de energia.

## Sensibilidade e Monte Carlo

Para uma saída $y=g(x_1,\ldots,x_n)$, a sensibilidade normalizada local é

$$
S_{x_i}^{y}=\frac{x_i}{y}\frac{\partial y}{\partial x_i}.
$$

Use derivadas locais para triagem e Monte Carlo quando tolerâncias, não linearidades ou distribuições tornarem a propagação linear inadequada. Reporte percentis e número de amostras; não apresente apenas a melhor curva.

## Laboratório SPICE — injeção transitória e proteção

```spice
* Pulso de corrente didatico em porta protegida
Iinj port 0 PWL(0 0 0.8n 30 5n 12 40n 2 150n 0)
Ltrace port clamp 3n
Rtrace port clamp 50m
Dprot clamp 0 DTVS
Cinput clamp 0 20p
Rinput clamp 0 100k
.model DTVS D(BV=6 IBV=1m RS=0.2 CJO=200p)
.tran 20p 200n 0 50p
.print tran v(port) v(clamp)
.end
```

O modelo genérico não representa uma TVS comercial. Varra indutância da conexão e capacitância de junção; compare tensão na porta e no nó protegido. Verifique energia no dispositivo por integração de $v(t)i(t)$ quando o simulador oferecer medida adequada.

## Entrega recomendada

Para cada modelo, entregue: pergunta, diagrama de portas, equações, parâmetros e fontes, faixa de validade, hipóteses, resultado, sensibilidade, validação e decisão. Código sem essa documentação não constitui um modelo auditável.
