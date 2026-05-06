import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  createDepartment,
  getDepartments,
  getUsers,
  updateUserDepartment,
  updateUserRole,
} from "../services/adminService";
import {
  Building2,
  Check,
  Mail,
  Pencil,
  Plus,
  Search,
  Shield,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";



type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  departmentId?: string;
};

type Department = {
  id: string;
  name: string;
};

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingDepartmentUserId, setEditingDepartmentUserId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [departmentMessage, setDepartmentMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");


  const navigate = useNavigate();

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function loadDepartments() {
    const data = await getDepartments();
    setDepartments(data);
  }

  async function handleRoleChange(userId: string, role: string) {
    const currentUserEmail = localStorage.getItem("email");
    const user = users.find((u) => u.id === userId);

    // 🔥 dacă îți schimbi propriul rol
    if (user?.email === currentUserEmail && role !== "Admin") {
      const confirmChange = window.confirm(
        "Are you sure you want to change your role? You will be logged out."
      );

      if (!confirmChange) return;
    }

    await updateUserRole(userId, role);
    await loadUsers();

    if (user?.email === currentUserEmail && role !== "Admin") {
      localStorage.clear();
      navigate("/login");
      return;
    }

    setEditingRoleUserId(null);
    setSelectedRole("");
  }

  async function handleDepartmentChange(userId: string, departmentId: string) {
    await updateUserDepartment(userId, departmentId);
    await loadUsers();
    setEditingDepartmentUserId(null);
    setSelectedDepartmentId("");
  }

  async function handleCreateDepartment(event: React.FormEvent) {
    event.preventDefault();

    if (!newDepartmentName.trim()) return;

    try {
      await createDepartment(newDepartmentName);
      setDepartmentMessage("Department created successfully.");
      setNewDepartmentName("");
      await loadDepartments();

      setTimeout(() => setDepartmentMessage(""), 3000);
    } catch {
      setDepartmentMessage("Could not create department.");
    }
  }

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();

    return (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.department || "").toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  function getRoleBadgeStyles(role: string) {
    switch (role) {
      case "Admin":
        return "bg-rose-100 text-rose-700";
      case "HR":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-emerald-100 text-emerald-700";
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4faf2]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
            <UserCog className="h-6 w-6 text-green-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage users, roles, and departments
            </p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                <p className="text-sm text-slate-500">Total Users</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                <Building2 className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {departments.length}
                </p>
                <p className="text-sm text-slate-500">Departments</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                <Shield className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((user) => user.role === "Admin").length}
                </p>
                <p className="text-sm text-slate-500">Admins</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Departments</h2>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {departments.map((department) => (
              <span
                key={department.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                <Building2 className="h-3.5 w-3.5" />
                {department.name}
              </span>
            ))}
          </div>

          <form onSubmit={handleCreateDepartment} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="New department name"
              value={newDepartmentName}
              onChange={(event) => setNewDepartmentName(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-300 focus:ring-4 focus:ring-green-200/60 sm:max-w-xs"
            />

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#4caf58] px-5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition hover:bg-[#43a04f]"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>

          {departmentMessage && (
            <p
              className={`mt-3 text-sm font-medium ${departmentMessage.includes("successfully")
                ? "text-emerald-600"
                : "text-rose-600"
                }`}
            >
              {departmentMessage}
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">All Users</h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white/70 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-300 focus:ring-4 focus:ring-green-200/60 sm:w-72"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#f4faf2]/80">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Department
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-green-50/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </div>
                          <span className="font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {editingRoleUserId === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole}
                              onChange={(event) => setSelectedRole(event.target.value)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-300 focus:ring-4 focus:ring-green-200/60"
                            >
                              <option value="Employee">Employee</option>
                              <option value="HR">HR</option>
                              <option value="Admin">Admin</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRoleChange(user.id, selectedRole)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200"
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoleUserId(null);
                                setSelectedRole("");
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition hover:bg-rose-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeStyles(
                                user.role
                              )}`}
                            >
                              <Shield className="h-3 w-3" />
                              {user.role}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoleUserId(user.id);
                                setSelectedRole(user.role);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {editingDepartmentUserId === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedDepartmentId}
                              onChange={(event) =>
                                setSelectedDepartmentId(event.target.value)
                              }
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-300 focus:ring-4 focus:ring-green-200/60"
                            >
                              <option value="">Select department</option>

                              {departments.map((department) => (
                                <option key={department.id} value={department.id}>
                                  {department.name}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                if (!selectedDepartmentId) return;
                                handleDepartmentChange(user.id, selectedDepartmentId);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200"
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingDepartmentUserId(null);
                                setSelectedDepartmentId("");
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition hover:bg-rose-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.department
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                                }`}
                            >
                              <Building2 className="h-3 w-3" />
                              {user.department || "Unassigned"}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingDepartmentUserId(user.id);
                                setSelectedDepartmentId(user.departmentId || "");
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminUsersPage;