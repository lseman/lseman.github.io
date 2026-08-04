# Blindagem

Blindagem é a redução do acoplamento eletromagnético por uma barreira. Seu desempenho depende do campo incidente, material, espessura, frequência, geometria e, sobretudo, de aberturas e junções. Uma caixa metálica não corrige automaticamente uma fonte ou caminho de retorno mal projetado.

## Sumário

1. [Eficácia de blindagem](#eficácia-de-blindagem)
2. [Fontes de campo distante](#fontes-de-campo-distante)
3. [Campo próximo elétrico e magnético](#campo-próximo-elétrico-e-magnético)
4. [Aberturas e descontinuidades](#aberturas-e-descontinuidades)
5. [Cabos e conectores](#cabos-e-conectores)
6. [Ressonâncias de cavidade](#ressonâncias-de-cavidade)
7. [Blindagem como problema de sistema](#blindagem-como-problema-de-sistema)
8. [Exemplo resolvido — Absorção](#exemplo-resolvido--absorção)
9. [Exemplo resolvido — Indutância de pigtail](#exemplo-resolvido--indutância-de-pigtail)
10. [Insight: o ponto fraco domina](#insight-o-ponto-fraco-domina)
11. [Baixa frequência magnética](#baixa-frequência-magnética)
12. [Exercícios](#exercícios)
13. [Respostas selecionadas](#respostas-selecionadas)
14. [Exemplo numérico adicional — Eficácia de blindagem vs. espessura](#exemplo-numérico-adicional--eficácia-de-blindagem-vs-espessura)
15. [Código Python — Eficácia de blindagem por absorção vs. frequência](#código-python--eficácia-de-blindagem-por-absorção-vs-frequência)
16. [Exemplo numérico adicional — Eficácia total de blindagem com aberturas](#exemplo-numérico-adicional--eficácia-total-de-blindagem-com-aberturas)
17. [Ressonâncias de cavidade retangular](#ressonâncias-de-cavidade-retangular)
18. [Aberturas: limite dominante](#aberturas-limite-dominante)
19. [Código Python — absorção, abertura e limite do conjunto](#código-python--absorção-abertura-e-limite-do-conjunto)
20. [Campo magnético de baixa frequência](#campo-magnético-de-baixa-frequência)
21. [Referência principal](#referência-principal)

## Eficácia de blindagem

### Os três mecanismos de blindagem

A eficácia pode ser expressa por campo elétrico, magnético ou potência:

$$SE_E=20\log_{10}\frac{|E_i|}{|E_t|},\qquad
SE_H=20\log_{10}\frac{|H_i|}{|H_t|},$$

$$SE_P=10\log_{10}\frac{P_i}{P_t}.$$

É essencial declarar a grandeza, posição e configuração. Em uma parede plana ideal, costuma-se decompor

$$SE\approx R+A+B,$$

onde $R$ é perda por reflexão, $A$ por absorção e $B$ corrige múltiplas reflexões internas.

> **Insight para Estudantes**: A reflexão ($R$) domina para campos elétricos e ondas de campo distante porque há grande descasamento de impedância entre o ar ($377\ \Omega$) e o metal ($\approx0\ \Omega$). A absorção ($A$) domina para campos magnéticos de baixa frequência e materiais de alta permeabilidade. As aberturas e fendas frequentemente tornam $SE$ muito menor que $R+A+B$.

## Fontes de campo distante

No campo distante, a onda apresenta impedância aproximadamente igual à do meio. A reflexão resulta do grande descasamento entre ar e material condutor. A absorção cresce com a espessura $t$ em relação à profundidade pelicular:

$$\delta=\sqrt{\frac{2}{\omega\mu\sigma}},\qquad
A_{dB}=8{,}686\frac{t}{\delta}.$$

Boa condutividade favorece reflexão; alta permeabilidade e espessura favorecem absorção magnética. Quando $A$ é grande, múltiplas reflexões internas tornam-se desprezíveis.

### Prova da perda por absorção

**Teorema**: Em material bom condutor e onda plana, a amplitude do campo decai exponencialmente com a profundidade:

$$|E(z)|=|E(0)|e^{-z/\delta}.$$

Portanto, a perda por absorção de uma espessura $t$ é

$$A_{dB}=20\log_{10}(e^{t/\delta})=8{,}686\frac{t}{\delta}.$$

**Prova**: Em bom condutor, a constante de propagação é aproximadamente $\gamma=(1+j)/\delta$. O fator espacial é $e^{-\gamma z}$; seu módulo é $e^{-z/\delta}$. A conversão para decibéis fornece $20(t/\delta)\log_{10}e$. $\square$

**Corolário**: Cada profundidade pelicular acrescenta aproximadamente 8,686 dB de absorção de amplitude, sem incluir reflexão, aberturas ou juntas.

## Campo próximo elétrico e magnético

No campo próximo, a impedância da onda depende da fonte. Uma fonte predominantemente elétrica tem alta $|E/H|$ e costuma ser bem atenuada por materiais condutores finos. Uma fonte magnética de baixa frequência tem baixa $|E/H|$; reflexão é menor e a profundidade pelicular é grande, tornando a blindagem mais difícil.

A primeira mitigação para campo magnético próximo é reduzir área de laço, aproximar ida e retorno e aumentar distância. Se uma blindagem for necessária, materiais de alta permeabilidade desviam fluxo em baixa frequência; materiais condutores espessos produzem correntes opostas quando a frequência permite.

## Aberturas e descontinuidades

O desempenho real geralmente é limitado por fendas, ventilação, displays, portas, parafusos e penetrações de cabos. A maior dimensão da abertura importa mais que sua área total. Uma fenda longa pode irradiar como antena mesmo sendo estreita.

Medidas práticas:

- usar muitas aberturas pequenas em vez de uma longa;
- reduzir espaçamento entre pontos de contato;
- manter continuidade elétrica em juntas, removendo tinta isolante onde apropriado;
- usar gaxetas compatíveis com material, ambiente e corrosão;
- empregar estruturas abaixo do corte, como colmeias ou guias, quando necessário;
- filtrar condutores ao atravessar a fronteira da blindagem.

## Cabos e conectores

A blindagem do cabo deve ser tratada como continuação da envolvente. Uma terminação circunferencial de 360° apresenta baixa indutância. Pigtails acrescentam aproximadamente $j\omega L$ e podem anular o benefício em alta frequência. Filtros e protetores devem ficar na penetração, evitando que corrente externa circule no interior antes de ser desviada.

## Ressonâncias de cavidade

Uma envolvente condutora pode sustentar modos ressonantes. Fontes internas e aberturas posicionadas em máximos de campo podem produzir acoplamento intenso. Absorvedores, mudanças geométricas, amortecimento, reposicionamento da fonte e redução da energia excitada podem ser mais eficazes que simplesmente aumentar a espessura da parede.

## Blindagem como problema de sistema

Uma estratégia consistente define uma fronteira EMC:

1. onde correntes externas devem circular;
2. onde cabos cruzam a fronteira;
3. como suas blindagens são terminadas;
4. onde filtros e supressores desviam corrente;
5. como portas, juntas e ventilação mantêm continuidade;
6. quais fontes internas ainda precisam ser reduzidas.

## Exemplo resolvido — Absorção

Para $t=100$ µm e $\delta=20$ µm:

$$A=8{,}686\frac{100}{20}=43{,}43\ \text{dB}.$$

Esse resultado é da parede contínua ideal. Uma fenda pode limitar o gabinete a valor muito inferior.

## Exemplo resolvido — Indutância de pigtail

Um pigtail apresenta 30 nH. A 100 MHz,

$$|Z|=2\pi fL=2\pi(10^8)(30\times10^{-9})=18{,}85\ \Omega.$$

Uma conexão circunferencial curta pode reduzir essa impedância em ordens de grandeza, evitando que tensão de modo comum se desenvolva entre blindagem e chassi.

## Insight: o ponto fraco domina

Se a parede oferece 80 dB, mas a penetração de cabo oferece 25 dB, o sistema não oferece 105 dB nem uma média próxima de 52 dB. O caminho de menor atenuação tende a dominar. A eficácia total deve ser avaliada como rede de caminhos paralelos de acoplamento.

## Baixa frequência magnética

Para campos quase estáticos, reflexão em metal comum pode ser pequena. Há três estratégias distintas:

1. reduzir o campo na fonte diminuindo área de laço e $di/dt$;
2. aumentar distância;
3. desviar fluxo com material de alta permeabilidade sem saturá-lo.

Dobras, folgas e saturação local degradam materiais de alta permeabilidade. Propriedades após conformação podem diferir das propriedades de catálogo.

## Lista de Exercícios Propostos

**E.1** Um material tem profundidade pelicular de 20 µm na frequência de interesse e espessura de 100 µm. Estime a perda por absorção.

**E.2** Explique por que uma fenda longa é problemática mesmo com pequena área.

**E.3** Compare blindagem de campo elétrico próximo e campo magnético próximo em baixa frequência.

**E.4** Por que um pigtail degrada a terminação de um cabo em RF?

**E.5** Defina uma fronteira EMC para um equipamento com alimentação, Ethernet e ventilação.

**E.6** Calcule a reatância de uma conexão de 10 nH a 30 MHz e 300 MHz.

**E.7** Uma parede ideal oferece 60 dB. Uma alteração dobra sua espessura em unidades de $\delta$. Quantos dB de absorção são acrescentados?

**E.8** Explique por que tinta, oxidação e poucos parafusos podem transformar uma junta curta em fenda eletricamente longa.

## Gabarito

**E.1** Perda por absorção para material com profundidade pelicular de 20 µm e espessura de 100 µm.

Equação: $A=8{,}686\times(t/\delta)$.

Com $t=100$ µm e $\delta=20$ µm: $t/\delta=100/20=5$.

$A=8{,}686\times5=43{,}43$ dB.

Resposta: $A=43{,}43$ dB.

**E.6** Reatância de conexão de 10 nH a 30 MHz e 300 MHz.

Equação: $X_L=2\pi f L$.

Para $f=30$ MHz: $X_{30\text{MHz}}=2\pi(3\times10^7)(10\times10^{-9})=2\pi\times0{,}3=1{,}88\ \Omega$.

Para $f=300$ MHz: $X_{300\text{MHz}}=2\pi(3\times10^8)(10\times10^{-9})=2\pi\times3=18{,}85\ \Omega$.

Resposta: $X_{30\text{MHz}}=1{,}88\ \Omega$; $X_{300\text{MHz}}=18{,}85\ \Omega$.

**E.7** Acréscimo de absorção quando espessura dobra em unidades de $\delta$.

Cada profundidade pelicular adicional acrescenta 8,686 dB de absorção.

Se a espessura dobra em unidades de $\delta$ (ou seja, aumenta de $n\delta$ para $(n+1)\delta$), o acréscimo é 8,686 dB.

Resposta: O acréscimo de uma profundidade pelicular adicional acrescenta 8,686 dB de absorção.

## Exemplo numérico adicional — Eficácia de blindagem vs. espessura

Material: cobre, $\sigma=5.8\times10^7$ S/m, $\mu_r=1$.
Frequência: $f=100$ MHz.

Profundidade pelicular: $\delta=\sqrt{2/(\omega\mu\sigma)}$
$\omega=2\pi\cdot10^8$, $\mu=4\pi\times10^{-7}$.
$\delta=\sqrt{2/(2\pi\cdot10^8\cdot4\pi\times10^{-7}\cdot5.8\times10^7)}$
$=\sqrt{2/(4.58\times10^9)}=\sqrt{4.37\times10^{-10}}=2.09\times10^{-5}$ m $=20.9$ µm.

Para $t=100$ µm: $t/\delta=4.78$.
$A_{dB}=8.686\cdot4.78=41.5$ dB.

## Código Python — Eficácia de blindagem por absorção vs. frequência

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros do material (cobre)
sigma = 5.8e7      # Condutividade (S/m)
mu_r = 1.0
mu_0 = 4 * np.pi * 1e-7

# Faixa de frequência
f = np.logspace(6, 9, 100)  # 1 MHz a 1 GHz
w = 2 * np.pi * f

# Profundidade pelicular
delta = np.sqrt(2 / (w * mu_0 * mu_r * sigma))

# Espessura da blindagem
t = 100e-6  # 100 µm

# Eficácia de absorção (dB)
# A_dB = 8.686 * t / delta
A_dB = 8.686 * t / delta

plt.figure(figsize=(8, 5))
plt.semilogx(f, A_dB, 'b-', linewidth=2)
plt.xlabel('Frequência (Hz)')
plt.ylabel('Eficácia de Absorção (dB)')
plt.title('Eficácia de Blindagem por Absorção vs Frequência (Cobre, t=100µm)')
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Exemplo numérico adicional — Eficácia total de blindagem com aberturas

**Problema**: Uma parede oferece $SE=80$ dB, mas uma penetração de cabo oferece $SE=25$ dB. Qual é a eficácia total aproximada do sistema?

**Solução**:

A eficácia total não é a média nem a soma. O caminho de menor atenuação domina. Neste caso, a penetração de cabo com $SE=25$ dB torna-se o ponto fraco.

Eficácia total aproximada: $SE_{total}\approx25$ dB (do caminho mais fraco).

> **Insight para Estudantes**: Em blindagem, o sistema é tão forte quanto seu ponto mais fraco. Uma fenda de 1 cm pode reduzir uma blindagem de 80 dB para 20 dB. Sempre identifique e trate aberturas, penetrções de cabos, e juntas antes de otimizar a espessura da parede.

## Ressonâncias de cavidade retangular

Para uma cavidade ideal de dimensões $a$, $b$ e $d$, as frequências modais são

$$
f_{mnp}=\frac{c}{2}\sqrt{\left(\frac ma\right)^2+
\left(\frac nb\right)^2+\left(\frac pd\right)^2},
$$

com combinações permitidas conforme o modo TE ou TM. Uma caixa de $30\times20\times10$ cm possui escala modal mais baixa próxima de $c/(2a)\approx500$ MHz. Perdas, conteúdo interno e aberturas deslocam e amortecem os picos.

### Código Python — mapa dos modos inferiores

```python
import itertools
import numpy as np

c = 299_792_458.0
a, b, d = 0.30, 0.20, 0.10
modes = []
for m, n, p in itertools.product(range(4), repeat=3):
    if (m, n, p) == (0, 0, 0):
        continue
    f = c/2*np.sqrt((m/a)**2 + (n/b)**2 + (p/d)**2)
    modes.append((f, m, n, p))

for f, m, n, p in sorted(modes)[:10]:
    print(f'({m}{n}{p}): {f/1e6:7.1f} MHz')
```

## Aberturas: limite dominante

Uma abertura estreita de maior dimensão $l\ll\lambda$ pode ser triada por uma atenuação que cresce quando $\lambda/l$ cresce. Equações empíricas como $SE\approx20\log_{10}(\lambda/2l)$ dependem de geometria, incidência e regime; não devem ser usadas como prova de conformidade.

**Corolário — subdivisão de abertura.** Mantida a área total de ventilação, muitas células pequenas normalmente apresentam frequência de corte maior que uma abertura única longa. O resultado real ainda depende de profundidade, contato elétrico e acoplamento entre células.

### Exemplo numérico — material excelente, abertura dominante

Uma folha de cobre pode oferecer absorção ideal superior a 100 dB em alta frequência, enquanto uma fenda de 10 cm em 1 GHz tem $l/\lambda\approx0{,}33$ e já não é eletricamente pequena. Somar “100 dB do material” a uma expressão de abertura é incorreto: os caminhos estão em paralelo e o vazamento dominante limita o conjunto.

## Código Python — absorção, abertura e limite do conjunto

```python
import numpy as np
import matplotlib.pyplot as plt

mu0 = 4*np.pi*1e-7
sigma = 5.8e7
t = 0.5e-3
l = 20e-3
f = np.logspace(4, 10, 800)
delta = np.sqrt(2/(2*np.pi*f*mu0*sigma))
A = 8.686*t/delta
lam = 299_792_458/f
SE_ap = 20*np.log10(np.maximum(lam/(2*l), 1.0))

# Caminhos de vazamento em paralelo: somar transmissões de potência
T_material = 10**(-A/10)
T_aperture = 10**(-SE_ap/10)
SE_total = -10*np.log10(T_material + T_aperture)

plt.semilogx(f, A, label='absorção da folha')
plt.semilogx(f, SE_ap, label='triagem da abertura')
plt.semilogx(f, SE_total, lw=2.5, label='limite combinado')
plt.ylim(-3, 180); plt.xlabel('Frequência (Hz)'); plt.ylabel('SE (dB)')
plt.grid(True, which='both', alpha=.3); plt.legend(); plt.tight_layout()
```

## Campo magnético de baixa frequência

Para campos magnéticos próximos, alta condutividade e pequena espessura podem ser insuficientes porque a absorção é pequena e a impedância da onda é baixa. Materiais de alta permeabilidade desviam fluxo, mas saturação, juntas e degradação por conformação devem entrar no modelo. Compare sempre densidade de fluxo máxima com a curva $B$–$H$ do material.

## Laboratório SPICE — ressonâncias de cavidade

Uma cavidade retangular pode ser modelada como um circuito RLC ressonante para cada modo. Para o modo fundamental, a impedância de entrada perto da ressonância é

$$Z_{in}=R+ j\omega L + \frac{1}{j\omega C},$$

onde $R$ modela as perdas por condução nas paredes e por cargas internas.

```spice
* Modelagem de cavidade ressonante como circuito RLC
Lcav 1 2 10n
Ccav 2 0 100p
Rloss 2 0 50
Vin 1 0 AC 1
.ac dec 200 10k 1G
.meas ac f_res MAX vm(2)
.print ac vm(2) vp(2)
.end
```

Neste modelo, $L_cav$ e $C_{cav}$ representam os parâmetros equivalentes do modo ressonante da cavidade, e $R_{loss}$ modela as perdas. A análise AC identifica a frequência de ressonância $f_{res}$ e a largura de banda, permitindo avaliar o Q-factor da cavidade:

$$Q=\frac{f_{res}}{\Delta f}=\frac{1}{R}\sqrt{\frac{L}{C}}.$$

Para cavidades reais, as perdas incluem:

- perdas por condução nas paredes (profundidade pelicular);
- perdas por aberturas e penetrções;
- perdas por conteúdo interno (placas, componentes);
- perdas por absorvedores dielétricos ou magnéticos.

O Q-factor elevado indica ressonâncias agudas que podem causar acoplamento intenso entre fontes internas e aberturas. Amortecimento com materiais absorvedores ou mudança geométrica reduz o Q e espalha as ressonâncias.

## Referência principal

Síntese do Capítulo 10, "Shielding", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 713–751.
