export interface SysMenuDataType {
  menuId: number; //ID
  pid?: number; //上级菜单ID
  subCount?: number; //子菜单数目
  type?: number; //菜单类型
  title?: string; //菜单标题
  name?: string; //组件名称
  component?: string; //组件
  menuSort?: number; //排序
  icon?: string; //图标
  path?: string; //链接地址
  iFrame?: boolean; //是否外链
  cache?: boolean; //缓存
  hidden?: boolean; //隐藏
  permission?: string; //权限
  createBy?: string; //创建者
  updateBy?: string; //更新者
  createTime?: Date; //创建日期
  updateTime?: Date; //更新时间
  children?: SysMenuDataType[]; // 子菜单
}

export interface TableListQueryParams {
  page: number;
  size: number;
  pid?: number; //上级菜单ID
  type?: number; //菜单类型
  title?: string; //菜单标题
  name?: string; //组件名称
  component?: string; //组件
  iFrame?: boolean; //是否外链
  permission?: string; //权限
}

export interface PaginationConfig {
  total: number;
  current: number;
  pageSize: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
}

export interface TableDataType {
  list: SysMenuDataType[];
  pagination: PaginationConfig;
}

export interface RoleMenuRelationQueryParams {
  roleId: number;
  menuId: number;
}

export interface RoleMenuRelationSaveParams {
  roleId: number;
  menuIds: number[];
}
