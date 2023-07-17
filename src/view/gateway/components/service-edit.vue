<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="700px" draggable :mask-closable="false" :footer-hide=true>

    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true>

      <FormItem label="服务名" prop="service_name">
        <Input v-model="formValidate.service_name" maxlength="15" type="text" placeholder="请输入服务名..."></Input>
      </FormItem>

      <FormItem label="upstream" prop="upstream">
        <Input v-model="formValidate.upstream" maxlength="50" type="text" placeholder="请输入upstream..."></Input>
      </FormItem>

      <FormItem label="权重" prop="weight">
        <InputNumber :max="100" :min="1" v-model="formValidate.weight" placeholder="" />
      </FormItem>

      <FormItem label="是否启用">
        <i-switch v-model="formValidate.status" size="large" true-color="#19be6b" :true-value=1 :false-value=0>
          <span slot="open">启用</span>
          <span slot="close">禁用</span>
        </i-switch>
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
  name: 'serviceEdit',
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
        upstream: [{ required: true, message: 'The upstream cannot be empty', trigger: 'blur' }],
        service_name: [{ required: true, message: '所在服务/应用不能为空', trigger: 'blur' }]
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
            this.$emit('handle-submit-service', this.formValidate, this.modalData.action)
            this.btnLoading = false
          }, 500)
        } else {
          this.$Message.error('表单校验不通过!');
        }
      })
    },
    handlerReset (name) {
      this.$refs[name].resetFields();
    },
  },
}
</script>