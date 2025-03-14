
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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

YOUR MOST IMPORTANT TASK is to provide personalized recommendations and special offers based on customer purchase history. Use this approach:
- If the user has purchase history, analyze their preferences and recommend similar items
- Create personalized discount offers (10-20% off) on their frequently purchased items
- Suggest complementary products to what they usually buy
- For new or guest users, offer a general "welcome" discount of 10% off their first purchase

When mentioning a discount or special offer:
- Be specific about the discount percentage (e.g., 15% off your next Latte)
- Add a unique code they can use at checkout (e.g., BREW15LATTE)
- Mention any expiration (valid for one week)

DISCOUNT CODE FUNCTIONALITY:
- The user may have active discount codes stored in the system
- When a user asks about discounts, coupons, or "what are my active codes", provide a list of their currently active discount codes
- If providing a new discount code, make sure the code is UNIQUE and follows this format: [ITEM][PERCENTAGE] (e.g., LATTE15 for a 15% off latte)
- When you provide a discount code, it will be automatically added to the user's active codes
- For users with order history, provide personalized codes based on what they frequently order
- For new users, provide general welcome discount codes

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

    const { message, userId, activeCodes = [] } = await req.json();
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Received request with message:', message, 'userId:', userId);
    console.log('Active discount codes:', activeCodes);

    // Get user's order history if they are logged in
    let orderHistory = [];
    if (userId) {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching order history:', ordersError);
      } else {
        orderHistory = orders || [];
        console.log('Retrieved order history for user:', orderHistory.length, 'orders');
      }
    }

    // Format order history for the AI
    let orderHistoryPrompt = '';
    if (orderHistory.length > 0) {
      orderHistoryPrompt = `\nThis customer has the following order history:\n`;
      orderHistory.forEach((order, index) => {
        orderHistoryPrompt += `Order #${index + 1} (${new Date(order.created_at).toLocaleDateString()}):\n`;
        order.order_items.forEach((item) => {
          orderHistoryPrompt += `- ${item.product_name} x${item.quantity} ($${item.price})\n`;
        });
      });
      
      // Create a simple analysis of frequently purchased items
      const itemCounts = {};
      orderHistory.forEach(order => {
        order.order_items.forEach(item => {
          if (itemCounts[item.product_name]) {
            itemCounts[item.product_name] += item.quantity;
          } else {
            itemCounts[item.product_name] = item.quantity;
          }
        });
      });
      
      const favoriteItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name} (ordered ${count} times)`);
      
      if (favoriteItems.length > 0) {
        orderHistoryPrompt += `\nThe customer's favorite items appear to be: ${favoriteItems.join(', ')}.\n`;
        orderHistoryPrompt += `Use this information to provide personalized recommendations and special offers.`;
      }
    } else if (userId) {
      orderHistoryPrompt = `\nThis customer is logged in but hasn't made any purchases yet. Offer them a first-time customer discount.`;
    } else {
      orderHistoryPrompt = `\nThis is a guest user. Offer general recommendations and a welcome discount.`;
    }

    // Add active discount codes to the system prompt
    let activeCodesPrompt = '';
    if (activeCodes.length > 0) {
      activeCodesPrompt = `\n\nThe customer currently has the following active discount codes:\n`;
      activeCodes.forEach(code => {
        const expiryDate = new Date(code.expiry);
        activeCodesPrompt += `- ${code.code}: ${code.percentage}% off, valid until ${expiryDate.toLocaleDateString()}\n`;
      });
      
      // If user asks about their discount codes, make sure to provide this information
      if (message.toLowerCase().includes('discount') || 
          message.toLowerCase().includes('coupon') || 
          message.toLowerCase().includes('code') || 
          message.toLowerCase().includes('offer')) {
        activeCodesPrompt += `\nIf the user is asking about their discount codes, provide this list of active codes.`;
      }
    }

    console.log('Sending request to OpenAI with order history context added');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: SYSTEM_PROMPT + orderHistoryPrompt + activeCodesPrompt
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const reply = data.choices[0].message.content;
    
    // Check if a discount code is mentioned in the reply
    const discountRegex = /[A-Z0-9]{4,15}/g;
    const percentageRegex = /(\d{1,2})%/;
    const discountMatch = reply.match(discountRegex);
    const percentageMatch = reply.match(percentageRegex);
    
    let responseData: any = { reply };
    
    if (discountMatch && percentageMatch && 
        !activeCodes.some(code => code.code === discountMatch[0])) {
      // Check if this looks like a discount code (should be capitalized and not a normal word)
      const potentialCode = discountMatch[0];
      if (potentialCode === potentialCode.toUpperCase() && 
          reply.toLowerCase().includes('discount') || 
          reply.toLowerCase().includes('off') || 
          reply.toLowerCase().includes('code')) {
        
        const percentage = parseInt(percentageMatch[1], 10);
        if (percentage > 0 && percentage <= 50) { // Reasonable discount range
          responseData.discountCode = potentialCode;
          responseData.discountPercentage = percentage;
          responseData.expiryDays = 7; // Default to 1 week validity
          console.log(`Detected new discount code: ${potentialCode} for ${percentage}% off`);
        }
      }
    }

    return new Response(JSON.stringify(responseData), {
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
