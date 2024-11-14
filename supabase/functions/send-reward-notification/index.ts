import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  userId: string;
  type: "tier_upgrade" | "points_reminder" | "reward_available";
  newTier?: string;
  points?: number;
}

const getEmailTemplate = (data: EmailData, userProfile: any) => {
  const templates = {
    tier_upgrade: {
      subject: `🎉 Congratulations! You've reached ${data.newTier} Tier!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B7355; text-align: center;">Congratulations ${userProfile.full_name}! 🎉</h1>
          <p style="font-size: 18px; line-height: 1.6;">
            You've just reached our ${data.newTier} Tier! This means you'll now enjoy even more amazing benefits:
          </p>
          ${getTierBenefits(data.newTier)}
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/rewards" 
               style="background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              View Your Rewards
            </a>
          </div>
        </div>
      `
    },
    points_reminder: {
      subject: "Don't forget about your reward points!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B7355; text-align: center;">Hello ${userProfile.full_name}! ☕</h1>
          <p style="font-size: 18px; line-height: 1.6;">
            You currently have ${data.points} points! 
            ${getNextTierMessage(data.points)}
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/menu" 
               style="background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Order Now
            </a>
          </div>
        </div>
      `
    },
    reward_available: {
      subject: "🎁 You have a reward waiting!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B7355; text-align: center;">Hello ${userProfile.full_name}! 🎁</h1>
          <p style="font-size: 18px; line-height: 1.6;">
            You have a free reward waiting to be claimed! Don't forget to use it on your next visit.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/rewards" 
               style="background-color: #8B7355; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              View Your Rewards
            </a>
          </div>
        </div>
      `
    }
  };

  return templates[data.type];
};

const getTierBenefits = (tier: string) => {
  const benefits = {
    'Silver': [
      'Earn 1.2 points per dollar spent',
      'Free Cappuccino monthly',
      'Birthday reward doubled'
    ],
    'Gold': [
      'Earn 1.5 points per dollar spent',
      'Free Caramel Latte monthly',
      'Priority ordering'
    ],
    'Platinum': [
      'Earn 2 points per dollar spent',
      'Free Frappuccino weekly',
      'Exclusive seasonal items early access'
    ]
  };

  const tierBenefits = benefits[tier as keyof typeof benefits] || [];
  return `
    <ul style="list-style-type: none; padding: 0;">
      ${tierBenefits.map(benefit => `
        <li style="margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
          ✨ ${benefit}
        </li>
      `).join('')}
    </ul>
  `;
};

const getNextTierMessage = (points: number) => {
  if (points < 100) {
    return `You're only ${100 - points} points away from reaching Silver tier!`;
  } else if (points < 500) {
    return `You're ${500 - points} points away from reaching Gold tier!`;
  } else if (points < 1000) {
    return `You're ${1000 - points} points away from reaching Platinum tier!`;
  }
  return "You're at our highest tier! Keep enjoying the exclusive benefits!";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const emailData: EmailData = await req.json();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', emailData.userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const template = getEmailTemplate(emailData, profile);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Coffee Shop <rewards@your-domain.com>", // Replace with your validated domain
        to: [profile.email],
        subject: template.subject,
        html: template.html,
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
    console.error("Error in send-reward-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);