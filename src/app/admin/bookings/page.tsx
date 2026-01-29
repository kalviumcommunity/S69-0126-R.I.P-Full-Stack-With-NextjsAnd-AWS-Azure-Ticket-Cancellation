"use client";

import { useState, useEffect } from "react";
import BusSeatLayout from "@/components/BusSeatLayout";
import NotificationContainer from "@/components/NotificationContainer";

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  tickets: Array<{
    id: number;
    ticketNumber: string;
    seatNumber: string;
    status: string;
  }>;
}

interface Bus {
  id: number;
  busNumber: string;
  totalSeats: number;
  leftSeatsPerRow: number;
  rightSeatsPerRow: number;
  totalRows: number;
  seats: Seat[];
}

interface Seat {
  id: number;
  busId: number;
  seatNumber: string;
  row: number;
  position: string;
  status: string;
  allocatedUserId: number | null;
  allocatedAt: string | null;
}

interface SeatAllocation {
  id: number;
  seatNumber: string;
  allocatedUserId: number;
  allocatedAt: string;
  bus: {
    id: number;
    busNumber: string;
  };
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

// Helper component for segmented bus number input
const BusNumberInput = ({
  value,
  onChange
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  // Parse existing value or default to empty parts
  // Format: XX-YY-AA-YYYY
  const parts = value.split("-");
  const part1 = parts[0] || "";
  const part2 = parts[1] || "";
  const part3 = parts[2] || "";
  const part4 = parts[3] || "";

  const handleChange = (index: number, val: string) => {
    const newParts = [part1, part2, part3, part4];
    newParts[index] = val.toUpperCase();
    onChange(newParts.join("-"));
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={part1}
        onChange={(e) => {
          // 2 Letters only
          const v = e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 2);
          handleChange(0, v);
        }}
        placeholder="XX"
        className="w-14 bg-slate-950 border border-slate-700 rounded-xl px-2 py-3 text-center text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
      />
      <span className="text-slate-600 font-bold">-</span>
      <input
        type="text"
        value={part2}
        onChange={(e) => {
          // 2 Numbers only
          const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
          handleChange(1, v);
        }}
        placeholder="99"
        className="w-14 bg-slate-950 border border-slate-700 rounded-xl px-2 py-3 text-center text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
      />
      <span className="text-slate-600 font-bold">-</span>
      <input
        type="text"
        value={part3}
        onChange={(e) => {
          // 1-2 Letters only
          const v = e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 2);
          handleChange(2, v);
        }}
        placeholder="AA"
        className="w-14 bg-slate-950 border border-slate-700 rounded-xl px-2 py-3 text-center text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
      />
      <span className="text-slate-600 font-bold">-</span>
      <input
        type="text"
        value={part4}
        onChange={(e) => {
          // 4 Numbers only
          const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
          handleChange(3, v);
        }}
        placeholder="1234"
        className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-2 py-3 text-center text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
      />
    </div>
  );
};

export default function AdminBookingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [seatAllocations, setSeatAllocations] = useState<SeatAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "buses" | "allocate">(
    "users"
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editBusNumber, setEditBusNumber] = useState("");
  const [editTotalSeats, setEditTotalSeats] = useState("");

  // Bus creation form state
  const [busNumber, setBusNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("40");
  const [creatingBus, setCreatingBus] = useState(false);

  // Seat allocation form state
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allocatingSeats, setAllocatingSeats] = useState(false);
  const [selectedBusSeats, setSelectedBusSeats] = useState<Seat[]>([]);

  // User details form state
  const [userSource, setUserSource] = useState("");
  const [userDestination, setUserDestination] = useState("");
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userGender, setUserGender] = useState("Male");

  const addNotification = (message: string, type: "success" | "error" | "info" = "info", duration?: number) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Get token from cookies or localStorage
  useEffect(() => {
    // Since we're using httpOnly cookies, we don't need to get the token
    // The browser will automatically send the cookies with requests
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users and seat allocations (cookies sent automatically)
      const usersRes = await fetch("/api/admin/active-users", {
        credentials: "include", // Important: include cookies
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data.users);
        setSeatAllocations(usersData.data.seatAllocations);
      }

      // Fetch buses (cookies sent automatically)
      const busesRes = await fetch("/api/admin/buses", {
        credentials: "include", // Important: include cookies
      });

      if (busesRes.ok) {
        const busesData = await busesRes.json();
        setBuses(busesData.data);
      }

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busNumber) {
      setError("Please enter a bus number");
      return;
    }

    setCreatingBus(true);
    try {
      const response = await fetch("/api/admin/buses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          busNumber,
          totalSeats: parseInt(totalSeats),
          leftSeatsPerRow: 2,
          rightSeatsPerRow: 3,
        }),
      });

      console.log("Bus creation response status:", response.status);
      const responseData = await response.json();
      console.log("Bus creation response:", responseData);

      if (response.ok || response.status === 201) {
        setBusNumber("");
        setTotalSeats("40");
        await fetchData();
        setError("");
        addNotification("Bus created successfully!", "success", 4000);
      } else {
        addNotification(responseData.error || "Failed to create bus", "error", 4000);
      }
    } catch (err) {
      console.error("Error creating bus:", err);
      addNotification("Error creating bus. Please try again.", "error", 4000);
    } finally {
      setCreatingBus(false);
    }
  };

  const handleSelectBus = (busId: number) => {
    const selectedBus = buses.find((b) => b.id === busId);
    if (selectedBus) {
      setSelectedBusId(busId);
      const availableSeats = selectedBus.seats.filter(
        (s) => s.status === "AVAILABLE"
      );
      setSelectedBusSeats(availableSeats);
    }
  };

  const handleAllocateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusId || selectedSeatNumber === null || !selectedUserId) {
      setError("Please select bus, seat, and user");
      return;
    }

    setAllocatingSeats(true);
    try {
      const selectedSeat = selectedBusSeats.find(
        (s) => {
          const seatNum = s.seatNumber.match(/\d+/)?.[0];
          return parseInt(seatNum || "0") === selectedSeatNumber;
        }
      );

      if (!selectedSeat) {
        setError("Selected seat not found");
        setAllocatingSeats(false);
        return;
      }

      const response = await fetch("/api/admin/seats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          seatId: selectedSeat.id,
          userId: selectedUserId,
          gender: userGender,
          source: userSource,
          destination: userDestination,
        }),
      });

      if (response.ok) {
        setSelectedBusId(null);
        setSelectedSeatNumber(null);
        setSelectedUserId(null);
        setUserSource("");
        setUserDestination("");
        setUserName("");
        setUserAge("");
        setUserGender("Male");
        await fetchData();
        setError("");
        addNotification("Seat allocated successfully!", "success", 4000);
      } else {
        const errorData = await response.json();
        addNotification(errorData.error || "Failed to allocate seat", "error", 4000);
      }
    } catch (err) {
      console.error("Error allocating seat:", err);
      addNotification("Error allocating seat. Please try again.", "error", 4000);
    } finally {
      setAllocatingSeats(false);
    }
  };

  const handleDeallocateSeat = async (seatId: number) => {
    if (!confirm("Are you sure you want to deallocate this seat?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/seats", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          seatId,
        }),
      });

      if (response.ok) {
        await fetchData();
        setError("");
        addNotification("Seat deallocated successfully!", "success", 4000);
      } else {
        const errorData = await response.json();
        addNotification(errorData.error || "Failed to deallocate seat", "error", 4000);
      }
    } catch (err) {
      console.error("Error deallocating seat:", err);
      addNotification("Error deallocating seat. Please try again.", "error", 4000);
    }
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setEditBusNumber(bus.busNumber);
    setEditTotalSeats(bus.totalSeats.toString());
  };

  const handleUpdateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;

    try {
      const response = await fetch(`/api/admin/buses/${editingBus.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          busNumber: editBusNumber,
          totalSeats: parseInt(editTotalSeats),
        }),
      });

      if (response.ok) {
        await fetchData();
        setEditingBus(null);
        addNotification("Bus updated successfully!", "success", 4000);
      } else {
        const errorData = await response.json();
        addNotification(errorData.error || "Failed to update bus", "error", 4000);
      }
    } catch (err) {
      console.error("Error updating bus:", err);
      addNotification("Error updating bus. Please try again.", "error", 4000);
    }
  };

  const handleDeleteBus = async (busId: number, busNumber: string) => {
    if (!confirm(`Are you sure you want to delete bus ${busNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/buses/${busId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchData();
        addNotification("Bus deleted successfully!", "success", 4000);
      } else {
        const errorData = await response.json();
        addNotification(errorData.error || "Failed to delete bus", "error", 4000);
      }
    } catch (err) {
      console.error("Error deleting bus:", err);
      addNotification("Error deleting bus. Please try again.", "error", 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <div className="text-emerald-500 font-mono text-xl animate-pulse">Initializing System Protocols...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 font-sans">
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              Ticket <span className="text-emerald-500">Management</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Bus Services & Reservations
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData()}
              className="text-[9px] border border-emerald-500/30 text-emerald-500 px-3 py-1 rounded hover:bg-emerald-500 hover:text-white transition-all font-bold uppercase tracking-widest"
            >
              Refresh Data
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-500 px-4 py-3 rounded-xl mb-8 font-mono text-sm">
            ERROR: {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-t-lg font-black uppercase tracking-widest text-xs transition-all ${activeTab === "users"
              ? "bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500"
              : "text-slate-500 hover:text-slate-300"
              }`}
          >
            Passengers ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("buses")}
            className={`px-6 py-2 rounded-t-lg font-black uppercase tracking-widest text-xs transition-all ${activeTab === "buses"
              ? "bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500"
              : "text-slate-500 hover:text-slate-300"
              }`}
          >
            Bus Services ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab("allocate")}
            className={`px-6 py-2 rounded-t-lg font-black uppercase tracking-widest text-xs transition-all ${activeTab === "allocate"
              ? "bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500"
              : "text-slate-500 hover:text-slate-300"
              }`}
          >
            Bookings
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Identity</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Reg. Date</th>
                      <th className="px-6 py-4">Tickets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-mono">#{user.id.toString().padStart(4, '0')}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{user.phone}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.tickets.length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                            {user.tickets.length} ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="p-12 text-center text-slate-600 font-mono uppercase tracking-widest text-xs">
                  No entities found in database
                </div>
              )}
            </div>
          </section>
        )}

        {/* Buses Tab */}
        {activeTab === "buses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Bus Form */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm h-fit">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 border-b border-slate-800 pb-4">
                Add New <span className="text-emerald-500">Bus Service</span>
              </h2>
              <form onSubmit={handleCreateBus} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                    Bus Number / Registration
                  </label>
                  <BusNumberInput
                    value={busNumber}
                    onChange={setBusNumber}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-slate-600 mt-2 font-mono">
                    * Standard Layout: 2 Left / 3 Right
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={creatingBus}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] mt-4"
                >
                  {creatingBus ? "ADDING SERVICE..." : "ADD BUS SERVICE"}
                </button>
              </form>
            </div>

            {/* Buses List */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">
                Active <span className="text-slate-500">Services</span>
              </h2>
              {buses.map((bus) => {
                const bookedSeats = bus.seats.filter(
                  (s) => s.status === "BOOKED"
                ).length;
                return (
                  <div
                    key={bus.id}
                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-emerald-500 font-mono font-bold text-lg">{bus.busNumber}</span>
                          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">ID: {bus.id}</span>
                        </div>

                        <div className="flex gap-4 text-xs">
                          <div className="text-slate-400">
                            <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">Occupancy</span>
                            <span className="font-mono text-white">{bookedSeats}</span> / {bus.totalSeats}
                          </div>
                          <div className="text-slate-400">
                            <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">Layout</span>
                            {bus.leftSeatsPerRow}L + {bus.rightSeatsPerRow}R
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditBus(bus)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBus(bus.id, bus.busNumber)}
                          disabled={bookedSeats > 0}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(bookedSeats / bus.totalSeats) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {buses.length === 0 && (
                <p className="text-center text-slate-600 font-mono uppercase text-xs tracking-widest py-8">
                  No services currently active
                </p>
              )}
            </div>
          </div>
        )}

        {/* Edit Bus Modal */}
        {editingBus && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">Edit Bus Service</h3>
              <form onSubmit={handleUpdateBus} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                    Bus Number
                  </label>
                  <BusNumberInput
                    value={editBusNumber}
                    onChange={setEditBusNumber}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={editTotalSeats}
                    onChange={(e) => setEditTotalSeats(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-500"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBus(null)}
                    className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Allocate Seats Tab */}
        {activeTab === "allocate" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 border-b border-slate-800 pb-4">
              Manual <span className="text-amber-500">Booking</span>
            </h2>

            <form onSubmit={handleAllocateSeat} className="space-y-8">
              {/* Bus Selection */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                  Select Bus Service
                </label>
                <select
                  value={selectedBusId || ""}
                  onChange={(e) => handleSelectBus(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none transition-colors appearance-none"
                >
                  <option value="">-- SELECT BUS --</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.busNumber} (ID: {bus.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seat Selection with Layout */}
              {selectedBusId && (
                <div className="bg-white/5 rounded-2xl p-8 border border-white/5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">
                    Select Seats
                  </label>
                  <BusSeatLayout
                    rows={buses.find((b) => b.id === selectedBusId)?.totalRows || 8}
                    leftSeats={buses.find((b) => b.id === selectedBusId)?.leftSeatsPerRow || 2}
                    rightSeats={buses.find((b) => b.id === selectedBusId)?.rightSeatsPerRow || 3}
                    onSelectSeat={setSelectedSeatNumber}
                    selectedSeatNumber={selectedSeatNumber}
                  />
                </div>
              )}

              {/* User Details Section */}
              <div className="border-t border-slate-800 pt-8">
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Passenger Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                      Passenger Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="FULL NAME"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={userAge}
                      onChange={(e) => setUserAge(e.target.value)}
                      min="1"
                      max="120"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                      Gender
                    </label>
                    <div className="flex bg-slate-950 border border-slate-700 rounded-xl overflow-hidden p-1">
                      <button
                        type="button"
                        onClick={() => setUserGender("Male")}
                        className={`flex-1 py-2 text-xs font-bold uppercase transition-colors rounded-lg ${userGender === "Male" ? "bg-amber-500 text-black" : "text-slate-500 hover:text-white"}`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserGender("Female")}
                        className={`flex-1 py-2 text-xs font-bold uppercase transition-colors rounded-lg ${userGender === "Female" ? "bg-amber-500 text-black" : "text-slate-500 hover:text-white"}`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                      Starting City
                    </label>
                    <input
                      type="text"
                      value={userSource}
                      onChange={(e) => setUserSource(e.target.value)}
                      placeholder="CITY"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                      Destination City
                    </label>
                    <input
                      type="text"
                      value={userDestination}
                      onChange={(e) => setUserDestination(e.target.value)}
                      placeholder="CITY"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                      Link Registered User Account
                    </label>
                    <select
                      value={selectedUserId || ""}
                      onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none appearance-none"
                    >
                      <option value="">-- SELECT USER ACCOUNT --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} :: {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={allocatingSeats || !selectedBusId || selectedSeatNumber === null || !selectedUserId}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-amber-900/20 active:scale-[0.98]"
                >
                  {allocatingSeats ? "BOOKING..." : "BOOK SEAT"}
                </button>
              </div>
            </form>

            {/* Seat Allocations List */}
            <div className="mt-12 border-t border-slate-800 pt-8">
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">
                Active Bookings <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] ml-2 align-middle">{seatAllocations.length}</span>
              </h3>
              <div className="space-y-3">
                {seatAllocations.map((alloc) => {
                  const allocatedUser = users.find(
                    (u) => u.id === alloc.allocatedUserId
                  );
                  return (
                    <div key={alloc.id} className="flex justify-between items-center bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-xs font-mono text-slate-400">
                          {alloc.seatNumber}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{allocatedUser?.name || "Unknown"}</p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-wider">BUS: {alloc.bus.busNumber}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeallocateSeat(alloc.id)}
                        className="text-[9px] border border-rose-500/30 text-rose-500 px-3 py-1.5 rounded hover:bg-rose-500 hover:text-white transition-all font-bold uppercase tracking-widest"
                      >
                        CANCEL BOOKING
                      </button>
                    </div>
                  )
                })}
              </div>
              {seatAllocations.length === 0 && (
                <p className="text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                  No active bookings found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
