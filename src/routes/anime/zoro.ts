import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions';
import { StreamingServers } from '@consumet/extensions/dist/models';

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const zoro = new ANIME.Zoro(process.env.ZORO_URL);
  let baseUrl = "https://hianime.to";
  if(process.env.ZORO_URL){
    baseUrl = `https://${process.env.ZORO_URL}`;
  }

  fastify.get('/', (_, rp) => {
    rp.status(200).send({
      intro:
        `Welcome to the zoro provider: check out the provider's website @ ${baseUrl}`,
      routes: ['/:query', '/recent-episodes', '/top-airing', '/most-popular', '/most-favorite', '/latest-completed', '/recent-added', '/info?id', '/watch/:episodeId'],
      documentation: 'https://docs.consumet.org/#tag/zoro',
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    const page = (request.query as { page: number }).page;

    const res = await zoro.search(query, page);

    reply.status(200).send(res);
  });

  fastify.get(
    '/recent-episodes',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const page = (request.query as { page: number }).page;

      const res = await zoro.fetchRecentlyUpdated(page);

      reply.status(200).send(res);
    },
  );

  fastify.get('/top-airing', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    const res = await zoro.fetchTopAiring(page);

    reply.status(200).send(res);
  });

  fastify.get('/most-popular', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    const res = await zoro.fetchMostPopular(page);

    reply.status(200).send(res);
  });

  fastify.get('/most-favorite', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    const res = await zoro.fetchMostFavorite(page);

    reply.status(200).send(res);
  });

  fastify.get(
    '/latest-completed',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const page = (request.query as { page: number }).page;

      const res = await zoro.fetchLatestCompleted(page);

      reply.status(200).send(res);
    },
  );

  fastify.get('/recent-added', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    const res = await zoro.fetchRecentlyAdded(page);

    reply.status(200).send(res);
  });

  fastify.get('/top-upcoming', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page;

    const res = await zoro.fetchTopUpcoming(page);

    reply.status(200).send(res);
  });

  fastify.get('/schedule/:date', async (request: FastifyRequest, reply: FastifyReply) => {
    const date = (request.params as { date: string }).date;

    const res = await zoro.fetchSchedule(date);

    reply.status(200).send(res);
  });

  fastify.get('/studio/:studioId', async (request: FastifyRequest, reply: FastifyReply) => {
    const studioId = (request.params as { studioId: string }).studioId;
    const page = (request.query as { page: number }).page ?? 1;

    const res = await zoro.fetchStudio(studioId, page);

    reply.status(200).send(res);
  });

  fastify.get('/spotlight', async (request: FastifyRequest, reply: FastifyReply) => {
    const res = await zoro.fetchSpotlight();

    reply.status(200).send(res);
  });

  fastify.get('/search-suggestions/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;

    const res = await zoro.fetchSearchSuggestions(query);

    reply.status(200).send(res);
  });


  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.query as { id: string }).id;

    if (typeof id === 'undefined')
      return reply.status(400).send({ message: 'id is required' });

    try {
      const res = await zoro
        .fetchAnimeInfo(id)
        .catch((err) => reply.status(404).send({ message: err }));

      return reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  });

  const allEpisodeServers = async (request: FastifyRequest, reply: FastifyReply) => {
    let episodeId = (request.params as { episodeId: string }).episodeId;
    if(!episodeId){
      episodeId = (request.query as { episodeId: string }).episodeId;
    }

    if(typeof episodeId === 'undefined')
      return reply.status(400).send({ message: 'id is required' })

    try {
      const res = await zoro
        .fetchAllEpisodeServers(episodeId)
        .catch((err) => reply.status(404).send({ message: err }))

      return reply.status(200).send(res);
    }
    catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.'})
    }
  }

  fastify.get("/all-episode-servers", allEpisodeServers)
  fastify.get("/all-episode-servers/:episodeId", allEpisodeServers)

  const allEpisodeSources = async (request: FastifyRequest, reply: FastifyReply) => {
    let episodeId = (request.params as { episodeId: string }).episodeId;
    if(!episodeId){
      episodeId = (request.query as { episodeId: string }).episodeId;
    }

    if(typeof episodeId === 'undefined')
      return reply.status(400).send({ message: 'id is required' })

    try {
      const res = await zoro
        .fetchAllEpisodeSources(episodeId)
        .catch((err) => reply.status(404).send({ message: err }))

      return reply.status(200).send(res);
    }
    catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.'})
    }
  }
  
  fastify.get("/all-episode-sources", allEpisodeSources)
  fastify.get("/all-episode-sources/:episodeId", allEpisodeSources)

  const episodeServers = async (request: FastifyRequest, reply: FastifyReply) => {
    let episodeId = (request.params as { episodeId: string }).episodeId;
    if(!episodeId){
      episodeId = (request.query as { episodeId: string }).episodeId;
    }

    const type = (request.query as { type: "sub" | "dub" | "raw"}).type || "sub";

    if(typeof episodeId === 'undefined')
      return reply.status(400).send({ message: 'id is required' })

    if(!["sub", "dub", "raw"].includes(type)){
      return reply.status(400).send({ message: 'type param must be one of "sub", "dub", or "raw"' })
    }
    try {
      const res = await zoro
        .fetchEpisodeServers(episodeId, type)
        .catch((err) => reply.status(404).send({ message: err }))

      return reply.status(200).send(res);
    }
    catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.'})
    }
  }

  fastify.get("/episode-servers", episodeServers)
  fastify.get("/episode-servers/:episodeId", episodeServers)


  const watch = async (request: FastifyRequest, reply: FastifyReply) => {
    let episodeId = (request.params as { episodeId: string }).episodeId;
    if(!episodeId){
      episodeId = (request.query as { episodeId: string }).episodeId;
    }

    const server = (request.query as { server: string }).server;

    if (typeof episodeId === 'undefined')
      return reply.status(400).send({ message: 'id is required' });

    try {
      const res = await zoro
        .fetchEpisodeSources(episodeId, server as StreamingServers)
        .catch((err) => reply.status(404).send({ message: err }));

      reply.status(200).send(res);
    } catch (err) {
      reply
        .status(500)
        .send({ message: 'Something went wrong. Contact developer for help.' });
    }
  };
  fastify.get('/watch', watch);
  fastify.get('/watch/:episodeId', watch);
};

export default routes;
