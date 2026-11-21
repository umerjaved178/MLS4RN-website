---
layout: home

hero:
  name: MLS4RN
  text: End-to-end encrypted group messaging
  tagline: One small, typed SDK for web, mobile, and backend apps. Built on MLS, the IETF standard for secure group chat (RFC 9420).
  actions:
    - theme: brand
      text: Get started
      link: /guide/introduction
    - theme: alt
      text: Quickstart
      link: /guide/quickstart
    - theme: alt
      text: Live demo
      link: https://mls4rn.dev

features:
  - title: Real cryptography, not a reimplementation
    details: MLS4RN wraps OpenMLS, the Rust reference implementation of RFC 9420, compiled to WebAssembly. The same audited crypto runs on every platform. None of it is rewritten in JavaScript.
  - title: The same API everywhere
    details: Create a client, form a group, send and receive messages. The shape is identical on Node, in the browser, and in React Native. You learn it once.
  - title: The server never sees plaintext
    details: All encryption happens on the device. A server only ever relays ciphertext, so it cannot read messages even if it wanted to.
  - title: Groups, not just one-to-one
    details: Add and remove members, rotate keys, leave a group, and batch changes together. Forward secrecy and post-compromise security come built in.
  - title: Encrypted file sharing
    details: Derive a per-file key from the group, encrypt the file with it, and store only the ciphertext. Every member can reproduce the key and open the file.
  - title: Open source, publicly funded
    details: MIT licensed and developed with support from the Prototype Fund. Readable by design, so contributors new to MLS can find their way around.
---
