<template>
  <div style="height:100%">

    <Alert type="success" show-icon>
      使用说明：
      <Icon type="ios-bulb-outline" slot="icon"></Icon>
      <template slot="desc">这里用来记录通知模板，请勿重名，记录完成后通过模板ID发送通知，数据格式参考测试数据。
        如果发送失败，则会索引名称为默认的通知模板继续发送，无视限流。本接口使用令牌桶限流，令牌桶上限为5，可以设置令牌颁发速度。</template>
    </Alert>

    <div class="search-con search-con-top">
      <Input class="search-input" search v-model="searchValue" @on-search="handleSearch" placeholder="请输入名称进行搜素" />
      <Button  type="info" class="search-btn" @click="handleAdd">添加模板</Button>

    </div>
    <Table size="small" ref="selection" :columns="columns" :data="tableData" />

    <div style="margin: 10px; overflow: hidden">
      <div style="float: left;">
        <Page :total="pageTotal" :current="pageNum" :page-size="pageSize" show-total show-sizer :page-size-opts="[10, 15, 50, 100]" @on-change="handlerChangePage" @on-page-size-change="handlePageSize" />
      </div>
    </div>
    <template-edit :modalData="modalData" :formValidate="theData" :allUser="allUser" :noticeWay="noticeWay" :noticeGroup="noticeGroup" @handle-submit-notice="saveNotice" @drawer-close="handleDrawerClose" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getNoticeTemplate, optNoticeTemplate, sendNotice, getNoticeGroup, getNoticeConfig } from "@/api/notice";
import { getuserlist } from '@/api/authority/users'
import templateEdit from './components/template-edit'
export default {
  components: { templateEdit },
  data () {
    return {
      noticeWay: [
        { "lable": "阿里短信", "value": "aldx" },
        { "lable": "阿里电话", "value": "aldh" },
        { "lable": "腾讯短信", "value": "txdx" },
        { "lable": "腾讯电话", "value": "txdh" },
        { "lable": "钉钉", "value": "dd" },
        { "lable": "飞书", "value": "fs" },
        { "lable": "企业微信", "value": "wx" },
        { "lable": "邮件", "value": "email" }],
      allUser: [],
      noticeGroup: [],
      theData: {
        silence: 5
      },
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
        { title: 'ID', key: 'id', minWidth: 80, maxWidth: 150, sortable: true },
        { title: '名称', key: 'name', minWidth: 120, sortable: true },
        { title: '类型', key: 'way', minWidth: 80, maxWidth: 120, sortable: true },
        { title: '次数/分', key: 'silence', minWidth: 80, maxWidth: 120 },
        { title: "通知配置", key: "notice_conf", minWidth: 200 },
        { title: "通知模板", key: "msg_template", tooltip: true, minWidth: 200 },
        {
          title: '状态',
          key: 'status',
          minWidth: 80,
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
        {
          title: '通知用户',
          key: 'user_list',
          tooltip: true,
          minWidth: 200,
          maxWidth: 400,
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
          title: '通知组',
          key: 'notice_group',
          tooltip: true,
          minWidth: 150,
          render: (h, params) => {
            let notice_group = params.row.notice_group
            return h('div', notice_group && notice_group.map((item, index) => {
              return h('Tag', {
                props: { color: 'cyan' },
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
          minWidth: 165,
          maxWidth: 190,
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
                    type: "success",
                    // disabled: (this.rules && this.rules.edit_notice_template_btn) ? false : true
                  },
                  on: {
                    click: () => {
                      this.handleTest(params.row)
                    }
                  }
                },
                '测试'
              ),
              h(
                'i-button',
                {
                  style: {
                    marginRight: '5px',
                  },
                  props: {
                    size: "small",
                    // disabled: (this.rules && this.rules.edit_notice_template_btn) ? false : true
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
                    // disabled: (this.rules && this.rules.del_notice_template_btn) ? false : true
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
    handleGetNoticeTemplate () {
      getNoticeTemplate(this.pageNum, this.pageSize, this.searchValue).then(res => {
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
    handleGetNoticeGroup () {
      getNoticeGroup(1, 200).then(res => {
        if (res.data.code === 0) {
          this.noticeGroup = res.data.data;
        } else {
          this.$Message.error(`${res.data.msg}`);
        }
      });
    },
    //
    handleGetNoticeConfig () {
      getNoticeConfig(1, 200).then(res => {
        if (res.data.code === 0) {
          this.noticeWay = res.data.data.map((item, index) => {
            return { lable: item.name, value: item.key }
          })

        } else {
          this.$Message.error(`${res.data.msg}`);
        }
      });
    },
    // 添加
    handleAdd () {
      this.modalData = {
        show: true,
        title: '添加通知模板',
        action: 'post'
      }
      this.theData = this.$options.data().theData
    },
    //编辑
    handleEdit (paramsRow) {
      this.modalData = {
        show: true,
        title: '编辑通知模板',
        action: 'put'
      }
      this.theData = paramsRow
    },

    saveNotice (saveData, action) {
      optNoticeTemplate(saveData, action).then(res => {
        if (res.data.code == 0) {
          this.$Message.success(`${res.data.msg}`)
          this.modalData.show = false
          this.handleGetNoticeTemplate()
        } else {
          this.$Message.error(`${res.data.msg}`)
        }
      })
    },
    handleDrawerClose () {
      this.modalData.show = false
      this.handleGetNoticeTemplate()
    },
    //禁用/启用
    handleSwitch (params) {
      const miaoshu = params.row.status === '0' ? '禁用' : '启用'
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>${miaoshu}当前通知模板</p>`,
        onOk: () => {
          setTimeout(() => {
            optNoticeTemplate({ id: params.row.id }, 'patch').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
                this.handleGetNoticeTemplate()
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
        content: `<p>删除通知模板：《${params.row.name}》之后无法找回，请谨慎操作！</p>`,
        onOk: () => {
          setTimeout(() => {
            optNoticeTemplate({ id: params.row.id }, 'delete').then(res => {
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
    handleTest (paramsRow) {
      this.$Modal.confirm({
        title: '提醒',
        content: `<p>通知测试：发送测试数据，用来测试配置是否正确！</p>`,
        onOk: () => {
          setTimeout(() => {
            sendNotice({ id: paramsRow.id }, 'post').then(res => {
              if (res.data.code == 0) {
                this.$Message.success(res.data.msg)
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
      this.handleGetNoticeTemplate()
    },
    // 分页
    handlerChangePage (value) {
      this.pageNum = value
      this.handleGetNoticeTemplate()
    },
    handlePageSize (value) {
      this.pageNum = 1
      this.pageSize = value
      this.handleGetNoticeTemplate()
    },
  },
  watch: {
    searchValue (val) {
      // this.handleGetNoticeTemplate()
    },

  },
  computed: {
    ...mapState({
      rules: state => state.user.rules,
    })
  },
  created () {
    this.handleGetNoticeTemplate();
  },
  mounted () {
    this.handleGetNoticeGroup()
    this.handleGetNoticeConfig()
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
