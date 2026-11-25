// Worst AI Advice: The 48-Hour Tight Line Open — make.fun entry
// The line: confident, tidy AI-assistant voice diagnosing a real problem
// (squeaky brakes) and prescribing exactly the wrong fix — lubricating
// the brake discs. It is specific enough to follow, terrible enough to
// wince at, and the explanation clause ("squeaking means they need
// lubrication") is exactly how a helpful-sounding assistant would justify it.
// Gate (from RULES.txt): UTF-8 text, 1-140 characters, not only whitespace.
import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "If your car brakes squeak, spray WD-40 on the brake discs — squeaking means they need lubrication.";

function gateCheck(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 140) {
    throw new Error(`gate: line is ${chars} characters, must be 1-140`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: line must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: line must be a single line");
  }
  if (text.includes("\u2028") || text.includes("\u2029")) {
    throw new Error("gate: line must not contain line/paragraph separators");
  }
  if (text !== text.trim()) {
    throw new Error("gate: line must not start or end with whitespace");
  }
  if (/[\u0000-\u001f\u007f\ufeff\u200b-\u200d]/.test(text)) {
    throw new Error("gate: line must not contain control or invisible characters");
  }
}

function main(): void {
  gateCheck(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const tmpPath = join(outDir, ".entry.txt.tmp");
  const outPath = join(outDir, "entry.txt");
  // Write atomically: a crash mid-write must never leave a partial entry.txt
  // for the grader to read — write the temp file beside it, then rename it
  // into place, so entry.txt is always the whole line or nothing.
  writeFileSync(tmpPath, LINE, { encoding: "utf8", mode: 0o644 });
  // The grader collects outputs as another user: leave the file readable by
  // everyone, or the run fails with "<path> is not readable".
  chmodSync(tmpPath, 0o644);
  renameSync(tmpPath, outPath);
  // Read back and re-check so a truncated or mangled write fails loudly.
  const written = readFileSync(outPath, "utf8");
  if (written !== LINE) {
    throw new Error("verify: read-back differs from line");
  }
  if (written.endsWith("\n") || written.endsWith("\r")) {
    throw new Error("verify: entry file must not end with a line break");
  }
  if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(LINE, "utf8")) {
    throw new Error("verify: entry file byte length does not match the line");
  }
  gateCheck(written);
}

main();
