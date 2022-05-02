<template>
  <div>
    <a-card
        :bordered="true"
        style="margin-bottom: 15px"
        :bodyStyle="{paddingBottom: '0'}"
        v-show="searchOpen"
    >
      <a-form :labelCol="{ span: 6, offset: 0 }" :wrapper-col="{span:18}">
        <a-row :gutter="16" justify="start">
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="名称：" v-bind="searchValidateInfos.name">
              <a-input placeholder="请输入" v-model:value="searchModelRef.name"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="角色级别：" v-bind="searchValidateInfos.level">
              <a-input placeholder="请输入" v-model:value="searchModelRef.level"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="描述：" v-bind="searchValidateInfos.description">
              <a-input placeholder="请输入" v-model:value="searchModelRef.description"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="数据权限：" v-bind="searchValidateInfos.dataScope">
              <a-input placeholder="请输入" v-model:value="searchModelRef.dataScope"/>
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
        <a-button type="danger" @click="() => batchDeleteTableData()" :disabled="selectIdLength < 1">删除</a-button>
      </template>
      <template #extra>
        <a-button style="margin-left: 8px" @click="refresh">
          刷新
        </a-button>
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
          row-key="roleId"
          :columns="columns"
          :data-source="list"
          :loading="loading"
          :customRow="rowClick"
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
              <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.roleId)"
                        :loading="detailUpdateLoading.includes(record.roleId)">编辑
              </a-button>
            </a-col>
            <a-col flex="1" offset=2>
              <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.roleId)"
                        :loading="deleteLoading.includes(record.roleId)">删除
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
      />

      <update-form
          v-if="updateFormVisible===true"
          :visible="updateFormVisible"
          :values="updateData"
          :onCancel="() => updateFormCancel()"
          :onSubmitLoading="updateSubmitLoading"
          :onSubmit="updateSubmit"
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
import {PaginationConfig, SysRoleDataType, TableListQueryParams} from './data';
import moment from 'moment';

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: SysRoleDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  refresh: () => void;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<SysRoleDataType, 'roleId'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (roleId: number) => Promise<void>;
  updateData: Partial<SysRoleDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: SysRoleDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (roleId: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  rowClick: (record: SysRoleDataType, index: number) => {};
  rowSelection: {};
  selectIdLength: number;
  batchDeleteTableData: () => Promise<void>;
}

export default defineComponent({
  name: 'SysRoleListSearchTablePage',
  props: {
    changeRoleId: {
      type: Function,
      required: true
    }
  },
  components: {
    CreateForm,
    UpdateForm,
    DownOutlined,
    UpOutlined
  },
  setup(props, {emit}): ListSearchTablePageSetupData {

    const rowClick = (record: SysRoleDataType, index: number) => {
      return {
        // 点击行
        onClick: () => {
          props.changeRoleId(record.roleId);
        },
      };
    }

    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: SysRoleDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: SysRoleDataType, selected: boolean, selectedRows: SysRoleDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.roleId
        });
      },
      onSelectAll: (selected: boolean, selectedRows: SysRoleDataType[], changeRows: SysRoleDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.roleId
        });
      },
    };


    const selectIdLength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ SysRoleListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<SysRoleDataType[]>(() => store.state.SysRoleListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.SysRoleListSearchTable.tableData.pagination);

    // 列表字段
    const columns = [
      // {
      //     title: '序号',
      //     dataIndex: 'index',
      //     width: 80,
      //     customRender: ({text, index}: { text: any; index: number}) => (pagination.value.current - 1) * pagination.value.pageSize + index + 1,
      // },
      // {
      //   title: 'ID',
      //   dataIndex: 'roleId',
      //   width: 120,
      //   fixed: 'left',
      // },
      {
        title: '名称',
        dataIndex: 'name',
        width: 120,
        fixed: 'left',
      },
      {
        title: '角色级别',
        dataIndex: 'level',
        width: 120,
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: 120,
      },
      {
        title: '数据权限',
        dataIndex: 'dataScope',
        width: 120,
      },
      {
        title: '创建者',
        dataIndex: 'createBy',
        width: 120,
      },
      {
        title: '更新者',
        dataIndex: 'updateBy',
        width: 120,
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        width: 120,
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: 120,
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
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
      // name:'',
      // description:'',
      // dataScope:'',
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      name: [],
      level: [],
      description: [],
      dataScope: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const fieldsValue = await validate<Omit<SysRoleDataType, 'roleId'>>();

        await store.dispatch('SysRoleListSearchTable/queryTableData', {
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

    const refresh = () => {
      getList(pagination.value.current, pagination.value.pageSize);
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
    const createSubmit = async (values: Omit<SysRoleDataType, 'roleId'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysRoleListSearchTable/createTableData', values);
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
      store.commit('SysRoleListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: SysRoleDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('SysRoleListSearchTable/updateTableData', values);
      if (res) {
        updateFormCancel();
        message.success('编辑成功！');
        await getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<SysRoleDataType>>(() => store.state.SysRoleListSearchTable.updateData);
    const detailUpdateLoading = ref<(string | number)[]>([]);
    const detailUpdateData = async (roleId: number) => {
      detailUpdateLoading.value = [roleId];
      const res: boolean = await store.dispatch('SysRoleListSearchTable/queryUpdateData', roleId);
      if (res) {
        setUpdateFormVisible(true);
      }
      detailUpdateLoading.value = [];
    }

    // 删除 loading
    const deleteLoading = ref<(string | number)[]>([]);
    // 删除
    const deleteTableData = (roleId: number) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = [roleId];
          const res: boolean = await store.dispatch('SysRoleListSearchTable/deleteTableData', roleId);
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
        content: '确定删除所选数据吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = selectIds.value;
          const res: boolean = await store.dispatch('SysRoleListSearchTable/batchDeleteTableData', selectIds.value);
          if (res) {
            message.success('删除成功！');
            await getList(pagination.value.current, pagination.value.pageSize);
          }
          deleteLoading.value = [];
        }
      });
    }

    onMounted(() => {
      getList(1, pagination.value.pageSize);
    })

    return {
      columns,
      list: list as unknown as SysRoleDataType[],
      pagination: pagination as unknown as PaginationConfig,
      loading: loading as unknown as boolean,
      getList,
      refresh,
      createFormVisible: createFormVisible as unknown as boolean,
      setCreateFormVisible,
      createSubmitLoading: createSubmitLoading as unknown as boolean,
      createSubmit,
      detailUpdateLoading: detailUpdateLoading as unknown as number[],
      detailUpdateData,
      updateData: updateData as Partial<SysRoleDataType>,
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
      rowClick,
      rowSelection,
      batchDeleteTableData,
      selectIdLength: selectIdLength as unknown as number,
    }

  }

})
</script>