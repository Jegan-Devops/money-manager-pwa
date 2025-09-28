import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Settings as SettingsIcon, Download, Upload, RotateCcw } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings, exportData, importData, resetData } = useFinance();
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `money-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        importData(data);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Invalid backup file');
      }
      setImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings fade-in">
      <h1 className="page-title">Settings</h1>

      <div className="settings-sections">
        <div className="settings-section card">
          <h2>Preferences</h2>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
              />
              Enable Notifications
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={settings.budgetAlerts}
                onChange={(e) => updateSettings({ budgetAlerts: e.target.checked })}
              />
              Budget Alerts
            </label>
          </div>
        </div>

        <div className="settings-section card">
          <h2>Data Management</h2>
          <div className="setting-actions">
            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={20} />
              Export Data
            </button>
            
            <label className="btn btn-secondary">
              <Upload size={20} />
              Import Data
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport}
                style={{ display: 'none' }}
                disabled={importing}
              />
            </label>
            
            <button className="btn btn-danger" onClick={resetData}>
              <RotateCcw size={20} />
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;