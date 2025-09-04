import { GoogleGenerativeAI } from '@google/generative-ai';

interface PermitLookupResult {
  permitName: string;
  issuingAuthority: string;
  formUrl: string;
  notes: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      tools: [{
        googleSearchRetrieval: {}
      }]
    });
  }

  async lookupPermitRequirements(projectAddress: string, scopeOfWork: string): Promise<PermitLookupResult> {
    try {
      const systemPrompt = `You are an expert compliance assistant for construction projects in South Florida. Given a property address and a scope of work, you MUST use Google Search to find the official municipal government permit requirements for that specific city. You must return a single, minified JSON object with the following schema, and nothing else: { "permitName": string, "issuingAuthority": string, "formUrl": string, "notes": string }.`;

      const userPrompt = `Project Address: ${projectAddress}
Scope of Work: ${scopeOfWork}`;

      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response:', text);

      // Try to extract JSON object from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const permitData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields and return
      return {
        permitName: permitData.permitName || 'Building Permit',
        issuingAuthority: permitData.issuingAuthority || 'Local Building Department',
        formUrl: permitData.formUrl || '',
        notes: permitData.notes || 'Please verify requirements with local authority'
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      // Return a fallback response
      return {
        permitName: 'Building Permit',
        issuingAuthority: 'Local Building Department',
        formUrl: '',
        notes: `AI service unavailable. Please contact the local building department for permit requirements. Address: ${projectAddress}, Work: ${scopeOfWork}`
      };
    }
  }
}

export const geminiService = new GeminiService();