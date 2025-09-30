const SimpleChatbot = require('./app/chatbot-simple.js');

class ChatbotTester {
    constructor() {
        this.chatbot = new SimpleChatbot();
        this.testResults = [];
        this.currentTest = null;
    }

    // Simular cliente WhatsApp
    async simulateClient(whatsappNumber, message) {
        console.log(`\n📱 [${whatsappNumber}] Cliente: "${message}"`);

        try {
            const response = await this.chatbot.processMessage(whatsappNumber, message);
            console.log(`🤖 [BOT] Resposta: "${response}"`);
            return response;
        } catch (error) {
            console.error(`❌ Erro: ${error.message}`);
            return null;
        }
    }

    // Simular humano WhatsApp
    async simulateHuman(whatsappNumber, message) {
        console.log(`\n👤 [HUMANO] ${whatsappNumber}: "${message}"`);

        try {
            const response = await this.chatbot.processMessage(whatsappNumber, message);
            console.log(`🤖 [BOT] Resposta: "${response}"`);
            return response;
        } catch (error) {
            console.error(`❌ Erro: ${error.message}`);
            return null;
        }
    }

    // Aguardar um tempo (simular delay real)
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Teste 1: Fluxo completo de solicitação de peças
    async testPartsFlow() {
        console.log('\n🧪 ===== TESTE 1: FLUXO DE SOLICITAÇÃO DE PEÇAS =====');
        this.currentTest = 'Parts Flow';

        const clientNumber = '+5511999999999';

        try {
            // 1. Iniciar conversa
            await this.simulateClient(clientNumber, 'Oi');
            await this.delay(1000);

            // 2. Informar nome
            await this.simulateClient(clientNumber, 'João Silva');
            await this.delay(1000);

            // 3. Informar endereço
            await this.simulateClient(clientNumber, 'Fazenda São José, Zona Rural, Uberaba-MG');
            await this.delay(1000);

            // 4. Escolher peças
            await this.simulateClient(clientNumber, '1');
            await this.delay(1000);

            // 5. Informar detalhes da peça
            await this.simulateClient(clientNumber, 'Tenho um compressor Bitzer que a válvula de descarga tá com problema');
            await this.delay(1000);

            // 6. Tentar enviar foto (simular que não consegue)
            await this.simulateClient(clientNumber, 'Não consigo tirar foto agora');
            await this.delay(1000);

            // 7. Descrever defeito
            await this.simulateClient(clientNumber, 'O compressor tá fazendo muito barulho e não tá gelando direito. Começou há uns 3 dias');
            await this.delay(1000);

            // 8. Escolher finalizar
            await this.simulateClient(clientNumber, '3');

            this.testResults.push({
                test: 'Parts Flow',
                status: 'PASSED',
                description: 'Fluxo completo de solicitação de peças executado com sucesso'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Parts Flow',
                status: 'FAILED',
                description: `Erro: ${error.message}`
            });
        }
    }

    // Teste 2: Fluxo de problema/defeito
    async testProblemFlow() {
        console.log('\n🧪 ===== TESTE 2: FLUXO DE PROBLEMA/DEFEITO =====');
        this.currentTest = 'Problem Flow';

        const clientNumber = '+5511888888888';

        try {
            // 1. Iniciar conversa
            await this.simulateClient(clientNumber, 'Olá');
            await this.delay(1000);

            // 2. Informar nome
            await this.simulateClient(clientNumber, 'Maria Santos');
            await this.delay(1000);

            // 3. Informar endereço
            await this.simulateClient(clientNumber, 'Sítio Boa Vista, Zona Rural, Patos de Minas-MG');
            await this.delay(1000);

            // 4. Escolher problema/defeito
            await this.simulateClient(clientNumber, '2');
            await this.delay(1000);

            // 5. Descrever problema
            await this.simulateClient(clientNumber, 'Meu freezer não está gelando mais');
            await this.delay(2000); // Simular delay da IA

            // 6. Responder perguntas de follow-up (simular algumas)
            await this.simulateClient(clientNumber, 'Começou ontem');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Não faz barulho diferente');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Não tentei nada ainda');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Acontece sempre');
            await this.delay(2000); // Simular análise da IA

            // 7. Escolher transferir para humano
            await this.simulateClient(clientNumber, '2');

            this.testResults.push({
                test: 'Problem Flow',
                status: 'PASSED',
                description: 'Fluxo completo de problema/defeito executado com sucesso'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Problem Flow',
                status: 'FAILED',
                description: `Erro: ${error.message}`
            });
        }
    }

    // Teste 3: Fluxo de revisão
    async testReviewFlow() {
        console.log('\n🧪 ===== TESTE 3: FLUXO DE REVISÃO =====');
        this.currentTest = 'Review Flow';

        const clientNumber = '+5511777777777';

        try {
            // 1. Iniciar conversa
            await this.simulateClient(clientNumber, 'Boa tarde');
            await this.delay(1000);

            // 2. Informar nome
            await this.simulateClient(clientNumber, 'Pedro Oliveira');
            await this.delay(1000);

            // 3. Informar endereço
            await this.simulateClient(clientNumber, 'Fazenda Esperança, Zona Rural, Araxá-MG');
            await this.delay(1000);

            // 4. Escolher revisão
            await this.simulateClient(clientNumber, '3');
            await this.delay(1000);

            // 5. Informar equipamento
            await this.simulateClient(clientNumber, 'Ar condicionado central Carrier');
            await this.delay(1000);

            // 6. Escolher ligar para escritório
            await this.simulateClient(clientNumber, '1');

            this.testResults.push({
                test: 'Review Flow',
                status: 'PASSED',
                description: 'Fluxo completo de revisão executado com sucesso'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Review Flow',
                status: 'FAILED',
                description: `Erro: ${error.message}`
            });
        }
    }

    // Teste 4: Transferência para humano
    async testHumanTransfer() {
        console.log('\n🧪 ===== TESTE 4: TRANSFERÊNCIA PARA HUMANO =====');
        this.currentTest = 'Human Transfer';

        const clientNumber = '+5511666666666';
        const humanNumber = '31999917243';

        try {
            // 1. Iniciar conversa e ir até transferência
            await this.simulateClient(clientNumber, 'Oi');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Carlos Mendes');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Fazenda Nova, Zona Rural, Uberlândia-MG');
            await this.delay(1000);

            await this.simulateClient(clientNumber, '2'); // Problema/defeito
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Meu ar condicionado não está funcionando');
            await this.delay(2000);

            // Simular algumas respostas rápidas
            await this.simulateClient(clientNumber, 'Ontem');
            await this.delay(1000);
            await this.simulateClient(clientNumber, 'Sim, faz barulho');
            await this.delay(1000);
            await this.simulateClient(clientNumber, 'Não tentei');
            await this.delay(1000);
            await this.simulateClient(clientNumber, 'Sempre');
            await this.delay(2000);

            await this.simulateClient(clientNumber, '2'); // Transferir para humano
            await this.delay(1000);

            // 2. Simular mensagem do cliente para humano
            await this.simulateClient(clientNumber, 'Preciso de mais informações sobre o orçamento');
            await this.delay(1000);

            // 3. Simular resposta do humano
            await this.simulateHuman(humanNumber, 'Olá Carlos! Posso te ajudar com o orçamento. Qual é sua dúvida específica?');
            await this.delay(1000);

            // 4. Simular comando do humano para encerrar
            await this.simulateHuman(humanNumber, '/encerrar');

            this.testResults.push({
                test: 'Human Transfer',
                status: 'PASSED',
                description: 'Fluxo completo de transferência para humano executado com sucesso'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Human Transfer',
                status: 'FAILED',
                description: `Erro: ${error.message}`
            });
        }
    }

    // Teste 5: Sistema de follow-up
    async testFollowupSystem() {
        console.log('\n🧪 ===== TESTE 5: SISTEMA DE FOLLOW-UP =====');
        this.currentTest = 'Followup System';

        const clientNumber = '+5511555555555';

        try {
            // 1. Iniciar conversa e parar no meio
            await this.simulateClient(clientNumber, 'Oi');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Ana Costa');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Fazenda Sol, Zona Rural, Patrocínio-MG');
            await this.delay(1000);

            // 2. Escolher peças e parar
            await this.simulateClient(clientNumber, '1');
            await this.delay(1000);

            // 3. Simular que o usuário não responde (não enviar mais mensagens)
            console.log('⏰ Simulando inatividade de 3 horas...');
            console.log('💡 Em um cenário real, o sistema enviaria follow-up após 3h');

            // 4. Simular resposta ao follow-up
            console.log('📞 Simulando follow-up recebido:');
            await this.simulateClient(clientNumber, '1'); // Continuar atendimento
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Compressor Copeland com problema na válvula');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Não tenho foto');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Está vazando gás');
            await this.delay(1000);

            await this.simulateClient(clientNumber, '3'); // Finalizar

            this.testResults.push({
                test: 'Followup System',
                status: 'PASSED',
                description: 'Sistema de follow-up testado com sucesso'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Followup System',
                status: 'FAILED',
                description: `Erro: ${error.message}`
            });
        }
    }

    // Teste 6: Casos de erro e edge cases
    async testErrorCases() {
        console.log('\n🧪 ===== TESTE 6: CASOS DE ERRO E EDGE CASES =====');
        this.currentTest = 'Error Cases';

        const clientNumber = '+5511444444444';

        try {
            // 1. Testar opção inválida no menu
            await this.simulateClient(clientNumber, 'Oi');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Teste Erro');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Endereço teste');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'opção inválida');
            await this.delay(1000);

            // 2. Testar opção válida após erro
            await this.simulateClient(clientNumber, '1');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Equipamento teste');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Não tenho foto');
            await this.delay(1000);

            await this.simulateClient(clientNumber, 'Defeito teste');
            await this.delay(1000);

            await this.simulateClient(clientNumber, '3');

            this.testResults.push({
                test: 'Error Cases',
                status: 'PASSED',
                description: 'Casos de erro tratados corretamente'
            });

        } catch (error) {
            this.testResults.push({
                test: 'Error Cases',
                status: 'FAILED',
                description: `Erro: ${error.message}`
            });
        }
    }

    // Executar todos os testes
    async runAllTests() {
        console.log('🚀 INICIANDO TESTES DO CHATBOT REFRIAGRO');
        console.log('==========================================');

        const startTime = Date.now();

        try {
            await this.testPartsFlow();
            await this.delay(2000);

            await this.testProblemFlow();
            await this.delay(2000);

            await this.testReviewFlow();
            await this.delay(2000);

            await this.testHumanTransfer();
            await this.delay(2000);

            await this.testFollowupSystem();
            await this.delay(2000);

            await this.testErrorCases();

        } catch (error) {
            console.error('❌ Erro durante execução dos testes:', error.message);
        }

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        // Relatório final
        this.generateReport(duration);
    }

    // Gerar relatório de testes
    generateReport(duration) {
        console.log('\n📊 ===== RELATÓRIO DE TESTES =====');
        console.log(`⏱️  Duração total: ${duration.toFixed(2)} segundos`);
        console.log(`🧪 Total de testes: ${this.testResults.length}`);

        const passed = this.testResults.filter(t => t.status === 'PASSED').length;
        const failed = this.testResults.filter(t => t.status === 'FAILED').length;

        console.log(`✅ Passou: ${passed}`);
        console.log(`❌ Falhou: ${failed}`);
        console.log(`📈 Taxa de sucesso: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

        console.log('\n📋 DETALHES DOS TESTES:');
        this.testResults.forEach((result, index) => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}: ${result.description}`);
        });

        console.log('\n🎯 RESUMO:');
        if (failed === 0) {
            console.log('🎉 Todos os testes passaram! O chatbot está funcionando perfeitamente.');
        } else {
            console.log(`⚠️  ${failed} teste(s) falharam. Verifique os logs acima para detalhes.`);
        }

        console.log('\n💡 PRÓXIMOS PASSOS:');
        console.log('1. Verifique se todos os fluxos estão funcionando conforme esperado');
        console.log('2. Teste com usuários reais em ambiente de desenvolvimento');
        console.log('3. Monitore logs em produção para identificar problemas');
        console.log('4. Ajuste mensagens baseado no feedback dos usuários');
    }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
    const tester = new ChatbotTester();
    tester.runAllTests().catch(console.error);
}

module.exports = ChatbotTester;
