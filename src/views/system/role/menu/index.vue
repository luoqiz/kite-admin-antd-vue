<template>
  <a-card title="菜单管理">
    <template #extra>
      <a-button type="primary" size="small" @click="() => saveRoleMenuRelation()">保存</a-button>
    </template>
    <a-tree
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        checkable
        :fieldNames="fieldNames"
        :tree-data="list"
    />
  </a-card>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, ref, Ref, watch} from "vue";
import {useStore} from "vuex";
import {Form, message} from "ant-design-vue";
import {StateType as ListStateType} from "./store";
import {SysMenuDataType} from '@/views/system/menu/data.d';
import {TreeProps} from "ant-design-vue/lib/tree/Tree";

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  list: Ref<SysMenuDataType[]>;
  loading: Ref<boolean>;
  getList: (current: number, pageSize: number) => Promise<void>;
  tableExpand: (expanded: boolean, record: SysMenuDataType) => Promise<void>;
  fieldNames: TreeProps['fieldNames'];
  expandedKeys: Ref<string[]>;
  selectedKeys: Ref<string[]>;
  checkedKeys: Ref<string[]>;
  saveRoleMenuRelation: () => void;
}

export default defineComponent({
  name: 'SysRoleMenuRelationPage',
  props: {
    roleId: {
      type: Number,
      required: true
    },
  },
  components: {},
  setup(props): ListSearchTablePageSetupData {

    const expandedKeys = ref<string[]>([]);
    const selectedKeys = ref<string[]>([]);
    const checkedKeys = ref<string[]>([]);
    watch(expandedKeys, () => {
      console.log('expandedKeys', expandedKeys);
    });
    watch(selectedKeys, () => {
      console.log('selectedKeys', selectedKeys);
    });
    watch(checkedKeys, () => {
      console.log('checkedKeys', checkedKeys);
    });

    const roleIdForm = ref<number>(props.roleId);

    const store = useStore<{ SysMenuListTree: ListStateType }>();

    // 列表数据
    const list = computed<SysMenuDataType[]>(() => store.state.SysMenuListTree.tableData.list);

    const fieldNames: TreeProps['fieldNames'] = {
      key: 'menuId',
    };

    // 获取数据
    const loading = ref<boolean>(true);
    const loadData = async (): Promise<void> => {
      loading.value = true;
      checkedKeys.value = [];
      try {
        const treeData = await store.dispatch('SysMenuListTree/queryTreeData', {
          roleId: roleIdForm.value,
        });
        for (let i = 0; i < treeData.length; i++) {
          checkedKeys.value.push(treeData[i].menuId)
        }
      } catch (error) {
        message.warning(error + "---");
      }
      loading.value = false;
    }


    const getList = async (): Promise<void> => {
      loading.value = true;
      try {
        await store.dispatch('SysMenuListTree/queryAllData', {
          pid: null,
        });
      } catch (error) {
        message.warning(error + "---");
      }
      loading.value = false;
    }

    // 表格展开
    const tableExpand = async (expanded: boolean, record: SysMenuDataType) => {

      // console.log(expanded)
      // console.log(record)
      // if(record.subCount !=undefined && record.subCount > 0 && record.children != null && record.children?.length==0){
      //     searchModelRef.pid = record.menuId;
      //     await getList(1, record.subCount);
      // }

    }

    const saveRoleMenuRelation = async () => {
      console.log(roleIdForm.value)
      console.log(selectedKeys.value)
      console.log(checkedKeys.value)
      await store.dispatch('SysMenuListTree/batchSaveRolesMenus', {
        roleId: roleIdForm.value,
        menuIds: checkedKeys.value
      });
    }

    onMounted(() => {
      getList()
    })

    watch(props, (count, prevCount) => {
      console.log("detail---", props);
      roleIdForm.value = props.roleId
      loadData();
    });

    return {
      list,
      loading,
      getList,
      tableExpand,
      fieldNames,
      expandedKeys,
      selectedKeys,
      checkedKeys,
      saveRoleMenuRelation
    }

  }

})
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) {
  background-color: #fafafa;
}
</style>