<template>
  <div>
    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">租户隔离，代表业务/项目/资源组/租户</template>
    </Alert>
    <div class="search-con search-con-top">
      <Input class="search-input"  v-model="initPara.searchVal" search :maxlength="100" @on-search="handleSearch" placeholder="输入关键字全局搜索" />
      <ButtonGroup class="search-btn">
        <Button icon="ios-add" @click="handleAdd"> 新建业务</Button>
        <Button icon="ios-download-outline" @click="handlerExport()">导出数据</Button>
      </ButtonGroup>
    </div>
    <Table size="small" ref="businessTable" :columns="tableColumns" :data="tableData"></Table>
      <!-- 分页 -->
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="i.pageTotal" :current="initPara.page_number" :page-size="initPara.page_size" show-total show-sizer
          :page-size-opts="[15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>

    <business-edit ref="bizEdit" :modalData="modalData"  @save-data="handleSave" @save-data-t="handleSave2"  @close="handleClose" />
  </div>
</template>

<script>
import { getBizList, optBiz, getTenantList,optTenant } from '@/api/auth/biz.js'
import { getRoleList } from '@/api/auth/role'
import businessEdit from './components/business-edit'
export default {
  components: { businessEdit },
  data () {
    return {
      tableColumns: [
        {
          title: '租户ID',
          key: 'tenantid',
          sortable: true,
          minWidth: 90,
          maxWidth: 150,
        },
        {
          title: '租户',
          key: 'tenant',
          sortable: true,
          minWidth: 90,
          maxWidth: 150,
        },
        {
          title: '业务ID',
          key: 'biz_id',
          sortable: true,
          minWidth: 90,
          maxWidth: 150,
        },
        {
          title: '英文名',
          key: 'biz_en_name',
          sortable: true,
          minWidth: 100
        },
        {
          title: '中文名',
          key: 'biz_cn_name',
          sortable: true,
          minWidth: 120,
        },
        { title: '更新时间', key: 'update_time', sortable: true, minWidth: 145 },
        {
          title: '#', key: 'handle', width: 120,
          render: (h, params) => {
            return h('div', [
              h(
                'a',
                {
                  style: {
                    marginRight: '8px'
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
                  on: {
                    click: () => {
                      this.handleDel(params.row)
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
      tenantList: [],
      selectList: [],
      initPara: {
        page_number: 1,
        page_size: 15,
        searchVal: null,
        order_by: "tenantid",      //排序字段
        order: "ascend", //排序 ascend descend
      },
      i:{
        pageTotal: 0, //总数
        tableLoading: true
      },
      normalRoleList: [],
      // 弹出框
      modalData: {
        show: false,
        title: '添加业务',
        action: 'post'
      },
      initForm: {
        life_cycle: "已上线",
        sort: 100
      },
      userList: null
    }
  },
  methods: {
    async handleGetData () {
      const res = await getBizList(this.initPara)
      if (res.data.code === 0) {
        this.tableData = res.data.data;
        this.i.pageTotal = res.data.count
      } else {
        this.$Message.error(`${res.data.msg}`);
      }
      this.i.tableLoading = false
    },
        // 获取用户列表
    async handleGetRoleList () {
      const res = await getRoleList()
      if (res.data.code === 0) {
        this.normalRoleList = res.data.data.filter(item => item.role_type === 'normal');
      } else {
        this.$Message.error(`${res.data.msg}`)
      }
    },
    //
    async handleGetTenant () {
      const res = await getTenantList()
      if (res.data.code === 0) {
        this.tenantList = res.data.data
      } else {
        this.$Message.error(`${res.data.msg}`)
      }
    },
    handleSave (saveData, action) {
      optBiz(saveData, action).then(res => {
        if (res.data.code === 0) {
          this.$Message.success(res.data.msg)
          this.handleClose()
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    handleSave2 (saveData) {
      optTenant(saveData, 'post').then(res => {
        if (res.data.code === 0) {
          this.$Message.success(res.data.msg)
          this.handleClose()
        } else {
          this.$Message.error(res.data.msg)
        }
      })
    },
    handleDel (paramsRow) {
      this.$Modal.confirm({
        content: `<p>真的确定要删除 ${paramsRow.business_en} ？</p> <p>请确认！！！</p>`,
        onOk: () => {
          optBiz({ id: paramsRow.id }, 'delete').then(res => {
            if (res.data.result) {
              this.$Message.success(res.data.msg)
              this.handleGetBizList()
            } else {
              this.$Message.error(res.data.msg)
            }
          })
        },
        onCancel: () => {
          this.$Message.info('回头是岸');
        }
      });
    },

    handleAdd () {
      // this.formData = this.$options.data().initForm
      // this.formData.life_cycle = "已上线"  formValidate
      this.$refs.bizEdit.formValidate =  this.$options.data().initForm
      this.$refs.bizEdit.roleList = this.normalRoleList
      this.$refs.bizEdit.tenantList = this.tenantList
      this.modalData = {
        show: true,
        title: '添加业务',
        action: 'post'
      }
    },
    handleEdit (paramsRow) {
      this.$refs.bizEdit.formValidate = JSON.parse(JSON.stringify(paramsRow))
      this.$refs.bizEdit.roleList = this.normalRoleList
      this.$refs.bizEdit.tenantList = this.tenantList
      this.modalData = {
        show: true,
        title: '修改业务',
        action: 'put'
      }
    },
    handleClose () {
      this.modalData.show = false
      // this.formData = this.$options.data().formData
      this.$refs.bizEdit.showModal = false
      this.$refs.bizEdit.formValidate =  this.$options.data().initForm
      this.handleGetData()
      this.handleGetTenant()
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
    //导出数据
    handlerExport () {
      let nowTime = Date.parse(new Date())
      this.$refs.businessTable.exportCsv({
        filename: `业务列表-${nowTime}`,
      });
    }
  },
  watch: {
  },
  mounted () {
    this.handleGetData()
    this.handleGetTenant()
    this.handleGetRoleList()
  }
}
</script>

<style lang="less" scoped>
.search-con {
  padding: 5px 0;
  .search {
    &-input {
      display: inline-block;
      width: 350px;
      margin-left: 2px;
    }
    &-btn {
      margin-right: 0px;
      float: right;
    }
  }
}
</style>
