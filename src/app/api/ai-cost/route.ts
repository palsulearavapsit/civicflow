/**
 * @fileoverview AI Cost Tracking Dashboard API (AI-23).
 * Returns real-time token usage, cost estimates, and model analytics.
 */

import { NextResponse } from 'next/server';

// Gemini pricing (as of 2025)
const MODEL_PRICING = {
  'gemini-2.0-flash': { input: 0.075, output: 0.30 },   // per 1M tokens
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },       // per 1M tokens
  'text-embedding-004': { input: 0.025, output: 0 },     // per 1M tokens
};

type ModelId = keyof typeof MODEL_PRICING;

// Mock usage data (in production, read from Firestore analytics collection)
const MOCK_USAGE = {
  today: {
    totalRequests: 147,
    totalInputTokens: 234_000,
    totalOutputTokens: 89_000,
    modelBreakdown: {
      'gemini-2.0-flash': { requests: 135, inputTokens: 215_000, outputTokens: 82_000 },
      'gemini-1.5-pro': { requests: 12, inputTokens: 19_000, outputTokens: 7_000 },
    } as Record<string, { requests: number; inputTokens: number; outputTokens: number }>,
  },
  thisMonth: {
    totalRequests: 3_240,
    totalInputTokens: 5_120_000,
    totalOutputTokens: 1_890_000,
  },
};

function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[modelId as ModelId];
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export async function GET() {
  const todayCost = Object.entries(MOCK_USAGE.today.modelBreakdown).reduce((total, [model, usage]) => {
    return total + calculateCost(model, usage.inputTokens, usage.outputTokens);
  }, 0);

  const monthlyCost = calculateCost(
    'gemini-2.0-flash',
    MOCK_USAGE.thisMonth.totalInputTokens * 0.9,
    MOCK_USAGE.thisMonth.totalOutputTokens * 0.9
  ) + calculateCost(
    'gemini-1.5-pro',
    MOCK_USAGE.thisMonth.totalInputTokens * 0.1,
    MOCK_USAGE.thisMonth.totalOutputTokens * 0.1
  );

  return NextResponse.json({
    today: {
      requests: MOCK_USAGE.today.totalRequests,
      inputTokens: MOCK_USAGE.today.totalInputTokens,
      outputTokens: MOCK_USAGE.today.totalOutputTokens,
      estimatedCostUsd: todayCost.toFixed(4),
      modelBreakdown: Object.entries(MOCK_USAGE.today.modelBreakdown).map(([model, data]) => ({
        model,
        requests: data.requests,
        estimatedCostUsd: calculateCost(model, data.inputTokens, data.outputTokens).toFixed(4),
      })),
    },
    thisMonth: {
      requests: MOCK_USAGE.thisMonth.totalRequests,
      estimatedCostUsd: monthlyCost.toFixed(2),
      projectedMonthTotal: (monthlyCost * 1.15).toFixed(2), // 15% growth projection
    },
    pricing: MODEL_PRICING,
    timestamp: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
