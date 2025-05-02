import { Client } from '@elastic/elasticsearch';

// Singleton class for Elasticsearch client
class ElasticsearchClient {
  private static instance: ElasticsearchClient;
  private client: Client | null = null;

  private constructor() {}

  public static getInstance(): ElasticsearchClient {
    if (!ElasticsearchClient.instance) {
      ElasticsearchClient.instance = new ElasticsearchClient();
    }
    return ElasticsearchClient.instance;
  }

  public getClient(): Client {
    if (!this.client) {
      this.client = new Client({
        node: process.env.ELASTICSEARCH_URL,
        auth: {
          apiKey: process.env.ELASTICSEARCH_API_KEY,
        },
        tls: {
          rejectUnauthorized: true,
        },
      });
    }
    return this.client;
  }

  // Helper method to create index with mappings
  async createIndexIfNotExists(indexName: string, mappings: any): Promise<void> {
    const client = this.getClient();
    try {
      const exists = await client.indices.exists({
        index: indexName
      });

      if (!exists) {
        await client.indices.create({
          index: indexName,
          body: mappings
        });
        console.log(`Index ${indexName} created successfully`);
      }
    } catch (error) {
      console.error(`Error creating index ${indexName}:`, error);
      throw error;
    }
  }

  // Helper method to index a document
  async indexDocument(indexName: string, document: any, id?: string): Promise<any> {
    const client = this.getClient();
    const params: any = {
      index: indexName,
      body: document
    };

    if (id) {
      params.id = id;
    }

    try {
      const result = await client.index(params);
      return result;
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  // Search method
  async search(indexName: string, query: any): Promise<any> {
    const client = this.getClient();
    try {
      const result = await client.search({
        index: indexName,
        body: query
      });
      return result;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const esClient = ElasticsearchClient.getInstance();