const db = require('./database.js');
const AIService = require('./ai-service.js');
const config = require('../config.js');

class SimpleChatbot {
  constructor() {
    this.states = {
      GREETING: 'greeting',
      ASKING_NAME: 'asking_name',
      ASKING_LOCATION: 'asking_location',
      SHOWING_MENU: 'showing_menu',
      ASKING_EQUIPMENT: 'asking_equipment',
      ASKING_PART_DETAILS: 'asking_part_details',
      REQUESTING_PHOTOS: 'requesting_photos',
      COLLECTING_DEFECT_INFO: 'collecting_defect_info',
      EXPLORING_PROBLEM: 'exploring_problem',
      COLLECTING_DETAILS: 'collecting_details',
      ANALYZING_PROBLEM: 'analyzing_problem',
      SHOWING_CONTACT_OPTIONS: 'showing_contact_options',
      HUMAN_TRANSFER: 'human_transfer',
      FOLLOWUP_INACTIVITY: 'followup_inactivity',
      FINISHED: 'finished'
    };

    this.conversations = new Map();
    this.activeSessions = new Set();
    this.aiService = new AIService();

    // Número do técnico da empresa
    this.TECHNICIAN_NUMBER = config.TECHNICIAN_NUMBER;
    // Número da empresa para contato
    this.COMPANY_PHONE = '31999917243';
    // Número do humano para transferência
    this.HUMAN_NUMBER = '31999917243';

    // Configurações de follow-up
    this.INACTIVITY_TIMEOUT = 3 * 60 * 60 * 1000; // 3 horas em millisegundos
    this.followupTimers = new Map(); // Armazenar timers de follow-up
    this.cleanupInterval = null; // Interval para limpeza automática
  }

  // Get conversation data
  getConversation(whatsappNumber) {
    if (!this.conversations.has(whatsappNumber)) {
      this.conversations.set(whatsappNumber, {
        state: this.states.GREETING,
        name: null,
        location: null,
        equipment: null,
        problemDescription: '',
        problemDetails: [],
        lastActivity: Date.now(),
        followUpQuestions: [],
        currentQuestionIndex: 0,
        // Dados específicos para peças
        partDetails: null,
        photosReceived: [],
        defectDescription: '',
        partRequestComplete: false
      });
    }
    return this.conversations.get(whatsappNumber);
  }

  // Check if session is active
  isSessionActive(whatsappNumber) {
    return this.activeSessions.has(whatsappNumber);
  }

  // Check if message is from human operator
  isFromHuman(whatsappNumber) {
    return whatsappNumber === this.HUMAN_NUMBER;
  }

  // Process human operator messages
  async processHumanMessage(whatsappNumber, message, client = null) {
    console.log(`👤 Processando mensagem do humano: "${message}"`);

    // Procurar conversas em transferência para humano
    let targetConversation = null;
    let targetNumber = null;

    for (const [number, conversation] of this.conversations) {
      if (conversation.state === this.states.HUMAN_TRANSFER && conversation.humanTransferred) {
        targetConversation = conversation;
        targetNumber = number;
        break;
      }
    }

    if (!targetConversation) {
      return "❌ Não há conversas em transferência para humano no momento.";
    }

    // Verificar comandos especiais
    const humanMessage = message.trim().toLowerCase();

    if (humanMessage === '/encerrar' || humanMessage === '/fim' || humanMessage === 'encerrar') {
      targetConversation.state = this.states.FINISHED;
      targetConversation.humanTransferred = false;

      // Enviar mensagem de finalização para o cliente
      if (client) {
        const customerChatId = `${targetNumber.replace("+", "")}@c.us`;
        const finalMessage = "✅ *Atendimento finalizado pelo atendente!*\n\n" +
          "Obrigado por escolher nossos serviços! Se precisar de mais alguma coisa, é só chamar!";
        await client.sendMessage(customerChatId, finalMessage);
      }

      return "✅ Atendimento finalizado com sucesso!";

    } else if (humanMessage === '/voltar' || humanMessage === '/bot') {
      targetConversation.state = this.states.SHOWING_CONTACT_OPTIONS;
      targetConversation.humanTransferred = false;

      // Enviar mensagem de retorno ao bot para o cliente
      if (client) {
        const customerChatId = `${targetNumber.replace("+", "")}@c.us`;
        const returnMessage = "🤖 *Retornando ao bot...*\n\n" +
          "Precisa de mais alguma coisa? Você pode:\n\n" +
          `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
          `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
          `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
          `Digite o número da opção desejada.`;
        await client.sendMessage(customerChatId, returnMessage);
      }

      return "🤖 Cliente retornado ao bot com sucesso!";

    } else {
      // Mensagem normal do humano - encaminhar para o cliente
      if (client) {
        const customerChatId = `${targetNumber.replace("+", "")}@c.us`;
        const customerName = targetConversation.name || 'Cliente';
        const humanResponse = `👤 *${customerName}, nosso atendente responde:*\n\n${message}`;
        await client.sendMessage(customerChatId, humanResponse);
        console.log(`📤 Resposta do humano encaminhada para: ${targetNumber}`);
      }

      return "✅ Resposta enviada para o cliente!";
    }
  }

  // Start session
  startSession(whatsappNumber) {
    this.activeSessions.add(whatsappNumber);
    console.log(`🔒 Sessão iniciada para ${whatsappNumber}`);
  }

  // End session
  endSession(whatsappNumber) {
    this.activeSessions.delete(whatsappNumber);
    console.log(`🔓 Sessão finalizada para ${whatsappNumber}`);
  }

  // Save conversation to database
  async saveToDatabase(whatsappNumber, conversation) {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT OR REPLACE INTO contacts (whatsapp_number, demand_summary) VALUES (?, ?)",
        [whatsappNumber, JSON.stringify(conversation)],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Generate technician message
  generateTechnicianMessage(customerInfo, serviceType, equipment, problemDescription = '', problemDetails = [], problemAnalysis = '', partDetails = '', defectDescription = '') {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let message = `🔧 *NOVA DEMANDA TÉCNICA* 🔧

📅 Data: ${currentDate} às ${currentTime}

👤 *CLIENTE:*
• Nome: ${customerInfo.name}
• Endereço: ${customerInfo.location}
• WhatsApp: ${customerInfo.whatsappNumber}

📋 *TIPO DE SERVIÇO:*
${serviceType}

🔧 *EQUIPAMENTO:*
${equipment || 'Não informado'}`;

    // Adicionar informações específicas para manutenção/defeito
    if (serviceType === 'manutenção/defeito' && problemDescription) {
      message += `

🔍 *PROBLEMA REPORTADO:*
${problemDescription}

📋 *DETALHES COLETADOS:*
${problemDetails.map((detail, index) => `${index + 1}. ${detail}`).join('\n')}

🧠 *ANÁLISE INTELIGENTE:*
${problemAnalysis}`;
    }

    // Adicionar informações específicas para peças
    if (serviceType === 'peças' && partDetails) {
      message += `

🔧 *DETALHES DA PEÇA:*
${partDetails}

🔍 *DESCRIÇÃO DO DEFEITO:*
${defectDescription}

📸 *FOTO SOLICITADA:* Cliente foi orientado a enviar foto da peça danificada`;
    }

    // Ação específica baseada no tipo de serviço
    if (serviceType === 'peças') {
      message += `

✅ *AÇÃO REQUERIDA:*
Entrar em contato com o cliente para:
• Confirmar identificação da peça
• Enviar orçamento
• Agendar entrega/instalação se necessário

📸 *IMPORTANTE:* Solicitar foto da peça se ainda não recebida`;
    } else {
      message += `

✅ *AÇÃO REQUERIDA:*
Entrar em contato com o cliente para agendar visita técnica.`;
    }

    message += `

---
*Sistema Automático - RefriAgro*
`;

    return message;
  }

  // Send message to technician
  async sendToTechnician(client, message) {
    try {
      const technicianChatId = `${this.TECHNICIAN_NUMBER.replace("+", "")}@c.us`;
      await client.sendMessage(technicianChatId, message);
      console.log(`📤 Mensagem enviada para o técnico: ${this.TECHNICIAN_NUMBER}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem para técnico:', error.message);
      return false;
    }
  }

  // Process audio message
  async processAudioMessage(whatsappNumber, audioBuffer, client = null) {
    try {
      console.log('🎵 Processando mensagem de áudio...');
      const transcription = await this.aiService.transcribeAudio(audioBuffer);

      console.log(`🎵 Transcrição do áudio: "${transcription}"`);

      // Processar a transcrição como uma mensagem normal
      return await this.processMessage(whatsappNumber, transcription, client);

    } catch (error) {
      console.error('❌ Erro ao processar áudio:', error.message);
      return "Desculpe, não consegui entender o áudio. Pode enviar uma mensagem de texto?";
    }
  }

  // Process message and return response
  async processMessage(whatsappNumber, message, client = null) {
    // Verificar se a mensagem é do humano e se há conversas em transferência
    if (this.isFromHuman(whatsappNumber)) {
      return await this.processHumanMessage(whatsappNumber, message, client);
    }

    // Verificar se já existe uma sessão ativa
    if (this.isSessionActive(whatsappNumber)) {
      console.log(`⚠️ Sessão já ativa para ${whatsappNumber}, aguardando...`);
      return "⏳ Aguarda aí um pouquinho, estou vendo sua mensagem anterior...";
    }

    // Iniciar sessão
    this.startSession(whatsappNumber);

    try {
      const conversation = this.getConversation(whatsappNumber);

      console.log(`📨 Processando mensagem de ${whatsappNumber}: "${message}"`);
      console.log(`📊 Estado atual: ${conversation.state}`);

      let response = '';

      switch (conversation.state) {
        case this.states.GREETING:
          // Primeira mensagem - perguntar nome
          conversation.state = this.states.ASKING_NAME;
          response = "Oi! Eu sou o RefriagroBot, o assistente da Refriagro! Como posso te ajudar hoje? Para começar, me fala seu nome, por favor?";
          break;

        case this.states.ASKING_NAME:
          // Armazenar nome e perguntar localização
          conversation.name = message.trim();
          conversation.state = this.states.ASKING_LOCATION;
          response = `Obrigado, ${conversation.name}! Agora preciso saber onde você mora. Pode me falar seu endereço completo? Inclui aí o bairro ou fazenda e a cidade.`;
          console.log(`✅ Nome armazenado: ${conversation.name}`);
          break;

        case this.states.ASKING_LOCATION:
          // Armazenar localização e mostrar menu
          conversation.location = message.trim();
          conversation.state = this.states.SHOWING_MENU;
          response = `${conversation.name}, obrigado pelas informações! Qual serviço você precisa?\n\n` +
            `1️⃣ *Peças* - Preciso de peças para meu equipamento\n` +
            `2️⃣ *Problema/Defeito* - Meu equipamento tá com problema\n` +
            `3️⃣ *Revisão* - Quero agendar uma revisão`;
          console.log(`✅ Localização armazenada: ${conversation.location}`);
          break;

        case this.states.SHOWING_MENU:
          // Verificar escolha
          const choice = message.trim().toLowerCase();
          if (choice.includes('1') || choice.includes('peça')) {
            conversation.serviceType = 'peças';
            conversation.state = this.states.ASKING_PART_DETAILS;
            response = "Entendi! Você precisa de peças. Para te ajudar melhor, me conta:\n\n" +
              "🔧 *Qual equipamento você tem?* (tipo e marca)\n" +
              "🔧 *Qual peça está com problema?*\n\n" +
              "Pode me falar essas informações, por favor?";
          } else if (choice.includes('2') || choice.includes('defeito') || choice.includes('problema')) {
            conversation.serviceType = 'manutenção/defeito';
            conversation.state = this.states.EXPLORING_PROBLEM;
            response = `Entendi, ${conversation.name}! Vou te ajudar a resolver isso.\n\n` +
              `🔍 *Me conta qual é o problema do seu equipamento.*\n\n` +
              `Você pode:\n` +
              `• Escrever uma mensagem\n` +
              `• Enviar um áudio explicando o problema`;
          } else if (choice.includes('3') || choice.includes('revisão') || choice.includes('revisao')) {
            conversation.serviceType = 'manutenção/revisão';
            conversation.state = this.states.ASKING_EQUIPMENT;
            response = "Qual equipamento você quer agendar para revisão? Me fala o tipo e a marca, por favor.";
          } else {
            // Se não escolheu opção válida, mostrar menu novamente
            response = "Por favor, escolha uma opção:\n\n" +
              `1️⃣ *Peças* - Preciso de peças para meu equipamento\n` +
              `2️⃣ *Problema/Defeito* - Meu equipamento tá com problema\n` +
              `3️⃣ *Revisão* - Quero agendar uma revisão`;
            break;
          }
          console.log(`✅ Serviço escolhido: ${conversation.serviceType}`);
          break;

        case this.states.ASKING_PART_DETAILS:
          // Coletar detalhes da peça
          conversation.partDetails = message.trim();
          conversation.state = this.states.REQUESTING_PHOTOS;

          response = `Obrigado pelas informações! Agora preciso de uma foto da peça danificada para te ajudar melhor.\n\n` +
            `📸 *Por favor, envie uma foto da peça que está com problema.*\n\n` +
            `A foto vai ajudar nossa equipe a:\n` +
            `• Identificar a peça correta\n` +
            `• Ver o tipo de defeito\n` +
            `• Preparar o orçamento\n\n` +
            `Pode enviar a foto agora?`;

          console.log(`✅ Detalhes da peça armazenados: ${conversation.partDetails}`);
          break;

        case this.states.REQUESTING_PHOTOS:
          // Verificar se é uma imagem enviada
          if (message === '[IMAGEM_ENVIADA]') {
            // Usuário enviou uma imagem
            conversation.photosReceived = true;
            conversation.state = this.states.COLLECTING_DEFECT_INFO;
            response = `✅ Perfeito! Recebi a foto da peça. Agora me conta mais detalhes sobre o defeito:\n\n` +
              `🔍 *Como você percebeu que a peça está com problema?*\n` +
              `🔍 *O que acontece quando você usa o equipamento?*\n` +
              `🔍 *Há quanto tempo começou o problema?*\n\n` +
              `Pode me explicar o que está acontecendo?`;
          } else if (message.toLowerCase().includes('foto') || message.toLowerCase().includes('imagem')) {
            // Usuário mencionou foto mas não enviou - pedir novamente
            response = `📸 Por favor, envie a foto da peça danificada. É só clicar no ícone da câmera ou anexar uma imagem.\n\n` +
              `A foto é muito importante para identificarmos a peça correta!`;
          } else {
            // Usuário enviou texto - assumir que não tem foto e continuar
            conversation.state = this.states.COLLECTING_DEFECT_INFO;
            response = `Entendi! Sem problemas se não conseguir enviar foto agora.\n\n` +
              `Agora me conta mais detalhes sobre o defeito:\n\n` +
              `🔍 *Como você percebeu que a peça está com problema?*\n` +
              `🔍 *O que acontece quando você usa o equipamento?*\n` +
              `🔍 *Há quanto tempo começou o problema?*\n\n` +
              `Pode me explicar o que está acontecendo?`;
          }
          break;

        case this.states.COLLECTING_DEFECT_INFO:
          // Coletar informações do defeito
          conversation.defectDescription = message.trim();
          conversation.partRequestComplete = true;
          conversation.state = this.states.SHOWING_CONTACT_OPTIONS;

          // Salvar no banco de dados
          await this.saveToDatabase(whatsappNumber, conversation);

          // Enviar mensagem para o técnico
          if (client) {
            const technicianMessage = this.generateTechnicianMessage(
              {
                name: conversation.name,
                location: conversation.location,
                whatsappNumber: whatsappNumber
              },
              conversation.serviceType,
              conversation.equipment,
              conversation.problemDescription,
              conversation.problemDetails,
              '',
              conversation.partDetails,
              conversation.defectDescription
            );

            await this.sendToTechnician(client, technicianMessage);
          }

          response = `✅ *Solicitação de peça registrada com sucesso!*\n\n` +
            `📋 *Resumo da solicitação:*\n` +
            `• Equipamento: ${conversation.partDetails}\n` +
            `• Defeito: ${conversation.defectDescription}\n\n` +
            `Nossa equipe está analisando sua solicitação e vai entrar em contato em breve com o orçamento.\n\n` +
            `Precisa de mais alguma coisa? Você pode:\n\n` +
            `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
            `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
            `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
            `Digite o número da opção desejada.`;

          console.log(`✅ Solicitação de peça completa registrada`);
          break;

        case this.states.EXPLORING_PROBLEM:
          // Coletar descrição inicial do problema
          conversation.problemDescription = message.trim();

          console.log(`📝 Descrição do problema: ${conversation.problemDescription}`);

          try {
            // Gerar perguntas de follow-up diretamente
            const questions = await this.aiService.generateFollowUpQuestions(
              conversation.problemDescription,
              { name: conversation.name, location: conversation.location }
            );

            conversation.followUpQuestions = questions;
            conversation.currentQuestionIndex = 0;
            conversation.state = this.states.COLLECTING_DETAILS;

            const nextQuestion = questions[0];
            response = `Obrigado por me contar! Agora preciso de alguns detalhes:\n\n` +
              `❓ *${nextQuestion}*`;

            console.log(`🤖 Próxima pergunta: ${nextQuestion}`);
          } catch (error) {
            console.error('❌ Erro ao gerar perguntas:', error.message);
            // Em caso de erro, gerar perguntas padrão
            conversation.followUpQuestions = [
              "Quando você notou o problema pela primeira vez?",
              "O equipamento faz algum barulho estranho?",
              "Você já tentou alguma solução?",
              "O problema acontece o tempo todo ou intermitentemente?"
            ];
            conversation.currentQuestionIndex = 0;
            conversation.state = this.states.COLLECTING_DETAILS;

            const nextQuestion = conversation.followUpQuestions[0];
            response = `Obrigado por me contar! Agora preciso de alguns detalhes:\n\n` +
              `❓ *${nextQuestion}*`;

            console.log(`🤖 Próxima pergunta (padrão): ${nextQuestion}`);
          }
          break;

        case this.states.COLLECTING_DETAILS:
          // Verificar se o cliente quer pular as perguntas
          const skipChoice = message.trim().toLowerCase();
          if (skipChoice === '2' || skipChoice.includes('pular') || skipChoice.includes('pular perguntas')) {
            // Cliente quer pular perguntas e ir direto para análise
            conversation.state = this.states.ANALYZING_PROBLEM;
            const fullDescription = `${conversation.problemDescription}\n\nDetalhes adicionais:\n${conversation.problemDetails.join('\n')}`;

            try {
              const analysis = await this.aiService.analyzeProblem(fullDescription, {
                name: conversation.name,
                location: conversation.location
              });

              conversation.problemAnalysis = analysis;
              conversation.state = this.states.SHOWING_CONTACT_OPTIONS;

              // Salvar no banco de dados
              await this.saveToDatabase(whatsappNumber, conversation);

              // Enviar mensagem para o técnico
              if (client) {
                const technicianMessage = this.generateTechnicianMessage(
                  {
                    name: conversation.name,
                    location: conversation.location,
                    whatsappNumber: whatsappNumber
                  },
                  conversation.serviceType,
                  conversation.equipment,
                  conversation.problemDescription,
                  conversation.problemDetails,
                  analysis
                );

                await this.sendToTechnician(client, technicianMessage);
              }

              response = `✅ *Demanda registrada com sucesso!*\n\n` +
                `Nossa equipe técnica está vendo sua solicitação e vai entrar em contato em breve para marcar a data e horário do atendimento.\n\n` +
                `Precisa de mais alguma coisa? Você pode:\n\n` +
                `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
                `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
                `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
                `Digite o número da opção desejada.`;

              console.log(`✅ Análise concluída e demanda registrada`);
            } catch (error) {
              console.error('❌ Erro na análise:', error.message);
              response = `✅ *Demanda registrada com sucesso!*\n\n` +
                `Problema: ${conversation.problemDescription}\n` +
                `Detalhes: ${conversation.problemDetails.join(', ')}\n\n` +
                `Nossa equipe técnica está vendo sua solicitação e vai entrar em contato em breve para marcar a data e horário do atendimento.\n\n` +
                `Precisa de mais alguma coisa? Você pode:\n\n` +
                `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
                `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
                `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
                `Digite o número da opção desejada.`;

              conversation.state = this.states.SHOWING_CONTACT_OPTIONS;
              await this.saveToDatabase(whatsappNumber, conversation);
            }
            break;
          }

          // Coletar respostas das perguntas de follow-up
          conversation.problemDetails.push(message.trim());

          console.log(`📝 Detalhes coletados: ${conversation.problemDetails.join(', ')}`);

          // Verificar se ainda há perguntas
          if (conversation.currentQuestionIndex < conversation.followUpQuestions.length - 1) {
            conversation.currentQuestionIndex++;
            const nextQuestion = conversation.followUpQuestions[conversation.currentQuestionIndex];

            response = `❓ *${nextQuestion}*`;
            console.log(`🤖 Próxima pergunta: ${nextQuestion}`);

          } else {
            // Todas as perguntas respondidas, analisar problema
            conversation.state = this.states.ANALYZING_PROBLEM;

            const fullDescription = `${conversation.problemDescription}\n\nDetalhes adicionais:\n${conversation.problemDetails.join('\n')}`;

            try {
              const analysis = await this.aiService.analyzeProblem(fullDescription, {
                name: conversation.name,
                location: conversation.location
              });

              conversation.problemAnalysis = analysis;
              conversation.state = this.states.SHOWING_CONTACT_OPTIONS;

              // Salvar no banco de dados
              await this.saveToDatabase(whatsappNumber, conversation);

              // Enviar mensagem para o técnico
              if (client) {
                const technicianMessage = this.generateTechnicianMessage(
                  {
                    name: conversation.name,
                    location: conversation.location,
                    whatsappNumber: whatsappNumber
                  },
                  conversation.serviceType,
                  conversation.equipment,
                  conversation.problemDescription,
                  conversation.problemDetails,
                  analysis
                );

                await this.sendToTechnician(client, technicianMessage);
              }

              response = `✅ *Demanda registrada com sucesso!*\n\n` +
                `Nossa equipe técnica está vendo sua solicitação e vai entrar em contato em breve para marcar a data e horário do atendimento.\n\n` +
                `Precisa de mais alguma coisa? Você pode:\n\n` +
                `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
                `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
                `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
                `Digite o número da opção desejada.`;

              console.log(`✅ Análise concluída e demanda registrada`);
            } catch (error) {
              console.error('❌ Erro na análise:', error.message);
              response = `✅ *Demanda registrada com sucesso!*\n\n` +
                `Problema: ${conversation.problemDescription}\n` +
                `Detalhes: ${conversation.problemDetails.join(', ')}\n\n` +
                `Nossa equipe técnica está vendo sua solicitação e vai entrar em contato em breve para marcar a data e horário do atendimento.\n\n` +
                `Precisa de mais alguma coisa? Você pode:\n\n` +
                `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
                `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
                `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
                `Digite o número da opção desejada.`;

              conversation.state = this.states.SHOWING_CONTACT_OPTIONS;
              await this.saveToDatabase(whatsappNumber, conversation);
            }
          }
          break;

        case this.states.ASKING_EQUIPMENT:
          // Armazenar informações do equipamento e finalizar
          conversation.equipment = message.trim();
          conversation.state = this.states.SHOWING_CONTACT_OPTIONS;

          // Salvar no banco de dados
          await this.saveToDatabase(whatsappNumber, conversation);

          // Enviar mensagem para o técnico
          if (client) {
            const technicianMessage = this.generateTechnicianMessage(
              {
                name: conversation.name,
                location: conversation.location,
                whatsappNumber: whatsappNumber
              },
              conversation.serviceType,
              conversation.equipment
            );

            await this.sendToTechnician(client, technicianMessage);
          }

          response = "✅ *Demanda registrada com sucesso!*\n\n" +
            "Nossa equipe está vendo sua solicitação e vai entrar em contato em breve para marcar a data e horário do atendimento.\n\n" +
            "Precisa de mais alguma coisa? Você pode:\n\n" +
            `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
            `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
            `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
            `Digite o número da opção desejada.`;
          console.log(`✅ Equipamento armazenado: ${conversation.equipment}`);
          console.log(`✅ Conversa finalizada para ${whatsappNumber}`);
          break;

        case this.states.ANALYZING_PROBLEM:
          // Estado temporário durante análise
          response = "🔍 Analisando seu problema... Aguarda aí um pouquinho.";
          break;

        case this.states.SHOWING_CONTACT_OPTIONS:
          // Processar opções de contato
          const contactChoice = message.trim().toLowerCase();
          console.log(`🔍 Processando escolha de contato: "${contactChoice}"`);
          if (contactChoice.includes('1') || contactChoice.includes('ligar') || contactChoice.includes('telefone')) {
            conversation.state = this.states.FINISHED;
            response = `📞 *Informações para contato:*\n\n` +
              `Para falar com nossa equipe, ligue para:\n` +
              `📱 *${this.COMPANY_PHONE}*\n\n` +
              `Horário de atendimento:\n` +
              `🕐 Segunda a Sexta: 8h às 18h\n` +
              `🕐 Sábado: 8h às 12h\n\n` +
              `Obrigado por escolher nossos serviços!`;
          } else if (contactChoice.includes('2') || contactChoice.includes('humano') || contactChoice.includes('atendente')) {
            conversation.state = this.states.HUMAN_TRANSFER;
            conversation.humanTransferred = true;
            console.log(`✅ Transferindo para humano - Estado: ${conversation.state}`);
            response = `👤 *Transferindo para atendente humano...*\n\n` +
              `Agora você está falando com um de nossos atendentes. Pode fazer suas perguntas normalmente.\n\n` +
              `*Comandos disponíveis para o atendente:*\n` +
              `• Digite "/encerrar" para finalizar o atendimento\n` +
              `• Digite "/voltar" para retornar ao bot`;
          } else if (contactChoice.includes('3') || contactChoice.includes('finalizar') || contactChoice.includes('encerrar')) {
            conversation.state = this.states.FINISHED;
            response = "✅ *Atendimento finalizado!*\n\n" +
              "Obrigado por escolher nossos serviços! Se precisar de mais alguma coisa, é só chamar!";
          } else {
            // Opção inválida, mostrar menu novamente
            response = "Por favor, escolha uma opção:\n\n" +
              `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
              `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
              `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
              `Digite o número da opção desejada.`;
          }
          break;

        case this.states.HUMAN_TRANSFER:
          // Mensagem do cliente - encaminhar para o humano
          if (client) {
            const customerInfo = conversation.name ? `${conversation.name} (${whatsappNumber})` : whatsappNumber;
            const humanMessage = `👤 *Mensagem do cliente ${customerInfo}:*\n\n${message}`;

            try {
              const humanChatId = `${this.HUMAN_NUMBER.replace("+", "")}@c.us`;
              await client.sendMessage(humanChatId, humanMessage);
              console.log(`📤 Mensagem do cliente encaminhada para o humano: ${this.HUMAN_NUMBER}`);
            } catch (error) {
              console.error('❌ Erro ao encaminhar mensagem para humano:', error.message);
            }
          }

          response = "✅ Sua mensagem foi enviada para nosso atendente. Aguarde a resposta.";
          break;

        case this.states.FOLLOWUP_INACTIVITY:
          // Processar resposta do follow-up de inatividade
          const followupChoice = message.trim().toLowerCase();
          if (followupChoice.includes('1') || followupChoice.includes('continuar') || followupChoice.includes('voltar')) {
            // Cliente quer continuar - voltar ao estado anterior
            conversation.state = conversation.previousState || this.states.SHOWING_CONTACT_OPTIONS;
            conversation.followupSent = false;
            this.cancelFollowupTimer(whatsappNumber);

            // Continuar de onde parou
            if (conversation.state === this.states.ASKING_PART_DETAILS) {
              response = "✅ *Ótimo! Vamos continuar o atendimento.*\n\n" +
                "Entendi! Você precisa de peças. Para te ajudar melhor, me conta:\n\n" +
                "🔧 *Qual equipamento você tem?* (tipo e marca)\n" +
                "🔧 *Qual peça está com problema?*\n\n" +
                "Pode me falar essas informações, por favor?";
            } else if (conversation.state === this.states.EXPLORING_PROBLEM) {
              response = "✅ *Ótimo! Vamos continuar o atendimento.*\n\n" +
                "🔍 *Me conta qual é o problema do seu equipamento.*\n\n" +
                "Você pode:\n" +
                "• Escrever uma mensagem\n" +
                "• Enviar um áudio explicando o problema";
            } else {
              response = "✅ *Ótimo! Vamos continuar o atendimento.*\n\n" +
                "Precisa de mais alguma coisa? Você pode:\n\n" +
                `1️⃣ *Ligar para o escritório* - ${this.COMPANY_PHONE}\n` +
                `2️⃣ *Transferir para humano* - Falar com um atendente\n` +
                `3️⃣ *Finalizar* - Encerrar o atendimento\n\n` +
                `Digite o número da opção desejada.`;
            }
          } else if (followupChoice.includes('2') || followupChoice.includes('encerrar') || followupChoice.includes('finalizar')) {
            // Cliente quer encerrar
            conversation.state = this.states.FINISHED;
            conversation.followupSent = false;
            this.cancelFollowupTimer(whatsappNumber);

            response = "✅ *Atendimento encerrado!*\n\n" +
              "Obrigado por escolher nossos serviços! Se precisar de mais alguma coisa, é só chamar!";
          } else {
            // Opção inválida, mostrar menu novamente
            response = "Por favor, escolha uma opção:\n\n" +
              `1️⃣ *Continuar o atendimento* - Voltar para onde paramos\n` +
              `2️⃣ *Encerrar por agora* - Finalizar o atendimento\n\n` +
              `Digite o número da opção desejada.`;
          }
          break;

        case this.states.FINISHED:
          // Conversa já finalizada - verificar se cliente quer nova conversa
          const messageLower = message.trim().toLowerCase();
          if (messageLower.includes('oi') || messageLower.includes('olá') || messageLower.includes('iniciar') || messageLower.includes('nova conversa')) {
            console.log(`🔄 Cliente quer nova conversa, resetando...`);
            this.resetConversation(whatsappNumber);
            const newConversation = this.getConversation(whatsappNumber);
            newConversation.state = this.states.GREETING;
            response = "Oi! Eu sou o RefriagroBot, o assistente da Refriagro! Como posso te ajudar hoje? Para começar, me fala seu nome, por favor?";
          } else {
            response = "✅ *Atendimento finalizado!*\n\n" +
              "Obrigado por escolher nossos serviços! Se precisar de mais alguma coisa, é só chamar!\n\n" +
              "Para iniciar uma nova conversa, digite 'oi' ou 'olá'.";
          }
          break;

        default:
          response = "Como posso te ajudar hoje?";
          break;
      }

      // Atualizar timestamp da última atividade
      conversation.lastActivity = Date.now();

      // Gerenciar timers de follow-up baseado no estado
      this.manageFollowupTimers(whatsappNumber, conversation, client);

      // Salvar conversa atualizada
      this.conversations.set(whatsappNumber, conversation);

      console.log(`🤖 Resposta: ${response.substring(0, 50)}...`);
      return response;

    } finally {
      // Finalizar sessão após processamento
      this.endSession(whatsappNumber);
    }
  }

  // Reset conversation
  resetConversation(whatsappNumber) {
    this.conversations.delete(whatsappNumber);
    this.activeSessions.delete(whatsappNumber);
    this.cancelFollowupTimer(whatsappNumber);
    console.log(`🔄 Conversa resetada para ${whatsappNumber}`);
  }

  // Get active sessions count
  getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  // Start follow-up timer for inactive conversation
  startFollowupTimer(whatsappNumber, client) {
    // Cancelar timer existente se houver
    this.cancelFollowupTimer(whatsappNumber);

    console.log(`⏰ Iniciando timer de follow-up para ${whatsappNumber} (3 horas)`);

    const timer = setTimeout(async () => {
      await this.sendFollowupMessage(whatsappNumber, client);
    }, this.INACTIVITY_TIMEOUT);

    this.followupTimers.set(whatsappNumber, timer);
  }

  // Cancel follow-up timer
  cancelFollowupTimer(whatsappNumber) {
    if (this.followupTimers.has(whatsappNumber)) {
      clearTimeout(this.followupTimers.get(whatsappNumber));
      this.followupTimers.delete(whatsappNumber);
      console.log(`❌ Timer de follow-up cancelado para ${whatsappNumber}`);
    }
  }

  // Send follow-up message for inactivity
  async sendFollowupMessage(whatsappNumber, client) {
    try {
      const conversation = this.conversations.get(whatsappNumber);
      if (!conversation || conversation.state === this.states.FINISHED) {
        return;
      }

      console.log(`📞 Enviando follow-up de inatividade para ${whatsappNumber}`);

      // Salvar estado anterior antes de enviar follow-up
      conversation.previousState = conversation.state;

      // Atualizar estado para follow-up
      conversation.state = this.states.FOLLOWUP_INACTIVITY;
      conversation.followupSent = true;

      const customerName = conversation.name || 'Cliente';
      const followupMessage = `👋 *Oi ${customerName}!*\n\n` +
        `Notei que você não respondeu há um tempo. Tudo bem por aí?\n\n` +
        `Você gostaria de:\n\n` +
        `1️⃣ *Continuar o atendimento* - Voltar para onde paramos\n` +
        `2️⃣ *Encerrar por agora* - Finalizar o atendimento\n\n` +
        `Digite o número da opção desejada.`;

      if (client) {
        const chatId = `${whatsappNumber.replace("+", "")}@c.us`;
        await client.sendMessage(chatId, followupMessage);
        console.log(`✅ Follow-up enviado para ${whatsappNumber}`);
      }

      // Iniciar novo timer para limpeza automática (24 horas)
      setTimeout(() => {
        this.cleanupInactiveConversation(whatsappNumber);
      }, 24 * 60 * 60 * 1000); // 24 horas

    } catch (error) {
      console.error(`❌ Erro ao enviar follow-up para ${whatsappNumber}:`, error.message);
    }
  }

  // Clean up inactive conversation
  cleanupInactiveConversation(whatsappNumber) {
    const conversation = this.conversations.get(whatsappNumber);
    if (conversation && conversation.state === this.states.FOLLOWUP_INACTIVITY) {
      console.log(`🧹 Limpando conversa inativa: ${whatsappNumber}`);
      this.conversations.delete(whatsappNumber);
      this.activeSessions.delete(whatsappNumber);
      this.cancelFollowupTimer(whatsappNumber);
    }
  }

  // Start automatic cleanup system
  startCleanupSystem() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Limpeza a cada 1 hora
    this.cleanupInterval = setInterval(() => {
      this.performPeriodicCleanup();
    }, 60 * 60 * 1000);

    console.log('🧹 Sistema de limpeza automática iniciado');
  }

  // Perform periodic cleanup
  performPeriodicCleanup() {
    const now = Date.now();
    const maxInactiveTime = 7 * 24 * 60 * 60 * 1000; // 7 dias

    for (const [whatsappNumber, conversation] of this.conversations) {
      const timeSinceLastActivity = now - conversation.lastActivity;

      if (timeSinceLastActivity > maxInactiveTime) {
        console.log(`🧹 Limpando conversa antiga: ${whatsappNumber}`);
        this.conversations.delete(whatsappNumber);
        this.activeSessions.delete(whatsappNumber);
        this.cancelFollowupTimer(whatsappNumber);
      }
    }
  }

  // Manage follow-up timers based on conversation state
  manageFollowupTimers(whatsappNumber, conversation, client) {
    // Estados que precisam de follow-up se ficarem inativos
    const statesNeedingFollowup = [
      this.states.ASKING_NAME,
      this.states.ASKING_LOCATION,
      this.states.SHOWING_MENU,
      this.states.ASKING_EQUIPMENT,
      this.states.ASKING_PART_DETAILS,
      this.states.REQUESTING_PHOTOS,
      this.states.COLLECTING_DEFECT_INFO,
      this.states.EXPLORING_PROBLEM,
      this.states.COLLECTING_DETAILS,
      this.states.ANALYZING_PROBLEM,
      this.states.SHOWING_CONTACT_OPTIONS,
      this.states.HUMAN_TRANSFER
    ];

    // Estados que não precisam de follow-up
    const statesNotNeedingFollowup = [
      this.states.FINISHED,
      this.states.FOLLOWUP_INACTIVITY
    ];

    if (statesNeedingFollowup.includes(conversation.state)) {
      // Iniciar timer de follow-up se não estiver em follow-up
      if (!conversation.followupSent) {
        this.startFollowupTimer(whatsappNumber, client);
      }
    } else if (statesNotNeedingFollowup.includes(conversation.state)) {
      // Cancelar timer se estiver em estado final
      this.cancelFollowupTimer(whatsappNumber);
    }
  }
}

module.exports = SimpleChatbot;
