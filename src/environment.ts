/** @format */

const env = import.meta.env;
const Environment = {
  SERVER_REST: env.VITE_SERVER_REST,
  SERVER_SOCKET: env.VITE_SERVER_SOCKET,
  SERVER_ERAGON: env.VITE_SERVER_ERAGON,
};
export default Environment;
