<template>
  <Drawer v-model="modalData.show" :title="modalData.title" :mask-closable="false" width="930px;" @on-close="handleCancel" :footer-hide=true>
    <RadioGroup v-model="editTransfer" style="padding: 3px;" @on-change="handleChange1">
        <Radio label="func">后端权限</Radio>
        <Radio label="menu">前端菜单</Radio>
        <!-- <Radio label="component">组件</Radio> -->
        <!-- <Radio label="app">应用</Radio> -->
    </RadioGroup>
    <div style="padding-top: 4px;">
      <Transfer :list-style="listStyle" :titles="tranferTitles" :data="source"
        :target-keys="targetKeys" filterable :filter-method="filterMethod" @on-change="handleChange"></Transfer>
    </div>

  </Drawer>
</template>

<script>
import { getFuncList, getFuncByRole, optRoleFunc } from '@/api/auth/func'
import { getMenusList, getMenuByRole, optRoleMenu } from '@/api/auth/menu'
// import { getApplist, getAppByRole, optRoleApp } from "@/api/auth/apps";
export default {
  name: 'roleRef',
  props: {
    modalData: {
        type :Object,
        default: {}
    }
  },
  data () {
    return {
      appList: [],
      funcList: [],
      menuList: [],
      compList: [],
      //
      source: [],
      targetKeys: [],
      listStyle: {
        height: '750px',
        width: '410px'
      },
      tranferTitles: ['所有列表', '已有列表'],
      role_id: '',
      // 穿梭框里面编辑的内容
      editTransfer: 'func',
      allUserList: [],
      formValidate: {},
      btnLoading: false,
        ruleValidate: {
          role_name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
          // app_code: [{ required: true, message: '应用编码不能为空', trigger: 'blur' }],
          details: [{ required: true, message: '备注信息不能为空', trigger: 'blur' }]
        }
    }
  },
  methods: {
    handleCancel () {
      this.$emit('close')
    },
    handleChange1 (value) {
      if (value == 'func') {
        this.handleGetFuncByRole()
      }
      else if (value == 'menu') {
        this.handleGetMenusByRole()
      }
      else if (value == 'app') {
        this.handleGetAppsByRole()
      } else {
        this.$Message.error("暂不支持类型")
      }
    },
    filterMethod (data, query) {
      return data.label.indexOf(query) > -1
    },
    // 获取后端权限列表
    async handleGetFuncByRole () {
      this.tranferTitles = ['所有权限', '已有权限']
      this.source = this.funcList
      this.targetKeys = []
      const resp = await getFuncByRole({"role_id": this.modalData.role_id})
      if (resp.data.code === 0) {
          resp.data.data.forEach(item => {
            this.targetKeys.push(item.id)
          })
      } else {
          this.$Message.error(`${resp.data.msg}`)
      }
    },
        // 获取应用列表
    async handleGetAppsByRole () {
      this.tranferTitles = ['所有应用', '已有应用']
      this.editTransfer = 'app'
      this.targetKeys = []
      this.source = this.appList
      //
      const resp = await getAppByRole({"role_id": this.modalData.role_id})
      if (resp.data.code === 0) {
          resp.data.data.forEach(item => {this.targetKeys.push(item.id)})
      } else {
          this.$Message.error(`${resp.data.msg}`)
      }
    },
    // // 获取组件列表
    // async handleGetCompByRole () {
    //   this.tranferTitles = ['所有组件', '已有组件']
    //   this.editTransfer = 'component'
    //   this.targetKeys = []
    //   this.source = this.compList
    //   //
    //   const resp = await getAppByRole({"role_id": this.modalData.role_id})
    //   if (resp.data.code === 0) {
    //       resp.data.data.forEach(item => {this.targetKeys.push(item.id)})
    //   } else {
    //       this.$Message.error(`${resp.data.msg}`)
    //   }
    // },
    // 获取菜单列表
    async handleGetMenusByRole () {
      this.tranferTitles = ['所有菜单', '已有菜单']
      this.editTransfer = 'menu'
      this.targetKeys = []
      this.source = this.menuList
      //
      const resp = await getMenuByRole({"role_id": this.modalData.role_id})
      if (resp.data.code === 0) {
           resp.data.data.forEach(item => {this.targetKeys.push(item.id)})
      } else {
          this.$Message.error(`${resp.data.msg}`)
      }
    },
    //
    handleChange (newTargetKeys, direction, moveKeys) {
      this.targetKeys = newTargetKeys
      const methodType = direction === 'left' ? 'delete' : 'post'
      const role_id = this.modalData.role_id

      if (this.editTransfer === 'app') {
        optRoleApp({ role_id: role_id, app_list: moveKeys }, methodType).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(`${res.data.msg}`)
          } else {
            this.$Message.error(`${res.data.msg}`)
          }
        })
      // } else if (this.editTransfer === 'component') {
      //   optRoleComponent({ role_id: role_id, comp_list: moveKeys }, methodType).then(res => {
      //     if (res.data.code === 0) {
      //       this.$Message.success(`${res.data.msg}`)
      //     } else {
      //       this.$Message.error(`${res.data.msg}`)
      //     }
      //   })
      } else if (this.editTransfer === 'menu') {
        optRoleMenu({ role_id: role_id, menu_list: moveKeys }, methodType ).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(`${res.data.msg}`)
          } else {
            this.$Message.error(`${res.data.msg}`)
          }
        })
      } else if (this.editTransfer === 'func') {
        optRoleFunc({ role_id: role_id, func_list: moveKeys }, methodType).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(`${res.data.msg}`)
          } else {
            this.$Message.error(`${res.data.msg}`)
          }
        })
      } else {
        this.$Message.error('你在修改个锤子呀')
      }
    },
    //
    async handleGetFuncList () {
      const res = await getFuncList()
      if (res.data.code === 0) {
          res.data.data.forEach(item => {
            this.funcList.push({
              key: item.id,
              label: `【${item.app_code}】 ${item.func_name}`
            })
          })
      } else {
          this.$Message.error(`${res.data.msg}`)
      }
    },
    async handleGetAppList () {
      const res = await getApplist()
      if (res.data.code === 0) {
        res.data.data.forEach(item => {
          this.appList.push({
            key: item.id,
            label: `【${item.app_code}】 ${item.name}`
          })
        })
      } else {
        this.$Message.error(`${res.data.msg}`)
      }
    },
    async handleGetMenuList () {
      const res = await getMenusList()
      if (res.data.code === 0) {
        res.data.data.forEach(item => {
          this.menuList.push({
            key: item.id,
            label: `【${item.app_code}】 ${item.menu_name}`
          })
        })
      } else {
        this.$Message.error(`${res.data.msg}`)
      }
    },
  },
  mounted () {
    this.handleGetFuncList()
    // this.handleGetAppList()
    this.handleGetMenuList()
  }
}
</script>
