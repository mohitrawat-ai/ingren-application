import sgMail from "@sendgrid/mail";
import { v4 as uuidv4 } from "uuid";

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Send a single email
export async function sendEmail(data: {
  to: { email: string; name?: string };
  from: { email: string; name?: string };
  subject: string;
  text: string;
  html: string;
}) {
  const messageId = uuidv4();
  
  const mailData = {
    to: {
      email: data.to.email,
      name: data.to.name || '',
    },
    from: {
      email: data.from.email,
      name: data.from.name || '',
    },
    subject: data.subject,
    text: data.text,
    html: data.html,
    category: ['campaign-email'],
    customArgs: {
      messageId,
    },
  };

  try {
    await sgMail.send(mailData as any);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Send a batch of personalized emails
export async function sendBatchEmails(recipients: Array<{
  email: string;
  name?: string;
  subject: string;
  text: string;
  html: string;
}>, sender: { email: string; name?: string }) {
  // Create an array of personalized email messages
  const messages = recipients.map((recipient) => {
    const messageId = uuidv4();
    return {
      to: {
        email: recipient.email,
        name: recipient.name || '',
      },
      from: {
        email: sender.email,
        name: sender.name || '',
      },
      subject: recipient.subject,
      text: recipient.text,
      html: recipient.html,
      category: ['bulk-personalized-email'],
      customArgs: {
        messageId,
      },
    };
  });

  try {
    await sgMail.send(messages as any);
    return { success: true };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw error;
  }
}