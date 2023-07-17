<template>
  <div>
    <Modal v-model="modalData.show" :title="modalData.title" width="900" :mask-closable="false" :footer-hide="true" @on-close="handleCancel">
    <!-- <alert>一共查询到:{{ totalCount }}条数据</alert> -->
      <div class="search-con search-con-top">
      <Input class="search-input"  v-model="searchVal" search :maxlength="100" @on-search="handleSearch" placeholder="输入关键字全局搜索" />
    </div>

    <Table size="small" ref="selection" :columns="columns" :data="tableData" :loading="tableLoading"  />

    <!-- 分页 -->
    <div style="margin: 10px; overflow: hidden">
      <Page :total="totalCount" :current="pageNum" :page-size="pageSize" show-total @on-change="handlerChangePage" />
    </div>
    </Modal>
  </div>
</template>
<script>
import { getUserByRole } from '@/api/auth/role'
export default {
  name: 'preViewUser',
  props: {
    modalData: {
        type :Object,
        default: {}
    }
  },
  data() {
    return {
      columns: [
        { title: 'ID', key: 'user_id', sortable: true, minWidth: 100, maxWidth: 130 },
        { title: '用户名', key: 'username', sortable: true, minWidth: 100, maxWidth: 200 },
        { title: '昵称', key: 'nickname', sortable: true, minWidth: 100, maxWidth: 200 },
        { title: '邮箱', key: 'email', minWidth: 110},
        { title: '来源', key: 'source', minWidth: 100},
      ],
      tableData: [],
      serverList: [], //初始总数
      pageTotal: 0,
      pageSize: 12,
      pageNum: 1,
      searchVal: null,
      tableLoading: true
    }
  },
  watch: {
  },
  computed: {
    totalCount() {
      return this.serverList.length
    }
  },
  methods: {
    // 获取用户列表
    async handleGetData (role_id) {
      const res = await getUserByRole({ role_id: role_id })
      if (res.data.code === 0) {
        this.serverList = res.data.data;
        this.setCurrentPageData()
      } else {
        this.$Message.error(res.data.msg)
      }
      this.tableLoading = false
    },
    handleCancel () {
      this.$emit('close')
      this.modalData.show = false
    },

    handlerChangePage (value) {
      this.pageNum = value
      this.setCurrentPageData()
    },
    // 分页处理
    setCurrentPageData () {
      let begin = (this.pageNum - 1) * this.pageSize;
      let end = this.pageNum * this.pageSize;
      this.tableData = this.serverList.slice(begin, end);
    },
    checkExecList (item) {
      return item.username.indexOf(this.searchVal) >= 0 || item.nickname.indexOf(this.searchVal) >= 0 || item.email.indexOf(this.searchVal) >= 0
    },
     // 前端搜索
    handleSearch () {
      if (this.searchVal) {
        this.pageNum = 1
        this.tableData = this.serverList.filter(this.checkExecList)
      } else {
         this.pageNum = 1
         this.setCurrentPageData ()
      }
    }
  },
}
</script>

<style lang="less" scoped>
.search-con {
  padding: 2px 0;
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
      width: 350px;
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
