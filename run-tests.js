#!/usr/bin/env node

const PartsFlowTester = require('./test-parts-flow.js');
const FollowupTester = require('./test-followup.js');
const HumanTransferTester = require('./test-human-transfer.js');
const ChatbotTester = require('./test-chatbot.js');

class TestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = null;
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 EXECUTANDO: ${testName}`);
    console.log('='.repeat(50));
    
    const testStartTime = Date.now();
    
    try {
      await testFunction();
      const duration = (Date.now() - testStartTime) / 1000;
      
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration: duration
      });
      
      console.log(`\n✅ ${testName} - PASSOU (${duration.toFixed(2)}s)`);
      
    } catch (error) {
      const duration = (Date.now() - testStartTime) / 1000;
      
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        duration: duration,
        error: error.message
      });
      
      console.log(`\n❌ ${testName} - FALHOU (${duration.toFixed(2)}s)`);
      console.log(`   Erro: ${error.message}`);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runAllTests() {
    console.log('🚀 INICIANDO SUITE COMPLETA DE TESTES DO CHATBOT REFRIAGRO');
    console.log('========================================================');
    console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
    console.log('');
    
    this.startTime = Date.now();
    
    try {
      // Teste 1: Fluxo de Peças
      const partsTester = new PartsFlowTester();
      await this.runTest('Fluxo de Solicitação de Peças', () => partsTester.runTests());
      await this.delay(2000);
      
      // Teste 2: Sistema de Follow-up
      const followupTester = new FollowupTester();
      await this.runTest('Sistema de Follow-up', () => followupTester.runTests());
      await this.delay(2000);
      
      // Teste 3: Transferência para Humano
      const humanTester = new HumanTransferTester();
      await this.runTest('Transferência para Humano', () => humanTester.runTests());
      await this.delay(2000);
      
      // Teste 4: Suite Completa (opcional - mais demorado)
      console.log('\n💡 Deseja executar a suite completa de testes? (Pode demorar mais)');
      console.log('   Para executar: node run-tests.js --full');
      
    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error.message);
    }
    
    this.generateReport();
  }

  async runFullTests() {
    console.log('🚀 EXECUTANDO SUITE COMPLETA DE TESTES');
    console.log('=====================================');
    
    this.startTime = Date.now();
    
    try {
      // Executar suite completa
      const fullTester = new ChatbotTester();
      await this.runTest('Suite Completa de Testes', () => fullTester.runAllTests());
      
    } catch (error) {
      console.error('❌ Erro durante execução da suite completa:', error.message);
    }
    
    this.generateReport();
  }

  generateReport() {
    const totalDuration = (Date.now() - this.startTime) / 1000;
    
    console.log('\n📊 ===== RELATÓRIO FINAL DE TESTES =====');
    console.log(`⏱️  Duração total: ${totalDuration.toFixed(2)} segundos`);
    console.log(`🧪 Total de testes: ${this.testResults.length}`);
    
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`📈 Taxa de sucesso: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETALHES DOS TESTES:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      const duration = result.duration ? `(${result.duration.toFixed(2)}s)` : '';
      console.log(`${index + 1}. ${status} ${result.name} ${duration}`);
      
      if (result.error) {
        console.log(`   Erro: ${result.error}`);
      }
    });
    
    console.log('\n🎯 RESUMO:');
    if (failed === 0) {
      console.log('🎉 Todos os testes passaram! O chatbot está funcionando perfeitamente.');
      console.log('');
      console.log('✅ Funcionalidades testadas:');
      console.log('   • Fluxo de solicitação de peças');
      console.log('   • Sistema de follow-up automático');
      console.log('   • Transferência para humano');
      console.log('   • Coleta de fotos e detalhes');
      console.log('   • Mensagens para técnicos');
      console.log('   • Estados e transições');
    } else {
      console.log(`⚠️  ${failed} teste(s) falharam. Verifique os logs acima para detalhes.`);
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Testes automatizados concluídos');
    console.log('2. 🔄 Teste com usuários reais em ambiente de desenvolvimento');
    console.log('3. 📊 Monitore logs em produção');
    console.log('4. 🎯 Ajuste mensagens baseado no feedback');
    console.log('5. 🚀 Deploy em produção quando estiver satisfeito');
    
    console.log('\n📚 COMANDOS DISPONÍVEIS:');
    console.log('• node run-tests.js           - Testes principais');
    console.log('• node run-tests.js --full    - Suite completa');
    console.log('• node test-parts-flow.js     - Apenas fluxo de peças');
    console.log('• node test-followup.js       - Apenas follow-up');
    console.log('• node test-human-transfer.js - Apenas transferência');
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const runFull = args.includes('--full');

// Executar testes
const runner = new TestRunner();

if (runFull) {
  runner.runFullTests().catch(console.error);
} else {
  runner.runAllTests().catch(console.error);
}
