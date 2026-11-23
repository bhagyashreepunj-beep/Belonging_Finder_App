import AsyncStorage from '@react-native-async-storage/async-storage';
import { BelongingItem, LocationNode } from '../types';

const ITEMS_STORAGE_KEY = '@belongings_saved_items';
const LOCATIONS_STORAGE_KEY = '@belongings_saved_locations';

export const INITIAL_DEFAULT_LOCATIONS: LocationItemData[] = [
  {
    id: 'loc_home',
    name: 'Home (Main Residence)',
    parentId: null,
    children: [
      {
        id: 'loc_bed',
        name: 'Master Bedroom',
        parentId: 'loc_home',
        children: [
          {
            id: 'loc_cupboard',
            name: 'Godrej Cupboard',
            parentId: 'loc_bed',
            children: [
              { id: 'loc_drawer2', name: 'Second Drawer', parentId: 'loc_cupboard' },
              { id: 'loc_shelf3', name: 'Top Shelf', parentId: 'loc_cupboard' },
            ],
          },
          { id: 'loc_side', name: 'Bedside Nightstand', parentId: 'loc_bed' },
        ],
      },
      {
        id: 'loc_living',
        name: 'Living Room',
        parentId: 'loc_home',
        children: [
          { id: 'loc_ent', name: 'Entrance Table & Bowl', parentId: 'loc_living' },
          { id: 'loc_tv', name: 'TV Unit Drawer', parentId: 'loc_living' },
        ],
      },
      {
        id: 'loc_study',
        name: 'Study Room',
        parentId: 'loc_home',
        children: [
          { id: 'loc_desk', name: 'Desk First Drawer', parentId: 'loc_study' },
        ],
      },
    ],
  },
  {
    id: 'loc_office',
    name: 'Office (Tech Park)',
    parentId: null,
    children: [
      {
        id: 'loc_cabin',
        name: 'Personal Cabin',
        parentId: 'loc_office',
        children: [
          { id: 'loc_lock', name: 'Filing Cabinet Drawer 2', parentId: 'loc_cabin' },
        ],
      },
    ],
  },
  {
    id: 'loc_car',
    name: 'Family Car',
    parentId: null,
    children: [
      { id: 'loc_glove', name: 'Glove Compartment', parentId: 'loc_car' },
    ],
  },
];

export interface LocationItemData {
  id: string;
  name: string;
  parentId: string | null;
  children?: LocationItemData[];
}

export const INITIAL_DEFAULT_ITEMS: BelongingItem[] = [
  {
    id: 'item_1',
    userId: 'default_user',
    locationId: 'loc_drawer2',
    name: 'Passport & Travel Documents',
    category: 'Documents & Papers',
    description: 'Kept with international flight tickets and blue visa pouch.',
    locationPath: 'Home → Master Bedroom → Godrej Cupboard → Second Drawer',
    photos: [],
    tags: ['travel', 'passport', 'visa', 'official'],
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'item_2',
    userId: 'default_user',
    locationId: 'loc_ent',
    name: 'Spare Car & House Keys',
    category: 'Keys & Access Cards',
    description: 'Set of 3 keys with red keychain in the wooden bowl.',
    locationPath: 'Home → Living Room → Entrance Table & Bowl',
    photos: [],
    tags: ['keys', 'house', 'car', 'spare'],
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'item_3',
    userId: 'default_user',
    locationId: 'loc_lock',
    name: 'Dell 65W Laptop Charger',
    category: 'Electronics & Gadgets',
    description: 'Black USB-C fast charging brick.',
    locationPath: 'Office → Personal Cabin → Filing Cabinet Drawer 2',
    photos: [],
    tags: ['charger', 'laptop', 'dell', 'work'],
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export const StorageService = {
  async getItems(): Promise<BelongingItem[]> {
    try {
      const json = await AsyncStorage.getItem(ITEMS_STORAGE_KEY);
      if (json) {
        return JSON.parse(json);
      }
      // Populate defaults on first run
      await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_ITEMS));
      return INITIAL_DEFAULT_ITEMS;
    } catch (err) {
      console.error('Error loading items from storage:', err);
      return INITIAL_DEFAULT_ITEMS;
    }
  },

  async saveItems(items: BelongingItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving items to storage:', err);
    }
  },

  async getLocations(): Promise<LocationItemData[]> {
    try {
      const json = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (json) {
        return JSON.parse(json);
      }
      await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_LOCATIONS));
      return INITIAL_DEFAULT_LOCATIONS;
    } catch (err) {
      console.error('Error loading locations from storage:', err);
      return INITIAL_DEFAULT_LOCATIONS;
    }
  },

  async saveLocations(locations: LocationItemData[]): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
    } catch (err) {
      console.error('Error saving locations to storage:', err);
    }
  },
};
