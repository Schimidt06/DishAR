# PLANO — Corrigir visualização 3D + rotação + AR do cardápio

## Contexto

O projeto já está rodando em localhost.

Existe uma tela/modal de produto que atualmente exibe uma **imagem 2D do hambúrguer com fundo**, junto do texto “Arraste para girar”.

Isso está incorreto porque:

- uma imagem JPG/PNG comum não é um objeto 3D;
- ela não pode ser girada em 360° como um modelo tridimensional real;
- o fundo da própria foto continua aparecendo;
- AR não funciona usando apenas essa imagem como se fosse um modelo;
- o botão/gesto “Arraste para girar” não deve existir se não houver um modelo 3D real carregado.

A implementação precisa ser corrigida de forma estrutural, e não apenas visualmente.

---

# Objetivo

Transformar a área principal do produto em um **visualizador 3D real**, preparado para:

1. carregar um modelo `.glb` / `.gltf`;
2. permitir rotação 360° por toque/mouse;
3. permitir zoom controlado;
4. manter fundo transparente no visualizador;
5. apresentar o prato sem uma imagem retangular de fundo;
6. oferecer botão **“Ver na minha mesa”**;
7. abrir AR em dispositivos compatíveis;
8. usar escala física coerente;
9. funcionar bem no mobile;
10. possuir fallback correto quando AR ou modelo 3D não estiver disponível.

---

# Regra crítica

## NÃO SIMULAR 3D COM IMAGEM 2D

Não usar:

- `transform: rotate()`;
- parallax;
- sequência fake de imagens;
- CSS 3D;
- rotação de uma tag `<img>`;
- canvas com uma única fotografia;
- imagem com fundo tentando parecer objeto 3D.

A rotação precisa acontecer sobre uma **malha 3D real**.

Se ainda não existir um `.glb`, mantenha temporariamente um asset de demonstração/placeholder 3D e deixe o sistema preparado para substituir posteriormente pelos modelos definitivos.

---

# Tecnologia recomendada para o protótipo

Antes de instalar qualquer dependência, analisar a stack atual.

Para este MVP, priorizar a solução mais simples e estável.

## Opção preferencial: `<model-viewer>`

Avaliar o uso de:

`@google/model-viewer`

Motivos:

- suporte nativo a GLB/glTF;
- controles de câmera;
- rotação por mouse/toque;
- zoom;
- exposição;
- sombras;
- AR;
- integração com WebXR;
- Scene Viewer no Android;
- Quick Look no iOS;
- implementação muito mais simples para um MVP do que construir toda a camada AR manualmente em Three.js.

Não migrar o projeto inteiro para Three.js apenas para essa funcionalidade.

React Three Fiber / Three.js deve ser considerado somente se o projeto já utilizar essas tecnologias ou se houver necessidade real de customização avançada.

---

# Comportamento esperado do visualizador

O componente do produto deve possuir aproximadamente esta lógica:

```text
Produto selecionado
        ↓
Existe model3dUrl?
   ↙            ↘
 SIM             NÃO
 ↓                ↓
Visualizador 3D   Imagem/fallback
 ↓
camera-controls
 ↓
Usuário gira o prato
 ↓
Botão "Ver na minha mesa"
 ↓
Dispositivo suporta AR?
   ↙            ↘
 SIM             NÃO
 ↓                ↓
Abrir AR      Explicar indisponibilidade
```

---

# Estrutura dos dados do produto

Preparar o modelo de dados para algo semelhante a:

```ts
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;

  imageUrl: string;

  model3dUrl?: string;
  iosModelUrl?: string;

  dimensions?: {
    widthMeters: number;
    heightMeters: number;
    depthMeters: number;
  };

  arEnabled?: boolean;
};
```

Exemplo:

```ts
{
  id: "smash-bacon",
  name: "Smash Bacon",
  price: 39.90,

  imageUrl: "/products/smash-bacon.webp",

  model3dUrl: "/models/smash-bacon.glb",
  iosModelUrl: "/models/smash-bacon.usdz",

  dimensions: {
    widthMeters: 0.13,
    heightMeters: 0.10,
    depthMeters: 0.13
  },

  arEnabled: true
}
```

---

# Implementação do visualizador

Criar um componente reutilizável, por exemplo:

```text
components/
  Product3DViewer.tsx
```

Responsabilidades:

- receber URL do GLB;
- receber URL USDZ opcional;
- renderizar modelo 3D;
- fundo transparente;
- ativar `camera-controls`;
- limitar zoom exagerado;
- configurar câmera inicial adequada;
- permitir rotação natural por mouse/toque;
- ativar AR quando disponível;
- exibir loading;
- tratar erro de carregamento;
- não travar a interface.

Exemplo conceitual utilizando model-viewer:

```html
<model-viewer
  src="/models/product.glb"
  ios-src="/models/product.usdz"
  alt="Modelo 3D do prato"
  camera-controls
  touch-action="pan-y"
  ar
  ar-modes="webxr scene-viewer quick-look"
  shadow-intensity="1"
  environment-image="neutral"
  interaction-prompt="auto"
>
</model-viewer>
```

Adaptar corretamente para a stack/framework atual.

Não copiar esse código cegamente se a aplicação exigir outra integração.

---

# Fundo transparente

O erro atual mostra uma fotografia retangular completa.

No modo 3D:

- NÃO utilizar a fotografia como fundo do visualizador;
- o container do modelo deve integrar-se ao fundo da página;
- evitar um retângulo visível atrás do prato;
- o fundo deve ser controlado pelo layout;
- o modelo 3D deve aparecer isolado no espaço.

O visualizador pode ter fundo transparente ou seguir exatamente a cor da interface.

---

# Rotação

A mensagem:

> Arraste para girar

só deve aparecer quando um modelo 3D real estiver pronto.

Requisitos:

- desktop: drag com mouse;
- mobile: drag com um dedo;
- rotação horizontal;
- pequena liberdade vertical;
- zoom por scroll/pinch, dentro de limites;
- não bloquear o scroll da página quando o usuário estiver fora da área de interação.

A interface deve deixar claro que o objeto é manipulável.

---

# AR

Adicionar um CTA destacado:

## `Ver na minha mesa`

Esse botão deve ativar AR real quando houver suporte.

### Android

Priorizar:

- WebXR, quando disponível;
- Scene Viewer como fallback.

### iPhone/iPad

Utilizar:

- AR Quick Look;
- arquivo `.usdz`.

O `.glb` não substitui automaticamente o `.usdz` no Quick Look.

---

# IMPORTANTE — localhost e AR

A interface pode funcionar normalmente em localhost no computador.

Entretanto, para testar AR em um celular, não assumir que:

```text
http://192.168.x.x:porta
```

será suficiente.

Recursos WebXR normalmente exigem **secure context / HTTPS**.

Durante os testes mobile, preparar uma forma de expor o ambiente local com HTTPS, por exemplo:

- túnel HTTPS;
- preview/deploy de desenvolvimento;
- ambiente de staging.

O objetivo é permitir abrir o projeto pelo celular usando uma URL HTTPS real.

---

# Escala real

Não deixar o usuário escolher uma escala arbitrária quando estiver em AR.

A intenção do produto é mostrar o tamanho aproximado real do prato.

Padronizar a unidade:

```text
1 unidade 3D = 1 metro
```

Ao importar ou gerar os modelos:

- normalizar a escala;
- validar bounding box;
- armazenar dimensões do produto;
- evitar que cada GLB venha com escala completamente diferente.

Exemplo:

```text
Hambúrguer:
largura = 0.13 m
altura = 0.10 m
profundidade = 0.13 m
```

O objeto exibido em AR deve respeitar essa dimensão.

---

# UX da tela do produto

O layout atual pode ser mantido como referência, porém corrigido.

## Estrutura desejada

```text
[X fechar]

        MODELO 3D DO PRATO

        Arraste para girar

Mais pedido                  R$ 39,90

Nome do prato

Descrição

[ VER NA MINHA MESA ]

[ ADICIONAR AO PEDIDO ]
```

O modelo 3D deve ser o protagonista.

Não colocar efeitos visuais chamativos competindo com ele.

---

# Loading

Modelos 3D podem demorar mais que imagens.

Adicionar estado de carregamento elegante:

```text
Preparando visualização 3D...
```

Pode utilizar skeleton ou indicador discreto.

Não mostrar uma área vazia sem feedback.

---

# Tratamento de erro

Se o GLB falhar:

```text
Não foi possível carregar a visualização 3D.
```

Exibir a imagem normal do produto como fallback.

Nesse estado:

- remover “Arraste para girar”;
- desabilitar AR;
- não fingir que a imagem é 3D.

---

# Compatibilidade

Criar uma detecção de suporte.

Estados possíveis:

```ts
"loading"
"3d-ready"
"ar-ready"
"3d-only"
"unsupported"
"error"
```

A interface deve reagir corretamente a cada estado.

---

# Performance

O projeto é mobile-first.

Não carregar todos os GLBs do cardápio na abertura da página.

Carregar modelo 3D somente quando:

- usuário abre o produto; ou
- usuário entra na área onde a visualização será utilizada.

Utilizar lazy loading quando possível.

Para o futuro, considerar:

- Draco;
- Meshopt;
- KTX2;
- texturas WebP/AVIF quando compatíveis com o pipeline;
- redução de polígonos.

Não implementar otimizações prematuramente se ainda não forem necessárias.

---

# Organização de assets

Criar uma estrutura previsível.

Exemplo:

```text
public/
  models/
    burgers/
      smash-bacon.glb
      smash-bacon.usdz

    pizzas/
      margherita.glb
      margherita.usdz

  products/
    smash-bacon.webp
    margherita.webp
```

Adaptar para a estrutura existente do projeto.

---

# Fase 1 — Auditoria

ANTES DE ALTERAR CÓDIGO:

1. identificar framework e versão;
2. identificar como o modal atual foi implementado;
3. localizar o componente da imagem exibida no print;
4. localizar a lógica do texto “Arraste para girar”;
5. verificar se já existe Three.js, React Three Fiber ou model-viewer;
6. verificar se já existem arquivos GLB/GLTF/USDZ no projeto;
7. verificar se existe código AR incompleto;
8. verificar se o botão AR está apenas visual ou realmente conectado;
9. identificar possíveis conflitos de CSS e eventos touch.

Produzir um pequeno relatório antes da implementação.

---

# Fase 2 — Corrigir 3D

Implementar primeiro SOMENTE:

- carregar GLB;
- fundo transparente;
- loading;
- rotação;
- zoom;
- responsividade;
- fallback.

Validar:

```text
Desktop:
mouse gira modelo? ✅

Mobile:
dedo gira modelo? ✅

Modelo:
possui fundo fotográfico? ❌

Imagem 2D está fingindo ser 3D? ❌
```

Somente avançar para AR depois que isso estiver funcionando.

---

# Fase 3 — AR

Depois do 3D aprovado:

- implementar AR;
- testar Android;
- preparar Quick Look para iOS;
- garantir HTTPS;
- testar posicionamento sobre superfície;
- validar escala;
- tratar aparelhos incompatíveis.

---

# Fase 4 — Polimento

Depois de tudo funcional:

- melhorar iluminação;
- câmera inicial;
- sombra;
- orientação;
- animação de entrada;
- feedback de interação;
- botão AR;
- acessibilidade;
- performance.

---

# Critérios de aceite

A tarefa só pode ser considerada concluída quando:

- [ ] não existe fotografia com fundo sendo apresentada como modelo 3D;
- [ ] existe modelo GLB real;
- [ ] usuário consegue girar com mouse;
- [ ] usuário consegue girar com touch;
- [ ] zoom funciona;
- [ ] modelo possui fundo transparente;
- [ ] loading funciona;
- [ ] erros possuem fallback;
- [ ] botão “Ver na minha mesa” existe;
- [ ] botão AR executa funcionalidade real;
- [ ] Android possui caminho de AR funcional;
- [ ] iOS possui caminho preparado via USDZ/Quick Look;
- [ ] escala do modelo é controlada;
- [ ] modelos não são carregados todos ao abrir o cardápio;
- [ ] código existente que não precisa ser alterado foi preservado.

---

# Prompt operacional para o agente

Você está trabalhando em um projeto de cardápio digital com visualização 3D e AR que já está funcionando em localhost.

Existe atualmente um erro conceitual na tela do produto: uma imagem 2D com fundo está sendo exibida como se fosse um objeto 3D. A interface mostra “Arraste para girar”, mas o produto não gira, e o AR não funciona.

Quero que você corrija essa funcionalidade de verdade.

Leia este documento inteiro antes de modificar arquivos.

Primeiro faça uma auditoria da implementação existente e identifique exatamente:

- qual componente renderiza essa tela;
- qual asset está sendo utilizado;
- se o asset é imagem, GLB, GLTF ou outro formato;
- por que a rotação não funciona;
- por que o AR não funciona;
- quais dependências relacionadas a 3D/AR já existem;
- se há código incompleto que possa ser aproveitado.

Depois apresente o diagnóstico.

Em seguida implemente a correção incrementalmente.

Para o MVP, prefira `@google/model-viewer` se a stack atual permitir, por oferecer camera controls e AR multiplataforma com menor complexidade.

Não transforme uma imagem 2D em falso 3D.

A área principal deve renderizar um modelo GLB real, com fundo transparente e suporte a rotação por mouse/toque.

Adicione loading e fallback.

Depois conecte o botão “Ver na minha mesa” ao AR utilizando:

- WebXR / Scene Viewer no Android;
- Quick Look + USDZ no iOS.

Não considere o AR concluído apenas porque existe um botão.

Teste a lógica de suporte e trate dispositivos incompatíveis.

Preserve o layout e as funcionalidades existentes sempre que possível.

Não refatore o projeto inteiro sem necessidade.

Não instale diversas bibliotecas concorrentes.

Não altere arquitetura sem justificar.

Ao final de cada etapa, informe:

1. arquivos modificados;
2. dependências adicionadas;
3. comportamento implementado;
4. como testar;
5. limitações restantes.

A prioridade é funcionalidade real, não aparência simulada.
