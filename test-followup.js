const SimpleChatbot = require('./app/chatbot-simple.js');

class FollowupTester {
  constructor() {
    this.chatbot = new SimpleChatbot();
    this.clientNumber = '+5511777777777';
  }

  async simulateMessage(message) {
    console.log(`\n📱 Cliente: "${message}"`);

    try {
      const response = await this.chatbot.processMessage(this.clientNumber, message);
      console.log(`🤖 Bot: "${response}"`);
      return response;
    } catch (error) {
      console.error(`❌ Erro: ${error.message}`);
      return null;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simular follow-up manualmente (já que não podemos esperar 3 horas)
  async simulateFollowup() {
    console.log('\n📞 SIMULANDO FOLLOW-UP DE INATIVIDADE...');

    try {
      // Simular que o sistema enviou follow-up
      const conversation = this.chatbot.getConversation(this.clientNumber);
      conversation.previousState = conversation.state; // Salvar estado anterior
      conversation.state = this.chatbot.states.FOLLOWUP_INACTIVITY;
      conversation.followupSent = true;

      console.log('🤖 Bot: "👋 Oi [Nome]!');
      console.log('Notei que você não respondeu há um tempo. Tudo bem por aí?');
      console.log('');
      console.log('Você gostaria de:');
      console.log('');
      console.log('1️⃣ Continuar o atendimento - Voltar para onde paramos');
      console.log('2️⃣ Encerrar por agora - Finalizar o atendimento');
      console.log('');
      console.log('Digite o número da opção desejada."');

    } catch (error) {
      console.error('❌ Erro ao simular follow-up:', error.message);
    }
  }

  async testFollowupContinue() {
    console.log('\n🧪 TESTANDO FOLLOW-UP - CONTINUAR ATENDIMENTO');
    console.log('==============================================');

    try {
      // 1. Iniciar conversa
      console.log('\n1️⃣ Iniciando conversa...');
      await this.simulateMessage('Oi');
      await this.delay(1000);

      // 2. Informar nome
      console.log('\n2️⃣ Informando nome...');
      await this.simulateMessage('Pedro Oliveira');
      await this.delay(1000);

      // 3. Informar endereço
      console.log('\n3️⃣ Informando endereço...');
      await this.simulateMessage('Fazenda Esperança, Zona Rural, Araxá-MG');
      await this.delay(1000);

      // 4. Escolher peças
      console.log('\n4️⃣ Escolhendo opção de peças...');
      await this.simulateMessage('1');
      await this.delay(1000);

      // 5. Simular follow-up
      await this.simulateFollowup();
      await this.delay(1000);

      // 6. Escolher continuar
      console.log('\n6️⃣ Escolhendo continuar atendimento...');
      await this.simulateMessage('1');
      await this.delay(1000);

      // 7. Continuar com detalhes da peça
      console.log('\n7️⃣ Continuando com detalhes da peça...');
      await this.simulateMessage('Compressor Copeland com problema na válvula');
      await this.delay(1000);

      // 8. Sem foto
      console.log('\n8️⃣ Sem foto...');
      await this.simulateMessage('Não tenho foto');
      await this.delay(1000);

      // 9. Descrever defeito
      console.log('\n9️⃣ Descrevendo defeito...');
      await this.simulateMessage('Está vazando gás e fazendo barulho');
      await this.delay(1000);

      // 10. Finalizar
      console.log('\n🔟 Finalizando...');
      await this.simulateMessage('3');

      console.log('\n✅ TESTE DE FOLLOW-UP (CONTINUAR) CONCLUÍDO!');

    } catch (error) {
      console.error('\n❌ ERRO NO TESTE DE FOLLOW-UP:', error.message);
    }
  }

  async testFollowupEnd() {
    console.log('\n🧪 TESTANDO FOLLOW-UP - ENCERRAR ATENDIMENTO');
    console.log('============================================');

    const clientNumber = '+5511666666666';

    try {
      // 1. Iniciar conversa
      console.log('\n1️⃣ Iniciando conversa...');
      await this.simulateMessage('Boa tarde');
      await this.delay(1000);

      // 2. Informar nome
      console.log('\n2️⃣ Informando nome...');
      await this.simulateMessage('Ana Costa');
      await this.delay(1000);

      // 3. Informar endereço
      console.log('\n3️⃣ Informando endereço...');
      await this.simulateMessage('Fazenda Sol, Zona Rural, Patrocínio-MG');
      await this.delay(1000);

      // 4. Escolher problema/defeito
      console.log('\n4️⃣ Escolhendo problema/defeito...');
      await this.simulateMessage('2');
      await this.delay(1000);

      // 5. Descrever problema
      console.log('\n5️⃣ Descrevendo problema...');
      await this.simulateMessage('Meu freezer não está gelando');
      await this.delay(2000);

      // 6. Simular follow-up
      await this.simulateFollowup();
      await this.delay(1000);

      // 7. Escolher encerrar
      console.log('\n7️⃣ Escolhendo encerrar atendimento...');
      await this.simulateMessage('2');

      console.log('\n✅ TESTE DE FOLLOW-UP (ENCERRAR) CONCLUÍDO!');

    } catch (error) {
      console.error('\n❌ ERRO NO TESTE DE FOLLOW-UP:', error.message);
    }
  }

  async runTests() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA DE FOLLOW-UP');
    console.log('==========================================');

    await this.testFollowupContinue();
    await this.delay(2000);
    await this.testFollowupEnd();

    console.log('\n🎉 TODOS OS TESTES DE FOLLOW-UP CONCLUÍDOS!');
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  const tester = new FollowupTester();
  tester.runTests().catch(console.error);
}

module.exports = FollowupTester;
