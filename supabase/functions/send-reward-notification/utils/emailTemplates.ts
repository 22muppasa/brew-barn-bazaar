export const getTierBenefits = (tier: string) => {
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
    <ul style="list-style-type: none; padding: 0; margin: 0;">
      ${tierBenefits.map(benefit => `
        <li style="margin-bottom: 12px; padding: 12px; background-color: #FAF7F2; border-radius: 4px; color: #4A3C32;">
          ✨ ${benefit}
        </li>
      `).join('')}
    </ul>
  `;
};

export const getNextTierMessage = (points: number) => {
  if (points < 100) {
    return `You're only ${100 - points} points away from reaching Silver tier!`;
  } else if (points < 500) {
    return `You're ${500 - points} points away from reaching Gold tier!`;
  } else if (points < 1000) {
    return `You're ${1000 - points} points away from reaching Platinum tier!`;
  }
  return "You're at our highest tier! Keep enjoying the exclusive benefits!";
};

export const getEmailTemplate = (data: any, userProfile: any) => {
  const baseStyles = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7F2; border-radius: 8px;">
  `;

  const templates = {
    tier_upgrade: {
      subject: `🎉 Congratulations on Reaching ${data.newTier} Tier!`,
      html: `
        ${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B7355; margin-bottom: 10px; font-size: 28px;">
              Congratulations ${userProfile.full_name}! 🎉
            </h1>
            <p style="color: #4A3C32; font-size: 16px; line-height: 1.6;">
              You've reached our ${data.newTier} Tier! Here are your enhanced benefits:
            </p>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            ${getTierBenefits(data.newTier)}
          </div>
          
          <div style="text-align: center;">
            <a href="https://thebrewbarn.netlify.app/rewards" 
               style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
              View Your Rewards
            </a>
          </div>
        </div>
      `
    },
    points_reminder: {
      subject: "Don't Forget Your Reward Points! ⭐",
      html: `
        ${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B7355; margin-bottom: 10px; font-size: 28px;">
              Hello ${userProfile.full_name}! ☕
            </h1>
            <p style="color: #4A3C32; font-size: 16px; line-height: 1.6;">
              You currently have <strong>${data.points} points</strong>!
            </p>
            <p style="color: #4A3C32; font-size: 16px; line-height: 1.6;">
              ${getNextTierMessage(data.points)}
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://thebrewbarn.netlify.app/menu" 
               style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
              Order Now
            </a>
          </div>
        </div>
      `
    },
    reward_available: {
      subject: "🎁 Your Free Reward is Waiting!",
      html: `
        ${baseStyles}
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B7355; margin-bottom: 10px; font-size: 28px;">
              Hello ${userProfile.full_name}! 🎁
            </h1>
            <p style="color: #4A3C32; font-size: 16px; line-height: 1.6;">
              You have a free reward waiting to be claimed! Don't miss out on your special treat.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://thebrewbarn.netlify.app/rewards" 
               style="display: inline-block; background-color: #8B7355; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">
              Claim Your Reward
            </a>
          </div>
        </div>
      `
    }
  };

  return templates[data.type as keyof typeof templates];
};