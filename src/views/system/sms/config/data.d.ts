export interface ConfigDataType {
    id: number; //ID
    name: string; //配置名称
    platformType: number; //1 阿里云 2 腾讯云
    secretId: string; //访问密钥id
    secretKey?: string; //访问密钥
    appId?: string; //应用id
    signName?: string; //签名id
    templateCode?: string; //模板code
    domain?: string; //访问域名
    status: boolean; //激活状态
    createTime?: Date; //创建日期
    updateTime?: Date; //更新时间
}

export interface TableListQueryParams {
    page: number;
    size: number;
    platformType?: number; //1 阿里云 2 腾讯云
    signName?: string; //签名id
    templateCode?: string; //模板code
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
