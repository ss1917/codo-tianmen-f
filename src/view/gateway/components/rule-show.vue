<template>
  <Drawer v-model="modalData.show" :title="modalData.title" style="background-color: #f8f8f9" width="500px;" draggable :footer-hide=true>
    <Table size="small" :columns="columnsRule" :data="ruleData"></Table>
  </Drawer>
</template>

<script>
export default {
  name: 'ruleShow',
  props: {
    modalData: {
      type: Object,
      default: {}
    },
    ruleData: {
      type: Array | Object,
      default: []
    }
  },
  data () {
    return {
      columnsRule: [
        // {
        //   title: '服务编码',
        //   key: 'app_code',
        //   minWidth: 120, 
        //   maxWidth: 180,
        //   sortable: true
        // },
        // {
        //   title: '请求',
        //   key: 'action',
        //   minWidth: 110
        // },
        {
          title: '用户ID',
          key: 'user_id',
          minWidth: 120
        },
        {
          title: '状态',
          key: 'handle',
          width: 90,
          render: (h, params) => {
            let status = params.row.status
            if (status === "y") {
              return h('div', [
                h('Tag', { props: { color: 'green' } }, 'up')
              ])
            } else {
              return h('div', [
                h('Tag', { props: { color: 'orange' } }, 'down')
              ])
            }
          }
        }
      ]
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
            this.$emit('handle-submit-service', this.formValidate, this.modalData.action)
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
  },
}
</script>