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
            <a-form-item label="1 阿里云 2 腾讯云：" v-bind="searchValidateInfos.platformType">
              <a-input placeholder="请输入" v-model:value="searchModelRef.platformType"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="签名id：" v-bind="searchValidateInfos.signName">
              <a-input placeholder="请输入" v-model:value="searchModelRef.signName"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="模板code：" v-bind="searchValidateInfos.templateCode">
              <a-input placeholder="请输入" v-model:value="searchModelRef.templateCode"/>
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
        <a-button type="danger" @click="() => batchDeleteTableData()" :disabled="selectIdlength < 1">删除</a-button>
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
          row-key="id"
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
              <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.id)"
                        :loading="detailUpdateLoading.includes(record.id)">编辑
              </a-button>
            </a-col>
            <a-col flex="1" offset=2>
              <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.id)"
                        :loading="deleteLoading.includes(record.id)">删除
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
          :onCancel="() => updataFormCancel()"
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
import {ConfigDataType, PaginationConfig, TableListQueryParams} from './data.d';
import moment from 'moment';

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: ConfigDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  refresh: () => void;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<ConfigDataType, 'id'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (id: number) => Promise<void>;
  updateData: Partial<ConfigDataType>;
  updateFormVisible: boolean;
  updataFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: ConfigDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (id: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  rowClick: (record: ConfigDataType, index: number) => {};
  rowSelection: {};
  selectIdlength: number;
  batchDeleteTableData: () => Promise<void>;
}

export default defineComponent({
  name: 'ConfigListSearchTablePage',
  components: {
    CreateForm,
    UpdateForm,
    DownOutlined,
    UpOutlined
  },
  setup(): ListSearchTablePageSetupData {

    const rowClick = (record: ConfigDataType, index: number) => {
      return {
        // 点击行
        onClick: () => {
          console.log(record);
        },
      };
    }

    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: ConfigDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: ConfigDataType, selected: boolean, selectedRows: ConfigDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.id
        });
      },
      onSelectAll: (selected: boolean, selectedRows: ConfigDataType[], changeRows: ConfigDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.id
        });
      },
    };


    const selectIdlength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ ConfigListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<ConfigDataType[]>(() => store.state.ConfigListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.ConfigListSearchTable.tableData.pagination);

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
      //     dataIndex: 'id',
      //     width: 120,
      //     fixed: 'left',
      // },
      {
        title: '配置名称',
        dataIndex: 'name',
        width: 120,
        fixed: 'left',
      },
      {
        title: '短信平台（1 阿里云 2 腾讯云）',
        dataIndex: 'platformType',
        width: 250,
        customRender: ({text}: any) => {
          return text === 1 ? '阿里云' : '腾讯云';
        },
      },
      {
        title: '访问密钥id',
        dataIndex: 'secretId',
        width: 200,
      },
      {
        title: '访问密钥',
        dataIndex: 'secretKey',
        width: 200,
      },
      {
        title: '应用id',
        dataIndex: 'appId',
        width: 200,
      },
      {
        title: '签名id',
        dataIndex: 'signName',
        width: 200,
      },
      {
        title: '模板code',
        dataIndex: 'templateCode',
        width: 200,
      },
      {
        title: '访问域名',
        dataIndex: 'domain',
        width: 200,
      },
      {
        title: '激活状态',
        dataIndex: 'status',
        width: 120,
        customRender: ({text}: any) => {
          return text === true ? '已激活' : '未激活';
        },
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        width: 150,
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: 150,
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
      // signName:'',
      // templateCode:'',
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      platformType: [],
      signName: [],
      templateCode: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const filedsValue = await validate<Omit<ConfigDataType, 'id'>>();

        await store.dispatch('ConfigListSearchTable/queryTableData', {
          ...filedsValue,
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
    const createSubmit = async (values: Omit<ConfigDataType, 'id'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('ConfigListSearchTable/createTableData', values);
      if (res === true) {
        resetFields();
        setCreateFormVisible(false);
        message.success('新增成功！');
        getList(1, pagination.value.pageSize);
      }
      createSubmitLoading.value = false;
    }


    // 编辑弹框 - visible
    const updateFormVisible = ref<boolean>(false);
    const setUpdateFormVisible = (val: boolean) => {
      updateFormVisible.value = val;
    }
    const updataFormCancel = () => {
      setUpdateFormVisible(false);
      store.commit('ConfigListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: ConfigDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('ConfigListSearchTable/updateTableData', values);
      if (res === true) {
        updataFormCancel();
        message.success('编辑成功！');
        getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<ConfigDataType>>(() => store.state.ConfigListSearchTable.updateData);
    const detailUpdateLoading = ref<number[]>([]);
    const detailUpdateData = async (id: number) => {
      detailUpdateLoading.value = [id];
      const res: boolean = await store.dispatch('ConfigListSearchTable/queryUpdateData', id);
      if (res === true) {
        setUpdateFormVisible(true);
      }
      detailUpdateLoading.value = [];
    }

    // 删除 loading
    const deleteLoading = ref<(string | number)[]>([]);
    // 删除
    const deleteTableData = (id: number) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = [id];
          const res: boolean = await store.dispatch('ConfigListSearchTable/deleteTableData', id);
          if (res === true) {
            message.success('删除成功！');
            getList(pagination.value.current, pagination.value.pageSize);
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
          const res: boolean = await store.dispatch('ConfigListSearchTable/batchDeleteTableData', selectIds.value);
          if (res === true) {
            message.success('删除成功！');
            getList(pagination.value.current, pagination.value.pageSize);
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
      list: list as unknown as ConfigDataType[],
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
      updateData: updateData as Partial<ConfigDataType>,
      updateFormVisible: updateFormVisible as unknown as boolean,
      updataFormCancel,
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
      selectIdlength: selectIdlength as unknown as number,
    }

  }

})
</script>