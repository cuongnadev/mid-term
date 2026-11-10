export type UserFields = {
  email: string;
  matkhau: string;
  hoten: string;
  hinhanh: string;
};

export type UserRecord = UserFields & {
  id: string;
};

export type PublicUser = Omit<UserRecord, 'matkhau'>;

export type CreateUserInput = {
  email: string;
  matkhau: string;
  hoten: string;
  hinhanh: string;
};

export type UpdateUserInput = {
  hoten: string;
  hinhanh: string;
  matkhau?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    hoten: user.hoten,
    hinhanh: user.hinhanh,
  };
}