<template>
  <a-tree-select
      v-model:value="editorData"
      show-search
      style="width: 100%"
      :dropdown-style="dropdownStyle"
      allow-clear
      :tree-data="deptTreeData"
      placeholder="上级部门"
      treeNodeFilterProp="title"
      :field-names="{children:'children', label:'name', key:'deptId', value: 'deptId'}"
  >
<!--    @dropdownVisibleChange="dropdownVisibleChange"-->
  </a-tree-select>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, ref} from "vue";
import {message} from "ant-design-vue";
import {SysDeptDataType} from "@/views/system/dept/data";
import {useStore} from "vuex";
import {StateType as ListStateType} from "@/views/system/dept/store";

export default defineComponent({
  name: 'KiteDeptTree',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    dropdownStyle: {
      type: Map,
      default: {maxHeight: '400px', overflow: 'auto'}
    }
  },
  setup(props, {emit}) {
    console.log("KiteDeptTree 收到参数", props);

    // 数据值
    const editorData = computed({
      get: () => props.modelValue,
      set: val => {
        emit('update:modelValue', val);
      }
    });
    const dropdownStyle = props.dropdownStyle;
    const store = useStore<{ SysDeptListSearchTable: ListStateType }>();

    let deptTreeData = ref<SysDeptDataType[]>([]);
    const dropdownVisibleChange = async (): Promise<void> => {
      try {
        deptTreeData.value = await store.dispatch('SysDeptListSearchTable/queryAllTableData');
      } catch (error) {
        message.warning(error + "");
      }
    }
    onMounted(() => {
      dropdownVisibleChange();
    })

    return {
      editorData,
      deptTreeData,
      // dropdownVisibleChange,
      dropdownStyle
    }
  }
})
</script>