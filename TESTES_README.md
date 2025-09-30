# 🧪 Scripts de Teste do Chatbot RefriAgro

Este diretório contém scripts para testar todas as funcionalidades do chatbot RefriAgro.

## 📋 Scripts Disponíveis

### 1. **run-tests.js** - Script Principal
Executa os testes principais do chatbot.

```bash
# Executar testes principais
node run-tests.js

# Executar suite completa (mais demorado)
node run-tests.js --full
```

### 2. **test-parts-flow.js** - Teste do Fluxo de Peças
Testa especificamente o fluxo de solicitação de peças.

```bash
node test-parts-flow.js
```

**O que testa:**
- ✅ Coleta de informações do equipamento
- ✅ Solicitação de fotos da peça
- ✅ Coleta de detalhes do defeito
- ✅ Geração de mensagem para técnico
- ✅ Menu de opções finais

### 3. **test-followup.js** - Teste do Sistema de Follow-up
Testa o sistema de follow-up automático.

```bash
node test-followup.js
```

**O que testa:**
- ✅ Follow-up após inatividade
- ✅ Opção de continuar atendimento
- ✅ Opção de encerrar atendimento
- ✅ Retorno ao fluxo normal

### 4. **test-human-transfer.js** - Teste de Transferência para Humano
Testa a transferência para atendente humano.

```bash
node test-human-transfer.js
```

**O que testa:**
- ✅ Transferência para humano
- ✅ Comunicação bidirecional
- ✅ Comandos do humano (/encerrar, /voltar)
- ✅ Retorno ao bot

### 5. **test-chatbot.js** - Suite Completa
Testa todos os fluxos do chatbot.

```bash
node test-chatbot.js
```

**O que testa:**
- ✅ Todos os fluxos principais
- ✅ Casos de erro
- ✅ Edge cases
- ✅ Integração completa

## 🚀 Como Executar

### Execução Rápida (Recomendado)
```bash
cd zapnode
node run-tests.js
```

### Execução Completa
```bash
cd zapnode
node run-tests.js --full
```

### Teste Específico
```bash
cd zapnode
node test-parts-flow.js
```

## 📊 O que os Testes Verificam

### ✅ Fluxo de Peças
1. **Início da conversa** - Saudação e coleta de nome
2. **Coleta de endereço** - Informações de localização
3. **Escolha de serviço** - Seleção da opção "Peças"
4. **Detalhes da peça** - Equipamento e peça com problema
5. **Solicitação de foto** - Orientação para envio de imagem
6. **Detalhes do defeito** - Descrição do problema
7. **Finalização** - Menu de opções finais

### ✅ Sistema de Follow-up
1. **Detecção de inatividade** - Timer de 3 horas
2. **Mensagem de follow-up** - Contato automático
3. **Opções de resposta** - Continuar ou encerrar
4. **Retorno ao fluxo** - Continuação normal

### ✅ Transferência para Humano
1. **Transferência** - Mudança para atendente
2. **Comunicação** - Mensagens bidirecionais
3. **Comandos** - Controle do humano
4. **Finalização** - Encerramento pelo humano

## 📈 Relatório de Testes

Cada execução gera um relatório detalhado com:

- ⏱️ **Duração total** dos testes
- 🧪 **Número total** de testes executados
- ✅ **Testes que passaram**
- ❌ **Testes que falharam**
- 📈 **Taxa de sucesso** em porcentagem
- 📋 **Detalhes** de cada teste
- 💡 **Próximos passos** recomendados

## 🔧 Configuração

Os testes usam números de telefone simulados:
- Cliente: `+5511999999999`
- Humano: `31999917243`

## 📝 Exemplo de Saída

```
🚀 INICIANDO TESTES DO FLUXO DE PEÇAS
=====================================

📱 Cliente: "Oi"
🤖 Bot: "Oi! Eu sou o RefriagroBot, o assistente da Refriagro! Como posso te ajudar hoje? Para começar, me fala seu nome, por favor?"

📱 Cliente: "João Silva"
🤖 Bot: "Obrigado, João Silva! Agora preciso saber onde você mora. Pode me falar seu endereço completo? Inclui aí o bairro ou fazenda e a cidade."

✅ TESTE CONCLUÍDO COM SUCESSO!
O fluxo de solicitação de peças está funcionando corretamente.
```

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
# Instalar dependências
npm install
```

### Erro: "Process is not defined"
```bash
# Executar com Node.js
node run-tests.js
```

### Teste falhando
1. Verifique os logs de erro
2. Confirme se o chatbot está funcionando
3. Execute teste específico para isolar o problema

## 📚 Estrutura dos Arquivos

```
zapnode/
├── test-chatbot.js          # Suite completa
├── test-parts-flow.js       # Teste de peças
├── test-followup.js         # Teste de follow-up
├── test-human-transfer.js   # Teste de transferência
├── run-tests.js            # Script principal
└── TESTES_README.md        # Este arquivo
```

## 🎯 Objetivos dos Testes

1. **Validar funcionalidades** - Garantir que tudo funciona
2. **Detectar regressões** - Encontrar problemas após mudanças
3. **Documentar comportamento** - Mostrar como o sistema funciona
4. **Facilitar desenvolvimento** - Testes rápidos durante desenvolvimento
5. **Garantir qualidade** - Confiança antes do deploy

## 💡 Dicas

- Execute testes após cada mudança no código
- Use testes específicos para debug
- Monitore os logs para entender o comportamento
- Mantenha os testes atualizados com novas funcionalidades
