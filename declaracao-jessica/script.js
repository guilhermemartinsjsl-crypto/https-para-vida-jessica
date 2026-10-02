// =====================================================
//  CONFIGURAÇÃO DAS FOTOS
//  - Coloque as fotos na pasta "imagens" com os nomes foto1, foto2, foto3...
//  - O código descobre sozinho se é .jpg, .jpeg ou .png.
//  - Para adicionar mais fotos, copie uma linha e mude o nome e a legenda.
// =====================================================
const FOTOS = [
  { arquivo: "foto1", legenda: "Nós dois 💕" },
  { arquivo: "foto2", legenda: "Meu lugar favorito" },
  { arquivo: "foto3", legenda: "Para sempre ❤" },
];

// Volume da música: de 0 (mudo) a 1 (máximo)
const VOLUME_FINAL = 0.6;

// ===== 1. CORAÇÕES FLUTUANDO =====
const containerCoracoes = document.getElementById("coracoes");
const simbolos = ["❤", "💖", "💕", "💗", "💓", "💞", "🤍", "💜"];

function criarCoracao() {
  const coracao = document.createElement("span");
  coracao.className = "coracao";
  coracao.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
  coracao.style.left = Math.random() * 100 + "vw";
  coracao.style.fontSize = Math.random() * 30 + 15 + "px";
  coracao.style.opacity = (Math.random() * 0.7 + 0.3).toFixed(2);
  const duracao = Math.random() * 6 + 6;
  coracao.style.animationDuration = duracao + "s";
  containerCoracoes.appendChild(coracao);
  setTimeout(() => coracao.remove(), duracao * 1000);
}

let intervaloCoracoes = setInterval(criarCoracao, 300);

function chuvaDeCoracoes(quantidade) {
  for (let i = 0; i < quantidade; i++) {
    setTimeout(criarCoracao, i * 60);
  }
}

// ===== 2. TROCA DE TELAS =====
function trocarTela(telaAtual, proximaTela, depois) {
  telaAtual.classList.add("saindo");
  setTimeout(() => {
    telaAtual.classList.remove("ativa", "saindo");
    proximaTela.classList.add("ativa");
    window.scrollTo(0, 0);
    if (depois) depois();
  }, 800);
}

// ===== 3. TELA 1: VALIDAÇÃO DO NOME =====
const campoNome = document.getElementById("campo-nome");
const botaoEntrar = document.getElementById("botao-entrar");
const mensagemErro = document.getElementById("mensagem-erro");
const telaNome = document.getElementById("tela-nome");
const telaEnvelope = document.getElementById("tela-envelope");
const telaCarta = document.getElementById("tela-carta");

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function verificarNome() {
  if (normalizar(campoNome.value) === "jessica") {
    mensagemErro.textContent = "";
    campoNome.blur(); // fecha o teclado no celular
    trocarTela(telaNome, telaEnvelope);
  } else {
    mensagemErro.textContent = "Hmm... esse não é o nome da pessoa mais especial do mundo 😉";
    campoNome.classList.remove("tremer");
    void campoNome.offsetWidth;
    campoNome.classList.add("tremer");
  }
}

botaoEntrar.addEventListener("click", verificarNome);
campoNome.addEventListener("keydown", (e) => {
  if (e.key === "Enter") verificarNome();
});

// ===== 4. MÚSICA =====
const musica = document.getElementById("musica");
const botaoMusica = document.getElementById("botao-musica");
const avisoMusica = document.getElementById("aviso-musica");
let musicaComErro = false;

function mostrarAviso(texto) {
  avisoMusica.textContent = texto;
  avisoMusica.classList.add("visivel");
  setTimeout(() => avisoMusica.classList.remove("visivel"), 7000);
}

function marcarTocando() {
  botaoMusica.textContent = "🎵";
  botaoMusica.classList.remove("pausado");
  botaoMusica.classList.add("tocando");
}

function marcarPausado() {
  botaoMusica.textContent = "🔇";
  botaoMusica.classList.remove("tocando");
  botaoMusica.classList.add("pausado");
}

// Se nenhum arquivo de música for encontrado, avisa
const fontes = musica.querySelectorAll("source");
fontes[fontes.length - 1].addEventListener("error", () => {
  musicaComErro = true;
  console.warn("Nenhum arquivo de música encontrado na pasta 'musica'.");
});

// Começa a tocar no clique do selo (o navegador só deixa tocar depois de um clique)
function iniciarMusica() {
  musica.volume = 0.05;
  const tentativa = musica.play();
  if (tentativa !== undefined) {
    tentativa
      .then(marcarTocando)
      .catch((erro) => {
        console.warn("O navegador não deixou tocar a música:", erro);
        marcarPausado(); // o botão fica pulsando para ela tocar nele
      });
  }
}

// Quando a carta abre, o volume sobe devagar
function aumentarVolume() {
  const subir = setInterval(() => {
    if (musica.paused) { clearInterval(subir); return; }
    if (musica.volume < VOLUME_FINAL - 0.02) {
      musica.volume = Math.min(VOLUME_FINAL, musica.volume + 0.02);
    } else {
      musica.volume = VOLUME_FINAL;
      clearInterval(subir);
    }
  }, 100);
}

// Botão para pausar e voltar a tocar
botaoMusica.addEventListener("click", () => {
  if (musica.paused) {
    musica.volume = VOLUME_FINAL;
    musica.play().then(marcarTocando).catch(() =>
      mostrarAviso("Não consegui tocar a música. Confira o arquivo musica/nossa-musica.mp3")
    );
  } else {
    musica.pause();
    marcarPausado();
  }
});

// ===== 5. TELA 2: ABRIR O ENVELOPE =====
const envelope = document.getElementById("envelope");
const selo = document.getElementById("selo");
const dica = document.getElementById("dica");

selo.addEventListener("click", () => {
  iniciarMusica(); // tem que ser aqui, no clique

  selo.classList.add("quebrando");
  dica.classList.add("escondida");
  setTimeout(() => envelope.classList.add("aberto"), 500);

  setTimeout(() => {
    trocarTela(telaEnvelope, telaCarta, () => {
      chuvaDeCoracoes(40);
      clearInterval(intervaloCoracoes);
      intervaloCoracoes = setInterval(criarCoracao, 200);
      revelarTexto();
      aumentarVolume();
      botaoMusica.classList.add("visivel");
      if (musicaComErro || musica.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        mostrarAviso("Música não encontrada: confira o arquivo musica/nossa-musica.mp3");
      }
    });
  }, 3300);
});

// ===== 6. TELA 3: TEXTO APARECENDO AOS POUCOS =====
function revelarTexto() {
  const partes = document.querySelectorAll(".revelar");
  partes.forEach((parte, i) => {
    setTimeout(() => parte.classList.add("visivel"), 1300 + i * 800);
  });
}

// ===== 7. FOTOS =====
const galeria = document.getElementById("galeria");
const EXTENSOES = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"];
const giros = ["-4deg", "3deg", "-2deg", "4deg", "-3deg", "2deg"];

function carregarFoto(img, nome, tentativa = 0) {
  if (tentativa >= EXTENSOES.length) {
    console.warn("Foto não encontrada na pasta imagens: " + nome);
    img.closest("figure").remove();
    return;
  }
  img.onerror = () => carregarFoto(img, nome, tentativa + 1);
  img.src = "imagens/" + nome + EXTENSOES[tentativa];
}

FOTOS.forEach((foto, i) => {
  const figura = document.createElement("figure");
  figura.className = "polaroid";
  figura.style.setProperty("--giro", giros[i % giros.length]);

  const img = document.createElement("img");
  img.alt = foto.legenda;

  const legenda = document.createElement("figcaption");
  legenda.textContent = foto.legenda;

  figura.appendChild(img);
  figura.appendChild(legenda);
  galeria.appendChild(figura);

  carregarFoto(img, foto.arquivo);
  figura.addEventListener("click", () => ampliarFoto(img.src));
});

// ===== 8. AMPLIAR FOTO AO CLICAR =====
const ampliar = document.getElementById("ampliar");
const fotoAmpliada = document.getElementById("foto-ampliada");

function ampliarFoto(endereco) {
  fotoAmpliada.src = endereco;
  ampliar.classList.add("aberta");
}

ampliar.addEventListener("click", () => ampliar.classList.remove("aberta"));
