/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // The snapshot is read from disk at request time; ship it with the server bundle.
  outputFileTracingIncludes: { "/**": ["./data/snapshot/**"] },
};
