# TODO - Fix Vercel publishing/data persistence

- [x] Replace in-memory `/api/data` with persistent storage (Vercel KV) so published data survives redeploy/cold starts.
- [x] Update `api/data.js` to read/write a single KV key that matches the client contract.
- [x] Add required dependency for Vercel KV and adjust runtime for the API route.
- [x] Run local checks (node lint/basic run) to ensure no syntax errors.
- [x] Add error handling for KV `NOT_FOUND` error when key doesn't exist.
- [ ] (Post-deploy) Validate `GET /api/data` and `POST /api/data` from the browser DevTools.



