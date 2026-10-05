import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  AppState,
  AppStateStatus,
} from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import { FilterStrip } from '@/components/FilterStrip';
import { MediaCard } from '@/components/MediaCard';
import { EmptyState } from '@/components/EmptyState';
import { BatchActionBar } from '@/components/BatchActionBar';
import { FAB } from '@/components/FAB';
import { BottomNavBar } from '@/components/BottomNavBar';
import { MediaViewerModal } from '@/components/MediaViewerModal';
import { HowItWorksModal } from '@/components/HowItWorksModal';
import { ToastNotification, ToastConfig } from '@/components/ui/ToastNotification';
import { StatusLoadingSkeleton } from '@/components/ui/StatusLoadingSkeleton';
import {
  StatusMediaItem,
  TabType,
  WhatsAppType,
  StatusCounts,
} from '@/types/status';
import { StatusScannerService } from '@/services/statusScannerService';
import { StatusStorage } from '@/storage/statusStorage';

export const HomeScreen: React.FC = () => {
  const [appType, setAppType] = useState<WhatsAppType>('whatsapp');
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [allMedia, setAllMedia] = useState<StatusMediaItem[]>([]);
  const [savedMedia, setSavedMedia] = useState<StatusMediaItem[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const appTypeRef = useRef<WhatsAppType>(appType);
  useEffect(() => {
    appTypeRef.current = appType;
  }, [appType]);

  // Top Toast Notification Popup State
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const showToast = useCallback(
    (message: string, subMessage?: string, type: ToastConfig['type'] = 'success', duration = 3000) => {
      setToastConfig({ message, subMessage, type, duration });
      setToastVisible(true);
    },
    []
  );

  // Multi-selection state
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals state
  const [selectedViewerItem, setSelectedViewerItem] =
    useState<StatusMediaItem | null>(null);
  const [viewerVisible, setViewerVisible] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Initialize storage and scan statuses
  const loadStatuses = useCallback(async (selectedApp: WhatsAppType, isPullToRefresh = false, showSkeleton = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    }
    if (showSkeleton) {
      setInitialLoading(true);
    }
    try {
      await StatusScannerService.requestPermissions();
      const [items, realSaved] = await Promise.all([
        StatusScannerService.scanStatuses(selectedApp),
        StatusScannerService.getSavedStatuses(selectedApp),
      ]);

      const savedFileNames = new Set(realSaved.map((s) => s.fileName));
      const mergedItems = items.map((it) => ({
        ...it,
        isSaved: savedFileNames.has(it.fileName) || StatusStorage.isStatusSaved(it.id),
        appSource: selectedApp,
      }));

      setSavedMedia(realSaved);
      setAllMedia(mergedItems);
    } catch (e) {
      console.error('Error scanning statuses:', e);
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  // Initial bootstrap
  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      setInitialLoading(true);
      await StatusStorage.init();
      const initialApp = StatusStorage.getSelectedApp();
      if (isMounted) {
        setAppType(initialApp);
        await loadStatuses(initialApp, false, true);
      }
    };
    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [loadStatuses]);

  // Auto re-scan statuses whenever app is opened or brought back to foreground from WhatsApp
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        loadStatuses(appTypeRef.current, false, false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadStatuses]);

  // Handle WhatsApp switcher toggle
  const handleToggleAppType = async (type: WhatsAppType) => {
    if (type === appType) return;
    setAppType(type);
    await StatusStorage.setSelectedApp(type);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    showToast(
      type === 'business' ? 'Switched to WhatsApp Business' : 'Switched to WhatsApp',
      'Scanning statuses...',
      'info',
      2000
    );
    await loadStatuses(type, false, true);
  };

  // Filter items by active tab, current appType and search query
  const filteredList = useMemo(() => {
    let items: StatusMediaItem[] = [];

    if (activeTab === 'saved') {
      items = savedMedia.filter((item) => item.appSource === appType);
    } else if (activeTab === 'images') {
      items = allMedia.filter((item) => item.type === 'image');
    } else if (activeTab === 'videos') {
      items = allMedia.filter((item) => item.type === 'video');
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.fileName.toLowerCase().includes(q) ||
          item.timeAgo.toLowerCase().includes(q)
      );
    }

    return items;
  }, [allMedia, savedMedia, activeTab, appType, searchQuery]);

  // Compute status counts for category tabs based on selected appType
  const counts: StatusCounts = useMemo(() => {
    const imagesCount = allMedia.filter((item) => item.type === 'image').length;
    const videosCount = allMedia.filter((item) => item.type === 'video').length;
    const savedCount = savedMedia.filter((item) => item.appSource === appType).length;
    return {
      images: imagesCount,
      videos: videosCount,
      saved: savedCount,
    };
  }, [allMedia, savedMedia, appType]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    await loadStatuses(appType, true);
    showToast('Refreshed Statuses', 'Latest WhatsApp statuses loaded', 'info', 2000);
  }, [appType, loadStatuses, showToast]);

  // Single card press -> Open viewer
  const handleCardPress = (item: StatusMediaItem) => {
    setSelectedViewerItem(item);
    setViewerVisible(true);
  };

  // Long press -> Enter multi-select mode
  const handleCardLongPress = (item: StatusMediaItem) => {
    setIsSelectionMode(true);
    const newSet = new Set(selectedIds);
    if (newSet.has(item.id)) {
      newSet.delete(item.id);
    } else {
      newSet.add(item.id);
    }
    setSelectedIds(newSet);
  };

  // Toggle selection for a single item
  const handleToggleSelect = (item: StatusMediaItem) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(item.id)) {
      newSet.delete(item.id);
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
    } else {
      newSet.add(item.id);
    }
    setSelectedIds(newSet);
  };

  // Toggle Select All / Deselect All
  const handleToggleSelectAll = () => {
    if (isSelectionMode && selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } else {
      const newSet = new Set<string>();
      filteredList.forEach((item) => newSet.add(item.id));
      setSelectedIds(newSet);
      setIsSelectionMode(true);
    }
  };

  // Toggle Save status from viewer or card
  const handleToggleSave = async (item: StatusMediaItem) => {
    const itemWithApp: StatusMediaItem = {
      ...item,
      appSource: item.appSource || appType,
    };

    if (item.isSaved) {
      await StatusScannerService.deleteSavedMedia(itemWithApp);
      showToast('Status Removed', 'Removed from saved collection', 'info');
    } else {
      const savedOk = await StatusScannerService.saveMedia(itemWithApp);
      if (savedOk) {
        showToast(
          'Status Saved! 🎉',
          `Media copied to phone Gallery (/Pictures/StatusSaver/${
            appType === 'business' ? 'WhatsAppBusiness' : 'WhatsApp'
          })`,
          'success'
        );
      } else {
        showToast('Save Failed', 'Could not save to gallery', 'error');
      }
    }
    await loadStatuses(appType);
    if (selectedViewerItem && selectedViewerItem.id === item.id) {
      setSelectedViewerItem((prev) => (prev ? { ...prev, isSaved: !item.isSaved } : null));
    }
  };

  // Batch Save Selected
  const handleBatchSave = async () => {
    const sourceList = activeTab === 'saved' ? savedMedia : allMedia;
    const toSave = sourceList.filter((m) => selectedIds.has(m.id));
    let savedCount = 0;
    for (const item of toSave) {
      const ok = await StatusScannerService.saveMedia({
        ...item,
        appSource: item.appSource || appType,
      });
      if (ok) savedCount++;
    }
    await loadStatuses(appType);
    showToast(
      'Batch Download Complete 🎉',
      `Successfully saved ${savedCount} status${
        savedCount > 1 ? 'es' : ''
      } to your Gallery!`,
      'success'
    );
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  // Batch Share Selected
  const handleBatchShare = async () => {
    const sourceList = activeTab === 'saved' ? savedMedia : allMedia;
    const toShare = sourceList.filter((m) => selectedIds.has(m.id));
    if (toShare.length > 0) {
      showToast(
        'Opening Share Sheet...',
        `Sharing ${toShare.length} status${toShare.length > 1 ? 'es' : ''}`,
        'info'
      );
      await StatusScannerService.shareMultipleMedia(toShare);
    }
  };

  // Delete saved item
  const handleDeleteSaved = async (item: StatusMediaItem) => {
    await StatusScannerService.deleteSavedMedia(item);
    await loadStatuses(appType);
    if (viewerVisible) {
      setViewerVisible(false);
      setSelectedViewerItem(null);
    }
    showToast('Status Deleted', 'File deleted from saved gallery', 'info');
  };

  // FAB Press -> Quick Save All or Toggle Selection
  const handleFABPress = () => {
    if (isSelectionMode && selectedIds.size > 0) {
      handleBatchSave();
    } else {
      handleToggleSelectAll();
    }
  };

  // Viewer Next / Prev navigation
  const handleViewerNext = () => {
    if (!selectedViewerItem) return;
    const currentIndex = filteredList.findIndex(
      (m) => m.id === selectedViewerItem.id
    );
    if (currentIndex < filteredList.length - 1) {
      setSelectedViewerItem(filteredList[currentIndex + 1]);
    }
  };

  const handleViewerPrev = () => {
    if (!selectedViewerItem) return;
    const currentIndex = filteredList.findIndex(
      (m) => m.id === selectedViewerItem.id
    );
    if (currentIndex > 0) {
      setSelectedViewerItem(filteredList[currentIndex - 1]);
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Notify Popup Banner */}
        <ToastNotification
          visible={toastVisible}
          config={toastConfig}
          onDismiss={() => setToastVisible(false)}
        />

        {/* Top Header with WhatsApp / Business switcher */}
        <Header
          appType={appType}
          onToggleAppType={handleToggleAppType}
          onRefresh={onRefresh}
          onOpenSearch={() => setSearchOpen(!searchOpen)}
          onOpenMenu={() => setShowHowItWorks(true)}
          onOpenHelp={() => setShowHowItWorks(true)}
        />

        {/* Optional Search Bar Input */}
        {searchOpen && (
          <View style={styles.searchBarRow}>
            <Icon name="search" size={18} color={PALETTE.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search statuses by time or name..."
              placeholderTextColor={PALETTE.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              >
                <Icon name="close" size={16} color={PALETTE.outline} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Top Category Tabs: Images, Videos, Saved */}
        <CategoryTabs
          activeTab={activeTab}
          counts={counts}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsSelectionMode(false);
            setSelectedIds(new Set());
          }}
        />

        {/* Context Strip: Disappears in 24h & Select All */}
        <FilterStrip
          activeTab={activeTab}
          isSelectionMode={isSelectionMode}
          isAllSelected={
            filteredList.length > 0 && selectedIds.size === filteredList.length
          }
          selectedCount={selectedIds.size}
          onToggleSelectAll={handleToggleSelectAll}
        />

        {/* First Time Loader Skeleton OR Media Grid / Empty State */}
        {initialLoading ? (
          <StatusLoadingSkeleton
            appName={appType === 'business' ? 'WhatsApp Business' : 'WhatsApp'}
          />
        ) : filteredList.length === 0 ? (
          <EmptyState
            activeTab={activeTab}
            appType={appType}
            onRefresh={onRefresh}
          />
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContentContainer}
            renderItem={({ item }) => (
              <MediaCard
                item={item}
                isSelected={selectedIds.has(item.id)}
                isSelectionMode={isSelectionMode}
                onPress={handleCardPress}
                onLongPress={handleCardLongPress}
                onToggleSelect={handleToggleSelect}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[PALETTE.accentGreen, PALETTE.primaryContainer]}
                tintColor={PALETTE.accentGreen}
              />
            }
            ListFooterComponent={
              <View style={styles.guidanceCard}>
                <View style={styles.guidanceIconContainer}>
                  <Icon name="info" size={20} color={PALETTE.onSecondaryContainer} />
                </View>
                <View style={styles.guidanceTextContainer}>
                  <Text style={styles.guidanceTitle}>How it works</Text>
                  <Text style={styles.guidanceDescription}>
                    View statuses on {appType === 'business' ? 'WhatsApp Business' : 'WhatsApp'} to automatically display them here. Tap any photo or video to view full screen or save.
                  </Text>
                </View>
              </View>
            }
          />
        )}

        {/* Floating Action Button (FAB) for batch download */}
        <FAB
          onPress={handleFABPress}
          visible={!initialLoading && filteredList.length > 0 && !isSelectionMode}
        />

        {/* Batch Action Bar when items are selected */}
        <BatchActionBar
          selectedCount={selectedIds.size}
          onSaveAll={handleBatchSave}
          onShareAll={handleBatchShare}
          onDeleteAll={
            activeTab === 'saved'
              ? () => {
                  const toDelete = allMedia.filter((m) =>
                    selectedIds.has(m.id)
                  );
                  toDelete.forEach(handleDeleteSaved);
                  setIsSelectionMode(false);
                  setSelectedIds(new Set());
                }
              : undefined
          }
          onCancel={() => {
            setIsSelectionMode(false);
            setSelectedIds(new Set());
          }}
          isSavedTab={activeTab === 'saved'}
        />

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsSelectionMode(false);
            setSelectedIds(new Set());
          }}
        />

        {/* Full-screen Media Viewer Modal */}
        <MediaViewerModal
          visible={viewerVisible}
          media={selectedViewerItem}
          onClose={() => {
            setViewerVisible(false);
            setSelectedViewerItem(null);
          }}
          onToggleSave={handleToggleSave}
          onDelete={handleDeleteSaved}
          onNext={handleViewerNext}
          onPrev={handleViewerPrev}
        />

        {/* How It Works Tutorial Modal */}
        <HowItWorksModal
          visible={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
          appType={appType}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.primaryContainer,
  },
  container: {
    flex: 1,
    backgroundColor: PALETTE.surface,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surfaceContainerLowest,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(190, 201, 197, 0.4)',
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: PALETTE.onSurface,
    marginLeft: 8,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  gridContentContainer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: 100,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PALETTE.surfaceContainerLowest,
    borderRadius: 12,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 197, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  guidanceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETTE.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  guidanceTextContainer: {
    flex: 1,
  },
  guidanceTitle: {
    ...TYPOGRAPHY.labelLg,
    color: PALETTE.onSurface,
    fontWeight: '700',
    marginBottom: 2,
  },
  guidanceDescription: {
    ...TYPOGRAPHY.bodySm,
    color: PALETTE.onSurfaceVariant,
    lineHeight: 18,
  },
});
