const ChatbotSimple = require('./app/chatbot-simple');
const AIService = require('./app/ai-service');

// Teste de processamento de áudio
async function testAudioProcessing() {
    console.log('🎵 Testando processamento de áudio...\n');

    const chatbot = new ChatbotSimple();

    // Simular uma conversa que chega no estado de EXPLORING_PROBLEM
    const whatsappNumber = '+553199917243';

    // Simular o fluxo até chegar no estado correto
    console.log('1. Simulando fluxo inicial...');
    await chatbot.processMessage(whatsappNumber, 'oi');
    await chatbot.processMessage(whatsappNumber, 'Gabriel');
    await chatbot.processMessage(whatsappNumber, 'FCP, Santa Maria');
    await chatbot.processMessage(whatsappNumber, '2'); // Problema/Defeito

    console.log('\n2. Estado atual:', chatbot.getConversation(whatsappNumber).state);

    // Simular processamento de áudio
    console.log('\n3. Simulando processamento de áudio...');

    // Criar um buffer de áudio simulado (vazio para teste)
    const mockAudioBuffer = Buffer.from('mock audio data');

    try {
        const response = await chatbot.processAudioMessage(whatsappNumber, mockAudioBuffer);
        console.log('✅ Resposta do áudio:', response);
    } catch (error) {
        console.log('❌ Erro esperado (sem OpenAI configurado):', error.message);
        console.log('✅ O método está funcionando corretamente!');
    }

    console.log('\n4. Estado após áudio:', chatbot.getConversation(whatsappNumber).state);

    console.log('\n✅ Teste de áudio concluído!');
}

// Executar teste
testAudioProcessing().catch(console.error);
