<h1 align="center">doguxclaude</h1>

<p align="center">
  <b>Claude Code that already knows your machine.</b><br>
  <sub>Type <code>dxc</code> in your terminal. The rest is automatic.</sub>
</p>

<p align="center">
  <code>dxc</code> starts Claude Code with a map of every git repo on your machine, the file structure of the repo you are in, and a one-sentence summary of each of your last 30 sessions already in context, so the model starts working instead of searching.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/doguxclaude"><img src="https://img.shields.io/npm/v/doguxclaude?color=a855f7&labelColor=1a1a2e&label=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/setup-zero%20steps-a855f7?labelColor=1a1a2e" alt="zero setup">
  <img src="https://img.shields.io/badge/tokens-62%25%20fewer-22d3ee?labelColor=1a1a2e" alt="62% fewer tokens">
  <img src="https://img.shields.io/badge/license-MIT-a855f7?labelColor=1a1a2e" alt="MIT">
</p>

<p align="center">
  <sub>English · <a href="https://github.com/sdogukan/doguxclaude/blob/main/docs/README.tr.md">Türkçe</a></sub>
</p>

<h3 align="center">
  Everything else in this space asks you to set something up.<br>This is one command.
</h3>

<p align="center">
  <sub>The others have you install Obsidian, bring up Docker, fill in 39 placeholders.<br>
  Here there is nothing to install. No commands to memorize.</sub>
</p>

```
╭──────────────────────┬──────────────────────┬──────────────────────╮
│                      │                      │                      │
│         62%          │         49%          │         35%          │
│     FEWER TOKENS     │        FASTER        │     FEWER TOKENS     │
│                      │                      │                      │
│    "where was I"     │    "where was I"     │  "what's this repo"  │
│     357K → 136K      │     82 s → 41 s      │      107K → 70K      │
│                      │                      │                      │
│        memory        │        memory        │   map + structure    │
╰──────────────────────┴──────────────────────┴──────────────────────╯
        same questions, with and without dxc · three runs each        
```

```bash
npm install -g doguxclaude
dxc
```

```

 ██████╗  ██╗  ██╗  ██████╗
 ██╔══██╗ ╚██╗██╔╝ ██╔════╝
 ██║  ██║  ╚███╔╝  ██║
 ██║  ██║  ██╔██╗  ██║
 ██████╔╝ ██╔╝ ██╗ ╚██████╗
 ╚═════╝  ╚═╝  ╚═╝  ╚═════╝

   dogu x claude  ·  Dogu X Vibes

╭─────────────────────────────────────────╮
│ ▸ 11 repos scanned in 220 ms            │
│ + Projects/web-app new repo             │
│ ~ Desktop/doguxclaude structure changed │
│ ▸ you are here: api-platform            │
╰─────────────────────────────────────────╯
 ✔ starting claude 187 ms
```

<p align="center">
  <b>Zero model calls on every launch.</b> If the map is current, the scan takes 250 ms and the session opens.
</p>

---

## It does three things

```
╭───────────────╮   ╭───────────────╮   ╭───────────────╮
│      MAP      │   │   STRUCTURE   │   │    MEMORY     │
│               │   │               │   │               │
│  what is      │   │  what is      │   │  what we      │
│  where        │   │  inside       │   │  talked about │
│               │   │               │   │               │
│  11 repos     │   │  10 ms        │   │  30 sessions  │
│  one line     │   │  from code    │   │  one sentence │
╰───────────────╯   ╰───────────────╯   ╰───────────────╯
  every launch      when you name it         on exit
```

---

## Why

Ask Claude Code about a repo and the first thing it does is **go looking** for it.
It does not know where the repo is, what is in it, or which files exist.

```
╭─ without dxc ────────────────────────────────────╮
│ › what is api-platform, one sentence             │
│                                                  │
│   ⎿ ls -d ~/*api-platform*     looking for repo  │
│   ⎿ ls api-platform/           looking at layout │
│   ⎿ cat README.md              ✗ no such file    │
│                                                  │
│   83,906 tokens · 15.8 s                         │
╰──────────────────────────────────────────────────╯
```

The agent guessed at a `README.md` that does not exist and got an error. That
repo has a `CLAUDE.md`. It had no way of knowing.

```
╭─ with dxc ──────────────────────────────────────────╮
│ › what is api-platform, one sentence                │
│                                                     │
│   map and structure already in hand, no searching   │
│   ⎿ cat CLAUDE.md              straight to the file │
│                                                     │
│   48,915 tokens · 10.6 s                            │
╰─────────────────────────────────────────────────────╯
```

The structure block lists root files **by name**. No more guessing.

---

## Grunt work in code, judgement in the model

Most tools in this space share the same reflex: **make the model do it.**
Set up a vector database, generate embeddings, run a sub-agent on every edit.

We do the opposite. **Extracting a repo's structure is reading, not judgement.**
`git ls-files` does it in 10 ms and never goes stale. The model is asked only the
one thing that truly needs judgement: what this repo does, one sentence, once.

| What | Time |
|---|---|
| Scan 11 repos, refresh the map | **250 ms** |
| Extract the structure of a 1,120-file repo | **10 ms** |
| Reduce a session to one sentence | **6 s**, in the background |

Output does not grow with the codebase:

```
    28 files  ▏████                      14 lines
   246 files  ▏███████████               41 lines
 1,120 files  ▏████████████████████      72 lines
```

A folder is expanded if it holds at least **two percent** of the files. Smaller
siblings are collapsed into one line, but **every name is written out**. Measured:
given three examples, the agent ran `ls` to learn the rest.

---

## What else is out there

| | Setup | How memory gets written | Model cost |
|---|---|---|---|
| [claude-code-memory-setup](https://github.com/lucasrosati/claude-code-memory-setup) <sub>966★</sub> | Obsidian + 3 plugins, Graphify, a Python package, cron | If you remember to type `/save` | — |
| [claudecode-harness](https://github.com/anothervibecoder-s/claudecode-harness) <sub>222★</sub> | Copy the template, fill in **39 placeholders**, write the hook yourself | If the model does not forget the instruction | — |
| [Claude-code-memory](https://github.com/Durafen/Claude-code-memory) <sub>74★</sub> | Two repos, **Docker, Qdrant**, an embeddings API key | When you run the indexer | Up to 60 s of Sonnet on every edit |
| [clauth Hive Mind](https://github.com/umuplus/clauth) <sub>6★</sub> | Enable per profile, confirm **Y/n every session** | If you confirm | A full agent run per session |
| **doguxclaude** | **None** | **Automatically** | **One sentence per session** |

**Two of them are not even tools.** The 966-star one has 433 lines of executable
code and 1,276 lines of README; `/save` and `/resume` are not real commands, they
are prose instructions written into CLAUDE.md. The 222-star one is two markdown
files without a single code block, and the hook it mentions does not exist in the
repo.

**The numbers do not hold up either.** One claims "71.5× fewer tokens"; the source
is one estimate divided by another, and the same page says "499×" elsewhere. The
numbers in another one's README have no benchmark counterpart anywhere in its repo.

The method behind our numbers is written below, including the scenario we lose.

### Where we are behind

**Depth.** They go down to function and class level with tree-sitter. Our map
stops at folder and file names.

**Persistence.** Our memory is 30 lines; when the thirty-first arrives, the oldest
is dropped for good. clauth's wiki accumulates and is searchable.

**Maturity.** Zero users, tested only on macOS so far.

These are choices. Adding search and a graph takes infrastructure, and
infrastructure means setup. We keep setup at zero.

---

## Memory

When you exit, that session is reduced to one sentence and written under the map.
The next day you type `dxc`, and where you left off is already there.

```
## Memory

- 2026-09-06 · doguxclaude · Hook changed to inject the structure of the repo
  being asked about; npm publish blocked on an access token.
- 2026-09-05 · api-platform · Fargate flow planned, CDK stack left open.
```

Capped at thirty lines, so the file never bloats. Runs in the background; the
terminal comes back instantly. It is written even if you close the window.

---

## Measurements

Same questions, with and without `dxc`.

| Question | Tokens | Time | Turns |
|---|---|---|---|
| "Where did I leave off" <br><sub>thanks to memory</sub> | 357K → **136K** · 62% fewer | 81.5 → **41.3 s** · 49% faster | 19.7 → 12.0 |
| "What is this repo, where is it" <br><sub>thanks to map + structure</sub> | 107K → **70K** · 35% fewer | 22.0 → **14.3 s** · 35% faster | 5.8 → 4.5 |

Without memory, the model **digs through files** to find out what it did: it reads
git history, checks file timestamps, opens the README and source files. About
twenty turns, eighty seconds.

Cost also becomes **predictable**. Three runs without memory spent 196K, 412K and
463K tokens, a two-and-a-half-fold spread. With memory: 99K, 147K, 163K.

**It does not always win.** On a small repo, on a question that already goes deep,
handing over the structure up front sent the agent on a longer tour: 5% more
tokens, 21% slower. dxc pays off on "what is this, where is it, which files exist"
questions.

<sub>Two repos (28 and 1,120 files), two question types, a separate scenario for
memory. Two runs each for map and structure, three each for memory. Memory lines
were not hand-written; the lines the system produced from real session transcripts
were used. Tokens are total processed tokens including input and cache, taken from
`claude -p --output-format json` output.</sub>

---

## Commands

```
dxc            start
dxc reset      rebuild the map from scratch
```

That is all. Nothing is written to your `~/.claude/settings.json`.

Rules and measurements: [`NE-YAPIYOR.md`](NE-YAPIYOR.md) (Turkish) · Design: [`TASLAK.md`](TASLAK.md) (Turkish)

---

<p align="center">
  <sub>MIT · Doğukan Şahin · <a href="https://github.com/sdogukan">Dogu X Vibes</a></sub>
</p>
