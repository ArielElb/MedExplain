import React from 'react';
import { Lock, WifiOff } from 'lucide-react';

const PrivacyNote: React.FC = () => (
  <div className="notice notice--privacy">
    <Lock size={20} className="notice__icon" />
    <div>
      <p>
        <strong>הנתונים שלך נשארים אצלך.</strong> כל החישובים מתבצעים בדפדפן בלבד —
        אין שרת, אין מסד נתונים ואין שליחה של הערכים לשום מקום.
      </p>
      <p className="small muted-inline">
        <WifiOff size={14} /> אפשר לנתק את האינטרנט והאפליקציה תמשיך לעבוד.
      </p>
    </div>
  </div>
);

export default PrivacyNote;
