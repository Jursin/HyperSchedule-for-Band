const storage = require("@system.storage")
const colors = require("./colors.js")

const PREFERENCE_KEY = "app_preferences"
const DEFAULT_COLOR = colors.DEFAULT_COLOR

const DEFAULT_PREFERENCES = {
  themeColor: DEFAULT_COLOR,
  hideTeacher: false,
  centerHomeText: false,
  prefixAtSymbol: false,
  hideRemark: false
}

// 内存缓存：应用启动时预载，页面同步读取首帧主题色
let cachedPrefs = null

function parsePreferences(raw) {
  let pref = {}
  if (typeof raw === "string") {
    try {
      pref = JSON.parse(raw) || {}
    } catch (err) {
      pref = {}
    }
  }
  const merged = Object.assign({}, DEFAULT_PREFERENCES, pref)
  // 旧版本存的是「显示备注」，取反后迁移到「隐藏备注」
  if (!("hideRemark" in pref) && typeof pref.showRemark === "boolean") {
    merged.hideRemark = !pref.showRemark
  }
  // 迁移完就把旧键丢掉，避免一直留在存储里
  delete merged.showRemark
  return merged
}

// 同步返回缓存的主题色，缓存未就绪时回退默认色
function getCachedThemeColor() {
  return cachedPrefs ? cachedPrefs.themeColor : DEFAULT_COLOR
}

// 读取偏好，回调返回 { themeColor, hideTeacher, centerHomeText, prefixAtSymbol, hideRemark }
function getPreferences(callback) {
  const done = (pref) => {
    cachedPrefs = pref
    if (callback) {
      callback(pref)
    }
  }
  storage.get({
    key: PREFERENCE_KEY,
    success: (raw) => done(parsePreferences(raw)),
    fail: () => done(Object.assign({}, DEFAULT_PREFERENCES))
  })
}

// 合并写入偏好，回调接收是否成功
function setPreferences(patch, callback) {
  const write = (pref) => {
    storage.set({
      key: PREFERENCE_KEY,
      value: JSON.stringify(pref),
      success: () => {
        cachedPrefs = pref
        if (callback) {
          callback(true)
        }
      },
      fail: () => {
        if (callback) {
          callback(false)
        }
      }
    })
  }
  storage.get({
    key: PREFERENCE_KEY,
    success: (raw) => {
      write(Object.assign(parsePreferences(raw), patch))
    },
    fail: () => {
      write(Object.assign({}, DEFAULT_PREFERENCES, patch))
    }
  })
}

module.exports = {
  getPreferences,
  setPreferences,
  getCachedThemeColor
}
