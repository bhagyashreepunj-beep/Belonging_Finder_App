import React, { createContext, useContext, useEffect, useState } from 'react';
import { BelongingItem } from '../types';
import { StorageService, LocationItemData } from '../services/storageService';
import { useAuth } from './AuthContext';

interface NewItemInput {
  name: string;
  category: string;
  locationPath: string;
  description?: string;
  tags?: string[];
  photos?: string[];
}

interface BelongingsContextType {
  items: BelongingItem[];
  locations: LocationItemData[];
  loading: boolean;
  addItem: (input: NewItemInput) => Promise<BelongingItem>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<BelongingItem>) => Promise<void>;
  addLocation: (name: string, parentPath?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const BelongingsContext = createContext<BelongingsContextType | undefined>(undefined);

export const BelongingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<BelongingItem[]>([]);
  const [locations, setLocations] = useState<LocationItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storedItems, storedLocations] = await Promise.all([
        StorageService.getItems(),
        StorageService.getLocations(),
      ]);
      setItems(storedItems);
      setLocations(storedLocations);
    } catch (err) {
      console.error('Failed to load belongings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const addItem = async (input: NewItemInput): Promise<BelongingItem> => {
    const newItem: BelongingItem = {
      id: 'item_' + Date.now().toString(),
      userId: user?.id || 'local_user',
      locationId: 'loc_' + Date.now().toString(),
      name: input.name.trim(),
      category: input.category || 'Other Belongings',
      locationPath: input.locationPath.trim(),
      description: input.description?.trim() || '',
      tags: input.tags || [],
      photos: input.photos || [],
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    await StorageService.saveItems(updatedItems);
    return newItem;
  };

  const deleteItem = async (id: string): Promise<void> => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    await StorageService.saveItems(updatedItems);
  };

  const updateItem = async (id: string, updates: Partial<BelongingItem>): Promise<void> => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    setItems(updatedItems);
    await StorageService.saveItems(updatedItems);
  };

  const addLocation = async (name: string, parentPath?: string): Promise<void> => {
    const newLoc: LocationItemData = {
      id: 'loc_' + Date.now().toString(),
      name: name.trim(),
      parentId: null,
    };

    const updatedLocations = [...locations, newLoc];
    setLocations(updatedLocations);
    await StorageService.saveLocations(updatedLocations);
  };

  return (
    <BelongingsContext.Provider
      value={{
        items,
        locations,
        loading,
        addItem,
        deleteItem,
        updateItem,
        addLocation,
        refreshData: loadData,
      }}
    >
      {children}
    </BelongingsContext.Provider>
  );
};

export const useBelongings = () => {
  const context = useContext(BelongingsContext);
  if (!context) {
    throw new Error('useBelongings must be used within a BelongingsProvider');
  }
  return context;
};
