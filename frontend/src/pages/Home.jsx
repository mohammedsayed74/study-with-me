import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }

  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (

    <div className="home">

      <h1>Welcome to Study With Me</h1>

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}

export default Home;