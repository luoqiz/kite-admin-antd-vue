<template>
  <a-tree-select
      v-model:value="editorData"
      show-search
      style="width: 100%"
      :dropdown-style="dropdownStyle"
      allow-clear
      :tree-data="treeData"
      placeholder="角色列表"
      treeNodeFilterProp="title"
      :field-names="{children:'children', label:'name', key:'roleId', value: 'roleId'}"
      @dropdownVisibleChange="dropdownVisibleChange"
      tree-checkable
      multiple
      :show-checked-strategy="SHOW_PARENT"
  >
  </a-tree-select>
</template>
<script lang="ts">
import {computed, defineComponent, ref} from "vue";
import {message, TreeSelect} from "ant-design-vue";
import {SysRoleDataType} from "../role/data";
import {useStore} from "vuex";
import {StateType as ListStateType} from "../role/store";

export default defineComponent({
  name: 'RoleTreeSelect',
  props: {
    modelValue: {
      type: Array,
      default: []
    },
    dropdownStyle: {
      type: Map,
      default: {maxHeight: '400px', overflow: 'auto'}
    }
  },
  setup(props, {emit}) {
    console.log("RoleTreeSelect 收到参数", props);

    // 数据值
    const editorData = computed({
      get: () => props.modelValue,
      set: val => {
        emit('update:modelValue', val);
      }
    });
    const dropdownStyle = props.dropdownStyle;
    const store = useStore<{ SysRoleListSearchTable: ListStateType }>();

    let treeData = ref<SysRoleDataType[]>([]);
    const dropdownVisibleChange = async (): Promise<void> => {
      try {
        treeData.value = await store.dispatch('SysRoleListSearchTable/queryAllData');
      } catch (error) {
        message.warning(error + "");
      }
    }
    const SHOW_PARENT = TreeSelect.SHOW_PARENT;
    return {
      editorData,
      treeData,
      dropdownVisibleChange,
      dropdownStyle,
      SHOW_PARENT
    }
  }
})
</script>