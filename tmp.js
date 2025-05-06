import { createClient } from 'ingren-email';

async function sendEmail() {
  // Create the client
  const emailClient = createClient(process.env.RESEND_API_KEY);
  
  // Send an email
  const result = await emailClient.sendEmail({
    to: 'rawmohit@gmail.com',
    subject: 'Hello Mohit',
    html: '<p>Hello world!</p>'
  });
  
  console.log(result);
}

sendEmail();