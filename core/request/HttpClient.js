import Interface from './Interface'

/**
 * @param {Object} config
 * @param {String} config.baseUrl
 * @param {Function} config.onNetworkError 使用统一的catch
 * @param {Function} config.onServerError 统一处理code码错误
 * @param {Object} config.defaultLoading 默认loading 设置
 * @param {Function} config.defaultLoading.show
 * @param {Function} config.defaultLoading.hide
 * @param {Array} config.checkCode  // 如果接口是根据类似code判断的就可以用上
 * @param {String} config.checkCode[0]  // 字段名称
 * @param {Array} config.checkCode[1]  // 白名单
 * @param {Array} config.headers  // 请求头
 * @param {Object} config.interceptor  // 拦截器
 * @param {Function} config.interceptor.request  // 请求拦截器
 * @param {Function} config.interceptor.response  // 响应拦截器
 */
class HttpClient {
  constructor(config) {
		const interceptor = {			
			request: () => {},
			response: () => {},
		}
    this.body = {};
    this.defaultConfig = Object.assign({ interceptor }, config);
  }

  /**
   * @description get请求
   * @param {String} path 
   * @param {Object} params 
   */
  get(path, params = {}) {
    this.body = params
    return new Interface(this, 'GET', path)
  }

  /**
   * @description post请求
   * @param {String} path 
   * @param {Object} body 
   */
  post(path, body = {}) {
    this.body = body
    return new Interface(this, 'POST', path)
  }
	
	/**
	 * @description 上传文件请求 这个是原生相机
	 * @param {String} path 
	 * @param {Object} uploadFileConfig  wx.chooseImage 和 wx.uploadFile 的配置文件
	 */
	uploadFile(path, uploadFileConfig) {
		return new Interface(this, 'UPLOAD_FILE', path, uploadFileConfig)
	}
	
	/**
	 * @description 上传文件请求 这个是自定义相机 参数直接传文件流的 { filePath: xxx }
	 * @param {String} path 
	 * @param {Object} uploadFileConfig  wx.uploadFile 的配置文件
	 */
	uploadFileCustom(path, uploadFileConfig) {
		return new Interface(this, 'UPLOAD_FILE_CUSTOM', path, uploadFileConfig)
	}

}

export default HttpClient