import { Demo } from "./Demo";

const GITHUB = "https://github.com/umerjaved178/MLS4RN";
const NPM_TS = "https://www.npmjs.com/package/mls-ts";
const NPM_RN = "https://www.npmjs.com/package/mls4rn";
const RFC = "https://www.rfc-editor.org/rfc/rfc9420.html";
const PTF = "https://www.prototypefund.de/en/projects/mls4rn";

function Lock({ className = "lock" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#12161d" stroke="#2a313f" />
      <path
        d="M11 14v-1.5a5 5 0 0 1 10 0V14h1.2c.99 0 1.8.81 1.8 1.8v6.4c0 .99-.81 1.8-1.8 1.8H9.8A1.8 1.8 0 0 1 8 22.2v-6.4c0-.99.81-1.8 1.8-1.8H11Zm2 0h6v-1.5a3 3 0 0 0-6 0V14Z"
        fill="#6fddab"
      />
    </svg>
  );
}

function PtfMark({ className = "ptf-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 138 168" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.089 0H111.973L137.049 46.6227L116.058 83.3858L100.442 97.5827L62.2412 104.659L62.2412 135.172L75.8407 140.81V154.836L59.7517 168H0V153.476L13.5995 142.35V33.2715L0 27.6333V13.1637L16.089 0ZM72.8432 152.627H18.1228V142.813L31.7222 137.174V18.8941L18.1228 13.2559V2.99754H110.182L133.622 46.5793L113.903 81.1144L76.124 89.3631H59.2437L59.2437 137.174L72.8432 142.813V152.627ZM75.9371 15.1752L100.922 27.4067L109.701 46.5396L100.938 62.9006L75.9163 76.4946L59.2437 72.7498V18.999L75.9371 15.1752ZM86.656 67.2485L91.2286 58.8077L83.5184 42.0039L62.2412 31.5876V70.3508L75.4746 73.3232L86.656 67.2485Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg className="check" width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroCode() {
  return (
    <div className="code-card">
      <div className="bar">
        <span className="tl" />
        <span className="tl" />
        <span className="tl" />
        <span className="file">example.ts</span>
      </div>
      <pre>
        <span className="k">import</span> {"{ MlsClient }"} <span className="k">from</span>{" "}
        <span className="s">"mls-ts"</span>
        {"\n\n"}
        <span className="k">const</span> alice = <span className="k">new</span> <span className="f">MlsClient</span>(
        <span className="s">"alice"</span>){"\n"}
        <span className="k">const</span> bob{"   "}= <span className="k">new</span> <span className="f">MlsClient</span>(
        <span className="s">"bob"</span>){"\n\n"}
        <span className="k">const</span> group{"  "}= alice.<span className="f">createGroup</span>(<span className="s">"team"</span>)
        {"\n"}
        <span className="k">const</span> invite = group.<span className="f">add</span>(bob.<span className="f">keyPackage</span>()){"\n"}
        <span className="k">const</span> chat{"   "}= bob.<span className="f">joinGroup</span>({"\n"}
        {"  "}invite.welcome, invite.ratchetTree){"\n\n"}
        <span className="k">const</span> ct = group.<span className="f">send</span>(<span className="s">"hello bob"</span>)
        {"  "}
        <span className="c">// encrypted</span>
        {"\n"}
        chat.<span className="f">receiveText</span>(ct){"          "}
        <span className="c">// "hello bob"</span>
      </pre>
    </div>
  );
}

function FilesCode() {
  return (
    <div className="code-card">
      <div className="bar">
        <span className="tl" />
        <span className="tl" />
        <span className="tl" />
        <span className="file">file-share.ts</span>
      </div>
      <pre>
        <span className="c">// a per-file key only the group can derive</span>
        {"\n"}
        <span className="k">const</span> key = group.<span className="f">exportKey</span>(<span className="s">"file-share"</span>, fileId, 32)
        {"\n\n"}
        <span className="c">// encrypt with it, then upload only the ciphertext</span>
        {"\n"}
        <span className="k">const</span> blob = <span className="k">await</span> <span className="f">seal</span>(key, fileBytes){"\n"}
        <span className="k">await</span> storage.<span className="f">put</span>(fileId, blob){"   "}
        <span className="c">// server can't open it</span>
        {"\n\n"}
        <span className="c">// any member re-derives the same key and opens it</span>
        {"\n"}
        <span className="k">const</span> file = <span className="k">await</span> <span className="f">open</span>(
        {"\n"}
        {"  "}group.<span className="f">exportKey</span>(<span className="s">"file-share"</span>, fileId, 32), blob){"\n"}
        )
      </pre>
    </div>
  );
}

function KeyTree() {
  // A small TreeKEM-style key tree: 4 members (leaves), intermediate keys, one root.
  const leaves = [
    { x: 46, label: "alice" },
    { x: 126, label: "bob" },
    { x: 206, label: "carol" },
    { x: 286, label: "dave" },
  ];
  const mids = [86, 246];
  return (
    <svg className="tree" viewBox="0 0 332 210" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TreeKEM key tree">
      {/* edges */}
      <path className="edge" d="M166 44 L86 104" />
      <path className="edge" d="M166 44 L246 104" />
      <path className="edge" d="M86 104 L46 164" />
      <path className="edge" d="M86 104 L126 164" />
      <path className="edge" d="M246 104 L206 164" />
      <path className="edge" d="M246 104 L286 164" />
      {/* root */}
      <circle className="node root" cx="166" cy="44" r="11" />
      <text className="lbl acc" x="166" y="26" textAnchor="middle">
        group secret
      </text>
      {/* intermediate */}
      {mids.map((x) => (
        <circle key={x} className="node" cx={x} cy="104" r="9" />
      ))}
      {/* leaves */}
      {leaves.map((l) => (
        <g key={l.label}>
          <circle className="leaf" cx={l.x} cy="164" r="8" />
          <text className="lbl" x={l.x} y="192" textAnchor="middle">
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function App() {
  return (
    <>
      <nav className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top">
            <Lock />
            mls4rn
          </a>
          <div className="nav-links">
            <a className="navlink" href="#demo">
              Demo
            </a>
            <a className="navlink" href="#how">
              How it works
            </a>
            <a className="navlink" href="#files">
              Files
            </a>
            <a className="navlink" href="#install">
              Install
            </a>
            <a className="btn btn-ghost" href={GITHUB} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <header className="hero grid-bg" id="top">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Open source · MLS · RFC 9420</span>
            <h1>
              Encrypted group chat, <span className="grad">built in.</span>
            </h1>
            <p className="sub">
              Add end-to-end encrypted group chat and file sharing to your mobile and web apps. MLS4RN
              runs the real MLS protocol on the device, so your server only ever sees ciphertext.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#demo">
                Try the live demo
              </a>
              <a className="btn btn-ghost" href={GITHUB} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </div>
            <div className="hero-meta">
              <span className="install">
                <span className="sel">npm</span> install mls-ts
              </span>
              <span className="dotsep" />
              <span>MIT licensed</span>
            </div>
          </div>
          <HeroCode />
        </div>
      </header>

      <div className="logostrip">
        <div className="wrap inner">
          <span>A funded</span>
          <a className="pf" href={PTF} target="_blank" rel="noreferrer">
            <PtfMark />
            <b>Prototype Fund</b>
          </a>
          <span>project · public-interest open source</span>
        </div>
      </div>

      <section className="glance">
        <div className="wrap">
          <div className="glance-grid">
            <div className="card">
              <div className="ico">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3>Real end-to-end encryption</h3>
              <p>Built on MLS (RFC 9420), the modern standard for secure group messaging.</p>
            </div>
            <div className="card">
              <div className="ico">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 3H5a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3m8-18h3a2 2 0 0 1 2 2v3m0 8v3a2 2 0 0 1-2 2h-3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>One API, every platform</h3>
              <p>The same code runs in React Native and the browser, and on Node when you need it.</p>
            </div>
            <div className="card">
              <div className="ico">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Your server stays blind</h3>
              <p>All the crypto runs on the device. A server can only relay scrambled bytes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="demo" id="demo">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">Live demo</span>
            <h2 className="section-title">See it work, right here</h2>
            <p className="section-lead">
              A real encrypted group, running entirely in this browser tab. Send a message and compare the
              two sides: what the group reads, and the only thing a server ever gets to store.
            </p>
          </div>
          <Demo />
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">How it works</span>
            <h2 className="section-title">One API on top of proven crypto</h2>
            <p className="section-lead">
              You write against a small, typed API. Underneath, it runs OpenMLS, the audited Rust
              implementation of MLS, compiled to WebAssembly. No cryptography is rewritten in JavaScript.
            </p>
          </div>
          <div className="how-grid">
            <div className="how-panel">
              <div className="ptitle">The stack</div>
              <div className="flow">
                <div className="flow-box app">Your app · TypeScript</div>
                <div className="flow-arrow">↓</div>
                <div className="flow-box core">MLS4RN · MlsClient · Group</div>
                <div className="flow-arrow">↓</div>
                <div className="flow-targets">
                  <div className="flow-box">Node</div>
                  <div className="flow-box">Browser</div>
                  <div className="flow-box">React Native</div>
                </div>
                <div className="flow-arrow">↓</div>
                <div className="flow-box base">OpenMLS · Rust → WebAssembly</div>
              </div>
            </div>
            <div className="how-panel">
              <div className="ptitle">The key tree (TreeKEM)</div>
              <div className="tree-wrap">
                <KeyTree />
              </div>
              <p className="note">
                MLS arranges members in a key tree. Adding, removing, or rotating a member only touches
                one branch, not the whole group, which is what keeps large groups fast and forward secret.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="files" id="files">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">Beyond messages</span>
            <h2 className="section-title">Share files, encrypted for the group</h2>
            <p className="section-lead">
              The same group that protects your messages protects your files. Derive a per-file key from
              the group, encrypt anything with it, and store only the ciphertext. Every member can open it,
              your server cannot.
            </p>
          </div>
          <div className="how-grid">
            <div>
              <ul className="points">
                <li>
                  <Check />
                  <div>
                    <b>Any file, any size.</b> Documents, images, PDFs, backups. It is all just bytes.
                  </div>
                </li>
                <li>
                  <Check />
                  <div>
                    <b>The server stays blind.</b> It holds ciphertext and never sees the key that opens it.
                  </div>
                </li>
                <li>
                  <Check />
                  <div>
                    <b>No new keys to manage.</b> The key is derived from the group you already have.
                  </div>
                </li>
                <li>
                  <Check />
                  <div>
                    <b>Standard encryption.</b> Pair the group-derived key with WebCrypto, the same AES-GCM
                    browsers already ship.
                  </div>
                </li>
              </ul>
            </div>
            <FilesCode />
          </div>
        </div>
      </section>

      <section className="install" id="install">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">Install</span>
            <h2 className="section-title">Two packages, one API</h2>
            <p className="section-lead">
              Pick the package for your platform. The API is the same, so what you learn in one place
              carries over to the others.
            </p>
          </div>

          <div className="pkg-grid">
            <div className="pkg">
              <div className="pkg-top">
                <span className="pkg-name">mls-ts</span>
                <span className="badge">Web · Node</span>
              </div>
              <p className="pkg-for">For web apps, and Node services.</p>
              <div className="cmd">
                <span className="prompt">$ </span>npm install mls-ts
              </div>
            </div>
            <div className="pkg">
              <div className="pkg-top">
                <span className="pkg-name">mls4rn</span>
                <span className="badge">React Native</span>
              </div>
              <p className="pkg-for">For iOS and Android apps.</p>
              <div className="cmd">
                <span className="prompt">$ </span>npm install mls4rn react-native-webview
              </div>
            </div>
          </div>

          <div className="code-block">
            <pre>
              <span className="c">// two people, one encrypted group</span>
              {"\n"}
              <span className="k">import</span> {"{ MlsClient }"} <span className="k">from</span>{" "}
              <span className="s">"mls-ts"</span>
              {"\n\n"}
              <span className="k">const</span> alice = <span className="k">new</span> <span className="f">MlsClient</span>(
              <span className="s">"alice"</span>){"\n"}
              <span className="k">const</span> bob = <span className="k">new</span> <span className="f">MlsClient</span>(
              <span className="s">"bob"</span>){"\n\n"}
              <span className="k">const</span> group = alice.<span className="f">createGroup</span>(<span className="s">"team"</span>)
              {"\n"}
              <span className="k">const</span> invite = group.<span className="f">add</span>(bob.<span className="f">keyPackage</span>()){"\n"}
              <span className="k">const</span> chat = bob.<span className="f">joinGroup</span>(invite.welcome, invite.ratchetTree)
              {"\n\n"}
              <span className="k">const</span> ct = group.<span className="f">send</span>(<span className="s">"hello bob"</span>)
              {"\n"}
              chat.<span className="f">receiveText</span>(ct){"   "}
              <span className="c">// "hello bob"</span>
            </pre>
          </div>
        </div>
      </section>

      <section className="backed">
        <div className="wrap">
          <div className="backed-card">
            <div className="backed-eyebrow">Backed by</div>
            <a className="ptf-lockup" href={PTF} target="_blank" rel="noreferrer">
              <PtfMark />
              <span className="ptf-name">
                Prototype
                <br />
                Fund
              </span>
            </a>
            <p className="backed-lead">
              MLS4RN is a funded Prototype Fund project. The Prototype Fund supports open source software
              built in the public interest, chosen through an open and competitive review. In short: the
              work is independently vetted, and it stays free for anyone to use and inspect.
            </p>
            <div className="backed-tags">
              <span className="btag">Privacy and Digital Rights</span>
              <span className="btag">Class 02</span>
              <span className="btag">In funding since June 2026</span>
            </div>
            <a className="btn btn-cream" href={PTF} target="_blank" rel="noreferrer">
              See the project on Prototype Fund
            </a>
            <div className="backed-funders">
              <p className="funder-label">
                The Prototype Fund is a project of the Open Knowledge Foundation Germany, funded by the
                Federal Ministry of Research, Technology and Space.
              </p>
              <div className="funder-logos">
                <img src="/logos/okf.svg" alt="Open Knowledge Foundation Germany" />
                <img src="/logos/ministry.svg" alt="Federal Ministry of Research, Technology and Space" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">Why it matters</span>
            <h2 className="section-title">Modern security, without the plumbing</h2>
          </div>
          <div className="feat-grid">
            <div className="feat">
              <Check />
              <div>
                <h3>Group messaging, not just 1 to 1</h3>
                <p>MLS is designed for groups from the ground up, and stays efficient as they grow.</p>
              </div>
            </div>
            <div className="feat">
              <Check />
              <div>
                <h3>Forward secrecy and post-compromise security</h3>
                <p>Old messages stay safe if a key leaks, and the group heals after a compromise.</p>
              </div>
            </div>
            <div className="feat">
              <Check />
              <div>
                <h3>Optional persistence</h3>
                <p>Keep sessions across restarts with a simple storage adapter, or stay in memory.</p>
              </div>
            </div>
            <div className="feat">
              <Check />
              <div>
                <h3>Fully typed</h3>
                <p>It is TypeScript end to end, so autocomplete and the compiler guide every call.</p>
              </div>
            </div>
            <div className="feat">
              <Check />
              <div>
                <h3>Works with any backend</h3>
                <p>Every message is just bytes. Send them over your existing API, socket, or queue.</p>
              </div>
            </div>
            <div className="feat">
              <Check />
              <div>
                <h3>Open source, MIT licensed</h3>
                <p>Free to use and read. The source and this demo live on GitHub.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <span className="eyebrow">Get started</span>
          <h2 className="section-title">Add encrypted messaging today</h2>
          <div className="cta-row">
            <a className="btn btn-primary" href={NPM_RN} target="_blank" rel="noreferrer">
              Get mls4rn for React Native
            </a>
            <a className="btn btn-ghost" href={NPM_TS} target="_blank" rel="noreferrer">
              Get mls-ts for web and Node
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <a className="brand" href="#top">
              <Lock />
              mls4rn
            </a>
            <div className="footer-links">
              <a href={NPM_TS} target="_blank" rel="noreferrer">
                mls-ts
              </a>
              <a href={NPM_RN} target="_blank" rel="noreferrer">
                mls4rn
              </a>
              <a href={GITHUB} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={RFC} target="_blank" rel="noreferrer">
                RFC 9420
              </a>
            </div>
          </div>
          <div className="footer-fine">
            Funded by the Prototype Fund. MIT licensed. Built on OpenMLS.
          </div>
        </div>
      </footer>
    </>
  );
}
