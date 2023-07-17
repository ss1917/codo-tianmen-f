<template>
  <div style="height:100%">

    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">这里用来记录通知配置，可能有很多敏感数据，注意权限控制。</template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input" search v-model="searchValue" @on-search="handleSearch" placeholder="请输入名称进行搜素" />
      <Button :disabled="rules.new_notice_config_btn ? false : true" type="info" class="search-btn" @click="handleAdd">添加通知配置</Button>
    </div>
    <Table size="small" ref="selection" :columns="columns" :data="tableData" />

    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <notice-config-edit :modalData="modalData" :formValidate="theData" @submit-notice-conf="saveNoticeConf" @drawer-close="handleDrawerClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getNoticeConfig, optNoticeConfig } from "@/api/notice";
import noticeConfigEdit from './components/notice-config-edit'
export default {
  components: { noticeConfigEdit },
  data () {
    return {
      theData: {},
      //
      searchValue: '', // 查询
      // 分页
      pageNum: 1, // 当前页码
      pageTotal: 0, // 数据总数
      pageSize: 15, // 每页条数
      modalData: {},
      //
      tableData: [],
      columns: [
        { title: '名称', key: 'name', minWidth: 80, maxWidth: 200 },
        { title: '索引', key: 'key', minWidth: 80, maxWidth: 200 },
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
                }
              }),
              h('span', '' + miaoshu)
            ]);
          }
        },
        { title: '配置', key: 'conf_map', minWidth: 200 },
        {
          title: '备注',
          key: 'remark',
          minWidth: 60,
          maxWidth: 100,
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'top' }
            }, [
              <Icon type="ios-help-circle" />,
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } }, params.row.remark)
            ])
          }
        },
        {
          title: '#',
          key: 'handle',
          minWidth: 135,
          maxWidth: 170,
          render: (h, params) => {
            return h('ButtonGroup', [
              h(
                'i-button',
                {
                  style: {
                    marginRight: '5px',
                  },
                  props: {
                    size: "small",
                    disabled: (this.rules && this.rules.edit_notice_config_btn) ? false : true
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
                    size: "small",
                    disabled: (this.rules && this.rules.del_notice_config_btn) ? false : true
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
    };
  },
  methods: {
    // 获取列表
    handleGetNoticeConfig () {
      getNoticeConfig(this.pageNum, this.pageSize, this.searchValue).then(res => {
        if (res.data.code === 0) {
          this.tableData = res.data.data;
          this.pageTotal = res.data.count
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
        title: '添加通知配置',
        action: 'post'
      }
      this.theData = this.$options.data().theData
    },
    //编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑通知配置',
        action: 'put'
      }
      this.theData = paramsRow
    },

    saveNoticeConf (saveData, action) {
      optNoticeConfig(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetNoticeConfig()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDrawerClose () {
      this.handleGetNoticeConfig()
    },
    handleSwitch (paramsRow) {
      this.$Message.info(`暂不支持`)
    },
    // 删除
    handleDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除：《${params.row.name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optNoticeConfig({ id: params.row.id }, 'delete').then(res => {
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
    handleSearch () {
      this.pageNum = 1
      this.handleGetNoticeConfig()
    },
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handleGetNoticeConfig()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetNoticeConfig()
    },
  },
  watch: {
    searchValue (val) {
    },

  },
  computed: {
    ...mapState({
      rules: state => state.user.rules,
    })
  },
  created () {
    this.handleGetNoticeConfig();
  },
  mounted () {
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