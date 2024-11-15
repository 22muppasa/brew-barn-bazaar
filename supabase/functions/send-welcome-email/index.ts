import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
}

const getEmailTemplate = (email: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7F2; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #8B7355; margin-bottom: 10px; font-size: 28px;">Welcome to Brew Barn! ☕</h1>
      <p style="color: #4A3C32; font-size: 16px; line-height: 1.6;">
        Thank you for joining our newsletter community!
      </p>
    </div>
    
    <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #8B7355; font-size: 20px; margin-bottom: 15px;">What to Expect</h2>
      <ul style="color: #4A3C32; list-style-type: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
          <span style="position: absolute; left: 0;">✨</span> Exclusive promotions and discounts
        </li>
        <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
          <span style="position: absolute; left: 0;">🆕</span> First access to new menu items
        </li>
        <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
          <span style="position: absolute; left: 0;">📝</span> Coffee brewing tips and tricks
        </li>
        <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
          <span style="position: absolute; left: 0;">🎉</span> Seasonal offerings and events
        </li>
      </ul>
    </div>
    
    <div style="text-align: center;">
      <a href="https://thebrewbarn.netlify.app/menu" 
         style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
        Explore Our Menu
      </a>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D4C5B9;">
      <p style="color: #8B7355; font-size: 14px;">
        Follow us on social media for daily updates and coffee inspiration!
      </p>
      <div style="margin-top: 10px;">
        <a href="https://thebrewbarn.netlify.app" style="color: #8B7355; text-decoration: none; margin: 0 10px;">Instagram</a>
        <a href="https://thebrewbarn.netlify.app" style="color: #8B7355; text-decoration: none; margin: 0 10px;">Facebook</a>
        <a href="https://thebrewbarn.netlify.app" style="color: #8B7355; text-decoration: none; margin: 0 10px;">Twitter</a>
      </div>
    </div>
  </div>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: EmailRequest = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Brew Barn <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Brew Barn's Newsletter! ☕",
        html: getEmailTemplate(email),
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);