<template>
  <Drawer v-model="modalData.show" :title="modalData.title" :mask-closable="false" width="850px;" @on-close="handleCancel" :footer-hide=true>

      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true >

        <FormItem label="角色名称" prop="role_name">
          <Input v-model="formValidate.role_name" maxlength="20" type="text"  placeholder="请输入角色名称..."></Input>
        </FormItem>

        <FormItem label="角色类型" prop="role_type">
          <RadioGroup v-model="formValidate.role_type">
              <Radio label="normal">普通</Radio>
              <Radio label="base">基础</Radio>
          </RadioGroup>
        </FormItem>


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
    }
  },
  data () {
    return {
      allUserList: [],
      formValidate: {},
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
      this.$emit('close')
    },

    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            setTimeout(() => {
              this.$emit('save-data',this.formValidate, this.modalData.action)
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
