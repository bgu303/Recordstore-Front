import './App.css';
import FrontPage from './components/Frontpage';
import Records from './components/Records';
import CreateUser from './components/Createuser';
import Login from './components/Login';
import Shoppingcart from './components/Shoppingcart';
import Logout from './components/Logout';
import AddRecord from './components/Addrecord';
import Ordersummary from './components/Ordersummary';
import ChatRoom from './components/Chat';
import DeleteUser from './components/Deleteuser';
import Orders from './components/Orders';
import OwnOrders from './components/OwnOrders';
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./styling/Navbar.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    email: "",
    role: "",
    id: null,
    token: null
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    paymentOption: "",
    shippingOption: ""
  });

  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUserId = localStorage.getItem("loggedInUserId");
    const storedUserEmail = localStorage.getItem("loggedInUserEmail");
    const storedUserRole = localStorage.getItem("loggedInUserRole");
    const storedToken = localStorage.getItem("jwtToken");

    if (storedIsLoggedIn === "true") {
      setIsLoggedIn(true);
      setLoggedInUser({
        email: storedUserEmail,
        role: storedUserRole,
        id: parseInt(storedUserId, 10),
        token: storedToken
      });
    }
  }, []);

  const messageChecker = () => {
    console.log(localStorage.getItem("latestMessage"))
  }

  useEffect(() => {
    const messageInterval = setInterval(messageChecker, 10000);
    
    return () => clearInterval(messageInterval); // Clear the interval when component unmounts or re-renders. Very important, without this the intervals "stack up".
  }, []);

  return (
    <Router>
      <div>
        <nav>
          <nav className="navbar">
            <Link to="/" className="nav-link">Etusivu</Link>
            <Link to="/records" className="nav-link">Levylista</Link>
            {isLoggedIn && <Link to="/shoppingcart" className="nav-link">Ostoskori</Link>}
            {isLoggedIn && <Link to="/chat" className="nav-link">Chatti</Link>}
            {isLoggedIn && loggedInUser.role !== "ADMIN" && <Link to="/ownorders" className="nav-link">Omat Tilaukseni</Link>}
            {isLoggedIn && loggedInUser.role === "ADMIN" && <Link to="/addrecord" className="nav-link">Lisää Levy</Link>}
            {isLoggedIn && loggedInUser.role === "ADMIN" && <Link to="/orders" className="nav-link">Tilaukset</Link>}
            {!isLoggedIn && <Link to="/createuser" className="nav-link">Luo Käyttäjä</Link>}
            {!isLoggedIn && <Link to="/login" className="nav-link">Kirjaudu Sisään</Link>}
            {isLoggedIn && <Logout setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser} />}
          </nav>
        </nav>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/records" element={<Records isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} />} />
          <Route path="/createuser" element={<CreateUser />} />
          <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />} />
          <Route path="/shoppingcart" element={<Shoppingcart loggedInUser={loggedInUser} customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} cartTotal={cartTotal} setCartTotal={setCartTotal} />} />
          <Route path="/chat" element={<ChatRoom loggedInUser={loggedInUser}/>} />
          <Route path="/addrecord" element={<AddRecord />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/ordersummary" element={<Ordersummary customerInfo={customerInfo} cartTotal={cartTotal} />} />
          <Route path='/deleteuser' element={<DeleteUser loggedInUser={loggedInUser} /> } />
          <Route path='/ownorders' element={<OwnOrders loggedInUser={loggedInUser} /> } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
