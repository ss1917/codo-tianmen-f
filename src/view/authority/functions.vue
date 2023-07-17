<template>
  <div style="height:100%">
    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">管理后端API权限，权限与角色关联后，推送到网关，可以使用*作为通配符，ALL代表所有支持的请求。
        GRPC的请求为：POST，请求路径URI为：服务/方法。权限判断顺序：从最小单元开始判定。</template>
    </Alert>
    <Affix :offset-top="80">
      <div class="search-con search-con-top">
        <Input class="search-input"  v-model="initPara.searchVal" search :maxlength="100" @on-search="handleSearch" placeholder="输入关键字全局搜索" />
        <Select class="search-select" v-model="initPara.app_code" filterable clearable @on-change="handleSearch" placeholder="请选择应用">
           <Option  v-for="item in app_list" :value="item.app_code" :key="item.id" >{{item.app_name}} {{item.app_code}}</Option>
        </Select>
        <Button class="search-btn" @click="handleAdd">添加权限</Button>
        <Button  type="error" class="search-btn" @click="handleDelB" :disabled="selectList.length !== 0 ? false : true">批量删除</Button>
      </div>
    </Affix>

    <Table size="small" ref="selection" :columns="columns" :data="tableData"  @on-selection-change="handleSelect"></Table>

    <!-- 分页 -->
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="i.pageTotal" :current="initPara.page_number" :page-size="initPara.page_size" show-total show-sizer
          :page-size-opts="[15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>

    <func-edit :modalData="modalData" :formValidate="funcData" :app_list="app_list" @save-data="handleSaveData" @close="handleClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getFuncList, optFunc } from '@/api/auth/func'
import { getApplist } from "@/api/auth/apps";
import funcEdit from './components/func-edit'
export default {
  components: { funcEdit },
  data () {
    return {
      columns: [
        { type: 'selection', title: '', key: '', width: 60, align: 'center' },
        {
          title: '应用编码',
          key: 'app_code',
          minWidth: 80,
          maxWidth: 120,
          sortable: true
        },
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
          maxWidth: 200,
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
              h(
                'a',
                {
                  style: {
                    marginRight: '5px'
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
                    color: 'red',
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
        }
      ],
      tableData: [],
      selectList: [],
      initPara: {
        page_number: 1,
        page_size: 15,
        app_code: null,
        searchVal: null,
        order_by: "update_time",      //排序字段
        order: "descend", //排序 ascend descend
      },
      i:{
        pageTotal: 0, //总数
        tableLoading: true
      },
      funcData: {
        parameters: "{}"
      },
      modalData: {},
      app_list: [],
    }
  },
  methods: {
    async handleGetData () {
      const res = await getFuncList(this.initPara)
      if (res.data.code === 0) {
        this.tableData = res.data.data;
        this.i.pageTotal = res.data.count
      } else {
        this.$Message.error(`${res.data.msg}`);
      }
      this.i.tableLoading = false
    },
    //获取所有应用
   async handleGetApplist () {
     const res = await getApplist()
      if (res.data.code === 0) {
         this.app_list = res.data.data;
      } else {
        this.$Message.error(`${res.data.msg}`);
      }
    },
    handleAdd () {
      this.funcData = this.$options.data().funcData
      this.modalData = {
        show: true,
        title: '添加API信息',
        action: 'post'
      }
    },
    handleEdit (paramsRow) {
      this.funcData = paramsRow
      this.modalData = {
        show: true,
        title: '编辑API详细信息',
        action: 'put'
      }
    },
    handleClose () {
      this.handleGetData()
      this.modalData = {}
      this.funcData = this.$options.data().funcData
      this.selectList = []
    },
    async handleSaveData (funcData, action) {
      optFunc(funcData, action).then(res => {
        if (res.data.code === 0) {
          this.$Message.success(`${res.data.msg}`)
          this.handleClose()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 删除
    handleDelB () {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>确定要删除权限，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optFunc({ id_list: this.selectList }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.handleClose()
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
    handleDel (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>确定要删除权限：《${params.row.func_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optFunc({ id_list: [params.row.id] }, 'delete').then(res => {
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
  },
  watch: {
  },
  computed: {
    ...mapState({
      rules: state => state.user.rules,
    })
  },
  mounted () {
    this.handleGetData()
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
    &-select {
      display: inline-block;
      width: 110px;
      margin-left: 2px;
    }
    &-btn {
      margin-left: 2px;
    }
    &-add-btn {
      margin-right: 10px;
    }
  }
}
</style>
