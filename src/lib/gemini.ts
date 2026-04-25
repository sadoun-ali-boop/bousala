import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SDGScore {
  goal: number;
  title: string;
  score: number; // 0-100
  evidence: string;
  link: string; // UN SDG official link
}

export interface ASAMQuadrant {
  title: string;
  score: number; // 0-25
  details: string;
  kpi: string;
}

export interface AnalysisResult {
  summary: string;
  keyThemes: string[];
  methodology: string;
  results: string;
  suggestions: string[];
  keywords: string[];
  sdgScores: SDGScore[];
  overallSdgAlignment: number;
  sdgRecommendations: string[];
  asamMatrix: {
    strategicAlignment: ASAMQuadrant;
    ecoDesign: ASAMQuadrant;
    humanImpact: ASAMQuadrant;
    viability: ASAMQuadrant;
    totalAlignment: number; // 0-100
  };
}

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function chatAboutResearch(
  message: string,
  history: ChatMessage[],
  thesisContext?: string,
  language: string = "auto"
): Promise<string> {
  const model = "gemini-3.1-flash-lite-preview"; 
  
  const systemInstruction = `You are "Bousla" (Compass), an intelligent academic assistant for students at University of El Oued.
  Your mission is to help students connect their academic research (theses) with Sustainable Development Goals (SDGs).
  ${thesisContext ? `Current research context: ${thesisContext}` : ""}
  If language is set to "auto", detect the user's language and respond in the same language. 
  Otherwise, respond in the requested language: ${language}.
  Be encouraging, academic, and insightful. Encourage solutions that serve the environment and the local community.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction,
    }
  });

  return response.text || (language === "Arabic" || language === "ar" ? "عذراً، لم أستطع معالجة طلبك حالياً." : "Sorry, I couldn't process your request at this time.");
}

export async function analyzeAbstract(
  text: string, 
  language: string = "auto",
  images?: { data: string; mimeType: string }[]
): Promise<AnalysisResult> {
  const parts: any[] = [
    { text: `Analyze the following research ${images?.length ? "images and text" : "abstract"} and evaluate its alignment with Sustainable Development Goals (SDGs). Use the ASAM Matrix (Executive Design version) for deep evaluation.\n\nText: ${text}` }
  ];

  if (images) {
    images.forEach(img => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });
  }

  const response = await ai.models.generateContent({
    model: images?.length ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: `You are an academic expert specialized in scientific research analysis, SDG standards, and the ASAM Matrix. 
      Analyze the provided content (text and/or images of a thesis) and extract the requested information. 
      Evaluate the thesis against the 17 SDGs, providing an alignment score (0-100) for each relevant goal with evidence.
      Also calculate the ASAM Matrix (Executive Design version) alignment (Strategic, Eco-Design, Human-Centric, Viability).
      
      For each SDG identified, provide the official UN SDG link in the format: https://sdgs.un.org/goals/goalX (where X is the number).

      OUTPUT LANGUAGE: If requested language is "auto", detect and use the abstract's language. Otherwise use: ${language}.
      All fields in the JSON response MUST be in the target language.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
          methodology: { type: Type.STRING },
          results: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          sdgScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                goal: { type: Type.NUMBER, description: "SDG goal number from 1 to 17" },
                title: { type: Type.STRING, description: "Name/title of the goal in target language" },
                score: { type: Type.NUMBER, description: "Alignment score from 0 to 100" },
                evidence: { type: Type.STRING, description: "Evidence from the text/images for this alignment" },
                link: { type: Type.STRING, description: "Direct link to official UN SDG goal page" }
              },
              required: ["goal", "title", "score", "evidence", "link"]
            }
          },
          overallSdgAlignment: { type: Type.NUMBER },
          sdgRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          asamMatrix: {
            type: Type.OBJECT,
            properties: {
              strategicAlignment: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  details: { type: Type.STRING },
                  kpi: { type: Type.STRING }
                },
                required: ["title", "score", "details", "kpi"]
              },
              ecoDesign: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  details: { type: Type.STRING },
                  kpi: { type: Type.STRING }
                },
                required: ["title", "score", "details", "kpi"]
              },
              humanImpact: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  details: { type: Type.STRING },
                  kpi: { type: Type.STRING }
                },
                required: ["title", "score", "details", "kpi"]
              },
              viability: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  details: { type: Type.STRING },
                  kpi: { type: Type.STRING }
                },
                required: ["title", "score", "details", "kpi"]
              },
              totalAlignment: { type: Type.NUMBER }
            },
            required: ["strategicAlignment", "ecoDesign", "humanImpact", "viability", "totalAlignment"]
          }
        },
        required: ["summary", "keyThemes", "methodology", "results", "suggestions", "keywords", "sdgScores", "overallSdgAlignment", "sdgRecommendations", "asamMatrix"],
      },
    },
  });

  let resultText = response.text;
  if (!resultText) {
    throw new Error(language === "Arabic" || language === "ar" ? "لم يتم استلام رد من الذكاء الاصطناعي" : "No response received from AI");
  }

  // Clean the response from markdown code blocks if present
  resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(resultText) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI JSON:", resultText);
    throw new Error(language === "Arabic" || language === "ar" ? "فشل في معالجة بيانات التحليل" : "Failed to parse analysis data");
  }
}
