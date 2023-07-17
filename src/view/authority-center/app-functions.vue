<template>
  <div style="height:100%">
    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">应用：【{{app_name}}】，服务编码【{{app_code}}】的API权限，权限与角色关联后，推送到网关，可以使用*作为通配符，ALL代表所有支持的请求。
        GRPC的请求为：POST，请求路径URI为：服务/方法。{{app_code}}</template>
    </Alert>
    <Affix :offset-top="80">
      <div class="search-con search-con-top">
        <Input class="search-input" clearable v-model="searchValue" placeholder="请输入关键字进行搜素" />
        <Button :disabled="rules.new_func_btn ? false : true" type="info" class="search-btn" @click="handleAdd">添加权限</Button>
      </div>
    </Affix>

    <Table size="small" ref="selection" :columns="columns" :data="tableData"></Table>

    <div style="margin: 10px;overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" :page-size-opts=[10,15,25,50,1000] show-sizer show-total @on-change="handlerChangePage" @on-page-size-change="handlePageSize"></Page>
      </div>
    </div>

    <func-edit :modalEditData="modalData" :formValidate="funcData" :app_code="app_code" :app_list="app_list" @handle-submit-func="saveData" @modal-close="handlerModalClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getFuncslist, operationFunc } from '@/api/authority/func'
import { getApplist } from "@/api/authority/apps";
import funcEdit from './components/func-edit'
export default {
  components: { funcEdit },
  data () {
    return {
      columns: [
        {
          title: '权限名称',
          key: 'func_name',
          minWidth: 100,
          sortable: true
        },
        {
          title: '请求方法',
          key: 'method_type',
          minWidth: 80,
          render: (h, params) => {
            let method_type = params.row.method_type
            if (method_type == 'ALL') {
              return h("div", [
                h(
                  "p",
                  {
                    style: {
                      color: "black"
                    }
                  },
                  'GET, POST, PUT, PATCH, DELETE'
                )
              ]);
            } else if (method_type == 'GET') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#61affe" }
                  },
                  params.row.method_type
                )
              ]);
            } else if (method_type == 'POST') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#49cc90" }
                  },
                  params.row.method_type
                )
              ]);
            } else if (method_type == 'PUT') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#fca130" }
                  },
                  params.row.method_type
                )
              ]);
            } else if (method_type == 'PATCH') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#50e3c2" }
                  },
                  params.row.method_type
                )
              ]);
            } else if (method_type == 'DELETE') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#ed4014" }
                  },
                  params.row.method_type
                )
              ]);
            } else {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#f93e3e" }
                  },
                  params.row.method_type
                )
              ]);
            }
          }
        },
        {
          title: '请求路径',
          key: 'uri',
          minWidth: 150,
        },
        {
          title: '状态',
          key: 'status',
          width: 100,
          align: 'center',
          render: (h, params, vm) => {
            return h('div', [
              h('i-switch', {
                props: {
                  trueColor: "#19be6b",
                  value: params.row.status === '0' // 控制开关的打开或关闭状态，官网文档属性是value
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': () => {
                    this.handleSwitch(params)
                  }
                }
              })
            ])
          }
        },
        {
          title: '更新时间',
          key: 'update_time',
          width: 160,
        },
        {
          title: '#',
          key: 'handle',
          minWidth: 110,
          maxWidth: 170,
          render: (h, params) => {
            return h('div', [
              this.rules && this.rules.edit_fun_a && h(
                'a',
                {
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.handlerEdit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              this.rules && this.rules.del_fun_a && h(
                'a',
                {
                  on: {
                    click: () => {
                      this.handlerDelete(params)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      tableData: [],
      pageTotal: 0, // 数据总数
      pageNum: 1, // 当前页码
      pageSize: 15, // 每页条数
      funcData: {
        parameters: "{}"
      },
      modalData: {},
      app_code: null,
      app_name: null,
      app_list: [],
      searchValue: '',
    }
  },
  methods: {
    handlerGetFuncsList () {
      if (!this.app_code) {
        return
      }
      getFuncslist(this.pageNum, this.pageSize, this.searchValue, this.app_code).then(res => {
        if (res.data.code === 0) {
          this.pageTotal = res.data.count
          this.tableData = res.data.data
        } else {
          this.pageTotal = 0
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    //获取所有应用
    handleGetApplist () {
      getApplist(1, 500, '', 'yes').then(res => {
        if (res.data.code === 0) {
          this.app_list = res.data.data;
        } else {
          this.$Message.error(`${res.data.msg}`);
        }
      });
    },
    handleAdd () {
      this.funcData = this.$options.data().funcData
      this.modalData = {
        show: true,
        title: '添加API信息，用来展示后端权限',
        action: 'post'
      }
      this.funcData['app_code'] = this.app_code
    },
    handlerEdit (paramsRow) {
      this.funcData = paramsRow
      this.modalData = {
        show: true,
        title: '编辑API详细信息',
        action: 'put'
      }
    },
    handlerModalClose () {
      this.handlerGetFuncsList()
      this.modalData.show = false
    },
    saveData (funcData, action) {
      operationFunc(funcData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handlerGetFuncsList()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 删除
    handlerDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>确定要删除权限：《${params.row.func_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            operationFunc({ func_id: params.row.func_id }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.tableData.splice(params.index, 1)
              } else {
                this.$Message.error(res.data.msg)
              }
            })
          }, 500);
        },
        onCancel: () => {
          this.$Message.info('回头是岸~');
        }
      });
    },
    // 调用开关
    handleSwitch (params) {
      operationFunc({ func_id: params.row.func_id }, 'patch').then(res => {
        if (res.data.code === 0) {
          this.$Message.success(`${res.data.msg}`)
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handlerGetFuncsList()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handlerGetFuncsList()
    },
  },
  watch: {
    searchValue (val) {
      this.pageNum = 1
      this.handlerGetFuncsList()
    }
  },
  computed: {
    ...mapState({
      rules: state => state.user.rules,
    })
  },
  updated: function () {
    this.app_code = this.$route.query.app_code
    this.app_name = this.$route.params.app_name
  },
  mounted () {
    this.app_code = this.$route.query.app_code
    this.app_name = this.$route.params.app_name
    this.handlerGetFuncsList()
    this.handleGetApplist()
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
