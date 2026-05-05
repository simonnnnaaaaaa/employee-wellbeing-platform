import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  getUsers,
  updateUserDepartment,
  updateUserRole,
} from "../services/adminService";
import { getDepartments } from "../services/adminService";
import { createDepartment } from "../services/adminService";


type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  departmentId?: string;
};

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [editingDepartmentUserId, setEditingDepartmentUserId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [editingRoleUserId, setEditingRoleUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [departmentMessage, setDepartmentMessage] = useState("");



  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function handleRoleChange(userId: string, role: string) {
    await updateUserRole(userId, role);
    await loadUsers();
  }

  async function handleDepartmentChange(userId: string, department: string) {
    await updateUserDepartment(userId, department);
    await loadUsers();
  }

  async function loadDepartments() {
    const data = await getDepartments();
    setDepartments(data);
  }

  async function handleCreateDepartment(event: React.FormEvent) {
    event.preventDefault();

    try {
      await createDepartment(newDepartmentName);
      setDepartmentMessage("Department created successfully.");
      setNewDepartmentName("");
      await loadDepartments();
    } catch {
      setDepartmentMessage("Could not create department.");
    }
  }

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  return (
    <div>
      <Header />

      <h2>Admin - User Management</h2>

      <h3>Departments</h3>

      {departmentMessage && <p>{departmentMessage}</p>}

      <form onSubmit={handleCreateDepartment}>
        <input
          type="text"
          placeholder="New department name"
          value={newDepartmentName}
          onChange={(event) => setNewDepartmentName(event.target.value)}
        />

        <button type="submit">Add department</button>
      </form>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>
                  {editingRoleUserId === user.id ? (
                    <>
                      <select
                        value={selectedRole}
                        onChange={(event) => setSelectedRole(event.target.value)}
                      >
                        <option value="Employee">Employee</option>
                        <option value="HR">HR</option>
                        <option value="Admin">Admin</option>
                      </select>

                      <button
                        onClick={async () => {
                          await handleRoleChange(user.id, selectedRole);
                          setEditingRoleUserId(null);
                          setSelectedRole("");
                        }}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingRoleUserId(null);
                          setSelectedRole("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{user.role}</span>

                      <button
                        onClick={() => {
                          setEditingRoleUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </td>
                <td>
                  {editingDepartmentUserId === user.id ? (
                    <>
                      <select
                        value={selectedDepartmentId}
                        onChange={(event) => setSelectedDepartmentId(event.target.value)}
                      >
                        <option value="">Select department</option>

                        {departments.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={async () => {
                          if (!selectedDepartmentId) return;

                          await handleDepartmentChange(user.id, selectedDepartmentId);
                          setEditingDepartmentUserId(null);
                          setSelectedDepartmentId("");
                        }}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingDepartmentUserId(null);
                          setSelectedDepartmentId("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{user.department || "Unassigned"}</span>

                      <button
                        onClick={() => {
                          setEditingDepartmentUserId(user.id);
                          setSelectedDepartmentId(user.departmentId || "");
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsersPage;