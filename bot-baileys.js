const { 
  DisconnectReason, 
  useMultiFileAuthState 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const makeWASocket = require('@whiskeysockets/baileys').default;

// FAQ 20 PERGUNTAS
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

function normalizar(texto) {
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

const memoria = {};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão fechada', lastDisconnect?.error, 'Reconectando...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('BOT BAILEYS CONECTADO! FAQ ATIVO.');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid.endsWith('@g.us')) return;

    const from = msg.key.remoteJid;
    const texto = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
    if (!texto) return;

    const textoNorm = normalizar(texto);

    if (!memoria[from]?.saudado) {
      await sock.sendMessage(from, { text: 'Oi! 😊 Sou sua assistente da clínica. Como posso te ajudar?' });
      memoria[from] = { saudado: true };
      return;
    }

    // FAQ
    for (const [pergunta, resposta] of Object.entries(FAQ)) {
      const pNorm = normalizar(pergunta);
      if (textoNorm.includes(pNorm)) {
        await sock.sendMessage(from, { text: resposta });
        return;
      }
    }

    // Fallback
    const fallback = [
      "Posso te ajudar! Me conte mais.",
      "Ligue para (11) 99999-9999 que te ajudam na hora!",
      "Quer a tabela de preços em PDF?"
    ];
    await sock.sendMessage(from, { text: fallback[Math.floor(Math.random() * fallback.length)] });
  });
}

startBot();