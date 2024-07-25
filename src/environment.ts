/** @format */

const env = import.meta.env;
const Environment = {
  SERVER_REST: env.VITE_SERVER_REST,
  SERVER_SOCKET: env.VITE_SERVER_SOCKET,
  PARTICLE_PROJECT_ID: env.VITE_PARTICLE_PROJECT_ID,
  PARTICLE_CLIENT_KEY: env.VITE_PARTICLE_CLIENT_KEY,
  PARTICLE_APP_ID: env.VITE_PARTICLE_APP_ID,
};
export default Environment;
