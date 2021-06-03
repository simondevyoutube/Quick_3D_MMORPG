# Server-side

Start server with:

`deno run -A --no-check --unstable ./server/src/server.ts`

The `--no-check` is simply for start-up time. Make sure to sort out type errors before running.

# Client-side

Start up the client server with:

`deno run -A --no-check --unstable https://deno.land/std@0.97.0/http/file_server.ts`

