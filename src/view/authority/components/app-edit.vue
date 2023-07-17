<template>
  <Drawer v-model="modalData.show" :title="modalData.title" :mask-closable='false' width="750px;" draggable :footer-hide=true>

    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true>

      <FormItem label="应用名称" prop="name">
        <Input v-model="formValidate.name" maxlength="80" type="text" placeholder="请输入应用名称..."></Input>
      </FormItem>

      <FormItem label="服务编码" prop="app_code">
        <Input v-model="formValidate.app_code" maxlength="10" type="text" placeholder="请输入服务编码..."></Input>
      </FormItem>

      <!-- <FormItem label="管理员" prop="user_list">
        <Select class="search-input-long" maxlength="6666" v-model="formValidate.user_list" filterable multiple placeholder="请设置管理员">
          <Option v-for="item in allUser" :value="item.nickname" :key="item.nickname">{{item.username}}({{ item.nickname }})</Option>
        </Select>
      </FormItem> -->

      <FormItem label="跳转链接" prop="href">
        <Input v-model="formValidate.href" maxlength="250" type="text" placeholder="前端直接跳转地址..."></Input>
      </FormItem>

      <FormItem label="前端地址" prop="path">
        <Input v-model="formValidate.path" maxlength="250" type="text" placeholder="请输入前端地址..."></Input>
      </FormItem>

      <FormItem label="背景图片" prop="img">
        <Input v-model="formValidate.img" maxlength="200" type="text" placeholder="请输入应用背景图片地址..."></Input>
      </FormItem>
      <FormItem label="应用图标" prop="icon">
        <Input v-model="formValidate.icon" maxlength="200" type="text" placeholder="请输入图标编码..."></Input>
      </FormItem>

      <FormItem label="前端上线">
        <i-switch v-model="formValidate.is_up" size="large" true-color="#19be6b" true-value="yes" false-value="no">
          <span slot="yes">上线</span>
          <span slot="no">下线</span>
        </i-switch>
      </FormItem>

      <FormItem label="备注信息" prop="description">
        <Input v-model="formValidate.description" maxlength="200" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入备注信息..."></Input>
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
  name: 'appEdit',
  props: {
    modalData: {
      type: Object,
      default: {}
    },
    formValidate: {
      type: Object,
      default: {}
    }
    // allUser: {
    //   type: Object | Array,
    //   default: null
    // }
  },
  data () {
    return {
      btnLoading: false,
      ruleValidate: {
        name: [{ required: true, type: 'string', message: '应用名称不能为空', trigger: 'blur' }],
        app_code: [{ required: true, type: 'string', message: '服务编码不能为空', trigger: 'blur' }],
        description: [{ required: true, type: 'string', message: '备注信息不能为空', trigger: 'blur' }]
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
            this.$emit('handle-submit-app', this.formValidate, this.modalData.action)
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
