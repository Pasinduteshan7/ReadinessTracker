import React, { useRef, useEffect, useState } from 'react';
import Editor from  '@monaco-editor/react';

interface SecureCodeEditorProps {
  submissionId: string;
  challengeId: string;
  language?: string;
  onSubmit: (code: string, metadata: any) => void;
  onWarning: (message: string) => void;
}

interface MonitoringData {
  pasteAttempts: number;
  tabSwitches: number;
  keystrokeCount: number;
  largeInsertions: number;
  suspiciousActivities: Array<{type: string, timestamp: number}>;
}

export const SecureCodeEditor: React.FC<SecureCodeEditorProps> = ({
  submissionId,
  challengeId,
  language = 'python',
  onSubmit,
  onWarning
}) => {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState('');
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    pasteAttempts: 0,
    tabSwitches: 0,
    keystrokeCount: 0,
    largeInsertions: 0,
    suspiciousActivities: []
  });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const keystrokesRef = useRef<Array<{key: string, timestamp: number}>>([]);
  const lastKeystrokeRef = useRef<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(t => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePasteEvent, true);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('paste', handlePasteEvent, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const handlePasteEvent = (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    if (target?.closest('.monaco-editor')) {
      e.preventDefault();
      e.stopPropagation();
      
      setMonitoringData(prev => ({
        ...prev,
        pasteAttempts: prev.pasteAttempts + 1,
        suspiciousActivities: [...prev.suspiciousActivities, {
          type: 'paste_attempted',
          timestamp: Date.now()
        }]
      }));
      
      onWarning('⚠️ Paste is disabled during the challenge');
      
      recordPasteAttempt();
      
      return false;
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target?.closest('.code-editor-container')) {
      e.preventDefault();
      return false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    
    if ((isCmdOrCtrl && e.key === 'v') || (e.shiftKey && e.key === 'Insert')) {
      const target = e.target as HTMLElement;
      if (document.activeElement?.closest('.monaco-editor') || target?.closest('.monaco-editor')) {
        e.preventDefault();
        
        setMonitoringData(prev => ({
          ...prev,
          pasteAttempts: prev.pasteAttempts + 1
        }));
        
        onWarning('⚠️ Paste shortcuts are disabled');
        recordPasteAttempt();
        
        return false;
      }
    }

    trackKeystroke(e.key);
  };

  const handleWindowBlur = () => {
    setMonitoringData(prev => ({
      ...prev,
      tabSwitches: prev.tabSwitches + 1,
      suspiciousActivities: [...prev.suspiciousActivities, {
        type: 'tab_switched',
        timestamp: Date.now()
      }]
    }));
    
    recordTabSwitch();
    
    if (monitoringData.tabSwitches > 3) {
      onWarning('⚠️ Tab switching detected. This is being monitored.');
    }
  };

  const handleWindowFocus = () => {
    if (monitoringData.tabSwitches > 0) {
      onWarning(`⚠️ You switched away ${monitoringData.tabSwitches} times`);
    }
  };

  const trackKeystroke = (key: string) => {
    const now = Date.now();
    keystrokesRef.current.push({ key, timestamp: now });
    
    setMonitoringData(prev => ({
      ...prev,
      keystrokeCount: prev.keystrokeCount + 1
    }));

    if (lastKeystrokeRef.current > 0) {
      const interval = now - lastKeystrokeRef.current;
      if (interval < 30 && keystrokesRef.current.length > 5) {
        analyzeTypingPattern();
      }
    }

    lastKeystrokeRef.current = now;
  };

  const analyzeTypingPattern = () => {
    const recent = keystrokesRef.current.slice(-20);
    const intervals = [];
    
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i].timestamp - recent[i - 1].timestamp);
    }

    if (intervals.length > 0) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      if (avgInterval < 25) {
        setMonitoringData(prev => ({
          ...prev,
          suspiciousActivities: [...prev.suspiciousActivities, {
            type: 'abnormally_fast_typing',
            timestamp: Date.now()
          }]
        }));
      }
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;

    setCode(value);

    const recentCode = value.slice(-100);
    if (recentCode.length > 50 && !recentCode.includes('\n')) {
      setMonitoringData(prev => ({
        ...prev,
        largeInsertions: prev.largeInsertions + 1,
        suspiciousActivities: [...prev.suspiciousActivities, {
          type: 'large_insertion',
          timestamp: Date.now()
        }]
      }));

      if (monitoringData.largeInsertions > 2) {
        onWarning('⚠️ Large text insertion detected. This will be reviewed.');
      }
    }
  };

  const recordPasteAttempt = async () => {
    try {
      await fetch(`http://localhost:8080/api/challenge/monitor/paste?submissionId=${submissionId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to record paste attempt:', error);
    }
  };

  const recordTabSwitch = async () => {
    try {
      await fetch(`http://localhost:8080/api/challenge/monitor/tab-switch?submissionId=${submissionId}&timestamp=${Date.now()}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to record tab switch:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/challenge/submit?userId=${submissionId}&challengeId=${challengeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          time_taken_seconds: timeElapsed,
          monitoring_data: monitoringData
        })
      });

      if (response.ok) {
        await response.json();
        onSubmit(code, {
          ...monitoringData,
          time_taken_seconds: timeElapsed
        });
      }
    } catch (error) {
      onWarning('Error submitting solution: ' + error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="code-editor-container bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center bg-gray-800 px-6 py-4">
        <div className="text-white font-bold">Algorithm Challenge Editor</div>
        <div className="text-white text-sm">
          Time: {formatTime(timeElapsed)} | Paste Attempts: {monitoringData.pasteAttempts}
        </div>
      </div>

      <Editor
        height="500px"
        defaultLanguage={language}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          contextmenu: false,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnEnter: 'off',
          tabCompletion: 'off',
          wordBasedSuggestions: 'off',
          parameterHints: { enabled: false },
          snippetSuggestions: 'none',
          readOnly: false,
          wordWrap: 'on',
          fontSize: 14
        }}
        onMount={(editor: any) => {
          editorRef.current = editor;
        }}
      />

      <div className="bg-gray-800 px-6 py-4 flex justify-end gap-3">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold"
        >
          Submit Solution
        </button>
      </div>

      <div className="bg-gray-800 px-6 py-2 text-xs text-gray-400 border-t border-gray-700">
        <div>Tab Switches: {monitoringData.tabSwitches} | Large Insertions: {monitoringData.largeInsertions}</div>
        {monitoringData.pasteAttempts > 0 && (
          <div className="text-red-400">⚠️ {monitoringData.pasteAttempts} paste attempts detected</div>
        )}
      </div>
    </div>
  );
};

export default SecureCodeEditor;
