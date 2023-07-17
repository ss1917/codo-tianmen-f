<template>
  <div style="height:100%">
    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">服务启动时，将自己的节点信息注册到etcd，包括：服务名称、ip、端口
        网关服务从etcd监听服务节点信息，保存到缓存中，从客户端请求的url中提取服务名称，通过服务名称查找节点信息，将请求转发到后端服务
      </template>
    </Alert>
    <Affix :offset-top="80">
      <div class="search-con search-con-top">
        <Button type="info" class="search-btn" @click="handlerAdd">注册服务</Button>
      </div>
    </Affix>

    <Table size="small" :columns="columns" :data="tableData" border :span-method="handleSpan"></Table>

    <service-edit :modalData="modalData" :formValidate="svcData" @handle-submit-service="saveData" @modal-close="handlerModalClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatDate } from '@/libs/tools.js';
import { getGwServices, saveGwService, delGwService } from '@/api/gateway/services'
import serviceEdit from './components/service-edit'
export default {
  components: { serviceEdit },
  data () {
    return {
      columns: [
        {
          title: '服务编码',
          key: 'service_name',
          minWidth: 120,
          maxWidth: 150,
          sortable: true
        },
        {
          title: 'upstream',
          key: 'upstream',
          minWidth: 150
        },
        {
          title: '权重',
          key: 'weight',
          minWidth: 80,
          maxWidth: 130,
          sortable: true
        },
        {
          title: '状态',
          key: 'handle',
          width: 100,
          render: (h, params) => {
            let status = params.row.status
            if (status === 1) {
              return h('div', [
                h('Tag', { props: { color: 'green' } }, 'up')
              ])
            } else if (status === 0) {
              return h('div', [h('Tag', { props: { color: 'orange' } }, 'down')])
            } else {
              return h('div', [
                h('Tag', { props: { color: 'error' } }, '未知')
              ])
            }
          }
        },
        {
          title: '更新时间',
          key: 'time',
          width: 155,
          render: (h, params) => {
            return h('div',
              formatDate(new Date(params.row.time), 'yyyy-MM-dd hh:mm')
            )
          }
        },
        {
          title: '#',
          key: 'handle',
          minWidth: 110,
          maxWidth: 130,
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
                      this.handlerEdit(params.row)
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
      pluginList: [],
      svcData: {
        weight: 1,
        status: 1
      },
      //
      modalData: {},
      spanArr: [],
      pos: null
    }
  },
  methods: {
    handleGetGwServices () {
      getGwServices().then(res => {
        this.tableData = res.data
        this.getSpanArr(res.data)
      })
    },

    handlerAdd () {
      this.svcData = this.$options.data().svcData
      this.svcData = {
        weight: 1,
        status: 1
      }
      this.modalData = {
        show: true,
        title: '注册服务节点',
        action: 'post'
      }
    },
    handlerEdit (paramsRow) {
      this.svcData = paramsRow
      this.modalData = {
        show: true,
        title: '编辑服务节点信息',
        action: 'post'
      }
    },
    handlerModalClose () {
      this.handlerGetFuncsList()
    },
    saveData (serviceData, action) {
      console.log(serviceData, action)
      saveGwService(serviceData, action).then(res => {
        this.$Message.success(`成功`)
        this.modalData.show = false
        this.handleGetGwServices()
      })
    },
    // 删除
    handlerDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>确定要删除服务节点：《${params.row.upstream}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            delGwService({ 'key': params.row.key }).then(res => {
              this.$Message.success("删除成功")
              this.handleGetGwServices()
            })
          }, 500);
        },
        onCancel: () => {
          this.$Message.info('回头是岸~');
        }
      });
    },
    //
    getSpanArr (data) {
      this.spanArr = []
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0
        } else {
          // 判断当前元素与上一个元素是否相同
          if (data[i].service_name === data[i - 1].service_name) {
            this.spanArr[this.pos] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            this.pos = i;
          }
        }
      }
    },
    handleSpan ({ row, column, rowIndex, columnIndex }) {//合并表格 
      if (columnIndex === 0) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        }
      }
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
    this.handleGetGwServices()
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
