<template>
  <div style="height:100%">

    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">这里用来所有所有用户的长期token，后续会设置黑名单禁用无状态的JWT令牌。</template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input" clearable v-model="searchValue" placeholder="请输入关键字进行搜素" />
    </div>
    <Table size="small" :columns="columns" :data="tableData" border />

    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100, 1000]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getTokenlist, operationToken } from "@/api/auth/token";
export default {
  data () {
    return {

      newDetails: null,
      theData: {},
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
        { title: '用户ID', key: 'user_id', minWidth: 90, maxWidth: 120 },
        { title: "昵称", key: "nickname", minWidth: 110, maxWidth: 260 },
        {
          title: '状态',
          key: 'status',
          minWidth: 80,
          maxWidth: 100,
          render: (h, params) => {
            const status = this.tableData[params.index].status
            const style = status === '0' ? { cursor: 'pointer' } : { cursor: 'pointer', color: '#f50' }
            const miaoshu = status === '0' ? '启用' : '禁用'

            return h('div', [
              h('Badge', {
                style: style,
                props: {
                  status: status === '0' ? 'success' : 'default'
                },
                nativeOn: {
                  click: () => {
                    this.handleSwitch(params)
                  }
                }
              }),
              h('span', ' ' + miaoshu)
            ]);
          }
        },
        { title: "令牌（MD5）", key: "token_md5", minWidth: 250 },
        { title: "令牌", key: "token", minWidth: 245 },
        {
          title: '备注',
          key: 'details',
          minWidth: 70,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
              <Icon type="ios-help-circle" />,
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } }, params.row.details)
            ])
          }
        },
        {
          title: '过期时间',
          key: 'expire_time',
          width: 160,
        },
        {
          title: '创建时间',
          key: 'create_time',
          width: 160,
        },
        {
          title: '#',
          key: 'handle',
          minWidth: 100,
          maxWidth: 180,
          render: (h, params) => {
            return h('div', [
              this.rules && this.rules.del_token_a && h(
                'a',
                {
                  on: {
                    click: () => {
                      this.handleDelete(params)
                    }
                  }
                },
                '删除'
              ),
              this.rules && this.rules.edit_token_a && h(
                'a',
                {
                  style: {
                    marginLeft: "8px"
                  },
                  on: {
                    click: () => {
                      this.handleRenderEdit(params)
                    }
                  }
                },
                '备注'
              )
            ])
          }
        }
      ]
    };
  },
  methods: {
    // 获取令牌列表
    handleGetTokenList () {
      getTokenlist(this.pageNum, this.pageSize, this.searchValue).then(res => {
        if (res.data.code === 0) {
          this.pageTotal = res.data.count
          this.tableData = res.data.data
        } else {
          this.pageTotal = 0
          this.$Message.error(`${res.data.msg}`);
        }
      });
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
    //禁用/启用
    handleSwitch (params) {
      const miaoshu = params.row.status === '0' ? '禁用之后会把当前token列入黑名单' : '启用token'
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>${miaoshu}，五分钟内生效！！！</p>`,
        onOk: () => {
          setTimeout(() => {
            operationToken({ token_id: params.row.token_id }, 'patch').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.handleGetTokenList()
              } else {
                this.$Message.error(res.data.msg)
              }
            })
          }, 500);
        },
        onCancel: () => {
          this.$Message.info('回头是岸~');
        }
      });
    },
    // 删除
    handleDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除token：之后会把当前token写入黑名单，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            operationToken({ token_id: params.row.token_id }, 'delete').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.tableData.splice(params.index, 1)
              } else {
                this.$Message.error(res.data.msg)
              }
            })
          }, 500);
        },
        onCancel: () => {
          this.$Message.info('回头是岸~');
        }
      });
    },
    handleRenderEdit (params) {
      this.$Modal.confirm({
        onOk: () => {
          this.handleEdit(params)
        },
        render: (h) => {
          return h('Input', {
            props: {
              type: "textarea",
              maxlength: 150,
              showWordLimit: true,
              value: params.row.details,
              autofocus: true,
              placeholder: '添加备注信息'
            },
            on: {
              input: (val) => {
                this.newDetails = val
              }
            }
          })
        }
      })
    },
    handleEdit (params) {
      setTimeout(() => {
        operationToken({ token_id: params.row.token_id, details: this.newDetails }, 'put').then(res => {
          if (res.data.code == 0) {
            this.handleGetTokenList()
            this.$Message.success(res.data.msg)
          } else {
            this.$Message.error(res.data.msg)
          }
        })
      }, 500);
    },
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handleGetTokenList()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetTokenList()
    },
  },
  watch: {
    searchValue (val) {
      this.pageNum = 1
      this.handleGetTokenList()
    },

  },
  computed: {
    ...mapState({
      rules: state => state.user.rules,
    })
  },
  mounted () {
    this.handleGetTokenList()
  }
};
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
