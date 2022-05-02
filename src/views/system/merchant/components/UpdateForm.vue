<template>
  <a-modal
      :destroy-on-close="true"
      :mask-closable="false"
      title="编辑"
      :visible="visible"
      :onCancel="onCancel"
      width=90%
  >
    <template #footer>
      <a-button key="back" @click="() => onCancel()">取消</a-button>
      <a-button key="submit" type="primary" :loading="onSubmitLoading" @click="onFinish">提交</a-button>
    </template>

    <a-form :labelCol="{ span: 4 }" :wrapper-col="{span:20}">

      <a-form-item label="列表id" v-bind="validateInfos.detailsId">
        <a-input v-model:value="modelRef.detailsId" placeholder="请输入列表id"/>
      </a-form-item>

      <a-form-item label="支付类型"
                   extra="详情查看com.egzosn.pay.spring.boot.core.merchant.PaymentPlatform对应子类，aliPay 支付宝， wxPay微信..等等"
                   v-bind="validateInfos.payType">
        <a-input v-model:value="modelRef.payType" placeholder="支付类型"/>
      </a-form-item>

      <a-form-item label="应用id" v-bind="validateInfos.appid">
        <a-input v-model:value="modelRef.appid" placeholder="请输入应用id"/>
      </a-form-item>

      <a-form-item label="商户号" extra="商户id，商户号，合作伙伴id等等" v-bind="validateInfos.mchId">
        <a-input v-model:value="modelRef.mchId" placeholder="请输入商户id，商户号，合作伙伴id等等"/>
      </a-form-item>

      <a-form-item label="证书类型" extra="当前面私钥公钥为证书类型的时候，这里必填，可选值:PATH,STR,INPUT_STREAM"
                   v-bind="validateInfos.certStoreType">
        <a-input v-model:value="modelRef.certStoreType" placeholder="请输入证书类型"/>
      </a-form-item>

      <a-form-item label="私钥或私钥证书" v-bind="validateInfos.keyPrivate">
        <a-input v-model:value="modelRef.keyPrivate" placeholder="请输入私钥或私钥证书"/>
      </a-form-item>

      <a-form-item label="公钥或公钥证书" v-bind="validateInfos.keyPublic">
        <a-input v-model:value="modelRef.keyPublic" placeholder="请输入公钥或公钥证书"/>
      </a-form-item>

      <a-form-item label="key证书" extra="key证书,附加证书使用，如SSL证书，或者银联根级证书方面" v-bind="validateInfos.keyCert">
        <a-input v-model:value="modelRef.keyCert" placeholder="请输入key证书"/>
      </a-form-item>

      <a-form-item label="密码" extra="私钥证书或key证书的密码" v-bind="validateInfos.keyCertPwd">
        <a-input v-model:value="modelRef.keyCertPwd" placeholder="请输入私钥证书或key证书的密码"/>
      </a-form-item>

      <a-form-item label="异步回调" v-bind="validateInfos.notifyUrl">
        <a-input v-model:value="modelRef.notifyUrl" placeholder="请输入异步回调"/>
      </a-form-item>

      <a-form-item label="同步回调地址" extra="同步回调地址，大部分用于付款成功后页面转跳" v-bind="validateInfos.returnUrl">
        <a-input v-model:value="modelRef.returnUrl" placeholder="请输入同步回调地址"/>
      </a-form-item>

      <a-form-item label="签名方式" extra="签名方式,目前已实现多种签名方式详情查看com.egzosn.pay.common.util.sign.encrypt。MD5,RSA等等"
                   v-bind="validateInfos.signType">
        <a-input v-model:value="modelRef.signType" placeholder="请输入签名方式"/>
      </a-form-item>

      <a-form-item label="收款账号" extra="收款账号，暂时只有支付宝部分使用，可根据开发者自行使用" v-bind="validateInfos.seller">
        <a-input v-model:value="modelRef.seller" placeholder="请输入收款账号"/>
      </a-form-item>

      <a-form-item label="子appid" v-bind="validateInfos.subAppId">
        <a-input v-model:value="modelRef.subAppId" placeholder="请输入子appid"/>
      </a-form-item>

      <a-form-item label="子商户id" v-bind="validateInfos.subMchId">
        <a-input v-model:value="modelRef.subMchId" placeholder="请输入子商户id"/>
      </a-form-item>

      <a-form-item label="编码类型" extra="编码类型，大部分为utf-8" v-bind="validateInfos.inputCharset">
        <a-input v-model:value="modelRef.inputCharset" placeholder="请输入编码类型，大部分为utf-8"/>
      </a-form-item>

      <a-form-item label="测试环境" extra="测试环境: 0 否，1 测试环境" v-bind="validateInfos.isTest">
        <a-input-number v-model:value="modelRef.isTest"/>
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
import {MerchantDetailsDataType} from "../data.d";

const useForm = Form.useForm;

interface UpdateFormSetupData {
  modelRef: Omit<MerchantDetailsDataType, 'detailsId'>;
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
      type: Object as PropType<Partial<MerchantDetailsDataType>>,
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
      type: Function as PropType<(values: Omit<MerchantDetailsDataType, 'detailsId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): UpdateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<MerchantDetailsDataType>({

      detailsId: props.values.detailsId || '',

      payType: props.values.payType || '',

      appid: props.values.appid || '',

      mchId: props.values.mchId || '',

      certStoreType: props.values.certStoreType || '',

      keyPrivate: props.values.keyPrivate || '',

      keyPublic: props.values.keyPublic || '',

      keyCert: props.values.keyCert || '',

      keyCertPwd: props.values.keyCertPwd || '',

      notifyUrl: props.values.notifyUrl || '',

      returnUrl: props.values.returnUrl || '',

      signType: props.values.signType || '',

      seller: props.values.seller || '',

      subAppId: props.values.subAppId || '',

      subMchId: props.values.subMchId || '',

      inputCharset: props.values.inputCharset || '',

      isTest: props.values.isTest || 0,
    });
    // 表单验证
    const rulesRef = reactive({
      detailsId: [],

      payType: [],

      appid: [],

      mchId: [],

      certStoreType: [],

      keyPrivate: [],

      keyPublic: [],

      keyCert: [],

      keyCertPwd: [],

      notifyUrl: [],

      returnUrl: [],

      signType: [],

      seller: [],

      subAppId: [],

      subMchId: [],

      inputCharset: [],

      isTest: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<MerchantDetailsDataType>();
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