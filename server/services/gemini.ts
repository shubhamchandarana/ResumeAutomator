import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBX4ymp0-oBgrqX_U58yUUmz31evZBoe60"
});

export interface ResumeAnalysis {
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  interviewQuestions: string[];
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
  try {
    const systemPrompt = `You are an expert HR professional and resume analyzer. 
Analyze the candidate's resume against the job description and provide a comprehensive evaluation.
Respond with JSON in the exact format specified.`;

    const prompt = `
Job Description:
${jobDescription}

Resume:
${resumeText}

Please analyze this resume against the job description and provide:
1. A match score from 0-100 (where 100 is perfect match)
2. A list of candidate strengths (3-5 items)
3. A list of areas for improvement or missing skills (2-4 items)
4. A brief summary of the candidate (2-3 sentences)
5. 3-4 relevant interview questions based on the analysis

Consider technical skills, experience level, cultural fit indicators, and overall qualification level.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matchScore: { type: "number" },
            strengths: { 
              type: "array",
              items: { type: "string" }
            },
            weaknesses: { 
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" },
            interviewQuestions: { 
              type: "array",
              items: { type: "string" }
            },
          },
          required: ["matchScore", "strengths", "weaknesses", "summary", "interviewQuestions"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const analysis: ResumeAnalysis = JSON.parse(rawJson);
      return analysis;
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error(`Failed to analyze resume: ${error}`);
  }
}

export async function generateInterviewQuestions(resumeText: string, jobTitle: string): Promise<string[]> {
  try {
    const prompt = `Based on this resume and the job title "${jobTitle}", generate 5 relevant interview questions that would help assess the candidate's fit for the role.

Resume:
${resumeText}

Focus on:
- Technical skills mentioned in the resume
- Experience gaps or areas to explore
- Behavioral questions based on their background
- Role-specific scenarios

Return the questions as a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [
      "Can you walk me through your relevant experience for this role?",
      "What interests you most about this position?",
      "How do you stay current with industry trends and technologies?",
      "Describe a challenging project you've worked on recently.",
      "What are your career goals for the next few years?"
    ];
  }
}
