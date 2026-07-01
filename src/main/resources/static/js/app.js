/* =========================================================================
   Todo List — frontend logic
   Vanilla JS, no framework. Talks to the Spring Boot REST API and renders the
   list. State is kept minimal: the server is the source of truth, the client
   holds the last fetched list plus the active filter.
   ========================================================================= */
(() => {
    "use strict";

    const API = "/api/todos";
    const THEME_KEY = "todo.theme";

    /* ----- Element references ------------------------------------------- */
    const el = {
        form: document.getElementById("todoForm"),
        title: document.getElementById("titleInput"),
        priority: document.getElementById("priorityInput"),
        list: document.getElementById("todoList"),
        empty: document.getElementById("emptyState"),
        clearCompleted: document.getElementById("clearCompleted"),
        filters: document.querySelectorAll(".filter"),
        themeToggle: document.getElementById("themeToggle"),
        dateLabel: document.getElementById("dateLabel"),
        toast: document.getElementById("toast"),
        template: document.getElementById("todoItemTemplate"),
        statTotal: document.getElementById("statTotal"),
        statActive: document.getElementById("statActive"),
        statDone: document.getElementById("statDone"),
        statPercent: document.getElementById("statPercent"),
        progressBar: document.getElementById("progressBar"),
        progressFill: document.getElementById("progressFill"),
    };

    /* ----- Client state ------------------------------------------------- */
    let todos = [];
    let filter = "all";

    /* ----- HTTP helper -------------------------------------------------- */
    async function request(url, options = {}) {
        const response = await fetch(url, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });

        if (!response.ok) {
            let message = `Request failed (${response.status})`;
            try {
                const body = await response.json();
                if (body.fields) {
                    message = Object.values(body.fields)[0] || message;
                } else if (body.message) {
                    message = body.message;
                }
            } catch {
                /* non-JSON error body — keep the default message */
            }
            throw new Error(message);
        }

        return response.status === 204 ? null : response.json();
    }

    const api = {
        list: () => request(API),
        create: (payload) => request(API, { method: "POST", body: JSON.stringify(payload) }),
        update: (id, payload) => request(`${API}/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
        toggle: (id) => request(`${API}/${id}/toggle`, { method: "PATCH" }),
        remove: (id) => request(`${API}/${id}`, { method: "DELETE" }),
        clearCompleted: () => request(`${API}/completed`, { method: "DELETE" }),
    };

    /* ----- Rendering ---------------------------------------------------- */
    function visibleTodos() {
        switch (filter) {
            case "active":
                return todos.filter((t) => !t.completed);
            case "completed":
                return todos.filter((t) => t.completed);
            default:
                return todos;
        }
    }

    function render() {
        const items = visibleTodos();
        const fragment = document.createDocumentFragment();

        for (const todo of items) {
            fragment.appendChild(buildRow(todo));
        }

        el.list.replaceChildren(fragment);
        el.empty.hidden = items.length !== 0;
        renderStats();
    }

    function buildRow(todo) {
        const node = el.template.content.firstElementChild.cloneNode(true);
        node.dataset.id = todo.id;
        node.classList.toggle("is-done", todo.completed);

        const checkbox = node.querySelector(".todo__checkbox");
        checkbox.checked = todo.completed;
        checkbox.setAttribute("aria-label", `Mark "${todo.title}" as ${todo.completed ? "active" : "done"}`);

        const title = node.querySelector(".todo__title");
        title.textContent = todo.title;

        const badge = node.querySelector(".badge");
        const priority = (todo.priority || "MEDIUM").toLowerCase();
        badge.classList.add(`badge--${priority}`);
        badge.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);

        node.querySelector(".todo__time").textContent = formatTime(todo.createdAt);

        return node;
    }

    function renderStats() {
        const total = todos.length;
        const done = todos.filter((t) => t.completed).length;
        const active = total - done;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);

        el.statTotal.textContent = total;
        el.statActive.textContent = active;
        el.statDone.textContent = done;
        el.statPercent.textContent = percent;
        el.progressFill.style.width = `${percent}%`;
        el.progressBar.setAttribute("aria-valuenow", String(percent));
    }

    /* ----- Actions ------------------------------------------------------ */
    async function load() {
        try {
            todos = await api.list();
            render();
        } catch (error) {
            showToast(error.message, true);
        }
    }

    async function addTodo(event) {
        event.preventDefault();
        const title = el.title.value.trim();
        if (!title) {
            return;
        }

        try {
            const created = await api.create({ title, priority: el.priority.value });
            todos.unshift(created);
            el.form.reset();
            el.priority.value = "MEDIUM";
            el.title.focus();
            render();
        } catch (error) {
            showToast(error.message, true);
        }
    }

    async function toggleTodo(id) {
        try {
            const updated = await api.toggle(id);
            replaceLocal(updated);
            render();
        } catch (error) {
            showToast(error.message, true);
        }
    }

    async function deleteTodo(id, rowNode) {
        try {
            await api.remove(id);
            todos = todos.filter((t) => t.id !== id);
            animateOut(rowNode, () => render());
            showToast("Task deleted");
        } catch (error) {
            showToast(error.message, true);
        }
    }

    async function saveEdit(id, newTitle, todo) {
        const trimmed = newTitle.trim();
        if (!trimmed || trimmed === todo.title) {
            render();
            return;
        }
        try {
            const updated = await api.update(id, {
                title: trimmed,
                completed: todo.completed,
                priority: todo.priority,
            });
            replaceLocal(updated);
            render();
        } catch (error) {
            showToast(error.message, true);
            render();
        }
    }

    async function clearCompleted() {
        const hasCompleted = todos.some((t) => t.completed);
        if (!hasCompleted) {
            showToast("No completed tasks to clear");
            return;
        }
        try {
            const result = await api.clearCompleted();
            todos = todos.filter((t) => !t.completed);
            render();
            showToast(`Cleared ${result.removed} task${result.removed === 1 ? "" : "s"}`);
        } catch (error) {
            showToast(error.message, true);
        }
    }

    /* ----- Inline editing ---------------------------------------------- */
    function startEdit(rowNode, todo) {
        const titleEl = rowNode.querySelector(".todo__title");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "todo__edit-input";
        input.value = todo.title;
        input.maxLength = 200;
        input.setAttribute("aria-label", "Edit task title");

        titleEl.replaceWith(input);
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);

        let committed = false;
        const commit = () => {
            if (committed) return;
            committed = true;
            saveEdit(todo.id, input.value, todo);
        };

        input.addEventListener("blur", commit);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                input.blur();
            } else if (e.key === "Escape") {
                committed = true;
                render();
            }
        });
    }

    /* ----- Helpers ------------------------------------------------------ */
    function replaceLocal(updated) {
        const index = todos.findIndex((t) => t.id === updated.id);
        if (index !== -1) {
            todos[index] = updated;
        }
    }

    function animateOut(rowNode, done) {
        if (!rowNode) {
            done();
            return;
        }
        rowNode.classList.add("is-leaving");
        rowNode.addEventListener("transitionend", done, { once: true });
        // Fallback in case the transition never fires.
        setTimeout(done, 350);
    }

    function formatTime(iso) {
        if (!iso) return "";
        const date = new Date(iso);
        const now = new Date();
        const sameDay = date.toDateString() === now.toDateString();
        return sameDay
            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    let toastTimer;
    function showToast(message, isError = false) {
        clearTimeout(toastTimer);
        el.toast.textContent = message;
        el.toast.classList.toggle("toast--error", isError);
        el.toast.hidden = false;
        // Force reflow so the transition runs when re-showing quickly.
        void el.toast.offsetWidth;
        el.toast.classList.add("is-visible");
        toastTimer = setTimeout(() => {
            el.toast.classList.remove("is-visible");
        }, 2600);
    }

    /* ----- Theme -------------------------------------------------------- */
    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = saved || (prefersDark ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", theme);
    }

    function toggleTheme() {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem(THEME_KEY, next);
    }

    /* ----- Event wiring (delegated where possible) --------------------- */
    function bindEvents() {
        el.form.addEventListener("submit", addTodo);
        el.themeToggle.addEventListener("click", toggleTheme);
        el.clearCompleted.addEventListener("click", clearCompleted);

        el.filters.forEach((btn) => {
            btn.addEventListener("click", () => {
                filter = btn.dataset.filter;
                el.filters.forEach((b) => {
                    const active = b === btn;
                    b.classList.toggle("is-active", active);
                    b.setAttribute("aria-selected", String(active));
                });
                render();
            });
        });

        // One listener on the list handles every row (event delegation).
        el.list.addEventListener("click", (event) => {
            const row = event.target.closest(".todo");
            if (!row) return;
            const id = Number(row.dataset.id);
            const todo = todos.find((t) => t.id === id);
            if (!todo) return;

            if (event.target.closest(".todo__delete")) {
                deleteTodo(id, row);
            } else if (event.target.closest(".todo__edit")) {
                startEdit(row, todo);
            }
        });

        el.list.addEventListener("change", (event) => {
            if (!event.target.classList.contains("todo__checkbox")) return;
            const row = event.target.closest(".todo");
            toggleTodo(Number(row.dataset.id));
        });
    }

    /* ----- Boot --------------------------------------------------------- */
    function init() {
        initTheme();
        el.dateLabel.textContent = new Date().toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
        bindEvents();
        load();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
