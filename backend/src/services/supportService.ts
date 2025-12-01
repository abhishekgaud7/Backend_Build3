import { prisma } from "@/lib/prisma.js";
import { NotFoundError, AuthorizationError } from "@/utils/errors.js";
import type {
  SupportTicketResponse,
  SupportMessageResponse,
} from "@/types/index.js";

interface CreateTicketInput {
  subject: string;
  description: string;
}

interface CreateMessageInput {
  message: string;
}

export async function createTicket(
  userId: string,
  input: CreateTicketInput,
): Promise<SupportTicketResponse> {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      subject: input.subject,
      description: input.description,
    },
    include: { messages: true },
  });

  return formatTicket(ticket);
}

export async function getTicket(
  ticketId: string,
  userId: string,
  role: string,
): Promise<SupportTicketResponse> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) {
    throw new NotFoundError("Support ticket");
  }

  // Check authorization
  if (role !== "ADMIN" && ticket.userId !== userId) {
    throw new AuthorizationError("You can only view your own tickets");
  }

  return formatTicket(ticket);
}

export async function getUserTickets(
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ tickets: SupportTicketResponse[]; total: number }> {
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { userId },
      include: { messages: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.supportTicket.count({ where: { userId } }),
  ]);

  return {
    tickets: tickets.map(formatTicket),
    total,
  };
}

export async function getAllTickets(
  page: number = 1,
  limit: number = 10,
): Promise<{ tickets: SupportTicketResponse[]; total: number }> {
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      include: { messages: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.supportTicket.count(),
  ]);

  return {
    tickets: tickets.map(formatTicket),
    total,
  };
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: string,
  role: string,
): Promise<SupportTicketResponse> {
  if (role !== "ADMIN") {
    throw new AuthorizationError("Only admins can update ticket status");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { messages: true },
  });

  if (!ticket) {
    throw new NotFoundError("Support ticket");
  }

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: newStatus },
    include: { messages: true },
  });

  return formatTicket(updated);
}

export async function addMessage(
  ticketId: string,
  userId: string,
  role: string,
  input: CreateMessageInput,
): Promise<SupportMessageResponse> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new NotFoundError("Support ticket");
  }

  // Check authorization
  if (role !== "ADMIN" && ticket.userId !== userId) {
    throw new AuthorizationError(
      "You can only add messages to your own tickets",
    );
  }

  const senderType = role === "ADMIN" ? "ADMIN" : "USER";

  const message = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderType,
      message: input.message,
    },
  });

  return formatMessage(message);
}

export async function getTicketMessages(
  ticketId: string,
): Promise<SupportMessageResponse[]> {
  const messages = await prisma.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map(formatMessage);
}

function formatTicket(ticket: any): SupportTicketResponse {
  return {
    id: ticket.id,
    userId: ticket.userId,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    messages: ticket.messages?.map(formatMessage),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

function formatMessage(message: any): SupportMessageResponse {
  return {
    id: message.id,
    ticketId: message.ticketId,
    senderType: message.senderType,
    message: message.message,
    createdAt: message.createdAt.toISOString(),
  };
}
