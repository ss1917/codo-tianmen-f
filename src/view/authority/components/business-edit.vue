<template>
  <div>
    <Drawer v-model="modalData.show" :title="modalData.title" width="850px" draggable :mask-closable='false' :footer-hide=true>
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">

        <template v-if="this.modalData.action">
          <FormItem label="租户ID" prop="tenantid">
            <Row :gutter="20">
              <Col :span="18">
               <Select class="search-input-long" v-model="formValidate.tenantid" filterable placeholder="请选择租户">
                  <Option v-for="item in tenantList" :value="item.tenantid" :label="item.name" :key="item.tenantid"></Option>
                </Select>
              </Col>
              <Col :span="4">
                <a @click="handleAddT">新增租户</a>
              </Col>
            </Row>
          </FormItem>
        </template>

        <FormItem label="业务ID" prop="biz_id">
          <Input v-model="formValidate.biz_id" :maxlength="10" placeholder='业务ID'></Input>
        </FormItem>

        <FormItem label="中文名" prop="biz_cn_name">
          <Input v-model="formValidate.biz_cn_name" :maxlength="20" placeholder='请输入业务中文名'></Input>
        </FormItem>
        <FormItem label="英文名" prop="biz_en_name">
          <Input v-model="formValidate.biz_en_name" :maxlength="20" placeholder='请输入业务英文名'></Input>
        </FormItem>

        <FormItem label="业务实体" prop="corporate">
          <Input v-model="formValidate.corporate" :maxlength="25" placeholder='关联公司实体信息'></Input>
        </FormItem>

        <FormItem label="管理员" prop="maintainer">
          <Select class="search-input-long" maxlength="500" v-model="formValidate.maintainer" filterable multiple :max-tag-count="1"  placeholder="请选择业务角色">
            <Option v-for="item in roleList" :value="item.id" :label="item.role_name" :key="item.id"></Option>
          </Select>
        </FormItem>

         <FormItem label="运维人员" prop="biz_sre">
          <Select class="search-input-long" maxlength="500" v-model="formValidate.biz_sre" filterable multiple :max-tag-count="1" placeholder="请选择业务角色">
            <Option v-for="item in roleList" :value="item.id" :label="item.role_name" :key="item.id"></Option>
          </Select>
        </FormItem>

        <FormItem label="开发人员" prop="biz_developer">
          <Select class="search-input-long" maxlength="500" v-model="formValidate.biz_developer" filterable multiple :max-tag-count="1" placeholder="请选择业务角色">
            <Option v-for="item in roleList" :value="item.id" :label="item.role_name" :key="item.id"></Option>
          </Select>
        </FormItem>

        <FormItem label="测试人员" prop="biz_tester">
           <Select class="search-input-long" maxlength="500" v-model="formValidate.biz_tester" filterable multiple :max-tag-count="1" placeholder="请选择业务角色">
            <Option v-for="item in roleList" :value="item.id" :label="item.role_name" :key="item.id"></Option>
          </Select>
        </FormItem>

        <FormItem label="产品运营" prop="biz_pm">
           <Select class="search-input-long" maxlength="500" v-model="formValidate.biz_pm" filterable multiple :max-tag-count="1" placeholder="请选择业务角色">
            <Option v-for="item in roleList" :value="item.id" :label="item.role_name" :key="item.id"></Option>
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

        <FormItem label="排序">
          <InputNumber :max="1000" :min="5" v-model="formValidate.sort"></InputNumber>
        </FormItem>
        <FormItem label="备注信息">
          <Input v-model="formValidate.description" :maxlength="200" type="textarea"  placeholder='请输入备注信息'></Input>
        </FormItem>

        <FormItem>
          <Button type="primary" :loading="btnLoading" @click="handleSubmit('formValidate')">提交</Button>
          <Button @click="handleCancel" style="margin-left: 8px">取消</Button>
        </FormItem>
      </Form>
    </Drawer>

    <Modal v-model="showModal" title="新增租户" :styles="{ top: '30px' }" :footer-hide="true">
      <Form ref="formValidate2" :model="formValidate2" :rules="ruleValidate2" :label-width="80">
        <FormItem label="租户名称" prop="name">
          <Input v-model="formValidate2.name" maxlength="20" placeholder="租户名称"></Input>
        </FormItem>
        <FormItem label="展示排序" prop="sort">
          <InputNumber :max="300" :min="10" v-model="formValidate2.sort"></InputNumber>
        </FormItem>

        <FormItem label="描述信息" prop="description">
          <Input v-model="formValidate2.description" maxlength="20" placeholder="描述信息"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSave('formValidate2')">保存</Button>
          <Button style="margin-left: 8px" @click="handleCancel2">取消</Button>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
export default {
  name: 'businessEdit',
  props: {
    modalData: {
      type: Object,
      default: { }
    },
  },
  data () {
    return {
      btnLoading: false,
      showModal: false,
      tenantList: [],
      roleList: [],
      formValidate2: {
        sort: 100
      },
      ruleValidate2: {
        name: [
          { required: true, message: '不能为空', trigger: 'blur' },
        ],
      },
      formValidate: {},
      ruleValidate: {
        biz_cn_name: [
          { required: true, message: '业务中文名不能为空', trigger: 'blur' },
        ],
        biz_en_name: [
          { required: true, message: '业务英文名不能为空', trigger: 'blur' }
        ],
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
          }, 300)
        } else {
          this.$Message.error('表单验证失败')
        }
      })
    },

    handleAddT () {
      this.showModal = true
    },
    handleSave (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          setTimeout(() => {
            this.$emit('save-data-t', this.formValidate2)
          }, 1000)
        } else {
          this.$Message.error('表单校验不通过!');
        }
      })
    },
    handleCancel2 () {
      this.showModal = false
    },
  },
  watch: {
  }

}
</script>
