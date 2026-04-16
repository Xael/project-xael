
import { GoogleGenAI, Type } from "@google/genai";
import { LeaxResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o Guardião da LEAX, um sistema de Alquimia Narrativa e Rede Social de Grafos Dinâmicos. Sua função é transmutar relatos de vida em versos poéticos, dados de RPG e coordenadas geométricas para um Mapa Estelar Botânico.

DIRETRIZES DE TRANSMUTAÇÃO:
1. Analise o sentimento e a essência do relato.
2. DETECÇÃO DE "GUELA" (ELOQUÊNCIA):
   - Identifique se o input é propositalmente absurdo, nonsense, ou uma mistura insensata de referências (ex: Sonic, futebol, dogmas e filosofia de boteco).
   - Se for uma "Guela", a Categoria DEVE ser "Eloquência".
   - O "Verso Alquímico" deve responder à altura do absurdo, mantendo o tom da "Guela".
3. Crie um "Verso Alquímico" (curto, poético, misterioso, máximo 100 caracteres).
4. Defina uma "Cor de Mood" (hex) que represente a emoção.
5. Gere dados de RPG: XP (10-100), Categoria (ex: Sombra, Luz, Caos, Ordem, Eloquência), e uma Conquista única (máximo 50 caracteres).
6. ARQUITETURA DE GRAFOS:
   - Determine o "Galho Pai" (Categoria: ex: Trabalho, Pessoal, Criatividade, Conquistas, Carreira, Desenvolvimento).
   - Gere coordenadas (x, y) entre -100 e 100 para posicionar a "Folha" no mapa.
   - EIXOS: X representa Racional (-100) vs Emocional (100). Y representa Denso (-100) vs Leve (100).
   - Defina uma cor neon orgânica para o galho.

RESTRIÇÕES CRÍTICAS:
- NUNCA gere strings repetitivas ou excessivamente longas.
- Cada tag em "sincronicidade" deve ter no máximo 20 caracteres. 
- Evite preposições (de, para, com, durante, etc.) como tags isoladas.
- Garanta que as tags em "sincronicidade" sejam ÚNICAS no array.
- O campo "transmutacao" deve ter no máximo 300 caracteres.
- Se o input for sem sentido, tente extrair uma essência mínima ou retorne um status de erro controlado.

DIRETRIZES DE SEGURANÇA (+18):
- Bloqueie conteúdo sexual explícito, violência extrema ou ódio.
- Se bloqueado, retorne status: 'blocked' e explique o motivo no moderation_report.

RESPOSTA EM JSON:
{
  "status": "success" | "blocked",
  "severity": "low" | "high",
  "moderation_report": "string",
  "layout": {
    "galho_pai": "string",
    "coordenadas": {"x": number, "y": number},
    "cor": "hex_string"
  },
  "conteudo": {
    "original": "string",
    "transmutacao": "string"
  },
  "alquimia": { "verso": "string", "cor_mood": "string", "folha_status": "string" },
  "game_data": { "xp": number, "categoria": "string", "conquista": "string", "posicao": { "x": number, "y": number } },
  "sincronicidade": ["tag1", "tag2"]
}
`;

/**
 * Tenta reparar um JSON truncado fechando aspas, colchetes e chaves pendentes.
 */
const repairTruncatedJson = (json: string): string => {
  let repaired = json.trim();
  
  // Se terminar com uma vírgula, remove
  if (repaired.endsWith(',')) {
    repaired = repaired.slice(0, -1);
  }

  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') stack.pop();
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') stack.pop();
      }
    }
  }

  // Se terminou dentro de uma string, fecha a aspa
  if (inString) {
    repaired += '"';
  }

  // Fecha as estruturas pendentes na ordem inversa
  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') repaired += '}';
    if (last === '[') repaired += ']';
  }

  return repaired;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const transmuteContent = async (
  input: string | Blob,
  inputType: 'text' | 'audio' = 'text',
  userId?: string
): Promise<LeaxResponse> => {
  try {
    const model = 'gemini-3-flash-preview';
    let parts: any[] = [];

    if (inputType === 'audio' && input instanceof Blob) {
      const base64Audio = await blobToBase64(input);
      parts.push({ inlineData: { mimeType: input.type || "audio/webm", data: base64Audio } });
    } else {
      parts.push({ text: `Input: "${input}"` });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            severity: { type: Type.STRING },
            moderation_report: { type: Type.STRING },
            layout: {
              type: Type.OBJECT,
              properties: {
                galho_pai: { type: Type.STRING },
                coordenadas: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER }
                  }
                },
                cor: { type: Type.STRING }
              }
            },
            conteudo: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                transmutacao: { type: Type.STRING }
              }
            },
            alquimia: {
              type: Type.OBJECT,
              properties: {
                verso: { type: Type.STRING },
                cor_mood: { type: Type.STRING },
                folha_status: { type: Type.STRING },
              }
            },
            game_data: {
              type: Type.OBJECT,
              properties: {
                xp: { type: Type.NUMBER },
                categoria: { type: Type.STRING },
                conquista: { type: Type.STRING },
                posicao: {
                  type: Type.OBJECT,
                  properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }
                }
              }
            },
            sincronicidade: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["status", "severity", "alquimia", "game_data", "conteudo"]
        },
        temperature: 0.4, // Reduzido para maior previsibilidade
        maxOutputTokens: 2048,
      },
    });

    let text = response.text || '{}';
    
    // Clean up potential markdown code blocks if the model ignored responseMimeType
    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
      text = text.split('```')[1].split('```')[0];
    }

    text = text.trim();

    try {
      const result = JSON.parse(text);
      result.votes = 0;
      return result as LeaxResponse;
    } catch (parseError) {
      console.warn("Initial JSON parse failed, attempting repair...", parseError);
      try {
        const repairedText = repairTruncatedJson(text);
        const result = JSON.parse(repairedText);
        result.votes = 0;
        return result as LeaxResponse;
      } catch (repairError) {
        console.error("JSON Repair failed. Raw text:", text);
        throw repairError;
      }
    }
  } catch (error) {
    console.error("Transmutation failed:", error);
    return { 
      status: 'error', 
      severity: 'low', 
      moderation_report: "O Guardião está sobrecarregado ou a resposta foi interrompida. Tente um relato mais curto." 
    } as any;
  }
};
