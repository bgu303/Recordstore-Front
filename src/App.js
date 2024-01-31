import './App.css';
import FrontPage from './components/Frontpage';
import Records from './components/Records';
import CreateUser from './components/Createuser';
import Login from './components/Login';
import Shoppingcart from './components/Shoppingcart';
import Logout from './components/Logout';
import "./App.css";
import { useState, useEffect } from "react";
import AddRecord from './components/Addrecord';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./styling/Navbar.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    email: "",
    role: "",
    id: null
  });

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUserId = localStorage.getItem("loggedInUserId");
    const storedUserEmail = localStorage.getItem("loggedInUserEmail");
    const storedUserRole = localStorage.getItem("loggedInUserRole");

    if (storedIsLoggedIn === "true") {
        setIsLoggedIn(true);
        setLoggedInUser({
            email: storedUserEmail,
            role: storedUserRole,
            id: parseInt(storedUserId, 10)
        });
    }
}, []);

  return (
    <Router>
      <div>
        <nav>
          <nav className="navbar">
            <Link to="/" className="nav-link">Etusivu</Link>
            <Link to="/records" className="nav-link">Levylista</Link>
            { isLoggedIn && <Link to="/shoppingcart" className="nav-link">Ostoskori</Link> }
            { isLoggedIn && loggedInUser.role === "ADMIN" && <Link to="/addrecord" className="nav-link">Lisää Levy</Link> }
            { !isLoggedIn && <Link to="/createuser" className="nav-link">Luo Käyttäjä</Link> }
            { !isLoggedIn && <Link to="/login" className="nav-link">Kirjaudu Sisään</Link> }
            { isLoggedIn && <Logout setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser}/> }
          </nav>
        </nav>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/records" element={<Records isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} />} />
          <Route path="/createuser" element={<CreateUser />} />
          <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />} />
          <Route path="/shoppingcart" element={<Shoppingcart loggedInUser={loggedInUser} />} />
          <Route path="/addrecord" element={<AddRecord />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
