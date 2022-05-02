<template>
  <a-modal
      :destroy-on-close="true"
      :mask-closable="false"
      title="新增"
      :visible="visible"
      :onCancel="onCancel"
      width=50%
  >
    <template #footer>
      <a-button key="back" @click="() => onCancel()">取消</a-button>
      <a-button key="submit" type="primary" :loading="onSubmitLoading" @click="onFinish">提交</a-button>
    </template>

    <a-form :labelCol="{ span: 4 }" :wrapper-col="{span:20}">

      <a-form-item label="配置名称" v-bind="validateInfos.name">
        <a-input v-model:value="modelRef.name" placeholder="请输入配置名称"/>
      </a-form-item>

      <a-form-item label="短信平台" v-bind="validateInfos.platformType">
        <a-select v-model:value="modelRef.platformType" placeholder="请选择短信平台" allowClear style="width: 200px">
          <a-select-option :value="1">阿里云</a-select-option>
          <a-select-option :value="2">腾讯云</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="访问密钥id" v-bind="validateInfos.secretId">
        <a-input v-model:value="modelRef.secretId" placeholder="请输入访问密钥id"/>
      </a-form-item>

      <a-form-item label="访问密钥" v-bind="validateInfos.secretKey">
        <a-input v-model:value="modelRef.secretKey" placeholder="请输入访问密钥"/>
      </a-form-item>

      <a-form-item label="应用id" v-bind="validateInfos.appId">
        <a-input v-model:value="modelRef.appId" placeholder="请输入应用id"/>
      </a-form-item>

      <a-form-item label="签名id" v-bind="validateInfos.signName">
        <a-input v-model:value="modelRef.signName" placeholder="请输入签名id"/>
      </a-form-item>

      <a-form-item label="模板code" v-bind="validateInfos.templateCode">
        <a-input v-model:value="modelRef.templateCode" placeholder="请输入模板code"/>
      </a-form-item>

      <a-form-item label="访问域名" v-bind="validateInfos.domain">
        <a-input v-model:value="modelRef.domain" placeholder="请输入访问域名"/>
      </a-form-item>

      <a-form-item label="激活状态" v-bind="validateInfos.status">
        <a-radio-group v-model:value="modelRef.status">
          <a-radio :style="radioStyle" :value="true">是</a-radio>
          <a-radio :style="radioStyle" :value="false">否</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts">
import {defineComponent, PropType, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {Form, message} from "ant-design-vue";

import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
// import CKEditor from "@/components/CKEditor/index.vue";
import {ConfigDataType} from "../data.d";

const useForm = Form.useForm;

interface CreateFormSetupData {
  modelRef: Omit<ConfigDataType, 'id'>;
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
      type: Function as PropType<(values: Omit<ConfigDataType, 'id'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): CreateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<Omit<ConfigDataType, 'id'>>({
      ///配置名称
      name: '',
      ///1 阿里云 2 腾讯云
      platformType: 1,
      ///访问密钥id
      secretId: '',
      ///访问密钥
      secretKey: '',
      ///应用id
      appId: '',
      ///签名id
      signName: '',
      ///模板code
      templateCode: '',
      ///访问域名
      domain: '',
      ///激活状态
      status: false,
    });
    // 表单验证
    const rulesRef = reactive({

      name: [],

      platformType: [],

      secretId: [],

      secretKey: [],

      appId: [],

      signName: [],

      templateCode: [],

      domain: [],

      status: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<Omit<ConfigDataType, 'id'>>();
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