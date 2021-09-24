import * as utils from './tools'
import {
	uniAuth
} from '@/core/utils'
const GET = 'GET';
const POST = 'POST';
const UPLOAD_FILE = 'UPLOAD_FILE'
const UPLOAD_FILE_CUSTOM = 'UPLOAD_FILE_CUSTOM'

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
 * @param {Object} client.config.interceptor  // 拦截器
 * @param {Function} client.config.interceptor.request  // 请求拦截器
 * @param {Function} client.config.interceptor.response  // 响应拦截器
 * @param {Object} uploadFileConfig  // 上传图片是需要的配置
 */
class Interface {

	constructor(client, method, path, uploadFileConfig = {}) {

		if ([UPLOAD_FILE, UPLOAD_FILE_CUSTOM].includes(method)) {
			this.uploadFileConfig = uploadFileConfig
		}

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
		this.headers = utils._deepCopy(client.defaultConfig.headers)

		this.defaultTips = ''
	}

	/**
	 * 设置请求头
	 */
	set_headers(headers = {}) {
		this.headers = Object.assign(this.headers, headers)
		return this
	}

	/**
	 * 是否使用默认loading
	 */
	with_loading(_c, _f = true) {
		if (utils._typeOf(_f) === 'boolean' && !_f) return this
		const {
			defaultLoading
		} = this.config;
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

		return new Promise((resolve, reject) => {
			if ([GET, POST, UPLOAD_FILE_CUSTOM].includes(this.method)) {
				return this.uni_request(resolve, reject)
			}

			if ([UPLOAD_FILE].includes(this.method)) {
				return this.uni_uploadFile(resolve, reject)
			}
		})


	}


	/**
	 * @description: 原生相机图片上传 + 调用原生相机
	 */
	uni_uploadFile(resolve, reject) {
		const {
			sourceType
		} = this.uploadFileConfig
		// 这里要先唤起相机
		uniAuth('scope.camera', () => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: sourceType,
				success: async (res) => {
					let tempFilePaths = res.tempFilePaths
					this.tempFilePaths = tempFilePaths[0]
					this.uni_request(resolve, reject)
				}
			})
		})
	}


	/**
	 * @description 获取发送请求的配置
	 */
	get_config() {

		const {
			baseUrl
		} = this.config;

		if ([GET, POST].includes(this.method)) {

			const _c = [uni.request, {
				url: `${baseUrl}${this.path}`,
				data: this.body,
				header: {
					...this.headers
				},
				method: this.method,
			}]

			return _c
		}

		if ([UPLOAD_FILE, UPLOAD_FILE_CUSTOM].includes(this.method)) {

			const {
				name = 'file', formData = {}
			} = this.uploadFileConfig

			return [uni.uploadFile, {
				url: `${baseUrl}${this.path}`,
				name,
				header: {
					...this.headers
				},
				formData,
				filePath: this.tempFilePaths || this.uploadFileConfig.filePath
			}]
		}

	}


	/**
	 * @description http请求 uni.request
	 */
	uni_request(resolve, reject) {
		const {
			baseUrl,
			defaultLoading,
			interceptor
		} = this.config;

		if (this.useLoading) {
			defaultLoading.show(this.defaultTips);
		}

		let [request, _config] = this.get_config()



		// 请求拦截器
		if (
			utils._typeOf(interceptor) === 'object' &&
			utils._typeOf(interceptor.request) === 'function'
		) {
			interceptor.request(_config)
		}



		request({
			..._config,
			success: res => {
				// 这里判断下 如果是上传图片的话 返回的会是json需要自己解析一层
				if ([UPLOAD_FILE, UPLOAD_FILE_CUSTOM].includes(this.method)) {
					if(utils._typeOf(res.data) === 'string') {
						try{
							res.data = JSON.parse(res.data)
						}catch(e){}
						const { needFilePath } = this.uploadFileConfig || {}
						needFilePath && ( res.data.filePath = this.tempFilePaths || this.uploadFileConfig.filePath);
					}
				}
				
				// 响应拦截器
				if (
					utils._typeOf(interceptor) === 'object' &&
					utils._typeOf(interceptor.response) === 'function'
				) {
					interceptor.response(res, null)
				}
				this.handle_success(res, resolve, reject)
			},
			fail: error => {
				// 响应拦截器
				if (
					utils._typeOf(interceptor) === 'object' &&
					utils._typeOf(interceptor.response) === 'function'
				) {
					interceptor.response(null, error)
				}
				this.handle_fail(error, reject)
			},
			complete: () => {
				if (this.useLoading) {
					defaultLoading.hide()
				}
			},
		})

	}

	/**
	 * @description success请求
	 */
	handle_success(res, resolve, reject) {
		const {
			onServerError,
			checkCode
		} = this.config;
		const [i_code, i_whiteList] = checkCode || [];
		let {
			data,
			statusCode
		} = res || {}


		// 正常响应
		if (statusCode === 200) {
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
				onServerError(res)
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
	handle_fail(error, reject) {
		const {
			onNetworkError
		} = this.config;
		// 统一的catch逻辑
		if (
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
