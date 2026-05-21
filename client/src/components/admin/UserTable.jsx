export default function UserTable() {
  const users = [
    { id: 1, name: 'Olivia Grant', role: 'Member', status: 'Active' },
    { id: 2, name: 'Noah Reed', role: 'Admin', status: 'Active' },
  ];

  return (
    <section className="card">
      <h3>Users</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
