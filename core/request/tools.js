/**
 * @description typeof 类型判断扩展
 * @param {Any} o
 * @return {String} 类型
 * */
 export function _typeOf(o) {
	const {
		toString
	} = Object.prototype
	const map = {
		'[object Boolean]': 'boolean',
		'[object Number]': 'number',
		'[object String]': 'string',
		'[object Function]': 'function',
		'[object Array]': 'array',
		'[object Date]': 'date',
		'[object RegExp]': 'regExp',
		'[object Undefined]': 'undefined',
		'[object Null]': 'null',
		'[object Object]': 'object',
		'[object Symbol]': 'symbol'
	}

	return map[toString.call(o)]
}

/**
 * 简单对象的深拷贝
 * @param {Array<Any>} args 参数列表
 * @return {Object<Any>}
 */
export function _deepCopy(obj = {}) {
  if(_typeOf(obj) !== 'object') return {}
	return JSON.parse(JSON.stringify(obj))
};