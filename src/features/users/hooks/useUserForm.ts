import { useCallback, useMemo, useRef, useState } from 'react';
import { AppError, toAppError, type AppError as AppErrorType } from '@/core/errors';
import {
  normalizeEmail,
  normalizeText,
  pickAndCompressImage,
  validateEmail,
  validateFullName,
  validatePassword,
  type ImagePickSource,
} from '@/core/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { createUser, updateUser } from '../userService';
import type { UserRecord } from '../types';

export type UserFormField = 'email' | 'hoten' | 'matkhau';

export type UserFormValues = {
  email: string;
  hoten: string;
  matkhau: string;
  hinhanh: string;
};

export type UserFormErrors = Partial<Record<UserFormField, string>>;

type Params = {
  user?: UserRecord;
  onSaved: (saved: UserRecord) => void;
};

function createInitialValues(user?: UserRecord): UserFormValues {
  if (!user) {
    return {
      email: '',
      hoten: '',
      matkhau: '',
      hinhanh: '',
    };
  }
  return {
    email: user.email,
    hoten: user.hoten,
    matkhau: '',
    hinhanh: user.hinhanh,
  };
}

export function useUserForm({ user, onSaved }: Params) {
  const { syncCurrentUser } = useAuth();
  const isEdit = Boolean(user);

  const [initial] = useState<UserFormValues>(() => createInitialValues(user));
  const [values, setValues] = useState<UserFormValues>(initial);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<AppErrorType | null>(null);
  const [permissionIssue, setPermissionIssue] = useState<ImagePickSource | null>(null);

  const savingRef = useRef(false);

  const dirty = useMemo(() => {
    const emailChanged = !isEdit && normalizeEmail(values.email) !== normalizeEmail(initial.email);
    const nameChanged = normalizeText(values.hoten) !== normalizeText(initial.hoten);
    const imageChanged = values.hinhanh !== initial.hinhanh;
    const passwordEntered = values.matkhau.length > 0;
    return emailChanged || nameChanged || imageChanged || passwordEntered;
  }, [initial.email, initial.hoten, initial.hinhanh, isEdit, values]);

  const setField = useCallback(
    <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
      setSaveError(null);
      if (field === 'email' || field === 'hoten' || field === 'matkhau') {
        const errorField: UserFormField = field;
        setErrors((current) => {
          if (!(errorField in current)) return current;
          const next = { ...current };
          delete next[errorField];
          return next;
        });
      }
    },
    [],
  );

  const dismissPermissionIssue = useCallback(() => setPermissionIssue(null), []);

  const pickImage = useCallback(
    (source: ImagePickSource) => {
      if (imageBusy || saving) return;

      setImageBusy(true);
      setImageError(null);
      setSaveError(null);

      pickAndCompressImage(source)
        .then((outcome) => {
          if (outcome.status === 'permission-denied') {
            setPermissionIssue(outcome.source);
            return;
          }
          if (outcome.status === 'picked') {
            setValues((current) => ({ ...current, hinhanh: outcome.base64Uri }));
          }
        })
        .catch((error: unknown) => {
          const mapped = toAppError(error, 'storage');
          setImageError(mapped.message);
        })
        .finally(() => setImageBusy(false));
    },
    [imageBusy, saving],
  );

  const removeImage = useCallback(() => {
    setImageError(null);
    setValues((current) => ({ ...current, hinhanh: '' }));
  }, []);

  const validateAll = useCallback((): UserFormErrors => {
    const found: UserFormErrors = {};

    if (!isEdit) {
      const emailErr = validateEmail(values.email);
      if (emailErr) found.email = emailErr;
    }

    const nameErr = validateFullName(values.hoten);
    if (nameErr) found.hoten = nameErr;

    const passwordErr = validatePassword(values.matkhau, { required: !isEdit });
    if (passwordErr) found.matkhau = passwordErr;

    return found;
  }, [isEdit, values.email, values.hoten, values.matkhau]);

  const save = useCallback((): UserFormErrors => {
    if (savingRef.current || imageBusy) return {};

    const found = validateAll();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return found;
    }

    savingRef.current = true;
    setSaving(true);
    setSaveError(null);

    const run = async () => {
      const saved = user
        ? await updateUser(user.id, {
            hoten: values.hoten,
            hinhanh: values.hinhanh,
            matkhau: values.matkhau,
          })
        : await createUser({
            email: values.email,
            hoten: values.hoten,
            matkhau: values.matkhau,
            hinhanh: values.hinhanh,
          });

      await syncCurrentUser(saved);
      onSaved(saved);
    };

    run()
      .catch((error: unknown) => {
        const mapped = toAppError(error, 'storage');
        if (mapped instanceof AppError && mapped.code === 'conflict') {
          setErrors((current) => ({ ...current, email: mapped.message }));
        }
        setSaveError(mapped);
      })
      .finally(() => {
        savingRef.current = false;
        setSaving(false);
      });

    return {};
  }, [imageBusy, onSaved, syncCurrentUser, user, validateAll, values]);

  return {
    isEdit,
    values,
    errors,
    dirty,
    saving,
    imageBusy,
    imageError,
    saveError,
    permissionIssue,
    dismissPermissionIssue,
    setField,
    pickImage,
    removeImage,
    save,
  };
}