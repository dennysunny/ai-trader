export default () => ({
  ai: {
    baseUrl: process.env.AI_ENGINE_URL!,
  },
  broker: {
    apiKey: process.env.ALICE_BLUE_API_KEY!,
    userId: process.env.ALICE_BLUE_USER_ID!,
  },
  redis: {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT),
  },
});
