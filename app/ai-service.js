const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  // Transcrever áudio para texto
  async transcribeAudio(audioBuffer) {
    try {
      console.log('🎵 Transcrevendo áudio...');

      // Salvar buffer temporariamente
      const tempPath = path.join(__dirname, '../temp_audio.ogg');
      fs.writeFileSync(tempPath, audioBuffer);

      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: "whisper-1",
        language: "pt"
      });

      // Limpar arquivo temporário
      fs.unlinkSync(tempPath);

      console.log('✅ Transcrição concluída:', transcription.text);
      return transcription.text;

    } catch (error) {
      console.error('❌ Erro na transcrição:', error.message);
      throw error;
    }
  }

  // Analisar problema e fazer triagem
  async analyzeProblem(problemDescription, customerInfo) {
    try {
      console.log('🧠 Analisando problema com IA...');

      const prompt = `
Você é um técnico especialista em equipamentos de refrigeração que trabalha principalmente com fazendeiros. 
Analise o problema descrito e forneça uma triagem detalhada usando linguagem simples e acessível.

INFORMAÇÕES DO CLIENTE:
- Nome: ${customerInfo.name}
- Localização: ${customerInfo.location}

PROBLEMA DESCRITO:
${problemDescription}

Por favor, forneça uma análise estruturada com:

1. **Tipo de Problema**: Classifique o problema (ex: vazamento, não gelar, barulho, etc.)
2. **Gravidade**: Baixa, Média, Alta ou Crítica
3. **Possíveis Causas**: Liste as causas mais prováveis em linguagem simples
4. **Peças Provavelmente Necessárias**: Quais peças podem ser necessárias (use nomes populares)
5. **Tempo Estimado de Reparo**: Tempo aproximado para solução
6. **Recomendações**: Orientações práticas para o cliente
7. **Prioridade de Atendimento**: Urgente, Normal ou Baixa

IMPORTANTE: Use linguagem simples, evite termos técnicos complexos. Seja direto e prático, como se estivesse conversando com um fazendeiro. Mantenha a qualidade técnica da análise, mas explique de forma que qualquer pessoa entenda.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um técnico especialista em equipamentos de refrigeração com 20 anos de experiência, que trabalha principalmente com fazendeiros. Use linguagem simples, direta e acessível, evitando termos técnicos complexos. Seja prático e objetivo."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const analysis = completion.choices[0].message.content;
      console.log('✅ Análise concluída');

      return analysis;

    } catch (error) {
      console.error('❌ Erro na análise:', error.message);
      throw error;
    }
  }

  // Gerar perguntas para explorar melhor o problema
  async generateFollowUpQuestions(problemDescription, customerInfo) {
    try {
      console.log('❓ Gerando perguntas de exploração...');

      const prompt = `
Com base no problema descrito, gere 3-5 perguntas específicas para explorar melhor o problema.

PROBLEMA INICIAL:
${problemDescription}

CLIENTE: ${customerInfo.name} - ${customerInfo.location}

IMPORTANTE: O cliente é um fazendeiro com pouca escolaridade. Use linguagem simples, direta e informal. Evite termos técnicos. Faça perguntas como se estivesse conversando com um amigo.

Gere perguntas que ajudem a:
- Entender melhor os sintomas (de forma simples)
- Saber quando começou o problema
- Verificar como o equipamento está sendo usado
- Conhecer o histórico do equipamento
- Determinar se é urgente

Responda apenas com as perguntas, uma por linha, sem numeração. Use linguagem coloquial e acessível.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um técnico especialista em diagnóstico de equipamentos de refrigeração que trabalha com fazendeiros. Use linguagem simples, informal e acessível. Evite termos técnicos complexos. Seja direto e prático nas perguntas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const questions = completion.choices[0].message.content;
      console.log('✅ Perguntas geradas');

      return questions.split('\n').filter(q => q.trim());

    } catch (error) {
      console.error('❌ Erro ao gerar perguntas:', error.message);
      // Perguntas padrão em caso de erro
      return [
        "Quando você percebeu que tinha problema?",
        "O equipamento tá fazendo algum barulho diferente?",
        "Você já tentou arrumar alguma coisa?",
        "O problema acontece sempre ou só às vezes?"
      ];
    }
  }

  // Verificar se a descrição do problema está completa
  async isProblemDescriptionComplete(problemDescription) {
    try {
      const prompt = `
Analise se a descrição do problema está completa para fazer um diagnóstico inicial:

DESCRIÇÃO:
${problemDescription}

Responda apenas com "COMPLETA" se a descrição contém:
- Que tipo de equipamento é
- Qual é o problema principal
- Quando começou
- Se já tentou arrumar alguma coisa

Ou "INCOMPLETA" se falta informação essencial.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um técnico especialista em diagnóstico que trabalha com fazendeiros. Use linguagem simples e direta."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 50,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content.trim();
      return response === "COMPLETA";

    } catch (error) {
      console.error('❌ Erro ao verificar completude:', error.message);
      // Por padrão, considera incompleta se houver erro
      return false;
    }
  }
}

module.exports = AIService;
