export interface RecordDataType {
    id: number; //ID
    phone: string; //手机号
    code: string; //验证码
    mark?: string; //备注
    expiredTime: Date; //过期时间
    createTime?: Date; //创建日期
    updateTime?: Date; //更新时间
}

export interface TableListQueryParams {
    page: number;
    size: number;
    phone?: string; //手机号
    expiredTime?: Date; //过期时间
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
