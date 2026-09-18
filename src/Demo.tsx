import { useEffect, useRef, useState } from "react";
import type { MlsClient, Group } from "mls-ts";

type Member = "alice" | "bob" | "charlie";
const ORDER: Member[] = ["alice", "bob", "charlie"];
const M: Record<Member, { color: string; initial: string }> = {
  alice: { color: "#e58bbb", initial: "A" },
  bob: { color: "#7db5f5", initial: "B" },
  charlie: { color: "#6fddab", initial: "C" },
};
const SEED: [Member, string][] = [
  ["alice", "hey team, ready for the launch tomorrow?"],
  ["bob", "yep, all set on my end"],
];

interface Msg {
  id: number;
  from: Member;
  text: string;
  bytes: number;
  hex: string;
}

type Phase = "idle" | "loading" | "ready" | "error";

function IconLock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconWire() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 12a7.5 7.5 0 0 1 15 0M8 12a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function Avatar({ m, size = "sm" }: { m: Member; size?: "sm" | "xs" }) {
  return (
    <span className={`av ${size}`} style={{ background: M[m].color }}>
      {M[m].initial}
    </span>
  );
}

export function Demo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sender, setSender] = useState<Member>("alice");
  const [text, setText] = useState("");

  const groupsRef = useRef<Record<Member, Group> | null>(null);
  const toHexRef = useRef<((b: Uint8Array) => string) | null>(null);
  const idRef = useRef(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const wireRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    wireRef.current?.scrollTo({ top: wireRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Encrypt a message from `from`, let every other member decrypt it (which both
  // advances their ratchet and proves real decryption), and return what a
  // recipient actually read plus the ciphertext that went over the wire.
  function makeMsg(from: Member, body: string): Msg {
    const groups = groupsRef.current!;
    const toHex = toHexRef.current!;
    const ciphertext = groups[from].send(body);
    let decrypted = body;
    for (const m of ORDER) {
      if (m === from) continue;
      const out = groups[m].receiveText(ciphertext);
      if (out != null) decrypted = out;
    }
    return { id: idRef.current++, from, text: decrypted, bytes: ciphertext.length, hex: toHex(ciphertext) };
  }

  async function start() {
    setPhase("loading");
    try {
      const { MlsClient, init, toHex } = await import("mls-ts");
      await init();
      toHexRef.current = toHex;

      const clients: Record<Member, MlsClient> = {
        alice: new MlsClient("alice"),
        bob: new MlsClient("bob"),
        charlie: new MlsClient("charlie"),
      };
      const gA = clients.alice.createGroup("demo");
      const addB = gA.add(clients.bob.keyPackage());
      const gB = clients.bob.joinGroup(addB.welcome, addB.ratchetTree);
      const addC = gA.add(clients.charlie.keyPackage());
      gB.receive(addC.proposal);
      gB.receive(addC.commit);
      const gC = clients.charlie.joinGroup(addC.welcome, addC.ratchetTree);
      groupsRef.current = { alice: gA, bob: gB, charlie: gC };

      setMessages(SEED.map(([from, body]) => makeMsg(from, body)));
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  function send() {
    if (!groupsRef.current || !text.trim()) return;
    const msg = makeMsg(sender, text.trim());
    setMessages((prev) => [...prev, msg]);
    setText("");
  }

  if (phase === "idle") {
    return (
      <div className="demo-idle">
        <p>Spin up a real encrypted group with alice, bob, and charlie, running right here in your browser. It loads a small WebAssembly bundle once.</p>
        <button className="btn btn-primary" onClick={start}>
          Start the demo
        </button>
      </div>
    );
  }
  if (phase === "loading") {
    return <div className="demo-loading">Starting the encryption engine...</div>;
  }
  if (phase === "error") {
    return (
      <div className="demo-error">
        Could not start the demo: {error}
        <br />
        <button className="link-btn" onClick={start}>
          try again
        </button>
      </div>
    );
  }

  return (
    <div className="demo-stage">
      {/* Left: what the group reads */}
      <div className="chat">
        <div className="panel-head">
          <span className="panel-title">
            <span className="ic">
              <IconLock />
            </span>
            The group reads
          </span>
          <span className="avatars">
            {ORDER.map((m) => (
              <Avatar key={m} m={m} />
            ))}
          </span>
        </div>
        <div className="chat-scroll" ref={chatRef}>
          {messages.map((msg) => (
            <div className="msg" key={msg.id}>
              <Avatar m={msg.from} />
              <div className="msg-body">
                <span className="msg-name" style={{ color: M[msg.from].color }}>
                  {msg.from}
                </span>
                <span className="msg-text">{msg.text}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="composer">
          <div className="senders">
            <span className="senders-label">send as</span>
            {ORDER.map((m) => (
              <button key={m} className={`chip ${sender === m ? "on" : ""}`} onClick={() => setSender(m)}>
                <Avatar m={m} size="xs" />
                {m}
              </button>
            ))}
          </div>
          <div className="composer-row">
            <input
              value={text}
              placeholder={`Message the group as ${sender}`}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn btn-primary" onClick={send}>
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right: what the server sees */}
      <div className="wire-panel">
        <div className="panel-head">
          <span className="panel-title">
            <span className="ic">
              <IconWire />
            </span>
            On the network
          </span>
          <span className="panel-sub">what a server can store</span>
        </div>
        <div className="wire-scroll" ref={wireRef}>
          {messages.map((msg) => (
            <div className="wrow" key={msg.id}>
              <div className="wrow-top">
                <IconLock />
                encrypted
                <span className="bytes">{msg.bytes} bytes</span>
              </div>
              <code className="wrow-hex">{msg.hex}</code>
            </div>
          ))}
        </div>
        <div className="wire-foot">No keys here. The group decrypts locally; the server never can.</div>
      </div>
    </div>
  );
}
