/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // The sheet copy and saved Meta copy are read from disk at request time; ship them with the server bundle.
  outputFileTracingIncludes: { "/**": ["./data/**"] },
};
