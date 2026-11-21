# The delivery server

MLS handles the cryptography. It does not move messages between devices. That transport is your application's responsibility, and MLS4RN ships a reference server so you have one concrete, working shape to start from or learn from.

## What a delivery service does

Three jobs, all of them just moving opaque bytes:

1. **Hold key packages.** Members publish their key packages so others can add them.
2. **Relay group messages.** Store messages and hand them out in a consistent order, so every member applies commits the same way and no one's group state forks.
3. **Deliver welcomes.** When someone is added, the committer leaves a welcome for them to pick up.

Because every payload is already encrypted on the device, the server is a **blind relay**. It never parses or decrypts anything. If it is breached, the attacker gets ciphertext and public key material, nothing more.

## The reference server

The server lives in the repository under `packages/server`. It is built with NestJS and keeps everything in memory. It exists to demonstrate the contract, not to be deployed as-is.

### Run it

```bash
cd packages/server
npm install
npm run build
npm start          # http://localhost:3000
```

### The API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/key-packages` | Publish `{ userId, keyPackages[], lastResort? }` |
| `POST` | `/key-packages/:userId/claim` | Take one key package for that user |
| `GET`  | `/key-packages/:userId/available` | How many single-use packages remain |
| `POST` | `/groups/:groupId/messages` | Append a message, returns its `{ seq }` |
| `GET`  | `/groups/:groupId/messages?since=<seq>` | Messages after `since`, with a `cursor` |
| `POST` | `/welcomes` | Deposit a welcome for a user |
| `GET`  | `/welcomes/:userId` | Fetch and clear pending welcomes |

Over WebSocket (Socket.IO), a client emits `subscribe` with a `groupId` and then receives a `message` event for every message published to that group, so it does not have to poll.

### How the pieces line up with the SDK

- A member calls `client.keyPackage()` and publishes the bytes with `POST /key-packages`.
- To add someone, the committer claims a key package with `POST /key-packages/:userId/claim`, calls `group.add(...)`, posts the resulting commit to `POST /groups/:groupId/messages`, and deposits the welcome with `POST /welcomes`.
- The new member fetches its welcome from `GET /welcomes/:userId` and joins with `client.joinGroup(...)`.
- Everyone reads new messages from `GET /groups/:groupId/messages?since=...` (or the WebSocket) and feeds each one to `group.receive(...)`.

### Why ordering is a server job

Members must apply commits in the same order or their group states diverge. The server gives every message a monotonic sequence number, which is the single source of truth for order. Every member replays messages by that number and ends up in the same epoch. The SDK already handles secrecy, so this ordering is the main thing a delivery service adds: one message order that everyone agrees on.

## Using your own transport

You do not have to use this server. Anything that can store and forward byte arrays works: your existing backend, a managed queue, a WebSocket service. The reference server just shows the shape of the contract. If you build your own, keep the two properties that matter: a consistent message order per group, and a reliable way to deliver a welcome to a new member.

## Status

The reference server now supports opt-in durable storage (point it at a data directory), bearer-token auth, and HTTP rate limiting, all through environment variables and off by default so the demo still runs with no setup. The remaining production gaps are a real database in place of the JSON-file store and an authentication service that ties a token to a verified identity. See the [server reference](/reference/server) for the full endpoint details and configuration.
