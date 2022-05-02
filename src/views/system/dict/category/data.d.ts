export interface SysDictDataType {
    dictId: number; //ID
    name: string; //字典名称
    description?: string; //描述
    createBy?: string; //创建者
    updateBy?: string; //更新者
    createTime?: Date; //创建日期
    updateTime?: Date; //更新时间
}

export interface TableListQueryParams {
    page: number;
    size: number;
    name?: string; //字典名称
    description?: string; //描述
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
