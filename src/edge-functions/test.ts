// Documentation: https://sdk.netlify.com/docs

export default function handler(): Response {
  return new Response("Hello, world!");
}

export const config = {
  path: "/test",
};

