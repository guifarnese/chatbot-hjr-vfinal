require('dotenv').config();

module.exports = {
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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',
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  
  // Database Configuration
  MYSQL_HOST: process.env.MYSQL_HOST || 'localhost',
  MYSQL_USER: process.env.MYSQL_USER || 'root',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'refriagro_erp',
  MYSQL_PORT: process.env.MYSQL_PORT || 3306,
  
  // Chatwoot Configuration
  CHATWOOT_URL: process.env.CHATWOOT_URL,
  CHATWOOT_ACCOUNT_ID: process.env.CHATWOOT_ACCOUNT_ID,
  CHATWOOT_API_TOKEN: process.env.CHATWOOT_API_TOKEN,
  CHATWOOT_INBOX_ID: process.env.CHATWOOT_INBOX_ID,
  
  // Technician Configuration
  TECHNICIAN_NUMBER: process.env.TECHNICIAN_NUMBER || '+553199917243'
};
