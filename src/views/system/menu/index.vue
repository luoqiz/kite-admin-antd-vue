<template>
  <div class="indexlayout-main-conent">
    <a-card
        :bordered="true"
        style="margin-bottom: 15px"
        :bodyStyle="{paddingBottom: '0'}"
        v-show="searchOpen"
    >
      <a-form :labelCol="{ span: 6, offset: 0 }" :wrapper-col="{span:18}">
        <a-row :gutter="16" justify="start">
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="菜单类型：" v-bind="searchValidateInfos.type">
              <a-radio-group v-model:value="searchModelRef.type" button-style="solid">
                <a-radio-button :value="null">全部</a-radio-button>
                <a-radio-button :value="0">目录</a-radio-button>
                <a-radio-button :value="1">菜单</a-radio-button>
                <a-radio-button :value="2">按钮</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="菜单标题：" v-bind="searchValidateInfos.title">
              <a-input placeholder="请输入" v-model:value="searchModelRef.title"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="组件名称：" v-bind="searchValidateInfos.name">
              <a-input placeholder="请输入" v-model:value="searchModelRef.name"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="组件：" v-bind="searchValidateInfos.component">
              <a-input placeholder="请输入" v-model:value="searchModelRef.component"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="是否外链：" v-bind="searchValidateInfos.iFrame">
              <a-radio-group v-model:value="searchModelRef.iFrame">
                <a-radio-button :value="null">全部</a-radio-button>
                <a-radio-button :value="true">是</a-radio-button>
                <a-radio-button :value="false">否</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="权限：" v-bind="searchValidateInfos.permission">
              <a-input placeholder="请输入" v-model:value="searchModelRef.permission"/>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" justify="start">
          <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <div class="text-align-left" style="padding-bottom: 24px">
              <a-button type="primary" @click="searchFormSubmit">查询</a-button>
              <a-button style="margin-left: 8px" @click="searchResetFields">重置</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </a-card>


    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="() => setCreateFormVisible(true)">新增</a-button>
        <!-- :disabled="selectIds.value.length==1" -->
        <a-button type="danger" @click="() => batchDeleteTableData()" :disabled="selectIdLength < 1">删除</a-button>
      </template>
      <template #extra>
        <a-button style="margin-left: 8px" @click="setSearchOpen">
          <template v-if="searchOpen">
            收起搜索
            <UpOutlined/>
          </template>
          <template v-else>
            展开搜索
            <DownOutlined/>
          </template>
        </a-button>
      </template>
      <a-table
          row-key="menuId"
          class="ant-table-striped"
          :columns="columns"
          :data-source="list"
          :loading="loading"
          :onExpand="tableExpand"
          :pagination="{
                        ...pagination,
                        onChange: async (page, pageSize) => {
                            await getList(page, pageSize);
                        },
                        onShowSizeChange: async (page, pageSize) => {
                            await getList(1, pageSize);
                        },
                    }"
          bordered
          size="small"
          :row-selection="rowSelection"
          :scroll="{ x: 'calc(700px + 50%)', y: 600 }"
          :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"

      >
        <template #c_title="{ text, record  }">
          <a :href="record.href" target="_blank">{{ text }}</a>
        </template>
        <template #action="{ record }">
          <a-row type="flex" justify="center">
            <a-col flex="1" offset=2>
              <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.menuId)"
                        :loading="detailUpdateLoading.includes(record.menuId)">编辑
              </a-button>
            </a-col>
            <a-col flex="1" offset=2>
              <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.menuId)"
                        :loading="deleteLoading.includes(record.menuId)">删除
              </a-button>
            </a-col>
          </a-row>
        </template>
      </a-table>

      <create-form
          :visible="createFormVisible"
          :onCancel="() => setCreateFormVisible(false)"
          :onSubmitLoading="createSubmitLoading"
          :onSubmit="createSubmit"
          :menuTreeData="list"
      />

      <update-form
          v-if="updateFormVisible===true"
          :visible="updateFormVisible"
          :values="updateData"
          :onCancel="() => updateFormCancel()"
          :onSubmitLoading="updateSubmitLoading"
          :onSubmit="updateSubmit"
          :menuTreeData="list"
      />


    </a-card>
  </div>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref} from "vue";
import {useStore} from "vuex";
import {Form, message, Modal} from "ant-design-vue";
import {DownOutlined, UpOutlined} from '@ant-design/icons-vue';
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import CreateForm from './components/CreateForm.vue';
import UpdateForm from './components/UpdateForm.vue';
import {StateType as ListStateType} from "./store";
import {PaginationConfig, SysMenuDataType, TableListQueryParams} from './data.d';
import moment from 'moment';

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: SysMenuDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<SysMenuDataType, 'menuId'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (menuId: number) => Promise<void>;
  updateData: Partial<SysMenuDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: SysMenuDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (menuId: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  // rowClick: (record: SysMenuDataType, index: number) => {};
  rowSelection: {};
  tableExpand: (expanded: boolean, record: SysMenuDataType) => Promise<void>;
  selectIdLength: number;
  batchDeleteTableData: () => Promise<void>;
}

export default defineComponent({
  name: 'SysMenuListSearchTablePage',
  components: {
    CreateForm,
    UpdateForm,
    DownOutlined,
    UpOutlined
  },
  setup(): ListSearchTablePageSetupData {

    // const rowClick = (record: SysMenuDataType, index: number) => {
    //     return {
    //         // 点击行
    //         onClick:() => {
    //             console.log(record);
    //         },
    //     };
    // }
    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: SysMenuDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: SysMenuDataType, selected: boolean, selectedRows: SysMenuDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.menuId
        });
      },
      onSelectAll: (selected: boolean, selectedRows: SysMenuDataType[], changeRows: SysMenuDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.menuId
        });
      },
    };


    const selectIdLength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ SysMenuListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<SysMenuDataType[]>(() => store.state.SysMenuListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.SysMenuListSearchTable.tableData.pagination);

    // 列表字段
    const columns = [
      {
        title: '菜单标题',
        dataIndex: 'title',
        key: 'title',
        width: 200,
        fixed: 'left',
      },
      {
        title: '图标',
        dataIndex: 'icon',
        key: 'icon',
        width: 120,
      },
      {
        title: '排序',
        dataIndex: 'menuSort',
        key: 'menuSort',
        width: 120,
      },
      {
        title: '权限',
        dataIndex: 'permission',
        key: 'permission',
        width: 200,
      },
      {
        title: '组件',
        dataIndex: 'component',
        key: 'component',
        width: 250,
      },
      {
        title: '是否外链',
        dataIndex: 'iFrame',
        key: 'iFrame',
        width: 120,
        customRender: ({text}: any) => {
          return text === true ? '是' : '否';
        },
      },
      {
        title: '链接地址',
        dataIndex: 'path',
        key: 'path',
        width: 300,
      },
      {
        title: '隐藏',
        dataIndex: 'hidden',
        key: 'hidden',
        width: 120,
        customRender: ({text}: any) => {
          return text === true ? '是' : '否';
        },
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
        customRender: ({text}: any) => {
          return moment(text).format("yyyy-MM-DD HH:mm:ss");
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 220,
        fixed: 'right',
        slots: {customRender: 'action'},
      },
    ];

    // 搜索
    const searchOpen = ref<boolean>(false);
    const setSearchOpen = (): void => {
      searchOpen.value = !searchOpen.value;
    }
    // 搜索表单值
    const searchModelRef = reactive<TableListQueryParams>({
      page: 1,
      size: 10,
      // pid: 0,
      // title:'',
      // name:'',
      // component:'',
      // iFrame:false,
      // permission:'',
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      pid: [],
      type: [],
      title: [],
      name: [],
      component: [],
      iFrame: [],
      permission: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const fieldsValue = await validate<Omit<SysMenuDataType, 'menuId'>>();

        await store.dispatch('SysMenuListSearchTable/queryTableData', {
          ...fieldsValue,
          ...{
            page: current,
            size: pageSize,
          },
        });
      } catch (error) {
        message.warning(error);
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

    // 搜索
    const searchFormSubmit = async () => {
      await getList(1, pagination.value.pageSize);
    }

    // 新增弹框 - visible
    const createFormVisible = ref<boolean>(false);
    const setCreateFormVisible = (val: boolean) => {
      createFormVisible.value = val;
    };
    // 新增弹框 - 提交 loading
    const createSubmitLoading = ref<boolean>(false);
    // 新增弹框 - 提交
    const createSubmit = async (values: Omit<SysMenuDataType, 'menuId'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysMenuListSearchTable/createTableData', values);
      if (res) {
        resetFields();
        setCreateFormVisible(false);
        message.success('新增成功！');
        await getList(1, pagination.value.pageSize);
      }
      createSubmitLoading.value = false;
    }


    // 编辑弹框 - visible
    const updateFormVisible = ref<boolean>(false);
    const setUpdateFormVisible = (val: boolean) => {
      updateFormVisible.value = val;
    }
    const updateFormCancel = () => {
      setUpdateFormVisible(false);
      store.commit('SysMenuListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: SysMenuDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('SysMenuListSearchTable/updateTableData', values);
      if (res) {
        updateFormCancel();
        message.success('编辑成功！');
        await getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<SysMenuDataType>>(() => store.state.SysMenuListSearchTable.updateData);
    const detailUpdateLoading = ref<number[]>([]);
    const detailUpdateData = async (id: number) => {
      detailUpdateLoading.value = [id];
      const res: boolean = await store.dispatch('SysMenuListSearchTable/queryUpdateData', id);
      if (res) {
        setUpdateFormVisible(true);
      }
      detailUpdateLoading.value = [];
    }

    // 删除 loading
    const deleteLoading = ref<(string | number)[]>([]);
    // 删除
    const deleteTableData = (menuId: number) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = [menuId];
          const res: boolean = await store.dispatch('SysMenuListSearchTable/deleteTableData', menuId);
          if (res) {
            message.success('删除成功！');
            await getList(pagination.value.current, pagination.value.pageSize);
          }
          deleteLoading.value = [];
        }
      });
    }

    const batchDeleteTableData = async () => {
      console.log(selectIds.value);
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = selectIds.value;
          const res: boolean = await store.dispatch('SysMenuListSearchTable/batchDeleteTableData', selectIds.value);
          if (res) {
            message.success('删除成功！');
            await getList(pagination.value.current, pagination.value.pageSize);
          }
          deleteLoading.value = [];
        }
      });
    }

    onMounted(() => {
      getList(1, 10000);
    })

    return {
      columns,
      list: list as unknown as SysMenuDataType[],
      pagination: pagination as unknown as PaginationConfig,
      loading: loading as unknown as boolean,
      getList,
      createFormVisible: createFormVisible as unknown as boolean,
      setCreateFormVisible,
      createSubmitLoading: createSubmitLoading as unknown as boolean,
      createSubmit,
      detailUpdateLoading: detailUpdateLoading as unknown as number[],
      detailUpdateData,
      updateData: updateData as Partial<SysMenuDataType>,
      updateFormVisible: updateFormVisible as unknown as boolean,
      updateFormCancel,
      updateSubmitLoading: updateSubmitLoading as unknown as boolean,
      updateSubmit,
      deleteLoading: deleteLoading as unknown as number[],
      deleteTableData,
      searchOpen: searchOpen as unknown as boolean,
      setSearchOpen,
      searchModelRef,
      searchValidateInfos: validateInfos,
      searchResetFields: resetFields,
      searchFormSubmit,
      // rowClick: rowClick,
      rowSelection,
      tableExpand,
      batchDeleteTableData,
      selectIdLength: selectIdLength as unknown as number,
    }

  }

})
</script>
<style scoped>
.ant-table-striped :deep(.table-striped) {
  background-color: #fafafa;
}
</style>