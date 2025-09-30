const SimpleChatbot = require('./app/chatbot-simple.js');

class SimpleTransferTester {
  constructor() {
    this.chatbot = new SimpleChatbot();
    this.clientNumber = '+5511999999999';
    this.humanNumber = '31999917243';
  }

  async simulateClientMessage(message) {
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

  async simulateHumanMessage(message) {
    console.log(`\n👤 Humano: "${message}"`);
    
    try {
      const response = await this.chatbot.processMessage(this.humanNumber, message);
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

  async testSimpleTransfer() {
    console.log('🧪 TESTE SIMPLES DE TRANSFERÊNCIA PARA HUMANO');
    console.log('=============================================');
    
    try {
      // 1. Iniciar conversa
      console.log('\n1️⃣ Iniciando conversa...');
      await this.simulateClientMessage('Oi');
      await this.delay(1000);
      
      // 2. Informar nome
      console.log('\n2️⃣ Informando nome...');
      await this.simulateClientMessage('João Silva');
      await this.delay(1000);
      
      // 3. Informar endereço
      console.log('\n3️⃣ Informando endereço...');
      await this.simulateClientMessage('Fazenda Teste, Zona Rural, Uberaba-MG');
      await this.delay(1000);
      
      // 4. Escolher problema/defeito
      console.log('\n4️⃣ Escolhendo problema/defeito...');
      await this.simulateClientMessage('2');
      await this.delay(1000);
      
      // 5. Descrever problema
      console.log('\n5️⃣ Descrevendo problema...');
      await this.simulateClientMessage('Meu ar condicionado não está funcionando');
      await this.delay(2000);
      
      // 6. Pular perguntas (escolher 2)
      console.log('\n6️⃣ Pulando perguntas...');
      await this.simulateClientMessage('2');
      await this.delay(2000);
      
      // 7. Escolher transferir para humano
      console.log('\n7️⃣ Transferindo para humano...');
      await this.simulateClientMessage('2');
      await this.delay(1000);
      
      // 8. Cliente envia mensagem
      console.log('\n8️⃣ Cliente enviando mensagem...');
      await this.simulateClientMessage('Preciso de ajuda');
      await this.delay(1000);
      
      // 9. Humano responde
      console.log('\n9️⃣ Humano respondendo...');
      await this.simulateHumanMessage('Olá João! Como posso ajudar?');
      await this.delay(1000);
      
      // 10. Humano encerra
      console.log('\n🔟 Humano encerrando...');
      await this.simulateHumanMessage('/encerrar');
      
      console.log('\n✅ TESTE SIMPLES CONCLUÍDO!');
      
    } catch (error) {
      console.error('\n❌ ERRO NO TESTE:', error.message);
    }
  }
}

// Executar teste
if (require.main === module) {
  const tester = new SimpleTransferTester();
  tester.testSimpleTransfer().catch(console.error);
}

module.exports = SimpleTransferTester;
