import { Document, Schema } from 'mongoose';

export interface LibraryConfig {
  mongoUri: string;
  eventFields: string[];
}

export interface EventDetails {
  [key: string]: string | number | boolean;
}

export interface TicketDocument extends Document, EventDetails {
  verified: boolean;
}

export type TicketSchema = Schema<TicketDocument>;
