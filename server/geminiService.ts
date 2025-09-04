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
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: "MODE_DYNAMIC",
            dynamicThreshold: 0.7
          }
        }
      }]
    });
  }

  async lookupPermitRequirements(projectAddress: string, scopeOfWork: string): Promise<PermitLookupResult> {
    try {
      const systemPrompt = `You are an expert compliance assistant for construction projects in Florida. Given a property address and a scope of work, you MUST use Google Search to find the official municipal permit requirements for that specific city.

IMPORTANT: You must return ONLY a valid JSON object with the following exact schema:
{
  "permitName": "string - name of the specific permit required",
  "issuingAuthority": "string - name of the city/county department that issues this permit",
  "formUrl": "string - direct URL to the permit application form or permit information page",
  "notes": "string - any important notes about requirements, fees, or process"
}

Do not include any other text, explanations, or formatting. Return only the JSON object.`;

      const userPrompt = `Project Address: ${projectAddress}
Scope of Work: ${scopeOfWork}

Please search for and return the specific permit requirements for this project.`;

      const result = await this.model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response:', text);

      // Try to extract JSON from the response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found, try to parse the entire response
        jsonMatch = [text.trim()];
      }

      try {
        const permitData = JSON.parse(jsonMatch[0]);
        
        // Validate the response has required fields
        if (!permitData.permitName || !permitData.issuingAuthority) {
          throw new Error('Invalid response format from AI');
        }

        return {
          permitName: permitData.permitName || 'Building Permit',
          issuingAuthority: permitData.issuingAuthority || 'Local Building Department',
          formUrl: permitData.formUrl || '',
          notes: permitData.notes || 'Please verify requirements with local authority'
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return a fallback response
        return {
          permitName: 'Building Permit',
          issuingAuthority: 'Local Building Department',
          formUrl: '',
          notes: `AI lookup failed. Please contact the local building department for permit requirements. Address: ${projectAddress}, Work: ${scopeOfWork}`
        };
      }
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