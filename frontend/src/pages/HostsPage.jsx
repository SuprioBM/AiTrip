import React, { useEffect, useState } from "react";
import API from "../api";

export default function HostsPage() {
  const [hosts, setHosts] = useState([]);
  useEffect(() => {
    API.get("/hosts")
      .then((r) => setHosts(r.data))
      .catch((e) => console.error(e));
  }, []);
  return (
    <div>
      <h2>Hosts</h2>
      <div className="cards">
        {hosts.map((h) => (
          <div key={h._id} className="card">
            <h4>{h.user?.name || "Host"}</h4>
            <p>{h.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
