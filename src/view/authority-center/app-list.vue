<template>
  <div style="height:100%">

    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">这里用来记录应用信息，请勿重名，一个应用可以有多个服务编码，后端需要自行添加路由，注册服务。</template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input" clearable v-model="searchValue" placeholder="请输入关键字进行搜素" />
      <Button  class="search-btn" @click="handleAdd">添加应用</Button>

    </div>
    <Table size="small" ref="selection" :columns="columns" :data="tableData" />

    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <app-edit :modalData="modalData" :formValidate="theData"  @handle-submit-app="saveApp" @drawer-close="handleDrawerClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getApplist, optApp } from '@/api/authority/apps'
import appEdit from './components/app-edit'
export default {
  components: { appEdit },
  data () {
    return {
      theData: {},
      //
      searchValue: '', // 查询
      // 分页
      pageNum: 1, // 当前页码
      pageTotal: 0, // 数据总数
      pageSize: 15, // 每页条数
      //
      btn_loading: false,
      modalData: {},
      //
      tableData: [],
      columns: [
        { title: '编码', key: 'app_code', minWidth: 80, maxWidth: 150, sortable: true },
        { title: '名称', key: 'name', minWidth: 150, maxWidth: 400, sortable: true },
        { title: 'path', key: 'path', minWidth: 150 },
        {
          title: '备注',
          key: 'description',
          minWidth: 60,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
              <Icon type="ios-help-circle" />,
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } }, params.row.description)
            ])
          }
        },
        {
          title: '前端上架',
          key: 'is_up',
          minWidth: 80,
          maxWidth: 100,
          align: 'center',
          render: (h, params, vm) => {
            return h('div', [
              h('i-switch', {
                props: {
                  trueColor: '#19be6b',
                  value: params.row.is_up === 'yes' // 控制开关的打开或关闭状态，官网文档属性是value
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
          title: '#',
          key: 'handle',
          minWidth: 150,
          maxWidth: 200,
          render: (h, params) => {
            return h('div', [
              h(
                'i-button',
                {
                  style: {
                    marginRight: '5px'
                  },
                  props: {
                    size: 'small'
                    // disabled: (this.rules && this.rules.edit_app_btn) ? false : true
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
                'i-button',
                {
                  props: {
                    size: 'small'
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
    handleGetApplist () {
      getApplist(this.pageNum, this.pageSize, this.searchValue).then(res => {
        if (res.data.code === 0) {
          this.tableData = res.data.data
          this.pageTotal = res.data.count
        } else {
          this.pageTotal = 0
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // // 获取用户列表
    // handleGetUserList () {
    //   getuserlist(1, 400).then(res => {
    //     if (res.data.code === 0) {
    //       this.allUser = res.data.data
    //     } else {
    //       this.$Message.error(`${res.data.msg}`)
    //     }
    //   })
    // },
    // 添加
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加应用记录',
        action: 'post'
      }
      this.theData = this.$options.data().theData
    },
    // 编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑应用记录',
        action: 'put'
      }
      this.theData = paramsRow
    },
    saveApp (saveData, action) {
      optApp(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetApplist()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDrawerClose () {
      this.handleGetApplist()
    },
    // 禁用/启用
    // handleSwitch(paramsRow){
    //   optApp({app_id: paramsRow.app_id}, 'patch').then(res => {
    //     if (res.data.code == 0) {
    //       this.$Message.success(`${res.data.msg}`)
    //     } else {
    //       this.$Message.error(`${res.data.msg}`)
    //     }
    //   })
    // },
    handleSwitch (paramsRow) {
      this.$Message.info(`暂不支持`)
    },
    // 删除
    handleDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除应用：《${params.row.app_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optApp({ id_list: [params.row.id] }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.handleGetApplist()
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
      this.handleGetApplist()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetApplist()
    }
  },
  watch: {
    searchValue (val) {
      this.pageNum = 1
      this.handleGetApplist()
    }

  },
  computed: {
    ...mapState({
      rules: state => state.user.rules
    })
  },
  mounted () {
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
