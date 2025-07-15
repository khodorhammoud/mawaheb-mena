import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioComponent from '../formFields/repeatables/PortfolioComponent';
import WorkHistoryComponent from '../formFields/repeatables/WorkHistory';
import CertificateComponent from '../formFields/repeatables/CertificateComponent';
import EducationComponent from '../formFields/repeatables/EducationComponent';
import type { RepeatableFieldsProps } from '../types';
import {
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  CertificateFormFieldType,
  EducationFormFieldType,
} from '@mawaheb/db/types';

const RepeatableFields = ({
  fieldName,
  values,
  files,
  expandedIndex,
  onAdd,
  onRemove,
  onDataChange,
  onToggleExpand,
}: RepeatableFieldsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddField = async () => {
    setIsSubmitting(true);

    try {
      // Create a new empty field based on fieldName type
      const newField = (() => {
        switch (fieldName) {
          case 'portfolio':
            return {
              fieldId: values.length + 1,
              projectName: '',
              projectLink: '',
              projectDescription: '',
              projectImageUrl: '',
            };
          case 'workHistory':
            return {
              fieldId: values.length + 1,
              companyName: '',
              position: '',
              startDate: '',
              endDate: '',
              description: '',
            };
          case 'certificates':
            return {
              fieldId: values.length + 1,
              certificateName: '',
              issuer: '',
              issueDate: '',
              description: '',
            };
          case 'educations':
            return {
              fieldId: values.length + 1,
              schoolName: '',
              degree: '',
              fieldOfStudy: '',
              startDate: '',
              endDate: '',
              description: '',
            };
          default:
            return {
              fieldId: values.length + 1,
            };
        }
      })();

      // Update local state first
      onAdd();

      // Then update the values array
      const updatedValues = [...values, newField];

      // Update local state immediately to allow adding more fields
      onDataChange(updatedValues.length - 1, newField);

      // Submit to server
      const formData = new FormData();
      formData.append('action', 'add-field');
      formData.append('fieldName', fieldName);
      formData.append('values', JSON.stringify(updatedValues));

      const response = await fetch('/api/repeatable-fields', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding field:', error);
      // Keep the local state update even if server submission fails
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveField = async (index: number) => {
    setIsSubmitting(true);

    try {
      // Create updated values array without the removed field
      const updatedValues = values.filter((_, i) => i !== index);

      // Update local state first
      onRemove(index);

      // Submit to server
      const formData = new FormData();
      formData.append('action', 'remove-field');
      formData.append('fieldName', fieldName);
      formData.append('index', index.toString());
      formData.append('values', JSON.stringify(updatedValues));

      const response = await fetch('/api/repeatable-fields', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing field:', error);
      // Keep the local state update even if server submission fails
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRepeatableComponent = (type: string, index: number) => {
    const props = {
      data: values[index],
      onTextChange: (data: any) => {
        onDataChange(index, data);
      },
      onFileChange: files
        ? (newFiles: File[]) => {
            const updatedFiles = [...files];
            updatedFiles[index] = newFiles[0];
            onDataChange(index, {
              ...values[index],
              attachmentName: newFiles[0]?.name || '',
            });
            files[index] = newFiles[0];
          }
        : undefined,
    };

    switch (type) {
      case 'portfolio':
        return <PortfolioComponent {...props} data={values[index] as PortfolioFormFieldType} />;
      case 'workHistory':
        return <WorkHistoryComponent {...props} data={values[index] as WorkHistoryFormFieldType} />;
      case 'certificates':
        return <CertificateComponent {...props} data={values[index] as CertificateFormFieldType} />;
      case 'educations':
        return <EducationComponent {...props} data={values[index] as EducationFormFieldType} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {values.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border rounded-xl bg-white"
          >
            <div className="p-4">
              <div className="flex justify-between items-center gap-4">
                {/* Collapse/Expand */}
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    onToggleExpand(expandedIndex === index ? null : index);
                  }}
                  className={`border rounded-xl not-active-gradient flex-1 focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 ${
      expandedIndex === index
        ? 'bg-primaryColor text-white'
        : 'text-primaryColor border-primaryColor hover:text-white'
    }`}
                >
                  {expandedIndex === index ? 'Collapse' : 'Expand'} Form {index + 1}
                </Button>

                {/* Remove */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    handleRemoveField(index);
                  }}
                  className="border-red-500 text-red-500 rounded-xl not-active-gradient-red hover:text-white shrink-0 focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
                  disabled={isSubmitting}
                >
                  Remove
                </Button>
              </div>

              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden mt-4"
                  >
                    {getRepeatableComponent(fieldName, index)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add field */}
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          handleAddField();
        }}
        className="not-active-gradient-black rounded-xl hover:text-white w-full focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
        disabled={isSubmitting}
      >
        + Add Field
      </Button>
    </div>
  );
};

export default RepeatableFields;
