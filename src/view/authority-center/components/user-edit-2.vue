<template>
  <div>
    <Drawer v-model="modalData.show" @on-close='handleCancel' :title="modalData.title" width="750px;" draggable :footer-hide=true>

      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120" :label-colon=true>

        <FormItem label="账户名称" prop="username">
          <template v-if="modalData.action == 'put'">
            <Input v-model="formValidate.username" maxlength="50" type="text" readonly></Input>
          </template>
          <template v-else>
            <Input v-model="formValidate.username" maxlength="50" type="text"></Input>
          </template>
        </FormItem>

        <FormItem label="用户姓名" prop="nickname">
          <Input v-model="formValidate.nickname" maxlength="50" type="text"></Input>
        </FormItem>

        <FormItem label="部门" prop="department">
          <Input v-model="formValidate.department" maxlength="255" type="text"></Input>
        </FormItem>

        <FormItem label="手机号码" prop="tel">
          <Input v-model="formValidate.tel" maxlength="18" type="text"></Input>
        </FormItem>

        <FormItem label="邮箱" prop="email">
          <Input v-model="formValidate.email" maxlength="80" type="text"></Input>
        </FormItem>

        <FormItem label="启用令牌">
          <i-switch v-model="formValidate.have_token" true-color="#19be6b" size="large" true-value="yes" false-value="no">
            <span>启用</span>
            <span>禁用</span>
          </i-switch>
        </FormItem>
        <FormItem label="是否启用">
          <i-switch v-model="formValidate.status" true-color="#19be6b" size="large" true-value="0" false-value="20">
            <span>启用</span>
            <span>禁用</span>
          </i-switch>
        </FormItem>

        <FormItem>
          <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">保存</Button>
          <Button @click="handlerReset('formValidate')" style="margin-left: 15px">重置</Button>
        </FormItem>
      </Form>

    </Drawer>

  </div>
</template>
<script>
export default {
  name: 'userEdit',
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
      newargs_items: [],
      btnLoading: false,
      ruleValidate: {
        username: [{ required: true, message: '账户名称不能为空。。。', trigger: 'blur' }],
        nickname: [{ required: true, message: '用户姓名不能为空。。。', trigger: 'blur' }],
        department: [{ required: true, message: '部门不能为空。。。', trigger: 'blur' }],
        wechat: [{ required: true, message: '微信不能为空。。。', trigger: 'blur' }],
        tel: [{ required: true, type: 'string', min: 11, max: 11, message: '手机号不能为空且必须为手机号码', trigger: 'blur' }],
        email: [{ required: true, message: '邮箱不能为空。。。', trigger: 'blur' },
        { type: 'email', message: '必须为邮箱格式', trigger: 'blur' }],
      }
    }
  },
  methods: {
    handleCancel () {
      this.$emit('drawer-close')
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          setTimeout(() => {
            this.$emit('save-data', this.formValidate, this.modalData.action)
            this.btnLoading = false
          }, 1000)
        } else {
          this.$Message.error('表单校验不通过!');
          this.btnLoading = false
        }
      })
    },
    handlerReset (name) {
      this.$refs[name].resetFields();
    }
  },
  watch: {
  },
  mounted () {
  }

}
</script>
