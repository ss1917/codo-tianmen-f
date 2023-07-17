import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"

import user from './module/user'
import app from './module/app'
import router from './module/router'
import bpmn from "./module/bpmn";

Vue.use(Vuex)

export default new Vuex.Store({
    plugins: [createPersistedState({
        storage: window.sessionStorage,
        reducer(val) {
            return {
                app: val.app
            }
        }
    })],
    state: {
        //
    },
    mutations: {
        //
    },
    actions: {
        //
    },
    modules: {
        user,
        app,
        router,
        bpmn
    }
})