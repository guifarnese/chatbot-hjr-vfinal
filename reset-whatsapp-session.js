const fs = require('fs');
const path = require('path');

console.log('🔄 Resetando configurações de sessão do WhatsApp...\n');

// Função para deletar pasta recursivamente
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    console.log(`✅ Pasta deletada: ${folderPath}`);
  } else {
    console.log(`⚠️ Pasta não encontrada: ${folderPath}`);
  }
}

try {
  // Deletar pasta de autenticação
  const authPath = path.join(__dirname, '.wwebjs_auth');
  console.log('🗑️ Removendo configurações de autenticação...');
  deleteFolderRecursive(authPath);

  // Deletar pasta de cache
  const cachePath = path.join(__dirname, '.wwebjs_cache');
  console.log('🗑️ Removendo cache do WhatsApp...');
  deleteFolderRecursive(cachePath);

  console.log('\n✅ Reset concluído com sucesso!');
  console.log('📱 Agora você pode reconectar o WhatsApp com um novo QR Code.');
  console.log('\n🚀 Para iniciar o chatbot novamente, execute:');
  console.log('   node start-fixed.js');

} catch (error) {
  console.error('❌ Erro ao resetar configurações:', error.message);
  process.exit(1);
}
