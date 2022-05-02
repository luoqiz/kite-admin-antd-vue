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


      <a-form-item label="ID" v-bind="validateInfos.roleId">
        <a-input-number v-model:value="modelRef.roleId"/>
      </a-form-item>

      <a-form-item label="名称" v-bind="validateInfos.name">
        <a-input v-model:value="modelRef.name" placeholder="请输入名称"/>
      </a-form-item>

      <a-form-item label="角色级别" v-bind="validateInfos.level">
        <a-input-number v-model:value="modelRef.level"/>
      </a-form-item>

      <a-form-item label="描述" v-bind="validateInfos.description">
        <a-input v-model:value="modelRef.description" placeholder="请输入描述"/>
      </a-form-item>

      <a-form-item label="数据权限" v-bind="validateInfos.dataScope">
        <a-input v-model:value="modelRef.dataScope" placeholder="请输入数据权限"/>
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
import {SysRoleDataType} from "../data";

const useForm = Form.useForm;

interface UpdateFormSetupData {
  modelRef: Omit<SysRoleDataType, 'roleId'>;
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
      type: Object as PropType<Partial<SysRoleDataType>>,
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
      type: Function as PropType<(values: Omit<SysRoleDataType, 'roleId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): UpdateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<SysRoleDataType>({

      roleId: props.values.roleId || 0,

      name: props.values.name || '',

      level: props.values.level || 0,

      description: props.values.description || '',

      dataScope: props.values.dataScope || '',
    });
    // 表单验证
    const rulesRef = reactive({
      roleId: [],

      name: [],

      level: [],

      description: [],

      dataScope: [],

    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<SysRoleDataType>();
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