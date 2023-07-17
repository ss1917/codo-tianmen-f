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
        <Button type="info" class="search-btn" @click="handlerAdd">添加路由配置</Button>
      </div>
    </Affix>

    <Table size="small" ref="selection" :columns="columns" :data="tableData"></Table>

    <route-edit :modalData="modalData" :formValidate="routeData" :pluginList="pluginList" @handle-submit-route="saveData" @modal-close="handlerModalClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatDate } from '@/libs/tools.js';
import { getGwRoutelist, saveGwRoute, delGwRoute, getGwPluginlist } from '@/api/gateway/routes'
import routeEdit from './components/route-edit'
export default {
  components: { routeEdit },
  data () {
    return {
      columns: [
        {
          title: '协议',
          key: 'protocol',
          minWidth: 100,
          maxWidth: 120,
          sortable: true
        },
        {
          title: '路由前缀',
          key: 'prefix',
          minWidth: 150,
          maxWidth: 250,
          sortable: true
        },
        {
          title: '服务编码',
          key: 'service_name',
          minWidth: 125,
          maxWidth: 180,
          sortable: true
        },
        {
          title: '说明',
          key: 'remark',
          minWidth: 120
        },
        {
          title: '是否启用',
          key: 'handle',
          width: 100,
          render: (h, params) => {
            let status = params.row.status
            if (status === 1) {
              return h('div', [
                h('Tag', { props: { color: 'green' } }, '启用')
              ])
            } else if (status === 0) {
              return h('div', [h('Tag', { props: { color: 'orange' } }, '禁用')])
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
              // Date是后台时间戳参数字段
              // 'yyyy-MM-dd hh:mm' 对应的时间格式 2018-12-21 18:46  
              // 格式可以自行修改，例如 'yyyy-MM-dd' -> 2018-12-21,  'yyyy-MM' -> 2018-12
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
      routeData: {
        propsData: {},
        status: 1
      },
      //
      modalData: {},
      spanArr: [],
      pos: null
    }
  },
  methods: {
    handleGetGwRoutelist () {
      getGwRoutelist().then(res => {
        this.tableData = res.data
      })
    },

    //获取所有插件
    handleGetGwPluginlist () {
      let plugins = []
      getGwPluginlist().then(res => {
        res.data.forEach(data => {
          plugins.push({
            value: data.name,
            label: data.desc
          })
        })
        this.pluginList = plugins
      });
    },

    handlerAdd () {
      this.routeData = this.$options.data().routeData
      this.modalData = {
        show: true,
        title: '添加路由配置',
        action: 'post'
      }
    },
    handlerEdit (paramsRow) {
      this.routeData = paramsRow
      this.routeData.propsData = paramsRow.props
      this.modalData = {
        show: true,
        title: '编辑路由配置信息',
        action: 'post'
      }
    },
    handlerModalClose () {
      this.handlerGetFuncsList()
    },
    saveData (rData, action) {
      console.log(rData, action)
      saveGwRoute(rData, action).then(res => {
        this.$Message.success(`成功`)
        this.modalData.show = false
        this.handleGetGwRoutelist()
      })
    },
    // 删除
    handlerDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>确定要删除路由：《${params.row.prefix}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            delGwRoute({ key: params.row.key }).then(res => {
              this.$Message.success("删除成功")
              this.handleGetGwRoutelist()
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
          if (data[i].app_code === data[i - 1].app_code) {
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
    this.handleGetGwRoutelist()
    this.handleGetGwPluginlist()
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
