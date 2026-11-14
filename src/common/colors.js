// 预设主题色，个性化页与主题色页共用
const COLOR_OPTIONS = [
  {name: "深空蓝", value: "#237bff"},
  {name: "冰川青", value: "#06b6d4"},
  {name: "极光紫", value: "#8b5cf6"},
  {name: "樱花粉", value: "#ec4899"},
  {name: "森林绿", value: "#15803d"},
  {name: "琥珀黄", value: "#e0a422"}
]

const DEFAULT_COLOR = COLOR_OPTIONS[0].value

// 未知色值回落到默认色的名称
function colorName(value) {
  const matched = COLOR_OPTIONS.filter((item) => item.value === value)[0]
  return matched ? matched.name : COLOR_OPTIONS[0].name
}

module.exports = {
  COLOR_OPTIONS,
  DEFAULT_COLOR,
  colorName
}
