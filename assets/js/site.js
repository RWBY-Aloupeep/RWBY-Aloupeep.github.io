// Theme toggle, mobile menu, and header border on scroll.
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

  applyTheme(root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light"));

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
})();
