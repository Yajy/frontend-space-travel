import { writable } from "svelte/store";

interface PaymentResponse {
    success?: boolean;
    message?: string;
    orderId?: string;
    paymentStatus?: string;
    // Flight details
    flightName?: string;
    sourceName?: string;
    destinationName?: string;
    price?: number;
    seatType?: string;
    additionalInfo?: string;
    // Schedule details
    departureDate?: string;
    arrivalDate?: string;
    departureTime?: string;
    arrivalTime?: string;
    // Other fields
    [key: string]: any;
}

export const paymentResponse = writable<PaymentResponse | null>(null);