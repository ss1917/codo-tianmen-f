<template>
  <div style="height:100%">
    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">这里用来管理用户，可以从第三方同步和导入，被禁用后无法加入角色，但是可以看到。
        <p>关于token： 1、超级用户不可以生成长期令牌。2、非虚拟用户必须设置可以拥有令牌才可以获取长期令牌</p>
      </template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input"  v-model="initPara.searchVal" search :maxlength="100" @on-search="handleSearch" placeholder="输入关键字全局搜索" />
      <Button  type="info" class="search-btn"  @click="handleAdd">添加用户</Button>
      <Button  type="error" class="search-btn" @click="handleDel" :disabled="selectList.length !== 0 ? false : true">批量删除</Button>
    </div>

    <Table size="small" ref="selection" :columns="columns" :data="tableData" :loading="i.tableLoading"  @on-selection-change="handleSelect" />

    <!-- 分页 -->
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="i.pageTotal" :current="initPara.page_number" :page-size="initPara.page_size" show-total show-sizer
          :page-size-opts="[15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <user-edit :modalData="modalData" :formValidate="theData" @save-data="handleSaveUser" @drawer-close="handleClose" />

  </div>
</template>

<script>

import { mapState } from 'vuex'
import userEdit from './components/user-edit-2'
import { getUserList, optUser, resetPassword, resetMFA, getToken } from '@/api/auth/users'
export default {
  components: { userEdit },
  data () {
    return {
      columns: [
        { type: 'selection', title: '', key: '', width: 60, align: 'center' },
        { title: '用户名', key: 'username', sortable: true, minWidth: 80, maxWidth: 200 },
        { title: '昵称', key: 'nickname', sortable: true, minWidth: 80, maxWidth: 200 },
        { title: '部门', key: 'department', minWidth: 100 },
        { title: '手机', key: 'tel', minWidth: 100, maxWidth: 120 },
        { title: '邮箱', key: 'email', minWidth: 110, maxWidth: 250 },
        { title: '来源', key: 'source', minWidth: 80, maxWidth: 130 },
        { title: '登录IP', key: 'last_ip', minWidth: 100 },
        { title: '最后登录', key: 'last_login', sortable: true, minWidth: 100 },
        {
          title: '状态',
          key: 'status',
          minWidth: 80,
          maxWidth: 100,
          align: 'center',
          render: (h, params, vm) => {
            return h('div', [
              h('i-switch', {
                props: {
                  // type: "primary",
                  trueColor: '#19be6b',
                  value: params.row.status === '0' // 控制开关的打开或关闭状态，官网文档属性是value
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': () => {
                    this.handleSwitch(params.row)
                  }
                }
              })
            ])
          }
        },

        {
          title: '',
          key: 'operation',
          minWidth: 100,
          maxWidth: 180,
          render: (h, params) => {
            return h('div', [
              h(
                'Dropdown',
                {
                  //   style: {
                  //     marginLeft: "5px"
                  //   },
                  props: {
                    trigger: 'click',
                    transfer: true
                  }// 点击出现下拉菜单
                },
                [
                  h('div', [
                    h(
                      'a',
                      [
                        h('span', '操作'),
                        h('Icon', {
                          props: {
                            type: 'ios-arrow-down'
                          },
                          style: {
                            marginLeft: '5px'
                          }
                        })
                      ]
                    )
                  ]),
                  h(
                    'DropdownMenu',
                    {
                      slot: 'list'
                    },
                    [
                      h('DropdownItem',
                        {
                          props: {
                          },
                          nativeOn: {
                            click: () => {
                              this.handleResetPassword(params)
                            }
                          }
                        },
                        '重置密码'
                      ),
                      h('DropdownItem',
                        {
                          props: {

                          },
                          nativeOn: {
                            click: () => {
                              this.handleResetMFA(params)
                            }
                          }
                        },
                        '重置MFA'
                      ),
                      h('DropdownItem',
                        {
                          nativeOn: {
                            click: () => {
                              this.handleGetToken(params)
                            }
                          }
                        },
                        '获取令牌'
                      ),
                      h('DropdownItem',
                        {
                          props: {
                          },
                          nativeOn: {
                            click: () => {
                              this.handleEdit(params.row)
                            }
                          }
                        },
                        '编辑用户'
                      ),
                    ]
                  )
                  // ( this.rules && this.rules.del_user_btn ) && h(
                  //   "DropdownMenu",
                  //   {
                  //     slot: "list"
                  //   },
                  //   [
                  //     h("DropdownItem", [
                  //       h(
                  //         "div",
                  //         {
                  //           on: {
                  //             click: () => {
                  //                 this.handlerDelete(params)
                  //             }
                  //           }
                  //         },
                  //         "删除用户"
                  //       )
                  //     ])
                  //   ]
                  // ),
                ]
              )

            ])
          }
        }
      ],
      tableData: [],
      theData: {},
      //
      selectList: [],
      //
      tableLoading: true,
      btn_loading: false,
      initPara: {
        page_number: 1,
        page_size: 15,
        searchVal: null,
        order_by: "id",      //排序字段
        order: "ascend", //排序 ascend descend
      },
      i:{
        pageTotal: 0, //总数
        tableLoading: true
      },

      modalData: {
        show: false,
        title: '添加',
        action: 'post'
      }
    }
  },
  methods: {
    // 获取用户列表
    async handleGetData() {
      const res = await getUserList(this.initPara)
      if (res.data.code === 0) {
        this.tableData = res.data.data;
        this.i.pageTotal = res.data.count
      } else {
        this.$Message.error(res.data.msg)
      }
      this.i.tableLoading = false
    },
    // 添加用户
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加用户',
        action: 'post'
      }
      this.theData = this.$options.data().theData
    },
    // 编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑用户',
        action: 'put'
      }
      this.theData = paramsRow
    },
    handleSaveUser (userData, action) {
      optUser(userData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetData()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleClose () {
      this.handleGetData()
      this.modalData.show = false
    },
    // 禁用/启用
    handleSwitch (paramsRow) {
      optUser({ user_id: paramsRow.id }, 'patch').then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDel () {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除用户之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optUser({ id_list: this.selectList }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.handleClose()
                this.$Message.success(res.data.msg)
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
    // 重置密码
    handleResetPassword (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>重置用户密码：《${params.row.nickname}》，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            resetPassword({ id_list: [params.row.id] }).then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
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
    // 重置MFA
    handleResetMFA (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>重置用户MFA：《${params.row.nickname}》，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            resetMFA({ id_list: [params.row.id] }).then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
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
    // 获取令牌
    handleGetToken (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>获取用户令牌：《${params.row.nickname}》，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            getToken({ id_list: [params.row.id] }).then(res => {
              if (res.data.code === 0) {
                this.$Message.success(`${res.data.msg}`)
              } else {
                this.$Message.error(`${res.data.msg}`)
              }
            })
          }, 500)
        },
        onCancel: () => {
          this.$Message.info('回头是岸~')
        }
      })
    },
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
  }
}
</script>

<style lang="less" scoped>
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
      width: 350px;
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
