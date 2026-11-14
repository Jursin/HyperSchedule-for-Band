// stylelint 自定义语法：只把 <style> 块交给 postcss，其余部分用空白占位以保留行号
const postcss = require("postcss")

function splitStyle(source) {
  const open = source.search(/<style[^>]*>/)
  const close = source.lastIndexOf("</style>")
  if (open < 0 || close < 0) {
    return {head: source, body: "", tail: ""}
  }
  const openEnd = source.indexOf(">", open) + 1
  return {
    head: source.slice(0, openEnd),
    body: source.slice(openEnd, close),
    tail: source.slice(close)
  }
}

function maskOutside(text) {
  return text.replace(/[^\n]/g, " ")
}

module.exports = {
  parse(source, opts) {
    const parts = splitStyle(source)
    const root = postcss.parse(maskOutside(parts.head) + parts.body + maskOutside(parts.tail), {
      from: opts && opts.from
    })
    root.raws.uxParts = parts
    return root
  },

  // 把改动写回 <style> 块，避免 --fix 时覆盖掉模板与脚本
  stringify(node, builder) {
    const parts = node.raws && node.raws.uxParts
    if (!parts) {
      return postcss.stringify(node, builder)
    }
    let css = ""
    postcss.stringify(node, (chunk) => {
      css += chunk
    })
    const start = parts.head.length
    const end = css.length - maskOutside(parts.tail).length
    builder(parts.head + css.slice(start, end) + parts.tail, node)
  }
}
