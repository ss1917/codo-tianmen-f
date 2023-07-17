<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="750px;" draggable  :footer-hide=true>
  
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true >

        <FormItem label="角色名称" prop="role_name">
          <Input v-model="formValidate.role_name" maxlength="20" type="text"  placeholder="请输入角色名称..."></Input>
        </FormItem>

        <!-- <FormItem label="应用编码" prop="app_code">
          <Input v-model="formValidate.app_code" maxlength="30" type="text"  placeholder="请输入应用编码..."></Input>
        </FormItem> -->

        <FormItem label="备注信息" prop="details">
          <Input v-model="formValidate.details" maxlength="200"  type="textarea" :autosize="{minRows: 2,maxRows: 5}"  placeholder="请输入备注信息..."></Input>
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
  name: 'roleEdit',
  props: {
    modalData: {
        type :Object,
        default: {}
    },
    formValidate: {
        type :Object,
        default: {}
    }
  },
  data () {
    return {
      btnLoading: false,
        ruleValidate: {
          role_name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
          // app_code: [{ required: true, message: '应用编码不能为空', trigger: 'blur' }],
          details: [{ required: true, message: '备注信息不能为空', trigger: 'blur' }]
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
              this.$emit('handle-submit-role',this.formValidate, this.modalData.action)
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