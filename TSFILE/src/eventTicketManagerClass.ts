import { LibraryConfig, EventDetails, TicketData } from './types';
import { createConnection, Connection, EntitySchema } from 'typeorm';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { createCanvas, loadImage } from 'canvas';

export class EventTicketManager {
  private config: LibraryConfig;
  private connection: Connection;
  private TicketEntity: EntitySchema;

  constructor(config: LibraryConfig) {
    this.config = config;
    this.TicketEntity = new EntitySchema({
      name: "Ticket",
      columns: {
        id: {
          type: Number,
          primary: true,
          generated: true
        },
        verified: {
          type: Boolean,
          default: false
        },
        ...Object.fromEntries(config.eventFields.map(field => [field, { type: String }]))
      }
    });
  }

  async initialize(): Promise<void> {
    this.connection = await createConnection({
      type: "sqlite",
      database: this.config.databasePath,
      entities: [this.TicketEntity],
      synchronize: true,
      logging: false
    });
  }

  async generateTicket(details: EventDetails): Promise<string> {
    const ticketRepository = this.connection.getRepository(this.TicketEntity);
    const ticket = ticketRepository.create(details);
    await ticketRepository.save(ticket);

    const ticketData = JSON.stringify({ id: ticket.id });
    return await QRCode.toDataURL(ticketData);
  }

  async verifyTicket(qrCodeImage: string): Promise<TicketData> {
    const image = await loadImage(qrCodeImage);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      const { id } = JSON.parse(code.data);
      const ticketRepository = this.connection.getRepository(this.TicketEntity);
      const ticket = await ticketRepository.findOne(id);
      
      if (ticket && !ticket.verified) {
        ticket.verified = true;
        await ticketRepository.save(ticket);
        return ticket as TicketData;
      } else if (ticket && ticket.verified) {
        throw new Error('Ticket has already been verified');
      }
    }
    
    throw new Error('Invalid ticket');
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}