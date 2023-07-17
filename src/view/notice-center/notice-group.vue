<template>
  <div style="height:100%">

    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">这里用来记录通知组，请勿重名，通知模板可以关联通知组。</template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input" search v-model="searchValue" @on-search="handleSearch" placeholder="请输入名称进行搜素" />
      <Button :disabled="rules.new_notice_group_btn ? false : true" type="info" class="search-btn" @click="handleAdd">添加通知组</Button>
    </div>
    <Table size="small" ref="selection" :columns="columns" :data="tableData" />

    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <notice-group-edit :modalData="modalData" :formValidate="theData" :allUser="allUser" @submit-notice-group="saveNoticeGroup" @drawer-close="handleDrawerClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getNoticeGroup, optNoticeGroup } from "@/api/notice";
import { getuserlist } from '@/api/authority/users'
import noticeGroupEdit from './components/notice-group-edit'
export default {
  components: { noticeGroupEdit },
  data () {
    return {
      allUser: [],
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
        { title: 'ID', key: 'id', minWidth: 80, maxWidth: 150, sortable: true },
        { title: '名称', key: 'name', minWidth: 80, sortable: true },
        {
          title: '用户',
          key: 'user_list',
          tooltip: true,
          minWidth: 300,
          render: (h, params) => {
            let user_list = params.row.user_list
            return h('div', user_list && user_list.map((item, index) => {
              return h('Tag', {
                props: { color: 'green' },
                style: {
                  marginRight: '2px'
                }
              }, item)
            }))
          }
        },
        {
          title: '备注',
          key: 'remark',
          minWidth: 60,
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
                    disabled: (this.rules && this.rules.edit_notice_group_btn) ? false : true
                    // disabled: false
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
                    disabled: (this.rules && this.rules.del_notice_group_btn) ? false : true
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
    handleGetNoticeGroup () {
      getNoticeGroup(this.pageNum, this.pageSize, this.searchValue).then(res => {
        if (res.data.code === 0) {
          this.tableData = res.data.data;
          this.pageTotal = res.data.count
        } else {
          this.pageTotal = 0
          this.$Message.error(`${res.data.msg}`);
        }
      });
    },
    // 获取用户列表
    handleGetUserList () {
      getuserlist(1, 310).then(res => {
        if (res.data.code === 0) {
          this.allUser = res.data.data
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    // 添加
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加通知组',
        action: 'post'
      }
      this.theData = this.$options.data().theData
    },
    //编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑通知组',
        action: 'put'
      }
      this.theData = paramsRow
    },

    saveNoticeGroup (saveData, action) {
      optNoticeGroup(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetNoticeGroup()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDrawerClose () {
      this.handleGetNoticeGroup()
    },
    handleSwitch (paramsRow) {
      this.$Message.info(`暂不支持`)
    },
    // 删除
    handleDelete (params) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>删除通知组：《${params.row.name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optNoticeGroup({ id: params.row.id }, 'delete').then(res => {
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
      this.handleGetNoticeGroup()
    },
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handleGetNoticeGroup()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetNoticeGroup()
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
    this.handleGetNoticeGroup();
  },
  mounted () {
    this.handleGetUserList()
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