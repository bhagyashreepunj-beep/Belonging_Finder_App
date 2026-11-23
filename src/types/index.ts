export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  preferredLanguage?: 'en' | 'hi';
  createdAt?: string;
}

export interface LocationNode {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  icon?: string;
  description?: string;
  fullPath?: string;
  itemCount?: number;
  children?: LocationNode[];
  createdAt: string;
  updatedAt: string;
}

export interface BelongingItem {
  id: string;
  userId: string;
  locationId: string;
  name: string;
  category: string;
  description?: string;
  photos: string[];
  tags: string[];
  locationPath?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemLocationHistory {
  id: string;
  itemId: string;
  userId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  fromPath?: string;
  toPath?: string;
  notes?: string;
  movedAt: string;
}

// Navigation Route Parameter Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  AddTab: undefined;
  LocationsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ItemDetail: { itemId: string };
  EditItem: { itemId: string };
  LocationDetail: { locationId: string };
};
