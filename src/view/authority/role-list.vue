<template>
  <div style="height:100%">
    <div class="search-con search-con-top">
      <Input class="search-input"  v-model="initPara.searchVal" search :maxlength="100" @on-search="handleSearch" placeholder="输入关键字全局搜索" />
      <Button type="info" class="search-btn" @click="handleAdd">添加角色</Button>
      <Button class="search-btn" @click="handleSync">刷新缓存</Button>
    </div>
    <Table size="small" ref="selection" :columns="columns" :data="tableData"  :loading="i.tableLoading"  @on-selection-change="handleSelect" />

      <!-- 分页 -->
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="i.pageTotal" :current="initPara.page_number" :page-size="initPara.page_size" show-total show-sizer
          :page-size-opts="[15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>

    <Spin v-if="spinShow" size="large" fix>
      <Icon type="ios-loading" size="18" class="spin-icon-load" />
      <div>同步中，请稍等一会...</div>
    </Spin>

    <role-edit ref="roleEdit" :modalData="modalData" @save-data="handleSave" @close="handleClose" />
    <role-ref ref="roleRef" :modalData="modalRef" @save-data="handleSave" @close="handleClose" />
    <pre-view-user ref="preViewUser" :modalData="modalShowUser" @close="handleClose"/>
    <role-user-edit ref="roleUserEdit" :modalData="modalUData" :formValidate="theData" @save-data="handleSaveUser" @close="handleClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getRoleList, optRole, syncRole, getUserByRole, optRoleUser } from '@/api/auth/role'
import { getUserList } from '@/api/auth/users'
import roleEdit from './components/role-edit'
import roleRef from './components/role-ref'
import roleUserEdit from './components/role-user-edit'
import preViewUser from './components/pre-view-user'
export default {
  components: { roleEdit, roleUserEdit , roleRef, preViewUser },
  data () {
    return {
      theData: {},
      // 弹出框
      spinShow: false,
      modalData: {},    // 弹出编辑
      modalUData: {},  // 弹出管理用户
      modalRef: {
        title: '授权',
        show: false
      },  // 弹出
      modalShowUser: {
       title: '查看用户',
        show : false
      },  // 弹出
      //
      allUser: [],
      baseRoleList: [],
      // 分页数据
      initPara: {
        page_number: 1,
        page_size: 15,
        searchVal: null,
        order_by: "update_time",      //排序字段
        order: "descend", //排序 ascend descend
      },
      i:{
        pageTotal: 0, //总数
        tableLoading: true
      },
      initForm: {
        role_type: 'normal',
      },
      // 表格数据
      tableData: [],
      columns: [
        { title: 'ID', key: 'id' , width: 120 },
        { title: '角色', key: 'role_name', minWidth: 120, sortable: true },
        {
          title: "类型",
          key: "role_type",
          align: "center",
          sortable: true,
          minWidth: 130,
          render: (h, params) => {
            let role_type = params.row.role_type
            if (role_type == 'normal') {
              return h('div', [h('Tag', { props: { color: 'cyan' } }, '通用')])
            } else if (role_type == 'base') {
              return h('div', [h('Tag', { props: { color: 'blue' } }, '基础')])
            } else {
              return h('div', [h('Tag', { props: { color: 'error' } }, '未知')])
            }
          }
        },
        {
          title: '继承',
          key: '',
          minWidth: 180,
          render: (h, params) => {
            let role_type = params.row.role_type
            if (role_type == 'normal') {
              return h('div', [              h(
                'a',
                {
                on: {
                    click: () => {
                      // this.handleShow(params)
                    }
                  }
                },
                '查看'
              )])
            } else {
              return h('div', [h('p', { props: { color: 'blue' } }, '不支持')])
            }
          }

        },
        {
          title: '#',
          key: 'handle',
          width: 220,
          render: (h, params) => {
            return h('div', [
              h(
                'a',
                {
                style: {
                      marginLeft: "5px"
                    },
                on: {
                    click: () => {
                      this.handleShow(params.row)
                    }
                  }
                },
                '用户'
              ),
              h(
                'a',
                {
                style: {
                      marginLeft: "5px"
                    },
                on: {
                    click: () => {
                      this.handleEdit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'a',
                {
                style: {
                      marginLeft: "5px"
                    },
                on: {
                    click: () => {
                      this.handleEmpower(params.row)
                    }
                  }
                },
                '授权'
              ),
              params.row.role_type ==='normal' &&  h(
                'a',
                {
                style: {
                      marginLeft: "5px"
                    },
                on: {
                    click: () => {
                      this.handleRefRole(params.row)
                    }
                  }
                },
                '关联'
              ),
              h(
                  'a',
                  {
                    style: {
                      marginLeft: "15px",
                      color: 'red'
                    },
                    on: {
                      click: () => {
                        this.handleDel(params)
                      }
                    }
                  },
                  '删除'
                )
              ])
          }
        },
      ]
    }
  },
  methods: {
    // 获取角色列表
    async handleGetData() {
      const res = await getRoleList(this.initPara)
      if (res.data.code === 0) {
        this.tableData = res.data.data;
        this.i.pageTotal = res.data.count
        this.baseRoleList = res.data.data.filter(item => item.role_type === 'base');
      } else {
        this.$Message.error(res.data.msg)
      }
      this.i.tableLoading = false
    },
    // 获取用户列表
    async handleGetUserList () {
      const res = await getUserList()
      if (res.data.code === 0) {
        this.allUser = res.data.data
      } else {
        this.$Message.error(`${res.data.msg}`)
      }
    },
    async handleSync () {
      this.spinShow = true
      try {
        const res = await syncRole()
        this.$Message.success(`${res.data.msg}`)
      } finally {
        this.spinShow = false
      }
    },
    handleClose () {
      this.handleGetData()
      this.modalData = {}
      this.modalUData = {}
      this.theData = this.$options.data().theData
      this.modalShowUser = this.$options.data().modalShowUser
    },
    // 添加
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加角色',
        action: 'post'
      }
      this.$refs.roleEdit.formValidate = this.$options.data().initForm
      this.$refs.roleEdit.allUserList = this.allUser
    },
    // 编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑角色',
        action: 'put'
      }
      this.$refs.roleEdit.allUserList = this.allUser
      this.$refs.roleEdit.formValidate = paramsRow
    },
    handleSave (saveData, action) {
      optRole(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.handleClose()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 修改角色的用户
    async handleRefRole (paramsRow) {
      let roleUsers = []
      let res = await getUserByRole({role_id: paramsRow.id })
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            roleUsers.push(item.user_id)
          })
      } else {
        this.$Message.error(`${res.data.msg}`)
      }
      this.modalUData = {
        show: true,
        title: '角色关联',
        action: 'post'
      }
      this.$refs.roleUserEdit.allUserList = this.allUser
      this.$refs.roleUserEdit.baseRoleList = this.baseRoleList
      this.theData = {
        user_list: roleUsers,
        role_id: paramsRow.id,
        role_name: paramsRow.role_name,
        role_list: paramsRow.role_subs
      }
    },
    handleSaveUser (saveData, action) {
      optRoleUser(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.handleClose()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 删除
    handleDel (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除角色：《${params.row.role_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optRole({ role_id: params.row.id }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.tableData.splice(params.index, 1)
              } else {
                this.$Message.error(res.data.msg)
              }
            })
          }, 500)
        },
        onCancel: () => {
          this.$Message.info('回头是岸~')
        }
      })
    },
    handleShow (paramsRow) {
      this.modalShowUser.show =true
      this.$refs.preViewUser.handleGetData(paramsRow.id)
    },
    handleEmpower (paramsRow) {
      this.modalRef.show = true
      this.modalRef.role_id = paramsRow.id
      this.$refs.roleRef.editTransfer = 'func'
      this.$refs.roleRef.handleChange1('func')
    },
    //
    handleSelect (val) {
      let selectIdList = []
      val.forEach(item => {
        selectIdList.push(item.id)
      })
      this.selectList = selectIdList
    },
    handleSearch(){
      this.initPara.page_number = 1
      this.handleGetData()
    },
    // 排序
    handleSort (column, key, order) {
      this.initPara.order = column.order === "asc" ? 'ascend' : 'descend'
      this.initPara.order_by = column.key
      this.handleGetData()
    },
    // 分页
    handlerChangePage (value) {
      this.initPara.page_number = value
      this.handleGetData()
    },
    handlePageSize (value) {
      this.initPara.page_number = 1
      this.initPara.page_size = value
      this.handleGetData()
    },
    //
  },
  watch: {
  },
  computed: {
    ...mapState({
      rules: state => state.user.rules
    })
  },
  mounted () {
    this.handleGetData()
    this.handleGetUserList()
  }
}
</script>

<style lang="less" scoped>
.split {
  height: 760px;
  border: 1px solid #dcdee2;
}
.split-pane {
  padding: 10px;
}
.search-con {
  padding: 10px 0;
  .search {
    &-col {
      display: inline-block;
      width: 200px;
    }
    &-col-1 {
      display: inline-block;
      margin-left: 5px;
    }
    &-input {
      display: inline-block;
      width: 300px;
      margin-left: 2px;
    }
    &-btn {
      margin-left: 10px;
    }
    &-add-btn {
      margin-right: 10px;
    }
  }
}
</style>
