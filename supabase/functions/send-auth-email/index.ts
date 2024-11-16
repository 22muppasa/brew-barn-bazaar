import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  type: "signup" | "signin";
}

const getEmailContent = (type: "signup" | "signin", email: string) => {
  return type === "signup"
    ? {
        subject: "Welcome to Brew Barn - Thanks for signing up!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8B7355;">Welcome to Brew Barn!</h1>
            <p>Thank you for signing up! We're excited to have you join our coffee community.</p>
            <p>You can now enjoy:</p>
            <ul>
              <li>Exclusive coffee deals</li>
              <li>Reward points on every purchase</li>
              <li>Special member-only events</li>
            </ul>
            <p>Start exploring our menu and earn rewards today!</p>
          </div>
        `
      }
    : {
        subject: "Welcome Back to Brew Barn!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8B7355;">Welcome Back!</h1>
            <p>We're glad to see you again at Brew Barn.</p>
            <p>Don't forget to check out our latest seasonal offerings!</p>
          </div>
        `
      };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Auth email function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { email, type } = await req.json() as EmailRequest;
    console.log("Processing email request:", { email, type });

    if (!email || !type) {
      throw new Error("Missing required fields");
    }

    const emailContent = getEmailContent(type, email);
    console.log("Email content prepared");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Brew Barn <onboarding@resend.dev>",
        to: [email],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const data = await res.text();
    console.log("Resend API Response:", { status: res.status, data });

    if (!res.ok) {
      throw new Error(`Resend API error: ${data}`);
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