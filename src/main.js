// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import { directive as clickOutside } from 'v-click-outside-x'
import actions from "./libs/qiankun";
// import installPlugin from '@/plugin'
import './index.less'
import '@/assets/icons/iconfont.css'

Vue.use(ViewUI, {
    i18n: (key, value) => i18n.t(key, value)
})

/**
 * @description 注册admin内置插件
 */
// installPlugin(Vue)
/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false
    /**
     * @description 全局注册应用配置
     */
Vue.prototype.$config = config
    /**
     * 注册指令
     */
importDirective(Vue)
Vue.directive('clickOutside', clickOutside)

import "./public-path";
Vue.config.productionTip = false;

let instance = null;

function render(props = {}) {
    if (props) {
      actions.setActions(props);
    }
    const { container } = props;
    instance = new Vue({
      router,
      i18n,
      store,
    render: h => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app');
}

function storeTest(props) {
    props.onGlobalStateChange &&
        props.onGlobalStateChange(
            (value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
            true,
        );
    props.setGlobalState &&
        props.setGlobalState({
            ignore: props.name,
            user: {
                name: props.name,
            },
        });
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
}

export async function mount (props) {
  console.info('props---------',props)
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log("state: 变更后的状态; prev 变更前的状态",state, prev);
  });
  console.log('[vue] props from main framework', props);
  storeTest(props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}

