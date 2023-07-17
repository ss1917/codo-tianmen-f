<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="750px;" draggable  :footer-hide=true>

      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true >

        <FormItem label="角色名称" prop="role_name">
          <Input v-model="formValidate.role_name" maxlength="20" type="text" readonly placeholder="请输入角色名称..."></Input>
        </FormItem>

        <FormItem label="关联用户" prop="user_list">
          <Select class="search-input-long" maxlength="30000" v-model="formValidate.user_list" filterable multiple :max-tag-count="500" placeholder="请选择关联的用户">
            <Option v-for="item in allUserList" :value="item.id" :key="item.id" :label="item.username + '(' + item.nickname + ')'"></Option>
          </Select>
        </FormItem>

        <FormItem label="关联角色">
          <Select class="search-input-long" maxlength="500" v-model="formValidate.role_list" filterable multiple :max-tag-count="5" placeholder="请选择关联">
            <Option v-for="item in baseRoleList" :value="item.id" :key="item.id" :label="item.role_name"></Option>
          </Select>
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
  name: 'roleUserEdit',
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
      allUserList: [],
      baseRoleList: [],
    // formValidate: {},
      btnLoading: false,
        ruleValidate: {
          role_name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        }
    }
  },
  methods: {
    handleCancel () {
      this.$emit('close')
    },

    handleSubmit (name) {
      if (this.formValidate.role_list && this.formValidate.role_list.length > 10) {
          this.$Message.error('不能关联超过10个角色');
         return
      }
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
