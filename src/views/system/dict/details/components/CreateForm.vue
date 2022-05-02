<template>
  <a-modal
      :destroy-on-close="true"
      :mask-closable="false"
      title="新增"
      :visible="visible"
      :onCancel="onCancel"
  >
    <template #footer>
      <a-button key="back" @click="() => onCancel()">取消</a-button>
      <a-button key="submit" type="primary" :loading="onSubmitLoading" @click="onFinish">提交</a-button>
    </template>

    <a-form :labelCol="{ span: 4 }" :wrapper-col="{span:20}">

      <!-- <a-form-item label="字典id" v-bind="validateInfos.dictId">
              <a-input v-model:value="modelRef.dictId"/>
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
import {defineComponent, PropType, reactive, watch} from "vue";
import {useI18n} from "vue-i18n";
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import {Form, message} from 'ant-design-vue';
import {SysDictDetailDataType} from "../data.d";

const useForm = Form.useForm;

interface CreateFormSetupData {
  modelRef: Omit<SysDictDetailDataType, 'detailId'>;
  validateInfos: validateInfos;
  onFinish: () => Promise<void>;
}

export default defineComponent({
  name: 'CreateForm',
  props: {
    dictId: {
      type: String,
      required: true
    },
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
      type: Function as PropType<(values: Omit<SysDictDetailDataType, 'detailId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    },
  },
  components: {
    // CKEditor
  },
  setup(props): CreateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<Omit<SysDictDetailDataType, 'detailId'>>({

      ///字典id
      dictId: props.dictId,

      ///字典标签
      label: '',

      ///字典值
      value: '',

      dictSort: 99,

      ///排序
    });
    // 表单验证
    const rulesRef = reactive({

      dictId: [],

      label: [
        {
          required: true,
          validator: async (rule: any, value: string) => {
            if (value === '' || !value || value === '0') {
              throw new Error('请输入标签名');
            } else if (value.length > 30) {
              throw new Error('长度不能大于30个字');
            }
          }
        },
      ],

      value: [
        {
          required: true,
          validator: async (rule: any, value: string) => {
            if (value === '' || !value || value === '0') {
              throw new Error('请输入字典值');
            } else if (value.length > 30) {
              throw new Error('长度不能大于30个字');
            }
          }
        },
      ],

      dictSort: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<Omit<SysDictDetailDataType, 'detailId'>>();
        console.log("fieldValue:", fieldsValue)
        props.onSubmit(fieldsValue, resetFields);
      } catch (error) {
        console.log('error', error);
        message.warning(t('app.global.form.validatefields.catch'));
      }
    };

    watch(props, (count, prevCount) => {
      console.log("crateForm", props.dictId);
      modelRef.dictId = props.dictId
    });

    return {
      modelRef,
      validateInfos,
      onFinish
    }

  }
})
</script>