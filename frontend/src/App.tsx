import React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <header className="bg-blue-500 text-white p-8 rounded-lg shadow-lg">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-lg mb-4">
          Edit{" "}
          <code className="bg-blue-700 px-2 py-1 rounded">src/App.tsx</code> and
          save to reload.
        </p>
        <a
          className="App-link bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-200 transition"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div className="bg-blue-500 p-4 mt-4">Dark Blue Test</div>
    </div>
  );
}

export default App;
