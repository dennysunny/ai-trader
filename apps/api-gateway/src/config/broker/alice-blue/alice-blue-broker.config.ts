export default () => ({
  broker: {
    baseUrl: process.env.ALICE_BASE_URL,
    wsUrl: process.env.ALICE_WS_URL,
    apiKey: process.env.ALICE_API_KEY,
    userId: process.env.ALICE_USER_ID,
    accessToken: process.env.ALICE_ACCESS_TOKEN,
    source: 'API',
  },
});
