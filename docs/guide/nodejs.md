# Node.js

Node is the simplest target. The WebAssembly loads synchronously when you import the package, so the whole API is synchronous and ready to use right away.

## Install

```bash
npm install mls-ts
```

## Use it

```ts
import { MlsClient } from "mls-ts";

const alice = new MlsClient("alice");
const bob = new MlsClient("bob");

const group = alice.createGroup("room");
const add = group.add(bob.keyPackage());
const bobGroup = bob.joinGroup(add.welcome, add.ratchetTree);

const ciphertext = group.send("hello from Node");
console.log(bobGroup.receiveText(ciphertext)); // "hello from Node"
```

No `await`, no init step. If you have used the [Quickstart](./quickstart), this is the same code.

## When to use Node

The Node build is a good fit for the parts of your system that are not the end user's phone or browser:

- Bots and automated group members.
- Bridges between MLS4RN and another system.
- Server-side tools and scripts.
- Tests and local development.

The device-facing apps are usually [Browser](./browser) and [React Native](./react-native). They speak the same protocol, so a Node client and a React Native client can be in the same group.

## Persisting a client

By default a client lives in memory and forgets everything when the process exits. To keep a session across restarts, open the client with a storage adapter and save after operations you want to keep. Node ships a file-backed adapter:

```ts
import { MlsClient, FileStorageAdapter } from "mls-ts";

const adapter = new FileStorageAdapter("./data");

// First run.
const alice = await MlsClient.open("alice", adapter);
const group = alice.createGroup("room");
// ... add members, send and receive ...
await alice.save();

// A later run, after a restart. Same id and adapter restore the session.
const alice2 = await MlsClient.open("alice", adapter);
const group2 = alice2.group("room"); // resumes where it left off
```

See [Saving sessions](./persistence) for the full picture, including the caveat that snapshots hold private keys unencrypted at rest unless your adapter encrypts them.

## Module format

`mls-ts` is an ES module. Use `import`, and make sure your project is set up for ESM (a `"type": "module"` in `package.json`, or a `.mjs` file, or a TypeScript or bundler setup that emits ESM).
