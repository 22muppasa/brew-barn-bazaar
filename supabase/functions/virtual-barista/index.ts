
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

    const { message, userId } = await req.json();
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Received request with message:', message, 'userId:', userId);

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
            content: SYSTEM_PROMPT + orderHistoryPrompt 
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
