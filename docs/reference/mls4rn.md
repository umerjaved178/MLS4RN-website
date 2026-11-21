# mls4rn reference

The `mls4rn` package, for React Native. It mirrors [`mls-ts`](./mls-ts), with one difference: every method returns a `Promise`, because calls round-trip through a hidden WebView. All byte values are `Uint8Array`.

```tsx
import { MlsProvider, useMls } from "mls4rn";
```

See the [React Native guide](/guide/react-native) for setup.

## MlsProvider

```tsx
<MlsProvider storage? storageKey?>...</MlsProvider>
```

Renders the hidden WebView that hosts the WebAssembly and provides the SDK through `useMls()`. Props:

- `storage` (optional): a key-value store with async `getItem` and `setItem`, such as AsyncStorage. Enables persistence.
- `storageKey` (optional): the key under which the snapshot is stored.

## useMls

```ts
useMls(): Mls
```

Returns the `Mls` instance provided by the nearest `MlsProvider`.

## Mls

The entry point. Create or restore participants once the bridge is ready.

### ready

```ts
ready(): Promise<void>
```

Resolves once the WebAssembly host is loaded and, if persistence is configured, a prior snapshot has been restored. Await this before opening clients.

### newClient

```ts
newClient(name: string): Promise<MlsClient>
```

Creates an in-memory client (not persisted).

### openClient

```ts
openClient(id: string): Promise<MlsClient>
```

Creates a persistent client, restored from the snapshot if `id` was saved before.

### save

```ts
save(): Promise<void>
```

Persists the current state to the configured storage. A no-op without storage.

## MlsClient

Create it with `mls.newClient` or `mls.openClient`.

```ts
keyPackage(): Promise<Uint8Array>
createGroup(groupId: string): Promise<Group>
joinGroup(welcome: Uint8Array, ratchetTree: Uint8Array, groupId: string): Promise<Group>
group(groupId: string): Promise<Group | null>
save(): Promise<void>
```

These match the [`mls-ts` MlsClient](./mls-ts#mlsclient) methods of the same name, wrapped in promises. Note `joinGroup` takes the `groupId` as a required third argument here.

## Group

Create it with `createGroup`, `joinGroup`, or `group`.

```ts
add(keyPackage: Uint8Array): Promise<AddResult>
send(message: string): Promise<Uint8Array>
receive(message: Uint8Array): Promise<Uint8Array>
receiveText(ciphertext: Uint8Array): Promise<string | null>
remove(memberName: string): Promise<Commit>
update(): Promise<Commit>
leave(): Promise<Uint8Array>
commit(): Promise<Commit>
proposeAdd(keyPackage: Uint8Array): Promise<Uint8Array>
proposeRemove(memberName: string): Promise<Uint8Array>
proposeUpdate(): Promise<Uint8Array>
members(): Promise<string[]>
active(): Promise<boolean>
exportRatchetTree(): Promise<Uint8Array>
exportKey(label: string, context: Uint8Array, length: number): Promise<Uint8Array>
```

The semantics are identical to [`mls-ts` Group](./mls-ts#group). Refer to that page for what each method does and how to distribute the messages it returns; everything applies here with `await`.

## Types

```ts
interface AddResult {
  welcome: Uint8Array;
  ratchetTree: Uint8Array;
  proposal: Uint8Array;
  commit: Uint8Array;
}

interface Commit {
  proposal: Uint8Array | null;
  commit: Uint8Array;
  welcome: Uint8Array | null;
}

interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
```

`AddResult` and `Commit` match the core package. `KeyValueStore` is the shape `MlsProvider`'s `storage` prop expects, which AsyncStorage satisfies.
