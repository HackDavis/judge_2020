const wordlist = require('./wordlist.js')

const MAX_LEN_LAST = 7;

module.exports = class util {

  static saveWithMaster(parseObject) {
    return parseObject.save(null, { useMasterKey: true })
  }

  static generateRandomPassword() {
    const i = wordlist.length;
    const wordIdx1 = Math.min(Math.floor(Math.random() * i), i-1);
    const wordIdx2 = Math.min(Math.floor(Math.random() * i), i-1);
    const wordIdx3 = Math.min(Math.floor(Math.random() * i), i-1);

    let password = wordlist[wordIdx1]+wordlist[wordIdx2]+wordlist[wordIdx3];
    let easyRead = wordlist[wordIdx1]+' '+wordlist[wordIdx2]+' '+wordlist[wordIdx3];

    return { password, easyRead };
  }

  static generateUsername(first, last) {
    if (last.length > MAX_LEN_LAST) {
      last = last.substring(0,MAX_LEN_LAST);
    }

    first = first.substring(0,1);

    let username = (first+last).toLowerCase();
    return username;
  }

  static btoa(data) {
    let buff = Buffer.from(data);
    let base64data = buff.toString('base64');
    
    return base64data;
  }

}