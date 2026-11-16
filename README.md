# ProjectHub

## ProjectHub features

- User, project, and task records are stored in the root `db.json` file.
- Start the API with `npm run server` and the Vite app with `npm run dev`.
- Sign-up and sign-in are handled by the API. Password hashes are generated on
  the server with PBKDF2; the browser stores only the signed session token and
  public user details.
- Project and task access is checked by the API. Regular users can access only
  projects they own or belong to; admins can access and delete all projects.
- New accounts always receive the `user` role. To grant admin access, change
  the account's `role` to `admin` directly in `db.json` while the API is stopped.
  Users cannot change their own role through the application.
- API sessions expire after 12 hours. The development server generates a
  temporary signing secret on startup, so users need to sign in again after
  restarting it. Set `SESSION_SECRET` to a secure environment value for a
  stable deployment.

This local JSON-file API is intended for development and demonstrations. A
production deployment should use a production database, HTTPS, and a managed
secret.

## Development

```sh
npm run server
npm run dev
npm test
npm run lint
npm run build
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
