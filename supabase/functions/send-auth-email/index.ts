import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  type: "signin" | "signup";
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Auth email function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, type } = await req.json() as EmailRequest;
    console.log("Processing email request:", { email, type });

    if (!email) {
      throw new Error("Email is required");
    }

    const subject = type === "signup" 
      ? "Welcome to Brew Barn! ☕" 
      : "Welcome Back to Brew Barn! ☕";

    const html = type === "signup"
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B7355;">Welcome to Brew Barn! ☕</h1>
          <p>Thank you for signing up! We're excited to have you join our coffee community.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our delicious menu</li>
            <li>Earn rewards on every purchase</li>
            <li>Access exclusive member benefits</li>
          </ul>
          <a href="https://thebrewbarn.netlify.app/menu" 
             style="display: inline-block; background-color: #8B7355; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Explore Our Menu
          </a>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B7355;">Welcome Back! ☕</h1>
          <p>We're glad to see you again at Brew Barn.</p>
          <p>Don't forget to check out our latest seasonal offerings!</p>
          <a href="https://thebrewbarn.netlify.app/menu" 
             style="display: inline-block; background-color: #8B7355; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Menu
          </a>
        </div>
      `;

    console.log("Sending email via Resend");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Brew Barn <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const responseText = await res.text();
    console.log("Resend API response:", {
      status: res.status,
      body: responseText
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${responseText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-auth-email function:", error);
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