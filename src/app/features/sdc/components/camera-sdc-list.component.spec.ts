import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { CameraSdcListComponent } from './camera-sdc-list.component';
import { SdcMonitoringItem } from '../../../core/models/camera.model';

describe('CameraSdcListComponent', () => {
  let fixture: ComponentFixture<CameraSdcListComponent>;
  let component: CameraSdcListComponent;

  const mockSdc: SdcMonitoringItem = {
    id: 'SDC-101',
    name: 'SDC Jaipur Central',
    code: 'SDC-JPR-01',
    tpId: 'TP-001',
    tpName: 'Company 1',
    location: 'Jaipur, Rajasthan',
    configuredFeeds: 2,
    cameraStatus: 'Active',
    cameras: [
      {
        id: 'CAM-01',
        cameraName: 'Classroom 1 Cam',
        cameraCode: 'C1',
        locationInCenter: 'Room 101',
        sdcId: 'SDC-101',
        sdcName: 'SDC Jaipur Central',
        tpName: 'Company 1',
        branch: 'Main',
        status: 'Online',
        ipAddress: '192.168.1.10',
        streamUrl: '/video.mp4'
      },
      {
        id: 'CAM-02',
        cameraName: 'Lab 2 Cam',
        cameraCode: 'C2',
        locationInCenter: 'Computer Lab',
        sdcId: 'SDC-101',
        sdcName: 'SDC Jaipur Central',
        tpName: 'Company 1',
        branch: 'Main',
        status: 'Online',
        ipAddress: '192.168.1.11',
        streamUrl: '/video.mp4'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraSdcListComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CameraSdcListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.closeModal();
  });

  it('opens live feed modal with multi-view enabled for multi-camera SDC', () => {
    component.openSdcLiveFeed(mockSdc);
    expect(component.selectedSdc()?.id).toBe('SDC-101');
    expect(component.isMultiView()).toBe(true);
    expect(component.multiSelectedCameras().length).toBe(2);
  });

  it('toggles multi-view state and exits native fullscreen if active', () => {
    component.openSdcLiveFeed(mockSdc);
    expect(component.isMultiView()).toBe(true);

    const exitSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.createElement('div'),
      configurable: true
    });
    document.exitFullscreen = exitSpy;

    component.toggleMultiView();
    expect(component.isMultiView()).toBe(false);
    expect(exitSpy).toHaveBeenCalled();

    // Clean up mock
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true
    });
  });

  it('toggles recording state without errors', () => {
    component.openSdcLiveFeed(mockSdc);
    expect(component.recordingStates()['CAM-01']).toBeFalsy();

    component.toggleRecord('CAM-01');
    expect(component.recordingStates()['CAM-01']).toBe(true);

    component.toggleRecord('CAM-01');
    expect(component.recordingStates()['CAM-01']).toBe(false);
  });
});
