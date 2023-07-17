<template>
  <div style="height:100%">

    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">这里用来所有应用的菜单，不区分应用，请勿重名。</template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input" clearable v-model="searchValue" placeholder="请输入关键字进行搜素" />
      <Button type="info" class="search-btn" @click="handleAdd">添加菜单</Button>

    </div>
    <Table size="small" :columns="columns" :data="tableData" border :span-method="handleSpan" />

    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <menu-edit :modalData="modalData" :formValidate="theData" :app_list="app_list" @handle-submit-menu="saveMenu" @modal-close="handleDrawerClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getMenuslist, operationMenu } from '@/api/authority/menu'
import { getApplist } from '@/api/authority/apps'
import menuEdit from './components/menu-edit'
export default {
  components: { menuEdit },
  data () {
    return {
      spanArr: [],
      pos: null,
      theData: {},
      app_list: [],
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
        { title: '服务编码', key: 'app_code', minWidth: 80, maxWidth: 150, sortable: true },
        { title: '菜单名称', key: 'menu_name', minWidth: 200, maxWidth: 400, sortable: true },
        { title: '备注信息', key: 'details', minWidth: 200 },
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
          title: '#',
          key: 'handle',
          minWidth: 120,
          maxWidth: 180,
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
    // 获取菜单列表
    handleGetMenusList () {
      getMenuslist(this.pageNum, this.pageSize, this.searchValue).then(res => {
        if (res.data.code === 0) {
          this.pageTotal = res.data.count
          this.tableData = res.data.data
          this.getSpanArr(res.data.data)
        } else {
          this.pageTotal = 0
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 获取所有应用
    handleGetApplist () {
      getApplist(1, 500, '', 'yes').then(res => {
        if (res.data.code === 0) {
          this.app_list = res.data.data
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 添加
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加菜单',
        action: 'post'
      }
      this.theData = this.$options.data().theData
    },
    // 编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑菜单',
        action: 'put'
      }
      this.theData = paramsRow
    },
    saveMenu (saveData, action) {
      operationMenu(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetMenusList()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDrawerClose () {
      this.handleGetMenusList()
      this.modalData.show = false
    },
    // 禁用/启用
    handleSwitch (paramsRow) {
      operationMenu({ menu_id: paramsRow.menu_id }, 'patch').then(res => {
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
        content: `<p>删除菜单：《${params.row.menu_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            operationMenu({ menu_id: params.row.menu_id }, 'delete').then(res => {
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
    //
    getSpanArr (data) {
      this.spanArr = []
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1)
          this.pos = 0
        } else {
          // 判断当前元素与上一个元素是否相同
          if (data[i].app_code === data[i - 1].app_code) {
            this.spanArr[this.pos] += 1
            this.spanArr.push(0)
          } else {
            this.spanArr.push(1)
            this.pos = i
          }
        }
      }
    },
    handleSpan ({ row, column, rowIndex, columnIndex }) { // 合并表格
      if (columnIndex === 0) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handleGetMenusList()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetMenusList()
    }
  },
  watch: {
    searchValue (val) {
      this.pageNum = 1
      this.handleGetMenusList()
    }

  },
  computed: {
    ...mapState({
      rules: state => state.user.rules
    })
  },
  mounted () {
    this.handleGetMenusList()
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
