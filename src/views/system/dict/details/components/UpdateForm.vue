<template>
  <a-modal
      :destroy-on-close="true"
      :mask-closable="false"
      title="编辑"
      :visible="visible"
      :onCancel="onCancel"
  >
    <template #footer>
      <a-button key="back" @click="() => onCancel()">取消</a-button>
      <a-button key="submit" type="primary" :loading="onSubmitLoading" @click="onFinish">提交</a-button>
    </template>

    <a-form :labelCol="{ span: 4 }" :wrapper-col="{span:20}">


      <!-- <a-form-item label="字典id" v-bind="validateInfos.dictId">
              <a-input-number v-model:value="modelRef.dictId"/>
      </a-form-item> -->

      <a-form-item label="字典标签" v-bind="validateInfos.label">
        <a-input v-model:value="modelRef.label" placeholder="请输入字典标签"/>
      </a-form-item>

      <a-form-item label="字典值" v-bind="validateInfos.value">
        <a-input v-model:value="modelRef.value" placeholder="请输入字典值"/>
      </a-form-item>

      <a-form-item label="排序" v-bind="validateInfos.dictSort">
        <a-input-number v-model:value="modelRef.dictSort"/>
      </a-form-item>

    </a-form>


  </a-modal>
</template>
<script lang="ts">
import {defineComponent, PropType, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import {Form, message} from 'ant-design-vue';
import {SysDictDetailDataType} from "../data.d";

const useForm = Form.useForm;

interface UpdateFormSetupData {
  modelRef: Omit<SysDictDetailDataType, 'detailId'>;
  validateInfos: validateInfos;
  onFinish: () => Promise<void>;
}

export default defineComponent({
  name: 'UpdateForm',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    values: {
      type: Object as PropType<Partial<SysDictDetailDataType>>,
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
      type: Function as PropType<(values: Omit<SysDictDetailDataType, 'detailId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): UpdateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<SysDictDetailDataType>({
      detailId: props.values.detailId || 0,
      label: props.values.label || '',
      value: props.values.value || '',
      dictSort: props.values.dictSort || 0,
    });
    // 表单验证
    const rulesRef = reactive({
      detailId: [],
      dictId: [],
      label: [],
      value: [],
      dictSort: [],
      createBy: [],
      updateBy: [],
      createTime: [],
      updateTime: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<SysDictDetailDataType>();
        console.log("fieldsValue", fieldsValue)
        props.onSubmit(fieldsValue, resetFields);
      } catch (error) {
        // console.log('error', error);
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