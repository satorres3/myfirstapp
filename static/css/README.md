# CSS Structure

The CSS for the portal is split into logical files and bundled via `@import` in `main.css`.

- `variables.css` – global CSS custom properties (variables).
- `components.css` – base styles and shared components.
- `login.css` – styles specific to the login page.
- `portal.css` – styles for the main portal, settings, and containers.

`main.css` imports these files so Vite or any PostCSS pipeline can bundle them for production.

