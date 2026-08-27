import React from 'react';
import { RangeConfig, Severity } from '../types';
import { Check, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface Props {
  value: number;
  config?: RangeConfig;
  severity: Severity;
  referenceText: string;
  unit: string;
}

const RangeGauge: React.FC<Props> = ({ value, config, severity, referenceText, unit }) => {
  if (!config) {
    return (
      <div className="gauge-fallback">
        <span className="text-muted small">טווח ייחוס: {referenceText} {unit}</span>
      </div>
    );
  }

  const { visualMin, visualMax, normalMin, normalMax, warningMax } = config;
  const span = Math.max(visualMax - visualMin, 1);

  // Calculate clamp percentage (3% to 97% so pin doesn't clip boundaries)
  const rawPercent = ((value - visualMin) / span) * 100;
  const isBelowMin = value < visualMin;
  const isAboveMax = value > visualMax;
  const clampedPercent = Math.min(Math.max(rawPercent, 3), 97);

  // Calculate zone segment widths
  const isDoubleSided =
    normalMin !== undefined &&
    normalMax !== undefined &&
    normalMin > visualMin &&
    normalMax < visualMax;
  const isUpperBounded = normalMin === undefined || normalMin <= visualMin;
  const isLowerBounded = normalMax === undefined || normalMax >= visualMax;

  // Get status color and icon
  const getStatusDetails = () => {
    switch (severity) {
      case 'normal':
        return {
          label: 'בטווח התקין',
          icon: <Check size={13} />,
          badgeClass: 'badge--normal',
        };
      case 'warning':
        return {
          label: 'ערך גבולי',
          icon: <AlertTriangle size={13} />,
          badgeClass: 'badge--warning',
        };
      case 'danger':
      default:
        return {
          label: value < (normalMin ?? 0) ? 'נמוך מהנורמה' : 'חורג מהנורמה',
          icon: value < (normalMin ?? 0) ? <ArrowDown size={13} /> : <ArrowUp size={13} />,
          badgeClass: 'badge--danger',
        };
    }
  };

  const status = getStatusDetails();

  // Calculate zone widths in percentage
  let lowWidth = 0;
  let normalWidth = 100;
  let warningWidth = 0;
  let highWidth = 0;

  if (isDoubleSided && normalMin !== undefined && normalMax !== undefined) {
    lowWidth = ((normalMin - visualMin) / span) * 100;
    if (warningMax !== undefined && warningMax > normalMax) {
      normalWidth = ((normalMax - normalMin) / span) * 100;
      warningWidth = ((warningMax - normalMax) / span) * 100;
      highWidth = Math.max(0, 100 - (lowWidth + normalWidth + warningWidth));
    } else {
      normalWidth = ((normalMax - normalMin) / span) * 100;
      highWidth = Math.max(0, 100 - (lowWidth + normalWidth));
    }
  } else if (isUpperBounded && normalMax !== undefined) {
    if (warningMax !== undefined && warningMax > normalMax) {
      normalWidth = ((normalMax - visualMin) / span) * 100;
      warningWidth = ((warningMax - normalMax) / span) * 100;
      highWidth = Math.max(0, 100 - (normalWidth + warningWidth));
    } else {
      normalWidth = ((normalMax - visualMin) / span) * 100;
      highWidth = Math.max(0, 100 - normalWidth);
    }
  } else if (isLowerBounded && normalMin !== undefined) {
    lowWidth = ((normalMin - visualMin) / span) * 100;
    normalWidth = Math.max(0, 100 - lowWidth);
  }

  return (
    <div
      className="gauge-wrapper"
      role="meter"
      aria-label={`מדד גרפי: ${value} ${unit}, טווח תקין: ${referenceText}`}
      aria-valuenow={value}
      aria-valuemin={visualMin}
      aria-valuemax={visualMax}
    >
      {/* Gauge Header with Reference Range & Status Badge */}
      <div className="gauge__meta">
        <span className="gauge__range-label">
          טווח נורמה: <strong>{referenceText}</strong> {unit}
        </span>
        <span className={`gauge__status-badge badge ${status.badgeClass}`}>
          {status.icon}
          <span>{status.label}</span>
        </span>
      </div>

      {/* LTR Gauge Visual Display */}
      <div className="gauge__display-track" style={{ direction: 'ltr' }}>
        <div className="gauge__track">
          {lowWidth > 0 && (
            <div
              className="gauge__zone gauge__zone--low"
              style={{ width: `${lowWidth}%` }}
              title="מתחת לנורמה"
            >
              <span className="gauge__zone-text">נמוך</span>
            </div>
          )}

          {normalWidth > 0 && (
            <div
              className="gauge__zone gauge__zone--normal"
              style={{ width: `${normalWidth}%` }}
              title="טווח תקין"
            >
              <span className="gauge__zone-text">תקין ✓</span>
            </div>
          )}

          {warningWidth > 0 && (
            <div
              className="gauge__zone gauge__zone--warning"
              style={{ width: `${warningWidth}%` }}
              title="טווח גבולי"
            >
              <span className="gauge__zone-text">גבולי</span>
            </div>
          )}

          {highWidth > 0 && (
            <div
              className="gauge__zone gauge__zone--high"
              style={{ width: `${highWidth}%` }}
              title="מעל לנורמה"
            >
              <span className="gauge__zone-text">גבוה</span>
            </div>
          )}
        </div>

        {/* Pin Indicator */}
        <div
          className={`gauge__pin ${isBelowMin ? 'gauge__pin--overflow-low' : ''} ${isAboveMax ? 'gauge__pin--overflow-high' : ''}`}
          style={{ left: `${clampedPercent}%` }}
        >
          <div className="gauge__pin-badge">
            <span className="gauge__pin-val">{value}</span>
            <span className="gauge__pin-unit">{unit}</span>
          </div>
          <div className="gauge__pin-arrow" />
          <div className="gauge__pin-dot" />
        </div>

        {/* Numeric Ticks */}
        <div className="gauge__ticks">
          <span className="gauge__tick gauge__tick--start" style={{ left: '0%' }}>
            {visualMin}
          </span>
          {normalMin !== undefined && normalMin > visualMin && (
            <span
              className="gauge__tick"
              style={{ left: `${((normalMin - visualMin) / span) * 100}%` }}
            >
              {normalMin}
            </span>
          )}
          {normalMax !== undefined && normalMax < visualMax && (
            <span
              className="gauge__tick"
              style={{ left: `${((normalMax - visualMin) / span) * 100}%` }}
            >
              {normalMax}
            </span>
          )}
          {warningMax !== undefined && warningMax < visualMax && (
            <span
              className="gauge__tick"
              style={{ left: `${((warningMax - visualMin) / span) * 100}%` }}
            >
              {warningMax}
            </span>
          )}
          <span className="gauge__tick gauge__tick--end" style={{ left: '100%' }}>
            {visualMax}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RangeGauge;
