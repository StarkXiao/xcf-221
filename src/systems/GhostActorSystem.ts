import type { DialogNode, DialogChoice, GhostActorState, GhostActorEndingData } from '@/types';
import { GHOST_ACTOR_DIALOGS, GHOST_ACTOR_ENDINGS, INITIAL_GHOST_ACTOR_STATE, TRUST_THRESHOLDS } from '@/config/levels';
import { InventorySystem } from '@/systems/InventorySystem';

export interface DialogResult {
  node: DialogNode;
  trustChanged: number;
  itemsGiven: string[];
  itemsTaken: string[];
  flagsUnlocked: string[];
  endingTriggered: string | null;
  effect?: 'dim' | 'flash' | 'fade';
}

export interface ChoiceAvailability {
  choice: DialogChoice;
  available: boolean;
  reason?: string;
}

export interface GhostActorChangeEvent {
  type: 'trust' | 'flag' | 'item_deliver' | 'item_receive' | 'dialog' | 'ending' | 'quest_complete';
  value?: unknown;
  delta?: number;
}

export class GhostActorSystem {
  private static instance: GhostActorSystem;
  private state: GhostActorState;
  private inventory: InventorySystem;
  private listeners: ((event: GhostActorChangeEvent) => void)[] = [];

  private constructor() {
    this.state = JSON.parse(JSON.stringify(INITIAL_GHOST_ACTOR_STATE));
    this.inventory = InventorySystem.getInstance();
  }

  public static getInstance(): GhostActorSystem {
    if (!GhostActorSystem.instance) {
      GhostActorSystem.instance = new GhostActorSystem();
    }
    return GhostActorSystem.instance;
  }

  public getState(): GhostActorState {
    return { ...this.state };
  }

  public loadState(state: GhostActorState): void {
    this.state = JSON.parse(JSON.stringify(state));
    this.notify({ type: 'trust' });
  }

  public reset(): void {
    this.state = JSON.parse(JSON.stringify(INITIAL_GHOST_ACTOR_STATE));
    this.listeners = [];
  }

  public getTrustLevel(): string {
    const t = this.state.trustValue;
    if (t >= TRUST_THRESHOLDS.intimate) return '心心相印';
    if (t >= TRUST_THRESHOLDS.trusting) return '深深信任';
    if (t >= TRUST_THRESHOLDS.friendly) return '友好';
    if (t >= TRUST_THRESHOLDS.neutral) return '中立';
    if (t >= TRUST_THRESHOLDS.wary) return '警惕';
    return '陌生';
  }

  public getTrustColor(): string {
    const t = this.state.trustValue;
    if (t >= TRUST_THRESHOLDS.trusting) return '#ff69b4';
    if (t >= TRUST_THRESHOLDS.friendly) return '#4ade80';
    if (t >= TRUST_THRESHOLDS.neutral) return '#c9a44c';
    if (t >= TRUST_THRESHOLDS.wary) return '#f59e0b';
    return '#ef4444';
  }

  public getTrustPercentage(): number {
    return Math.max(0, Math.min(100, (this.state.trustValue / this.state.maxTrust) * 100));
  }

  public addTrust(amount: number): void {
    const old = this.state.trustValue;
    this.state.trustValue = Math.max(0, Math.min(this.state.maxTrust, this.state.trustValue + amount));
    const delta = this.state.trustValue - old;
    if (delta !== 0) {
      this.notify({ type: 'trust', delta });
    }
  }

  public hasFlag(flag: string): boolean {
    return this.state.unlockedFlags.includes(flag);
  }

  public unlockFlag(flag: string): boolean {
    if (this.hasFlag(flag)) return false;
    this.state.unlockedFlags.push(flag);
    this.notify({ type: 'flag', value: flag });
    return true;
  }

  public hasDeliveredItem(itemId: string): boolean {
    return this.state.deliveredItems.includes(itemId);
  }

  public deliverItem(itemId: string): boolean {
    if (!this.inventory.hasItem(itemId)) return false;
    if (this.hasDeliveredItem(itemId)) return false;
    this.inventory.removeItem(itemId);
    this.state.deliveredItems.push(itemId);
    this.notify({ type: 'item_deliver', value: itemId });
    return true;
  }

  public receiveItem(itemId: string): boolean {
    if (this.state.receivedItems.includes(itemId)) return false;
    this.inventory.addItem(itemId);
    this.state.receivedItems.push(itemId);
    this.notify({ type: 'item_receive', value: itemId });
    return true;
  }

  public getDeliveredCount(): number {
    return this.state.deliveredItems.length;
  }

  public getAllDeliverableItems(): string[] {
    return ['old_photo', 'costume_fragment', 'wilted_rose', 'unfinished_letter'];
  }

  public getMissingItems(): string[] {
    return this.getAllDeliverableItems().filter(id => !this.hasDeliveredItem(id));
  }

  public hasAllItems(): boolean {
    return this.getMissingItems().length === 0;
  }

  public getCurrentDialog(): DialogNode | null {
    return GHOST_ACTOR_DIALOGS[this.state.currentDialogId] ?? null;
  }

  public getDialogById(dialogId: string): DialogNode | null {
    return GHOST_ACTOR_DIALOGS[dialogId] ?? null;
  }

  public getAvailableChoices(node: DialogNode): ChoiceAvailability[] {
    if (!node.choices) return [];
    return node.choices.map(c => this.checkChoiceAvailability(c));
  }

  private checkChoiceAvailability(choice: DialogChoice): ChoiceAvailability {
    if (choice.requiresMinTrust && this.state.trustValue < choice.requiresMinTrust) {
      return { choice, available: false, reason: `需要信任度 ≥ ${choice.requiresMinTrust}` };
    }
    if (choice.requiredItem && !this.inventory.hasItem(choice.requiredItem)) {
      const item = this.inventory.getItemData(choice.requiredItem);
      return { choice, available: false, reason: `需要道具：${item?.name ?? choice.requiredItem}` };
    }
    if (choice.requiredFlag && !this.hasFlag(choice.requiredFlag)) {
      return { choice, available: false, reason: '条件未达成' };
    }
    return { choice, available: true };
  }

  public getCurrentDialogWithInventoryCheck(): string {
    const allDeliverable = this.getAllDeliverableItems();
    const hasAnyToDeliver = allDeliverable.some(id =>
      this.inventory.hasItem(id) && !this.hasDeliveredItem(id)
    );

    if (this.hasFlag('quest_started') && hasAnyToDeliver && !this.state.dialogHistory.includes('ga_check_inventory')) {
      const photoDialogId = 'ga_return_photo';
      if (this.inventory.hasItem('old_photo') && !this.hasDeliveredItem('old_photo')) {
        return photoDialogId;
      }
      if (this.inventory.hasItem('costume_fragment') && !this.hasDeliveredItem('costume_fragment')) {
        return 'ga_return_costume';
      }
      if (this.inventory.hasItem('wilted_rose') && !this.hasDeliveredItem('wilted_rose')) {
        return 'ga_return_rose';
      }
      if (this.inventory.hasItem('unfinished_letter') && !this.hasDeliveredItem('unfinished_letter')) {
        return 'ga_return_letter';
      }
    }

    if (this.hasAllItems() && this.hasFlag('wanqing_forgiven') && !this.state.dialogHistory.includes('ga_all_items_delivered')) {
      return 'ga_all_items_delivered';
    }
    if (this.hasAllItems() && !this.state.dialogHistory.includes('ga_all_items_delivered')) {
      return 'ga_all_items_delivered';
    }

    if (this.hasFlag('met_wanqing') && !this.state.dialogHistory.includes('ga_generic_chat')) {
      return 'ga_generic_chat';
    }

    return this.state.currentDialogId;
  }

  public advanceDialog(nodeId: string): DialogResult | null {
    const node = this.getDialogById(nodeId);
    if (!node) return null;

    const result: DialogResult = {
      node,
      trustChanged: 0,
      itemsGiven: [],
      itemsTaken: [],
      flagsUnlocked: [],
      endingTriggered: null,
      effect: node.backgroundEffect
    };

    if (!this.state.dialogHistory.includes(nodeId)) {
      this.state.dialogHistory.push(nodeId);
    }
    this.state.currentDialogId = nodeId;

    if (node.autoTrustChange) {
      this.addTrust(node.autoTrustChange);
      result.trustChanged += node.autoTrustChange;
    }

    if (node.autoUnlockFlag && this.unlockFlag(node.autoUnlockFlag)) {
      result.flagsUnlocked.push(node.autoUnlockFlag);
    }

    if (node.autoTakeItem) {
      if (this.deliverItem(node.autoTakeItem)) {
        result.itemsTaken.push(node.autoTakeItem);
      }
    }

    if (node.autoGiveItem) {
      if (this.receiveItem(node.autoGiveItem)) {
        result.itemsGiven.push(node.autoGiveItem);
      }
    }

    if (node.autoTriggerEnding) {
      this.state.endingTriggered = node.autoTriggerEnding;
      result.endingTriggered = node.autoTriggerEnding;
      this.notify({ type: 'ending', value: node.autoTriggerEnding });
    }

    if (this.hasFlag('quest_complete')) {
      this.state.questCompleted = true;
      this.notify({ type: 'quest_complete' });
    }

    this.state.encounterCount++;
    this.notify({ type: 'dialog', value: nodeId });

    return result;
  }

  public selectChoice(choice: DialogChoice): DialogResult | null {
    const availability = this.checkChoiceAvailability(choice);
    if (!availability.available) return null;

    if (choice.trustChange) {
      this.addTrust(choice.trustChange);
    }

    if (choice.unlockFlag) {
      this.unlockFlag(choice.unlockFlag);
    }

    if (choice.takeItem) {
      this.deliverItem(choice.takeItem);
    }

    if (choice.giveItem) {
      this.receiveItem(choice.giveItem);
    }

    let endingTriggered: string | null = null;
    if (choice.triggerEnding) {
      this.state.endingTriggered = choice.triggerEnding;
      endingTriggered = choice.triggerEnding;
      this.notify({ type: 'ending', value: choice.triggerEnding });
    }

    const result = this.advanceDialog(choice.nextDialogId);
    if (result) {
      if (choice.trustChange) result.trustChanged += choice.trustChange;
      if (endingTriggered) result.endingTriggered = endingTriggered;
    }
    return result;
  }

  public determineEnding(): GhostActorEndingData {
    if (this.state.endingTriggered && GHOST_ACTOR_ENDINGS[this.state.endingTriggered]) {
      return GHOST_ACTOR_ENDINGS[this.state.endingTriggered];
    }

    const delivered = this.state.deliveredItems;
    const hasAll4 = delivered.includes('old_photo') && delivered.includes('costume_fragment') &&
                    delivered.includes('wilted_rose') && delivered.includes('unfinished_letter');

    if (hasAll4 && this.state.trustValue >= 80 && this.hasFlag('wanqing_forgiven')) {
      return GHOST_ACTOR_ENDINGS.ga_reunion_perfect;
    }
    if (hasAll4 && this.state.trustValue >= 40) {
      return GHOST_ACTOR_ENDINGS.ga_reunion_normal;
    }

    return GHOST_ACTOR_ENDINGS.ga_unfinished;
  }

  public getEndingById(endingId: string): GhostActorEndingData | null {
    return GHOST_ACTOR_ENDINGS[endingId] ?? null;
  }

  public isQuestCompleted(): boolean {
    return this.state.questCompleted;
  }

  public onChange(callback: (event: GhostActorChangeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  private notify(event: GhostActorChangeEvent): void {
    this.listeners.forEach(l => {
      try { l(event); } catch (e) { console.error('GhostActor listener error:', e); }
    });
  }
}
