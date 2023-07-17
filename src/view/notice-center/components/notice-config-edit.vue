<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="850px;" draggable  :footer-hide=true>
  
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true >

        <FormItem label="名称" prop="name">
          <Input v-model="formValidate.name" maxlength="40" type="text"  placeholder="请输入名称..."></Input>
        </FormItem>

         <FormItem label="索引" prop="key">
          <Input v-model="formValidate.key" maxlength="40" type="text"  placeholder="请输入索引..."></Input>
        </FormItem>
        
        <FormItem label="配置字典" prop="conf_map">
          <Input v-model="formValidate.conf_map" maxlength="9999"  type="textarea" :autosize="{minRows: 2, maxRows: 3}"  placeholder="请输入备注信息..."></Input>
        </FormItem>

        <FormItem label="是否启用">
          <i-switch v-model="formValidate.status"  true-color="#19be6b"  size="large" true-value="0" false-value="20">
              <span slot="open">启用</span>
              <span slot="close">禁用</span>
          </i-switch>
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
  name: 'noticeConfigEdit',
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
        name: [{ required: true, type: 'string', message: '名称不能为空', trigger: 'blur' }],
        key: [{ required: true, type: 'string', message: 'key不能为空', trigger: 'blur' }],
        conf_map: [{ required: true, message: '配置不能为空', trigger: 'blur' }]
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
              this.$emit('submit-notice-conf',this.formValidate, this.modalData.action)
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