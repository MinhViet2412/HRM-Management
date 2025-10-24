import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ContractsAPI, Contract } from "../services/contracts";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import api from "../services/api";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrencyVN } from "../utils/format";

const statusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "active", label: "Hiệu lực" },
  { value: "expired", label: "Hết hạn" },
  { value: "terminated", label: "Chấm dứt" },
];

const Contracts = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Filters
  const [search, setSearch] = useState("");
  const [typeId, setTypeId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const queryClient = useQueryClient();

  // Fetch types
  const { data: types = [] } = useQuery(
    "contract-types",
    ContractsAPI.listTypes
  );

  // Fetch employees for dropdown
  const { data: employees = [] } = useQuery("employees", async () => {
    const response = await api.get("/employees");
    return response.data;
  });

  // Fetch contracts
  const { data: contracts = [], isLoading } = useQuery(
    ["contracts", { search, typeId, status, from, to }],
    async () => {
      const all = await ContractsAPI.list();
      return all.filter((c) => {
        const matchesSearch =
          !search ||
          c.contractCode.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeId || c.typeId === typeId;
        const matchesStatus = !status || c.status === status;
        const start = from ? new Date(from) : null;
        const end = to ? new Date(to) : null;
        const cStart = new Date(c.startDate);
        const inRange = (!start || cStart >= start) && (!end || cStart <= end);
        return matchesSearch && matchesType && matchesStatus && inRange;
      });
    }
  );

  const typeMap = useMemo(
    () => Object.fromEntries(types.map((t) => [t.id, t.name])),
    [types]
  );
  const employeeMap = useMemo(
    () =>
      Object.fromEntries(
        employees.map((e: any) => [
          e.id,
          `${e.firstName} ${e.lastName} (${e.employeeCode})`,
        ])
      ),
    [employees]
  );

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.contractCode?.trim()) {
      newErrors.contractCode = "Mã hợp đồng là bắt buộc";
    }
    if (!form.employeeId) {
      newErrors.employeeId = "Nhân viên là bắt buộc";
    }
    if (!form.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }
    if (!form.baseSalary || form.baseSalary <= 0) {
      newErrors.baseSalary = "Lương cơ bản phải lớn hơn 0";
    }
    if (
      form.endDate &&
      form.startDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      status: "pending",
      baseSalary: "",
      allowance: "",
      bonus: "",
    });
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({
      ...c,
      startDate: c.startDate?.slice(0, 10),
      endDate: c.endDate?.slice(0, 10) || "",
      baseSalary: c.baseSalary || "",
      allowance: c.allowance || "",
      bonus: c.bonus || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const createMutation = useMutation(
    (payload: any) => ContractsAPI.create(payload),
    {
      onSuccess: () => {
        toast.success("Tạo hợp đồng thành công");
        setModalOpen(false);
        queryClient.invalidateQueries("contracts");
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, payload }: { id: string; payload: any }) =>
      ContractsAPI.update(id, payload),
    {
      onSuccess: () => {
        toast.success("Cập nhật hợp đồng thành công");
        setModalOpen(false);
        queryClient.invalidateQueries("contracts");
      },
    }
  );

  const deleteMutation = useMutation((id: string) => ContractsAPI.remove(id), {
    onSuccess: () => {
      toast.success("Xoá hợp đồng thành công");
      queryClient.invalidateQueries("contracts");
    },
  });

  const approveMutation = useMutation((id: string) => ContractsAPI.approve(id), {
    onSuccess: () => {
      toast.success('Đã duyệt hợp đồng');
      queryClient.invalidateQueries('contracts');
    }
  })
  const rejectMutation = useMutation(({id, reason}:{id:string;reason?:string}) => ContractsAPI.reject(id, reason), {
    onSuccess: () => {
      toast.success('Đã từ chối hợp đồng');
      queryClient.invalidateQueries('contracts');
    }
  })

  const save = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const payload = {
      contractCode: form.contractCode.trim(),
      employeeId: form.employeeId,
      typeId: form.typeId || undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      baseSalary: Number(form.baseSalary),
      allowance: form.allowance ? Number(form.allowance) : 0,
      bonus: form.bonus ? Number(form.bonus) : 0,
      status: form.status || "pending",
      notes: form.notes || undefined,
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
    if (!confirm("Bạn có muốn xoá hợp đồng này?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('contracts.title') as any}</h1>
        {(user?.role === "admin" || user?.role === "manager") && (
          <button className="btn btn-primary" onClick={openCreate}>
            <span className="mr-2">+</span>{t('contracts.add') as any}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <input
            className="input"
            placeholder={t('contracts.searchPlaceholder') as any}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="input"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            <option value="">{t('contracts.allTypes') as any}</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{t('contracts.allStatuses') as any}</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="date"
            className="input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <input
            type="date"
            className="input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('contracts.code') as any}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contracts.employee') as any}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contracts.type') as any}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contracts.start') as any}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contracts.end') as any}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contracts.status') as any}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contracts.baseSalary') as any}
                </th>
                {(user?.role === "admin" || user?.role === "manager") && (
                  <th className="px-4 py-2"></th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 whitespace-nowrap font-medium">
                    {c.contractCode}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {c.employeeId ? employeeMap[c.employeeId] || "N/A" : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {c.typeId ? typeMap[c.typeId] : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(c.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {c.endDate ? new Date(c.endDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        c.status === "active"
                          ? "bg-green-100 text-green-800"
                          : c.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : c.status === "expired"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusOptions.find((s) => s.value === c.status)?.label ||
                        c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatCurrencyVN(c.baseSalary)}
                  </td>
                  {(user?.role === "admin" || user?.role === "manager") && (
                  <td className="px-4 py-2 whitespace-nowrap space-x-2">
                      {c.status === 'pending' && (
                        <>
                          <button className="btn btn-primary" onClick={()=>approveMutation.mutate(c.id)}>Duyệt</button>
                          <button className="btn btn-danger" onClick={()=>{
                            const reason = prompt('Lý do từ chối (tuỳ chọn)') || undefined;
                            rejectMutation.mutate({ id: c.id, reason })
                          }}>Từ chối</button>
                        </>
                      )}
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                      onClick={() => openEdit(c)}
                      title="Sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                      onClick={() => remove(c.id)}
                      title="Xoá"
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    </td>
                  )}
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      user?.role === "admin" || user?.role === "manager" ? 8 : 7
                    }
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Không có hợp đồng
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
                {editing ? "Sửa hợp đồng" : "Thêm hợp đồng"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mã hợp đồng <span className="text-red-500">*</span>
                </label>
                <input
                  className={`input mt-1 ${
                    errors.contractCode ? "border-red-500" : ""
                  }`}
                  value={form.contractCode || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      contractCode: e.target.value,
                    }))
                  }
                  placeholder="VD: HD2024001"
                />
                {errors.contractCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contractCode}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nhân viên <span className="text-red-500">*</span>
                </label>
                <select
                  className={`input mt-1 ${
                    errors.employeeId ? "border-red-500" : ""
                  }`}
                  value={form.employeeId || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, employeeId: e.target.value }))
                  }
                >
                  <option value="">Chọn nhân viên</option>
                  {employees.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.employeeCode})
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.employeeId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại hợp đồng
                </label>
                <select
                  className="input mt-1"
                  value={form.typeId || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      typeId: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">Chọn loại</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  className="input mt-1"
                  value={form.status || "pending"}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, status: e.target.value }))
                  }
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`input mt-1 ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                  value={form.startDate || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, startDate: e.target.value }))
                  }
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className={`input mt-1 ${
                    errors.endDate ? "border-red-500" : ""
                  }`}
                  value={form.endDate || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, endDate: e.target.value }))
                  }
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lương cơ bản (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className={`input mt-1 ${
                    errors.baseSalary ? "border-red-500" : ""
                  }`}
                  value={form.baseSalary || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, baseSalary: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                />
                {errors.baseSalary && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.baseSalary}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phụ cấp (VNĐ)
                </label>
                <input
                  type="number"
                  className="input mt-1"
                  value={form.allowance || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, allowance: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thưởng (VNĐ)
                </label>
                <input
                  type="number"
                  className="input mt-1"
                  value={form.bonus || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, bonus: e.target.value }))
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  className="input mt-1"
                  value={form.notes || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, notes: e.target.value }))
                  }
                />
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

export default Contracts;
