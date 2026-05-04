import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  getUsers,
  updateUserDepartment,
  updateUserRole,
} from "../services/adminService";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
};

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

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

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <Header />

      <h2>Admin - User Management</h2>

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
                  <select
                    value={user.role}
                    onChange={(event) =>
                      handleRoleChange(user.id, event.target.value)
                    }
                  >
                    <option value="Employee">Employee</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>
                  <input
                    value={user.department}
                    onChange={(event) =>
                      handleDepartmentChange(user.id, event.target.value)
                    }
                  />
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