module.exports = class util {
  static saveWithMaster(parseObject) {
    return parseObject.save(null, { useMasterKey: true })
  }
}