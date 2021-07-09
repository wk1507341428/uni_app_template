/**
 * @description toast轻提示
 * @param {String} title 文案提示
 * @param {String} icon 图标
 */
export function toast(title = "", icon = 'none') {
	uni.showToast({
		title,
		icon
	})
}

/**
 * @description dialog 提示
 * @param {String} content 文案提示
 * @param {String} title 文案标题
 */
export function uniDialog(content = '系统繁忙，请稍后再试', title = "温馨提示") {
	uni.showModal({
		title,
		content,
		showCancel: false
	})
}

/**
 * @description 判断一个字符串是不是链接
 */
export function isDomain(url) {
	return /(http|https):\/\/([\w.]+\/?)\S*/.test(url)
}

/**
 * @description typeof 类型判断扩展
 * @param {Any} o
 * @return {String} 类型
 * */
export function typeOf(o) {
	const {
		toString
	} = Object.prototype
	const map = {
		'[object Boolean]': 'Boolean',
		'[object Number]': 'Number',
		'[object String]': 'String',
		'[object Function]': 'Function',
		'[object Array]': 'Array',
		'[object Date]': 'Date',
		'[object RegExp]': 'RegExp',
		'[object Undefined]': 'Undefined',
		'[object Null]': 'Null',
		'[object Object]': 'Object',
		'[object Symbol]': 'Symbol'
	}

	return map[toString.call(o)]
}

/**
 * @description: 按照 344 格式化手机号
 * @param {String} phone
 * @return {String} formatPhone
 */
export function phoneSeparated(phone) {
	return phone.replace(/\s/g, '').replace(/(\d{3})(\d{0,4})(\d{0,4})/, '$1 $2 $3')
}

/**
 * @description: 各种小程序更新
 */
export function updateManager() {
	if (!uni.canIUse('getUpdateManager')) return
	const updateManager = uni.getUpdateManager();
	// 检查更新
	updateManager.onCheckForUpdate(function(res) {
		if (res.hasUpdate) {
			updateManager.onUpdateReady(function() {
				uni.showModal({
					title: '更新提示',
					content: '新版本已经上线啦~，为了获得更好的体验，建议立即更新',
					showCancel: false,
					success(res) {
						if (res.confirm) {
							// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
							updateManager.applyUpdate()
						}
					}
				})
			})

			updateManager.onUpdateFailed(function() {
				uni.showModal({
					title: '更新失败',
					content: '新版本更新失败，为了获得更好的体验，请您删除当前小程序，重新搜索打开',
					showCancel: false,
					success() {}
				})
			})

		}
	})
}
