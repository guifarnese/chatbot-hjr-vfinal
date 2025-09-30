const axios = require('axios');
const FormData = require('form-data');

class AIAssistant {
  constructor() {
    this.apiKey = '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';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async generateResponse(context, userMessage, conversationState) {
    try {
      const systemPrompt = this.buildSystemPrompt(context, conversationState);
      
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro na API do ChatGPT:', error.message);
      return this.getFallbackResponse(conversationState, context);
    }
  }

  // Transcreve áudio com Whisper
  async transcribeAudio(media) {
    try {
      console.log('🎙️ Iniciando transcrição de áudio...');
      
      if (!media || !media.data) {
        console.error('❌ Dados de mídia inválidos');
        return '';
      }
      
      const audioBuffer = Buffer.from(media.data, 'base64');
      console.log(`📊 Tamanho do buffer de áudio: ${audioBuffer.length} bytes`);
      
      const form = new FormData();
      form.append('model', 'whisper-1');
      form.append('language', 'pt');
      form.append('temperature', '0');
      form.append('file', audioBuffer, {
        filename: 'audio.ogg',
        contentType: media.mimetype || 'audio/ogg'
      });

      console.log('📤 Enviando para API Whisper...');
      
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...form.getHeaders()
        },
        timeout: 30000 // 30 segundos de timeout
      });

      console.log('✅ Resposta recebida da API Whisper');
      
      if (response.data && response.data.text) {
        const transcription = response.data.text.trim();
        console.log(`📝 Transcrição final: "${transcription}"`);
        return transcription;
      } else {
        console.log('⚠️ Resposta da API sem texto de transcrição');
        return '';
      }
    } catch (error) {
      console.error('❌ Erro ao transcrever áudio:', error.message);
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📊 Dados:', error.response.data);
      }
      return '';
    }
  }



  buildSystemPrompt(context, conversationState) {
    const basePrompt = `Você é a RefriAgroBot, assistente virtual da RefriAgro LTDA, especialista em refrigeração para agropecuária.

# CONTEXTO DA EMPRESA:
- Empresa: RefriAgro LTDA
- Especialidade: Refrigeração para agropecuária
- Horário de funcionamento: Segunda a sexta, 8h às 17h
- Serviços: Reparo, manutenção, peças, orçamentos para equipamentos de refrigeração

# TOM DE VOZ PROFISSIONAL:
- Seja profissional como uma recepcionista de loja de manutenção
- Use linguagem técnica mas acessível
- Mantenha tom respeitoso e eficiente
- Evite expressões muito informais como "Sinto muito em ouvir"
- Seja direto e objetivo, mas cordial

# REGRAS CRÍTICAS:
1. SEMPRE chame o cliente pelo nome quando disponível (ex: "Gabriel!" em vez de "Olá!")
2. NUNCA repita "Olá" se já foi dito na conversa - use apenas o nome ou seja direto
3. NUNCA repita perguntas já feitas - verifique o contexto
4. Colete informações progressivamente e detalhadamente
5. Para problemas técnicos, peça: descrição detalhada, fotos, vídeos, há quanto tempo, sintomas específicos
6. Qualifique o cliente 100% antes de finalizar
7. Se for segunda mensagem ou mais, NÃO use "Olá" - seja direto
8. NUNCA use "te ajudar" - use "ajudá-lo" ou "ajudá-la"
9. Seja PROFISSIONAL como uma recepcionista técnica
10. SEMPRE verifique se o cliente respondeu TODAS as perguntas feitas
11. Se alguma informação importante estiver faltando, pergunte especificamente sobre ela
12. NUNCA pergunte se é cliente novo ou existente - use os dados do banco automaticamente

# DADOS DO CLIENTE ATUAL:
${this.formatCustomerContext(context)}

# ESTADO ATUAL DA CONVERSA:
${this.getStateInstructions(conversationState)}

# HISTÓRICO DA CONVERSA:
${this.formatConversationHistory(context)}

# VERIFICAÇÃO DE INFORMAÇÕES FALTANTES:
${this.checkMissingInformation(context, conversationState)}

Responda de forma profissional e eficiente, sempre considerando o contexto e evitando repetições.`;

    return basePrompt;
  }

  formatCustomerContext(context) {
    if (!context || Object.keys(context).length === 0) {
      return '- Cliente novo, sem dados prévios';
    }

    let contextStr = '';
    
    if (context.customerName) {
      contextStr += `- Nome: ${context.customerName}\n`;
    }
    
    if (context.isKnownCustomer !== undefined) {
      contextStr += `- Tipo: ${context.isKnownCustomer ? 'Cliente existente' : 'Novo cliente'}\n`;
    }
    
    if (context.location) {
      contextStr += `- Localização: ${context.location}\n`;
    }
    
    if (context.equipmentType) {
      contextStr += `- Equipamento mencionado: ${context.equipmentType}\n`;
    }
    
    if (context.equipmentBrand) {
      contextStr += `- Marca: ${context.equipmentBrand}\n`;
    }
    
    if (context.knownEquipments && context.knownEquipments.length > 0) {
      contextStr += `- Equipamentos cadastrados: ${context.knownEquipments.map(eq => `${eq.tipo_equipamento} ${eq.marca}`).join(', ')}\n`;
    }
    
    if (context.warrantyStatus) {
      contextStr += `- Status da garantia: ${context.warrantyStatus.isUnderWarranty ? 'Em garantia' : 'Fora da garantia'}\n`;
    }

    return contextStr || '- Dados limitados do cliente';
  }

  formatConversationHistory(context) {
    if (!context || Object.keys(context).length === 0) {
      return '- Primeira interação';
    }

    let history = [];
    
    if (context.hasAskedForName) {
      history.push('Nome do cliente foi solicitado');
    }
    
    if (context.customerName) {
      history.push(`Cliente se identificou como: ${context.customerName}`);
    }
    
    if (context.hasAskedForLocation) {
      history.push('Localização foi perguntada');
    }
    
    if (context.location) {
      history.push(`Cliente informou localização: ${context.location}`);
    }
    
    if (context.hasAskedForEquipmentType) {
      history.push('Tipo de equipamento foi perguntado');
    }
    
    if (context.equipmentType) {
      history.push(`Cliente mencionou equipamento: ${context.equipmentType}`);
    }
    
    if (context.hasAskedForEquipmentBrand) {
      history.push('Marca do equipamento foi perguntada');
    }
    
    if (context.equipmentBrand) {
      history.push(`Cliente informou marca: ${context.equipmentBrand}`);
    }
    
    if (context.hasAskedForPurchaseDate) {
      history.push('Data de compra foi perguntada');
    }
    
    if (context.purchaseDate) {
      history.push(`Cliente informou data de compra: ${context.purchaseDate}`);
    }
    
    if (context.hasQualifiedDemand) {
      history.push('Demanda foi qualificada');
    }
    
    if (context.hasCollectedDetails) {
      history.push('Detalhes do problema foram coletados');
    }
    
    if (context.problemDescription) {
      history.push(`Problema descrito: ${context.problemDescription}`);
    }
    
    if (context.hasCollectedLocation) {
      history.push('Informações de localização para serviço foram coletadas');
    }

    return history.length > 0 ? history.join('\n') : '- Conversa iniciada';
  }

  getStateInstructions(conversationState) {
    const stateInstructions = {
      'initial': 'Primeira interação - Cumprimente profissionalmente e pergunte como pode ajudar. Use o nome se disponível.',
      'customer_identification': 'Identificação do cliente - Pergunte o nome de forma profissional e direta. NÃO use "Olá" se não for primeira mensagem.',
      'customer_qualification': 'Qualificação do cliente - Use dados do banco automaticamente. Se faltar localização, pergunte especificamente. NÃO use "Olá".',
      'equipment_analysis': 'Análise de equipamentos - Pergunte especificamente qual equipamento precisa de atenção. Use dados do banco se disponível. NÃO use "Olá".',
      'demand_qualification': 'Qualificação da demanda - Entenda o problema específico. Peça detalhes técnicos, fotos, vídeos. NÃO use "Olá".',
      'investigating': 'Investigação profunda - Colete TODOS os detalhes: sintomas, tempo, fotos, vídeos, tentativas de solução. NÃO use "Olá".',
      'detailing': 'Detalhamento final - Colete informações para agendamento: localização, horários, contatos. NÃO use "Olá".',
      'confirming': 'Confirmação - Confirme todos os dados coletados e explique próximos passos. NÃO use "Olá".',
      'closing': 'Encerramento - Agradeça profissionalmente e confirme que o atendente entrará em contato. NÃO use "Olá".'
    };

    return stateInstructions[conversationState] || 'Estado não reconhecido';
  }

  getFallbackResponse(conversationState, context) {
    const customerName = context?.customerName || 'Cliente';
    
    const fallbackResponses = {
      'initial': `${customerName}! Sou a RefriAgroBot. Como posso ajudá-lo hoje?`,
      'customer_identification': `Para que possamos atendê-lo adequadamente, qual é o seu nome?`,
      'customer_qualification': this.getCustomerQualificationResponse(context),
      'equipment_analysis': `${customerName}, qual equipamento precisa de atenção hoje?`,
      'demand_qualification': `${customerName}, informe-me sobre o problema específico que está enfrentando.`,
      'investigating': `${customerName}, preciso de informações técnicas detalhadas sobre o problema. Pode me fornecer mais detalhes?`,
      'detailing': `${customerName}, para agendar o serviço, preciso de algumas informações adicionais sobre localização e disponibilidade.`,
      'confirming': `${customerName}, vou encaminhar seu pedido a um de nossos técnicos especializados.`,
      'closing': `${customerName}, agradeço seu contato. Nossa equipe entrará em contato em breve.`
    };

    return fallbackResponses[conversationState] || 'Como posso ajudá-lo hoje?';
  }

  getCustomerQualificationResponse(context) {
    const customerName = context?.customerName || 'Cliente';
    
    // Se temos dados do cliente no banco, não perguntamos se é cliente
    if (context?.isKnownCustomer !== undefined) {
      // Verificar se falta localização
      if (!context.location) {
        return `${customerName}, para que possamos atendê-lo adequadamente, qual é a sua localização?`;
      }
      // Se tem localização, perguntar sobre equipamento
      return `${customerName}, qual equipamento precisa de atenção hoje?`;
    }
    
    // Se não temos dados, perguntar localização primeiro
    return `${customerName}, para que possamos atendê-lo adequadamente, qual é a sua localização?`;
  }

  checkMissingInformation(context, conversationState) {
    if (!context) return '- Verificação de informações: Primeira interação';
    
    const missingInfo = [];
    
    // Verificar informações básicas do cliente
    if (!context.customerName) {
      missingInfo.push('Nome do cliente');
    }
    
    if (!context.location) {
      missingInfo.push('Localização do cliente');
    }
    
    // Verificar informações do equipamento (se já foi mencionado)
    if (context.equipmentType && !context.equipmentBrand) {
      missingInfo.push('Marca do equipamento');
    }
    
    if (context.equipmentType && !context.purchaseDate) {
      missingInfo.push('Data de compra do equipamento');
    }
    
    // Verificar informações do problema (se já foi mencionado)
    if (context.hasQualifiedDemand && !context.problemDescription) {
      missingInfo.push('Descrição detalhada do problema');
    }
    
    if (missingInfo.length > 0) {
      return `INFORMAÇÕES FALTANTES: ${missingInfo.join(', ')}. PERGUNTE ESPECIFICAMENTE sobre essas informações antes de prosseguir.`;
    }
    
    return '- Todas as informações necessárias foram coletadas';
  }

  async generateEquipmentQuestion(context, customerData) {
    const customerName = context?.customerName || 'Cliente';
    const equipments = customerData?.equipments?.map(eq => `${eq.tipo_equipamento} ${eq.marca}`).join(', ') || 'Nenhum equipamento cadastrado';
    
    const systemPrompt = `Você é a RefriAgroBot, assistente profissional da RefriAgro LTDA.

CONTEXTO: ${customerName} tem os seguintes equipamentos cadastrados: ${equipments}.

Gere uma pergunta PROFISSIONAL perguntando qual equipamento específico precisa de atenção hoje.

REGRAS:
1. Use o nome do cliente sempre
2. Seja direto e profissional
3. Liste os equipamentos disponíveis se houver
4. NÃO repita "Olá" se já foi dito
5. Seja eficiente e objetivo

Exemplo profissional: "${customerName}, vi que você tem uma geladeira Brastemp e um ar condicionado LG. Qual deles precisa de atenção hoje?"

Responda de forma profissional e direta.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Gere pergunta profissional sobre equipamentos' }
        ],
        max_tokens: 150,
        temperature: 0.6
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao gerar pergunta sobre equipamentos:', error.message);
      return equipments !== 'Nenhum equipamento cadastrado' ? 
        `${customerName}, vi que você tem os seguintes equipamentos: ${equipments}. Qual deles precisa de atenção hoje?` :
        `${customerName}, que tipo de equipamento você tem?`;
    }
  }

  async generateProblemInvestigation(context, demand) {
    const customerName = context?.customerName || 'Cliente';
    const equipment = context?.eququipmentType || demand?.equipment || 'equipamento';
    
    const systemPrompt = `Você é a RefriAgroBot, assistente profissional da RefriAgro LTDA.

CONTEXTO: ${customerName} está relatando um problema com ${equipment}.

Gere uma pergunta PROFISSIONAL e DETALHADA para investigar o problema. A pergunta deve:

1. Ser direta e técnica, como uma recepcionista profissional
2. Pedir informações específicas:
   - Descrição técnica detalhada do problema
   - Há quanto tempo o problema começou
   - Se o equipamento parou completamente ou funciona parcialmente
   - Quais tentativas de solução já foram feitas
   - Fotos ou vídeos do problema (se possível)
   - Sintomas específicos observados

3. NÃO use expressões informais como "Sinto muito em ouvir"
4. Seja eficiente e objetivo
5. Use o nome do cliente se disponível
6. IMPORTANTE: Informe que você vai aguardar todas as informações antes de responder

Exemplo de tom profissional: "Para que possamos diagnosticar adequadamente o problema, preciso de algumas informações técnicas específicas sobre sua ${equipment}. Vou aguardar todas as informações que você puder enviar antes de responder."

Responda de forma profissional e técnica.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Gere pergunta profissional para investigar o problema' }
        ],
        max_tokens: 250,
        temperature: 0.6
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao gerar investigação do problema:', error.message);
      return `${customerName}, para que possamos diagnosticar adequadamente o problema com sua ${equipment}, preciso de algumas informações técnicas específicas. Pode me informar há quanto tempo o problema começou, se o equipamento parou completamente ou ainda funciona parcialmente, e quais tentativas de solução você já fez? Se possível, fotos ou vídeos do problema seriam muito úteis para nossa análise. Vou aguardar todas as informações antes de responder.`;
    }
  }

  // Novos métodos para análise de mensagens coletadas
  async generateProblemAnalysis(customerName, collectedMessages) {
    const systemPrompt = `Você é a RefriAgroBot, assistente profissional da RefriAgro LTDA.

CONTEXTO: ${customerName} enviou múltiplas mensagens com informações detalhadas sobre um problema técnico.

MENSAGENS COLETADAS: "${collectedMessages}"

Gere uma resposta PROFISSIONAL que:
1. Agradeça pelas informações detalhadas
2. Confirme que entendeu o problema
3. Informe que vai encaminhar para a equipe técnica
4. Explique os próximos passos
5. Seja específico sobre o que foi entendido

Use o nome do cliente e seja profissional como uma recepcionista técnica.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analise as mensagens e gere resposta profissional' }
        ],
        max_tokens: 300,
        temperature: 0.6
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao gerar análise de problema:', error.message);
      return `${customerName}, obrigado pelas informações detalhadas sobre o problema. Entendi que ${collectedMessages}. Vou encaminhar tudo para nossa equipe técnica que entrará em contato em breve para agendar o serviço.`;
    }
  }

  async generateEquipmentAnalysis(customerName, collectedMessages) {
    const systemPrompt = `Você é a RefriAgroBot, assistente profissional da RefriAgro LTDA.

CONTEXTO: ${customerName} enviou múltiplas mensagens com informações sobre equipamento.

MENSAGENS COLETADAS: "${collectedMessages}"

Gere uma resposta PROFISSIONAL que:
1. Confirme as informações do equipamento
2. Peça detalhes sobre o problema específico
3. Seja técnica mas acessível
4. Use o nome do cliente

Use o nome do cliente e seja profissional como uma recepcionista técnica.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analise as mensagens e gere resposta profissional' }
        ],
        max_tokens: 250,
        temperature: 0.6
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao gerar análise de equipamento:', error.message);
      return `${customerName}, entendi as informações sobre seu equipamento. Agora preciso de mais detalhes sobre o problema específico que está enfrentando. Pode me descrever o que está acontecendo?`;
    }
  }

  async generateLocationAnalysis(customerName, collectedMessages) {
    const systemPrompt = `Você é a RefriAgroBot, assistente profissional da RefriAgro LTDA.

CONTEXTO: ${customerName} enviou múltiplas mensagens com informações de localização.

MENSAGENS COLETADAS: "${collectedMessages}"

Gere uma resposta PROFISSIONAL que:
1. Confirme a localização
2. Informe que vai verificar disponibilidade
3. Explique que um técnico entrará em contato
4. Seja cordial e profissional

Use o nome do cliente e seja profissional como uma recepcionista técnica.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analise as mensagens e gere resposta profissional' }
        ],
        max_tokens: 200,
        temperature: 0.6
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao gerar análise de localização:', error.message);
      return `${customerName}, obrigado pelas informações de localização. Vou verificar nossa disponibilidade para sua região e um de nossos técnicos entrará em contato em breve para agendar o serviço.`;
    }
  }

  async generateGeneralAnalysis(customerName, collectedMessages) {
    const systemPrompt = `Você é a RefriAgroBot, assistente profissional da RefriAgro LTDA.

CONTEXTO: ${customerName} enviou múltiplas mensagens com informações gerais.

MENSAGENS COLETADAS: "${collectedMessages}"

Gere uma resposta PROFISSIONAL que:
1. Agradeça pelas informações
2. Confirme que entendeu
3. Informe próximos passos
4. Seja cordial e profissional

Use o nome do cliente e seja profissional como uma recepcionista técnica.`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analise as mensagens e gere resposta profissional' }
        ],
        max_tokens: 200,
        temperature: 0.6
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao gerar análise geral:', error.message);
      return `${customerName}, obrigado pelas informações. Vou analisar tudo e encaminhar para nossa equipe. Eles entrarão em contato em breve.`;
    }
  }
}

module.exports = AIAssistant;
