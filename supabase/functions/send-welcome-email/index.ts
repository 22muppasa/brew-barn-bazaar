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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: EmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Brew Barn <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Brew Barn's Newsletter!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B7355; text-align: center;">Welcome to Brew Barn! ☕</h1>
            <p style="font-size: 18px; line-height: 1.6;">
              Thank you for subscribing to our newsletter! We're excited to share our latest updates,
              exclusive offers, and coffee tips with you.
            </p>
            <p style="font-size: 18px; line-height: 1.6;">
              Stay tuned for:
              <ul>
                <li>Special promotions and discounts</li>
                <li>New menu items</li>
                <li>Coffee brewing tips and tricks</li>
                <li>Seasonal offerings</li>
              </ul>
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/menu" 
                 style="background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Browse Our Menu
              </a>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
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