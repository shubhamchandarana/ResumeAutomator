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
  // Retry configuration for handling API failures
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000; // Start with 1 second
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Analyzing resume with Gemini API (attempt ${attempt}/${MAX_RETRIES})`);
      
      const systemPrompt = `You are an expert HR professional and resume analyzer. 
Analyze the candidate's resume against the job description and provide a comprehensive evaluation.
Respond with valid JSON in the exact format specified. Be precise with scoring.`;

      const prompt = `
Job Description:
${jobDescription}

Resume:
${resumeText}

Please analyze this resume against the job description and provide:
1. A match score from 0-100 (where 100 is perfect match) - be realistic and precise
2. A list of candidate strengths (3-5 items)
3. A list of areas for improvement or missing skills (2-4 items)  
4. A brief summary of the candidate (2-3 sentences)
5. 3-4 relevant interview questions based on the analysis

Consider technical skills, experience level, cultural fit indicators, and overall qualification level.
Score conservatively but fairly - only exceptional matches should score above 90.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              matchScore: { 
                type: "number",
                minimum: 0,
                maximum: 100
              },
              strengths: { 
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 5
              },
              weaknesses: { 
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4
              },
              summary: { 
                type: "string",
                minLength: 50
              },
              interviewQuestions: { 
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 4
              },
            },
            required: ["matchScore", "strengths", "weaknesses", "summary", "interviewQuestions"],
          },
        },
        contents: prompt,
      });

      const rawJson = response.text;
      console.log("Gemini API response received, parsing JSON...");
      
      if (!rawJson || rawJson.trim() === '') {
        throw new Error("Empty response from Gemini API");
      }

      let analysis: ResumeAnalysis;
      try {
        analysis = JSON.parse(rawJson);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Raw response:", rawJson);
        throw new Error("Invalid JSON response from Gemini API");
      }

      // Validate the response structure
      if (typeof analysis.matchScore !== 'number' || 
          analysis.matchScore < 0 || 
          analysis.matchScore > 100) {
        throw new Error("Invalid match score in API response");
      }

      if (!Array.isArray(analysis.strengths) || analysis.strengths.length === 0) {
        throw new Error("Invalid strengths array in API response");
      }

      if (!Array.isArray(analysis.weaknesses) || analysis.weaknesses.length === 0) {
        throw new Error("Invalid weaknesses array in API response");
      }

      console.log(`Resume analysis completed successfully. Match score: ${analysis.matchScore}`);
      return analysis;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === MAX_RETRIES) {
        console.error("All retry attempts exhausted");
        // Return a fallback response instead of throwing
        return {
          matchScore: 0,
          strengths: ["Unable to analyze resume - please try again"],
          weaknesses: ["AI analysis temporarily unavailable"],
          summary: "Resume analysis failed due to technical issues. Please try uploading again or contact support.",
          interviewQuestions: [
            "Can you walk me through your relevant experience for this role?",
            "What interests you most about this position?",
            "How do you approach learning new technologies?",
            "What are your career goals for the next few years?"
          ]
        };
      }
      
      // Exponential backoff delay before retry
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error("Unexpected error in resume analysis");
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
