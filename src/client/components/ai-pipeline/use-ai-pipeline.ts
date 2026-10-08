import { useState } from 'react';
import { FinalReportDataDTO as FinalReportData } from '../../../types';
import { services } from '../../../services';
import { InputSource, PipelineStepLog, StagedDoc } from './types';

export function useAIPipeline(onPipelineCompleted: (projectId: string, finalReport: FinalReportData) => void) {
  const [inputSource, setInputSource] = useState<InputSource>('FILE_UPLOAD');
  const [projectName, setProjectName] = useState('Central Austin Urban Residences');
  const [projectAddress, setProjectAddress] = useState('1402 S Congress Ave, Austin, TX 78704');
  const [targetBudget, setTargetBudget] = useState('1300000');
  const [uploadedFiles] = useState<StagedDoc[]>([
    { name: 'Austin_Multifamily_Master_SOV.csv', size: '14.2 KB', type: 'CSV / SOV' },
    { name: 'Invoice_Titan_Concrete_Paving.txt', size: '3.1 KB', type: 'Invoice / Receipt' },
    { name: 'Invoice_BMC_Lumber_Framing.txt', size: '4.8 KB', type: 'Invoice / Waiver' },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<PipelineStepLog[]>([]);
  const [executionResult, setExecutionResult] = useState<{ projectId: string; finalReport: FinalReportData } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartPipeline = async () => {
    setIsProcessing(true);
    setCurrentStepIndex(1);
    setErrorMsg(null);
    setCompletedSteps([]);
    setExecutionResult(null);

    try {
      const stepTimer = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < 9 ? prev + 1 : prev));
      }, 350);

      const data = await services.pipeline.executePipeline({
        sourceType: inputSource,
        projectName,
        projectAddress,
        targetBudget: parseFloat(targetBudget) || 1300000,
        units: 4,
        squareFeet: 6400,
        files: [
          {
            fileName: 'Austin_Multifamily_Master_SOV.csv',
            content: `Category,Cost Code,Amount
Pre-construction, Permits & General Requirements,01-100,65000
Site Work & Underground Utilities,02-100,85000
Foundation & Concrete Slabs,03-300,240000
Framing, Lumber & Roof Trusses,06-100,320000
Plumbing Rough-In & Manifolds,22-000,165000
Electrical Distribution & Panels,26-000,140000
Drywall, Insulation & Finishes,09-200,120000
Exterior Stucco & Siding,07-100,95000
Contingency Reserve,00-500,70000
Subtotal Construction Hard Costs,,1300000`,
          },
          {
            fileName: 'Invoice_Titan_Concrete_Paving.txt',
            content: `Titan Concrete Systems LLC
Invoice #: INV-2026-9041
Date: 2026-04-12
Project: ${projectName}
Item: 03-300 Post-tension foundation slab pour: $185,000.00
Unconditional Lien Waiver: Attached & Signed
Previous Statement Balance: $45,000.00
Net Current Amount Due: $185,000.00`,
          },
          {
            fileName: 'Invoice_BMC_Lumber_Framing.txt',
            content: `BMC Building Materials & Truss Supply
Invoice #: INV-2026-9042
Date: 2026-04-18
Category: 06-100 Framing, Lumber & Roof Trusses
Amount Due: $148,000.00
Progress: Trusses delivered and 2nd floor framing complete
Lien Waiver: Conditional on payment of $148,000.00`,
          },
        ],
        userContext: {
          name: 'Harrison Reed',
          company: 'Acme Builders LLC',
          email: 'harrison@acmebuilders.com',
          role: 'Developer / Sponsor',
        },
      });

      clearInterval(stepTimer);

      setCurrentStepIndex(10);
      setCompletedSteps(data.stepLogs || []);
      setExecutionResult({ projectId: data.project.id, finalReport: data.finalReport });
      setIsProcessing(false);

      onPipelineCompleted(data.project.id, data.finalReport);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'An unexpected error occurred during processing.');
    }
  };

  return {
    inputSource,
    setInputSource,
    projectName,
    setProjectName,
    projectAddress,
    setProjectAddress,
    targetBudget,
    setTargetBudget,
    uploadedFiles,
    isProcessing,
    currentStepIndex,
    completedSteps,
    executionResult,
    errorMsg,
    handleStartPipeline,
  };
}
