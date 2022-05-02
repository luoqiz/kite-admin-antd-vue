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
            <a-form-item label="岗位名称：" v-bind="searchValidateInfos.name">
              <a-input placeholder="请输入" v-model:value="searchModelRef.name"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="岗位状态：" v-bind="searchValidateInfos.enabled">
              <a-radio-group v-model:value="searchModelRef.enabled" button-style="solid">
                <a-radio-button :value="null">全部</a-radio-button>
                <a-radio-button :value="true">启用</a-radio-button>
                <a-radio-button :value="false">禁用</a-radio-button>
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
          row-key="jobId"
          :columns="columns"
          :data-source="list"
          :loading="loading"

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
          :scroll="{ x:'300',  y: 600 }"
          :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      >
        <template #c_enabled="{ text, record  }">
          <a-switch v-model:checked="record.enabled" @change="checked=> statusChange(checked, record)  "
                    checked-children="启用" un-checked-children="禁用"/>
        </template>
        <template #action="{ record }">
          <a-row type="flex" justify="center">
            <a-col flex="1" offset=2>
              <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.jobId)"
                        :loading="detailUpdateLoading.includes(record.jobId)">编辑
              </a-button>
            </a-col>
            <a-col flex="1" offset=2>
              <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.jobId)"
                        :loading="deleteLoading.includes(record.jobId)">删除
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
import {PaginationConfig, SysJobDataType, TableListQueryParams} from './data.d';
import moment from 'moment';

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: SysJobDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<SysJobDataType, 'jobId'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (jobId: number) => Promise<void>;
  updateData: Partial<SysJobDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: SysJobDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (jobId: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  rowClick: (record: SysJobDataType, index: number) => {};
  rowSelection: {};
  selectIdLength: number;
  batchDeleteTableData: () => Promise<void>;
  statusChange: (checked: boolean, event: SysJobDataType) => Promise<void>;
}

export default defineComponent({
  name: 'SysJobListSearchTablePage',
  components: {
    CreateForm,
    UpdateForm,
    DownOutlined,
    UpOutlined
  },
  setup(): ListSearchTablePageSetupData {

    const rowClick = (record: SysJobDataType, index: number) => {
      return {
        // 点击行
        // onClick: () => {
        //   console.log(record);
        // },
      };
    }

    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: SysJobDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: SysJobDataType, selected: boolean, selectedRows: SysJobDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.jobId
        });
      },
      onSelectAll: (selected: boolean, selectedRows: SysJobDataType[], changeRows: SysJobDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.jobId
        });
      },
    };


    const selectIdLength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ SysJobListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<SysJobDataType[]>(() => store.state.SysJobListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.SysJobListSearchTable.tableData.pagination);

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
      //     dataIndex: 'jobId',
      //     width: 120,
      //     fixed: 'left',
      // },

      {
        title: '岗位名称',
        dataIndex: 'name',
      },

      {
        title: '岗位状态',
        dataIndex: 'enabled',
        slots: {customRender: 'c_enabled'},
      },

      {
        title: '排序',
        dataIndex: 'jobSort',
      },

      {
        title: '创建日期',
        dataIndex: 'createTime',
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },

      {
        title: '操作',
        key: 'action',
        width: 150,
        slots: {customRender: 'action'},
        fixed: 'right',
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
      // enabled:false,
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      name: [],
      enabled: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const filedsValue = await validate<Omit<SysJobDataType, 'jobId'>>();

        await store.dispatch('SysJobListSearchTable/queryTableData', {
          ...filedsValue,
          ...{
            page: current,
            size: pageSize,
          },
        });
      } catch (error) {
        message.warning(error + ".");
      }
      loading.value = false;
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
    const createSubmit = async (values: Omit<SysJobDataType, 'jobId'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysJobListSearchTable/createTableData', values);
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
      store.commit('SysJobListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: SysJobDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysJobListSearchTable/updateTableData', values);
      if (res) {
        updateFormCancel();
        message.success('编辑成功！');
        await getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<SysJobDataType>>(() => store.state.SysJobListSearchTable.updateData);
    const detailUpdateLoading = ref<number[]>([]);
    const detailUpdateData = async (id: number) => {
      detailUpdateLoading.value = [id];
      const res: boolean = await store.dispatch('SysJobListSearchTable/queryUpdateData', id);
      if (res) {
        setUpdateFormVisible(true);
      }
      detailUpdateLoading.value = [];
    }

    // 删除 loading
    const deleteLoading = ref<(string | number)[]>([]);
    // 删除
    const deleteTableData = (jobId: number) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = [jobId];
          const res: boolean = await store.dispatch('SysJobListSearchTable/deleteTableData', jobId);
          if (res) {
            message.success('删除成功！');
            await getList(pagination.value.current, pagination.value.pageSize);
          }
          deleteLoading.value = [];
        }
      });
    }

    const statusChange = async (checked: boolean, record: SysJobDataType) => {
      updateSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysJobListSearchTable/updateTableData', {
        jobId: record.jobId,
        enabled: checked
      });
      if (!res) {
        await getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
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
          const res: boolean = await store.dispatch('SysJobListSearchTable/batchDeleteTableData', selectIds.value);
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
      list: list as unknown as SysJobDataType[],
      pagination: pagination as unknown as PaginationConfig,
      loading: loading as unknown as boolean,
      getList,
      createFormVisible: createFormVisible as unknown as boolean,
      setCreateFormVisible,
      createSubmitLoading: createSubmitLoading as unknown as boolean,
      createSubmit,
      detailUpdateLoading: detailUpdateLoading as unknown as number[],
      detailUpdateData,
      updateData: updateData as Partial<SysJobDataType>,
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
      statusChange
    }

  }

})
</script>