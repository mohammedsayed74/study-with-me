async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mohamed@example.com',
        password: 'newpassword123' // Try to login, adjust as needed
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Got token");
    
    // Now try to update T101
    const updateRes = await fetch('http://localhost:5000/api/courses/T101', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: "test2", description: "lololol" })
    });
    const updateData = await updateRes.json();
    console.log("Update status:", updateRes.status);
    console.log("Update response:", updateData);
  } catch (err) {
    console.error("Update failed:", err.message);
  }
}
test();
