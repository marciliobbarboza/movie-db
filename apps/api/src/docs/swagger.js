const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Movies API',
      version: '1.0.0'
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserCreateInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        UserUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        Movie: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            year: { type: 'integer' },
            genres: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            director: { type: 'string' },
            cast: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            duration: { type: 'integer' },
            country: { type: 'string' },
            language: { type: 'string' },
            posterUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MovieCreateInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            year: { type: 'integer' },
            genres: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            director: { type: 'string' },
            cast: { type: 'array', items: { type: 'string' } },
            rating: { type: 'number' },
            duration: { type: 'integer' },
            country: { type: 'string' },
            language: { type: 'string' },
            posterUrl: { type: 'string' }
          }
        },
        MovieUpdateInput: { $ref: '#/components/schemas/MovieCreateInput' },
        AuthLoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        AuthSignupInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        ListResponseMovie: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Movie' } },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' }
          }
        }
      }
    },
    paths: {
      '/auth/signup': {
        post: {
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthSignupInput' } } }
          },
          responses: {
            201: { description: 'ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            409: { description: 'email_in_use' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginInput' } } }
          },
          responses: {
            200: { description: 'ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'invalid_credentials' }
          }
        }
      },
      '/users': {
        get: {
          tags: ['Users'],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'ok', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } }
          }
        },
        post: {
          tags: ['Users'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCreateInput' } } }
          },
          responses: {
            201: { description: 'created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            409: { description: 'email_in_use' }
          }
        }
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 404: { description: 'not_found' } }
        },
        put: {
          tags: ['Users'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserUpdateInput' } } } },
          responses: { 200: { description: 'ok' }, 404: { description: 'not_found' } }
        },
        delete: {
          tags: ['Users'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'deleted' }, 404: { description: 'not_found' } }
        }
      },
      '/movies': {
        get: {
          tags: ['Movies'],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'year', in: 'query', schema: { type: 'integer' } },
            { name: 'genre', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
          ],
          responses: {
            200: { description: 'ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListResponseMovie' } } } }
          }
        },
        post: {
          tags: ['Movies'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieCreateInput' } } }
          },
          responses: {
            201: { description: 'created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Movie' } } } },
            409: { description: 'duplicate_movie' }
          }
        }
      },
      '/movies/{id}': {
        get: {
          tags: ['Movies'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/Movie' } } } }, 404: { description: 'not_found' } }
        },
        put: {
          tags: ['Movies'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieUpdateInput' } } } },
          responses: { 200: { description: 'ok' }, 404: { description: 'not_found' } }
        },
        delete: {
          tags: ['Movies'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'deleted' }, 404: { description: 'not_found' } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;