require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

// Exported client for integration with other modules
let client = null;

// Track processed messages to avoid duplicates
const processedMessages = new Set();

// Track contacts that already received the fixed message
const contactsWithMessage = new Set();

// Track contacts that already received the follow-up message (to avoid spam)
const contactsWithFollowUp = new Set();

// Load fixed message from draft file
const FIXED_MESSAGE = fs.readFileSync(path.join(__dirname, "draft"), "utf8");

// Follow-up message for contacts who already received the main message (sent only once)
const FOLLOW_UP_MESSAGE = "📌 Todas as instruções já foram enviadas na mensagem anterior. Por favor, leia com atenção. Se tiver dúvidas, ligue para (31) 2128-6133.";


// Start WhatsApp client
function startWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
      headless: true, 
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu"
      ],
      executablePath: process.env.CHROME_PATH || undefined
    },
  });

  client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

  client.on("ready", () => {
    console.log("✅ Connected to WhatsApp!");
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ WhatsApp authentication failed:", msg);
  });

  client.on("disconnected", (reason) => {
    console.log("⚠️  WhatsApp disconnected:", reason);
  });

  client.on("message", async (msg) => {
    // Ignore group messages
    if (msg.from.endsWith('@g.us')) {
      console.log('Ignoring group message');
      return;
    }

    // Ignore own messages
    if (msg.fromMe) {
      console.log('Ignoring own message');
      return;
    }

    // Check if we already responded to this message (avoid duplicates)
    const messageId = msg.id._serialized;
    if (processedMessages.has(messageId)) {
      console.log('Message already processed, ignoring');
      return;
    }
    processedMessages.add(messageId);

    // Ignore messages with attachments (media, documents, audio, etc)
    if (msg.hasMedia) {
      console.log('📎 Message has media attachment, ignoring');
      return;
    }

    // Check if contact already received the main message
    const contactId = msg.from;

    try {
      if (contactsWithMessage.has(contactId)) {
        // Contact already received the message
        if (contactsWithFollowUp.has(contactId)) {
          // Already sent follow-up, don't respond anymore
          console.log(`🔇 Contact ${contactId} already received follow-up, ignoring further messages`);
          return;
        } else {
          // Send follow-up once
          console.log(`🔄 Contact ${contactId} already received message, sending follow-up (once)`);
          await client.sendMessage(contactId, FOLLOW_UP_MESSAGE);
          contactsWithFollowUp.add(contactId);
          console.log('✅ Follow-up message sent successfully');
        }
      } else {
        // First time contact, send main message
        console.log(`📨 Sending fixed message to ${contactId}`);
        await client.sendMessage(contactId, FIXED_MESSAGE);
        contactsWithMessage.add(contactId);
        console.log('✅ Main message sent successfully');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });

  client.initialize();
}

// Export functions and WhatsApp client instance
module.exports = {
  startWhatsApp,
  getClient: () => client,
};
