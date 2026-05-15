// PlantaBot — base de conhecimento de cultivo.
// Roda 100% no frontend (é só conteúdo estático, não precisa de servidor).

const knowledge = {
  tomate: {
    nome: "Tomate",
    clima: "Quente (18°C a 25°C), com bastante sol direto (mínimo 6h por dia).",
    solo: "Solo bem drenado, rico em matéria orgânica. pH entre 6,0 e 6,8.",
    plantio: "Semear em sementeira e transplantar após 25-30 dias quando tiver 15cm. Espaçamento de 50cm entre plantas.",
    agua: "Regar todos os dias no início. Depois 2-3 vezes por semana. Evite molhar as folhas.",
    colheita: "70 a 120 dias após o plantio, quando o fruto está bem vermelho.",
    dicas: "Tutorar (amarrar em estaca) para a planta crescer pra cima. Remova brotos laterais (desbrota) para frutos maiores.",
  },
  alface: {
    nome: "Alface",
    clima: "Clima ameno (15°C a 22°C). Em calor extremo, sombrear parcialmente.",
    solo: "Solo solto, fértil, com boa drenagem. pH 6,0 a 7,0.",
    plantio: "Semear em bandeja e transplantar após 25 dias. Espaçamento de 25-30cm.",
    agua: "Manter o solo sempre úmido. Regue de manhã ou no fim da tarde.",
    colheita: "60 a 80 dias. Colha antes da planta 'pendoar' (subir flor).",
    dicas: "Faça plantios escalonados a cada 15 dias para ter alface sempre fresca.",
  },
  cenoura: {
    nome: "Cenoura",
    clima: "Clima ameno a frio (10°C a 20°C).",
    solo: "Solo arenoso, fofo e profundo (mínimo 25cm). Sem pedras.",
    plantio: "Semear direto no canteiro. NÃO transplantar (a raiz não gosta). Espaçamento final de 5-7cm.",
    agua: "Manter úmido sem encharcar. Regue a cada 2 dias.",
    colheita: "70 a 120 dias, quando o 'ombro' da raiz começa a aparecer no solo.",
    dicas: "Desbaste (arranque mudas em excesso) quando tiverem 5cm para dar espaço às raízes.",
  },
  milho: {
    nome: "Milho",
    clima: "Quente (20°C a 30°C), com sol pleno.",
    solo: "Solo fértil, rico em nitrogênio, bem drenado.",
    plantio: "Semear direto no solo. Plante em blocos de várias fileiras (não em linha única) para boa polinização. Espaçamento 25cm entre plantas, 80cm entre fileiras.",
    agua: "Regular, especialmente na floração. 2-3 vezes por semana.",
    colheita: "90 a 120 dias. Espiga pronta quando os 'cabelos' estão marrons e secos.",
    dicas: "Adube com composto orgânico. Milho gosta de muito alimento.",
  },
  maca: {
    nome: "Maçã",
    clima: "Frio. Precisa de horas de frio (abaixo de 7°C) no inverno. Difícil em regiões muito quentes.",
    solo: "Solo bem drenado, profundo, pH 6,0 a 6,5.",
    plantio: "A partir de muda enxertada. Plantar no inverno em cova de 60x60x60cm. Espaçamento de 4-5m entre plantas.",
    agua: "Regular nos 2 primeiros anos. Depois apenas em secas prolongadas.",
    colheita: "3 a 5 anos após o plantio para a primeira safra. Maçãs maduras soltam fácil ao torcer.",
    dicas: "Faça poda anual no inverno. Plante 2 variedades diferentes próximas para polinização cruzada.",
  },
  morango: {
    nome: "Morango",
    clima: "Frio a ameno (15°C a 22°C).",
    solo: "Solo rico em matéria orgânica, levemente ácido (pH 5,5 a 6,5).",
    plantio: "A partir de muda. Plantar no outono. Espaçamento de 30cm.",
    agua: "Regar todo dia ou em dias alternados. Não molhar os frutos.",
    colheita: "70 a 90 dias. Colher quando totalmente vermelho.",
    dicas: "Use cobertura morta (palha) para proteger os frutos do contato com o solo.",
  },
  banana: {
    nome: "Banana",
    clima: "Tropical e subtropical (25°C a 30°C). Sensível a geada.",
    solo: "Solo profundo, fértil, com boa drenagem.",
    plantio: "A partir de muda (rebento). Cova de 40x40x40cm. Espaçamento de 3m.",
    agua: "Muita água. A planta tem 80% de água. Regar bastante.",
    colheita: "12 a 18 meses para o primeiro cacho. Cortar quando os frutos estiverem 'gordos' mas ainda verdes.",
    dicas: "Após colher um cacho, corte o pseudocaule (tronco). Os filhos brotam ao lado.",
  },
  pimentao: {
    nome: "Pimentão",
    clima: "Quente (21°C a 30°C). Não tolera frio.",
    solo: "Fértil, bem drenado, pH 5,5 a 6,8.",
    plantio: "Semear em bandeja e transplantar após 40 dias. Espaçamento de 50cm.",
    agua: "Constante, sem encharcar. 3-4 vezes por semana.",
    colheita: "90 a 120 dias. Pode colher verde ou esperar amarelo/vermelho.",
    dicas: "Tutore a planta. Os galhos são frágeis e quebram com peso dos frutos.",
  },
  cebola: {
    nome: "Cebola",
    clima: "Ameno (15°C a 25°C). Dia longo na fase de bulbificação.",
    solo: "Solto, bem drenado, pH 6,0 a 6,8.",
    plantio: "Semear em sementeira e transplantar após 60 dias. Espaçamento de 10-15cm.",
    agua: "Regular, mas parar 15 dias antes da colheita.",
    colheita: "150 a 180 dias. Pronta quando as folhas 'caem' e secam.",
    dicas: "Deixe secar ao sol após colher, com folhas. Conserva por meses.",
  },
};

function normalize(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Lista de plantas que o bot conhece (pros botões de atalho)
export function getTopics() {
  return Object.keys(knowledge).map((k) => ({ key: k, name: knowledge[k].nome }));
}

// Recebe a mensagem do usuário e devolve a resposta do bot
export function askBot(message) {
  const text = normalize(message || "");

  let found = null;
  for (const key of Object.keys(knowledge)) {
    if (text.includes(key)) {
      found = knowledge[key];
      break;
    }
  }

  if (!found) {
    const nomes = Object.values(knowledge).map((k) => k.nome).join(", ");
    return {
      reply:
        `Olá! Eu sou o **PlantaBot**, posso te ensinar a cultivar várias plantas. Sobre o que você quer saber?\n\n` +
        `Eu sei sobre: ${nomes}.\n\n` +
        `É só me dizer "como plantar tomate", "quero cultivar alface", etc.`,
    };
  }

  let topic = "geral";
  if (/clima|temperatura/.test(text)) topic = "clima";
  else if (/solo|terra/.test(text)) topic = "solo";
  else if (/plantar|semear|plantio/.test(text)) topic = "plantio";
  else if (/agua|regar|rega/.test(text)) topic = "agua";
  else if (/colher|colheita/.test(text)) topic = "colheita";
  else if (/dica/.test(text)) topic = "dicas";

  if (topic === "geral") {
    return {
      reply:
        `**Guia para plantar ${found.nome}:**\n\n` +
        `**Clima:** ${found.clima}\n\n` +
        `**Solo:** ${found.solo}\n\n` +
        `**Plantio:** ${found.plantio}\n\n` +
        `**Água:** ${found.agua}\n\n` +
        `**Colheita:** ${found.colheita}\n\n` +
        `**Dicas:** ${found.dicas}\n\n` +
        `Quer mais detalhes? Pergunte sobre "clima", "solo", "rega", "colheita" ou "dicas" de ${found.nome.toLowerCase()}.`,
    };
  }

  return { reply: `**${found.nome} — ${topic}:** ${found[topic]}` };
}
