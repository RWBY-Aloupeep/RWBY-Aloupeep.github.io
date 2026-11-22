// Theme toggle, mobile menu, header border on scroll, the current chapter in
// the menu, and the email link that copies the address.
// The initial theme is set inline in <head> (_includes/head.html).
(() => {
  const root = document.documentElement;

  // Theme

  const toggle = document.querySelector("[data-theme-toggle]");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  const storedTheme = () => {
    try {
      const value = localStorage.getItem("theme");
      return value === "dark" || value === "light" ? value : null;
    } catch (error) {
      return null;
    }
  };

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
  };

  // The inline script has already picked the theme; sync the button with it.
  applyTheme(root.getAttribute("data-theme"));

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        // Private browsing: the choice just won't persist.
      }
    });
  }

  // Follow the system when it switches (e.g. at sunset), unless the visitor
  // picked a theme themselves.
  systemDark.addEventListener("change", (event) => {
    if (!storedTheme()) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  // Mobile menu

  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = menuButton && document.getElementById(menuButton.getAttribute("aria-controls"));

  if (menuButton && menu) {
    const setOpen = (open) => {
      menuButton.setAttribute("aria-expanded", String(open));
      root.classList.toggle("menu-open", open);
    };

    menuButton.addEventListener("click", () => {
      setOpen(menuButton.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.classList.contains("menu-open")) {
        setOpen(false);
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (root.classList.contains("menu-open") && !event.target.closest(".site-nav")) {
        setOpen(false);
      }
    });
  }

  // Header border once the page scrolls

  const header = document.querySelector(".site-header");

  if (header) {
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // On the home page, mark the menu link of the chapter being read: the one
  // crossing a line a little above the middle of the screen.

  const chapters = document.querySelectorAll("[data-chapter]");
  const navLinks = document.querySelectorAll("[data-nav-section]");

  if (chapters.length && navLinks.length) {
    const markCurrent = () => {
      const line = window.innerHeight * 0.4;
      let id = null;
      chapters.forEach((chapter) => {
        if (chapter.getBoundingClientRect().top <= line) {
          id = chapter.id;
        }
      });
      // At the very bottom the last chapters may be too short to reach the
      // line: the one the address points to wins if it is in view (after a
      // click on "Acks", say), otherwise the last chapter.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        const target = location.hash && document.getElementById(location.hash.slice(1));
        const pointed = target && target.hasAttribute("data-chapter") &&
          target.getBoundingClientRect().top < window.innerHeight;
        id = pointed ? target.id : chapters[chapters.length - 1].id;
      }
      navLinks.forEach((link) => {
        if (link.dataset.navSection === id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    let frame = 0;
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          markCurrent();
        });
      }
    };
    markCurrent();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }

  // The email link in the prologue's contact links: a plain click copies the
  // address rather than opening the mail app, and the link says so for a
  // moment (.is-copied, _components.scss). Where the clipboard is out of
  // reach, the click opens the mail app after all.

  const copyByHand = (text) => new Promise((resolve, reject) => {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position: fixed; top: 0; left: 0; opacity: 0;";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    field.remove();
    if (copied) {
      resolve();
    } else {
      reject();
    }
  });

  const copy = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => copyByHand(text));
    }
    return copyByHand(text);
  };

  document.querySelectorAll("[data-copy]").forEach((link) => {
    const status = link.parentElement.querySelector("[data-copy-status]");
    let timer = 0;
    link.addEventListener("click", (event) => {
      // A click with a modifier (a new window, say) does what it usually does.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      copy(link.dataset.copy).then(() => {
        link.classList.add("is-copied");
        if (status) {
          status.textContent = "Copied to the clipboard";
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
          link.classList.remove("is-copied");
          if (status) {
            status.textContent = "";
          }
        }, 2000);
      }, () => {
        window.location.href = link.href;
      });
    });
  });
})();
