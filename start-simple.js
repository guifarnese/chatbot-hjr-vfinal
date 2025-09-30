require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./app/database.js");
const SimpleChatbot = require("./app/chatbot-simple.js");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

// Initialize simple chatbot
const chatbot = new SimpleChatbot();
let client = null;
const processedMessages = new Set();

// Initialize system
async function initializeSystem() {
  console.log("🚀 Inicializando Chatbot Simples com IA...\n");

  try {
    // Initialize WhatsApp client
    console.log("📱 Inicializando WhatsApp...");
    await initializeWhatsApp();

    // Start Express server
    console.log("🌐 Iniciando servidor webhook...");
    setupWebhookServer();

    app.listen(PORT, () => {
      console.log(`✅ Webhook server running on port ${PORT}`);
      console.log("🎉 Chatbot Simples com IA inicializado com sucesso!");
      console.log("🤖 Funcionalidades disponíveis:");
      console.log("   • Fluxo sequencial simples");
      console.log("   • Transcrição de áudio");
      console.log("   • Análise inteligente de problemas");
      console.log("   • Triagem automática");
      console.log("   • Follow-up automático (3h inatividade)");
      console.log("   • Transferência para humano");
    });

    // Inicializar sistema de limpeza automática
    chatbot.startCleanupSystem();

  } catch (error) {
    console.error("❌ Erro na inicialização:", error.message);
    process.exit(1);
  }
}

// Initialize WhatsApp client
async function initializeWhatsApp() {
  return new Promise((resolve, reject) => {
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: "refriagro-bot"
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu"
        ]
      }
    });

    // Evento QR Code
    client.on("qr", (qr) => {
      console.log("📱 QR Code para autenticação:");
      qrcode.generate(qr, { small: true });
      console.log("\n📱 Escaneie o QR Code acima com seu WhatsApp");
    });

    // Evento autenticado
    client.on("authenticated", () => {
      console.log("🔐 WhatsApp autenticado com sucesso!");
    });

    // Evento ready - PRINCIPAL
    client.on("ready", () => {
      console.log("✅ WhatsApp conectado!");
      console.log("🤖 Chatbot ativo e pronto para receber mensagens!");
      console.log("📱 Informações do cliente:", {
        wid: client.info?.wid,
        pushname: client.info?.pushname
      });
      resolve();
    });

    // Evento de mudança de estado - para detectar quando está pronto
    client.on("change_state", (state) => {
      console.log("🔄 Estado do WhatsApp:", state);
      if (state === "CONNECTED") {
        console.log("✅ WhatsApp conectado via change_state!");
        if (!client.info) {
          // Aguardar um pouco para o info estar disponível
          setTimeout(() => {
            if (client.info) {
              console.log("🤖 Chatbot ativo e pronto para receber mensagens!");
              resolve();
            }
          }, 2000);
        } else {
          console.log("🤖 Chatbot ativo e pronto para receber mensagens!");
          resolve();
        }
      }
    });

    // Evento de falha na autenticação
    client.on("auth_failure", (msg) => {
      console.error("❌ Falha na autenticação WhatsApp:", msg);
      reject(new Error(`Falha na autenticação: ${msg}`));
    });

    // Evento desconectado
    client.on("disconnected", (reason) => {
      console.log("⚠️ WhatsApp desconectado:", reason);
    });

    // Evento de carregamento
    client.on("loading_screen", (percent, message) => {
      console.log(`📱 Carregando WhatsApp: ${percent}% - ${message}`);
    });

    // Evento de mudança de estado
    client.on("change_state", (state) => {
      console.log(`🔄 Estado do WhatsApp mudou para: ${state}`);
    });

    // Evento de mensagem
    client.on("message", async (msg) => {
      await handleMessage(msg);
    });

    // Timeout de 90 segundos com verificação adicional
    const timeout = setTimeout(() => {
      console.log("⏰ Timeout atingido, verificando se WhatsApp está funcionando...");

      // Verificar se o cliente está funcionando mesmo sem o evento ready
      if (client && client.info) {
        console.log("✅ WhatsApp está funcionando, assumindo que está pronto...");
        resolve();
      } else {
        reject(new Error("Timeout: WhatsApp não conectou em 90 segundos"));
      }
    }, 90000);

    // Limpar timeout quando ready for chamado
    client.once("ready", () => {
      clearTimeout(timeout);
    });

    // Inicializar WhatsApp
    client.initialize().catch((error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// Handle incoming messages
async function handleMessage(msg) {
  const rawNumber = msg.from;
  const messageText = msg.body;
  const numberE164 = `+${rawNumber.replace("@c.us", "")}`;

  // Ignore group messages
  if (msg.from.endsWith('@g.us')) {
    return;
  }

  // Ignore own messages
  if (msg.fromMe) {
    return;
  }

  // Check if we already responded to this message (avoid duplicates)
  const messageId = msg.id._serialized;
  if (processedMessages.has(messageId)) {
    return;
  }
  processedMessages.add(messageId);

  // Check if it's an image message
  if (msg.hasMedia && msg.type === 'image') {
    console.log(`📸 Imagem recebida de ${numberE164}`);
    await processMessageWithChatbot(numberE164, '[IMAGEM_ENVIADA]', msg);
    return;
  }

  // Check if it's an audio message
  if (msg.hasMedia && msg.type === 'ptt') {
    console.log(`🎵 Áudio recebido de ${numberE164}`);
    await processMessageWithChatbot(numberE164, '[AUDIO_ENVIADO]', msg);
    return;
  }

  // Ignore empty messages (only for text messages)
  if (!messageText || messageText.trim() === '') {
    return;
  }

  console.log(`📨 Nova mensagem de ${numberE164}: ${messageText}`);

  // Process message with simple chatbot
  await processMessageWithChatbot(numberE164, messageText, msg);
}

// Process message with simple chatbot
async function processMessageWithChatbot(whatsappNumber, messageText, msg) {
  try {
    // Get or create contact in database
    let contact = await getOrCreateContact(whatsappNumber);

    let botResponse = '';

    // Check if it's an audio message
    if (messageText === '[AUDIO_ENVIADO]' || (msg.hasMedia && msg.type === 'ptt')) {
      console.log('🎵 Mensagem de áudio detectada, processando...');

      try {
        const media = await msg.downloadMedia();
        if (media && media.data) {
          const audioBuffer = Buffer.from(media.data, 'base64');
          botResponse = await chatbot.processAudioMessage(whatsappNumber, audioBuffer, client);
        } else {
          botResponse = "Desculpe, não consegui processar o áudio. Pode enviar uma mensagem de texto?";
        }
      } catch (audioError) {
        console.error('❌ Erro ao processar áudio:', audioError.message);
        botResponse = "Desculpe, não consegui processar o áudio. Pode enviar uma mensagem de texto?";
      }
    } else {
      // Process text message - passar o cliente para envio ao técnico
      botResponse = await chatbot.processMessage(whatsappNumber, messageText, client);
    }

    console.log(`🤖 Resposta do bot: ${botResponse}`);

    const chatId = `${whatsappNumber.replace("+", "")}@c.us`;

    // Send response to WhatsApp
    await client.sendMessage(chatId, botResponse);

  } catch (error) {
    console.error('Error processing message with chatbot:', error);

    // Send error message to user
    const chatId = `${whatsappNumber.replace("+", "")}@c.us`;
    await client.sendMessage(chatId, "Desculpe, ocorreu um erro. Tente novamente em alguns instantes.");
  }
}

// Get or create contact in database
async function getOrCreateContact(whatsappNumber) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM contacts WHERE whatsapp_number = ?",
      [whatsappNumber],
      async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row) {
          resolve(row);
        } else {
          // Create new contact
          db.run(
            "INSERT INTO contacts (whatsapp_number, conversation_state) VALUES (?, ?)",
            [whatsappNumber, 'greeting'],
            function (err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  id: this.lastID,
                  whatsapp_number: whatsappNumber,
                  conversation_state: 'greeting'
                });
              }
            }
          );
        }
      }
    );
  });
}

// Setup webhook server
function setupWebhookServer() {
  app.post("/webhook", async (req, res) => {
    const payload = req.body;

    if (payload.message_type !== "outgoing") {
      return res.sendStatus(200);
    }

    if (payload.private === true) {
      return res.sendStatus(200);
    }

    const conversation = payload.conversation;
    const whatsappNumber =
      conversation.meta?.sender?.phone_number ||
      conversation.meta?.sender?.identifier;
    const messageContent = payload.content;

    if (whatsappNumber && messageContent) {
      const chatId = `${whatsappNumber.replace("+", "")}@c.us`;

      try {
        if (client) {
          await client.sendMessage(chatId, messageContent);
        } else {
          console.error("WhatsApp client is not ready yet.");
        }
      } catch (e) {
        console.error("Error sending message to WhatsApp:", e.message);
      }
    }

    res.sendStatus(200);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando Chatbot Simples...');
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

// Start the system
initializeSystem();
