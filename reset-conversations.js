const db = require('./app/database.js');

async function resetConversations() {
  console.log('🧹 Iniciando reset das conversas...\n');
  
  try {
    // Limpar tabela contacts
    console.log('📋 Limpando tabela contacts...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM contacts", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Tabela contacts limpa');
    
    // Limpar tabela conversations
    console.log('📋 Limpando tabela conversations...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM conversations", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Tabela conversations limpa');
    
    // Limpar tabela demands
    console.log('📋 Limpando tabela demands...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM demands", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Tabela demands limpa');
    
    // Limpar tabela customer_cache
    console.log('📋 Limpando tabela customer_cache...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM customer_cache", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Tabela customer_cache limpa');
    
    // Limpar tabela demand_summaries
    console.log('📋 Limpando tabela demand_summaries...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM demand_summaries", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Tabela demand_summaries limpa');
    
    // Resetar contadores de auto-incremento
    console.log('🔄 Resetando contadores de auto-incremento...');
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM sqlite_sequence", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Contadores resetados');
    
    console.log('\n🎉 Reset completo finalizado!');
    console.log('🔄 Todas as conversas foram resetadas');
    console.log('✅ Banco de dados limpo e pronto para novos testes');
    
    // Verificar se as tabelas estão vazias
    console.log('\n📊 Verificando tabelas:');
    
    const tables = ['contacts', 'conversations', 'demands', 'customer_cache', 'demand_summaries'];
    
    for (const table of tables) {
      const count = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
      console.log(`📊 ${table}: ${count} registros`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o reset:', error.message);
  } finally {
    // Fechar conexão com o banco
    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err.message);
      } else {
        console.log('🔒 Banco de dados fechado');
      }
    });
  }
}

// Executar reset
resetConversations();
