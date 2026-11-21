# Delivery server reference

The reference delivery service, in `packages/server`. It is a NestJS app that acts as a blind relay: it stores and forwards opaque bytes and never parses or decrypts anything. For the concepts and how it lines up with the SDK, see [The delivery server](/guide/delivery-server).

::: warning
This is a reference implementation. Storage is in memory (lost on restart) and there is no authentication or rate limiting. It demonstrates the contract, not a production deployment.
:::

## Run

```bash
cd packages/server
npm install
npm run build
npm start          # http://localhost:3000  (set PORT to change)
```

## HTTP endpoints

### Key packages

Members publish key packages so others can add them. Claims are single-use, with an optional last-resort fallback.

| Method | Path | Body / query | Returns |
| --- | --- | --- | --- |
| `POST` | `/key-packages` | `{ userId, keyPackages[], lastResort? }` | ok |
| `POST` | `/key-packages/:userId/claim` | | one key package for that user |
| `GET`  | `/key-packages/:userId/available` | | count of remaining single-use packages |

### Group messages

An ordered, append-only log per group. Every message gets a monotonic sequence number, which gives all members one consistent order to apply commits in.

| Method | Path | Body / query | Returns |
| --- | --- | --- | --- |
| `POST` | `/groups/:groupId/messages` | `{ message, sender? }` | `{ seq }` |
| `GET`  | `/groups/:groupId/messages` | `?since=<seq>` | `{ messages, cursor }` |

### Welcomes

A per-user inbox. A committer deposits a welcome for a newly added member; the joiner fetches and clears it.

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/welcomes` | `{ userId, groupId, welcome, ratchetTree }` | ok |
| `GET`  | `/welcomes/:userId` | | pending welcomes, then clears them |

## WebSocket

Over Socket.IO, a client emits `subscribe` with `{ groupId }` and then receives a `message` event for every message published to that group. This is the live-push alternative to polling `GET /groups/:groupId/messages`.

## Test

```bash
npm test
```

The end-to-end suite boots the server and runs a real two-client MLS conversation through it using `mls-ts`: publish and claim a key package, add a member, relay the welcome and commit, then send and decrypt an application message. It also covers ordering, the welcome inbox, and WebSocket push.

## Toward production

A real deployment of this contract would add, at least:

- durable storage in place of the in-memory maps,
- authentication and rate limiting,
- a way to verify member credentials (so a published key package can be tied to a real, verified account).

See the [Security model](/guide/security) for why that last point matters and what the SDK does and does not cover.
