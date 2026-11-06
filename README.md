# React + Vite

## ProjectHub features

- Project and task lists support searching across every record field. Results
  update 300 ms after the user stops typing.
- Project details are nested under `/dashboard/projects/:id` and share the
  dashboard layout.
- The sign-up, sign-in, and account profile flow is a local demonstration:
  account records and sessions live in the current browser's `localStorage`.
  Passwords are salted and hashed with PBKDF2, but client-side storage is not
  production authentication. A production deployment needs a trusted server
  for identity, authorization, and account storage.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
