import { writable } from "svelte/store";

interface BookingResponse {
    orderId: string;
    flightId: string;
    scheduleId: string;
    passengerId: string;
    totalAmount: number;
    success: boolean;
    sourceName: string;
    destinationName: string;
    message: string;
    departureTime: string;
    arrivalTime: string;
    numberOfSeats: number;
}

export const bookingResponse = writable<BookingResponse | null>(null);