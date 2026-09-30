import { createApp } from 'vue'
import { ElasticUi } from 'elastic-ui'
import App from './App.vue'
import { router } from './router'
import './style.css'

createApp(App).use(router).use(ElasticUi).mount('#app')
