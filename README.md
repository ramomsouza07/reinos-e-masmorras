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
