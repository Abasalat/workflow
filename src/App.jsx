import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [fileType, setFileType] = useState("excel");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) {
      toast.warn("Please enter some text.");
      return;
    }

    const userMsg = { sender: "user", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://primary-production-edf3.up.railway.app/webhook-test/webhook-serp",
        {
          text: inputText,
          fileType: fileType,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type:
          fileType === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileType === "excel" ? "file.xlsx" : "file.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      const botMsg = {
        sender: "bot",
        text: ` Here is your ${fileType.toUpperCase()} file! Check your downloads.`,
      };
      setMessages((prev) => [...prev, botMsg]);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      const errMsg = {
        sender: "bot",
        text: "Failed to fetch the file. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
      toast.error("Failed to download file.");
    } finally {
      setIsLoading(false);
      setInputText("");
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: "#f4f7fa",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ textAlign: "center", fontWeight: "bold", color: "#4a4a4a" }}>
        📄 GPT File Assistant
      </h2>

      <div
        style={{
          maxWidth: "600px",
          margin: "2rem auto",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            width: "100%",
            marginBottom: "2rem",
            paddingRight: "0.5rem",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  backgroundColor:
                    msg.sender === "user" ? "#007bff" : "#e0e0e0",
                  color: msg.sender === "user" ? "#fff" : "#333",
                  padding: "1rem",
                  borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  wordWrap: "break-word",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Type your request..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: "1rem",
              borderRadius: "20px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              marginRight: "1rem",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            style={{
              padding: "1rem",
              borderRadius: "10px",
              fontSize: "1rem",
              border: "1px solid #ccc",
              marginRight: "1rem",
            }}
          >
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>

          <button
            onClick={handleSend}
            disabled={isLoading}
            style={{
              padding: "1rem 1.5rem",
              borderRadius: "20px",
              border: "none",
              backgroundColor: isLoading ? "#ccc" : "#28a745",
              color: "#fff",
              fontSize: "1rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

export default App;
