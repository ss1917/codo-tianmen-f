<template>
  <div style="height:100%">
    <Row :gutter="30">
      <Col :xs="24" :sm="12" :md="12" :lg="12" :xxl="13">
      <div class="search-con search-con-top">
        <Input class="search-input" clearable v-model="searchValue" placeholder="请输入关键字进行搜素" />
        <Button type="info" class="search-btn" @click="handleAdd">添加角色</Button>
      </div>
      <Table size="small" ref="selection" :columns="columns" :data="tableData" />

      <div style="margin: 10px; overflow: hidden">
        <div style="float: left;">
          <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
        </div>
      </div>

      </Col>
      <Col :xs="24" :md="12" :lg="12" :xxl="11" class="split-pane">
      <Transfer :list-style="listStyle" :titles="tranferTitles" :data="source" :target-keys="targetKeys" filterable :filter-method="filterMethod" @on-change="handleChange">
      </Transfer>
      </Col>
    </Row>
    <role-edit :modalData="modalData" :formValidate="theData" @handle-submit-role="saveRole" @drawer-close="handleDrawerClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  getRolelist, optRole,
  getUserByRole, optRoleUser,
  getFuncsByRole, optRoleFunc,
  getMenusByRole, optRoleMenu,
  getComponentByRole, optRoleComponent,
  getAppByRole, optRoleApp
} from '@/api/authority/role'
import { getuserlist } from '@/api/authority/users'
import { getFuncslist } from '@/api/authority/func'
import { getMenuslist } from '@/api/authority/menu'
import { getComponentlist } from '@/api/authority/component'
import { getApplist } from '@/api/authority/apps'
import roleEdit from './components/role-edit'
export default {
  components: { roleEdit },
  data () {
    return {
      theData: {},
      searchValue: '',
      //
      source: [],
      targetKeys: [],
      listStyle: {
        height: '660px',
        width: '300px'
      },
      tranferTitles: ['所有列表', '已有列表'],
      role_id: '',
      // 穿梭框里面编辑的内容
      editTransfer: '',
      // 弹出框
      modalData: {},
      // 分页数据
      pageTotal: 0, // 数据总数
      pageNum: 1, // 当前页码
      pageSize: 15, // 每页条数
      // 表格数据
      tableData: [],
      columns: [
        { title: '角色', key: 'role_name', minWidth: 120, sortable: true },
        {
          title: '状态',
          key: 'status',
          minWidth: 100,
          render: (h, params, vm) => {
            return h('div', [
              h('i-switch', {
                props: {
                  trueColor: '#19be6b',
                  value: params.row.status === '0'
                },
                style: {
                  trueColor: '#19be6b',
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
          width: 100,
          render: (h, params) => {
            return h('div', [
              h(
                'Dropdown',
                {
                  style: {
                    marginLeft: '5px'
                  },
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
                      slot: 'list',
                      disabled: true
                    },
                    [
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.edit_role_user_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handleGetUserByRole(params.row.role_id)
                            }
                          }
                        },
                        '用户'
                      ),
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.edit_role_app_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handleGetAppsByRole(params.row.role_id)
                            }
                          }
                        },
                        '应用'
                      ),
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.edit_role_func_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handleGetFuncByRole(params.row.role_id)
                            }
                          }
                        },
                        '权限'
                      ),
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.edit_role_menu_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handleGetMenusByRole(params.row.role_id)
                            }
                          }
                        },
                        '菜单'
                      ),
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.edit_role_component_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handleGetComponentsByRole(params.row.role_id)
                            }
                          }
                        },
                        '组件'
                      ),
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.edit_role_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handleEdit(params.row)
                            }
                          }
                        },
                        '编辑'
                      ),
                      h('DropdownItem',
                        {
                          props: {
                            // disabled: (this.rules && this.rules.del_role_btn) ? false : true,
                          },
                          nativeOn: {
                            click: () => {
                              this.handleDelete(params)
                            }
                          }
                        },
                        '删除'
                      )
                    ]
                  )
                ]
              )

            ])
          }
        }
      ]
    }
  },
  methods: {
    // 获取角色列表
    async handleGetRoleList () {
      let res = await getRolelist(this.pageNum, this.pageSize, this.searchValue)
      if (res.data.code === 0) {
        this.pageTotal = res.data.count
        this.tableData = res.data.data
      } else {
        this.$Message.error(res.data.msg)
      }
    },
    // 添加
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加角色',
        action: 'post'
      }
      this.theData = this.$options.data().theData
    },
    // 编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑角色',
        action: 'put'
      }
      this.theData = paramsRow
    },
    saveRole (saveData, action) {
      optRole(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetRoleList()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDrawerClose () {
      this.handleGetRoleList()
    },
    // 禁用/启用
    handleSwitch (paramsRow) {
      optRole({ role_id: paramsRow.role_id }, 'patch').then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 删除
    handleDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除角色：《${params.row.role_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optRole({ role_id: params.row.role_id }, 'delete').then(res => {
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
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handleGetRoleList()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetRoleList()
    },
    //
    handleGetUserByRole (role_id) {
      this.role_id = role_id
      this.tranferTitles = ['所有用户', '已有用户']
      this.editTransfer = 'user'
      let allData = []
      let targetData = []
      getuserlist(1, 500).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            allData.push({
              key: item.user_id.toString(),
              label: item.username.toString(),
              disabled: item.status != '0'
            })
          })
          this.$Message.success(`${res.data.msg}`)
          this.source = allData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
      getUserByRole(role_id).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            targetData.push(item.user_id.toString())
          })
          this.targetKeys = targetData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 获取应用列表
    handleGetAppsByRole (role_id) {
      this.role_id = role_id
      this.tranferTitles = ['所有应用', '已有应用']
      this.editTransfer = 'app'
      this.source = []
      this.targetKeys = []
      let targetData = []
      getApplist(1, 500).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            this.source.push({
              key: item.app_id.toString(),
              label: item.app_name.toString(),
              disabled: item.status != '0'
            })
          })
          // this.source = allData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
      //
      getAppByRole(role_id).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            this.targetKeys.push(item.app_id.toString())
          })
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 获取组件列表
    handleGetComponentsByRole (role_id) {
      this.role_id = role_id
      this.tranferTitles = ['所有组件', '已有组件']
      this.editTransfer = 'component'
      let allData = []
      let targetData = []
      getComponentlist(1, 500).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            allData.push({
              key: item.comp_id.toString(),
              label: item.component_name.toString(),
              disabled: item.status != '0'
            })
          })
          this.source = allData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
      getComponentByRole(role_id).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            targetData.push(item.comp_id.toString())
          })
          this.targetKeys = targetData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 获取菜单列表
    handleGetMenusByRole (role_id) {
      this.role_id = role_id
      this.tranferTitles = ['所有菜单', '已有菜单']
      this.editTransfer = 'menu'
      let allData = []
      let targetData = []
      getMenuslist(1, 500).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            allData.push({
              key: item.menu_id.toString(),
              label: item.menu_name.toString(),
              disabled: item.status != '0'
            })
          })
          this.source = allData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
      getMenusByRole(role_id).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            targetData.push(item.menu_id.toString())
          })
          this.targetKeys = targetData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 获取后端权限列表
    handleGetFuncByRole (role_id) {
      this.role_id = role_id
      this.tranferTitles = ['所有权限', '已有权限']
      this.editTransfer = 'func'
      let allData = []
      let targetData = []
      getFuncslist(1, 500).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            allData.push({
              key: item.func_id.toString(),
              label: item.func_name.toString(),
              disabled: item.status != '0'
            })
          })
          this.source = allData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
      getFuncsByRole(role_id).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach(item => {
            targetData.push(item.func_id.toString())
          })
          this.targetKeys = targetData
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    //
    handleChange (newTargetKeys, direction, moveKeys) {
      this.targetKeys = newTargetKeys
      const methodType = direction === 'left' ? 'delete' : 'post'

      if (this.editTransfer === 'user') {
        optRoleUser({ role_id: this.role_id, user_list: moveKeys }, methodType
        ).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(`${res.data.msg}`)
          } else {
            this.$Message.error(`${res.data.msg}`)
          }
        })
      } else if (this.editTransfer === 'app') {
        optRoleApp({ role_id: this.role_id, app_list: moveKeys }, methodType).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(`${res.data.msg}`)
          } else {
            this.$Message.error(`${res.data.msg}`)
          }
        })
      } else if (this.editTransfer === 'component') {
        optRoleComponent({ role_id: this.role_id, comp_list: moveKeys }, methodType).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(`${res.data.msg}`)
          } else {
            this.$Message.error(`${res.data.msg}`)
          }
        })
      } else if (this.editTransfer === 'menu') {
        optRoleMenu({ role_id: this.role_id, menu_list: moveKeys }, methodType
        ).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(`${res.data.msg}`)
          } else {
            this.$Message.error(`${res.data.msg}`)
          }
        })
      } else if (this.editTransfer === 'func') {
        optRoleFunc({ role_id: this.role_id, func_list: moveKeys }, methodType
        ).then(res => {
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
    filterMethod (data, query) {
      return data.label.indexOf(query) > -1
    }
  },
  watch: {
    searchValue (val) {
      this.pageNum = 1
      this.handleGetRoleList()
    }

  },
  computed: {
    ...mapState({
      rules: state => state.user.rules
    })
  },
  mounted () {
    this.handleGetRoleList()
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
