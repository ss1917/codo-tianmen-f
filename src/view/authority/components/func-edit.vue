<template>
  <Drawer v-model="modalData.show" :title="modalData.title" width="850px;" draggable :mask-closable="false"  @on-close="handleCancel" :footer-hide=true>

    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true>

      <FormItem label="服务编码" prop="app_code">
        <template v-if="app_code">
          <Input v-model="formValidate.app_code" maxlength="25" type="text" readonly placeholder="应用编码..."></Input>
        </template>
        <template v-else>
          <Select v-model="formValidate.app_code" filterable clearable placeholder="请选择所属应用">
            <template>
              <Option  v-for="item in app_list" :value="item.app_code" :key="item.id" >{{item.app_name}} {{item.app_code}}</Option>
            </template>
          </Select>
        </template>
      </FormItem>

      <FormItem label="权限名称" prop="func_name">
        <Input v-model="formValidate.func_name" maxlength="50" type="text" placeholder="请输入权限名称..."></Input>
      </FormItem>

      <FormItem label="请求方法" prop="method_type">
        <Select v-model="formValidate.method_type" placeholder="请求方法">
          <template >
            <Option v-for="method in methodsList" :value="method" :label="method" :key="method" ></Option>
          </template>
        </Select>
      </FormItem>

      <FormItem label="请求路径" prop="uri">
        <Input v-model="formValidate.uri" maxlength="180" type="text" placeholder="请输入API的uri路径..."></Input>
      </FormItem>

      <FormItem label="用法、参数" prop="parameters">
        <editor v-model="formValidate.parameters" @init="editorInit" :mode_type="mode_type" :read="editor.read" :editorHeight=450 :key="`${_uid}`"></editor>
      </FormItem>
      <FormItem>
        <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">提交</Button>
        <Button @click="handleCancel()" style="margin-left: 8px">取消</Button>
      </FormItem>
    </Form>

  </Drawer>
</template>

<script>
import editor from '@/components/editor/editor-v2'
export default {
  components: { editor },
  name: 'funcEdit',
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
      mode_type: 'json',
      editor: {
        title: '编辑',
        read: false,
        color: "primary"
      },
      methodsList: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'ALL'],
      btnLoading: false,
      ruleValidate: {
        func_name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
        app_code: [{ required: true, message: '所在应用不能为空', trigger: 'blur' }],
        // uri: [{ required: true, message: 'URI不能为空', trigger: 'blur' }],
        method_type: [{ required: true, message: 'Cannot be empty', trigger: 'blur' }],
        uri: [{ required: true, message: 'URI不能为空', trigger: 'blur' }]
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
          this.$Message.error('表单校验不通过!');
        }
      })
    },
    handlerReset (name) {
      this.$refs[name].resetFields();
    },
    //
    editorInit: function () {
      require(`brace/mode/${this.mode_type}`)    //language
      require(`brace/mode/json`)    //language
      require(`brace/mode/python`)
      require('brace/theme/terminal')
      require('brace/theme/xcode')
    },
  },
  mounted () {
  }
}
</script>
