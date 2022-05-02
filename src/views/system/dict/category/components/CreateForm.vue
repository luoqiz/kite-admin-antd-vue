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

      <a-form-item label="字典名称" v-bind="validateInfos.name">
        <a-input v-model:value="modelRef.name" placeholder="请输入字典名称"/>
      </a-form-item>

      <a-form-item label="描述" v-bind="validateInfos.description">
        <a-input v-model:value="modelRef.description" placeholder="请输入描述"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts">
import {defineComponent, PropType, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {Form, message} from "ant-design-vue";
// import CKEditor from "@/components/CKEditor/index.vue";
import {SysDictDataType} from "../data.d";
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';

const useForm = Form.useForm;

interface CreateFormSetupData {
  modelRef: Omit<SysDictDataType, 'dictId'>;
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
      type: Function as PropType<(values: Omit<SysDictDataType, 'dictId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): CreateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<Omit<SysDictDataType, 'dictId'>>({

      ///字典名称
      name: '',

      ///描述
    });
    // 表单验证
    const rulesRef = reactive({

      name: [],

      description: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<Omit<SysDictDataType, 'dictId'>>();
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