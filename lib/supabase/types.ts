export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type BarberRow = {
  id: string;
  name: string;
  photo_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string | null;
  price_cents: number;
  duration_min: number;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type WorkingHoursRow = {
  id: number;
  barber_id: string;
  weekday: number; // 0 = domingo
  start_time: string; // "09:00:00"
  end_time: string;
};

export type TimeBlockRow = {
  id: string;
  barber_id: string | null; // null = loja inteira
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
};

export type AppointmentRow = {
  id: string;
  barber_id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  created_at: string;
};
