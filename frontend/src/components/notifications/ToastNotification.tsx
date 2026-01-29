import React, { useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import {
  useNotificationStore,
  NotificationType,
} from "../../store/notification.store";

const ToastNotification: React.FC = () => {
  const { showToast, currentToast, hideToast } = useNotificationStore();

  useEffect(() => {
    if (showToast && currentToast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showToast, currentToast, hideToast]);

  if (!showToast || !currentToast) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case "error":
        return <ExclamationCircleIcon className="h-6 w-6 text-red-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
      case "info":
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`rounded-md border p-4 shadow-lg ${getBgColor(currentToast.type)}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon(currentToast.type)}</div>
          <div className="ml-3 w-0 flex-1">
            <p
              className={`text-sm font-medium ${getTextColor(currentToast.type)}`}
            >
              {currentToast.title}
            </p>
            <p
              className={`mt-1 text-sm ${getTextColor(currentToast.type)} opacity-90`}
            >
              {currentToast.message}
            </p>
            {currentToast.actionUrl && currentToast.actionLabel && (
              <div className="mt-3">
                <a
                  href={currentToast.actionUrl}
                  className={`text-sm font-medium underline ${getTextColor(currentToast.type)} hover:opacity-75`}
                >
                  {currentToast.actionLabel}
                </a>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTextColor(currentToast.type)} hover:bg-black hover:bg-opacity-10`}
              onClick={hideToast}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
