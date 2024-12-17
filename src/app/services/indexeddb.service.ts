import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import type { Category } from '../components/types/category';

interface SelectedItemState {
  selectedItems: { categoryName: string; itemName: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class IndexeddbService {
  private dbName = 'selectListDB';
  private storeName = 'selectedItemsStore';
  private db!: IDBPDatabase;

  constructor() { 
    this.initDB();
  }

  private async initDB(): Promise<void> {
    this.db = await openDB(this.dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('selectedItemsStore')) {
          db.createObjectStore('selectedItemsStore');
        }
      },
    });
  }

  private async ensureDBInitialized(): Promise<void> {
    if (!this.db) {
      await this.initDB();
      console.log('IndexedDB инициализирована');
    }
  }

  async saveState(categories: Category[]): Promise<void> {
    await this.ensureDBInitialized();

    const selectedItems = categories.flatMap(category =>
      category.items
        .filter(item => item.selected)
        .map(item => ({
          categoryName: category.name,
          itemName: item.name,
        }))
    );
  
    const state: SelectedItemState = { selectedItems };
  
    await this.db.put(this.storeName, state, 'state');
    console.log('Сохранённое состояние:', state);
  }


  async loadState(): Promise<SelectedItemState | null> {
    await this.ensureDBInitialized();
  
    const state = await this.db.get(this.storeName, 'state');
    
    if (!state || state.selectedItems.length === 0) {
      await this.clearStore();
      return null;
    }
  
    return state;
  }
  
  private async clearStore(): Promise<void> {
    if (this.db) {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.clear();
    }
  }  
}
