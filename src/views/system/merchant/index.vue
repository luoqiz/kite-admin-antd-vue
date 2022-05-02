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
            <a-form-item label="列表id：" v-bind="searchValidateInfos.detailsId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.detailsId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="支付类型" v-bind="searchValidateInfos.payType">
              <a-input placeholder="请输入" v-model:value="searchModelRef.payType"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="应用id：" v-bind="searchValidateInfos.appid">
              <a-input placeholder="请输入" v-model:value="searchModelRef.appid"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="商户号: " v-bind="searchValidateInfos.mchId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.mchId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="子appid：" v-bind="searchValidateInfos.subAppId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.subAppId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="子商户id：" v-bind="searchValidateInfos.subMchId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.subMchId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="测试环境：" v-bind="searchValidateInfos.isTest">
              <a-radio-group v-model:value="searchModelRef.isTest" button-style="solid">
                <a-radio-button :value="null">全部</a-radio-button>
                <a-radio-button :value="true">是</a-radio-button>
                <a-radio-button :value="false">否</a-radio-button>
              </a-radio-group>
              <!-- <a-input placeholder="请输入" v-model:value="searchModelRef.isTest" /> -->
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
          row-key="detailsId"
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
              <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.detailsId)"
                        :loading="detailUpdateLoading.includes(record.detailsId)">编辑
              </a-button>
            </a-col>
            <a-col flex="1" offset=2>
              <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.detailsId)"
                        :loading="deleteLoading.includes(record.detailsId)">删除
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


    <a-card
        :bordered="true"
        style="margin-bottom: 15px"
        :bodyStyle="{paddingBottom: '0'}"
    >
      <a-form :labelCol="{ span: 6, offset: 0 }" :wrapper-col="{span:18}">
        <a-row :gutter="16" justify="start">
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="列表id：" v-bind="searchValidateInfos.detailsId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.detailsId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="支付类型" v-bind="searchValidateInfos.payType">
              <a-input placeholder="请输入" v-model:value="searchModelRef.payType"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="应用id：" v-bind="searchValidateInfos.appid">
              <a-input placeholder="请输入" v-model:value="searchModelRef.appid"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="商户号: " v-bind="searchValidateInfos.mchId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.mchId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="子appid：" v-bind="searchValidateInfos.subAppId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.subAppId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="子商户id：" v-bind="searchValidateInfos.subMchId">
              <a-input placeholder="请输入" v-model:value="searchModelRef.subMchId"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="测试环境：" v-bind="searchValidateInfos.isTest">
              <a-radio-group v-model:value="searchModelRef.isTest" button-style="solid">
                <a-radio-button :value="null">全部</a-radio-button>
                <a-radio-button :value="true">是</a-radio-button>
                <a-radio-button :value="false">否</a-radio-button>
              </a-radio-group>
              <!-- <a-input placeholder="请输入" v-model:value="searchModelRef.isTest" /> -->
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
import {MerchantDetailsDataType, PaginationConfig, TableListQueryParams} from './data.d';

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: MerchantDetailsDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  refresh: () => void;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<MerchantDetailsDataType, 'detailsId'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (detailsId: string) => Promise<void>;
  updateData: Partial<MerchantDetailsDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: MerchantDetailsDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (detailsId: string) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  rowClick: (record: MerchantDetailsDataType, index: number) => {};
  rowSelection: {};
  selectIdLength: number;
  batchDeleteTableData: () => Promise<void>;
}

export default defineComponent({
  name: 'MerchantDetailsListSearchTablePage',
  components: {
    CreateForm,
    UpdateForm,
    DownOutlined,
    UpOutlined
  },
  setup(): ListSearchTablePageSetupData {

    const rowClick = (record: MerchantDetailsDataType, index: number) => {
      return {
        // 点击行
        onClick: () => {
          console.log(record);
        },
      };
    }

    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: MerchantDetailsDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: MerchantDetailsDataType, selected: boolean, selectedRows: MerchantDetailsDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.detailsId
        });
      },
      onSelectAll: (selected: boolean, selectedRows: MerchantDetailsDataType[], changeRows: MerchantDetailsDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.detailsId
        });
      },
    };


    const selectIdLength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ MerchantDetailsListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<MerchantDetailsDataType[]>(() => store.state.MerchantDetailsListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.MerchantDetailsListSearchTable.tableData.pagination);

    // 列表字段
    const columns = [
      // {
      //     title: '序号',
      //     dataIndex: 'index',
      //     width: 80,
      //     customRender: ({text, index}: { text: any; index: number}) => (pagination.value.current - 1) * pagination.value.pageSize + index + 1,
      // },
      {
        title: '列表id',
        dataIndex: 'detailsId',
        width: 120,
        fixed: 'left',
      },
      {
        title: '支付类型(支付渠道)',
        dataIndex: 'payType',
        width: 120,
        fixed: 'left',
      },
      {
        title: '应用id',
        dataIndex: 'appid',
        width: 120,

      },
      {
        title: '商户id，商户号，合作伙伴id等',
        dataIndex: 'mchId',
        width: 120,

      },
      {
        title: '签名方式',
        dataIndex: 'signType',
        width: 120,

      },
      {
        title: '收款账号，暂时只有支付宝部分使用，可根据开发者自行使用',
        dataIndex: 'seller',
        width: 120,

      },
      {
        title: '子appid',
        dataIndex: 'subAppId',
        width: 120,

      },
      {
        title: '子商户id',
        dataIndex: 'subMchId',
        width: 120,

      },
      {
        title: '编码类型',
        dataIndex: 'inputCharset',
        width: 120,

      },
      {
        title: '测试环境',
        dataIndex: 'isTest',
        width: 120,
        customRender: ({text}: any) => {
          return text === true ? '是' : '否';
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
      // payType:'',
      // appid:'',
      // mchId:'',
      // subAppId:'',
      // subMchId:'',
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      detailsId: [],
      payType: [],
      appid: [],
      mchId: [],
      subAppId: [],
      subMchId: [],
      isTest: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const filedsValue = await validate<Omit<MerchantDetailsDataType, 'detailsId'>>();

        await store.dispatch('MerchantDetailsListSearchTable/queryTableData', {
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
    const createSubmit = async (values: Omit<MerchantDetailsDataType, 'detailsId'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('MerchantDetailsListSearchTable/createTableData', values);
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
    const updateFormCancel = () => {
      setUpdateFormVisible(false);
      store.commit('MerchantDetailsListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: MerchantDetailsDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('MerchantDetailsListSearchTable/updateTableData', values);
      if (res === true) {
        updateFormCancel();
        message.success('编辑成功！');
        getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<MerchantDetailsDataType>>(() => store.state.MerchantDetailsListSearchTable.updateData);
    const detailUpdateLoading = ref<(string | number)[]>([]);
    const detailUpdateData = async (detailsId: string) => {
      detailUpdateLoading.value = [detailsId];
      const res: boolean = await store.dispatch('MerchantDetailsListSearchTable/queryUpdateData', detailsId);
      if (res === true) {
        setUpdateFormVisible(true);
      }
      detailUpdateLoading.value = [];
    }

    // 删除 loading
    const deleteLoading = ref<(string | number)[]>([]);
    // 删除
    const deleteTableData = (detailsId: string) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = [detailsId];
          const res: boolean = await store.dispatch('MerchantDetailsListSearchTable/deleteTableData', detailsId);
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
          const res: boolean = await store.dispatch('MerchantDetailsListSearchTable/batchDeleteTableData', selectIds.value);
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
      list: list as unknown as MerchantDetailsDataType[],
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
      updateData: updateData as Partial<MerchantDetailsDataType>,
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