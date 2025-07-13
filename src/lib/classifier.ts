import { GoogleGenAI } from '@google/genai';

const schema = {
  type: "object",
  properties: {
    male: {
      type: "array",
      items: {
        type: "object",
        properties: {
          full_name: {
            type: ["string", "null"]
          },
          login: {
            type: "string"
          }
        },
        required: ["login"]
      }
    },
    female: {
      type: "array",
      items: {
        type: "object",
        properties: {
          full_name: {
            type: ["string", "null"]
          },
          login: {
            type: "string"
          }
        },
        required: ["login"]
      }
    }
  },
  required: ["male", "female"]
};

export type FiltredData = {
  full_name: string,
  login: string;
}

export type returnData = {
  male: FiltredData[],
  female: FiltredData[],
}

export async function classifyUsersByGender(userData: FiltredData[]) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `You are given an array of user data in the following format: { full_name: string | null, login: string }. Your task is to analyze the full_name field and classify each user by gender (male or female) based on common name-gender associations. Use your best judgment to determine the gender from the name. Return the result as a JSON object with the structure: { male: Data[], female: Data[] }. Only include users whose gender you can confidently identify; skip those with null or ambiguous names. Input data: ${JSON.stringify(userData)}. Please return only the raw JSON response in this exact format, with no explanation or additional text: { "male": [...], "female": [...] }.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const json = JSON.parse(response.text!);
    return json;
  } catch (error) {
    console.error('Error classifying users by gender:', error);
    throw new Error('Failed to classify users by gender');
  }
}