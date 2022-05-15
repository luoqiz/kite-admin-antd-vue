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

    <a-form labelAlign="right" layout="vertical" :label-col="{ style: { width: '80px' } }"
            :wrapper-col="{ span: 24 }">
      <a-row :gutter="24">
        <a-col span="12">
          <a-form-item label="用户名" v-bind="validateInfos.username" required>
            <a-input v-model:value="modelRef.username" placeholder="请输入用户名"/>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="昵称" v-bind="validateInfos.nickName" required>
            <a-input v-model:value="modelRef.nickName" placeholder="请输入昵称"/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">

        <a-col span="12">
          <a-form-item label="手机号" v-bind="validateInfos.phone" required>
            <a-input v-model:value="modelRef.phone" placeholder="请输入手机号码"/>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="邮箱" v-bind="validateInfos.email" required>
            <a-input v-model:value="modelRef.email" placeholder="请输入邮箱"/>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col span="12">
          <a-form-item label="部门名称" v-bind="validateInfos.deptId">
            <KiteDeptTree v-model:value="modelRef.deptId"></KiteDeptTree>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="岗位" v-bind="validateInfos.email">
            <!--            <a-input v-model:value="modelRef.email" placeholder="请输入邮箱"/>-->
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col span="12">
          <a-form-item label="状态" v-bind="validateInfos.enabled">
            <a-radio-group v-model:value="modelRef.enabled">
              <a-radio :value="true">启用</a-radio>
              <a-radio :value="false">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="性别" v-bind="validateInfos.gender">
            <a-radio-group v-model:value="modelRef.gender">
              <a-radio value="1">男</a-radio>
              <a-radio value="2">女</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col span="12">
          <a-form-item label="到期时间" v-bind="validateInfos.expireTime">
<!--            <a-input v-model:value="modelRef.expireTime" placeholder="请输入账号到期时间"/>-->
            <a-date-picker show-time  v-model:value="modelRef.expireTime" placeholder="请输入账号到期时间" />
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="账号未锁定" v-bind="validateInfos.nonLocked">
            <a-radio-group v-model:value="modelRef.nonLocked">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col span="24">
          <a-form-item label="角色" v-bind="validateInfos.roleIds">
            <RoleTreeSelect v-model:model-value="modelRef.roleIds"></RoleTreeSelect>
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
import {SysUserDataType} from "../data.d";
import KiteDeptTree from "@/components/KiteDeptTree/index.vue";
import RoleTreeSelect from "@/views/system/role/components/RoleTreeSelect.vue";

const useForm = Form.useForm;

interface UpdateFormSetupData {
  modelRef: Omit<SysUserDataType, 'userId'>;
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
      type: Object as PropType<Partial<SysUserDataType>>,
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
      type: Function as PropType<(values: Omit<SysUserDataType, 'userId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    RoleTreeSelect,
    KiteDeptTree
  },
  setup(props): UpdateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<SysUserDataType>({
      userId: props.values.userId || 0,
      deptId: props.values.deptId || 0,
      username: props.values.username || '',
      nickName: props.values.nickName || '',
      gender: props.values.gender || '',
      phone: props.values.phone || '',
      email: props.values.email || '',
      avatarName: props.values.avatarName || '',
      avatarPath: props.values.avatarPath || '',
      password: props.values.password || '',
      isAdmin: props.values.isAdmin || false,
      enabled: props.values.enabled || false,
      expireTime: props.values.expireTime,
      nonLocked: props.values.nonLocked || false,
      pwdResetTime: props.values.pwdResetTime,
      jobIds: props.values.jobIds || [],
      roleIds: props.values.roleIds || [],
    });
    // 表单验证
    const rulesRef = reactive({
      userId: [],
      deptId: [],
      username: [],
      nickName: [],
      gender: [],
      phone: [],
      email: [],
      avatarName: [],
      avatarPath: [],
      password: [],
      isAdmin: [],
      enabled: [],
      expireTime: [],
      nonLocked: [],
      pwdResetTime: [],
      roleIds: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<SysUserDataType>();
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