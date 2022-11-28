import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import tokenService from './service/tokenService'
// import usuarioService from './service/usuarioService'

import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import $ from 'jquery';
window.jQuery = window.$ = $;

import XLSX from 'xlsx';
window.XLSX = XLSX;

const app = createApp(App)

app.use(router)

app.mount('#app')


var token = window.localStorage.getItem('token')
if (token == null) {
  tokenService.checkParam()
} 
// else {
//   usuarioService.getMyUser()
// }