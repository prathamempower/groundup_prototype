// GroundUp AI — Service Container & Dependency Injection Factory
// Plug-and-play switching between Local Mock Layer and Live Http Backend via VITE_USE_MOCK_DATA

import {
  IProjectService,
  IIntakeService,
  IDrawService,
  IInvoiceService,
  IAlertService,
  IDocumentService,
  IPipelineService,
  IChatService,
  IProvenanceService,
  IAdminService,
} from './interfaces';

import {
  MockProjectService,
  MockIntakeService,
  MockDrawService,
  MockInvoiceService,
  MockAlertService,
  MockDocumentService,
  MockPipelineService,
  MockChatService,
  MockProvenanceService,
  MockAdminService,
} from './mock';

import {
  HttpProjectService,
  HttpIntakeService,
  HttpDrawService,
  HttpInvoiceService,
  HttpAlertService,
  HttpDocumentService,
  HttpPipelineService,
  HttpChatService,
  HttpProvenanceService,
  HttpAdminService,
} from './http';

export interface ServiceContainer {
  projects: IProjectService;
  intake: IIntakeService;
  draws: IDrawService;
  invoices: IInvoiceService;
  alerts: IAlertService;
  documents: IDocumentService;
  pipeline: IPipelineService;
  chat: IChatService;
  provenance: IProvenanceService;
  admin: IAdminService;
  isMock: boolean;
}

export function createServiceContainer(forceMock?: boolean): ServiceContainer {
  const useMock = forceMock !== undefined
    ? forceMock
    : typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_USE_MOCK_DATA !== 'false'
    : true;

  if (useMock) {
    return {
      projects: new MockProjectService(),
      intake: new MockIntakeService(),
      draws: new MockDrawService(),
      invoices: new MockInvoiceService(),
      alerts: new MockAlertService(),
      documents: new MockDocumentService(),
      pipeline: new MockPipelineService(),
      chat: new MockChatService(),
      provenance: new MockProvenanceService(),
      admin: new MockAdminService(),
      isMock: true,
    };
  }

  return {
    projects: new HttpProjectService(),
    intake: new HttpIntakeService(),
    draws: new HttpDrawService(),
    invoices: new HttpInvoiceService(),
    alerts: new HttpAlertService(),
    documents: new HttpDocumentService(),
    pipeline: new HttpPipelineService(),
    chat: new HttpChatService(),
    provenance: new HttpProvenanceService(),
    admin: new HttpAdminService(),
    isMock: false,
  };
}

// Singleton global service instance for React components and hooks
export const services = createServiceContainer();
