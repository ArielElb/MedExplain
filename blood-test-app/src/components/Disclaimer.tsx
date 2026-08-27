import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props { text?: string; }

const DEFAULT_TEXT =
  'המידע המוצג נועד להסברה ולהכנה לשיחה עם רופא/ת המשפחה בלבד. ' +
  'אין באמור אבחנה רפואית, המלצה על טיפול או תחליף לייעוץ מקצועי.';

const Disclaimer: React.FC<Props> = ({ text }) => (
  <div className="notice notice--medical">
    <ShieldAlert size={20} className="notice__icon" />
    <p>{text || DEFAULT_TEXT}</p>
  </div>
);

export default Disclaimer;
