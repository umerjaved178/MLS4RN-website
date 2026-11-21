# FAQ

## Why two packages? {#why-two-packages}

`mls-ts` targets Node and the browser. `mls4rn` targets React Native. They share the same cryptography and the same concepts, but React Native needs a different runtime strategy (a hidden WebView, because its engine has no WebAssembly) and a different API shape (async everywhere). Splitting them keeps each install clean: a web project does not pull in React Native dependencies, and vice versa. A Node client and a React Native client can still be members of the same group, because the protocol is identical.

## Is it really end-to-end encrypted?

Yes. Every message is encrypted on the sender's device and only members can decrypt it. The cryptography comes from OpenMLS, the Rust reference implementation of RFC 9420, compiled to WebAssembly. None of it is reimplemented in JavaScript. Any server in the middle only ever sees ciphertext.

## Do I have to run the delivery server?

No. The server is a reference example of how to move the encrypted bytes around. You can use your own backend, a queue, or a WebSocket service instead. The SDK produces plain `Uint8Array` values; how they travel is up to you. See [The delivery server](./delivery-server).

## Does MLS deliver the messages?

No, and this is a common point of confusion. MLS does the cryptography: it encrypts, decrypts, and manages group keys. It does not move bytes between devices. Delivery is your application's job, whether that is the reference server or your own transport.

## Why is Node synchronous but the browser and React Native are not?

Node can load the WebAssembly synchronously when the module is imported, so the whole API is synchronous. The browser cannot compile a large WebAssembly module synchronously on the main thread, and fetching it is async, so you call `await init()` once first. React Native has no WebAssembly runtime at all, so it runs the wasm inside a WebView and talks to it over an async bridge. See [Browser](./browser) and [React Native](./react-native).

## What is the biggest file I can send?

For messages, keep to chat-sized payloads. For files, use the [file-sharing](./file-sharing) pattern: derive a key and encrypt with AES-GCM. On Node and in the browser the practical limit is memory and your file store, not the crypto. On React Native, keep transfers to a few megabytes because of the WebView bridge. See [Limitations](./limitations#file-sizes).

## What is a key package?

A small public bundle a participant publishes that says "here is how to add me to a group." Before you can add someone, you need their key package. The person generates it with `client.keyPackage()` and publishes it somewhere others can fetch it. See [How it works](./how-it-works#key-package).

## How do I add a third (and later) member?

Adding the first member needs only the welcome and ratchet tree. Adding any member after that also produces a proposal and commit for the people already in the group, which you deliver to them. [Managing members](./members#adding-a-member) has the code.

## Can someone who left still read messages?

No. Removing a member, or a member leaving, rotates the group's keys. Anyone who is out cannot read messages sent afterward. That is forward secrecy and post-compromise security working as intended.

## Does the server know who is in each group?

The server cannot read message content, but a relay can see metadata: which accounts talk to which, group sizes, and timing. MLS does not hide metadata. If that matters for your threat model, address it at the transport layer. See [Security model](./security#what-the-server-sees).

## Which ciphersuite does it use?

One fixed suite: `MLS_128_DHKEMX25519_CHACHA20POLY1305_SHA256_Ed25519`. Choosing among several is planned but not available yet.

## Can I use it in production?

Not yet, in good conscience. It is a functional prototype: the API still changes, there has been no security audit, and several hardening items are in progress. It is a strong fit for prototypes, research, and learning. See [Limitations](./limitations) and [Security model](./security).

## How do I contribute?

Contributions, questions, and feedback are welcome. See the [repository](https://github.com/umerjaved178/MLS4RN) and its `CONTRIBUTING.md`.
