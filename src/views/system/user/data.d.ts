export interface SysUserDataType {
  userId: number; //ID
  deptId?: number; //部门名称
  username?: string; //用户名
  nickName?: string; //昵称
  gender?: string; //性别
  phone?: string; //手机号码
  email?: string; //邮箱
  avatarName?: string; //头像地址
  avatarPath?: string; //头像真实路径
  password?: string; //密码
  isAdmin?: boolean; //是否为admin账号
  enabled?: boolean; //状态：1启用、0禁用
  expireTime?: Date; //账号到期时间
  nonLocked?: boolean; //账号是否未锁定
  createBy?: string; //创建者
  updateBy?: string; //更新者
  pwdResetTime?: Date; //修改密码的时间
  createTime?: Date; //创建日期
  updateTime?: Date; //更新时间
  jobIds?: string[]; //岗位id列表
  roleIds?: string[]; //角色id列表
}

export interface TableListQueryParams {
  page: number;
  size: number;
  deptId?: number; //部门名称
  username?: string; //用户名
  nickName?: string; //昵称
  phone?: string; //手机号码
  isAdmin?: boolean; //是否为admin账号
  enabled?: boolean; //状态：1启用、0禁用
  expireTime?: Date; //账号到期时间
  nonLocked?: boolean; //账号是否未锁定
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
