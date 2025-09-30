const mysql = require('mysql2/promise');

// Configuração da conexão MySQL
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'refriagro_erp',
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexões
const pool = mysql.createPool(mysqlConfig);

// Função para buscar dados do cliente
async function getCustomerData(whatsappNumber) {
  try {
    const connection = await pool.getConnection();
    
    // Busca cliente por WhatsApp (ajuste a query conforme sua estrutura)
    const [rows] = await connection.execute(`
      SELECT 
        c.id,
        c.nome,
        c.empresa,
        c.endereco,
        c.cidade,
        c.estado,
        c.telefone,
        c.email,
        c.tipo_cliente,
        c.data_cadastro,
        c.observacoes
      FROM clientes c 
      WHERE c.telefone = ? OR c.whatsapp = ?
      LIMIT 1
    `, [whatsappNumber, whatsappNumber]);
    
    connection.release();
    
    if (rows.length > 0) {
      const customer = rows[0];
      
      // Busca histórico de pedidos/serviços
      const [orders] = await connection.execute(`
        SELECT 
          p.id,
          p.data_pedido,
          p.tipo_servico,
          p.equipamento,
          p.status,
          p.valor,
          p.observacoes
        FROM pedidos p 
        WHERE p.cliente_id = ?
        ORDER BY p.data_pedido DESC
        LIMIT 5
      `, [customer.id]);
      
      // Busca equipamentos do cliente
      const [equipments] = await connection.execute(`
        SELECT 
          e.id,
          e.tipo_equipamento,
          e.marca,
          e.modelo,
          e.serial,
          e.data_instalacao,
          e.ultima_manutencao
        FROM equipamentos e 
        WHERE e.cliente_id = ?
        ORDER BY e.ultima_manutencao DESC
      `, [customer.id]);
      
      return {
        id: customer.id,
        name: customer.nome,
        company: customer.empresa,
        location: `${customer.cidade}, ${customer.estado}`,
        phone: customer.telefone,
        email: customer.email,
        customerType: customer.tipo_cliente,
        registrationDate: customer.data_cadastro,
        notes: customer.observacoes,
        orders: orders,
        equipments: equipments,
        lastOrder: orders.length > 0 ? orders[0] : null,
        lastEquipment: equipments.length > 0 ? equipments[0] : null
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching customer data from MySQL:', error);
    return null;
  }
}

// Função para salvar nova demanda
async function saveDemand(customerId, demandData) {
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(`
      INSERT INTO demandas (
        cliente_id,
        tipo_demanda,
        equipamento,
        descricao,
        urgencia,
        status,
        data_criacao,
        origem
      ) VALUES (?, ?, ?, ?, ?, 'pendente', NOW(), 'whatsapp')
    `, [
      customerId,
      demandData.type,
      demandData.equipment,
      demandData.description,
      demandData.urgency || 'normal'
    ]);
    
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('Error saving demand to MySQL:', error);
    throw error;
  }
}

// Função para buscar histórico de conversas
async function getConversationHistory(customerId) {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        id,
        mensagem,
        tipo,
        data_envio,
        origem
      FROM conversas_whatsapp 
      WHERE cliente_id = ?
      ORDER BY data_envio DESC
      LIMIT 10
    `, [customerId]);
    
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

// Função para salvar conversa
async function saveConversation(customerId, message, isBot = false) {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      INSERT INTO conversas_whatsapp (
        cliente_id,
        mensagem,
        tipo,
        data_envio,
        origem
      ) VALUES (?, ?, ?, NOW(), 'whatsapp')
    `, [
      customerId,
      message,
      isBot ? 'bot' : 'cliente'
    ]);
    
    connection.release();
  } catch (error) {
    console.error('Error saving conversation to MySQL:', error);
  }
}

// Save customer data
async function saveCustomerData(whatsappNumber, customerData) {
  try {
    const connection = await pool.getConnection();
    
    // Check if customer already exists
    const [existingCustomers] = await connection.execute(
      'SELECT id FROM clientes WHERE telefone = ? OR whatsapp = ?',
      [whatsappNumber, whatsappNumber]
    );
    
    if (existingCustomers.length > 0) {
      // Update existing customer
      await connection.execute(
        'UPDATE clientes SET nome = ?, tipo_cliente = ? WHERE telefone = ? OR whatsapp = ?',
        [customerData.nome, customerData.tipo_cliente, whatsappNumber, whatsappNumber]
      );
      console.log(`✅ Cliente ${customerData.nome} atualizado`);
    } else {
      // Insert new customer
      await connection.execute(
        'INSERT INTO clientes (nome, telefone, whatsapp, tipo_cliente, data_cadastro) VALUES (?, ?, ?, ?, NOW())',
        [customerData.nome, whatsappNumber, whatsappNumber, customerData.tipo_cliente]
      );
      console.log(`✅ Novo cliente ${customerData.nome} cadastrado`);
    }
    
    connection.release();
  } catch (error) {
    console.log('⚠️ MySQL não disponível - dados salvos apenas localmente');
    throw error;
  }
}

// Save equipment data
async function saveEquipmentData(whatsappNumber, equipmentData) {
  try {
    const connection = await pool.getConnection();
    
    // Get customer ID
    const [customers] = await connection.execute(
      'SELECT id FROM clientes WHERE telefone = ? OR whatsapp = ?',
      [whatsappNumber, whatsappNumber]
    );
    
    if (customers.length === 0) {
      throw new Error('Customer not found');
    }
    
    const customerId = customers[0].id;
    
    // Check if equipment already exists
    const [existingEquipments] = await connection.execute(
      'SELECT id FROM equipamentos WHERE cliente_id = ? AND tipo_equipamento = ? AND marca = ?',
      [customerId, equipmentData.tipo_equipamento, equipmentData.marca]
    );
    
    if (existingEquipments.length > 0) {
      // Update existing equipment
      await connection.execute(
        'UPDATE equipamentos SET modelo = ?, data_instalacao = ? WHERE id = ?',
        [equipmentData.modelo, equipmentData.data_compra, existingEquipments[0].id]
      );
      console.log(`✅ Equipamento ${equipmentData.tipo_equipamento} ${equipmentData.marca} atualizado`);
    } else {
      // Insert new equipment
      await connection.execute(
        'INSERT INTO equipamentos (cliente_id, tipo_equipamento, marca, modelo, data_instalacao, data_cadastro) VALUES (?, ?, ?, ?, ?, NOW())',
        [customerId, equipmentData.tipo_equipamento, equipmentData.marca, equipmentData.modelo, equipmentData.data_compra]
      );
      console.log(`✅ Novo equipamento ${equipmentData.tipo_equipamento} ${equipmentData.marca} cadastrado`);
    }
    
    connection.release();
  } catch (error) {
    console.log('⚠️ MySQL não disponível - dados salvos apenas localmente');
    throw error;
  }
}

// Save demand summary
async function saveDemandSummary(whatsappNumber, summary) {
  try {
    const connection = await pool.getConnection();
    
    // Insert demand summary
    await connection.execute(
      'INSERT INTO demand_summaries (whatsapp_number, summary, created_at) VALUES (?, ?, NOW())',
      [whatsappNumber, summary]
    );
    
    connection.release();
    console.log(`✅ Resumo da demanda salvo no MySQL para ${whatsappNumber}`);
  } catch (error) {
    console.error('Error saving demand summary:', error);
    throw error;
  }
}

// Teste de conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

module.exports = {
  getCustomerData,
  saveDemand,
  getConversationHistory,
  saveConversation,
  saveCustomerData,
  saveEquipmentData,
  saveDemandSummary,
  testConnection,
  pool
};
