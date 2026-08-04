# Dedução da Equação de Onda a partir das Equações de Maxwell

> Eletromagnetismo — Apostila de Curso
> Tópicos: Equação de onda no vácuo · Velocidade de propagação · Onda plana monocromática · Número de onda · Impedância intrínseca · Relação E/B em uma onda

---

## Objetivos de Aprendizagem

Ao final deste capítulo, você será capaz de:

- [ ] Deduzir a **equação de onda** a partir das equações de Maxwell.
- [ ] Calcular a **velocidade de propagação** de ondas eletromagnéticas no vácuo e em meios materiais.
- [ ] Analisar **ondas planas monocromáticas** e sua transversalidade.
- [ ] Calcular a **impedância intrínseca** e a relação $E/B$ em uma onda.
- [ ] Calcular a **intensidade** de uma onda usando o vetor de Poynting.

---

## Intuição Física: Ondas Eletromagnéticas

Antes de definir matematicamente as ondas eletromagnéticas, pense em termos físicos:

- **Ondas eletromagnéticas** são perturbações auto-sustentadas dos campos elétrico e magnético que se propagam pelo espaço.
- Os campos $\vec E$ e $\vec B$ são **perpendiculares entre si** e **perpendiculares à direção de propagação** (ondas transversais).
- No vácuo, as ondas eletromagnéticas se propagam na **velocidade da luz** $c \approx 3\times10^8\,\text{m/s}$.
- A luz visível, ondas de rádio, micro-ondas, raios X e raios gama são todas **ondas eletromagnéticas**, diferindo apenas em frequência e comprimento de onda.

## Aplicações no Mundo Real

| Conceito | Aplicação Prática |
|---|---|
| Equação de onda | Propagação de sinais em fibras ópticas, antenas de transmissão |
| Velocidade de propagação | Projeto de circuitos de alta frequência, satélites |
| Ondas planas monocromáticas | Laser, comunicações por rádio e micro-ondas |
| Impedância intrínseca | Projeto de antenas, casamento de impedância, reflexões |
| Vetor de Poynting | Medição de intensidade de luz, radiação solar, micro-ondas |
| Polarização | Óculos de sol polarizados, telas LCD, comunicação por satélite |

---

## Antes de começar

Ao final, você deve deduzir a equação de onda a partir de Maxwell, relacionar velocidade, índice, impedância, campos $\vec E$ e $\vec B$ e calcular intensidade pelo vetor de Poynting. **Diagnóstico:** uma onda eletromagnética plana pode ter componente de campo na direção de propagação no vácuo? **Evidência mínima:** reproduzir a dedução por rotacionais, verificar transversalidade e comparar a banda/velocidade em dois meios.

## Sumário

1. [Da equação de onda preliminar à forma completa](#da-equação-de-onda-preliminar-à-forma-completa)
2. [Equação de onda no vácuo — dedução completa](#equação-de-onda-no-vácuo--dedução-completa)
3. [Equação de onda em meios materiais (sem perdas)](#equação-de-onda-em-meios-materiais-sem-perdas)
4. [Onda plana monocromática](#onda-plana-monocromática)
5. [Relação E/B e impedância intrínseca](#relação-eb-e-impedância-intrínseca)
6. [Verificação: a solução satisfaz as equações de Maxwell](#verificação-a-solução-satisfaz-as-equações-de-maxwell)
7. [Exercícios resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)

## Da equação de onda preliminar à forma completa

No final do arquivo anterior (Seção “Verificação: a solução satisfaz as equações de Maxwell”.7.3), esboçamos que as equações de Maxwell no vácuo levam a uma **equação de onda** para o campo $\vec{E}$. O esboço foi:

$$
\nabla^2\vec{E} = \mu_0\varepsilon_0\,\frac{\partial^2\vec{E}}{\partial t^2}
$$

Neste arquivo, fazemos a dedução completa e explícita — primeiro no vácuo, depois em meios materiais — e apresentamos a solução geral mais importante: a **onda plana monocromática**.

## Equação de onda no vácuo — dedução completa

<!-- slides: break -->

### Equações de Maxwell no vácuo, sem fontes

No vácuo, longe de cargas e correntes ($\rho=0$, $\vec{J}=0$), com $\vec D=\varepsilon_0\vec E$ e $\vec H=\vec B/\mu_0$, as equações de Maxwell são:

$$
\begin{aligned}
\nabla\cdot\vec{E} &= 0 &&\text{(I)}\\
\nabla\cdot\vec{B} &= 0 &&\text{(II)}\\
\nabla\times\vec{E} &= -\frac{\partial\vec{B}}{\partial t} &&\text{(III)}\\
\nabla\times\vec{B} &= \mu_0\varepsilon_0\,\frac{\partial\vec{E}}{\partial t} &&\text{(IV)}
\end{aligned}
$$

### Tomando o rotacional de (III)

Aplicamos o operador rotacional ao lado esquerdo de (III):

$$
\nabla\times(\nabla\times\vec{E}) = \nabla\times\left(-\frac{\partial\vec{B}}{\partial t}\right) = -\frac{\partial}{\partial t}(\nabla\times\vec{B})
$$

(substituímos $\nabla\times\vec{B}$ usando a equação (IV)):

$$
-\frac{\partial}{\partial t}\left(\mu_0\varepsilon_0\,\frac{\partial\vec{E}}{\partial t}\right) = -\mu_0\varepsilon_0\,\frac{\partial^2\vec{E}}{\partial t^2}
$$

### Usando a identidade vetorial

Lado esquerdo: $\nabla\times(\nabla\times\vec{E}) = \nabla(\nabla\cdot\vec{E}) - \nabla^2\vec{E}$. Pelo resultado (I), $\nabla\cdot\vec{E}=0$ no vácuo, logo:

$$
\nabla\times(\nabla\times\vec{E}) = -\nabla^2\vec{E}
$$

Igualando os dois lados:

$$
-\nabla^2\vec{E} = -\mu_0\varepsilon_0\,\frac{\partial^2\vec{E}}{\partial t^2}
$$

$$
\boxed{\nabla^2\vec{E} - \mu_0\varepsilon_0\,\frac{\partial^2\vec{E}}{\partial t^2} = 0}\qquad\text{(equação de onda no vácuo)}
$$

### Equação análoga para $\vec{B}$

O mesmo procedimento (rotacional de (IV), substituir $\nabla\times\vec{E}$ por $-\partial\vec{B}/\partial t$) dá:

$$
\boxed{\nabla^2\vec{B} - \mu_0\varepsilon_0\,\frac{\partial^2\vec{B}}{\partial t^2} = 0}\qquad\text{(equação de onda no vácuo)}
$$

### Velocidade de onda

A equação de onda clássica em 3D é:

$$
\nabla^2\vec{\psi} - \frac{1}{v^2}\,\frac{\partial^2\vec{\psi}}{\partial t^2} = 0
$$

Comparando com a equação eletromagnética acima:

$$
\frac{1}{v^2} = \mu_0\varepsilon_0 \quad\Rightarrow\quad \boxed{v = \frac{1}{\sqrt{\mu_0\varepsilon_0}}}
$$

Calculando com os valores do SI:

$$
v = \frac{1}{\sqrt{(4\pi\times10^{-7})\,(8{,}854\times10^{-12})}} \approx 2{,}998\times10^8\;\text{m/s}
$$

Esta é **exatamente a velocidade da luz** — a descoberta que levou Maxwell a propor que **a luz é uma onda eletromagnética** (1865).

## Equação de onda em meios materiais (sem perdas)

### Meios lineares, homogêneos, isotrópicos (LIH), sem perdas

Para um meio caracterizado por permissividade $\varepsilon$ e permeabilidade $\mu$ (sem condutividade, $\sigma=0$), as equações de Maxwell sem fontes são:

$$
\begin{aligned}
\nabla\cdot\vec{E} &= 0, & \nabla\cdot\vec{B} &= 0\\
\nabla\times\vec{E} &= -\frac{\partial\vec{B}}{\partial t}, & \nabla\times\vec{B} &= \mu\varepsilon\,\frac{\partial\vec{E}}{\partial t}
\end{aligned}
$$

O mesmo procedimento dá:

$$
\boxed{\nabla^2\vec{E} - \mu\varepsilon\,\frac{\partial^2\vec{E}}{\partial t^2} = 0}
$$

com velocidade de fase:

$$
\boxed{v = \frac{1}{\sqrt{\mu\varepsilon}} = \frac{c}{\sqrt{\mu_r\varepsilon_r}} = \frac{c}{n}}
$$

onde $n \equiv \sqrt{\mu_r\varepsilon_r}$ é o **índice de refração** do meio. Para a maioria dos materiais não magnéticos ($\mu_r\approx1$), $n\approx\sqrt{\varepsilon_r}$.

### Exemplos de velocidade e índice de refração

| Meio             | $\varepsilon_r$   | $\mu_r$    | $v\ (\text{m/s})$         | $n$            |
| ---------------- | ----------------- | ---------- | ------------------------- | -------------- |
| Vácuo            | 1                 | 1          | $2{,}998\times10^8$       | 1              |
| Ar (STP)         | 1,0006            | $\approx1$ | $\approx c$               | 1,0003         |
| Água (DC)        | 80                | 1          | $3{,}35\times10^7$        | $\approx8{,}9$ |
| Água (óptico)    | $\approx1{,}77^2$ | 1          | $\approx2{,}25\times10^8$ | 1,33           |
| Vidro crown      | $\approx2{,}5$    | 1          | $\approx1{,}90\times10^8$ | 1,58           |
| Silício (óptico) | $\approx11{,}7$   | 1          | $\approx8{,}77\times10^7$ | 3,42           |

Note: a água tem $\varepsilon_r\approx80$ em baixas frequências, mas no regime óptico (altas frequências), a resposta das moléculas de água não acompanha a oscilação do campo, e o valor efetivo é $\varepsilon_r\approx1{,}77^2\approx3{,}14$ — o que dá $n=1{,}33$, consistente com o índice de refração medido experimentalmente.

## Onda Plana Monocromática

### Forma geral da solução

A solução mais simples e fundamental da equação de onda é a **onda plana monocromática** (uma única frequência, frente de onda plana). Em uma dimensão (propagação ao longo de $z$):

$$
\boxed{E(z,t) = E_0\,\cos(kz - \omega t + \phi)}
$$

onde:

- $E_0$ é a **amplitude** do campo
- $k = \omega/v$ é o **número de onda** (rad/m)
- $\omega = 2\pi f$ é a **frequência angular** (rad/s)
- $\phi$ é a **fase inicial**

Verificação: $\dfrac{\partial^2E}{\partial z^2} = -k^2E$ e $\dfrac{\partial^2E}{\partial t^2} = -\omega^2E$. Substituindo na equação de onda:

$$
-k^2E - \mu\varepsilon(-\omega^2)E = 0 \quad\Rightarrow\quad k^2 = \mu\varepsilon\,\omega^2 \quad\Rightarrow\quad k = \omega\sqrt{\mu\varepsilon} = \frac{\omega}{v}
$$

Consistente.

### Forma complexa (convenção fasorial)

Para simplificar os cálculos algébricos, usa-se a notação complexa:

$$
\boxed{\vec{E}(\vec{r},t) = \Re\left\{\vec{E}_0\,e^{i(\vec{k}\cdot\vec{r} - \omega t)}\right\}}
$$

Com a convenção temporal $e^{-i\omega t}$ adotada acima, o fasor espacial é:

$$
\boxed{\widetilde{\vec E}(\vec r)=\vec E_0e^{+i\vec k\cdot\vec r}}
$$

Assim, $\partial/\partial t\mapsto-i\omega$ e $\nabla\mapsto+i\vec k$. Muitos textos de engenharia escolhem $e^{+i\omega t}$; nesse caso uma onda em $+\hat k$ usa $e^{-i\vec k\cdot\vec r}$, e os sinais das substituições se invertem de modo consistente. Misturar as duas convenções produz sinais errados em Faraday e Ampère.

### Propriedades geométricas

Uma onda plana monocrômática no vácuo/meio tem:

1. $\vec{E} \perp \vec{B} \perp \vec{k}$ — os três vetores são mutuamente ortogonais (onda **transversal**);
2. As frentes de onda ($\vec{k}\cdot\vec{r} - \omega t = \text{const.}$) são planos perpendiculares a $\vec{k}$;
3. A **velocidade de fase** $v_p = \omega/k = 1/\sqrt{\mu\varepsilon}$ é a velocidade com que se movem as frentes de onda;
4. A **velocidade de grupo** $v_g = d\omega/dk$ (igual a $v_p$ em meios sem dispersão — sem perdas, $\varepsilon$ e $\mu$ constantes com a frequência).

## Relação E/B e Impedância Intrínseca

### Dedução da relação entre as amplitudes

Partindo da Lei de Faraday no domínio da frequência (fasorial):

$$
\nabla\times\vec{E} = i\omega\vec{B} \quad\Rightarrow\quad \vec{B} = \frac{1}{i\omega}\,\nabla\times\vec{E}
$$

Para uma onda plana com $\vec{E} = E_0\hat{x}\,e^{-ikz}$ propagando-se em $+\hat{z}$:

$$
\nabla\times\vec{E} = -\frac{\partial E_x}{\partial z}\,\hat{y} = ikE_0\,e^{-ikz}\,\hat{y}
$$

Logo:

$$
\vec{B} = \frac{ik}{i\omega}\,E_0\,e^{-ikz}\,\hat{y} = \frac{k}{\omega}\,E_0\,e^{-ikz}\,\hat{y} = \frac{1}{v}\,E_0\,e^{-ikz}\,\hat{y}
$$

Definindo $B_0 = E_0/v$:

$$
\boxed{\vec{B}(\vec{r},t) = \frac{1}{v}\,\hat{k}\times\vec{E}(\vec{r},t)}
$$

ou equivalentemente:

$$
\boxed{\vec{E}(\vec{r},t) = v\,\vec{B}(\vec{r},t)\times\hat{k}}
$$

onde $\hat{k}$ é o versor de propagação. Em termos de amplitudes:

$$
\boxed{B_0 = \frac{E_0}{v} = \sqrt{\mu\varepsilon}\,E_0}
$$

### Impedância intrínseca do meio

Define-se a **impedância intrínseca** (ou característic) do meio como a razão entre as amplitudes dos campos elétrico e magnético (mais precisamente, entre $\vec{E}$ e o campo magnético de H, $\vec{H}=\vec{B}/\mu$):

$$
\boxed{\eta \equiv \frac{E_0}{H_0} = \frac{E_0}{B_0/\mu} = \mu v = \sqrt{\frac{\mu}{\varepsilon}}}
$$

No vácuo:

$$
\boxed{\eta_0 = \sqrt{\frac{\mu_0}{\varepsilon_0}} = \mu_0 c \approx 376{,}73\;\Omega \approx 120\pi\;\Omega}
$$

Este é um dos números mais importantes do eletromagnetismo: a **impedância do vácuo** ($\approx 377\,\Omega$). Aparece em:

- Acoplamento entre ondas e antenas;
- Reflexão/refração em interfaces (coeficientes de Fresnel);
- Impedância de linhas de transmissão;
- Cálculo de radiação de antenas.

Para um meio material linear, homogêneo e sem perdas:

$$
\boxed{\eta=\eta_0\sqrt{\frac{\mu_r}{\varepsilon_r}}
=\frac{\mu_r}{n}\eta_0.}
$$

Somente em meio não magnético, $\mu_r=1$, essa relação reduz-se a $\eta=\eta_0/n$.

Exemplo: água óptica ($n=1{,}33$): $\eta \approx 377/1{,}33 \approx 283\,\Omega$.

### Energia e vetor de Poynting

A densidade de energia eletromagnética (Seção “Verificação: a solução satisfaz as equações de Maxwell”.5.3) em uma onda plana é:

$$
u = \frac{1}{2}\varepsilon E^2 + \frac{1}{2\mu}B^2 = \frac{1}{2}\varepsilon E_0^2\cos^2(kz-\omega t) + \frac{1}{2\mu}\left(\frac{E_0}{v}\right)^2\cos^2(kz-\omega t)
$$

Como $v = 1/\sqrt{\mu\varepsilon}$, temos $\mu = 1/(\varepsilon v^2)$, e o segundo termo se torna:

$$
\frac{1}{2}\cdot\varepsilon v^2\cdot\frac{E_0^2}{v^2}\cos^2 = \frac{1}{2}\varepsilon E_0^2\cos^2
$$

**As duas contribuições são iguais neste caso.** Para uma onda plana progressiva em meio linear, homogêneo, isotrópico e sem perdas, as densidades elétrica e magnética instantâneas coincidem:

$$
u_{\text{total}} = \varepsilon E^2 = \frac{B^2}{\mu}
$$

A energia flui com velocidade $v$. O fluxo de energia (potência por unidade de área) é dado pelo **vetor de Poynting**:

$$
\boxed{\vec S\equiv\vec E\times\vec H=\frac1\mu\,\vec E\times\vec B}
$$

O produto $\vec B\times\vec B$ seria identicamente nulo e não representa fluxo de energia. Em campos reativos, ondas estacionárias, meios dispersivos ou com perdas, as parcelas elétrica e magnética não precisam ser iguais ponto a ponto; a interpretação da densidade armazenada também requer mais cuidado.

Para a onda plana acima ($\vec{E}=E_0\cos(kz-\omega t)\,\hat{x}$, $\vec{B}=\dfrac{E_0}{v}\cos(kz-\omega t)\,\hat{y}$, propagando-se em $+\hat{z}$):

$$
\vec{S} = E_0\cos(kz-\omega t)\,\hat{x} \times \frac{E_0}{\mu v}\cos(kz-\omega t)\,\hat{y} = \frac{E_0^2}{\mu v}\cos^2(kz-\omega t)\,\hat{z} = \frac{E_0^2}{\eta}\cos^2(kz-\omega t)\,\hat{z}
$$

A potência média (valor ao longo de um período):

$$
\boxed{\langle S\rangle = \frac{E_0^2}{2\eta} = \frac{1}{2}\,\eta\,H_0^2 = \frac{1}{2}\,E_0 H_0}
$$

Esta é a **intensidade** da onda. Para ondas de luz/laser, é a grandeza medida por fotodetectores.

## Verificação: a solução satisfaz as equações de Maxwell

### Teste direto

Considere a onda plana:

$$
\vec{E}(z,t) = E_0\cos(kz-\omega t)\,\hat{x}, \qquad \vec{B}(z,t) = \frac{E_0}{v}\cos(kz-\omega t)\,\hat{y}
$$

Verificamos cada uma das quatro equações de Maxwell no vácuo:

| Eq.                                                                   | Verificação                                                                                                                                                                                                                                                                                                               | Resultado |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| (I) $\nabla\cdot\vec{E}=0$                                            | $\partial E_x/\partial x = 0$ (E só depende de $z$)                                                                                                                                                                                                                                                                       | ✓         |
| (II) $\nabla\cdot\vec{B}=0$                                           | $\partial B_y/\partial y = 0$ (B só depende de $z$)                                                                                                                                                                                                                                                                       | ✓         |
| (III) $\nabla\times\vec{E}=-\partial\vec{B}/\partial t$ | Como $(\nabla\times\vec E)_y=\partial E_x/\partial z$, LHS $=-kE_0\sin(kz-\omega t)\hat y$. RHS $=-(\omega E_0/v)\sin(kz-\omega t)\hat y$. São iguais pois $k=\omega/v$. | ✓ |
| (IV) $\nabla\times\vec{B}=\mu\varepsilon\,\partial\vec{E}/\partial t$ | Como $(\nabla\times\vec B)_x=-\partial B_y/\partial z$, LHS $=(kE_0/v)\sin(kz-\omega t)\hat x$. RHS $=\mu\varepsilon\omega E_0\sin(kz-\omega t)\hat x$. São iguais pois $k/v=\omega\mu\varepsilon$. | ✓ |

Todas as equações são satisfeitas — a onda plana monocromática é de fato uma solução válida das equações de Maxwell.

### Propriedades transversais

Note que tanto $\vec{E}$ (direção $\hat{x}$) quanto $\vec{B}$ (direção $\hat{y}$) são perpendiculares à direção de propagação $\vec{k}=\hat{z}$. Isso significa que ondas eletromagnéticas no vácuo (e em meios homogêneos sem fontes) são **ondas transversais** — os campos oscilam perpendicularmente à direção de propagação. Esta é uma diferença crucial em relação às ondas sonoras (longitudinais) e às ondas em cordas (transversais unidimensionais).

## Exercícios Resolvidos em Python

### Roteiro computacional

**Objetivo.** Verificar a equação de onda, relações entre $\vec E$, $\vec B$ e $\vec S$, e visualizar estados de polarização.

**Hipóteses.** Ondas planas monocromáticas em meios lineares, homogêneos, isotrópicos e sem perdas, salvo indicação explícita.

**Como executar.** Requer `numpy` e `matplotlib`. Verifique numericamente a transversalidade e compare $B_0=E_0/v$ e $\langle S\rangle=E_0^2/(2\eta)$.

**Resultados esperados.** Resíduo da equação de onda próximo de zero, energias elétrica e magnética médias iguais e trajetórias de polarização coerentes.

```python
import numpy as np
import matplotlib.pyplot as plt

mu0  = 4*np.pi*1e-7
eps0 = 8.854e-12
c    = 1/np.sqrt(mu0*eps0)
eta0 = np.sqrt(mu0/eps0)   # ~377 ohms

# --- 1. Equação de onda: verificação numérica ---
# Solução: E(z,t) = E0*cos(k*z - omega*t)
# Deve satisfazer d^2E/dz^2 = (1/c^2)*d^2E/dt^2

def E_onda(z, t, E0, k, omega):
    return E0 * np.cos(k*z - omega*t)

def d2E_dz2(z, t, E0, k, omega, h=1e-6):
    return (E_onda(z+h,t,E0,k,omega) - 2*E_onda(z,t,E0,k,omega) + E_onda(z-h,t,E0,k,omega))/h**2

def d2E_dt2(z, t, E0, k, omega, h=1e-6):
    return (E_onda(z,t+h,E0,k,omega) - 2*E_onda(z,t,E0,k,omega) + E_onda(z,t-h,E0,k,omega))/h**2

k = 2*np.pi / 500e-9    # luz verde, lambda = 500 nm
omega = c * k
z, t = 1e-6, 1e-15
LHS = d2E_dz2(z, t, 1.0, k, omega)
RHS = (1/c**2) * d2E_dt2(z, t, 1.0, k, omega)
print(f"Equação de onda numérica: LHS={LHS:.4e}, RHS={RHS:.4e}, erro={abs(LHS-RHS)/abs(LHS):.2e}")

# --- 2. Onda em diferentes meios ---
def indice_refracao(eps_r, mu_r=1.0):
    return np.sqrt(eps_r * mu_r)

def velocidade(eps_r, mu_r=1.0):
    return c / np.sqrt(eps_r * mu_r)

def impedancia(eps_r, mu_r=1.0):
    return np.sqrt(mu_r/mu0 * eps0/eps_r) if False else np.sqrt(mu0*mu_r/(eps0*eps_r))

meios = {
    "vácuo": (1.0, 1.0),
    "ar": (1.0006, 1.0),
    "água (óptico)": (1.77**2, 1.0),
    "vidro crown": (2.5, 1.0),
    "silício": (11.7, 1.0),
}

print("\nVelocidade e índice de refração em diferentes meios:")
for nome, (er, mur) in meios.items():
    n = indice_refracao(er, mur)
    v = velocidade(er, mur)
    eta = impedancia(er, mur)
    print(f"  {nome:15s}: n={n:5.2f}, v={v/1e8:.2f}×10⁸ m/s, η={eta:.1f} Ω")

# --- 3. Onda plana: visualização E e B ---
z = np.linspace(0, 4*np.pi/k, 500)
t_val = 0.0
E = np.cos(k*z - omega*t_val)
B = (1/(c)) * np.cos(k*z - omega*t_val)  # B = E/v no vácuo

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6))
ax1.plot(z*1e9, E, 'b', linewidth=1.5)
ax1.set_ylabel(r'$E/E_0$')
ax1.set_title('Onda plana monocromática: campo elétrico')
ax1.grid(True, alpha=0.3)
ax2.plot(z*1e9, B*377, 'r', linewidth=1.5)  # escala B em unidades de E/eta
ax2.set_ylabel(r'$B\cdot\eta$ (escala E)')
ax2.set_xlabel('z (nm)')
ax2.set_title('Campo magnético (escala comparável a E)')
ax2.grid(True, alpha=0.3)
plt.tight_layout()

# --- 4. Vetor de Poynting ---
z2 = np.linspace(0, 2*np.pi/k, 500)
E_inst = np.cos(k*z2)
S_inst = E_inst**2 / eta0   # S = E^2 / eta, instantâneo
S_media = np.mean(S_inst)
print(f"\nPonto de S(t): pico={np.max(S_inst)/eta0*eta0:.4f} W/m², "
      f"média={S_media:.4f} W/m², razão pico/média={np.max(S_inst)/S_media:.2f}×")

# --- 5. Comparação: energia elétrica vs. magnética ---
E_arr = np.linspace(-np.pi, np.pi, 300)
u_E = 0.5 * eps0 * np.cos(E_arr)**2
u_B = 0.5 * (1/c)**2 / mu0 * np.cos(E_arr)**2  # B = E/c
print(f"\nEnergia elétrica pico: {np.max(u_E)/1e-15:.2f} fJ/m³")
print(f"Energia magnética pico: {np.max(u_B)/1e-15:.2f} fJ/m³")
print(f"Razão u_E/u_B: {np.max(u_E)/np.max(u_B):.6f} (deve ser 1)")
```

### Experimento: polarização como trajetória da ponta de $\vec E$

**Experimento**: em um ponto fixo do espaço, duas componentes transversais com diferença de fase descrevem uma reta, elipse ou círculo. O gráfico abaixo torna a definição de polarização geométrica e mensurável.

```python
import numpy as np
import matplotlib.pyplot as plt

fase = np.linspace(0, 2*np.pi, 600)
casos = {
    "linear ($\\delta=0$)": (1.0, 0.6, 0.0),
    "elíptica ($\\delta=\\pi/3$)": (1.0, 0.6, np.pi/3),
    "circular ($\\delta=\\pi/2$)": (1.0, 1.0, np.pi/2),
}

fig, axes = plt.subplots(1, 3, figsize=(11, 3.6))
for ax, (nome, (Ax, Ay, delta)) in zip(axes, casos.items()):
    Ex = Ax*np.cos(fase)
    Ey = Ay*np.cos(fase + delta)
    ax.plot(Ex, Ey, color="#2563eb", lw=2)
    j = 55
    ax.annotate("", (Ex[j+8], Ey[j+8]), (Ex[j], Ey[j]),
                arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.8))
    ax.set(aspect="equal", xlim=(-1.15,1.15), ylim=(-1.15,1.15),
           xlabel="$E_x/E_0$", ylabel="$E_y/E_0$", title=nome)
    ax.grid(alpha=.25)
plt.tight_layout()

print("Circularidade do terceiro caso:",
      f"máx(|E|)-mín(|E|)={np.ptp(np.hypot(np.cos(fase), np.cos(fase+np.pi/2))):.2e}")
```

**Insight físico**: polarização não descreve a forma espacial da onda, mas a trajetória temporal da ponta do campo transversal em um ponto fixo. A direção de propagação continua perpendicular ao plano desses gráficos.

**Cheque dimensional**: $E_x/E_0$ e $E_y/E_0$ são adimensionais; por isso a geometria da polarização independe da unidade escolhida para o campo.

---

### Exemplo Resolvido Passo a Passo: Vetor de Poynting e Intensidade de uma Onda Plana

**Problema**: Uma onda eletromagnética plana no vácuo se propaga na direção $+z$ e tem campo elétrico dado por $\vec{E}(z,t) = E_0\cos(kz-\omega t)\,\hat x$, com $E_0 = 500\,\text{V/m}$. Determine: (a) o campo magnético $\vec{B}(z,t)$; (b) o vetor de Poynting instantâneo $\vec{S}(z,t)$; (c) a intensidade média (potência por unidade de área) $I$.

**Passo 1: Determinar o campo magnético $\vec{B}(z,t)$.**  
Para uma onda plana no vácuo, os campos $\vec{E}$ e $\vec{B}$ são perpendiculares entre si e à direção de propagação, e estão em fase. A relação de amplitudes é $E_0 = cB_0$, onde $c \approx 3\times10^8\,\text{m/s}$. Como $\vec{E}$ está na direção $\hat x$ e a propagação é na direção $\hat z$, o campo $\vec{B}$ deve estar na direção $\hat y$ (pois $\hat x \times \hat y = \hat z$).

A amplitude do campo magnético é:
$$
B_0 = \frac{E_0}{c} = \frac{500\,\text{V/m}}{3\times10^8\,\text{m/s}} \approx 1{,}667\times10^{-6}\,\text{T} = 1{,}667\,\mu\text{T}
$$

O campo magnético é:
$$
\vec{B}(z,t) = B_0\cos(kz-\omega t)\,\hat y = (1{,}667\times10^{-6}\,\text{T})\cos(kz-\omega t)\,\hat y
$$

**Resposta (a)**: $\boxed{\vec{B}(z,t) \approx (1{,}667\times10^{-6}\,\text{T})\cos(kz-\omega t)\,\hat y}$

**Passo 2: Calcular o vetor de Poynting instantâneo $\vec{S}(z,t)$.**  
O vetor de Poynting é definido como:
$$
\vec{S} = \frac{1}{\mu_0}\vec{E}\times\vec{B}
$$

Substituindo $\vec{E}$ e $\vec{B}$:
$$
\vec{S}(z,t) = \frac{1}{\mu_0}\left[E_0\cos(kz-\omega t)\,\hat x\right]\times\left[B_0\cos(kz-\omega t)\,\hat y\right]
$$

Como $\hat x\times\hat y = \hat z$ e $E_0 B_0 = E_0^2/c = E_0^2\mu_0\varepsilon_0 c = E_0^2/\eta_0$ (onde $\eta_0 = \sqrt{\mu_0/\varepsilon_0} \approx 376{,}7\,\Omega$ é a impedância intrínseca do vácuo):
$$
\vec{S}(z,t) = \frac{E_0 B_0}{\mu_0}\cos^2(kz-\omega t)\,\hat z = \frac{E_0^2}{\mu_0 c}\cos^2(kz-\omega t)\,\hat z = \frac{E_0^2}{\eta_0}\cos^2(kz-\omega t)\,\hat z
$$

Com $E_0 = 500\,\text{V/m}$ e $\eta_0 \approx 376{,}7\,\Omega$:
$$
S_{\text{pico}} = \frac{E_0^2}{\eta_0} = \frac{(500)^2}{376{,}7} \approx \frac{250000}{376{,}7} \approx 663{,}6\,\text{W/m}^2
$$

**Resposta (b)**: $\boxed{\vec{S}(z,t) \approx (663{,}6\,\text{W/m}^2)\cos^2(kz-\omega t)\,\hat z}$

**Passo 3: Calcular a intensidade média $I$.**  
A intensidade média é o valor médio do vetor de Poynting no tempo. Como a média de $\cos^2(kz-\omega t)$ no tempo é $1/2$:
$$
I = \langle S \rangle = \frac{1}{2}\frac{E_0^2}{\eta_0} = \frac{S_{\text{pico}}}{2}
$$

$$
I = \frac{663{,}6\,\text{W/m}^2}{2} \approx 331{,}8\,\text{W/m}^2
$$

Ou, usando a fórmula $I = \frac{1}{2}\varepsilon_0 c E_0^2$:
$$
I = \frac{1}{2}(8{,}854\times10^{-12}\,\text{F/m})(3\times10^8\,\text{m/s})(500\,\text{V/m})^2
$$
$$
= \frac{1}{2}(8{,}854\times10^{-12})(3\times10^8)(250000) \approx 331{,}9\,\text{W/m}^2
$$

**Resposta (c)**: $\boxed{I \approx 332\,\text{W/m}^2}$

---

## Resumo do Capítulo

### Fórmulas-Chave

| Conceito | Fórmula | Aplicações |
|---|---|---|
| Equação de onda (vácuo) | $\nabla^2\vec{E} = \mu_0\varepsilon_0\,\dfrac{\partial^2\vec{E}}{\partial t^2}$ | Propagação de ondas |
| Velocidade da luz | $c = \dfrac{1}{\sqrt{\mu_0\varepsilon_0}} \approx 3\times10^8\,\text{m/s}$ | Velocidade no vácuo |
| Velocidade em meio material | $v = \dfrac{1}{\sqrt{\mu\varepsilon}} = \dfrac{c}{n}$ | Índice de refração $n=\sqrt{\varepsilon_r\mu_r}$ |
| Onda plana monocromática | $\vec{E}(z,t) = \vec{E}_0\cos(kz-\omega t + \phi)$ | Solução geral |
| Número de onda | $k = \dfrac{2\pi}{\lambda} = \dfrac{\omega}{v}$ | Relação espacial |
| Impedância intrínseca | $\eta = \sqrt{\dfrac{\mu}{\varepsilon}}$, $\eta_0 \approx 376{,}7\,\Omega$ | Relação $E/H$ |
| Relação $E/B$ | $E = vB = cB$ (vácuo) | Campos em onda plana |
| Vetor de Poynting | $\vec{S} = \dfrac{1}{\mu_0}\vec{E}\times\vec{B}$ | Fluxo de energia |
| Intensidade média | $I = \langle S \rangle = \dfrac{1}{2}\varepsilon_0 c E_0^2$ | Potência por área |

### Propriedades das Ondas Planas no Vácuo

| Propriedade | Descrição |
|---|---|
| Transversalidade | $\vec E \perp \vec B \perp \text{direção de propagação}$ |
| Fase | $\vec E$ e $\vec B$ estão em fase no vácuo |
| Relação de amplitudes | $E_0 = cB_0$ |
| Impedância | $\eta_0 = \dfrac{E_0}{H_0} \approx 376{,}7\,\Omega$ |

### Conceitos-Chave

1. **Equação de onda**: Derivada das equações de Maxwell; descreve propagação de perturbações nos campos.
2. **Velocidade da luz**: $c = 1/\sqrt{\mu_0\varepsilon_0}$ — as ondas eletromagnéticas são a luz.
3. **Onda plana monocromática**: Solução com frequência única e frente de onda plana.
4. **Transversalidade**: Campos $\vec E$ e $\vec B$ são perpendiculares à direção de propagação.
5. **Impedância intrínseca**: $\eta = E/H$ — determina a reflexão e transmissão em interfaces.
6. **Vetor de Poynting**: Descreve o fluxo de energia eletromagnética.

::: verificacao
**Verificação Rápida (Concept Check):**  
1. Uma onda eletromagnética plana no vácuo é **transversal** ou **longitudinal**? **Transversal** ($\vec E \perp \vec B \perp$ direção de propagação).  
2. No vácuo, os campos $\vec E$ e $\vec B$ estão **em fase** ou **defasados de 90°**? **Em fase.**  
3. A velocidade da luz no vácuo $c$ depende da **frequência** ou é **constante** para todas as frequências? **Constante** ($c \approx 3\times10^8\,\text{m/s}$).
:::

## Lista de Exercícios Propostos

Use, quando necessário, $\mu_0 = 4\pi\times10^{-7}\;\text{H/m}$, $\varepsilon_0 = 8{,}854\times10^{-12}\;\text{F/m}$, $c \approx 2{,}998\times10^8\;\text{m/s} \approx 3\times10^8\;\text{m/s}$ e $\eta_0 \approx 376{,}7\;\Omega \approx 120\pi\;\Omega$.

**E1** — Partindo das equações de Maxwell no vácuo sem fontes, deduza a equação de onda para o campo $\vec{B}$ (em vez de $\vec{E}$), mostrando explicitamente cada passo (rotacional de que equação, qual substituição, qual identidade vetorial).

**E2** — Mostre, a partir de $\dfrac{1}{v^2}=\mu_0\varepsilon_0$, que uma variação de $1\%$ em $\varepsilon_0$ (mantendo $\mu_0$ fixo) produz uma variação de aproximadamente $-0{,}5\%$ em $v$. Generalize para uma variação percentual pequena arbitrária $\delta$.

**E3** — Um meio dielétrico tem $\varepsilon_r = 6{,}25$ e $\mu_r=1$. Calcule (a) o índice de refração $n$; (b) a velocidade de fase $v$; (c) a impedância intrínseca $\eta$.

**E4** — Uma onda plana monocromática se propaga no vácuo com comprimento de onda $\lambda = 600\;\text{nm}$ (luz visível, laranja-avermelhada). Calcule (a) a frequência $f$; (b) o número de onda $k$; (c) a frequência angular $\omega$.

**E5** — Uma onda de rádio no vácuo tem frequência $f = 100\;\text{MHz}$ (FM). Calcule (a) o comprimento de onda $\lambda$; (b) o número de onda $k$.

**E6** — Uma onda plana no vácuo tem comprimento de onda $\lambda = 300\;\text{nm}$ (ultravioleta). Calcule $k$ e $f$, e verifique numericamente que $k = \omega/c$.

**E7** — O teflon (PTFE) tem $\varepsilon_r \approx 2{,}1$ e $\mu_r\approx1$. Calcule (a) o índice de refração $n$; (b) a velocidade de fase $v$; (c) a impedância intrínseca $\eta$.

**E8** — Uma onda plana no vácuo tem amplitude do campo elétrico $E_0 = 50\;\text{V/m}$. Calcule (a) a amplitude $B_0$ do campo magnético; (b) a amplitude $H_0$; (c) a intensidade média $\langle S\rangle$.

**E9 (desafio)** — Uma onda plana monocromática viaja em um dielétrico não magnético ($\mu_r=1$) com $\varepsilon_r = 4$, e tem amplitude de campo elétrico $E_0 = 20\;\text{V/m}$. Calcule (a) o índice de refração $n$ e a velocidade de fase $v$; (b) a impedância intrínseca $\eta$ do meio; (c) a amplitude $B_0$ do campo magnético (compare com o valor que essa mesma onda teria no vácuo, com o mesmo $E_0$); (d) a intensidade média $\langle S\rangle$.

**E10** — Um laser no vácuo tem intensidade média $\langle S\rangle = 1000\;\text{W/m}^2$. Calcule a amplitude do campo elétrico $E_0$.

**E11** — Uma onda plana monocromática se propaga em um vidro com $\varepsilon_r = 2{,}25$, $\mu_r=1$. (a) Calcule $n$ e $v$. (b) Se a frequência da onda é $f = 5\times10^{14}\;\text{Hz}$, calcule o número de onda $k$ dentro do vidro. (c) Compare com o número de onda que a mesma onda (mesma frequência) teria no vácuo.

**E12 (desafio)** — Considere o campo elétrico complexo (fasorial)

$$
\vec{E}(z,t) = E_0\cos(kz-\omega t)\,\hat{x} + E_0\sin(kz-\omega t)\,\hat{y}
$$

propagando-se no vácuo em $+\hat{z}$ — uma onda com **duas componentes transversais simultâneas** (polarização circular). (a) Verifique que $\nabla\cdot\vec{E}=0$. (b) Use a lei de Faraday para deduzir $\vec{B}(z,t)$ a partir de $\vec{E}(z,t)$. (c) Verifique que o par $(\vec{E},\vec{B})$ satisfaz a lei de Ampère-Maxwell, com a mesma condição $k=\omega/c$ já obtida para a onda de uma componente. (d) Mostre que, em todo instante, $\vec{B} = \dfrac{1}{c}\,\hat{z}\times\vec{E}$, isto é, a relação geral da Seção “Dedução da relação entre as amplitudes” vale também para esta onda de duas componentes.

**E13** — Um forno de micro-ondas opera em $f = 2{,}45\;\text{GHz}$ no ar (vácuo, para fins práticos). Calcule (a) o comprimento de onda $\lambda$; (b) o número de onda $k$; (c) o período $T$ da oscilação.

**E14 (desafio)** — Um meio não magnético ($\mu_r=1$) desconhecido tem impedância intrínseca medida $\eta = 250\;\Omega$. (a) Determine o índice de refração $n$ e a permissividade relativa $\varepsilon_r$ do meio. (b) Determine a velocidade de fase $v$. (c) Se uma onda plana nesse meio tem $E_0 = 10\;\text{V/m}$, calcule $B_0$ e a intensidade média $\langle S\rangle$, e verifique que $\langle S\rangle = \tfrac12 E_0 H_0$.

## Gabarito

### E1

Partimos de (III) e (IV) do vácuo sem fontes:

$$
\nabla\times\vec{E} = -\frac{\partial\vec{B}}{\partial t} \qquad\text{(III)}, \qquad \nabla\times\vec{B} = \mu_0\varepsilon_0\,\frac{\partial\vec{E}}{\partial t}\qquad\text{(IV)}
$$

Tomamos o rotacional de (IV):

$$
\nabla\times(\nabla\times\vec{B}) = \mu_0\varepsilon_0\,\frac{\partial}{\partial t}(\nabla\times\vec{E})
$$

Substituindo $\nabla\times\vec{E}$ por (III):

$$
\nabla\times(\nabla\times\vec{B}) = \mu_0\varepsilon_0\,\frac{\partial}{\partial t}\left(-\frac{\partial\vec{B}}{\partial t}\right) = -\mu_0\varepsilon_0\,\frac{\partial^2\vec{B}}{\partial t^2}
$$

Usamos a identidade vetorial no lado esquerdo: $\nabla\times(\nabla\times\vec{B}) = \nabla(\nabla\cdot\vec{B}) - \nabla^2\vec{B}$. Pela equação (II), $\nabla\cdot\vec{B}=0$ (sempre, mesmo com fontes), logo:

$$
\nabla\times(\nabla\times\vec{B}) = -\nabla^2\vec{B}
$$

Igualando:

$$
-\nabla^2\vec{B} = -\mu_0\varepsilon_0\,\frac{\partial^2\vec{B}}{\partial t^2}
$$

$$
\boxed{\nabla^2\vec{B} - \mu_0\varepsilon_0\,\frac{\partial^2\vec{B}}{\partial t^2} = 0}
$$

Idêntica em forma à equação de onda para $\vec E$, confirmando que $\vec B$ também se propaga com $v=1/\sqrt{\mu_0\varepsilon_0}=c$.

### E2

Temos $v = (\mu_0\varepsilon_0)^{-1/2} = \mu_0^{-1/2}\varepsilon_0^{-1/2}$. Tomando o logaritmo:

$$
\ln v = -\tfrac12\ln\mu_0 - \tfrac12\ln\varepsilon_0
$$

Diferenciando (com $\mu_0$ fixo, $d\mu_0=0$):

$$
\frac{dv}{v} = -\frac12\,\frac{d\varepsilon_0}{\varepsilon_0}
$$

Ou seja, para uma variação percentual pequena $\delta \equiv d\varepsilon_0/\varepsilon_0$:

$$
\boxed{\frac{dv}{v} = -\frac{\delta}{2}}
$$

Com $\delta = 1\% = 0{,}01$: $dv/v = -0{,}005 = -0{,}5\%$. Confirmado: um aumento de $1\%$ em $\varepsilon_0$ produz uma *redução* de aproximadamente $0{,}5\%$ em $v$ (o sinal negativo reflete que $v$ decresce quando $\varepsilon_0$ cresce, e o fator $1/2$ vem do expoente $-1/2$ na raiz quadrada).

### E3

Dados: $\varepsilon_r = 6{,}25$, $\mu_r=1$.

(a) Índice de refração:

$$
n = \sqrt{\varepsilon_r\mu_r} = \sqrt{6{,}25} = 2{,}5
$$

(b) Velocidade de fase:

$$
v = \frac{c}{n} = \frac{2{,}998\times10^8}{2{,}5} \approx 1{,}199\times10^8\;\text{m/s}
$$

(c) Impedância intrínseca:

$$
\eta = \frac{\eta_0}{n} = \frac{376{,}7}{2{,}5} \approx 150{,}7\;\Omega
$$

$$
\boxed{n=2{,}5,\quad v\approx1{,}20\times10^8\;\text{m/s},\quad \eta\approx150{,}7\;\Omega}
$$

### E4

Dado $\lambda = 600\;\text{nm} = 6\times10^{-7}\;\text{m}$, no vácuo ($v=c$).

(a) Frequência:

$$
f = \frac{c}{\lambda} = \frac{2{,}998\times10^8}{6\times10^{-7}} \approx 4{,}997\times10^{14}\;\text{Hz}
$$

(b) Número de onda:

$$
k = \frac{2\pi}{\lambda} = \frac{2\pi}{6\times10^{-7}} \approx 1{,}047\times10^{7}\;\text{rad/m}
$$

(c) Frequência angular:

$$
\omega = 2\pi f = ck \approx 2\pi\times4{,}997\times10^{14} \approx 3{,}139\times10^{15}\;\text{rad/s}
$$

$$
\boxed{f\approx5{,}00\times10^{14}\;\text{Hz},\quad k\approx1{,}047\times10^7\;\text{rad/m},\quad \omega\approx3{,}14\times10^{15}\;\text{rad/s}}
$$

### E5

Dado $f = 100\;\text{MHz} = 10^8\;\text{Hz}$, no vácuo.

(a) Comprimento de onda:

$$
\lambda = \frac{c}{f} = \frac{2{,}998\times10^8}{10^8} \approx 3{,}00\;\text{m}
$$

(b) Número de onda:

$$
k = \frac{2\pi}{\lambda} = \frac{2\pi}{3{,}00} \approx 2{,}096\;\text{rad/m}
$$

$$
\boxed{\lambda\approx3{,}00\;\text{m},\quad k\approx2{,}10\;\text{rad/m}}
$$

### E6

Dado $\lambda = 300\;\text{nm} = 3\times10^{-7}\;\text{m}$, no vácuo.

$$
k = \frac{2\pi}{\lambda} = \frac{2\pi}{3\times10^{-7}} \approx 2{,}094\times10^{7}\;\text{rad/m}
$$

$$
f = \frac{c}{\lambda} = \frac{2{,}998\times10^8}{3\times10^{-7}} \approx 9{,}993\times10^{14}\;\text{Hz}
$$

Verificação de $k=\omega/c$: $\omega = 2\pi f \approx 6{,}279\times10^{15}\;\text{rad/s}$, e

$$
\frac{\omega}{c} = \frac{6{,}279\times10^{15}}{2{,}998\times10^8} \approx 2{,}094\times10^7\;\text{rad/m} = k \quad\checkmark
$$

$$
\boxed{k\approx2{,}09\times10^7\;\text{rad/m},\quad f\approx9{,}99\times10^{14}\;\text{Hz}}
$$

### E7

Dados: $\varepsilon_r \approx 2{,}1$ (teflon), $\mu_r\approx1$.

(a) Índice de refração:

$$
n = \sqrt{2{,}1} \approx 1{,}449
$$

(b) Velocidade de fase:

$$
v = \frac{c}{n} = \frac{2{,}998\times10^8}{1{,}449} \approx 2{,}069\times10^8\;\text{m/s}
$$

(c) Impedância intrínseca:

$$
\eta = \frac{\eta_0}{n} = \frac{376{,}7}{1{,}449} \approx 260{,}0\;\Omega
$$

$$
\boxed{n\approx1{,}45,\quad v\approx2{,}07\times10^8\;\text{m/s},\quad\eta\approx260\;\Omega}
$$

### E8

Dado $E_0 = 50\;\text{V/m}$ no vácuo.

(a) Amplitude de $B$:

$$
B_0 = \frac{E_0}{c} = \frac{50}{2{,}998\times10^8} \approx 1{,}668\times10^{-7}\;\text{T}
$$

(b) Amplitude de $H$:

$$
H_0 = \frac{B_0}{\mu_0} = \frac{E_0}{\eta_0} = \frac{50}{376{,}7} \approx 0{,}1327\;\text{A/m}
$$

(c) Intensidade média:

$$
\langle S\rangle = \frac{E_0^2}{2\eta_0} = \frac{50^2}{2\times376{,}7} = \frac{2500}{753{,}4} \approx 3{,}318\;\text{W/m}^2
$$

$$
\boxed{B_0\approx1{,}67\times10^{-7}\;\text{T},\quad H_0\approx0{,}133\;\text{A/m},\quad\langle S\rangle\approx3{,}32\;\text{W/m}^2}
$$

### E9 (desafio)

Dados: $\varepsilon_r=4$, $\mu_r=1$, $E_0 = 20\;\text{V/m}$ (no dielétrico).

(a) Índice de refração e velocidade de fase:

$$
n = \sqrt{\varepsilon_r\mu_r} = \sqrt{4} = 2
$$

$$
v = \frac{c}{n} = \frac{2{,}998\times10^8}{2} \approx 1{,}499\times10^8\;\text{m/s}
$$

(b) Impedância intrínseca:

$$
\eta = \frac{\eta_0}{n} = \frac{376{,}7}{2} \approx 188{,}4\;\Omega
$$

(c) Amplitude de $B$ dentro do meio, usando $B_0 = E_0/v$:

$$
B_0 = \frac{E_0}{v} = \frac{20}{1{,}499\times10^8} \approx 1{,}334\times10^{-7}\;\text{T}
$$

Comparação com o vácuo: se a mesma onda (mesmo $E_0=20\;\text{V/m}$) estivesse no vácuo, teríamos $B_0^{\text{vácuo}} = E_0/c \approx 6{,}671\times10^{-8}\;\text{T}$. Logo:

$$
\frac{B_0^{\text{meio}}}{B_0^{\text{vácuo}}} = \frac{c}{v} = n = 2
$$

isto é, **para o mesmo $E_0$, o campo $B$ é duas vezes maior no dielétrico** — consequência direta de $B_0=E_0/v$ e $v=c/n$.

(d) Intensidade média:

$$
\langle S\rangle = \frac{E_0^2}{2\eta} = \frac{20^2}{2\times188{,}4} = \frac{400}{376{,}7} \approx 1{,}062\;\text{W/m}^2
$$

$$
\boxed{n=2,\quad v\approx1{,}50\times10^8\;\text{m/s},\quad \eta\approx188{,}4\;\Omega,\quad B_0\approx1{,}33\times10^{-7}\;\text{T}\;(=2\,B_0^{\text{vácuo}}),\quad \langle S\rangle\approx1{,}06\;\text{W/m}^2}
$$

### E10

Dado $\langle S\rangle = 1000\;\text{W/m}^2$ no vácuo. Da fórmula $\langle S\rangle = E_0^2/(2\eta_0)$:

$$
E_0 = \sqrt{2\eta_0\langle S\rangle} = \sqrt{2\times376{,}7\times1000} = \sqrt{753\,400} \approx 868{,}0\;\text{V/m}
$$

$$
\boxed{E_0 \approx 868\;\text{V/m}}
$$

(Valor tipicamente encontrado em lasers industriais de potência moderada focalizados — magnitude bem maior que a de uma onda de rádio, mas ainda muito menor que o campo de ruptura dielétrica do ar, $\sim3\times10^6\;\text{V/m}$.)

### E11

Dados: $\varepsilon_r = 2{,}25$, $\mu_r=1$ (vidro), $f = 5\times10^{14}\;\text{Hz}$.

(a) Índice de refração e velocidade:

$$
n = \sqrt{2{,}25} = 1{,}5
$$

$$
v = \frac{c}{n} = \frac{2{,}998\times10^8}{1{,}5} \approx 1{,}999\times10^8\;\text{m/s}
$$

(b) Número de onda no vidro: como a frequência é a mesma dentro e fora do meio (imposta pela fonte), usamos $k = \omega/v = 2\pi f/v$:

$$
k_{\text{vidro}} = \frac{2\pi f}{v} = \frac{2\pi\times5\times10^{14}}{1{,}999\times10^8} \approx 1{,}572\times10^{7}\;\text{rad/m}
$$

(c) Número de onda no vácuo, mesma frequência:

$$
k_{\text{vácuo}} = \frac{2\pi f}{c} = \frac{2\pi\times5\times10^{14}}{2{,}998\times10^8} \approx 1{,}048\times10^{7}\;\text{rad/m}
$$

Note que $k_{\text{vidro}}/k_{\text{vácuo}} = c/v = n = 1{,}5$ — o número de onda (e portanto o comprimento de onda, inversamente) muda no meio material, mas a frequência (imposta pela fonte) permanece a mesma. Este é o motivo pelo qual definimos $n$ a partir da razão de velocidades (ou de números de onda), e não da razão de frequências.

$$
\boxed{n=1{,}5,\quad v\approx2{,}00\times10^8\;\text{m/s},\quad k_{\text{vidro}}\approx1{,}57\times10^7\;\text{rad/m},\quad k_{\text{vácuo}}\approx1{,}05\times10^7\;\text{rad/m}}
$$

### E12 (desafio)

Temos $\vec{E}(z,t) = E_0\cos(kz-\omega t)\,\hat{x} + E_0\sin(kz-\omega t)\,\hat{y}$, com $E_z=0$ e nenhuma dependência em $x$ ou $y$.

**(a) Divergência.** Como $E_x$ e $E_y$ dependem apenas de $z$ (e $t$), e $E_z=0$:

$$
\nabla\cdot\vec{E} = \frac{\partial E_x}{\partial x} + \frac{\partial E_y}{\partial y} + \frac{\partial E_z}{\partial z} = 0+0+0 = 0 \quad\checkmark
$$

**(b) Campo $\vec B$ via lei de Faraday.** Para um campo da forma $\vec{E}=(E_x(z,t),E_y(z,t),0)$, o rotacional é:

$$
\nabla\times\vec{E} = \left(-\frac{\partial E_y}{\partial z}\right)\hat{x} + \left(\frac{\partial E_x}{\partial z}\right)\hat{y}
$$

Calculando as derivadas:

$$
\frac{\partial E_x}{\partial z} = -E_0k\sin(kz-\omega t), \qquad \frac{\partial E_y}{\partial z} = E_0k\cos(kz-\omega t)
$$

Logo:

$$
\nabla\times\vec{E} = -E_0k\cos(kz-\omega t)\,\hat{x} - E_0k\sin(kz-\omega t)\,\hat{y}
$$

Pela lei de Faraday, $\nabla\times\vec{E} = -\partial\vec{B}/\partial t$, ou seja $\partial\vec{B}/\partial t = -\nabla\times\vec{E}$:

$$
\frac{\partial\vec{B}}{\partial t} = E_0k\cos(kz-\omega t)\,\hat{x} + E_0k\sin(kz-\omega t)\,\hat{y}
$$

Integrando em $t$ (sem constante de integração, pois buscamos a solução oscilante particular, sem campo estático sobreposto):

$$
\boxed{\vec{B}(z,t) = -\frac{E_0k}{\omega}\sin(kz-\omega t)\,\hat{x} + \frac{E_0k}{\omega}\cos(kz-\omega t)\,\hat{y}}
$$

**(c) Verificação da lei de Ampère-Maxwell.** Calculamos $\nabla\times\vec{B}$ do mesmo modo:

$$
\nabla\times\vec{B} = \left(-\frac{\partial B_y}{\partial z}\right)\hat{x} + \left(\frac{\partial B_x}{\partial z}\right)\hat{y}
$$

$$
\frac{\partial B_x}{\partial z} = -\frac{E_0k^2}{\omega}\cos(kz-\omega t), \qquad \frac{\partial B_y}{\partial z} = -\frac{E_0k^2}{\omega}\sin(kz-\omega t)
$$

$$
\nabla\times\vec{B} = \frac{E_0k^2}{\omega}\sin(kz-\omega t)\,\hat{x} - \frac{E_0k^2}{\omega}\cos(kz-\omega t)\,\hat{y}
$$

O lado direito de (IV) é $\mu_0\varepsilon_0\,\partial\vec{E}/\partial t$:

$$
\frac{\partial E_x}{\partial t} = E_0\omega\sin(kz-\omega t), \qquad \frac{\partial E_y}{\partial t} = -E_0\omega\cos(kz-\omega t)
$$

$$
\mu_0\varepsilon_0\,\frac{\partial\vec{E}}{\partial t} = \mu_0\varepsilon_0E_0\omega\sin(kz-\omega t)\,\hat{x} - \mu_0\varepsilon_0E_0\omega\cos(kz-\omega t)\,\hat{y}
$$

Igualando componente a componente com $\nabla\times\vec{B}$, ambas as equações ($\hat x$ e $\hat y$) exigem a mesma condição:

$$
\frac{E_0k^2}{\omega} = \mu_0\varepsilon_0E_0\omega \quad\Rightarrow\quad k^2 = \mu_0\varepsilon_0\omega^2 \quad\Rightarrow\quad k=\frac{\omega}{c}
$$

que é **exatamente** a mesma relação de dispersão já obtida para a onda de uma componente (Seção “Forma geral da solução”) — confirmando que a lei de Ampère-Maxwell é satisfeita com $k=\omega/c$. Além disso, $\nabla\cdot\vec B = \partial B_x/\partial x+\partial B_y/\partial y = 0$ trivialmente, e (III) foi usada por construção. Logo as quatro equações de Maxwell são satisfeitas.

**(d) Forma compacta $\vec{B}=\tfrac1c\hat z\times\vec E$.** Usando $k/\omega = 1/c$ (do item anterior):

$$
\vec{B}(z,t) = \frac{1}{c}\Big[-E_0\sin(kz-\omega t)\,\hat{x} + E_0\cos(kz-\omega t)\,\hat{y}\Big]
$$

Calculamos $\hat{z}\times\vec{E}$ usando $\hat z\times\hat x=\hat y$ e $\hat z\times\hat y=-\hat x$:

$$
\hat{z}\times\vec{E} = E_0\cos(kz-\omega t)\,(\hat z\times\hat x) + E_0\sin(kz-\omega t)\,(\hat z\times\hat y) = E_0\cos(kz-\omega t)\,\hat{y} - E_0\sin(kz-\omega t)\,\hat{x}
$$

que é **idêntico** à expressão de $\vec B$ multiplicada por $c$. Logo:

$$
\boxed{\vec{B}(z,t) = \frac{1}{c}\,\hat{z}\times\vec{E}(z,t)}
$$

confirmando, para esta onda de duas componentes (polarização circular), a mesma relação geral $\vec B = \frac1v\hat k\times\vec E$ deduzida na Seção “Dedução da relação entre as amplitudes” para a onda de uma componente. O resultado generaliza: a relação $\vec B=\frac1v\hat k\times\vec E$ vale para **qualquer** superposição linear de componentes transversais de uma onda plana com o mesmo $k$ e $\omega$, não apenas para a onda linearmente polarizada mais simples.

### E13

Dado $f = 2{,}45\;\text{GHz} = 2{,}45\times10^9\;\text{Hz}$, no ar (vácuo).

(a) Comprimento de onda:

$$
\lambda = \frac{c}{f} = \frac{2{,}998\times10^8}{2{,}45\times10^9} \approx 0{,}1224\;\text{m} = 12{,}24\;\text{cm}
$$

(b) Número de onda:

$$
k = \frac{2\pi}{\lambda} = \frac{2\pi}{0{,}1224} \approx 51{,}35\;\text{rad/m}
$$

(c) Período:

$$
T = \frac{1}{f} = \frac{1}{2{,}45\times10^9} \approx 4{,}082\times10^{-10}\;\text{s} \approx 0{,}408\;\text{ns}
$$

$$
\boxed{\lambda\approx12{,}2\;\text{cm},\quad k\approx51{,}3\;\text{rad/m},\quad T\approx0{,}408\;\text{ns}}
$$

### E14 (desafio)

Dado $\eta = 250\;\Omega$, meio não magnético ($\mu_r=1$).

(a) Como $\eta=\eta_0/n$ (Seção “Impedância intrínseca do meio”):

$$
n = \frac{\eta_0}{\eta} = \frac{376{,}7}{250} \approx 1{,}507
$$

Como $\mu_r=1$, $n=\sqrt{\varepsilon_r}$, logo:

$$
\varepsilon_r = n^2 \approx 1{,}507^2 \approx 2{,}271
$$

(b) Velocidade de fase:

$$
v = \frac{c}{n} = \frac{2{,}998\times10^8}{1{,}507} \approx 1{,}989\times10^8\;\text{m/s}
$$

(c) Com $E_0 = 10\;\text{V/m}$:

$$
B_0 = \frac{E_0}{v} = \frac{10}{1{,}989\times10^8} \approx 5{,}028\times10^{-8}\;\text{T}
$$

$$
\langle S\rangle = \frac{E_0^2}{2\eta} = \frac{10^2}{2\times250} = \frac{100}{500} = 0{,}200\;\text{W/m}^2
$$

Verificação via $\langle S\rangle = \tfrac12E_0H_0$: primeiro, $H_0 = E_0/\eta = 10/250 = 0{,}0400\;\text{A/m}$. Então:

$$
\tfrac12E_0H_0 = \tfrac12\times10\times0{,}0400 = 0{,}200\;\text{W/m}^2 \quad\checkmark
$$

concordando exatamente com o valor calculado por $E_0^2/(2\eta)$, como deveria ser (pois $\eta=E_0/H_0$ por definição).

$$
\boxed{n\approx1{,}51,\ \varepsilon_r\approx2{,}27,\quad v\approx1{,}99\times10^8\;\text{m/s},\quad B_0\approx5{,}03\times10^{-8}\;\text{T},\quad \langle S\rangle\approx0{,}200\;\text{W/m}^2}
$$
