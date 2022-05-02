export interface SysDictDetailDataType {
    detailId: number; //ID
    dictId?: string; //字典id
    dictName?: string; //所属字典
    label: string; //字典标签
    value: string; //字典值
    dictSort?: number; //排序
    createBy?: string; //创建者
    updateBy?: string; //更新者
    createTime?: Date; //创建日期
    updateTime?: Date; //更新时间
}

export interface TableListQueryParams {
    page: number;
    size: number;
    dictId?: number;
}

export interface PaginationConfig {
    total: number;
    current: number;
    pageSize: number;
    showSizeChanger: boolean;
    showQuickJumper: boolean;
}


export interface TableDataType {
    list: TableListItem[];
    pagination: PaginationConfig;
}
