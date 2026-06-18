import type { Item } from '@/types';
import { ITEMS } from '@/config/levels';

export interface InventoryChangeEvent {
  type: 'add' | 'remove' | 'select' | 'combine';
  itemId?: string;
  resultId?: string;
}

export class InventorySystem {
  private static instance: InventorySystem;
  private items: string[] = [];
  private selectedItem: string | null = null;
  private listeners: ((event: InventoryChangeEvent) => void)[] = [];

  private constructor() {}

  public static getInstance(): InventorySystem {
    if (!InventorySystem.instance) {
      InventorySystem.instance = new InventorySystem();
    }
    return InventorySystem.instance;
  }

  public addItem(itemId: string): boolean {
    if (this.items.includes(itemId)) return false;
    if (!ITEMS[itemId]) return false;

    this.items.push(itemId);
    this.notify({ type: 'add', itemId });
    return true;
  }

  public removeItem(itemId: string): boolean {
    const idx = this.items.indexOf(itemId);
    if (idx === -1) return false;

    this.items.splice(idx, 1);
    if (this.selectedItem === itemId) {
      this.selectedItem = null;
    }
    this.notify({ type: 'remove', itemId });
    return true;
  }

  public hasItem(itemId: string): boolean {
    return this.items.includes(itemId);
  }

  public getItems(): string[] {
    return [...this.items];
  }

  public getItemData(itemId: string): Item | null {
    return ITEMS[itemId] ?? null;
  }

  public selectItem(itemId: string | null): void {
    if (itemId && !this.items.includes(itemId)) return;
    this.selectedItem = itemId;
    this.notify({ type: 'select', itemId: itemId ?? undefined });
  }

  public getSelectedItem(): string | null {
    return this.selectedItem;
  }

  public getSelectedItemData(): Item | null {
    return this.selectedItem ? ITEMS[this.selectedItem] ?? null : null;
  }

  public tryCombine(item1Id: string, item2Id: string): string | null {
    const item1 = ITEMS[item1Id];
    const item2 = ITEMS[item2Id];

    if (!item1 || !item2) return null;

    if (item1.canCombine && item1.combineWith?.includes(item2Id) && item1.combineResult) {
      this.removeItem(item1Id);
      this.removeItem(item2Id);
      this.addItem(item1.combineResult);
      this.notify({ type: 'combine', itemId: item1Id, resultId: item1.combineResult });
      return item1.combineResult;
    }

    if (item2.canCombine && item2.combineWith?.includes(item1Id) && item2.combineResult) {
      this.removeItem(item1Id);
      this.removeItem(item2Id);
      this.addItem(item2.combineResult);
      this.notify({ type: 'combine', itemId: item2Id, resultId: item2.combineResult });
      return item2.combineResult;
    }

    return null;
  }

  public setItems(items: string[]): void {
    this.items = [...items];
    this.selectedItem = null;
    this.notify({ type: 'select' });
  }

  public clear(): void {
    this.items = [];
    this.selectedItem = null;
    this.notify({ type: 'select' });
  }

  public onChange(callback: (event: InventoryChangeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  private notify(event: InventoryChangeEvent): void {
    this.listeners.forEach(l => l(event));
  }

  public getItemCount(): number {
    return this.items.length;
  }
}
