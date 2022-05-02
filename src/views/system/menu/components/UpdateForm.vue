<template>
  <a-modal
      :destroy-on-close="true"
      :mask-closable="false"
      title="编辑"
      :visible="visible"
      :onCancel="onCancel"
      width=600px
  >
    <template #footer>
      <a-button key="back" @click="() => onCancel()">取消</a-button>
      <a-button key="submit" type="primary" :loading="onSubmitLoading" @click="onFinish">提交</a-button>
    </template>

    <a-form>
      <a-row :gutter="16" justify="start">
        <a-col span="24">
          <a-form-item label="菜单类型" v-bind="validateInfos.type">
            <a-radio-group v-model:value="modelRef.type" button-style="solid">
              <a-radio-button :value="0">目录</a-radio-button>
              <a-radio-button :value="1">菜单</a-radio-button>
              <a-radio-button :value="2">按钮</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" justify="start">
        <a-col span="24">
          <a-form-item label="菜单图标" v-bind="validateInfos.icon" v-show="modelRef.type != 2">
            <a-input v-model:value="modelRef.icon" placeholder="请输入图标"/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" justify="start">
        <a-col span="8" v-if="modelRef.type != 2">
          <a-form-item label="是否外链" v-bind="validateInfos.iFrame">
            <a-radio-group v-model:value="modelRef.iFrame" button-style="solid">
              <a-radio-button :value="true">是</a-radio-button>
              <a-radio-button :value="false">否</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="8" v-if="modelRef.type != 2">
          <a-form-item label="缓存" v-bind="validateInfos.cache">
            <a-radio-group v-model:value="modelRef.cache" button-style="solid">
              <a-radio-button :value="true">是</a-radio-button>
              <a-radio-button :value="false">否</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="8" v-if="modelRef.type != 2">
          <a-form-item label="隐藏" v-bind="validateInfos.hidden">
            <a-radio-group v-model:value="modelRef.hidden" button-style="solid">
              <a-radio-button :value="true">是</a-radio-button>
              <a-radio-button :value="false">否</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16" justify="start">
        <a-col span="12" v-if="modelRef.type != 2">
          <a-form-item label="菜单标题" v-bind="validateInfos.title">
            <a-input v-model:value="modelRef.title" placeholder="请输入菜单标题"/>
          </a-form-item>
        </a-col>
        <a-col span="12" v-if="modelRef.type != 0">
          <a-form-item label="权限" v-bind="validateInfos.permission">
            <a-input v-model:value="modelRef.permission" placeholder="请输入权限"/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" justify="start">
        <a-col span="12" v-show="modelRef.type != 2">
          <a-form-item label="链接地址" v-bind="validateInfos.path">
            <a-input v-model:value="modelRef.path" placeholder="请输入链接地址"/>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="菜单排序" v-bind="validateInfos.menuSort">
            <a-input-number v-model:value="modelRef.menuSort"/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" justify="start">
        <a-col span="12" v-show="modelRef.type == 1">
          <a-form-item label="组件名称" v-bind="validateInfos.name">
            <a-input v-model:value="modelRef.name" placeholder="请输入组件名称"/>
          </a-form-item>
        </a-col>
        <a-col span="12" v-show="modelRef.type == 1">
          <a-form-item label="组件" v-bind="validateInfos.component">
            <a-input v-model:value="modelRef.component" placeholder="请输入组件"/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" justify="start">
        <a-col span="24">
          <a-form-item label="上级菜单" v-bind="validateInfos.pid">
            <a-tree-select
                v-model:value="modelRef.pid"
                style="width: 300px"
                showSearch
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="menuTreeData"
                placeholder="上级菜单"
                tree-default-expand-all
                treeNodeFilterProp="title"
                :replaceFields="{children:'children', title:'title', key:'menuId', value: 'menuId' }"
            >
            </a-tree-select>
          </a-form-item>

        </a-col>
      </a-row>
    </a-form>

  </a-modal>
</template>
<script lang="ts">
import {defineComponent, PropType, reactive} from "vue";
import {useI18n} from "vue-i18n";
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import {Form, message} from 'ant-design-vue';
// import CKEditor from "@/components/CKEditor/index.vue";
import {SysMenuDataType} from "../data.d";

const useForm = Form.useForm;

interface UpdateFormSetupData {
  modelRef: Omit<SysMenuDataType, 'menuId'>;
  validateInfos: validateInfos;
  onFinish: () => Promise<void>;
}

export default defineComponent({
  name: 'UpdateForm',
  props: {
    menuTreeData: {
      type: Array,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    },
    values: {
      type: Object as PropType<Partial<SysMenuDataType>>,
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
      type: Function as PropType<(values: Omit<SysMenuDataType, 'menuId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): UpdateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<SysMenuDataType>({
      menuId: props.values.menuId || 0,
      pid: props.values.pid,
      subCount: props.values.subCount || 0,
      type: props.values.type || 0,
      title: props.values.title || '',
      name: props.values.name || '',
      component: props.values.component || '',
      menuSort: props.values.menuSort || 0,
      icon: props.values.icon || '',
      path: props.values.path || '',
      iFrame: props.values.iFrame || false,
      cache: props.values.cache || false,
      hidden: props.values.hidden || false,
      permission: props.values.permission || '',
    });
    // 表单验证
    const rulesRef = reactive({
      menuId: [],

      pid: [],

      subCount: [],

      type: [],

      title: [],

      name: [],

      component: [],

      menuSort: [],

      icon: [],

      path: [],

      iFrame: [],

      cache: [],

      hidden: [],

      permission: [],

    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<SysMenuDataType>();
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