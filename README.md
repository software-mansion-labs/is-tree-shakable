# `is-tree-shakable`

![](https://img.shields.io/npm/v/is-tree-shakable)

This is a command&zwj;-&zwj;line tree&zwj;-&zwj;shakability doctor for JavaScript packages. Compared to alternatives, it not only reports whether a package is
tree&zwj;-&zwj;shakable but also pinpoints the root causes of non&zwj;-&zwj;tree&zwj;-&zwj;shakability in the JavaScript or TypeScript&nbsp;source.

<p align="center">
  <img src="https://raw.githubusercontent.com/software-mansion-labs/is-tree-shakable/refs/heads/main/example.png" />
</p>

## Getting started

1. Ensure that your package’s `package.json` file specifies [`"main"`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main)
   or&nbsp;[`"module"`](https://rollupjs.org/introduction/#publishing-es-modules).

2. If your package is built, enable source&zwj;-&zwj;map generation. For TypeScript, this is done
   via&nbsp;[`"sourceMap"`](https://www.typescriptlang.org/tsconfig/#sourceMap).

## Usage

1. If your package is built, run the build&nbsp;step.

2. Run `is-tree-shakable` in the package&nbsp;root:

   ```sh
   npx is-tree-shakable
   ```

   If the package is tree&zwj;-&zwj;shakable, `is-tree-shakable` produces no output and exits with code 0; otherwise, it lists the root causes of non&zwj;-&zwj;tree&zwj;-&zwj;shakability and exits with code&nbsp;1.

## Background

_Tree shaking_ is a technique used by modern JavaScript builds tools&zwj;—&zwj;such as Webpack, Rollup, or Parcel&zwj;—&zwj;to remove unused code during bundling, saving space and boosting performance. It’s particularly beneficial for package consumers, who often use only a subset of the exported members. While tree shaking occurs in the consumer’s build pipeline, a package must meet two criteria to enable the removal of its unconsumed code. When this is the case, the package is&nbsp;_tree&zwj;-&zwj;shakable_.

1. It must use ES6&nbsp;modules.
2. It must be obviously free of externally observable side effects that occur during module&nbsp;evaluation.

While the adoption of ES6 modules is straightforward, the second requirement presents a significant pitfall. Some logic&zwj;—&zwj;like modifying `window` at the module level&zwj;—&zwj;is evidently problematic. However, because the static analysis that powers tree shaking in widely used bundlers is quite simplistic, they err on the side of caution and also treat many verifiably side effect&zwj;–&zwj;free constructs as side&zwj;-&zwj;effectful. As a result, code that could be safely eliminated is unexpectedly&nbsp;retained.

`is-tree-shakable` helps avoid this: it pinpoints constructs that block tree shaking, whether they truly have externally observable side effects or merely are treated as such by bundlers. Collectively, these are referred to as _possibly&nbsp;side-effectful_.

## Addressing non-tree-shakability

When `is-tree-shakable` flags a construct as possibly side-effectful, evaluate if it actually has externally observable side effects. If so, move it accordingly. If not, use `@__PURE__`, which is a standard annotation that bundlers treat as a guarantee of&nbsp;non&zwj;-&zwj;side&zwj;-&zwj;effectfulness.

- For call expressions, usage is&nbsp;straightforward:

  ```js
  /* @__PURE__ */ foo();
  ```

- Other constructs&zwj;—&zwj;such as property access&zwj;—&zwj;may also be reported as possibly side effectful, but `@__PURE__` is applicable only to call expressions. To work around this, use an&nbsp;IIFE:

  ```js
  /* @__PURE__ */ (() => bar.baz)();
  ```

## By [Software Mansion](https://swmansion.com)

Founded in 2012, [Software Mansion](https://swmansion.com) is a software agency with experience in
building web and mobile apps. We are core React Native contributors and experts in dealing with all
kinds of React Native issues. We can help you build your next dream
product&zwj;—&zwj;[hire&nbsp;us](https://swmansion.com/contact/projects?utm_source=is-tree-shakable&utm_medium=readme).

[![](https://logo.swmansion.com/logo?color=white&variant=desktop&width=152&tag=is-tree-shakable-github)](https://swmansion.com)

[![](https://contrib.rocks/image?repo=software-mansion-labs/is-tree-shakable)](https://github.com/software-mansion-labs/is-tree-shakable/graphs/contributors)
