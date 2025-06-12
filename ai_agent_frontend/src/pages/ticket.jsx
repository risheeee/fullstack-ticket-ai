import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        console.log("Fetching ticket with ID:", id);
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        console.log("Raw response:", res);
        console.log("Response data:", data);
        
        if (res.ok) {
          const ticketData = data.ticket || data;
          console.log("Final ticket data being set:", ticketData);
          setTicket(ticketData);
        } else {
          console.error("Error response:", data);
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token]);

  console.log("Current ticket state:", ticket);
  console.log("Loading state:", loading);

  if (loading) {
    console.log("Rendering loading state");
    return <div className="text-center mt-10">Loading ticket details...</div>;
  }
  if (!ticket) {
    console.log("Rendering not found state");
    return <div className="text-center mt-10">Ticket not found</div>;
  }

  // Debug: Render ticket JSON
  return (
    <div>
      <pre style={{ color: 'red', background: 'white' }}>
        {JSON.stringify(ticket, null, 2)}
      </pre>
      <h2>Ticket Details</h2>
      <div>
        <div><b>Title:</b> {ticket.title}</div>
        <div><b>Status:</b> {ticket.status}</div>
        <div><b>Description:</b> {ticket.description}</div>
        <div><b>Priority:</b> {ticket.priority}</div>
        <div><b>Related Skills:</b> {ticket.relatedSkills?.join(', ')}</div>
        <div><b>AI Notes:</b> {ticket.helpfulNotes || "No notes"}</div>
        <div><b>Assigned To:</b> {ticket.assignedTo && ticket.assignedTo.email ? ticket.assignedTo.email : "Unassigned"}</div>
        <div><b>Created At:</b> {new Date(ticket.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
}