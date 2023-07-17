<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="60%" draggable :mask-closable="false" :footer-hide=true>

    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" :label-colon=true>

      <FormItem label="协议" prop="protocol">
        <Select v-model="formValidate.protocol" placeholder="请选择协议">
          <Option v-for="item in protocolOptions" :key="item.value" :label="item.label" :value="item.value"></Option>
        </Select>
      </FormItem>

      <FormItem label="路由前缀" prop="prefix">
        <Input v-model="formValidate.prefix" maxlength="50" type="text" placeholder="请输入路由前缀..."></Input>
      </FormItem>

      <FormItem label="服务" prop="service_name">
        <Input v-model="formValidate.service_name" maxlength="15" type="text" placeholder="请填写服务编码..."></Input>
      </FormItem>

      <FormItem label="是否启用">
        <i-switch v-model="formValidate.status" size="large" true-color="#19be6b" :true-value=1 :false-value=0>
          <span slot="open">开启</span>
          <span slot="close">禁用</span>
        </i-switch>
      </FormItem>

      <FormItem label="plugins" prop="plugins">
        <Select v-model="formValidate.plugins" filterable multiple transfer placeholder="请选择">
          <Option v-for="item in pluginList" :key="item.value" :label="item.label" :value="item.value"></Option>
        </Select>
      </FormItem>

      <FormItem label="参数" prop="propsData">
        <vue-json-editor v-model="formValidate.propsData" :show-btns="false" lang="zh" :mode="'code'" :expandedOnStart="false" @json-change="onJsonChange" @has-error="onJsonError"></vue-json-editor>
      </FormItem>

      <FormItem label="说明信息" prop="remark">
        <Input v-model="formValidate.remark" maxlength="100" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入说明信息..."></Input>
      </FormItem>

      <FormItem>
        <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">提交</Button>
        <Button @click="handlerReset('formValidate')" style="margin-left: 8px">重置</Button>
      </FormItem>
    </Form>

  </Drawer>
</template>

<script>
import { isJsonObj } from '@/libs/validate'
import vueJsonEditor from 'vue-json-editor'
export default {
  components: { vueJsonEditor },
  name: 'routeEdit',
  props: {
    modalData: {
      type: Object,
      default: {}
    },
    formValidate: {
      type: Object,
      default: {}
    },
    pluginList: {
      type: Array,
      default: []
    }
  },
  data () {
    const validatePropsData = (rule, value, callback) => {
      const propsData = JSON.stringify(value)
      if (propsData) {
        if (isJsonObj(propsData)) {
          callback()
        } else {
          console.log('not json string: ', propsData)
          callback(new Error('请检查参数格式，必须是 json object'))
        }
      } else {
        callback()
      }
    }
    return {
      mode_type: 'json',
      editor: {
        title: '编辑',
        read: false,
        color: "primary"
      },
      protocolOptions: [{
        value: 'http',
        label: 'http'
      },
      {
        value: 'grpc',
        label: 'grpc'
      }],
      thatPropsData: {},
      btnLoading: false,
      ruleValidate: {
        func_name: [{ required: true, message: 'The  name cannot be empty', trigger: 'blur' }],
        prefix: [{ required: true, message: '路由前缀不能为空', trigger: 'blur' }],
        service_name: [{ required: true, message: '所在服务不能为空', trigger: 'blur' }],
        protocol: [{ required: true, message: '请输入路由前缀', trigger: 'blur' }],
        propsData: [{ validator: validatePropsData, trigger: 'blur' }],
      }
    }
  },
  methods: {
    handleCancel () {
      this.$emit('modal-close')
    },

    handleSubmit (name) {
      this.formValidate.props = this.formValidate.propsData
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          setTimeout(() => {
            this.$emit('handle-submit-route', this.formValidate, this.modalData.action)
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
    onJsonChange (value) {
      //  this.formValidate.propsData = JSON.stringify(value)
    },
    onJsonError () {
      this.$Message.error(`参数格式出错`)
    },
  },
}
</script>

<style>
.jsoneditor-poweredBy {
  display: none;
}
</style>