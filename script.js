// 🔒 STATUS PREMIUM (CORRIGIDO)
let isPremium = localStorage.getItem("premium") === "true";

// 🔑 LISTA DE CÓDIGOS VÁLIDOS
const CODIGOS_VALIDOS = [
"X7A9K2L","9QW3E7R","M4N8P2Z","T6Y1U8I","B3V9C4X","L8K2J5H","R4T7Y2U","Z1X9C3V","P8O2I6U","A7S3D9F", 
"X7A9K2L","9QW3E7R","M4N8P2Z","T6Y1U8I","B3V9C4X","L8K2J5H","R4T7Y2U","Z1X9C3V","P8O2I6U","A7S3D9F",
"G5H2J8K","Q1W7E4R","T9Y3U6I","O2P8A4S","D7F1G9H","J6K3L8Z","X2C7V5B","N9M1Q4W","E8R3T7Y","U2I6O9P",
"A4S7D1F","G8H3J6K","L2Z9X5C","V7B1N4M","Q3W8E2R","T6Y9U1I","O5P2A7S","D8F4G1H","J9K3L6Z","X7C2V8B",
"N1M4Q9W","E6R2T8Y","U3I7O1P","A9S5D2F","G4H8J1K","L6Z3X7C","V2B9N5M","Q8W1E6R","T3Y7U2I","O9P4A8S",
"D1F6G3H","J7K2L9Z","X5C8V1B","N4M7Q2W","E9R3T6Y","U1I8O4P","A2S9D7F","G6H1J5K","L3Z8X2C","V9B4N7M",
"Q2W5E9R","T1Y8U3I","O7P4A2S","D9F6G8H","J3K7L1Z","X8C2V6B","N5M9Q3W","E1R7T4Y","U8I2O5P","A6S3D9F",
"G2H7J4K","L9Z1X8C","V3B6N2M","Q7W4E1R","T8Y2U5I","O3P9A6S","D4F8G2H","J1K6L3Z","X9C5V7B","N2M8Q4W",
"E3R6T1Y","U7I4O9P","A8S2D5F","G1H9J3K","L7Z4X6C","V5B2N8M","Q9W3E7R","T2Y6U8I","O1P5A9S","D3F7G4H",
"J8K2L6Z","X4C9V3B","N7M1Q5W","E2R8T6Y","U9I3O7P","A5S1D8F","G7H4J2K","L8Z5X3C","V1B7N9M","Q4W6E2R"
];

function validarCodigo() {
  const input = document.getElementById("codigoPremium");
  const codigo = input.value.trim();

  if (CODIGOS_VALIDOS.includes(codigo)) {
    localStorage.setItem("premium", "true");
    alert("Acesso premium liberado!");
    location.reload();
  } else {
    alert("Código inválido.");
  }
}
function abrirTelaPremium() {
  openPremiumModal();
}

// 🔊 TEXT-TO-SPEECH (ÁUDIO)
const A11Y_KEYS = {
  enabled: "a11y_enabled",
  skipOnboarding: "a11y_skip_onboarding",
  showReader: "a11y_show_reader",
  visualPreset: "a11y_visual_preset",
  fontScale: "a11y_font_scale",
  ttsRate: "a11y_tts_rate",
  ttsPitch: "a11y_tts_pitch",
  autoRead: "a11y_auto_read"
};

const accessibilityState = {
  enabled: localStorage.getItem(A11Y_KEYS.enabled) === "true",
  skipOnboarding: localStorage.getItem(A11Y_KEYS.skipOnboarding) === "true",
  showReader: localStorage.getItem(A11Y_KEYS.showReader) !== "false",
  visualPreset: localStorage.getItem(A11Y_KEYS.visualPreset) || "default",
  fontScale: localStorage.getItem(A11Y_KEYS.fontScale) || "1",
  ttsRate: parseFloat(localStorage.getItem(A11Y_KEYS.ttsRate) || "0.9"),
  ttsPitch: parseFloat(localStorage.getItem(A11Y_KEYS.ttsPitch) || "1"),
  autoRead: localStorage.getItem(A11Y_KEYS.autoRead) === "true"
};

const speechState = {
  utterance: null,
  isSpeaking: false,
  isPausedByUser: false,
  currentText: "",
  currentLang: "pt-BR",
  currentSource: ""
};

function persistAccessibilityState() {
  localStorage.setItem(A11Y_KEYS.enabled, String(accessibilityState.enabled));
  localStorage.setItem(A11Y_KEYS.skipOnboarding, String(accessibilityState.skipOnboarding));
  localStorage.setItem(A11Y_KEYS.showReader, String(accessibilityState.showReader));
  localStorage.setItem(A11Y_KEYS.visualPreset, accessibilityState.visualPreset);
  localStorage.setItem(A11Y_KEYS.fontScale, String(accessibilityState.fontScale));
  localStorage.setItem(A11Y_KEYS.ttsRate, String(accessibilityState.ttsRate));
  localStorage.setItem(A11Y_KEYS.ttsPitch, String(accessibilityState.ttsPitch));
  localStorage.setItem(A11Y_KEYS.autoRead, String(accessibilityState.autoRead));
}

function updateReaderFabState() {
  const readerFab = document.getElementById("readerFab");
  if (!readerFab) return;

  readerFab.classList.remove("is-speaking", "is-paused");

  if (speechState.isSpeaking) {
    readerFab.classList.add("is-speaking");
    readerFab.textContent = "Pausar leitura";
    readerFab.setAttribute("aria-pressed", "true");
  } else if (speechState.isPausedByUser) {
    readerFab.classList.add("is-paused");
    readerFab.textContent = "Retomar leitura";
    readerFab.setAttribute("aria-pressed", "true");
  } else {
    readerFab.textContent = "Ler tela";
    readerFab.setAttribute("aria-pressed", "false");
  }
}

function resetSpeechState() {
  speechState.utterance = null;
  speechState.isSpeaking = false;
  speechState.isPausedByUser = false;
  speechState.currentText = "";
  speechState.currentLang = "pt-BR";
  speechState.currentSource = "";
  updateReaderFabState();
}

function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  resetSpeechState();
}

function speakText(text, lang = "en-US", options = {}) {
  if (!text || !("speechSynthesis" in window)) return;

  stopSpeech();

  const speech = new SpeechSynthesisUtterance(String(text));
  speech.lang = lang;
  speech.rate = accessibilityState.ttsRate;
  speech.pitch = accessibilityState.ttsPitch;

  speech.onstart = () => {
    speechState.isSpeaking = true;
    speechState.isPausedByUser = false;
    updateReaderFabState();
  };

  speech.onend = () => {
    resetSpeechState();
  };

  speech.onerror = () => {
    resetSpeechState();
  };

  speechState.utterance = speech;
  speechState.currentText = String(text);
  speechState.currentLang = lang;
  speechState.currentSource = options.source || "";

  window.speechSynthesis.speak(speech);
}

function toggleSpeechFromReader() {
  if (speechState.isSpeaking) {
    stopSpeech();
    return;
  }

  if (speechState.isPausedByUser && speechState.currentText) {
    speakText(speechState.currentText, speechState.currentLang, { source: speechState.currentSource });
    return;
  }

  readCurrentScreen();
}

// 👁️ TOGGLE UNIVERSAL
function universalToggle(target, trigger) {
  const element = typeof target === "string" ? document.getElementById(target) : target;
  if (!element) return;
  const isHidden = getComputedStyle(element).display === "none";
  element.style.display = isHidden ? "block" : "none";
  if (trigger) {
    const showText = trigger.dataset.showText || "Ver";
    const hideText = trigger.dataset.hideText || "Ocultar";
    trigger.textContent = isHidden ? hideText : showText;
    trigger.setAttribute("aria-expanded", String(isHidden));
  }
}

function toggleResposta(id, trigger) {
  universalToggle(id, trigger);
}

// 🔒 CONTROLE PREMIUM
function ativarPremium() {
  window.open("https://contate.me/5584988164322", "_blank");
}
const lessons = [
  {
    id: 1,
    order: 1,
    title: "A Palavra que Revela",
    reference: "John 1:1",
    verseEn: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    versePt: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
    guidedReading: [
      {
        title: "In the beginning → No princípio",
        text: "“In” significa em, e “the beginning” significa o começo, o início de tudo. Essa expressão aponta para o início da criação e da história de Deus com o homem."
      },
      {
        title: "was the Word → era o Verbo",
        text: "“was” é a forma passada do verbo to be e “the Word” significa a Palavra ou o Verbo. Aqui, Word representa Jesus como a revelação viva da mensagem de Deus."
      },
      {
        title: "and the Word was with God → e o Verbo estava com Deus",
        text: "“and” significa e, e “was with” significa estava com. A frase mostra a união entre Jesus e o Pai desde o princípio."
      },
      {
        title: "and the Word was God → e o Verbo era Deus",
        text: "Essa parte reafirma que Jesus não apenas estava com Deus, mas é Deus."
      }
    ],
    vocabulary: [
      { word: "beginning", translation: "princípio, começo", explanation: "simboliza o início da criação" },
      { word: "word", translation: "palavra, verbo", explanation: "representa Jesus, a comunicação divina" },
      { word: "with", translation: "com", explanation: "indica proximidade, união" },
      { word: "God", translation: "Deus", explanation: "o Criador, foco de toda fé cristã" },
      { word: "was", translation: "era, estava", explanation: "passado do verbo to be" }
    ],
    grammar: "O versículo usa o verbo “to be” no passado com a forma “was”. Ele aparece nas estruturas “was the Word”, “was with God” e “was God”. A palavra “with” mostra relação de proximidade, enquanto “was” mostra identidade. Gramaticalmente, é uma frase simples com grande significado espiritual.",
    reread: "Quando lemos “In the beginning was the Word”, entendemos que Jesus já existia antes da criação. O texto mostra a eternidade e a divindade de Cristo, além de revelar que Ele é a Palavra viva que comunica quem Deus é. Aprender isso em inglês ajuda o aluno a compartilhar a verdade com outras pessoas.",
    exercises: [
      { type: "Tradução EN → PT", question: "In the beginning was the Word.", answer: "No princípio era o Verbo." },
      { type: "Tradução EN → PT", question: "The Word was with God.", answer: "O Verbo estava com Deus." },
      { type: "Tradução EN → PT", question: "The Word was God.", answer: "O Verbo era Deus." },
      { type: "Tradução PT → EN", question: "No princípio era o Verbo.", answer: "In the beginning was the Word." },
      { type: "Lacuna", question: "In the ______ was the Word.", answer: "beginning" },
      { type: "Associação", question: "word = ?", answer: "verbo" }
    ],
    application: [
      "God is love. (Deus é amor.)",
      "The Word is truth. (A Palavra é verdade.)",
      "I share the Word with my friends. (Eu compartilho a Palavra com meus amigos.)",
      "Jesus was with God. (Jesus estava com Deus.)"
    ],
    prayerEn: "Lord, thank You for Your Word. Help me share Your truth with others. Give me faith and courage to speak about Jesus in English. Amen.",
    prayerPt: "Senhor, obrigado pela Tua Palavra. Ajuda-me a compartilhar a Tua verdade com outras pessoas. Dá-me fé e coragem para falar sobre Jesus em inglês. Amém.",
    prayerAdapt: "Lord, help me share Your Word with my friends Ana and Paulo.",
    insight: "Evangelismo começa com uma simples palavra — e Jesus é a Palavra. Aprender inglês com a Bíblia é mais do que estudar um idioma; é treinar o coração para comunicar o amor de Deus a todas as nações."
  },
  {
    id: 2,
    order: 2,
    title: "A Luz do Mundo",
    reference: "John 8:12",
    verseEn: "I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life.",
    versePt: "Eu sou a luz do mundo. Quem me segue não andará em trevas, mas terá a luz da vida.",
    guidedReading: [
      {
        title: "I am the light of the world → Eu sou a luz do mundo",
        text: "“I am” significa eu sou, “the light” significa a luz, e “of the world” significa do mundo. Jesus se apresenta como a luz que guia todos os povos."
      },
      {
        title: "Whoever follows me → Quem me segue",
        text: "“Whoever” significa quem quer que, e “follows” significa segue. O verbo está no presente simples, mostrando uma atitude contínua."
      },
      {
        title: "will never walk in darkness → nunca andará em trevas",
        text: "“will” indica futuro, “never” significa nunca, “walk in” significa andar em, e “darkness” significa trevas. Aqui vemos uma promessa."
      },
      {
        title: "but will have the light of life → mas terá a luz da vida",
        text: "“but” cria contraste, “have” significa terá, e “light of life” mostra direção espiritual e vida eterna."
      }
    ],
    vocabulary: [
      { word: "light", translation: "luz", explanation: "símbolo da presença e verdade de Deus" },
      { word: "world", translation: "mundo", explanation: "representa toda a humanidade" },
      { word: "follow", translation: "seguir", explanation: "indica discipulado e relação pessoal" },
      { word: "darkness", translation: "trevas, escuridão", explanation: "ausência de direção e fé" },
      { word: "life", translation: "vida", explanation: "plenitude espiritual e propósito" },
      { word: "will", translation: "auxiliar de futuro", explanation: "expressa promessa e certeza divina" }
    ],
    grammar: "Neste versículo, Jesus usa a estrutura “I am”, uma das mais importantes em inglês. Também aparecem o presente simples em “follows” e o futuro com “will” em “will walk” e “will have”. A conjunção “but” cria contraste entre trevas e luz.",
    reread: "Ao dizer “I am the light of the world”, Jesus não apenas faz uma declaração — Ele traz uma solução. O texto mostra que a luz de Cristo afasta toda escuridão espiritual. Ler esse versículo em inglês ajuda o aluno a compreender promessas universais de fé e evangelismo.",
    exercises: [
      { type: "Tradução EN → PT", question: "I am the light of the world.", answer: "Eu sou a luz do mundo." },
      { type: "Tradução PT → EN", question: "Eu sou a luz do mundo.", answer: "I am the light of the world." },
      { type: "Lacuna", question: "Jesus ______ the light of the world.", answer: "is" },
      { type: "Lacuna", question: "Whoever ______ Him will have life.", answer: "follows" },
      { type: "Associação", question: "darkness = ?", answer: "trevas" },
      { type: "Associação", question: "follow = ?", answer: "seguir" }
    ],
    application: [
      "Jesus is my light. (Jesus é a minha luz.)",
      "I follow the light. (Eu sigo a luz.)",
      "The world needs light. (O mundo precisa de luz.)",
      "I will not walk in darkness. (Eu não andarei em trevas.)"
    ],
    prayerEn: "Lord Jesus, You are the Light of the world. Shine Your light in my heart and help me share it with others. Let my words bring life and hope. Amen.",
    prayerPt: "Senhor Jesus, Tu és a Luz do mundo. Brilha Tua luz em meu coração e ajuda-me a compartilhá-la com outras pessoas. Que minhas palavras tragam vida e esperança. Amém.",
    prayerAdapt: "Lord, let Your light shine through me at school, at work, and with my friends.",
    insight: "Onde a Luz de Cristo entra, o medo e a confusão desaparecem. Cada palavra aprendida hoje também pode se tornar uma centelha de luz no evangelismo."
  },
  {
    id: 3,
    order: 3,
    title: "O Caminho da Vida",
    reference: "John 14:6",
    verseEn: "Jesus answered, I am the way and the truth and the life. No one comes to the Father except through me.",
    versePt: "Disse-lhe Jesus: Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim.",
    guidedReading: [
      {
        title: "Jesus answered → Disse-lhe Jesus",
        text: "“answered” significa respondeu ou disse. Essa é uma frase comum nos Evangelhos para apresentar diálogos."
      },
      {
        title: "I am the way and the truth and the life → Eu sou o caminho, e a verdade, e a vida",
        text: "“I am” significa eu sou, “the way” significa o caminho, “the truth” a verdade e “the life” a vida. Jesus é direção, verdade e vida."
      },
      {
        title: "No one comes to the Father → Ninguém vem ao Pai",
        text: "“no one” significa ninguém, e “comes” significa vem. A frase mostra exclusividade no acesso a Deus."
      },
      {
        title: "except through me → senão por mim",
        text: "“except” significa exceto ou senão, e “through me” significa por meio de mim. Jesus é o mediador."
      }
    ],
    vocabulary: [
      { word: "way", translation: "caminho", explanation: "aponta direção, propósito e destino espiritual" },
      { word: "truth", translation: "verdade", explanation: "aquilo que é real e confiável" },
      { word: "life", translation: "vida", explanation: "existência plena em Deus" },
      { word: "Father", translation: "Pai", explanation: "representa Deus como origem e relacionamento" },
      { word: "through", translation: "por, através de", explanation: "mostra o meio ou caminho de algo" },
      { word: "except", translation: "exceto, senão", explanation: "indica exclusividade" },
      { word: "come", translation: "vir", explanation: "movimento de aproximação espiritual" }
    ],
    grammar: "O versículo tem duas partes principais. Primeiro, “I am the way, the truth, and the life” reforça o uso do verbo to be e a repetição do artigo “the” para dar ênfase. Depois, “No one comes to the Father except through me” mostra uma estrutura negativa com “no one” e o uso de “through” para indicar meio.",
    reread: "Jesus não apenas mostra o caminho — Ele é o caminho. Esse versículo ensina que a fé cristã é relacionamento e direção. Aprender essa passagem em inglês ajuda o aluno a expressar verdades de fé com clareza e confiança.",
    exercises: [
      { type: "Tradução EN → PT", question: "I am the way and the truth and the life.", answer: "Eu sou o caminho, e a verdade, e a vida." },
      { type: "Tradução EN → PT", question: "No one comes to the Father except through me.", answer: "Ninguém vem ao Pai senão por mim." },
      { type: "Lacuna", question: "Jesus said, I ______ the way.", answer: "am" },
      { type: "Lacuna", question: "No one ______ to the Father.", answer: "comes" },
      { type: "Associação", question: "through = ?", answer: "por meio de" },
      { type: "Associação", question: "truth = ?", answer: "verdade" }
    ],
    application: [
      "Jesus is the way. (Jesus é o caminho.)",
      "I follow the truth. (Eu sigo a verdade.)",
      "My life is in Jesus. (Minha vida está em Jesus.)",
      "I come to God through Jesus. (Eu venho a Deus por meio de Jesus.)"
    ],
    prayerEn: "Lord Jesus, You are the Way, the Truth, and the Life. Guide me to follow You and to lead others to the Father through Your love. Use my words to show the world Your path. Amen.",
    prayerPt: "Senhor Jesus, Tu és o Caminho, a Verdade e a Vida. Guia-me para seguir-Te e conduzir outros ao Pai através do Teu amor. Usa minhas palavras para mostrar ao mundo o Teu caminho. Amém.",
    prayerAdapt: "Lord, help me show Your way to my family and friends.",
    insight: "Só existe um caminho que conduz à vida verdadeira — e Ele tem nome: Jesus. Todo idioma pode se tornar uma ponte para levar outros ao Pai através de Cristo."
  },
  {
    id: 4,
    order: 4,
    title: "Ide por Todo o Mundo",
    reference: "Mark 16:15",
    verseEn: "He said to them, Go into all the world and preach the gospel to all creation.",
    versePt: "E disse-lhes: Ide por todo o mundo e pregai o evangelho a toda criatura.",
    guidedReading: [
      {
        title: "He said to them → Ele lhes disse",
        text: "“He” significa Ele, “said” significa disse, e “to them” significa a eles. Jesus fala diretamente aos discípulos."
      },
      {
        title: "Go into all the world → Ide por todo o mundo",
        text: "“Go” significa ir, “into” significa para dentro de, e “all the world” mostra alcance global."
      },
      {
        title: "and preach the gospel → e pregai o evangelho",
        text: "“preach” significa pregar ou anunciar, e “the gospel” significa o evangelho. O foco é comunicar as boas novas."
      },
      {
        title: "to all creation → a toda criatura",
        text: "“all” significa todo ou toda, e “creation” significa criação ou criatura. O Evangelho é para todos."
      }
    ],
    vocabulary: [
      { word: "go", translation: "ir", explanation: "verbo de movimento e envio" },
      { word: "preach", translation: "pregar, anunciar", explanation: "comunicar a mensagem do evangelho" },
      { word: "gospel", translation: "evangelho, boas novas", explanation: "mensagem de salvação em Cristo" },
      { word: "world", translation: "mundo", explanation: "abrange toda a humanidade" },
      { word: "creation", translation: "criação, criatura", explanation: "todos os seres criados por Deus" },
      { word: "said", translation: "disse", explanation: "passado do verbo say" },
      { word: "all", translation: "todo, toda", explanation: "indica totalidade e abrangência" }
    ],
    grammar: "O versículo contém dois imperativos principais: “Go” e “preach”. O imperativo em inglês usa o verbo base e expressa instrução direta. No início também aparece o passado simples em “He said”, mostrando o que Jesus falou e continua valendo hoje.",
    reread: "Jesus chamou os discípulos para ir e pregar. Ao aprender esse versículo em inglês, entendemos que o chamado não é apenas histórico — ele continua atual. Falar “Go and preach” se torna uma frase de missão prática.",
    exercises: [
      { type: "Tradução EN → PT", question: "Go into all the world.", answer: "Ide por todo o mundo." },
      { type: "Tradução PT → EN", question: "Pregai o evangelho.", answer: "Preach the gospel." },
      { type: "Lacuna", question: "Go into all the ______.", answer: "world" },
      { type: "Lacuna", question: "Preach the ______ to all creation.", answer: "gospel" },
      { type: "Associação", question: "preach = ?", answer: "pregar" },
      { type: "Associação", question: "world = ?", answer: "mundo" }
    ],
    application: [
      "I go with God. (Eu vou com Deus.)",
      "I preach with love. (Eu prego com amor.)",
      "The gospel is good news. (O evangelho são boas novas.)",
      "We go into the world for Jesus. (Vamos ao mundo por Jesus.)"
    ],
    prayerEn: "Lord Jesus, send me to share Your gospel. Give me courage to go and speak with love. Use my voice to bring light to the world. Amen.",
    prayerPt: "Senhor Jesus, envia-me para compartilhar o Teu evangelho. Dá-me coragem para ir e falar com amor. Usa minha voz para levar luz ao mundo. Amém.",
    prayerAdapt: "Lord, send me to share Your gospel at school, at work, or online.",
    insight: "A palavra “Go!” foi o primeiro passo de toda a missão cristã. Aprender inglês com esse versículo é mais que estudo — é preparar-se para ser voz de Deus em todas as nações."
  },
  {
    id: 5,
    order: 5,
    title: "O Amor que Transforma",
    reference: "John 3:16",
    verseEn: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    versePt: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    guidedReading: [
      {
        title: "For God so loved the world → Porque Deus amou o mundo de tal maneira",
        text: "“For” significa porque, “so” significa tão ou de tal maneira, “loved” significa amou, e “the world” significa o mundo. O amor de Deus é apresentado de forma intensa."
      },
      {
        title: "that he gave his one and only Son → que deu o seu Filho unigênito",
        text: "“gave” significa deu, e “one and only Son” significa Filho único. A frase mostra entrega e generosidade."
      },
      {
        title: "that whoever believes in him → para que todo aquele que nele crê",
        text: "“whoever” significa todo aquele que, e “believes” significa crê. O convite da salvação é universal."
      },
      {
        title: "shall not perish but have eternal life → não pereça, mas tenha a vida eterna",
        text: "“shall” expressa certeza, “perish” significa perecer, e “eternal life” significa vida eterna. O amor de Deus resulta em salvação."
      }
    ],
    vocabulary: [
      { word: "love / loved", translation: "amar / amou", explanation: "expressão central da mensagem cristã" },
      { word: "give / gave", translation: "dar / deu", explanation: "verbo irregular que mostra ação generosa" },
      { word: "believe", translation: "crer, acreditar", explanation: "ato de fé e confiança" },
      { word: "world", translation: "mundo", explanation: "representa toda a humanidade" },
      { word: "Son", translation: "Filho", explanation: "refere-se a Jesus Cristo" },
      { word: "eternal life", translation: "vida eterna", explanation: "promessa de salvação para quem crê" },
      { word: "perish", translation: "perecer, morrer espiritualmente", explanation: "ausência da vida eterna" }
    ],
    grammar: "Este versículo ensina tempos verbais diferentes. “loved” e “gave” estão no passado, “believes” está no presente simples e “shall” indica futuro com certeza. A combinação desses tempos revela o amor já demonstrado, a fé vivida no presente e a promessa da vida eterna.",
    reread: "João 3:16 é o centro do evangelho. Cada verbo conta uma parte da história da salvação: Deus amou, deu e promete vida eterna. Aprender essa passagem em inglês fortalece a leitura e grava no coração a mensagem que transforma vidas.",
    exercises: [
      { type: "Tradução EN → PT", question: "For God so loved the world.", answer: "Porque Deus amou o mundo de tal maneira." },
      { type: "Tradução PT → EN", question: "Deus amou o mundo.", answer: "God loved the world." },
      { type: "Lacuna", question: "For God so ______ the world.", answer: "loved" },
      { type: "Lacuna", question: "That He ______ His only Son.", answer: "gave" },
      { type: "Associação", question: "eternal life = ?", answer: "vida eterna" },
      { type: "Associação", question: "believe = ?", answer: "crer" }
    ],
    application: [
      "God loves me. (Deus me ama.)",
      "Jesus gave His life for me. (Jesus deu Sua vida por mim.)",
      "I believe in Jesus. (Eu creio em Jesus.)",
      "I have eternal life. (Eu tenho vida eterna.)"
    ],
    prayerEn: "Father, thank You for Your great love. You gave Your Son for me, and I believe in Him. Help me share this message of love with the world. Amen.",
    prayerPt: "Pai, obrigado pelo Teu grande amor. Tu deste o Teu Filho por mim, e eu creio Nele. Ajuda-me a compartilhar essa mensagem de amor com o mundo. Amém.",
    prayerAdapt: "Lord, help me share John 3:16 with someone today.",
    insight: "O amor de Deus é a língua que o mundo entende. Quando usamos o inglês para falar desse amor, tornamo-nos parte do plano divino — um idioma, uma fé, uma mensagem de salvação."
  },
{
  id: 6,
  order: 6,
  title: "Uma Nova Criação",
  reference: "2 Corinthians 5:17",
  verseEn: "Therefore, if anyone is in Christ, the new creation has come: the old has gone, the new is here!",
  versePt: "Portanto, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram, eis que tudo se fez novo.",
  guidedReading: [
    { title: "Therefore, if anyone is in Christ → Portanto, se alguém está em Cristo", text: "“Therefore” = portanto, “if” = se, “anyone” = qualquer pessoa e “is” = está. Aqui vemos uma condição simples que mostra uma verdade espiritual: quem está em Cristo vive algo novo." },
    { title: "the new creation has come → nova criação chegou", text: "“new” = novo, “creation” = criação ou criatura, e “has come” = chegou. O presente perfeito mostra algo que aconteceu e continua produzindo efeito." },
    { title: "the old has gone → as coisas velhas já passaram", text: "“old” = velho, antigo e “has gone” = se foi, desapareceu. A frase mostra ruptura com o passado." },
    { title: "the new is here! → eis que tudo se fez novo", text: "“new” = novo e “is here” = está aqui. A transformação em Cristo é presente e real." }
  ],
  vocabulary: [
    { word: "therefore", translation: "portanto", explanation: "conecta a verdade anterior à consequência espiritual" },
    { word: "if", translation: "se", explanation: "introduz condição simples" },
    { word: "anyone", translation: "alguém, qualquer pessoa", explanation: "expressa inclusão e universalidade" },
    { word: "creation", translation: "criação, criatura", explanation: "pessoa renovada pela graça" },
    { word: "old / new", translation: "velho / novo", explanation: "contraste entre passado e transformação" },
    { word: "has gone / has come", translation: "foi / chegou", explanation: "mudança com efeito no presente" }
  ],
  grammar: "Este versículo usa a condicional simples com “if” e o presente perfeito em “has come” e “has gone”. Essas estruturas mostram uma condição atual com efeitos permanentes e ajudam o aluno a falar sobre transformação e testemunho.",
  reread: "Ser nova criação não é apenas mudar por fora, mas nascer novamente por dentro. Em inglês, a estrutura mostra ação e resultado: quem está em Cristo deixa o passado e vive o novo agora.",
  exercises: [
    { type: "Tradução EN → PT", question: "If anyone is in Christ.", answer: "Se alguém está em Cristo." },
    { type: "Tradução EN → PT", question: "The old has gone.", answer: "As coisas velhas já passaram." },
    { type: "Tradução EN → PT", question: "The new is here.", answer: "O novo está aqui." },
    { type: "Tradução PT → EN", question: "As coisas velhas já passaram.", answer: "The old has gone." },
    { type: "Lacuna", question: "__________, if anyone is in Christ.", answer: "Therefore" },
    { type: "Associação", question: "anyone = ?", answer: "qualquer pessoa" }
  ],
  application: [
    "I am new in Christ. (Eu sou novo em Cristo.)",
    "The old has gone. (O velho já passou.)",
    "God makes all things new. (Deus faz todas as coisas novas.)",
    "I live a new life. (Eu vivo uma nova vida.)"
  ],
  prayerEn: "Lord Jesus, thank You for making me a new creation. The old has gone, and new life has come. Help me share this transformation with others. Amen.",
  prayerPt: "Senhor Jesus, obrigado por me fazer uma nova criatura. As coisas velhas se foram, e uma nova vida chegou. Ajuda-me a compartilhar essa transformação com outras pessoas. Amém.",
  prayerAdapt: "Lord, make my words show Your new life today.",
  insight: "O evangelho é a boa notícia que renova. Cada palavra aprendida hoje relembra que o inglês é só o instrumento — o verdadeiro objetivo é viver e comunicar a nova vida em Cristo."
},
{
  id: 7,
  order: 7,
  title: "Não Tenha Medo",
  reference: "Isaiah 41:10",
  verseEn: "So do not fear, for I am with you; do not be dismayed, for I am your God.",
  versePt: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
  guidedReading: [
    { title: "So do not fear → Portanto, não temas", text: "“so” = portanto, “do not” = não, e “fear” = ter medo. Temos aqui um imperativo negativo usado para encorajar." },
    { title: "for I am with you → porque eu sou contigo", text: "“for” = porque, “I am” = eu sou ou estou, e “with you” = com você. A frase mostra presença constante." },
    { title: "do not be dismayed → não te assombres", text: "“be” = ser ou estar, e “dismayed” = abatido, assustado. Outro imperativo negativo que reforça coragem." },
    { title: "for I am your God → porque eu sou o teu Deus", text: "“your” = teu e “God” = Deus. A expressão reforça relacionamento pessoal e confiança." }
  ],
  vocabulary: [
    { word: "fear", translation: "medo, temor", explanation: "algo que Deus remove quando estamos com Ele" },
    { word: "dismayed", translation: "assustado, desanimado", explanation: "estado emocional vencido pela fé" },
    { word: "with", translation: "com", explanation: "indica presença e companhia" },
    { word: "your", translation: "teu, seu", explanation: "pronome possessivo de relação pessoal" },
    { word: "be", translation: "ser/estar", explanation: "base verbal importante do inglês" },
    { word: "God", translation: "Deus", explanation: "centro da confiança espiritual" }
  ],
  grammar: "O versículo usa imperativos negativos com “do not” e a estrutura “I am” com o verbo to be. Essas construções são comuns no inglês cotidiano e, aqui, comunicam consolo, coragem e presença divina.",
  reread: "Isaías 41:10 é um lembrete direto de Deus: não tenha medo. Quando o aluno lê “I am with you”, pratica pronúncia e internaliza a verdade da presença de Deus em sua vida.",
  exercises: [
    { type: "Tradução EN → PT", question: "Do not fear.", answer: "Não temas." },
    { type: "Tradução EN → PT", question: "I am with you.", answer: "Eu sou contigo." },
    { type: "Tradução PT → EN", question: "Não te assombres.", answer: "Do not be dismayed." },
    { type: "Lacuna", question: "Do not __________.", answer: "fear" },
    { type: "Lacuna", question: "I am __________ you.", answer: "with" },
    { type: "Associação", question: "your God = ?", answer: "teu Deus" }
  ],
  application: [
    "I am not afraid. (Eu não tenho medo.)",
    "God is with me. (Deus está comigo.)",
    "I trust in God. (Eu confio em Deus.)",
    "He gives me peace. (Ele me dá paz.)"
  ],
  prayerEn: "Lord, thank You because You are with me. I will not fear, and I will not be dismayed. Give me peace and strength today. Amen.",
  prayerPt: "Senhor, obrigado porque Tu estás comigo. Não temerei e não me deixarei abater. Dá-me paz e força hoje. Amém.",
  prayerAdapt: "Lord, I will not fear. You are my God and my peace.",
  insight: "A coragem nasce da presença de Deus, não da ausência de problemas. Aprender este versículo em inglês é memorizar a verdade eterna: Deus está conosco — e por isso, não há o que temer."
},
{
  id: 8,
  order: 8,
  title: "Paz em Meio à Tempestade",
  reference: "Mark 4:39",
  verseEn: "He got up, rebuked the wind and said to the waves, “Quiet! Be still!” Then the wind died down and it was completely calm.",
  versePt: "E ele, despertando, repreendeu o vento e disse ao mar: “Acalma-te, emudece.” E o vento se aquietou, e fez-se grande bonança.",
  guidedReading: [
    { title: "He got up → Ele se levantou", text: "“He” = ele e “got up” = levantou-se. Mostra ação imediata de Jesus diante da tempestade." },
    { title: "rebuked the wind → repreendeu o vento", text: "“rebuked” = repreendeu. A palavra mostra autoridade espiritual em ação." },
    { title: "Quiet! Be still! → Silêncio! Acalma-te!", text: "Aprendemos aqui imperativos positivos usados como comando direto e também como mensagem de paz." },
    { title: "the wind died down and it was completely calm → o vento se acalmou e houve calma completa", text: "“died down” = cessou, diminuiu, e “completely calm” = completamente calmo. Expressa paz total." }
  ],
  vocabulary: [
    { word: "got up", translation: "levantou-se", explanation: "ação física e imediata de Jesus" },
    { word: "rebuke", translation: "repreender", explanation: "falar com autoridade espiritual" },
    { word: "wind", translation: "vento", explanation: "símbolo de caos ou dificuldade" },
    { word: "waves", translation: "ondas", explanation: "força natural que representa problemas" },
    { word: "be still", translation: "acalmar-se, ficar quieto", explanation: "ordem que traz paz" },
    { word: "calm", translation: "calmo, tranquilo", explanation: "estado produzido por Jesus" }
  ],
  grammar: "Este versículo traz verbos no passado simples como “got up”, “rebuked” e “said”, além do imperativo positivo em “Be still!”. Também apresenta a expressão idiomática “died down”, útil em situações do cotidiano.",
  reread: "Jesus não apenas falou com o mar; Ele falou com autoridade. Ao meditar em “Be still”, o aluno aprende inglês e, ao mesmo tempo, exercita paz interior e confiança espiritual.",
  exercises: [
    { type: "Tradução EN → PT", question: "He got up.", answer: "Ele se levantou." },
    { type: "Tradução EN → PT", question: "Be still!", answer: "Acalma-te!" },
    { type: "Tradução PT → EN", question: "O vento se acalmou.", answer: "The wind died down." },
    { type: "Lacuna", question: "He __________ the wind.", answer: "rebuked" },
    { type: "Lacuna", question: "The wind __________ down.", answer: "died" },
    { type: "Associação", question: "rebuke = ?", answer: "repreender" }
  ],
  application: [
    "Jesus calms the storm. (Jesus acalma a tempestade.)",
    "I will be still in His presence. (Eu ficarei calmo na presença Dele.)",
    "The wind obeys His voice. (O vento obedece à Sua voz.)",
    "Jesus gives peace to my heart. (Jesus dá paz ao meu coração.)"
  ],
  prayerEn: "Lord Jesus, You calm every storm. Speak “Peace, be still” to my heart today. Help me trust You when I am afraid. Amen.",
  prayerPt: "Senhor Jesus, Tu acalmas toda tempestade. Fala ao meu coração: “Paz, acalma-te” hoje. Ajuda-me a confiar em Ti quando tenho medo. Amém.",
  prayerAdapt: "Lord, bring peace to my mind and my family today.",
  insight: "Jesus não removeu a tempestade imediatamente — Ele falou com ela. Da mesma forma, podemos responder às nossas tempestades com a mesma voz de fé: “Be still.”"
},
{
  id: 9,
  order: 9,
  title: "O Senhor é Meu Pastor",
  reference: "Psalm 23:1",
  verseEn: "The Lord is my shepherd, I lack nothing.",
  versePt: "O Senhor é o meu pastor, nada me faltará.",
  guidedReading: [
    { title: "The Lord → O Senhor", text: "“The” = o e “Lord” = Senhor. Introduz Deus como soberano e cuidador." },
    { title: "is my shepherd → é o meu pastor", text: "“is” = é, “my” = meu, e “shepherd” = pastor. A estrutura mostra relação íntima com Deus." },
    { title: "I lack nothing → nada me faltará", text: "“I” = eu, “lack” = faltar e “nothing” = nada. Expressa provisão completa e confiança." }
  ],
  vocabulary: [
    { word: "Lord", translation: "Senhor", explanation: "título de Deus como soberano e protetor" },
    { word: "shepherd", translation: "pastor", explanation: "imagem de cuidado, direção e provisão" },
    { word: "my", translation: "meu", explanation: "pronome possessivo de relação pessoal" },
    { word: "lack", translation: "faltar", explanation: "ausência de algo necessário" },
    { word: "nothing", translation: "nada", explanation: "totalidade da provisão divina" },
    { word: "is", translation: "é", explanation: "forma do verbo to be" }
  ],
  grammar: "Este versículo usa a estrutura sujeito + verbo + complemento em “The Lord is my shepherd” e o presente simples em “I lack nothing”. Também reforça o uso de pronomes possessivos como “my”, conectando gramática e fé pessoal.",
  reread: "O Salmo 23 começa declarando que Deus é nosso pastor. Em inglês, a frase “I lack nothing” é curta, porém profunda, ensinando confiança, provisão e paz emocional.",
  exercises: [
    { type: "Tradução EN → PT", question: "The Lord is my shepherd.", answer: "O Senhor é o meu pastor." },
    { type: "Tradução EN → PT", question: "I lack nothing.", answer: "Nada me faltará." },
    { type: "Tradução PT → EN", question: "O Senhor é o meu pastor.", answer: "The Lord is my shepherd." },
    { type: "Lacuna", question: "The __________ is my shepherd.", answer: "Lord" },
    { type: "Lacuna", question: "I __________ nothing.", answer: "lack" },
    { type: "Associação", question: "shepherd = ?", answer: "pastor" }
  ],
  application: [
    "The Lord is my shepherd. (O Senhor é o meu pastor.)",
    "I trust my shepherd. (Eu confio no meu pastor.)",
    "God gives me everything. (Deus me dá tudo.)",
    "Nothing is lacking in my life. (Nada falta na minha vida.)"
  ],
  prayerEn: "Lord, You are my shepherd. I lack nothing because You care for me. Lead me and give me peace today. Amen.",
  prayerPt: "Senhor, Tu és o meu pastor. Nada me falta porque Tu cuidas de mim. Guia-me e dá-me paz hoje. Amém.",
  prayerAdapt: "Lord, be my shepherd in this difficult moment.",
  insight: "Quando reconhecemos que Deus é nosso pastor, o medo dá lugar à confiança. Aprender este versículo em inglês também nos ensina a viver com a certeza de que nada falta quando Ele cuida de nós."
},
{
  id: 10,
  order: 10,
  title: "Esperança Renovada",
  reference: "Isaiah 40:31",
  verseEn: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
  versePt: "Mas os que esperam no Senhor renovarão as suas forças. Subirão com asas como águias; correrão e não se cansarão, caminharão e não se fatigarão.",
  guidedReading: [
    { title: "But those who hope in the Lord → Mas os que esperam no Senhor", text: "“But” = mas, “those who” = aqueles que e “hope” = esperam. A frase introduz o tema da confiança em Deus." },
    { title: "will renew their strength → renovarão as suas forças", text: "“will” = futuro, “renew” = renovar, “their” = suas e “strength” = forças. A estrutura mostra promessa divina." },
    { title: "They will soar on wings like eagles → subirão com asas como águias", text: "“soar” = voar alto, “wings” = asas e “eagles” = águias. É uma imagem poética de elevação acima das circunstâncias." },
    { title: "they will run and not grow weary / they will walk and not be faint → correrão e não se cansarão / caminharão e não se fatigarão", text: "A repetição de “will” reforça certeza. “grow weary” significa cansar, e “be faint” significa desfalecer." }
  ],
  vocabulary: [
    { word: "hope", translation: "esperar, ter esperança", explanation: "confiança ativa em Deus" },
    { word: "renew", translation: "renovar", explanation: "trazer força nova" },
    { word: "strength", translation: "força", explanation: "capacidade espiritual e emocional" },
    { word: "soar", translation: "voar alto", explanation: "elevar-se acima das circunstâncias" },
    { word: "weary", translation: "cansado, fatigado", explanation: "estado que Deus ajuda a vencer" },
    { word: "wings", translation: "asas", explanation: "símbolo de liberdade e elevação" }
  ],
  grammar: "O versículo usa o futuro simples com “will” repetidas vezes: “will renew”, “will soar”, “will run”. Isso reforça a ideia de promessa. Também aparece a estrutura “those who + verbo”, muito comum para descrever grupos ou perfis.",
  reread: "Este versículo fala de força renovada. Quem espera no Senhor não apenas resiste, mas voa, corre e caminha com vigor. Em inglês, a repetição de “will” ajuda o aluno a memorizar o futuro com uma mensagem de esperança.",
  exercises: [
    { type: "Tradução EN → PT", question: "Those who hope in the Lord.", answer: "Os que esperam no Senhor." },
    { type: "Tradução EN → PT", question: "They will renew their strength.", answer: "Eles renovarão as suas forças." },
    { type: "Tradução PT → EN", question: "Correrão e não se cansarão.", answer: "They will run and not grow weary." },
    { type: "Lacuna", question: "Those who __________ in the Lord.", answer: "hope" },
    { type: "Lacuna", question: "They will __________ their strength.", answer: "renew" },
    { type: "Associação", question: "soar = ?", answer: "voar alto" }
  ],
  application: [
    "I hope in God. (Eu espero em Deus.)",
    "God renews my strength. (Deus renova minha força.)",
    "I can soar like an eagle. (Eu posso voar como uma águia.)",
    "I run without weariness. (Eu corro sem cansar.)"
  ],
  prayerEn: "Lord, I hope in You. Renew my strength so I can soar like an eagle. Help me run without weariness today. Amen.",
  prayerPt: "Senhor, eu espero em Ti. Renova minha força para que eu voe como águia. Ajuda-me a correr sem cansar hoje. Amém.",
  prayerAdapt: "Lord, renew my hope when I feel tired.",
  insight: "A verdadeira força não vem de nós mesmos, mas de esperar no Senhor. Aprender este versículo em inglês também é aprender a voar acima das circunstâncias com asas de fé renovada."
},
{
  id: 11,
  order: 11,
  title: "Descanso para a Alma",
  reference: "Matthew 11:28",
  verseEn: "Come to me, all you who are weary and burdened, and I will give you rest.",
  versePt: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
  guidedReading: [
    { title: "Come to me → Vinde a mim", text: "“Come” = vinde (imperativo), “to me” = a mim. Convite direto de Jesus — movimento de aproximação espiritual." },
    { title: "all you who are weary and burdened → todos os que estais cansados e oprimidos", text: "“all you who” = todos vós que, “weary” = cansado, “burdened” = sobrecarregado. Identifica quem precisa de alívio." },
    { title: "and I will give you rest → e eu vos aliviarei", text: "“will give” = darei (futuro), “rest” = descanso, alívio. Promessa de paz verdadeira." }
  ],
  vocabulary: [
    { word: "come", translation: "vir", explanation: "convite pessoal de Jesus" },
    { word: "weary", translation: "cansado", explanation: "exaustão física e emocional" },
    { word: "burdened", translation: "sobrecarregado", explanation: "peso espiritual ou emocional" },
    { word: "rest", translation: "descanso, alívio", explanation: "paz que Jesus oferece" },
    { word: "give", translation: "dar", explanation: "generosidade divina" }
  ],
  grammar: "Imperativo + futuro: “Come to me” (imperativo) → convite imediato. “I will give you rest” (futuro com will) → promessa certa. Estrutura relativa: “all you who are weary” = todos vocês que estão cansados.",
  reread: "Jesus convida diretamente: “Vinde a mim”. O versículo mostra que o descanso não é ausência de problemas, mas presença de Cristo. Em inglês, praticamos convites e promessas enquanto internalizamos alívio espiritual.",
  exercises: [
    { type: "Tradução EN → PT", question: "Come to me.", answer: "Vinde a mim." },
    { type: "Tradução EN → PT", question: "I will give you rest.", answer: "Eu vos aliviarei." },
    { type: "Tradução PT → EN", question: "Vinde a mim.", answer: "Come to me." },
    { type: "Lacuna", question: "Come to __________.", answer: "me" },
    { type: "Lacuna", question: "All you who are __________.", answer: "weary" },
    { type: "Associação", question: "rest = ?", answer: "descanso" }
  ],
  application: [
    "Come to Jesus. (Vem a Jesus.)",
    "Jesus gives rest. (Jesus dá descanso.)",
    "I am not weary in Him. (Não estou cansado Nele.)",
    "He gives me peace. (Ele me dá paz.)"
  ],
  prayerEn: "Jesus, I come to You. I am weary, but You give me rest. Thank You for Your peace. Amen.",
  prayerPt: "Jesus, eu venho a Ti. Estou cansado, mas Tu me dás descanso. Obrigado pela Tua paz. Amém.",
  prayerAdapt: "Jesus, I come to You with my burdens today.",
  insight: "O convite de Jesus é sempre atual: “Vinde a mim”. Aprender este versículo em inglês é aceitar o descanso que só Ele pode dar — paz que alivia toda alma cansada."
},
{
  id: 12,
  order: 12,
  title: "Ele Cuida de Você",
  reference: "1 Peter 5:7",
  verseEn: "Cast all your anxiety on him because he cares for you.",
  versePt: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.",
  guidedReading: [
    { title: "Cast all your anxiety on him → Lançando sobre ele toda a vossa ansiedade", text: "“Cast” = lançar, entregar; “all your anxiety” = toda a vossa ansiedade; “on him” = sobre ele. Ação de entrega total." },
    { title: "because he cares for you → porque ele tem cuidado de vós", text: "“because” = porque; “cares” = cuida; “for you” = de vós. Razão para a confiança: cuidado pessoal de Deus." }
  ],
  vocabulary: [
    { word: "cast", translation: "lançar, entregar", explanation: "ação de soltar o peso" },
    { word: "anxiety", translation: "ansiedade", explanation: "preocupação excessiva" },
    { word: "cares", translation: "cuida", explanation: "atenção amorosa de Deus" },
    { word: "all", translation: "toda", explanation: "totalidade da entrega" },
    { word: "because", translation: "porque", explanation: "explica a razão da confiança" }
  ],
  grammar: "Imperativo + razão: “Cast all your anxiety on him” (imperativo). “because he cares” (presente simples, fato contínuo). Verbo “care” no presente: he cares = ele cuida (sempre, constantemente).",
  reread: "Deus nos convida a entregar tudo. O versículo mostra que cuidado divino é razão suficiente para viver sem ansiedade. Em inglês, praticamos verbos de ação emocional enquanto aprendemos a confiar.",
  exercises: [
    { type: "Tradução EN → PT", question: "Cast all your anxiety.", answer: "Lançai toda a vossa ansiedade." },
    { type: "Tradução EN → PT", question: "He cares for you.", answer: "Ele cuida de vós." },
    { type: "Tradução PT → EN", question: "Lançando sobre ele tua ansiedade.", answer: "Cast your anxiety on him." },
    { type: "Lacuna", question: "Cast __________ your anxiety.", answer: "all" },
    { type: "Lacuna", question: "Because he __________ for you.", answer: "cares" },
    { type: "Associação", question: "cast = ?", answer: "lançar" }
  ],
  application: [
    "God cares for me. (Deus cuida de mim.)",
    "I cast my fears on Him. (Eu lanço meus medos sobre Ele.)",
    "No anxiety in Jesus. (Sem ansiedade em Jesus.)",
    "He gives me peace. (Ele me dá paz.)"
  ],
  prayerEn: "Lord, I cast all my anxiety on You. Thank You because You care for me. Fill me with Your peace. Amen.",
  prayerPt: "Senhor, lanço toda a minha ansiedade sobre Ti. Obrigado porque cuidas de mim. Enche-me da Tua paz. Amém.",
  prayerAdapt: "Lord, I cast my worries about work on You.",
  insight: "Deus não apenas pode cuidar — Ele quer cuidar. Aprender este versículo em inglês é praticar a entrega que liberta — porque Seu cuidado é perfeito e pessoal."
},
{
  id: 13,
  order: 13,
  title: "Edificados na Rocha",
  reference: "Matthew 7:24",
  verseEn: "Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock.",
  versePt: "Todo aquele, portanto, que ouve estas minhas palavras e as pratica será comparado a um homem prudente que edificou a sua casa sobre a rocha.",
  guidedReading: [
    { title: "Therefore everyone who hears → Todo aquele, portanto, que ouve", text: "“Therefore” = portanto; “everyone who” = todo aquele que; “hears” = ouve (presente de hear). Introdução condicional: ouvir a Palavra é o primeiro passo." },
    { title: "these words of mine → estas minhas palavras", text: "“these” = estas; “of mine” = minhas. Referência direta ao ensino de Jesus." },
    { title: "and puts them into practice → e as pratica", text: "“puts into practice” = pratica, aplica; “them” = elas (as palavras). Ação essencial para edificação espiritual." },
    { title: "is like a wise man who built his house on the rock → será comparado a um homem prudente que edificou a sua casa sobre a rocha", text: "“is like” = é como; “wise man” = homem sábio; “built” = edificou (passado de build); “on the rock” = sobre a rocha." }
  ],
  vocabulary: [
    { word: "hears", translation: "ouve", explanation: "escuta ativa da Palavra" },
    { word: "practice", translation: "praticar", explanation: "aplicar o que se aprende" },
    { word: "wise", translation: "sábio, prudente", explanation: "discernimento espiritual" },
    { word: "built", translation: "edificou", explanation: "construir com solidez" },
    { word: "house", translation: "casa", explanation: "representa a vida espiritual" },
    { word: "rock", translation: "rocha", explanation: "base firme (Jesus)" }
  ],
  grammar: "Estrutura condicional com “who”: “everyone who hears” = todo aquele que ouve. “a wise man who built” = um homem sábio que edificou. Verbo no passado: built = edificou (verbo irregular: build–built). Comparação: “is like” = é como (estrutura para analogias bíblicas). O versículo ensina que ouvir + praticar = base sólida — gramática e espiritualidade unidas.",
  reread: "Jesus compara a vida edificada na Palavra a uma casa sobre a rocha. Ouvir e praticar é o segredo da estabilidade espiritual. Em inglês, a estrutura who e o verbo build ajudam o aluno a expressar crescimento enquanto internaliza a sabedoria prática da fé.",
  exercises: [
    { type: "Tradução EN → PT", question: "Everyone who hears these words.", answer: "Todo aquele que ouve estas palavras." },
    { type: "Tradução EN → PT", question: "Puts them into practice.", answer: "As pratica." },
    { type: "Tradução EN → PT", question: "Built his house on the rock.", answer: "Edificou sua casa sobre a rocha." },
    { type: "Tradução PT → EN", question: "Todo aquele que ouve.", answer: "Everyone who hears." },
    { type: "Lacuna", question: "Everyone who __________ these words.", answer: "hears" },
    { type: "Lacuna", question: "Built his house on the __________.", answer: "rock" }
  ],
  application: [
    "I hear God's words. (Eu ouço as palavras de Deus.)",
    "I put them into practice. (Eu as coloco em prática.)",
    "My life is built on the rock. (Minha vida é edificada na rocha.)",
    "I am wise in Christ. (Eu sou sábio em Cristo.)"
  ],
  prayerEn: "Lord, help me hear Your words and put them into practice. Build my life on the rock that is You. Make me wise and strong. Amen.",
  prayerPt: "Senhor, ajuda-me a ouvir Tuas palavras e colocá-las em prática. Edifica minha vida na rocha que és Tu. Torna-me sábio e forte. Amém.",
  prayerAdapt: "Lord, help me practice what I learn today.",
  insight: "A verdadeira edificação começa com ouvir e obedecer. Aprender inglês com este versículo nos lembra: só a Palavra de Deus é rocha firme para toda a vida."
},
{
  id: 14,
  order: 14,
  title: "Força no Senhor",
  reference: "Ephesians 6:10",
  verseEn: "Finally, be strong in the Lord and in his mighty power.",
  versePt: "Finalmente, sede fortalecidos no Senhor e na força do seu poder.",
  guidedReading: [
    { title: "Finally → Finalmente", text: "Palavra de transição que introduz um ponto culminante." },
    { title: "be strong in the Lord → sede fortalecidos no Senhor", text: "“be” = sede (imperativo); “strong” = forte; “in the Lord” = no Senhor. Chamado à força divina — não humana." },
    { title: "and in his mighty power → e na força do seu poder", text: "“his” = seu; “mighty” = poderoso, grande; “power” = poder. Enfatiza a origem: o poder vem de Deus." }
  ],
  vocabulary: [
    { word: "strong", translation: "forte", explanation: "força espiritual, não apenas física" },
    { word: "Lord", translation: "Senhor", explanation: "fonte da verdadeira força" },
    { word: "mighty", translation: "poderoso, grande", explanation: "descreve o poder ilimitado de Deus" },
    { word: "power", translation: "poder", explanation: "capacidade divina para vencer" },
    { word: "be", translation: "ser/estar", explanation: "base do imperativo de fortalecimento" }
  ],
  grammar: "Imperativo com “be”: “Be strong” = Sede fortes. Usado para dar instrução espiritual direta. Preposições de localização espiritual: “in the Lord” = no Senhor (posição espiritual); “in his mighty power” = na força do seu poder. Adjetivo + substantivo: “mighty power” = poder poderoso (intensifica a ideia). Estrutura simples, mas profunda para edificação pessoal.",
  reread: "Paulo nos exorta: sejam fortes no Senhor. A força não é nossa — vem do poder divino. Em inglês, “be strong in the Lord” ensina confiança enquanto praticamos vocabulário de vitória espiritual.",
  exercises: [
    { type: "Tradução EN → PT", question: "Be strong in the Lord.", answer: "Sede fortes no Senhor." },
    { type: "Tradução EN → PT", question: "In his mighty power.", answer: "Na força do seu poder." },
    { type: "Tradução PT → EN", question: "Sede fortes no Senhor.", answer: "Be strong in the Lord." },
    { type: "Lacuna", question: "__________ strong in the Lord.", answer: "Be" },
    { type: "Lacuna", question: "In his __________ power.", answer: "mighty" },
    { type: "Associação", question: "strong = ?", answer: "forte" }
  ],
  application: [
    "Be strong in God. (Seja forte em Deus.)",
    "His power is mighty. (Seu poder é grande.)",
    "I trust God's strength. (Eu confio na força de Deus.)",
    "God gives me power. (Deus me dá poder.)"
  ],
  prayerEn: "Lord, make me strong in You. Fill me with Your mighty power. Help me stand firm today. Amen.",
  prayerPt: "Senhor, torna-me forte em Ti. Enche-me do Teu poder grande. Ajuda-me a permanecer firme hoje. Amém.",
  prayerAdapt: "Lord, give me strength for this challenge.",
  insight: "A verdadeira força flui de estar no Senhor. Aprender este versículo em inglês nos equipa para viver e declarar vitória espiritual em qualquer idioma."
},
{
  id: 15,
  order: 15,
  title: "A Armadura de Deus",
  reference: "Ephesians 6:11",
  verseEn: "Put on the full armor of God, so that you can take your stand against the devil's schemes.",
  versePt: "Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo.",
  guidedReading: [
    { title: "Put on the full armor of God → Revesti-vos de toda a armadura de Deus", text: "“Put on” = revestir-se, vestir; “full” = completa, toda; “armor” = armadura. Imperativo de preparação ativa." },
    { title: "so that you can take your stand → para que possais estar firmes", text: "“so that” = para que; “take your stand” = permanecer firme. Propósito da armadura: resistência." },
    { title: "against the devil's schemes → contra as astutas ciladas do diabo", text: "“against” = contra; “devil's” = do diabo; “schemes” = ciladas, estratégias astutas." }
  ],
  vocabulary: [
    { word: "put on", translation: "vestir, revestir", explanation: "ação de preparação espiritual" },
    { word: "armor", translation: "armadura", explanation: "proteção divina completa" },
    { word: "stand", translation: "permanecer firme", explanation: "resistência espiritual" },
    { word: "devil", translation: "diabo", explanation: "adversário espiritual" },
    { word: "schemes", translation: "ciladas, estratégias", explanation: "planos enganosos do inimigo" },
    { word: "full", translation: "completa", explanation: "totalidade da proteção" }
  ],
  grammar: "Phrasal verb: “Put on” = vestir (algo). Finalidade com “so that”: “so that you can take your stand” = para que possais permanecer firmes. Genitivo possessivo: “devil's schemes” = ciladas do diabo. Poder modal: “can take” = poder permanecer (capacidade dada por Deus). Estruturas práticas para falar de batalha espiritual.",
  reread: "Paulo ensina: vista a armadura completa de Deus. Não é equipamento parcial — é proteção total para enfrentar ciladas espirituais. Em inglês, “put on” e “take your stand” ensinam ação e firmeza enquanto edificamos fé madura.",
  exercises: [
    { type: "Tradução EN → PT", question: "Put on the full armor.", answer: "Revesti-vos de toda a armadura." },
    { type: "Tradução EN → PT", question: "Take your stand against the devil.", answer: "Permanecei firmes contra o diabo." },
    { type: "Tradução PT → EN", question: "Revesti-vos da armadura de Deus.", answer: "Put on the armor of God." },
    { type: "Lacuna", question: "Put on the __________ armor.", answer: "full" },
    { type: "Lacuna", question: "So that you can __________ your stand.", answer: "take" },
    { type: "Associação", question: "armor = ?", answer: "armadura" }
  ],
  application: [
    "Put on God's armor. (Vista a armadura de Deus.)",
    "I stand against evil. (Eu permaneço firme contra o mal.)",
    "God's power protects me. (O poder de Deus me protege.)",
    "I am strong in battle. (Eu sou forte na batalha.)"
  ],
  prayerEn: "Lord, help me put on Your full armor. Let me stand firm against all schemes. Strengthen me for the battle. Amen.",
  prayerPt: "Senhor, ajuda-me a vestir Tua armadura completa. Permite-me permanecer firme contra todas as ciladas. Fortalece-me para a batalha. Amém.",
  prayerAdapt: "Lord, help me stand firm today.",
  insight: "A batalha espiritual exige preparação diária. Aprender este versículo em inglês nos equipa para declarar vitória — vestindo a armadura que Deus já preparou."
},
{
  id: 16,
  order: 16,
  title: "Fruto do Espírito",
  reference: "Galatians 5:22",
  verseEn: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
  versePt: "Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança.",
  guidedReading: [
    { title: "But the fruit of the Spirit → Mas o fruto do Espírito", text: "“But” = mas (contraste); “fruit” = fruto; “of the Spirit” = do Espírito. Introduz o resultado natural da vida guiada pelo Espírito Santo." },
    { title: "is love, joy, peace → é: amor, gozo, paz", text: "“is” = é. Lista inicial de virtudes essenciais." },
    { title: "forbearance, kindness, goodness → longanimidade, benignidade, bondade", text: "“forbearance” = paciência, longanimidade; “kindness” = bondade; “goodness” = bondade." },
    { title: "faithfulness, gentleness and self-control → fé, mansidão e domínio próprio", text: "“faithfulness” = fidelidade; “gentleness” = mansidão; “self-control” = domínio próprio." }
  ],
  vocabulary: [
    { word: "fruit", translation: "fruto", explanation: "resultado natural do Espírito em nós" },
    { word: "Spirit", translation: "Espírito", explanation: "Espírito Santo, agente da transformação" },
    { word: "love", translation: "amor", explanation: "primeira virtude, base de todas" },
    { word: "joy", translation: "alegria, gozo", explanation: "felicidade espiritual" },
    { word: "peace", translation: "paz", explanation: "tranquilidade interior" },
    { word: "kindness", translation: "bondade", explanation: "atitude generosa" },
    { word: "faithfulness", translation: "fidelidade", explanation: "lealdade constante" },
    { word: "self-control", translation: "domínio próprio", explanation: "controle sobre desejos" }
  ],
  grammar: "Lista com vírgulas e “and”: Inglês usa vírgula entre itens e “and” antes do último: “love, joy, peace, ..., and self-control”. Sujeito + verbo + lista: “The fruit ... is love, joy...” → sujeito singular (fruit) com verbo is, seguido de complementos múltiplos. Vocabulário abstrato (substantivos que descrevem qualidades internas).",
  reread: "O fruto do Espírito não é esforço humano — é resultado da presença divina. Cada virtude é cultivada quando permitimos que o Espírito trabalhe em nós. Em inglês, aprender essas palavras expande o vocabulário emocional enquanto edifica caráter cristão.",
  exercises: [
    { type: "Tradução EN → PT", question: "The fruit of the Spirit.", answer: "O fruto do Espírito." },
    { type: "Tradução EN → PT", question: "Love, joy, peace.", answer: "Amor, gozo, paz." },
    { type: "Tradução EN → PT", question: "Self-control.", answer: "Domínio próprio." },
    { type: "Tradução PT → EN", question: "Fruto do Espírito.", answer: "Fruit of the Spirit." },
    { type: "Lacuna", question: "The fruit of the __________ is love.", answer: "Spirit" },
    { type: "Associação", question: "joy = ?", answer: "alegria" }
  ],
  application: [
    "The Spirit gives love. (O Espírito dá amor.)",
    "I have God's joy. (Eu tenho a alegria de Deus.)",
    "Peace is my fruit. (Paz é meu fruto.)",
    "I grow in self-control. (Eu cresço em domínio próprio.)"
  ],
  prayerEn: "Holy Spirit, grow Your fruit in me: Love, joy, peace, and self-control. Transform my heart daily. Amen.",
  prayerPt: "Espírito Santo, faz crescer em mim Teu fruto: Amor, alegria, paz e domínio próprio. Transforma meu coração diariamente. Amém.",
  prayerAdapt: "Spirit, grow patience in me today.",
  insight: "O fruto do Espírito é singular — não frutos separados, mas caráter completo. Aprender estas virtudes em inglês é também cultivá-las — viver a transformação que Deus planejou."
},
{
  id: 17,
  order: 17,
  title: "A Fé que Move Montanhas",
  reference: "Matthew 17:20",
  verseEn: "He replied, \"Because you have so little faith. Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, 'Move from here to there,' and it will move. Nothing will be impossible for you.\"",
  versePt: "E Jesus lhes disse: \"Por causa da vossa pouca fé; porque em verdade vos digo que, se tiverdes fé como um grão de mostarda, direis a este monte: 'Passa daqui para acolá', e há de passar; e nada vos será impossível.\"",
  guidedReading: [
    { title: "Because you have so little faith → Por causa da vossa pouca fé", text: "“because” = por causa de; “little faith” = pouca fé. Jesus identifica o problema: quantidade insuficiente de fé." },
    { title: "if you have faith as small as a mustard seed → se tiverdes fé como um grão de mostarda", text: "“if” = se; “as small as” = tão pequeno quanto; “mustard seed” = grão de mostarda. Fé pequena, mas genuína — tamanho não importa." },
    { title: "you can say to this mountain → direis a este monte", text: "“can say” = podeis dizer. Poder da palavra de fé." },
    { title: "'Move from here to there,' and it will move → 'Passa daqui para acolá', e há de passar", text: "Imperativo + resultado garantido." }
  ],
  vocabulary: [
    { word: "faith", translation: "fé", explanation: "confiança ativa em Deus" },
    { word: "mustard seed", translation: "grão de mostarda", explanation: "símbolo de fé pequena, mas poderosa" },
    { word: "mountain", translation: "monte, montanha", explanation: "obstáculos impossíveis humanamente" },
    { word: "move", translation: "mover", explanation: "poder sobrenatural da fé" },
    { word: "little", translation: "pouco", explanation: "quantidade insuficiente" },
    { word: "impossible", translation: "impossível", explanation: "limites humanos superados por Deus" }
  ],
  grammar: "Condicional simples: “If you have faith... you can say” → se tiverdes fé... podeis dizer. Comparação: “as small as a mustard seed” = tão pequeno quanto um grão de mostarda. Imperativo: “Move!” → Move-te! (comando direto à montanha). Negação: “Nothing will be impossible” = nada será impossível.",
  reread: "Jesus ensina que fé do tamanho de um grão move montanhas. Não é quantidade, mas qualidade — fé confiante em Deus. Em inglês, praticamos condicionais e comparações enquanto exercitamos crença ativa.",
  exercises: [
    { type: "Tradução EN → PT", question: "You have so little faith.", answer: "Vós tendes tão pouca fé." },
    { type: "Tradução EN → PT", question: "Faith as small as a mustard seed.", answer: "Fé como um grão de mostarda." },
    { type: "Tradução PT → EN", question: "Fé como grão de mostarda.", answer: "Faith as a mustard seed." },
    { type: "Lacuna", question: "If you have __________ as a mustard seed.", answer: "faith" },
    { type: "Lacuna", question: "Say to this __________.", answer: "mountain" },
    { type: "Associação", question: "faith = ?", answer: "fé" }
  ],
  application: [
    "I have faith in God. (Eu tenho fé em Deus.)",
    "Small faith moves mountains. (Pequena fé move montanhas.)",
    "Nothing is impossible with God. (Nada é impossível com Deus.)",
    "My faith grows daily. (Minha fé cresce diariamente.)"
  ],
  prayerEn: "Lord, increase my faith like a mustard seed. Help me speak to my mountains and see them move. Nothing is impossible with You. Amen.",
  prayerPt: "Senhor, aumenta minha fé como grão de mostarda. Ajuda-me a falar aos meus montes e vê-los mover. Nada é impossível Contigo. Amém.",
  prayerAdapt: "Lord, move this mountain in my life.",
  insight: "Fé pequena + Deus grande = milagres. Aprender este versículo em inglês nos capacita a declarar o impossível — porque com Deus, tudo é possível."
},
{
  id: 18,
  order: 18,
  title: "Perseverança nas Provações",
  reference: "James 1:2-3",
  verseEn: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.",
  versePt: "Meus irmãos, considerem motivo de grande alegria o fato de passarem por diversas provações, pois vocês sabem que a prova da sua fé produz perseverança.",
  guidedReading: [
    { title: "Consider it pure joy → Considerem motivo de grande alegria", text: "“consider” = considerar; “pure joy” = grande alegria, alegria completa. Aqui Tiago ensina uma atitude do coração: olhar para a prova com fé, não apenas com tristeza." },
    { title: "my brothers and sisters → meus irmãos e irmãs", text: "“brothers and sisters” = irmãos e irmãs na fé. Essa expressão mostra proximidade, carinho e comunhão entre os cristãos." },
    { title: "whenever you face trials of many kinds → quando vocês enfrentarem provações de muitos tipos", text: "“whenever” = sempre que, quando; “face” = enfrentar; “trials” = provações. O texto reconhece que dificuldades existem, e que elas podem vir de formas diferentes." },
    { title: "because you know that the testing of your faith produces perseverance → pois vocês sabem que a prova da sua fé produz perseverança", text: "“testing” = prova, teste; “faith” = fé; “produces perseverance” = produz perseverança. A ideia central é esta: a prova não é o fim; Deus pode usá-la para formar firmeza e maturidade." }
  ],
  vocabulary: [
    { word: "consider", translation: "considerar", explanation: "olhar para uma situação com certa perspectiva" },
    { word: "joy", translation: "alegria", explanation: "resposta de fé, mesmo em tempos difíceis" },
    { word: "face", translation: "enfrentar", explanation: "estar diante de um desafio" },
    { word: "trials", translation: "provações", explanation: "dificuldades e testes da vida" },
    { word: "testing", translation: "prova, teste", explanation: "processo que revela e fortalece a fé" },
    { word: "faith", translation: "fé", explanation: "confiança em Deus" },
    { word: "perseverance", translation: "perseverança", explanation: "capacidade de continuar firme" }
  ],
  grammar: "Este versículo trabalha bem o uso do presente simples em ideias permanentes, como em “you know” e “produces perseverance”, porque Tiago está ensinando uma verdade espiritual constante. A palavra “whenever” introduz uma situação repetida ou possível, com o sentido de “sempre que”, e ajuda o aluno a entender como o inglês expressa eventos da vida que podem acontecer em vários momentos. Também vemos uma estrutura importante de causa: “because you know”, que mostra motivo ou explicação, algo muito útil para leitura e compreensão de textos bíblicos em inglês.",
  reread: "Tiago não diz que a provação é fácil; ele ensina que ela pode produzir algo valioso na vida espiritual: perseverança. Quando o aluno lê este versículo em inglês, ele aprende vocabulário de luta e resistência, mas também absorve uma verdade consoladora: Deus pode transformar testes em crescimento. Assim, a leitura deixa de ser apenas acadêmica e se torna formativa, fortalecendo fé, paciência e constância.",
  exercises: [
    { type: "Tradução EN → PT", question: "Consider it pure joy.", answer: "Considerem motivo de grande alegria." },
    { type: "Tradução EN → PT", question: "You face trials of many kinds.", answer: "Vós enfrentais provações de muitos tipos." },
    { type: "Tradução EN → PT", question: "The testing of your faith produces perseverance.", answer: "A prova da vossa fé produz perseverança." },
    { type: "Tradução PT → EN", question: "Considerem motivo de alegria.", answer: "Consider it joy." },
    { type: "Lacuna", question: "Consider it pure __________.", answer: "joy" },
    { type: "Lacuna", question: "Your faith produces __________.", answer: "perseverance" }
  ],
  application: [
    "My faith grows in trials. (Minha fé cresce nas provações.)",
    "God gives me joy in hard times. (Deus me dá alegria em tempos difíceis.)",
    "Testing produces perseverance. (A prova produz perseverança.)",
    "I stay strong in God. (Eu permaneço forte em Deus.)"
  ],
  prayerEn: "Lord, help me have joy in trials. Strengthen my faith through every testing. Teach me perseverance and keep me strong in You. Amen.",
  prayerPt: "Senhor, ajuda-me a ter alegria nas provações. Fortalece minha fé em cada prova. Ensina-me perseverança e mantém-me firme em Ti. Amém.",
  prayerAdapt: "Lord, give me perseverance in this difficult season.",
  insight: "A provação pode doer, mas ela não precisa destruir. Nas mãos de Deus, até o teste se torna treinamento — e a fé provada aprende a permanecer firme."
},
{
  id: 19,
  order: 19,
  title: "Buscai Primeiro o Reino",
  reference: "Matthew 6:33",
  verseEn: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
  versePt: "Buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas.",
  guidedReading: [
    { title: "But seek first → Buscai, pois, em primeiro lugar", text: "“But” = mas (contraste com preocupações mundanas); “seek” = buscar; “first” = em primeiro lugar. Um imperativo claro: priorizar o reino de Deus acima de tudo." },
    { title: "his kingdom and his righteousness → o seu reino e a sua justiça", text: "“his kingdom” = seu reino; “his righteousness” = sua justiça. Foco no que pertence a Deus — reino e caráter santo." },
    { title: "and all these things will be given to you as well → e todas estas coisas vos serão acrescentadas", text: "“will be given” = serão dadas; “as well” = também, acrescentadas. Promessa de provisão divina quando colocamos Deus em primeiro lugar." }
  ],
  vocabulary: [
    { word: "seek", translation: "buscar", explanation: "procurar ativamente, priorizar" },
    { word: "first", translation: "primeiro", explanation: "ordem de importância espiritual" },
    { word: "kingdom", translation: "reino", explanation: "domínio e governo de Deus" },
    { word: "righteousness", translation: "justiça", explanation: "retidão e caráter santo" },
    { word: "given", translation: "dado", explanation: "provisão graciosa de Deus" },
    { word: "as well", translation: "também", explanation: "inclusão de necessidades básicas" }
  ],
  grammar: "Imperativo no presente: “Seek first” = Buscai em primeiro lugar (ação contínua). Futuro passivo: “will be given” = serão dadas (Deus provê, não nós). Estrutura coordenada: “his kingdom and his righteousness” = seu reino e sua justiça (duas prioridades unidas por “and”). Perfeito para praticar prioridades e promessas em inglês devocional.",
  reread: "Jesus nos convida a buscar primeiro o reino. Quando priorizamos Deus, Ele cuida do resto — uma verdade devocional para vida cotidiana. Ler em inglês reforça essa disciplina espiritual, treinando mente e coração para alinhamento diário com o Pai.",
  exercises: [
    { type: "Tradução EN → PT", question: "Seek first his kingdom.", answer: "Buscai primeiro o seu reino." },
    { type: "Tradução EN → PT", question: "All these things will be given.", answer: "Todas estas coisas vos serão dadas." },
    { type: "Tradução PT → EN", question: "Buscai primeiro o reino.", answer: "Seek first the kingdom." },
    { type: "Lacuna", question: "__________ first his kingdom.", answer: "Seek" },
    { type: "Lacuna", question: "All these things will be __________ to you.", answer: "given" },
    { type: "Associação", question: "kingdom = ?", answer: "reino" }
  ],
  application: [
    "Seek God first. (Busque Deus primeiro.)",
    "His kingdom comes. (Seu reino vem.)",
    "God gives all I need. (Deus dá tudo o que preciso.)",
    "Righteousness matters most. (Justiça importa mais.)"
  ],
  prayerEn: "Father, I seek first Your kingdom and righteousness. Give me what I need each day. Draw me closer to You. Amen.",
  prayerPt: "Pai, busco primeiro o Teu reino e Tua justiça. Dá-me o que preciso cada dia. Aproxima-me de Ti. Amém.",
  prayerAdapt: "Father, help me seek You before my worries.",
  insight: "Primeiro lugar = paz divina. Buscar o reino de Deus reordena prioridades — e libera o coração para intimidade verdadeira com o Pai."
},
{
  id: 20,
  order: 20,
  title: "Oração e Gratidão",
  reference: "Philippians 4:6",
  verseEn: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
  versePt: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.",
  guidedReading: [
    { title: "Do not be anxious about anything → Não andem ansiosos por coisa alguma", text: "“do not be” = não sejam (imperativo negativo); “anxious” = ansioso. Paulo começa com uma ordem clara contra a ansiedade." },
    { title: "but in every situation → mas em tudo", text: "“but” = mas (contraste); “in every situation” = em toda situação. Mostra abrangência: oração para qualquer circunstância." },
    { title: "by prayer and petition, with thanksgiving → pela oração e súplicas, com ação de graças", text: "“prayer” = oração; “petition” = súplica; “thanksgiving” = ação de graças. Elementos da oração: pedir + agradecer." },
    { title: "present your requests to God → apresentem seus pedidos a Deus", text: "“present” = apresentar; “requests” = pedidos. Ação final: levar tudo a Deus." }
  ],
  vocabulary: [
    { word: "anxious", translation: "ansioso", explanation: "preocupação excessiva" },
    { word: "prayer", translation: "oração", explanation: "conversa íntima com Deus" },
    { word: "petition", translation: "súplica", explanation: "pedido específico" },
    { word: "thanksgiving", translation: "ação de graças", explanation: "gratidão expressa" },
    { word: "present", translation: "apresentar", explanation: "levar a Deus com confiança" },
    { word: "requests", translation: "pedidos", explanation: "necessidades entregues" }
  ],
  grammar: "Imperativo negativo: “Do not be anxious” = Não sejam ansiosos. Preposições de meio: “by prayer” = pela oração; “with thanksgiving” = com gratidão. Estrutura coordenada: “prayer and petition” = oração e súplica. Ideal para praticar orações em inglês devocional.",
  reread: "Paulo ensina que a oração substitui a ansiedade. Em toda situação, orar com gratidão traz paz — uma prática devocional simples e transformadora. Ler em inglês treina a mente para diálogos espirituais bilíngues.",
  exercises: [
    { type: "Tradução EN → PT", question: "Do not be anxious.", answer: "Não andeis ansiosos." },
    { type: "Tradução EN → PT", question: "Present your requests to God.", answer: "Apresentai vossos pedidos a Deus." },
    { type: "Tradução PT → EN", question: "Não sejam ansiosos.", answer: "Do not be anxious." },
    { type: "Lacuna", question: "Do not be __________ about anything.", answer: "anxious" },
    { type: "Lacuna", question: "By __________ and petition.", answer: "prayer" },
    { type: "Associação", question: "thanksgiving = ?", answer: "gratidão" }
  ],
  application: [
    "I pray without anxiety. (Eu oro sem ansiedade.)",
    "God hears my petitions. (Deus ouve minhas súplicas.)",
    "Thanksgiving in prayer. (Gratidão na oração.)",
    "I present my needs to God. (Eu apresento minhas necessidades a Deus.)"
  ],
  prayerEn: "Father, I am not anxious. I pray with thanksgiving and present my requests to You. Thank You for hearing me. Amen.",
  prayerPt: "Pai, não estou ansioso. Oro com gratidão e apresento meus pedidos a Ti. Obrigado por me ouvir. Amém.",
  prayerAdapt: "Father, I pray for my family with thanksgiving.",
  insight: "Oração + gratidão = paz de Deus. Buscar Deus assim diariamente constrói intimidade — o coração devocional que transforma tudo."
},
{
  id: 21,
  order: 21,
  title: "Confia no Senhor",
  reference: "Proverbs 3:5-6",
  verseEn: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
  versePt: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.",
  guidedReading: [
    { title: "Trust in the Lord with all your heart → Confia no Senhor de todo o teu coração", text: "“trust” = confiar; “with all your heart” = de todo o coração. Chamado à confiança total e incondicional." },
    { title: "and lean not on your own understanding → e não te estribes no teu próprio entendimento", text: "“lean not” = não te estribes; “your own understanding” = teu próprio entendimento. Advertência contra autossuficiência." },
    { title: "in all your ways submit to him → reconhece-o em todos os teus caminhos", text: "“in all your ways” = em todos os teus caminhos; “submit to” = submeter-se, reconhecer. Vida cotidiana guiada por Deus." },
    { title: "and he will make your paths straight → e ele endireitará as tuas veredas", text: "“will make” = fará; “straight” = retos, diretos. Promessa de direção divina." }
  ],
  vocabulary: [
    { word: "trust", translation: "confiar", explanation: "entrega total a Deus" },
    { word: "heart", translation: "coração", explanation: "centro da vontade e emoção" },
    { word: "lean", translation: "apoiar-se", explanation: "depender de algo" },
    { word: "understanding", translation: "entendimento", explanation: "sabedoria humana limitada" },
    { word: "submit", translation: "submeter-se", explanation: "reconhecer autoridade divina" },
    { word: "paths", translation: "caminhos, veredas", explanation: "direção da vida" }
  ],
  grammar: "Imperativos coordenados: “Trust... and lean not... submit” → Confia... e não te estribes... submete-te. Futuro com agente: “He will make” = Ele fará (Deus como agente da mudança). Preposições: “in the Lord” = no Senhor; “with all your heart” = de todo o coração. Estrutura devocional perfeita para prática diária.",
  reread: "Este provérbio ensina confiança total no Senhor. Não confiar em nossa própria lógica, mas reconhecer Deus em tudo — e Ele guia. Em inglês devocional, fortalece hábito de dependência espiritual.",
  exercises: [
    { type: "Tradução EN → PT", question: "Trust in the Lord.", answer: "Confia no Senhor." },
    { type: "Tradução EN → PT", question: "He will make your paths straight.", answer: "Ele endireitará as tuas veredas." },
    { type: "Tradução PT → EN", question: "Confia no Senhor.", answer: "Trust in the Lord." },
    { type: "Lacuna", question: "Trust in the Lord with all your __________.", answer: "heart" },
    { type: "Lacuna", question: "Lean not on your own __________.", answer: "understanding" },
    { type: "Associação", question: "paths = ?", answer: "caminhos" }
  ],
  application: [
    "I trust in the Lord. (Confio no Senhor.)",
    "God makes my path straight. (Deus endireita meu caminho.)",
    "Not my understanding, but God. (Não meu entendimento, mas Deus.)",
    "I submit all to Him. (Submeto tudo a Ele.)"
  ],
  prayerEn: "Lord, I trust You with all my heart. I do not lean on my understanding. Guide my paths every day. Amen.",
  prayerPt: "Senhor, confio em Ti de todo o meu coração. Não me apoio no meu entendimento. Guia meus caminhos todos os dias. Amém.",
  prayerAdapt: "Lord, guide my decisions today.",
  insight: "Confiar de todo o coração liberta. Deus endireita o que nossa visão limitada não vê — intimidade devocional que traz direção perfeita."
},
{
  id: 22,
  order: 22,
  title: "Luz e Testemunho",
  reference: "Matthew 5:14-16",
  verseEn: "\"You are the light of the world. A town built on a hill cannot be hidden. Neither do people light a lamp and put it under a bowl. Instead they put it on its stand, and it gives light to everyone in the house.\"",
  versePt: "\"Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte. Nem se acende uma candeia e se coloca debaixo do alqueire, mas no velador, e dá luz a todos que estão em casa.\"",
  guidedReading: [
    { title: "You are the light of the world → Vós sois a luz do mundo", text: "“you are” = vós sois; “light of the world” = luz do mundo. Identidade dos discípulos: luz, não escuridão." },
    { title: "A town built on a hill cannot be hidden → não se pode esconder uma cidade edificada sobre um monte", text: "“built on a hill” = edificada sobre um monte; “cannot be hidden” = não pode ser escondida. Luz é naturalmente visível." },
    { title: "Neither do people light a lamp and put it under a bowl → Nem se acende uma candeia e se coloca debaixo do alqueire", text: "“light a lamp” = acender uma candeia; “put under” = colocar debaixo. Advertência contra esconder o testemunho." },
    { title: "Instead they put it on its stand → mas no velador", text: "“put on its stand” = colocar no velador; “and it gives light to everyone” = e dá luz a todos." }
  ],
  vocabulary: [
    { word: "light", translation: "luz", explanation: "identidade e missão cristã" },
    { word: "world", translation: "mundo", explanation: "alcance universal do testemunho" },
    { word: "hidden", translation: "escondido", explanation: "oposto da visibilidade cristã" },
    { word: "lamp", translation: "candeia, lâmpada", explanation: "símbolo de luz prática" },
    { word: "stand", translation: "velador, suporte", explanation: "lugar visível para brilhar" },
    { word: "gives light", translation: "dá luz", explanation: "impacto no ambiente" }
  ],
  grammar: "Identidade com “to be”: “You are the light” = Vós sois a luz. Negativas: “Cannot be hidden” = não pode ser escondida; “Neither do people...” = Nem as pessoas... (estrutura de negação dupla). Contraste com “instead”: “Instead they put” = Em vez disso, colocam. Estruturas para testemunho visível.",
  reread: "Jesus declara: vós sois a luz. Não esconder, mas brilhar — testemunho que ilumina outros. Em inglês devocional, praticamos identidade e ação missionária cotidiana.",
  exercises: [
    { type: "Tradução EN → PT", question: "You are the light of the world.", answer: "Vós sois a luz do mundo." },
    { type: "Tradução EN → PT", question: "Put it on its stand.", answer: "Colocai-a no velador." },
    { type: "Tradução PT → EN", question: "Vós sois a luz do mundo.", answer: "You are the light of the world." },
    { type: "Lacuna", question: "You are the __________ of the world.", answer: "light" },
    { type: "Lacuna", question: "Cannot be __________.", answer: "hidden" },
    { type: "Associação", question: "light = ?", answer: "luz" }
  ],
  application: [
    "I am the light. (Eu sou a luz.)",
    "Shine your light. (Brilhe sua luz.)",
    "God's light in me. (Luz de Deus em mim.)",
    "Light for the world. (Luz para o mundo.)"
  ],
  prayerEn: "Lord, You call me light of the world. Help me shine brightly for You. Let my life give light to others. Amen.",
  prayerPt: "Senhor, Tu me chamas luz do mundo. Ajuda-me a brilhar intensamente por Ti. Que minha vida dê luz aos outros. Amém.",
  prayerAdapt: "Lord, help my light shine at work.",
  insight: "Luz não se esconde — ela ilumina naturalmente. Vida devocional com Jesus nos torna testemunho vivo, brilhando para Seu reino."
},
{
  id: 23,
  order: 23,
  title: "Palavra Viva",
  reference: "Hebrews 4:12",
  verseEn: "For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.",
  versePt: "Porque a palavra de Deus é viva e eficaz, mais cortante do que qualquer espada de dois gumes, penetrando até ao ponto de dividir alma e espírito, juntas e medulas, e apta para discernir os pensamentos e intenções do coração.",
  guidedReading: [
    { title: "For the word of God is alive and active → Porque a palavra de Deus é viva e eficaz", text: "“word of God” = palavra de Deus; “alive” = viva; “active” = eficaz, ativa. A Bíblia não é livro morto — ela opera no coração." },
    { title: "Sharper than any double-edged sword → mais cortante do que qualquer espada de dois gumes", text: "“sharper than” = mais cortante que; “double-edged sword” = espada de dois gumes. Poder penetrante da verdade." },
    { title: "it penetrates even to dividing soul and spirit → penetrando até ao ponto de dividir alma e espírito", text: "“penetrates” = penetra; “dividing” = dividir. Ação profunda na alma humana." },
    { title: "joints and marrow; it judges the thoughts and attitudes of the heart → juntas e medulas; e apta para discernir os pensamentos e intenções do coração", text: "“judges” = julga, discerne. Revela intenções ocultas." }
  ],
  vocabulary: [
    { word: "word", translation: "palavra", explanation: "a Bíblia, revelação viva de Deus" },
    { word: "alive", translation: "viva", explanation: "cheia de vida e poder" },
    { word: "active", translation: "ativa, eficaz", explanation: "produz mudança real" },
    { word: "sharper", translation: "mais cortante", explanation: "penetra defesas" },
    { word: "penetrates", translation: "penetra", explanation: "vai fundo no ser" },
    { word: "judges", translation: "discerne, julga", explanation: "revela coração verdadeiro" }
  ],
  grammar: "Comparativo de superioridade: “sharper than” = mais cortante que. Verbo no presente: “is alive”, “penetrates”, “judges” = ações contínuas da Palavra. Infinitivo de propósito: “to dividing” = para dividir (profundidade da ação). Estruturas para descrever poder espiritual.",
  reread: "A Palavra de Deus não é teoria — ela corta, penetra e transforma. Em leitura devocional, ela discerne nosso coração. Aprender em inglês aprofunda intimidade com a Escritura viva.",
  exercises: [
    { type: "Tradução EN → PT", question: "The word of God is alive.", answer: "A palavra de Deus é viva." },
    { type: "Tradução EN → PT", question: "It penetrates soul and spirit.", answer: "Ela penetra alma e espírito." },
    { type: "Tradução PT → EN", question: "A palavra de Deus é viva.", answer: "The word of God is alive." },
    { type: "Lacuna", question: "Sharper __________ any sword.", answer: "than" },
    { type: "Lacuna", question: "It __________ the thoughts.", answer: "judges" },
    { type: "Associação", question: "alive = ?", answer: "viva" }
  ],
  application: [
    "God's word is alive. (A palavra de Deus é viva.)",
    "It judges my heart. (Ela julga meu coração.)",
    "The Bible penetrates deep. (A Bíblia penetra fundo.)",
    "I read God's active word. (Eu leio a palavra ativa de Deus.)"
  ],
  prayerEn: "Lord, Your word is alive in me. Let it penetrate my heart and judge my thoughts. Draw me closer through Scripture. Amen.",
  prayerPt: "Senhor, Tua palavra é viva em mim. Deixa-a penetrar meu coração e discernir meus pensamentos. Aproxima-me pela Escritura. Amém.",
  prayerAdapt: "Lord, speak to me through Your word today.",
  insight: "A Palavra não retorna vazia — ela corta, cura e guia. Leitura devocional diária nos expõe à lâmpada que ilumina o caminho interior."
},
{
  id: 24,
  order: 24,
  title: "Ouvidos Atentos",
  reference: "Romans 10:17",
  verseEn: "Consequently, faith comes from hearing, and hearing through the word of Christ.",
  versePt: "Logo, a fé vem pelo ouvir, e o ouvir pela palavra de Cristo.",
  guidedReading: [
    { title: "Consequently → Logo", text: "Palavra de conclusão lógica." },
    { title: "faith comes from hearing → a fé vem pelo ouvir", text: "“faith” = fé; “comes from” = vem de. Fé é resultado de ouvir Deus." },
    { title: "and hearing through the word of Christ → e o ouvir pela palavra de Cristo", text: "“hearing” = ouvir; “through” = por meio de; “word of Christ” = palavra de Cristo. Fonte específica: a Palavra." }
  ],
  vocabulary: [
    { word: "faith", translation: "fé", explanation: "resultado do ouvir" },
    { word: "hearing", translation: "ouvir", explanation: "escuta ativa espiritual" },
    { word: "comes from", translation: "vem de", explanation: "origem do processo" },
    { word: "consequently", translation: "logo", explanation: "conclusão lógica" },
    { word: "word", translation: "palavra", explanation: "meio pelo qual se ouve Deus" },
    { word: "Christ", translation: "Cristo", explanation: "centro da revelação" }
  ],
  grammar: "Expressão de origem: “comes from hearing” = vem do ouvir. Preposição de meio: “through the word” = por meio da palavra. Estrutura coordenada: “faith comes from hearing, and hearing...” = fé vem do ouvir, e o ouvir... Simples e profunda para prática devocional.",
  reread: "Fé não surge do nada — ela vem pelo ouvir a Palavra de Cristo. Leitura devocional ativa a fé através da escuta espiritual. Em inglês, reforça hábito de meditação bíblica.",
  exercises: [
    { type: "Tradução EN → PT", question: "Faith comes from hearing.", answer: "A fé vem pelo ouvir." },
    { type: "Tradução EN → PT", question: "Hearing through the word.", answer: "O ouvir pela palavra." },
    { type: "Tradução PT → EN", question: "Fé vem pelo ouvir.", answer: "Faith comes from hearing." },
    { type: "Lacuna", question: "Faith __________ from hearing.", answer: "comes" },
    { type: "Lacuna", question: "Hearing __________ the word.", answer: "through" },
    { type: "Associação", question: "hearing = ?", answer: "ouvir" }
  ],
  application: [
    "Faith comes by hearing. (Fé vem pelo ouvir.)",
    "I hear Christ's word. (Eu ouço a palavra de Cristo.)",
    "Hearing builds faith. (Ouvir constrói fé.)",
    "God speaks through Scripture. (Deus fala pela Escritura.)"
  ],
  prayerEn: "Lord, open my ears to hear Your word. Let faith come through what I hear. Speak to me today. Amen.",
  prayerPt: "Senhor, abre meus ouvidos para ouvir Tua palavra. Que a fé venha pelo que ouço. Fala comigo hoje. Amém.",
  prayerAdapt: "Lord, help me hear You clearly.",
  insight: "Ouvir gera fé — simples, mas transformador. Deixe a Palavra de Cristo formar crença viva em seu coração devocional."
},
{
  id: 25,
  order: 25,
  title: "Oração pelos Irmãos",
  reference: "Ephesians 1:16",
  verseEn: "I have not stopped giving thanks for you, remembering you in my prayers.",
  versePt: "Não cesso de dar graças a Deus por vós, lembrando-me de vós nas minhas orações.",
  guidedReading: [
    { title: "I have not stopped giving thanks → Não cesso de dar graças", text: "“have not stopped” = não parei (presente perfeito); “giving thanks” = dar graças. Paulo ora continuamente com gratidão." },
    { title: "for you → por vós", text: "“for you” = por vós (motivo da oração). Foco nos irmãos na fé." },
    { title: "remembering you in my prayers → lembrando-me de vós nas minhas orações", text: "“remembering” = lembrando; “in my prayers” = nas minhas orações. Intercessão prática e pessoal." }
  ],
  vocabulary: [
    { word: "stopped", translation: "parar", explanation: "continuidade da oração" },
    { word: "giving thanks", translation: "dar graças", explanation: "gratidão na intercessão" },
    { word: "remembering", translation: "lembrando", explanation: "manter outros em mente" },
    { word: "prayers", translation: "orações", explanation: "diálogo com Deus por outros" },
    { word: "for you", translation: "por vós", explanation: "foco altruísta" }
  ],
  grammar: "Presente perfeito negativo: “I have not stopped” = Não parei (ação contínua). Gerúndio: “giving thanks”, “remembering you” = dando graças, lembrando-vos. Preposição de motivo: “for you” = por vós. Estruturas para oração intercessora.",
  reread: "Paulo modela intercessão: gratidão + lembrança constante. Orar pelos irmãos fortalece a comunhão. Em inglês, praticamos continuidade espiritual.",
  exercises: [
    { type: "Tradução EN → PT", question: "I have not stopped praying.", answer: "Não parei de orar." },
    { type: "Tradução EN → PT", question: "Remembering you in prayers.", answer: "Lembrando-vos nas orações." },
    { type: "Tradução PT → EN", question: "Não paro de orar por vós.", answer: "I have not stopped praying for you." },
    { type: "Lacuna", question: "I have not __________ giving thanks.", answer: "stopped" },
    { type: "Lacuna", question: "__________ you in my prayers.", answer: "Remembering" },
    { type: "Associação", question: "prayers = ?", answer: "orações" }
  ],
  application: [
    "I pray for you. (Eu oro por ti.)",
    "Thanks for my brothers. (Graças pelos meus irmãos.)",
    "I remember you in prayer. (Lembro-te na oração.)",
    "God bless my family. (Deus abençoe minha família.)"
  ],
  prayerEn: "Lord, I thank You for my brothers and sisters. I remember them in my prayers today. Bless and strengthen them. Amen.",
  prayerPt: "Senhor, obrigado pelos meus irmãos e irmãs. Lembro-me deles nas minhas orações hoje. Abençoa e fortalece-os. Amém.",
  prayerAdapt: "Lord, remember my friend [name] today.",
  insight: "Intercessão une corações. Orar pelos outros com gratidão constrói o corpo de Cristo — amor em ação."
},
{
  id: 26,
  order: 26,
  title: "Paz para o Mundo",
  reference: "John 14:27",
  verseEn: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
  versePt: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como a dá o mundo. Não se turbe o vosso coração, nem se atemorize.",
  guidedReading: [
    { title: "Peace I leave with you → Deixo-vos a paz", text: "“peace” = paz; “leave with” = deixar com. Legado de Jesus: paz verdadeira." },
    { title: "my peace I give you → a minha paz vos dou", text: "“my peace” = minha paz; “give” = dou. Doação pessoal e superior." },
    { title: "I do not give to you as the world gives → não vo-la dou como a dá o mundo", text: "“as the world gives” = como o mundo dá. Paz de Jesus transcende a mundana." },
    { title: "Do not let your hearts be troubled and do not be afraid → Não se turbe o vosso coração, nem se atemorize", text: "Imperativos negativos contra medo." }
  ],
  vocabulary: [
    { word: "peace", translation: "paz", explanation: "legado eterno de Cristo" },
    { word: "leave", translation: "deixar", explanation: "herança espiritual" },
    { word: "give", translation: "dar", explanation: "generosidade divina" },
    { word: "troubled", translation: "turbado", explanation: "agitado, ansioso" },
    { word: "afraid", translation: "temeroso", explanation: "medo que paz remove" }
  ],
  grammar: "Estrutura enfática: “Peace I leave” = Paz eu deixo (ênfase no objeto). Comparação negativa: “not as the world gives” = não como o mundo dá. Imperativos negativos: “Do not let... do not be” = Não deixeis... não sejais. Para intercessão por paz mundial.",
  reread: "Jesus lega sua paz — não temporária, mas profunda. Interceder com este versículo traz paz aos corações agitados. Em inglês, fortalece oração por outros.",
  exercises: [
    { type: "Tradução EN → PT", question: "Peace I leave with you.", answer: "Deixo-vos a paz." },
    { type: "Tradução EN → PT", question: "Do not be afraid.", answer: "Não temais." },
    { type: "Tradução PT → EN", question: "Deixo-vos a paz.", answer: "Peace I leave with you." },
    { type: "Lacuna", question: "My __________ I give you.", answer: "peace" },
    { type: "Lacuna", question: "Not as the __________ gives.", answer: "world" },
    { type: "Associação", question: "peace = ?", answer: "paz" }
  ],
  application: [
    "Jesus gives peace. (Jesus dá paz.)",
    "Peace to troubled hearts. (Paz a corações turbados.)",
    "I pray for world peace. (Eu oro pela paz mundial.)",
    "No fear in Christ. (Sem medo em Cristo.)"
  ],
  prayerEn: "Jesus, give Your peace to the world. Calm troubled hearts and remove fear. Let Your peace reign everywhere. Amen.",
  prayerPt: "Jesus, dá Tua paz ao mundo. Acalma corações turbados e remove o medo. Que Tua paz reine por toda parte. Amém.",
  prayerAdapt: "Jesus, give peace to [country/person] today.",
  insight: "Paz de Cristo cura nações. Interceder com Seu legado traz tranquilidade onde há turbulência."
},
{
  id: 27,
  order: 27,
  title: "Carregar os Fardos",
  reference: "Galatians 6:2",
  verseEn: "Carry each other's burdens, and in this way you will fulfill the law of Christ.",
  versePt: "Levai as cargas uns dos outros e, assim, cumprireis a lei de Cristo.",
  guidedReading: [
    { title: "Carry each other's burdens → Levai as cargas uns dos outros", text: "“carry” = carregar, levar; “each other's” = uns dos outros. Mandamento mútuo de apoio." },
    { title: "and in this way → e, assim", text: "“in this way” = dessa forma. Método para cumprir." },
    { title: "you will fulfill the law of Christ → cumprireis a lei de Cristo", text: "“fulfill” = cumprir; “law of Christ” = lei de Cristo (amor ao próximo)." }
  ],
  vocabulary: [
    { word: "carry", translation: "carregar", explanation: "ajudar no peso alheio" },
    { word: "burdens", translation: "cargas, fardos", explanation: "dificuldades compartilhadas" },
    { word: "each other's", translation: "uns dos outros", explanation: "reciprocidade cristã" },
    { word: "fulfill", translation: "cumprir", explanation: "realizar o mandamento" },
    { word: "law", translation: "lei", explanation: "princípio do amor de Cristo" }
  ],
  grammar: "Possessivo recíproco: “each other's burdens” = fardos uns dos outros. Futuro como resultado: “you will fulfill” = cumprireis (consequência da ação). Conector de meio: “in this way” = dessa forma. Para intercessão prática.",
  reread: "Apoio mútuo cumpre a lei de Cristo. Carregar fardos alheios constrói comunidade. Em inglês, ensina solidariedade orante.",
  exercises: [
    { type: "Tradução EN → PT", question: "Carry each other's burdens.", answer: "Levai as cargas uns dos outros." },
    { type: "Tradução EN → PT", question: "Fulfill the law of Christ.", answer: "Cumpri a lei de Cristo." },
    { type: "Tradução PT → EN", question: "Levai as cargas uns dos outros.", answer: "Carry each other's burdens." },
    { type: "Lacuna", question: "Carry __________ other's burdens.", answer: "each" },
    { type: "Lacuna", question: "You will __________ the law.", answer: "fulfill" },
    { type: "Associação", question: "burdens = ?", answer: "fardos" }
  ],
  application: [
    "Carry your brother's burden. (Carregue o fardo do teu irmão.)",
    "We fulfill Christ's law. (Cumprimos a lei de Cristo.)",
    "Help each other in prayer. (Ajudem-se mutuamente na oração.)",
    "Love carries burdens. (Amor carrega fardos.)"
  ],
  prayerEn: "Lord, help us carry each other's burdens. Let us fulfill Your law of love. Strengthen my brothers today. Amen.",
  prayerPt: "Senhor, ajuda-nos a carregar os fardos uns dos outros. Permite-nos cumprir Tua lei de amor. Fortalece meus irmãos hoje. Amém.",
  prayerAdapt: "Lord, help me carry [name]'s burden.",
  insight: "Amor prático é lei de Cristo. Interceder carregando fardos une o corpo — oração que constrói."
},
{
  id: 28,
  order: 28,
  title: "Clamor pela Colheita",
  reference: "Matthew 9:37-38",
  verseEn: "Then he said to his disciples, \"The harvest is plentiful but the workers are few. Ask the Lord of the harvest, therefore, to send out workers into his harvest field.\"",
  versePt: "Então disse aos seus discípulos: \"A colheita é grande, mas poucos são os trabalhadores. Pedí, pois, ao Senhor da colheita que envie trabalhadores para a sua colheita.\"",
  guidedReading: [
    { title: "The harvest is plentiful → A colheita é grande", text: "“harvest” = colheita; “plentiful” = grande, abundante. Campo espiritual maduro." },
    { title: "but the workers are few → mas poucos são os trabalhadores", text: "“workers” = trabalhadores (obreiros). Necessidade urgente." },
    { title: "Ask the Lord of the harvest → Pedí ao Senhor da colheita", text: "“ask” = pedir (imperativo). Direção da oração." },
    { title: "to send out workers into his harvest field → que envie trabalhadores para a sua colheita", text: "“send out” = enviar. Propósito: mais obreiros." }
  ],
  vocabulary: [
    { word: "harvest", translation: "colheita", explanation: "almas prontas para o reino" },
    { word: "plentiful", translation: "abundante", explanation: "grande oportunidade" },
    { word: "workers", translation: "trabalhadores", explanation: "obreiros no campo missionário" },
    { word: "ask", translation: "pedir", explanation: "oração específica" },
    { word: "send", translation: "enviar", explanation: "ação divina" },
    { word: "Lord", translation: "Senhor", explanation: "dono da colheita" }
  ],
  grammar: "Contraste com “but”: “plentiful but... few” = abundante, mas poucos. Imperativo + infinitivo: “Ask... to send” = Pedí... para enviar. Possessivo: “his harvest” = sua colheita. Para intercessão missionária.",
  reread: "Jesus vê colheita pronta, mas poucos ceifeiros. Nossa oração envia trabalhadores. Em inglês, clamamos por missões globais.",
  exercises: [
    { type: "Tradução EN → PT", question: "The harvest is plentiful.", answer: "A colheita é grande." },
    { type: "Tradução EN → PT", question: "Ask the Lord to send workers.", answer: "Pedí ao Senhor que envie trabalhadores." },
    { type: "Tradução PT → EN", question: "A colheita é grande.", answer: "The harvest is plentiful." },
    { type: "Lacuna", question: "The __________ is plentiful.", answer: "harvest" },
    { type: "Lacuna", question: "__________ are few.", answer: "Workers" },
    { type: "Associação", question: "workers = ?", answer: "trabalhadores" }
  ],
  application: [
    "Pray for the harvest. (Ore pela colheita.)",
    "Send workers, Lord. (Envie trabalhadores, Senhor.)",
    "The field is ready. (O campo está pronto.)",
    "Lord of the harvest, act. (Senhor da colheita, age.)"
  ],
  prayerEn: "Lord of the harvest, send workers to Your fields. The harvest is plentiful, but workers are few. Raise up laborers for Your kingdom. Amen.",
  prayerPt: "Senhor da colheita, envia trabalhadores aos Teus campos. A colheita é grande, mas poucos os trabalhadores. Levanta ceifeiros para o Teu reino. Amém.",
  prayerAdapt: "Lord, send workers to [country/region].",
  insight: "Colheita espera oração. Interceder por obreiros participa da grande missão de Deus."
},
{
  id: 29,
  order: 29,
  title: "Unidade no Espírito",
  reference: "Ephesians 4:3",
  verseEn: "Make every effort to keep the unity of the Spirit through the bond of peace.",
  versePt: "Esforcem-se para conservar a unidade do Espírito pelo vínculo da paz.",
  guidedReading: [
    { title: "Make every effort → Esforcem-se", text: "“make every effort” = fazer todo esforço. Ação intencional e coletiva." },
    { title: "to keep the unity of the Spirit → para conservar a unidade do Espírito", text: "“keep” = conservar, manter; “unity” = unidade; “of the Spirit” = do Espírito. Unidade dada por Deus." },
    { title: "through the bond of peace → pelo vínculo da paz", text: "“through” = por meio de; “bond” = vínculo; “peace” = paz. Paz como cola da comunhão." }
  ],
  vocabulary: [
    { word: "effort", translation: "esforço", explanation: "compromisso ativo" },
    { word: "keep", translation: "conservar", explanation: "manutenção espiritual" },
    { word: "unity", translation: "unidade", explanation: "harmonia no corpo de Cristo" },
    { word: "Spirit", translation: "Espírito", explanation: "origem divina da unidade" },
    { word: "bond", translation: "vínculo", explanation: "laço que une" },
    { word: "peace", translation: "paz", explanation: "fruto que sustenta comunhão" }
  ],
  grammar: "Phrasal verb: “make every effort” = fazer todo esforço. Infinitivo de propósito: “to keep” = para conservar. Preposição de meio: “through the bond” = pelo vínculo. Para oração pela igreja unida.",
  reread: "Paulo exorta: esforcem-se pela unidade. Paz do Espírito une o que o mundo divide. Em inglês, clamamos por comunhão restaurada.",
  exercises: [
    { type: "Tradução EN → PT", question: "Make every effort.", answer: "Esforçai-vos." },
    { type: "Tradução EN → PT", question: "Keep the unity of the Spirit.", answer: "Conservai a unidade do Espírito." },
    { type: "Tradução PT → EN", question: "Esforcem-se pela unidade.", answer: "Make every effort for unity." },
    { type: "Lacuna", question: "Make every __________ to keep unity.", answer: "effort" },
    { type: "Lacuna", question: "Through the __________ of peace.", answer: "bond" },
    { type: "Associação", question: "unity = ?", answer: "unidade" }
  ],
  application: [
    "Keep the unity. (Conserve a unidade.)",
    "Peace binds us. (Paz nos une.)",
    "Spirit's unity forever. (Unidade do Espírito para sempre.)",
    "Church in harmony. (Igreja em harmonia.)"
  ],
  prayerEn: "Lord, help us keep the unity of the Spirit. Bind us with peace in Your church. Heal divisions among brothers. Amen.",
  prayerPt: "Senhor, ajuda-nos a conservar a unidade do Espírito. Une-nos com paz na Tua igreja. Cura divisões entre irmãos. Amém.",
  prayerAdapt: "Lord, unite [church/group] in peace.",
  insight: "Unidade reflete Trindade. Interceder pela paz restaura o corpo — beleza da igreja unida."
},
{
  id: 30,
  order: 30,
  title: "Oração de Envio",
  reference: "Matthew 28:19-20",
  verseEn: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.",
  versePt: "Portanto, vão e façam discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo, ensinando-os a obedecer a tudo o que eu lhes ordenei. E eu estarei sempre com vocês, até o fim dos tempos.",
  guidedReading: [
    { title: "Therefore go and make disciples → Portanto, vão e façam discípulos", text: "“go” = vão; “make disciples” = façam discípulos. Imperativo duplo: movimento + multiplicação." },
    { title: "of all nations → de todas as nações", text: "“all nations” = todas as nações. Alcance global." },
    { title: "baptizing them in the name of the Father and of the Son and of the Holy Spirit → batizando-os em nome do Pai e do Filho e do Espírito Santo", text: "“baptizing” = batizando. Trindade central." },
    { title: "teaching them to obey everything I have commanded you → ensinando-os a obedecer a tudo o que eu lhes ordenei", text: "“teaching” = ensinando; “obey” = obedecer." },
    { title: "And surely I am with you always → E eu estarei sempre com vocês", text: "“surely” = certamente; “always” = sempre. Promessa final de presença." }
  ],
  vocabulary: [
    { word: "go", translation: "ir", explanation: "movimento missionário" },
    { word: "make disciples", translation: "fazer discípulos", explanation: "multiplicação espiritual" },
    { word: "nations", translation: "nações", explanation: "missão global" },
    { word: "baptizing", translation: "batizando", explanation: "iniciação na fé" },
    { word: "teaching", translation: "ensinando", explanation: "transmissão de mandamentos" },
    { word: "obey", translation: "obedecer", explanation: "vida de submissão" },
    { word: "always", translation: "sempre", explanation: "presença eterna de Jesus" }
  ],
  grammar: "Imperativos paralelos: “go and make... baptizing... teaching” = vão e façam... batizando... ensinando. Infinitivo de propósito: “to obey” = para obedecer. Presente contínuo: “I am with you always” = Estou sempre convosco. Estrutura culminante do curso.",
  reread: "A Grande Comissão resume o discipulado: ir, fazer discípulos, batizar, ensinar. Jesus promete presença eterna. Concluir o curso com este chamado une aprendizado de inglês à missão global.",
  exercises: [
    { type: "Tradução EN → PT", question: "Go and make disciples.", answer: "Ide e fazei discípulos." },
    { type: "Tradução EN → PT", question: "I am with you always.", answer: "Estou sempre convosco." },
    { type: "Tradução PT → EN", question: "Ide e fazei discípulos.", answer: "Go and make disciples." },
    { type: "Lacuna", question: "Go and make __________.", answer: "disciples" },
    { type: "Lacuna", question: "Teaching them to __________.", answer: "obey" },
    { type: "Associação", question: "disciples = ?", answer: "discípulos" }
  ],
  application: [
    "Go make disciples. (Vai fazer discípulos.)",
    "Teach to obey Jesus. (Ensina a obedecer Jesus.)",
    "Jesus is always with me. (Jesus está sempre comigo.)",
    "Nations need the gospel. (As nações precisam do evangelho.)"
  ],
  prayerEn: "Jesus, send us to make disciples of all nations. Teach us to obey and baptize in Your name. Be with us always, to the end. Amen.",
  prayerPt: "Jesus, envia-nos para fazer discípulos de todas as nações. Ensina-nos a obedecer e batizar em Teu nome. Esteja conosco sempre, até o fim. Amém.",
  prayerAdapt: "Jesus, go with me to share Your gospel.",
  insight: "Missão + presença = sucesso eterno. O curso termina como começou: com chamado à ação — ir, em nome de Jesus, com Sua companhia constante."
}
];

const flashcardBlocos = [
  {
    key: "evangelismo",
    index: 1,
    title: "Direção Espiritual: Evangelismo",
    subtitle: "Fé · Salvação · Graça · Arrependimento",
    className: "flash-green",
    total: 45
  },
  {
    key: "apoio",
    index: 2,
    title: "Direção Espiritual: Apoio Emocional",
    subtitle: "Paz · Esperança · Confiança · Consolo",
    className: "flash-yellow",
    total: 45
  },
  {
    key: "edificacao",
    index: 3,
    title: "Direção Espiritual: Edificação",
    subtitle: "Crescimento Espiritual · Disciplina · Fé Prática",
    className: "flash-blue",
    total: 45
  },
  {
    key: "intercessao",
    index: 4,
    title: "Direção Espiritual: Intercessão",
    subtitle: "Orações por Outros · Clamor · Cuidado",
    className: "flash-purple",
    total: 45
  },
  {
    key: "devocional",
    index: 5,
    title: "Direção Espiritual: Devocional",
    subtitle: "Relacionamento Íntimo com Deus",
    className: "flash-red",
    total: 45
  }
];

function isBlocoLiberado(index) {
  return index === 1 || isPremium;
}

function getProgresso(bloco) {
  return parseInt(localStorage.getItem("flashcard_progresso_" + bloco)) || 0;
}

function setProgresso(bloco, valor) {
  localStorage.setItem("flashcard_progresso_" + bloco, valor);
}

function calcularProgresso(bloco, total) {
  const feitos = getProgresso(bloco);
  return Math.floor((feitos / total) * 100);
}

function renderBarraProgresso(percentual, corClass) {
  return `
    <div class="flashcard-progress-wrap">
      <div class="flashcard-progress-bar ${corClass}">
        <div class="flashcard-progress-fill" style="width:${percentual}%"></div>
      </div>
      <span class="flashcard-progress-text">${percentual}%</span>
    </div>
  `;
}

function toggleCard(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.toggle("flipped");
}

const flashcards = {
  evangelismo: [
    {
      en: "Come to the light",
      pt: "Vir para a luz",
      meaning: "Aceitar a verdade de Deus e abandonar o pecado.",
      context: "João 3:20-21",
      exampleEn: "He finally came to the light after years of running.",
      examplePt: "Ele finalmente veio para a luz depois de anos fugindo.",
      application: "Convide alguém a conhecer Jesus como a Luz do mundo."
    },
    {
      en: "Born again",
      pt: "Nascer de novo",
      meaning: "Experiência de conversão e nova vida em Cristo.",
      context: "João 3:3",
      exampleEn: "You must be born again to enter God's kingdom.",
      examplePt: "Você precisa nascer de novo para entrar no reino de Deus.",
      application: "Explique o novo nascimento ao evangelizar."
    },
    {
      en: "Turn from your ways",
      pt: "Abandonar seus caminhos",
      meaning: "Arrepender-se e mudar de direção espiritual.",
      context: "Ezequiel 33:11",
      exampleEn: "God calls us to turn from our ways and follow Him.",
      examplePt: "Deus nos chama a abandonar nossos caminhos e segui-Lo.",
      application: "Use ao falar de conversão e arrependimento."
    },
    {
      en: "Share the gospel",
      pt: "Compartilhar o evangelho",
      meaning: "Contar a mensagem de salvação de Jesus.",
      context: "Marcos 16:15",
      exampleEn: "We are called to share the gospel with everyone.",
      examplePt: "Somos chamados a compartilhar o evangelho com todos.",
      application: "Incentive o discipulado e missão diária."
    },
    {
      en: "Good news",
      pt: "Boas novas",
      meaning: "A mensagem de salvação de Jesus Cristo.",
      context: "Lucas 2:10",
      exampleEn: "The good news brings hope to the world.",
      examplePt: "As boas novas trazem esperança ao mundo.",
      application: "Use ao explicar o que é o evangelho."
    },
    {
      en: "Spread the word",
      pt: "Espalhar a Palavra",
      meaning: "Divulgar a mensagem de Jesus.",
      context: "Atos 8:4",
      exampleEn: "They spread the word wherever they went.",
      examplePt: "Eles espalharam a Palavra por onde foram.",
      application: "Incentive o evangelismo cotidiano."
    },
    {
      en: "Lost sheep",
      pt: "Ovelha perdida",
      meaning: "Pessoa que se afastou de Deus.",
      context: "Lucas 15:4-6",
      exampleEn: "He left everything to find the lost sheep.",
      examplePt: "Ele deixou tudo para encontrar a ovelha perdida.",
      application: "Use ao falar de quem precisa de salvação."
    },
    {
      en: "Knock on the door",
      pt: "Bater à porta",
      meaning: "Jesus se apresenta e espera ser recebido.",
      context: "Apocalipse 3:20",
      exampleEn: "Jesus knocks on the door of every heart.",
      examplePt: "Jesus bate à porta de cada coração.",
      application: "Convide alguém a abrir o coração para Jesus."
    },
    {
      en: "Receive salvation",
      pt: "Receber a salvação",
      meaning: "Aceitar o presente da vida eterna.",
      context: "Efésios 2:8",
      exampleEn: "Anyone can receive salvation through faith.",
      examplePt: "Qualquer pessoa pode receber a salvação pela fé.",
      application: "Use ao guiar alguém na oração de entrega."
    },
    {
      en: "Repent and believe",
      pt: "Arrependei-vos e crede",
      meaning: "Dois passos essenciais da conversão.",
      context: "Marcos 1:15",
      exampleEn: "Jesus said: repent and believe the good news.",
      examplePt: "Jesus disse: arrependei-vos e crede nas boas novas.",
      application: "Primeiro passo do evangelismo direto."
    },
    {
      en: "Lay down your burden",
      pt: "Depor seu fardo",
      meaning: "Entregar ao Senhor o peso do pecado.",
      context: "Mateus 11:28",
      exampleEn: "Come to Jesus and lay down your burden.",
      examplePt: "Vem a Jesus e depõe teu fardo.",
      application: "Use ao convidar alguém cansado a conhecer Jesus."
    },
    {
      en: "Walk in the light",
      pt: "Andar na luz",
      meaning: "Viver em obediência e comunhão com Deus.",
      context: "1 João 1:7",
      exampleEn: "He chose to walk in the light every day.",
      examplePt: "Ele escolheu andar na luz todos os dias.",
      application: "Reforce o estilo de vida do convertido."
    },
    {
      en: "Confess with your mouth",
      pt: "Confessar com a boca",
      meaning: "Declarar publicamente a fé em Jesus.",
      context: "Romanos 10:9",
      exampleEn: "Confess with your mouth that Jesus is Lord.",
      examplePt: "Confesse com sua boca que Jesus é o Senhor.",
      application: "Use ao explicar o que significa se converter."
    },
    {
      en: "Grace alone",
      pt: "Somente pela graça",
      meaning: "Salvação por favor imerecido de Deus.",
      context: "Efésios 2:8-9",
      exampleEn: "We are saved by grace alone, not by works.",
      examplePt: "Somos salvos pela graça somente, não por obras.",
      application: "Central para explicar o evangelho."
    },
    {
      en: "Seek and find",
      pt: "Buscar e encontrar",
      meaning: "Prometer que quem procura Deus O encontra.",
      context: "Mateus 7:7-8",
      exampleEn: "Seek and you will find — that is God's promise.",
      examplePt: "Busca e encontrarás — essa é a promessa de Deus.",
      application: "Encoraje alguém a buscar a Deus hoje."
    },
    {
      en: "Open your heart",
      pt: "Abrir seu coração",
      meaning: "Receber Jesus pela fé pessoal.",
      context: "Apocalipse 3:20",
      exampleEn: "God invites you to open your heart to Him.",
      examplePt: "Deus te convida a abrir seu coração para Ele.",
      application: "Claro e acessível para evangelismo simples."
    },
    {
      en: "At the cross",
      pt: "Na cruz",
      meaning: "Momento central da redenção.",
      context: "1 Coríntios 1:18",
      exampleEn: "Everything changed at the cross.",
      examplePt: "Tudo mudou na cruz.",
      application: "Aponte sempre para o sacrifício de Cristo."
    },
    {
      en: "Shed blood",
      pt: "Sangue derramado",
      meaning: "Sacrifício de Jesus para perdão dos pecados.",
      context: "Hebreus 9:22",
      exampleEn: "By His shed blood, we are forgiven.",
      examplePt: "Pelo Seu sangue derramado, somos perdoados.",
      application: "Use ao explicar a expiação de Cristo."
    },
    {
      en: "Washed clean",
      pt: "Lavado, purificado",
      meaning: "Perdão completo dos pecados pela graça.",
      context: "Isaías 1:18",
      exampleEn: "Through Jesus, we are washed clean from sin.",
      examplePt: "Por meio de Jesus, somos purificados do pecado.",
      application: "Use ao falar de perdão e novo começo."
    },
    {
      en: "Turn over a new leaf",
      pt: "Virar uma nova página",
      meaning: "Mudança real de atitude e comportamento.",
      context: "2 Coríntios 5:17",
      exampleEn: "When he met Jesus, he turned over a new leaf.",
      examplePt: "Quando ele conheceu Jesus, virou uma nova página.",
      application: "Conecte conversão com transformação prática."
    },
    {
      en: "Knock and the door will open",
      pt: "Bata e a porta se abrirá",
      meaning: "Persistência na busca de Deus.",
      context: "Mateus 7:7",
      exampleEn: "Keep knocking — the door will open.",
      examplePt: "Continue batendo — a porta se abrirá.",
      application: "Use para encorajar quem ainda não se decidiu."
    },
    {
      en: "The way of salvation",
      pt: "O caminho da salvação",
      meaning: "Caminho único por Jesus.",
      context: "João 14:6",
      exampleEn: "Jesus showed us the way of salvation.",
      examplePt: "Jesus nos mostrou o caminho da salvação.",
      application: "Use ao explicar que Jesus é o único caminho."
    },
    {
      en: "Call upon His name",
      pt: "Clamar em Seu nome",
      meaning: "Orar invocando o nome de Jesus.",
      context: "Romanos 10:13",
      exampleEn: "Everyone who calls upon His name will be saved.",
      examplePt: "Todo aquele que clamar em Seu nome será salvo.",
      application: "Ensine como fazer a oração de entrega."
    },
    {
      en: "Eternal life",
      pt: "Vida eterna",
      meaning: "Vida sem fim com Deus para os que creem.",
      context: "João 3:16",
      exampleEn: "Jesus offers eternal life to all who believe.",
      examplePt: "Jesus oferece vida eterna a todos que creem.",
      application: "Central em toda mensagem evangelística."
    },
    {
      en: "Die to self",
      pt: "Morrer para si mesmo",
      meaning: "Abandonar o ego para seguir Cristo.",
      context: "Gálatas 2:20",
      exampleEn: "To follow Jesus, we must die to self.",
      examplePt: "Para seguir Jesus, precisamos morrer para nós mesmos.",
      application: "Use ao falar de discipulado pós-conversão."
    },
    {
      en: "Come as you are",
      pt: "Venha como está",
      meaning: "Deus aceita sem que precisemos ser perfeitos.",
      context: "Lucas 15:20",
      exampleEn: "Jesus says: come as you are, He will change you.",
      examplePt: "Jesus diz: venha como está, Ele te transformará.",
      application: "Remove barreiras do evangelismo."
    },
    {
      en: "New creation",
      pt: "Nova criatura",
      meaning: "Identidade transformada em Cristo.",
      context: "2 Coríntios 5:17",
      exampleEn: "In Christ, you are a new creation.",
      examplePt: "Em Cristo, você é uma nova criatura.",
      application: "Reforce o impacto da conversão."
    },
    {
      en: "Freely given",
      pt: "Dado gratuitamente",
      meaning: "Salvação como presente de Deus.",
      context: "Romanos 3:24",
      exampleEn: "Grace is freely given, not earned.",
      examplePt: "Graça é dada gratuitamente, não conquistada.",
      application: "Explique que salvação não se merece."
    },
    {
      en: "Go into all the world",
      pt: "Ide por todo o mundo",
      meaning: "Mandato missionário de Jesus.",
      context: "Marcos 16:15",
      exampleEn: "We are sent to go into all the world.",
      examplePt: "Somos enviados a ir por todo o mundo.",
      application: "Use para motivar ação missionária."
    },
    {
      en: "Fishers of men",
      pt: "Pescadores de homens",
      meaning: "Imagem de ganhar almas para Cristo.",
      context: "Mateus 4:19",
      exampleEn: "Follow me and I will make you fishers of men.",
      examplePt: "Segue-me e eu te farei pescador de homens.",
      application: "Perfeito para falar de missão e propósito."
    },
    {
      en: "Sow the seed",
      pt: "Semear a semente",
      meaning: "Plantar a mensagem do evangelho.",
      context: "Mateus 13:3-8",
      exampleEn: "Every time we preach, we sow the seed.",
      examplePt: "Toda vez que pregamos, semeamos a semente.",
      application: "Use ao falar de evangelismo paciente."
    },
    {
      en: "Reap the harvest",
      pt: "Colher a colheita",
      meaning: "Ver frutos do evangelismo.",
      context: "João 4:35-36",
      exampleEn: "Many believed — it was time to reap the harvest.",
      examplePt: "Muitos creram — era hora de colher a colheita.",
      application: "Encoraje perseverança na missão."
    },
    {
      en: "Broken and contrite heart",
      pt: "Coração quebrantado e contrito",
      meaning: "Atitude de humildade diante de Deus.",
      context: "Salmo 51:17",
      exampleEn: "God honors a broken and contrite heart.",
      examplePt: "Deus honra o coração quebrantado e contrito.",
      application: "Use ao falar de arrependimento genuíno."
    },
    {
      en: "Prodigal son",
      pt: "Filho pródigo",
      meaning: "Aquele que voltou para Deus depois de se perder.",
      context: "Lucas 15:11-32",
      exampleEn: "Like the prodigal son, he came back home.",
      examplePt: "Como o filho pródigo, ele voltou para casa.",
      application: "Poderoso para ilustrar misericórdia divina."
    },
    {
      en: "Running the race",
      pt: "Correr a corrida",
      meaning: "Viver a fé cristã com perseverança.",
      context: "Hebreus 12:1",
      exampleEn: "Keep running the race set before you.",
      examplePt: "Continue correndo a corrida posta diante de ti.",
      application: "Use ao falar de vida cristã contínua."
    },
    {
      en: "Leap of faith",
      pt: "Salto de fé",
      meaning: "Decisão corajosa de confiar em Deus.",
      context: "Hebreus 11:1",
      exampleEn: "Believing in Jesus is a leap of faith.",
      examplePt: "Crer em Jesus é um salto de fé.",
      application: "Use ao convidar alguém a se converter."
    },
    {
      en: "The narrow path",
      pt: "O caminho estreito",
      meaning: "Vida de fé que exige escolhas.",
      context: "Mateus 7:14",
      exampleEn: "Few choose to walk the narrow path.",
      examplePt: "Poucos escolhem andar no caminho estreito.",
      application: "Explique o custo e valor de seguir Jesus."
    },
    {
      en: "Shepherd and sheep",
      pt: "Pastor e ovelha",
      meaning: "Relação de cuidado entre Deus e o crente.",
      context: "João 10:11",
      exampleEn: "Jesus is the shepherd; we are His sheep.",
      examplePt: "Jesus é o pastor; nós somos Suas ovelhas.",
      application: "Use para mostrar cuidado e liderança divina."
    },
    {
      en: "The gift of grace",
      pt: "O dom da graça",
      meaning: "Salvação como presente imerecido.",
      context: "Efésios 2:8",
      exampleEn: "Salvation is the gift of grace — accept it.",
      examplePt: "Salvação é o dom da graça — aceite-o.",
      application: "Convide alguém a receber esse presente."
    },
    {
      en: "Knock the scales off",
      pt: "Cair as vendas dos olhos",
      meaning: "Momento de entendimento espiritual.",
      context: "Atos 9:18",
      exampleEn: "When he heard the gospel, the scales fell off.",
      examplePt: "Quando ouviu o evangelho, as vendas caíram.",
      application: "Use para descrever conversão súbita."
    },
    {
      en: "Light in the darkness",
      pt: "Luz nas trevas",
      meaning: "Jesus trazendo esperança ao desespero.",
      context: "João 1:5",
      exampleEn: "His life was light in the darkness.",
      examplePt: "Sua vida era luz nas trevas.",
      application: "Use ao evangelizar pessoas em crise."
    },
    {
      en: "New life in Christ",
      pt: "Nova vida em Cristo",
      meaning: "Transformação total pela salvação.",
      context: "Romanos 6:4",
      exampleEn: "He found new life in Christ after the darkest season.",
      examplePt: "Ele encontrou nova vida em Cristo após a fase mais difícil.",
      application: "Claro e direto para evangelismo."
    },
    {
      en: "Broken chains",
      pt: "Correntes quebradas",
      meaning: "Libertação do pecado e suas consequências.",
      context: "Salmo 107:14",
      exampleEn: "Jesus came to break the chains of sin.",
      examplePt: "Jesus veio para quebrar as correntes do pecado.",
      application: "Use ao falar de libertação espiritual."
    },
    {
      en: "Redemption story",
      pt: "História de redenção",
      meaning: "Narrativa de quem foi salvo por Cristo.",
      context: "Efésios 1:7",
      exampleEn: "Everyone has a redemption story to share.",
      examplePt: "Todos têm uma história de redenção para compartilhar.",
      application: "Incentive testemunhos pessoais."
    },
    {
      en: "Justified by faith",
      pt: "Justificado pela fé",
      meaning: "Ser declarado justo diante de Deus pela fé.",
      context: "Romanos 5:1",
      exampleEn: "We are justified by faith, not by works.",
      examplePt: "Somos justificados pela fé, não por obras.",
      application: "Explique a base da salvação cristã."
    }
  ],

  apoio: [
    {
      en: "Peace that passes understanding",
      pt: "Paz que excede o entendimento",
      meaning: "Paz sobrenatural que vai além da lógica humana.",
      context: "Filipenses 4:7",
      exampleEn: "In the storm, she had peace that passes understanding.",
      examplePt: "Na tempestade, ela tinha paz que excede o entendimento.",
      application: "Lembre alguém que a paz de Deus não depende das circunstâncias."
    },
    {
      en: "Rest for your soul",
      pt: "Descanso para a alma",
      meaning: "Alívio profundo que Jesus oferece aos cansados.",
      context: "Mateus 11:29",
      exampleEn: "Jesus gives rest for your soul when you're weary.",
      examplePt: "Jesus dá descanso para a alma quando você está cansado.",
      application: "Console quem está exausto espiritualmente."
    },
    {
      en: "Anchor of the soul",
      pt: "Âncora da alma",
      meaning: "Esperança que firma a vida em meio às tormentas.",
      context: "Hebreus 6:19",
      exampleEn: "His faith was the anchor of the soul during trials.",
      examplePt: "Sua fé era a âncora da alma durante as provações.",
      application: "Fortaleça alguém enfrentando incertezas."
    },
    {
      en: "Be still and know",
      pt: "Aquieta-te e sabe",
      meaning: "Confiar em Deus parando de lutar por conta própria.",
      context: "Salmo 46:10",
      exampleEn: "Be still and know that He is God.",
      examplePt: "Aquieta-te e sabe que Ele é Deus.",
      application: "Use quando alguém está ansioso demais."
    },
    {
      en: "Perfect peace",
      pt: "Paz perfeita",
      meaning: "Tranquilidade completa que Deus dá ao que confia.",
      context: "Isaías 26:3",
      exampleEn: "You will keep in perfect peace those who trust you.",
      examplePt: "Tu conservarás em paz perfeita aquele cujo pensamento está firme em Ti.",
      application: "Prometa segurança em meio ao caos."
    },
    {
      en: "Hope that does not disappoint",
      pt: "Esperança que não decepciona",
      meaning: "Confiança em Deus que sempre se cumpre.",
      context: "Romanos 5:5",
      exampleEn: "Our hope in Christ never disappoints.",
      examplePt: "Nossa esperança em Cristo nunca decepciona.",
      application: "Encoraje quem já foi frustrado por falsas esperanças."
    },
    {
      en: "Fear not",
      pt: "Não temas",
      meaning: "Comando divino contra o medo.",
      context: "Isaías 41:10",
      exampleEn: "Fear not, for I am with you always.",
      examplePt: "Não temas, porque Eu sou contigo sempre.",
      application: "A primeira palavra para quem está com medo."
    },
    {
      en: "Strength made perfect in weakness",
      pt: "Força aperfeiçoada na fraqueza",
      meaning: "Poder de Deus que se manifesta quando somos fracos.",
      context: "2 Coríntios 12:9",
      exampleEn: "His strength is made perfect in our weakness.",
      examplePt: "Sua força se aperfeiçoa em nossa fraqueza.",
      application: "Console quem se sente incapaz."
    },
    {
      en: "Under His wings",
      pt: "Sob Suas asas",
      meaning: "Proteção divina como ave protege seus filhotes.",
      context: "Salmo 91:4",
      exampleEn: "I feel safe under His wings.",
      examplePt: "Sinto-me seguro sob Suas asas.",
      application: "Use para quem precisa de proteção."
    },
    {
      en: "Bread of life",
      pt: "Pão da vida",
      meaning: "Jesus como sustento espiritual completo.",
      context: "João 6:35",
      exampleEn: "Jesus is the bread of life for hungry souls.",
      examplePt: "Jesus é o pão da vida para almas famintas.",
      application: "Alimente quem busca satisfação verdadeira."
    },
    {
      en: "Living water",
      pt: "Água viva",
      meaning: "Jesus saciando a sede espiritual eterna.",
      context: "João 4:10",
      exampleEn: "Whoever drinks this living water will never thirst.",
      examplePt: "Quem beber desta água viva nunca mais terá sede.",
      application: "Ofereça satisfação para corações vazios."
    },
    {
      en: "Cast your cares",
      pt: "Lançar suas preocupações",
      meaning: "Entregar ansiedades completamente a Deus.",
      context: "1 Pedro 5:7",
      exampleEn: "Cast your cares on Him — He truly cares.",
      examplePt: "Lance sobre Ele todas as suas preocupações — Ele cuida de você.",
      application: "Ajude quem carrega peso emocional demais."
    },
    {
      en: "The joy of the Lord",
      pt: "A alegria do Senhor",
      meaning: "Fonte de força verdadeira que vem de Deus.",
      context: "Neemias 8:10",
      exampleEn: "The joy of the Lord is my strength.",
      examplePt: "A alegria do Senhor é a minha força.",
      application: "Restaure alegria perdida."
    },
    {
      en: "Everlasting arms",
      pt: "Braços eternos",
      meaning: "Abraço protetor e constante de Deus.",
      context: "Deuteronômio 33:27",
      exampleEn: "Underneath are the everlasting arms.",
      examplePt: "Por baixo estão os braços eternos.",
      application: "Abrace emocionalmente quem precisa de segurança."
    },
    {
      en: "Refuge and strength",
      pt: "Refúgio e fortaleza",
      meaning: "Deus como proteção segura em tempos difíceis.",
      context: "Salmo 46:1",
      exampleEn: "God is our refuge and strength in trouble.",
      examplePt: "Deus é nosso refúgio e fortaleza na angústia.",
      application: "Ofereça abrigo espiritual."
    },
    {
      en: "He restores my soul",
      pt: "Ele restaura minha alma",
      meaning: "Deus trazendo cura emocional e espiritual.",
      context: "Salmo 23:3",
      exampleEn: "When I'm broken, He restores my soul.",
      examplePt: "Quando estou quebrado, Ele restaura minha alma.",
      application: "Prometa cura para corações feridos."
    },
    {
      en: "Peace like a river",
      pt: "Paz como um rio",
      meaning: "Tranquilidade fluida e constante.",
      context: "Isaías 48:18",
      exampleEn: "His peace flows like a river in my heart.",
      examplePt: "Sua paz flui como rio em meu coração.",
      application: "Descreva a paz que Deus traz."
    },
    {
      en: "Hope deferred",
      pt: "Esperança adiada",
      meaning: "Desânimo quando promessas demoram.",
      context: "Provérbios 13:12",
      exampleEn: "Hope deferred makes the heart sick.",
      examplePt: "Esperança adiada faz o coração enfermo.",
      application: "Valide sentimentos de frustração."
    },
    {
      en: "Wait on the Lord",
      pt: "Esperar no Senhor",
      meaning: "Confiar no tempo perfeito de Deus.",
      context: "Isaías 40:31",
      exampleEn: "Those who wait on the Lord renew their strength.",
      examplePt: "Os que esperam no Senhor renovam suas forças.",
      application: "Encoraje paciência ativa."
    },
    {
      en: "Heart at rest",
      pt: "Coração em paz",
      meaning: "Tranquilidade interior profunda.",
      context: "Hebreus 4:10",
      exampleEn: "In Christ, my heart is at rest.",
      examplePt: "Em Cristo, meu coração está em paz.",
      application: "Prometa descanso emocional."
    },
    {
      en: "Safe in His hands",
      pt: "Seguro em Suas mãos",
      meaning: "Proteção absoluta de Deus.",
      context: "João 10:28-29",
      exampleEn: "No one can snatch us from His hands.",
      examplePt: "Ninguém pode arrancar-nos de Suas mãos.",
      application: "Ofereça segurança total."
    },
    {
      en: "Comfort one another",
      pt: "Consolar uns aos outros",
      meaning: "Apoio mútuo na comunidade cristã.",
      context: "1 Tessalonicenses 4:18",
      exampleEn: "We comfort one another with these words.",
      examplePt: "Consolamo-nos uns aos outros com estas palavras.",
      application: "Incentive comunidade de apoio."
    },
    {
      en: "Troubled heart",
      pt: "Coração turbado",
      meaning: "Ansiedade e inquietação interior.",
      context: "João 14:1",
      exampleEn: "Do not let your heart be troubled.",
      examplePt: "Não se turbe o vosso coração.",
      application: "Identifique e acalme ansiedade."
    },
    {
      en: "Well of salvation",
      pt: "Fonte de salvação",
      meaning: "Jesus como fonte inesgotável de restauração.",
      context: "Isaías 12:3",
      exampleEn: "With joy we draw water from the well of salvation.",
      examplePt: "Com alegria tiraremos águas das fontes da salvação.",
      application: "Prometa restauração contínua."
    },
    {
      en: "Steadfast love",
      pt: "Amor constante",
      meaning: "Fidelidade imutável de Deus.",
      context: "Salmo 136:1",
      exampleEn: "His steadfast love endures forever.",
      examplePt: "Seu amor constante dura para sempre.",
      application: "Reforce amor incondicional de Deus."
    },
    {
      en: "Quiet my soul",
      pt: "Acalmar minha alma",
      meaning: "Paz interior cultivada pela confiança.",
      context: "Salmo 131:2",
      exampleEn: "I have quieted my soul like a weaned child.",
      examplePt: "Eu tranquilizei minha alma como uma criança desmamada.",
      application: "Ensine autocontrole emocional pela fé."
    },
    {
      en: "Hope in God",
      pt: "Esperança em Deus",
      meaning: "Confiança apesar das circunstâncias.",
      context: "Salmo 42:5",
      exampleEn: "Put your hope in God, not circumstances.",
      examplePt: "Coloca tua esperança em Deus, não nas circunstâncias.",
      application: "Redirecione foco para Deus."
    },
    {
      en: "Shield of faith",
      pt: "Escudo da fé",
      meaning: "Proteção espiritual contra medo.",
      context: "Efésios 6:16",
      exampleEn: "Faith is our shield against fear.",
      examplePt: "A fé é nosso escudo contra o medo.",
      application: "Fortaleça defesa espiritual."
    },
    {
      en: "Renewed strength",
      pt: "Forças renovadas",
      meaning: "Restauração física e espiritual.",
      context: "Isaías 40:31",
      exampleEn: "They will soar with renewed strength.",
      examplePt: "Voarão com forças renovadas.",
      application: "Prometa recuperação total."
    },
    {
      en: "Close to the brokenhearted",
      pt: "Perto dos quebrantados",
      meaning: "Deus próximo na dor.",
      context: "Salmo 34:18",
      exampleEn: "The Lord is close to the brokenhearted.",
      examplePt: "Perto está o Senhor dos que têm o coração quebrantado.",
      application: "Consolo imediato para quem sofre."
    },
    {
      en: "My cup overflows",
      pt: "Meu cálice transborda",
      meaning: "Abundância de bênçãos e paz.",
      context: "Salmo 23:5",
      exampleEn: "In His presence, my cup overflows.",
      examplePt: "Na Sua presença, meu cálice transborda.",
      application: "Celebre provisão além do necessário."
    },
    {
      en: "Calm in the storm",
      pt: "Calmo na tempestade",
      meaning: "Paz sobrenatural em crises.",
      context: "Marcos 4:39",
      exampleEn: "Jesus brings calm in the storm.",
      examplePt: "Jesus traz calma na tempestade.",
      application: "Prometa controle divino sobre caos."
    },
    {
      en: "Lighten the load",
      pt: "Aliviar a carga",
      meaning: "Deus removendo pesos emocionais.",
      context: "Mateus 11:30",
      exampleEn: "His yoke is easy and lightens the load.",
      examplePt: "Seu jugo é suave e alivia a carga.",
      application: "Ofereça alívio prático."
    },
    {
      en: "Soul at peace",
      pt: "Alma em paz",
      meaning: "Harmonia interior completa.",
      context: "Salmo 23:2",
      exampleEn: "He leads my soul at peace beside still waters.",
      examplePt: "Ele guia minha alma em paz por águas tranquilas.",
      application: "Descreva descanso espiritual."
    },
    {
      en: "Hope alive",
      pt: "Esperança viva",
      meaning: "Confiança renovada em Deus.",
      context: "Romanos 5:5",
      exampleEn: "Keep hope alive even in dark times.",
      examplePt: "Mantenha a esperança viva mesmo nos tempos escuros.",
      application: "Reacenda fé desanimada."
    },
    {
      en: "Gentle whisper",
      pt: "Sussurro suave",
      meaning: "Voz de Deus em meio ao barulho.",
      context: "1 Reis 19:12",
      exampleEn: "God often speaks in a gentle whisper.",
      examplePt: "Deus frequentemente fala em suave sussurro.",
      application: "Ensine ouvir Deus no silêncio."
    },
    {
      en: "Heart healed",
      pt: "Coração curado",
      meaning: "Restauração emocional por Deus.",
      context: "Salmo 147:3",
      exampleEn: "He heals the brokenhearted completely.",
      examplePt: "Ele cura os quebrantados de coração.",
      application: "Prometa cura emocional profunda."
    },
    {
      en: "Trust fall",
      pt: "Queda de confiança",
      meaning: "Entregar-se completamente a Deus.",
      context: "Provérbios 3:5",
      exampleEn: "Faith is learning the trust fall into God's arms.",
      examplePt: "Fé é aprender a cair de confiança nos braços de Deus.",
      application: "Encoraje entrega total."
    },
    {
      en: "Safe harbor",
      pt: "Porto seguro",
      meaning: "Deus como refúgio em tempestades.",
      context: "Salmo 107:30",
      exampleEn: "He brings us to our safe harbor.",
      examplePt: "Ele nos conduz ao porto seguro.",
      application: "Ofereça descanso após tormenta."
    },
    {
      en: "Quiet waters",
      pt: "Águas tranquilas",
      meaning: "Paz restauradora de Deus.",
      context: "Salmo 23:2",
      exampleEn: "He leads me beside quiet waters.",
      examplePt: "Ele me guia por águas tranquilas.",
      application: "Prometa direção pacífica."
    },
    {
      en: "Soul refreshment",
      pt: "Refrigério da alma",
      meaning: "Restauração espiritual profunda.",
      context: "Salmo 23:3",
      exampleEn: "His presence brings soul refreshment.",
      examplePt: "Sua presença traz refrigério à alma.",
      application: "Ofereça revitalização espiritual."
    },
    {
      en: "Steady hand",
      pt: "Mão firme",
      meaning: "Orientação confiável de Deus.",
      context: "Isaías 41:10",
      exampleEn: "God's steady hand guides through storms.",
      examplePt: "A mão firme de Deus guia pelas tempestades.",
      application: "Reforce liderança divina."
    },
    {
      en: "Hope anchor",
      pt: "Âncora da esperança",
      meaning: "Fé que firma em meio ao caos.",
      context: "Hebreus 6:19",
      exampleEn: "Hope is the anchor that holds.",
      examplePt: "Esperança é a âncora que segura.",
      application: "Estabilize quem está à deriva."
    },
    {
      en: "Comfort in tears",
      pt: "Consolo nas lágrimas",
      meaning: "Deus próximo na dor.",
      context: "Salmo 56:8",
      exampleEn: "He collects our tears and brings comfort.",
      examplePt: "Ele recolhe nossas lágrimas e traz consolo.",
      application: "Valide e console o choro."
    },
    {
      en: "Peaceful waters",
      pt: "Águas pacíficas",
      meaning: "Condução serena de Deus.",
      context: "Salmo 23:2",
      exampleEn: "He leads to peaceful waters.",
      examplePt: "Ele conduz a águas pacíficas.",
      application: "Prometa tranquilidade futura."
    }
  ],

  edificacao: [
    {
      en: "Run the race",
      pt: "Correr a corrida",
      meaning: "Viver a fé com perseverança e foco.",
      context: "Hebreus 12:1",
      exampleEn: "Keep running the race with endurance.",
      examplePt: "Continue correndo a corrida com perseverança.",
      application: "Motive consistência na vida cristã."
    },
    {
      en: "Fight the good fight",
      pt: "Lutar a boa luta",
      meaning: "Resistir espiritualmente com coragem.",
      context: "2 Timóteo 4:7",
      exampleEn: "Paul said he fought the good fight.",
      examplePt: "Paulo disse que lutou a boa luta.",
      application: "Encoraje resistência contra tentações."
    },
    {
      en: "Build on the rock",
      pt: "Edificar na rocha",
      meaning: "Basear a vida na Palavra de Deus.",
      context: "Mateus 7:24",
      exampleEn: "Wise people build on the rock.",
      examplePt: "Pessoas sábias edificam na rocha.",
      application: "Ensine obediência prática da Palavra."
    },
    {
      en: "Put off the old self",
      pt: "Despir o velho homem",
      meaning: "Abandonar hábitos pecaminosos.",
      context: "Efésios 4:22",
      exampleEn: "Put off the old self and be renewed.",
      examplePt: "Despoje-se do velho homem e seja renovado.",
      application: "Pratique santificação diária."
    },
    {
      en: "Put on the new self",
      pt: "Vestir o novo homem",
      meaning: "Adotar caráter cristão maduro.",
      context: "Efésios 4:24",
      exampleEn: "Put on the new self created in God's image.",
      examplePt: "Vista o novo homem criado à imagem de Deus.",
      application: "Cultive virtudes cristãs diariamente."
    },
    {
      en: "Work out your salvation",
      pt: "Desenvolver sua salvação",
      meaning: "Viver a fé através de obras práticas.",
      context: "Filipenses 2:12",
      exampleEn: "Work out your salvation with fear and trembling.",
      examplePt: "Desenvolvei a vossa salvação com temor e tremor.",
      application: "Equilibre fé e obras."
    },
    {
      en: "Spiritual milk",
      pt: "Leite espiritual",
      meaning: "Ensinamentos básicos para novos crentes.",
      context: "1 Coríntios 3:2",
      exampleEn: "New believers need spiritual milk first.",
      examplePt: "Novos crentes precisam primeiro de leite espiritual.",
      application: "Avalie nível de maturidade espiritual."
    },
    {
      en: "Solid food",
      pt: "Alimento sólido",
      meaning: "Ensinos profundos para maduros.",
      context: "Hebreus 5:14",
      exampleEn: "Mature Christians eat solid food.",
      examplePt: "Cristãos maduros comem alimento sólido.",
      application: "Desafie crescimento doutrinário."
    },
    {
      en: "Rooted and grounded",
      pt: "Arraigado e firmado",
      meaning: "Fé profunda e estável.",
      context: "Efésios 3:17",
      exampleEn: "Be rooted and grounded in love.",
      examplePt: "Sendo arraigados e fundados em amor.",
      application: "Fortaleça fundamento espiritual."
    },
    {
      en: "Press on toward the goal",
      pt: "Prosseguir para o alvo",
      meaning: "Buscar maturidade espiritual constante.",
      context: "Filipenses 3:14",
      exampleEn: "Press on toward the goal of Christlikeness.",
      examplePt: "Prossigo para o alvo da semelhança com Cristo.",
      application: "Mantenha foco na santificação."
    },
    {
      en: "Take up your cross",
      pt: "Tomar a sua cruz",
      meaning: "Discipulado que custa.",
      context: "Mateus 16:24",
      exampleEn: "Disciples must take up their cross daily.",
      examplePt: "Discípulos devem tomar sua cruz diariamente.",
      application: "Ensine custo do discipulado."
    },
    {
      en: "Count it all joy",
      pt: "Considerar tudo alegria",
      meaning: "Atitude positiva nas provações.",
      context: "Tiago 1:2",
      exampleEn: "Count it all joy when facing trials.",
      examplePt: "Considerai motivo de grande alegria passar por provações.",
      application: "Transforme dificuldades em crescimento."
    },
    {
      en: "Let patience have her perfect work",
      pt: "Deixar a paciência operar",
      meaning: "Permitir que provações formem caráter.",
      context: "Tiago 1:4",
      exampleEn: "Let patience have her perfect work.",
      examplePt: "Deixe a paciência produzir sua obra perfeita.",
      application: "Valorize processo de amadurecimento."
    },
    {
      en: "Be doers of the word",
      pt: "Ser praticante da Palavra",
      meaning: "Obediência prática, não só ouvir.",
      context: "Tiago 1:22",
      exampleEn: "Be doers of the word, not hearers only.",
      examplePt: "Sede praticantes da palavra, não somente ouvintes.",
      application: "Combata religiosidade vazia."
    },
    {
      en: "Iron sharpens iron",
      pt: "Ferro afia ferro",
      meaning: "Crescimento através de relacionamentos.",
      context: "Provérbios 27:17",
      exampleEn: "Good friends sharpen each other like iron.",
      examplePt: "Ferro afia ferro; assim o homem afia o seu amigo.",
      application: "Incentive discipulado em grupos."
    },
    {
      en: "Pulling down strongholds",
      pt: "Derrubar fortalezas",
      meaning: "Vencer pensamentos contrários a Deus.",
      context: "2 Coríntios 10:4",
      exampleEn: "Spiritual weapons pull down strongholds.",
      examplePt: "Armas espirituais derrubam fortalezas.",
      application: "Combata mentalidades erradas."
    },
    {
      en: "Taking every thought captive",
      pt: "Levar cativo todo pensamento",
      meaning: "Disciplina mental espiritual.",
      context: "2 Coríntios 10:5",
      exampleEn: "Take every thought captive to Christ.",
      examplePt: "Levando cativo todo pensamento à obediência de Cristo.",
      application: "Controle padrões de pensamento."
    },
    {
      en: "Grow in grace",
      pt: "Crescer na graça",
      meaning: "Maturidade espiritual progressiva.",
      context: "2 Pedro 3:18",
      exampleEn: "Grow in grace and knowledge of Jesus.",
      examplePt: "Crescendo na graça e no conhecimento de Jesus.",
      application: "Promova desenvolvimento contínuo."
    },
    {
      en: "Equip for ministry",
      pt: "Capacitar para o ministério",
      meaning: "Preparar para serviço cristão.",
      context: "Efésios 4:12",
      exampleEn: "Leaders equip saints for ministry.",
      examplePt: "Para capacitar os santos para a obra do ministério.",
      application: "Desenvolva dons ministeriais."
    },
    {
      en: "Body edifying itself",
      pt: "Corpo edificando-se a si mesmo",
      meaning: "Igreja crescendo em amor.",
      context: "Efésios 4:16",
      exampleEn: "The body edifies itself in love.",
      examplePt: "O corpo se edifica em amor.",
      application: "Promova funcionalidade eclesial."
    },
    {
      en: "Hold fast",
      pt: "Agarrar-se firmemente",
      meaning: "Perseverança na fé.",
      context: "Hebreus 3:14",
      exampleEn: "Hold fast to your confidence.",
      examplePt: "Agarrando-nos firmemente nossa confiança.",
      application: "Combata desânimo espiritual."
    },
    {
      en: "Stir up the gift",
      pt: "Despertar o dom",
      meaning: "Reativar dons espirituais.",
      context: "2 Timóteo 1:6",
      exampleEn: "Stir up the gift God gave you.",
      examplePt: "Desperta o dom que te foi dado por Deus.",
      application: "Reative potencial espiritual ocioso."
    },
    {
      en: "Discipline yourself",
      pt: "Disciplinar-se a si mesmo",
      meaning: "Autocontrole espiritual intencional.",
      context: "1 Timóteo 4:7",
      exampleEn: "Discipline yourself for godliness.",
      examplePt: "Disciplina-te a ti mesmo para a piedade.",
      application: "Cultive hábitos espirituais."
    },
    {
      en: "Train yourself",
      pt: "Treinar-se a si mesmo",
      meaning: "Exercício espiritual constante.",
      context: "1 Timóteo 4:7",
      exampleEn: "Train yourself to be godly.",
      examplePt: "Treina-te a ti mesmo para a piedade.",
      application: "Compare fé com treinamento atlético."
    },
    {
      en: "Mortify the flesh",
      pt: "Mortificar a carne",
      meaning: "Combater desejos pecaminosos.",
      context: "Romanos 8:13",
      exampleEn: "By the Spirit, mortify the flesh.",
      examplePt: "Pela morte do corpo, mortificai as obras da carne.",
      application: "Pratique guerra espiritual interna."
    },
    {
      en: "Walk by faith",
      pt: "Andar por fé",
      meaning: "Vida guiada pela confiança em Deus.",
      context: "2 Coríntios 5:7",
      exampleEn: "We walk by faith, not by sight.",
      examplePt: "Pois andamos por fé, e não por vista.",
      application: "Ensine confiança além das aparências."
    },
    {
      en: "Abound in hope",
      pt: "Abundar em esperança",
      meaning: "Vida transbordante de confiança.",
      context: "Romanos 15:13",
      exampleEn: "May you abound in hope by the Spirit.",
      examplePt: "Para que abundeis em esperança pelo poder do Espírito.",
      application: "Promova otimismo espiritual."
    },
    {
      en: "Established in faith",
      pt: "Estabelecido na fé",
      meaning: "Fé firme e inabalável.",
      context: "Colossenses 2:7",
      exampleEn: "Rooted and established in faith.",
      examplePt: "Arraigados e edificados na fé.",
      application: "Fortaleça base doutrinária."
    },
    {
      en: "Mature in Christ",
      pt: "Maduro em Cristo",
      meaning: "Crescimento para semelhança com Jesus.",
      context: "Colossenses 1:28",
      exampleEn: "We proclaim Him to present everyone mature in Christ.",
      examplePt: "Apresentando todo homem perfeito em Cristo.",
      application: "Objetivo final da edificação."
    },
    {
      en: "Sound doctrine",
      pt: "Sã doutrina",
      meaning: "Ensinos bíblicos corretos e equilibrados.",
      context: "Tito 2:1",
      exampleEn: "Teach what is sound doctrine.",
      examplePt: "Ensina o que convém à sã doutrina.",
      application: "Combata ensinos falsos."
    },
    {
      en: "Spiritual growth",
      pt: "Crescimento espiritual",
      meaning: "Desenvolvimento contínuo na fé.",
      context: "2 Pedro 3:18",
      exampleEn: "Spiritual growth comes through knowing Christ.",
      examplePt: "Crescendo na graça e no conhecimento de Cristo.",
      application: "Monitore progresso espiritual."
    },
    {
      en: "Renewing of your mind",
      pt: "Renovação da mente",
      meaning: "Transformação através da Palavra.",
      context: "Romanos 12:2",
      exampleEn: "Be transformed by the renewing of your mind.",
      examplePt: "Transformai-vos pela renovação da vossa mente.",
      application: "Pratique meditação bíblica."
    },
    {
      en: "Bearing fruit",
      pt: "Dar fruto",
      meaning: "Resultados visíveis da fé viva.",
      context: "João 15:8",
      exampleEn: "This is how my Father is glorified — bearing fruit.",
      examplePt: "Nisto é glorificado meu Pai: que deis muito fruto.",
      application: "Avalie produtividade espiritual."
    },
    {
      en: "Salt of the earth",
      pt: "Sal da terra",
      meaning: "Influência transformadora no mundo.",
      context: "Mateus 5:13",
      exampleEn: "Christians are the salt of the earth.",
      examplePt: "Vós sois o sal da terra.",
      application: "Ensine impacto cultural cristão."
    },
    {
      en: "Press toward the mark",
      pt: "Prosseguir para a meta",
      meaning: "Buscar excelência espiritual.",
      context: "Filipenses 3:14",
      exampleEn: "Press toward the mark of Christ's calling.",
      examplePt: "Prossigo para o alvo do chamado celestial de Cristo.",
      application: "Mantenha visão espiritual elevada."
    },
    {
      en: "Lay aside every weight",
      pt: "Lançar fora todo peso",
      meaning: "Remover obstáculos espirituais.",
      context: "Hebreus 12:1",
      exampleEn: "Lay aside every weight that hinders you.",
      examplePt: "Desembaraçando-nos de todo peso.",
      application: "Identifique e remova impedimentos."
    },
    {
      en: "Look to Jesus",
      pt: "Olhar para Jesus",
      meaning: "Foco constante no autor da fé.",
      context: "Hebreus 12:2",
      exampleEn: "Look to Jesus, the author and finisher of faith.",
      examplePt: "Olhando para Jesus, autor e consumador da fé.",
      application: "Corrija distrações espirituais."
    },
    {
      en: "Exercise yourself unto godliness",
      pt: "Exercitar-se para a piedade",
      meaning: "Disciplina espiritual como treinamento.",
      context: "1 Timóteo 4:7",
      exampleEn: "Exercise yourself unto godliness.",
      examplePt: "Exercita-te na piedade.",
      application: "Compare fé com disciplina atlética."
    },
    {
      en: "Perfecting holiness",
      pt: "Aperfeiçoando a santidade",
      meaning: "Busca contínua por pureza.",
      context: "2 Coríntios 7:1",
      exampleEn: "Perfecting holiness in the fear of God.",
      examplePt: "Aperfeiçoando a santidade no temor de Deus.",
      application: "Cultive separação do pecado."
    },
    {
      en: "Edified together",
      pt: "Edificados juntos",
      meaning: "Crescimento através da comunhão.",
      context: "Efésios 4:16",
      exampleEn: "We are edified together in love.",
      examplePt: "Todo o corpo, bem ajustado, cresce para sua edificação.",
      application: "Valorize corpo de Cristo funcional."
    },
    {
      en: "Steadfast in faith",
      pt: "Firme na fé",
      meaning: "Resistência doutrinária.",
      context: "1 Coríntios 16:13",
      exampleEn: "Be steadfast in faith, unmovable.",
      examplePt: "Estai firmes na fé, inabaláveis.",
      application: "Combata doutrinas falsas."
    },
    {
      en: "Grow up into Him",
      pt: "Crescer para Ele",
      meaning: "Maturidade para semelhança com Cristo.",
      context: "Efésios 4:15",
      exampleEn: "Grow up into Him in all things.",
      examplePt: "Crescendo em tudo naquele que é a cabeça, Cristo.",
      application: "Promova Cristo como modelo."
    },
    {
      en: "Purged from dead works",
      pt: "Purificado de obras mortas",
      meaning: "Limpeza de religiosidade vazia.",
      context: "Hebreus 9:14",
      exampleEn: "Christ purged us from dead works.",
      examplePt: "Cristo nos purificou das obras mortas.",
      application: "Combata formalismo religioso."
    },
    {
      en: "Established in the truth",
      pt: "Estabelecido na verdade",
      meaning: "Fé fundamentada na Palavra.",
      context: "2 Pedro 1:12",
      exampleEn: "Be established in the present truth.",
      examplePt: "Estabelecidos na verdade presente.",
      application: "Fortaleça convicções bíblicas."
    },
    {
      en: "Fruitful in every good work",
      pt: "Frutífero em toda boa obra",
      meaning: "Produtividade espiritual ampla.",
      context: "Colossenses 1:10",
      exampleEn: "Fruitful in every good work and truth.",
      examplePt: "Frutificando em toda boa obra.",
      application: "Amplie sua utilidade no reino."
    }
  ],

  intercessao: [
    {
      en: "Stand in the gap",
      pt: "Firmar-se na brecha",
      meaning: "Orar como intercessor entre Deus e o povo.",
      context: "Ezequiel 22:30",
      exampleEn: "He stood in the gap for his nation.",
      examplePt: "Ele se firmou na brecha por sua nação.",
      application: "Desperte vocação intercessora."
    },
    {
      en: "Lift up in prayer",
      pt: "Elevar em oração",
      meaning: "Orar por alguém especificamente.",
      context: "1 Timóteo 2:1",
      exampleEn: "I lift you up in prayer every morning.",
      examplePt: "Eu te elevo em oração toda manhã.",
      application: "Expressa compromisso intercessor."
    },
    {
      en: "Intercede on behalf of",
      pt: "Interceder em favor de",
      meaning: "Orar representando outro diante de Deus.",
      context: "Romanos 8:26",
      exampleEn: "The Spirit intercedes on behalf of us.",
      examplePt: "O Espírito intercede em nosso favor.",
      application: "Modelo de intercessão espiritual."
    },
    {
      en: "Cry out to God",
      pt: "Clamar a Deus",
      meaning: "Oração urgente e intensa.",
      context: "Salmo 34:17",
      exampleEn: "The righteous cry out and God hears.",
      examplePt: "Os justos clamam e Deus os ouve.",
      application: "Use em momentos de necessidade urgente."
    },
    {
      en: "Burden for souls",
      pt: "Fardo pelas almas",
      meaning: "Preocupação profunda por pessoas perdidas.",
      context: "Romanos 9:2-3",
      exampleEn: "He carried a burden for souls every day.",
      examplePt: "Ele carregava um fardo pelas almas todo dia.",
      application: "Desenvolva compaixão missionária."
    },
    {
      en: "Pour out your heart",
      pt: "Derramar seu coração",
      meaning: "Oração completa e sem reservas.",
      context: "Salmo 62:8",
      exampleEn: "Pour out your heart before Him.",
      examplePt: "Derramai diante dele o vosso coração.",
      application: "Encoraje honestidade na oração."
    },
    {
      en: "Pray without ceasing",
      pt: "Orar sem cessar",
      meaning: "Atitude constante de oração.",
      context: "1 Tessalonicenses 5:17",
      exampleEn: "Pray without ceasing in all seasons.",
      examplePt: "Orai sem cessar em todas as ocasiões.",
      application: "Cultive vida de oração contínua."
    },
    {
      en: "Prevailing prayer",
      pt: "Oração prevalecente",
      meaning: "Oração persistente que alcança vitória.",
      context: "Gênesis 32:26",
      exampleEn: "Jacob's prevailing prayer changed everything.",
      examplePt: "A oração prevalecente de Jacó mudou tudo.",
      application: "Incentive persistência intercessora."
    },
    {
      en: "Earnest prayer",
      pt: "Oração fervorosa",
      meaning: "Oração sincera e intensa.",
      context: "Tiago 5:16",
      exampleEn: "The earnest prayer of the righteous avails much.",
      examplePt: "A oração fervorosa do justo pode muito.",
      application: "Motive intensidade na intercessão."
    },
    {
      en: "Prayer of agreement",
      pt: "Oração de acordo",
      meaning: "Dois ou mais orando em unidade.",
      context: "Mateus 18:19",
      exampleEn: "Their prayer of agreement moved the mountain.",
      examplePt: "A oração de acordo deles moveu a montanha.",
      application: "Forme grupos de intercessão."
    },
    {
      en: "Bear one another's burdens",
      pt: "Carregar os fardos uns dos outros",
      meaning: "Cuidado prático e intercessão mútua.",
      context: "Gálatas 6:2",
      exampleEn: "We bear one another's burdens in love.",
      examplePt: "Levamos os fardos uns dos outros em amor.",
      application: "Pratique comunhão real."
    },
    {
      en: "Make intercession",
      pt: "Fazer intercessão",
      meaning: "Orar representando outros.",
      context: "Isaías 53:12",
      exampleEn: "Jesus makes intercession for us always.",
      examplePt: "Jesus sempre faz intercessão por nós.",
      application: "Siga o modelo intercessor de Cristo."
    },
    {
      en: "Hold up holy hands",
      pt: "Levantar mãos santas",
      meaning: "Postura de oração pura.",
      context: "1 Timóteo 2:8",
      exampleEn: "Lift holy hands in prayer everywhere.",
      examplePt: "Em todo lugar, os homens orem levantando mãos santas.",
      application: "Ensine reverência na oração."
    },
    {
      en: "Travailing in prayer",
      pt: "Trabalhar de parto em oração",
      meaning: "Oração intensa como dor de parto.",
      context: "Gálatas 4:19",
      exampleEn: "She travailed in prayer for her children.",
      examplePt: "Ela travailhou em oração por seus filhos.",
      application: "Inspire profundidade intercessora."
    },
    {
      en: "Watch and pray",
      pt: "Vigiai e orai",
      meaning: "Estar alerta e orar ao mesmo tempo.",
      context: "Mateus 26:41",
      exampleEn: "Watch and pray so you won't fall into temptation.",
      examplePt: "Vigiai e orai para não cairdes em tentação.",
      application: "Combine discernimento e oração."
    },
    {
      en: "Keep watch",
      pt: "Manter-se em vigília",
      meaning: "Vigilância espiritual constante.",
      context: "Marcos 13:33",
      exampleEn: "Keep watch — you do not know the hour.",
      examplePt: "Vigiai — não sabeis quando será o momento.",
      application: "Alerte para alertas espirituais."
    },
    {
      en: "Plead the blood",
      pt: "Clamar pelo sangue",
      meaning: "Interceder com base no sacrifício de Cristo.",
      context: "Apocalipse 12:11",
      exampleEn: "They overcame by pleading the blood.",
      examplePt: "Eles venceram pelo sangue do Cordeiro.",
      application: "Fundamente intercessão na cruz."
    },
    {
      en: "Speak life",
      pt: "Falar vida",
      meaning: "Usar palavras que edificam e restauram.",
      context: "Provérbios 18:21",
      exampleEn: "Choose to speak life over everyone.",
      examplePt: "Escolha falar vida sobre todos ao seu redor.",
      application: "Interceda com palavras positivas."
    },
    {
      en: "Move heaven and earth",
      pt: "Mover céu e terra",
      meaning: "Orar com determinação total.",
      context: "Mateus 21:22",
      exampleEn: "Faithful prayer can move heaven and earth.",
      examplePt: "Oração fiel pode mover céu e terra.",
      application: "Motive fé audaciosa na intercessão."
    },
    {
      en: "Warfare prayer",
      pt: "Oração de guerra",
      meaning: "Intercessão espiritual combativa.",
      context: "Efésios 6:12",
      exampleEn: "Warfare prayer breaks spiritual chains.",
      examplePt: "A oração de guerra quebra correntes espirituais.",
      application: "Ensine intercessão estratégica."
    },
    {
      en: "Name before God",
      pt: "Colocar nome diante de Deus",
      meaning: "Interceder mencionando pessoas específicas.",
      context: "Êxodo 28:29",
      exampleEn: "Aaron carried their names before God.",
      examplePt: "Arão levava seus nomes diante de Deus.",
      application: "Personalize sua intercessão."
    },
    {
      en: "Contend in prayer",
      pt: "Contender em oração",
      meaning: "Orar com determinação e urgência.",
      context: "Judas 1:3",
      exampleEn: "Contend earnestly for the faith.",
      examplePt: "Contendeis ardentemente pela fé.",
      application: "Combata passividade espiritual."
    },
    {
      en: "Knock in prayer",
      pt: "Bater em oração",
      meaning: "Persistência no pedido a Deus.",
      context: "Lucas 11:9",
      exampleEn: "Keep knocking in prayer and the door opens.",
      examplePt: "Continue batendo em oração e a porta se abre.",
      application: "Encoraje perseverança nos pedidos."
    },
    {
      en: "Groan in the Spirit",
      pt: "Gemer no Espírito",
      meaning: "Oração além das palavras.",
      context: "Romanos 8:26",
      exampleEn: "The Spirit groans in the Spirit for us.",
      examplePt: "O Espírito intercede por nós com gemidos.",
      application: "Valorize oração profunda."
    },
    {
      en: "Lay hands on",
      pt: "Impor as mãos",
      meaning: "Oração com toque físico e fé.",
      context: "Marcos 16:18",
      exampleEn: "They laid hands on the sick and healed them.",
      examplePt: "Impuseram as mãos sobre os enfermos e sararam.",
      application: "Pratique ministração pessoal."
    },
    {
      en: "Agree together",
      pt: "Estar de acordo juntos",
      meaning: "Oração unida em propósito.",
      context: "Mateus 18:19",
      exampleEn: "When two agree together, God answers.",
      examplePt: "Quando dois concordarem juntos, Deus responde.",
      application: "Fortaleça intercessão coletiva."
    },
    {
      en: "Call upon His name",
      pt: "Invocar o Seu nome",
      meaning: "Interceder com autoridade no nome de Jesus.",
      context: "Joel 2:32",
      exampleEn: "All who call upon His name shall be saved.",
      examplePt: "Todo aquele que invocar o nome do Senhor será salvo.",
      application: "Use a autoridade do nome de Jesus."
    },
    {
      en: "Seek His face",
      pt: "Buscar a Sua face",
      meaning: "Oração focada em intimidade com Deus.",
      context: "2 Crônicas 7:14",
      exampleEn: "Seek His face and He will heal the land.",
      examplePt: "Se buscarem a minha face, eu sararei a terra.",
      application: "Fundamente intercessão em relacionamento."
    },
    {
      en: "Pray over",
      pt: "Orar sobre",
      meaning: "Interceder especificamente por algo ou alguém.",
      context: "Tiago 5:14",
      exampleEn: "The elders prayed over the sick.",
      examplePt: "Os presbíteros oraram sobre os enfermos.",
      application: "Aplique intercessão com foco."
    },
    {
      en: "Crying out for mercy",
      pt: "Clamando por misericórdia",
      meaning: "Oração humilde pedindo graça.",
      context: "Salmo 123:3",
      exampleEn: "They kept crying out for mercy.",
      examplePt: "Continuaram clamando por misericórdia.",
      application: "Use em situações sem saída humana."
    },
    {
      en: "Binding and loosing",
      pt: "Atar e desatar",
      meaning: "Autoridade espiritual na oração.",
      context: "Mateus 18:18",
      exampleEn: "Whatever you bind on earth is bound in heaven.",
      examplePt: "Tudo o que atardes na terra será atado no céu.",
      application: "Ensine autoridade intercessora."
    },
    {
      en: "Pray for the peace",
      pt: "Orar pela paz",
      meaning: "Interceder por nações e cidades.",
      context: "Salmo 122:6",
      exampleEn: "Pray for the peace of Jerusalem.",
      examplePt: "Orai pela paz de Jerusalém.",
      application: "Expanda intercessão geograficamente."
    },
    {
      en: "Hold on in faith",
      pt: "Manter-se firme na fé",
      meaning: "Persistir em intercessão sem desistir.",
      context: "Lucas 18:1",
      exampleEn: "Hold on in faith and do not give up.",
      examplePt: "Mantenhamo-nos firmes na fé sem desistir.",
      application: "Combata desânimo na oração."
    },
    {
      en: "Pray in the Spirit",
      pt: "Orar no Espírito",
      meaning: "Intercessão guiada pelo Espírito Santo.",
      context: "Efésios 6:18",
      exampleEn: "Pray in the Spirit on all occasions.",
      examplePt: "Orando em todo tempo no Espírito.",
      application: "Desenvolva sensibilidade ao Espírito."
    },
    {
      en: "Pray for your enemies",
      pt: "Orar pelos inimigos",
      meaning: "Intercessão por quem nos prejudica.",
      context: "Mateus 5:44",
      exampleEn: "Jesus said: pray for your enemies.",
      examplePt: "Jesus disse: orai pelos vossos inimigos.",
      application: "Pratique amor sobrenatural."
    },
    {
      en: "Supplication",
      pt: "Súplica",
      meaning: "Pedido fervente e humilde a Deus.",
      context: "Filipenses 4:6",
      exampleEn: "Make your requests known by supplication.",
      examplePt: "Apresentai as vossas petições a Deus por súplicas.",
      application: "Aprofunde linguagem da oração."
    },
    {
      en: "Bold before the throne",
      pt: "Ousado diante do trono",
      meaning: "Orar com confiança em Deus.",
      context: "Hebreus 4:16",
      exampleEn: "Come bold before the throne of grace.",
      examplePt: "Chegai com ousadia ao trono da graça.",
      application: "Remova timidez na intercessão."
    },
    {
      en: "Bring before the Lord",
      pt: "Trazer diante do Senhor",
      meaning: "Apresentar situações a Deus em oração.",
      context: "1 Samuel 1:15",
      exampleEn: "She brought her pain before the Lord.",
      examplePt: "Ela trouxe sua dor diante do Senhor.",
      application: "Valide todas as dores na oração."
    },
    {
      en: "Pray without doubt",
      pt: "Orar sem duvidar",
      meaning: "Fé plena no momento da intercessão.",
      context: "Tiago 1:6",
      exampleEn: "Ask in faith, pray without doubt.",
      examplePt: "Peça com fé, orando sem duvidar.",
      application: "Fortaleça convicção na oração."
    },
    {
      en: "Fasting and prayer",
      pt: "Jejum e oração",
      meaning: "Combinação de disciplina e intercessão.",
      context: "Mateus 17:21",
      exampleEn: "Some things only come through fasting and prayer.",
      examplePt: "Alguns casos só saem pela oração e jejum.",
      application: "Ensine poder do jejum intercessor."
    },
    {
      en: "Storming heaven",
      pt: "Assaltar os céus",
      meaning: "Intercessão intensa e apaixonada.",
      context: "Lucas 18:7-8",
      exampleEn: "The widow kept storming heaven with her plea.",
      examplePt: "A viúva continuou assaltando os céus com seu pedido.",
      application: "Inspire urgência na oração."
    },
    {
      en: "Pleading for grace",
      pt: "Implorar graça",
      meaning: "Orar pedindo favor imerecido de Deus.",
      context: "Números 6:25",
      exampleEn: "They kept pleading for grace in hard times.",
      examplePt: "Continuaram implorando graça nos tempos difíceis.",
      application: "Use em situações de grande necessidade."
    },
    {
      en: "Prayer warrior",
      pt: "Guerreiro de oração",
      meaning: "Pessoa dedicada à intercessão.",
      context: "Efésios 6:18",
      exampleEn: "She was a true prayer warrior for her family.",
      examplePt: "Ela era uma verdadeira guerreira de oração por sua família.",
      application: "Identifique e valorize intercessores."
    },
    {
      en: "Keep praying",
      pt: "Continuar orando",
      meaning: "Persistência na intercessão.",
      context: "Lucas 18:1",
      exampleEn: "Keep praying and do not give up.",
      examplePt: "Continuai orando e não desanimeis.",
      application: "Combata desistência na oração."
    },
    {
      en: "Move in the Spirit",
      pt: "Mover-se no Espírito",
      meaning: "Ser guiado pelo Espírito na intercessão.",
      context: "Romanos 8:14",
      exampleEn: "Those led by the Spirit move in prayer.",
      examplePt: "Os guiados pelo Espírito se movem em oração.",
      application: "Desenvolva sensibilidade espiritual."
    }
  ],

  devocional: [
    {
      en: "Abide in Me",
      pt: "Permanecei em mim",
      meaning: "Manter comunhão íntima e constante com Jesus.",
      context: "João 15:4",
      exampleEn: "Abide in Me and I will abide in you.",
      examplePt: "Permanecei em mim e eu permanecerei em vós.",
      application: "Cultive presença contínua com Cristo."
    },
    {
      en: "Seek My face",
      pt: "Buscar a minha face",
      meaning: "Desejo profundo por intimidade com Deus.",
      context: "Salmo 27:8",
      exampleEn: "When you seek My face, I reveal Myself.",
      examplePt: "Quando buscais a minha face, eu me revelo.",
      application: "Priorize relacionamento acima de pedidos."
    },
    {
      en: "Still waters",
      pt: "Águas tranquilas",
      meaning: "Paz e restauração na presença de Deus.",
      context: "Salmo 23:2",
      exampleEn: "He leads me beside still waters.",
      examplePt: "Ele me guia por águas tranquilas.",
      application: "Encontre descanso devocional diário."
    },
    {
      en: "Sweet fellowship",
      pt: "Doce comunhão",
      meaning: "Prazer na presença do Espírito.",
      context: "1 João 1:7",
      exampleEn: "We have sweet fellowship walking in light.",
      examplePt: "Temos doce comunhão andando na luz.",
      application: "Valorize tempo a sós com Deus."
    },
    {
      en: "Draw near to God",
      pt: "Chegar mais perto de Deus",
      meaning: "Aproximar-se voluntariamente de Deus.",
      context: "Tiago 4:8",
      exampleEn: "Draw near to God and He draws near to you.",
      examplePt: "Chegai-vos a Deus e Ele se chegará a vós.",
      application: "Tome iniciativa na intimidade espiritual."
    },
    {
      en: "Dwell in the secret place",
      pt: "Habitar no lugar secreto",
      meaning: "Vida escondida com Deus em oração.",
      context: "Salmo 91:1",
      exampleEn: "Those who dwell in the secret place are safe.",
      examplePt: "O que habita no lugar secreto está seguro.",
      application: "Desenvolva quarto de oração particular."
    },
    {
      en: "Taste and see",
      pt: "Prova e vê",
      meaning: "Experiência pessoal da bondade de Deus.",
      context: "Salmo 34:8",
      exampleEn: "Taste and see that the Lord is good.",
      examplePt: "Provai e vede que o Senhor é bom.",
      application: "Experimente Deus pessoalmente."
    },
    {
      en: "Delight in the Lord",
      pt: "Deleitar-se no Senhor",
      meaning: "Encontrar prazer máximo em Deus.",
      context: "Salmo 37:4",
      exampleEn: "Delight in the Lord and He gives your desires.",
      examplePt: "Deleita-te no Senhor e Ele te concederá os desejos do teu coração.",
      application: "Faça de Deus sua maior alegria."
    },
    {
      en: "Sit at His feet",
      pt: "Sentar-se a Seus pés",
      meaning: "Postura de aprendiz devocional.",
      context: "Lucas 10:39",
      exampleEn: "Mary chose to sit at His feet.",
      examplePt: "Maria escolheu sentar-se a Seus pés.",
      application: "Priorize ouvir mais que fazer."
    },
    {
      en: "Holy of holies",
      pt: "Santo dos santos",
      meaning: "Lugar mais íntimo da presença de Deus.",
      context: "Hebreus 9:3",
      exampleEn: "Through Jesus, we enter the Holy of holies.",
      examplePt: "Por Jesus, entramos no Santo dos santos.",
      application: "Aproxime-se do trono da graça."
    },
    {
      en: "Throne of grace",
      pt: "Trono da graça",
      meaning: "Deus como fonte de misericórdia.",
      context: "Hebreus 4:16",
      exampleEn: "Approach the throne of grace with confidence.",
      examplePt: "Chegai com confiança ao trono da graça.",
      application: "Ore sabendo que recebe misericórdia."
    },
    {
      en: "Walk with God",
      pt: "Andar com Deus",
      meaning: "Vida de companheirismo diário.",
      context: "Gênesis 5:24",
      exampleEn: "Enoch walked with God and pleased Him.",
      examplePt: "Enoque andou com Deus e agradou a Deus.",
      application: "Viva consciente da presença divina."
    },
    {
      en: "In His presence",
      pt: "Na Sua presença",
      meaning: "Experiência direta de Deus.",
      context: "Salmo 16:11",
      exampleEn: "In His presence is fullness of joy.",
      examplePt: "Na Tua presença há plenitude de alegria.",
      application: "Busque alegria na presença, não nas coisas."
    },
    {
      en: "Quiet my soul",
      pt: "Acalmar minha alma",
      meaning: "Silêncio interior para ouvir Deus.",
      context: "Salmo 131:2",
      exampleEn: "I have quieted my soul like a child.",
      examplePt: "Eu tranquilizei minha alma como criança desmamada.",
      application: "Pratique silêncio contemplativo."
    },
    {
      en: "Burning heart",
      pt: "Coração ardente",
      meaning: "Paixão espiritual intensa por Deus.",
      context: "Lucas 24:32",
      exampleEn: "Didn't our hearts burn within us?",
      examplePt: "Não nos ardiam os corações?",
      application: "Desperte amor apaixonado por Deus."
    },
    {
      en: "Deep calls to deep",
      pt: "Profundo clama ao profundo",
      meaning: "Deus chamando a profundidade do nosso ser.",
      context: "Salmo 42:7",
      exampleEn: "Deep calls to deep in the sound of Your waters.",
      examplePt: "Profundo clama ao profundo nas tuas catadupas.",
      application: "Responda ao chamado profundo de Deus."
    },
    {
      en: "Lover of my soul",
      pt: "Amante da minha alma",
      meaning: "Jesus como esposo amoroso da alma.",
      context: "Oséias 2:16",
      exampleEn: "Jesus is the lover of my soul.",
      examplePt: "Jesus é o amante da minha alma.",
      application: "Cultive amor romântico por Cristo."
    },
    {
      en: "Living bread",
      pt: "Pão vivo",
      meaning: "Jesus como alimento espiritual diário.",
      context: "João 6:51",
      exampleEn: "I eat the living bread from heaven daily.",
      examplePt: "Como diariamente o pão vivo do céu.",
      application: "Faça de Jesus seu sustento principal."
    },
    {
      en: "Wellspring of life",
      pt: "Fonte da vida",
      meaning: "Deus como origem de toda vitalidade.",
      context: "Provérbios 4:23",
      exampleEn: "Guard your heart — it's the wellspring of life.",
      examplePt: "Guarda teu coração — é a fonte da vida.",
      application: "Proteja comunhão íntima com Deus."
    },
    {
      en: "Face to face",
      pt: "Face a face",
      meaning: "Intimidade direta e pessoal com Deus.",
      context: "1 Coríntios 13:12",
      exampleEn: "Now we see dimly, then face to face.",
      examplePt: "Agora vemos por espelho em enigma, mas face a face.",
      application: "Anseie pela comunhão plena."
    },
    {
      en: "Hidden with Christ",
      pt: "Escondido com Cristo",
      meaning: "Identidade segura na união com Jesus.",
      context: "Colossenses 3:3",
      exampleEn: "My life is hidden with Christ in God.",
      examplePt: "Estais escondidos com Cristo em Deus.",
      application: "Encontre segurança na união mística."
    },
    {
      en: "In the beloved",
      pt: "No Amado",
      meaning: "Aceitação completa em Cristo.",
      context: "Efésios 1:6",
      exampleEn: "Accepted in the beloved Son.",
      examplePt: "Aceitos no Amado.",
      application: "Descanse na aceitação de Cristo."
    },
    {
      en: "One Spirit",
      pt: "Um só Espírito",
      meaning: "União espiritual profunda com Deus.",
      context: "1 Coríntios 6:17",
      exampleEn: "Whoever is united to the Lord is one spirit.",
      examplePt: "O que se une ao Senhor é um só espírito com Ele.",
      application: "Viva a união espiritual constante."
    },
    {
      en: "Drink from the river",
      pt: "Beber do rio",
      meaning: "Receber do Espírito continuamente.",
      context: "João 7:38",
      exampleEn: "Whoever believes drinks from the river.",
      examplePt: "Quem crê em mim, do seu interior correrão rios.",
      application: "Permaneça cheio do Espírito."
    },
    {
      en: "Temple of the Holy Spirit",
      pt: "Templo do Espírito Santo",
      meaning: "Corpo como morada de Deus.",
      context: "1 Coríntios 6:19",
      exampleEn: "Your body is the temple of the Holy Spirit.",
      examplePt: "O vosso corpo é templo do Espírito Santo.",
      application: "Honre seu corpo como lugar santo."
    },
    {
      en: "Inner room",
      pt: "Quarto interior",
      meaning: "Lugar secreto de oração pessoal.",
      context: "Mateus 6:6",
      exampleEn: "Pray in your inner room with the door closed.",
      examplePt: "Ora no teu aposento e fecha a porta.",
      application: "Crie espaço diário a sós com Deus."
    },
    {
      en: "Heavenly language",
      pt: "Linguagem celestial",
      meaning: "Oração em línguas espirituais.",
      context: "1 Coríntios 14:2",
      exampleEn: "In the Spirit, he prayed in heavenly language.",
      examplePt: "No Espírito, ele orou em linguagem celestial.",
      application: "Explore dons espirituais devocionais."
    },
    {
      en: "Soul satisfaction",
      pt: "Satisfação da alma",
      meaning: "Plenitude encontrada apenas em Deus.",
      context: "Salmo 63:5",
      exampleEn: "My soul is satisfied as with marrow and fat.",
      examplePt: "Minha alma se satisfaz como de miolo e tutano.",
      application: "Busque satisfação exclusiva em Deus."
    },
    {
      en: "Early will I seek You",
      pt: "Cedo te buscarei",
      meaning: "Disciplina matinal de devoção.",
      context: "Salmo 63:1",
      exampleEn: "Early will I seek You, O God.",
      examplePt: "Cedo te buscarei, ó Deus.",
      application: "Estabeleça devocional matinal."
    },
    {
      en: "Meditate day and night",
      pt: "Meditar de dia e de noite",
      meaning: "Reflexão contínua na Palavra.",
      context: "Salmo 1:2",
      exampleEn: "His delight is to meditate day and night.",
      examplePt: "O seu prazer está na lei do Senhor, meditando nela dia e noite.",
      application: "Pratique meditação bíblica constante."
    },
    {
      en: "Feast on the Word",
      pt: "Banquetes da Palavra",
      meaning: "Deleite profundo nas Escrituras.",
      context: "Jeremias 15:16",
      exampleEn: "Your words were found and I ate them.",
      examplePt: "Achei as tuas palavras e as comi.",
      application: "Trate a Bíblia como alimento delicioso."
    },
    {
      en: "Soak in His presence",
      pt: "Absorver Sua presença",
      meaning: "Permanecer imerso na presença divina.",
      context: "2 Coríntios 3:18",
      exampleEn: "We are transformed as we soak in His presence.",
      examplePt: "Somos transformados absorvendo Sua presença.",
      application: "Pratique adoração contemplativa."
    },
    {
      en: "Holy ground",
      pt: "Terra santa",
      meaning: "Lugar onde encontramos Deus.",
      context: "Êxodo 3:5",
      exampleEn: "Where God is, there is holy ground.",
      examplePt: "Onde Deus está, há terra santa.",
      application: "Reconheça sagrado do cotidiano."
    },
    {
      en: "Still small voice",
      pt: "Voz mansa e delicada",
      meaning: "Deus falando suavemente ao coração.",
      context: "1 Reis 19:12",
      exampleEn: "God speaks in a still small voice.",
      examplePt: "Voz mansa e delicada.",
      application: "Aprenda ouvir sussurros divinos."
    },
    {
      en: "Heart on fire",
      pt: "Coração em chamas",
      meaning: "Paixão espiritual intensa.",
      context: "Lucas 24:32",
      exampleEn: "Didn't our hearts burn within us?",
      examplePt: "Não nos ardiam os corações?",
      application: "Desperte fogo espiritual interior."
    },
    {
      en: "Living sacrifice",
      pt: "Sacrifício vivo",
      meaning: "Vida totalmente entregue a Deus.",
      context: "Romanos 12:1",
      exampleEn: "Present your bodies as living sacrifices.",
      examplePt: "Apresentai vossos corpos como sacrifício vivo.",
      application: "Viva entrega total diária."
    },
    {
      en: "Renewed in the spirit",
      pt: "Renovado no espírito",
      meaning: "Restauração espiritual interior.",
      context: "Efésios 4:23",
      exampleEn: "Be renewed in the spirit of your mind.",
      examplePt: "Renovai-vos no espírito da vossa mente.",
      application: "Pratique renovação mental diária."
    },
    {
      en: "Communion with God",
      pt: "Comunhão com Deus",
      meaning: "Intercâmbio espiritual íntimo.",
      context: "1 João 1:6",
      exampleEn: "We have communion with God through His Son.",
      examplePt: "Temos comunhão com Deus por meio de Seu Filho.",
      application: "Priorize troca espiritual com Deus."
    },
    {
      en: "Secret place",
      pt: "Lugar secreto",
      meaning: "Espaço privado de encontro com Deus.",
      context: "Salmo 91:1",
      exampleEn: "Dwell in the secret place of the Most High.",
      examplePt: "Aquele que habita no esconderijo do Altíssimo.",
      application: "Proteja seu tempo devocional."
    },
    {
      en: "Spiritual hunger",
      pt: "Fome espiritual",
      meaning: "Desejo intenso pela presença de Deus.",
      context: "Mateus 5:6",
      exampleEn: "Blessed are those with spiritual hunger.",
      examplePt: "Bem-aventurados os que têm fome e sede de justiça.",
      application: "Cultive desejo ardente por Deus."
    },
    {
      en: "Intimate knowledge",
      pt: "Conhecimento íntimo",
      meaning: "Relacionamento profundo e pessoal.",
      context: "Filipenses 3:10",
      exampleEn: "Knowing Christ intimately changes everything.",
      examplePt: "Conhecê-lo intimamente muda tudo.",
      application: "Busque conhecer a Deus pessoalmente."
    },
    {
      en: "Bread from heaven",
      pt: "Pão do céu",
      meaning: "Revelação espiritual que sustenta.",
      context: "João 6:32",
      exampleEn: "God's Word is bread from heaven.",
      examplePt: "A palavra de Deus é pão do céu.",
      application: "Alimente-se diariamente da revelação."
    },
    {
      en: "Spiritual eyes",
      pt: "Olhos espirituais",
      meaning: "Capacidade de ver realidades eternas.",
      context: "Efésios 1:18",
      exampleEn: "May God open your spiritual eyes.",
      examplePt: "Iluminados os olhos do vosso entendimento.",
      application: "Peça discernimento espiritual."
    },
    {
      en: "Heart's desire",
      pt: "Desejo do coração",
      meaning: "Anseio mais profundo da alma por Deus.",
      context: "Salmo 37:4",
      exampleEn: "Delight in Him and receive your heart's desire.",
      examplePt: "Deleita-te no Senhor e receberás os desejos do teu coração.",
      application: "Alinhe desejos com vontade divina."
    },
    {
      en: "Soul thirst",
      pt: "Sede da alma",
      meaning: "Anelo profundo por Deus.",
      context: "Salmo 42:1",
      exampleEn: "My soul thirsts for God like a deer.",
      examplePt: "A minha alma tem sede de Deus como a corça.",
      application: "Reconheça sua necessidade espiritual."
    }
  ]
};

const STORAGE_KEYS = {
  completed: "bibleEnglishCompletedLessons",
  lastLesson: "bibleEnglishLastLesson",
  lastRoute: "bibleEnglishLastRoute",
  selectedPrayerLesson: "bibleEnglishPrayerLesson"
};

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const installBtn = document.getElementById("installBtn");
const toast = document.getElementById("toast");
const navButtons = document.querySelectorAll(".nav-btn");
const premiumModal = document.getElementById("premiumModal");
const premiumModalActivateBtn = document.getElementById("premiumModalActivateBtn");
const premiumModalCloseBtn = document.getElementById("premiumModalCloseBtn");

let deferredPrompt = null;
let currentRoute = { name: "home" };
let pendingPremiumLessonId = null;

function isLessonLocked(lessonId) {
  return Number(lessonId) > 5 && !isPremium;
}

function openPremiumModal(lessonId) {
  pendingPremiumLessonId = Number(lessonId) || null;
  if (!premiumModal) return;
  premiumModal.classList.remove("hidden");
  premiumModal.setAttribute("aria-hidden", "false");
}

function closePremiumModal() {
  if (!premiumModal) return;
  premiumModal.classList.add("hidden");
  premiumModal.setAttribute("aria-hidden", "true");
}

function getCompletedLessons() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.completed)) || [];
  } catch (error) {
    return [];
  }
}

function saveCompletedLessons(ids) {
  localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(ids));
}

function getProgressData() {
  const completed = getCompletedLessons();
  const total = lessons.length;
  const count = completed.length;
  const percentage = Math.round((count / total) * 100);
  return { total, count, percentage };
}

function isLessonCompleted(id) {
  return getCompletedLessons().includes(id);
}

function markLessonCompleted(id) {
  const completed = getCompletedLessons();
  if (!completed.includes(id)) {
    completed.push(id);
    saveCompletedLessons(completed);
    showToast("Aula marcada como concluída ✅");
  } else {
    showToast("Essa aula já estava concluída ✨");
  }
}

function setLastLesson(id) {
  localStorage.setItem(STORAGE_KEYS.lastLesson, String(id));
}

function getLastLesson() {
  const value = Number(localStorage.getItem(STORAGE_KEYS.lastLesson));
  return lessons.find(l => l.id === value) ? value : 1;
}

function setLastRoute(route) {
  localStorage.setItem(STORAGE_KEYS.lastRoute, JSON.stringify(route));
}

function getSelectedPrayerLessonId() {
  const saved = Number(localStorage.getItem(STORAGE_KEYS.selectedPrayerLesson));
  return lessons.find(l => l.id === saved) ? saved : getLastLesson();
}

function setSelectedPrayerLessonId(id) {
  localStorage.setItem(STORAGE_KEYS.selectedPrayerLesson, String(id));
}

function updateNavActive(routeName) {
  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === routeName);
  });
}

function updateBackButton() {
  if (currentRoute.name === "home") {
    backBtn.classList.add("hidden");
  } else {
    backBtn.classList.remove("hidden");
  }
}

function clearA11yPresetClasses() {
  document.body.classList.remove(
    "a11y-high-contrast",
    "a11y-dark-mode",
    "a11y-yellow-mode",
    "a11y-soft-blue"
  );
}

function applyVisualPreset(preset) {
  clearA11yPresetClasses();

  if (preset === "high-contrast") {
    document.body.classList.add("a11y-high-contrast");
  } else if (preset === "dark-mode") {
    document.body.classList.add("a11y-dark-mode");
  } else if (preset === "yellow-mode") {
    document.body.classList.add("a11y-yellow-mode");
  } else if (preset === "soft-blue") {
    document.body.classList.add("a11y-soft-blue");
  }

  accessibilityState.visualPreset = preset;
  persistAccessibilityState();
}

function applyFontScale(scaleValue) {
  accessibilityState.fontScale = String(scaleValue);
  document.body.classList.add("a11y-font-scale");
  document.body.style.setProperty("--a11y-font-scale", `${16 * Number(scaleValue)}px`);
  persistAccessibilityState();
}

function isElementActuallyVisible(node) {
  if (!node || !(node instanceof Element)) return false;

  if (node.classList.contains("hidden")) return false;
  if (node.closest(".hidden")) return false;
  if (node.closest("#premiumModal.hidden")) return false;
  if (node.closest("#accessibilityOnboarding.hidden")) return false;
  if (node.closest("#accessibilityPresetModal.hidden")) return false;

  const style = window.getComputedStyle(node);
  if (style.display === "none") return false;
  if (style.visibility === "hidden") return false;
  if (style.opacity === "0") return false;

  return true;
}

function normalizeReaderText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\s*\.\s*/g, ". ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function getVisibleTextFromApp() {
  const appRoot = document.getElementById("app");
  if (!appRoot) return "";

  const selectors = [
    ".screen h1",
    ".screen h2",
    ".screen h3",
    ".screen p",
    ".screen strong",
    ".screen li",
    ".screen .pill",
    ".screen .status-badge",
    ".screen button",
    ".screen label",
    ".screen option:checked"
  ].join(", ");

  const nodes = Array.from(appRoot.querySelectorAll(selectors));

  const parts = nodes
    .filter((node) => {
      if (!isElementActuallyVisible(node)) return false;

      if (node.matches(".audio-inline-btn, .toggle-inline-btn")) return false;
      if (node.closest(".audio-btn-row, .toggle-btn-row")) return false;

      const text = normalizeReaderText(node.textContent);
      if (!text) return false;
      if (text.length < 2) return false;

      return true;
    })
    .map((node) => normalizeReaderText(node.textContent));

  const uniqueParts = [];
  const seen = new Set();

  for (const part of parts) {
    const key = part.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(". ");
}

function getVisibleTextFromElement(rootElement) {
  if (!rootElement) return "";

  const selectors = "h1, h2, h3, p, strong, li, label, span, button";
  const nodes = Array.from(rootElement.querySelectorAll(selectors));

  const parts = nodes
    .filter((node) => isElementActuallyVisible(node))
    .map((node) => normalizeReaderText(node.textContent))
    .filter((text) => text && text.length > 1);

  const uniqueParts = [];
  const seen = new Set();

  for (const part of parts) {
    const key = part.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(". ");
}

function readCurrentScreen() {
  const text = getVisibleTextFromApp();

  if (!text) {
    showToast("Nenhum conteúdo legível encontrado nesta tela");
    return;
  }

  speakText(text, "pt-BR", { source: "screen" });
}

function autoReadCurrentScreen() {
  if (!accessibilityState.enabled || !accessibilityState.autoRead) return;

  window.setTimeout(() => {
    readCurrentScreen();
  }, 80);
}

function readElementAutomatically(rootElement, source = "modal") {
  const text = getVisibleTextFromElement(rootElement);
  if (!text) return;

  window.setTimeout(() => {
    speakText(text, "pt-BR", { source });
  }, 80);
}

function updateReaderVisibility() {
  const readerFab = document.getElementById("readerFab");
  if (!readerFab) return;

  const shouldShow = accessibilityState.enabled && accessibilityState.showReader;
  readerFab.classList.toggle("hidden", !shouldShow);
  readerFab.setAttribute("aria-hidden", String(!shouldShow));
  updateReaderFabState();
}

function initReader() {
  const readerFab = document.getElementById("readerFab");
  if (!readerFab) return;

  if (!readerFab.dataset.readerBound) {
    readerFab.addEventListener("click", toggleSpeechFromReader);
    readerFab.dataset.readerBound = "true";
  }

  updateReaderVisibility();
}

function closeA11yOnboarding() {
  const onboarding = document.getElementById("accessibilityOnboarding");
  if (!onboarding) return;
  onboarding.classList.add("hidden");
  onboarding.setAttribute("aria-hidden", "true");
}

function showA11yOnboarding() {
  const onboarding = document.getElementById("accessibilityOnboarding");
  if (!onboarding) return;

  onboarding.classList.remove("hidden");
  onboarding.setAttribute("aria-hidden", "false");
  stopSpeech();
  readElementAutomatically(onboarding, "onboarding");
}

function closeA11yPresetModal() {
  const modal = document.getElementById("accessibilityPresetModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function showA11yPresetModal() {
  const modal = document.getElementById("accessibilityPresetModal");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  stopSpeech();
  readElementAutomatically(modal, "preset-modal");
}

function bindA11yOnboarding() {
  const enableBtn = document.getElementById("enableA11yBtn");
  const disableBtn = document.getElementById("disableA11yBtn");
  const skipCheckbox = document.getElementById("skipA11yOnboarding");
  const savePresetBtn = document.getElementById("saveA11yPresetBtn");
  const presetInputs = document.querySelectorAll('input[name="startupVisualPreset"]');

  if (!enableBtn || !disableBtn || !skipCheckbox || !savePresetBtn) return;

  enableBtn.addEventListener("click", () => {
    accessibilityState.enabled = true;
    accessibilityState.showReader = true;
    accessibilityState.autoRead = true;
    accessibilityState.skipOnboarding = skipCheckbox.checked;

    persistAccessibilityState();
    initReader();
    updateReaderVisibility();

    closeA11yOnboarding();
    showA11yPresetModal();
  });

  disableBtn.addEventListener("click", () => {
    accessibilityState.skipOnboarding = skipCheckbox.checked;
    persistAccessibilityState();
    stopSpeech();
    closeA11yOnboarding();
  });

  if (presetInputs.length) {
    presetInputs.forEach((input) => {
      input.checked = input.value === accessibilityState.visualPreset;
    });
  }

  savePresetBtn.addEventListener("click", () => {
    const checkedPreset = document.querySelector('input[name="startupVisualPreset"]:checked');
    const selectedPreset = checkedPreset ? checkedPreset.value : "default";

    applyVisualPreset(selectedPreset);
    persistAccessibilityState();

    stopSpeech();
    closeA11yPresetModal();
    updateReaderVisibility();
    autoReadCurrentScreen();
    showToast("Preset visual aplicado");
  });
}

function resetAccessibilitySettings() {
  Object.values(A11Y_KEYS).forEach((key) => localStorage.removeItem(key));

  accessibilityState.enabled = false;
  accessibilityState.skipOnboarding = false;
  accessibilityState.showReader = true;
  accessibilityState.visualPreset = "default";
  accessibilityState.fontScale = "1";
  accessibilityState.ttsRate = 0.9;
  accessibilityState.ttsPitch = 1;
  accessibilityState.autoRead = false;

  clearA11yPresetClasses();
  document.body.classList.remove("a11y-font-scale");
  document.body.style.removeProperty("--a11y-font-scale");

  stopSpeech();
  updateReaderVisibility();
}

function navigate(routeName, data = {}) {
  stopSpeech();

  currentRoute = { name: routeName, ...data };
  setLastRoute(currentRoute);

  updateNavActive(
    routeName === "lesson"
      ? "lessons"
      : routeName === "flashcard-list" || routeName === "flashcard-item"
      ? "flashcards"
      : ["accessibility"].includes(routeName)
      ? "home"
      : routeName
  );

  updateBackButton();

  if (routeName === "home") renderHome();
  else if (routeName === "lessons") renderLessons();
  else if (routeName === "lesson") renderLesson(data.id);
  else if (routeName === "prayer") renderPrayer(data.lessonId);
  else if (routeName === "premium") renderPremium();
  else if (routeName === "flashcards") renderFlashcards();
  else if (routeName === "flashcard-list") renderFlashcardList(data.key);
  else if (routeName === "flashcard-item") renderFlashcardItem(data.key, data.index);
  else if (routeName === "accessibility") renderAccessibilitySettings();
  else renderEmpty();

  updateReaderVisibility();
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (routeName === "accessibility") {
    autoReadAccessibilityScreenIfNeeded();
  } else {
    autoReadCurrentScreen();
  }
}

function renderTemplate(templateId) {
  const template = document.getElementById(templateId);
  if (!template) {
    console.error(`Template ${templateId} não encontrado`);
    renderEmpty();
    return;
  }
  app.innerHTML = "";
  app.appendChild(template.content.cloneNode(true));
}

function renderHome() {
  renderTemplate("home-template");

  const progress = getProgressData();
  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");
  const progressSubtext = document.getElementById("progressSubtext");
  const preview = document.getElementById("homeLessonsPreview");
  const startStudyBtn = document.getElementById("startStudyBtn");
  const goPrayerBtn = document.getElementById("goPrayerBtn");
  const seeAllLessonsBtn = document.getElementById("seeAllLessonsBtn");
  const openAccessibilityBtn = document.getElementById("openAccessibilityBtn");

  progressText.textContent = `${progress.percentage}%`;
  progressFill.style.width = `${progress.percentage}%`;
  progressSubtext.textContent = `${progress.count} de ${progress.total} aulas concluídas`;

  preview.innerHTML = "";
  lessons.slice(0, 3).forEach((lesson) => preview.appendChild(createLessonCard(lesson)));

  startStudyBtn.addEventListener("click", () => navigate("lesson", { id: getLastLesson() }));
  goPrayerBtn.addEventListener("click", () => navigate("prayer", { lessonId: getSelectedPrayerLessonId() }));
  seeAllLessonsBtn.addEventListener("click", () => navigate("lessons"));

  if (openAccessibilityBtn) {
    openAccessibilityBtn.addEventListener("click", () => navigate("accessibility"));
  }
}

function renderAccessibilitySettings() {
  renderTemplate("accessibility-template");

  const enabledToggle = document.getElementById("a11yEnabledToggle");
  const readerToggle = document.getElementById("a11yReaderToggle");
  const fontScaleSelect = document.getElementById("a11yFontScale");
  const ttsRateSelect = document.getElementById("a11yTtsRate");
  const ttsPitchSelect = document.getElementById("a11yTtsPitch");
  const resetA11yBtn = document.getElementById("resetA11yBtn");
  const presetInputs = document.querySelectorAll('input[name="visualPreset"]');

  if (!enabledToggle || !readerToggle || !fontScaleSelect || !ttsRateSelect || !ttsPitchSelect || !resetA11yBtn) {
    renderEmpty();
    return;
  }

  enabledToggle.checked = accessibilityState.enabled;
  readerToggle.checked = accessibilityState.showReader;
  fontScaleSelect.value = String(accessibilityState.fontScale);
  ttsRateSelect.value = String(accessibilityState.ttsRate);
  ttsPitchSelect.value = String(accessibilityState.ttsPitch);

  presetInputs.forEach((input) => {
    input.checked = input.value === accessibilityState.visualPreset;
  });

  enabledToggle.addEventListener("change", (event) => {
    accessibilityState.enabled = event.target.checked;
    accessibilityState.autoRead = event.target.checked;
    persistAccessibilityState();

    stopSpeech();
    initReader();
    updateReaderVisibility();

    if (accessibilityState.enabled) {
      autoReadCurrentScreen();
    }

    showToast(accessibilityState.enabled ? "Acessibilidade ativada" : "Acessibilidade desativada");
  });

  readerToggle.addEventListener("change", (event) => {
    accessibilityState.showReader = event.target.checked;
    persistAccessibilityState();
    initReader();
    updateReaderVisibility();
  });

  fontScaleSelect.addEventListener("change", (event) => {
    applyFontScale(event.target.value);
    showToast("Tamanho da fonte atualizado");
  });

  ttsRateSelect.addEventListener("change", (event) => {
    accessibilityState.ttsRate = parseFloat(event.target.value);
    persistAccessibilityState();
  });

  ttsPitchSelect.addEventListener("change", (event) => {
    accessibilityState.ttsPitch = parseFloat(event.target.value);
    persistAccessibilityState();
  });

  presetInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      applyVisualPreset(event.target.value);
      showToast("Preset visual aplicado");
    });
  });

  resetA11yBtn.addEventListener("click", () => {
    resetAccessibilitySettings();
    navigate("accessibility");
    showToast("Preferências de acessibilidade resetadas");
  });
}

function autoReadAccessibilityScreenIfNeeded() {
  if (currentRoute.name !== "accessibility") return;

  window.setTimeout(() => {
    readCurrentScreen();
  }, 80);
}

function renderLessons() {
  renderTemplate("lessons-template");

  const lessonsList = document.getElementById("lessonsList");
  const lessonsCountPill = document.getElementById("lessonsCountPill");
  lessonsCountPill.textContent = `${lessons.length} aulas`;

  lessonsList.innerHTML = "";
  lessons.forEach(lesson => {
    lessonsList.appendChild(createLessonCard(lesson));
  });
}

function createLessonCard(lesson) {
  const card = document.createElement("article");
  card.className = "lesson-card";

  const done = isLessonCompleted(lesson.id);
  const locked = isLessonLocked(lesson.id);
  if (locked) card.classList.add("premium-locked");

  card.innerHTML = `
    <div class="lesson-card-top">
      <div>
        <span class="pill">Aula ${lesson.order}</span>
        <h3>${lesson.title}</h3>
        <p class="meta">${lesson.reference}</p>
        ${locked ? '<span class="premium-lock-label">🔒 Premium</span>' : ''}
      </div>
      ${done ? '<span class="status-badge">Concluída</span>' : `<span class="pill">${locked ? 'Bloqueada' : 'Disponível'}</span>`}
    </div>
    <p class="lesson-snippet">${lesson.versePt}</p>
    <div class="lesson-card-actions">
      <button class="secondary-btn" data-action="open-prayer">🙏 Oração</button>
      <button class="primary-btn" data-action="open-lesson">${locked ? 'Desbloquear' : 'Abrir'}</button>
    </div>
  `;

  card.querySelector('[data-action="open-lesson"]').addEventListener("click", () => {
    if (locked) {
      openPremiumModal(lesson.id);
      return;
    }
    navigate("lesson", { id: lesson.id });
  });

  card.querySelector('[data-action="open-prayer"]').addEventListener("click", () => {
    if (locked) {
      openPremiumModal(lesson.id);
      return;
    }
    navigate("prayer", { lessonId: lesson.id });
  });

  return card;
}

function renderLesson(id) {
  const lesson = lessons.find(l => l.id === Number(id));
  if (!lesson) {
    renderEmpty();
    return;
  }

  if (isLessonLocked(lesson.id)) {
    openPremiumModal(lesson.id);
    navigate("lessons");
    return;
  }

  setLastLesson(lesson.id);
  setSelectedPrayerLessonId(lesson.id);

  renderTemplate("lesson-template");

  document.getElementById("lessonTag").textContent = `Aula ${lesson.order}`;
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonRef").textContent = lesson.reference;
  document.getElementById("verseEn").textContent = lesson.verseEn;
  document.getElementById("versePt").textContent = lesson.versePt;
  document.getElementById("grammarText").textContent = lesson.grammar;
  document.getElementById("reReadText").textContent = lesson.reread;
  document.getElementById("prayerEn").textContent = lesson.prayerEn;
  document.getElementById("prayerPt").textContent = lesson.prayerPt;
  document.getElementById("prayerAdapt").textContent = lesson.prayerAdapt;
  document.getElementById("insightText").textContent = lesson.insight;

  const badge = document.getElementById("lessonCompletedBadge");
  const completeLessonBtn = document.getElementById("completeLessonBtn");
  const continueBtn = document.getElementById("continueBtn");
  const openPrayerScreenBtn = document.getElementById("openPrayerScreenBtn");

  const verseCard = document.querySelector(".highlight-verse");
  const prayerCard = document.querySelector(".prayer-card");
  if (verseCard) {
    const audioWrap = document.createElement("div");
    audioWrap.className = "audio-btn-row";
    audioWrap.innerHTML = `<button class="secondary-btn audio-inline-btn" id="speakVerseBtn">🔊 Ouvir versículo</button>`;
    verseCard.appendChild(audioWrap);
    document.getElementById("speakVerseBtn").addEventListener("click", () => speakText(lesson.verseEn, "en-US"));
  }
  if (prayerCard) {
    const audioWrap = document.createElement("div");
    audioWrap.className = "audio-btn-row";
    audioWrap.innerHTML = `<button class="secondary-btn audio-inline-btn" id="speakPrayerBtn">🔊 Ouvir oração</button>`;
    prayerCard.appendChild(audioWrap);
    document.getElementById("speakPrayerBtn").addEventListener("click", () => speakText(lesson.prayerEn, "en-US"));
  }

  if (isLessonCompleted(lesson.id)) {
    badge.classList.remove("hidden");
    completeLessonBtn.textContent = "Concluída ✅";
  }

  const guidedReadingContainer = document.getElementById("guidedReading");
  lesson.guidedReading.forEach(item => {
    const div = document.createElement("div");
    div.className = "guided-item";
    div.innerHTML = `<strong>${item.title}</strong><p>${item.text}</p>`;
    guidedReadingContainer.appendChild(div);
  });

  const vocabTableWrap = document.getElementById("vocabTableWrap");
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Palavra</th>
        <th>Tradução</th>
        <th>Explicação</th>
      </tr>
    </thead>
    <tbody>
      ${lesson.vocabulary.map(v => `
        <tr>
          <td>${v.word}</td>
          <td>${v.translation}</td>
          <td>${v.explanation}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  vocabTableWrap.appendChild(table);

  const exerciseList = document.getElementById("exerciseList");
  lesson.exercises.forEach((ex, index) => {
    const div = document.createElement("div");
    div.className = "exercise-item";
    const answerId = `exercise-answer-${lesson.id}-${index}`;
    div.innerHTML = `
      <strong>${ex.type}</strong>
      <p><strong>Pergunta:</strong> ${ex.question}</p>
      <div class="toggle-btn-row">
        <button class="secondary-btn toggle-inline-btn" data-toggle-target="${answerId}" data-show-text="Ver resposta" data-hide-text="Ocultar resposta" aria-expanded="false">Ver resposta</button>
      </div>
      <p id="${answerId}" class="toggle-content"><strong>Resposta:</strong> ${ex.answer}</p>
    `;
    const toggleBtn = div.querySelector('[data-toggle-target]');
    toggleBtn.addEventListener("click", () => toggleResposta(answerId, toggleBtn));
    exerciseList.appendChild(div);
  });

  const applicationList = document.getElementById("applicationList");
  lesson.application.forEach((text, index) => {
    const div = document.createElement("div");
    div.className = "application-item";
    const match = text.match(/^(.*?)\s*\((.*?)\)\s*$/);
    const enText = match ? match[1].trim() : text;
    const ptText = match ? match[2].trim() : "";
    const translationId = `application-translation-${lesson.id}-${index}`;
    div.innerHTML = `
      <p>${enText}</p>
      <div class="toggle-btn-row">
        <button class="secondary-btn toggle-inline-btn" data-toggle-target="${translationId}" data-show-text="Ver tradução" data-hide-text="Ocultar tradução" aria-expanded="false">Ver tradução</button>
      </div>
      <p id="${translationId}" class="toggle-content">${ptText}</p>
    `;
    const toggleBtn = div.querySelector('[data-toggle-target]');
    toggleBtn.addEventListener("click", () => universalToggle(translationId, toggleBtn));
    applicationList.appendChild(div);
  });

  completeLessonBtn.addEventListener("click", () => {
    markLessonCompleted(lesson.id);
    renderLesson(lesson.id);
  });

  continueBtn.addEventListener("click", () => {
    const nextLesson = lessons.find(l => l.id === lesson.id + 1);
    if (nextLesson) {
      if (isLessonLocked(nextLesson.id)) {
        openPremiumModal(nextLesson.id);
        return;
      }
      navigate("lesson", { id: nextLesson.id });
    } else {
      showToast("Você concluiu a última aula disponível 🎉");
      navigate("home");
    }
  });

  openPrayerScreenBtn.addEventListener("click", () => {
    navigate("prayer", { lessonId: lesson.id });
  });
}

function renderPrayer(forcedLessonId) {
  renderTemplate("prayer-template");

  const select = document.getElementById("prayerLessonSelect");
  const prayerScreenEn = document.getElementById("prayerScreenEn");
  const prayerScreenPt = document.getElementById("prayerScreenPt");
  const prayerScreenAdapt = document.getElementById("prayerScreenAdapt");
  const copyPrayerBtn = document.getElementById("copyPrayerBtn");
  const goToLessonFromPrayerBtn = document.getElementById("goToLessonFromPrayerBtn");

  lessons.forEach(lesson => {
    const option = document.createElement("option");
    option.value = lesson.id;
    option.textContent = `Aula ${lesson.order} — ${lesson.title}${isLessonLocked(lesson.id) ? ' 🔒' : ''}`;
    select.appendChild(option);
  });

  const selectedId = forcedLessonId || getSelectedPrayerLessonId();
  select.value = String(selectedId);

  function fillPrayer(lessonId) {
    const lesson = lessons.find(l => l.id === Number(lessonId));
    if (!lesson) return;
    if (isLessonLocked(lesson.id)) {
      openPremiumModal(lesson.id);
      return;
    }
    setSelectedPrayerLessonId(lesson.id);
    prayerScreenEn.textContent = lesson.prayerEn;
    prayerScreenPt.textContent = lesson.prayerPt;
    prayerScreenAdapt.textContent = lesson.prayerAdapt;
    goToLessonFromPrayerBtn.dataset.lessonId = lesson.id;
  }

  fillPrayer(selectedId);

  const prayerTools = document.querySelector('.prayer-tools');
  if (prayerTools) {
    const speakPrayerBtn = document.createElement('button');
    speakPrayerBtn.id = 'speakPrayerScreenBtn';
    speakPrayerBtn.className = 'secondary-btn';
    speakPrayerBtn.textContent = '🔊 Ouvir oração';
    prayerTools.prepend(speakPrayerBtn);
    speakPrayerBtn.addEventListener('click', () => {
      const lesson = lessons.find((l) => l.id === Number(select.value));
      if (!lesson || isLessonLocked(Number(select.value))) {
        openPremiumModal(Number(select.value));
        return;
      }
      speakText(lesson.prayerEn, "en-US");
    });
  }

  select.addEventListener("change", (event) => {
    fillPrayer(event.target.value);
  });

  copyPrayerBtn.addEventListener("click", async () => {
    const lesson = lessons.find(l => l.id === Number(select.value));
    if (!lesson || isLessonLocked(lesson.id)) {
      openPremiumModal(Number(select.value));
      return;
    }

    const textToCopy = `EN: ${lesson.prayerEn}
PT: ${lesson.prayerPt}
Adaptável: ${lesson.prayerAdapt}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast("Oração copiada 🙏");
    } catch (error) {
      showToast("Não foi possível copiar agora");
    }
  });

  goToLessonFromPrayerBtn.addEventListener("click", () => {
    navigate("lesson", { id: Number(goToLessonFromPrayerBtn.dataset.lessonId) });
  });
}

function renderPremium() {
  renderTemplate("premium-template");

  const premiumLinkBtn = document.getElementById("premiumLinkBtn");

  if (premiumLinkBtn) {
    premiumLinkBtn.addEventListener("click", (event) => {
      event.preventDefault();

      if (isPremium) {
        showToast("Premium já está ativo ✨");
        return;
      }

      ativarPremium();
    });
  }
}

// ── FLASHCARDS ──────────────────────────────────────────────
// (apenas uma definição de cada função)

function renderFlashcards() {
  renderTemplate('flashcards-template');
  const list = document.getElementById('flashcardsHomeList');
  if (!list) {
    renderEmpty();
    return;
  }

  list.innerHTML = '';

  Object.entries(flashcardBlocos).forEach(([_, bloco]) => {
    const locked = !isBlocoLiberado(bloco.index);
    const percentual = calcularProgresso(bloco.key, bloco.total);

    const div = document.createElement('div');
    div.className = `flashcard-block ${bloco.className}${locked ? ' is-locked' : ''}`;
    div.innerHTML = `
      <div class="flashcard-block-top">
        <div>
          <h3>${bloco.title}</h3>
          <p>${bloco.subtitle}</p>
        </div>
        <span class="flashcard-lock">${locked ? '🔒 Premium' : ''}</span>
      </div>
      ${renderBarraProgresso(percentual, bloco.className)}
    `;

    div.addEventListener('click', () => {
      if (locked) {
        openPremiumModal();
        return;
      }
      // CORREÇÃO: usar bloco.key (a string identificadora) em vez do índice numérico
      navigate('flashcard-list', { key: bloco.key });
    });

    list.appendChild(div);
  });
}

function renderFlashcardList(key) {
  const bloco = flashcardBlocos.find(b => b.key === key);
  const cards = flashcards[key] || [];

  if (!bloco || cards.length === 0) {
    renderEmpty();
    return;
  }

  renderTemplate('flashcard-list-template');

  const titleEl = document.getElementById('flashcardListTitle');
  const subtitleEl = document.getElementById('flashcardListSubtitle');
  const countEl = document.getElementById('flashcardListCount');
  const grid = document.getElementById('flashcardNumberGrid');

  if (!titleEl || !subtitleEl || !countEl || !grid) {
    renderEmpty();
    return;
  }

  titleEl.textContent = bloco.title;
  subtitleEl.textContent = bloco.subtitle;
  countEl.textContent = `${cards.length} itens`;
  grid.innerHTML = '';

  const feitos = getProgresso(key);

  cards.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `flashcard-number-btn${i < feitos ? ' done' : ''}`;
    btn.textContent = String(i + 1);

    btn.addEventListener('click', () => {
      navigate('flashcard-item', { key, index: i });
    });

    grid.appendChild(btn);
  });
}

function renderFlashcardItem(key, index) {
  const bloco = flashcardBlocos.find(b => b.key === key);
  const cards = flashcards[key] || [];
  const card = cards[index];

  if (!bloco || !card) {
    renderEmpty();
    return;
  }

  renderTemplate('flashcard-item-template');

  const flashcardItemTag = document.getElementById('flashcardItemTag');
  const flashcardItemProgress = document.getElementById('flashcardItemProgress');
  const flashcardItemTitle = document.getElementById('flashcardItemTitle');
  const flashcardItemRef = document.getElementById('flashcardItemRef');
  const flashcardEnText = document.getElementById('flashcardEnText');
  const flashcardPtText = document.getElementById('flashcardPtText');
  const flashcardMeaning = document.getElementById('flashcardMeaning');
  const flashcardContext = document.getElementById('flashcardContext');
  const flashcardExampleEn = document.getElementById('flashcardExampleEn');
  const flashcardExamplePt = document.getElementById('flashcardExamplePt');
  const flashcardApplication = document.getElementById('flashcardApplication');
  const cardEnBtn = document.getElementById('cardEnBtn');
  const cardPtBtn = document.getElementById('cardPtBtn');
  const speakExpressionBtn = document.getElementById('speakExpressionBtn');
  const speakExampleBtn = document.getElementById('speakExampleBtn');

  if (
    !flashcardItemTag || !flashcardItemProgress || !flashcardItemTitle || !flashcardItemRef ||
    !flashcardEnText || !flashcardPtText || !flashcardMeaning || !flashcardContext ||
    !flashcardExampleEn || !flashcardExamplePt || !flashcardApplication ||
    !cardEnBtn || !cardPtBtn || !speakExpressionBtn || !speakExampleBtn
  ) {
    renderEmpty();
    return;
  }

  flashcardItemTag.textContent = bloco.title;
flashcardItemProgress.textContent = `${index + 1}/${cards.length}`;
flashcardItemTitle.textContent = card.en;
flashcardItemRef.textContent = card.context;
flashcardEnText.textContent = card.en;
flashcardPtText.textContent = card.pt;
flashcardMeaning.textContent = card.meaning;
flashcardContext.textContent = card.context;
flashcardExampleEn.textContent = card.exampleEn;
flashcardExamplePt.textContent = card.examplePt;
flashcardApplication.textContent = card.application;

cardEnBtn.setAttribute("aria-label", `Flashcard em inglês: ${card.en}`);
cardPtBtn.setAttribute("aria-label", `Flashcard em português: ${card.pt}`);
cardEnBtn.dataset.lang = "en";
cardPtBtn.dataset.lang = "pt";

cardEnBtn.classList.remove("flipped");
cardPtBtn.classList.remove("flipped");

cardEnBtn.addEventListener("click", () => toggleCard("cardEnBtn"));
cardPtBtn.addEventListener("click", () => toggleCard("cardPtBtn"));
speakExpressionBtn.addEventListener("click", () => speakText(card.en, "en-US"));
speakExampleBtn.addEventListener("click", () => speakText(card.exampleEn, "en-US"));

  const atual = getProgresso(key);
  if (index + 1 > atual) {
    setProgresso(key, index + 1);
  }
}

function renderEmpty() {
  renderTemplate("empty-template");
  document.getElementById("goHomeFromEmpty").addEventListener("click", () => {
    navigate("home");
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast._timeout);
  showToast._timeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function handleBackNavigation() {
  if (currentRoute.name === "lesson") navigate("lessons");
  else if (currentRoute.name === "flashcard-item") navigate("flashcard-list", { key: currentRoute.key });
  else if (currentRoute.name === "flashcard-list") navigate("flashcards");
  else if (currentRoute.name === "accessibility") navigate("home");
  else if (["lessons", "prayer", "premium", "flashcards"].includes(currentRoute.name)) navigate("home");
  else navigate("home");
}

function registerNavEvents() {
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const route = btn.dataset.route;
      if (route === "prayer") {
        navigate("prayer", { lessonId: getSelectedPrayerLessonId() });
      } else {
        navigate(route);
      }
    });
  });

  backBtn.addEventListener("click", handleBackNavigation);

  if (premiumModalActivateBtn) {
    premiumModalActivateBtn.addEventListener("click", ativarPremium);
  }
  if (premiumModalCloseBtn) {
    premiumModalCloseBtn.addEventListener("click", closePremiumModal);
  }
  document.querySelectorAll('[data-close-premium]').forEach(el => {
    el.addEventListener('click', closePremiumModal);
  });
}

function registerPWA() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("./service-worker.js");
      } catch (error) {
        console.warn("Service Worker não registrado:", error);
      }
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.classList.remove("hidden");
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add("hidden");
  });

  window.addEventListener("appinstalled", () => {
    installBtn.classList.add("hidden");
    showToast("App instalado com sucesso 📲");
  });
}

function restoreInitialRoute() {
  try {
    const lastRoute = JSON.parse(localStorage.getItem(STORAGE_KEYS.lastRoute));
    if (lastRoute && lastRoute.name) {
      if (lastRoute.name === 'lesson' && lastRoute.id) {
        if (isLessonLocked(lastRoute.id)) {
          navigate('lessons');
          return;
        }
        navigate('lesson', { id: lastRoute.id });
        return;
      }
      if (lastRoute.name === 'flashcard-list' && lastRoute.key) {
        navigate('flashcard-list', { key: lastRoute.key });
        return;
      }
      if (lastRoute.name === 'flashcard-item' && lastRoute.key && typeof lastRoute.index === 'number') {
        navigate('flashcard-item', { key: lastRoute.key, index: lastRoute.index });
        return;
      }
      if (['home', 'lessons', 'prayer', 'premium', 'flashcards'].includes(lastRoute.name)) {
        if (lastRoute.name === 'prayer') {
          navigate('prayer', { lessonId: getSelectedPrayerLessonId() });
          return;
        }
        navigate(lastRoute.name);
        return;
      }
    }
  } catch (error) {}
  navigate('home');
}

registerNavEvents();
registerPWA();
restoreInitialRoute();

applyVisualPreset(accessibilityState.visualPreset);
applyFontScale(accessibilityState.fontScale);
bindA11yOnboarding();
initReader();
updateReaderVisibility();

if (!accessibilityState.skipOnboarding) {
  showA11yOnboarding();
} else if (accessibilityState.enabled && accessibilityState.autoRead) {
  if (currentRoute.name === "accessibility") {
    autoReadAccessibilityScreenIfNeeded();
  } else {
    autoReadCurrentScreen();
  }
}