# Messages

Once a group exists, sending and receiving is the easy part. This page covers the two kinds of message you will handle and how to tell them apart.

The examples use the synchronous Node and browser API. On React Native, add `await` to each call.

## Sending

`send` encrypts a message for the group. Pass a string or raw bytes, and you get back the ciphertext to deliver:

```ts
const ciphertext = group.send("hello everyone");
// ciphertext is a Uint8Array. Deliver it to the other members.
```

```ts
// Bytes work too, for anything that is not text.
const ciphertext = group.send(new Uint8Array([1, 2, 3]));
```

You deliver that ciphertext to the other members however your app moves bytes around. See [The delivery server](./delivery-server) for one option.

## Receiving

Every member feeds incoming bytes to `receive` (or `receiveText`). There are two kinds of incoming message:

- **Application messages**: the actual chat content someone sent.
- **Handshake messages**: proposals and commits, the membership changes from [Managing members](./members).

Both arrive through the same channel, so `receive` handles both.

### receiveText, for chat

If you are expecting text, `receiveText` decrypts and decodes it as UTF-8. It returns `null` when the message was a handshake (which carries no text):

```ts
const text = group.receiveText(incoming);
if (text !== null) {
  // It was a chat message.
  console.log(text);
} else {
  // It was a membership change. It has already been applied to this group.
}
```

### receive, for bytes and handshakes

`receive` is the lower-level version. For an application message it returns the decrypted bytes. For a handshake message it applies the change to your group state and returns an empty array:

```ts
const bytes = group.receive(incoming);
if (bytes.length > 0) {
  // Application message: decrypted bytes.
} else {
  // Handshake: applied to the group. Nothing to display.
}
```

Use `receiveText` for a chat UI and `receive` when you are sending non-text payloads or want to handle the raw bytes yourself.

## One channel for everything

A useful thing about MLS is that chat messages and membership changes travel through the same pipe. You do not need a separate control channel for "Bob joined" versus "Bob said hi." Deliver every byte array to `receive`, and the SDK sorts out which is which and keeps every member's view of the group in step.

## Ordering matters

Members must apply commits in the same order. If Alice commits an add and then Bob commits a remove, everyone has to process the add before the remove, or their group states diverge. The usual way to guarantee this is to give one component authority over order. The [reference delivery server](./delivery-server) does exactly that: it stamps every message with a sequence number so all members replay them identically.

Application messages are not as strict, but a consistent order keeps the conversation readable.
