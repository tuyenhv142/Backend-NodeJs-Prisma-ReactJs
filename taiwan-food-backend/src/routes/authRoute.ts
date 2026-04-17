import { Router } from 'express';
import { getPreAuthToken, login, register } from '../controllers/authController';
import { authenticatePreAuthToken, authenticateUserToken } from '../middlewares/authMiddleware';
import { GetPreAuthTokenSchema, LoginSchema, RegisterSchema, UserSchema} from '../schemas/authSchema';
import { registry, commonResponses, okResponse, createdResponse } from '../swagger';
import { z } from 'zod';


const router = Router();

// Define API for getting pre auth token
registry.registerPath({
  method: 'post',
  path: '/api/auth/token',
  tags: ['Authentication'],
  summary: 'Get pre auth token from API Key',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GetPreAuthTokenSchema
        },
      },
    },
  },
//   security: [{ apiKeyAuth: [] }], 
  responses: okResponse(z.object({ preAuthToken: z.string() })),
});

// Define API for login
registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Login'],
  summary: 'Login with username, password and preAuthToken',
  security: [{ preAuthToken: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginSchema
        },
      },
    },
  },
  responses: okResponse(z.object({ accessToken: z.string() })),
});

//define api for register
registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Login'],
  summary: 'Register a new user with preAuthToken',
  security: [{ preAuthToken: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterSchema
        },
      },
    },
  },
  responses: { ...createdResponse(UserSchema), ...commonResponses },
});

// Use API Key to get pre auth token
router.post('/token', getPreAuthToken);
// Use username, password and pre auth token to get access token
router.post('/login', authenticatePreAuthToken, login);
//Register new user
router.post('/register', authenticatePreAuthToken, register);

export default router;