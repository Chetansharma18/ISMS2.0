export type BiometricDeviceType = 'Fingerprint' | 'Face Recognition' | 'IRIS';

/** A biometric device issued by DoITC, as its registry knows it. */
export interface DoitcDevice {
  serialNo: string;
  type: BiometricDeviceType;
  model: string;
}

/**
 * Dummy DoITC device registry: a training partner's Attender User links a device to a batch by its serial number, and
 * the serial is checked here. Replace with the DoITC registry lookup when it is available.
 */
export const DOITC_DEVICES: DoitcDevice[] = [
  { serialNo: 'DOITC-FP-0001', type: 'Fingerprint', model: 'DoITC Fingerprint Terminal' },
  { serialNo: 'DOITC-FP-0002', type: 'Fingerprint', model: 'DoITC Fingerprint Terminal' },
  { serialNo: 'DOITC-FP-0003', type: 'Fingerprint', model: 'DoITC Fingerprint Terminal' },
  { serialNo: 'DOITC-FP-0004', type: 'Fingerprint', model: 'DoITC Fingerprint Terminal' },
  { serialNo: 'DOITC-FC-0001', type: 'Face Recognition', model: 'DoITC Face Terminal' },
  { serialNo: 'DOITC-FC-0002', type: 'Face Recognition', model: 'DoITC Face Terminal' },
  { serialNo: 'DOITC-IR-0001', type: 'IRIS', model: 'DoITC IRIS Scanner' }
];
