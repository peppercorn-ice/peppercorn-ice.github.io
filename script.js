function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderPosts(posts) {
  const list = document.getElementById("post-list");
  if (!list) return;

  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  list.innerHTML = sorted
    .map((post) => {
      const tags = Array.isArray(post.tags) ? post.tags : [];
      const tagText = tags.map((tag) => `#${escapeHtml(tag)}`).join(" ");

      return `
        <li>
          <a href="post.html?file=${encodeURIComponent(post.file)}">${escapeHtml(post.title)}</a>
          <span style="opacity:0.6; margin-left:8px;">${escapeHtml(post.date)}</span>
          ${tagText ? `<div style="font-size:12px; opacity:0.7; margin-top:4px;">${tagText}</div>` : ""}
        </li>
      `;
    })
    .join("");
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

    renderPosts(posts);
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

loadPosts();
