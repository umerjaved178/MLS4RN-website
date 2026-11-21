# Quickstart

This gets two people into an encrypted group and exchanging a message, in Node.js, in about a minute. The same code runs in the browser with one extra line, and React Native uses the same shape with `await`. Those are covered in the platform guides.

## Install

```bash
npm install mls-ts
```

The compiled WebAssembly ships inside the package, so there is no Rust toolchain and no build step.

## Your first group

```ts
import { MlsClient } from "mls-ts";

// Two participants. Each one models a separate device.
const alice = new MlsClient("alice");
const bob = new MlsClient("bob");

// Alice starts a group and adds Bob from his published key package.
const group = alice.createGroup("chess-club");
const add = group.add(bob.keyPackage());

// Bob joins from the welcome and ratchet tree Alice produced.
const bobGroup = bob.joinGroup(add.welcome, add.ratchetTree);

// Send an end-to-end encrypted message.
const ciphertext = group.send("hello bob");
console.log(bobGroup.receiveText(ciphertext)); // => "hello bob"
```

That is the whole loop: create a client each, form a group, join from the welcome, then send and receive.

## What just happened

1. **Each person is an `MlsClient`.** It holds their own key material.
2. **`bob.keyPackage()`** is Bob's public "here is how to invite me" bundle. In a real app he publishes it and Alice fetches it.
3. **`group.add(...)`** adds Bob and returns the `welcome` and `ratchetTree` he needs to join.
4. **`bob.joinGroup(...)`** puts Bob in the same group state as Alice.
5. **`send` and `receiveText`** encrypt and decrypt messages.

In this example the two clients live in the same process, so you can hand values straight from one to the other. In a real app they live on different devices, and you move the bytes between them yourself. Every value here is a plain `Uint8Array`, so your transport can be anything: HTTP, a WebSocket, a queue. See [The delivery server](./delivery-server) for one ready-made option.

## Adding a third person

Adding beyond the first member is slightly different, because the people already in the group also need to hear about the change. `add` gives you a `proposal` and a `commit` for them:

```ts
const charlie = new MlsClient("charlie");

const addCharlie = group.add(charlie.keyPackage());

// The new member joins from the welcome + tree.
const charlieGroup = charlie.joinGroup(addCharlie.welcome, addCharlie.ratchetTree);

// Everyone already in the group applies the proposal, then the commit.
bobGroup.receive(addCharlie.proposal);
bobGroup.receive(addCharlie.commit);
```

[Managing members](./members) covers this in full, along with removing people, rotating keys, and leaving.

## Next steps

- [Node.js](./nodejs), [Browser](./browser), [React Native](./react-native): the per-platform setup.
- [Messages](./messages): sending, receiving, and handling handshake messages.
- [File sharing](./file-sharing): encrypting files for the group.
