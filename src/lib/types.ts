export type ItemStatus = "active" | "inactive" | "archived" | "draft";
export type ItemCategory =
  | "electronics"
  | "clothing"
  | "food"
  | "home"
  | "sports"
  | "books"
  | "other";

export type UserRole = "viewer" | "editor" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

export type AdminUserCreate = {
  email: string;
  role: UserRole;
};

export type UserAdminUpdate = {
  role?: UserRole;
  is_active?: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
  csrf_token?: string | null;
};

export type Item = {
  id: string;
  name: string;
  sku: string;
  category: ItemCategory;
  status: ItemStatus;
  price: number;
  quantity: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type CursorPaginationMeta = {
  page_size: number;
  total: number;
  has_more: boolean;
  next_cursor: string | null;
};

export type ItemListResponse = {
  data: Item[];
  meta: CursorPaginationMeta;
};

export type ItemQuery = {
  cursor: string;
  page_size: number;
  sort_by: string;
  sort_order: "asc" | "desc";
  q: string;
  category: string;
  status: string;
  min_price: string;
  max_price: string;
  min_quantity: string;
  max_quantity: string;
};

export type BulkAction = "delete" | "set_status" | "adjust_quantity";

export type ColumnId =
  | "name"
  | "sku"
  | "category"
  | "status"
  | "price"
  | "quantity"
  | "created_at"
  | "updated_at";
