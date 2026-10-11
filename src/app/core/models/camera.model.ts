/** A training batch as listed on the CCTV / camera monitoring screens. */
export interface CameraBatchItem {
  id: string;
  batchName: string;
  batchCode: string;
  sdcName: string;
  tpName: string;
  branch: string;
  cameraStatus: string;
}
