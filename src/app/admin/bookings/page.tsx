"use client";

import { useState, useEffect } from "react";
import BusSeatLayout from "@/components/BusSeatLayout";
import NotificationContainer from "@/components/NotificationContainer";
import DatePicker from "@/components/DatePicker";

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
    latestDepartureTime?: string;
  }>;
}

interface Bus {
  id: number;
  busNumber: string;
  totalSeats: number;
  leftSeatsPerRow: number;
  rightSeatsPerRow: number;
  totalRows: number;
  status?: "ACTIVE" | "CANCELLED" | "COMPLETED";
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
  source?: string | null;
  destination?: string | null;
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
  const [busRoutes, setBusRoutes] = useState<any[]>([]);
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
  const [editTravelDate, setEditTravelDate] = useState("");

  // Bus details modal state
  const [viewingBus, setViewingBus] = useState<Bus | null>(null);
  const [hoveredSeatInModal, setHoveredSeatInModal] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Bus creation form state
  const [busNumber, setBusNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("40");
  const [travelDate, setTravelDate] = useState("");
  const [creatingBus, setCreatingBus] = useState(false);

  // Reuse existing bus form state
  const [showReuseForm, setShowReuseForm] = useState(false);
  const [reusingBus, setReusingBus] = useState(false);
  const [selectedExistingBusId, setSelectedExistingBusId] = useState<number | null>(null);
  const [newTravelDate, setNewTravelDate] = useState("");

  // Seat allocation form state
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allocatingSeats, setAllocatingSeats] = useState(false);
  const [selectedBusSeats, setSelectedBusSeats] = useState<Seat[]>([]);

  // User search/autocomplete state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Bus search/autocomplete state
  const [busSearchQuery, setBusSearchQuery] = useState("");
  const [showBusDropdown, setShowBusDropdown] = useState(false);

  // User details form state
  const [userSource, setUserSource] = useState("");
  const [userDestination, setUserDestination] = useState("");
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userGender, setUserGender] = useState("Male");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ seatId: number } | null>(null);
  const [deleteBusDialog, setDeleteBusDialog] = useState<{ busId: number; busNumber: string } | null>(null);
  const [cancelBusDialog, setCancelBusDialog] = useState<{ busId: number; busNumber: string } | null>(null);

  // Helper function to separate buses by availability
  const getActiveBuses = () => {
    return buses.filter((bus) => {
      const bookedSeats = bus.seats.filter((s) => s.status === "BOOKED").length;
      const isActive = bus.status === "ACTIVE" || !bus.status; // Default to ACTIVE if status not set
      return isActive && bookedSeats < bus.totalSeats;
    });
  };

  const getPastBuses = () => {
    return buses.filter((bus) => {
      const bookedSeats = bus.seats.filter((s) => s.status === "BOOKED").length;
      const isCancelledOrCompleted = bus.status === "CANCELLED" || bus.status === "COMPLETED";
      const isFullyBooked = bookedSeats === bus.totalSeats;
      return isCancelledOrCompleted || isFullyBooked;
    });
  };

  const addNotification = (message: string, type: "success" | "error" | "info" = "info", duration?: number) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Filter users based on search query
  const getFilteredUsers = () => {
    if (!userSearchQuery.trim()) {
      return users;
    }
    const query = userSearchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  };

  // Handle user selection from dropdown
  const handleUserSelect = (userId: number, userName: string, userEmail: string) => {
    setSelectedUserId(userId);
    setUserSearchQuery(`${userName} :: ${userEmail}`);
    setShowUserDropdown(false);
  };

  // Filter buses based on search query
  const getFilteredBuses = () => {
    if (!busSearchQuery.trim()) {
      return buses;
    }
    const query = busSearchQuery.toLowerCase();
    return buses.filter(
      (bus) =>
        bus.busNumber.toLowerCase().includes(query) ||
        bus.id.toString().includes(query)
    );
  };

  // Handle bus selection from dropdown
  const handleBusSelect = (busId: number, busNumber: string) => {
    handleSelectBus(busId);
    setBusSearchQuery(`${busNumber} (ID: ${busId})`);
    setShowBusDropdown(false);
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

      console.log("Users API response status:", usersRes.status);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log("Users data:", usersData);
        setUsers(usersData.data.users);
        setSeatAllocations(usersData.data.seatAllocations);
      } else {
        console.error("Users API error:", await usersRes.text());
      }

      // Fetch buses (cookies sent automatically)
      const busesRes = await fetch("/api/admin/buses", {
        credentials: "include", // Important: include cookies
      });

      console.log("Buses API response status:", busesRes.status);
      if (busesRes.ok) {
        const busesData = await busesRes.json();
        console.log("Buses data:", busesData);
        setBuses(busesData.data);
      } else {
        console.error("Buses API error:", await busesRes.text());
      }

      // Fetch bus routes for travel dates
      try {
        const routesRes = await fetch("/api/admin/bus-routes", {
          credentials: "include",
        });

        if (routesRes.ok) {
          const routesData = await routesRes.json();
          console.log("Bus routes data:", routesData);
          setBusRoutes(routesData.data || []);
        }
      } catch (routeErr) {
        console.error("Error fetching routes:", routeErr);
        // Non-blocking error - continue without routes
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
    if (!travelDate) {
      setError("Please select a travel date");
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
          travelDate: new Date(travelDate).toISOString(),
        }),
      });

      console.log("Bus creation response status:", response.status);
      const responseData = await response.json();
      console.log("Bus creation response:", responseData);

      if (response.ok || response.status === 201) {
        setBusNumber("");
        setTotalSeats("40");
        setTravelDate("");
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

  const handleReuseBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingBusId) {
      setError("Please select a bus");
      return;
    }
    if (!newTravelDate) {
      setError("Please select a travel date");
      return;
    }

    setReusingBus(true);
    try {
      const response = await fetch("/api/admin/buses/update-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          busId: selectedExistingBusId,
          newTravelDate: new Date(newTravelDate).toISOString(),
        }),
      });

      console.log("Bus update response status:", response.status);
      const responseData = await response.json();
      console.log("Bus update response:", responseData);

      if (response.ok || response.status === 200) {
        setSelectedExistingBusId(null);
        setNewTravelDate("");
        setShowReuseForm(false);
        await fetchData();
        setError("");
        addNotification("Bus travel date updated successfully!", "success", 4000);
      } else {
        addNotification(responseData.error || "Failed to update bus", "error", 4000);
      }
    } catch (err) {
      console.error("Error updating bus:", err);
      addNotification("Error updating bus. Please try again.", "error", 4000);
    } finally {
      setReusingBus(false);
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
        (s) => parseInt(s.seatNumber) === selectedSeatNumber
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
        setUserSearchQuery("");
        setBusSearchQuery("");
        setUserSource("");
        setUserDestination("");
        setUserName("");
        setUserAge("");
        setUserGender("Male");
        await fetchData();
        // Force refresh of buses to show updated seat statuses
        setTimeout(() => {
          fetchData();
        }, 500);
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
    setConfirmDialog({ seatId });
  };

  const confirmDeallocate = async () => {
    if (!confirmDialog) return;
    const seatId = confirmDialog.seatId;
    setConfirmDialog(null);

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

  const cancelDeallocate = () => {
    setConfirmDialog(null);
  };

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus);
    setEditBusNumber(bus.busNumber);
    setEditTotalSeats(bus.totalSeats.toString());

    // Find and populate the travel date from bus route
    const route = busRoutes.find((r: any) => r.source === `BUS-${bus.busNumber}`);
    if (route) {
      const date = new Date(route.departureTime);
      setEditTravelDate(date.toISOString().split('T')[0]);
    } else {
      setEditTravelDate("");
    }
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
        // If travel date was changed, update it separately
        if (editTravelDate) {
          await fetch("/api/admin/buses/update-date", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              busId: editingBus.id,
              newTravelDate: new Date(editTravelDate).toISOString(),
            }),
          });
        }

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

  const handleDeleteBus = (busId: number, busNumber: string) => {
    setDeleteBusDialog({ busId, busNumber });
  };

  const confirmDeleteBus = async () => {
    if (!deleteBusDialog) return;
    const { busId } = deleteBusDialog;
    setDeleteBusDialog(null);

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

  const handleCancelBus = (busId: number, busNumber: string) => {
    setCancelBusDialog({ busId, busNumber });
  };

  const confirmCancelBus = async () => {
    if (!cancelBusDialog) return;
    const { busId } = cancelBusDialog;
    setCancelBusDialog(null);

    try {
      const response = await fetch(`/api/admin/buses/${busId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "CANCELLED",
        }),
      });

      if (response.ok) {
        await fetchData();
        addNotification("Bus service cancelled successfully!", "success", 4000);
      } else {
        const errorData = await response.json();
        addNotification(errorData.error || "Failed to cancel bus", "error", 4000);
      }
    } catch (err) {
      console.error("Error cancelling bus:", err);
      addNotification("Error cancelling bus. Please try again.", "error", 4000);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("buses")}
            className={`px-6 py-2 rounded-t-lg font-black uppercase tracking-widest text-xs transition-all ${activeTab === "buses"
              ? "bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500"
              : "text-slate-500 hover:text-slate-300"
              }`}
          >
            Bus Services ({buses.length}) - {getActiveBuses().length} Active
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
            {/* Search Bar */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <span className="text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                type="text"
                placeholder="Search users using email or name..."
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600 font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/users/${user.id}`}
                      >
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
                          {(() => {
                            const now = new Date();
                            now.setHours(0, 0, 0, 0);

                            const activeCount = user.tickets.filter((t: any) => {
                              const dateStr = t.latestDepartureTime || t.route?.departureTime || t.travelDate;
                              const ticketDate = new Date(dateStr);
                              const isValidDate = !isNaN(ticketDate.getTime());

                              if (t.status === 'ACTIVE') {
                                // If date is invalid, count it as active (fallback)
                                return !isValidDate || ticketDate >= now;
                              }
                              return false;
                            }).length;

                            return (
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${activeCount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                {activeCount} ACTIVE
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="p-12 text-center text-slate-600 font-mono uppercase tracking-widest text-xs">
                  {searchQuery ? "No matching users found" : "No entities found in database"}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Buses Tab */}
        {activeTab === "buses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Bus Form OR Reuse Bus Form */}
            <div className="space-y-4">
              {/* Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReuseForm(false);
                    setSelectedExistingBusId(null);
                    setNewTravelDate("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-widest transition-all ${!showReuseForm
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                >
                  Add New Service
                </button>
                <button
                  onClick={() => {
                    setShowReuseForm(true);
                    setBusNumber("");
                    setTotalSeats("40");
                    setTravelDate("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-widest transition-all ${showReuseForm
                    ? "bg-amber-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                >
                  Reuse Existing Bus
                </button>
              </div>

              {/* Create Bus Form */}
              {!showReuseForm && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
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
                    <DatePicker
                      label="Travel Date"
                      value={travelDate}
                      onChange={setTravelDate}
                      minDate={new Date()}
                    />
                    <button
                      type="submit"
                      disabled={creatingBus}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] mt-4"
                    >
                      {creatingBus ? "ADDING SERVICE..." : "ADD BUS SERVICE"}
                    </button>
                  </form>
                </div>
              )}

              {/* Reuse Bus Form */}
              {showReuseForm && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 border-b border-slate-800 pb-4">
                    Reuse <span className="text-amber-500">Bus Service</span>
                  </h2>
                  <form onSubmit={handleReuseBus} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                        Select Bus <span className="text-amber-500">*</span>
                      </label>
                      <select
                        value={selectedExistingBusId || ""}
                        onChange={(e) => setSelectedExistingBusId(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-amber-500 focus:outline-none transition-colors appearance-none"
                      >
                        <option value="">-- SELECT BUS --</option>
                        {getPastBuses().map((bus) => {
                          return (
                            <option key={bus.id} value={bus.id}>
                              {bus.busNumber} (ID: {bus.id})
                            </option>
                          );
                        })}
                      </select>
                      {getPastBuses().length === 0 && (
                        <p className="text-[10px] text-amber-600 mt-2 font-mono">
                          No past services available to reuse.
                        </p>
                      )}
                    </div>

                    {selectedExistingBusId && (
                      <>
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Bus Details</span>
                            {(() => {
                              const bus = buses.find((b) => b.id === selectedExistingBusId);
                              if (!bus) return null;
                              return (
                                <div className="mt-2 space-y-2 text-sm text-slate-300 font-mono">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Registration:</span>
                                    <span className="text-emerald-400">{bus.busNumber}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Total Seats:</span>
                                    <span className="text-emerald-400">{bus.totalSeats}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <DatePicker
                          label="New Travel Date"
                          value={newTravelDate}
                          onChange={setNewTravelDate}
                          minDate={new Date()}
                        />
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={reusingBus || !selectedExistingBusId}
                      className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-amber-900/20 active:scale-[0.98] mt-4"
                    >
                      {reusingBus ? "UPDATING SERVICE..." : "UPDATE TRAVEL DATE"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Buses List - Active and Past Services */}
            <div className="space-y-6">
              {/* Active Services */}
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">
                  Active <span className="text-emerald-500">Services</span>
                </h2>
                <div className="space-y-3">
                  {getActiveBuses().map((bus) => {
                    const bookedSeats = bus.seats.filter(
                      (s) => s.status === "BOOKED"
                    ).length;
                    return (
                      <div
                        key={bus.id}
                        onClick={() => setViewingBus(bus)}
                        className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
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
                              <div className="text-slate-400">
                                <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider block mb-1">Travel Date</span>
                                {(() => {
                                  const route = busRoutes.find((r: any) => r.source === `BUS-${bus.busNumber}`);
                                  return route
                                    ? new Date(route.departureTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : "Not set";
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditBus(bus);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBus(bus.id, bus.busNumber);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBus(bus.id, bus.busNumber);
                              }}
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
                  {getActiveBuses().length === 0 && (
                    <p className="text-center text-slate-600 font-mono uppercase text-xs tracking-widest py-4">
                      No active services
                    </p>
                  )}
                </div>
              </div>

              {/* Past Services */}
              {getPastBuses().length > 0 && (
                <div className="border-t border-slate-800 pt-6">
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">
                    Past <span className="text-slate-600">Services</span>
                  </h2>
                  <div className="space-y-3 opacity-75">
                    {getPastBuses().map((bus) => {
                      const bookedSeats = bus.seats.filter(
                        (s) => s.status === "BOOKED"
                      ).length;
                      return (
                        <div
                          key={bus.id}
                          className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/30 transition-all group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-slate-400 font-mono font-bold text-lg line-through">{bus.busNumber}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${bus.status === "CANCELLED"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-slate-800 text-slate-500"
                                  }`}>
                                  {bus.status === "CANCELLED" ? "CANCELLED" : "COMPLETED"}
                                </span>
                              </div>

                              <div className="flex gap-4 text-xs">
                                <div className="text-slate-500">
                                  <span className="text-slate-700 uppercase font-bold text-[10px] tracking-wider block mb-1">Occupancy</span>
                                  <span className="font-mono text-slate-400">{bookedSeats}</span> / {bus.totalSeats}
                                </div>
                                <div className="text-slate-500">
                                  <span className="text-slate-700 uppercase font-bold text-[10px] tracking-wider block mb-1">Layout</span>
                                  {bus.leftSeatsPerRow}L + {bus.rightSeatsPerRow}R
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDeleteBus(bus.id, bus.busNumber)}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-600 transition-all duration-500"
                              style={{ width: `${(bookedSeats / bus.totalSeats) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                    Travel Date
                  </label>
                  <DatePicker
                    value={editTravelDate}
                    onChange={setEditTravelDate}
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

        {/* Bus Details Modal - Show layout and booked tickets */}
        {viewingBus && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl my-2 sm:my-4 max-h-[90vh] overflow-y-auto">
              {(() => {
                const route = busRoutes.find((r: any) => r.source === `BUS-${viewingBus.busNumber}`);

                return (
                  <>
                    <div className="flex justify-between items-start mb-4 sm:mb-6 gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter break-words">
                          <span className="text-emerald-500">{viewingBus.busNumber}</span>
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-1 sm:mt-2">ID: {viewingBus.id} | {viewingBus.totalSeats} Seats</p>

                        {route && (
                          <div className="text-[9px] sm:text-[10px] text-emerald-400 font-mono mt-2 bg-emerald-500/10 px-2.5 py-1.5 rounded inline-block">
                            📍 <span className="font-bold">{route.source}</span> → <span className="font-bold">{route.destination}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setViewingBus(null);
                          setHoveredSeatInModal(null);
                        }}
                        className="text-slate-400 hover:text-white text-xl sm:text-2xl flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      {/* Seat Layout */}
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-x-auto">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3 sm:mb-4">Seat Layout</h4>

                        <div className="min-w-max sm:min-w-0">
                          <BusSeatLayout
                            rows={viewingBus.totalRows}
                            leftSeats={viewingBus.leftSeatsPerRow}
                            rightSeats={viewingBus.rightSeatsPerRow}
                            onSelectSeat={() => { }}
                            selectedSeatNumber={null}
                            bookedSeats={viewingBus.seats
                              .filter((s) => s.status === "BOOKED")
                              .map((s) => s.seatNumber)}
                            allSeats={viewingBus.seats.map((s) => ({
                              id: s.id,
                              seatNumber: s.seatNumber,
                              position: s.position,
                              status: s.status,
                            }))}
                            onSeatHover={(seatNum) => setHoveredSeatInModal(seatNum)}
                            hoveredSeat={hoveredSeatInModal}
                            seatUserMap={(() => {
                              const map: Record<string, { name: string; email: string; source?: string; destination?: string }> = {};
                              const route = busRoutes.find((r: any) => r.source === `BUS-${viewingBus.busNumber}`);
                              viewingBus.seats.forEach((seat) => {
                                if (seat.status === "BOOKED" && seat.allocatedUserId) {
                                  const user = users.find((u) => u.id === seat.allocatedUserId);
                                  if (user) {
                                    map[seat.seatNumber] = {
                                      name: user.name,
                                      email: user.email,
                                      source: route?.source,
                                      destination: route?.destination,
                                    };
                                  }
                                }
                              });
                              return map;
                            })()}
                          />
                        </div>
                      </div>

                      {/* Booked Tickets */}
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3 sm:mb-4">
                          Booked ({viewingBus.seats.filter((s) => s.status === "BOOKED").length})
                        </h4>
                        <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                          {viewingBus.seats
                            .filter((s) => s.status === "BOOKED" && s.allocatedUserId)
                            .map((seat) => {
                              const user = users.find((u) => u.id === seat.allocatedUserId);
                              const ticket = user?.tickets.find((t) => {
                                return t.seatNumber === seat.seatNumber;
                              });

                              return (
                                <div
                                  key={seat.id}
                                  className="bg-slate-900/40 border border-slate-800 rounded-lg sm:rounded-xl p-3 hover:border-slate-700 transition-all"
                                >
                                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                                    <div>
                                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Seat</span>
                                      <span className="text-white font-bold">{seat.seatNumber}</span>
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Name</span>
                                      <span className="text-slate-300 font-mono text-xs truncate block">{user?.name || "—"}</span>
                                    </div>
                                    <div className="col-span-2 min-w-0">
                                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Email</span>
                                      <span className="text-slate-300 font-mono text-xs truncate block">{user?.email || "—"}</span>
                                    </div>
                                    {(seat.source || seat.destination) && (
                                      <div className="col-span-2">
                                        <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Route</span>
                                        <div className="text-emerald-400 font-mono text-sm">
                                          {seat.source || "—"} → {seat.destination || "—"}
                                        </div>
                                      </div>
                                    )}
                                    {ticket && (
                                      <>
                                        <div>
                                          <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Ticket</span>
                                          <span className="text-emerald-400 font-mono font-bold text-xs">{ticket.ticketNumber}</span>
                                        </div>
                                        <div>
                                          <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Status</span>
                                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold ${ticket.status === "ACTIVE"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-slate-800 text-slate-400"
                                            }`}>
                                            {ticket.status}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          {viewingBus.seats.filter((s) => s.status === "BOOKED").length === 0 && (
                            <p className="text-center text-slate-600 font-mono text-xs py-2">No booked seats</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setViewingBus(null);
                        setHoveredSeatInModal(null);
                      }}
                      className="w-full mt-4 sm:mt-6 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg sm:rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
                    >
                      Close
                    </button>
                  </>
                );
              })()}
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
                <div className="relative">
                  <input
                    type="text"
                    value={busSearchQuery}
                    onChange={(e) => {
                      setBusSearchQuery(e.target.value);
                      setShowBusDropdown(true);
                      // Clear selection if user is typing
                      if (selectedBusId && e.target.value !== buses.find(b => b.id === selectedBusId)?.busNumber) {
                        setSelectedBusId(null);
                        setSelectedBusSeats([]);
                      }
                    }}
                    onFocus={() => setShowBusDropdown(true)}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setShowBusDropdown(false), 200);
                    }}
                    placeholder="Type to search or select bus..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-700 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                  {showBusDropdown && getFilteredBuses().length > 0 && (
                    <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                      {getFilteredBuses().map((bus) => (
                        <div
                          key={bus.id}
                          onClick={() => handleBusSelect(bus.id, bus.busNumber)}
                          className="px-4 py-3 hover:bg-slate-800 cursor-pointer text-white font-mono text-sm border-b border-slate-800 last:border-b-0 transition-colors"
                        >
                          <div className="font-semibold">{bus.busNumber}</div>
                          <div className="text-xs text-slate-400">ID: {bus.id} • {bus.totalSeats} seats</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Seat Selection with Layout */}
              {selectedBusId && (
                <div className="bg-white/5 rounded-2xl p-8 border border-white/5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">
                    Select Seats
                  </label>
                  {(() => {
                    const selectedBus = buses.find((b) => b.id === selectedBusId);
                    // Get booked seats as full seat objects for easier matching
                    const bookedSeatIds = new Set(selectedBus?.seats
                      .filter((s) => s.status === "BOOKED")
                      .map((s) => s.id) || []);

                    console.log("Selected bus:", selectedBus?.busNumber);
                    console.log("All seats count:", selectedBus?.seats.length);
                    console.log("Booked seat IDs:", Array.from(bookedSeatIds));
                    console.log("Sample seats:", selectedBus?.seats.slice(0, 5).map(s => ({ id: s.id, num: s.seatNumber, pos: s.position, status: s.status })));

                    return (
                      <BusSeatLayout
                        rows={selectedBus?.totalRows || 8}
                        leftSeats={selectedBus?.leftSeatsPerRow || 2}
                        rightSeats={selectedBus?.rightSeatsPerRow || 3}
                        onSelectSeat={setSelectedSeatNumber}
                        selectedSeatNumber={selectedSeatNumber}
                        bookedSeats={selectedBus?.seats.filter((s) => s.status === "BOOKED").map((s) => s.seatNumber) || []}
                        allSeats={selectedBus?.seats || []}
                      />
                    );
                  })()}
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
                    <div className="relative">
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value);
                          setShowUserDropdown(true);
                          // Clear selection if user is typing
                          if (selectedUserId && e.target.value !== users.find(u => u.id === selectedUserId)?.name) {
                            setSelectedUserId(null);
                          }
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        onBlur={() => {
                          // Delay to allow click on dropdown item
                          setTimeout(() => setShowUserDropdown(false), 200);
                        }}
                        placeholder="Type to search or select user..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono placeholder:text-slate-700 focus:border-amber-500 focus:outline-none"
                      />
                      {showUserDropdown && getFilteredUsers().length > 0 && (
                        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                          {getFilteredUsers().map((user) => (
                            <div
                              key={user.id}
                              onClick={() => handleUserSelect(user.id, user.name, user.email)}
                              className="px-4 py-3 hover:bg-slate-800 cursor-pointer text-white font-mono text-sm border-b border-slate-800 last:border-b-0 transition-colors"
                            >
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-xs text-slate-400">{user.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

        {/* Custom Confirmation Dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">
                    Confirm <span className="text-rose-500">Cancellation</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">Are you sure you want to deallocate this seat? This action cannot be undone.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelDeallocate}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeallocate}
                    className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20"
                  >
                    Deallocate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Bus Confirmation Dialog */}
        {deleteBusDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">
                    Confirm <span className="text-rose-500">Deletion</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    Are you sure you want to delete bus <span className="text-emerald-400 font-mono">{deleteBusDialog.busNumber}</span>? This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteBusDialog(null)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteBus}
                    className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20"
                  >
                    Delete Bus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Bus Confirmation Dialog */}
        {cancelBusDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">
                    Confirm <span className="text-amber-500">Cancellation</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    Are you sure you want to cancel bus service <span className="text-emerald-400 font-mono">{cancelBusDialog.busNumber}</span>? This will move it to past services.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelBusDialog(null)}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={confirmCancelBus}
                    className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-amber-900/20"
                  >
                    Cancel Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}