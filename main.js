import Vue from 'vue'
import App from './App'
import uView from 'uview-ui';
import * as filters from './filters/index.js'
import * as utils from './core/utils.js'
Vue.use(uView);

Vue.config.productionTip = false
Vue.prototype.$utils = utils

App.mpType = 'app'

// 添加全局filter
Object.keys(filters).map(v => Vue.filter(v, filters[v]))

const app = new Vue({
   ...App
})
app.$mount()
