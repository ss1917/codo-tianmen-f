<template>
  <Drawer v-model="modalData.show" :title="modalData.title" width="750px;" draggable :mask-closable='false' :footer-hide=true>

    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true>

      <FormItem label="名称" prop="name">
        <Input v-model="formValidate.name" maxlength="80" type="text" placeholder="请输入..."></Input>
      </FormItem>

      <FormItem label="认证地址" prop="login_url">
        <Input v-model="formValidate.login_url" maxlength="250" type="text" placeholder="请输入..."></Input>
      </FormItem>

      <FormItem label="真实地址" prop="real_url">
        <Input v-model="formValidate.real_url" maxlength="250" type="text" placeholder="请输入..."></Input>
      </FormItem>

      <FormItem label="client_id" prop="client_id">
        <Input v-model="formValidate.client_id" maxlength="200" type="text" placeholder="请输入...."></Input>
      </FormItem>

      <FormItem>
        <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">提交</Button>
        <Button @click="handlerReset('formValidate')" style="margin-left: 8px">重置</Button>
      </FormItem>
    </Form>

  </Drawer>
</template>

<script>
export default {
  name: 'linkEdit',
  props: {
    modalData: {
      type: Object,
      default: {}
    },
    formValidate: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      btnLoading: false,
      ruleValidate: {
        name: [{ required: true, type: 'string', message: '名称不能为空', trigger: 'blur' }],
        login_url: [{ required: true, type: 'string', message: '不能为空', trigger: 'blur' }],
        real_url: [{ required: true, type: 'string', message: '不能为空', trigger: 'blur' }],
        client_id: [{ required: true, type: 'string', message: '不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleCancel () {
      this.$emit('close')
    },

    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          setTimeout(() => {
            this.$emit('save-data', this.formValidate, this.modalData.action)
            this.btnLoading = false
          }, 500)
        } else {
          this.$Message.error('表单校验不通过!')
        }
      })
    },
    handlerReset (name) {
      this.$refs[name].resetFields()
    }
  }
}
</script>
