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
            <a-form-item label="上级部门：" v-bind="searchValidateInfos.pid">
              <a-tree-select
                  v-model:value="searchModelRef.pid"
                  show-search
                  style="width: 100%"
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  allow-clear
                  :tree-data="deptTreeData"
                  placeholder="上级部门"
                  treeNodeFilterProp="title"
                  :field-names="{children:'children', label:'name', key:'deptId', value: 'deptId'}"
                  @dropdownVisibleChange="dropdownVisibleChange"
              />
            </a-form-item>


          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="状态：" v-bind="searchValidateInfos.enabled">
              <a-radio-group v-model:value="searchModelRef.enabled">
                <a-radio :style="radioStyle" :value="null">全部</a-radio>
                <a-radio :style="radioStyle" :value="true">是</a-radio>
                <a-radio :style="radioStyle" :value="false">否</a-radio>
              </a-radio-group>
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
          class="ant-table-striped"
          size="small"
          row-key="deptId"
          :columns="columns"
          :data-source="list"
          :loading="loading"
          :customRow="rowClick"
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
          :row-selection="rowSelection"
          :scroll="{ y: 600 }"
          :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      >
        <template #c_title="{ text, record  }">
          <a :href="record.href" target="_blank">{{ text }}</a>
        </template>
        <template #action="{ record }">
          <a-row type="flex" justify="center">
            <a-col flex="1" offset=2>
              <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.deptId)"
                        :loading="detailUpdateLoading.includes(record.deptId)">编辑
              </a-button>
            </a-col>
            <a-col flex="1" offset=2>
              <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.deptId)"
                        :loading="deleteLoading.includes(record.deptId)">删除
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
import {computed, defineComponent, onMounted, reactive, Ref, ref} from "vue";
import {useStore} from "vuex";
import {Form, message, Modal} from "ant-design-vue";
import {DownOutlined, UpOutlined} from '@ant-design/icons-vue';
import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import CreateForm from './components/CreateForm.vue';
import UpdateForm from './components/UpdateForm.vue';
import {StateType as ListStateType} from "./store";
import {PaginationConfig, SysDeptDataType, TableListQueryParams} from './data.d';
import moment from 'moment';

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: SysDeptDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  refresh: () => void;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<SysDeptDataType, 'deptId'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (deptId: number) => Promise<void>;
  updateData: Partial<SysDeptDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: SysDeptDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (deptId: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  tableExpand: (expanded: boolean, record: SysDeptDataType) => Promise<void>;
  rowClick: (record: SysDeptDataType, index: number) => {};
  rowSelection: {};
  selectIdLength: number;
  batchDeleteTableData: () => Promise<void>;
  deptTreeData: Ref<SysDeptDataType[]>;
  dropdownVisibleChange: (open) => Promise<void>;
}

export default defineComponent({
  name: 'SysDeptListSearchTablePage',
  components: {
    CreateForm,
    UpdateForm,
    DownOutlined,
    UpOutlined
  },
  setup(): ListSearchTablePageSetupData {

    const rowClick = (record: SysDeptDataType, index: number) => {
      return {
        // 点击行
        onClick: () => {
          console.log(record);
        },
      };
    }

    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: SysDeptDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: SysDeptDataType, selected: boolean, selectedRows: SysDeptDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.deptId
        });
      },
      onSelectAll: (selected: boolean, selectedRows: SysDeptDataType[], changeRows: SysDeptDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.deptId
        });
      },
    };

    // const getAll = async (pid: Number): Promise<void> => {
    //   loading.value = true;
    //   try {
    //     const fieldsValue = await validate<Omit<SysDeptDataType, 'deptId'>>();
    //
    //     await store.dispatch('SysDeptListSearchTable/queryTableData', {
    //       ...fieldsValue,
    //       ...{
    //         page: current,
    //         size: pageSize,
    //       },
    //     });
    //   } catch (error) {
    //     message.warning(error);
    //   }
    //   loading.value = false;
    // }

    // 表格展开
    const tableExpand = async (expanded: boolean, record: SysDeptDataType) => {
      if (record.subCount != undefined && record.subCount > 0 && record.children?.length == 0) {
        const data = await store.dispatch('SysDeptListSearchTable/queryAllTableData', {
          pid: record.deptId,
          page: 0,
          size: 100000000,
        });
        record.children = data;
      }
    }

    const selectIdLength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ SysDeptListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<SysDeptDataType[]>(() => store.state.SysDeptListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.SysDeptListSearchTable.tableData.pagination);

    // 列表字段
    const columns = [
      // {
      //     title: '序号',
      //     dataIndex: 'index',
      //     width: 80,
      //     customRender: ({text, index}: { text: any; index: number}) => (pagination.value.current - 1) * pagination.value.pageSize + index + 1,
      // },
      // {
      //     title: 'ID',
      //     dataIndex: 'deptId',
      //     width: 120,
      //     fixed: 'left',
      // },
      // {
      //     title: '上级部门',
      //     dataIndex: 'pid',
      // },
      // {
      //     title: '子部门数目',
      //     dataIndex: 'subCount',
      // },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '排序',
        dataIndex: 'deptSort',
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        customRender: ({text}: any) => {
          return text === true ? '是' : '否';
        },
      },
      {
        title: '创建者',
        dataIndex: 'createBy',
        width: 120,
      },
      // {
      //     title: '更新者',
      //     dataIndex: 'updateBy',
      //     width: 120,

      // },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },
      // {
      //     title: '更新时间',
      //     dataIndex: 'updateTime',
      //     width: 120,
      //     customRender: ({ text }: any)  =>{
      //         return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
      //     },
      // },
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
      // pid: 0,
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      pid: [],
      enabled: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const fieldsValue = await validate<Omit<SysDeptDataType, 'deptId'>>();

        await store.dispatch('SysDeptListSearchTable/queryTableData', {
          ...fieldsValue,
          ...{
            page: current,
            size: pageSize,
          },
        });
      } catch (error: any) {
        message.warning(error.toString());
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
    const createSubmit = async (values: Omit<SysDeptDataType, 'deptId'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysDeptListSearchTable/createTableData', values);
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
      store.commit('SysDeptListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: SysDeptDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('SysDeptListSearchTable/updateTableData', values);
      if (res) {
        updateFormCancel();
        message.success('编辑成功！');
        await getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<SysDeptDataType>>(() => store.state.SysDeptListSearchTable.updateData);
    const detailUpdateLoading = ref<(string | number)[]>([]);
    const detailUpdateData = async (deptId: number) => {
      detailUpdateLoading.value = [deptId];
      const res: boolean = await store.dispatch('SysDeptListSearchTable/queryUpdateData', deptId);
      if (res) {
        setUpdateFormVisible(true);
      }
      detailUpdateLoading.value = [];
    }

    // 删除 loading
    const deleteLoading = ref<(string | number)[]>([]);
    // 删除
    const deleteTableData = (deptId: number) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = [deptId];
          const res: boolean = await store.dispatch('SysDeptListSearchTable/deleteTableData', deptId);
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
          const res: boolean = await store.dispatch('SysDeptListSearchTable/batchDeleteTableData', selectIds.value);
          if (res) {
            message.success('删除成功！');
            await getList(pagination.value.current, pagination.value.pageSize);
          }
          deleteLoading.value = [];
        }
      });
    }

    let deptTreeData = ref<SysDeptDataType[]>([]);
    const dropdownVisibleChange = async (): Promise<void> => {
      try {
        deptTreeData.value = await store.dispatch('SysDeptListSearchTable/queryAllTableData');
      } catch (error) {
        message.warning(error + "");
      }
    }

    onMounted(() => {
      getList(1, pagination.value.pageSize);
    })

    return {
      columns,
      list: list as unknown as SysDeptDataType[],
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
      updateData: updateData as Partial<SysDeptDataType>,
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
      tableExpand,
      rowClick,
      rowSelection,
      batchDeleteTableData,
      selectIdLength: selectIdLength as unknown as number,
      deptTreeData,
      dropdownVisibleChange
    }

  }

})
</script>