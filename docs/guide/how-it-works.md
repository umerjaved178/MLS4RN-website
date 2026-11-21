# How it works

This page explains the ideas you will meet in the API. You do not need to read RFC 9420 to use MLS4RN, but knowing these few terms makes everything else click.

## The main idea

Every participant runs the cryptography on their own device. When someone sends a message, their device encrypts it, and only the other members can decrypt it. Any server in the middle sees nothing but ciphertext. This is what "end-to-end encrypted" means, extended from two people to a whole group.

MLS keeps a shared secret for the group that advances over time. When members join or leave, or when someone rotates their keys, the group moves to a new **epoch** with fresh key material. Old keys cannot decrypt new messages, and new keys cannot decrypt old ones. That is what gives you forward secrecy (a stolen key does not unlock past messages) and post-compromise security (rotating keys locks an attacker back out).

## The pieces you will use

### Client

An `MlsClient` is one participant on one device. It holds that participant's own key material. If the same person uses a phone and a laptop, model that as two clients. In code:

```ts
const alice = new MlsClient("alice");
```

### Key package

Before you can add someone to a group, you need a small public bundle from them called a **key package**. Think of it as "here is how to invite me." The person generates it and publishes it somewhere others can fetch it.

```ts
const bobsKeyPackage = bob.keyPackage(); // Bob publishes this
```

### Group

A `Group` is the conversation. One person creates it, then adds others from their key packages.

```ts
const group = alice.createGroup("chess-club");
const add = group.add(bobsKeyPackage);
```

### Welcome and ratchet tree

When you add someone, the SDK produces a **welcome** and a **ratchet tree**. The new member uses those two values to join and arrive at the exact same group state as everyone else.

```ts
const bobGroup = bob.joinGroup(add.welcome, add.ratchetTree);
```

The ratchet tree is the data structure MLS uses to share secrets efficiently. You never manipulate it by hand. You just pass the bytes to the joiner.

### Proposals and commits

Changes to a group (adding, removing, rekeying) happen in two steps under the hood: a **proposal** describes the change, and a **commit** applies it and advances everyone to the next epoch.

For the common case you do not think about this. `group.add()` and `group.remove()` do both steps for you and hand you the messages to distribute. The two-step split only matters when you want to batch several changes into one commit, which [Managing members](./members) covers.

### Application messages

Once a group exists, the day-to-day work is simple:

```ts
const ciphertext = group.send("hello");      // encrypt
const text = otherGroup.receiveText(ciphertext); // decrypt
```

`receive` also handles incoming proposals and commits. When a message is a membership change rather than text, applying it advances that member to the new epoch. [Messages](./messages) explains how to tell them apart.

## The blind relay

MLS says what the cryptography does. It does not say how messages travel between people. That part is your application's job, and it is deliberately simple, because every value the SDK produces is a plain `Uint8Array` of ciphertext or public key material.

You need something to move those bytes around:

- a server that stores and forwards messages,
- a place for members to publish their key packages,
- a way to deliver a welcome to a new member.

Because the bytes are already encrypted, that server is a **blind relay**. It routes opaque bytes and never holds a key. If it is breached, the attacker gets ciphertext and nothing else.

MLS4RN ships a reference server that does exactly this, so you can see one concrete shape for it. See [The delivery server](./delivery-server).

```
  Alice's device            Server (blind relay)           Bob's device
  ┌────────────┐            ┌──────────────────┐           ┌────────────┐
  │  MLS4RN    │  cipher →  │  stores + routes │  → cipher │  MLS4RN    │
  │  encrypts  │            │  opaque bytes    │           │  decrypts  │
  └────────────┘            └──────────────────┘           └────────────┘
       keys stay here        never sees a key               keys stay here
```

## What is in scope and what is yours

The SDK gives you the cryptography: group state, encryption, decryption, and membership changes. These things are yours to provide:

- **Transport.** How bytes get from one device to another.
- **A key package directory.** Where members publish and fetch key packages.
- **Authentication.** Confirming that a key package really belongs to the person you think it does. The SDK does not vouch for identities on its own.

The [Security model](./security) page goes into what MLS guarantees and what you are responsible for.
