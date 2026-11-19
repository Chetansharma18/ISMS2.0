/** Camera feed installed at a Skill Development Centre (SDC). */
export interface SdcCameraFeed {
  id: string;
  cameraName: string;
  cameraCode: string;
  locationInCenter: string;
  sdcId: string;
  sdcName: string;
  tpName: string;
  branch: string;
  status: 'Online' | 'Offline';
  ipAddress?: string;
  streamUrl?: string;
}

/** SDC record with camera monitoring feeds and status. */
export interface SdcMonitoringItem {
  id: string;
  name: string;
  code: string;
  tpId: string;
  tpName: string;
  location: string;
  configuredFeeds: number;
  cameraStatus: string;
  cameras: SdcCameraFeed[];
}

/** @deprecated Retained for backwards compatibility if referenced by legacy mocks. */
export interface CameraBatchItem {
  id: string;
  batchName: string;
  batchCode: string;
  sdcName: string;
  tpName: string;
  branch: string;
  cameraStatus: string;
}

