import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

export const VerifyPage = () => {
  const location = useLocation();
  const email = location.state?.email || ""; // email from register page
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const submitVerification = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/verify", { email, code });
      setMsg(data.message);
      navigate("/login");
    } catch (err) {
      setMsg(err.response?.data?.message || "Verification error");
    }
  };

  return (
    <form onSubmit={submitVerification}>
      <p>Email: {email}</p>
      <input
        type="text"
        placeholder="Enter verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button type="submit">Verify</button>
      {msg && <p>{msg}</p>}
    </form>
  );
};
