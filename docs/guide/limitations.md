# Limitations

MLS4RN is a functional prototype. The cryptography underneath is mature, but the SDK around it is still evolving. This page is a straight account of the current constraints so you can judge where it fits.

## Prototype status

The API still changes between versions and the project has not been through a security audit. It is suitable for prototypes, demos, research, and learning. It is not yet hardened for production traffic. See the [Security model](./security) for the detail behind that.

## Platform constraints

- **Node** is fully synchronous and ready on import.
- **Browser** needs one `await init()` before the first operation, because the browser cannot compile a large WebAssembly module synchronously on the main thread. After that, the API is synchronous.
- **React Native** runs the WebAssembly inside a hidden WebView, because Hermes has no WebAssembly runtime. Every call is therefore async and crosses a bridge.

## Single ciphersuite

Exactly one ciphersuite is wired up: `MLS_128_DHKEMX25519_CHACHA20POLY1305_SHA256_Ed25519`. It is a sound, modern choice, but you cannot select another one yet. Multiple ciphersuites are on the roadmap.

## Membership: no external joins yet

You can add, remove, update, leave, and batch proposals. What is not implemented is the **external join**: joining a group from public group information alone, without a welcome from an existing member. Today every join starts from a welcome. External joins are planned.

## Persistence is opt-in and coarse

- Without an adapter, clients are in-memory and forget everything on exit.
- With an adapter, each `save()` writes a full snapshot, not an incremental update.
- The shipped file and IndexedDB adapters write snapshots in the clear. Private keys are only protected at rest if you wrap them, which the shipped `EncryptedStorageAdapter` does (AES-256-GCM under a passphrase).
- Only a Node file adapter and a browser IndexedDB adapter ship today.

See [Saving sessions](./persistence) for how to handle this safely.

## Error handling

Bad input is caught at the facade and rethrown as a typed, catchable error (`InvalidMessageError`, `InvalidKeyPackageError`, and so on, all extending `MlsError`), with the original wasm error kept on `.cause`. One deeper gap remains: a genuinely malformed message can still panic the underlying WebAssembly instance before the facade wraps the error. Making that boundary panic-free needs a change in the Rust layer and is still tracked.

## File size limits

There is no hard cap written into the SDK, but there are practical ceilings.

### Messages

MLS application messages are meant for chat-sized payloads. Large blobs should go through [file sharing](./file-sharing) (derive a key, encrypt with AES-GCM, store the ciphertext) rather than a `send()` call.

### Files on Node and in the browser {#file-sizes}

With the derive-and-encrypt pattern, the limit is really the AES-256-GCM per-key ceiling, which is on the order of tens of gigabytes. Because you derive a fresh key per file, normal use is nowhere near it. In practice your real limits are memory and your file store, not the crypto.

### React Native bridge {#react-native-bridge}

On React Native the binding constraint is the WebView bridge, not the cipher. Every value crosses it as base64 (about a third larger) wrapped in JSON, with several memory copies along the way. That is fine for messages and small files, but it makes large transfers slow and memory-hungry. **Keep React Native file transfers to a few megabytes.** Sharing something like a 100 MB file through the bridge is not advisable today; a native crypto path would be needed for that, and it is a roadmap item.

## On the roadmap

The larger items being tracked, beyond the hardening above:

- External joins.
- Multiple ciphersuites.
- A native React Native path, to lift the bridge size limit.
- A panic-free wasm boundary, so malformed input can never leave the instance unusable.
- Authenticated identities, so a key package can be tied to a verified account.
- Transcript consistency across all members.
