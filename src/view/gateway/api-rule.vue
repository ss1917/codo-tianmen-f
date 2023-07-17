<template>
  <div style="height:100%">
    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">
        此处的权限为API网关中实际加载的权限数据，如果启用了RBAC插件的路由会校验用户是否有某个服务的某个请求方法+请求路径的权限
      </template>
    </Alert>
    <!-- <Affix :offset-top="80">
        <div class="search-con search-con-top">
          <Button type="info" class="search-btn"  @click="handlerAdd">注册服务</Button>
        </div>
    </Affix> -->

    <Table size="small" :columns="columns" :data="tableData"></Table>

    <rule-show :modalData="modalData" :ruleData="ruleData" @modal-close="handlerModalClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatDate } from '@/libs/tools.js';
import { getGwAPIRule, delGwAPIRule } from '@/api/gateway/permission.js'
import ruleShow from './components/rule-show'
export default {
  components: { ruleShow },
  data () {
    return {
      columns: [
        {
          title: 'ID',
          key: 'func_id',
          minWidth: 120,
          maxWidth: 180,
          sortable: true
        },
        {
          title: '权限名称',
          key: 'name',
          minWidth: 120,
          maxWidth: 180,
          sortable: true
        },
        {
          title: '服务编码',
          key: 'app_code',
          minWidth: 90
        },
        {
          title: '请求',
          key: 'method',
          minWidth: 90
        },
        {
          title: '后端服务uri',
          key: 'uri',
          minWidth: 150
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
                      this.handlerInfo(params.row.rules)
                    }
                  }
                },
                '详情'
              ),
              h(
                'a',
                {
                  style: {
                    marginRight: '5px'
                  },
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
      modalData: {},
      ruleData: []
    }
  },
  methods: {
    handleGetGwAPIRule () {
      getGwAPIRule().then(res => {
        this.tableData = res.data
        // this.getSpanArr(res.data)
      })
    },
    // 删除
    handlerDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>确定要删除API权限：《/${params.row.func_id}/${params.row.app_code}${params.row.key}》</p>`,
        onOk: () => {
          setTimeout(() => {
            delGwAPIRule({ key: `/${params.row.func_id}/${params.row.app_code}${params.row.key}` }).then(res => {
              this.$Message.success("删除成功")
              this.handleGetGwAPIRule()
            })
          }, 500);
        },
        onCancel: () => {
          this.$Message.info('回头是岸~');
        }
      });
    },
    handlerInfo (value) {
      let ruleList = []
      for (let key in value) {
        let user_id = key
        let status = value[key]
        // let [app_code, action, user_id] = key.split("|")
        // ruleList.push({ app_code, action, user_id, status })
        ruleList.push({ user_id, status })

        this.ruleData = ruleList
      }
      this.modalData = {
        show: true,
        title: '展示权限信息'
      }
    },
    handlerModalClose () {
      this.modalData.show = false
      this.handleGetGwAPIRule()
    }
  },
  //
  watch: {
  },
  computed: {
    ...mapState({
      rules: state => state.user.rules,
    })
  },
  mounted () {
    this.handleGetGwAPIRule()
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
