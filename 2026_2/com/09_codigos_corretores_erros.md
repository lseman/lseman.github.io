# Códigos Corretores de Erros

> Sistemas de Comunicações — Apostila de Curso
> Tópicos: Codificação de Canal · Distância de Hamming · Códigos Lineares · Hamming · CRC · Códigos Convolucionais · Decodificação de Viterbi · Capacidade de Canal

## Antes de começar

Ao final, você deve quantificar redundância, detectar e corrigir erros com distância de Hamming, construir códigos lineares simples e relacionar codificação, BER e capacidade de Shannon. **Diagnóstico:** acrescentar redundância sempre reduz a taxa útil do enlace? **Evidência mínima:** codificar e decodificar um bloco Hamming, injetar erros e comparar BER antes e depois da codificação.

## Sumário

1. [Por que codificar?](#por-que-codificar)
2. [Distância de Hamming e capacidade de correção](#distância-de-hamming-e-capacidade-de-correção)
3. [Códigos lineares de bloco](#códigos-lineares-de-bloco)
4. [Código de Hamming](#código-de-hamming)
5. [CRC: detecção de erros](#crc-detecção-de-erros)
6. [Códigos convolucionais e Viterbi](#códigos-convolucionais-e-viterbi)
7. [Limite de Shannon](#limite-de-shannon)
8. [Experimentos Resolvidos em Python](#experimentos-resolvidos-em-python)
9. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
10. [Gabarito](#gabarito)
11. [Síntese e roteiro de decisão](#síntese-e-roteiro-de-decisão)

## Por que codificar?

Um código corretor de erros adiciona redundância controlada à mensagem para que o receptor detecte ou corrija erros introduzidos pelo canal. Para $k$ bits de informação transformados em uma palavra de código de $n$ bits,

$$
\boxed{R_c=\frac{k}{n}}
$$

é a taxa de código. A taxa útil do enlace diminui por um fator $R_c$, mas a confiabilidade pode melhorar tanto que a taxa líquida alcançável aumenta em canais ruidosos.

<!-- slides: break -->

### O lugar da codificação na cadeia

Não confunda três operações. A **codificação de fonte** remove redundância (compressão); a **codificação de canal** acrescenta redundância estruturada para combater erros; a **modulação** converte bits em formas de onda. Um arquivo pode ser comprimido, protegido e só então mapeado em QPSK.

**Exemplo:** Hamming $(7,4)$ produz 7 bits para cada 4 bits úteis. Se a saída do codificador opera a $7\,\mathrm{Mbit/s}$, a taxa de informação é

$$R_{\mathrm{info}}=R_cR_b=\frac47\,7=4\,\mathrm{Mbit/s}.$$

O custo imediato são 3 bits de redundância por bloco. O benefício possível é menor BER ou menor potência necessária. Comparações justas mantêm iguais a taxa útil, a largura de banda e a BER-alvo.

## Distância de Hamming e capacidade de correção

A distância de Hamming $d_H(\mathbf c_1,\mathbf c_2)$ é o número de posições diferentes entre duas palavras binárias:

$$
\boxed{d_H(\mathbf c_1,\mathbf c_2) = w_H(\mathbf c_1 \oplus \mathbf c_2)}
$$

onde $w_H(\mathbf x)$ é o peso de Hamming (número de 1s em $\mathbf x$). A distância mínima do código, $d_{min}$, determina sua capacidade:

$$
\boxed{t=\left\lfloor\frac{d_{min}-1}{2}\right\rfloor}\quad\text{erros corrigíveis},
\qquad
\boxed{d_{min}-1}\quad\text{erros detectáveis}.
$$

Por exemplo, $d_{min}=3$ permite corrigir um erro ou detectar até dois erros, mas não garante ambas as operações simultaneamente para dois erros.

### Por que dividir a distância por dois?

Imagine cada palavra válida no centro de uma esfera com todos os vetores a até $t$ erros. Para a decisão pelo vizinho mais próximo ser inequívoca, duas esferas não podem se sobrepor. Como seus centros distam pelo menos $d_{min}$, precisamos de $2t < d_{min}$.

**Exemplo passo a passo:** em $C=\{000,111\}$, $d_{min}=3$. Se $000$ chega como $010$, então

$$d_H(010,000)=1,\qquad d_H(010,111)=2,$$

e o receptor recupera $000$. Se dois bits mudarem e chegar $110$, o vizinho mais próximo será $111$: detectar dois erros não significa corrigi-los.

Para um código linear, a diferença módulo 2 de duas palavras também é uma palavra. Logo,

$$\boxed{d_{min}=\min_{\mathbf c\ne\mathbf0}w_H(\mathbf c)},$$

isto é, basta procurar o menor peso entre as palavras não nulas.

## Códigos lineares de bloco

Em um código linear binário $(n,k)$, as palavras de código formam um subespaço de dimensão $k$. A codificação pode ser escrita como

$$
\boxed{\mathbf c=\mathbf uG\pmod 2},
$$

onde $\mathbf u$ é a palavra de informação (vetor-linha de dimensão $k$) e $G$ é a matriz geradora de dimensão $k\times n$. A matriz de paridade $H$ satisfaz

$$
\boxed{H\mathbf c^T=\mathbf0\pmod2}.
$$

No receptor, a síndrome $\mathbf s=H\mathbf r^T$ vale zero para uma palavra válida. Em códigos de Hamming, cada síndrome não nula aponta diretamente a posição de um único erro.

### DEDUÇÃO: Por que a síndrome localiza o erro?

Aqui $\mathbf u$ e $\mathbf c$ são vetores-linha; $G$ mede $k\times n$, $H$ mede $(n-k)\times n$ e $GH^T=0$ em $GF(2)$. Nesse corpo, somar é fazer XOR.

Se $\mathbf r=\mathbf c+\mathbf e$, então

$$\mathbf s=H\mathbf r^T=H\mathbf c^T+H\mathbf e^T=H\mathbf e^T.$$

A síndrome depende do padrão de erro, não da mensagem. Para um erro único na posição $i$, $\mathbf e$ contém um único 1 e a síndrome é a coluna $i$ de $H$. Projetar $H$ com colunas binárias distintas permite identificar todas as posições.

**Teorema da síndrome única:** para um código de Hamming $(n,k)$ com $n=2^r-1$, $k=2^r-1-r$, a matriz $H$ tem todas as colunas não nulas de comprimento $r$ distintas. A síndrome $\mathbf s$ (vetor de $r$ bits) é exatamente o índice binário da posição do erro.

## Código de Hamming

O código Hamming $(7,4)$ transforma quatro bits em sete e possui $d_{min}=3$, logo corrige um erro por palavra. As posições $1$, $2$ e $4$ são bits de paridade; as posições $3$, $5$, $6$ e $7$ transportam dados. Uma escolha de paridades pares é:

$$
p_1=d_1\oplus d_2\oplus d_4,\quad
p_2=d_1\oplus d_3\oplus d_4,\quad
p_4=d_2\oplus d_3\oplus d_4.
$$

Se a síndrome em binário é $s_4s_2s_1$, ela fornece o índice do bit errado.

### Codificação e correção passo a passo

Para $\mathbf d=(1,0,1,1)$, reserve as potências de dois para paridade:

| Posição | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| Função | $p_1$ | $p_2$ | $d_1$ | $p_4$ | $d_2$ | $d_3$ | $d_4$ |
| Valor | 0 | 1 | 1 | 0 | 0 | 1 | 1 |

Por exemplo, $p_1=1\oplus0\oplus1=0$; calculando as demais paridades, obtemos $\mathbf c=(0,1,1,0,0,1,1)$.

Se o quinto bit for invertido, chega $\mathbf r=(0,1,1,0,1,1,1)$. Recalculando:

$$s_1=r_1\oplus r_3\oplus r_5\oplus r_7=1,$$
$$s_2=r_2\oplus r_3\oplus r_6\oplus r_7=0,$$
$$s_4=r_4\oplus r_5\oplus r_6\oplus r_7=1.$$

Assim, $s_4s_2s_1=101_2=5$: inverta a posição 5 e extraia os dados das posições 3, 5, 6 e 7.

**Limitação:** dois erros podem produzir uma síndrome que aponta uma terceira posição e causar correção indevida. Uma paridade global adicional forma um código SECDED, capaz de corrigir um erro e detectar dois.

### Códigos SECDED (Single Error Correction, Double Error Detection)

Um código SECDED adiciona um bit de paridade global ao Hamming $(7,4)$, produzindo um código $(8,4)$ com $d_{min}=4$. A paridade global verifica se o número total de 1s é par.

Com $d_{min}=4$:

- Corrige 1 erro ($t=\lfloor(4-1)/2\rfloor=1$)
- Detecta 2 erros (mas não corrige)

O receptor calcula a síndrome local $s_4s_2s_1$ e a paridade global $p_g$. Se $p_g$ falha mas a síndrome é zero, há 2 erros. Se $p_g$ falha e a síndrome é não nula, há 1 erro na posição indicada pela síndrome.

## CRC: detecção de erros

O CRC representa uma sequência de bits como polinômio sobre $GF(2)$. O transmissor divide $x^rM(x)$ pelo polinômio gerador $g(x)$ e transmite a mensagem acrescida do resto. O receptor divide a palavra recebida por $g(x)$; resto não nulo indica erro.

CRC é excelente para **detecção**, especialmente de rajadas, mas normalmente não corrige o bit errado. Em sistemas práticos, CRC é frequentemente combinado com ARQ ou com FEC.

### DEDUÇÃO: Divisão polinomial sem mistério

Considere $M=1101$ e $g=1011$, de grau 3. Acrescente três zeros a $M$ e divida $1101000$ por $1011$, usando XOR no lugar da subtração:

```
  1101000
⊕ 1011    (g × x^3)
-------
  110000
⊕ 1011    (g × x^2)
-------
  11100
⊕ 1011    (g × x^1)
-------
  1010
⊕ 1011    (g × x^0)
-------
   001
```

O resto é $001$, portanto transmite-se $1101001$. Ao dividir essa palavra por $1011$, o receptor obtém resto zero.

### Garantias de detecção do CRC

Um resto não nulo revela erro, mas resto zero não é garantia absoluta: padrões que são múltiplos de $g(x)$ passam despercebidos. Todo CRC de grau $r$ detecta:

- **Todas as rajadas de comprimento $\leq r$**
- **Todas as rajadas de comprimento $r+1$ com probabilidade $1-2^{-(r-1)}$**
- **Todas as rajadas de comprimento $> r+1$ com probabilidade $1-2^{-r}$**

Isso ocorre porque uma rajada de comprimento $L$ corresponde a um polinômio da forma $x^i(x^{L-1}+x^{L-2}+\dots+1)$. Se $L \leq r$, este polinômio não pode ser múltiplo de $g(x)$ (grau $r$).

## Códigos convolucionais e Viterbi

Um codificador convolucional possui memória: cada saída depende do bit atual e de bits anteriores. Sua taxa é dada por $R_c=k/n$; por exemplo, um codificador de taxa $1/2$ gera dois bits para cada bit de entrada.

O algoritmo de Viterbi busca a sequência mais provável no trellis. Para canal AWGN, a versão *soft decision* usa distâncias euclidianas e normalmente obtém ganho maior que a decisão dura.

### Registrador, trellis e sobreviventes

Para um codificador de taxa $1/2$, memória 2 e geradores $(7,5)_8$,

$$v_1[k]=u[k]\oplus u[k-1]\oplus u[k-2],\qquad v_2[k]=u[k]\oplus u[k-2].$$

O estado é $(u[k-1],u[k-2])$; existem quatro estados e duas transições saindo de cada um. O **trellis** apenas desenha essas transições ao longo do tempo.

Em cada instante, Viterbi (1) calcula a métrica de cada ramo, (2) soma-a ao custo acumulado, (3) mantém, para cada estado, somente o caminho de menor custo e (4) após uma profundidade de decisão, percorre os sobreviventes para trás. Decisão dura usa distância de Hamming; decisão suave usa amostras e distância euclidiana, preservando quão confiável era cada observação.

Mensagens finitas costumam receber bits de cauda para terminar no estado zero. Sem um estado final conhecido, os últimos bits têm decisão menos confiável.

### DEDUÇÃO: Métrica de decisão suave vs. dura

Para canal AWGN com amostras $y_k$, a versão *soft decision* calcula a distância euclidiana:

$$d_E^2 = \sum_k (y_k - \hat{y}_k)^2$$

onde $\hat{y}_k \in \{-1,+1\}$ é o símbolo esperado mapeado de $\{0,1\}$. Para decisão dura, cada $y_k$ é primeiro convertido para $\hat{y}_k \in \{0,1\}$ por limiar em 0, e a métrica é a distância de Hamming:

$$d_H = \sum_k \mathbb{I}(y_k^{\text{dura}} \neq \hat{y}_k^{\text{esperado}})$$

**Teorema do ganho suave:** para AWGN, a decisão suave de Viterbi oferece ganho de $\approx 2$ dB em relação à decisão dura em BER $10^{-5}$.

## Limite de Shannon

Para canal AWGN com largura de banda $B$, a capacidade é

$$
\boxed{C=B\log_2(1+S/N)}.
$$

Shannon afirma que existem códigos com probabilidade de erro arbitrariamente pequena para taxas $R<C$, usando blocos suficientemente longos; para $R>C$, comunicação confiável é impossível. O teorema não fornece um código específico nem torna a complexidade de decodificação gratuita.

Compare com $C$ a **taxa de informação**, e use a SNR referente à mesma largura de banda $B$. Se $R_{\mathrm{info}}>C$, trocar Hamming por um código moderno não basta: é necessário aumentar potência ou banda, ou reduzir a taxa útil. LDPC, turbo e códigos polares podem operar perto do limite em diferentes cenários, com custos finitos de bloco, latência e processamento.

### DEDUÇÃO: Relação entre taxa, SNR e BER

Para codificação com taxa $R_c$, a energia por bit de informação é $E_b = E_s/R_c$, onde $E_s$ é a energia por símbolo transmitido. A capacidade em termos de $E_b/N_0$ é:

$$\frac{C}{R_b} = \log_2(1 + \frac{E_b}{N_0}R_c)$$

O **limite de Shannon** para $E_b/N_0$ mínimo (com $C/R_b \to 0$) é:

$$\boxed{\left(\frac{E_b}{N_0}\right)_{\min} = \ln 2 \approx -1{,}59\,\mathrm{dB}}$$

Para BER alvo $10^{-5}$ em BPSK sem codificação, $E_b/N_0 \approx 9{,}6$ dB. Com codificação próxima de Shannon, esse valor pode ser reduzido para $\approx 4$ dB — um **ganho de codificação** de $\approx 5{,}6$ dB.

## Experimentos Resolvidos em Python

### Protocolo computacional

**Objetivo:** medir ganho de codificação, taxas de erro e capacidade de correção. **Controle experimental:** declare SNR, padrões de erro, polinômios CRC e parâmetros Viterbi. **Validação:** reporte BER antes/depois da codificação, posição de erro corrigida, resto CRC e métricas Viterbi.

### Exercício 1: Codificação e Decodificação Hamming (7,4)

Implementar codificação, injeção de erro, decodificação com correção e verificação.

```python
import numpy as np

def hamming74_encode(d):
    d1, d2, d3, d4 = map(int, d)
    p1 = d1 ^ d2 ^ d4
    p2 = d1 ^ d3 ^ d4
    p4 = d2 ^ d3 ^ d4
    return np.array([p1, p2, d1, p4, d2, d3, d4], dtype=int)

def hamming74_decode(r):
    r = r.copy()
    s1 = r[0] ^ r[2] ^ r[4] ^ r[6]
    s2 = r[1] ^ r[2] ^ r[5] ^ r[6]
    s4 = r[3] ^ r[4] ^ r[5] ^ r[6]
    pos = s1 + 2*s2 + 4*s4
    if pos:
        r[pos-1] ^= 1
    return r[[2, 4, 5, 6]], pos

# Teste 1: sem erro
data = np.array([1, 0, 1, 1])
codeword = hamming74_encode(data)
decoded, position = hamming74_decode(codeword)
print(f'Dados originais: {data}')
print(f'Código Hamming: {codeword}')
print(f'Decodificado (sem erro): {decoded}, posição corrigida: {position}')
assert np.array_equal(data, decoded) and position == 0

# Teste 2: erro no 5º bit
received = codeword.copy(); received[4] ^= 1
decoded, position = hamming74_decode(received)
print(f'Recebido com erro: {received}')
print(f'Decodificado (com erro): {decoded}, posição corrigida: {position}')
assert np.array_equal(data, decoded) and position == 5

# Teste 3: dois erros (correção indevida possível)
received2 = codeword.copy()
received2[0] ^= 1; received2[1] ^= 1
decoded2, position2 = hamming74_decode(received2)
print(f'Recebido com 2 erros: {received2}')
print(f'Decodificado: {decoded2}, posição corrigida: {position2}')
# Nota: dois erros podem causar correção indevida

print("✓ Hamming (7,4) simulation complete.")
```

### Exercício 2: Cálculo CRC

Implementar divisão polinomial CRC e verificar detecção de rajadas de erro.

```python
def crc_compute(message_bits, poly_bits):
    """Compute CRC remainder for message and generator polynomial."""
    msg = list(message_bits)
    poly = list(poly_bits)
    poly_len = len(poly)
    
    # Pad message with zeros
    for _ in range(poly_len - 1):
        msg.append(0)
        
    # Polynomial division
    for i in range(len(message_bits)):
        if msg[i] == 1:
            for j in range(poly_len):
                msg[i+j] ^= poly[j]
                
    return msg[-(poly_len-1):]

# Teste CRC
message = [1, 1, 0, 1]
poly = [1, 0, 1, 1]  # x^3 + x + 1
remainder = crc_compute(message, poly)
print(f'Mensagem: {message}')
print(f'Polinômio: {poly}')
print(f'Resto CRC: {remainder}')

# Transmitted codeword
codeword_crc = message + remainder
print(f'Codeword transmitido: {codeword_crc}')

# Verify with no error
verify_remainder = crc_compute(codeword_crc, poly)
print(f'Resto na verificação (sem erro): {verify_remainder}')
assert verify_remainder == [0, 0, 0]

# Verify with error
codeword_error = codeword_crc.copy()
codeword_error[3] ^= 1
error_remainder = crc_compute(codeword_error, poly)
print(f'Resto na verificação (com erro): {error_remainder}')
assert error_remainder != [0, 0, 0]

print("✓ CRC simulation complete.")
```

### Exercício 3: Simulação de Decodificação Viterbi (Decisão Dura)

Implementar Viterbi simplificado para codificador convolucional taxa 1/2, memória 2.

```python
import numpy as np

class ViterbiDecoder:
    def __init__(self, k=1, n=2, memory=2, generators=[7, 5]):
        self.k = k
        self.n = n
        self.memory = memory
        self.generators = generators
        self.num_states = 2**memory
        
    def encode_state(self, state, input_bit):
        """Encode a state and input bit to output bits."""
        # State is (u[k-1], u[k-2])
        u_k2, u_k1 = state
        u_k = input_bit
        
        # Generator 7 (111): v1 = u[k] ^ u[k-1] ^ u[k-2]
        v1 = u_k ^ u_k1 ^ u_k2
        
        # Generator 5 (101): v2 = u[k] ^ u[k-2]
        v2 = u_k ^ u_k2
        
        return (v1, v2), (u_k1, u_k)
    
    def decode(self, received_bits):
        """Viterbi decoding with hard decision."""
        num_states = self.num_states
        # Trellis: metrics[step][state] = accumulated metric
        metrics = {state: 0 for state in range(num_states)}
        path_history = [{state: [] for state in range(num_states)}]
        
        # Process each received pair
        for step in range(len(received_bits) // 2):
            r_pair = received_bits[2*step:2*step+2]
            new_metrics = {state: float('inf') for state in range(num_states)}
            new_path_history = {state: [] for state in range(num_states)}
            
            for state in range(num_states):
                # Two possible transitions: input 0 or 1
                for input_bit in [0, 1]:
                    (v1, v2), next_state = self.encode_state(state, input_bit)
                    
                    # Calculate branch metric (Hamming distance)
                    expected_bits = [v1, v2]
                    branch_metric = sum(1 for e, r in zip(expected_bits, r_pair) if e != r)
                    
                    new_metric = metrics[state] + branch_metric
                    
                    if new_metric < new_metrics[next_state]:
                        new_metrics[next_state] = new_metric
                        new_path_history[next_state] = path_history[-1][state] + [input_bit]
            
            metrics = new_metrics
            path_history.append(new_path_history)
            
        # Traceback
        final_state = min(metrics.keys(), key=lambda s: metrics[s])
        decoded_bits = path_history[-1][final_state]
        
        return decoded_bits

# Test Viterbi
decoder = ViterbiDecoder(k=1, n=2, memory=2, generators=[7, 5])
original_bits = [1, 0, 1, 1, 0]

# Encode
encoded_bits = []
state = (0, 0)
for bit in original_bits:
    (v1, v2), state = decoder.encode_state(state, bit)
    encoded_bits.extend([v1, v2])

# Simulate channel with 1 error
received_bits = encoded_bits.copy()
received_bits[3] ^= 1  # Flip one bit

decoded_bits = decoder.decode(received_bits)
print(f'Bits originais: {original_bits}')
print(f'Bits codificados: {encoded_bits}')
print(f'Bits recebidos (com erro): {received_bits}')
print(f'Bits decodificados: {decoded_bits}')

print("✓ Viterbi simulation complete.")
```

### Exercício 4: Comparação BER com e sem FEC

Simular BER para BPSK em AWGN com e sem codificação Hamming (7,4).

```python
import numpy as np
from scipy.special import erfc

def ber_without_fec(EbN0_db, N_bits=100000):
    """BER for BPSK without FEC."""
    EbN0_lin = 10**(EbN0_db/10)
    sigma = 1/np.sqrt(2*EbN0_lin)
    
    bits = np.random.randint(0, 2, N_bits)
    symbols = 2*bits - 1
    noise = sigma * np.random.randn(N_bits)
    received = symbols + noise
    
    decisions = (received > 0).astype(int)
    errors = np.sum(bits != decisions)
    return errors / N_bits

def ber_with_hamming74(EbN0_db, N_blocks=10000):
    """BER for BPSK with Hamming (7,4) FEC."""
    EbN0_lin = 10**(EbN0_db/10)
    # Energy per coded bit
    EbN0_coded = EbN0_lin * (4/7)  # Rate 4/7
    sigma = 1/np.sqrt(2*EbN0_coded)
    
    blocks_errors = 0
    for _ in range(N_blocks):
        # Generate 4 data bits
        data = np.random.randint(0, 2, 4)
        codeword = hamming74_encode(data)
        
        # BPSK modulation
        symbols = 2*codeword - 1
        noise = sigma * np.random.randn(7)
        received_analog = symbols + noise
        
        # Hard decision
        received_bits = (received_analog > 0).astype(int)
        
        # Decode
        decoded_data, pos = hamming74_decode(received_bits)
        
        # Check for block error
        if not np.array_equal(data, decoded_data):
            blocks_errors += 1
            
    return blocks_errors / N_blocks

# Simulate BER curves
EbN0_dbs = np.linspace(0, 10, 11)
ber_no_fec = [ber_without_fec(db, N_bits=50000) for db in EbN0_dbs]
ber_with_fec = [ber_with_hamming74(db, N_blocks=5000) for db in EbN0_dbs]

print("BER Comparison (BPSK vs BPSK+Hamming(7,4)):")
for db, b_no, b_fec in zip(EbN0_dbs, ber_no_fec, ber_with_fec):
    print(f"EbN0={db:2.0f} dB: BER sem FEC={b_no:.2e}, BER com FEC={b_fec:.2e}")

print("✓ BER comparison simulation complete.")
```

## Lista de Exercícios Propostos

**E1.** Um código $(15,11)$ possui qual taxa $R_c$? Qual a redundância em porcentagem?

**E2.** Um código tem $d_{min}=5$. Quantos erros ele corrige e quantos detecta? E se $d_{min}=6$?

**E3.** Codifique a palavra $\mathbf u=(1,0,1,1)$ pelo Hamming $(7,4)$ usado neste capítulo. Verifique que a palavra codificada satisfaz $H\mathbf c^T=\mathbf0$.

**E4.** A palavra Hamming recebida é $(0,1,1,0,0,1,1)$. Calcule a síndrome e corrija, se necessário. E se a palavra for $(0,0,1,0,0,1,1)$?

**E5.** Explique por que CRC e Hamming têm finalidades diferentes em uma cadeia de comunicação. Dê um exemplo de sistema que usa ambos.

**E6.** Para $B=200\,\mathrm{kHz}$ e $S/N=15\,\mathrm{dB}$, calcule a capacidade de Shannon aproximada. Se a taxa de informação é $1\,\mathrm{Mbit/s}$, é possível comunicação confiável?

**E7.** Um enlace transmite bits codificados a $12\,\mathrm{Mbit/s}$ com um código de taxa $2/3$. Qual é a taxa de informação? Se a capacidade do canal é $9\,\mathrm{Mbit/s}$, o teorema de Shannon impede comunicação confiável nessa taxa? Justifique.

**E8.** Para o código $C=\{00000,11100,00111,11011\}$, verifique que ele é linear, encontre $d_{min}$ e determine quantos erros podem ser corrigidos.

**E9.** No Hamming $(7,4)$ deste capítulo, receba $\mathbf r=(0,0,1,0,0,1,1)$. Calcule $s_1$, $s_2$ e $s_4$, corrija a palavra e recupere os quatro dados.

**E10.** Explique por que um decodificador Viterbi de decisão suave não deve primeiro transformar cada amostra em 0 ou 1. Qual o ganho típico em dB sobre decisão dura para AWGN?

**E11.** Implemente um codificador CRC com polinômio $g(x)=x^4+x+1$ e verifique a detecção de uma rajada de 4 bits de erro.

**E12.** Para um código SECDED $(8,4)$, receba $\mathbf r=(1,1,0,1,0,1,1,0)$ (último bit é paridade global). Calcule a síndrome local e a paridade global, e determine se há 0, 1 ou 2 erros.

## Gabarito

**E1.** $R_c=11/15\approx\boxed{0{,}733}$. Redundância: $\boxed{26{,}7\%}$.

**E2.** Para $d_{min}=5$: $t=\lfloor(5-1)/2\rfloor=\boxed{2}$ erros corrigíveis; detecta até $\boxed{4}$ erros. Para $d_{min}=6$: $t=\lfloor(6-1)/2\rfloor=\boxed{2}$ erros corrigíveis; detecta até $\boxed{5}$ erros.

**E3.** $p_1=0$, $p_2=1$ e $p_4=0$, portanto $\boxed{(0,1,1,0,0,1,1)}$. A síndrome $H\mathbf c^T=\mathbf0$ é verificada calculando $s_1=0$, $s_2=0$, $s_4=0$.

**E4.** Para $(0,1,1,0,0,1,1)$: $s_1=0$, $s_2=0$, $s_4=0$. Síndrome zero: palavra válida, não requer correção. Para $(0,0,1,0,0,1,1)$: $s_1=1$, $s_2=0$, $s_4=0$, síndrome $001_2=1$. Corrigindo posição 1: $(1,0,1,0,0,1,1)$, dados: $\boxed{(1,0,1,1)}$.

**E5.** Hamming é FEC e corrige um erro por palavra; CRC detecta erros, sobretudo rajadas, e costuma acionar retransmissão ou complementar outro código. Exemplo: Ethernet usa CRC-32 para detecção; Wi-Fi usa CRC-32 + codificação convolucional/Turbo.

**E6.** $S/N=10^{1{,}5}\approx31{,}62$; $C=200\times10^3\log_2(32{,}62)\approx\boxed{1{,}01\,\mathrm{Mbit/s}}$. Sim, $1\,\mathrm{Mbit/s} < 1{,}01\,\mathrm{Mbit/s}$, portanto comunicação confiável é teoricamente possível com código adequado.

**E7.** $R_{\mathrm{info}}=(2/3)12=\boxed{8\,\mathrm{Mbit/s}}$. Como $8<9\,\mathrm{Mbit/s}$, Shannon não impede comunicação confiável; afirma apenas que códigos adequados podem existir. Não garante que o código escolhido atinja a BER desejada.

**E8.** O XOR de quaisquer duas palavras listadas também pertence a $C$, e $00000$ está no conjunto; portanto, o código é linear. Os pesos não nulos são 3, 3 e 4, logo $d_{min}=3$ e $t=\lfloor(3-1)/2\rfloor=\boxed{1}$.

**E9.** $s_1=0$, $s_2=1$ e $s_4=0$, portanto $s_4s_2s_1=010_2=2$. Corrigindo a posição 2, obtém-se $(0,1,1,0,0,1,1)$ e os dados das posições 3, 5, 6 e 7 são $\boxed{(1,0,1,1)}$.

**E10.** A decisão binária antecipada descarta a magnitude da amostra, isto é, a confiança da observação. O Viterbi suave compara diretamente as distâncias entre amostras e níveis esperados e pode distinguir evidência fraca de evidência forte. Ganho típico: $\boxed{\approx 2\,\mathrm{dB}}$.

**E11.** Polinômio $g(x)=x^4+x+1$ (binário $10011$). Rajada de 4 bits $1111$ na posição correta não é múltipla de $g(x)$, portanto detectada. CRC de grau 4 detecta todas as rajadas de comprimento $\leq 4$.

**E12.** Dados: posições 3,5,6,7 são $0,1,1,0$. Paridades locais: $p_1=0\oplus1\oplus0=1$, $p_2=0\oplus1\oplus0=1$, $p_4=1\oplus1\oplus0=0$. Síndrome local: $s_4s_2s_1=011_2=3$. Paridade global: soma de todos os bits = $1+1+0+1+0+1+1+0=4$ (par). Paridade global OK, mas síndrome não zero → erro único na posição 3. Correção: inverter posição 3.

## Síntese e roteiro de decisão

Ao analisar um esquema de proteção de canal, siga esta ordem:

1. **Identifique a finalidade:** detectar, corrigir sem retransmissão, ou solicitar retransmissão?
2. **Calcule o custo:** determine $n$, $k$, $R_c=k/n$ e a taxa útil.
3. **Modele o erro:** erros independentes, rajadas, apagamentos ou amostras suaves?
4. **Associe a ferramenta:** distância e síndrome para códigos de bloco; divisão polinomial para CRC; trellis e métricas para códigos convolucionais.
5. **Cheque o limite físico:** compare a taxa de informação com a capacidade usando unidades e largura de banda consistentes.
6. **Valide:** injete padrões de erro controlados antes de medir BER em um canal aleatório.

**Erros comuns a evitar:**

- interpretar $R_c$ como taxa em bit/s, embora seja uma razão adimensional;
- afirmar que $d_{min}=3$ corrige três erros;
- somar matrizes binárias sem reduzir módulo 2;
- tratar síndrome zero como prova de ausência de qualquer erro;
- dizer que CRC corrige automaticamente o pacote;
- comparar taxa codificada, em vez de taxa de informação, com a capacidade;
- comparar BER codificada e não codificada em condições diferentes de energia por bit útil.

**Teste de domínio:** sem consultar o texto, explique por que uma síndrome não nula localiza um erro único no Hamming $(7,4)$ e por que a mesma regra pode falhar diante de dois erros. Se a explicação não mencionar as colunas de $H$ e $d_{min}$, revise as Seções 2–4.
