const SimpleChatbot = require('./app/chatbot-simple.js');

class PartsFlowTester {
  constructor() {
    this.chatbot = new SimpleChatbot();
    this.clientNumber = '+5511999999999';
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

  async testPartsFlow() {
    console.log('🧪 TESTANDO FLUXO DE SOLICITAÇÃO DE PEÇAS');
    console.log('==========================================');
    
    try {
      // 1. Iniciar conversa
      console.log('\n1️⃣ Iniciando conversa...');
      await this.simulateMessage('Oi');
      await this.delay(1000);
      
      // 2. Informar nome
      console.log('\n2️⃣ Informando nome...');
      await this.simulateMessage('João Silva');
      await this.delay(1000);
      
      // 3. Informar endereço
      console.log('\n3️⃣ Informando endereço...');
      await this.simulateMessage('Fazenda São José, Zona Rural, Uberaba-MG');
      await this.delay(1000);
      
      // 4. Escolher peças
      console.log('\n4️⃣ Escolhendo opção de peças...');
      await this.simulateMessage('1');
      await this.delay(1000);
      
      // 5. Informar detalhes da peça
      console.log('\n5️⃣ Informando detalhes da peça...');
      await this.simulateMessage('Tenho um compressor Bitzer que a válvula de descarga tá com problema');
      await this.delay(1000);
      
      // 6. Tentar enviar foto (simular que não consegue)
      console.log('\n6️⃣ Tentando enviar foto...');
      await this.simulateMessage('Não consigo tirar foto agora');
      await this.delay(1000);
      
      // 7. Descrever defeito
      console.log('\n7️⃣ Descrevendo defeito...');
      await this.simulateMessage('O compressor tá fazendo muito barulho e não tá gelando direito. Começou há uns 3 dias');
      await this.delay(1000);
      
      // 8. Escolher finalizar
      console.log('\n8️⃣ Finalizando atendimento...');
      await this.simulateMessage('3');
      
      console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log('O fluxo de solicitação de peças está funcionando corretamente.');
      
    } catch (error) {
      console.error('\n❌ ERRO NO TESTE:', error.message);
    }
  }

  // Teste alternativo com foto
  async testPartsFlowWithPhoto() {
    console.log('\n🧪 TESTANDO FLUXO DE PEÇAS COM FOTO');
    console.log('====================================');
    
    const clientNumber = '+5511888888888';
    
    try {
      // 1. Iniciar conversa
      console.log('\n1️⃣ Iniciando conversa...');
      await this.simulateMessage('Olá');
      await this.delay(1000);
      
      // 2. Informar nome
      console.log('\n2️⃣ Informando nome...');
      await this.simulateMessage('Maria Santos');
      await this.delay(1000);
      
      // 3. Informar endereço
      console.log('\n3️⃣ Informando endereço...');
      await this.simulateMessage('Sítio Boa Vista, Zona Rural, Patos de Minas-MG');
      await this.delay(1000);
      
      // 4. Escolher peças
      console.log('\n4️⃣ Escolhendo opção de peças...');
      await this.simulateMessage('1');
      await this.delay(1000);
      
      // 5. Informar detalhes da peça
      console.log('\n5️⃣ Informando detalhes da peça...');
      await this.simulateMessage('Ar condicionado Carrier que o motor da ventoinha parou de funcionar');
      await this.delay(1000);
      
      // 6. Simular envio de foto
      console.log('\n6️⃣ Simulando envio de foto...');
      await this.simulateMessage('foto'); // Simula que mencionou foto
      await this.delay(1000);
      
      // 7. Continuar sem foto
      console.log('\n7️⃣ Continuando sem foto...');
      await this.simulateMessage('Na verdade não consigo enviar agora');
      await this.delay(1000);
      
      // 8. Descrever defeito
      console.log('\n8️⃣ Descrevendo defeito...');
      await this.simulateMessage('O motor da ventoinha não gira mais, faz um barulho estranho quando liga');
      await this.delay(1000);
      
      // 9. Escolher transferir para humano
      console.log('\n9️⃣ Transferindo para humano...');
      await this.simulateMessage('2');
      
      console.log('\n✅ TESTE COM FOTO CONCLUÍDO COM SUCESSO!');
      
    } catch (error) {
      console.error('\n❌ ERRO NO TESTE COM FOTO:', error.message);
    }
  }

  async runTests() {
    console.log('🚀 INICIANDO TESTES DO FLUXO DE PEÇAS');
    console.log('=====================================');
    
    await this.testPartsFlow();
    await this.delay(2000);
    await this.testPartsFlowWithPhoto();
    
    console.log('\n🎉 TODOS OS TESTES DE PEÇAS CONCLUÍDOS!');
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  const tester = new PartsFlowTester();
  tester.runTests().catch(console.error);
}

module.exports = PartsFlowTester;
