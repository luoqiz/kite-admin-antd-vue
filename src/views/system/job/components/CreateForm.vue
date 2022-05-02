<template>
  <a-modal
      :destroy-on-close="true"
      :mask-closable="false"
      title="新增"
      :visible="visible"
      :onCancel="onCancel"
      width=86%
  >
    <template #footer>
      <a-button key="back" @click="() => onCancel()">取消</a-button>
      <a-button key="submit" type="primary" :loading="onSubmitLoading" @click="onFinish">提交</a-button>
    </template>

    <a-form :labelCol="{ span: 4 }" :wrapper-col="{span:20}">

<!--      <a-form-item label="ID" v-bind="validateInfos.jobId">-->
<!--        <a-input-number v-model:value="modelRef.jobId"/>-->
<!--      </a-form-item>-->

      <a-form-item label="岗位名称" v-bind="validateInfos.name">
        <a-input v-model:value="modelRef.name" placeholder="请输入岗位名称"/>
      </a-form-item>

      <a-form-item label="岗位状态" v-bind="validateInfos.enabled">
<!--        <a-radio-group v-model:value="modelRef.enabled">-->
<!--          <a-radio :style="radioStyle" :value="true">是</a-radio>-->
<!--          <a-radio :style="radioStyle" :value="false">否</a-radio>-->
<!--        </a-radio-group>-->
        <a-switch v-model:checked="modelRef.enabled" />
      </a-form-item>

      <a-form-item label="排序" v-bind="validateInfos.jobSort">
        <a-input-number v-model:value="modelRef.jobSort"/>
      </a-form-item>

    </a-form>
  </a-modal>
</template>
<script lang="ts">
import {defineComponent, PropType, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import {Form, message} from 'ant-design-vue';
// import CKEditor from "@/components/CKEditor/index.vue";
import {SysJobDataType} from "../data.d";

const useForm = Form.useForm;

interface CreateFormSetupData {
  modelRef: Omit<SysJobDataType, 'jobId'>;
  validateInfos: validateInfos;
  onFinish: () => Promise<void>;
}

export default defineComponent({
  name: 'CreateForm',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    onCancel: {
      type: Function,
      required: true
    },
    onSubmitLoading: {
      type: Boolean,
      required: true
    },
    onSubmit: {
      type: Function as PropType<(values: Omit<SysJobDataType, 'jobId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): CreateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<Omit<SysJobDataType, 'jobId'>>({
      ///岗位名称
      name: '',
      ///岗位状态
      enabled: false,
      ///排序
      jobSort: 0,
    });
    // 表单验证
    const rulesRef = reactive({
      jobId: [],
      name: [],
      enabled: [],
      jobSort: [],

    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<Omit<SysJobDataType, 'jobId'>>();
        console.log("fieldValue:", fieldsValue)
        props.onSubmit(fieldsValue, resetFields);
      } catch (error) {
        console.log('error', error);
        message.warning(t('app.global.form.validatefields.catch'));
      }
    };

    return {
      modelRef,
      validateInfos,
      onFinish
    }

  }
})
</script>