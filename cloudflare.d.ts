declare module "cloudflare:workers" {
  // The platform injects the concrete bindings at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const env: any;
}

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface D1Database {
  prepare(query: string): unknown;
}
