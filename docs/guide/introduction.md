# Introduction

MLS4RN adds end-to-end encrypted group messaging to your app. You create a client for each participant, form a group, and send and receive messages. Everything is encrypted on the device, so whatever server you use to move the messages around only ever sees ciphertext.

It is built on **MLS** (Messaging Layer Security), the IETF standard for secure group messaging, published as [RFC 9420](https://www.rfc-editor.org/rfc/rfc9420.html). MLS is the group-chat counterpart to the Signal protocol: it gives you forward secrecy and post-compromise security, and it stays efficient as groups grow. You do not need to know the standard to use this SDK, but [How it works](./how-it-works) explains the parts you will see in the API.

## What you get

- A small, typed API. Create an `MlsClient`, call `createGroup` or `joinGroup`, then `send` and `receive`.
- The same API on three platforms, so code and mental model carry across.
- Real cryptography. MLS4RN wraps [OpenMLS](https://github.com/openmls/openmls), the Rust reference implementation of RFC 9420, compiled to WebAssembly. No crypto is reimplemented in JavaScript.
- Full group membership: add, remove, key rotation, leave, and batched changes.
- Encrypted file sharing built from the same group key.
- An optional reference server that shows how a message-relay service fits in.

## Two packages

The SDK ships as two packages so each platform gets a clean install. They share the same cryptography and the same concepts.

| Package | Install for | API style |
| --- | --- | --- |
| [`mls-ts`](https://www.npmjs.com/package/mls-ts) | Node.js and browser | Synchronous on Node, async in the browser |
| [`mls4rn`](https://www.npmjs.com/package/mls4rn) | React Native | Async (`Promise`-based) |

If your product is a web and mobile app with a backend, you will likely use `mls4rn` in the app and `mls-ts` on your server or web client. See the [FAQ](./faq#why-two-packages) for why they are split.

## Where to go next

- New to the ideas behind MLS? Read [How it works](./how-it-works).
- Want code running in a minute? Jump to the [Quickstart](./quickstart).
- Building for a specific platform? See [Node.js](./nodejs), [Browser](./browser), or [React Native](./react-native).

## Project status

MLS4RN is a functional prototype. The API still moves between versions and it is not yet hardened for production. The [Limitations](./limitations) page is honest about what that means in practice. It is MIT licensed and developed with support from the Prototype Fund.
