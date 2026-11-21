# Saving sessions

By default a client lives entirely in memory. When the process exits or the page reloads, it forgets its identity and its groups. For anything beyond a quick script, you will want sessions to survive restarts. That is what storage adapters are for.

## The model

A client can be backed by a `StorageAdapter`: a tiny key-value store with async `load` and `save`. You open a client against an adapter, and you call `save()` after operations you want to keep. The same `id` plus the same adapter restores the session later.

```ts
import { MlsClient, FileStorageAdapter } from "mls-ts";

const adapter = new FileStorageAdapter("./data");

// First run.
const alice = await MlsClient.open("alice", adapter);
const group = alice.createGroup("room");
// ... add members, send and receive ...
await alice.save();

// A later run, after a restart.
const alice2 = await MlsClient.open("alice", adapter);
const group2 = alice2.group("room"); // resumes where it left off
```

`MlsClient.open(id, adapter)` restores a prior snapshot if one exists under `id`, or creates a fresh client and persists its initial identity if not. The `id` doubles as the client's name, so reuse it to resume.

Use `client.group(groupId)` to get a handle to a group that was restored. For groups you join, pass the `groupId` to `joinGroup` so it can be reloaded the same way:

```ts
const bobGroup = bob.joinGroup(welcome, ratchetTree, "room");
```

## Adapters per platform

The interface is the same everywhere; only the backing store changes.

| Platform | Adapter | Backed by |
| --- | --- | --- |
| Node.js | `FileStorageAdapter(dir)` | files on disk |
| Browser | `IndexedDBStorageAdapter(options?)` | IndexedDB |
| React Native | provided through `MlsProvider storage=` | AsyncStorage or any `getItem`/`setItem` store |

### Node

```ts
import { FileStorageAdapter } from "mls-ts";
const adapter = new FileStorageAdapter("./data");
```

### Browser

```ts
import { IndexedDBStorageAdapter } from "mls-ts";
const adapter = new IndexedDBStorageAdapter(); // or { dbName, storeName }
```

### React Native

React Native wires persistence through the provider rather than an adapter object. See [React Native](./react-native#persisting-sessions):

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
<MlsProvider storage={AsyncStorage}>...</MlsProvider>;
```

## Bring your own adapter

If your platform is not covered, implement the interface. It is two methods:

```ts
interface StorageAdapter {
  load(key: string): Promise<Uint8Array | null>;
  save(key: string, data: Uint8Array): Promise<void>;
}
```

Anything that can store and return bytes by key works: a different database, a cloud blob store, an encrypted file.

## Important caveats

Persistence today is deliberately simple, and that simplicity has consequences worth knowing:

- **Snapshots are full, not incremental.** Each `save()` writes a complete snapshot of the client's state. It is easy to reason about, not optimized for huge state.
- **Private keys are stored unencrypted at rest.** A snapshot contains the client's secret key material. The shipped adapters write it as-is. If the storage medium is not itself protected, wrap your adapter to encrypt the bytes before `save` and decrypt them after `load`. This is the single most important thing to get right before putting persistence in production.
- **Only the Node file adapter and the browser IndexedDB adapter ship today.** Other platforms supply their own, as above.

See the [Security model](./security) for how storage fits into the overall threat picture.
