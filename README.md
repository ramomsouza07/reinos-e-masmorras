# 🏰 Reinos & Masmorras - RPG de Navegador Online (D&D 5ª Edição)

Um jogo de RPG de mesa virtual (Virtual Tabletop - VTT) completo para navegador, feito para você jogar online com seus amigos casualmente com base nas regras do **D&D 5ª Edição (Player's Handbook / Livro do Jogador)**.

---

## 🌟 Funcionalidades Principais

### 1. 🗺️ Mapa Tático Interativo (Battlemap)
- **Grid com Coordenadas**: Medição precisa em quadrados de 1,5m (5 pés) com eixos alfanuméricos (A, B, C... 1, 2, 3...).
- **Cenários Prontos D&D**: Masmorra das Sombras, Taverna do Javali Saltitante, Clareira na Floresta Sussurrante e Covil da Caverna Carmesim.
- **Neblina de Guerra (Fog of War)**: O Mestre (DM) pode cobrir ou revelar áreas com pincel dinâmico (1x1 ou 3x3). Jogadores veem apenas as regiões exploradas.
- **Tokens no Grid**: Mova heróis e inimigos arrastando com o mouse. Ao arrastar, o mapa calcula automaticamente a distância percorrida em metros e quadrados.
- **Barra de Vida & Condições nos Tokens**: Círculos de vida coloridos e badges para condições do D&D (Envenenado, Cego, Caído, Atordoado, etc.).
- **Sinalizador (Ping)**: Clique no botão ou use `Alt+Clique` para soltar um feixe luminoso com som visível a todos os jogadores conectados.

### 2. 🧙 Criação & Personalização de Personagem
- **Raças Oficiais**: Humano, Elfo, Anão, Halfling, Draconato, Gnomo, Meio-Elfo, Meio-Orc e Tiefling com traços e bônus de atributo.
- **Classes Oficiais**: Guerreiro, Mago, Ladino, Clérigo, Bárbaro, Bardo, Paladino, Patrulheiro e Bruxo com dados de vida (d6, d8, d10, d12) e perícias.
- **Rolador de Atributos**: Distribuição padrão ou rolagem **4d6 Soltar Menor** com animação e som!
- **Personalização de Avatar**: Escolha de ícones, cores da borda no mapa, alinhamento moral (ex: Leal e Bom, Caótico e Neutro) e história.

### 3. 📜 Ficha Interativa do Jogador
- **PV, CA, Iniciativa e Deslocamento** calculados automaticamente com base na armadura e Destreza.
- **Salvaguardas & 18 Perícias Oficiais** com rolagem com um clique enviada diretamente para o chat do grupo.
- **Ataques & Armas**: Botões "Atacar" (d20 + mod vs CA) e "Dano" (dano da arma com cálculo automático de crítico).
- **Grimório de Magias**: Truques e magias de 1º círculo com controle de espaços de magia.
- **Descansos**: Descanso Curto (cura gastando Dado de Vida) e Descanso Longo (restaura todo PV e espaços de magia).
- **Testes contra a Morte**: Ao cair a 0 PV, a ficha ativa automaticamente o painel de 3 sucessos / 3 falhas.

### 4. 🐉 Bestiário de Monstros & Inimigos (Mestre)
- Criaturas prontas com fichas completas: Goblin, Kobold, Esqueleto, Zumbi, Orc, Lobo Terrível, Aranha Gigante, Ogro, Dragão Vermelho Jovem e Observador (Beholder).
- Botão **"Colocar no Mapa"**: Spawna o monstro imediatamente no campo de batalha com tamanho ajustado (Pequeno, Médio, Grande).
- **Criador de Criaturas Personalizadas**: Crie chefes e NPCs personalizados na hora.

### 5. ⚔️ Rastreador de Iniciativa & Combate
- Clique em **"Iniciar Combate & Rolar Iniciativas"** para rolar d20 + DES para todos os combatentes de uma vez.
- Ordem de turnos ordenada do maior para o menor com destaque dourado na criatura ativa e contador de rodadas.

### 6. 💰 Economia & Mercado
- Moedas do D&D: Peças de Ouro (PO).
- Catálogo de Armas, Armaduras, Poções de Cura (Comum e Maior) e Equipamentos de Aventura.
- Venda de itens por 50% do valor e painel para o Mestre conceder tesouros e recompensas ao grupo.

### 7. 🎲 Bandeja de Dados Poliédricos & Efeitos Sonoros
- Dados d4, d6, d8, d10, d12, d20 e d100.
- Suporte a fórmulas livres (ex: `2d6+3`, `3d8+4`) e alternância de Vantagem / Desvantagem.
- Efeitos sonoros procedurais via Web Audio API (dados rolando, espadas, magias, moedas e fanfarras).
- Animação de confetes dourados no **20 Natural** e alerta vermelho no **1 Natural**.

### 8. 🗡️ Modo Ação & Exploração Fluida (Estilo Baldur's Gate 3)
- **Transição Automática (Aggro System)**: Fora de combate, os jogadores exploram a masmorra livremente em tempo real. Se um herói entrar no campo de visão de um monstro (9 metros / 6 quadrados), um alerta sonoro e visual `[!]` é disparado e toda a mesa entra automaticamente em combate tático por turnos com iniciativa rolada na hora!
- **Fuga Estratégica**: Se o grupo recuar mais de 18 metros (12 quadrados) de todos os inimigos vivos, o combate desarma sozinho e o grupo volta à exploração livre.
- **Navegação Inteligente por Clique (Pathfinding A\*)**: Clique no chão para traçar a rota mais curta contornando paredes, pilares e obstáculos. Durante o combate por turnos, a linha de rota exibe os metros e limita o movimento ao deslocamento restante da rodada.
- **Linha de Visão (Line-of-Sight)**: Tiros de flechas e raios de magia não atravessam paredes sólidas ou pilares de pedra; posicione-se estrategicamente para acertar o alvo!
- **Combate Rápido em 1 Clique (Fast-Turn)**: Clique no alvo ou arma para rolar d20 e dano simultaneamente, com os monstros do AutoDM agindo em menos de 500ms.

### 9. 🎨 Nova Estética Procedural do Mapa & Game Juice
- **Texturas Procedurais Vivas**:
  - *Masmorras*: Lajotas de pedra talhadas com chanfros, rachaduras sutis e musgo.
  - *Taverna*: Tábuas de madeira com veios, nós e pregos de fixação.
  - *Floresta*: Terra batida com tufos de grama estilizados e seixos orgânicos.
  - *Caverna Carmesim*: Basalto vulcânico escuro com fissuras de magma brilhante pulsando sob o chão.
- **Paredes & Pilares 3D com Sombras**: Tijolos de pedra empilhados em relevo com topo chanfrado e sombras projetadas no chão.
- **Iluminação & Vinheta**: Luz radial quente e cintilante ao redor das tochas com vinheta escura dramática nas bordas da masmorra.
- **Projéteis Visuais em Voo**: Flechas com penas de cauda, bolas de fogo com rastro incandescente e projéteis arcanos voando graficamente pelo Canvas.
- **Floating Combat Text & Screen Shake**: Números de dano/cura saltando no ar com tremor de tela sutil em acertos críticos e explosões!

### 10. ⚡ Interações com o Cenário (Tecla de Ação [E])
- **Baús de Tesouro**: Aproxime-se e pressione `[E]` para abrir. Cuidado: 25% dos baús estão protegidos por **Armadilhas Explosivas (2d6 em área)** com screen shake e detonação mágica!
- **Altares Rúnicos Ancestrais**: Pressione `[E]` adjacente ao altar para rezar e receber a **Bênção Ancestral** (+2 de dano, cura e bônus de atributos por 30s).
- **Cadáveres no Chão**: Pressione `[E]` para pilhar ouro e equipamentos deixados pelos monstros.

---

## 🚀 Como Iniciar o Jogo

O jogo já vem compilado e pronto para rodar em uma única porta:

```bash
# Iniciar o servidor (porta 3001)
npm start
```

Abra no seu navegador:
👉 **`http://localhost:3001`**

---

## 👥 Como Jogar com seus Amigos Online

### Opção 1: Mesma Rede Wi-Fi (Casa / LAN)
1. Descubra o IP local do seu computador (no terminal digite `ip a` ou `hostname -I`, ex: `192.168.1.15`).
2. Seus amigos só precisam abrir no celular ou computador:
   `http://192.168.1.15:3001`
3. Todos digitam o mesmo **Código de Sala** (ex: `MASMORRA-1`) e entram na mesma mesa sincronizada em tempo real!

### Opção 2: Pela Internet (Gratuito)
Você pode usar qualquer túnel gratuito para gerar um link público para seus amigos:
- **Localtunnel**: `npx localtunnel --port 3001` (gera uma URL como `https://sua-mesa.loca.lt`)
- **Ngrok**: `ngrok http 3001`
- Ou fazer deploy em serviços como Render, Railway ou Fly.io com `npm start`.
