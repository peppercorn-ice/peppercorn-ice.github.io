const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "posts");
const OUTPUT = path.join(ROOT, "posts.json");
const ALLOWED_TAGS = new Set(["华为", "苹果", "三星", "谷歌"]);

function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith(".md"))
    .sort();
}

function getLineValue(content, key) {
  const regex = new RegExp(`^\\s*${key}\\s*:\\s*(.+)\\s*$`, "im");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function getTitle(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match && match[1].trim()) return match[1].trim();
  return path.basename(filename, ".md");
}

function normalizeDate(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value;
}

function normalizeTags(value) {
  if (!value) return [];
  const raw = value
    .split(/[,，]/)
    .map((v) => v.trim())
    .filter(Boolean);
  const filtered = raw.filter((tag) => ALLOWED_TAGS.has(tag));
  return [...new Set(filtered)];
}

function toPost(filename) {
  const filePath = path.join(POSTS_DIR, filename);
  const content = fs.readFileSync(filePath, "utf8");

  const title = getTitle(content, filename);
  const date = normalizeDate(getLineValue(content, "date"));
  const tags = normalizeTags(getLineValue(content, "tags"));

  return {
    title,
    file: filename,
    date,
    tags,
  };
}

function dateToTime(value) {
  const t = Date.parse(value || "");
  return Number.isNaN(t) ? 0 : t;
}

const posts = readMarkdownFiles(POSTS_DIR)
  .map(toPost)
  .sort((a, b) => dateToTime(b.date) - dateToTime(a.date));

fs.writeFileSync(OUTPUT, JSON.stringify(posts, null, 2) + "\n", "utf8");
console.log(`Generated posts.json with ${posts.length} posts.`);
