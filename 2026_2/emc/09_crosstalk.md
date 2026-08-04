# Crosstalk

*Crosstalk* é o acoplamento indesejado de um circuito agressor para um circuito vítima. Em interconexões, ele resulta principalmente de capacitância mútua, indutância mútua e impedância de retorno compartilhada. A análise correta inclui os condutores de retorno e, quando o atraso é relevante, trata o conjunto como uma linha de transmissão multcondutora.

## Sumário

1. [Linha de três condutores](#linha-de-três-condutores)
2. [Acoplamento capacitivo](#acoplamento-capacitivo)
3. [Acoplamento indutivo](#acoplamento-indutivo)
4. [NEXT e FEXT](#next-e-fext)
5. [Modelo concentrado](#modelo-concentrado)
6. [Impedância comum](#impedância-comum)
7. [Fios blindados](#fios-blindados)
8. [Pares trançados e balanceamento](#pares-trançados-e-balanceamento)
9. [Regras de layout](#regras-de-layout)
10. [Resultados formais](#resultados-formais)
11. [Exemplo resolvido — Acoplamento capacitivo](#exemplo-resolvido--acoplamento-capacitivo)
12. [Exemplo resolvido — Acoplamento indutivo](#exemplo-resolvido--acoplamento-indutivo)
13. [Exemplo conceitual — Duração de NEXT](#exemplo-conceitual--duração-de-next)
14. [Insight: blindar sem controlar o retorno pode transferir o problema](#insight-blindar-sem-controlar-o-retorno-pode-transferir-o-problema)
15. [Exercícios](#exercícios)
16. [Respostas selecionadas](#respostas-selecionadas)
17. [Exemplo numérico adicional — NEXT e FEXT vs. comprimento](#exemplo-numérico-adicional--next-e-fext-vs-comprimento)
18. [Código Python — NEXT e FEXT vs. frequência](#código-python--next-e-fext-vs-frequência)
19. [Exemplo numérico adicional — Crosstalk por impedância comum](#exemplo-numérico-adicional--crosstalk-por-impedância-comum)
20. [Modos par e ímpar em linhas acopladas](#modos-par-e-ímpar-em-linhas-acopladas)
21. [Simulação temporal de NEXT e FEXT](#simulação-temporal-de-next-e-fext)
22. [Estudo paramétrico de layout](#estudo-paramétrico-de-layout)
23. [Laboratório SPICE — acoplamento concentrado entre trilhas](#laboratório-spice--acoplamento-concentrado-entre-trilhas)
24. [Referência principal](#referência-principal)

## Linha de três condutores

### Por que precisamos de três condutores para crosstalk?

O modelo mínimo possui agressor, vítima e referência. Tensões e correntes são relacionadas por matrizes de parâmetros por unidade de comprimento:

$$\frac{\partial\mathbf V}{\partial z}=-\mathbf L\frac{\partial\mathbf I}{\partial t},\qquad
\frac{\partial\mathbf I}{\partial z}=-\mathbf C\frac{\partial\mathbf V}{\partial t}.$$

Os termos diagonais representam parâmetros próprios; os termos fora da diagonal representam acoplamento. Em meio homogêneo ideal, as relações entre $\mathbf L$ e $\mathbf C$ favorecem cancelamentos específicos. Em microstrip, o meio é não homogêneo e as velocidades modais diferem, alterando o crosstalk de extremidade distante.

> **Insight para Estudantes**: Com apenas dois condutores, não há "vítima" — todos os campos gerados pela corrente no condutor 1 retornam pelo condutor 2. É preciso um terceiro condutor (referência ou vítima) para que haja acoplamento indesejado entre circuitos diferentes.

## Acoplamento capacitivo

Uma tensão variável no agressor injeta corrente na vítima pela capacitância mútua:

$$i_C=C_m\frac{dv_A}{dt}.$$

O efeito aumenta com $C_m$, taxa de variação e impedância da vítima. Aumentar espaçamento, aproximar o plano de referência e reduzir o comprimento paralelo diminuem a capacitância mútua relativa.

## Acoplamento indutivo

A corrente variável no agressor produz fluxo que atravessa o laço da vítima:

$$v_M=M\frac{di_A}{dt}.$$

O acoplamento diminui quando ida e retorno de cada circuito estão próximos e as áreas de laço são pequenas. Uma blindagem elétrica isolada não elimina necessariamente o acoplamento magnético de baixa frequência.

## NEXT e FEXT

O ruído observado na extremidade próxima é chamado NEXT; na extremidade distante, FEXT. As contribuições capacitiva e indutiva viajam em direções específicas e podem somar ou cancelar. Em linhas homogêneas, o FEXT ideal pode cancelar; em estruturas não homogêneas, a diferença entre acoplamento capacitivo e indutivo e a diferença de velocidades produzem FEXT residual.

A duração do pulso de NEXT está ligada a duas vezes o atraso da região acoplada. O FEXT tende a aparecer como pulsos associados às bordas e cresce com comprimento de acoplamento enquanto a aproximação linear for válida.

## Modelo concentrado

Quando o comprimento acoplado é pequeno diante do comprimento elétrico da borda, o trecho pode ser aproximado por $C_m$ e $M$. Esse modelo mostra diretamente as dependências em $dv/dt$ e $di/dt$, mas não representa propagação, múltiplas reflexões nem diferenças de velocidade. Para linhas longas, use modelo MTL ou simulação apropriada.

## Impedância comum

Se agressor e vítima compartilham retorno com impedância $Z_g$, a corrente do agressor produz

$$V_g=Z_g I_A,$$

que aparece como ruído na vítima. Esse mecanismo pode dominar mesmo com pequena proximidade geométrica. Planos contínuos, vias de retorno, desacoplamento local e separação de correntes de potência e sinais sensíveis reduzem a impedância compartilhada.

## Fios blindados

Uma blindagem intercepta corrente capacitiva e fornece caminho de retorno, mas seu desempenho depende da impedância de transferência e das terminações. Em RF, a conexão de 360° ao chassi costuma apresentar menor indutância que um pigtail. Ligar a blindagem em uma ou ambas as extremidades é uma decisão de banda e arquitetura; a frase "aterrar de um lado" não é regra universal.

## Pares trançados e balanceamento

A torção alterna a geometria e reduz a área efetiva dos laços. Em um par balanceado, campos externos tendem a induzir modo comum, rejeitado pelo receptor conforme sua CMRR. O benefício depende de simetria de impedância para o ambiente, consistência da torção e qualidade da terminação. Desbalanceamento converte modo comum em diferencial.

## Regras de layout

- Reduzir o paralelismo entre agressor e vítima.
- Aumentar espaçamento e manter cada sinal perto de seu plano de referência.
- Evitar cruzar fendas no plano.
- Alternar direções de roteamento em camadas adjacentes quando possível.
- Colocar via de retorno ao lado da via de sinal em mudanças de camada.
- Controlar bordas na fonte e terminar linhas para reduzir reflexões.
- Separar nós de alto $dv/dt$ e laços de alto $di/dt$ de entradas sensíveis.
- Verificar pinagem de conectores: intercalar retornos pode reduzir laços e acoplamento.

## Resultados formais

**Teorema**: No modelo concentrado e linear, a tensão de crosstalk é a soma das contribuições capacitiva, indutiva e de impedância comum.

**Prova**: Pela superposição, anulam-se sucessivamente as fontes independentes mantendo os elementos de acoplamento. A capacitância mútua injeta $C_mdv_A/dt$; a indutância mútua produz $Mdi_A/dt$; a impedância comum produz $Z_gI_A$. Como o circuito é linear, a resposta total é a soma das três respostas. $\square$

**Proposição**: Se o agressor é excitado por uma rampa com mesma amplitude, dobrar o tempo de subida reduz pela metade as fontes capacitivas e indutivas do modelo concentrado.

**Prova**: Para rampa linear, $dv/dt=\Delta V/t_r$ e $di/dt=\Delta I/t_r$. Ambas são inversamente proporcionais a $t_r$. $\square$

## Exemplo resolvido — Acoplamento capacitivo

Uma capacitância mútua de 0,5 pF recebe uma borda de 3,3 V em 1 ns:

$$i_C=C_m\frac{\Delta V}{t_r}
=0{,}5\times10^{-12}\frac{3{,}3}{10^{-9}}
=1{,}65\ \text{mA}.$$

Se a vítima parece resistiva com 100 Ω durante a borda, a primeira estimativa é

$$V_N\approx i_CR=165\ \text{mV}.$$

O resultado ignora propagação, capacitância própria e terminação distribuída; serve como teste de ordem de grandeza.

## Exemplo resolvido — Acoplamento indutivo

Com $M=4$ nH e corrente variando 0,6 A em 2 ns:

$$V_M=M\frac{\Delta I}{t_r}=4\times10^{-9}\frac{0{,}6}{2\times10^{-9}}=1{,}2\ \text{V}.$$

Reduzir a área compartilhada ou aproximar o retorno do agressor reduz $M$.

## Exemplo conceitual — Duração de NEXT

Se a região paralela tem atraso de 300 ps, contribuições geradas ao longo dela chegam à extremidade próxima durante aproximadamente $2t_d=600$ ps. A amplitude e a forma exatas dependem dos coeficientes de acoplamento e terminações.

## Insight: blindar sem controlar o retorno pode transferir o problema

Uma blindagem ligada por caminho indutivo pode diminuir acoplamento elétrico e simultaneamente criar impedância comum ou novo laço magnético. A pergunta correta não é "há blindagem?", mas "por onde flui cada corrente induzida e onde ela fecha?".

## Lista de Exercícios Propostos

**E.1** Uma capacitância mútua de 0,5 pF recebe uma borda de 3,3 V em 1 ns. Estime a corrente de deslocamento média durante a borda.

**E.2** Diferencie NEXT, FEXT e acoplamento por impedância comum.

**E.3** Explique por que o FEXT pode cancelar numa linha homogênea ideal e persistir em microstrip.

**E.4** Por que reduzir o tempo de subida aumenta crosstalk mesmo sem alterar a taxa de dados?

**E.5** Compare os benefícios de espaçamento, plano de referência, blindagem e par trançado.

**E.6** Para $M=2$ nH e $\Delta I=0{,}4$ A em 500 ps, estime a tensão induzida.

**E.7** Uma região acoplada tem atraso de 0,8 ns. Estime a duração do NEXT.

**E.8** Mostre pela transformação inversa que $I_1=I_{CM}+I_{DM}$ e $I_2=I_{CM}-I_{DM}$.

## Gabarito

**E.1** Corrente de deslocamento média para capacitância mútua de 0,5 pF com borda de 3,3 V em 1 ns.

Equação da corrente de deslocamento: $i_C=C_m\cdot dV/dt$.

Para borda linear: $dV/dt=\Delta V/t_r=3{,}3\text{ V}/1\text{ ns}=3{,}3\times10^9$ V/s.

$i_C=0{,}5\times10^{-12}\cdot3{,}3\times10^9=1{,}65\times10^{-3}$ A = $1{,}65$ mA.

Resposta: $1{,}65$ mA.

**E.6** Tensão induzida para $M=2$ nH e $\Delta I=0{,}4$ A em 500 ps.

Equação: $V_M=M\cdot di/dt$.

$di/dt=\Delta I/t_r=0{,}4\text{ A}/500\text{ ps}=0{,}4/(5\times10^{-10})=0{,}8\times10^9$ A/s.

$V_M=2\times10^{-9}\cdot0{,}8\times10^9=1{,}6$ V.

Resposta: $1{,}6$ V.

**E.7** Duração do NEXT para região acoplada com atraso de 0,8 ns.

O NEXT dura aproximadamente o tempo de ida e volta na região acoplada: $t_{NEXT}=2\cdot t_d$.

Com $t_d=0{,}8$ ns: $t_{NEXT}=2\cdot0{,}8=1{,}6$ ns.

Resposta: Aproximadamente $1{,}6$ ns no modelo ideal.

**E.8** Transformada inversa para $I_1=I_{CM}+I_{DM}$ e $I_2=I_{CM}-I_{DM}$.

Dadas as definições: $I_{CM}=(I_1+I_2)/2$ e $I_{DM}=(I_1-I_2)/2$.

Somando: $I_{CM}+I_{DM}=(I_1+I_2)/2+(I_1-I_2)/2=(2I_1)/2=I_1$.

Subtraindo: $I_{CM}-I_{DM}=(I_1+I_2)/2-(I_1-I_2)/2=(2I_2)/2=I_2$.

Portanto, $I_1=I_{CM}+I_{DM}$ e $I_2=I_{CM}-I_{DM}$. $\square$

## Exemplo numérico adicional — NEXT e FEXT vs. comprimento

Dados: $C_m=0.5$ pF/m, $M=4$ nH/m, $l=0.5$ m, $v_p=2\times10^8$ m/s, $t_r=1$ ns, $V_A=3.3$ V.

Acoplamento capacitivo: $i_C=C_m\cdot l\cdot\Delta V/t_r=0.5\times10^{-12}\cdot0.5\cdot3.3/10^{-9}=0.825$ mA.
Com $R_V=100\ \Omega$: $V_{CAP}=82.5$ mV.

Acoplamento indutivo: $v_M=M\cdot l\cdot\Delta I/t_r$. Se $\Delta I=0.1$ A:
$v_M=4\times10^{-9}\cdot0.5\cdot0.1/10^{-9}=0.2$ V.

NEXT total depende da soma vetorial dos termos.

## Código Python — NEXT e FEXT vs. frequência

```python
import numpy as np
import matplotlib.pyplot as plt

f = np.logspace(5, 8, 100)  # 100 kHz a 100 MHz

# Parâmetros
Lm = 400e-9       # 400 nH/m (mutual inductance total para 1m)
Cm = 50e-12       # 50 pF/m (mutual capacitance total para 1m)
Z0 = 50.0         # Impedância característica
v_p = 2e8         # Velocidade de propagação

# Coeficientes de acoplamento indutivo e capacitivo
k_L = Lm / (Z0 / v_p)  # Acoplamento indutivo
k_C = Cm * Z0 * v_p    # Acoplamento capacitivo

# NEXT e FEXT aproximados
# NEXT ~ (k_L + k_C)/2 * (f * t_r) para baixas frequências
# FEXT ~ (k_L - k_C)/2 * (f * L / v_p)

# Simulação simplificada
NEXT_prop = np.abs(k_L + k_C) / 2 * f * 1e-9  # t_r = 1 ns
FEXT_prop = np.abs(k_L - k_C) / 2 * f * (1.0 / v_p)

plt.figure(figsize=(8, 5))
plt.semilogx(f, NEXT_prop, 'b-', linewidth=2, label='NEXT proporcional')
plt.semilogx(f, FEXT_prop, 'r-', linewidth=2, label='FEXT proporcional')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Crosstalk Proporcional')
plt.title('NEXT vs FEXT vs Frequência')
plt.legend()
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Exemplo numérico adicional — Crosstalk por impedância comum

**Problema**: Dois circuitos compartilham um retorno com impedância $Z_g=0.1+j0.2\ \Omega$ a 10 MHz. Se o agressor tem corrente $I_A=100$ mA RMS, qual é a tensão de ruído induzida na vítima?

**Solução**:

$|Z_g|=\sqrt{0.1^2+0.2^2}=\sqrt{0.05}=0.224\ \Omega$.

$V_g=|Z_g|\cdot|I_A|=0.224\cdot0.1=0.0224$ V = $22.4$ mV.

Fase de $Z_g$: $\phi=\arctan(0.2/0.1)=63.4°$.

> **Insight para Estudantes**: A impedância comum é frequentemente subestimada em projetos de PCB. Um plano de retorno contínuo e de baixa indutância é essencial para minimizar esse acoplamento. Vias de retorno próximas a vias de sinal ajudam a manter a impedância de retorno baixa.

## Modos par e ímpar em linhas acopladas

Para duas linhas simétricas, as matrizes por unidade de comprimento podem ser escritas como

$$
\mathbf L=\begin{bmatrix}L&L_m\\L_m&L\end{bmatrix},\qquad
\mathbf C=\begin{bmatrix}C+C_m&-C_m\\-C_m&C+C_m\end{bmatrix}.
$$

Os autovetores $[1\;1]^T$ e $[1\;-1]^T$ representam, respectivamente, os modos par e ímpar. Substituí-los nas equações multcondutoras desacopla o problema e produz

$$
L_e=L+L_m,\quad C_e=C,
\qquad
L_o=L-L_m,\quad C_o=C+2C_m,
$$

$$
Z_e=\sqrt{\frac{L_e}{C_e}},\quad
Z_o=\sqrt{\frac{L_o}{C_o}},\quad
v_e=\frac1{\sqrt{L_eC_e}},\quad
v_o=\frac1{\sqrt{L_oC_o}}.
$$

**Corolário — origem do FEXT.** Se $v_e=v_o$, as contribuições capacitiva e indutiva chegam sincronizadas e o FEXT ideal se cancela. Em microstrip, os campos veem misturas diferentes de ar e dielétrico, em geral $v_e\ne v_o$; em stripline homogênea, o cancelamento tende a ser melhor.

### Exemplo numérico — impedâncias modais

Considere $L=400\,\text{nH/m}$, $L_m=40\,\text{nH/m}$, $C=160\,\text{pF/m}$ e $C_m=16\,\text{pF/m}$. Então

$$
Z_e=\sqrt{440\,\text{nH/m}/160\,\text{pF/m}}=52{,}4\,\Omega,
$$

$$
Z_o=\sqrt{360\,\text{nH/m}/192\,\text{pF/m}}=43{,}3\,\Omega.
$$

A impedância diferencial aproximada é $Z_{diff}=2Z_o=86{,}6\,\Omega$. O exemplo mostra por que usar duas linhas isoladas de 50 Ω não determina, por si só, um par diferencial de 100 Ω.

## Simulação temporal de NEXT e FEXT

O modelo abaixo separa dois efeitos didáticos: NEXT com duração próxima de $2t_d$ e FEXT proporcional à diferença de atrasos modais. Não substitui um solucionador multcondutor, mas verifica sinais, escalas e tendências.

```python
import numpy as np
import matplotlib.pyplot as plt

length = 0.30       # m
ve, vo = 1.85e8, 1.75e8
ke, ko = 0.08, 0.10 # coeficientes didáticos
tr = 0.5e-9
t = np.linspace(0, 8e-9, 4000)

def edge(t, t0, tr):
    return np.clip((t - t0) / tr, 0.0, 1.0)

te, to = length / ve, length / vo
aggressor = edge(t, 0, tr)
next_v = 0.5 * (ke + ko) * (edge(t, 0, tr) - edge(t, 2*min(te, to), tr))
fext_v = 0.5 * (edge(t, te, tr) - edge(t, to, tr))

fig, ax = plt.subplots(figsize=(9, 4.5))
ax.plot(t*1e9, aggressor, label='agressor')
ax.plot(t*1e9, next_v, label='NEXT')
ax.plot(t*1e9, fext_v, label='FEXT modal')
ax.set(xlabel='Tempo (ns)', ylabel='Amplitude normalizada',
       title='Crosstalk no tempo: duração e separação modal')
ax.grid(True, alpha=.3); ax.legend(); plt.tight_layout()
```

**Validação:** faça $v_e=v_o$ e confirme $FEXT=0$; faça $k_e=k_o=0$ e confirme $NEXT=0$. Varra comprimento e $t_r$: o pico de FEXT cresce enquanto a diferença de atraso é resolvida pela borda.

## Estudo paramétrico de layout

Para uma primeira comparação, admita que os coeficientes de acoplamento decaiam aproximadamente com $e^{-s/h}$, onde $s$ é o espaçamento e $h$ a altura ao plano. Essa lei é apenas uma parametrização didática; valores de projeto devem vir de um solucionador 2D ou de geometria validada.

```python
import numpy as np
import matplotlib.pyplot as plt

s_over_h = np.linspace(0.5, 6, 200)
k0 = 0.25
k = k0*np.exp(-s_over_h)
next_db = 20*np.log10(np.maximum(k/2, 1e-12))

plt.plot(s_over_h, next_db, linewidth=2)
plt.axvline(3, color='k', ls='--', label='s/h = 3')
plt.xlabel('Espaçamento normalizado s/h')
plt.ylabel('NEXT aproximado (dB)')
plt.title('Tendência de crosstalk com espaçamento e altura ao plano')
plt.grid(True, alpha=.3); plt.legend(); plt.tight_layout()
```

## Laboratório SPICE — acoplamento concentrado entre trilhas

```spice
Vagg src 0 PULSE(0 3.3 0 500p 500p 5n 10n)
Rsrc src agg 33
Cagg agg 0 3p
Lvictim vic 0 20n
Rvictim vic 0 1k
Cc agg vic 200f
Lagg agg 0 20n
Kcouple Lagg Lvictim 0.08
.tran 10p 20n 0 25p
.print tran v(agg) v(vic)
.end
```

Execute primeiro com `Kcouple=0`, depois com `Cc=0`, separando contribuições elétrica e magnética. Inverta os pontos de um indutor para verificar o sinal. Este é modelo concentrado; para linhas longas use elementos multcondutores ou parâmetros modais.

## Referência principal

Síntese do Capítulo 9, "Crosstalk", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 559–710.
