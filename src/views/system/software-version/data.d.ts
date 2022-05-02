export interface SysSoftwareVersionDataType {
    id: number; //ID
    type: string; //软件类型 
    versionName?: string; //版本名称
    version?: string; //版本号
    build?: string; //当前版本构建次数
    mark?: string; //版本更新内容
    forceUpdate?: boolean; //版本更新内容
    downlaodUrl?: string; //下载地址
    downloadNum?: string; //下载次数
    createTime?: Date; //创建日期
    updateTime?: Date; //更新时间
}

export interface TableListQueryParams {
    page: number;
    size: number;
    type?: string; //软件类型 1app 2网站
    versionName?: string; //版本名称
    createTime?: Date; //创建日期
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
