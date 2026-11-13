const prompt = require("@system.prompt")
const storage = require("@system.storage")

const STORAGE_KEY = "schedule_data"

// 时段分隔默认值
const DEFAULT_MORNING_SPLIT = "12:00"
const DEFAULT_EVENING_SPLIT = "18:00"

// 课前倒计时提前量默认值，课表未下发时使用
const DEFAULT_PRE_CLASS_MINUTES = 10

function formatTime(date) {
  return pad2(date.getHours()) + ":" + pad2(date.getMinutes())
}

// 提前量按整数分钟取，非法值回落默认值，0 表示不显示倒计时
function normalizePreClassMinutes(value) {
  const minutes = parseInt(value, 10)
  if (Number.isNaN(minutes) || minutes < 0 || minutes > 24 * 60) {
    return DEFAULT_PRE_CLASS_MINUTES
  }
  return minutes
}

function createEmptySchedule() {
  return {
    courses: [],
    timeSlots: [],
    config: {
      semesterStartDate: "",
      semesterTotalWeeks: "",
      morningAfternoonSplit: DEFAULT_MORNING_SPLIT,
      afternoonEveningSplit: DEFAULT_EVENING_SPLIT,
      preClassMinutes: DEFAULT_PRE_CLASS_MINUTES
    }
  }
}

function normalizeConfig(raw) {
  const config = raw && typeof raw === "object" ? raw : {}
  return {
    semesterStartDate: config.semesterStartDate || "",
    semesterTotalWeeks: config.semesterTotalWeeks || "",
    morningAfternoonSplit: config.morningAfternoonSplit || DEFAULT_MORNING_SPLIT,
    afternoonEveningSplit: config.afternoonEveningSplit || DEFAULT_EVENING_SPLIT,
    preClassMinutes: normalizePreClassMinutes(config.preClassMinutes)
  }
}

function periodSplits(config) {
  const normalized = normalizeConfig(config)
  const morning = timeToMinutes(normalized.morningAfternoonSplit)
  const evening = timeToMinutes(normalized.afternoonEveningSplit)
  return {
    morning: morning === null ? timeToMinutes(DEFAULT_MORNING_SPLIT) : morning,
    evening: evening === null ? timeToMinutes(DEFAULT_EVENING_SPLIT) : evening
  }
}

function normalizeScheduleData(data) {
  if (!data || typeof data !== "object") {
    return createEmptySchedule()
  }
  return {
    courses: Array.isArray(data.courses)
      ? data.courses.filter((item) => item && typeof item === "object")
      : [],
    timeSlots: Array.isArray(data.timeSlots) ? data.timeSlots : [],
    config: normalizeConfig(data.config)
  }
}

// 读取本地课表，数据损坏或不存在时返回空表
function readSchedule(callback) {
  storage.get({
    key: STORAGE_KEY,
    success: (raw) => {
      let data = null
      try {
        data = JSON.parse(raw)
      } catch (err) {
        data = null
      }
      callback(normalizeScheduleData(data))
    },
    fail: () => callback(createEmptySchedule())
  })
}

// 缺字段直接拒绝
function tryExtractSchedule(raw) {
  const payload = typeof raw === "string" ? JSON.parse(raw) : raw
  if (!payload || !Array.isArray(payload.courses) || !Array.isArray(payload.timeSlots)) {
    return null
  }
  return payload
}

function showToast(message) {
  prompt.showToast({
    message,
    duration: 2000
  })
}

function timeToMinutes(text) {
  if (!text || typeof text !== "string") {
    return null
  }
  const match = text.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return null
  }
  const hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null
  }
  return hour * 60 + minute
}

function minutesOfDay() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// onTick 每拍回调一次，用于让「进行中」与进度条跟着时间走
function startClock(vm, onTick) {
  stopClock(vm)
  vm.currentTime = formatTime(new Date())
  vm.timerId = setInterval(() => {
    vm.currentTime = formatTime(new Date())
    if (typeof onTick === "function") {
      onTick()
    }
  }, 30000)
}

function stopClock(vm) {
  if (vm.timerId) {
    clearInterval(vm.timerId)
    vm.timerId = 0
  }
}

function pad2(value) {
  return (value + "").padStart(2, "0")
}

function getPickerIndex(event, options, fallbackIndex) {
  var raw = event && (event.newValue !== undefined ? event.newValue : event.value)
  if (raw === undefined || raw === null || raw === "") {
    return fallbackIndex >= 0 ? fallbackIndex : 0
  }
  var text = raw + ""
  var directIndex = Array.isArray(options) ? options.indexOf(text) : -1
  if (directIndex >= 0) {
    return directIndex
  }
  var numeric = parseInt(text, 10)
  if (!Number.isNaN(numeric)) {
    if (numeric >= 0 && Array.isArray(options) && numeric < options.length) {
      return numeric
    }
    if (Array.isArray(options)) {
      var plainValueIndex = options.indexOf(numeric + "")
      if (plainValueIndex >= 0) {
        return plainValueIndex
      }
      var paddedValueIndex = options.indexOf(pad2(numeric))
      if (paddedValueIndex >= 0) {
        return paddedValueIndex
      }
    }
  }
  return fallbackIndex >= 0 ? fallbackIndex : 0
}

module.exports = {
  formatTime,
  minutesOfDay,
  createEmptySchedule,
  normalizeConfig,
  normalizePreClassMinutes,
  periodSplits,
  normalizeScheduleData,
  readSchedule,
  tryExtractSchedule,
  showToast,
  timeToMinutes,
  startClock,
  stopClock,
  pad2,
  getPickerIndex
}
