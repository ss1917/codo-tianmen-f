<!--引用插件，查询条件类型，表格列处理类型还不全，新的类型支持到具体业务时继续完善-->
<template>
  <div>
    <a-modal
      :title="referenceOptions.title"
      :width="960"
      :mask-closable="false"
      :visible="visible"
      :confirmLoading="confirmLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <div class="table-page-search-wrapper">
        <a-form class="demo-form-style">
          <a-row :gutter="24">
            <template v-for="(col, index) in referenceOptions.formList">
              <a-col
                :key="'form' + index"
                :md="8"
                :sm="24">
                <a-form-item
                  :label="col.name"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <template v-if="col.type === 'input'">
                    <a-input
                      v-model="queryParam[col.code]"
                      placeholder="" />
                  </template>
                  <template v-else-if="col.type === 'select'">
                    <a-select
                      v-model="queryParam[col.code]"
                      placeholder="请选择"
                      allowClear
                    >
                      <a-select-option
                        v-for="item in col.list"
                        :value="item.code"
                        :key="item.id"
                      >{{ item.name }}</a-select-option
                      >
                    </a-select>
                  </template>
                  <template v-else-if="col.type === 'date'">
                    <a-range-picker
                      v-model="queryParam[col.code]"
                      style="width: 100%"
                      :format="dateTimeFormat"
                      showTime
                    />
                  </template>
                </a-form-item>
              </a-col>
            </template>
            <a-form-item
              label=""
              :labelCol="labelColSm8"
              :wrapperCol="wrapperColSm16"
            >
              <a-input-search
                v-model="searchValue"
                placeholder="请输入关键字进行搜索"
                style="width: 50%"
                @search="onSearch"
              />
            </a-form-item>
          </a-row>
        </a-form>
      </div>
      <a-table
        :columns="referenceOptions.columns"
        :data-source="data"
        @change="onChange"
        :loading="listLoading"
        size='middle'
        simple
        :pagination="pagination"
        :row-selection="rowSelection"
        :scroll="{ x: 'max-content' }"
        :customRow="customRow"
        :row-key="rowKey"
      >
      </a-table>
    </a-modal>
  </div>
</template>
<script>
import { labelCol, wrapperCol, dateTimeFormat } from '@/utils/globalAttr'
import { isUndefined } from '@/utils/util'
import { clone } from 'lodash'
export default {
  name: 'ReferenceModal',
  props: {
    referenceOptions: {
      type: Object,
      required: true
    }
  },
  updated () {
  },
  data () {
    return {
      dateTimeFormat,
      // 分页数据
      page: {
        page: 1,
        size: 10,
        totalPages: 0
      },
      // 查询参数
      queryParam: {},
      listLoading: false,
      pagination: {
        showTotal: function (totalSize) {
          return '共 ' + totalSize + ' 条'
        },
        showSizeChanger: true,
        showQuickJumper: false,
        pageSizeOptions: ['10', '20', '50', '100']
      },
      // 排序信息
      sortInfo: [],
      data: [],
      typeList: [],
      labelCol,
      wrapperCol,
      visible: false,
      confirmLoading: false,
      records: [],
      rowSelection: {},
      rowKey: 'id',
      rowName: 'name',
      // 组件暂存参数
      referenceIds: [],
      referenceNames: [],
      time: null,
      filter_map: { source: '' }
    }
  },

  beforeDestroy () {
    this.time && clearTimeout(this.time)
  },
  created () {

  },

  methods: {
    onSearch (value) {
      this._renderList()
    },
    // 设置鼠标单机双击行方法
    customRow (record, index) {
      return {
        on: {
          // 鼠标单击行
          click: (event) => {
            // 如果有默认不能选中的则单击到不能选的行不能选中

            // 如果为多选框，单击未选中的选中，再单击取消
            if (this.referenceOptions.type === 'checkbox') {
              // 如果当前单击行已被选中则取消选中，否则选中当前行
              if (
                this.rowSelection.selectedRowKeys.indexOf(
                  record[this.rowKey]
                ) >= 0
              ) {
                const recordIndex = this.rowSelection.selectedRowKeys.indexOf(
                  record[this.rowKey]
                )

                this.rowSelection.selectedRowKeys.splice(recordIndex, 1)
                this.records.splice(recordIndex, 1)
                this.referenceIds.splice(recordIndex, 1)
                this.referenceNames.splice(recordIndex, 1)
              } else {
                this.rowSelection.selectedRowKeys.push(record[this.rowKey])
                this.records.push(record)
                this.referenceIds.push(record[this.rowKey])
                this.referenceNames.push(record[this.rowName])
              }
            } else {
              this.referenceIds = [record[this.rowKey]]
              this.referenceNames = [record[this.rowName]]
              this.rowSelection.selectedRowKeys = [record[this.rowKey]]
              this.records = [record]
            }
          },
          // 鼠标双击行,且必须是单选框才能双击提交
          dblclick: (event) => {
            if (this.referenceOptions.type === 'checkbox') {
              return
            }
            // 如果有默认不能选中的则单击到不能选的行不能选中
            if (
              this.referenceOptions.disabledRecords &&
              this.referenceOptions.disabledRecords.length > 0
            ) {
              if (
                this.referenceOptions.disabledRecords.indexOf(
                  record[this.rowKey]
                ) === -1
              ) {
                return
              }
            }
            this.visible = false
            this.records = [record]
            // eslint-disable-next-line vue/no-mutating-props
            this.referenceOptions.nameList = [record[this.rowName]]
            // eslint-disable-next-line vue/no-mutating-props
            this.referenceOptions.selections = [record[this.rowKey]]
            if (this.referenceOptions.callback) {
              this.referenceOptions.callback(this.records)
            } else {
              this.$emit('ok', this.records)
            }
          }
        }
      }
    },
    show () {
      this.page.page = 1
      if (this.referenceOptions.rowKey) {
        this.rowKey = this.referenceOptions.rowKey
      }
      if (this.referenceOptions.rowName) {
        this.rowName = this.referenceOptions.rowName
      }
      this.rowSelection = {
        type: this.referenceOptions.type,
        selectedRowKeys: [],
        onChange: (selectedRowKeys, selectedRows) => {
          if (this.referenceOptions.type === 'radio') {
            this.rowSelection.selectedRowKeys = selectedRowKeys
            this.referenceIds = selectedRowKeys
            this.referenceNames = [selectedRows[0][this.rowName]]
            this.records = selectedRows
          } else {
            for (let j = 0; j < this.data.length; j++) {
              for (let i = 0; i < this.records.length; i++) {
                if (
                  this.records[i][this.rowKey] === this.data[j][this.rowKey]
                ) {
                  this.records.splice(i, 1)
                  break
                }
              }
            }

            selectedRows.forEach((item) => {
              this.records.push(item)
            })
            const selectKeys = []
            const selectNames = []
            this.records.forEach((item) => {
              selectKeys.push(item[this.rowKey])
              selectNames.push(item[this.rowName])
            })
            this.rowSelection.selectedRowKeys = selectKeys
            this.referenceIds = selectKeys
            this.referenceNames = selectNames
          }
        },
        getCheckboxProps: (record) => ({
          props: {
            disabled: this._renderDisabled(record)
          }
        })
      }
      // 直接使用传过来的对象ID
      this._renderList()
      this.visible = true
    },
    onChange (pagination, filters, sorter) {
      // 设置当前分页
      this.page.page = pagination.current
      this.page.size = pagination.pageSize

      // 设置排序
      let curOrder = null
      if (sorter) {
        const direction = sorter.order === 'ascend' ? '0' : '1'
        for (var i = 0; i < this.sortInfo.length; i++) {
          if (this.sortInfo[i].property === sorter.field) {
            // 改变排序方向，从原来的列表中移除，重新加入排序第一顺位
            curOrder = this.sortInfo[i]
            curOrder.direction = direction
            this.sortInfo.splice(i, 1)
            break
          }
        }
        if (!curOrder) {
          curOrder = { property: sorter.field, direction: direction }
        }

        if (JSON.stringify(sorter) === '{}') {
          // sorter为空对象，说明清除当前排序
          this.sortInfo.splice(0, 1)
          if (!isUndefined(this.referenceOptions.sortInfo)) {
            this.sortInfo = clone(this.referenceOptions.sortInfo)
          }
        } else {
          // 加入排序
          this.sortInfo.splice(0, 0, curOrder)
        }
      }

      this._renderList()
    },
    _renderDisabled (record) {
      if (this.referenceOptions.disabledRecords) {
        for (let i = 0; i < this.referenceOptions.disabledRecords.length; i++) {
          if (
            this.referenceOptions.disabledRecords[i] === record[this.rowKey]
          ) {
            return true
          }
        }
      }
      return false
    },
    _renderList () {
      this.listLoading = true
      this.referenceOptions
        .renderlist(
          this.page.page,
          this.page.size,
          this.referenceOptions.renderParams.id,
          this.searchValue
        )
        .then((res) => {
          if (res.data.code !== 0) {
            this.$notification['error']({
              message: res.data.msg
            })
            this.listLoading = false
            return
          }
          const page = { ...this.pagination }
          page.total = res.data.count
          this.data = res.data.data
          this.listLoading = false
          this.pagination = page
        })
    },
    resetSearchForm () {
      this.queryParam = {}
    },
    async handleSubmit () {
      const _this = this

      if (this.referenceOptions.requiredValue && this.records.length === 0) {
        this.$notification['warning']({
          message: '必须选中至少一项!'
        })
        return
      }
      // eslint-disable-next-line vue/no-mutating-props
      this.referenceOptions.nameList = this.referenceNames
      // eslint-disable-next-line vue/no-mutating-props
      this.referenceOptions.selections = this.referenceIds
      const res = await this.referenceOptions.addUserAssociation(
        this.referenceOptions.renderParams.id,
        this.referenceIds,
        'post'
      ).then()
      if (res.data.code === 0) {
        const modal = this.$success({
          title: '操作成功',
          content: `${res.data.msg}`,
          closable: true,
          okText: '查看操作日志',
          okType: 'link',
          onOk: () => {
            // TODo 跳转操作日志
            this.referenceOptions.log(res.data)
          },
          onCancel () {
            this.visible = false
          }
        })
        _this.time = setTimeout(() => {
          modal.destroy()
        }, 3 * 1000)

        this.referenceOptions.callback(this.records)
      } else {
        this.visible = true
        this.$Message.error(res.data.msg)
      }
    },
    handleCancel () {
      this.visible = false
    },
    handleOk () {
      this._renderList()
    }

  }

}
</script>
