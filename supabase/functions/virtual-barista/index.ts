
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
- Always provide a personalized discount code in every conversation, even if the user doesn't ask for one
- If the user hasn't purchased in more than a day, create a "We miss you!" discount with a higher percentage (20-25%)
- For regular customers (purchases within last day), offer a standard loyalty discount (10-15%)
- For new or guest users, offer a general "welcome" discount of 15% off their first purchase

When mentioning a discount or special offer:
- Be specific about the discount percentage (e.g., 15% off your next Latte)
- Add a unique code they can use at checkout (e.g., BREW15LATTE)
- Mention any expiration (valid for one week)
- Keep discounts reasonable: between 10-25% based on customer status

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

    const { message, userId, activeCodes = [], chatHistory = [] } = await req.json();
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Received request with message:', message, 'userId:', userId);
    console.log('Active discount codes:', activeCodes);
    console.log('Chat history length:', chatHistory.length);

    // Get user's order history if they are logged in
    let orderHistory = [];
    let lastOrderTimestamp = null;
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
        
        // Get the most recent order timestamp
        if (orderHistory.length > 0) {
          lastOrderTimestamp = new Date(orderHistory[0].created_at);
          console.log('Last order timestamp:', lastOrderTimestamp);
        }
      }
    }

    // Calculate days since last purchase if available
    let daysSinceLastPurchase = null;
    let customerStatus = "new";
    if (lastOrderTimestamp) {
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - lastOrderTimestamp.getTime();
      daysSinceLastPurchase = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      console.log('Days since last purchase:', daysSinceLastPurchase);
      
      // Determine customer status
      if (daysSinceLastPurchase > 1) {
        customerStatus = "lapsed";
      } else {
        customerStatus = "regular";
      }
    }
    console.log('Customer status:', customerStatus);

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
    let favoriteItems = [];
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
      
      favoriteItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
      
      if (favoriteItems.length > 0) {
        orderHistoryPrompt += `\nThe customer's favorite items appear to be: ${favoriteItems.map(item => `${item.name} (ordered ${item.count} times)`).join(', ')}.\n`;
        
        // Add customer status to the prompt
        if (customerStatus === "lapsed") {
          orderHistoryPrompt += `\nThis customer hasn't made a purchase in ${daysSinceLastPurchase} days. Offer a "We miss you!" discount of 20-25% on ${favoriteItems[0].name} to encourage them to return.\n`;
        } else if (customerStatus === "regular") {
          orderHistoryPrompt += `\nThis is a regular customer who has purchased within the last day. Offer a loyalty discount of 10-15%.\n`;
        }
      }
    } else if (userId) {
      orderHistoryPrompt = `\nThis customer is logged in but hasn't made any purchases yet. Offer them a first-time customer discount of 15% off their first order.\n`;
      customerStatus = "new";
    } else {
      orderHistoryPrompt = `\nThis is a guest user. Offer a general welcome discount of 15% off their first purchase.\n`;
      customerStatus = "guest";
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
        activeCodesPrompt += `\nIf the user is asking about their discount codes, provide this list of active codes.\n`;
      }
    }

    // Generate a default discount if needed
    let defaultDiscountPrompt = '';
    if (favoriteItems.length > 0) {
      // Get favorite item
      const favItem = favoriteItems[0].name;
      
      // Determine discount percentage based on customer status
      let discountPercentage = 15; // default
      if (customerStatus === "lapsed") {
        discountPercentage = Math.floor(Math.random() * 6) + 20; // 20-25%
      } else if (customerStatus === "regular") {
        discountPercentage = Math.floor(Math.random() * 6) + 10; // 10-15%
      }
      
      // Generate a discount code for their favorite item
      const itemCodePart = favItem.replace(/\s+/g, '').toUpperCase().substring(0, 5);
      const discountCode = `${itemCodePart}${discountPercentage}`;
      
      defaultDiscountPrompt = `\nEven if the user doesn't ask for a discount, make sure to offer this special discount in your response: ${discountPercentage}% off their next ${favItem} with code ${discountCode}.\n`;
    } else {
      // For new users without favorite items
      const discountPercentage = 15;
      defaultDiscountPrompt = `\nEven if the user doesn't ask for a discount, make sure to offer this welcome discount in your response: ${discountPercentage}% off their first purchase with code WELCOME15.\n`;
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
        content: SYSTEM_PROMPT + menuItemsPrompt + orderHistoryPrompt + userProfilePrompt + activeCodesPrompt + defaultDiscountPrompt
      },
      ...formattedChatHistory,
      { role: 'user', content: message }
    ];

    console.log('Full system prompt length:', SYSTEM_PROMPT.length + menuItemsPrompt.length + orderHistoryPrompt.length + userProfilePrompt.length + activeCodesPrompt.length + defaultDiscountPrompt.length);

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
          (reply.toLowerCase().includes('discount') || 
          reply.toLowerCase().includes('off') || 
          reply.toLowerCase().includes('code'))) {
        
        const percentage = parseInt(percentageMatch[1], 10);
        if (percentage > 0 && percentage <= 50) { // Reasonable discount range
          responseData.discountCode = potentialCode;
          responseData.discountPercentage = percentage;
          responseData.expiryDays = 7; // Default to 1 week validity
          console.log(`Detected new discount code: ${potentialCode} for ${percentage}% off`);
        }
      }
    }
    
    // If no discount code was detected in the response but we should have one
    if (!responseData.discountCode) {
      // Generate a fallback discount code
      if (favoriteItems.length > 0) {
        const favItem = favoriteItems[0].name;
        let discountPercentage = 15; // default
        
        if (customerStatus === "lapsed") {
          discountPercentage = Math.floor(Math.random() * 6) + 20; // 20-25%
        } else if (customerStatus === "regular") {
          discountPercentage = Math.floor(Math.random() * 6) + 10; // 10-15%
        }
        
        const itemCodePart = favItem.replace(/\s+/g, '').toUpperCase().substring(0, 5);
        const discountCode = `${itemCodePart}${discountPercentage}`;
        
        responseData.discountCode = discountCode;
        responseData.discountPercentage = discountPercentage;
        responseData.expiryDays = 7;
        
        // Add the discount information to the reply
        responseData.reply += `\n\nHere's a special offer for you: ${discountPercentage}% off your next ${favItem} with code ${discountCode}. Valid for one week!`;
        
        console.log(`Generated fallback discount code: ${discountCode} for ${discountPercentage}% off`);
      } else {
        // For new users without favorite items
        const discountPercentage = 15;
        responseData.discountCode = "WELCOME15";
        responseData.discountPercentage = discountPercentage;
        responseData.expiryDays = 7;
        
        // Add the discount information to the reply
        responseData.reply += `\n\nHere's a welcome offer for you: ${discountPercentage}% off your first purchase with code WELCOME15. Valid for one week!`;
        
        console.log(`Generated fallback welcome discount code: WELCOME15 for 15% off`);
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
