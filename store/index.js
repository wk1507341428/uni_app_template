import Vue from 'vue'
import Vuex from 'vuex'
import global from './modules/global'

Vue.use(Vuex);

//Vuex.Store 构造器选项
const store = new Vuex.Store({
  modules:{
		global
	}
})

export default store