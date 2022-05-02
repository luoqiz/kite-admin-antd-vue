export interface SysDeptDataType {
    deptId: number; //ID
    pid?: number; //上级部门
    subCount?: number; //子部门数目
    name: string; //名称
    deptSort?: number; //排序
    enabled: boolean; //状态
    createBy?: string; //创建者
    updateBy?: string; //更新者
    createTime?: Date; //创建日期
    updateTime?: Date; //更新时间
    children?: SysDeptDataType[]; //子部门
}

export interface TableListQueryParams {
    page: number;
    size: number;
    pid?: number; //上级部门
    enabled?: boolean; //状态
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
