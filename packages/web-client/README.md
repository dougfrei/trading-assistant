# Trading Assistant - Web Client

This package contains the Trading Assistant web client application. It is written in [TypeScript](https://www.typescriptlang.org/) and utilizes [React](https://react.dev/).

## Installation and configuration

Please note that [pnpm](https://pnpm.io/) is the recommended package manager for this project and will be used in all commands listed below.

```bash
# Install the project dependencies
$ pnpm install

# Copy .env.example to .env.local (make sure to configure the values in .env.local)
$ cp .env.example .env.local

# Start the dev server
$ pnpm run dev
```

## Running tests

### Component testing with React Testing Library

```bash
# Run component unit tests
$ pnpm run test
```

### E2E testing with Playwright

```bash
# Run the test suites
$ pnpm run playwright

# Run the test suites in interactive/headed mode
$ pnpm run playwright:ui
```

### Interactive testing and development with Storybook

```bash
# Start the local Storybook server
$ pnpm run storybook
```

## Notes

### TanStack Router and `AuthProvider` issue

After validating or invalidating user credentials, it is necessary to wait until the current call stack is completed before redirecting so that the `user` value in `AuthProvider` contains the correct state and it has been passed down. Even though the `router.navigate` method is called after the login/logout methods are called and the `user` value on `AuthProvider` has been updated, the navigation occurs in the same call stack before the context has had a chance to propogate down through the component tree. This causes a conflict with the `beforeLoad` route methods since they still contain the old `user` object and end up reverting the intended redirect.

The issue is solved in the `src/components/login/Login.tsx` and `src/components/AccountMenu.tsx` components by using a `setTimeout` call with a delay of 0. This causes the `router.navigate` method to be called in the next possible call stack after the `AuthProvider` has propogated the new `user` value.

## License

Distributed under the AGPL License. See [`LICENSE.txt`](LICENSE.txt) for more information.

## Contact

Doug Frei - [doug@dougfrei.com](mailto:doug@dougfrei.com)

Project Link: [https://github.com/dougfrei/trading-assistant](https://github.com/dougfrei/trading-assistant)
