# File sharing

MLS4RN can encrypt files for a group, not just text messages. The trick is to let the group's shared secret produce a key for each file, encrypt the file with that key, and store only the ciphertext. Every member can reproduce the same key from the group, so they can all open the file. A server storing it cannot.

## The idea

`group.exportKey(label, context, length)` derives a secret from the group's current state. The guarantee that makes it useful: every member who calls it with the same `label`, `context`, and `length` gets the exact same bytes, and no one outside the group can produce them.

So the recipe is:

1. Derive a per-file key from the group with `exportKey`.
2. Encrypt the file with that key using a standard cipher (AES-256-GCM is the usual choice).
3. Upload only the ciphertext to a file store, which can be completely untrusted.
4. Any member derives the same key from the group and decrypts.

The group key never leaves the device, and the file key is never sent anywhere. It is reproduced independently by each member.

## Deriving the file key

Give each file an id and feed it in as the context, so every file gets a distinct key:

```ts
import { encodeUtf8 } from "mls-ts";

const FILE_LABEL = "myapp/file-share/v1";

function fileKey(group, fileId: string): Uint8Array {
  return group.exportKey(FILE_LABEL, encodeUtf8(fileId), 32); // 32 bytes = AES-256
}
```

Pick a `label` once for your app and keep it stable. The `context` (here the file id) is what separates one file's key from another's.

## Encrypting and decrypting

Any authenticated cipher works. This example uses Node's built-in AES-256-GCM:

```ts
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function encryptFile(key: Uint8Array, data: Uint8Array) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(key), iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  return { iv, ciphertext, tag: cipher.getAuthTag() };
}

function decryptFile(key: Uint8Array, blob: { iv: Buffer; ciphertext: Buffer; tag: Buffer }) {
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(key), blob.iv);
  decipher.setAuthTag(blob.tag);
  return Buffer.concat([decipher.update(blob.ciphertext), decipher.final()]);
}
```

In the browser, use the Web Crypto API (`crypto.subtle`) with the same AES-GCM algorithm. In React Native, derive the key through `mls4rn` and encrypt with a crypto library available in your app.

## Putting it together

```ts
// Sender: derive, encrypt, upload only ciphertext.
const key = fileKey(group, "Q3-report.pdf");
const blob = encryptFile(key, fileBytes);
await uploadToServer("Q3-report.pdf", blob); // server sees ciphertext only

// Receiver: download, derive the same key, decrypt.
const downloaded = await downloadFromServer("Q3-report.pdf");
const sameKey = fileKey(receiverGroup, "Q3-report.pdf");
const original = decryptFile(sameKey, downloaded);
```

The server holds the encrypted bytes and the IV and tag. Without the group it cannot derive the key, so it cannot read the file.

## How this differs from a message

Sending a file is deliberately not the same as sending a `send()` message:

- A **message** goes through MLS end to end. The SDK encrypts it, and the ciphertext itself is what travels.
- A **file** is encrypted by your app with a key that MLS hands you. MLS derives the key; your app does the bulk encryption and stores the result wherever you like.

The reason is size. MLS messages are meant for chat-sized payloads. Bulk file encryption with AES-GCM is fast and designed for large data, and it lets you store files in ordinary object storage while keeping the key bound to the group.

Small files can still just be sent inline as a `send()` message if that is simpler for you. The derived-key approach is for anything large.

## Limits

A single AES-256-GCM key should not encrypt an unbounded amount of data. The practical ceiling per key is very high (on the order of tens of gigabytes), and because you derive a fresh key per file, you are nowhere near it in normal use. On React Native, the binding constraint is the WebView bridge rather than the cipher: keep transfers to a few megabytes. See [Limitations](./limitations) for the numbers and the reasoning.

## Try it

The repository ships a runnable file-sharing demo:

```bash
npm run demo:files
```

It walks through deriving a key from a group, encrypting a confidential file, uploading only ciphertext to a server that then fails to open it, and other members decrypting to the byte-identical original.
