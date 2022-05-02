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

    <a-form>
      <a-row :gutter="16" justify="start">
        <a-col span="24">
          <a-form-item label="部门名称" v-bind="validateInfos.name">
            <a-input v-model:value="modelRef.name" placeholder="请输入名称"/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="部门排序" v-bind="validateInfos.deptSort">
        <a-input-number v-model:value="modelRef.deptSort" style="width: 100%"/>
      </a-form-item>

      <a-row :gutter="24" justify="start">
        <a-col span="12">
          <a-form-item label="顶级部门">
            <a-radio-group v-model:value="isTopDept" @change="changeTopState">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="状态" v-bind="validateInfos.enabled">
            <a-radio-group v-model:value="modelRef.enabled">
              <a-radio :style="radioStyle" :value="true">是</a-radio>
              <a-radio :style="radioStyle" :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" justify="start" v-if="!isTopDept">
        <a-col span="24">
          <a-form-item label="上级部门" v-bind="validateInfos.pid">
            <a-tree-select
                v-model:value="modelRef.pid"
                show-search
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                allow-clear
                :tree-data="deptTreeData"
                placeholder="上级部门"
                treeNodeFilterProp="title"
                :field-names="{children:'children', label:'name', key:'deptId', value: 'deptId'}"
                @dropdownVisibleChange="dropdownVisibleChange"
            >
            </a-tree-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

  </a-modal>
</template>
<script lang="ts">
import {defineComponent, PropType, reactive, ref, Ref} from "vue";
import {useI18n} from "vue-i18n";
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import {Form, message} from 'ant-design-vue';
// import CKEditor from "@/components/CKEditor/index.vue";
import {SysDeptDataType} from "../data.d";
import {useStore} from "vuex";
import {StateType as ListStateType} from "@/views/system/dept/store";

const useForm = Form.useForm;

interface UpdateFormSetupData {
  modelRef: Omit<SysDeptDataType, 'deptId'>;
  validateInfos: validateInfos;
  onFinish: () => Promise<void>;
  isTopDept: Ref<boolean>;
  deptTreeData: Ref<SysDeptDataType[]>;
  changeTopState: (e: Event) => void;
  dropdownVisibleChange: (open) => Promise<void>;
}

export default defineComponent({
  name: 'UpdateForm',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    values: {
      type: Object as PropType<Partial<SysDeptDataType>>,
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
      type: Function as PropType<(values: Omit<SysDeptDataType, 'deptId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): UpdateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<SysDeptDataType>({

      deptId: props.values.deptId || 0,

      pid: props.values.pid || 0,

      subCount: props.values.subCount || 0,

      name: props.values.name || '',

      deptSort: props.values.deptSort || 0,

      enabled: props.values.enabled || false,

      createBy: props.values.createBy || '',

      updateBy: props.values.updateBy || '',

      createTime: props.values.createTime,

      updateTime: props.values.updateTime,
    });
    // 表单验证
    const rulesRef = reactive({
      deptId: [],

      pid: [],

      subCount: [],

      name: [],

      deptSort: [],

      enabled: [],

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
        const fieldsValue = await validate<SysDeptDataType>();
        props.onSubmit(fieldsValue, resetFields);
      } catch (error) {
        message.warning(t('app.global.form.validatefields.catch'));
      }
    };

    const isTopDept = ref<boolean>(modelRef.pid == 0);

    const store = useStore<{ SysDeptListSearchTable: ListStateType }>();
    let deptTreeData = ref<SysDeptDataType[]>([]);
    const dropdownVisibleChange = async (): Promise<void> => {
      try {
        deptTreeData.value = await store.dispatch('SysDeptListSearchTable/queryAllTableData');
        console.log("--deptTreeData---");
        console.log(deptTreeData);
      } catch (error) {
        message.warning(error + "");
      }
    }

    const changeTopState = (e: Event) => {
      if (e.target.value) {
        modelRef.pid = 0;
      }
    }
    // onMounted(() => {
    //   loadData();
    // })

    return {
      modelRef,
      validateInfos,
      onFinish,
      isTopDept,
      deptTreeData,
      changeTopState,
      dropdownVisibleChange
    }

  }
})
</script>