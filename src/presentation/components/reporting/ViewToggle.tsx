import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList } from 'lucide-react';

interface ViewToggleProps {
  activeView: 'my-matches' | 'all-reports';
  onViewChange: (view: 'my-matches' | 'all-reports') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-lg p-1 shadow-sm border">
        <Button
          variant={activeView === 'my-matches' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('my-matches')}
          className="mr-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Mes matches
        </Button>
        <Button
          variant={activeView === 'all-reports' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('all-reports')}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Tous les rapports publiés
        </Button>
      </div>
    </div>
  );
}; 