# \<firebase-uploadfile>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i firebase-uploadfile
```

## Usage

```html
<script type="module">
  import 'firebase-uploadfile/firebase-uploadfile.js';
</script>

<firebase-uploadfile></firebase-uploadfile>
```

## Styling

- **--firebase-uploadfile-width-image**, default value 150px;
- **--firebase-uploadfile-zoom-image**, default value 1.2;
- **--firebase-uploadfile-progress-bg**, default valuecolor, #eee;
- **--firebase-uploadfile-progress-color1**, default value #09c;
- **--firebase-uploadfile-progress-color2**, default value #f44;
- **--firebase-uploadfile-progress-width**, default value 500px;
- **--firebase-uploadfile-bgcolor-button**, default value #106BA0;
- **--firebase-uploadfile-color-button**, default value #FFF;
- **--firebase-uploadfile-progress-width**, default value 500px

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to minimize the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
