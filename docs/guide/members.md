# Managing members

Groups change over time. People join, people leave, and keys get rotated to stay secure. This page covers every membership operation and, just as important, what you do with the messages each one returns.

The examples use the synchronous Node and browser API. On React Native, add `await` to each call.

## The pattern behind every change

Whenever the membership changes, the member who made the change applies it locally right away. The methods then hand you the bytes to send to everyone else so they catch up. Your job is always the same: take the returned values and deliver them to the right people.

Two message shapes show up:

- [`AddResult`](/reference/mls-ts#addresult), returned by `add`. It carries a `welcome` and `ratchetTree` for the new member, plus a `proposal` and `commit` for the existing members.
- [`Commit`](/reference/mls-ts#commit), returned by `remove`, `update`, and `commit`. It carries a `commit` for everyone else, an optional `proposal`, and an optional `welcome`.

## Adding a member

### The first member

Adding the very first member needs only the `welcome` and `ratchetTree`, because there is no one else to tell yet:

```ts
const group = alice.createGroup("room");
const add = group.add(bob.keyPackage());

const bobGroup = bob.joinGroup(add.welcome, add.ratchetTree);
```

### Adding when others are already in

Once a group has more than one member, the people already in it also need to hear about the new arrival. `add` gives you a `proposal` and a `commit` for them:

```ts
const add = group.add(charlie.keyPackage());

// The new member joins from the welcome and tree.
const charlieGroup = charlie.joinGroup(add.welcome, add.ratchetTree);

// Every existing member applies the proposal, then the commit.
bobGroup.receive(add.proposal);
bobGroup.receive(add.commit);
```

| Value | Give it to | How |
| --- | --- | --- |
| `welcome` + `ratchetTree` | the new member | `client.joinGroup(welcome, ratchetTree)` |
| `proposal` then `commit` | every other existing member | `group.receive(proposal)` then `group.receive(commit)` |

## Removing a member

Remove someone by the name their client was created with. The change is applied locally, and you distribute the returned `Commit` to the others:

```ts
const result = group.remove("charlie");

// Other members apply the proposal, then the commit.
bobGroup.receive(result.proposal);
bobGroup.receive(result.commit);
```

The removed member, if they are still receiving, processes the same messages and becomes inactive. You can confirm with `group.active()`, which returns `false` once a client has been removed.

Removing a member rotates the group's keys, so the person who left cannot read anything sent afterward.

## Rotating your own keys

`update` rotates the calling member's own key material. This is what delivers post-compromise security: if someone's keys were exposed, an update locks the attacker back out. Apply it locally, then distribute the `Commit`:

```ts
const result = group.update();

bobGroup.receive(result.proposal);
bobGroup.receive(result.commit);
```

A common policy is to update periodically, or after any event that might have exposed a device.

## Leaving a group

Leaving is a two-step dance, because MLS does not let a member commit their own removal. You propose to leave, and someone else commits it:

```ts
// The leaver produces a self-removal proposal.
const proposal = group.leave();

// Another member applies it and commits.
aliceGroup.receive(proposal);
const result = aliceGroup.commit();

// That commit goes to everyone else, including the leaver.
bobGroup.receive(result.commit);
```

The member who left is only truly out once they receive that final commit. Until then, `active()` still reports `true` for them.

## Batching several changes

Each of the operations above commits immediately. When you want to apply several changes at once (add two people and remove one in a single epoch, say), stage them as proposals and commit them together.

The `propose*` methods stage a change without committing and return the proposal to distribute:

```ts
// Stage several changes.
const p1 = group.proposeAdd(dave.keyPackage());
const p2 = group.proposeRemove("charlie");

// Other members see the staged proposals.
bobGroup.receive(p1);
bobGroup.receive(p2);

// One commit applies them all and moves everyone to the next epoch.
const result = group.commit();
bobGroup.receive(result.commit);
```

If any staged proposal was an add, the resulting `Commit` includes a `welcome`. Send it, together with `group.exportRatchetTree()`, to each new member so they can join:

```ts
if (result.welcome) {
  const tree = group.exportRatchetTree();
  const daveGroup = dave.joinGroup(result.welcome, tree);
}
```

`commit` also finalizes proposals you received from others, which is how a [leave](#leaving-a-group) gets committed.

## Inspecting a group

```ts
group.members();  // => ["alice", "bob"]  the current members by name
group.active();   // => true   whether this client is still a member
```

## Quick reference

| Operation | Method | Returns | Distribute |
| --- | --- | --- | --- |
| Add a member | `add(keyPackage)` | `AddResult` | welcome + tree to the joiner; proposal + commit to others |
| Remove a member | `remove(name)` | `Commit` | proposal, then commit, to others |
| Rotate your keys | `update()` | `Commit` | proposal, then commit, to others |
| Leave | `leave()` | proposal bytes | another member receives it, then commits |
| Commit staged proposals | `commit()` | `Commit` | commit (and welcome, if an add was staged) |
| Stage without committing | `proposeAdd` / `proposeRemove` / `proposeUpdate` | proposal bytes | to others, before the commit |

## What about external joins?

Today a new member always joins from a `welcome` produced by an existing member. Joining a group from public group information alone, without a welcome, is not implemented yet. It is on the roadmap. See [Limitations](./limitations).
