<template>
  <Layout style="height: 100%" class="main">
    <!-- <Sider hide-trigger collapsible :width="220" :collapsed-width="64" v-model="collapsed" class="left-sider" :style="{overflow: 'hidden'}">
      <side-menu accordion ref="sideMenu" :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList" theme="light">
        <div class="logo-con">
          <img v-show="!collapsed" style="width:170px; height:50px; border-radius:5px 5px 5px 0; margin-left: 10px;" :src="maxLogo" key="max-logo" />
          <img v-show="collapsed" :src="minLogo" key="min-logo" />
        </div>
      </side-menu>
    </Sider> -->
    <Sider hide-trigger collapsible :width="200" :collapsed-width="64" v-model="collapsed" class="left-sider" :style="{overflow: 'hidden'}">
      <side-menu accordion ref="sideMenu" :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList" theme="light">
        <div v-if="QIANKUN">
          <!-- <p v-show="!collapsed" style="width:100%; height:100%;" key="max-logo">权限中心</p>
          <img v-show="collapsed" :src="minLogo" key="min-logo" /> -->
        </div>
        <template v-else>
          <div v-if="!collapsed" class="logo-con">
            <img :src="maxLogo" key="max-logo" />
          </div>
           <div v-if="collapsed" class="logo-min-con">
             <img :src="minLogo" key="min-logo"/>
          </div>
        </template>
      </side-menu>
    </Sider>

    <Layout>
      <Content class="main-content-con">
        <Layout class="main-layout-con">
          <Content class="content-wrapper">
            <keep-alive :include="cacheList">
              <router-view/>
            </keep-alive>
            <ABackTop :height="100" :bottom="80" :right="50" container=".content-wrapper"></ABackTop>
          </Content>
        </Layout>
      </Content>
    </Layout>
  </Layout>
</template>
<script>
import SideMenu from './components/side-menu'
import TagsNav from './components/tags-nav'
import User from './components/user'
import ABackTop from './components/a-back-top'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { getNewTagList, routeEqual } from '@/libs/util'
import routers from '@/router/routers'
import minLogo from '@/assets/images/logo-min.jpg'
import maxLogo from '@/assets/images/logo.png'
import './main.less'
export default {
  name: 'Main',
  components: {
    SideMenu,
    User,
    ABackTop
  },
  data () {
    return {
      collapsed: false,
      minLogo,
      maxLogo,
      isFullscreen: false,
      QIANKUN: window.__POWERED_BY_QIANKUN__ === undefined ? false : true
    }
  },
  computed: {
    ...mapGetters([
      'errorCount'
    ]),
    tagNavList () {
      return this.$store.state.app.tagNavList
    },
    tagRouter () {
      return this.$store.state.app.tagRouter
    },
    userAvatar () {
      return this.$store.state.user.avatarImgPath
    },
    cacheList () {
      const list = ['ParentView', ...this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name) : []]
      return list
    },
    menuList () {
      return this.$store.getters.menuList
    },
    local () {
      return this.$store.state.app.local
    },
    hasReadErrorPage () {
      return this.$store.state.app.hasReadErrorPage
    },
    unreadCount () {
      return this.$store.state.user.unreadCount
    }
  },
  methods: {
    ...mapMutations([
      'setBreadCrumb',
      'setTagNavList',
      'addTag',
      'setLocal',
      'setHomeRoute',
      'closeTag'
    ]),
    ...mapActions([
      'handleLogin',
      'getUnreadMessageCount'
    ]),
    turnToPage (route) {
      let { name, params, query } = {}
      if (typeof route === 'string') name = route
      else {
        name = route.name
        params = route.params
        query = route.query
      }
      if (name.indexOf('isTurnByHref_') > -1) {
        window.open(name.split('_')[1])
        return
      }
      this.$router.push({
        name,
        params,
        query
      })
    },
    handleCollapsedChange (state) {
      this.collapsed = state
    },
    handleCloseTag (res, type, route) {
      if (type !== 'others') {
        if (type === 'all') {
          this.turnToPage(this.$config.homeName)
        } else {
          if (routeEqual(this.$route, route)) {
            this.closeTag(route)
          }
        }
      }
      this.setTagNavList(res)
    },
    handleClick (item) {
      this.turnToPage(item)
    }
  },
  watch: {
  },
  mounted () {
  }
}
</script>
