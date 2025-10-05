import { create } from 'zustand'
import type { CreateBookingData } from '@/lib/booking-service'

interface BookingStore {
  bookingData: CreateBookingData | null
  setBookingData: (data: CreateBookingData) => void
  clearBooking: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookingData: null,
  setBookingData: (data) => set({ bookingData: data }),
  clearBooking: () => set({ bookingData: null })
}))
