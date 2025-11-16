# `is-tree-shakable`

![](https://img.shields.io/npm/v/is-tree-shakable)

This is a command-line tree-shakability doctor for JavaScript packages. Compared to alternatives, it not only reports whether a package is
tree-shakable but also pinpoints the root causes of non-tree-shakability in the JavaScript or TypeScript&nbsp;source.

<p align="center">
  <img src="https://raw.githubusercontent.com/software-mansion-labs/is-tree-shakable/refs/heads/main/example.png" />
</p>

## Getting started

1. Ensure that your package’s `package.json` file specifies [`"main"`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main)
   or&nbsp;[`"module"`](https://rollupjs.org/introduction/#publishing-es-modules).

2. If your package is built, enable source-map generation. For TypeScript, this is done
   via&nbsp;[`"sourceMap"`](https://www.typescriptlang.org/tsconfig/#sourceMap).

## Usage

1. If your package is built, run the build&nbsp;step.

2. Run `is-tree-shakable` in the package&nbsp;root:

   ```sh
   npx is-tree-shakable
   ```
