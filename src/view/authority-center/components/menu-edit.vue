<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="750px;" draggable :footer-hide=true>

    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true>

      <FormItem label="菜单名称" prop="menu_name">
        <Input v-model="formValidate.menu_name" maxlength="80" type="text" placeholder="请输入菜单名称..."></Input>
      </FormItem>

      <FormItem label="服务编码" prop="app_code">
        <template v-if="app_code">
          <Input v-model="formValidate.app_code" maxlength="25" type="text" readonly placeholder="应用编码..."></Input>
        </template>
        <template v-else>
          <Select v-model="formValidate.app_code" filterable clearable placeholder="请选择所属应用">
            <template v-for="item in app_list">
              <Option :value="item.app_code">{{item.app_name}} {{item.app_code}}</Option>
            </template>
          </Select>
        </template>
      </FormItem>

      <FormItem label="备注信息" prop="details">
        <Input v-model="formValidate.details" maxlength="200" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入备注信息..."></Input>
      </FormItem>

      <FormItem>
        <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">提交</Button>
        <Button @click="handleCancel()" style="margin-left: 8px">取消</Button>
      </FormItem>
    </Form>

  </Drawer>
</template>

<script>
export default {
  name: 'menuEdit',
  props: {
    modalData: {
      type: Object,
      default: {}
    },
    formValidate: {
      type: Object,
      default: {}
    },
    app_list: {
      type: Array,
      default: []
    },
    app_code: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      btnLoading: false,
      ruleValidate: {
        menu_name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
        app_code: [{ required: true, message: '服务编码不能为空', trigger: 'blur' }],
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
            this.$emit('handle-submit-menu', this.formValidate, this.modalData.action)
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