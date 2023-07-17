<template>
  <div>

    <Alert type="success" show-icon>
       飞书或钉钉内免登录认证：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">
        应用内打开的链接 + 认证地址/编码 + 参数
        <p>https://applink.feishu.cn/client/web_url/open?url=http://10.241.0.40:8888/api/p/v4/m/F7mwALszvsTYiBPCqYRKqT?order_id=666</p></template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input" clearable v-model="initPara.searchVal" placeholder="请输入关键字进行搜素" />
      <Button  class="search-btn" @click="handleAdd">添加链接</Button>

    </div>
    <Table size="small" ref="selection" :columns="columns" :data="tableData" :loading="i.tableLoading" @on-sort-change="handleSort"  />

        <!-- 分页 -->
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="i.pageTotal" :current="initPara.page_number" :page-size="initPara.page_size" show-total show-sizer
          :page-size-opts="[15, 50, 100]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>

    <link-edit :modalData="modalData" :formValidate="theData"  @save-data="saveData" @close="handleClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getLinklist, optLink } from '@/api/app/link'
import linkEdit from './components/link-edit'
export default {
  components: { linkEdit },
  data () {
    return {
      theData: {},
      //
      btn_loading: false,
      modalData: {},
      initForm: {
      },
      initPara:{
        page_number: 1,
        page_size: 15,
        searchVal: null,
        order_by: "name",      //排序字段
        order: "ascend", //排序 ascend descend
      },
      i:{
        pageTotal: 0, //总数
        tableLoading: true
      },

      //
      tableData: [],
      columns: [
        { title: '编码', key: 'code', minWidth: 150, maxWidth: 200, sortable: true },
        { title: '名称', key: 'name', minWidth: 100, maxWidth: 200, sortable: true },
        { title: '认证地址', key: 'login_url', minWidth: 150, sortable: true },
        { title: '真实地址', key: 'real_url', minWidth: 150, sortable: true },
        { title: 'client_id', key: 'client_id', minWidth: 100, sortable: true },
        {
          title: '#',
          key: 'handle',
          minWidth: 130,
          maxWidth: 150,
          render: (h, params) => {
            return h('div', [
              h(
                'a',
                {
                  style: {
                    marginRight: '10px'
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
                    marginRight: "1px",
                  },
                  on: {
                    click: () => {
                      this.handleDelete(params)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ]
    }
  },
  methods: {
    // 获取列表
     async handleGetData() {
      const res = await getLinklist(this.initPara);
      if (res.data.code == 0) {
        this.tableData = res.data.data;
        this.i.pageTotal = res.data.count
      } else {
        this.$Message.error(res.data.msg)
      }
      this.i.tableLoading = false
    },
    handleClose () {
      this.modalData.show = false
      this.theData = this.$options.data().theData
      this.handleGetData()
      this.selectList = []

    },
    // 添加
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加记录',
        action: 'post'
      }
      this.theData = this.$options.data().initForm
    },
    // 编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑记录',
        action: 'put'
      }
      this.theData = paramsRow
    },
    saveData (saveData, action) {
      optLink(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.handleClose()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },

    // 删除
    handleDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除：《${params.row.name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optLink({ id_list: [params.row.id] }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.handleClose()
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

    handleSearch(){
      this.initPara.page_number = 1
      this.handleGetData()
    },
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
