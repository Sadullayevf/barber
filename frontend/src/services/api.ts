const API_BASE = "http://127.0.0.1:8000";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "barber" | "user";
};

export type Barber = {
  id: number;
  name: string;
  experience: string;
  rating: number;
  specialization: string;
  image: string;
  avatar?: string;
  location: string;
  working_hours: string;
  price: number;
  availability?: string;
};

export type Portfolio = {
  id: number;
  barber_id: number;
  image: string;
  description?: string;
};

export type Service = {
  id: number;
  name: string;
  duration: number;
  price: number;
};

export type Slot = {
  time: string;
  available: boolean;
};

export type Booking = {
  id: number;
  customer_name: string;
  phone: string;
  barber_id: number;
  barber_name: string;
  service_id: number;
  service_name: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  cancel_reason?: string;
};

export type BookingPayload = {
  customer_name: string;
  phone: string;
  barber_id: number;
  service_id: number;
  date: string;
  time: string;
};

async function request<T>(endpoint: string, options?: RequestInit, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Something went wrong");
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (data: any) => request<{access_token: string}>("/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: any) => request<User>("/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: (token: string) => request<User>("/me", undefined, token),
  
  // Users (Admin)
  getUsers: (token: string) => request<User[]>("/users", undefined, token),
  updateRole: (userId: number, role: string, token: string) => request<User>(`/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ role }) }, token),
  deleteUser: (userId: number, token: string) => request<{detail: string}>(`/users/${userId}`, { method: "DELETE" }, token),

  // Barbers
  getBarbers: (token?: string | null) => request<Barber[]>("/barbers", undefined, token),
  getMyBarberProfile: (token: string) => request<Barber>("/barbers/me", undefined, token),
  updateMyBarberProfile: (payload: Partial<Barber>, token: string) => 
    request<Barber>("/barbers/me", { method: "PUT", body: JSON.stringify(payload) }, token),
  
  // Portfolio
  getPortfolio: (barberId: number) => request<Portfolio[]>(`/barbers/${barberId}/portfolio`),
  addPortfolioItem: (payload: { image: string; description?: string }, token: string) =>
    request<Portfolio>("/barbers/me/portfolio", { method: "POST", body: JSON.stringify(payload) }, token),
  deletePortfolioItem: (itemId: number, token: string) =>
    request<{message: string}>(`/barbers/me/portfolio/${itemId}`, { method: "DELETE" }, token),

  // Services
  getServices: (token?: string | null) => request<Service[]>("/services", undefined, token),
  getSlots: (barberId: number, date: string) => request<Slot[]>(`/slots/${barberId}/${date}`),
  
  // Bookings
  createBooking: (payload: BookingPayload, token?: string | null) =>
    request<Booking>("/booking", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token),
  getBookings: (token?: string | null) => request<Booking[]>("/bookings", undefined, token),
  confirmBooking: (id: number, token: string) =>
    request<Booking>(`/booking/${id}/confirm`, { method: "POST" }, token),
  cancelBooking: (id: number, reason: string, token: string) =>
    request<{ message: string }>(`/booking/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancel_reason: reason, status: "cancelled" })
    }, token),
};
