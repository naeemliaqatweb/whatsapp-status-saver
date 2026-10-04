import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusMediaItem, WhatsAppType } from '@/types/status';

const STORAGE_KEYS = {
  SAVED_STATUSES: '@status_saver_saved_items_v1',
  SELECTED_APP: '@status_saver_selected_app_v1',
  SETTINGS: '@status_saver_settings_v1',
};

export class StatusStorage {
  private static savedItemsMap: Map<string, StatusMediaItem> = new Map();
  private static selectedApp: WhatsAppType = 'whatsapp';

  public static async init(): Promise<void> {
    try {
      const savedJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_STATUSES);
      if (savedJson) {
        const parsed: StatusMediaItem[] = JSON.parse(savedJson);
        this.savedItemsMap.clear();
        parsed.forEach((item) => {
          this.savedItemsMap.set(item.id, item);
        });
      }

      const appType = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_APP);
      if (appType === 'whatsapp' || appType === 'business') {
        this.selectedApp = appType;
      }
    } catch (e) {
      console.error('Failed to init StatusStorage:', e);
    }
  }

  public static getSelectedApp(): WhatsAppType {
    return this.selectedApp;
  }

  public static async setSelectedApp(app: WhatsAppType): Promise<void> {
    this.selectedApp = app;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_APP, app);
    } catch (e) {
      console.error('Failed to persist selected app:', e);
    }
  }

  public static isStatusSaved(id: string): boolean {
    return this.savedItemsMap.has(id);
  }

  public static getSavedItems(filterApp?: WhatsAppType): StatusMediaItem[] {
    const list = Array.from(this.savedItemsMap.values());
    if (filterApp) {
      return list.filter((item) => item.appSource === filterApp);
    }
    return list;
  }

  public static async saveStatus(item: StatusMediaItem): Promise<void> {
    const updatedItem: StatusMediaItem = {
      ...item,
      isSaved: true,
    };
    this.savedItemsMap.set(item.id, updatedItem);
    await this.persistSavedItems();
  }

  public static async removeSavedStatus(id: string): Promise<void> {
    this.savedItemsMap.delete(id);
    await this.persistSavedItems();
  }

  public static async toggleSaveStatus(item: StatusMediaItem): Promise<boolean> {
    if (this.savedItemsMap.has(item.id)) {
      await this.removeSavedStatus(item.id);
      return false;
    } else {
      await this.saveStatus(item);
      return true;
    }
  }

  private static async persistSavedItems(): Promise<void> {
    try {
      const list = Array.from(this.savedItemsMap.values());
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_STATUSES,
        JSON.stringify(list)
      );
    } catch (e) {
      console.error('Failed to persist saved items:', e);
    }
  }
}
