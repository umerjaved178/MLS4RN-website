# Browser

The browser uses the same `mls-ts` package and the same API as Node, with one difference: you call `init()` once before your first operation. The browser cannot compile a large WebAssembly module synchronously on the main thread, and fetching it is async, so loading the wasm is a promise you await.

## Install

```bash
npm install mls-ts
```

Use a bundler (Vite, webpack, esbuild, and so on). When it resolves `mls-ts`, the `"browser"` field in the package swaps in the browser build of the WebAssembly automatically. You do not configure anything for that to happen.

## Use it

```ts
import { MlsClient, init } from "mls-ts";

// Load the WebAssembly once, before anything else.
await init();

const alice = new MlsClient("alice");
const bob = new MlsClient("bob");

const group = alice.createGroup("room");
const add = group.add(bob.keyPackage());
const bobGroup = bob.joinGroup(add.welcome, add.ratchetTree);

const ciphertext = group.send("hello from the browser");
console.log(bobGroup.receiveText(ciphertext)); // "hello from the browser"
```

Everything after `init()` is the same synchronous API you use on Node. `init()` is safe to call more than once; later calls resolve immediately.

::: tip
In Node, `init()` exists too and is a no-op. If you write shared code that runs in both places, call `await init()` once at startup and it works everywhere.
:::

## A good startup pattern

Call `init()` at your app's entry point and gate the rest of your MLS code on it. In React, for example:

```ts
import { useEffect, useState } from "react";
import { init } from "mls-ts";

function useMlsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    init().then(() => setReady(true));
  }, []);
  return ready;
}
```

Then render your messaging UI only once `ready` is true.

## Persisting a client

The browser ships an IndexedDB adapter so a session survives a page reload:

```ts
import { MlsClient, IndexedDBStorageAdapter } from "mls-ts";

const adapter = new IndexedDBStorageAdapter(); // defaults are fine

const alice = await MlsClient.open("alice", adapter);
const group = alice.group("room") ?? alice.createGroup("room");
// ... send and receive ...
await alice.save();
```

See [Saving sessions](./persistence) for how snapshots work and what they do and do not protect.

## Trying it live

The [live demo](https://mls4rn.dev) runs this exact browser build. It shows a group chat on one side and the ciphertext a server would see on the other.
