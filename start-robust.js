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
    let isReady = false;
    let isAuthenticated = false;

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
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor"
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
      isAuthenticated = true;
    });

    // Evento ready - PRINCIPAL
    client.on("ready", () => {
      console.log("✅ WhatsApp conectado!");
      console.log("🤖 Chatbot ativo e pronto para receber mensagens!");
      isReady = true;
      resolve();
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

    // Timeout de 90 segundos
    const timeout = setTimeout(() => {
      if (!isReady) {
        console.log("⏰ Timeout atingido, mas continuando...");
        console.log("🔍 Verificando se WhatsApp está funcionando...");
        
        // Verificar se o cliente está funcionando mesmo sem o evento ready
        if (isAuthenticated) {
          console.log("✅ WhatsApp autenticado, assumindo que está pronto...");
          resolve();
        } else {
          reject(new Error("Timeout: WhatsApp não conectou em 90 segundos"));
        }
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

  try {
    console.log(`📨 Nova mensagem de ${numberE164}: "${messageText}"`);
    
    // Process message with chatbot
    const response = await chatbot.processMessage(numberE164, messageText, client);
    
    if (response) {
      await msg.reply(response);
      console.log(`🤖 Resposta enviada para ${numberE164}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar mensagem de ${numberE164}:`, error.message);
    await msg.reply("Desculpe, ocorreu um erro. Tente novamente em alguns instantes.");
  }
}

// Setup webhook server
function setupWebhookServer() {
  app.get("/", (req, res) => {
    res.json({
      status: "online",
      message: "RefriagroBot WhatsApp está funcionando!",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      whatsapp: client ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  });

  app.post("/webhook", (req, res) => {
    console.log("📥 Webhook recebido:", req.body);
    res.json({ status: "received" });
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando chatbot...');
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando chatbot...');
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

// Start the system
initializeSystem().catch(console.error);
