const SimpleChatbot = require('./app/chatbot-simple.js');

class HumanTransferTester {
    constructor() {
        this.chatbot = new SimpleChatbot();
        this.clientNumber = '+5511555555555';
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

    async testHumanTransferFlow() {
        console.log('🧪 TESTANDO TRANSFERÊNCIA PARA HUMANO');
        console.log('====================================');

        try {
            // 1. Iniciar conversa
            console.log('\n1️⃣ Iniciando conversa...');
            await this.simulateClientMessage('Oi');
            await this.delay(1000);

            // 2. Informar nome
            console.log('\n2️⃣ Informando nome...');
            await this.simulateClientMessage('Carlos Mendes');
            await this.delay(1000);

            // 3. Informar endereço
            console.log('\n3️⃣ Informando endereço...');
            await this.simulateClientMessage('Fazenda Nova, Zona Rural, Uberlândia-MG');
            await this.delay(1000);

            // 4. Escolher problema/defeito
            console.log('\n4️⃣ Escolhendo problema/defeito...');
            await this.simulateClientMessage('2');
            await this.delay(1000);

            // 5. Descrever problema
            console.log('\n5️⃣ Descrevendo problema...');
            await this.simulateClientMessage('Meu ar condicionado não está funcionando');
            await this.delay(2000);

            // 6. Responder perguntas de follow-up rapidamente
            console.log('\n6️⃣ Respondendo perguntas de follow-up...');
            await this.simulateClientMessage('Ontem');
            await this.delay(1000);
            await this.simulateClientMessage('Sim, faz barulho');
            await this.delay(1000);
            await this.simulateClientMessage('Não tentei');
            await this.delay(1000);
            await this.simulateClientMessage('Sempre');
            await this.delay(2000);

            // 7. Escolher transferir para humano
            console.log('\n7️⃣ Transferindo para humano...');
            await this.simulateClientMessage('2');
            await this.delay(1000);

            // 8. Cliente envia mensagem para humano
            console.log('\n8️⃣ Cliente enviando mensagem para humano...');
            await this.simulateClientMessage('Preciso de mais informações sobre o orçamento');
            await this.delay(1000);

            // 9. Humano responde
            console.log('\n9️⃣ Humano respondendo...');
            await this.simulateHumanMessage('Olá Carlos! Posso te ajudar com o orçamento. Qual é sua dúvida específica?');
            await this.delay(1000);

            // 10. Cliente responde
            console.log('\n🔟 Cliente respondendo...');
            await this.simulateClientMessage('Quanto custa para trocar o motor do ar condicionado?');
            await this.delay(1000);

            // 11. Humano responde novamente
            console.log('\n1️⃣1️⃣ Humano respondendo novamente...');
            await this.simulateHumanMessage('O motor do ar condicionado Carrier custa R$ 450,00. Posso enviar o orçamento completo?');
            await this.delay(1000);

            // 12. Humano encerra atendimento
            console.log('\n1️⃣2️⃣ Humano encerrando atendimento...');
            await this.simulateHumanMessage('/encerrar');

            console.log('\n✅ TESTE DE TRANSFERÊNCIA PARA HUMANO CONCLUÍDO!');

        } catch (error) {
            console.error('\n❌ ERRO NO TESTE DE TRANSFERÊNCIA:', error.message);
        }
    }

    async testHumanReturnToBot() {
        console.log('\n🧪 TESTANDO RETORNO DO HUMANO PARA BOT');
        console.log('======================================');

        const clientNumber = '+5511444444444';

        try {
            // 1. Iniciar conversa e ir até transferência
            console.log('\n1️⃣ Iniciando conversa...');
            await this.simulateClientMessage('Olá');
            await this.delay(1000);

            console.log('\n2️⃣ Informando nome...');
            await this.simulateClientMessage('Maria Silva');
            await this.delay(1000);

            console.log('\n3️⃣ Informando endereço...');
            await this.simulateClientMessage('Fazenda Boa Vista, Zona Rural, Patos de Minas-MG');
            await this.delay(1000);

            console.log('\n4️⃣ Escolhendo peças...');
            await this.simulateClientMessage('1');
            await this.delay(1000);

            console.log('\n5️⃣ Informando detalhes da peça...');
            await this.simulateClientMessage('Compressor Danfoss com problema');
            await this.delay(1000);

            console.log('\n6️⃣ Sem foto...');
            await this.simulateClientMessage('Não tenho foto');
            await this.delay(1000);

            console.log('\n7️⃣ Descrevendo defeito...');
            await this.simulateClientMessage('Não está funcionando');
            await this.delay(1000);

            console.log('\n8️⃣ Transferindo para humano...');
            await this.simulateClientMessage('2');
            await this.delay(1000);

            // 9. Humano retorna para bot
            console.log('\n9️⃣ Humano retornando para bot...');
            await this.simulateHumanMessage('/voltar');
            await this.delay(1000);

            // 10. Cliente escolhe finalizar
            console.log('\n🔟 Cliente finalizando...');
            await this.simulateClientMessage('3');

            console.log('\n✅ TESTE DE RETORNO PARA BOT CONCLUÍDO!');

        } catch (error) {
            console.error('\n❌ ERRO NO TESTE DE RETORNO:', error.message);
        }
    }

    async runTests() {
        console.log('🚀 INICIANDO TESTES DE TRANSFERÊNCIA PARA HUMANO');
        console.log('===============================================');

        await this.testHumanTransferFlow();
        await this.delay(2000);
        await this.testHumanReturnToBot();

        console.log('\n🎉 TODOS OS TESTES DE TRANSFERÊNCIA CONCLUÍDOS!');
    }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
    const tester = new HumanTransferTester();
    tester.runTests().catch(console.error);
}

module.exports = HumanTransferTester;
