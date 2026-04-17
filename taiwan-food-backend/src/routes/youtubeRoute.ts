import { authenticatePreAuthToken } from '../middlewares/authMiddleware';
import { Router } from 'express';
import {commonResponses, okResponse, registry } from '../swagger';
import { z } from 'zod';
import { GetYoutubeVideoSchema, searchYoutubeVideosSchema, typeYoutubeVideosSchema } from '../schemas/youtubeSchema';
import { getTaiwanFoodVideosByQuery, getTaiwanFoodVideosIdChanel } from '../controllers/youtubeController';

const router = Router();

registry.registerPath({
  method: 'get',
  path: '/api/youtube/search',
  tags: ['YouTube'],
  request: {
    query: searchYoutubeVideosSchema // Zod sẽ check các params trên URL
  },
  summary: 'Get Taiwan food videos from YouTube',
  security: [{ preAuthToken: [] }],
  responses: { ...okResponse(z.array(GetYoutubeVideoSchema)), ...commonResponses },
});

registry.registerPath({
  method: 'get',
  path: '/api/youtube/channel',
  tags: ['YouTube'],
  summary: 'Get De nhat muu sinh from YouTube',
  request: {
    query: typeYoutubeVideosSchema // Zod sẽ check các params trên URL
  },
  security: [{ preAuthToken: [] }],
    responses: { ...okResponse(z.array(GetYoutubeVideoSchema)), ...commonResponses },
});

router.get('/search', authenticatePreAuthToken, getTaiwanFoodVideosByQuery
);

router.get('/channel', authenticatePreAuthToken, getTaiwanFoodVideosIdChanel);

export default router;