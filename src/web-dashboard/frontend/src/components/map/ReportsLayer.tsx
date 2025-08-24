import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import type { ReportsLayerProps } from '../../types/map';
import { getPriorityColor, getMarkerIcon, formatPriority, formatStatus } from '../../utils/mapHelpers';
import { formatDateTimeForDisplay } from '../../utils/dateUtils';

// Fix for default markers in React Leaflet
const createCustomIcon = (priority: number, type: string) => {
  const color = getPriorityColor(priority);
  const emoji = getMarkerIcon(type, priority);
  
  return new DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const ReportsLayer = ({
  reports,
  onReportClick,
  visible = true,
}) => {
  if (!visible || reports.length === 0) {
    return null;
  }

  return (
    <>
      {reports.map((report) => (
        <Marker
          key={report._id}
          position={[report.location.lat, report.location.lng]}
          icon={createCustomIcon(report.priority, report.type)}
          eventHandlers={{
            click: () => {
              if (onReportClick) {
                onReportClick(report);
              }
            },
          }}
        >
          <Popup>
            <div className="min-w-64 p-2">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                </h3>
                <span
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{
                    backgroundColor: getPriorityColor(report.priority),
                    color: 'white',
                  }}
                >
                  {formatPriority(report.priority)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Status:</span>{' '}
                  <span className="capitalize">{formatStatus(report.status)}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Affected People:</span>{' '}
                  <span>{report.affected_people.toLocaleString()}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Location:</span>{' '}
                  <span>
                    {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                    {report.location.country && ` (${report.location.country})`}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Reported:</span>{' '}
                  <span>{formatDateTimeForDisplay(report.createdAt)}</span>
                </div>
                
                {report.description && (
                  <div>
                    <span className="font-medium text-gray-600">Description:</span>
                    <p className="mt-1 text-gray-700">{report.description}</p>
                  </div>
                )}
                
                {/* Resource Requirements */}
                {Object.values(report.resource_requirements).some(val => (val as number) > 0) && (
                  <div>
                    <span className="font-medium text-gray-600">Resource Needs:</span>
                    <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(report.resource_requirements)
                        .filter(([_, value]) => (value as number) > 0)
                        .map(([resource, amount]) => (
                          <div key={resource} className="flex justify-between">
                            <span className="capitalize">{resource}:</span>
                            <span className="font-medium">{amount}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              
              {onReportClick && (
                <button
                  onClick={() => onReportClick(report)}
                  className="mt-3 w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default ReportsLayer;
