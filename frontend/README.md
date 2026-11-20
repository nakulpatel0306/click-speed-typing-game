# Click Frontend

React app for Click, bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and run through [craco](https://craco.js.org/) so `@/` resolves to `src/`. See the [main README](../README.md) for full setup.

Set `REACT_APP_BACKEND_URL` in `frontend/.env` to the backend's address (for example `http://localhost:5000`), then:

| Command | What it does |
|---|---|
| `yarn start` | Dev server at `http://localhost:3000` |
| `yarn build` | Production build in `build/` |
| `yarn test` | Jest in watch mode |

Set `DISABLE_HOT_RELOAD=true` to turn off hot reloading.
