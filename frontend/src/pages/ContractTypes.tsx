import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ContractTypesAPI, ContractType } from "../services/contract-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ContractTypes = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Filters
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContractType | null>(null);
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const queryClient = useQueryClient();

  // Fetch contract types
  const { data: contractTypes = [], isLoading } = useQuery(
    ["contract-types", { search }],
    async () => {
      const all = await ContractTypesAPI.list();
      return all.filter((ct) => {
        const matchesSearch =
          !search ||
          ct.name.toLowerCase().includes(search.toLowerCase()) ||
          (ct.description && ct.description.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch;
      });
    }
  );

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.name?.trim()) {
      newErrors.name = "Tên loại hợp đồng là bắt buộc";
    }
    if (form.standardTermMonths && form.standardTermMonths < 0) {
      newErrors.standardTermMonths = "Thời hạn chuẩn phải lớn hơn hoặc bằng 0";
    }
    if (form.probationMonths && form.probationMonths < 0) {
      newErrors.probationMonths = "Thời gian thử việc phải lớn hơn hoặc bằng 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      standardTermMonths: "",
      probationMonths: "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (ct: ContractType) => {
    setEditing(ct);
    setForm({
      name: ct.name,
      description: ct.description || "",
      standardTermMonths: ct.standardTermMonths || "",
      probationMonths: ct.probationMonths || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const createMutation = useMutation(
    (payload: any) => ContractTypesAPI.create(payload),
    {
      onSuccess: () => {
        toast.success("Tạo loại hợp đồng thành công");
        setModalOpen(false);
        queryClient.invalidateQueries("contract-types");
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, payload }: { id: string; payload: any }) =>
      ContractTypesAPI.update(id, payload),
    {
      onSuccess: () => {
        toast.success("Cập nhật loại hợp đồng thành công");
        setModalOpen(false);
        queryClient.invalidateQueries("contract-types");
      },
    }
  );

  const deleteMutation = useMutation((id: string) => ContractTypesAPI.remove(id), {
    onSuccess: () => {
      toast.success("Xoá loại hợp đồng thành công");
      queryClient.invalidateQueries("contract-types");
    },
  });

  const save = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      standardTermMonths: form.standardTermMonths ? Number(form.standardTermMonths) : undefined,
      probationMonths: form.probationMonths ? Number(form.probationMonths) : undefined,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const remove = (id: string) => {
    if (!confirm("Bạn có muốn xoá loại hợp đồng này?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('contractTypes.title') as any}</h1>
        {(user?.role === "admin" || user?.role === "manager") && (
          <button className="btn btn-primary" onClick={openCreate}>
            <span className="mr-2">+</span>{t('contractTypes.add') as any}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <input
              className="input"
              placeholder={t('contractTypes.searchPlaceholder') as any}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-2 overflow-x-auto card">
        {isLoading ? (
          <div className="p-6">{t("common.loading")}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('contractTypes.name') as any}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('contractTypes.description') as any}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('contractTypes.standardTerm') as any}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('contractTypes.probation') as any}</th>
                {(user?.role === "admin" || user?.role === "manager") && (
                  <th className="px-4 py-2"></th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contractTypes.map((ct) => (
                <tr key={ct.id}>
                  <td className="px-4 py-2 whitespace-nowrap font-medium">
                    {ct.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {ct.description || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {ct.standardTermMonths ? `${ct.standardTermMonths} tháng` : "Không xác định"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {ct.probationMonths ? `${ct.probationMonths} tháng` : "Không có"}
                  </td>
                  {(user?.role === "admin" || user?.role === "manager") && (
                    <td className="px-4 py-2 whitespace-nowrap space-x-2">
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                        onClick={() => openEdit(ct)}
                        title={t('common.edit') as any}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                        onClick={() => remove(ct.id)}
                        title={t('common.delete') as any}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {contractTypes.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      user?.role === "admin" || user?.role === "manager" ? 5 : 4
                    }
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    {t('contractTypes.noData') as any}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card p-6 w-full sm:max-w-xl bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editing ? "Sửa loại hợp đồng" : "Thêm loại hợp đồng"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên loại hợp đồng <span className="text-red-500">*</span>
                </label>
                <input
                  className={`input mt-1 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  value={form.name || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  placeholder="VD: Hợp đồng chính thức"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  className="input mt-1"
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả về loại hợp đồng"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Thời hạn chuẩn (tháng)
                  </label>
                  <input
                    type="number"
                    className={`input mt-1 ${
                      errors.standardTermMonths ? "border-red-500" : ""
                    }`}
                    value={form.standardTermMonths || ""}
                    onChange={(e) =>
                      setForm((f: any) => ({
                        ...f,
                        standardTermMonths: e.target.value,
                      }))
                    }
                    placeholder="12"
                    min="0"
                  />
                  {errors.standardTermMonths && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.standardTermMonths}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Thời gian thử việc (tháng)
                  </label>
                  <input
                    type="number"
                    className={`input mt-1 ${
                      errors.probationMonths ? "border-red-500" : ""
                    }`}
                    value={form.probationMonths || ""}
                    onChange={(e) =>
                      setForm((f: any) => ({
                        ...f,
                        probationMonths: e.target.value,
                      }))
                    }
                    placeholder="2"
                    min="0"
                  />
                  {errors.probationMonths && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.probationMonths}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {editing ? "Lưu" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTypes;
