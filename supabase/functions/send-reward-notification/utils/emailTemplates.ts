export const generateTierUpgradeEmail = (
  email: string,
  newTier: string,
  points: number
) => ({
  from: "Brew Barn <onboarding@resend.dev>",
  to: [email],
  subject: `🌟 Congratulations! You've reached ${newTier} tier!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B7355; margin-bottom: 10px;">Congratulations! 🎉</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            You've reached ${newTier} tier with ${points} points!
          </p>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #8B7355; margin-bottom: 15px;">Your New Benefits</h2>
          ${getTierBenefits(newTier)}
        </div>
        
        <div style="text-align: center;">
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Start enjoying your new rewards today!
          </p>
          
          <div style="text-align: center;">
            <a href="https://thebrewbarn.netlify.app" 
               style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
              Visit Brew Barn
            </a>
          </div>
        </div>
    </div>
  `,
});

export const generatePointsUpdateEmail = (
  email: string,
  points: number,
  earnedPoints: number
) => ({
  from: "Brew Barn <onboarding@resend.dev>",
  to: [email],
  subject: "🎯 Your Brew Barn Rewards Update",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B7355; margin-bottom: 10px;">Rewards Update</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            You just earned ${earnedPoints} points!
          </p>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #8B7355; margin-bottom: 15px;">Current Status</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Total Points: ${points}
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Keep earning points with every purchase!
          </p>
        </div>
        
        <div style="text-align: center;">
          <div style="text-align: center;">
            <a href="https://thebrewbarn.netlify.app" 
               style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
              Visit Brew Barn
            </a>
          </div>
        </div>
    </div>
  `,
});

export const generateRewardAvailableEmail = (email: string) => ({
  from: "Brew Barn <onboarding@resend.dev>",
  to: [email],
  subject: "🎁 You've Earned a Free Reward!",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B7355; margin-bottom: 10px;">Congratulations!</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            You've earned a free reward!
          </p>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #8B7355; margin-bottom: 15px;">Your Reward</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Visit us to claim your free drink or pastry of choice!
          </p>
        </div>
        
        <div style="text-align: center;">
          <div style="text-align: center;">
            <a href="https://thebrewbarn.netlify.app" 
               style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
              Visit Brew Barn
            </a>
          </div>
        </div>
    </div>
  `,
});

const getTierBenefits = (tier: string) => {
  const benefits = {
    Silver: `
      <ul style="color: #666; font-size: 16px; line-height: 1.5; padding-left: 20px;">
        <li>1.2x points on all purchases</li>
        <li>Free drink on your birthday</li>
        <li>Exclusive monthly offers</li>
      </ul>
    `,
    Gold: `
      <ul style="color: #666; font-size: 16px; line-height: 1.5; padding-left: 20px;">
        <li>1.5x points on all purchases</li>
        <li>Free drink on your birthday</li>
        <li>Exclusive monthly offers</li>
        <li>Priority ordering</li>
      </ul>
    `,
    Platinum: `
      <ul style="color: #666; font-size: 16px; line-height: 1.5; padding-left: 20px;">
        <li>2x points on all purchases</li>
        <li>Free drink on your birthday</li>
        <li>Exclusive monthly offers</li>
        <li>Priority ordering</li>
        <li>Free size upgrades</li>
      </ul>
    `,
  };
  
  return benefits[tier as keyof typeof benefits] || '';
};