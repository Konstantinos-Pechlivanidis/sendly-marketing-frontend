import { useState } from 'react';
import GlassModal from '../ui/GlassModal';
import GlassButton from '../ui/GlassButton';
import GlassCard from '../ui/GlassCard';
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
  const [showInstructions, setShowInstructions] = useState(true);

  // Generate sample CSV content
  const generateSampleCSV = () => {
    const sampleData = [
      ['phoneE164', 'firstName', 'lastName', 'email', 'gender', 'birthDate', 'smsConsent', 'tags'],
      ['+306977123456', 'John', 'Doe', 'john.doe@example.com', 'male', '1990-05-15', 'opted_in', 'VIP,Customer'],
      ['+306977123457', 'Jane', 'Smith', 'jane.smith@example.com', 'female', '1985-08-22', 'opted_in', 'Customer'],
      ['+306977123458', 'Alex', 'Johnson', '', 'other', '', 'opted_in', ''],
      ['+306977123459', 'Maria', 'Garcia', 'maria@example.com', 'female', '1992-12-01', 'opted_out', 'Newsletter'],
    ];
    return sampleData.map(row => row.join(',')).join('\n');
  };

  const downloadSampleCSV = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample CSV file downloaded');
  };

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

  // Parse CSV file to JSON (handles quoted fields and commas)
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    // Simple CSV parser that handles quoted fields
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            current += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim()); // Add last field
      return result;
    };

    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
    const phoneE164Index = headers.findIndex(h => h.toLowerCase() === 'phonee164');
    
    if (phoneE164Index === -1) {
      throw new Error('CSV file must contain a "phoneE164" column');
    }

    // Parse data rows
    const contacts = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line).map(v => v.replace(/^"|"$/g, '').trim());
        
        // Skip if phone is missing
        if (!values[phoneE164Index] || values[phoneE164Index] === '') {
          errors.push(`Row ${i + 1}: Missing phone number`);
          continue;
        }

        const contact = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          const headerLower = header.toLowerCase();
          
          // Handle different field names (case-insensitive, supports snake_case)
          if (headerLower === 'phonee164' || headerLower === 'phone') {
            contact.phoneE164 = value;
          } else if (headerLower === 'firstname' || headerLower === 'first_name') {
            contact.firstName = value || null;
          } else if (headerLower === 'lastname' || headerLower === 'last_name') {
            contact.lastName = value || null;
          } else if (headerLower === 'email') {
            contact.email = value || null;
          } else if (headerLower === 'gender') {
            contact.gender = value || null;
          } else if (headerLower === 'birthdate' || headerLower === 'birth_date') {
            contact.birthDate = value || null;
          } else if (headerLower === 'smsconsent' || headerLower === 'sms_consent') {
            contact.smsConsent = value || 'unknown';
          } else if (headerLower === 'tags') {
            contact.tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
          }
        });

        contacts.push(contact);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message || 'Parse error'}`);
      }
    }

    if (contacts.length === 0) {
      throw new Error('No valid contacts found in CSV file. Please check the format.');
    }

    if (contacts.length > 1000) {
      throw new Error('Maximum 1000 contacts per import. Please split your file.');
    }

    return { contacts, errors };
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file to import');
      return;
    }

    setIsUploading(true);
    try {
      // Read and parse CSV file
      const fileText = await file.text();
      const { contacts, errors } = parseCSV(fileText);

      // Show warnings for parsing errors
      if (errors.length > 0) {
        toast.error(`${errors.length} row(s) had errors. Check the console for details.`);
        console.warn('CSV parsing errors:', errors);
      }

      // Send parsed contacts as JSON
      const result = await importContacts.mutateAsync({ contacts });
      
      const imported = result.data?.created || result.created || 0;
      const updated = result.data?.updated || result.updated || 0;
      const skipped = result.data?.skipped || result.skipped || 0;
      
      let message = `Successfully imported ${imported} contact${imported !== 1 ? 's' : ''}`;
      if (updated > 0) {
        message += `, updated ${updated}`;
      }
      if (skipped > 0) {
        message += `, skipped ${skipped}`;
      }
      
      toast.success(message);
      
      // Reset and close
      setFile(null);
      setFileName('');
      onClose();
    } catch (error) {
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
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-text-primary">Import Instructions</h3>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors"
            aria-label={showInstructions ? 'Hide instructions' : 'Show instructions'}
          >
            <Icon 
              name="arrowRight" 
              size="sm" 
              variant="ice"
              className={`transition-transform ${showInstructions ? 'rotate-90' : '-rotate-90'}`}
            />
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        {showInstructions && (
          <GlassCard className="p-4 sm:p-6 space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold text-neutral-text-primary mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ice-primary text-primary-dark text-sm font-bold">1</span>
                  Prepare Your CSV File
                </h4>
                <p className="text-sm text-neutral-text-secondary ml-8 mb-3">
                  Create a CSV file with the following columns. The first row should contain column headers.
                </p>
                
                {/* Field Requirements Table */}
                <div className="ml-8 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-border/60">
                        <th className="text-left py-2 px-3 font-semibold text-neutral-text-primary">Column Name</th>
                        <th className="text-left py-2 px-3 font-semibold text-neutral-text-primary">Required</th>
                        <th className="text-left py-2 px-3 font-semibold text-neutral-text-primary">Format</th>
                        <th className="text-left py-2 px-3 font-semibold text-neutral-text-primary">Example</th>
                      </tr>
                    </thead>
                    <tbody className="text-neutral-text-secondary">
                      <tr className="border-b border-neutral-border/30">
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">phoneE164</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-600">Required</span>
                        </td>
                        <td className="py-2 px-3">E.164 format</td>
                        <td className="py-2 px-3 font-mono text-xs">+306977123456</td>
                      </tr>
                      <tr className="border-b border-neutral-border/30">
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">firstName</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-surface-secondary text-neutral-text-secondary">Optional</span>
                        </td>
                        <td className="py-2 px-3">Text (max 100 chars)</td>
                        <td className="py-2 px-3">John</td>
                      </tr>
                      <tr className="border-b border-neutral-border/30">
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">lastName</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-surface-secondary text-neutral-text-secondary">Optional</span>
                        </td>
                        <td className="py-2 px-3">Text (max 100 chars)</td>
                        <td className="py-2 px-3">Doe</td>
                      </tr>
                      <tr className="border-b border-neutral-border/30">
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">email</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-surface-secondary text-neutral-text-secondary">Optional</span>
                        </td>
                        <td className="py-2 px-3">Valid email format</td>
                        <td className="py-2 px-3">john@example.com</td>
                      </tr>
                      <tr className="border-b border-neutral-border/30">
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">gender</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-surface-secondary text-neutral-text-secondary">Optional</span>
                        </td>
                        <td className="py-2 px-3">male, female, or other</td>
                        <td className="py-2 px-3">male</td>
                      </tr>
                      <tr className="border-b border-neutral-border/30">
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">birthDate</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-surface-secondary text-neutral-text-secondary">Optional</span>
                        </td>
                        <td className="py-2 px-3">ISO 8601 date</td>
                        <td className="py-2 px-3 font-mono text-xs">1990-05-15</td>
                      </tr>
                      <tr className="border-b border-neutral-border/30">
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">smsConsent</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-surface-secondary text-neutral-text-secondary">Optional</span>
                        </td>
                        <td className="py-2 px-3">opted_in, opted_out, or unknown</td>
                        <td className="py-2 px-3">opted_in</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-neutral-text-primary">tags</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-surface-secondary text-neutral-text-secondary">Optional</span>
                        </td>
                        <td className="py-2 px-3">Comma-separated list</td>
                        <td className="py-2 px-3">VIP,Customer</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-neutral-text-primary mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ice-primary text-primary-dark text-sm font-bold">2</span>
                  Download Sample File
                </h4>
                <div className="ml-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <GlassButton
                      variant="ghost"
                      size="md"
                      onClick={downloadSampleCSV}
                      className="min-h-[44px]"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name="export" size="sm" variant="ice" />
                        Download Sample CSV
                      </span>
                    </GlassButton>
                    <p className="text-sm text-neutral-text-secondary">
                      Use this as a template for your import file
                    </p>
                  </div>
                  <div className="bg-neutral-surface-secondary/50 rounded-lg p-3 border border-neutral-border/30">
                    <p className="text-xs font-mono text-neutral-text-secondary whitespace-pre-wrap">
{`phoneE164,firstName,lastName,email,gender,birthDate,smsConsent,tags
+306977123456,John,Doe,john@example.com,male,1990-05-15,opted_in,"VIP,Customer"
+306977123457,Jane,Smith,jane@example.com,female,1985-08-22,opted_in,Customer`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-neutral-text-primary mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ice-primary text-primary-dark text-sm font-bold">3</span>
                  Important Notes
                </h4>
                <ul className="ml-8 space-y-2 text-sm text-neutral-text-secondary list-disc list-inside">
                  <li><strong>Phone numbers</strong> must be in E.164 format (e.g., +306977123456). The system will automatically normalize phone numbers, but including the + prefix is recommended.</li>
                  <li><strong>Column names</strong> are case-insensitive and support both camelCase (phoneE164, firstName) and snake_case (phone_e164, first_name) formats</li>
                  <li><strong>Maximum 1000 contacts</strong> per import file</li>
                  <li><strong>Duplicate handling:</strong> If a contact with the same phone number already exists, it will be updated with the new data</li>
                  <li><strong>Empty cells</strong> are allowed for optional fields</li>
                  <li><strong>Tags</strong> should be comma-separated within the cell (e.g., "VIP,Customer,Newsletter")</li>
                  <li><strong>Birth dates</strong> should be in YYYY-MM-DD format (e.g., 1990-05-15)</li>
                  <li><strong>SMS Consent</strong> defaults to "unknown" if not provided. Valid values: opted_in, opted_out, unknown</li>
                  <li><strong>Gender</strong> must be one of: male, female, or other (if provided)</li>
                  <li><strong>Quoted fields:</strong> If your data contains commas, wrap the field in double quotes (e.g., "Smith, John")</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-semibold text-neutral-text-primary mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ice-primary text-primary-dark text-sm font-bold">4</span>
                  Upload Your File
                </h4>
                <p className="text-sm text-neutral-text-secondary ml-8">
                  Select your CSV file below and click "Import Contacts" to begin the import process.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-neutral-text-primary mb-2">
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
              <div className="px-4 py-3 rounded-xl bg-neutral-surface-primary backdrop-blur-[24px] border border-neutral-border/60 hover:border-ice-primary transition-colors flex items-center justify-between min-h-[44px] spring-smooth shadow-sm">
                <span className="text-sm text-neutral-text-primary">
                  {fileName || 'Choose CSV file...'}
                </span>
                <Icon name="import" size="sm" variant="ice" />
              </div>
            </label>
          </div>
          {file && (
            <p className="mt-2 text-xs text-ice-primary flex items-center gap-1">
              <Icon name="check" size="xs" variant="ice" />
              Selected: {fileName} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t border-neutral-border/60">
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

