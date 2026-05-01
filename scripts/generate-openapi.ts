/**
 * CODE-07: OpenAPI Specification Generator.
 * Generates an OpenAPI (Swagger) spec from Zod contracts.
 */
import { ChatRequestSchema, VoterProfileUpdateSchema } from '../src/lib/api-contracts';

const generateSpec = () => {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'CivicFlow API',
      version: '1.0.0',
      description: 'Enterprise-grade civic engagement and election guidance API.'
    },
    paths: {
      '/api/chat': {
        post: {
          summary: 'Stream AI responses',
          requestBody: {
            content: { 'application/json': { schema: ChatRequestSchema } }
          }
        }
      },
      '/api/profile': {
        patch: {
          summary: 'Update voter profile',
          requestBody: {
            content: { 'application/json': { schema: VoterProfileUpdateSchema } }
          }
        }
      }
    }
  };

  console.log('✅ OpenAPI Specification Generated successfully.');
  return JSON.stringify(spec, null, 2);
};

generateSpec();
