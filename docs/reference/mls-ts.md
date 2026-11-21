# mls-ts reference

The `mls-ts` package, for Node.js and the browser. On Node every method is synchronous. In the browser, call `await init()` once first; after that the API is synchronous too.

```ts
import { MlsClient, init } from "mls-ts";
```

All byte values are `Uint8Array`.

## init

```ts
init(): Promise<void>
```

Loads the WebAssembly. Required in the browser before the first operation; a no-op on Node, where the wasm loads on import. Safe to call more than once.

## MlsClient

One participant on one device. It owns its own key material. Model separate devices as separate clients.

### Constructor

```ts
new MlsClient(name: string)
```

Creates an in-memory client with its own provider and identity. It is not persisted; use `MlsClient.open` for persistence.

### MlsClient.open

```ts
static open(id: string, adapter: StorageAdapter): Promise<MlsClient>
```

Opens a persistent client. Restores a prior snapshot stored under `id` if one exists, otherwise creates a fresh client and persists its initial identity. The `id` doubles as the client's name, so reuse it to resume. See [Saving sessions](/guide/persistence).

### keyPackage

```ts
keyPackage(): Uint8Array
```

Returns a serialized key package to publish, so others can add this client to a group.

### createGroup

```ts
createGroup(groupId: string): Group
```

Creates a new group with this client as the founding member.

### joinGroup

```ts
joinGroup(welcome: Uint8Array, ratchetTree: Uint8Array, groupId?: string): Group
```

Joins an existing group from the `welcome` and `ratchetTree` produced by an add. Pass `groupId` (the same string the founder used) to make the joined group reloadable after a restart when persistence is enabled.

### group

```ts
group(groupId: string): Group | undefined
```

Returns a handle to a group this client already has, by id. Useful after `open` restores joined groups.

### save

```ts
save(): Promise<void>
```

Persists the current state (provider storage, identity, joined group ids) to the adapter. A no-op for in-memory clients. Call it after operations you want to survive a restart.

### free

```ts
free(): void
```

Releases the underlying WebAssembly handles. Optional; garbage collection also reclaims them.

## Group

A handle to a group as seen by one client. Create it with `MlsClient.createGroup` or `MlsClient.joinGroup`, not directly.

### add

```ts
add(keyPackage: Uint8Array): AddResult
```

Adds a member from its serialized key package. The change is committed and applied locally. The returned [`AddResult`](#addresult) carries the messages to distribute: `welcome` and `ratchetTree` to the new member, `proposal` and `commit` to the other existing members. See [Managing members](/guide/members#adding-a-member).

### remove

```ts
remove(memberName: string): Commit
```

Removes a member by the name its client was created with. Committed and applied locally. Distribute the returned [`Commit`](#commit) (proposal, then commit) to the other members. The removed member becomes inactive once it processes them.

### update

```ts
update(): Commit
```

Rotates this member's own leaf key (an MLS Update). This is what provides post-compromise security. Committed and applied locally; distribute the returned `Commit` to the others.

### leave

```ts
leave(): Uint8Array
```

Returns a self-removal proposal. A member cannot commit its own removal, so another member must `receive` this proposal and then `commit` it. This client is only removed once it receives that commit.

### commit

```ts
commit(): Commit
```

Commits all currently pending proposals, whether staged locally with the `propose*` methods or received from others (such as a `leave`). Applied locally; distribute the returned `Commit`. If any pending proposal was an add, `Commit.welcome` is set; send it plus `exportRatchetTree()` to the new members.

### proposeAdd / proposeRemove / proposeUpdate

```ts
proposeAdd(keyPackage: Uint8Array): Uint8Array
proposeRemove(memberName: string): Uint8Array
proposeUpdate(): Uint8Array
```

Stage a change without committing, so several can be batched into one `commit`. Each returns the proposal bytes to distribute. See [batching](/guide/members#batching-several-changes).

### members

```ts
members(): string[]
```

The names of the current group members.

### active

```ts
active(): boolean
```

Whether this client is still an active member. Returns `false` after it has been removed or has left, once it processes that commit.

### send

```ts
send(message: string | Uint8Array): Uint8Array
```

Encrypts an application message for the group and returns the ciphertext.

### receive

```ts
receive(message: Uint8Array): Uint8Array
```

Processes an incoming message. For an application message, returns the decrypted plaintext bytes. For a handshake message (proposal or commit), applies it to this group's state and returns an empty array.

### receiveText

```ts
receiveText(message: Uint8Array): string | null
```

Like `receive`, but decodes an application message as UTF-8 text. Returns `null` for handshake messages.

### exportRatchetTree

```ts
exportRatchetTree(): Uint8Array
```

Serializes this group's ratchet tree, which joiners need (for example after a batched add).

### exportKey

```ts
exportKey(label: string, context: Uint8Array, length: number): Uint8Array
```

Derives an exported secret bound to the group's current epoch. Every member deriving with the same `label`, `context`, and `length` gets identical bytes. This is the basis for [file sharing](/guide/file-sharing).

### free

```ts
free(): void
```

Releases the underlying WebAssembly handle. Optional.

## Types

### AddResult

```ts
interface AddResult {
  welcome: Uint8Array;
  ratchetTree: Uint8Array;
  proposal: Uint8Array;
  commit: Uint8Array;
}
```

Returned by `add`. `welcome` + `ratchetTree` go to the new member; `proposal` then `commit` go to the other existing members.

### Commit

```ts
interface Commit {
  proposal: Uint8Array | null;
  commit: Uint8Array;
  welcome: Uint8Array | null;
}
```

Returned by `remove`, `update`, and `commit`.

- `commit`: give it to every other member via `receive`.
- `proposal`: for the one-shot `remove` and `update` helpers, distribute it before the commit. `null` when committing already-pending proposals.
- `welcome`: set only when the commit also added members. Give it, with `exportRatchetTree()`, to each new member.

## Storage

### StorageAdapter

```ts
interface StorageAdapter {
  load(key: string): Promise<Uint8Array | null>;
  save(key: string, data: Uint8Array): Promise<void>;
}
```

A tiny key-value blob store. Implement it to target any platform. See [Saving sessions](/guide/persistence).

### FileStorageAdapter

```ts
new FileStorageAdapter(dir: string)
```

Node-only. Stores each key as a file in `dir`.

### IndexedDBStorageAdapter

```ts
new IndexedDBStorageAdapter(options?: { dbName?: string; storeName?: string })
```

Browser-only. Persists snapshots in an IndexedDB object store so a session survives a page reload. Defaults: `dbName` `"mls-ts"`, `storeName` `"snapshots"`.

## Helpers

```ts
import { encodeUtf8, decodeUtf8, toHex, fromHex } from "mls-ts";
```

- `encodeUtf8(s: string): Uint8Array`
- `decodeUtf8(b: Uint8Array): string`
- `toHex(b: Uint8Array): string`
- `fromHex(s: string): Uint8Array`

The raw generated bindings are also re-exported as `raw` for advanced or interop use.
