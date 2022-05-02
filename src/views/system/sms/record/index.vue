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
            <a-form-item label="手机号：" v-bind="searchValidateInfos.phone">
              <a-input placeholder="请输入" v-model:value="searchModelRef.phone"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
            <a-form-item label="过期时间：" v-bind="searchValidateInfos.expiredTime">
              <a-date-picker v-model:value="searchModelRef.expiredTime" valueFormat='yyyy-MM-DD HH:mm:ss'/>
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
          :scroll="{ x: 'calc(600px + 50%)', y: 600 }"
          :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      >
        <template #c_title="{ text, record  }">
          <a :href="record.href" target="_blank">{{ text }}</a>
        </template>
        <template #action="{ record }">
          <a-row type="flex" justify="center">
            <a-col flex="1" offset=2>
              <a-button type="danger" size="small" @click.stop="() => deleteTableData(record.id)"
                        :loading="deleteLoading.includes(record.id)">删除
              </a-button>
            </a-col>
          </a-row>
        </template>

      </a-table>
    </a-card>
  </div>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref} from "vue";
import {useStore} from "vuex";
import {Form, message, Modal} from "ant-design-vue";
import {DownOutlined, UpOutlined} from '@ant-design/icons-vue';

import {Props, validateInfos} from 'ant-design-vue/lib/form/useForm';
import {StateType as ListStateType} from "./store";
import {PaginationConfig, RecordDataType, TableListQueryParams} from './data.d';
import moment from 'moment';

const useForm = Form.useForm;

interface ListSearchTablePageSetupData {
  columns: any;
  list: RecordDataType[];
  pagination: PaginationConfig;
  loading: boolean;
  getList: (current: number, pageSize: number) => Promise<void>;
  deleteLoading: number[];
  deleteTableData: (id: number) => void;
  searchOpen: boolean;
  setSearchOpen: () => void;
  searchModelRef: TableListQueryParams;
  searchValidateInfos: validateInfos;
  searchResetFields: (newValues?: Props) => void;
  searchFormSubmit: () => Promise<void>;
  rowClick: (record: RecordDataType, index: number) => {};
  rowSelection: {};
  selectIdLength: number;
  batchDeleteTableData: () => Promise<void>;
}

export default defineComponent({
  name: 'RecordListSearchTablePage',
  components: {
    DownOutlined,
    UpOutlined
  },
  setup(): ListSearchTablePageSetupData {

    const rowClick = (record: RecordDataType, index: number) => {
      return {
        // 点击行
        onClick: () => {
          console.log(record);
        },
      };
    }

    const selectIds = ref<(string | number)[]>([]);

    const rowSelection = {
      onChange: (selectedRowKeys: (string | number)[], selectedRows: RecordDataType[]) => {
        // console.log('onChange');
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

      },
      onSelect: (record: RecordDataType, selected: boolean, selectedRows: RecordDataType[]) => {
        // console.log('---------onSelect-----------');
        // console.log(record, selected, selectedRows);
        selectIds.value = selectedRows.map((item) => {
          return item.id
        });
      },
      onSelectAll: (selected: boolean, selectedRows: RecordDataType[], changeRows: RecordDataType[]) => {
        // console.log('-------***********--onSelectAll-**********----------');
        // console.log(selected, selectedRows, changeRows);
        selectIds.value = selectedRows.map((item) => {
          return item.id
        });
      },
    };


    const selectIdLength = computed<number>(() => selectIds.value?.length || 0);

    const store = useStore<{ RecordListSearchTable: ListStateType }>();

    // 列表数据
    const list = computed<RecordDataType[]>(() => store.state.RecordListSearchTable.tableData.list);

    // 列表分页
    const pagination = computed<PaginationConfig>(() => store.state.RecordListSearchTable.tableData.pagination);

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
        title: '手机号',
        dataIndex: 'phone',
        width: 120,
        fixed: 'left',
      },
      {
        title: '验证码',
        dataIndex: 'code',
      },
      {
        title: '备注',
        dataIndex: 'mark',
      },
      {
        title: '过期时间',
        dataIndex: 'expiredTime',
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        customRender: ({text}: any) => {
          return !text ? "" : moment(text)?.format("yyyy-MM-DD HH:mm:ss");
        },
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 80,
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
      // phone:'',
      // expiredTime: new Date(),
    });
    // 搜索表单验证
    const searchRulesRef = reactive({
      phone: [],
      expiredTime: [],
    });
    // 获取表单内容
    const {resetFields, validate, validateInfos} = useForm(searchModelRef, searchRulesRef);

    // 获取数据
    const loading = ref<boolean>(true);
    const getList = async (current: number, pageSize: number): Promise<void> => {
      loading.value = true;
      try {
        const fieldsValue = await validate<Omit<RecordDataType, 'id'>>();

        await store.dispatch('RecordListSearchTable/queryTableData', {
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
          const res: boolean = await store.dispatch('RecordListSearchTable/deleteTableData', id);
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
          const res: boolean = await store.dispatch('RecordListSearchTable/batchDeleteTableData', selectIds.value);
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
      list: list as unknown as RecordDataType[],
      pagination: pagination as unknown as PaginationConfig,
      loading: loading as unknown as boolean,
      getList,
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