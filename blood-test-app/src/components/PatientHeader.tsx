import { User, Tag, FileText } from 'lucide-react';
import { PatientContext } from '../types';

interface Props {
  patient?: PatientContext;
}

const TAG_TRANSLATIONS: Record<string, string> = {
  cardiovascular_family_history: 'היסטוריה משפחתית של מחלות לב',
  vegetarian_diet: 'תזונה צמחונית/טבעונית',
  recent_viral_illness: 'מחלה ויראלית לאחרונה',
  joint_pain: 'כאבי מפרקים',
};

const PatientHeader: React.FC<Props> = ({ patient }) => {
  if (!patient || (!patient.name && !patient.age && !patient.context)) {
    return null;
  }

  const sexLabel = patient.sex === 'male' ? 'זכר' : patient.sex === 'female' ? 'נקבה' : null;

  return (
    <div className="card patient-header-card">
      <div className="patient-header__main">
        <div className="patient-header__avatar">
          <User size={26} className="patient-avatar-icon" />
        </div>

        <div className="patient-header__info">
          <div className="patient-header__title-row">
            <h2 className="patient-header__name">
              {patient.name || 'מטופל/ת (הזנה ידנית)'}
            </h2>
            <div className="patient-header__demographics">
              {patient.age && <span className="demographic-pill">גיל {patient.age}</span>}
              {sexLabel && <span className="demographic-pill">{sexLabel}</span>}
              {patient.notes && <span className="demographic-pill demographic-pill--accent">{patient.notes}</span>}
            </div>
          </div>

          {patient.context && (
            <p className="patient-header__context">
              <FileText size={15} className="context-icon" />
              <span><strong>רקע קליני:</strong> {patient.context}</span>
            </p>
          )}

          {patient.contextTags && patient.contextTags.length > 0 && (
            <div className="patient-header__tags">
              {patient.contextTags.map((tag) => (
                <span key={tag} className="context-tag-pill">
                  <Tag size={12} />
                  <span>{TAG_TRANSLATIONS[tag] || tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;
