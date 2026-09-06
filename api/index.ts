import { app } from "../server/app.js";

export const maxDuration = 30;

function incomingRequest(request: Request) {
  const url = new URL(request.url);
  const forwarded =
    request.headers.get("x-forwarded-uri") ??
    request.headers.get("x-vercel-original-path") ??
    request.headers.get("x-invoke-path");
  if (!forwarded) return request;
  const path = forwarded.split("?")[0];
  if (url.pathname === "/api" && path.startsWith("/api/")) {
    url.pathname = path;
    return new Request(url, request);
  }
  return request;
}

function handle(request: Request) {
  return app.fetch(incomingRequest(request));
}

export default { fetch: handle };
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
