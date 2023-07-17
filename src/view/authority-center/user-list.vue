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
      <Input class="search-input" search v-model="searchValue" @on-search="handleSearch" placeholder="请输入关键字进行搜素" />
      <Button  type="info" class="search-btn"  @click="handleAdd">添加用户</Button>
      <Button  type="error" class="search-btn" @click="handleDel" :disabled="selectList.length !== 0 ? false : true">批量删除</Button>
    </div>

    <Table size="small" ref="selection" :columns="columns" :data="tableData" :loading="tableLoading"  @on-selection-change="handleSelect" />

    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <user-edit :modalData="modalData" :formValidate="theData" @handle-submit-user="saveUser" @drawer-close="handleDrawerClose" />

  </div>
</template>

<script>

import { mapState } from 'vuex'
import userEdit from './components/user-edit'
import { getuserlist, optUserInfo, resetPassword, resetMFA, getToken } from '@/api/authority/users'
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
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.del_user_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handlerDelete(params)
                            }
                          }
                        },
                        '删除用户'
                      )
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
      searchValue: '', // 查询
      // 分页
      pageNum: 1, // 当前页码
      pageTotal: 0, // 数据总数
      pageSize: 10, // 每页条数
      //
      tableLoading: true,
      btn_loading: false,

      modalData: {
        show: false,
        title: '添加',
        action: 'post'
      }
    }
  },
  methods: {
    // 获取用户列表
    handleGetUserList () {
      getuserlist(this.pageNum, this.pageSize, this.searchValue).then(res => {
        if (res.data.code === 0) {
          this.pageTotal = res.data.count
          this.tableData = res.data.data
        } else {
          this.pageTotal = 0
          this.$Message.error(res.data.msg)
        }
        this.tableLoading = false
      })
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
    saveUser (userData, action) {
      optUserInfo(userData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetUserList()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDrawerClose () {
      this.handleGetUserList()
    },
    // 禁用/启用
    handleSwitch (paramsRow) {
      optUserInfo({ user_id: paramsRow.user_id }, 'patch').then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 删除用户
    handlerDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除用户：《${params.row.nickname}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optUserInfo({ user_id: params.row.user_id }, 'delete').then(res => {
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
    handleDel () {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除用户之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optUserInfo({ id_list: this.selectList }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.handleGetUserList()
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
            resetPassword({ user_list: [params.row.user_id] }).then(res => {
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
            resetMFA({ user_list: [params.row.user_id] }).then(res => {
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
            getToken({ user_list: [params.row.user_id] }).then(res => {
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
        selectIdList.push(item.user_id)
      })
      this.selectList = selectIdList
    },
    handleSearch () {
      this.pageNum = 1
      this.handleGetUserList()
    },
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handleGetUserList()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetUserList()
    }
  },
  watch: {
    searchValue (val) {
      // this.handleGetUserList()
    }

  },
  computed: {
    ...mapState({
      rules: state => state.user.rules
    })
  },
  mounted () {
    this.handleGetUserList()
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
      width: 400px;
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
