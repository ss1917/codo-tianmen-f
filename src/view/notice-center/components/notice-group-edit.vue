<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="950px;" draggable  :footer-hide=true>

      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true >

        <FormItem label="通知组名" prop="name">
          <Input v-model="formValidate.name" maxlength="40" type="text"  placeholder="请输入名称..."></Input>
        </FormItem>

        <FormItem label="通知用户" prop="user_list">
          <Select class="search-input-long" maxlength="6666" v-model="formValidate.user_list" filterable multiple placeholder="请选择关联的用户">
            <Option v-for="item in allUser" :value="item.nickname" :key="item.user_id" :label="item.username + '(' + item.nickname + ')'"></Option>
          </Select>
        </FormItem>

        <FormItem label="备注信息" prop="remark">
          <Input v-model="formValidate.remark" maxlength="120"  type="textarea" :autosize="{minRows: 2,maxRows: 3}"  placeholder="请输入备注信息..."></Input>
        </FormItem>

        <FormItem>
          <Button type="primary" :loading="btnLoading"  @click="handleSubmit('formValidate')">提交</Button>
          <Button @click="handlerReset('formValidate')" style="margin-left: 8px">重置</Button>
        </FormItem>
    </Form>

  </Drawer>
</template>

<script>
export default {
  name: 'noticeGroupEdit',
  props: {
    modalData: {
      type :Object,
      default: {}
    },
    formValidate: {
      type :Object,
      default: {}
    },
    allUser: {
      type :Array,
      default: []
    }
  },
  data () {
    return {
      btnLoading: false,
      ruleValidate: {
        name: [{ required: true, type: 'string', message: '名称不能为空', trigger: 'blur' }],
        user_list: [{ type: 'array', message: '通知用户不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleCancel () {
      this.$emit('modal-close')
    },

    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            setTimeout(() => {
              this.$emit('submit-notice-group',this.formValidate, this.modalData.action)
              this.btnLoading = false
              }, 500)
          } else {
              this.$Message.error('表单校验不通过!');
          }
      })
    },
    handlerReset (name) {
        this.$refs[name].resetFields();
    }
  },
}
</script>
