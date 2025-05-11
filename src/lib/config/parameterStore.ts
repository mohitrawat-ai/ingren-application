// lib/config/parameterStore.ts
import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

class ParameterStoreConfig {
  private static instance: ParameterStoreConfig;
  private ssmClient: SSMClient;
  private initialized = false;

  private constructor() {
    this.ssmClient = new SSMClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  public static getInstance(): ParameterStoreConfig {
    if (!ParameterStoreConfig.instance) {
      ParameterStoreConfig.instance = new ParameterStoreConfig();
    }
    return ParameterStoreConfig.instance;
  }

  public async loadParameters(): Promise<void> {
    // Skip if already initialized or in development
    if (this.initialized || process.env.NODE_ENV === 'development') {
      return;
    }

    try {
      const path = '/ingren/dev/';
      const command = new GetParametersByPathCommand({
        Path: path,
        Recursive: true,
        WithDecryption: true
      });

      const response = await this.ssmClient.send(command);
      const parameters = response.Parameters || [];

      // Set parameters as environment variables
      parameters.forEach(param => {
        if (param.Name && param.Value) {
          const envName = param.Name.split('/').pop();
          if (envName) {
            process.env[envName] = param.Value;
          }
        }
      });

      this.initialized = true;
      console.log('Environment variables loaded from Parameter Store');
    } catch (error) {
      console.error('Failed to load parameters from AWS Parameter Store:', error);
      throw error;
    }
  }
}

export const parameterStore = ParameterStoreConfig.getInstance();