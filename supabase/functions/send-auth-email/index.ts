import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  type: "signup" | "reset";
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send auth email");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { email, type, token } = await req.json() as EmailRequest;
    console.log("Email details:", { email, type, token });

    if (!email || !type || !token) {
      throw new Error("Missing required fields");
    }

    const baseUrl = "https://thebrewbarn.netlify.app";
    const actionUrl = type === "signup" 
      ? `${baseUrl}/auth/confirm?token=${token}`
      : `${baseUrl}/auth/reset?token=${token}`;

    const emailContent = type === "signup" 
      ? {
          subject: "Welcome to Brew Barn - Confirm Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #8B7355;">Welcome to Brew Barn!</h1>
              <p>Please confirm your email address by clicking the button below:</p>
              <a href="${actionUrl}" 
                 style="display: inline-block; background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Confirm Email
              </a>
              <p>If you didn't create an account with Brew Barn, you can safely ignore this email.</p>
            </div>
          `
        }
      : {
          subject: "Reset Your Brew Barn Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #8B7355;">Reset Your Password</h1>
              <p>Click the button below to reset your password:</p>
              <a href="${actionUrl}" 
                 style="display: inline-block; background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Reset Password
              </a>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          `
        };

    console.log("Sending email via Resend API");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Brew Barn <onboarding@resend.dev>",
        to: ["onboarding@resend.dev"], // Using Resend's test email
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Resend API error: ${errorText}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);