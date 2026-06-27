import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'FLOW Water',
  slug: config.slug ?? 'flow',
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.API_BASE_URL,
  },
});
