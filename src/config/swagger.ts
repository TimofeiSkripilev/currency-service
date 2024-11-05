import { env } from './index';

export const swaggerConfig: Record<string, any> = {
  openapi: '3.0.0',
  info: {
    title: 'Currency Exchange API',
    version: '1.0.0',
    description: 'API for currency exchange rates'
  },
  servers: [
    {
      url: `${env.API_HOST || 'http://localhost'}:${env.PORT || 3000}`,
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully'
          },
          400: {
            description: 'Registration failed'
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login and get JWT token',
        tags: ['auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Invalid credentials'
          },
          400: {
            description: 'Login failed'
          }
        }
      }
    },
    '/api/currencies/current/{code}': {
      get: {
        summary: 'Get current rate for a specific currency',
        tags: ['currencies'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Currency code (e.g., USD, EUR)'
          }
        ],
        responses: {
          200: {
            description: 'Current rate for the specified currency',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    code: { type: 'string' },
                    name: { type: 'string' },
                    rates: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          currency_id: { type: 'integer' },
                          rate: { type: 'number' },
                          date: { type: 'string', format: 'date' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Currency not found'
          },
          500: {
            description: 'Failed to fetch rate'
          }
        }
      }
    },
    '/api/currencies/history/{code}': {
      get: {
        summary: 'Get historical rates for a specific currency',
        tags: ['currencies'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Currency code (e.g., USD, EUR)'
          }
        ],
        responses: {
          200: {
            description: 'Historical rates for the specified currency',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    code: { type: 'string' },
                    name: { type: 'string' },
                    rates: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          currency_id: { type: 'integer' },
                          rate: { type: 'number' },
                          date: { type: 'string', format: 'date' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Currency not found'
          },
          500: {
            description: 'Failed to fetch history'
          }
        }
      }
    },
    '/api/currencies/list': {
      get: {
        summary: 'Get list of available currencies',
        tags: ['currencies'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of currencies',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      code: { type: 'string' },
                      name: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Failed to fetch currency list'
          }
        }
      }
    }
  }
};