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
            <a-form-item label="软件类型" v-bind="searchValidateInfos.type">
              <!-- <a-input placeholder="请输入" v-model:value="searchModelRef.type" /> -->
              <ApesDict dictKey="software_version_type" itemFullValue="全部">
                <template v-slot:default="dictItems">
                  <a-radio-group v-model:value="searchModelRef.type" button-style="solid">
                    <a-radio-button v-for="(item) in dictItems.items" :key="item.detailId" :value="item.value">
                      {{ item.label }}
                    </a-radio-button>
                  </a-radio-group>
                </template>
              </ApesDict>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="版本名称：" v-bind="searchValidateInfos.versionName">
              <a-input placeholder="请输入" v-model:value="searchModelRef.versionName"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="创建日期：" v-bind="searchValidateInfos.createTime">
              <a-date-picker v-model:value="searchModelRef.createTime" valueFormat='yyyy-MM-DD HH:mm:ss'/>
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
        <template #c_label="{ text  }">
          <ApesDict dictKey="software_version_type">
            <template v-slot:default="dictItems">
              <template v-for="(item) in dictItems.items" :key="item.detailId">
                <a-tag color="cyan" v-if="item.value === text">{{ item.label }}</a-tag>
              </template>
            </template>
          </ApesDict>
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
import {PaginationConfig, SysSoftwareVersionDataType, TableListQueryParams} from './data.d';
import moment from 'moment';
import ApesDict from "@/components/ApesDict/index.vue";

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: SysSoftwareVersionDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  refresh: () => void;
  createFormVisible: boolean;
  setCreateFormVisible: (val: boolean) => void;
  createSubmitLoading: boolean;
  createSubmit: (values: Omit<SysSoftwareVersionDataType, 'id'>, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  detailUpdateLoading: number[];
  detailUpdateData: (id: number) => Promise<void>;
  updateData: Partial<SysSoftwareVersionDataType>;
  updateFormVisible: boolean;
  updateFormCancel: () => void;
  updateSubmitLoading: boolean;
  updateSubmit: (values: SysSoftwareVersionDataType, resetFields: (newValues?: Props | undefined) => void) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (id: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  rowClick: (record: SysSoftwareVersionDataType, index: number) => {};
  rowSelection: {};
  selectIdLength: number;
  batchDeleteTableData: () => Promise<void>;
}

export default defineComponent({
  name: 'SysSoftwareVersionListSearchTablePage',
  components: {
    CreateForm,
    UpdateForm,
    DownOutlined,
    UpOutlined,
    ApesDict,
  },
  setup(): ListSearchTablePageSetupData {

    const rowClick = (record: SysSoftwareVersionDataType, index: number) => {
      return {
        // 点击行
        onClick: () => {
          console.log(record);
        },
      };
    }

    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: SysSoftwareVersionDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: SysSoftwareVersionDataType, selected: boolean, selectedRows: SysSoftwareVersionDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.id
        });
      },
      onSelectAll: (selected: boolean, selectedRows: SysSoftwareVersionDataType[], changeRows: SysSoftwareVersionDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.id
        });
      },
    };


    const selectIdLength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ SysSoftwareVersionListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<SysSoftwareVersionDataType[]>(() => store.state.SysSoftwareVersionListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.SysSoftwareVersionListSearchTable.tableData.pagination);

    // 列表字段
    const columns = [
      // {
      //     title: '序号',
      //     dataIndex: 'index',
      //     width: 80,
      //     customRender: ({text, index}: { text: any; index: number}) => (pagination.value.current - 1) * pagination.value.pageSize + index + 1,
      // },
      {
        title: 'ID',
        dataIndex: 'id',
        width: 120,
        fixed: 'left',
      },
      {
        title: '软件类型',
        dataIndex: 'type',
        width: 120,
        slots: {customRender: 'c_label'},
      },
      {
        title: '版本名称',
        dataIndex: 'versionName',
        width: 120,

      },
      {
        title: '版本号',
        dataIndex: 'version',
        width: 120,

      },
      {
        title: '当前版本构建次数',
        dataIndex: 'build',
        width: 120,

      },
      {
        title: '版本更新内容',
        dataIndex: 'mark',
        width: 120,

      },
      {
        title: '强制升级',
        dataIndex: 'forceUpdate',
        width: 120,
        customRender: ({text}: any) => {
          return text ? '是' : '否';
        },
      },
      {
        title: '下载地址',
        dataIndex: 'downlaodUrl',
        width: 120,
      },
      {
        title: '下载次数',
        dataIndex: 'downloadNum',
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
      // versionName:'',
      // createTime: new Date(),
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      type: [],
      versionName: [],
      createTime: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const filedsValue = await validate<Omit<SysSoftwareVersionDataType, 'id'>>();

        await store.dispatch('SysSoftwareVersionListSearchTable/queryTableData', {
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
    const createSubmit = async (values: Omit<SysSoftwareVersionDataType, 'id'>, resetFields: (newValues?: Props | undefined) => void) => {
      createSubmitLoading.value = true;
      const res: boolean = await store.dispatch('SysSoftwareVersionListSearchTable/createTableData', values);
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
      store.commit('SysSoftwareVersionListSearchTable/setUpdateData', {});
    }
    // 编辑弹框 - 提交 loading
    const updateSubmitLoading = ref<boolean>(false);
    // 编辑弹框 - 提交
    const updateSubmit = async (values: SysSoftwareVersionDataType, resetFields: (newValues?: Props | undefined) => void) => {
      updateSubmitLoading.value = true;
      console.log("values:", values);
      console.log("newValues:", values);
      const res: boolean = await store.dispatch('SysSoftwareVersionListSearchTable/updateTableData', values);
      if (res) {
        updateFormCancel();
        message.success('编辑成功！');
        await getList(pagination.value.current, pagination.value.pageSize);
      }
      updateSubmitLoading.value = false;
    }

    // 编辑弹框 data
    const updateData = computed<Partial<SysSoftwareVersionDataType>>(() => store.state.SysSoftwareVersionListSearchTable.updateData);
    const detailUpdateLoading = ref<(string | number)[]>([]);
    const detailUpdateData = async (id: number) => {
      detailUpdateLoading.value = [id];
      const res: boolean = await store.dispatch('SysSoftwareVersionListSearchTable/queryUpdateData', id);
      if (res) {
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
          const res: boolean = await store.dispatch('SysSoftwareVersionListSearchTable/deleteTableData', id);
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
          const res: boolean = await store.dispatch('SysSoftwareVersionListSearchTable/batchDeleteTableData', selectIds.value);
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
      list: list as unknown as SysSoftwareVersionDataType[],
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
      updateData: updateData as Partial<SysSoftwareVersionDataType>,
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