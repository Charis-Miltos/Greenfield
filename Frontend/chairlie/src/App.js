import React from "react";
import ChatPage from "./components/ChatPage";
import LoginPage from "./components/LoginPage";
import { Router, Route, Switch, Link } from "react-router-dom";
import history from "./history";

function App() {
  return (
    <Router history={history}>
      <div className="App">
        <nav>
          <Link to="/login">Login Page</Link>
          <Link to="/chat">Chat Page</Link>
        </nav>
        <header className="App-header">
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <Route path="/chat" component={ChatPage} />
            <Route path="/" component={LoginPage} />
          </Switch>
        </header>
      </div>
    </Router>
  );
}

export default App;
