import { GoogleGenAI, Type } from "@google/genai";
import { BankLookupResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const lookupBankByBIC = async (bic: string): Promise<BankLookupResult | null> => {
  if (!bic || bic.length < 8) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identify the bank name and city for the BIC (Business Identifier Code): "${bic}". 
      If the BIC is invalid or fictitious, return "Unknown" for both fields. 
      Return strictly JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bankName: { type: Type.STRING },
            city: { type: Type.STRING }
          },
          required: ["bankName", "city"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const result = JSON.parse(text) as BankLookupResult;
    
    if (result.bankName === "Unknown") return null;

    return result;
  } catch (error) {
    console.error("Gemini BIC Lookup failed:", error);
    return null;
  }
};