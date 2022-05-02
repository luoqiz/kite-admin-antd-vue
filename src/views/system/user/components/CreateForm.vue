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

      <a-form-item label="部门名称" v-bind="validateInfos.deptId">
        <a-input-number v-model:value="modelRef.deptId"/>
      </a-form-item>

      <a-form-item label="用户名" v-bind="validateInfos.username">
        <a-input v-model:value="modelRef.username" placeholder="请输入用户名"/>
      </a-form-item>

      <a-form-item label="昵称" v-bind="validateInfos.nickName">
        <a-input v-model:value="modelRef.nickName" placeholder="请输入昵称"/>
      </a-form-item>

      <a-form-item label="性别" v-bind="validateInfos.gender">
        <a-input v-model:value="modelRef.gender" placeholder="请输入性别"/>
      </a-form-item>

      <a-form-item label="手机号码" v-bind="validateInfos.phone">
        <a-input v-model:value="modelRef.phone" placeholder="请输入手机号码"/>
      </a-form-item>

      <a-form-item label="邮箱" v-bind="validateInfos.email">
        <a-input v-model:value="modelRef.email" placeholder="请输入邮箱"/>
      </a-form-item>

      <a-form-item label="头像地址" v-bind="validateInfos.avatarName">
        <a-input v-model:value="modelRef.avatarName" placeholder="请输入头像地址"/>
      </a-form-item>

      <a-form-item label="头像真实路径" v-bind="validateInfos.avatarPath">
        <a-input v-model:value="modelRef.avatarPath" placeholder="请输入头像真实路径"/>
      </a-form-item>

      <a-form-item label="密码" v-bind="validateInfos.password">
        <a-input v-model:value="modelRef.password" placeholder="请输入密码"/>
      </a-form-item>

      <a-form-item label="是否为admin账号" v-bind="validateInfos.isAdmin">
        <a-radio-group v-model:value="modelRef.isAdmin">
          <a-radio :style="radioStyle" :value="true">是</a-radio>
          <a-radio :style="radioStyle" :value="false">否</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="状态：1启用、0禁用" v-bind="validateInfos.enabled">
        <a-radio-group v-model:value="modelRef.enabled">
          <a-radio :style="radioStyle" :value="true">是</a-radio>
          <a-radio :style="radioStyle" :value="false">否</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="账号到期时间" v-bind="validateInfos.expireTime">
        <a-input v-model:value="modelRef.expireTime" placeholder="请输入账号到期时间"/>
      </a-form-item>

      <a-form-item label="账号是否未锁定" v-bind="validateInfos.nonLocked">
        <a-radio-group v-model:value="modelRef.nonLocked">
          <a-radio :style="radioStyle" :value="true">是</a-radio>
          <a-radio :style="radioStyle" :value="false">否</a-radio>
        </a-radio-group>
      </a-form-item>


      <a-form-item label="修改密码的时间" v-bind="validateInfos.pwdResetTime">
        <a-input v-model:value="modelRef.pwdResetTime" placeholder="请输入修改密码的时间"/>
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
import {SysUserDataType} from "../data.d";

const useForm = Form.useForm;


interface CreateFormSetupData {
  modelRef: Omit<SysUserDataType, 'userId'>;
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
      type: Function as PropType<(values: Omit<SysUserDataType, 'userId'>, resetFields: (newValues?: Props | undefined) => void) => void>,
      required: true
    }
  },
  components: {
    // CKEditor
  },
  setup(props): CreateFormSetupData {

    const {t} = useI18n();

    // 表单值
    const modelRef = reactive<Omit<SysUserDataType, 'userId'>>({

      ///部门名称
      deptId: 0,

      ///用户名
      username: '',

      ///昵称
      nickName: '',

      ///性别
      gender: '',

      ///手机号码
      phone: '',

      ///邮箱
      email: '',

      ///头像地址
      avatarName: '',

      ///头像真实路径
      avatarPath: '',

      ///密码
      password: '',

      ///是否为admin账号
      isAdmin: false,

      ///状态：1启用、0禁用
      enabled: false,

      ///账号到期时间
      expireTime: new Date(),

      ///账号是否未锁定
      nonLocked: false,

      ///修改密码的时间
      pwdResetTime: new Date(),

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
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);
    // 提交
    const onFinish = async () => {
      try {
        const fieldsValue = await validate<Omit<SysUserDataType, 'userId'>>();
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