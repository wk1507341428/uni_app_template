const { miniProgram: { envVersion } } = uni.getAccountInfoSync();
let config = {}
if(['develop', 'trial', 'release'].includes(envVersion)){
  config = require(`./config.${envVersion}`).default
}
export default config