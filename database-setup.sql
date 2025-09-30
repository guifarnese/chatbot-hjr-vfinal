-- Script para configurar o banco de dados MySQL local
-- Execute este script no seu MySQL para criar as tabelas necessárias

-- Criar o banco de dados se não existir
CREATE DATABASE IF NOT EXISTS refriagro_erp;
USE refriagro_erp;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    empresa VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(50),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    tipo_cliente ENUM('vip', 'regular', 'novo') DEFAULT 'novo',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo_equipamento VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serial VARCHAR(100),
    data_instalacao DATE,
    ultima_manutencao DATE,
    proxima_manutencao DATE,
    status ENUM('ativo', 'inativo', 'manutencao') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de pedidos/serviços
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_servico VARCHAR(100) NOT NULL,
    equipamento VARCHAR(255),
    status ENUM('pendente', 'em_andamento', 'concluido', 'cancelado') DEFAULT 'pendente',
    valor DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de demandas
CREATE TABLE IF NOT EXISTS demandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo_demanda VARCHAR(100) NOT NULL,
    equipamento VARCHAR(255),
    descricao TEXT,
    urgencia ENUM('baixa', 'normal', 'alta', 'urgente') DEFAULT 'normal',
    status ENUM('pendente', 'em_analise', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    origem VARCHAR(50) DEFAULT 'whatsapp',
    responsavel VARCHAR(100),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de conversas do WhatsApp
CREATE TABLE IF NOT EXISTS conversas_whatsapp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    mensagem TEXT NOT NULL,
    tipo ENUM('cliente', 'bot', 'atendente') NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    origem VARCHAR(50) DEFAULT 'whatsapp',
    status ENUM('enviada', 'entregue', 'lida', 'erro') DEFAULT 'enviada',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_whatsapp ON clientes(whatsapp);
CREATE INDEX idx_equipamentos_cliente ON equipamentos(cliente_id);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_demandas_cliente ON demandas(cliente_id);
CREATE INDEX idx_conversas_cliente ON conversas_whatsapp(cliente_id);
CREATE INDEX idx_conversas_data ON conversas_whatsapp(data_envio);

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO clientes (nome, empresa, telefone, whatsapp, email, tipo_cliente) VALUES
('João Silva', 'Restaurante Silva', '11999887766', '11999887766', 'joao@restaurante.com', 'regular'),
('Maria Santos', 'Padaria Santos', '11888776655', '11888776655', 'maria@padaria.com', 'vip'),
('Pedro Costa', 'Mercado Costa', '11777665544', '11777665544', 'pedro@mercado.com', 'novo');

-- Mostrar as tabelas criadas
SHOW TABLES;
