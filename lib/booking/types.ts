// Tipos compartilhados entre o wizard (client) e as Server Actions.

export type BookingService = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
  durationMin: number;
};

export type BookingBarber = {
  id: string;
  name: string;
};

export type SlotsResult =
  | { ok: true; times: string[] } // "HH:mm" no fuso de São Paulo
  | { ok: false; error: string };

export type CreateBookingInput = {
  serviceId: string;
  barberId: string | null; // null = sem preferência
  dateYMD: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  customerName: string;
  customerPhone: string; // apenas dígitos
};

export type BookingSummary = {
  id: string;
  serviceName: string;
  barberName: string;
  dateYMD: string;
  time: string;
  priceCents: number;
  durationMin: number;
};

export type CreateBookingResult =
  | { ok: true; booking: BookingSummary }
  | {
      ok: false;
      error: "invalid_input" | "slot_taken" | "unavailable";
      message: string;
    };
