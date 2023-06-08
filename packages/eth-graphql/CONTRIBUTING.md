# Contributing to eth-graphql

First off, thanks for taking the time to contribute!

All types of contributions are encouraged and valued. However, please take the time to read this
document and search for any existing pull requests or issues that might already touch on what you
wish to add or improve. Also, before making any pull requests, please open an issue describing what
feature you wish to add to the library or what bug you're trying to fix. Unsolicited pull requests
will very likely be closed as I'm trying to keep things organized.

If you like the project, but just don't have time to contribute, that's fine. There are other easy
ways to support the project and show your appreciation, which I would also be very happy about:

- Star the repository
- Tweet about it
- Use this library in your projects
- Mention eth-graphql at local meetups and tell your friends/colleagues

## Setting up your development environment

### Install dependencies

The project uses yarn to manage dependencies:

```bash
yarn install
```

### Start your development environment

```bash
yarn dev
```

This command will build the eth-graphql package and spin up the [example](../../example/) app. Open
[http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can use the example app to test any changes you made to eth-graphql, however, make sure to
revert those changes before you submit a pull request (unless of course the purpose of your PR is to
bring changes to the example app).

### Testing

The app is tested through unit and end-to-end tests. The unit tests cover utility functions and
small modules. Bigger modules are tested through end-to-end tests.

To run all the tests on the project, you can use the command:

```bash
yarn test
```

If you wish to run the end-to-end tests only, use the command:

```bash
yarn test:e2e
```

To run the unit tests only, use:

```bash
yarn test:units
```

### Useful scripts

Linting:

```bash
yarn lint
```

Typecheck:

```bash
yarn tsc
```

Formatting:

```bash
yarn format
```

### Submitting a pull request

Once you have finished working on your feature or bug fix and wish to open a pull request, you will
first need to run the following command:

```bash
yarn changeset
```

You will be guided through a series of questions in order to describe the changes you're making and
identify how they should update the package version. As a reference:

- Breaking changes should trigger a major bump (e.g.: you've updated the config type and that change
  will require existing users to update their setup)
- Non-breaking changes that add new functionalities should trigger a minor bump (e.g.: you've added
  a new field to the config, without altering the rest of the config nor the existing
  functionalities)
- Non-breaking changes that do not add any functionality should trigger a patch bump (e.g.: you've
  fixed a bug without altering any of the existing functionalities)

Make sure to commit the changes brought to the repository after running this command. You are then
ready to submit your pull request against the `main` branch. I will do my best to review pull
requests in a timely manner; please be mindful of my time since I'm not a full time open source
contributor.
