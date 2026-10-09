import { Store, User, Attendance } from '../types/hrms';

export const INITIAL_STORES: Store[] = [
  {
    _id: "651f1f1b2c3d4e5f6a7b8c9d",
    name: "Downtown Flagship Branch",
    address: "123 Market St, San Francisco, CA 94105",
    latitude: "37.7749",
    longitude: "-122.4194",
    createdAt: "2026-01-15T08:30:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z"
  },
  {
    _id: "651f202c3d4e5f6a7b8c9e01",
    name: "Manhattan Midtown Hub",
    address: "450 Lexington Ave, New York, NY 10017",
    latitude: "40.7516",
    longitude: "-73.9754",
    createdAt: "2026-01-20T09:15:00.000Z",
    updatedAt: "2026-03-10T11:20:00.000Z"
  },
  {
    _id: "651f213d4e5f6a7b8c9e0f12",
    name: "Chicago Loop Operations",
    address: "200 S Michigan Ave, Chicago, IL 60604",
    latitude: "41.8781",
    longitude: "-87.6298",
    createdAt: "2026-02-05T07:45:00.000Z",
    updatedAt: "2026-03-18T14:10:00.000Z"
  },
  {
    _id: "651f224e5f6a7b8c9e0f1a23",
    name: "Austin Innovation Store",
    address: "500 W 2nd St, Austin, TX 78701",
    latitude: "30.2672",
    longitude: "-97.7431",
    createdAt: "2026-02-14T11:00:00.000Z",
    updatedAt: "2026-03-22T08:45:00.000Z"
  },
  {
    _id: "651f235f6a7b8c9e0f1a2b34",
    name: "London Soho Facility",
    address: "48 Regent St, London W1B 5RA, UK",
    latitude: "51.5100",
    longitude: "-0.1345",
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-03-25T16:30:00.000Z"
  }
];

export const INITIAL_USERS: User[] = [
  {
    _id: "6520a1b2c3d4e5f6a7b8c901",
    storeId: "651f1f1b2c3d4e5f6a7b8c9d",
    name: "Jane Doe",
    email: "jane@example.com",
    isValid: true,
    role: "Store Manager",
    createdAt: "2026-01-16T09:00:00.000Z"
  },
  {
    _id: "6520a2c3d4e5f6a7b8c90102",
    storeId: "651f202c3d4e5f6a7b8c9e01",
    name: "Alexander Wright",
    email: "alexander.w@example.com",
    isValid: true,
    role: "Senior Retail Associate",
    createdAt: "2026-01-22T10:15:00.000Z"
  },
  {
    _id: "6520a3d4e5f6a7b8c9010203",
    storeId: "651f1f1b2c3d4e5f6a7b8c9d",
    name: "Sophia Ramirez",
    email: "sophia.ramirez@example.com",
    isValid: true,
    role: "Inventory Lead",
    createdAt: "2026-02-01T08:30:00.000Z"
  },
  {
    _id: "6520a4e5f6a7b8c901020304",
    storeId: "651f213d4e5f6a7b8c9e0f12",
    name: "David Chen",
    email: "david.chen@example.com",
    isValid: true,
    role: "Branch Supervisor",
    createdAt: "2026-02-08T09:45:00.000Z"
  },
  {
    _id: "6520a5f6a7b8c90102030405",
    storeId: "651f224e5f6a7b8c9e0f1a23",
    name: "Marcus Johnson",
    email: "marcus.j@example.com",
    isValid: true,
    role: "Customer Operations",
    createdAt: "2026-02-18T11:20:00.000Z"
  },
  {
    _id: "6520a607b8c9010203040506",
    storeId: "651f235f6a7b8c9e0f1a2b34",
    name: "Elena Rostova",
    email: "elena.r@example.com",
    isValid: true,
    role: "Facility Coordinator",
    createdAt: "2026-03-02T08:15:00.000Z"
  },
  {
    _id: "6520a718c901020304050607",
    storeId: "651f1f1b2c3d4e5f6a7b8c9d",
    name: "Rachel Green",
    email: "rachel.green@example.com",
    isValid: false,
    role: "Part-time Associate",
    createdAt: "2026-03-12T14:00:00.000Z"
  },
  {
    _id: "6520a829d012030405060708",
    storeId: "651f202c3d4e5f6a7b8c9e01",
    name: "Thomas Miller",
    email: "thomas.m@example.com",
    isValid: true,
    role: "Security Officer",
    createdAt: "2026-03-15T07:30:00.000Z"
  }
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  {
    _id: "6530f1a2b3c4d5e6f7a8b901",
    userId: "6520a1b2c3d4e5f6a7b8c901",
    latitude: "37.7751",
    longitude: "-122.4192",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-10-09T08:02:14.000Z"
  },
  {
    _id: "6530f2b3c4d5e6f7a8b90202",
    userId: "6520a2c3d4e5f6a7b8c90102",
    latitude: "40.7518",
    longitude: "-73.9752",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-10-09T08:15:30.000Z"
  },
  {
    _id: "6530f3c4d5e6f7a8b9030303",
    userId: "6520a3d4e5f6a7b8c9010203",
    latitude: "37.7748",
    longitude: "-122.4195",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-10-09T08:24:45.000Z"
  },
  {
    _id: "6530f4d5e6f7a8b904040404",
    userId: "6520a4e5f6a7b8c901020304",
    latitude: "41.8783",
    longitude: "-87.6295",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-10-09T08:35:10.000Z"
  },
  {
    _id: "6530f5e6f7a8b90505050505",
    userId: "6520a5f6a7b8c90102030405",
    latitude: "30.2670",
    longitude: "-97.7434",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-10-09T08:42:00.000Z"
  },
  {
    _id: "6530f6f7a8b9060606060606",
    userId: "6520a607b8c9010203040506",
    latitude: "51.5102",
    longitude: "-0.1347",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-10-09T08:50:22.000Z"
  },
  {
    _id: "6530f708b907070707070707",
    userId: "6520a829d012030405060708",
    latitude: "40.7530",
    longitude: "-73.9780",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-10-09T09:05:40.000Z"
  }
];
