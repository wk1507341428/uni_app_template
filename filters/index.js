import dayjs from 'dayjs'

// 时间格式化
export function formatTime(timestamp, format = "YYYY年MM月DD日") {
	return dayjs(timestamp).format(format)
}