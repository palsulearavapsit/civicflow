/**
 * @fileoverview Self-Documenting OpenAPI/Swagger Schema (CQ-16).
 *
 * Returns the OpenAPI 3.1.0 specification for all CivicFlow API routes.
 * Access at: GET /api/openapi
 *
 * @module app/api/openapi
 */

import { NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'CivicFlow API',
    version: '1.0.0',
    description: 'Non-partisan election guidance API powered by Google Gemini AI.',
    contact: { name: 'CivicFlow Team', url: 'https://civicflow.app' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', description: 'Current environment' },
    { url: 'https://civicflow.vercel.app', description: 'Production' },
  ],
  tags: [
    { name: 'AI', description: 'AI-powered election guidance endpoints' },
    { name: 'Security', description: 'Security and audit endpoints' },
    { name: 'Health', description: 'Health and monitoring endpoints' },
  ],
  paths: {
    '/api/chat/stream': {
      post: {
        tags: ['AI'],
        summary: 'Stream AI election guidance',
        description: 'Streams a text response from Gemini AI for election-related queries. Supports conversation history for multi-turn chat.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', minLength: 1, maxLength: 2000, description: 'The user\'s election question' },
                  history: {
                    type: 'array',
                    maxItems: 8,
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string', enum: ['user', 'model'] },
                        parts: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' } } } },
                      },
                    },
                  },
                },
              },
              example: { prompt: 'How do I register to vote in California?', history: [] },
            },
          },
        },
        responses: {
          '200': { description: 'Streaming text response', content: { 'text/plain': { schema: { type: 'string' } } } },
          '400': { description: 'Invalid request payload', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '429': { description: 'Rate limit exceeded', content: { 'application/json': { schema: { '$ref': '#/components/schemas/RateLimitError' } } } },
          '500': { description: 'Internal server error' },
        },
        security: [{ RateLimit: [] }],
      },
    },
    '/api/analyze': {
      post: {
        tags: ['AI'],
        summary: 'Analyze voter document image (multimodal)',
        description: 'Analyzes an uploaded voter ID or registration document using Gemini multimodal capabilities.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['imageBase64', 'mimeType'],
                properties: {
                  imageBase64: { type: 'string', description: 'Base64-encoded image data' },
                  mimeType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp'], description: 'MIME type of the image' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Analysis result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    documentType: { type: 'string', enum: ['voter_id', 'ballot', 'registration_form', 'unknown'] },
                    extractedText: { type: 'string' },
                    warnings: { type: 'array', items: { type: 'string' } },
                    isValid: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the current health status of all CivicFlow services.',
        responses: {
          '200': {
            description: 'All services healthy',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/HealthStatus' },
                example: { status: 'ok', version: '1.0.0', services: { ai: 'ok', firebase: 'ok' } },
              },
            },
          },
        },
      },
    },
    '/api/csp-report': {
      post: {
        tags: ['Security'],
        summary: 'CSP violation report receiver',
        description: 'Receives Content Security Policy violation reports from browsers.',
        responses: { '204': { description: 'Report received' } },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      RateLimitError: {
        allOf: [
          { '$ref': '#/components/schemas/Error' },
          { type: 'object', properties: { retryAfter: { type: 'integer', description: 'Seconds until retry is allowed' } } },
        ],
      },
      HealthStatus: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded', 'down'] },
          version: { type: 'string' },
          services: {
            type: 'object',
            properties: {
              ai: { type: 'string' },
              firebase: { type: 'string' },
            },
          },
        },
      },
    },
    securitySchemes: {
      RateLimit: { type: 'apiKey', in: 'header', name: 'X-RateLimit-Limit', description: 'Rate limiting enforced at edge' },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
