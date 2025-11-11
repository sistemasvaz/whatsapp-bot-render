const wppconnect = require('@wppconnect-team/wppconnect');

// FAQ 20 PERGUNTAS (INSTANTÂNEO)
const FAQ = {
  "qual o horário de atendimento": "Atendemos de segunda a sexta das 8h às 18h, e sábado das 8h às 12h.",
  "como marcar consulta": "Mande WhatsApp aqui ou ligue para (11) 99999-9999 – agendamos na hora.",
  "aceita particular": "Sim! Atendemos particular, convênios e nossos planos próprios.",
  "quanto custa consulta": "Consulta inicial R$ 120 (particular). Com plano, incluso.",
  "tem estacionamento": "Sim, estacionamento gratuito na frente da clínica.",
  "aceita unimed": "Sim, Unimed é aceita em todos os procedimentos odontológicos.",
  "plano cobre ortodontia": "Sim, aparelho fixo com até 50% de reembolso no plano Premium.",
  "quanto custa plano dental": "A partir de R$ 49/mês por pessoa. Familiar sai R$ 39 cada.",
  "plano cobre limpeza": "Sim, limpeza anual inclusa em todos os planos.",
  "tem emergência odontológica": "Emergência 24h pelo (11) 99999-9999 – atendemos na hora.",
  "aceita sulamerica": "Sim, SulAmérica Saúde e Odonto aceitos.",
  "qual o endereço da clínica": "Rua Exemplo, 123 – Centro, São Paulo – SP (próximo ao metrô).",
  "plano cobre implante": "Sim, no plano Top: até 2 implantes por ano com 30% de desconto.",
  "criança pode usar plano": "Sim, a partir de 2 anos. Cobertura pediátrica inclusa.",
  "tem raio x digital": "Sim, raio-x panorâmico digital incluso na consulta inicial.",
  "aceita bradesco saude": "Sim, Bradesco Saúde e Dental aceitos.",
  "plano cobre clareamento": "Sim, clareamento a laser com 1 sessão grátis no plano Gold.",
  "como cancelar plano": "Basta avisar com 30 dias. Sem multa após 12 meses.",
  "tem wi-fi na clínica": "Sim, Wi-Fi gratuito para pacientes na sala de espera.",
  "aceita cartão": "Sim, todos os cartões (crédito, débito) e PIX na hora."
};

// Normaliza texto
function normalizar(texto) {
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

const memoriaConversa = {};

wppconnect
  .create({
    session: 'whatsapp-bot-render',
    autoClose: 0,
    logQR: false,
    headless: true,
    useChrome: true,
    puppeteerOptions: {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ]
},
    catchQR: (base64Qr, asciiQR) => {
      console.log('\n=== ESCANEIE ESSE QR NO WHATSAPP BUSINESS ===');
      console.log(asciiQR);
      console.log('=== Vá em Dispositivos Vinculados ===\n');
    },
  })
  .then((client) => startBot(client))
  .catch((error) => console.error('Erro:', error));

async function startBot(client) {
  console.log('BOT NO RENDER ATIVO!');

  client.onMessage(async (message) => {
    if (message.isGroupMsg || !message.body) return;

    const from = message.from;
    const query = message.body.trim();
    const queryNorm = normalizar(query);

    // Saudação só na primeira
    if (!memoriaConversa[from]?.saudado) {
      await client.sendText(from, 'Oi! 😊 Sou sua assistente da clínica. Como posso te ajudar?');
      memoriaConversa[from] = { saudado: true, ultimaPergunta: '', ultimaResposta: '' };
      return;
    }

    // FAQ
    let respondido = false;
    for (const [pergunta, resposta] of Object.entries(FAQ)) {
      const pNorm = normalizar(pergunta);
      if (queryNorm.includes(pNorm.split(' ')[0]) && queryNorm.includes(pNorm.split(' ').slice(1).join(' '))) {
        await client.sendText(from, resposta);
        memoriaConversa[from].ultimaPergunta = query;
        memoriaConversa[from].ultimaResposta = resposta;
        respondido = true;
        break;
      }
    }

    if (respondido) return;

    // Fallback (sem Ollama no Render)
    const respostas = [
      "Posso te ajudar com isso! Me conte mais sobre sua necessidade.",
      "Não tenho essa info agora, mas posso te passar o contato da clínica.",
      "Quer que eu te envie a tabela de preços em PDF?",
      "Ligue para (11) 99999-9999 que te ajudam na hora!"
    ];
    const resposta = respostas[Math.floor(Math.random() * respostas.length)];
    await client.sendText(from, resposta);

    memoriaConversa[from].ultimaPergunta = query;
    memoriaConversa[from].ultimaResposta = resposta;
  });
}