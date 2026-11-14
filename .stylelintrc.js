module.exports = {
  // .ux 不是标准 CSS，用自定义语法只把 <style> 块交给 stylelint
  customSyntax: "./scripts/stylelint-ux-syntax.js",
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["node_modules", "test", "dist", "build", "**/*.js"],
  rules: {
    "no-descending-specificity": null,
    "block-no-empty": null,
    "at-rule-no-unknown": null,
    // 自定义语法只暴露 <style> 块
    "no-empty-source": null,
    // 快应用不保证支持 flex-flow 等简写，保持现有长写法
    "declaration-block-no-redundant-longhand-properties": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["blur"]
      }
    ],
    // 快应用专有的组件标签、属性与设备形态
    "selector-type-no-unknown": [
      true,
      {
        ignoreTypes: ["page", "div", "text", "image", "scroll", "progress", "switch", "block"]
      }
    ],
    "property-no-unknown": [
      true,
      {
        ignoreProperties: [
          "placeholder-color",
          "gradient-start",
          "gradient-center",
          "gradient-end",
          "caret-color",
          "selected-color",
          "block-color",
          "layer-color",
          "thumb-color",
          "track-color"
        ]
      }
    ],
    "media-feature-name-no-unknown": [
      true,
      {
        ignoreMediaFeatureNames: ["shape"]
      }
    ],
    // 与现有写法一致的格式化规则全部关闭，只保留能查出真问题的检查
    "color-hex-length": null,
    "color-function-notation": null,
    "color-function-alias-notation": null,
    "alpha-value-notation": null,
    "number-max-precision": null
  }
}
