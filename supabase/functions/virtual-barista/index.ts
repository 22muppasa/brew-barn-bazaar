import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a friendly and knowledgeable virtual barista at The Brew Barn coffee shop. Your role is to:
- Help customers choose drinks from our menu
- Answer questions about coffee and our offerings
- Share interesting coffee facts and occasional coffee-related jokes
- Keep responses concise and friendly
- If asked about prices or menu items, refer to these items and prices:
  * Espresso ($3.50)
  * Americano ($4.00)
  * Latte ($4.50)
  * Cappuccino ($4.50)
  * Cold Brew ($4.50)
  * Mocha ($5.00)
  * Tea ($3.50)
  * Hot Chocolate ($4.00)
Always maintain a warm, welcoming tone while being informative and helpful.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { message } = await req.json();
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Sending request to OpenAI with message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in virtual-barista function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});