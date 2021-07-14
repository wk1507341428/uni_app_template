import HttpClient from './request/HttpClient'

const http = new HttpClient({
	baseUrl: 'https://sc-portal-test.pujiangmutual.com',
	defaultLoading: {
		show(defaultTips) {
			console.log('loading开始')
		},
		hide() {
			console.log('loading结束')
		},
	},
	onNetworkError(error) {
		console.log(error, "onNetworkError")
		return;
	}
})

/**
 * @description: 获取验证码
 * @param {String} photo 手机号
 */
export function SendVerifyCode(data = {phone:13344445555}) {
	return http
		.post('/rest/anon/sms', data)
		.with_loading()
		.exec();
}
