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
import SendFeedback from './components/Feedback';
import SearchRecords from './components/SearchRecords';
import SearchedRecords from './components/SearchedRecords';
import TermsOfUse from './components/Termsofuse';
import PrivacyStatement from './components/Privacystatement';
import FrontPageTool from './components/Frontpagetool';
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { TextField } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import "./styling/Navbar.css";
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import socket from './components/socket';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { BASE_URL, BASE_URL_CLOUD } from './components/Apiconstants';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    email: "",
    role: "",
    id: null,
    token: null
  });

  const [conversationId, setConversationId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [adminAllConversationMessages, setAdminAllConversationMessages] = useState([]);
  const [adminConversationIds, setAdminConversationIds] = useState([]);
  const [newMessageState, setNewMessageState] = useState(false);
  const [adminNewMessageIds, setAdminNewMessageIds] = useState([]);
  const [adminNewMessagesSinceLogin, setAdminNewMessagesSinceLogin] = useState([]);
  const [shoppingcart, setShoppingcart] = useState([]);
  const [token, setToken] = useState(null)
  const [shoppingcartSize, setShoppingcartSize] = useState(0);
  const [activePath, setActivePath] = useState("/");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [imageError, setImageError] = useState(false); //This is to track if Logo fails to load -> it displays "Etusivu" - text.

  //Idk if this will be used anymore, if anything I should make all of the things that use token use the token state as above ^ CURRENTLY USED ONLY IN LOGIN. Fix maybe?
  const token1 = localStorage.getItem("jwtToken")

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    paymentOption: "",
    shippingOption: ""
  });

  const [cartTotal, setCartTotal] = useState(0);
  const logo = "https://i.imgur.com/baI8pOI.png"

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

  //The fetching of conversation id and message logic is moved here from Chat component in order to track the websockets accordingly, wasn't possible before when websocket logic was inside Chat component.
  const fetchConversationId = async () => {
    if (!isLoggedIn || localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL_CLOUD}/chat/getconversationid/${localStorage.getItem("loggedInUserId")}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setConversationId(data[0].id);
        } else {
          console.error("No conversation ID found");
        }
      } else {
        throw new Error("Failed to fetch conversation ID");
      }
    } catch (error) {
      console.error("Error fetching conversation ID:", error);
    }
  }

  const fetchConversationMessages = async () => {
    // This is added because for whatever reason in cloud implementation it fetches the conversation messages with id 0.
    // This prevents it from happening, don't know why this happens, maybe explanation will be found out later.
    if (conversationId === null) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL_CLOUD}/chat/getconversationmessages/${conversationId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const responseData = await response.json();
        setConversationMessages(responseData);

        // Check if there are any messages where isRead is 0 (unread)
        const unreadMessages = responseData.filter(message => message.isread === 0);
        const unreadMessagesCount = unreadMessages.length;

        if (unreadMessagesCount > 0) {
          setNewMessageState(true);
        }
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
    }
  };

  const fetchConversationMessagesAdmin = () => {
    if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      return;
    }

    fetch(`${BASE_URL_CLOUD}/chat/getallconversationmessages`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Something went wrong while fetching all conversation messages");
        }
      })
      .then(responseData => {
        setAdminAllConversationMessages(responseData);

        // Filter out messages sent by other users
        const userMessages = responseData.filter(message => message.sender_id !== loggedInUser.id);

        if (userMessages.length > 0) {
          // Filter messages that have isread_admin = 0
          const unreadMessages = responseData.filter(message => message.isread_admin === 0);
          const unreadMessagesCount = unreadMessages.length;

          if (unreadMessagesCount > 0) {
            // Extract unique sender IDs from unread messages
            const uniqueSenderIds = [...new Set(unreadMessages.map(message => message.sender_id))];
            setAdminNewMessageIds(uniqueSenderIds);
            setNewMessageState(true); // Set only when there are unread messages
          }

        }
      })
      .catch(error => {
        console.error("Error fetching conversation messages:", error);
      });
  }

  const fetchConversationIdsAdmin = () => {
    if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      return;
    }

    fetch(`${BASE_URL_CLOUD}/chat/getallconversationids`)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error("Something went wrong while fetching all conversation ids.");
        }
      })
      .then(responseData => {
        setAdminConversationIds(responseData);
      })
  }

  //This useEffect is ran if normal user logs in.
  // This useEffect will fetch conversation ID and then fetch messages once the conversation ID is set.
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== null && localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      const fetchData = async () => {
        await fetchConversationId();
      };

      fetchData();
    }
  }, [isLoggedIn]);

  // This useEffect will fetch messages whenever the conversationId changes
  useEffect(() => {
    if (conversationId !== null) {
      fetchConversationMessages();
    }
  }, [conversationId]);

  //This useEffect is ran if admin logs in.
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== null && localStorage.getItem("loggedInUserRole") === "ADMIN") {
      fetchConversationMessagesAdmin();
      fetchConversationIdsAdmin();
    }
  }, [isLoggedIn])

  useEffect(() => {
    //This is here to stop admin joining to the socket when he joins a chat room, admin already is connected to every room socket, so only causes issues if he joins rooms again.
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }
    if (conversationId) {
      socket.emit("joinRoom", conversationId);
    }
  }, [conversationId]);

  //This useEffect is used to handle the socket logic for non-admin users. 
  useEffect(() => {
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }
    socket.on("message", (message) => {
      if (message.conversationId === conversationId) {
        setConversationMessages(prevMessages => [...prevMessages, message]);
        setNewMessageState(true);

        return;
      }
    });

    return () => {
      socket.off("message");
    };
  }, [conversationId]); //This dependency array needs to be here. I don't quite understand why, but that is the way things are. :)

  //Socket logic for admin user.
  useEffect(() => {
    if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      return;
    }

    const handleMessage = (message) => {
      if (message.conversationId === conversationId) {
        setConversationMessages(prevMessages => [...prevMessages, message]);
        setNewMessageState(true);

        return;
      }

      adminConversationIds.forEach(id => {
        if (message.conversationId === id.id) {
          setNewMessageState(true);

          // Add the conversationId to the adminNewMessageIds state if it doesn't already exist
          setAdminNewMessageIds((prevIds) => {
            if (!prevIds.includes(message.sender_id)) {
              return [...prevIds, message.sender_id];
            }
            return prevIds;
          });
        }
      });
    };

    socket.on("message", handleMessage);

    // Joining rooms for the admin user
    adminConversationIds.forEach(id => {
      socket.emit('joinRoom', id.id);
    });

    return () => {
      socket.off("message", handleMessage);
    };
  }, [isLoggedIn, adminConversationIds, conversationId]);

  // Function to show shopping cart
  const showShoppingcart = () => {
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }
    fetch(`${BASE_URL_CLOUD}/shoppingcart/shoppingcartitems/${localStorage.getItem("loggedInUserId")}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch shopping cart items');
        }
      })
      .then(responseData => {
        setShoppingcartSize(responseData.length)
      })
      .catch(error => console.error("Error:", error));
  };

  // Function to get all the orders. This is used for admin so it can fetch all the orders and indicate if new ones have arrived.
  const getAllOrders = () => {
    if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      return;
    }

    fetch(`${BASE_URL_CLOUD}/orders/getallorders/`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          console.log("Failed to fetch orders.");
          return [];
        }
      })
      .then(responseData => {
        const newOrderCounter = responseData.filter(order => order.order_status === "Vastaanotettu").length;
        setNewOrderCount(newOrderCounter);
      })
      .catch(error => console.error("Error:", error));
  }

  useEffect(() => {
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      getAllOrders();
    }
  }, [loggedInUser]);

  // useEffect to trigger showShoppingcart
  useEffect(() => {
    if (loggedInUser.id) {
      showShoppingcart();
    }
  }, [token, loggedInUser.id]);

  const clickedLink = (path, setActivePath) => {
    setSearchOpen(false);
    localStorage.setItem("path", path);
    setActivePath(path);
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const savedPath = localStorage.getItem("path");
    if (savedPath) {
      setActivePath(savedPath);
    }
  }, []);

  const openSearch = () => {
    if (searchOpen === true) {
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  }

  const handleLogout = (callback) => {
    setIsLoggedIn(false);
    setLoggedInUser({
      email: "",
      role: "",
      id: null,
      token: null
    });
    localStorage.clear();

    if (callback) callback();
  }

  //This is used to "Logout" so to speak, to check if the token is expired ---> empties login details and localStorage.
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          handleLogout();
        }
      } catch (error) {
        handleLogout();
      }
    } else {
      handleLogout();
    }
  }, []);

  return (
    <Router>
      <div>
        <div className="hamburgerMenuButton">
          <IconButton onClick={() => toggleMenu()} style={{ color: "white" }}>
            <MenuIcon />
          </IconButton>
        </div>
        <nav className={`navbar ${isOpen ? "isOpen" : ""}`}>
          <div className="nav-left">
            <div className="nav-left">
              <Link
                to="/"
                className={`nav-link logo ${activePath === "/" ? "active" : ""}`}
                onClick={() => clickedLink("/", setActivePath)}
              >
                {imageError ? (
                  "Etusivu"
                ) : (
                  <img
                    src="https://i.imgur.com/baI8pOI.png"
                    alt="Logo"
                    style={{ height: '25px' }}
                    onError={() => setImageError(true)}
                  />
                )}
              </Link>
            </div>
            <Link
              to="/records"
              className={`nav-link ${activePath === "/records" ? "active" : ""}`}
              onClick={() => clickedLink("/records", setActivePath)}
            >
              Levylista
            </Link>
            {isLoggedIn && (
              <Link
                to="/chat"
                className={`nav-link ${activePath === "/chat" ? "active" : ""}`}
                onClick={() => clickedLink("/chat", setActivePath)}
              >
                Chatti
                {newMessageState && <span className="notification-badge-shoppingcart notification-badge"></span>}
              </Link>
            )}
            {isLoggedIn && loggedInUser.role !== "ADMIN" && (
              <Link
                to="/ownorders"
                className={`nav-link ${activePath === "/ownorders" ? "active" : ""}`}
                onClick={() => clickedLink("/ownorders", setActivePath)}
              >
                Omat Tilaukseni
              </Link>
            )}
            {isLoggedIn && loggedInUser.role === "ADMIN" && (
              <>
                <Link
                  to="/addrecord"
                  className={`nav-link ${activePath === "/addrecord" ? "active" : ""}`}
                  onClick={() => clickedLink("/addrecord", setActivePath)}
                >
                  Lisää Levy
                </Link>
                <Link
                  to="/orders"
                  className={`nav-link ${activePath === "/orders" ? "active" : ""}`}
                  onClick={() => clickedLink("/orders", setActivePath)}
                >
                  Tilaukset
                  {newOrderCount > 0 && <span className="notification-badge-shoppingcart notification-badge">{newOrderCount}</span>}
                </Link>
                <Link
                  to="/frontpagetool"
                  className={`nav-link ${activePath === "/frontpagetool" ? "active" : ""}`}
                  onClick={() => clickedLink("/frontpagetool", setActivePath)}
                >
                  Etusivutyökalu
                </Link>
              </>
            )}
            {isLoggedIn && loggedInUser.role !== "ADMIN" && (
              <Link
                to="/sendfeedback"
                className={`nav-link ${activePath === "/sendfeedback" ? "active" : ""}`}
                onClick={() => clickedLink("/sendfeedback", setActivePath)}
              >
                Lähetä Palautetta
              </Link>
            )}
            <div className="searchBarDiv first">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <IconButton
                  style={{ color: 'white', paddingLeft: 15 }}
                  onClick={() => openSearch()}
                >
                  <SearchIcon />
                </IconButton>
                {searchOpen && (
                  <SearchRecords
                    setSearchOpen={setSearchOpen}
                    searchResults={searchResults}
                    setSearchResults={setSearchResults}
                  />
                )}
              </div>
            </div>
            <div className="searchUnderline"></div>
          </div>
          <div className="nav-right">
            {isLoggedIn && loggedInUser.role !== "ADMIN" && (
              <Link
                to="/shoppingcart"
                className={`nav-link nav-link-shoppingcart first ${activePath === "/shoppingcart" ? "active" : ""}`}>
                <ShoppingCartIcon />
                {shoppingcartSize >= 0 && <span className="notification-badge-shoppingcart notification-badge">{shoppingcartSize}</span>}
              </Link>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  to="/createuser"
                  className={`nav-link nav-linkMobile nav-linkMobileCreateUser ${activePath === "/createuser" ? "active" : ""}`}
                  onClick={() => clickedLink("/createuser", setActivePath)}
                >
                  Luo Käyttäjä
                </Link>
                <Link
                  to="/login"
                  className={`nav-link nav-linkMobile ${activePath === "/login" ? "active" : ""}`}
                  onClick={() => clickedLink("/login", setActivePath)}
                >
                  Kirjaudu Sisään
                </Link>
              </>
            )}
            {isLoggedIn && (
              <Logout setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser} setNewMessageState={setNewMessageState} handleLogout={handleLogout} />
            )}
          </div>
        </nav>
        <div className="mobileDiv">
          {isLoggedIn && loggedInUser.role !== "ADMIN" && (
            <Link
              to="/shoppingcart"
              className={`nav-link nav-link-shoppingcart second ${activePath === "/shoppingcart" ? "active" : ""}`}>
              <ShoppingCartIcon />
              {shoppingcartSize >= 0 && <span className="notification-badge-shoppingcart notification-badge">{shoppingcartSize}</span>}
            </Link>
          )}
          <div className="searchBarDiv second">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <IconButton
                style={{ color: 'white', paddingLeft: 15 }}
                onClick={() => openSearch()}
              >
                <SearchIcon />
              </IconButton>
              {searchOpen && (
                <SearchRecords
                  setSearchOpen={setSearchOpen}
                  searchResults={searchResults}
                  setSearchResults={setSearchResults}
                  setIsOpen={setIsOpen}
                />
              )}
            </div>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/records" element={<Records isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} showShoppingcart={showShoppingcart} />} />
          <Route path="/createuser" element={<CreateUser />} />
          <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} setToken={setToken} />} />
          <Route path="/shoppingcart" element={<Shoppingcart loggedInUser={loggedInUser} customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} cartTotal={cartTotal} setCartTotal={setCartTotal} shoppingcart={shoppingcart} setShoppingcart={setShoppingcart} setShoppingcartSize={setShoppingcartSize} conversationId={conversationId} />} />
          <Route path="/chat" element={<ChatRoom loggedInUser={loggedInUser} conversationId={conversationId} setConversationId={setConversationId} conversationMessages={conversationMessages} setConversationMessages={setConversationMessages} fetchConversationId={fetchConversationId} fetchConversationMessages={fetchConversationMessages} newMessageState={newMessageState} setNewMessageState={setNewMessageState} adminNewMessageIds={adminNewMessageIds} setAdminNewMessageIds={setAdminNewMessageIds} />} />
          <Route path="/addrecord" element={<AddRecord loggedInUser={loggedInUser} />} />
          <Route path="/orders" element={<Orders getAllOrders={getAllOrders} />} />
          <Route path="/ordersummary" element={<Ordersummary customerInfo={customerInfo} cartTotal={cartTotal} loggedInUser={loggedInUser} />} />
          <Route path='/deleteuser' element={<DeleteUser loggedInUser={loggedInUser} />} />
          <Route path='/ownorders' element={<OwnOrders loggedInUser={loggedInUser} />} />
          <Route path='/sendfeedback' element={<SendFeedback loggedInUser={loggedInUser} />} />
          <Route path='/search' element={<SearchedRecords searchResults={searchResults} loggedInUser={loggedInUser} showShoppingcart={showShoppingcart} />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/privacystatement" element={<PrivacyStatement />} />
          <Route path="/frontpagetool" element={<FrontPageTool />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
