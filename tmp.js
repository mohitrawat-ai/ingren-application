import { createClient } from '@mohitrawat-ai/ingren-email';

async function testSendEmail() {
  try {
    // Create the client
    const emailClient = createClient(process.env.SENDGRID_API_KEY);
    
    // Send a test email
    const result = await emailClient.sendEmail({
      to: 'rawmohit@gmail.com',
      subject: 'SendGrid Integration Test',
      html: '<h1>Hello Mohit!</h1><p>This is a test email sent via SendGrid integration.</p>',
      text: 'Hello Mohit! This is a test email sent via SendGrid integration.',
      from: 'mohit@ingren.in'
    });
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Failed to send email:', result.error);
      console.error('Details:', JSON.stringify(result.details, null, 2));
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testSendEmail().then(() => {
  console.log('Test completed');
});