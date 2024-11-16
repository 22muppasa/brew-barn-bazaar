import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send welcome email");
    const { email } = await req.json();
    console.log("Email to send to:", email);
    
    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not set");
    }

    if (!email) {
      throw new Error("Email is required");
    }
    
    console.log("Sending welcome email via SendGrid API");
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
          },
        ],
        from: { email: "onboarding@resend.dev", name: "Brew Barn" }, // Using Resend's verified domain
        subject: "Welcome to Brew Barn! ☕",
        content: [
          {
            type: "text/html",
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #8B7355; margin-bottom: 10px;">Welcome to Brew Barn! ☕</h1>
                  <p style="color: #666; font-size: 16px; line-height: 1.5;">
                    We're excited to have you join our coffee-loving community!
                  </p>
                </div>
                
                <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  <h2 style="color: #8B7355; margin-bottom: 15px;">What's Next?</h2>
                  <ul style="color: #666; font-size: 16px; line-height: 1.5; padding-left: 20px;">
                    <li>Explore our handcrafted coffee selection</li>
                    <li>Join our rewards program to earn points</li>
                    <li>Stay updated with our seasonal specials</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="https://thebrewbarn.netlify.app" 
                     style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
                    Visit Brew Barn
                  </a>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
                  <p>Thank you for choosing Brew Barn!</p>
                  <p>Follow us on social media for daily updates and coffee inspiration.</p>
                </div>
              </div>
            `,
          },
        ],
      }),
    });

    const responseText = await res.text();
    console.log("SendGrid API Response Status:", res.status);
    console.log("SendGrid API Response Body:", responseText);

    if (!res.ok) {
      // Check if it's a rate limit error
      if (res.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many emails sent. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`Failed to send email: ${responseText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);