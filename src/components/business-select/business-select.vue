<template>
  <div
    class="busines-avatar-dropdown">
    <template >
      <Select
        filterable
        label-in-value
        v-model="theBusiness"
        placeholder="请选择业务"
        @on-change="handlerChange">
        <Option
          v-for="item in businessData"
          :value="item.app_id"
          :key="item.app_id"
          :label="item.app_name" />
      </Select>
    </template>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'
export default {
  name: 'BusinessSelect',
  data () {
    return {
      businessData: [],
      theBusiness: this.$store.state.app.theBusiness
    }
  },
  methods: {
    ...mapActions(['handlerGetBusinessList', 'handlerSelectBusiness']),
    ...mapMutations(['setBusinessObj']),
    handlergetBusinessList () {
      this.handlerGetBusinessList().then(res => {
        if (res.data.data.length > 0) {
          this.businessData = res.data.data
          if (!this.theBusiness) {
            this.theBusiness = 1
          }
        } else {
          this.businessData = []
          this.$Message.error({ content: res.data.msg, duration: 5 })
        }
      })
    },

    handlerChange (value) {
      this.$emit('change', value)
      this.handlerSelectBusiness({ 'business_id': value.value, 'resource_group': value.label })
    }
  },
  computed: {
    ...mapState({
      rules: state => state.user.rules,
      showBusiness: state => state.app.showBusiness,
      theBusinessStore: state => state.app.theBusiness
    })
  },
  watch: {
    theBusinessStore (val) {
      this.theBusiness = val
    },
    theBusiness (val) {
    }
  },
  created () {
    this.handlergetBusinessList()
  },
  mounted () {
    // document.addEventListener("visibilitychange", function () {
    //   if (document.visibilityState == "visible") {
    //     console.log('visible', store.state.app.theBusiness)
    //   }
    // });
  }
}
</script>

<style lang="less" scoped>
.busines {
  &-avatar-dropdown {
    cursor: pointer;
    display: inline-block;
    // height: 64px;
    vertical-align: middle;
    // line-height: 64px;
    .ivu-badge-dot {
      top: 16px;
    }
  }
}
</style>
