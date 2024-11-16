import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  type: "signup" | "reset";
  token: string;
}

const getEmailContent = (type: "signup" | "reset", actionUrl: string) => {
  return type === "signup" 
    ? {
        subject: "Welcome to Brew Barn - Confirm Your Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8B7355;">Welcome to Brew Barn!</h1>
            <p>Please confirm your email address by clicking the button below:</p>
            <a href="${actionUrl}" style="display: inline-block; background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Confirm Email</a>
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
            <a href="${actionUrl}" style="display: inline-block; background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `
      };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Function invoked with method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("RESEND_API_KEY is not set");
    }

    const body = await req.text();
    console.log("Raw request body:", body);
    
    const { email, type, token } = JSON.parse(body) as EmailRequest;
    console.log("Parsed request:", { email, type, token });
    
    if (!email || !type || !token) {
      console.error("Missing required fields:", { email, type, token });
      throw new Error("Missing required fields");
    }

    const baseUrl = "https://thebrewbarn.netlify.app";
    const actionUrl = type === "signup" 
      ? `${baseUrl}/auth/confirm?token=${token}`
      : `${baseUrl}/auth/reset?token=${token}`;

    console.log("Action URL generated:", actionUrl);
    const emailContent = getEmailContent(type, actionUrl);
    console.log("Email content prepared:", emailContent);

    console.log("Sending request to Resend API...");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const resBody = await res.text();
    console.log("Resend API Response Status:", res.status);
    console.log("Resend API Response Body:", resBody);

    if (!res.ok) {
      console.error("Resend API error:", resBody);
      throw new Error(`Resend API error: ${resBody}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in handler:", error);
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