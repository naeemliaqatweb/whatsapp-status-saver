import { Platform, PermissionsAndroid, Share, Linking, Alert, NativeModules } from 'react-native';
import { StatusMediaItem, WhatsAppType } from '@/types/status';
import { StatusStorage } from '@/storage/statusStorage';

const { StatusScannerModule } = NativeModules;

export class StatusScannerService {
  /**
   * Request necessary Android storage permissions
   */
  public static async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const statuses = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        const granted =
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED;

        // Also check manage storage for direct WhatsApp hidden folder access
        if (StatusScannerModule?.hasManageStoragePermission) {
          const hasManage = await StatusScannerModule.hasManageStoragePermission();
          if (!hasManage) {
            await StatusScannerModule.requestManageStoragePermission();
          }
        }
        return granted;
      } else if (Platform.Version >= 30) {
        // Android 11 / 12
        if (StatusScannerModule?.hasManageStoragePermission) {
          const hasManage = await StatusScannerModule.hasManageStoragePermission();
          if (!hasManage) {
            await StatusScannerModule.requestManageStoragePermission();
          }
        }
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'WhatsApp Status Access',
            message:
              'Status Saver needs access to your device storage to find and save WhatsApp statuses.',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } catch (err) {
      console.warn('Error requesting storage permissions:', err);
      return false;
    }
  }

  /**
   * Scans statuses from real WhatsApp device folders (.Statuses)
   */
  public static async scanStatuses(
    appType: WhatsAppType = 'whatsapp'
  ): Promise<StatusMediaItem[]> {
    if (Platform.OS !== 'android' || !StatusScannerModule) {
      return [];
    }

    try {
      await this.requestPermissions();
      const rawStatuses = await StatusScannerModule.scanStatuses(appType);
      
      if (!rawStatuses || !Array.isArray(rawStatuses)) {
        return [];
      }

      return rawStatuses.map((item: any) => ({
        id: item.id || item.filePath,
        type: item.type === 'video' ? 'video' : 'image',
        uri: item.uri || `file://${item.filePath}`,
        thumbnailUri: item.thumbnailUri || item.uri || `file://${item.filePath}`,
        fileName: item.fileName,
        filePath: item.filePath,
        timeAgo: item.timeAgo || 'Recently',
        timestamp: item.timestamp || Date.now(),
        sizeBytes: item.sizeBytes,
        isSaved: item.isSaved || StatusStorage.isStatusSaved(item.id || item.filePath),
        appSource: (item.appSource as WhatsAppType) || appType,
      }));
    } catch (err) {
      console.error('Error scanning real statuses:', err);
      return [];
    }
  }

  /**
   * Get all saved statuses from Gallery directory (/Pictures/StatusSaver/WhatsApp or /Pictures/StatusSaver/WhatsAppBusiness)
   */
  public static async getSavedStatuses(
    appType: WhatsAppType = 'whatsapp'
  ): Promise<StatusMediaItem[]> {
    if (Platform.OS !== 'android' || !StatusScannerModule) {
      return StatusStorage.getSavedItems(appType);
    }

    try {
      const rawSaved = await StatusScannerModule.getSavedStatuses(appType);
      if (!rawSaved || !Array.isArray(rawSaved)) {
        return StatusStorage.getSavedItems(appType);
      }

      return rawSaved.map((item: any) => ({
        id: item.id || item.filePath,
        type: item.type === 'video' ? 'video' : 'image',
        uri: item.uri || `file://${item.filePath}`,
        thumbnailUri: item.thumbnailUri || item.uri || `file://${item.filePath}`,
        fileName: item.fileName,
        filePath: item.filePath,
        timeAgo: item.timeAgo || 'Saved',
        timestamp: item.timestamp || Date.now(),
        sizeBytes: item.sizeBytes,
        isSaved: true,
        appSource: (item.appSource as WhatsAppType) || appType,
      }));
    } catch (err) {
      console.error('Error getting saved statuses:', err);
      return StatusStorage.getSavedItems(appType);
    }
  }

  /**
   * Save media file to phone Gallery (/Pictures/StatusSaver/WhatsApp or /Pictures/StatusSaver/WhatsAppBusiness)
   */
  public static async saveMedia(item: StatusMediaItem): Promise<boolean> {
    try {
      const appType = item.appSource || 'whatsapp';
      if (Platform.OS === 'android' && StatusScannerModule?.saveStatus) {
        const destPath = await StatusScannerModule.saveStatus(
          item.filePath || item.uri,
          appType
        );
        const updatedItem: StatusMediaItem = {
          ...item,
          filePath: destPath,
          uri: `file://${destPath}`,
          isSaved: true,
          appSource: appType,
        };
        await StatusStorage.saveStatus(updatedItem);
        return true;
      } else {
        await StatusStorage.saveStatus(item);
        return true;
      }
    } catch (e) {
      console.error('Error saving media item to gallery:', e);
      return false;
    }
  }

  /**
   * Delete a saved media file
   */
  public static async deleteSavedMedia(item: StatusMediaItem): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && StatusScannerModule?.deleteSavedStatus) {
        await StatusScannerModule.deleteSavedStatus(item.filePath || item.uri);
      }
      await StatusStorage.removeSavedStatus(item.id);
      return true;
    } catch (e) {
      console.error('Error deleting saved media:', e);
      return false;
    }
  }

  /**
   * Share media file (image/video) to external apps with FileProvider
   */
  public static async shareMedia(item: StatusMediaItem): Promise<void> {
    try {
      if (Platform.OS === 'android' && StatusScannerModule?.shareFile) {
        await StatusScannerModule.shareFile(item.filePath || item.uri);
      } else {
        await Share.share({
          title: 'Share WhatsApp Status',
          url: item.uri,
        });
      }
    } catch (e) {
      console.error('Error sharing media:', e);
    }
  }

  /**
   * Share multiple media files (images & videos) simultaneously in one share sheet
   */
  public static async shareMultipleMedia(items: StatusMediaItem[]): Promise<void> {
    try {
      if (!items || items.length === 0) return;
      if (items.length === 1) {
        await this.shareMedia(items[0]);
        return;
      }
      if (Platform.OS === 'android' && StatusScannerModule?.shareMultipleFiles) {
        const filePaths = items.map((i) => i.filePath || i.uri);
        await StatusScannerModule.shareMultipleFiles(filePaths);
      } else {
        await this.shareMedia(items[0]);
      }
    } catch (e) {
      console.error('Error sharing multiple media items:', e);
    }
  }

  /**
   * Repost media directly to WhatsApp / WA Business Status
   */
  public static async repostToWhatsApp(
    item: StatusMediaItem,
    appType: WhatsAppType = 'whatsapp'
  ): Promise<void> {
    try {
      const isBusiness = appType === 'business';
      if (Platform.OS === 'android' && StatusScannerModule?.repostToWhatsApp) {
        await StatusScannerModule.repostToWhatsApp(item.filePath || item.uri, isBusiness);
      } else {
        await this.shareMedia(item);
      }
    } catch (e) {
      console.error('Error reposting to WhatsApp:', e);
      await this.shareMedia(item);
    }
  }

  /**
   * Launch official WhatsApp app so user can view statuses first
   */
  public static async launchWhatsApp(
    appType: WhatsAppType = 'whatsapp'
  ): Promise<void> {
    const pkg =
      appType === 'business' ? 'com.whatsapp.w4b' : 'com.whatsapp';
    const scheme =
      appType === 'business'
        ? 'whatsapp-business://app'
        : 'whatsapp://app';

    try {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        await Linking.openURL(scheme);
      } else {
        await Linking.openURL(`https://play.google.com/store/apps/details?id=${pkg}`);
      }
    } catch (e) {
      Alert.alert('Open WhatsApp', 'Please open WhatsApp, view any status, and come back here!');
    }
  }
}
