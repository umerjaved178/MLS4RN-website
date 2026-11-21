# Security model

This page is about where the security comes from, what it protects, and what stays your responsibility. Read it before you ship. MLS gives you strong guarantees, but only for the part of the system it covers.

## What MLS protects

MLS4RN wraps [OpenMLS](https://github.com/openmls/openmls), the Rust reference implementation of RFC 9420. The cryptography is not reimplemented in JavaScript; the same compiled code runs on every platform. From that you get:

- **End-to-end encryption.** Messages are encrypted on the sender's device and decrypted only on members' devices. Anything in between sees ciphertext.
- **Forward secrecy.** Keys advance as the group evolves. A key stolen today cannot decrypt messages from before it existed.
- **Post-compromise security.** After a device is compromised, rotating keys (an `update`, or any membership change) locks the attacker back out of future messages.
- **Group agreement.** Every member cryptographically agrees on who is in the group and what epoch they are in, so a server cannot quietly add a hidden member.

## What the server sees

If you use a delivery server, it is a blind relay. It handles:

- ciphertext of messages,
- public key packages,
- welcomes (which are themselves encrypted to the new member).

It never sees plaintext and never holds a key. A breach of the server exposes ciphertext and public material, not message content. This holds for the [reference server](./delivery-server) and should hold for any transport you build.

What a relay can still observe is **metadata**: who is talking to whom, group sizes, timing, and message rates. MLS does not hide that. If your threat model includes metadata, you need to address it at the transport layer (for example padding, cover traffic, or a privacy-preserving relay), above what the SDK provides.

## What is your responsibility

MLS secures the group once members are who they say they are. It does not, on its own, tell you that a key package really belongs to the right person. These parts are yours:

### Authenticating identities

A key package is just bytes. The SDK does not verify that Bob's key package actually came from Bob. If an attacker can substitute their own key package for Bob's at the point where you fetch it, they can be added in his place. You need an authentication layer: a directory that ties key packages to verified accounts, signatures you check, a trusted-on-first-use scheme, or whatever fits your product. This is the most important thing MLS leaves to you.

### Protecting keys at rest

With [persistence](./persistence) enabled, snapshots contain private key material. The plain file and IndexedDB adapters write it unencrypted, so on a device where storage is not already protected, wrap them in the shipped `EncryptedStorageAdapter`, which encrypts snapshots with AES-256-GCM under a passphrase you supply. Treat an unencrypted snapshot the same way you would treat a plaintext private key file.

### Transport integrity and availability

The relay cannot read messages, but it can drop, reorder, or withhold them. MLS protects confidentiality and group agreement, not delivery. Design for a relay that might misbehave: enforce ordering with sequence numbers, detect gaps, and do not assume the server is honest about availability.

### Secure randomness and a sound platform

The cryptography assumes a working random number generator and an uncompromised runtime. On a rooted or jailbroken device, or in a page running attacker-controlled JavaScript, those assumptions break and no messaging library can save you.

## Reporting a vulnerability

Please do not open a public issue for a security problem. The repository's `SECURITY.md` describes the current reporting process. Responsible disclosure is appreciated.

## Honest status

MLS4RN is a functional prototype. The cryptography comes from a mature upstream implementation, and recent hardening added encrypted-at-rest storage, typed error handling, a written threat model, and auth and rate limiting on the reference server. The surrounding SDK has not yet been through an independent security audit, the API still changes between versions, and some items remain in progress: a panic-free wasm boundary, authenticated identities, and transcript consistency. Weigh that before using it for anything where a failure would be costly. See [Limitations](./limitations) for the specifics.
