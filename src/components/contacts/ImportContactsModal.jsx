import { useState } from 'react';
import GlassModal from '../ui/GlassModal';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import Icon from '../ui/Icon';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useImportContacts } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';

export default function ImportContactsModal({ isOpen, onClose }) {
  const toast = useToastContext();
  const importContacts = useImportContacts();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file to import');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await importContacts.mutateAsync(formData);
      
      toast.success(
        `Successfully imported ${result.imported || result.total || 0} contacts`
      );
      
      // Reset and close
      setFile(null);
      setFileName('');
      onClose();
    } catch (error) {
      // Error already handled by toast.error above
      toast.error(error?.message || 'Failed to import contacts. Please check your CSV format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setFileName('');
      onClose();
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts"
      size="md"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-border-subtle mb-4">
            Upload a CSV file with your contacts. The file should include columns for:
            phone, firstName (optional), lastName (optional), email (optional).
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-light mb-2">
                CSV File
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="px-4 py-3 rounded-lg glass border border-glass-border hover:border-ice-accent transition-colors flex items-center justify-between">
                    <span className="text-sm text-primary-light">
                      {fileName || 'Choose CSV file...'}
                    </span>
                    <Icon name="import" size="sm" variant="ice" />
                  </div>
                </label>
              </div>
              {file && (
                <p className="mt-2 text-xs text-ice-accent">
                  Selected: {fileName} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-glass-border">
          <GlassButton
            variant="ghost"
            size="lg"
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1"
          >
            Cancel
          </GlassButton>
          <GlassButton
            variant="primary"
            size="lg"
            onClick={handleImport}
            disabled={!file || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Importing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon name="import" size="sm" variant="ice" />
                Import Contacts
              </span>
            )}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}

