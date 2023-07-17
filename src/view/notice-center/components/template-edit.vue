<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="65%" draggable :mask-closable=false :footer-hide=true>

    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="85" :label-colon=true>

      <FormItem label="模板名称" prop="name">
        <Input v-model="formValidate.name" maxlength="40" type="text" placeholder="请输入名称..."></Input>
      </FormItem>

      <FormItem label="通知类型" prop="way">
        <Select maxlength="25" v-model="formValidate.way" filterable placeholder="请选择通知类型">
          <Option v-for="item in noticeWay" :value="item.value" :key="item.value">{{item.lable}}</Option>
        </Select>
      </FormItem>

      <Row :gutter="50">
        <Col span="9">
        <FormItem label="次数/分钟" prop="silence">
          <InputNumber v-model="formValidate.silence" maxlength="5" :max="180" :min="1" type="text" placeholder="次数..."></InputNumber>
        </FormItem>
        </Col>
        <Col span="15">
        <Alert show-icon>使用令牌桶限流，桶最大容量为5（最高并发），这里设置速率限制（分钟/次）</Alert>
        </Col>
      </Row>

      <FormItem label="通知配置">
        <Input v-model="formValidate.notice_conf" maxlength="255" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="通知配置..."></Input>
      </FormItem>

      <FormItem label="通知模板">
        <Input v-model="formValidate.msg_template" maxlength="5000" type="textarea" :autosize="{minRows: 3,maxRows: 10}" placeholder="通知模板..."></Input>
      </FormItem>

      <FormItem label="测试数据" prop="test_msg">
        <Input v-model="formValidate.test_msg" maxlength="5000" type="textarea" :autosize="{minRows: 5,maxRows: 15}"></Input>
      </FormItem>

      <FormItem label="通知用户">
        <Select class="search-input-long" maxlength="255" v-model="formValidate.user_list" filterable multiple placeholder="请选择关联的用户">
          <Option v-for="item in allUser" :value="item.nickname" :key="item.user_id" :label="item.username + '(' + item.nickname + ')'"></Option>
        </Select>
      </FormItem>
      <FormItem label="通知组">
        <Select class="search-input-long" maxlength="255" v-model="formValidate.notice_group" filterable multiple placeholder="请选择关联的通知组">
          <Option v-for="item in noticeGroup" :value="item.name" :key="item.id" :label="item.name"></Option>
        </Select>
      </FormItem>

      <FormItem label="备注信息" prop="remark">
        <Input v-model="formValidate.remark" maxlength="120" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入备注信息..."></Input>
      </FormItem>

      <FormItem>
        <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">提交</Button>
        <Button @click="handleCancel()" style="margin-left: 8px">取消</Button>
        <!-- <Button @click="handlerReset('formValidate')" style="margin-left: 8px">重置</Button> -->
      </FormItem>
    </Form>

  </Drawer>
</template>

<script>
import { isJsonObj } from '@/libs/validate'
export default {
  name: 'templateEdit',
  props: {
    modalData: {
      type: Object,
      default: {}
    },
    formValidate: {
      type: Object,
      default: {}
    },
    allUser: {
      type: Array,
      default: []
    },
    noticeGroup: {
      type: Array,
      default: []
    },
    noticeWay: {
      type: Array,
      default: ['sms', 'email'],
    }
    //
  },
  data () {
    const validateJsonData = (rule, value, callback) => {
      if (value) {
        if (isJsonObj(value)) {
          callback()
        } else {
          console.log('not json string: ', value)
          callback(new Error('请检查参数格式，必须是 json 格式'))
        }
      } else {
        callback()
      }
    }
    return {
      btnLoading: false,
      ruleValidate: {
        name: [{ required: true, type: 'string', message: '名称不能为空', trigger: 'blur' }],
        notice_conf: [{ required: true, type: 'string', message: '通知配置不能为空', trigger: 'blur' }],
        msg_template: [{ required: true, type: 'string', message: '通知模板不能为空', trigger: 'blur' }],
        test_msg: [{ required: true, type: 'string', message: '测试数据不能为空', trigger: 'blur' },
        { validator: validateJsonData, trigger: 'blur' }],
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
            this.$emit('handle-submit-notice', this.formValidate, this.modalData.action)
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
