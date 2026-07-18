# 🛸 Cow Abduction

Um jogo estilo *Snake* com tema de abdução alienígena, feito em **HTML5, CSS e JavaScript**. Controle o disco voador, abduza vacas para crescer e fuja de colisões cósmicas — enquanto a velocidade aumenta infinitamente a cada 5 vacas abduzidas.

Funciona no navegador (desktop e mobile) e pode ser **instalado como aplicativo (PWA)**, com suporte a jogo offline.

---

## 🎮 Como jogar

- **Objetivo:** guie o OVNI até as vacas para abduzi-las e somar pontos, sem colidir com as bordas do mapa ou com o próprio rastro.
- A cada 5 vacas abduzidas, a velocidade aumenta — o jogo é infinito e fica progressivamente mais difícil.
- Seu recorde é salvo automaticamente no navegador (`localStorage`).

### Controles

| Plataforma | Controle |
|---|---|
| Desktop | Setas do teclado ou `W A S D` |
| Mobile | D-pad na tela ou swipe (arrastar o dedo) no próprio jogo |
| Ambos | `Enter` inicia a missão ou reinicia após o game over |

---

## ✨ Funcionalidades

- 🎨 Visual espacial com estrelas de fundo geradas dinamicamente e efeitos de brilho (glow) no OVNI e no rastro
- 📱 **Totalmente responsivo**, com controles de toque (D-pad + swipe) que aparecem automaticamente só em dispositivos com tela sensível ao toque
- 🏆 Sistema de pontuação e recorde persistente
- ⚡ Dificuldade progressiva (velocidade aumenta a cada 5 pontos)
- 📲 **Instalável como app (PWA)** — funciona offline via Service Worker, com ícone e splash screen próprios

---

## 🛠️ Tecnologias

- HTML5 (Canvas API)
- CSS3 (layout responsivo, media queries para toque vs. mouse)
- JavaScript (Vanilla, sem frameworks ou dependências externas)
- Web App Manifest + Service Worker (PWA)

---

## 📂 Estrutura do projeto

```
├── index.html          # Estrutura principal do jogo
├── manifest.json       # Configuração do PWA (ícones, nome, cores)
├── sw.js                # Service Worker (cache offline)
├── css/
│   └── style.css        # Estilos e responsividade
├── js/
│   └── script.js        # Lógica do jogo
└── img/
    ├── favicon.png
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

---

## 🚀 Como rodar localmente

Acesse aqui --> (https://vinicesco.github.io/CowAbduction/)

---

## 📲 Instalando como aplicativo

No Chrome/Android (ou outro navegador compatível com PWA), acesse o jogo e use a opção **"Instalar app"** (ou "Adicionar à tela inicial") no menu do navegador. No iOS/Safari, use **Compartilhar → Adicionar à Tela de Início**.

---

## 📄 Licença

Este projeto está sob a licença MIT — sinta-se livre para estudar, usar e modificar o código.
