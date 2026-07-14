# EMC Wave Studio

Laboratório didático para investigar propagação, reflexão, difração, blindagem e absorção. Inclui FDTD TMz e TLM em 2D, além de um ambiente interativo 3D para estudos de caminho e acoplamento EMC.

```bash
cd /data/lseman.github.io/2026_2/emc/sim
npm start -- --host 0.0.0.0
```

Abra `http://localhost:8790`. Se a porta estiver ocupada, o servidor tenta as seguintes automaticamente. Uma porta explícita pode ser escolhida com `--port 9000` ou `PORT=9000`.

# Uso

Arraste fontes, sondas, vítimas, dielétricos, materiais dissipativos, paredes PEC e absorvedores para o domínio. Selecione um objeto para editar dimensões, permissividade e perda. Os exemplos demonstram propagação livre, fenda em blindagem, interface dielétrica, absorção e cavidade ressonante.

As grandezas são normalizadas: uma célula representa `Δ`, a velocidade no vácuo é normalizada e a frequência é dada em ciclos por passo espacial/temporal do modelo. O FDTD usa `Δt=0,32`, abaixo do limite de Courant 2D `1/√2`, coeficientes de material pré-calculados, atualização condutiva trapezoidal, contorno de Mur de primeira ordem e uma camada dissipativa polinomial. A frequência padrão oferece aproximadamente 17,8 células por comprimento de onda no vácuo; o diagnóstico informa quando a discretização se torna dispersiva. O TLM usa um nó shunt educacional com stub de permissividade, atenuação passiva e buffers reutilizáveis.

A visualização pode mostrar `Ez` com fase ou densidade de energia. A escala de cor usa percentil robusto e suavização temporal para evitar que uma única célula singular provoque cintilação na imagem.

No método 3D, use o mouse para orbitar, a roda para aproximar e arraste os objetos no piso. Fontes, sondas, vítimas, blindagens e absorvedores podem ser inseridos pela barra inferior; `Delete` remove o item selecionado. Os exemplos 3D incluem espaço livre, sala com abertura, parede blindada e tratamento absorvedor. As linhas mostram os caminhos, a nuvem volumétrica mostra a intensidade relativa e as medições podem ser exportadas em CSV.

O modo 3D resolve numericamente as seis componentes `Ex/Ey/Ez/Hx/Hy/Hz` em uma grade FDTD vetorial de `43×17×31` células, com passo temporal abaixo do limite de Courant 3D. Blindagens são células PEC, absorvedores usam atualização condutiva passiva e as bordas usam uma camada dissipativa. A resolução moderada mantém a execução interativa; portanto, resultados quantitativos ainda exigem refinamento de grade, estudo de convergência, unidades físicas e uma CPML calibrada.

Resultados quantitativos reais exigem definir `Δ`, converter frequência/unidades, realizar estudo de convergência, usar PML calibrada quando necessário e validar contra solução analítica ou medição. Mur e a camada dissipativa reduzem reflexões, mas não equivalem a uma CPML validada para todos os ângulos e materiais.
