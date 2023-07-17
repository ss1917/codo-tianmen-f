<template>
  <div style="height:100%">

    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">所有菜单，不区分应用，请勿重名。</template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input"  v-model="initPara.searchVal" search :maxlength="100" @on-search="handleSearch" placeholder="输入关键字全局搜索" />
      <Select class="search-select" v-model="initPara.app_code" filterable clearable @on-change="handleSearch" placeholder="请选择应用">
          <Option  v-for="item in app_list" :value="item.app_code" :key="item.id" >{{item.app_name}} {{item.app_code}}</Option>
      </Select>
      <Button class="search-btn" @click="handleAdd">添加菜单</Button>
      <Button type="error" class="search-btn" @click="handleDelB" :disabled="selectList.length !== 0 ? false : true">批量删除</Button>

    </div>
    <Table size="small" ref="selection" :columns="columns" :data="tableData"  @on-selection-change="handleSelect"></Table>

    <!-- 分页 -->
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="i.pageTotal" :current="initPara.page_number" :page-size="initPara.page_size" show-total show-sizer
          :page-size-opts="[15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <menu-edit :modalData="modalData" :formValidate="theData" :app_list="app_list" @save-data="handleSaveMenu" @close="handleClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getMenusList, optMenu } from '@/api/auth/menu'
import { getApplist } from "@/api/auth/apps";
import menuEdit from './components/menu-edit'
export default {
  components: { menuEdit },
  data () {
    return {
      theData: {},
      app_list: [],
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
      //
      modalData: {},
      //
      tableData: [],
      columns: [
       { type: 'selection', title: '', key: '', width: 60, align: 'center' },
        { title: '应用编号', key: 'app_code', minWidth: 80, maxWidth: 150, sortable: true },
        { title: '菜单名称', key: 'menu_name', minWidth: 200, maxWidth: 400, sortable: true },
        { title: '备注名', key: 'details', minWidth: 200 },
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
      ]
    }
  },
  methods: {
    // 获取菜单列表
    async handleGetData () {
      const res = await getMenusList(this.initPara)
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
    handleSaveMenu (saveData, action) {
      optMenu(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetMenusList()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleClose () {
      this.handleGetData()
      this.modalData = {}
      this.theData = this.$options.data().theData
      this.selectList = []
    },
    // 禁用/启用
    handleSwitch (paramsRow) {
      optMenu({ menu_id: paramsRow.menu_id }, 'patch').then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 删除
    handleDelB (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除菜单：《${params.row.menu_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optMenu({ id_list: this.selectList }, 'delete').then(res => {
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
    handleDel (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除菜单：《${params.row.menu_name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optMenu({ menu_id: params.row.menu_id }, 'delete').then(res => {
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
