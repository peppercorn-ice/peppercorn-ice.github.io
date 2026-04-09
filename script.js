function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const ALLOWED_TAGS = new Set(["华为", "苹果", "三星", "谷歌"]);
let allPosts = [];
let activeTag = "";

function updateFilterStatus() {
  const status = document.getElementById("post-filter-status");
  if (!status) return;
  status.textContent = activeTag ? `当前筛选：${activeTag}` : "当前筛选：全部";
}

function getFilteredPosts(posts) {
  if (!activeTag) return posts;
  return posts.filter((post) => {
    const tags = Array.isArray(post.tags) ? post.tags : [];
    return tags.includes(activeTag);
  });
}

function renderPosts(posts) {
  const list = document.getElementById("post-list");
  if (!list) return;

  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  list.innerHTML = sorted
    .map((post) => {
      const tags = Array.isArray(post.tags)
        ? post.tags.filter((tag) => ALLOWED_TAGS.has(tag))
        : [];
      const tagHtml = tags
        .map((tag) => {
          const activeClass = tag === activeTag ? " active" : "";
          return `<button type="button" class="post-tag-chip${activeClass}" data-tag="${tag}">#${escapeHtml(tag)}</button>`;
        })
        .join("");

      return `
        <li>
          <a href="post.html?file=${encodeURIComponent(post.file)}">${escapeHtml(post.title)}</a>
          <span style="opacity:0.6; margin-left:8px;">${escapeHtml(post.date)}</span>
          ${tagHtml ? `<div class="post-tags">${tagHtml}</div>` : ""}
        </li>
      `;
    })
    .join("");
}

function bindTagFilter() {
  const list = document.getElementById("post-list");
  if (!list) return;

  list.addEventListener("click", (event) => {
    const chip = event.target.closest(".post-tag-chip");
    if (!chip) return;

    const tag = chip.dataset.tag || "";
    if (!ALLOWED_TAGS.has(tag)) return;

    activeTag = activeTag === tag ? "" : tag;
    renderPosts(getFilteredPosts(allPosts));
    updateFilterStatus();
  });
}

async function loadPosts() {
  const list = document.getElementById("post-list");
  if (!list) return;

  try {
    const res = await fetch("posts.json");
    const posts = await res.json();

    if (!Array.isArray(posts)) {
      throw new Error("posts.json 格式错误");
    }

    allPosts = posts;
    renderPosts(getFilteredPosts(allPosts));
    updateFilterStatus();
  } catch (error) {
    list.innerHTML = "<li>文章加载失败</li>";
  }
}

const revealNodes = document.querySelectorAll(".reveal");
revealNodes.forEach((node, index) => {
  setTimeout(() => {
    node.classList.add("show");
  }, index * 120);
});

const avatarWrap = document.getElementById("avatar-wrap");
if (avatarWrap && window.matchMedia("(min-width: 761px)").matches) {
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    avatarWrap.style.transform = `translate(${x}px, ${y}px)`;
  });
}

bindTagFilter();
loadPosts();
