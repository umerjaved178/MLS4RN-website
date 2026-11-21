# React Native

React Native uses the companion package `mls4rn`. It gives you the same clients, groups, and messages, with one shape difference: every method returns a `Promise`, so you use `await` everywhere.

## Why async, and why a WebView

React Native's JavaScript engine (Hermes) has no WebAssembly runtime. So `mls4rn` runs the same WebAssembly build inside a hidden `WebView` and talks to it over a message bridge. The cryptography is identical to the other platforms; it just lives one hop away, which is why the calls are asynchronous. The bundle ships prebuilt inside the package, so there is no build step and no Rust toolchain.

## Install

```bash
npm install mls4rn react-native-webview
# optional, to keep sessions across app restarts:
npm install @react-native-async-storage/async-storage
```

- `react-native-webview` is a required peer dependency. It is a native module, so if Expo Go cannot load it, use a development build.
- `react` and `react-native` come from your app.

## Use it

Wrap the part of your app that needs MLS in `MlsProvider`, then reach the SDK with `useMls()`:

```tsx
import { useEffect } from "react";
import { MlsProvider, useMls } from "mls4rn";

function Chat() {
  const mls = useMls();

  useEffect(() => {
    (async () => {
      await mls.ready(); // WebAssembly loaded (and snapshot restored, if persistent)

      const alice = await mls.newClient("alice");
      const bob = await mls.newClient("bob");

      const group = await alice.createGroup("room");
      const add = await group.add(await bob.keyPackage());
      const bobGroup = await bob.joinGroup(add.welcome, add.ratchetTree, "room");

      const ciphertext = await group.send("hello bob");
      console.log(await bobGroup.receiveText(ciphertext)); // "hello bob"
    })();
  }, [mls]);

  return null;
}

export default function App() {
  return (
    <MlsProvider>
      <Chat />
    </MlsProvider>
  );
}
```

Two things to remember: call `await mls.ready()` before your first operation, and `await` every SDK call. All byte values are `Uint8Array`, the same as the other platforms.

## Persisting sessions

Pass a `storage` to `MlsProvider`. Anything with async `getItem` and `setItem` works, which includes AsyncStorage:

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

<MlsProvider storage={AsyncStorage}>
  <Chat />
</MlsProvider>;
```

Then open persistent clients and save after operations:

```ts
await mls.ready();                 // restores a prior snapshot if present
const alice = await mls.openClient("alice");
const group = (await alice.group("room")) ?? (await alice.createGroup("room"));
// ... send and receive ...
await mls.save();                  // persist the current state
```

## Entry points

`mls4rn` exposes a small set of entry points on top of the familiar client and group:

- `<MlsProvider storage? storageKey?>` renders the hidden WebView and provides the SDK.
- `useMls()` returns an `Mls` with `ready()`, `newClient(name)`, `openClient(id)`, and `save()`.
- From there, `MlsClient` and `Group` mirror the core API, with `await`.

See the [mls4rn reference](/reference/mls4rn) for the full list.

## A note on file sizes

Because every value crosses the WebView bridge as base64, React Native is tuned for messages, not for pushing large files through the bridge. For file sharing, keep transfers to a few megabytes. See [Limitations](./limitations#react-native-bridge) for the detail and the reasoning.
