<template>
  <div>
    <Drawer v-model="modalData.show" :title="modalData.title" width="850px" draggable :footer-hide=true>
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">

        <Alert type="info" closable>
          <p>为了安全起见，只有管理员可以进行添加，修改操作</p>
        </Alert>

        <!-- <template v-if="this.modalData.action">
          <FormItem label="租户ID" prop="business_id">
            <Input v-model="formValidate.business_id" :maxlength="25" placeholder='租户ID'></Input>
          </FormItem>
        </template> -->

        <FormItem label="名称" prop="resource_group">
          <Input v-model="formValidate.resource_group" :maxlength="25" placeholder='请输入显示名称，一般代表资源组和租户'></Input>
        </FormItem>

        <FormItem label="业务中文名" prop="business_zh">
          <Input v-model="formValidate.business_zh" :maxlength="25" placeholder='请输入业务中文名'></Input>
        </FormItem>
        <FormItem label="业务英文名" prop="business_en">
          <Input v-model="formValidate.business_en" :maxlength="25" placeholder='请输入业务英文名'></Input>
        </FormItem>

        <FormItem label="业务实体" prop="corporate">
          <Input v-model="formValidate.corporate" :maxlength="25" placeholder='业务公司实体信息'></Input>
        </FormItem>

        <FormItem label="业务人员" prop="maintainer">
          <Select class="search-input-long" maxlength="65500" v-model="formValidate.maintainer" filterable multiple placeholder="请选择业务用户">
            <Option v-for="item in userList" :value="item.username" :key="item.user_id">{{item.username}}({{ item.nickname }})</Option>
          </Select>
        </FormItem>

        <FormItem label="生命周期" prop="life_cycle">
          <Select v-model="formValidate.life_cycle" placeholder="生命周期">
            <Option value="开发中">开发中</Option>
            <Option value="测试中">测试中</Option>
            <Option value="已上线">已上线</Option>
            <Option value="停运">停运</Option>
          </Select>
        </FormItem>

        <FormItem label="排序" prop="sort">
          <InputNumber :max="1000" :min="1" v-model="formValidate.sort"></InputNumber>
        </FormItem>
        <FormItem label="备注信息">
          <Input v-model="formValidate.description" :maxlength="200" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder='请输入备注信息'></Input>
        </FormItem>

        <FormItem>
          <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">提交</Button>
          <Button @click="handleCancel" style="margin-left: 8px">取消</Button>
        </FormItem>
      </Form>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: 'businessEdit',
  props: {
    modalData: {
      type: Object,
      default: () => { }
    },
    formData: {
      type: Object | Array,
      default: () => { }
    },
    userList: {
      type: Object | Array,
      default: () => []
    }
  },
  data () {
    return {
      btnLoading: false,
      formValidate: {},
      ruleValidate: {
        business_zh: [
          { required: true, message: '业务中文名不能为空', trigger: 'blur' },
          { type: 'string', max: 28, message: '超出最大长度', trigger: 'blur' }
        ],
        business_en: [
          { required: true, message: '业务英文名不能为空', trigger: 'blur' },
          { type: 'string', max: 28, message: '超出最大长度', trigger: 'blur' }
        ],
        resource_group: [
          { required: true, message: '资源组名称不能为空', trigger: 'blur' },
          { type: 'string', max: 20, message: '超出最大长度', trigger: 'blur' }
        ]
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
            this.$emit('save-data', this.formValidate, this.modalData.action)
            this.btnLoading = false
          }, 300)
        } else {
          this.$Message.error('表单验证失败')
        }
      })
    }
  },
  watch: {
    formData (value) {
      this.formValidate = JSON.parse(JSON.stringify(value))
    }
  }

}
</script>
