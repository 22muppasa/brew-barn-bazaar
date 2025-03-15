
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

YOUR MOST IMPORTANT TASK is to provide personalized recommendations and special offers based on customer purchase history and preferences. Use this approach:
- If the user has purchase history, analyze their preferences and recommend similar items
- ALWAYS create personalized discount offers (10-20% off) on their frequently purchased items
- For users who haven't ordered in 2+ days, offer a special "We miss you" discount (15-25% off) on their favorite items
- Suggest complementary products to what they usually buy
- For new or guest users, always offer a general "welcome" discount of 10-15% off their first purchase

When mentioning a discount or special offer:
- Be specific about the discount percentage (e.g., 15% off your next Latte)
- Add a unique code they can use at checkout (e.g., BREW15LATTE)
- Mention any expiration (valid for one week)
- VARY the discount percentages between 10% and 25% to make offers feel special

DISCOUNT CODE FUNCTIONALITY:
- The user may have active discount codes stored in the system
- When a user asks about discounts, coupons, or "what are my active codes", provide a list of their currently active discount codes
- If providing a new discount code, make sure the code is UNIQUE and follows this format: [ITEM][PERCENTAGE] (e.g., LATTE15 for a 15% off latte)
- When you provide a discount code, it will be automatically added to the user's active codes
- For users with order history, provide personalized codes based on what they frequently order
- For new users, provide general welcome discount codes

RETENTION STRATEGY:
- If a user hasn't made a purchase in the last 2-5 days, create a "We miss you!" discount (15-25% off)
- For frequent customers (ordered in the last day), offer a "Thanks for being a regular!" discount (10-15% off)
- For users who ordered the same item multiple times, suggest trying a variation with a special discount

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

    const { message, userId, activeCodes = [], chatHistory = [] } = await req.json();
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Received request with message:', message, 'userId:', userId);
    console.log('Active discount codes:', activeCodes);
    console.log('Chat history length:', chatHistory.length);

    // Get user's order history if they are logged in
    let orderHistory = [];
    let lastOrderDate = null;
    let daysSinceLastOrder = null;
    
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
        
        // Calculate days since last order for retention strategy
        if (orderHistory.length > 0) {
          lastOrderDate = new Date(orderHistory[0].created_at);
          const currentDate = new Date();
          const timeDiff = currentDate.getTime() - lastOrderDate.getTime();
          daysSinceLastOrder = Math.floor(timeDiff / (1000 * 3600 * 24));
          console.log('Days since last order:', daysSinceLastOrder);
        }
      }
    }

    // Get user's profile information if available
    let userProfile = null;
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else if (profile) {
        userProfile = profile;
        console.log('Retrieved user profile:', userProfile);
      }
    }

    // Fetch the menu items from the database
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .order('category');

    if (menuError) {
      console.error('Error fetching menu items:', menuError);
    } else {
      console.log('Retrieved menu items:', menuItems?.length || 0);
    }

    // Format menu items for the AI
    let menuItemsPrompt = '';
    if (menuItems && menuItems.length > 0) {
      // Group items by category
      const itemsByCategory = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      menuItemsPrompt = `\nOur current menu includes:\n`;
      
      for (const [category, items] of Object.entries(itemsByCategory)) {
        menuItemsPrompt += `\n${category.toUpperCase()}:\n`;
        for (const item of items) {
          menuItemsPrompt += `- ${item.name} ($${item.price.toFixed(2)})`;
          if (item.description) {
            menuItemsPrompt += `: ${item.description}`;
          }
          menuItemsPrompt += `\n`;
        }
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
        
        // Add retention strategy information based on days since last order
        if (daysSinceLastOrder !== null) {
          if (daysSinceLastOrder >= 2) {
            orderHistoryPrompt += `\nIMPORTANT: This customer hasn't ordered in ${daysSinceLastOrder} days. Offer a "We miss you" discount of 15-25% on their favorite item (${favoriteItems[0].split(' ')[0]}).\n`;
          } else if (daysSinceLastOrder < 1) {
            orderHistoryPrompt += `\nThis customer ordered recently. Offer a "Thanks for being a regular!" discount of 10-15% on a complementary item to what they usually buy.\n`;
          }
        }
        
        orderHistoryPrompt += `Use this information to provide personalized recommendations and special offers.`;
      }
    } else if (userId) {
      orderHistoryPrompt = `\nThis customer is logged in but hasn't made any purchases yet. Offer them a first-time customer discount of 10-15%.`;
    } else {
      orderHistoryPrompt = `\nThis is a guest user. Offer general recommendations and a welcome discount of 10-15%.`;
    }

    // Add user profile information if available
    let userProfilePrompt = '';
    if (userProfile) {
      userProfilePrompt = `\nThis customer's name is ${userProfile.full_name || 'unknown'}.\n`;
      userProfilePrompt += `Use their name in your responses to make it more personalized.\n`;
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

    // Format chat history for the AI to maintain context
    const formattedChatHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })).slice(-10); // Keep only the last 10 messages for context

    console.log('Sending request to OpenAI with full context');

    const messages = [
      { 
        role: 'system', 
        content: SYSTEM_PROMPT + menuItemsPrompt + orderHistoryPrompt + userProfilePrompt + activeCodesPrompt
      },
      ...formattedChatHistory,
      { role: 'user', content: message }
    ];

    console.log('Full system prompt length:', SYSTEM_PROMPT.length + menuItemsPrompt.length + orderHistoryPrompt.length + userProfilePrompt.length + activeCodesPrompt.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
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
    // Enhanced regex to match reasonable discount codes
    const discountRegex = /[A-Z0-9]{4,15}/g;
    const percentageRegex = /(\d{1,2})%/;
    const discountMatch = reply.match(discountRegex);
    const percentageMatch = reply.match(percentageRegex);
    
    let responseData: any = { reply };
    
    // Ensure we always provide a discount if one isn't already applied
    if (discountMatch && percentageMatch && 
        !activeCodes.some(code => code.code === discountMatch[0])) {
      // Check if this looks like a discount code (should be capitalized and not a normal word)
      const potentialCode = discountMatch[0];
      if (potentialCode === potentialCode.toUpperCase() && 
          (reply.toLowerCase().includes('discount') || 
          reply.toLowerCase().includes('off') || 
          reply.toLowerCase().includes('code'))) {
        
        const percentage = parseInt(percentageMatch[1], 10);
        if (percentage > 0 && percentage <= 25) { // Reasonable discount range
          responseData.discountCode = potentialCode;
          responseData.discountPercentage = percentage;
          responseData.expiryDays = 7; // Default to 1 week validity
          console.log(`Detected new discount code: ${potentialCode} for ${percentage}% off`);
        }
      }
    } else if (!discountMatch && !activeCodes.length && userId) {
      // If no discount in the response, but the user should get one (retention or first time)
      let discountPercentage = 0;
      let discountCode = '';
      let discountReason = '';
      
      if (orderHistory.length > 0) {
        // For existing customers with history
        const favoriteItem = Object.entries(itemCounts || {})
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name)[0] || 'COFFEE';
        
        // We miss you discount (if no orders for 2+ days)
        if (daysSinceLastOrder && daysSinceLastOrder >= 2) {
          discountPercentage = 15 + Math.floor(Math.random() * 11); // 15-25%
          discountCode = `MISSYOU${discountPercentage}`;
          discountReason = 'We miss you! Come back and enjoy';
        } else {
          // Regular personalized discount
          discountPercentage = 10 + Math.floor(Math.random() * 11); // 10-20%
          discountCode = `${favoriteItem.replace(/\s+/g, '').substring(0, 6).toUpperCase()}${discountPercentage}`;
          discountReason = 'Here\'s a special discount for you';
        }
      } else {
        // For new customers
        discountPercentage = 10 + Math.floor(Math.random() * 6); // 10-15%
        discountCode = `WELCOME${discountPercentage}`;
        discountReason = 'Welcome to Brew Barn! Enjoy';
      }
      
      // Add discount to the response
      responseData.discountCode = discountCode;
      responseData.discountPercentage = discountPercentage;
      responseData.expiryDays = 7;
      
      // Modify the reply to include the discount
      responseData.reply = `${reply}\n\n${discountReason} ${discountPercentage}% off with code ${discountCode}, valid for one week!`;
      console.log(`Generated new discount code: ${discountCode} for ${discountPercentage}% off`);
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
