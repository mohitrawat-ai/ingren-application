// src/lib/config/sqs.ts
import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from "@aws-sdk/client-sqs";

// Initialize SQS client
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION ?? 'us-east-1'
});

// Queue URLs - should be set in environment variables
const QUEUE_URLS = {
  EMAIL_ENRICHMENT: process.env.SQS_EMAIL_ENRICHMENT_QUEUE_URL ?? '',
  PROFILE_ENRICHMENT: process.env.SQS_PROFILE_ENRICHMENT_QUEUE_URL ?? '',
};

// Message types for email enrichment
export interface EmailEnrichmentMessage {
  type: 'EMAIL_ENRICHMENT';
  campaignEnrollmentId: number;
  profileId: string;
  linkedinUrl: string;
  priority: 'high' | 'medium' | 'low';
  campaignId: number;
}

export interface ProfileEnrichmentMessage {
  type: 'PROFILE_ENRICHMENT';
  enrollmentProfileId: number;
  campaignEnrollmentId: number;
  profileId: string;
  linkedinUrl?: string;
  priority: 'high' | 'medium' | 'low';
  requestedAt: string;
  campaignId: number;
  tenantId: string;
  userId: string;
}

// Send single email enrichment message
export async function sendEmailEnrichmentMessage(message: EmailEnrichmentMessage): Promise<void> {
  if (!QUEUE_URLS.EMAIL_ENRICHMENT) {
    console.warn('EMAIL_ENRICHMENT queue URL not configured');
    return;
  }

  try {
    const command = new SendMessageCommand({
      QueueUrl: QUEUE_URLS.EMAIL_ENRICHMENT,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        messageType: {
          DataType: 'String',
          StringValue: message.type,
        },
        priority: {
          DataType: 'String',
          StringValue: message.priority,
        },
        campaignId: {
          DataType: 'Number',
          StringValue: message.campaignId.toString(),
        }
      },
      // Optional: Set message delay for low priority messages
      DelaySeconds: message.priority === 'low' ? 30 : 0,
    });

    const result = await sqsClient.send(command);
    console.log(`Email enrichment message sent for profile ${message.profileId}:`, result.MessageId);
  } catch (error) {
    console.error('Error sending email enrichment message:', error);
    throw error;
  }
}

// Send batch of email enrichment messages (more efficient for bulk operations)
export async function sendEmailEnrichmentBatch(messages: EmailEnrichmentMessage[]): Promise<void> {
  if (!QUEUE_URLS.EMAIL_ENRICHMENT) {
    console.warn('EMAIL_ENRICHMENT queue URL not configured');
    return;
  }

  // SQS batch limit is 10 messages
  const chunks = chunkArray(messages, 10);

  try {
    for (const chunk of chunks) {
      const command = new SendMessageBatchCommand({
        QueueUrl: QUEUE_URLS.EMAIL_ENRICHMENT,
        Entries: chunk.map((message, index) => ({
          Id: `${message.profileId}-${index}`,
          MessageBody: JSON.stringify(message),
          MessageAttributes: {
            messageType: {
              DataType: 'String',
              StringValue: message.type,
            },
            priority: {
              DataType: 'String',
              StringValue: message.priority,
            },
            campaignId: {
              DataType: 'Number',
              StringValue: message.campaignId.toString(),
            },
          },
          DelaySeconds: message.priority === 'low' ? 30 : 0,
        })),
      });

      const result = await sqsClient.send(command);
      console.log(`Batch email enrichment messages sent:`, result.Successful?.length ?? 0);
      
      if (result.Failed && result.Failed.length > 0) {
        console.error('Failed to send some messages:', result.Failed);
      }
    }
  } catch (error) {
    console.error('Error sending batch email enrichment messages:', error);
    throw error;
  }
}

// Send profile enrichment message
export async function sendProfileEnrichmentMessage(message: ProfileEnrichmentMessage): Promise<void> {
  if (!QUEUE_URLS.PROFILE_ENRICHMENT) {
    console.warn('PROFILE_ENRICHMENT queue URL not configured');
    return;
  }

  try {
    const command = new SendMessageCommand({
      QueueUrl: QUEUE_URLS.PROFILE_ENRICHMENT,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        messageType: {
          DataType: 'String',
          StringValue: message.type,
        },
        priority: {
          DataType: 'String',
          StringValue: message.priority,
        },
        campaignId: {
          DataType: 'Number',
          StringValue: message.campaignId.toString(),
        },
        tenantId: {
          DataType: 'String',
          StringValue: message.tenantId,
        },
      },
    });

    const result = await sqsClient.send(command);
    console.log(`Profile enrichment message sent for profile ${message.profileId}:`, result.MessageId);
  } catch (error) {
    console.error('Error sending profile enrichment message:', error);
    throw error;
  }
}

// Utility function to chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Export the SQS client for advanced usage
export { sqsClient };
export default QUEUE_URLS;