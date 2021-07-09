import * as utils from './tools'
const GET = 'GET';
const POST = 'POST';
const UPLOAD_FILE = 'UPLOAD_FILE'

/**
 * @param {Object} client
 * @param {String} client.baseUrl
 * @param {Function} client.onNetworkError 使用统一的catch
 * @param {Function} client.onServerError 统一处理code码错误
 * @param {Object} client.defaultLoading 默认loading 设置
 * @param {Function} client.defaultLoading.show
 * @param {Function} client.defaultLoading.hide
 * @param {Array} client.checkCode  // 如果接口是根据类似code判断的就可以用上
 * @param {String} client.checkCode[0]  // 字段名称
 * @param {Array} client.checkCode[1]  // 白名单
 * @param {Array} client.headers  // 请求头
 * @param {Object} config.interceptor  // 拦截器
 * @param {Function} config.interceptor.request  // 请求拦截器
 * @param {Function} config.interceptor.response  // 响应拦截器
 */
class Interface {

  constructor(client, method, path) {

    // 请求方法
    this.method = method

    // 配置参数
    this.config = client.defaultConfig;

    // 是否使用内置Loading
    this.useLoading = false

    // 请求路径
    this.path = path;

    // 请求参数
    this.body = client.body;

    // true 自己catch错误   false 使用统一catch
    this.catchError = false;
    // true 统一处理code码错误   false 使用统一处理
    this.serverError = false;
    // 请求头
    this.headers = utils._deepCopy(client.headers)

    this.defaultTips = ''
  }

  /**
   * 是否使用默认loading
   */
  with_loading(_c) {
    if (utils._typeOf(_c) === 'boolean' && !_c) return
    const { defaultLoading } = this.config;
    if (utils._typeOf(defaultLoading) === 'object') {
      if (
        utils._typeOf(defaultLoading.show) === 'function' &&
        utils._typeOf(defaultLoading.hide) === 'function'
      ) {
        this.useLoading = true;
        (utils._typeOf(_c) === 'string') && (this.defaultTips = _c);
      }
    }
    return this
  }

  /**
   * 使用自己的loading
   */
  custom_loading(customLoading) {
    if (utils._typeOf(customLoading) === 'object') {
      if (
        utils._typeOf(customLoading.show) === 'function' &&
        utils._typeOf(customLoading.hide) === 'function'
      ) {
        this.config.defaultLoading = customLoading;
        this.useLoading = true;
      }
    }

    return this
  }

  /**
   * 使用自己的catch / 不走统一catch
   */
  catch_http_error() {
    this.catchError = true;
    return this;
  }

  /**
   * 自己处理code码错误 / 不走统一处理
   */
  dispose_server_error() {
    this.serverError = true;
    return this;
  }

  exec() {
    if([GET,POST].includes(this.method)) {
      return this.uni_request()
    }
  }

  /**
   * @description http请求 uni.request
   */
  uni_request() {
    const { baseUrl, defaultLoading, interceptor } = this.config;

    return new Promise((resolve, reject) => {
      if (this.useLoading) {
        defaultLoading.show(this.defaultTips);
      }

      let _config = {
        url: `${baseUrl}${this.path}`,
        data: this.body,
        header: { ...this.headers },
        method: this.method,
      }

      // 请求拦截器
      if( 
        utils._typeOf(interceptor) === 'object' &&
        utils._typeOf(interceptor.request) === 'function'
      ) {
        interceptor.request(_config)
      }

      uni.request({
        ..._config,
        success: res => {
          this.handle_success(res, resolve, reject)
        },
        fail: error => {
          this.handle_fail(error, reject)
        },
        complete: () => {
          if (this.useLoading) {
            defaultLoading.hide()
          }
        },
      })

    })
  }

  /**
   * @description success请求
   */
  handle_success (res, resolve, reject) {
    const { onServerError, checkCode } = this.config;
    const [i_code, i_whiteList] = checkCode || [];
    const { data, statusCode } = res || {}

    // 正常响应
    if(statusCode === 200) {
      // 如果checkCode是正常的那么肯定请求成功了
      // 如果没设置checkCode那状态码是200那也肯定是成功的
      if ( 
        !i_code || 
        i_whiteList.includes(res[i_code])
      ) {
        resolve(data)
      } 
      // 如果设置了checkCode但是状态码遗产 如果设置了统一处理 会走这里
      else if (
        !this.serverError && 
        utils._typeOf(onServerError) === 'function'
      ) {
        onServerError(data)
      } 
      // 想自己处理的
      else {
        resolve(data)
      }
    }
    // 如果状态码不是200
    else {
      this.handle_fail(res, reject)
    }

  }

  /**
   * @description fail 请求
   */
  handle_fail (error, reject) {
    const { onNetworkError } = this.config;
    // 统一的catch逻辑
    if(
      !this.catchError &&
      utils._typeOf(onNetworkError) === 'function'
    ) {
      onNetworkError(error)
    } 
    // 自己catch
    else {
      reject(error)
    }
  }






}

export default Interface