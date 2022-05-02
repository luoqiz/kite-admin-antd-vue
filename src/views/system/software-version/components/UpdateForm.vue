<template>
  <a-modal
      :destroy-on-close="true"
      :mask-closable="false"
      title="编辑"
      :visible="visible"
      :onCancel="onCancel"
      width=50%
  >
    <template #footer>
      <a-button key="back" @click="() => onCancel()">取消</a-button>
      <a-button key="submit" type="primary" :loading="onSubmitLoading" @click="onFinish">提交</a-button>
    </template>

    <a-form :labelCol="{ span: 4 }" :wrapper-col="{span:20}">

      <a-form-item label="软件类型" v-bind="validateInfos.type">
        <!-- <a-input v-model:value="modelRef.type" placeholder="请输入软件类型" /> -->
        <ApesDict dictKey="software_version_type">
          <template v-slot:default="dictItems">
            <a-radio-group v-model:value="modelRef.type" button-style="solid">
              <a-radio-button v-for="(item) in dictItems.items" :key="item.detailId" :value="item.value">
                {{ item.label }}
              </a-radio-button>
            </a-radio-group>
          </template>
        </ApesDict>
      </a-form-item>

      <a-form-item label="版本名称" v-bind="validateInfos.versionName">
        <a-input v-model:value="modelRef.versionName" placeholder="请输入版本名称"/>
      </a-form-item>

      <a-form-item label="版本号" v-bind="validateInfos.version">
        <a-input v-model:value="modelRef.version" placeholder="请输入版本号"/>
      </a-form-item>

      <a-form-item label="当前版本构建次数" v-bind="validateInfos.build">
        <a-input v-model:value="modelRef.build" placeholder="请输入当前版本构建次数"/>
      </a-form-item>

      <a-form-item label="版本更新内容" v-bind="validateInfos.mark">
        <a-input v-model:value="modelRef.mark" placeholder="请输入版本更新内容"/>
      </a-form-item>

      <a-form-item label="强制升级" v-bind="validateInfos.forceUpdate">
        <a-select v-model:value="modelRef.forceUpdate">
          <a-select-option :value=false>否</a-select-option>
          <a-select-option :value=true>是</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="下载地址" v-bind="validateInfos.downlaodUrl">
        <a-input v-model:value="modelRef.downlaodUrl" placeholder="请输入下载地址"/>
      </a-form-item>

      <a-form-item label="下载次数" v-bind="validateInfos.downloadNum">
        <a-input v-model:value="modelRef.downloadNum" placeholder="请输入下载次数"/>
      </a-form-item>

    </a-form>


  </a-modal>
</template>
<script lang="ts">
import {defineComponent, PropType, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {Form, message} from "ant-design-vue";
// import CKEditor from "@/components/CKEditor/index.vue";
import {SysSoftwareVersionDataType} from "../data.d";
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import ApesDict from "@/components/ApesDict/index.vue";

const useForm = Form.useForm;

interface UpdateFormSetupData {
  modelRef: Omit<SysSoftwareVersionDataType, 'id'>;
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
      type: Object as PropType<Partial<SysSoftwareVersionDataType>>,
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
      type: Function as PropType<(values: Omit<SysSoftwareVersionDataType, 'id'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor,
    ApesDict,
  },
  setup(props): UpdateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<SysSoftwareVersionDataType>({

      id: props.values.id || 0,

      type: props.values.type || '',

      versionName: props.values.versionName || '',

      version: props.values.version || '',

      build: props.values.build || '',

      mark: props.values.mark || '',
      /// 强制升级
      forceUpdate: props.values.forceUpdate || false,

      downlaodUrl: props.values.downlaodUrl || '',

      downloadNum: props.values.downloadNum || '',

    });
    // 表单验证
    const rulesRef = reactive({
      id: [],

      type: [],

      versionName: [],

      version: [],

      build: [],

      mark: [],
      forceUpdate: [],

      downlaodUrl: [],

      downloadNum: [],

      createTime: [],

      updateTime: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<SysSoftwareVersionDataType>();
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