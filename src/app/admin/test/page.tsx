"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminTestPage() {
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
  const [userArrival, setUserArrival] = useState("");
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
        }),
      });

      if (response.ok) {
        setSelectedBusId(null);
        setSelectedSeatNumber(null);
        setSelectedUserId(null);
        setUserArrival("");
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
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Admin Control Panel - Seat Management
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded font-semibold transition ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 hover:bg-gray-200"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("buses")}
            className={`px-6 py-2 rounded font-semibold transition ${
              activeTab === "buses"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 hover:bg-gray-200"
            }`}
          >
            Buses ({buses.length})
          </button>
          <button
            onClick={() => setActiveTab("allocate")}
            className={`px-6 py-2 rounded font-semibold transition ${
              activeTab === "allocate"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 hover:bg-gray-200"
            }`}
          >
            Allocate Seats
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Logged-in Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2">ID</th>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Email</th>
                    <th className="text-left px-4 py-2">Phone</th>
                    <th className="text-left px-4 py-2">Joined</th>
                    <th className="text-left px-4 py-2">Tickets</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-100">
                      <td className="px-4 py-2">{user.id}</td>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.phone}</td>
                      <td className="px-4 py-2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{user.tickets.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <p className="text-center text-gray-500 mt-4">No users found</p>
            )}
          </div>
        )}

        {/* Buses Tab */}
        {activeTab === "buses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Bus Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Create New Bus</h2>
              <form onSubmit={handleCreateBus} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Bus Number (format: XX-YY-AA-YYYY)
                  </label>
                  <input
                    type="text"
                    value={busNumber}
                    onChange={(e) => {
                      const input = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
                      setBusNumber(input);
                    }}
                    placeholder="e.g., AB12CD3456 or KA24A4782"
                    maxLength={10}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    2 letters-2 numbers-1/2 letters-4 numbers
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Total Seats
                  </label>
                  <input
                    type="number"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Layout: 2 seats left, 3 seats right per row
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={creatingBus}
                  className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {creatingBus ? "Creating..." : "Create Bus"}
                </button>
              </form>
            </div>

            {/* Buses List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Existing Buses</h2>
              <div className="space-y-3">
                {buses.map((bus) => {
                  const bookedSeats = bus.seats.filter(
                    (s) => s.status === "BOOKED"
                  ).length;
                  return (
                    <div
                      key={bus.id}
                      className="border rounded p-3 hover:bg-gray-50 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{bus.busNumber}</p>
                        <p className="text-sm text-gray-600">
                          Seats: {bookedSeats}/{bus.totalSeats} booked
                        </p>
                        <p className="text-sm text-gray-600">
                          Layout: {bus.leftSeatsPerRow}L + {bus.rightSeatsPerRow}R
                          per row × {bus.totalRows} rows
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBus(bus)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBus(bus.id, bus.busNumber)}
                          disabled={bookedSeats > 0}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm px-3 py-1 rounded hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-transparent"
                          title={bookedSeats > 0 ? `Cannot delete bus with ${bookedSeats} booked seats` : ""}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {buses.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No buses yet</p>
              )}
            </div>
          </div>
        )}

        {/* Edit Bus Modal */}
        {editingBus && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Edit Bus</h3>
                <form onSubmit={handleUpdateBus} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Bus Number
                    </label>
                    <input
                      type="text"
                      value={editBusNumber}
                      onChange={(e) => {
                        const input = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
                        setEditBusNumber(input);
                      }}
                      maxLength={10}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Total Seats
                    </label>
                    <input
                      type="number"
                      value={editTotalSeats}
                      onChange={(e) => setEditTotalSeats(e.target.value)}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBus(null)}
                      className="flex-1 bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500"
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Allocate Seats to Users</h2>

            <form onSubmit={handleAllocateSeat} className="space-y-6">
              {/* Bus Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Select Bus
                </label>
                <select
                  value={selectedBusId || ""}
                  onChange={(e) => handleSelectBus(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">-- Choose Bus --</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.busNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seat Selection with Layout */}
              {selectedBusId && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Select Seat
                  </label>
                  <BusSeatLayout
                    busId={selectedBusId}
                    rows={buses.find((b) => b.id === selectedBusId)?.totalRows || 8}
                    leftSeats={buses.find((b) => b.id === selectedBusId)?.leftSeatsPerRow || 2}
                    rightSeats={buses.find((b) => b.id === selectedBusId)?.rightSeatsPerRow || 3}
                    onSelectSeat={setSelectedSeatNumber}
                    selectedSeatNumber={selectedSeatNumber}
                  />
                </div>
              )}

              {/* User Details Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Passenger Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Passenger Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g., John Doe"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={userAge}
                      onChange={(e) => setUserAge(e.target.value)}
                      min="1"
                      max="120"
                      placeholder="e.g., 25"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Gender
                    </label>
                    <select
                      value={userGender}
                      onChange={(e) => setUserGender(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Select or Add User
                    </label>
                    <select
                      value={selectedUserId || ""}
                      onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">-- Choose Existing User --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Arrival Location
                    </label>
                    <input
                      type="text"
                      value={userArrival}
                      onChange={(e) => setUserArrival(e.target.value)}
                      placeholder="e.g., Delhi"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={userDestination}
                      onChange={(e) => setUserDestination(e.target.value)}
                      placeholder="e.g., Mumbai"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={allocatingSeats || !selectedBusId || selectedSeatNumber === null || !selectedUserId}
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {allocatingSeats ? "Allocating..." : "Allocate Seat"}
                </button>
              </div>
            </form>

            {/* Seat Allocations List */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold mb-4">
                Current Seat Allocations ({seatAllocations.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2">Bus</th>
                      <th className="text-left px-4 py-2">Seat</th>
                      <th className="text-left px-4 py-2">Allocated User</th>
                      <th className="text-left px-4 py-2">Allocated At</th>
                      <th className="text-left px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seatAllocations.map((alloc) => {
                      const allocatedUser = users.find(
                        (u) => u.id === alloc.allocatedUserId
                      );
                      return (
                        <tr key={alloc.id} className="border-b hover:bg-gray-100">
                          <td className="px-4 py-2">{alloc.bus.busNumber}</td>
                          <td className="px-4 py-2">{alloc.seatNumber}</td>
                          <td className="px-4 py-2">
                            {allocatedUser?.name || "Unknown"}
                          </td>
                          <td className="px-4 py-2">
                            {new Date(alloc.allocatedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleDeallocateSeat(alloc.id)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              Release
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {seatAllocations.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  No seat allocations yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
