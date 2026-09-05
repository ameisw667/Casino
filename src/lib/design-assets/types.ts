export type ImageSize = '1024x1024' | '1536x1024' | '1024x1536' | '1792x1024' | '1024x1792';

export type ImageQuality = 'low' | 'medium' | 'high';

export type ImageBackground = 'transparent' | 'opaque' | 'auto';

export type AssetCategory = 'hero' | 'icon' | 'badge' | 'background' | 'avatar' | 'ui';

export interface PromptEntry {
  name: string;
  prompt: string;
  size?: ImageSize;
  quality?: ImageQuality;
  category?: AssetCategory;
  background?: ImageBackground;
  tags?: string[];
  variables?: Record<string, string>;
  negativePrompt?: string;
}

export interface GenerationRequest {
  name: string;
  prompt: string;
  size: ImageSize;
  quality: ImageQuality;
  model: string;
  category?: AssetCategory;
  background?: ImageBackground;
}

export interface GenerationResponsePayload {
  imageBuffer: Buffer;
  meta: {
    durationMs: number;
    requestId?: string;
    model: string;
    size: ImageSize;
    quality: ImageQuality;
    attemptsMade: number;
    revisedPrompt?: string;
    rateLimitRemainingRequests?: string;
    rateLimitRemainingTokens?: string;
  };
}

export interface RetryConfig {
  maxRetries?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
  timeoutMs?: number;
}

export interface GenerationResult {
  name: string;
  version: string;
  fileName: string;
  relativePath: string;
  bytes: number;
  model: string;
  size: ImageSize;
  quality: ImageQuality;
  estimatedCostUsd: number;
  createdAt: string;
}
