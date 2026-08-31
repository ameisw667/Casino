/**
 * OpenAPI 3.1.0 Specification Generator for Casino Royale API
 *
 * Provides an authoritative, type-checked OpenAPI 3.1 schema covering
 * all 49 API route handlers across the 6 core clusters.
 */

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact?: {
      name?: string;
      url?: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
  };
}

export function getOpenApiSpec(): OpenApiSpec {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Casino Royale API',
      version: '1.0.0',
      description:
        'Production-grade Provably Fair Casino API with Atomic Postgres RPC Settlement, Standardized `{ data: T }` Envelopes, Fail-Closed Security, and Upstash Rate Limiting.',
      contact: {
        name: 'Casino Royale Engineering',
        url: 'https://casino.example.com',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current Environment (Production / Staging / Local)',
      },
    ],
    tags: [
      {
        name: 'Casino / Betting',
        description: 'Provably fair wagering, singleplayer and multiplayer rounds',
      },
      {
        name: 'User & Wallet',
        description: 'Balance snapshots, progression, and player betting history',
      },
      {
        name: 'Community & Tournaments',
        description: 'Leaderboards, daily race tournaments, and telegram integration',
      },
      {
        name: 'AI Guide & Chat',
        description: 'Casino Royale AI Guide, voice transcription, and streaming chat',
      },
      {
        name: 'Admin Suite',
        description: 'Protected administration, fraud heuristics, and game operations',
      },
      {
        name: 'Utility & Health',
        description: 'Liveness probes, seed verification, and global configuration',
      },
    ],
    components: {
      securitySchemes: {
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sb-access-token',
          description: 'Supabase JWT Session Cookie (managed via SSR)',
        },
        IdempotencyKey: {
          type: 'apiKey',
          in: 'header',
          name: 'Idempotency-Key',
          description:
            'UUID v4 Idempotency Key required on all financial and state-mutating requests.',
        },
      },
      schemas: {
        ApiSuccessEnvelope: {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              description: 'The requested payload data.',
            },
            meta: {
              type: 'object',
              properties: {
                requestId: { type: 'string', format: 'uuid' },
                timestamp: { type: 'string', format: 'date-time' },
                pagination: {
                  type: 'object',
                  properties: {
                    cursor: { type: ['string', 'null'] },
                    hasMore: { type: 'boolean' },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
        ApiErrorEnvelope: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: {
                  type: 'string',
                  example: 'INSUFFICIENT_BALANCE',
                  description: 'Machine-readable application error code.',
                },
                message: {
                  type: 'string',
                  example: 'Dein Guthaben reicht für diesen Einsatz nicht aus.',
                  description: 'Human-readable, localized error message.',
                },
                details: {
                  description: 'Optional validation details or field errors.',
                },
                requestId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Distributed tracing request ID.',
                },
              },
            },
          },
        },
        WalletSnapshot: {
          type: 'object',
          required: ['balance', 'xp', 'level', 'rank'],
          properties: {
            balance: { type: 'number', minimum: 0, example: 1250.5 },
            xp: { type: 'integer', minimum: 0, example: 450 },
            level: { type: 'integer', minimum: 1, example: 3 },
            rank: { type: 'string', example: 'Bronze' },
            transactionId: { type: 'string', format: 'uuid' },
          },
        },
        BetResult: {
          type: 'object',
          required: ['id', 'game', 'win', 'payout', 'multiplier', 'wallet'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            game: { type: 'string', enum: ['DICE', 'SLOTS', 'ROULETTE', 'CRASH', 'BLACKJACK'] },
            win: { type: 'boolean' },
            payout: { type: 'number', minimum: 0 },
            multiplier: { type: 'number', minimum: 0 },
            serverSeedHash: { type: 'string' },
            nonce: { type: 'integer' },
            wallet: { $ref: '#/components/schemas/WalletSnapshot' },
            replayed: { type: 'boolean' },
          },
        },
        HealthCheckResponse: {
          type: 'object',
          required: ['status', 'timestamp'],
          properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: '0.1.0' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Utility & Health'],
          summary: 'Service Liveness & Health Probe',
          description:
            'Validates API responsiveness, database connectivity, and environment health.',
          responses: {
            '200': {
              description: 'Service is healthy.',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/HealthCheckResponse' },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/casino/bet': {
        post: {
          tags: ['Casino / Betting'],
          summary: 'Place Bet & Settle Singleplayer Round',
          description:
            'Atomically places bets on Dice, Slots, Roulette, or Crash with server-side provably fair RNG.',
          security: [{ CookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['requestId', 'clientSeed'],
                  properties: {
                    requestId: { type: 'string', format: 'uuid' },
                    gameType: { type: 'string', enum: ['DICE', 'SLOTS', 'ROULETTE'] },
                    amount: { type: 'number', minimum: 0.1 },
                    multiplier: { type: 'number' },
                    target: { type: 'number' },
                    condition: { type: 'string', enum: ['OVER', 'UNDER'] },
                    clientSeed: { type: 'string' },
                    action: {
                      type: 'string',
                      enum: ['START_CRASH', 'CASHOUT_CRASH', 'RESOLVE_CRASH'],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Bet placed and settled successfully.',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/BetResult' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '400': {
              description: 'Invalid input or parameters.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorEnvelope' },
                },
              },
            },
            '401': {
              description: 'Authentication required.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorEnvelope' },
                },
              },
            },
            '409': {
              description: 'Insufficient balance or idempotency conflict.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorEnvelope' },
                },
              },
            },
            '503': {
              description: 'Service unavailable / Fail-closed protection.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorEnvelope' },
                },
              },
            },
          },
        },
      },
      '/api/user/balance': {
        get: {
          tags: ['User & Wallet'],
          summary: 'Get Live User Balance & Level',
          description:
            'Returns the authoritative wallet snapshot including balance, XP, and VIP rank.',
          security: [{ CookieAuth: [] }],
          responses: {
            '200': {
              description: 'Current wallet snapshot.',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/WalletSnapshot' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorEnvelope' },
                },
              },
            },
          },
        },
      },
      '/api/leaderboard': {
        get: {
          tags: ['Community & Tournaments'],
          summary: 'Get Global Highroller Leaderboard',
          description:
            'Returns top players ranked by total wagered volume across weekly, monthly, and all-time windows.',
          responses: {
            '200': {
              description: 'Leaderboard standings list.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                },
              },
            },
          },
        },
      },
      '/api/tournaments/daily-race': {
        get: {
          tags: ['Community & Tournaments'],
          summary: 'Get Daily Race Tournament Status',
          description:
            'Returns live daily tournament standings, prize pool allocation, and time remaining until UTC reset.',
          responses: {
            '200': {
              description: 'Daily race standings.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                },
              },
            },
          },
        },
      },
      '/api/admin/overview': {
        get: {
          tags: ['Admin Suite'],
          summary: 'Get Casino Admin KPI Overview',
          description:
            'Returns aggregated financial metrics, GGR, active player counts, and system status.',
          security: [{ CookieAuth: [] }],
          responses: {
            '200': {
              description: 'Admin KPIs.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                },
              },
            },
            '403': {
              description: 'Forbidden (Admin permission required).',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorEnvelope' },
                },
              },
            },
          },
        },
      },
      '/api/chat/bot-response': {
        post: {
          tags: ['AI Guide & Chat'],
          summary: 'AI Royale Guide Assistant',
          description:
            'Generates context-aware assistance, strategy tips, and rule explanations via OpenAI Responses API.',
          security: [{ CookieAuth: [] }],
          responses: {
            '200': {
              description: 'Guide answer or SSE stream.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                },
                'text/event-stream': {
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  };
}
