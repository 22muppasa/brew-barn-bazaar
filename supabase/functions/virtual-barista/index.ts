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

YOUR MOST IMPORTANT TASK is to provide personalized recommendations based on customer purchase history and preferences. Use this approach:
- If the user has purchase history, analyze their preferences and recommend similar items
- Suggest complementary products to what they usually buy
- For new or guest users, offer general recommendations from our popular items

DISCOUNT CODE FUNCTIONALITY - IMPORTANT:
- Do NOT offer a discount with every message - they should feel special and meaningful 
- Only offer a discount code in these specific scenarios:
  1. When a user hasn't made a purchase in 3+ days (customer re-engagement)
  2. For first-time customers (welcome discount)
  3. When explicitly asked about deals or discounts
  4. For customers with 5+ previous orders (loyalty reward)
  5. Occasionally (~20% chance) during general conversation to surprise the customer

When you DO decide to offer a discount code:
- Be specific about the discount percentage (10-25%)
- Focus on the customer's favorite or frequently ordered items 
- For lapsed customers, offer higher discounts (20-25%)
- For loyal customers, offer standard discounts (10-15%)
- For new customers, offer welcome discounts (15%)
- Add a unique code they can use at checkout (e.g., BREW15LATTE)
- Mention the expiration (valid for one week)

PRODUCT-SPECIFIC DISCOUNTS - IMPORTANT:
- When offering discounts for specific types of products (e.g., "Latte", "Cold Brew", "Espresso"), make it clear in your response that the discount only applies to those specific products
- Always mention the product type the discount applies to, such as "This 15% discount applies only to Lattes"
- Create product-specific discount codes that clearly indicate the product type (e.g., LATTE15, COLDBREW20)
- When generating product-specific discounts, focus on:
  1. Products the customer frequently purchases (from order history)
  2. Products the customer is currently asking about
  3. Seasonal specials or featured items

When a user asks about available discounts, make sure to:
- Check if they have active discount codes and provide that information
- Clarify which products each discount applies to (if product-specific)
- Provide information on any currently running promotions
- Only generate a new discount code if appropriate based on the scenarios above

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
        
        // Calculate days since last order
        if (orderHistory.length > 0) {
          lastOrderDate = new Date(orderHistory[0].created_at);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - lastOrderDate.getTime());
          daysSinceLastOrder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    let shouldOfferDiscount = false;
    let discountReason = '';
    let favoriteProductType = '';
    
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
        
        // Extract product type from favorite item for potential product-specific discount
        const favoriteProduct = favoriteItems[0].split(' ')[0];
        // Extract generic product type (e.g., Latte, Cold Brew, Espresso)
        const productTypes = ['Latte', 'Cold Brew', 'Espresso', 'Tea', 'Mocha', 'Cappuccino', 'Americano', 'Macchiato'];
        for (const type of productTypes) {
          if (favoriteProduct.includes(type)) {
            favoriteProductType = type;
            break;
          }
        }
      }
      
      // Determine if we should offer a discount based on purchase patterns
      if (daysSinceLastOrder && daysSinceLastOrder >= 3) {
        shouldOfferDiscount = true;
        // If they have a favorite product type, offer product-specific discount
        if (favoriteProductType) {
          discountReason = `IMPORTANT: This customer hasn't ordered in ${daysSinceLastOrder} days. Offer them a special product-specific discount of 20-25% on ${favoriteProductType} items to encourage them to return.`;
        } else {
          discountReason = `IMPORTANT: This customer hasn't ordered in ${daysSinceLastOrder} days. Offer them a special discount of 20-25% to encourage them to return.`;
        }
      } else if (orderHistory.length >= 5) {
        // Loyalty discount - but make it occasional (approximately 1 in 5 interactions)
        const shouldOfferLoyaltyDiscount = Math.random() < 0.2;
        if (shouldOfferLoyaltyDiscount) {
          shouldOfferDiscount = true;
          // If they have a favorite product type, offer product-specific discount
          if (favoriteProductType) {
            discountReason = `IMPORTANT: This is a loyal customer with ${orderHistory.length} orders. Consider offering them a special product-specific loyalty discount of 10-15% on ${favoriteProductType} items.`;
          } else {
            discountReason = `IMPORTANT: This is a loyal customer with ${orderHistory.length} orders. Consider offering them a special loyalty discount of 10-15%.`;
          }
        }
      }
      
      // Add the discount reason to the prompt if applicable
      if (shouldOfferDiscount) {
        orderHistoryPrompt += `\n${discountReason}\n`;
      } else {
        orderHistoryPrompt += `\nProvide personalized recommendations based on their history, but only offer a discount if they specifically ask about deals or discounts.`;
      }
    } else if (userId) {
      // First-time customer with an account
      orderHistoryPrompt = `\nThis customer is logged in but hasn't made any purchases yet. Consider offering them a welcome discount of 15% off their first purchase.`;
      shouldOfferDiscount = true;
    } else {
      // Guest user - occasionally offer a discount
      const shouldOfferGuestDiscount = Math.random() < 0.1; // 10% chance
      if (shouldOfferGuestDiscount) {
        orderHistoryPrompt = `\nThis is a guest user. Consider offering a welcome discount to encourage them to create an account.`;
        shouldOfferDiscount = true;
      } else {
        orderHistoryPrompt = `\nThis is a guest user. Offer general recommendations from our popular items.`;
      }
    }

    // Determine if the user is explicitly asking about discounts or deals
    const isAskingForDiscount = message.toLowerCase().includes('discount') || 
                               message.toLowerCase().includes('deal') ||
                               message.toLowerCase().includes('coupon') ||
                               message.toLowerCase().includes('promo') ||
                               message.toLowerCase().includes('offer') ||
                               message.toLowerCase().includes('code');
    
    if (isAskingForDiscount) {
      shouldOfferDiscount = true;
    }

    // Check if the user is asking about a specific product type
    // This could be used to create product-specific discounts
    const productTypes = ['Latte', 'Cold Brew', 'Espresso', 'Tea', 'Mocha', 'Cappuccino', 'Americano', 'Macchiato'];
    let mentionedProductType = '';
    
    for (const type of productTypes) {
      if (message.toLowerCase().includes(type.toLowerCase())) {
        mentionedProductType = type;
        break;
      }
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
        activeCodesPrompt += `- ${code.code}: ${code.percentage}% off${code.productType ? ` on ${code.productType} items` : ''}, valid until ${expiryDate.toLocaleDateString()}\n`;
      });
      
      // If user asks about their discount codes, make sure to provide this information
      if (isAskingForDiscount) {
        activeCodesPrompt += `\nIf the user is asking about their discount codes, provide this list of active codes.`;
      }
    }

    // Create a discount context message
    let discountContextPrompt = '';
    if (shouldOfferDiscount) {
      discountContextPrompt = `\nIMPORTANT CONTEXT: In your response, you should consider offering the user a discount code.`;
      
      // If they're asking about a specific product or have a favorite product, suggest a product-specific discount
      if (mentionedProductType || favoriteProductType) {
        const productType = mentionedProductType || favoriteProductType;
        discountContextPrompt += ` Consider offering a product-specific discount for ${productType} items.`;
      }
      
      if (discountReason) {
        discountContextPrompt += ` ${discountReason}`;
      }
    } else {
      discountContextPrompt = `\nIMPORTANT CONTEXT: Do NOT offer a discount code in this response.`;
    }

    // Format chat history for the AI to maintain context
    const formattedChatHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })).slice(-10); // Keep only the last 10 messages for context

    console.log('Sending request to OpenAI with full context');
    console.log('Should offer discount:', shouldOfferDiscount);
    if (mentionedProductType) {
      console.log('User mentioned product type:', mentionedProductType);
    }
    if (favoriteProductType) {
      console.log('User\'s favorite product type:', favoriteProductType);
    }

    const messages = [
      { 
        role: 'system', 
        content: SYSTEM_PROMPT + menuItemsPrompt + orderHistoryPrompt + userProfilePrompt + activeCodesPrompt + discountContextPrompt
      },
      ...formattedChatHistory,
      { role: 'user', content: message }
    ];

    console.log('Full system prompt length:', SYSTEM_PROMPT.length + menuItemsPrompt.length + orderHistoryPrompt.length + userProfilePrompt.length + activeCodesPrompt.length + discountContextPrompt.length);

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
        !activeCodes.some(code => code.code === discountMatch[0]) && 
        shouldOfferDiscount) {
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
          
          // Check if this is a product-specific discount
          // Look for patterns like "discount on [product]" or "[product] discount"
          const productSpecificRegex = new RegExp(`(discount|off)\\s+(on|for)\\s+(?:all\\s+)?([\\w\\s]+?)\\s+(items|drinks|products|orders)`, 'i');
          const productMatch = reply.match(productSpecificRegex);
          
          if (productMatch && productMatch[3]) {
            let extractedProductType = productMatch[3].trim();
            
            // Check if the extracted text contains a known product type
            for (const knownType of productTypes) {
              if (extractedProductType.toLowerCase().includes(knownType.toLowerCase())) {
                responseData.productType = knownType;
                console.log(`Detected product-specific discount for ${knownType}`);
                break;
              }
            }
            
            // If we couldn't match a known type but have a product mentioned, use it
            if (!responseData.productType && extractedProductType) {
              // Keep just the first 15 chars max to avoid long descriptions
              responseData.productType = extractedProductType.substring(0, 15);
              console.log(`Using custom product type: ${responseData.productType}`);
            }
          }
          // Also check discount code itself for product types (e.g., LATTE15)
          else if (!responseData.productType) {
            for (const knownType of productTypes) {
              if (potentialCode.includes(knownType.toUpperCase())) {
                responseData.productType = knownType;
                console.log(`Detected product type from code: ${knownType}`);
                break;
              }
            }
          }
          
          console.log(`Detected new discount code: ${potentialCode} for ${percentage}% off${responseData.productType ? ` on ${responseData.productType}` : ''}`);
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
