<template>
  <a-card
      :bordered="true"
      style="margin-bottom: 15px"
      :bodyStyle="{paddingBottom: '0'}"
  >
    <a-form :labelCol="{ span: 0, offset: 0 }" :wrapper-col="{span:24}">
      <a-row :gutter="16" justify="start">

        <a-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
          <a-form-item label="" v-bind="searchValidateInfos.name">
            <a-input placeholder="请输入字典名称" v-model:value="searchModelRef.name"/>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
          <a-form-item label="" v-bind="searchValidateInfos.description">
            <a-input placeholder="请输入描述" v-model:value="searchModelRef.description"/>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
          <div class="text-align-right" style="padding-bottom: 24px">
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
    </template>
    <a-table
        row-key="dictId"
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :customRow="rowClick"
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
            <a-button type="primary" size="small" @click.stop="() => detailUpdateData(record.dictId)"
                      :loading="detailUpdateLoading.includes(record.dictId)">编辑
            </a-button>
          </a-col>
          <a-col flex="1" offset=2>
            <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.dictId)"
                      :loading="deleteLoading.includes(record.dictId)">删除
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
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref} from "vue";
import {useStore} from "vuex";
import {message, Modal} from "ant-design-vue";
import useForm, {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import CreateForm from './components/CreateForm.vue';
import UpdateForm from './components/UpdateForm.vue';
import {StateType as ListStateType} from "./store";
import {PaginationConfig, SysDictDataType, TableListQueryParams} from './data.d';

interface ListSearchTablePageSetupData {
  columns: any;
  list: SysDictDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<SysDictDataType, 'dictId'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (dictId: number) => Promise<void>;
  updateData: Partial<SysDictDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: SysDictDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (dictId: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  rowClick: (record: SysDictDataType, index: number) => {};
}

export default defineComponent({
  name: 'SysDictListSearchTablePage',
  props: {
    changeDictId: {
      type: Function,
      required: true
    }
  },
  components: {
    CreateForm,
    UpdateForm,
  },
  setup(props, {emit}): ListSearchTablePageSetupData {

    const rowClick = (record: SysDictDataType, index: number) => {
      return {
        // 点击行
        onClick: () => {
          props.changeDictId(record.dictId);
        },
      };
    }

    const store = useStore<{ SysDictListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<SysDictDataType[]>(() => store.state.SysDictListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.SysDictListSearchTable.tableData.pagination);

    // 列表字段
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 80,
        customRender: ({
                         text,
                         index
                       }: { text: any; index: number }) => (pagination.value.current - 1) * pagination.value.pageSize + index + 1,
      },

      {
        title: '字典名称',
        dataIndex: 'name',
        width: 200,
      },

      {
        title: '描述',
        dataIndex: 'description',
        width: 200,
      },

      {
        title: '操作',
        key: 'action',
        width: 200,
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
      name: '',
      description: '',
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      name: [],
      description: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const fieldsValue = await validate<TableListQueryParams>();
        console.log('search', fieldsValue);
        await store.dispatch('SysDictListSearchTable/queryTableData', {
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
    const createSubmit = async (values: Omit<SysDictDataType, 'dictId'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysDictListSearchTable/createTableData', values);
      if (res === true) {
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
      store.commit('SysDictListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: SysDictDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('SysDictListSearchTable/updateTableData', values);
      if (res === true) {
        updateFormCancel();
        message.success('编辑成功！');
        await getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<SysDictDataType>>(() => store.state.SysDictListSearchTable.updateData);
    const detailUpdateLoading = ref<number[]>([]);
    const detailUpdateData = async (id: number) => {
      detailUpdateLoading.value = [id];
      const res: boolean = await store.dispatch('SysDictListSearchTable/queryUpdateData', id);
      if (res === true) {
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
          const res: boolean = await store.dispatch('SysDictListSearchTable/deleteTableData', id);
          if (res === true) {
            message.success('删除成功！');
            await getList(pagination.value.current, pagination.value.pageSize);
          }
          deleteLoading.value = [];
        }
      });
    }

    onMounted(() => {
      getList(1, pagination.value.pageSize);
    });

    return {
      columns,
      list: list as unknown as SysDictDataType[],
      pagination: pagination as unknown as PaginationConfig,
      loading: loading as unknown as boolean,
      getList,
      createFormVisible: createFormVisible as unknown as boolean,
      setCreateFormVisible,
      createSubmitLoading: createSubmitLoading as unknown as boolean,
      createSubmit,
      detailUpdateLoading: detailUpdateLoading as unknown as number[],
      detailUpdateData,
      updateData: updateData as Partial<SysDictDataType>,
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
      rowClick: rowClick,
    }

  }

})
</script>