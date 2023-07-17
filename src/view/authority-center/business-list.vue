<template>
  <div>
    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">租户隔离，代表业务/项目/资源组/租户</template>
    </Alert>
    <div class="search-con search-con-top">
      <Input class="search-input" v-model="searchValue" clearable :maxlength='50' placeholder="输入关键字搜索" />
      <ButtonGroup class="search-btn">
        <Button icon="ios-add" @click="handleAdd()"> 新建业务</Button>
        <Button icon="ios-download-outline" @click="handlerExport()">导出数据</Button>
      </ButtonGroup>
    </div>
    <Table :columns="tableColumns" :data="tableData" size="small" ref="businessTable"></Table>
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[15,50,100,500]" @on-change="handleChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>

    <template v-if="formData">
      <business-edit :modalData="modalData" :userList="userList" :formData="formData" @save-data="handleSave" @modal-close="handleClose" />
    </template>
  </div>
</template>

<script>
import { getBusinesslist, optBusiness } from '@/api/authority/biz.js'
import { getuserlist } from '@/api/authority/users'
import businessEdit from './components/business-edit'
export default {
  components: { businessEdit },
  data () {
    return {
      tableColumns: [
        {
          title: '租户ID',
          key: 'business_id',
          sortable: true,
          minWidth: 90,
          maxWidth: 150,
        },
        {
          title: '名称',
          key: 'resource_group',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '英文名',
          key: 'business_en',
          sortable: true,
          minWidth: 100
        },
        {
          title: '中文名',
          key: 'business_zh',
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
      pageTotal: 0, // 数据总数
      pageNum: 1, // 当前页码
      pageSize: 15, // 每页条数，设置为15是为了方便一般情况下，显示出所有的业务
      searchValue: '',
      // 弹出框
      modalData: {
        show: false,
        title: '添加业务',
        action: 'post'
      },
      formData: {
        sort: 10
      },
      userList: null
    }
  },
  methods: {
    async handleGetBizList () {
      let res = await getBusinesslist(this.pageNum, this.pageSize, this.searchValue)
      if (res.data.code == 0) {
        this.pageTotal = res.data.count
        this.tableData = res.data.all_data
      } else {
        this.tableData = []
        this.$Message.error(res.data.msg)
      }
    },
    async handleGetUserList () {
      let res = await getuserlist(1, 500)
      if (res.data.code === 0) {
        let userList = []
        res.data.data.forEach(item => {
          userList.push({ user_id: item.user_id, username: item.username, nickname: item.nickname })
        })
        this.userList = userList
      } else {
        this.$Message.error(res.data.msg)
      }
    },
    handleSave (formData, action) {
      optBusiness(formData, action).then(res => {
        if (res.data.result) {
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
          optBusiness({ id: paramsRow.id }, 'delete').then(res => {
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
      this.formData = this.$options.data().formData
      this.formData.life_cycle ="已上线"
      this.modalData = {
        show: true,
        title: '添加业务',
        action: 'post'
      }
    },
    handleEdit (paramsRow) {
      this.formData = paramsRow
      this.modalData = {
        show: true,
        title: '修改业务',
        action: 'put'
      }
    },
    handleClose () {
      this.modalData.show = false
      this.handleGetBizList()
    },
    // 切换页码
    handleChangePage (value) {
      this.pageNum = value
      this.handleGetBizList()
    },
    handlePageSize (value) {
      this.pageSize = value
      this.handleGetBizList()
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
    searchValue (val) {
      this.pageNum = 1
      this.handleGetBizList()
    },
  },
  mounted () {
    this.handleGetBizList()
    this.handleGetUserList()
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
