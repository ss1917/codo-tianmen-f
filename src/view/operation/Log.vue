<template>
  <Card dis-hover>
    <div class="search-con search-con-top">
      <Select v-model="searchKey" class="search-col">
        <template v-for="item in columns">
          <Option v-if="item.key !== 'handle'" :value="item.key" :key="`search-col-${item.key}`" :label="item.title"></Option>
        </template>
      </Select>
      <Input class="search-input" clearable placeholder="输入关键字搜索" v-model="searchValue" />
      <DatePicker class="search-input" :value="selectDate" :options="optionsDate" @on-change="handlerChangeDate" type="daterange" placement="bottom-end" placeholder="Select date" style="width: 220px"></DatePicker>

      <Button @click="handleSearch" class="search-btn" type="primary">搜索</Button>
    </div>

    <Table size="small" :columns="columns" :data="tableData" :loading="i.tableLoading" />
    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="i.pageTotal" :current="initPara.page_number" :page-size="initPara.page_size" show-total show-sizer
          :page-size-opts="[15, 50, 100]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
  </Card>
</template>

<script>
import { getLoglist, getLoglist2 } from '@/api/app/operation'
export default {
  data () {
    return {
      columns: [
        {
          title: '用户名',
          key: 'username',
          align: 'center',
          minWidth: 120,
          sortable: true
        },
        {
          title: '昵称',
          key: 'nickname',
          minWidth: 100
        },
        {
          title: '服务',
          key: 'service_name',
          minWidth: 80,
          maxWidth: 120
        },
        {
          title: '请求',
          key: 'method',
          minWidth: 85,
          maxWidth: 150,
          render: (h, params) => {
            const method = params.row.method
            if (method == 'GET') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#61affe" }
                  },
                  params.row.method
                )
              ]);
            } else if (method == 'POST') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#49cc90" }
                  },
                  params.row.method
                )
              ]);
            } else if (method == 'PUT') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#fca130" }
                  },
                  params.row.method
                )
              ]);
            } else if (method == 'PATCH') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#50e3c2" }
                  },
                  params.row.method
                )
              ]);
            } else if (method == 'DELETE') {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#ed4014" }
                  },
                  params.row.method
                )
              ]);
            } else {
              return h("div", [
                h(
                  "p",
                  {
                    style: { color: "#f93e3e" }
                  },
                  params.row.method
                )
              ]);
            }
          }
        },
        {
          title: '请求路径',
          key: 'uri',
          tooltip: true,
          minWidth: 180,
          maxWidth: 350
        },
        {
          title: '请求数据',
          key: 'data',
          tooltip: true,
          minWidth: 150,
          maxWidth: 800
        },
        {
          title: '链路ID',
          key: 'trace_id',
          tooltip: true,
          minWidth: 80,
          maxWidth: 150
        },
        {
          title: 'upstream',
          key: 'upstream',
          tooltip: true,
          minWidth: 80,
          maxWidth: 150
        },
        {
          title: '状态',
          key: 'response_status',
          minWidth: 80,
          maxWidth: 100
        },
        {
          title: '访问IP',
          key: 'client_ip',
          minWidth: 100,
          maxWidth: 150
        },
        {
          title: '访问时间',
          key: 'start_time',
          width: 160
        }
      ],
      tableData: [],
      //
      tableLoading: true,
      selectDate: [],
      pageTotal: 0, // 数据总数
      // pageNum: 1, // 当前页码
      // pageSize: 15, // 每页条数
      i:{
        pageTotal: 0, //总数
        tableLoading: true
      },
      initPara:{
        page_number: 1,
        page_size: 15,
        searchVal: null,
        order_by: "start_time",      //排序字段
        order: "ascend", //排序 ascend descend
      },
      searchKey: 'username',
      searchValue: '', //查找
      filter_map: '',
      optionsDate: {
        shortcuts: [
          {
            text: '一星期',
            value () {
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24);
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            },
            onClick: (picker) => {
            }
          },
          {
            text: '一个月',
            value () {
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24);
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            },
            onClick: (picker) => {
            }
          },
          {
            text: '三个月',
            value () {
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24);
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            },
            onClick: (picker) => {
            }
          }
        ]
      },
      //
    }
  },
  methods: {
    // 获取列表
    async handleGetData () {
      this.initPara['end_date'] = this.selectDate[0]
      this.initPara['start_date'] = this.selectDate[1]
      const res = await getLoglist2(this.initPara);
      if (res.data.code == 0) {
        this.tableData = res.data.data;
        this.i.pageTotal = res.data.count
      } else {
        this.$Message.error(res.data.msg)
      }
      this.i.tableLoading = false
    },
    // handleGetLogList () {
    //   getLoglist(this.pageNum, this.pageSize, this.searchKey, this.searchValue, this.selectDate[0], this.selectDate[1]).then(res => {
    //     if (res.data.code == 0) {
    //       this.tableData = res.data.data
    //       this.pageTotal = res.data.count
    //     } else {
    //       this.$Message.error(res.data.msg)
    //     }
    //     this.tableLoading = false
    //   })
    // },
    getDates () {
      const start = new Date()
      const end = new Date()
      end.setTime(end.getTime() + 3600 * 1000 * 24);
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      this.selectDate = [start, end]
      //
    },

    handlerChangeDate (value) {
      this.selectDate = value
    },
    //
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
    // handleClear (e) {
    //   if (e.target.value === '') this.tableData = this.value
    // },
  },
  watch: {
    selectDate (val) {
      this.handleGetData()
    }
  },

  mounted () {
    this.getDates()
  }
}
</script>

<style lang="less" scoped>
.search-con {
  padding: 10px 0;
  .search {
    &-col {
      display: inline-block;
      width: 150px;
    }
    &-input {
      display: inline-block;
      width: 200px;
      margin-left: 2px;
    }
    &-btn {
      margin-left: 5px;
    }
  }
}
</style>
