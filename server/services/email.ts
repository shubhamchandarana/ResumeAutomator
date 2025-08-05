import { MailService } from '@sendgrid/mail';

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured, email sending disabled');
      return false;
    }
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendInterviewInvite(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  interviewDate: string,
  interviewQuestions: string[]
): Promise<boolean> {
  const subject = `Interview Invitation - ${jobTitle} Position`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Congratulations ${candidateName}!</h2>
      
      <p>We're excited to inform you that you've been selected for an interview for the <strong>${jobTitle}</strong> position.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Interview Details:</h3>
        <p><strong>Date & Time:</strong> ${interviewDate}</p>
        <p><strong>Format:</strong> Video Interview</p>
        <p><strong>Duration:</strong> Approximately 45-60 minutes</p>
      </div>
      
      <h3>Preparation Materials:</h3>
      <p>To help you prepare, here are some areas we'll be discussing:</p>
      <ul>
        ${interviewQuestions.map(q => `<li>${q}</li>`).join('')}
      </ul>
      
      <p>Please confirm your availability by replying to this email.</p>
      
      <p>We look forward to speaking with you!</p>
      
      <p>Best regards,<br>
      The HR Team</p>
    </div>
  `;

  const text = `
    Congratulations ${candidateName}!
    
    You've been selected for an interview for the ${jobTitle} position.
    
    Interview Date: ${interviewDate}
    Format: Video Interview
    Duration: 45-60 minutes
    
    Preparation areas:
    ${interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
    
    Please confirm your availability by replying to this email.
    
    Best regards,
    The HR Team
  `;

  return await sendEmail({
    to: candidateEmail,
    from: 'hr@company.com',
    subject,
    html,
    text,
  });
}

export async function sendRejectionEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string
): Promise<boolean> {
  const subject = `Thank you for your application - ${jobTitle} Position`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Thank you ${candidateName}</h2>
      
      <p>Thank you for your interest in the <strong>${jobTitle}</strong> position and for taking the time to apply.</p>
      
      <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>
      
      <p>We encourage you to apply for future opportunities that match your background and experience. We'll keep your resume on file for consideration.</p>
      
      <p>We wish you the best of luck in your job search.</p>
      
      <p>Best regards,<br>
      The HR Team</p>
    </div>
  `;

  const text = `
    Thank you ${candidateName}
    
    Thank you for your interest in the ${jobTitle} position.
    
    After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.
    
    We encourage you to apply for future opportunities and wish you the best of luck in your job search.
    
    Best regards,
    The HR Team
  `;

  return await sendEmail({
    to: candidateEmail,
    from: 'hr@company.com',
    subject,
    html,
    text,
  });
}
