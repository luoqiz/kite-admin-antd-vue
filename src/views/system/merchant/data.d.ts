export interface MerchantDetailsDataType {
    detailsId: string; //列表id
    payType: string; //支付类型(支付渠道) 详情查看com.egzosn.pay.spring.boot.core.merchant.PaymentPlatform对应子类，aliPay 支付宝， wxPay微信..等等
    appid?: string; //应用id
    mchId?: string; //商户id，商户号，合作伙伴id等等
    certStoreType?: string; //当前面私钥公钥为证书类型的时候，这里必填，可选值:PATH,STR,INPUT_STREAM
    keyPrivate?: string; //私钥或私钥证书
    keyPublic?: string; //公钥或公钥证书
    keyCert?: string; //key证书,附加证书使用，如SSL证书，或者银联根级证书方面
    keyCertPwd?: string; //私钥证书或key证书的密码
    notifyUrl?: string; //异步回调
    returnUrl?: string; //同步回调地址，大部分用于付款成功后页面转跳
    signType: string; //签名方式,目前已实现多种签名方式详情查看com.egzosn.pay.common.util.sign.encrypt。MD5,RSA等等
    seller?: string; //收款账号，暂时只有支付宝部分使用，可根据开发者自行使用
    subAppId?: string; //子appid
    subMchId?: string; //子商户id
    inputCharset: string; //编码类型，大部分为utf-8
    isTest: number; //是否为测试环境: 0 否，1 测试环境
}

export interface TableListQueryParams {
    page: number;
    size: number;
    detailsId?: string; //列表id
    payType?: string; //支付类型(支付渠道) 详情查看com.egzosn.pay.spring.boot.core.merchant.PaymentPlatform对应子类，aliPay 支付宝， wxPay微信..等等
    appid?: string; //应用id
    mchId?: string; //商户id，商户号，合作伙伴id等等
    subAppId?: string; //子appid
    subMchId?: string; //子商户id
    isTest?: number; //是否为测试环境: 0 否，1 测试环境
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
