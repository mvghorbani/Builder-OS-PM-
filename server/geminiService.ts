import { GoogleGenerativeAI } from '@google/generative-ai';

interface PermitOption {
  permitName: string;
  issuingAuthority: string;
  formUrl: string;
  estimatedFee: string;
  processingTime: string;
  notes: string;
}

interface PermitLookupResult {
  permits: PermitOption[];
  searchInfo: {
    address: string;
    city: string;
    scopeOfWork: string;
  };
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
      const systemPrompt = `You are an expert compliance assistant for construction projects. Given a property address and a scope of work, you MUST use Google Search to find the official municipal permit requirements for that specific city.

First, extract the city and state from the address. Then search for "[CITY NAME] [STATE] building permits [SCOPE OF WORK]" to find the most current requirements.

IMPORTANT: You must return ONLY a valid JSON array with permit options for the user to choose from:
[
  {
    "permitName": "string - specific permit name (e.g., 'Residential Building Permit', 'Electrical Permit')",
    "issuingAuthority": "string - exact department name (e.g., 'Miami-Dade County Building Department')",
    "formUrl": "string - direct URL to permit application or info page",
    "estimatedFee": "string - fee amount if found (e.g., '$125' or 'Contact for pricing')",
    "processingTime": "string - typical approval time (e.g., '5-10 business days')",
    "notes": "string - important requirements, documents needed, or special considerations"
  }
]

Return 1-3 most relevant permit options. Include only permits that are actually required for this type of work. Do not include any other text.`;

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

      // Try to extract JSON array from the response
      let jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // If no array found, try to find object and wrap it
        const objMatch = text.match(/\{[\s\S]*\}/);
        if (objMatch) {
          jsonMatch = [`[${objMatch[0]}]`];
        } else {
          jsonMatch = [text.trim()];
        }
      }

      try {
        const permitData = JSON.parse(jsonMatch[0]);
        
        // Ensure we have an array
        const permits = Array.isArray(permitData) ? permitData : [permitData];
        
        // Validate and normalize permit data
        const validatedPermits = permits.map((permit: any) => ({
          permitName: permit.permitName || 'Building Permit',
          issuingAuthority: permit.issuingAuthority || 'Local Building Department',
          formUrl: permit.formUrl || '',
          estimatedFee: permit.estimatedFee || 'Contact for pricing',
          processingTime: permit.processingTime || 'Contact for timeline',
          notes: permit.notes || 'Please verify requirements with local authority'
        }));

        // Extract city from address for search info
        const addressParts = projectAddress.split(',');
        const city = addressParts.length > 1 ? addressParts[1].trim() : 'Unknown City';

        return {
          permits: validatedPermits,
          searchInfo: {
            address: projectAddress,
            city: city,
            scopeOfWork: scopeOfWork
          }
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return a fallback response
        const addressParts = projectAddress.split(',');
        const city = addressParts.length > 1 ? addressParts[1].trim() : 'Unknown City';
        
        return {
          permits: [{
            permitName: 'Building Permit',
            issuingAuthority: 'Local Building Department',
            formUrl: '',
            estimatedFee: 'Contact for pricing',
            processingTime: 'Contact for timeline',
            notes: `AI lookup failed. Please contact the local building department for permit requirements. Address: ${projectAddress}, Work: ${scopeOfWork}`
          }],
          searchInfo: {
            address: projectAddress,
            city: city,
            scopeOfWork: scopeOfWork
          }
        };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      // Return a fallback response
      const addressParts = projectAddress.split(',');
      const city = addressParts.length > 1 ? addressParts[1].trim() : 'Unknown City';
      
      return {
        permits: [{
          permitName: 'Building Permit',
          issuingAuthority: 'Local Building Department',
          formUrl: '',
          estimatedFee: 'Contact for pricing',
          processingTime: 'Contact for timeline',
          notes: `AI service unavailable. Please contact the local building department for permit requirements. Address: ${projectAddress}, Work: ${scopeOfWork}`
        }],
        searchInfo: {
          address: projectAddress,
          city: city,
          scopeOfWork: scopeOfWork
        }
      };
    }
  }
}

export const geminiService = new GeminiService();