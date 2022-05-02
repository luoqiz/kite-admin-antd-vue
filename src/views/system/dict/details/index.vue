<template>
  <!-- <a-card
          :bordered="true"
          style="margin-bottom: 15px"
          :bodyStyle="{paddingBottom: '0'}"
  >
      <a-form :labelCol="{ span: 6, offset: 0 }" :wrapper-col="{span:18}">
          <a-row :gutter="16" justify="start">

                              </a-row>

          <a-row :gutter="16" justify="start">
              <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                  <div class="text-align-right" style="padding-bottom: 24px" >
                      <a-button type="primary" @click="searchFormSubmit">查询</a-button>
                      <a-button style="margin-left: 8px" @click="searchResetFields">重置</a-button>
                      <a-button type="link" style="margin-left: 8px" @click="setSearchOpen">
                          <template v-if="searchOpen">
                              收起 <UpOutlined />
                          </template>
                          <template v-else>
                              展开 <DownOutlined />
                          </template>
                      </a-button>
                  </div>
              </a-col>
          </a-row>
      </a-form>
  </a-card> -->


  <a-card :bordered="false">
    <template #title>
      <a-button type="primary" @click="() => setCreateFormVisible(true)"
                :disabled="dictIdForm === '' || !dictIdForm || dictIdForm ==='0'">新增
      </a-button>
    </template>
    <a-table
        row-key="detailId"
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{
                        ...pagination,
                        onChange: async (page,pageSize) => {
                           await getList(page,pageSize);
                        },
                        onShowSizeChange: async (page,pageSize) => {
                           await getList(1, pageSize);
                        },
                    }"
        bordered
        size="small"
    >
      <template #c_title="{ text, record  }">
        <a :href="record.href" target="_blank">{{ text }}</a>
      </template>

      <template #action="{ record }">
        <a-row type="flex" justify="center">
          <a-col flex="1" offset=2>
            <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.detailId)"
                      :loading="detailUpdateLoading.includes(record.detailId)">编辑
            </a-button>
          </a-col>
          <a-col flex="1" offset=2>
            <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.detailId)"
                      :loading="deleteLoading.includes(record.detailId)">删除
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
        v-model:dictId="dictIdForm"
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
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {message, Modal} from "ant-design-vue";
import useForm, {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import CreateForm from './components/CreateForm.vue';
import UpdateForm from './components/UpdateForm.vue';
import {StateType as ListStateType} from "./store";
import {PaginationConfig, SysDictDetailDataType, TableListQueryParams} from './data.d';

interface ListSearchTablePageSetupData {
  columns: any;
  list: SysDictDetailDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<SysDictDetailDataType, 'detailId'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (detailId: number) => Promise<void>;
  updateData: Partial<SysDictDetailDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: SysDictDetailDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (detailId: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  dictIdForm: string;
}

export default defineComponent({
  name: 'SysDictDetailListSearchTablePage',
  props: {
    dictId: {
      type: String,
      required: true
    },
  },
  components: {
    CreateForm,
    UpdateForm,
  },
  setup(props): ListSearchTablePageSetupData {

    const dictIdForm = ref<string>(props.dictId);

    const store = useStore<{ SysDictDetailListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<SysDictDetailDataType[]>(() => store.state.SysDictDetailListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.SysDictDetailListSearchTable.tableData.pagination);

    // 列表字段
    const columns = [
      {
        title: '所属字典',
        dataIndex: 'dictLabel',
        width: 150,
      },

      {
        title: '字典标签',
        dataIndex: 'label',
        width: 200,
      },

      {
        title: '字典值',
        dataIndex: 'value',
        width: 200,
      },

      {
        title: '排序',
        dataIndex: 'dictSort',
        width: 100,
      },

      {
        title: '操作',
        key: 'action',
        width: 250,
        slots: {customRender: 'action'},
      },
    ];

    // 搜索
    const searchOpen = ref<boolean>(false);
    const setSearchOpen = (): void => {
      searchOpen.value = !searchOpen.value;
    }
    // 表单值
    const searchModelRef = reactive<TableListQueryParams>({
      page: 1,
      size: 10,
      dictId: 0,
    });
    // 表单验证
    const searchRulesRef = reactive({});
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);


    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      console.log("dic detail getList")
      loading.value = true;
      try {
        const fieldsValue = await validate<TableListQueryParams>();
        console.log('search', fieldsValue);
        await store.dispatch('SysDictDetailListSearchTable/queryTableData', {
          ...fieldsValue,
          ...{
            page: current,
            size: pageSize,
          },
          ...props,
        });
      } catch (error) {
        message.warning(error);
      }
      loading.value = false;
    }
    // 搜索
    const searchFormSubmit = async () => {
      await getList(1, pagination.value.pageSize)
    }

    // 新增弹框 - visible
    const createFormVisible = ref<boolean>(false);
    const setCreateFormVisible = (val: boolean) => {
      createFormVisible.value = val;
    };
    // 新增弹框 - 提交 loading
    const createSubmitLoading = ref<boolean>(false);
    // 新增弹框 - 提交
    const createSubmit = async (values: Omit<SysDictDetailDataType, 'detailId'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysDictDetailListSearchTable/createTableData', values);
      if (res) {
        resetFields();
        setCreateFormVisible(false);
        message.success('新增成功！');
        await getList(1, pagination.value.pageSize)
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
      store.commit('SysDictDetailListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: SysDictDetailDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('SysDictDetailListSearchTable/updateTableData', values);
      if (res) {
        updateFormCancel();
        message.success('编辑成功！');
        await getList(pagination.value.current, pagination.value.pageSize)
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<SysDictDetailDataType>>(() => store.state.SysDictDetailListSearchTable.updateData);
    const detailUpdateLoading = ref<number[]>([]);
    const detailUpdateData = async (id: number) => {
      detailUpdateLoading.value = [id];
      const res: boolean = await store.dispatch('SysDictDetailListSearchTable/queryUpdateData', id);
      if (res) {
        setUpdateFormVisible(true);
      }
      detailUpdateLoading.value = [];
    }

    // 删除 loading
    const deleteLoading = ref<number[]>([]);
    // 删除
    const deleteTableData = (id: number) => {
      Modal.confirm({
        title: '删除',
        content: '确定删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          deleteLoading.value = [id];
          const res: boolean = await store.dispatch('SysDictDetailListSearchTable/deleteTableData', id);
          if (res) {
            message.success('删除成功！');
            await getList(pagination.value.current, pagination.value.pageSize);
          }
          deleteLoading.value = [];
        }
      });
    }


    onMounted(() => {
      console.log("dic detail onMounted")
      getList(1, pagination.value.pageSize);
    });

    watch(props, (count, prevCount) => {
      console.log("detail---", props);
      dictIdForm.value = props.dictId
      getList(1, pagination.value.pageSize);
    });

    return {
      columns,
      list: list as unknown as SysDictDetailDataType[],
      pagination: pagination as unknown as PaginationConfig,
      loading: loading as unknown as boolean,
      getList,
      createFormVisible: createFormVisible as unknown as boolean,
      setCreateFormVisible,
      createSubmitLoading: createSubmitLoading as unknown as boolean,
      createSubmit,
      detailUpdateLoading: detailUpdateLoading as unknown as number[],
      detailUpdateData,
      updateData: updateData as unknown as Partial<SysDictDetailDataType>,
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
      dictIdForm: dictIdForm as unknown as string,
    }

  }

})
</script>